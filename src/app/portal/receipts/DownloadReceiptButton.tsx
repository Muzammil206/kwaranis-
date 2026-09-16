'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

interface Props {
  paymentId: string
  receiptNo: string
}

export default function DownloadReceiptButton({ paymentId, receiptNo }: Props) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/receipts/${paymentId}`)
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Receipt-${receiptNo}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Could not download receipt. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
    >
      <Download size={13} />
      {loading ? 'Downloading…' : 'PDF'}
    </button>
  )
}
