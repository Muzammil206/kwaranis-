'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/payments', label: 'Pay Dues', icon: CreditCard },
  { href: '/portal/receipts', label: 'Receipts', icon: FileText },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-3">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/portal/dashboard'
              ? pathname === href
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] font-medium transition-colors',
                active ? 'text-brand-600' : 'text-gray-400'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}