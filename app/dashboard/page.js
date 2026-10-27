'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../lib/firebaseClient'
import { apiGet, apiPost, streamLogs } from '../../lib/api'

const STATUS_LABEL = {
  connecting: { text: 'Menyambungkan...', cls: 'status-waiting' },
  waiting_pairing: { text: 'Menunggu Pairing', cls: 'status-waiting' },
  connected: { text: 'Online', cls: 'status-connected' },
  logged_out: { text: 'Logout', cls: 'status-error' },
  stopped: { text: 'Offline', cls: 'status-stopped' }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const [phone, setPhone] = useState('')
  const [instanceId, setInstanceId] = useState(null)
  const [status, setStatus] = useState(null)
  const [pairingCode, setPairingCode] = useState(null)
  const [error, setError] = useState('')
  const [loadingStart, setLoadingStart] = useState(false)

  const [logs, setLogs] = useState([])
  const consoleRef = useRef(null)
  const esRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) return router.replace('/login')
      setUser(u)
    })
    return unsub
  }, [router])

  useEffect(() => {
    if (!user) return
    apiGet('/api/jadibot/me').then(res => {
      if (res.ok) setProfile(res.data)
    })

    const savedId = localStorage.getItem('jadibot_instance_id')
    if (savedId) {
      setInstanceId(savedId)
      attachLogs(savedId)
      pollStatus(savedId)
    }

    return () => {
      esRef.current?.close()
      clearInterval(pollRef.current)
    }
  }, [user])

  useEffect(() => {
    consoleRef.current?.scrollTo(0, consoleRef.current.scrollHeight)
  }, [logs])

  function pollStatus(id) {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      const res = await apiGet(`/api/jadibot/status/${id}`)
      if (res.ok) {
        setStatus(res.data.status)
        if (res.data.pairingCode) setPairingCode(res.data.pairingCode)
        if (res.data.status === 'connected' || res.data.status === 'logged_out' || res.data.status === 'stopped') {
          clearInterval(pollRef.current)
        }
      }
    }, 2000)
  }

  async function attachLogs(id) {
    esRef.current?.close()
    setLogs([])
    const es = await streamLogs(id, line => {
      setLogs(prev => [...prev.slice(-199), line])
    })
    esRef.current = es
  }

  async function handleStart(e) {
    e.preventDefault()
    setError('')
    setLoadingStart(true)
    setPairingCode(null)

    try {
      const res = await apiPost('/api/jadibot/start', { phone, scId: 'adin-md' })
      if (!res.ok) {
        setError(res.error || 'Gagal memulai bot.')
        return
      }
      setInstanceId(res.data.id)
      setStatus(res.data.status)
      if (res.data.pairingCode) setPairingCode(res.data.pairingCode)
      localStorage.setItem('jadibot_instance_id', res.data.id)
      attachLogs(res.data.id)
      pollStatus(res.data.id)
    } catch (e) {
      setError('Gagal menghubungi server. Cek lagi URL backend-nya.')
    } finally {
      setLoadingStart(false)
    }
  }

  async function handleStop() {
    if (!instanceId) return
    await apiPost(`/api/jadibot/stop/${instanceId}`)
    setStatus('stopped')
  }

  async function handleDelete() {
    if (!instanceId) return
    if (!confirm('Yakin mau hapus sesi? Kamu harus scan/pairing ulang dari awal kalau mau jadibot lagi.')) return
    await apiPost(`/api/jadibot/delete/${instanceId}`)
    localStorage.removeItem('jadibot_instance_id')
    setInstanceId(null)
    setStatus(null)
    setPairingCode(null)
    setLogs([])
    esRef.current?.close()
    clearInterval(pollRef.current)
  }

  async function handleLogout() {
    await signOut(auth)
    router.replace('/login')
  }

  if (!user) return null

  const statusInfo = STATUS_LABEL[status] || null

  return (
    <div className="container">
      <div className="row-between" style={{ marginTop: 24, marginBottom: 20 }}>
        <div className="title" style={{ marginBottom: 0 }}>JadiBot</div>
        <button className="btn-red" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }} onClick={handleLogout}>
          Keluar
        </button>
      </div>

      <div className="card">
        <div className="card-label">Email</div>
        <div className="card-value" style={{ fontSize: 16 }}>{user.email}</div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-label">Role</div>
          <div className="card-value">{profile?.role || '-'}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-label">Kedaluwarsa</div>
          <div className="card-value" style={{ fontSize: 15 }}>
            {profile?.expiredAt ? new Date(profile.expiredAt).toLocaleDateString('id-ID') : 'Tanpa batas'}
          </div>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {!instanceId && (
        <form onSubmit={handleStart} className="card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Jadiin Bot</div>
          <label>Nomor WhatsApp</label>
          <input
            type="tel"
            placeholder="628xxxxxxxxxx"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <div style={{ marginTop: 16 }}>
            <button className="btn-primary" type="submit" disabled={loadingStart}>
              {loadingStart ? 'Memproses...' : 'Lanjutkan'}
            </button>
          </div>
        </form>
      )}

      {instanceId && (
        <>
          <div className="card">
            <div className="row-between" style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>Kontrol Bot</div>
              {statusInfo && <span className={`status-pill ${statusInfo.cls}`}>{statusInfo.text}</span>}
            </div>

            {pairingCode && status !== 'connected' && (
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <div className="card-label">Kode Pairing — masukkan di WhatsApp kamu</div>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 2, color: 'var(--accent)' }}>
                  {pairingCode}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                  WhatsApp &gt; Perangkat tertaut &gt; Tautkan perangkat &gt; Tautkan dengan nomor telepon
                </div>
              </div>
            )}

            <div className="btn-row">
              <button className="btn-yellow" onClick={handleStop}>Stop</button>
              <button className="btn-red" onClick={handleDelete}>Hapus Sesi</button>
            </div>
          </div>

          <div className="card">
            <div className="card-label" style={{ marginBottom: 8 }}>Log</div>
            <div className="console" ref={consoleRef}>
              {logs.length ? logs.join('\n') : 'Menunggu log dari bot...'}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
