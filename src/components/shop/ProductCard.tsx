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

  // Determine strict architectural status badge
  const badge = useMemo(() => {
    if (product.stock === 0) return null
    if (product.id % 4 === 1) {
      return { label: 'ХИТ', style: 'bg-neutral-950 text-white border-neutral-950' }
    }
    if (product.category === 'Фрукты и овощи' || product.category === 'Молочные продукты') {
      return { label: 'СВЕЖЕЕ', style: 'bg-white text-neutral-900 border-neutral-900' }
    }
    if (product.price <= 500) {
      return { label: 'ВЫГОДНО', style: 'bg-[#122a20] text-emerald-300 border-[#122a20]' }
    }
    return null
  }, [product.id, product.category, product.price, product.stock])

  return (
    <div
      onClick={() => onQuickView?.(product)}
      className="group relative bg-white rounded-none border border-neutral-300 hover:border-neutral-950 transition-colors duration-150 flex flex-col cursor-pointer"
    >
      {/* Product Image / Placeholder */}
      <div className="relative aspect-square w-full bg-[#f8f8f6] border-b border-neutral-200 overflow-hidden flex items-center justify-center">
        {product.imageUrl && !imgError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-[#f5f5f2]">
            <div className="w-10 h-10 border border-neutral-300 flex items-center justify-center mb-2 bg-white">
              <span className="font-mono text-[11px] font-bold text-neutral-700 tracking-wider">
                {product.category.slice(0, 3).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-semibold text-neutral-800 line-clamp-1 uppercase tracking-tight">
              {product.name}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 mt-1 uppercase tracking-widest">
              ГАСТРОНОМИЯ &middot; SS
            </span>
          </div>
        )}

        {/* Category tag */}
        <span className="absolute top-2.5 left-2.5 bg-white/95 text-neutral-700 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-neutral-300 rounded-none">
          {product.category}
        </span>

        {/* Strict status badge */}
        {badge && (
          <span
            className={`absolute top-2.5 right-2.5 ${badge.style} font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest border rounded-none`}
          >
            {badge.label}
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-neutral-900/70 flex items-center justify-center p-3 text-center">
            <span className="bg-white text-neutral-950 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-none border border-neutral-950 font-mono">
              НЕТ В НАЛИЧИИ
            </span>
          </div>
        )}

        {/* Quick view button (hover) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onQuickView?.(product)
          }}
          className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center gap-1.5 py-2 rounded-none bg-white border border-neutral-900 text-neutral-900 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-neutral-950 hover:text-white"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Быстрый просмотр</span>
        </button>
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-neutral-950 text-sm leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-neutral-700 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Bottom price and cart actions */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-200">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">Цена</span>
            <span className="font-mono font-bold text-neutral-950 text-base sm:text-lg leading-tight mt-0.5">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Cart actions: Square Stepper or Square Buy button */}
          {quantity > 0 ? (
            <div
              className="flex items-center border border-neutral-900 bg-white rounded-none"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleMinus}
                className="w-7 h-7 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 transition-colors rounded-none border-r border-neutral-200"
                title="Уменьшить"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center font-mono font-bold text-xs text-neutral-950">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handlePlus}
                className="w-7 h-7 flex items-center justify-center bg-neutral-950 text-white hover:bg-neutral-800 transition-colors rounded-none"
                title="Увеличить"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-150 rounded-none border ${
                justAdded
                  ? 'bg-neutral-950 text-white border-neutral-950'
                  : product.stock === 0
                  ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                  : 'bg-neutral-950 hover:bg-neutral-800 text-white border-neutral-950 active:translate-y-px'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>В корзине</span>
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

