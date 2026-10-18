'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import {
  ShoppingBag,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Truck,
  Store,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { generateWhatsAppUrl, generateCustomerToOwnerWhatsAppText } from '@/lib/whatsapp'

const FREE_DELIVERY_THRESHOLD = 1500
const DELIVERY_FEE = 150

const QUICK_TAGS = [
  'Позвонить за 15 минут',
  'Оставить у двери',
  'Код домофона #',
  'Нужна сдача с 1 000 ₽',
  'Нужна сдача с 5 000 ₽',
]

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
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    comment: '',
    deliveryType: 'courier' as 'courier' | 'pickup',
    paymentMethod: 'cash' as 'cash' | 'sbp' | 'card',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cartTotal = totalPrice()
  const isFreeDelivery = form.deliveryType === 'pickup' || cartTotal >= FREE_DELIVERY_THRESHOLD
  const deliveryCost = isFreeDelivery ? 0 : DELIVERY_FEE
  const finalTotal = cartTotal + deliveryCost

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Пожалуйста, укажите ваше имя'
    const digits = form.phone.replace(/\D/g, '')
    if (digits.length < 10) errs.phone = 'Укажите действующий номер телефона (10–11 цифр)'
    if (form.deliveryType === 'courier' && !form.address.trim()) {
      errs.address = 'Укажите улицу, дом и номер квартиры для доставки'
    }
    return errs
  }

  const addQuickTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      comment: prev.comment ? `${prev.comment}, ${tag}` : tag,
    }))
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
      const fullComment = [
        form.comment.trim(),
        `Тип: ${form.deliveryType === 'courier' ? 'Курьерская доставка' : 'Самовывоз'}`,
        `Оплата: ${
          form.paymentMethod === 'cash'
            ? 'Наличными при получении'
            : form.paymentMethod === 'sbp'
            ? 'СБП / Перевод на карту'
            : 'Картой курьеру'
        }`,
      ]
        .filter(Boolean)
        .join(' | ')

      const fullAddress =
        form.deliveryType === 'pickup' ? 'Самовывоз из магазина' : form.address.trim()

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name.trim(),
          phone: form.phone.replace(/\D/g, ''),
          address: fullAddress,
          comment: fullComment,
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

      // И перенаправляем в WhatsApp с чеком заказа
      setTimeout(() => {
        window.location.href = waUrl
      }, 500)
    } catch (e) {
      console.error(e)
      alert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans">
        <div className="animate-pulse text-neutral-400 font-medium">Загрузка данных заказа...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-24 h-24 rounded-3xl bg-neutral-100 flex items-center justify-center mb-5 text-4xl shadow-inner">
          🧺
        </div>
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Корзина пуста</h2>
        <p className="text-sm text-neutral-500 mb-8 max-w-sm">
          Добавьте свежие продукты из каталога Sabina Shop, чтобы оформить заказ с быстрой доставкой.
        </p>
        <Link
          href="/"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-emerald shadow-sm"
        >
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 pb-16">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-neutral-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-emerald-700 font-semibold text-sm transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-emerald-50 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>В магазин</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-neutral-900">Оформление заказа</span>
          </div>
          <div className="w-8" />
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 grid md:grid-cols-12 gap-8">
        {/* Left Form (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Method Selection */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-neutral-200/70 space-y-4">
              <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>1. Способ получения</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, deliveryType: 'courier' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                    form.deliveryType === 'courier'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Truck className={`w-5 h-5 ${form.deliveryType === 'courier' ? 'text-emerald-700' : 'text-neutral-500'}`} />
                    {form.deliveryType === 'courier' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-neutral-900">Доставка курьером</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {cartTotal >= FREE_DELIVERY_THRESHOLD ? 'Бесплатно' : `${DELIVERY_FEE} ₽ · от 30 мин`}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, deliveryType: 'pickup' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                    form.deliveryType === 'pickup'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Store className={`w-5 h-5 ${form.deliveryType === 'pickup' ? 'text-emerald-700' : 'text-neutral-500'}`} />
                    {form.deliveryType === 'pickup' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-neutral-900">Самовывоз</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Бесплатно · готов через 15 мин</div>
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-neutral-200/70 space-y-4">
              <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>2. Контактные данные</span>
              </h2>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Ваше имя <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Например, Сабина"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value })
                      setErrors({ ...errors, name: '' })
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-neutral-50 focus:bg-white border rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all ${
                      errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-neutral-200 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Номер телефона <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({ ...form, phone: applyPhoneMask(e.target.value) })
                      setErrors({ ...errors, phone: '' })
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-neutral-50 focus:bg-white border rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all ${
                      errors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-neutral-200 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.phone}</p>}
                <p className="text-[11px] text-neutral-400 mt-1">
                  На этот номер придет подтверждение и чек заказа в WhatsApp.
                </p>
              </div>

              {/* Delivery Address if courier */}
              {form.deliveryType === 'courier' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Адрес доставки <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Улица, дом, подъезд, квартира/офис"
                      value={form.address}
                      onChange={(e) => {
                        setForm({ ...form, address: e.target.value })
                        setErrors({ ...errors, address: '' })
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-neutral-50 focus:bg-white border rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all ${
                        errors.address ? 'border-rose-400 focus:border-rose-500' : 'border-neutral-200 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.address}</p>
                  )}
                </div>
              )}

              {/* Comment with quick tags */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Комментарий к заказу (необязательно)
                </label>
                <div className="relative mb-2">
                  <MessageSquare className="absolute left-3.5 top-3.5 text-neutral-400 w-4 h-4" />
                  <textarea
                    placeholder="Например: спелые авокадо, позвонить за 15 минут..."
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-emerald-500 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 resize-none transition-all"
                  />
                </div>

                {/* Quick tags buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addQuickTag(tag)}
                      className="text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-2.5 py-1 rounded-xl transition-colors font-medium active:scale-95"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-neutral-200/70 space-y-4">
              <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>3. Способ оплаты</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: 'cash' })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    form.paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-700 mb-1.5" />
                  <p className="text-xs font-bold text-neutral-900">Наличными</p>
                  <p className="text-[10px] text-neutral-500">При получении</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: 'sbp' })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    form.paymentMethod === 'sbp'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-indigo-600 mb-1.5" />
                  <p className="text-xs font-bold text-neutral-900">СБП / Перевод</p>
                  <p className="text-[10px] text-neutral-500">По номеру телефона</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: 'card' })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    form.paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-600 mb-1.5" />
                  <p className="text-xs font-bold text-neutral-900">Картой курьеру</p>
                  <p className="text-[10px] text-neutral-500">Через POS-терминал</p>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-4 rounded-2xl font-black text-base sm:text-lg transition-all active:scale-95 shadow-emerald shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>⏳ Оформляем заказ...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Подтвердить заказ ({formatPrice(finalTotal)})</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>После оформления откроется WhatsApp для отправки чека оператору</span>
            </div>
          </form>
        </div>

        {/* Right Summary (5 cols) */}
        <div className="md:col-span-5">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-neutral-200/70 sticky top-24 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="font-black text-base text-neutral-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>Ваш заказ</span>
              </h3>
              <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                {items.length} поз.
              </span>
            </div>

            {/* Items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200/60 flex items-center justify-center">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-neutral-900 line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-neutral-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-xs font-black text-neutral-900 font-mono">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total breakdown */}
            <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Сумма товаров:</span>
                <span className="font-bold text-neutral-800">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span className="flex items-center gap-1">
                  <span>Доставка:</span>
                  {isFreeDelivery && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded font-bold">
                      Бесплатно
                    </span>
                  )}
                </span>
                <span className={`font-bold ${isFreeDelivery ? 'text-emerald-600' : 'text-neutral-800'}`}>
                  {isFreeDelivery ? '0 ₽' : formatPrice(DELIVERY_FEE)}
                </span>
              </div>

              <div className="border-t border-neutral-100 pt-3 flex justify-between items-center text-sm">
                <span className="font-bold text-neutral-900">Итого к оплате:</span>
                <span className="text-xl font-black text-emerald-700">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Security pill */}
            <div className="bg-emerald-50 rounded-2xl p-3 text-[11px] text-emerald-800 leading-snug flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Оплата производится только после получения и проверки свежести продуктов.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
