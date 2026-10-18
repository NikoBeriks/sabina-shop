'use client'

import { Clock, ShieldCheck, CheckCircle2, MessageSquare, ArrowDown, ArrowUpRight } from 'lucide-react'

interface HeroBannerProps {
  onScrollToCatalog?: () => void
}

export default function HeroBanner({ onScrollToCatalog }: HeroBannerProps) {
  return (
    <section className="relative bg-[#0d1c14] text-white border-b border-[#1b3829]">
      {/* Subtle fine geometric grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl">
          {/* Strict editorial index tag */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-white/5 border border-white/15 text-neutral-300 font-mono text-[11px] sm:text-xs tracking-widest uppercase mb-6 rounded-none">
            <span className="w-1.5 h-1.5 bg-emerald-400" />
            <span>ГАСТРОНОМИЯ &middot; СУПЕРМАРКЕТ &middot; ДОСТАВКА ОТ 30 МИНУТ</span>
          </div>

          {/* Main Title - Strict, authoritative, confident */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6 text-white uppercase">
            Свежие продукты <br className="hidden sm:inline" />
            <span className="text-neutral-400 font-light">к вашему столу.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mb-8 font-normal">
            Отборные сезонные овощи, фермерское мясо, ремесленная молочная продукция и свежая выпечка.
            Формируем заказы вручную и привозим без задержек.
          </p>

          {/* Action buttons - Strict, square corners */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-14">
            <button
              onClick={onScrollToCatalog}
              className="px-6 sm:px-7 py-3.5 bg-white text-neutral-950 font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2.5 rounded-none border border-white shadow-none active:translate-y-px"
            >
              <span>Перейти в каталог</span>
              <ArrowDown className="w-4 h-4 text-neutral-950" />
            </button>
            <a
              href="https://wa.me/79287144816"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-transparent border border-white/30 hover:border-white text-white font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-white/5 transition-colors flex items-center gap-2.5 rounded-none active:translate-y-px"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Заказ в WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* Value props badges - Razor-sharp architectural grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-white/15">
          <div className="p-4 sm:p-5 border-r border-b border-white/15 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-wider">
                01 &mdash; СКОРОСТЬ
              </span>
              <Clock className="w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-tight">От 30 минут</p>
            <p className="text-xs text-neutral-400 mt-0.5 leading-snug">Экспресс-доставка по городу</p>
          </div>

          <div className="p-4 sm:p-5 border-r border-b border-white/15 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-wider">
                02 &mdash; ОТБОР
              </span>
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-tight">100% Контроль</p>
            <p className="text-xs text-neutral-400 mt-0.5 leading-snug">Ежедневная ревизия свежести</p>
          </div>

          <div className="p-4 sm:p-5 border-r border-b border-white/15 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-wider">
                03 &mdash; НАДЁЖНОСТЬ
              </span>
              <CheckCircle2 className="w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-tight">Гарантия</p>
            <p className="text-xs text-neutral-400 mt-0.5 leading-snug">Заменим товар или вернем средства</p>
          </div>

          <div className="p-4 sm:p-5 border-r border-b border-white/15 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-wider">
                04 &mdash; СВЯЗЬ
              </span>
              <MessageSquare className="w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-tight">WhatsApp / Чат</p>
            <p className="text-xs text-neutral-400 mt-0.5 leading-snug">Прямой диалог и чек к заказу</p>
          </div>
        </div>
      </div>
    </section>
  )
}

