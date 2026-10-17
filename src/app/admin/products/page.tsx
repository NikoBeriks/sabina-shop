'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import ProductForm from '@/components/admin/ProductForm'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  stock: number
  barcode: string | null
  isActive: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      // Admin can see all products including inactive - add special query
      const res = await fetch(`/api/products?${params}&limit=100`)
      const data = await res.json()
      setProducts(data.products || [])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(fetchProducts, 400)
    return () => clearTimeout(t)
  }, [fetchProducts])

  const handleDelete = async (id: number) => {
    if (!confirm('Скрыть товар из каталога?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditProduct(null)
    fetchProducts()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Товары ({products.length})</h1>
        <button
          onClick={() => { setEditProduct(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить товар
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-sm"
        />
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onSaved={handleSaved}
          onClose={() => { setShowForm(false); setEditProduct(null) }}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Загрузка...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-3 opacity-20" />
            <p>Товары не найдены</p>
          </div>
        ) : (
          <div className="divide-y">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                {/* Image */}
                <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    {product.barcode && (
                      <span className="text-xs text-gray-400">📦 {product.barcode}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} шт.` : 'Нет'}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <p className="font-bold text-gray-800 text-sm flex-shrink-0">{formatPrice(product.price)}</p>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditProduct(product); setShowForm(true) }}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
