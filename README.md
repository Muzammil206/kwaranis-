# NIS Kwara — Payment Management System

Nigeria Institution of Surveyors, Kwara State Branch  
Member dues collection and management system.

## Stack
- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript
- **Database**: Neon (serverless PostgreSQL)
- **Auth**: Self-hosted JWT sessions (bcrypt + jose, httpOnly cookie)
- **Payments**: Paystack
- **Email**: Resend (password reset links)
- **Styling**: Tailwind CSS
- **Runtime**: Bun

## Setup

### 1. Clone and install
```bash
git clone <repo>
cd nis-kwara-payment
bun install
```

### 2. Neon (Postgres)
1. Create a project at [neon.tech](https://neon.tech) and copy the connection string
2. Run `db/schema.sql` in the Neon SQL editor (or via `psql` / `bunx`)

### 3. Environment variables
```bash
cp .env.example .env.local
# Fill in all values (DATABASE_URL, SESSION_SECRET, Paystack keys, RESEND_API_KEY)
```

### 4. Paystack
1. Create account at [paystack.com](https://paystack.com)
2. Get your public and secret keys from Settings → API Keys
3. Add webhook URL in Paystack dashboard: `https://your-domain.com/api/webhooks/paystack`

### 5. Seed members from Excel
```bash
cp /path/to/NIS_KWARA_STATE_FINANCIAL_MEMBERS.xlsx scripts/
bun scripts/seed.ts
```

### 6. Create users
```bash
# Admin account
bun scripts/create-user.ts --email admin@niskwara.org.ng --password <pw> --role admin

# Member account (links to member via serial number)
bun scripts/create-user.ts --email <member-email> --password <pw> --role member --serial <serial_no>
```

### 7. Run development server
```bash
bun dev
```

## User Roles

| Role | Access |
|------|--------|
| `admin` | Full access — members, payments, reports, mark paid |
| `treasurer` | Same as admin |
| `viewer` | Read-only admin views |
| `member` | Own dashboard, pay dues via Paystack, download receipts |

## Routes

| Path | Description |
|------|-------------|
| `/auth/login` | Login page |
| `/admin/dashboard` | Admin overview |
| `/admin/members` | Member registry + payment grid |
| `/admin/payments` | Record manual payments |
| `/admin/reports` | Defaulters + monthly breakdown + PDF export |
| `/portal/dashboard` | Member payment status |
| `/portal/payments` | Pay dues via Paystack |
| `/portal/receipts` | Download PDF receipts |
| `/api/webhooks/paystack` | Paystack webhook (auto-marks paid) |

## Payment Flow

```
Member → /portal/payments → selects months → Pay button
  → POST /api/payments/initialize
  → Paystack popup (card / bank transfer / USSD)
  → Paystack calls /api/webhooks/paystack
  → System marks months as PAID + issues receipt numbers
  → Member redirected to /portal/payments/verify
  → Success page with receipt numbers
```
