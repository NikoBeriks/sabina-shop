import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Package, ShoppingCart, MessageCircle, ScanLine, TrendingUp } from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatPrice, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, newOrders, recentOrders, unreadMessages] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'NEW' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    }),
    prisma.chatMessage.count({ where: { isRead: false, sender: 'customer' } }),
  ])

  const stats = [
    { label: 'Товаров', value: totalProducts, icon: Package, color: 'bg-blue-100 text-blue-600', href: '/admin/products' },
    { label: 'Всего заказов', value: totalOrders, icon: ShoppingCart, color: 'bg-purple-100 text-purple-600', href: '/admin/orders' },
    { label: 'Новых заказов', value: newOrders, icon: TrendingUp, color: 'bg-pink-100 text-pink-600', href: '/admin/orders' },
    { label: 'Сообщений', value: unreadMessages, icon: MessageCircle, color: 'bg-green-100 text-green-600', href: '/admin/chat' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Дашборд</h1>
        <Link
          href="/admin/scanner"
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <ScanLine className="w-5 h-5" />
          Сканер штрихкодов
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-black text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Последние заказы</h2>
          <Link href="/admin/orders" className="text-pink-600 text-sm hover:underline">
            Все заказы →
          </Link>
        </div>
        <div className="divide-y">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-800">
                  #{order.id} — {order.customerName}
                </p>
                <p className="text-sm text-gray-500">{order.phone} · {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800">{formatPrice(order.total)}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
            </Link>
          ))}
          {recentOrders.length === 0 && (
            <p className="text-center text-gray-400 py-8">Заказов пока нет</p>
          )}
        </div>
      </div>
    </div>
  )
}
