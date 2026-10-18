'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, MessageCircle, X, Sparkles } from 'lucide-react'
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
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-md border-b border-neutral-200/70 py-2.5'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group flex-shrink-0 transition-transform active:scale-95"
            aria-label="Sabina Shop Главная"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-emerald shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-emerald-100 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 font-sans">
                  Sabina
                </span>
                <span className="text-xl sm:text-2xl font-light tracking-tight text-emerald-600">
                  Shop
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Маркет
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-medium hidden md:block">
                Свежие продукты с доставкой
              </span>
            </div>
          </Link>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Искать молоко, сыр, свежие фрукты, напитки..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-full text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-200/60 transition-colors"
                title="Очистить поиск"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Support / WhatsApp Chat button */}
            <Link
              href="/chat"
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-full border border-neutral-200/80 hover:border-emerald-300 text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-all text-xs sm:text-sm font-medium"
              title="Чат поддержки и связь с оператором"
            >
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
              </div>
              <span className="hidden sm:inline">Помощь</span>
            </Link>

            {/* Cart trigger button */}
            <button
              onClick={onOpenCart}
              className={`relative flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-sm ${
                mounted && totalItems > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald hover:shadow-lg'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
              aria-label="Открыть корзину"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-rose-500 text-white text-[11px] font-black w-4.5 h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-white animate-scale-in">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-medium">Корзина</span>
              {mounted && totalItems > 0 && (
                <span className="hidden md:inline pl-1 border-l border-white/30 text-xs font-bold">
                  {formatPrice(totalPrice)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden mt-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-600 transition-colors w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск продуктов..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-neutral-100 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-full text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-200 transition-colors"
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
