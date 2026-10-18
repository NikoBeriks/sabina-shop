'use client'

import { Zap, ShieldCheck, HeartHandshake, PhoneCall, Sparkles } from 'lucide-react'

interface HeroBannerProps {
  onScrollToCatalog?: () => void
}

export default function HeroBanner({ onScrollToCatalog }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white">
      {/* Decorative ambient light orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-300/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Top pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-emerald-100 text-xs sm:text-sm font-medium mb-5 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide">Экспресс-доставка любимых продуктов</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight sm:leading-none mb-5 text-white">
            Свежие продукты прямо{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-white">
              к вашему столу
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-emerald-100/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
            Отборные овощи и фрукты, свежее мясо, натуральная молочка и свежая выпечка.
            Собираем заказ бережно и привозим без опозданий!
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
            <button
              onClick={onScrollToCatalog}
              className="px-6 py-3 rounded-full bg-white text-emerald-900 font-bold text-sm sm:text-base hover:bg-emerald-50 active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Перейти в каталог</span>
            </button>
            <a
              href="https://wa.me/79287144816"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-medium text-sm sm:text-base active:scale-95 transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-200" />
              <span>Написать в WhatsApp</span>
            </a>
          </div>

          {/* Value props badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-left">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 sm:p-3.5 rounded-2xl flex items-center gap-3 hover:bg-white/15 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-200">
                <Zap className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">От 30 минут</p>
                <p className="text-[11px] text-emerald-100/70">Быстрая доставка</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 sm:p-3.5 rounded-2xl flex items-center gap-3 hover:bg-white/15 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-200">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">100% Свежее</p>
                <p className="text-[11px] text-emerald-100/70">Строгий контроль</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 sm:p-3.5 rounded-2xl flex items-center gap-3 hover:bg-white/15 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-200">
                <HeartHandshake className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Гарантия</p>
                <p className="text-[11px] text-emerald-100/70">Заменим или вернем</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 sm:p-3.5 rounded-2xl flex items-center gap-3 hover:bg-white/15 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-200">
                <span className="text-base select-none">💬</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">WhatsApp & TG</p>
                <p className="text-[11px] text-emerald-100/70">Чек и статус заказа</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
