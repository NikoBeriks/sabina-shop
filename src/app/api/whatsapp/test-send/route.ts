import { NextResponse } from 'next/server'
import { sendWhatsAppOrderNotification } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export async function POST() {
  const sampleOrder = {
    id: 1042,
    customerName: 'Сабина (Тест)',
    phone: '79287144816',
    address: 'ул. Ленина, 10, кв. 5',
    comment: 'Тестовая проверка интеграции WhatsApp',
    deliveryFee: 100,
    total: 485,
    createdAt: new Date(),
    items: [
      { product: { name: 'Молоко 3,2%' }, quantity: 2, price: 90 },
      { product: { name: 'Хлеб белый' }, quantity: 1, price: 55 },
      { product: { name: 'Бананы' }, quantity: 1, price: 150 },
    ],
  }

  const result = await sendWhatsAppOrderNotification(sampleOrder)
  return NextResponse.json(result)
}
