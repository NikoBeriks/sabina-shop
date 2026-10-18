'use client'

import { X, Minus, Plus, ShoppingBag, Trash2, Truck, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

const FREE_DELIVERY_THRESHOLD = 1500
const DELIVERY_FEE = 150

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
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/70 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel - Sharp rectangular */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-white border-l border-neutral-300 shadow-2xl flex flex-col rounded-none">
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-neutral-950 text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-950 uppercase tracking-tight leading-none">
                  Корзина
                </h2>
                <span className="text-[11px] font-mono text-neutral-400 mt-1 block">
                  {items.length > 0 ? `ПОЗИЦИЙ В ЗАКАЗЕ: ${items.length}` : 'ЗАКАЗ ПУСТ'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] font-mono uppercase text-neutral-400 hover:text-neutral-900 px-2 py-1 transition-colors"
                  title="Очистить корзину"
                >
                  Очистить
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-950 flex items-center justify-center rounded-none transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Free Delivery Bar - Sharp */}
          {items.length > 0 && (
            <div className="bg-neutral-50 border-b border-neutral-200 px-5 py-3">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="flex items-center gap-1.5 text-neutral-800 font-mono text-[11px] uppercase">
                  <Truck className="w-3.5 h-3.5 text-neutral-600" />
                  {isFreeDelivery ? (
                    <span className="text-neutral-900 font-bold">БЕСПЛАТНАЯ ДОСТАВКА</span>
                  ) : (
                    <span>
                      ДО БЕСПЛАТНОЙ ДОСТАВКИ: <strong className="text-neutral-950">{formatPrice(remainingForFreeDelivery)}</strong>
                    </span>
                  )}
                </span>
                <span className="text-neutral-500 font-mono text-[11px]">{deliveryProgress}%</span>
              </div>

              {/* Progress track - Sharp */}
              <div className="w-full h-1.5 bg-neutral-200 rounded-none overflow-hidden">
                <div
                  className="h-full bg-neutral-900 rounded-none transition-all duration-300 ease-out"
                  style={{ width: `${deliveryProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List / Empty state */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 border border-neutral-300 bg-neutral-50 flex items-center justify-center mb-4 text-neutral-400">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="text-base font-bold text-neutral-950 uppercase tracking-tight mb-1">
                  Корзина пуста
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mb-6 leading-relaxed font-sans">
                  Выберите необходимые позиции из каталога &mdash; мы бережно соберём и доставим их в течение 30 минут.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white px-6 py-3 rounded-none font-bold text-xs uppercase tracking-wider transition-colors border border-neutral-950"
                >
                  В каталог товаров &darr;
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-none transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 flex-shrink-0 bg-[#f8f8f6] rounded-none border border-neutral-200 overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="font-mono text-xs font-bold text-neutral-400">SS</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-neutral-950 text-xs sm:text-sm line-clamp-1 leading-snug uppercase tracking-tight">
                        {item.name}
                      </h4>
                      <p className="text-neutral-900 font-mono font-bold text-xs mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Stepper & Delete - Square */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-neutral-100">
                      <div className="flex items-center border border-neutral-300 rounded-none bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-none border-r border-neutral-200"
                          title="Уменьшить"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-xs text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-neutral-950 text-white hover:bg-neutral-800 rounded-none"
                          title="Увеличить"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-neutral-950">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-neutral-900 p-1 rounded-none transition-colors"
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
            <div className="border-t border-neutral-300 p-5 bg-white space-y-3">
              {/* Cost Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-neutral-500 font-mono">
                  <span>ТОВАРЫ ({items.reduce((s, i) => s + i.quantity, 0)} ШТ)</span>
                  <span className="font-bold text-neutral-900">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 font-mono">
                  <span>ДОСТАВКА</span>
                  <span className="font-bold text-neutral-900">
                    {isFreeDelivery ? 'БЕСПЛАТНО' : formatPrice(DELIVERY_FEE)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200 uppercase tracking-tight">
                  <span>Итого к оплате</span>
                  <span className="text-lg font-mono font-black text-neutral-950">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button - Sharp Square */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white text-center py-3.5 rounded-none font-bold text-xs uppercase tracking-wider transition-colors border border-neutral-950 active:translate-y-px"
              >
                <span>Перейти к оформлению</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="text-center font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                ОПЛАТА ПРИ ПОЛУЧЕНИИ &middot; СБП &middot; КАРТОЙ
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

