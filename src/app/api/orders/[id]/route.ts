import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: { product: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order GET error:', error)
    return NextResponse.json({ error: 'Ошибка загрузки заказа' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order PATCH error:', error)
    return NextResponse.json({ error: 'Ошибка обновления заказа' }, { status: 500 })
  }
}
