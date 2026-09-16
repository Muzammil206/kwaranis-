import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MONTHS, MONTH_SHORT } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function monthName(month: number): string {
  return MONTHS[month - 1] ?? ''
}

export function monthShort(month: number): string {
  return MONTH_SHORT[month - 1] ?? ''
}

export function currentYear(): number {
  return new Date().getFullYear()
}

export function currentMonth(): number {
  return new Date().getMonth() + 1
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

// Paystack: amounts are in kobo (multiply NGN by 100)
export function toKobo(naira: number): number {
  return naira * 100
}

export function fromKobo(kobo: number): number {
  return kobo / 100
}

// Generate Paystack reference
export function generatePaystackRef(): string {
  return `NIS-KW-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

// Member name clean (strip grade suffixes for display)
export function cleanMemberName(name: string): string {
  return name.replace(/\s*\((fnis|mnis)\)\s*/gi, '').trim()
}

export function extractGrade(name: string): string {
  const match = name.match(/\((fnis|mnis)\)/i)
  return match ? match[1].toUpperCase() : ''
}

// Payment completion percentage
export function completionPercent(monthsPaid: number, total = 12): number {
  return Math.round((monthsPaid / total) * 100)
}

// Check if a specific month is due (past months in current year)
export function isMonthDue(year: number, month: number): boolean {
  const now = new Date()
  const currentY = now.getFullYear()
  const currentM = now.getMonth() + 1
  if (year < currentY) return true
  if (year === currentY && month <= currentM) return true
  return false
}
