'use client'

import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { useState } from 'react'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  stock: number
}

const CATEGORY_ICONS: Record<string, { emoji: string; bg: string }> = {
  'Молочные продукты': { emoji: '🥛', bg: 'from-blue-50 to-indigo-100' },
  'Фрукты и овощи': { emoji: '🍏', bg: 'from-emerald-50 to-green-100' },
  'Мясо и рыба': { emoji: '🥩', bg: 'from-rose-50 to-red-100' },
  'Хлеб и выпечка': { emoji: '🥖', bg: 'from-amber-50 to-yellow-100' },
  'Бакалея': { emoji: '🍝', bg: 'from-orange-50 to-amber-100' },
  'Напитки': { emoji: '🥤', bg: 'from-cyan-50 to-sky-100' },
  'Кондитерские': { emoji: '🍫', bg: 'from-purple-50 to-pink-100' },
  'Заморозка': { emoji: '❄️', bg: 'from-teal-50 to-blue-100' },
  'Готовая еда': { emoji: '🍱', bg: 'from-yellow-50 to-orange-100' },
  'Бытовая химия': { emoji: '🧼', bg: 'from-blue-50 to-teal-100' },
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const categoryInfo = CATEGORY_ICONS[product.category] || { emoji: '🛒', bg: 'from-gray-50 to-slate-100' }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col border border-gray-100">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
        {product.imageUrl && !imgError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${categoryInfo.bg}`}>
            <span className="text-5xl select-none filter drop-shadow-sm">{categoryInfo.emoji}</span>
          </div>
        )}

        {/* Category badge */}
        <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-md text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
          {product.category}
        </span>

        {/* Out of stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
              Нет в наличии
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t border-gray-50">
          <span className="font-extrabold text-pink-600 text-base">{formatPrice(product.price)}</span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white shadow-sm'
                : product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-pink-600 text-white hover:bg-pink-700 active:scale-95 shadow-sm'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {added ? 'Добавлено!' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>
  )
}
