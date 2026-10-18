'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, RefreshCw, Send, ShieldCheck, QrCode } from 'lucide-react'

export default function AdminWhatsAppPage() {
  const [status, setStatus] = useState<{
    authorized?: boolean
    stateInstance?: string
    staffPhone?: string
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrKey, setQrKey] = useState(Date.now())
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status', { cache: 'no-store' })
      const data = await res.json()
      setStatus(data)
    } catch (err: any) {
      setStatus({ authorized: false, error: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(() => {
      checkStatus()
      setQrKey(Date.now())
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleTestSend = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/whatsapp/test-send', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setTestResult('✅ Тестовый заказ успешно доставлен сотруднику в WhatsApp!')
      } else {
        setTestResult(`❌ Ошибка: ${data.error || 'Не удалось отправить'}`)
      }
    } catch (e: any) {
      setTestResult(`❌ Ошибка: ${e.message}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#f1f3f5] p-6 font-sans flex flex-col items-center justify-center">
      <div className="max-w-lg w-full bg-[#181b20] border border-[#2a2e36] p-8 rounded-none shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2a2e36] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h1 className="text-sm font-bold uppercase tracking-wider">Sabina Shop &middot; WhatsApp</h1>
          </div>
          <Link
            href="/"
            className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> В магазин
          </Link>
        </div>

        {/* Status Banner */}
        <div className="mb-6">
          {loading ? (
            <div className="p-4 bg-[#20242c] border border-[#2e333d] text-center text-xs font-mono text-neutral-400">
              Проверка состояния инстанса Green API...
            </div>
          ) : status?.authorized ? (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide">WhatsApp подключен и активен</p>
                <p className="text-[11px] font-mono text-emerald-400/80">
                  Уведомления о заказах приходят на: +{status.staffPhone || '79287144816'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-950/40 border border-amber-500/50 text-amber-300 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-amber-400 flex-shrink-0 animate-spin" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide">Требуется привязка WhatsApp</p>
                <p className="text-[11px] font-mono text-amber-400/80">
                  Статус: {status?.stateInstance || 'notAuthorized'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Section (if not authorized) */}
        {!status?.authorized && (
          <div className="text-center mb-6">
            <p className="text-xs text-neutral-400 mb-4">
              Наведите камеру WhatsApp на этот QR-код для привязки:
            </p>
            <div className="inline-block bg-white p-4 border border-neutral-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/whatsapp/qr?t=${qrKey}`}
                alt="WhatsApp QR Code"
                className="w-64 h-64 mx-auto block object-contain"
              />
            </div>
            <div className="mt-3 flex justify-center items-center gap-2 text-[11px] font-mono text-neutral-500">
              <RefreshCw className="w-3 h-3" />
              <span>QR-код автоматически обновляется каждые 15 секунд</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-[#20242c] border border-[#2e333d] p-4 text-xs text-neutral-300 space-y-2 mb-6">
          <p className="font-bold text-[11px] font-mono uppercase text-neutral-400">Как привязать:</p>
          <ol className="list-decimal pl-4 space-y-1 text-[11px] font-mono leading-relaxed">
            <li>Откройте приложение <b>WhatsApp</b> на телефоне кассира.</li>
            <li>
              Нажмите <b>Настройки &rarr; Связанные устройства</b>.
            </li>
            <li>
              Нажмите <b>«Привязка устройства»</b> и наведите камеру на QR-код выше.
            </li>
          </ol>
        </div>

        {/* Test Send Button */}
        <button
          onClick={handleTestSend}
          disabled={testing || !status?.authorized}
          className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-500 text-neutral-950 py-3.5 rounded-none font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 active:translate-y-px"
        >
          {testing ? (
            <span className="font-mono">ОТПРАВКА ТЕСТА...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Отправить тестовый заказ в WhatsApp</span>
            </>
          )}
        </button>

        {testResult && (
          <div
            className={`mt-4 p-3 text-xs font-mono border ${
              testResult.startsWith('✅')
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/40 border-red-500/50 text-red-300'
            }`}
          >
            {testResult}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#2a2e36] flex items-center justify-between text-[10px] font-mono uppercase text-neutral-500">
          <span>SABINA SHOP &middot; GREEN API</span>
          <span>INSTANCE: 710722771979</span>
        </div>
      </div>
    </div>
  )
}
