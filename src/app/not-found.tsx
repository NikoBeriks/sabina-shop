import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans text-neutral-900">
      <div className="text-center max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-soft-lg border border-neutral-200/70">
        <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-6 text-4xl shadow-xs">
          🧺
        </div>
        <h1 className="text-5xl font-black text-neutral-900 mb-2 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-neutral-800 mb-2">Страница не найдена</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mb-8 leading-relaxed">
          Возможно, этот товар закончился или страница была перемещена. Возвращайтесь на витрину за свежими покупками!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-emerald shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>На главную витрину</span>
        </Link>
      </div>
    </div>
  )
}
