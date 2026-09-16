'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, FileText,
  LogOut, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/members',   label: 'Members',    icon: Users },
  { href: '/admin/payments',  label: 'Payments',   icon: CreditCard },
  { href: '/admin/reports',   label: 'Reports',    icon: FileText },
]

export default function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <aside className="w-64 h-full flex flex-col bg-brand-600 text-white shrink-0">
      <div className="px-6 py-6 border-b border-brand-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="NIS Kwara" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">NIS Kwara</p>
            <p className="text-xs text-brand-200 capitalize">{role} Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-brand-100 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-brand-700">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}