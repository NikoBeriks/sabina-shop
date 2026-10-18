'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, MessageSquare, X } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

interface HeaderProps {
  search: string
  onSearchChange: (value: string) => void
  onOpenCart: () => void
}

export default function Header({ search, onSearchChange, onOpenCart }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const totalItems = useCartStore((state) => state.totalItems())
  const totalPrice = useCartStore((state) => state.totalPrice())

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 bg-white border-b ${
        isScrolled ? 'border-neutral-300 shadow-xs' : 'border-neutral-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Brand Logo - Strict Architectural Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group flex-shrink-0"
            aria-label="Магазин Хавпачевых Главная"
          >
            <div className="w-9 h-9 bg-neutral-950 text-white flex items-center justify-center font-bold text-xs tracking-widest border border-neutral-950 rounded-none group-hover:bg-[#122a20] group-hover:border-[#122a20] transition-colors">
              МХ
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 leading-none">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 uppercase font-sans">
                  Магазин
                </span>
                <span className="text-lg sm:text-xl font-light tracking-tight text-neutral-500 uppercase">
                  Хавпачевых
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest uppercase bg-neutral-100 text-neutral-700 px-1.5 py-0.5 border border-neutral-300 rounded-none">
                  ГАСТРОНОМ
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase hidden md:block mt-0.5">
                МАГАЗИН ХАВПАЧЕВЫХ &middot; ДОСТАВКА
              </span>
            </div>
          </Link>

          {/* Search bar (desktop) - Strict square shape */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск продуктов по каталогу..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-none text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 rounded-none transition-colors"
                title="Очистить поиск"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons - Sharp square geometry */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Support link */}
            <Link
              href="/chat"
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2.5 border border-neutral-300 hover:border-neutral-900 text-neutral-800 hover:bg-neutral-50 transition-colors text-xs font-semibold uppercase tracking-wider rounded-none"
              title="Чат поддержки"
            >
              <MessageSquare className="w-3.5 h-3.5 text-neutral-600" />
              <span className="hidden sm:inline">Помощь</span>
            </Link>

            {/* Cart trigger button - Strict, square */}
            <button
              onClick={onOpenCart}
              className={`relative flex items-center gap-2.5 px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-colors duration-150 rounded-none border ${
                mounted && totalItems > 0
                  ? 'bg-[#102218] hover:bg-[#183425] text-white border-[#102218]'
                  : 'bg-neutral-950 hover:bg-neutral-800 text-white border-neutral-950'
              }`}
              aria-label="Открыть корзину"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Корзина</span>
              {mounted && totalItems > 0 && (
                <span className="bg-white text-neutral-950 font-mono text-[11px] font-bold px-1.5 py-0.5 leading-none rounded-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
              {mounted && totalItems > 0 && (
                <span className="hidden md:inline pl-1.5 border-l border-white/25 font-mono text-xs font-semibold">
                  {formatPrice(totalPrice)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по названию или категории..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-none text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 rounded-none"
                title="Очистить"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

