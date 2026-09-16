'use client'

import { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'
import type { Member } from '@/types'

const MONTHS = ['J','F','M','A','M','J','J','A','S','O','N','D']

interface Props {
  members: Member[]
  paymentMap: Record<string, Set<number>>
  year: number
}

export default function MembersTable({ members, paymentMap, year }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'exempt' | 'rip'>('all')

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchSearch = !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        String(m.serial_no).includes(search)
      const matchFilter = filter === 'all' || m.status === filter
      return matchSearch && matchFilter
    })
  }, [members, search, filter])

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-9 py-2 text-sm"
            placeholder="Search by name or S/N…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['all','active','exempt','rip'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors',
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {f === 'rip' ? 'Deceased' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">S/N</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Status</th>
              {MONTHS.map((m, i) => (
                <th key={i} className="text-center px-1 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">
                  {m}
                </th>
              ))}
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(member => {
              const paid = paymentMap[member.id] ?? new Set()
              const paidCount = paid.size
              const totalOwed = paidCount * 1500

              return (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 mono text-xs text-gray-500">{member.serial_no}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    {member.email && (
                      <p className="text-xs text-gray-400">{member.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {member.status === 'active' && (
                      <span className="badge-paid">Active</span>
                    )}
                    {member.status === 'exempt' && (
                      <span className="badge-exempt">Exempt</span>
                    )}
                    {member.status === 'rip' && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">RIP</span>
                    )}
                    {member.status === 'inactive' && (
                      <span className="badge-unpaid">Inactive</span>
                    )}
                  </td>
                  {MONTHS.map((_, i) => {
                    const month = i + 1
                    const isPaid = paid.has(month)
                    const isExempt = member.status === 'exempt' || member.status === 'rip'
                    return (
                      <td key={i} className="px-1 py-3 text-center">
                        {isExempt ? (
                          <span className="inline-block w-5 h-5 rounded text-gray-300 text-xs leading-5">—</span>
                        ) : isPaid ? (
                          <span className="inline-block w-5 h-5 rounded bg-brand-600 text-white text-xs leading-5 font-bold">✓</span>
                        ) : (
                          <span className="inline-block w-5 h-5 rounded bg-red-50 border border-red-200 text-xs leading-5"></span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-right">
                    <span className="mono text-xs font-semibold text-gray-700">
                      {member.status === 'active' ? formatNaira(totalOwed) : '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">No members found</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
        Showing {filtered.length} of {members.length} members · {year} dues (₦1,500/month)
      </div>
    </div>
  )
}
