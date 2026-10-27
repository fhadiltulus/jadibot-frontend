import './globals.css'

export const metadata = {
  title: 'JadiBot - Adin MD',
  description: 'Jadikan nomor WhatsApp kamu bot, pakai source code Adin MD'
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
