import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { sqlOne, sql } from '@/lib/db'
import { formatNaira, currentYear, currentMonth, monthName } from '@/lib/utils'
import { CheckCircle, AlertCircle, Calendar, CreditCard } from 'lucide-react'
import Link from 'next/link'
import type { Member, PaymentLedger } from '@/types'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const MONTH_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

export default async function PortalDashboard() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  const year = currentYear()
  const month = currentMonth()

  const member = await sqlOne<Member>(`SELECT * FROM members WHERE auth_user_id = $1`, [user.id])

  if (!member) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Your account is not yet linked to a member profile.</p>
          <p className="text-gray-400 text-xs mt-1">Contact your branch administrator.</p>
        </div>
      </div>
    )
  }

  const payments = await sql<PaymentLedger>(
    `SELECT * FROM payment_ledger WHERE member_id = $1 AND year = $2 ORDER BY month`,
    [member.id, year]
  )

  const paidMonths = new Set(payments?.map(p => p.month) ?? [])
  const monthsPaid = paidMonths.size
  const monthsDue = MONTHS.filter(m => m <= month && !paidMonths.has(m)).length
  const totalPaid = monthsPaid * 1500
  const totalOutstanding = monthsDue * 1500

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Dues Status</h1>
        <p className="text-sm text-gray-500 mt-1">{member.name} · {year} Financial Year</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Months Paid</p>
              <p className="text-3xl font-bold text-gray-900 mono">{monthsPaid}<span className="text-base text-gray-400 font-normal">/12</span></p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 font-medium mt-2">{formatNaira(totalPaid)} paid</p>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Outstanding</p>
              <p className="text-3xl font-bold text-gray-900 mono">{monthsDue}<span className="text-base text-gray-400 font-normal"> months</span></p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-500" />
            </div>
          </div>
          <p className="text-xs text-red-500 font-medium mt-2">{formatNaira(totalOutstanding)} due</p>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Current Month</p>
              <p className="text-lg font-bold text-gray-900">{monthName(month)} {year}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Calendar size={20} className="text-brand-600" />
            </div>
          </div>
          <p className={`text-xs font-medium mt-2 ${paidMonths.has(month) ? 'text-green-600' : 'text-red-500'}`}>
            {paidMonths.has(month) ? '✓ Paid' : '⚠ Not yet paid'}
          </p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">{year} Payment Calendar</h2>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-600 inline-block" /> Paid</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200 inline-block" /> Unpaid</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-100 inline-block" /> Future</span>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {MONTHS.map(m => {
            const isPaid = paidMonths.has(m)
            const isFuture = m > month
            const payment = payments?.find(p => p.month === m)
            return (
              <div key={m}
                title={isPaid ? `${monthName(m)} — Paid · ${payment?.receipt_no ?? ''}` : monthName(m)}
                className={`relative flex flex-col items-center justify-center rounded-lg p-2 aspect-square text-center cursor-default
                  ${isPaid ? 'bg-brand-600 text-white' : isFuture ? 'bg-gray-50 text-gray-300' : 'bg-red-50 border border-red-200 text-red-400'}`}
              >
                <span className="text-xs font-bold">{MONTH_SHORT[m - 1]}</span>
                {isPaid && <span className="text-xs opacity-75 mt-0.5">✓</span>}
                {!isPaid && !isFuture && <span className="text-xs mt-0.5">!</span>}
              </div>
            )
          })}
        </div>
      </div>

      {member.status === 'active' && monthsDue > 0 && (
        <div className="card p-6 bg-brand-50 border-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">You have {monthsDue} unpaid {monthsDue === 1 ? 'month' : 'months'}</h3>
              <p className="text-sm text-gray-600 mt-0.5">Total outstanding: <span className="font-semibold text-brand-600">{formatNaira(totalOutstanding)}</span></p>
            </div>
            <Link href="/portal/payments" className="btn-primary"><CreditCard size={16} />Pay Now</Link>
          </div>
        </div>
      )}

      {monthsDue === 0 && monthsPaid > 0 && (
        <div className="card p-6 bg-green-50 border border-green-100">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600 shrink-0" />
            <div>
              <h3 className="font-bold text-green-900">All dues up to date!</h3>
              <p className="text-sm text-green-700 mt-0.5">You have no outstanding dues for {year}. Thank you.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}