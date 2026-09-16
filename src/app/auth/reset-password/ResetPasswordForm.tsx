'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Invalid reset link</h2>
        <p className="text-sm text-gray-500 mb-6">No reset token was provided. The link may have expired.</p>
        <Link href="/auth/forgot-password" className="btn-primary w-full justify-center">
          Request a new link
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to reset password')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-brand-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Password updated</h2>
        <p className="text-sm text-gray-500 mb-6">Your password has been changed successfully.</p>
        <button onClick={() => router.push('/auth/login')} className="btn-primary w-full justify-center">
          Go to sign in
        </button>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Create a new password</h2>
      <p className="text-sm text-gray-500 mb-6">Your new password must be at least 8 characters long.</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              className="input pr-10"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Confirm password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Saving…' : 'Reset password'}
        </button>

        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mt-2"
        >
          <ArrowLeft size={14} /> Back to login
        </Link>
      </form>
    </div>
  )
}