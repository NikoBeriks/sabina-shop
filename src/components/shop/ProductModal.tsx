'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag, Barcode, Check, ShieldCheck, Truck } from 'lucide-react'
import { Product } from './ProductCard'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { items, addItem, updateQuantity } = useCartStore()
  const [modalQty, setModalQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const cartItem = product ? items.find((i) => i.id === product.id) : null

  useEffect(() => {
    if (product) {
      setModalQty(cartItem ? cartItem.quantity : 1)
      setImgError(false)
      setJustAdded(false)
    }
  }, [product, cartItem])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!product) return null

  const handleAddToCart = () => {
    if (cartItem) {
      updateQuantity(product.id, modalQty)
    } else {
      for (let i = 0; i < modalQty; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        })
      }
    }
    setJustAdded(true)
    setTimeout(() => {
      setJustAdded(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-neutral-100 backdrop-blur-md flex items-center justify-center text-neutral-600 transition-colors shadow-xs"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Container */}
        <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-neutral-50 flex items-center justify-center overflow-hidden">
          {product.imageUrl && !imgError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-emerald-50 to-teal-100 w-full h-full">
              <span className="text-7xl select-none filter drop-shadow-md">🛒</span>
              <span className="mt-3 text-xs text-emerald-800 font-semibold bg-white/70 px-3 py-1 rounded-full">
                Sabina Shop Свежесть
              </span>
            </div>
          )}

          {/* Badge */}
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-emerald-800 font-bold text-xs px-3 py-1 rounded-full shadow-xs">
            {product.category}
          </span>
        </div>

        {/* Details & Actions */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                В наличии {product.stock > 0 ? `(${product.stock} шт)` : '· под заказ'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight mb-2">
              {product.name}
            </h2>

            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mb-4">
              {formatPrice(product.price)}
            </div>

            {/* Description */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-neutral-600 leading-relaxed">
                {product.description ||
                  'Натуральный и свежий продукт высокого качества, отобранный с любовью для вашего стола.'}
              </p>

              {product.barcode && (
                <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-100/70 px-3 py-2 rounded-xl">
                  <Barcode className="w-4 h-4 text-neutral-400" />
                  <span>Штрихкод: <strong className="text-neutral-700 font-mono">{product.barcode}</strong></span>
                </div>
              )}
            </div>

            {/* Quality assurances */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-500 mb-6 border-t border-neutral-100 pt-3">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Быстрая доставка</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Контроль свежести</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector and Add to Cart */}
          <div className="border-t border-neutral-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Количество:</span>
              <div className="flex items-center bg-neutral-100 rounded-2xl p-1 gap-2">
                <button
                  type="button"
                  onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-50 active:scale-95 shadow-xs transition-transform"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-neutral-900">
                  {modalQty}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQty((q) => q + 1)}
                  className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-95 shadow-xs transition-transform"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-md ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : product.stock === 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-5 h-5 animate-bounce" />
                  <span>Добавлено в заказ!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    {cartItem ? 'Обновить в корзине' : 'Добавить за ' + formatPrice(product.price * modalQty)}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
