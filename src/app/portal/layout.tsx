import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { sqlOne } from '@/lib/db'
import PortalSidebar from '@/components/layout/PortalSidebar'
import MobileTopBar from '@/components/layout/MobileTopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

interface PortalMember {
  id: string
  name: string
  serial_no: number
  grade: string
  status: string
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  const member = await sqlOne<PortalMember>(
    `SELECT id, name, serial_no, grade, status FROM members WHERE auth_user_id = $1`,
    [user.id]
  )

  return (
    <div className="md:h-screen md:flex md:overflow-hidden">
      <MobileTopBar />
      <PortalSidebar member={member} className="hidden md:flex" />
      <main className="min-h-[100dvh] md:min-h-0 md:flex-1 md:overflow-y-auto pt-14 md:pt-0 pb-20 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  )
}