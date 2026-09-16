import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { sqlOne, sql } from '@/lib/db'
import { formatNaira, formatDate, monthName } from '@/lib/utils'
import { FileText } from 'lucide-react'
import DownloadReceiptButton from './DownloadReceiptButton'
import type { Member, PaymentLedger } from '@/types'

export default async function ReceiptsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  const member = await sqlOne<Member>(
    `SELECT id, name, serial_no, grade, email FROM members WHERE auth_user_id = $1`,
    [user.id]
  )

  if (!member) redirect('/portal/dashboard')

  const payments = await sql<PaymentLedger>(
    `SELECT * FROM payment_ledger
     WHERE member_id = $1
     ORDER BY year DESC, month DESC`,
    [member.id]
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Receipts</h1>
        <p className="text-sm text-gray-500 mt-1">{payments?.length ?? 0} payment records</p>
      </div>

      <div className="card overflow-hidden">
        {payments?.length ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt No</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="mono text-xs font-medium text-brand-600">{p.receipt_no ?? '—'}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {monthName(p.month)} {p.year}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs capitalize text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {p.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right mono font-semibold text-gray-900">
                    {formatNaira(p.amount)}
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-gray-500">
                    {formatDate(p.paid_at)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <DownloadReceiptButton
                      paymentId={p.id}
                      receiptNo={p.receipt_no ?? ''}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-20 text-center">
            <FileText size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No payment records yet</p>
            <p className="text-xs text-gray-300 mt-1">Your receipts will appear here after payment</p>
          </div>
        )}
      </div>
    </div>
  )
}