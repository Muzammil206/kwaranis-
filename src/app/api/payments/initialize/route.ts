import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { sqlOne, sql } from '@/lib/db'
import { generatePaystackRef } from '@/lib/utils'

const TEST_MODE = process.env.PAYSTACK_TEST_MODE === 'true'

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { months } = body as {
      months: Array<{ year: number; month: number }>
    }

    if (!months?.length) {
      return NextResponse.json({ error: 'Select at least one month to pay' }, { status: 400 })
    }

    const member = await sqlOne<{ id: string; name: string; email: string | null; status: string }>(
      `SELECT id, name, email, status FROM members WHERE auth_user_id = $1`,
      [user.id]
    )

    if (!member) {
      return NextResponse.json({ error: 'Member profile not found' }, { status: 404 })
    }

    if (member.status !== 'active') {
      return NextResponse.json({ error: 'Account not eligible for payment' }, { status: 403 })
    }

    const reference = generatePaystackRef()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // ── Sandbox mode: insert payments directly, skip Paystack ──────────
    if (TEST_MODE) {
      for (const { year, month } of months) {
        try {
          await sql(
            `INSERT INTO payment_ledger (member_id, year, month, amount, method, paystack_ref, paid_at)
             VALUES ($1, $2, $3, 1500, 'paystack_test', $4, NOW())
             ON CONFLICT (member_id, year, month) DO NOTHING`,
            [member.id, year, month, reference]
          )
        } catch (err: any) {
          console.error(`[sandbox] failed to insert ${year}-${month}:`, err.message)
        }
      }

      return NextResponse.json({
        reference,
        mock: true,
        authorization_url: `${appUrl}/portal/payments/verify?ref=${reference}&mock=true`,
      })
    }

    // ── Production: initialize via Paystack ─────────────────────────────
    const email = member.email ?? user.email
    if (!email) {
      return NextResponse.json({ error: 'No email associated with this account' }, { status: 400 })
    }

    const { initializePayment } = await import('@/lib/paystack')
    const totalAmount = months.length * 1500

    const result = await initializePayment({
      email,
      amount: totalAmount,
      reference,
      callback_url: `${appUrl}/portal/payments/verify?ref=${reference}`,
      metadata: {
        member_id: member.id,
        member_name: member.name,
        months,
        custom_fields: [
          { display_name: 'Member', variable_name: 'member', value: member.name },
          { display_name: 'Months', variable_name: 'months', value: months.length },
        ],
      },
    })

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}