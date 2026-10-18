import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramOrderNotification } from '@/lib/telegram'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'Ошибка загрузки заказов' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, phone, address, comment, items } = body

    if (!customerName || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Необходимо указать имя, телефон и товары' },
        { status: 400 }
      )
    }

    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        customerName,
        phone,
        address: address || null,
        comment: comment || null,
        total,
        status: 'NEW',
        items: {
          create: items.map((item: { productId: number; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    const ownerPhone = process.env.OWNER_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '79287144816'
    console.log(`\n📢 [НОВЫЙ ЗАКАЗ #${order.id}] Покупатель: ${order.customerName} (${order.phone}), Сумма: ${order.total} ₽`)
    console.log(`📲 Ссылка WhatsApp владельцу (${ownerPhone}): https://wa.me/${ownerPhone}\n`)

    // Автоматическая отправка заказа в Telegram владельцу
    await sendTelegramOrderNotification(order).catch((err) =>
      console.error('Ошибка отправки в Telegram:', err)
    )

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({ error: 'Ошибка создания заказа' }, { status: 500 })
  }
}
