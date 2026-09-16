import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookSignature } from '@/lib/paystack'
import { sql } from '@/lib/db'
import type { PaystackWebhookEvent } from '@/types'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature') ?? ''

  if (!validateWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event: PaystackWebhookEvent = JSON.parse(rawBody)

  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true })
  }

  const { reference, metadata, amount, paid_at } = event.data

  if (!metadata?.months?.length && !metadata?.member_id) {
    return NextResponse.json({ received: true })
  }

  const memberId = metadata.member_id
  const months = metadata.months ?? []

  const amountPerMonth = Math.floor(amount / 100 / months.length)

  for (const { year, month } of months) {
    try {
      await sql(
        `INSERT INTO payment_ledger (member_id, year, month, amount, method, paystack_ref, paid_at)
         VALUES ($1, $2, $3, $4, 'paystack', $5, $6)
         ON CONFLICT (member_id, year, month) DO NOTHING`,
        [memberId, year, month, amountPerMonth || 1500, reference, paid_at ?? new Date().toISOString()]
      )
    } catch (err: any) {
      console.error(`Webhook: failed to insert ${year}-${month}:`, err.message)
    }
  }

  return NextResponse.json({ received: true })
}

export const runtime = 'nodejs'