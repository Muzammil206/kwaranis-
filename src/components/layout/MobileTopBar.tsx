'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function MobileTopBar() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="md:hidden sticky top-0 z-30 bg-brand-600 text-white">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-white overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="NIS Kwara" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">NIS Kwara</p>
            <p className="text-[11px] text-brand-200 leading-tight">Member Portal</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-100 hover:bg-white/10 active:bg-white/15 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </header>
  )
}