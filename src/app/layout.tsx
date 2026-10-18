import type { Metadata } from 'next'
import { Golos_Text, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const golos = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Магазин Хавпачевых — Продукты и еда с доставкой',
  description: 'Онлайн-супермаркет «Магазин Хавпачевых»: свежие продукты питания, овощи, фрукты, молочные продукты, мясо и напитки с экспресс-доставкой на дом.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${golos.variable} ${mono.variable}`}>
      <body className={`${golos.className} font-sans antialiased bg-[#fcfcfb] text-neutral-900`}>{children}</body>
    </html>
  )
}
