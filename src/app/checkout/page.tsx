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
          deliveryFee: deliveryCost,
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

      // Переходим на страницу созданного заказа (уведомление кассиру отправляется автоматически с бэкенда)
      router.push(`/order/${order.id}`)
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
      <div className="min-h-screen bg-[#fbfbfa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 border border-neutral-300 bg-white flex items-center justify-center mb-5 text-neutral-400">
          <ShoppingBag className="w-8 h-8 opacity-40" />
        </div>
        <h2 className="text-xl font-bold text-neutral-950 uppercase tracking-tight mb-2">Корзина пуста</h2>
        <p className="text-xs text-neutral-500 mb-8 max-w-sm">
          Добавьте позиции из каталога «Магазина Хавпачевых» для оформления быстрой доставки курьером.
        </p>
        <Link
          href="/"
          className="bg-neutral-950 hover:bg-neutral-800 text-white px-8 py-3.5 rounded-none font-bold text-xs uppercase tracking-wider transition-colors border border-neutral-950"
        >
          Вернуться в каталог &darr;
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcfb] font-sans text-neutral-900 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-neutral-300 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-700 hover:text-neutral-950 font-mono uppercase text-xs tracking-wider transition-colors"
          >
            <div className="w-7 h-7 border border-neutral-300 flex items-center justify-center rounded-none bg-white">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            <span>В магазин</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-neutral-950 uppercase tracking-tight font-sans">Оформление заказа</span>
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
            <div className="bg-white rounded-none p-6 border border-neutral-300 space-y-4">
              <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Truck className="w-4 h-4 text-neutral-600" />
                <span>01 / Способ получения</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, deliveryType: 'courier' })}
                  className={`p-3.5 rounded-none border text-left transition-colors ${
                    form.deliveryType === 'courier'
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-300 hover:border-neutral-900 bg-white text-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Truck className={`w-4 h-4 ${form.deliveryType === 'courier' ? 'text-white' : 'text-neutral-600'}`} />
                    {form.deliveryType === 'courier' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="font-bold text-xs uppercase tracking-wider">Курьер</div>
                  <div className={`text-[11px] font-mono mt-0.5 ${form.deliveryType === 'courier' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {cartTotal >= FREE_DELIVERY_THRESHOLD ? 'Бесплатно' : `${DELIVERY_FEE} ₽ · от 30 мин`}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, deliveryType: 'pickup' })}
                  className={`p-3.5 rounded-none border text-left transition-colors ${
                    form.deliveryType === 'pickup'
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-300 hover:border-neutral-900 bg-white text-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Store className={`w-4 h-4 ${form.deliveryType === 'pickup' ? 'text-white' : 'text-neutral-600'}`} />
                    {form.deliveryType === 'pickup' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="font-bold text-xs uppercase tracking-wider">Самовывоз</div>
                  <div className={`text-[11px] font-mono mt-0.5 ${form.deliveryType === 'pickup' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Бесплатно · 15 мин
                  </div>
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-none p-6 border border-neutral-300 space-y-4">
              <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2 font-mono">
                <User className="w-4 h-4 text-neutral-600" />
                <span>02 / Контактные данные</span>
              </h2>

              {/* Name */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
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
                    className={`w-full pl-10 pr-4 py-2.5 bg-neutral-50 focus:bg-white border rounded-none text-xs sm:text-sm focus:outline-none transition-colors ${
                      errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-neutral-300 focus:border-neutral-950'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-rose-600 text-xs mt-1.5 font-medium">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
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
                    className={`w-full pl-10 pr-4 py-2.5 bg-neutral-50 focus:bg-white border rounded-none text-xs sm:text-sm font-mono focus:outline-none transition-colors ${
                      errors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-neutral-300 focus:border-neutral-950'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-rose-600 text-xs mt-1.5 font-medium">{errors.phone}</p>}
                <p className="text-[11px] font-mono text-neutral-400 mt-1 uppercase">
                  На этот номер будет направлено подтверждение и сформирован чек в WhatsApp.
                </p>
              </div>

              {/* Delivery Address if courier */}
              {form.deliveryType === 'courier' && (
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
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
                      className={`w-full pl-10 pr-4 py-2.5 bg-neutral-50 focus:bg-white border rounded-none text-xs sm:text-sm focus:outline-none transition-colors ${
                        errors.address ? 'border-rose-400 focus:border-rose-500' : 'border-neutral-300 focus:border-neutral-950'
                      }`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-rose-600 text-xs mt-1.5 font-medium">{errors.address}</p>
                  )}
                </div>
              )}

              {/* Comment with quick tags */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Комментарий к заказу (необязательно)
                </label>
                <div className="relative mb-2">
                  <MessageSquare className="absolute left-3.5 top-3 text-neutral-400 w-4 h-4" />
                  <textarea
                    placeholder="Например: спелые авокадо, код домофона #42..."
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-950 rounded-none text-xs sm:text-sm focus:outline-none resize-none transition-colors"
                  />
                </div>

                {/* Quick tags buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addQuickTag(tag)}
                      className="text-[10px] font-mono uppercase bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-1 rounded-none border border-neutral-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-none p-6 border border-neutral-300 space-y-4">
              <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2 font-mono">
                <CreditCard className="w-4 h-4 text-neutral-600" />
                <span>03 / Способ оплаты</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: 'cash' })}
                  className={`p-3 rounded-none border text-left transition-colors ${
                    form.paymentMethod === 'cash'
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-300 bg-white hover:border-neutral-900 text-neutral-900'
                  }`}
                >
                  <Banknote className="w-4 h-4 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider">Наличными</p>
                  <p className={`text-[10px] font-mono mt-0.5 ${form.paymentMethod === 'cash' ? 'text-neutral-300' : 'text-neutral-500'}`}>При получении</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: 'sbp' })}
                  className={`p-3 rounded-none border text-left transition-colors ${
                    form.paymentMethod === 'sbp'
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-300 bg-white hover:border-neutral-900 text-neutral-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider">СБП / Перевод</p>
                  <p className={`text-[10px] font-mono mt-0.5 ${form.paymentMethod === 'sbp' ? 'text-neutral-300' : 'text-neutral-500'}`}>По номеру телефона</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: 'card' })}
                  className={`p-3 rounded-none border text-left transition-colors ${
                    form.paymentMethod === 'card'
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-300 bg-white hover:border-neutral-900 text-neutral-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider">Картой курьеру</p>
                  <p className={`text-[10px] font-mono mt-0.5 ${form.paymentMethod === 'card' ? 'text-neutral-300' : 'text-neutral-500'}`}>Через POS-терминал</p>
                </button>
              </div>
            </div>

            {/* Submit Button - Sharp Square */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-400 text-white py-4 rounded-none font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors border border-neutral-950 flex items-center justify-center gap-2 active:translate-y-px"
            >
              {submitting ? (
                <span className="font-mono">ОФОРМЛЕНИЕ ЗАКАЗА...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ПОДТВЕРДИТЬ ЗАКАЗ &mdash; {formatPrice(finalTotal)}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-neutral-700" />
              <span>Заказ поступит сотруднику на сборку автоматически</span>
            </div>
          </form>
        </div>

        {/* Right Summary (5 cols) - Square Architectural Panel */}
        <div className="md:col-span-5">
          <div className="bg-white rounded-none p-6 border border-neutral-300 sticky top-24 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-sm text-neutral-950 uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-neutral-700" />
                <span>Состав заказа</span>
              </h3>
              <span className="text-[11px] font-mono font-bold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-none">
                {items.length} ПОЗ.
              </span>
            </div>

            {/* Items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0 bg-[#f8f8f6] rounded-none border border-neutral-200 overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                    ) : (
                      <span className="font-mono text-[10px] font-bold text-neutral-400">SS</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-neutral-950 uppercase tracking-tight line-clamp-1">{item.name}</p>
                    <p className="text-[11px] font-mono text-neutral-500">
                      {item.quantity} &times; {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-xs font-mono font-bold text-neutral-950">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total breakdown */}
            <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-neutral-500 uppercase">
                <span>Сумма товаров:</span>
                <span className="font-bold text-neutral-900">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-500 uppercase">
                <span>Доставка:</span>
                <span className={`font-bold ${isFreeDelivery ? 'text-neutral-900' : 'text-neutral-900'}`}>
                  {isFreeDelivery ? 'БЕСПЛАТНО' : formatPrice(DELIVERY_FEE)}
                </span>
              </div>

              <div className="border-t border-neutral-200 pt-3 flex justify-between items-center text-sm">
                <span className="font-bold text-neutral-950 uppercase font-sans">Итого:</span>
                <span className="text-lg font-mono font-black text-neutral-950">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Security note */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-none p-3 text-[11px] font-mono uppercase text-neutral-600 leading-snug flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-700 flex-shrink-0" />
              <span>Оплата производится только после получения и проверки позиций.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

