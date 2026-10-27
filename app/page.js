'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebaseClient'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      router.replace(user ? '/dashboard' : '/login')
    })
    return unsub
  }, [router])

  return (
    <div className="container">
      <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: 100 }}>Memuat...</p>
    </div>
  )
}
