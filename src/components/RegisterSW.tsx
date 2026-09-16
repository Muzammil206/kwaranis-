'use client'

import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') return

    navigator.serviceWorker
      .register('/sw.js')
      .catch(err => console.error('[PWA] SW registration failed:', err))
  }, [])

  return null
}