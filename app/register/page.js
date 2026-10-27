'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebaseClient'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
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
        <div className="title">Daftar Akun</div>
        <div className="subtitle">Buat akun buat mulai JadiBot</div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleRegister} className="card">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@kamu.com" />

          <label style={{ display: 'block', marginTop: 14 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimal 6 karakter" />

          <div style={{ marginTop: 18 }}>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center' }}>
          Udah punya akun? <Link className="link" href="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  )
}

function mapError(code) {
  const map = {
    'auth/email-already-in-use': 'Email sudah terdaftar, coba login.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/weak-password': 'Password terlalu lemah.'
  }
  return map[code] || 'Gagal mendaftar, coba lagi.'
}
