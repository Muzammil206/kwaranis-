import { sql } from '@/lib/db'
import { currentYear, monthShort } from '@/lib/utils'
import MembersTable from './MembersTable'
import type { Member, PaymentLedger } from '@/types'

export default async function MembersPage() {
  const year = currentYear()

  const members = await sql<Member>(`SELECT * FROM members ORDER BY serial_no ASC`)

  const payments = await sql<PaymentLedger>(
    `SELECT member_id, month, year, amount, receipt_no FROM payment_ledger WHERE year = $1`,
    [year]
  )

  const paymentMap: Record<string, Set<number>> = {}
  payments?.forEach(p => {
    if (!paymentMap[p.member_id]) paymentMap[p.member_id] = new Set()
    paymentMap[p.member_id].add(p.month)
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            {members?.length ?? 0} members · {year} payment status
          </p>
        </div>
      </div>

      <MembersTable
        members={members ?? []}
        paymentMap={paymentMap}
        year={year}
      />
    </div>
  )
}