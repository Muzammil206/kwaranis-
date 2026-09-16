'use client'

import { useState, useEffect } from 'react'
import { formatNaira, monthName } from '@/lib/utils'
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const MONTH_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

interface Props {
  member: { id: string; name: string; email: string | null; status: string; serial_no: number }
  userEmail?: string
  paidMonths: number[]
  year: number
  currentMonth: number
  paystackPublicKey: string
  testMode?: boolean
}

export default function PayDuesClient({ member, userEmail, paidMonths, year, currentMonth, paystackPublicKey, testMode }: Props) {
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paystackLoaded, setPaystackLoaded] = useState(false)

  const paid = new Set(paidMonths)
  const unpaidDue = MONTHS.filter(m => m <= currentMonth && !paid.has(m))

  useEffect(() => {
    if (testMode) { setPaystackLoaded(true); return }
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload = () => setPaystackLoaded(true)
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [testMode])

  const toggleMonth = (m: number) => {
    if (paid.has(m)) return
    setSelected(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    )
  }

  const selectAllUnpaid = () => {
    setSelected(unpaidDue)
  }

  const total = selected.length * 1500

  const handlePay = async () => {
    if (!selected.length) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          months: selected.map(m => ({ year, month: m })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Sandbox mode: server already inserted payments, jump straight to verify
      if (data.mock) {
        window.location.href = data.authorization_url
        return
      }

      // Production: open Paystack inline popup
      const handler = (window as unknown as {
        PaystackPop: {
          setup: (opts: Record<string, unknown>) => { openIframe: () => void }
        }
      }).PaystackPop.setup({
        key: paystackPublicKey,
        email: member.email ?? userEmail ?? '',
        amount: total * 100,
        ref: data.reference,
        metadata: {
          member_id: member.id,
          months: selected.map(m => ({ year, month: m })),
        },
        onClose: () => { setLoading(false) },
        callback: (response: { reference: string }) => {
          setLoading(false)
          window.location.href = `/portal/payments/verify?ref=${response.reference}`
        },
      })
      handler.openIframe()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (member.status !== 'active') {
    return (
      <div className="card p-8 text-center">
        <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Your account status ({member.status}) is not eligible for online payment.</p>
        <p className="text-xs text-gray-400 mt-1">Please contact your branch administrator.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {testMode && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          Test mode — clicking Pay completes a simulated payment without contacting Paystack.
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Month selector */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Select Months to Pay</h2>
          {unpaidDue.length > 0 && (
            <button onClick={selectAllUnpaid} className="text-xs text-brand-600 hover:underline font-medium">
              Select all unpaid ({unpaidDue.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map(m => {
            const isPaid = paid.has(m)
            const isFuture = m > currentMonth
            const isSelected = selected.includes(m)

            return (
              <button
                key={m}
                onClick={() => toggleMonth(m)}
                disabled={isPaid || isFuture}
                className={`
                  relative flex flex-col items-center justify-center rounded-xl p-3 aspect-square text-center transition-all
                  ${isPaid
                    ? 'bg-green-50 border-2 border-green-200 cursor-not-allowed'
                    : isFuture
                    ? 'bg-gray-50 border-2 border-gray-100 cursor-not-allowed opacity-40'
                    : isSelected
                    ? 'bg-brand-600 border-2 border-brand-600 text-white shadow-md scale-105'
                    : 'bg-white border-2 border-gray-200 hover:border-brand-300 hover:bg-brand-50'
                  }
                `}
              >
                <span className={`text-xs font-bold ${isPaid ? 'text-green-700' : isFuture ? 'text-gray-300' : isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {MONTH_SHORT[m - 1]}
                </span>
                {isPaid && <CheckCircle size={12} className="text-green-500 mt-1" />}
                {!isPaid && !isFuture && !isSelected && (
                  <span className="text-xs text-red-400 mt-0.5">₦1,500</span>
                )}
                {isSelected && <span className="text-xs text-white/80 mt-0.5">✓</span>}
              </button>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-500">{selected.length} month{selected.length !== 1 ? 's' : ''} selected</span>
          <span className="font-bold text-gray-900 mono">{formatNaira(total)}</span>
        </div>
      </div>

      {/* Payment summary */}
      {selected.length > 0 && (
        <div className="card p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Payment Summary</h2>
          <div className="space-y-2 mb-4">
            {selected.sort((a, b) => a - b).map(m => (
              <div key={m} className="flex justify-between text-sm">
                <span className="text-gray-600">{monthName(m)} {year}</span>
                <span className="mono font-medium">{formatNaira(1500)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex justify-between font-bold">
              <span>Total</span>
              <span className="mono text-brand-600">{formatNaira(total)}</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={loading || (selected.length === 0) || (!paystackLoaded && !testMode)}
            className="btn-primary w-full justify-center text-base py-3"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Redirecting…</>
            ) : (
              <><CreditCard size={18} /> {testMode ? 'Complete Test Payment' : `Pay ${formatNaira(total)} via Paystack`}</>
            )}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Secured by Paystack · Card, Bank Transfer, USSD accepted
          </p>
        </div>
      )}

      {unpaidDue.length === 0 && (
        <div className="card p-8 text-center">
          <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">All dues paid up to date!</p>
          <p className="text-sm text-gray-500 mt-1">No outstanding payments through {monthName(currentMonth)} {year}.</p>
        </div>
      )}
    </div>
  )
}