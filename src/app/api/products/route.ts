import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isActive: true }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.AND = [
        { isActive: true },
        {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        },
      ]
      delete where.isActive
      if (category && category !== 'all') {
        where.AND.push({ category })
        delete where.category
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, limit })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Ошибка загрузки товаров' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, category, imageUrl, stock, barcode } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'Название и цена обязательны' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        category: category || 'Без категории',
        imageUrl: imageUrl || null,
        stock: parseInt(stock) || 0,
        barcode: barcode || null,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json({ error: 'Ошибка создания товара' }, { status: 500 })
  }
}
