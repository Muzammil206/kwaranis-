import { sql } from '@/lib/db'
import { formatNaira, currentYear } from '@/lib/utils'
import ReportsClient from './ReportsClient'

interface SummaryRow {
  id: string
  serial_no: number
  name: string
  grade: string
  status: string
  email: string | null
  phone: string | null
  current_year: number
  months_paid: number
  months_outstanding: number
  total_paid: number
  total_outstanding: number
}

interface MonthlyRow {
  month: number
  year: number
  payments_count: number
  total_collected: number
}

export default async function ReportsPage() {
  const year = currentYear()

  const summary = await sql<SummaryRow>(`SELECT * FROM member_payment_summary ORDER BY serial_no`)

  const monthlyCollection = await sql<MonthlyRow>(
    `SELECT * FROM monthly_collection WHERE year = $1 ORDER BY month`,
    [year]
  )

  const totalExpected = (summary?.length ?? 0) * 12 * 1500
  const totalCollected = monthlyCollection?.reduce((s, m) => s + m.total_collected, 0) ?? 0
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">{year} Financial Year · NIS Kwara State Branch</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Expected</p>
          <p className="text-2xl font-bold text-gray-900 mono">{formatNaira(totalExpected)}</p>
          <p className="text-xs text-gray-400 mt-1">{summary?.length ?? 0} active members × 12 months</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-green-600 mono">{formatNaira(totalCollected)}</p>
          <p className="text-xs text-gray-400 mt-1">{collectionRate}% collection rate</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-red-500 mono">{formatNaira(totalExpected - totalCollected)}</p>
          <p className="text-xs text-gray-400 mt-1">To be collected</p>
        </div>
      </div>

      <ReportsClient
        summary={summary ?? []}
        monthlyCollection={monthlyCollection ?? []}
        year={year}
      />
    </div>
  )
}