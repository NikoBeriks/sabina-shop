import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    const messages = await prisma.chatMessage.findMany({
      where: orderId ? { orderId: parseInt(orderId) } : {},
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Chat GET error:', error)
    return NextResponse.json({ error: 'Ошибка загрузки сообщений' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, sender, text } = body

    if (!sender || !text) {
      return NextResponse.json({ error: 'Отправитель и текст обязательны' }, { status: 400 })
    }

    const message = await prisma.chatMessage.create({
      data: {
        orderId: orderId ? parseInt(orderId) : null,
        sender,
        text,
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Chat POST error:', error)
    return NextResponse.json({ error: 'Ошибка отправки сообщения' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, sender } = body

    await prisma.chatMessage.updateMany({
      where: {
        orderId: orderId ? parseInt(orderId) : null,
        sender: { not: sender },
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Chat PATCH error:', error)
    return NextResponse.json({ error: 'Ошибка обновления сообщений' }, { status: 500 })
  }
}
