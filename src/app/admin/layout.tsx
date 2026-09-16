import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login')

  if (!['admin', 'treasurer', 'viewer'].includes(user.role)) {
    redirect('/portal/dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <AdminSidebar role={user.role} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}