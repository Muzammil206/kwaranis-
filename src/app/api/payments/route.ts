import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { sqlOne } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['admin', 'treasurer'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { member_id, year, month, amount, method, notes, paystack_ref } = body

    if (!member_id || !year || !month) {
      return NextResponse.json({ error: 'member_id, year, month required' }, { status: 400 })
    }

    const row = await sqlOne<{ receipt_no: string | null; [k: string]: unknown }>(
      `INSERT INTO payment_ledger (member_id, year, month, amount, method, notes, paystack_ref, recorded_by, paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [member_id, year, month, amount ?? 1500, method ?? 'cash', notes ?? null, paystack_ref ?? null, user.id]
    )

    return NextResponse.json({
      success: true,
      receipt_no: row?.receipt_no,
      payment: row,
    })
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'Payment already recorded for this member/month' }, { status: 409 })
    }
    console.error('[api/payments]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}