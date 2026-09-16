'use client'

import { useState, useEffect } from 'react'
import { formatNaira, monthName } from '@/lib/utils'
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react'
import type { Member } from '@/types'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

interface Props {
  member: Pick<Member, 'id' | 'name' | 'email' | 'serial_no' | 'grade'>
  paidMonths: number[]
  year: number
  currentMonth: number
  paystackPublicKey: string
}

export default function PaymentSelector({ member, paidMonths, year, currentMonth, paystackPublicKey }: Props) {
  const paidSet = new Set(paidMonths)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pre-select all unpaid due months
  useEffect(() => {
    const due = MONTHS.filter(m => m <= currentMonth && !paidSet.has(m))
    setSelected(new Set(due))
  }, [])

  const toggle = (month: number) => {
    if (paidSet.has(month)) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(month)) next.delete(month)
      else next.add(month)
      return next
    })
  }

  const total = selected.size * 1500

  const handlePay = async () => {
    if (selected.size === 0) return
    setLoading(true)
    setError('')

    try {
      const months = Array.from(selected).map(m => ({ year, month: m }))

      // Initialize payment on server
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to initialize payment')

      // Redirect to Paystack
      window.location.href = data.authorization_url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Member info */}
      <div className="card p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
          {member.name.split(' ')[1]?.[0] ?? 'M'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
          <p className="text-xs text-gray-500">
            NIS/KW/{String(member.serial_no).padStart(4, '0')}
            {member.grade !== 'none' && ` · ${member.grade.toUpperCase()}`}
            · {member.email}
          </p>
        </div>
      </div>

      {/* Month selector */}
      <div className="card p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-1">{year} — Select Months</h2>
        <p className="text-xs text-gray-400 mb-4">Tap months to select/deselect. Already paid months are locked.</p>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MONTHS.map(m => {
            const isPaid = paidSet.has(m)
            const isSelected = selected.has(m)
            const isFuture = m > currentMonth

            return (
              <button
                key={m}
                onClick={() => toggle(m)}
                disabled={isPaid || isFuture}
                className={`
                  relative rounded-xl p-3 text-center border-2 transition-all font-medium text-sm
                  ${isPaid
                    ? 'bg-brand-50 border-brand-300 text-brand-700 cursor-default'
                    : isFuture
                    ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-default'
                    : isSelected
                    ? 'bg-brand-600 border-brand-600 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-brand-50'
                  }
                `}
              >
                {isPaid && (
                  <CheckCircle
                    size={14}
                    className="absolute top-1.5 right-1.5 text-brand-500"
                  />
                )}
                <span className="block text-xs font-bold mb-0.5">
                  {monthName(m).slice(0, 3).toUpperCase()}
                </span>
                <span className="block text-xs opacity-70">
                  {isPaid ? 'Paid' : isFuture ? '—' : '₦1,500'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary + Pay */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Payment Summary</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {selected.size} month{selected.size !== 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total</p>
            <p className="text-2xl font-bold text-brand-600 mono">{formatNaira(total)}</p>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="mb-4 text-xs text-gray-500 space-y-0.5">
            {Array.from(selected).sort((a, b) => a - b).map(m => (
              <div key={m} className="flex justify-between">
                <span>{monthName(m)} {year}</span>
                <span className="mono">₦1,500</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-gray-700 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span className="mono">{formatNaira(total)}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={selected.size === 0 || loading}
          className="btn-primary w-full text-base py-3"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Redirecting to Paystack…</>
          ) : (
            <><CreditCard size={18} /> Pay {formatNaira(total)} via Paystack</>
          )}
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          Secured by Paystack · Card, USSD, Bank Transfer accepted
        </p>
      </div>
    </div>
  )
}
