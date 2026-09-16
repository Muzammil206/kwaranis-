import { sql } from '@/lib/db'
import { currentYear, currentMonth } from '@/lib/utils'
import PaymentsClient from './PaymentsClient'
import type { Member, PaymentLedger } from '@/types'

type AdminPayment = PaymentLedger & { members: { name: string; serial_no: number } | null }

export default async function PaymentsPage() {
  const year = currentYear()
  const month = currentMonth()

  const members = await sql<Member>(
    `SELECT id, serial_no, name, email, status FROM members
     WHERE status = 'active'
     ORDER BY serial_no`
  )

  const payments = await sql<AdminPayment>(
    `SELECT pl.*,
            json_build_object('name', m.name, 'serial_no', m.serial_no) AS members
     FROM payment_ledger pl
     LEFT JOIN members m ON m.id = pl.member_id
     ORDER BY pl.created_at DESC
     LIMIT 100`
  )

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Record and manage member dues payments</p>
      </div>

      <PaymentsClient
        members={members ?? []}
        payments={payments ?? []}
        year={year}
        month={month}
      />
    </div>
  )
}