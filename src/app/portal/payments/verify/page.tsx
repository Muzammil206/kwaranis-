import { redirect } from 'next/navigation'
import { verifyTransaction } from '@/lib/paystack'
import { sql, sqlOne } from '@/lib/db'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default async function VerifyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; mock?: string }>
}) {
  const params = await searchParams
  const ref = params.ref
  const mock = params.mock === 'true'
  if (!ref) redirect('/portal/payments')

  let success = false
  let message = ''
  let receiptNos: string[] = []

  if (mock) {
    // ── Sandbox: skip Paystack, query ledger directly ──────────────────
    const payments = await sql<{ receipt_no: string | null; amount: number }>(
      `SELECT receipt_no, amount FROM payment_ledger WHERE paystack_ref = $1`,
      [ref]
    )
    if (payments && payments.length > 0) {
      success = true
      receiptNos = payments.map(p => p.receipt_no).filter(Boolean) as string[]
      const total = payments.reduce((s, p) => s + (p.amount ?? 0), 0)
      message = `Payment of ₦${total.toLocaleString()} confirmed (test mode).`
    } else {
      message = 'No payment records found for this reference.'
    }
  } else {
    // ── Production: verify with Paystack ───────────────────────────────
    try {
      const result = await verifyTransaction(ref)
      if (result.data?.status === 'success') {
        success = true
        const payments = await sql<{ receipt_no: string | null }>(
          `SELECT receipt_no FROM payment_ledger WHERE paystack_ref = $1`,
          [ref]
        )
        receiptNos = payments?.map(p => p.receipt_no).filter(Boolean) as string[] ?? []
        message = `Payment of ₦${(result.data.amount / 100).toLocaleString()} confirmed.`
      } else {
        message = 'Payment was not successful. No charge was made.'
      }
    } catch (err: any) {
      message = err.message ?? 'Could not verify payment.'
    }
  }

  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="card p-8 max-w-md w-full text-center">
        {success ? (
          <>
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            {mock && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                Test mode — no real payment was processed.
              </p>
            )}
            {receiptNos.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                <p className="text-xs font-semibold text-gray-500 mb-1">Receipt{receiptNos.length > 1 ? 's' : ''}</p>
                {receiptNos.map(r => (<p key={r} className="mono text-sm text-brand-600">{r}</p>))}
              </div>
            )}
            <div className="flex gap-3">
              <Link href="/portal/receipts" className="btn-secondary flex-1 justify-center">View Receipts</Link>
              <Link href="/portal/dashboard" className="btn-primary flex-1 justify-center">Dashboard</Link>
            </div>
          </>
        ) : (
          <>
            <XCircle size={56} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link href="/portal/payments" className="btn-primary">Try Again</Link>
          </>
        )}
      </div>
    </div>
  )
}