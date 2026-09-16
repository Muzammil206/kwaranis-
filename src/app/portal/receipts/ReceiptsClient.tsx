'use client'

import { useState } from 'react'
import { formatNaira, formatDate, monthName } from '@/lib/utils'
import { Download, FileText, Loader2 } from 'lucide-react'
import type { Member, PaymentLedger } from '@/types'

interface Props {
  member: Member
  payments: PaymentLedger[]
}

export default function ReceiptsClient({ member, payments }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const downloadReceipt = async (payment: PaymentLedger) => {
    setDownloading(payment.id)
    try {
      // Dynamically import to avoid SSR issues
      const { generateReceiptPDF } = await import('@/lib/pdf')
      const pdfBytes = await generateReceiptPDF(member, payment)

      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NIS-KW-Receipt-${payment.receipt_no ?? payment.id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setDownloading(null)
    }
  }

  if (payments.length === 0) {
    return (
      <div className="card p-16 text-center">
        <FileText size={40} className="mx-auto text-gray-300 mb-4" />
        <p className="text-sm text-gray-400">No payments found. Make your first payment to see receipts here.</p>
      </div>
    )
  }

  // Group by year
  const byYear = payments.reduce<Record<number, PaymentLedger[]>>((acc, p) => {
    if (!acc[p.year]) acc[p.year] = []
    acc[p.year].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(byYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, yearPayments]) => (
          <div key={year} className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-bold text-gray-900">{year}</h2>
              <p className="text-xs text-gray-500">
                {yearPayments.length} payment{yearPayments.length !== 1 ? 's' : ''} ·{' '}
                {formatNaira(yearPayments.reduce((s, p) => s + p.amount, 0))} total
              </p>
            </div>

            <div className="divide-y divide-gray-50">
              {yearPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                      <FileText size={18} className="text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {monthName(p.month)} {p.year}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="mono">{p.receipt_no}</span>
                        {' · '}
                        {p.method === 'paystack' ? 'Paystack' : p.method}
                        {' · '}
                        {formatDate(p.paid_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold mono text-gray-900">
                      {formatNaira(p.amount)}
                    </span>
                    <button
                      onClick={() => downloadReceipt(p)}
                      disabled={downloading === p.id}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      {downloading === p.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
