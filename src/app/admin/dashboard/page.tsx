import { sql, sqlOne } from '@/lib/db'
import { formatNaira, currentYear, currentMonth, monthName } from '@/lib/utils'
import { Users, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

interface RecentPayment {
  id: string
  month: number
  year: number
  method: string
  amount: number
  members: { name: string; serial_no: number } | null
}

interface MonthlyRow {
  month: number
  total_collected: number
}

export default async function AdminDashboard() {
  const year = currentYear()
  const month = currentMonth()

  const [memberCount, paidMonthCount, yearTotalRow] = await Promise.all([
    sqlOne<{ count: string }>(`SELECT COUNT(*) AS count FROM members WHERE status = 'active'`),
    sqlOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM payment_ledger WHERE year = $1 AND month = $2`,
      [year, month]
    ),
    sqlOne<{ total: string | number }>(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM payment_ledger WHERE year = $1`,
      [year]
    ),
  ])

  const totalMembers = Number(memberCount?.count ?? 0)
  const paidThisMonth = Number(paidMonthCount?.count ?? 0)
  const totalCollected = Number(yearTotalRow?.total ?? 0)
  const outstanding = totalMembers - paidThisMonth

  const recentPayments = await sql<RecentPayment>(
    `SELECT pl.id, pl.month, pl.year, pl.method, pl.amount,
            json_build_object('name', m.name, 'serial_no', m.serial_no) AS members
     FROM payment_ledger pl
     LEFT JOIN members m ON m.id = pl.member_id
     ORDER BY pl.created_at DESC
     LIMIT 8`
  )

  const monthlyData = await sql<MonthlyRow>(
    `SELECT month, total_collected FROM monthly_collection WHERE year = $1 ORDER BY month`,
    [year]
  )

  const stats = [
    {
      label: 'Active Members',
      value: totalMembers,
      icon: Users,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: `Paid — ${monthName(month)}`,
      value: paidThisMonth,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: `Outstanding — ${monthName(month)}`,
      value: outstanding,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: `${year} Total Collected`,
      value: formatNaira(totalCollected),
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {monthName(month)} {year} — NIS Kwara State Branch
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mono">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">{year} Monthly Collection</h2>
          <div className="space-y-2">
            {monthlyData?.map(m => {
              const max = (totalMembers ?? 1) * 1500
              const pct = Math.min(100, Math.round((m.total_collected / max) * 100))
              return (
                <div key={m.month}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{monthName(m.month)}</span>
                    <span className="mono">{formatNaira(m.total_collected)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {!monthlyData?.length && (
              <p className="text-sm text-gray-400 text-center py-8">No payments recorded yet</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Recent Payments</h2>
          <div className="space-y-3">
            {recentPayments?.map(p => {
              const member = p.members
              return (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member?.name ?? '—'}</p>
                    <p className="text-xs text-gray-500">
                      {monthName(p.month)} {p.year} · {p.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 mono">{formatNaira(p.amount)}</p>
                    <p className="text-xs text-green-600">Paid</p>
                  </div>
                </div>
              )
            })}
            {!recentPayments?.length && (
              <p className="text-sm text-gray-400 text-center py-8">No payments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}