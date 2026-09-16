import { Suspense } from 'react'
import ResetPasswordForm from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="card p-8 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-gray-500 mt-4">Loading…</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}