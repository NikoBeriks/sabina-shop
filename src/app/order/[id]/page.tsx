import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateCustomerToOwnerWhatsAppText, generateWhatsAppUrl } from '@/lib/whatsapp'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle2, MessageCircle, Home } from 'lucide-react'

export default async function OrderSuccessPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: { items: { include: { product: true } } },
  })

  if (!order) notFound()

  const waPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '79287144816'
  const waText = generateCustomerToOwnerWhatsAppText(order)
  const waUrl = generateWhatsAppUrl(waPhone, waText)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Спасибо за заказ!</h1>
        <p className="text-4xl font-black text-pink-600 mb-4">#{order.id}</p>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Заказ успешно сформирован! Нажмите зеленую кнопку ниже, чтобы переслать состав заказа напрямую в наш{' '}
          <span className="font-semibold text-green-600">WhatsApp (+7 928 714-48-16)</span> для быстрой сборки и доставки.
        </p>

        {/* Order summary */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
          <p className="font-semibold text-gray-700 mb-3">Состав заказа:</p>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
              <span className="text-gray-600 flex-1">{item.product.name} × {item.quantity}</span>
              <span className="font-medium text-gray-800">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base mt-3 pt-2">
            <span>Итого</span>
            <span className="text-pink-600">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-green-200 transition-all hover:scale-[1.02] active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            Отправить заказ в WhatsApp (+7 928 714-48-16)
          </a>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            Вернуться в магазин
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Среднее время ответа: 15–30 минут в рабочее время
        </p>
      </div>
    </div>
  )
}
