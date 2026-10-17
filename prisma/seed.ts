import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Создаём категории
  await prisma.category.createMany({
    data: [
      { name: 'Одежда', slug: 'odezhda' },
      { name: 'Обувь', slug: 'obuv' },
      { name: 'Аксессуары', slug: 'aksessuary' },
      { name: 'Косметика', slug: 'kosmetika' },
      { name: 'Сумки', slug: 'sumki' },
    ],
  })

  // Создаём тестовые товары
  const products = [
    {
      name: 'Платье летнее "Бриз"',
      description: 'Лёгкое летнее платье из натуральной ткани. Доступно в нескольких цветах.',
      price: 3500,
      category: 'Одежда',
      stock: 15,
      barcode: '4607001234561',
    },
    {
      name: 'Джинсы "Классика"',
      description: 'Классические джинсы прямого кроя, высококачественный деним.',
      price: 4200,
      category: 'Одежда',
      stock: 20,
      barcode: '4607001234562',
    },
    {
      name: 'Блуза шёлковая',
      description: 'Элегантная блуза из натурального шёлка для особых случаев.',
      price: 2800,
      category: 'Одежда',
      stock: 10,
      barcode: '4607001234563',
    },
    {
      name: 'Сандалии "Comfort"',
      description: 'Удобные сандалии на анатомической подошве. Идеальны для долгих прогулок.',
      price: 2200,
      category: 'Обувь',
      stock: 8,
      barcode: '4607001234564',
    },
    {
      name: 'Кроссовки белые',
      description: 'Классические белые кроссовки. Подходят к любому образу.',
      price: 5500,
      category: 'Обувь',
      stock: 12,
      barcode: '4607001234565',
    },
    {
      name: 'Сумка-шоппер',
      description: 'Вместительная сумка из экокожи. Удобна для покупок и прогулок.',
      price: 1800,
      category: 'Сумки',
      stock: 25,
      barcode: '4607001234566',
    },
    {
      name: 'Клатч вечерний',
      description: 'Изящный клатч для вечерних мероприятий с цепочкой.',
      price: 2400,
      category: 'Сумки',
      stock: 7,
      barcode: '4607001234567',
    },
    {
      name: 'Серьги "Звёздочки"',
      description: 'Лёгкие золотистые серьги в форме звёздочек.',
      price: 850,
      category: 'Аксессуары',
      stock: 30,
      barcode: '4607001234568',
    },
    {
      name: 'Браслет бижутерия',
      description: 'Тонкий браслет с подвесками. Стильное дополнение к образу.',
      price: 650,
      category: 'Аксессуары',
      stock: 40,
      barcode: '4607001234569',
    },
    {
      name: 'Помада матовая "Роза"',
      description: 'Стойкая матовая помада. Не требует подводки.',
      price: 480,
      category: 'Косметика',
      stock: 50,
      barcode: '4607001234570',
    },
    {
      name: 'Тональный крем SPF30',
      description: 'Лёгкий тональный крем с защитой от солнца. Оттенки: натуральный, бежевый.',
      price: 920,
      category: 'Косметика',
      stock: 35,
      barcode: '4607001234571',
    },
    {
      name: 'Парфюм "Нежность"',
      description: 'Женственный аромат с нотами розы и ванили. Стойкость 8 часов.',
      price: 3200,
      category: 'Косметика',
      stock: 18,
      barcode: '4607001234572',
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: product,
    })
  }

  console.log('✅ База данных заполнена тестовыми данными')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
