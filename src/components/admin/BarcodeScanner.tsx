'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X } from 'lucide-react'

interface ScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: ScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const mountedRef = useRef(true)

  const startScanner = useCallback(async () => {
    try {
      setError(null)
      const scanner = new Html5Qrcode('barcode-scanner-container')
      scannerRef.current = scanner

      const cameras = await Html5Qrcode.getCameras()
      if (!cameras || cameras.length === 0) {
        setError('Камера не найдена. Убедитесь, что у браузера есть доступ к камере.')
        return
      }

      // Prefer back camera
      const camera = cameras.find((c) => c.label.toLowerCase().includes('back')) || cameras[cameras.length - 1]

      await scanner.start(
        camera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 200 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (mountedRef.current) {
            onScan(decodedText)
            stopScanner()
          }
        },
        () => {
          // QR code not yet found - ignore
        }
      )

      if (mountedRef.current) setScanning(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка запуска сканера'
      if (mountedRef.current) {
        setError(
          msg.includes('Permission') || msg.includes('NotAllowed')
            ? 'Доступ к камере запрещён. Разрешите использование камеры в настройках браузера.'
            : `Ошибка: ${msg}`
        )
      }
    }
  }, [onScan])

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      }
    } catch {
      // ignore stop errors
    }
    if (mountedRef.current) setScanning(false)
  }, [])

  useEffect(() => {
    startScanner()
    return () => {
      mountedRef.current = false
      stopScanner()
    }
  }, [startScanner, stopScanner])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 text-white">
        <h2 className="font-bold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Сканирование штрихкода
        </h2>
        <button
          onClick={() => { stopScanner(); onClose() }}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scanner area */}
      <div className="flex-1 relative flex items-center justify-center">
        <div id="barcode-scanner-container" className="w-full max-w-sm" />

        {/* Guide overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-64 h-48">
            {/* Corner borders */}
            {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4',
              'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((cls, i) => (
              <div key={i} className={`absolute w-8 h-8 border-pink-500 ${cls}`} />
            ))}
            {/* Scan line animation */}
            {scanning && (
              <div className="absolute left-0 right-0 h-0.5 bg-pink-500 animate-bounce" style={{ top: '50%' }} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-black/80 text-white px-4 py-4 text-center">
        {error ? (
          <div className="space-y-3">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={startScanner}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        ) : scanning ? (
          <p className="text-gray-300 text-sm">
            Наведите камеру на штрихкод или QR-код товара
          </p>
        ) : (
          <p className="text-gray-400 text-sm">Запуск камеры...</p>
        )}
      </div>
    </div>
  )
}
