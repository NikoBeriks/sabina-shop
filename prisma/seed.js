const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Очистка старых данных...')
  // Удаляем старые тестовые товары и категории
  await prisma.orderItem.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // 1. Создаем продуктовые категории
  const categories = [
    { name: 'Фрукты и овощи', slug: 'frukty-i-ovoshchi' },
    { name: 'Молочные продукты', slug: 'molochnye-produkty' },
    { name: 'Мясо и рыба', slug: 'myaso-i-ryba' },
    { name: 'Хлеб и выпечка', slug: 'khleb-i-vypechka' },
    { name: 'Напитки', slug: 'napitki' },
    { name: 'Бакалея', slug: 'bakaleya' },
    { name: 'Заморозка', slug: 'zamorozka' },
    { name: 'Кондитерские', slug: 'konditerskie' },
    { name: 'Готовая еда', slug: 'gotovaya-eda' },
    { name: 'Бытовая химия', slug: 'bytovaya-khimiya' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  // 2. Создаем продуктовые товары
  const products = [
    // Молочные продукты
    {
      name: 'Молоко «Домик в деревне» 3.2%, 950 мл',
      description: 'Свежее пастеризованное коровье молоко высшего сорта. Натуральный вкус, без консервантов.',
      price: 620,
      category: 'Молочные продукты',
      stock: 40,
      barcode: '4607001234001',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop',
    },
    {
      name: 'Творог классический «Простоквашино» 5%, 200 г',
      description: 'Нежный рассыпчатый творог из натурального молока. Идеален для завтрака и сырников.',
      price: 580,
      category: 'Молочные продукты',
      stock: 35,
      barcode: '4607001234002',
      imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop',
    },
    {
      name: 'Сыр «Голландский» полутвердый 45%, 250 г',
      description: 'Ароматный сыр с нежным сливочным вкусом. Отлично плавится и подходит для бутербродов.',
      price: 1450,
      category: 'Молочные продукты',
      stock: 25,
      barcode: '4607001234003',
      imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop',
    },
    {
      name: 'Масло сливочное «Крестьянское» 82.5%, 180 г',
      description: 'Натуральное сладко-сливочное масло из отборных свежих сливок.',
      price: 980,
      category: 'Молочные продукты',
      stock: 30,
      barcode: '4607001234004',
      imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop',
    },
    {
      name: 'Сметана «Президент» 20%, 300 г',
      description: 'Густая домашняя сметана без растительных жиров. Прекрасно к супам и салатам.',
      price: 690,
      category: 'Молочные продукты',
      stock: 28,
      barcode: '4607001234005',
      imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop',
    },

    // Фрукты и овощи
    {
      name: 'Бананы отборные Эквадор, 1 кг',
      description: 'Сладкие спелые бананы. Источник калия и натуральной энергии.',
      price: 950,
      category: 'Фрукты и овощи',
      stock: 50,
      barcode: '4607001234006',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop',
    },
    {
      name: 'Яблоки сладкие «Гала», 1 кг',
      description: 'Хрустящие, сочные яблоки со сладким медовым вкусом.',
      price: 820,
      category: 'Фрукты и овощи',
      stock: 45,
      barcode: '4607001234007',
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop',
    },
    {
      name: 'Томаты на ветке свежие, 500 г',
      description: 'Ароматные грунтовые помидоры с насыщенным вкусом лета.',
      price: 1100,
      category: 'Фрукты и овощи',
      stock: 30,
      barcode: '4607001234008',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop',
    },
    {
      name: 'Огурцы короткоплодные хрустящие, 500 г',
      description: 'Свежие сочные огурчики с пупырышками, выращенные без пестицидов.',
      price: 750,
      category: 'Фрукты и овощи',
      stock: 35,
      barcode: '4607001234009',
      imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop',
    },
    {
      name: 'Апельсины сладкие сочные, 1 кг',
      description: 'Богатые витамином C сочные цитрусы с тонкой кожурой.',
      price: 1200,
      category: 'Фрукты и овощи',
      stock: 40,
      barcode: '4607001234010',
      imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop',
    },

    // Хлеб и выпечка
    {
      name: 'Хлеб тостовый белый нарезка, 400 г',
      description: 'Мягкий пшеничный хлеб для тостов и сэндвичей, ровная нарезка.',
      price: 320,
      category: 'Хлеб и выпечка',
      stock: 30,
      barcode: '4607001234011',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
    },
    {
      name: 'Багет французский хрустящий, 250 г',
      description: 'Традиционный хрустящий багет с воздушным мякишем, выпекается ежедневно.',
      price: 350,
      category: 'Хлеб и выпечка',
      stock: 20,
      barcode: '4607001234012',
      imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop',
    },
    {
      name: 'Круассаны с шоколадом, 2 шт.',
      description: 'Французские круассаны из слоёного теста с начинкой из темного шоколада.',
      price: 650,
      category: 'Хлеб и выпечка',
      stock: 15,
      barcode: '4607001234013',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop',
    },

    // Мясо и рыба
    {
      name: 'Филе куриной грудки охлаждённое, 800 г',
      description: 'Свежее филе без кожи и костей. Диетическое мясо с высоким содержанием белка.',
      price: 2150,
      category: 'Мясо и рыба',
      stock: 20,
      barcode: '4607001234014',
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop',
    },
    {
      name: 'Фарш говяжий «Домашний», 500 г',
      description: 'Свежий охлажденный фарш из 100% отборной говядины без добавок.',
      price: 2400,
      category: 'Мясо и рыба',
      stock: 18,
      barcode: '4607001234015',
      imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&auto=format&fit=crop',
    },
    {
      name: 'Стейк лосося охлаждённый, 300 г',
      description: 'Нежный стейк атлантического лосося, богат омега-3 жирными кислотами.',
      price: 3900,
      category: 'Мясо и рыба',
      stock: 12,
      barcode: '4607001234016',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop',
    },

    // Бакалея
    {
      name: 'Спагетти Barilla Spaghetti n.5, 450 г',
      description: 'Итальянская паста из твердых сортов пшеницы. Не разваривается, идеальна al dente.',
      price: 890,
      category: 'Бакалея',
      stock: 60,
      barcode: '8076809513753',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?w=600&auto=format&fit=crop',
    },
    {
      name: 'Рис басмати отборный длиннозерный, 800 г',
      description: 'Рассыпчатый ароматный рис для плова и гарниров высшей категории.',
      price: 920,
      category: 'Бакалея',
      stock: 45,
      barcode: '4607001234018',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop',
    },
    {
      name: 'Масло подсолнечное рафинированное, 1 л',
      description: 'Чистое подсолнечное масло без запаха для жарки и заправки блюд.',
      price: 850,
      category: 'Бакалея',
      stock: 50,
      barcode: '4607001234019',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop',
    },
    {
      name: 'Чай черный листовой «Greenfield Golden Ceylon», 100 г',
      description: 'Благородный цейлонский чай с ярким ароматом и терпким насыщенным вкусом.',
      price: 790,
      category: 'Бакалея',
      stock: 40,
      barcode: '4607001234020',
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop',
    },

    // Напитки
    {
      name: 'Напиток Coca-Cola Classic, 0.5 л',
      description: 'Классический освежающий газированный напиток в удобной бутылочке.',
      price: 420,
      category: 'Напитки',
      stock: 70,
      barcode: '5449000000996',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop',
    },
    {
      name: 'Сок апельсиновый 100% прямого отжима, 1 л',
      description: 'Натуральный апельсиновый сок без добавления сахара и красителей.',
      price: 980,
      category: 'Напитки',
      stock: 35,
      barcode: '4607001234022',
      imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop',
    },
    {
      name: 'Вода питьевая «Tassay» природная негазированная, 1.5 л',
      description: 'Чистейшая природная вода из глубинного подземного источника.',
      price: 280,
      category: 'Напитки',
      stock: 80,
      barcode: '4607001234023',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop',
    },

    // Кондитерские
    {
      name: 'Шоколад молочный с цельным лесным фундуком, 90 г',
      description: 'Нежный альпийский молочный шоколад с отборными цельными лесными орехами.',
      price: 680,
      category: 'Кондитерские',
      stock: 55,
      barcode: '4607001234024',
      imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&auto=format&fit=crop',
    },
    {
      name: 'Печенье сэндвич Oreo с ванильным кремом, 154 г',
      description: 'Хрустящее шоколадное печенье с нежнейшей ванильной кремовой прослойкой.',
      price: 650,
      category: 'Кондитерские',
      stock: 45,
      barcode: '7622210286086',
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop',
    },

    // Заморозка
    {
      name: 'Пельмени отборные «Домашние» с говядиной, 800 г',
      description: 'Пельмени ручной лепки из натурального фарша говядины и тонкого теста.',
      price: 2300,
      category: 'Заморозка',
      stock: 25,
      barcode: '4607001234026',
      imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop',
    },
    {
      name: 'Мороженое пломбир ванильный в вафельном стаканчике, 100 г',
      description: 'Настоящий советский ГОСТ пломбир из свежего молока и сливочного масла.',
      price: 380,
      category: 'Заморозка',
      stock: 60,
      barcode: '4607001234027',
      imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop',
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }

  console.log(`✅ Продуктовая база данных успешно наполнена! Добавлено товаров: ${products.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
