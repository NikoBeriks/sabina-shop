import { prisma } from '@/lib/prisma'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatPrice, formatDate } from '@/lib/utils'
import { generateOrderNotificationText, generateWhatsAppUrl } from '@/lib/whatsapp'
import OrderStatusActions from '@/components/admin/OrderStatusActions'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const waPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '79287144816'

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Заказы ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
          Заказов пока нет
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const waText = generateOrderNotificationText({
              ...order,
              address: order.address ?? undefined,
              comment: order.comment ?? undefined,
            })
            const waUrl = generateWhatsAppUrl(order.phone, waText)

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-800">Заказ #{order.id}</h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        <span className="font-medium">{order.customerName}</span>
                        {' · '}
                        <a href={`tel:${order.phone}`} className="text-blue-600 hover:underline">
                          {order.phone}
                        </a>
                      </p>
                      {order.address && (
                        <p className="text-sm text-gray-500 mt-0.5">📍 {order.address}</p>
                      )}
                      {order.comment && (
                        <p className="text-sm text-gray-500 mt-0.5">💬 {order.comment}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl font-black text-pink-600">{formatPrice(order.total)}</p>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        📲 WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Товары</p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                          <span className="font-medium text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status update */}
                  <OrderStatusActions orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
