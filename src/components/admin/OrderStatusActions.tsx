'use client'

import { useState } from 'react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const STATUSES = ['NEW', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function OrderStatusActions({
  orderId,
  currentStatus,
}: {
  orderId: number
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateStatus = async (newStatus: string) => {
    setLoading(true)
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const nextStatuses = STATUSES.filter((s) => s !== currentStatus)

  return (
    <div className="mt-4 pt-4 border-t flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500">Изменить статус:</span>
      {nextStatuses.map((s) => (
        <button
          key={s}
          disabled={loading}
          onClick={() => updateStatus(s)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-opacity hover:opacity-80 disabled:opacity-40 ${ORDER_STATUS_COLORS[s]}`}
        >
          → {ORDER_STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  )
}
