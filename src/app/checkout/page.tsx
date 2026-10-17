'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, ArrowLeft, User, Phone, MapPin, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { generateWhatsAppUrl, generateCustomerToOwnerWhatsAppText } from '@/lib/whatsapp'

function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 1) return `+${digits}`
  if (digits.length <= 4) return `+${digits[0]} (${digits.slice(1)}`
  if (digits.length <= 7) return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4)}`
  if (digits.length <= 9) return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()
  const [form, setForm] = useState({ name: '', phone: '', address: '', comment: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Введите имя'
    const digits = form.phone.replace(/\D/g, '')
    if (digits.length < 10) errs.phone = 'Введите корректный номер телефона'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          phone: form.phone.replace(/\D/g, ''),
          address: form.address,
          comment: form.comment,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      })

      if (!res.ok) throw new Error('Ошибка создания заказа')
      const order = await res.json()
      clearCart()

      const waPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '79287144816'
      const waUrl = generateWhatsAppUrl(waPhone, generateCustomerToOwnerWhatsAppText(order))

      // Сначала переходим на страницу успеха заказа
      router.push(`/order/${order.id}`)

      // И сразу перенаправляем покупателя в WhatsApp для мгновенной отправки заказа
      setTimeout(() => {
        window.location.href = waUrl
      }, 500)
    } catch (e) {
      console.error(e)
      alert('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="animate-pulse text-gray-400">Загрузка...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Корзина пуста</h2>
        <p className="text-gray-500 mb-6">Добавьте товары, чтобы оформить заказ</p>
        <Link
          href="/"
          className="bg-pink-600 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-700 transition-colors"
        >
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Оформление заказа</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Ваши данные</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <User className="w-4 h-4 inline mr-1" />
                  Имя *
                </label>
                <input
                  type="text"
                  placeholder="Введите ваше имя"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value })
                    setErrors({ ...errors, name: '' })
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                    errors.name ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: applyPhoneMask(e.target.value) })
                    setErrors({ ...errors, phone: '' })
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                    errors.phone ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Адрес доставки
                </label>
                <input
                  type="text"
                  placeholder="Улица, дом, квартира"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Комментарий к заказу
                </label>
                <textarea
                  placeholder="Например: спелые бананы, код домофона, удобное время доставки..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white py-4 rounded-2xl font-bold text-lg transition-colors"
              >
                {submitting ? '⏳ Оформляем...' : '✓ Подтвердить заказ'}
              </button>

              <p className="text-xs text-center text-gray-400">
                Нажимая кнопку, вы соглашаетесь с условиями обработки данных.
                Менеджер свяжется с вами в WhatsApp.
              </p>
            </form>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ваш заказ</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">× {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Итого</span>
                <span className="text-2xl font-bold text-pink-600">{formatPrice(totalPrice())}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                💳 Оплата при получении или по реквизитам в WhatsApp
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
