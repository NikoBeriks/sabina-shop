import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateCustomerToOwnerWhatsAppText, generateWhatsAppUrl } from '@/lib/whatsapp'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle2, MessageCircle, Home, Sparkles } from 'lucide-react'

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
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans text-neutral-900">
      <div className="bg-white rounded-3xl shadow-soft-lg border border-neutral-200/70 max-w-md w-full p-6 sm:p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-emerald-100 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-scale-in" />
        </div>

        <h1 className="text-2xl font-black text-neutral-900 mb-1">Спасибо за заказ!</h1>
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-emerald-200/60">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Заказ №{order.id} оформлен</span>
        </div>

        <p className="text-neutral-600 text-xs sm:text-sm mb-6 leading-relaxed">
          Заказ успешно сформирован! Нажмите кнопку ниже, чтобы переслать состав заказа напрямую оператору в{' '}
          <strong className="text-emerald-700">WhatsApp</strong> для быстрой сборки и экспресс-доставки.
        </p>

        {/* Order Items Breakdown */}
        <div className="bg-neutral-50 rounded-2xl p-4 mb-6 text-left border border-neutral-100">
          <p className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-2">Состав заказа:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs py-1 border-b border-neutral-200/50 last:border-0">
                <span className="text-neutral-700 flex-1 line-clamp-1">
                  {item.product.name} <span className="text-neutral-400">× {item.quantity}</span>
                </span>
                <span className="font-bold text-neutral-900 font-mono ml-2">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center font-black text-sm mt-3 pt-3 border-t border-neutral-200/80">
            <span>Итого к оплате</span>
            <span className="text-base text-emerald-700">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-emerald shadow-md transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Перейти в WhatsApp для подтверждения</span>
          </a>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-2xl font-bold text-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Вернуться на главную</span>
          </Link>
        </div>

        <p className="text-[11px] text-neutral-400 mt-4">
          ⏱️ Доставка от 30 минут · Sabina Shop на связи
        </p>
      </div>
    </div>
  )
}
