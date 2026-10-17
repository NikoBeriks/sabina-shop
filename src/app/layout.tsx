import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Sabina Shop — Продукты и еда с доставкой',
  description: 'Онлайн-супермаркет: свежие продукты питания, овощи, фрукты, молочные продукты, мясо и напитки с доставкой на дом.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
