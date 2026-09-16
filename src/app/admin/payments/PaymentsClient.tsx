'use client'

import { useState } from 'react'
import { formatNaira, formatDate, monthName } from '@/lib/utils'
import { Plus, CheckCircle, Clock } from 'lucide-react'
import type { Member, PaymentLedger } from '@/types'

interface Props {
  members: Pick<Member, 'id' | 'serial_no' | 'name' | 'email' | 'status'>[]
  payments: (PaymentLedger & { members: { name: string; serial_no: number } | null })[]
  year: number
  month: number
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function PaymentsClient({ members, payments, year, month }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    member_id: '',
    year: String(year),
    month: String(month),
    amount: '1500',
    method: 'cash',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        member_id: form.member_id,
        year: Number(form.year),
        month: Number(form.month),
        amount: Number(form.amount),
        method: form.method,
        notes: form.notes,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to record payment')
    } else {
      setSuccess(`Payment recorded! Receipt: ${data.receipt_no}`)
      setShowForm(false)
      setTimeout(() => { window.location.reload() }, 1500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Record Payment Button */}
      <div className="flex justify-end">
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Record Payment
        </button>
      </div>

      {/* Success / Error */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Manual Payment Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Record Manual / Cash Payment</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Member</label>
              <select
                className="input"
                value={form.member_id}
                onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}
                required
              >
                <option value="">— Select member —</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    [{m.serial_no}] {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Year</label>
              <input
                type="number"
                className="input"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                min="2020" max="2030" required
              />
            </div>

            <div>
              <label className="label">Month</label>
              <select
                className="input"
                value={form.month}
                onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                required
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{monthName(m)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Amount (₦)</label>
              <input
                type="number"
                className="input"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="label">Payment Method</label>
              <select
                className="input"
                value={form.method}
                onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paystack">Paystack (manual)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Notes (optional)</label>
              <input
                type="text"
                className="input"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any additional notes…"
              />
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Recording…' : 'Record Payment'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment History Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <span className="mono text-xs text-brand-600">{p.receipt_no ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.members?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {monthName(p.month)} {p.year}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs capitalize text-gray-500">{p.method}</span>
                  </td>
                  <td className="px-4 py-3 text-right mono font-semibold">
                    {formatNaira(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs">
                    {formatDate(p.paid_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-400">No payments recorded yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
