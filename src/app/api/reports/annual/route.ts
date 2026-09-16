import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { sql } from '@/lib/db'
import { generateAnnualReportPDF } from '@/lib/pdf'
import { currentYear } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!['admin', 'treasurer'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const year = Number(req.nextUrl.searchParams.get('year') ?? currentYear())

  const summary = await sql<{
    name: string
    serial_no: number
    months_paid: number
    total_paid: number
    months_outstanding: number
  }>(
    `SELECT name, serial_no, months_paid, total_paid, months_outstanding
     FROM member_payment_summary
     ORDER BY serial_no`
  )

  const pdfBytes = await generateAnnualReportPDF(year, summary ?? [])
  const blob = new Blob([pdfBytes as unknown as BlobPart])

  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="NIS-Kwara-Annual-${year}.pdf"`,
    },
  })
}