'use client'

import Image from 'next/image'
import { Plus, Minus, Check, Eye } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { useState, useMemo } from 'react'

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  stock: number
  barcode?: string | null
}

const CATEGORY_ICONS: Record<string, { emoji: string; bg: string }> = {
  'Молочные продукты': { emoji: '🥛', bg: 'from-blue-50 to-indigo-100/70' },
  'Фрукты и овощи': { emoji: '🍏', bg: 'from-emerald-50 to-green-100/70' },
  'Мясо и рыба': { emoji: '🥩', bg: 'from-rose-50 to-red-100/70' },
  'Хлеб и выпечка': { emoji: '🥖', bg: 'from-amber-50 to-yellow-100/70' },
  'Бакалея': { emoji: '🍝', bg: 'from-orange-50 to-amber-100/70' },
  'Напитки': { emoji: '🥤', bg: 'from-cyan-50 to-sky-100/70' },
  'Кондитерские': { emoji: '🍫', bg: 'from-purple-50 to-pink-100/70' },
  'Заморозка': { emoji: '❄️', bg: 'from-teal-50 to-blue-100/70' },
  'Готовая еда': { emoji: '🍱', bg: 'from-yellow-50 to-orange-100/70' },
  'Бытовая химия': { emoji: '🧼', bg: 'from-blue-50 to-teal-100/70' },
}

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCartStore()
  const [justAdded, setJustAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Find if this product is already in the cart
  const cartItem = items.find((item) => item.id === product.id)
  const quantity = cartItem ? cartItem.quantity : 0

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 900)
  }

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (quantity > 0) {
      updateQuantity(product.id, quantity - 1)
    }
  }

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateQuantity(product.id, quantity + 1)
  }

  const categoryInfo = CATEGORY_ICONS[product.category] || {
    emoji: '🛒',
    bg: 'from-neutral-50 to-neutral-100',
  }

  // Determine special badge
  const badge = useMemo(() => {
    if (product.stock === 0) return null
    if (product.id % 4 === 1) return { label: '🔥 Хит', bg: 'bg-rose-500 text-white' }
    if (product.category === 'Фрукты и овощи' || product.category === 'Молочные продукты') {
      return { label: '🌿 Свежее', bg: 'bg-emerald-600 text-white' }
    }
    if (product.price <= 500) return { label: '✨ Выгодно', bg: 'bg-amber-500 text-white' }
    return null
  }, [product.id, product.category, product.price, product.stock])

  return (
    <div
      onClick={() => onQuickView?.(product)}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col border border-neutral-200/70 hover:border-emerald-300/80 cursor-pointer"
    >
      {/* Product Image / Placeholder */}
      <div className="relative aspect-square w-full bg-neutral-100/60 overflow-hidden flex items-center justify-center">
        {product.imageUrl && !imgError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${categoryInfo.bg}`}
          >
            <span className="text-5xl select-none filter drop-shadow-xs group-hover:scale-110 transition-transform duration-300">
              {categoryInfo.emoji}
            </span>
          </div>
        )}

        {/* Category chip */}
        <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-neutral-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-neutral-200/50 shadow-xs">
          {product.category}
        </span>

        {/* Special status badge */}
        {badge && (
          <span
            className={`absolute top-2.5 right-2.5 ${badge.bg} text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider`}
          >
            {badge.label}
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 text-center">
            <span className="bg-white/95 text-neutral-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              Нет в наличии
            </span>
          </div>
        )}

        {/* Quick view hint hover button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onQuickView?.(product)
          }}
          className="absolute inset-x-4 bottom-3 hidden sm:flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md text-neutral-800 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:bg-white"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-600" />
          <span>Быстрый просмотр</span>
        </button>
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Bottom price and cart actions */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-100">
          <div className="flex flex-col">
            <span className="text-[11px] text-neutral-400 font-medium leading-none">Цена</span>
            <span className="font-black text-neutral-900 text-base sm:text-lg leading-tight mt-0.5">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Cart actions: Stepper if in cart, or big Add button */}
          {quantity > 0 ? (
            <div
              className="flex items-center bg-emerald-50 border border-emerald-200/90 rounded-2xl p-1 gap-1 shadow-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleMinus}
                className="w-7 h-7 flex items-center justify-center rounded-xl bg-white text-emerald-800 hover:bg-emerald-100/70 active:scale-90 transition-all shadow-xs"
                title="Уменьшить"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-black text-xs sm:text-sm text-emerald-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handlePlus}
                className="w-7 h-7 flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-90 transition-all shadow-xs"
                title="Увеличить"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                justAdded
                  ? 'bg-emerald-600 text-white shadow-emerald shadow-sm'
                  : product.stock === 0
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-900 hover:bg-emerald-600 text-white shadow-xs hover:shadow-emerald'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                  <span>В корзине!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Купить</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
