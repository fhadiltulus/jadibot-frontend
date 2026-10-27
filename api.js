'use client'

import { auth } from './firebaseClient'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

async function authHeader() {
  const user = auth.currentUser
  if (!user) throw new Error('Belum login')
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export async function apiGet(path) {
  const headers = await authHeader()
  const res = await fetch(`${BASE_URL}${path}`, { headers })
  return res.json()
}

export async function apiPost(path, body) {
  const headers = await authHeader()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  })
  return res.json()
}

export function streamLogs(id, onLine) {
  // EventSource bawaan browser nggak bisa kirim header Authorization,
  // jadi token dikirim lewat query string khusus buat koneksi SSE ini.
  return auth.currentUser.getIdToken().then(token => {
    const es = new EventSource(`${BASE_URL}/api/jadibot/logs/${id}?token=${encodeURIComponent(token)}`)
    es.onmessage = e => {
      try {
        const data = JSON.parse(e.data)
        onLine(data.line)
      } catch {}
    }
    return es
  })
}
