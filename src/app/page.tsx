'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ShoppingCart } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import CategoryFilter from '@/components/shop/CategoryFilter'
import CartSidebar from '@/components/shop/CartSidebar'
import Header from '@/components/shop/Header'
import HeroBanner from '@/components/shop/HeroBanner'

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
  const catalogRef = useRef<HTMLDivElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350)
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

  const scrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Sticky Glassmorphism Header */}
      <Header
        search={search}
        onSearchChange={setSearch}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Fresh Hero Banner */}
      <HeroBanner onScrollToCatalog={scrollToCatalog} />

      {/* Catalog anchor */}
      <div ref={catalogRef} id="catalog" />

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
