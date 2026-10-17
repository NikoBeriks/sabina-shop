import Link from 'next/link'
import { Package, ShoppingCart, ScanLine, MessageCircle, LayoutDashboard, Store } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingCart },
  { href: '/admin/products', label: 'Товары', icon: Package },
  { href: '/admin/scanner', label: 'Сканер', icon: ScanLine },
  { href: '/admin/chat', label: 'Чат', icon: MessageCircle },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2 group">
            <Store className="w-6 h-6 text-pink-400" />
            <div>
              <p className="font-bold text-white">Sabina Shop</p>
              <p className="text-xs text-gray-400">Админ-панель</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-colors group"
              >
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            Перейти в магазин ↗
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white z-50 flex justify-around items-center py-2 px-4 border-t border-gray-700">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-400 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  )
}
