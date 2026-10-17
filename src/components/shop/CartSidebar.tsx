'use client'

import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

export default function CartSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-pink-600" />
            Корзина
            {items.length > 0 && (
              <span className="text-sm font-normal text-gray-500">({items.length} поз.)</span>
            )}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
              <ShoppingBag className="w-20 h-20 opacity-20 mb-4" />
              <p className="text-lg font-medium">Корзина пуста</p>
              <p className="text-sm mt-1">Добавьте товары из каталога</p>
              <button
                onClick={onClose}
                className="mt-6 bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors"
              >
                Перейти к товарам
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                {/* Image */}
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
                      📦
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm line-clamp-2">{item.name}</p>
                  <p className="text-pink-600 font-bold text-sm mt-1">{formatPrice(item.price)}</p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Итого:</span>
              <span className="text-2xl font-bold text-gray-900">{formatPrice(totalPrice())}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-pink-600 hover:bg-pink-700 text-white text-center py-3.5 rounded-2xl font-semibold text-base transition-colors"
            >
              Оформить заказ →
            </Link>
            <p className="text-xs text-center text-gray-400">
              Оплата при получении · Доставка по договорённости
            </p>
          </div>
        )}
      </div>
    </>
  )
}
