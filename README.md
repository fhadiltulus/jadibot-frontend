# JadiBot Frontend

Website buat orang daftar & jadiin nomor WhatsApp mereka jadi bot (pakai source code
Adin MD). Dibuat pakai Next.js, deploy gratis di Vercel.

## Deploy ke Vercel

1. Upload folder ini ke GitHub repo baru (bisa private).
2. Buka [vercel.com](https://vercel.com), login (boleh pakai akun GitHub),
   klik **Add New → Project**, pilih repo yang baru kamu upload.
3. Pas di step **Configure Project**, buka bagian **Environment Variables**, isi
   semua yang ada di `.env.example`:

   | Key | Dari mana |
   |---|---|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → General → Your apps → Web app |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | sama kayak di atas |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `bot-wa-adin2207` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Console (sama) |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console (sama) |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Console (sama) |
   | `NEXT_PUBLIC_API_BASE_URL` | URL publik backend `jadibot-manager` kamu di Pterodactyl |

   **Kalau belum ada "Web app" di Firebase:** buka Firebase Console → project kamu →
   Project Settings → scroll ke "Your apps" → klik ikon `</>` (Web) → kasih nama
   bebas → Firebase otomatis kasih semua value di atas (apiKey, authDomain, dst).

4. Klik **Deploy**. Tunggu sampai selesai, Vercel kasih kamu link publiknya
   (contoh: `https://jadibot-adinmd.vercel.app`).

5. **Penting:** balik lagi ke Firebase Console → Authentication → tab **Settings** →
   **Authorized domains** → tambahkan domain Vercel kamu itu. Kalau nggak, login
   nanti ditolak Firebase.

6. Balik lagi ke backend `jadibot-manager`, update `.env`-nya:
   `ALLOWED_ORIGINS=https://jadibot-adinmd.vercel.app` (domain Vercel kamu), terus
   restart backend-nya.

## Development lokal (opsional, buat tes dulu)

```
npm install
cp .env.example .env.local   # isi semua value-nya
npm run dev
```

Buka `http://localhost:3000`.

## Catatan

- Backend (`jadibot-manager`) **wajib sudah bisa diakses dari internet** (bukan cuma
  localhost) supaya website di Vercel bisa manggil API-nya. Pastikan port-nya
  sudah di-expose dari panel Pterodactyl kamu (biasanya ada di tab "Network" panel).
- Kalau backend pakai HTTP biasa (bukan HTTPS) dan frontend-nya di Vercel (otomatis
  HTTPS), browser bisa menolak request-nya (mixed content). Idealnya pasang SSL
  juga di depan backend (lewat Cloudflare gratis, misalnya) kalau ketemu masalah ini.
