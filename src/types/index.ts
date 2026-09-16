// ============================================================
// NIS KWARA — Core Types
// ============================================================

export type MemberStatus = 'active' | 'exempt' | 'rip' | 'inactive'
export type MemberGrade  = 'fnis' | 'mnis' | 'none'
export type UserRole     = 'admin' | 'treasurer' | 'viewer' | 'member'
export type PaymentMethod = 'paystack' | 'cash' | 'bank_transfer'

export interface Member {
  id: string
  serial_no: number
  name: string
  grade: MemberGrade
  status: MemberStatus
  phone?: string | null
  email?: string | null
  auth_user_id?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface PaymentLedger {
  id: string
  member_id: string
  year: number
  month: number        // 1–12
  amount: number       // in NGN kobo equiv; stored as whole NGN (e.g. 1500)
  paid_at: string
  method: PaymentMethod
  paystack_ref?: string | null
  receipt_no?: string | null
  recorded_by?: string | null
  notes?: string | null
  created_at: string
}

export interface AppUser {
  id: string
  role: UserRole
  member_id?: string | null
  created_at: string
}

export interface MemberPaymentSummary {
  id: string
  serial_no: number
  name: string
  grade: MemberGrade
  status: MemberStatus
  email?: string | null
  phone?: string | null
  current_year: number
  months_paid: number
  months_outstanding: number
  total_paid: number
  total_outstanding: number
}

// Monthly payment grid: month -> paid status
export type MonthlyGrid = Record<number, PaymentLedger | null>  // key = 1..12

export interface MemberWithPayments extends Member {
  payments: PaymentLedger[]
  monthly_grid: MonthlyGrid
}

// Paystack types
export interface PaystackInitResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackWebhookEvent {
  event: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number   // in kobo
    metadata?: {
      member_id?: string
      year?: number
      month?: number
      months?: Array<{ year: number; month: number }>
    }
    customer: {
      id: number
      email: string
    }
    paid_at: string
  }
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const

export const MONTH_SHORT = [
  'JAN','FEB','MAR','APR','MAY','JUN',
  'JUL','AUG','SEP','OCT','NOV','DEC'
] as const

export const MONTHLY_DUES = 1500  // NGN
