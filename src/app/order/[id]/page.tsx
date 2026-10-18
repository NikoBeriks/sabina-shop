import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateCustomerToOwnerWhatsAppText, generateWhatsAppUrl } from '@/lib/whatsapp'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react'

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
  const waQuestionUrl = generateWhatsAppUrl(waPhone, `Здравствуйте! У меня вопрос по заказу #${order.id}`)

  return (
    <div className="min-h-screen bg-[#fcfcfb] flex items-center justify-center p-4 font-sans text-neutral-900">
      <div className="bg-white rounded-none border border-neutral-300 max-w-md w-full p-6 sm:p-8 text-center">
        {/* Success Icon */}
        <div className="w-14 h-14 bg-neutral-950 text-white rounded-none flex items-center justify-center mx-auto mb-5 border border-neutral-950">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-950 mb-1">
          Заказ сформирован
        </h1>
        <div className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 px-3 py-1 rounded-none text-xs font-mono uppercase tracking-widest mb-4 border border-neutral-300">
          <span>ЗАКАЗ №{order.id} &middot; ПЕРЕДАН В СБОРКУ</span>
        </div>

        <p className="text-neutral-600 text-xs sm:text-sm mb-6 leading-relaxed font-sans">
          Заказ успешно зарегистрирован и уже передан сотруднику магазина на кассу для сборки. Мы свяжемся с вами по указанному телефону при передаче заказа курьеру.
        </p>

        {/* Order Items Breakdown */}
        <div className="bg-neutral-50 rounded-none p-4 mb-6 text-left border border-neutral-200">
          <p className="font-bold text-[11px] uppercase tracking-wider text-neutral-500 mb-2 font-mono">Состав заказа:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs py-1 border-b border-neutral-200 last:border-0">
                <span className="text-neutral-800 flex-1 line-clamp-1 uppercase text-[11px] font-semibold">
                  {item.product.name} <span className="text-neutral-400 font-mono font-normal">&times; {item.quantity}</span>
                </span>
                <span className="font-bold text-neutral-950 font-mono ml-2">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center font-bold text-sm mt-3 pt-3 border-t border-neutral-300 uppercase tracking-tight">
            <span>Итого к оплате</span>
            <span className="text-base font-mono font-black text-neutral-950">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-neutral-950 hover:bg-neutral-800 text-white py-3.5 rounded-none font-bold text-xs uppercase tracking-wider transition-colors border border-neutral-950 active:translate-y-px"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться в каталог товаров</span>
          </Link>

          <a
            href={waQuestionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-white hover:bg-neutral-100 text-neutral-800 py-3 rounded-none font-mono font-semibold text-xs uppercase tracking-wider border border-neutral-300 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-neutral-600" />
            <span>Задать вопрос в WhatsApp</span>
          </a>
        </div>

        <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mt-4">
          ДОСТАВКА ОТ 30 МИНУТ &middot; МАГАЗИН ХАВПАЧЕВЫХ
        </p>
      </div>
    </div>
  )
}

