-- ============================================================
-- NIS KWARA PAYMENT SYSTEM — DATABASE SCHEMA (Neon / Postgres)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE member_status AS ENUM ('active', 'exempt', 'rip', 'inactive');
CREATE TYPE member_grade  AS ENUM ('fnis', 'mnis', 'none');
CREATE TYPE user_role     AS ENUM ('admin', 'treasurer', 'viewer', 'member');

-- ============================================================
-- MEMBERS TABLE
-- ============================================================

CREATE TABLE members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_no     INTEGER UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  grade         member_grade NOT NULL DEFAULT 'none',
  status        member_status NOT NULL DEFAULT 'active',
  phone         TEXT,
  email         TEXT UNIQUE,
  auth_user_id  UUID,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_members_auth_user ON members(auth_user_id);
CREATE INDEX idx_members_status ON members(status);

-- ============================================================
-- APP USERS (login credentials + role management)
-- ============================================================

CREATE TABLE app_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'member',
  member_id     UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_users_member ON app_users(member_id);

-- Link members back to their login account
ALTER TABLE members
  ADD CONSTRAINT fk_members_auth_user
  FOREIGN KEY (auth_user_id) REFERENCES app_users(id) ON DELETE SET NULL;

-- Keep auth_user_id in sync when app_users.member_id is set
CREATE OR REPLACE FUNCTION sync_member_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE members
  SET auth_user_id = NEW.id
  WHERE members.id = NEW.member_id
    AND (members.auth_user_id IS DISTINCT FROM NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_app_users_sync_member
  AFTER INSERT OR UPDATE OF member_id ON app_users
  FOR EACH ROW EXECUTE FUNCTION sync_member_auth_user();

-- ============================================================
-- PAYMENT LEDGER
-- ============================================================

CREATE TABLE payment_ledger (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  year          INTEGER NOT NULL,
  month         INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  amount        INTEGER NOT NULL DEFAULT 1500,
  paid_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method        TEXT NOT NULL DEFAULT 'paystack',   -- 'paystack' | 'cash' | 'bank_transfer'
  paystack_ref  TEXT,                               -- Paystack transaction reference
  receipt_no    TEXT UNIQUE,                        -- e.g. NIS/KW/2024/001234
  recorded_by   UUID REFERENCES app_users(id),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, year, month)                    -- one payment per month per member
);

CREATE INDEX idx_ledger_member ON payment_ledger(member_id);
CREATE INDEX idx_ledger_year_month ON payment_ledger(year, month);
CREATE INDEX idx_ledger_paystack_ref ON payment_ledger(paystack_ref);

-- ============================================================
-- PASSWORD RESET TOKENS
-- ============================================================

CREATE TABLE password_resets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_resets_user ON password_resets(user_id);

-- ============================================================
-- RECEIPT SEQUENCE (for generating receipt numbers)
-- ============================================================

CREATE SEQUENCE receipt_seq START 1000;

CREATE OR REPLACE FUNCTION generate_receipt_no(p_year INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN 'NIS/KW/' || p_year || '/' || LPAD(nextval('receipt_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- AUTO-ASSIGN RECEIPT ON INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION assign_receipt_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.receipt_no IS NULL THEN
    NEW.receipt_no := generate_receipt_no(NEW.year);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_receipt
  BEFORE INSERT ON payment_ledger
  FOR EACH ROW EXECUTE FUNCTION assign_receipt_no();

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- Member payment summary for current year
CREATE OR REPLACE VIEW member_payment_summary AS
SELECT
  m.id,
  m.serial_no,
  m.name,
  m.grade,
  m.status,
  m.email,
  m.phone,
  EXTRACT(YEAR FROM NOW())::INTEGER AS current_year,
  COUNT(pl.id) AS months_paid,
  12 - COUNT(pl.id) AS months_outstanding,
  COUNT(pl.id) * 1500 AS total_paid,
  (12 - COUNT(pl.id)) * 1500 AS total_outstanding
FROM members m
LEFT JOIN payment_ledger pl
  ON pl.member_id = m.id
  AND pl.year = EXTRACT(YEAR FROM NOW())::INTEGER
WHERE m.status = 'active'
GROUP BY m.id, m.serial_no, m.name, m.grade, m.status, m.email, m.phone;

-- Monthly collection summary
CREATE OR REPLACE VIEW monthly_collection AS
SELECT
  year,
  month,
  COUNT(*) AS payments_count,
  SUM(amount) AS total_collected
FROM payment_ledger
GROUP BY year, month
ORDER BY year DESC, month DESC;