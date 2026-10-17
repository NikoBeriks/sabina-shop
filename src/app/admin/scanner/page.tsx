'use client'

import { useState } from 'react'
import { ScanLine, Search, CheckCircle, AlertCircle, Package } from 'lucide-react'
import dynamic from 'next/dynamic'
import ProductForm from '@/components/admin/ProductForm'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

const BarcodeScanner = dynamic(() => import('@/components/admin/BarcodeScanner'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white">
      Запуск камеры...
    </div>
  ),
})

interface BarcodeResult {
  found: boolean
  product?: {
    id: number
    name: string
    price: number
    category: string
    imageUrl: string | null
    stock: number
    barcode: string
  }
  suggestion?: {
    name: string
    description: string
    imageUrl: string | null
    barcode: string
  }
}

export default function AdminScannerPage() {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [result, setResult] = useState<BarcodeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [prefillProduct, setPrefillProduct] = useState<{
    name: string
    description: string | null
    price: number
    category: string
    imageUrl: string | null
    stock: number
    barcode: string | null
  } | null>(null)

  const lookupBarcode = async (barcode: string) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/barcode?barcode=${encodeURIComponent(barcode)}`)
      const data = await res.json()
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  const handleScan = (barcode: string) => {
    setScannerOpen(false)
    setManualBarcode(barcode)
    lookupBarcode(barcode)
  }

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) lookupBarcode(manualBarcode.trim())
  }

  const openFormWithSuggestion = () => {
    if (!result?.suggestion) return
    setPrefillProduct({
      name: result.suggestion.name,
      description: result.suggestion.description || null,
      price: 0,
      category: 'Без категории',
      imageUrl: result.suggestion.imageUrl,
      stock: 0,
      barcode: result.suggestion.barcode,
    })
    setShowProductForm(true)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Сканер штрихкодов</h1>

      {/* Scan button */}
      <button
        onClick={() => setScannerOpen(true)}
        className="w-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-pink-600 to-purple-700 text-white py-12 rounded-3xl hover:opacity-90 transition-opacity shadow-lg"
      >
        <ScanLine className="w-16 h-16" />
        <span className="text-xl font-bold">Нажмите для сканирования</span>
        <span className="text-pink-200 text-sm">Штрихкод / QR-код</span>
      </button>

      {/* Manual input */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-gray-700 mb-3">Или введите вручную</h2>
        <form onSubmit={handleManualSearch} className="flex gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Введите штрихкод..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 font-mono text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Найти
          </button>
        </form>

        {/* Quick test sample barcodes */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 font-medium">💡 Быстрая проверка популярных продуктов:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '🥛 Молоко', code: '4607001234001' },
              { label: '🍫 Шоколад', code: '4607001234015' },
              { label: '🍝 Спагетти', code: '8076809513753' },
              { label: '🥤 Coca-Cola', code: '5449000000996' },
              { label: '🌰 Nutella', code: '8000500179864' },
            ].map((sample) => (
              <button
                key={sample.code}
                type="button"
                onClick={() => {
                  setManualBarcode(sample.code)
                  lookupBarcode(sample.code)
                }}
                className="text-xs bg-gray-100 hover:bg-pink-50 hover:text-pink-600 px-2.5 py-1 rounded-lg text-gray-700 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 animate-pulse">
          🔍 Поиск товара...
        </div>
      )}

      {result && !loading && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {result.found && result.product ? (
            /* Found in DB */
            <div className="p-6">
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">Товар найден в каталоге</span>
              </div>

              <div className="flex gap-4 items-start">
                {result.product.imageUrl && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={result.product.imageUrl} alt={result.product.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">{result.product.name}</p>
                  <p className="text-sm text-gray-500">{result.product.category}</p>
                  <p className="text-pink-600 font-bold text-xl mt-1">{formatPrice(result.product.price)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    В наличии: {result.product.stock > 0 ? `${result.product.stock} шт.` : '❌ Нет'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setPrefillProduct({
                    ...result.product!,
                    description: null,
                  })
                  setShowProductForm(true)
                }}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
              >
                ✏️ Редактировать товар
              </button>
            </div>
          ) : (
            /* Not found */
            <div className="p-6">
              <div className="flex items-center gap-2 text-orange-500 mb-4">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold">Товар не найден в вашем каталоге</span>
              </div>

              <p className="text-gray-500 text-sm mb-2">
                Штрихкод: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">{manualBarcode}</code>
              </p>

              {result.suggestion?.name && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-blue-700 mb-1">💡 Найдено в открытой базе:</p>
                  <div className="flex gap-3 items-center">
                    {result.suggestion.imageUrl && (
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={result.suggestion.imageUrl} alt={result.suggestion.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{result.suggestion.name}</p>
                      {result.suggestion.description && (
                        <p className="text-xs text-gray-500">{result.suggestion.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={openFormWithSuggestion}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                Добавить в каталог
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scanner modal */}
      {scannerOpen && (
        <BarcodeScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
      )}

      {/* Product form modal */}
      {showProductForm && (
        <ProductForm
          product={prefillProduct as Parameters<typeof ProductForm>[0]['product']}
          onSaved={() => { setShowProductForm(false); setPrefillProduct(null) }}
          onClose={() => { setShowProductForm(false); setPrefillProduct(null) }}
        />
      )}
    </div>
  )
}
