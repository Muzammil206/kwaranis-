import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { sqlOne, sql } from '@/lib/db'
import { currentYear, currentMonth } from '@/lib/utils'
import PayDuesClient from './PayDuesClient'

export default async function PortalPaymentsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  const year = currentYear()
  const month = currentMonth()

  const member = await sqlOne<{
    id: string
    name: string
    email: string | null
    status: string
    serial_no: number
  }>(`SELECT id, name, email, status, serial_no FROM members WHERE auth_user_id = $1`, [user.id])

  if (!member) redirect('/portal/dashboard')

  const payments = await sql<{ month: number; year: number }>(
    `SELECT month, year FROM payment_ledger WHERE member_id = $1 AND year = $2`,
    [member.id, year]
  )

  const paidMonths = new Set(payments?.map(p => p.month) ?? [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pay Dues</h1>
        <p className="text-sm text-gray-500 mt-1">Select months to pay · ₦1,500 per month</p>
      </div>
      <PayDuesClient
        member={member}
        userEmail={user.email}
        paidMonths={Array.from(paidMonths)}
        year={year}
        currentMonth={month}
        paystackPublicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
        testMode={process.env.PAYSTACK_TEST_MODE === 'true'}
      />
    </div>
  )
}