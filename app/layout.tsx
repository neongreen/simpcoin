import type { Metadata } from 'next'
import { Kode_Mono } from 'next/font/google'
import './globals.css'

const kodeMono = Kode_Mono({
  variable: '--font-kode-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'simpcoin mining tool',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${kodeMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
