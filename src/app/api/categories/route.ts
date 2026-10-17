import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true },
    })

    return NextResponse.json(
      categories.map((c) => ({ name: c.category, count: c._count.category }))
    )
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ error: 'Ошибка загрузки категорий' }, { status: 500 })
  }
}
