'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ShoppingCart, ArrowUpDown, Sparkles, RotateCcw } from 'lucide-react'
import ProductCard, { Product } from '@/components/shop/ProductCard'
import CategoryFilter from '@/components/shop/CategoryFilter'
import CartSidebar from '@/components/shop/CartSidebar'
import Header from '@/components/shop/Header'
import HeroBanner from '@/components/shop/HeroBanner'
import ProductModal from '@/components/shop/ProductModal'

const CATEGORIES = [
  'Все',
  'Фрукты и овощи',
  'Молочные продукты',
  'Мясо и рыба',
  'Хлеб и выпечка',
  'Напитки',
  'Бакалея',
  'Заморозка',
  'Кондитерские',
]

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'name_asc'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [cartOpen, setCartOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const catalogRef = useRef<HTMLDivElement>(null)

  // Debounce search input
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

  // Sorted products
  const sortedProducts = useMemo(() => {
    const list = [...products]
    if (sortBy === 'price_asc') {
      return list.sort((a, b) => a.price - b.price)
    }
    if (sortBy === 'price_desc') {
      return list.sort((a, b) => b.price - a.price)
    }
    if (sortBy === 'name_asc') {
      return list.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    }
    return list
  }, [products, sortBy])

  const handleResetFilters = () => {
    setSearch('')
    setSelectedCategory('Все')
    setSortBy('popular')
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sticky Glassmorphism Header */}
      <Header
        search={search}
        onSearchChange={setSearch}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Fresh Hero Banner */}
      <HeroBanner onScrollToCatalog={scrollToCatalog} />

      {/* Catalog Anchor */}
      <div ref={catalogRef} id="catalog" className="scroll-mt-20" />

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Category Filter Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Каталог товаров</span>
            </h2>
            {!loading && (
              <span className="text-xs sm:text-sm font-semibold text-neutral-500 bg-neutral-200/60 px-3 py-1 rounded-full">
                {sortedProducts.length} позиций
              </span>
            )}
          </div>

          <CategoryFilter
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Toolbar: Category Title & Sort selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4 border-b border-neutral-200/60">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-800">
              {selectedCategory === 'Все' ? 'Все категории' : selectedCategory}
            </span>
            {(selectedCategory !== 'Все' || debouncedSearch) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сбросить</span>
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <ArrowUpDown className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-500 hidden sm:inline">Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-xs"
            >
              <option value="popular">По популярности</option>
              <option value="price_asc">Сначала недорогие</option>
              <option value="price_desc">Сначала премиум</option>
              <option value="name_asc">По алфавиту (А-Я)</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-xs border border-neutral-100 flex flex-col"
              >
                <div className="aspect-square w-full animate-shimmer" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded-md w-3/4 animate-pulse" />
                    <div className="h-3 bg-neutral-100 rounded-md w-1/2 animate-pulse" />
                  </div>
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <div className="h-5 bg-neutral-200 rounded-md w-1/3 animate-pulse" />
                    <div className="h-8 bg-neutral-200 rounded-2xl w-20 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-24 px-4 bg-white rounded-3xl border border-neutral-200/60 mt-6 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-1">Ничего не найдено</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Попробуйте изменить запрос или выберите другую категорию продуктов.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 shadow-emerald shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Показать все товары</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setModalProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 mt-16 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-neutral-800">
            <div>
              <span className="text-xl font-black text-white tracking-tight">
                Sabina <span className="text-emerald-400">Shop</span>
              </span>
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                Ваш домашний супермаркет. Свежие фрукты, овощи, мясо, молочные продукты и выпечка с бережной и быстрой доставкой.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Сервис</h4>
              <ul className="space-y-2 text-sm">
                <li>🚚 Экспресс-доставка от 30 минут</li>
                <li>💳 Оплата при получении или СБП / картой</li>
                <li>🥦 Гарантия свежести и контроль качества</li>
                <li>📱 Быстрый заказ в WhatsApp</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Контакты и заказ</h4>
              <p className="text-sm mb-3">Заказы принимаются ежедневно без выходных</p>
              <a
                href="https://wa.me/79287144816"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <span>Написать в WhatsApp</span>
              </a>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
            <p>© {new Date().getFullYear()} Sabina Shop. Все права защищены.</p>
            <p>С заботой о каждом покупателе 💚</p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Quick View Product Modal */}
      <ProductModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
      />
    </div>
  )
}
