import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { sqlOne } from '@/lib/db'
import { generateReceiptPDF } from '@/lib/pdf'
import type { Member, PaymentLedger } from '@/types'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payment = await sqlOne<
    PaymentLedger & { members: Member | null }
  >(
    `SELECT pl.*, row_to_json(m.*) AS members
     FROM payment_ledger pl
     LEFT JOIN members m ON m.id = pl.member_id
     WHERE pl.id = $1`,
    [id]
  )

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const isAdmin = ['admin', 'treasurer'].includes(user.role)
  const isOwner = payment.members?.auth_user_id === user.id

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const pdfBytes = await generateReceiptPDF(payment.members!, payment)
  const blob = new Blob([pdfBytes as unknown as BlobPart])

  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Receipt-${payment.receipt_no}.pdf"`,
    },
  })
}