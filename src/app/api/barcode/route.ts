import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barcode = searchParams.get('barcode')

    if (!barcode) {
      return NextResponse.json({ error: 'Штрихкод обязателен' }, { status: 400 })
    }

    // Ищем в БД
    const product = await prisma.product.findUnique({
      where: { barcode },
    })

    if (product) {
      return NextResponse.json({ found: true, product })
    }

    // Запрашиваем Open Food Facts (для продуктов питания)
    const offResponse = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    )
    const offData = await offResponse.json()

    if (offData.status === 1 && offData.product) {
      const p = offData.product
      return NextResponse.json({
        found: false,
        suggestion: {
          name: p.product_name_ru || p.product_name || p.abbreviated_product_name || '',
          description: p.categories || '',
          imageUrl: p.image_url || null,
          barcode,
        },
      })
    }

    // Не найден нигде
    return NextResponse.json({
      found: false,
      suggestion: { barcode, name: '', description: '', imageUrl: null },
    })
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return NextResponse.json({ error: 'Ошибка поиска по штрихкоду' }, { status: 500 })
  }
}
