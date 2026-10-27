'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebaseClient'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.replace('/dashboard')
    } catch (e) {
      setError(mapError(e.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div style={{ marginTop: 60 }}>
        <div className="title">JadiBot</div>
        <div className="subtitle">Masuk untuk mengelola bot WhatsApp kamu</div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin} className="card">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@kamu.com" />

          <label style={{ display: 'block', marginTop: 14 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />

          <div style={{ marginTop: 18 }}>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center' }}>
          Belum punya akun? <Link className="link" href="/register">Daftar di sini</Link>
        </p>
      </div>
    </div>
  )
}

function mapError(code) {
  const map = {
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/user-not-found': 'Akun tidak ditemukan.',
    'auth/wrong-password': 'Password salah.',
    'auth/invalid-credential': 'Email atau password salah.',
    'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti.'
  }
  return map[code] || 'Gagal login, coba lagi.'
}
