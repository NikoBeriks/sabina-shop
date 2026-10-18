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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full">
        {/* Category Filter Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4 pb-3 border-b border-neutral-300">
            <div>
              <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest block mb-1">
                КАТАЛОГ &middot; АССОРТИМЕНТ
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 uppercase tracking-tight">
                Каталог продуктов
              </h2>
            </div>
            {!loading && (
              <span className="font-mono text-xs text-neutral-700 bg-neutral-100 border border-neutral-300 px-2.5 py-1 rounded-none self-start sm:self-auto uppercase tracking-wider">
                ПОЗИЦИЙ: {sortedProducts.length}
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
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-neutral-950 uppercase tracking-wider font-mono">
              {selectedCategory === 'Все' ? 'ВСЕ КАТЕГОРИИ' : selectedCategory.toUpperCase()}
            </span>
            {(selectedCategory !== 'Все' || debouncedSearch) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-800 hover:text-neutral-950 font-mono uppercase bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 px-2.5 py-1 rounded-none transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сбросить</span>
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-500 font-mono uppercase hidden sm:inline">Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-neutral-300 rounded-none px-3 py-1.5 text-xs font-mono uppercase text-neutral-900 focus:outline-none focus:border-neutral-950 cursor-pointer"
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
                className="bg-white rounded-none border border-neutral-200 flex flex-col"
              >
                <div className="aspect-square w-full animate-shimmer" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 w-3/4 animate-pulse" />
                    <div className="h-3 bg-neutral-100 w-1/2 animate-pulse" />
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                    <div className="h-5 bg-neutral-200 w-1/3 animate-pulse" />
                    <div className="h-8 bg-neutral-200 w-20 animate-pulse rounded-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-none border border-neutral-300 mt-6 max-w-lg mx-auto">
            <div className="w-14 h-14 border border-neutral-300 bg-neutral-50 text-neutral-400 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-6 h-6 opacity-50" />
            </div>
            <h3 className="text-base font-bold text-neutral-950 uppercase tracking-tight mb-1">
              Позиции не найдены
            </h3>
            <p className="text-xs text-neutral-500 mb-6 font-sans">
              Попробуйте изменить поисковый запрос или выбрать другую категорию в каталоге.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white px-6 py-2.5 rounded-none font-bold text-xs uppercase tracking-wider transition-colors border border-neutral-950"
            >
              <RotateCcw className="w-3.5 h-3.5" />
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

      {/* Footer - Strict Editorial Style */}
      <footer className="bg-[#0b1610] text-neutral-400 py-12 mt-16 border-t border-[#1b3829]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-white text-neutral-950 flex items-center justify-center font-bold text-xs font-mono">
                  МХ
                </div>
                <span className="text-lg font-bold text-white uppercase tracking-tight font-sans">
                  Магазин <span className="text-neutral-400 font-light">Хавпачевых</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-sm">
                Городской супермаркет и гастрономическая лавка. Свежие овощи, фермерское мясо, молочные продукты и выпечка с экспресс-доставкой.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-neutral-200 uppercase tracking-widest mb-3">
                УСЛОВИЯ СЕРВИСА
              </h4>
              <ul className="space-y-2 text-xs font-mono uppercase text-neutral-400">
                <li>&bull; Экспресс-доставка от 30 минут</li>
                <li>&bull; Оплата при получении, СБП, картой</li>
                <li>&bull; Ежедневный входящий контроль свежести</li>
                <li>&bull; Бесплатная доставка от 1 500 ₽</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-neutral-200 uppercase tracking-widest mb-3">
                КОНТАКТЫ И ЗАКАЗ
              </h4>
              <p className="text-xs text-neutral-400 mb-3 font-sans">
                Приём заказов ежедневно. Обработка и выезд курьера без выходных.
              </p>
              <a
                href="https://wa.me/79287144816"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-transparent hover:bg-white text-white hover:text-neutral-950 border border-white/30 hover:border-white px-4 py-2.5 rounded-none text-xs font-mono uppercase tracking-wider transition-colors"
              >
                <span>Написать в WhatsApp &rarr;</span>
              </a>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono uppercase text-neutral-500 gap-4">
            <p>&copy; {new Date().getFullYear()} МАГАЗИН ХАВПАЧЕВЫХ. ВСЕ ПРАВА ЗАЩИЩЕНЫ.</p>
            <p>ГАСТРОНОМИЯ &middot; СУПЕРМАРКЕТ &middot; СЕРВИС ДОСТАВКИ</p>
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
