'use client'

import { useState } from 'react'
import { formatNaira } from '@/lib/utils'
import { Download, AlertCircle } from 'lucide-react'

interface MemberSummary {
  id: string
  serial_no: number
  name: string
  grade: string
  months_paid: number
  months_outstanding: number
  total_paid: number
  total_outstanding: number
}

interface MonthlyCollection {
  month: number
  year: number
  payments_count: number
  total_collected: number
}

interface Props {
  summary: MemberSummary[]
  monthlyCollection: MonthlyCollection[]
  year: number
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function ReportsClient({ summary, monthlyCollection, year }: Props) {
  const [tab, setTab] = useState<'defaulters' | 'monthly'>('defaulters')
  const [downloading, setDownloading] = useState(false)

  const defaulters = summary.filter(m => m.months_outstanding > 0)
    .sort((a, b) => b.months_outstanding - a.months_outstanding)

  const handleDownloadAnnual = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/reports/annual?year=${year}`)
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NIS-Kwara-Annual-Report-${year}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Could not generate report.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs + Download */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setTab('defaulters')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'defaulters' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Defaulters ({defaulters.length})
          </button>
          <button onClick={() => setTab('monthly')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Monthly Breakdown
          </button>
        </div>
        <button onClick={handleDownloadAnnual} disabled={downloading} className="btn-secondary">
          <Download size={15} />
          {downloading ? 'Generating…' : 'Download Annual Report'}
        </button>
      </div>

      {/* Defaulters Tab */}
      {tab === 'defaulters' && (
        <div className="card overflow-hidden">
          {defaulters.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">S/N</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Months Paid</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {defaulters.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 mono text-xs text-gray-500">{m.serial_no}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="mono text-sm">{m.months_paid}/12</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge-unpaid">{m.months_outstanding} months</span>
                    </td>
                    <td className="px-4 py-3 text-right mono font-semibold text-red-600">
                      {formatNaira(m.total_outstanding)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">No defaulters — all active members are up to date!</p>
            </div>
          )}
        </div>
      )}

      {/* Monthly Tab */}
      {tab === 'monthly' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payments</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Collected</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MONTH_NAMES.map((name, i) => {
                const m = monthlyCollection.find(mc => mc.month === i + 1)
                const pct = m ? Math.round((m.payments_count / Math.max(1, summary.length)) * 100) : 0
                return (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{name} {year}</td>
                    <td className="px-6 py-4 text-center mono text-sm">{m?.payments_count ?? 0}</td>
                    <td className="px-6 py-4 text-right mono font-semibold">{formatNaira(m?.total_collected ?? 0)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-brand-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 mono w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
