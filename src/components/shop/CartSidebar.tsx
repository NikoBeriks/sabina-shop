'use client'

import { X, Minus, Plus, ShoppingBag, Trash2, Truck, ArrowRight, Sparkles } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

const FREE_DELIVERY_THRESHOLD = 3000
const DELIVERY_FEE = 500

export default function CartSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()
  const total = totalPrice()

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const isFreeDelivery = total >= FREE_DELIVERY_THRESHOLD
  const deliveryProgress = Math.min(100, Math.round((total / FREE_DELIVERY_THRESHOLD) * 100))
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - total)
  const deliveryCost = isFreeDelivery ? 0 : DELIVERY_FEE
  const finalTotal = total + (items.length > 0 ? deliveryCost : 0)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col font-sans">
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-neutral-900 leading-none">Корзина</h2>
                <span className="text-xs text-neutral-400 font-medium">
                  {items.length > 0 ? `${items.length} поз. в заказе` : 'Пока пуста'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-neutral-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Очистить корзину"
                >
                  Очистить
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Delivery Progress Bar */}
          {items.length > 0 && (
            <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-5 py-3">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-emerald-900">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  {isFreeDelivery ? (
                    <span className="text-emerald-700 font-bold">🎉 Доставка бесплатна!</span>
                  ) : (
                    <span>
                      До бесплатной доставки ещё{' '}
                      <strong className="text-emerald-700">{formatPrice(remainingForFreeDelivery)}</strong>
                    </span>
                  )}
                </span>
                <span className="text-emerald-600 font-mono text-[11px]">{deliveryProgress}%</span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 bg-emerald-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${deliveryProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List / Empty state */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-24 h-24 rounded-3xl bg-neutral-100 flex items-center justify-center mb-4 text-4xl shadow-inner">
                  🧺
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">Ваша корзина пуста</h3>
                <p className="text-xs text-neutral-500 max-w-xs mb-6 leading-relaxed">
                  Выберите вкусные и свежие продукты из нашего каталога — мы бережно соберем и доставим их за 30 минут!
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-emerald shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Перейти к покупкам</span>
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-neutral-50/70 hover:bg-neutral-50 rounded-2xl border border-neutral-100 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-neutral-200/60 flex items-center justify-center">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl select-none">🛒</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-1 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-emerald-700 font-extrabold text-xs sm:text-sm mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Stepper & Delete */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                      <div className="flex items-center bg-white border border-neutral-200 rounded-xl p-0.5 gap-1 shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 active:scale-90 transition-transform"
                          title="Уменьшить"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-neutral-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-90 transition-transform"
                          title="Увеличить"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-700 font-mono">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-neutral-200/70 p-5 bg-white space-y-3 shadow-lg">
              {/* Cost Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Товары ({items.reduce((s, i) => s + i.quantity, 0)} шт.)</span>
                  <span className="font-semibold text-neutral-800">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="flex items-center gap-1">
                    <span>Доставка</span>
                    {isFreeDelivery && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        АКЦИЯ
                      </span>
                    )}
                  </span>
                  <span className={`font-semibold ${isFreeDelivery ? 'text-emerald-600' : 'text-neutral-800'}`}>
                    {isFreeDelivery ? 'Бесплатно' : formatPrice(DELIVERY_FEE)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-100">
                  <span>Итого к оплате</span>
                  <span className="text-xl text-emerald-700">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 active:scale-95 shadow-emerald shadow-md"
              >
                <span>Перейти к оформлению</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="text-center text-[11px] text-neutral-400">
                🔒 Оплата при получении или Kaspi QR · Доставка от 30 мин
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
