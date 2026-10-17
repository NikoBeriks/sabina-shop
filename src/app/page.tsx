'use client'

import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Search, Menu, X, MessageCircle } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import ProductCard from '@/components/shop/ProductCard'
import CategoryFilter from '@/components/shop/CategoryFilter'
import CartSidebar from '@/components/shop/CartSidebar'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  stock: number
  barcode: string | null
}

const CATEGORIES = ['Все', 'Фрукты и овощи', 'Молочные продукты', 'Мясо и рыба', 'Хлеб и выпечка', 'Напитки', 'Бакалея', 'Заморозка', 'Кондитерские']

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((state) => state.totalItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'Все') params.set('category', selectedCategory)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, debouncedSearch])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-pink-600">Sabina</span>
            <span className="text-2xl font-light text-gray-600">Shop</span>
          </Link>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/chat"
              className="flex items-center gap-1 text-gray-600 hover:text-pink-600 px-3 py-2 rounded-lg hover:bg-pink-50 transition-colors text-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Поддержка</span>
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1 bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 transition-colors text-sm font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Корзина</span>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white py-10 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">🛒 Sabina Shop</h1>
        <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto mb-5">
          Свежие продукты питания, овощи, фрукты, молочка, напитки и товары для дома с быстрой доставкой
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm font-medium">
          <span className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            🥦 Только свежие продукты
          </span>
          <span className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            ⚡ Доставка от 30 минут
          </span>
          <span className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            📲 Подтверждение в WhatsApp
          </span>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Filter */}
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="bg-gray-200 h-48"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">Товары не найдены</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('Все') }}
              className="mt-4 text-pink-600 hover:underline"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-8 mt-12">
        <p className="text-sm">© 2024 Sabina Shop. Все права защищены.</p>
        <p className="text-xs mt-1">🚚 Доставка по городу · 💳 Оплата при получении · 🌿 Свежие продукты</p>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
