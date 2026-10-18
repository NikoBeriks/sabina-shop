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
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/70 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog - Square Architectural Box */}
      <div className="relative bg-white rounded-none border border-neutral-900 shadow-2xl max-w-2xl w-full overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button - Sharp */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-none bg-white border border-neutral-300 hover:border-neutral-900 flex items-center justify-center text-neutral-800 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Container */}
        <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-[#f8f8f6] border-b md:border-b-0 md:border-r border-neutral-200 flex items-center justify-center overflow-hidden">
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
            <div className="flex flex-col items-center justify-center p-8 text-center bg-[#f4f4f0] w-full h-full">
              <div className="w-16 h-16 border border-neutral-300 bg-white flex items-center justify-center mb-3">
                <span className="font-mono text-sm font-bold text-neutral-800 tracking-wider">
                  {product.category.slice(0, 3).toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                МАГАЗИН ХАВПАЧЕВЫХ &middot; ГАСТРОНОМ
              </span>
            </div>
          )}

          {/* Badge */}
          <span className="absolute top-3 left-3 bg-white/95 text-neutral-800 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 border border-neutral-300 rounded-none">
            {product.category}
          </span>
        </div>

        {/* Details & Actions */}
        <div className="w-full md:w-1/2 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
                {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Под заказ'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-neutral-950 uppercase tracking-tight leading-tight mb-2">
              {product.name}
            </h2>

            <div className="text-2xl font-mono font-bold text-neutral-950 mb-4">
              {formatPrice(product.price)}
            </div>

            {/* Description */}
            <div className="space-y-3 mb-6">
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {product.description ||
                  'Натуральный и свежий продукт высокого качества, отобранный вручную для вашего стола.'}
              </p>

              {product.barcode && (
                <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-none">
                  <Barcode className="w-4 h-4 text-neutral-400" />
                  <span>Штрихкод: <strong className="font-mono text-neutral-900">{product.barcode}</strong></span>
                </div>
              )}
            </div>

            {/* Quality assurances */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 mb-6 border-t border-neutral-200 pt-3">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase">
                <Truck className="w-3.5 h-3.5 text-neutral-500" />
                <span>Доставка 30 мин</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                <span>Контроль свежести</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector and Add to Cart - Square */}
          <div className="border-t border-neutral-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-neutral-500">Количество:</span>
              <div className="flex items-center border border-neutral-900 rounded-none bg-white">
                <button
                  type="button"
                  onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-none bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-100 transition-colors border-r border-neutral-200"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-mono font-bold text-xs text-neutral-950">
                  {modalQty}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQty((q) => q + 1)}
                  className="w-8 h-8 rounded-none bg-neutral-950 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-3.5 rounded-none font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border ${
                justAdded
                  ? 'bg-neutral-950 text-white border-neutral-950'
                  : product.stock === 0
                  ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                  : 'bg-neutral-950 hover:bg-neutral-800 text-white border-neutral-950 active:translate-y-px'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Добавлено в корзину</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {cartItem ? 'Обновить количество' : `Добавить — ${formatPrice(product.price * modalQty)}`}
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

