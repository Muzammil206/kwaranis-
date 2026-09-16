import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatNaira, formatDateTime, monthName } from '@/lib/utils'
import type { Member, PaymentLedger } from '@/types'

export async function generateReceiptPDF(
  member: Member,
  payment: PaymentLedger
): Promise<Uint8Array> {
  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' })

  const green = [27, 94, 59] as [number, number, number]
  const ivory = [250, 250, 247] as [number, number, number]
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // Background
  doc.setFillColor(...ivory)
  doc.rect(0, 0, W, H, 'F')

  // Header band
  doc.setFillColor(...green)
  doc.rect(0, 0, W, 32, 'F')

  // Logo / title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('NIGERIA INSTITUTION OF SURVEYORS', W / 2, 11, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Kwara State Branch', W / 2, 17, { align: 'center' })
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT RECEIPT', W / 2, 26, { align: 'center' })

  // Receipt No badge
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 36, W - 20, 12, 3, 3, 'F')
  doc.setTextColor(...green)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(`Receipt No: ${payment.receipt_no ?? '—'}`, W / 2, 44, { align: 'center' })

  // Member info
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const labelX = 14
  const valX = 60
  let y = 56

  const rows: [string, string][] = [
    ['Member Name:', member.name],
    ['Member No:', `NIS/KW/${String(member.serial_no).padStart(4, '0')}`],
    ['Grade:', member.grade.toUpperCase()],
    ['Email:', member.email ?? '—'],
    ['Period:', `${monthName(payment.month)} ${payment.year}`],
    ['Amount Paid:', formatNaira(payment.amount)],
    ['Payment Method:', payment.method === 'paystack' ? 'Online (Paystack)' : payment.method],
    ['Transaction Ref:', payment.paystack_ref ?? 'N/A'],
    ['Date Paid:', formatDateTime(payment.paid_at)],
  ]

  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text(label, labelX, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(20, 20, 20)
    doc.text(value, valX, y)
    y += 8
  })

  // Divider
  doc.setDrawColor(...green)
  doc.setLineWidth(0.5)
  doc.line(14, y + 2, W - 14, y + 2)
  y += 8

  // Footer note
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'italic')
  doc.text('This is a computer-generated receipt. No signature required.', W / 2, y, { align: 'center' })
  y += 6
  doc.text('For enquiries: contact@niskwara.org.ng', W / 2, y, { align: 'center' })

  // Bottom green bar
  doc.setFillColor(...green)
  doc.rect(0, H - 8, W, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('NIS Kwara State Branch — Payment Management System', W / 2, H - 3, { align: 'center' })

  return doc.output('arraybuffer') as unknown as Uint8Array
}

export async function generateAnnualReportPDF(
  year: number,
  members: Array<{
    name: string
    serial_no: number
    months_paid: number
    total_paid: number
    months_outstanding: number
  }>
): Promise<Uint8Array> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const green = [27, 94, 59] as [number, number, number]
  const W = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(...green)
  doc.rect(0, 0, W, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`NIS KWARA STATE — ANNUAL DUES REPORT ${year}`, W / 2, 10, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleDateString('en-NG')}`, W / 2, 18, { align: 'center' })

  autoTable(doc, {
    startY: 28,
    head: [['S/N', 'Member Name', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Paid', 'Outstanding']],
    body: members.map(m => [
      m.serial_no,
      m.name,
      ...Array.from({ length: 12 }, (_, i) => i < m.months_paid ? '✓' : ''),
      m.months_paid,
      m.months_outstanding,
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: green, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 250, 247] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 55 },
    },
  })

  return doc.output('arraybuffer') as unknown as Uint8Array
}
