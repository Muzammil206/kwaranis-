'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-brand-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500 mb-6">
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <Link href="/auth/login" className="btn-ghost w-full justify-center">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Reset password</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your email and we&apos;ll send a reset link</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <input type="email" className="input" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
        <Link href="/auth/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mt-2">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </form>
    </div>
  )
}