import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fcfcfb] flex items-center justify-center p-6 font-sans text-neutral-900">
      <div className="text-center max-w-md bg-white p-8 sm:p-10 rounded-none border border-neutral-300">
        <div className="w-14 h-14 border border-neutral-300 bg-neutral-50 text-neutral-900 flex items-center justify-center mx-auto mb-6 font-mono font-bold text-sm">
          404
        </div>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-neutral-950 mb-2">Страница не найдена</h1>
        <p className="text-xs sm:text-sm text-neutral-500 mb-8 leading-relaxed font-sans">
          Запрашиваемый адрес или товар не найден. Перейдите в актуальный каталог продуктов магазина.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white px-8 py-3.5 rounded-none font-bold text-xs uppercase tracking-wider transition-colors border border-neutral-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>В каталог товаров</span>
        </Link>
      </div>
    </div>
  )
}

