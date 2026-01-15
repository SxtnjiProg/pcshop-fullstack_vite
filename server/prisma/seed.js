const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Починаємо засівання бази даних...');

  // Очищаємо базу перед наповненням
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  // Якщо є замовлення, їх теж треба було б чистити, але поки пропустимо, щоб не ускладнювати

  // 1. Створюємо Категорії
  const catsData = [
    { name: 'Процесори', slug: 'cpu' },
    { name: 'Відеокарти', slug: 'gpu' },
    { name: 'Материнські плати', slug: 'motherboard' },
    { name: 'Оперативна пам\'ять', slug: 'ram' },
    { name: 'Накопичувачі', slug: 'storage' },
    { name: 'Блоки живлення', slug: 'psu' },
    { name: 'Корпуси', slug: 'case' },
    { name: 'Монітори', slug: 'monitor' }
  ];

  const categories = {};
  for (const c of catsData) {
    categories[c.slug] = await prisma.category.create({
      data: { name: c.name, slug: c.slug }
    });
  }

  // 2. Додаємо Товари

  // CPU
  await prisma.product.create({
    data: {
      title: 'Intel Core i9-14900K', slug: 'intel-i9-14900k', price: 26999,
      imageUrl: 'https://content.rozetka.com.ua/goods/images/big/376785642.jpg',
      categoryId: categories['cpu'].id,
      specifications: { "Виробник": "Intel", "Серія": "Core i9", "Socket": "LGA1700", "Кількість ядер": "24" }
    }
  });
  await prisma.product.create({
    data: {
      title: 'AMD Ryzen 7 7800X3D', slug: 'amd-ryzen-7', price: 18500,
      imageUrl: 'https://content.rozetka.com.ua/goods/images/big/325785084.jpg',
      categoryId: categories['cpu'].id,
      specifications: { "Виробник": "AMD", "Серія": "Ryzen 7", "Socket": "AM5", "Кількість ядер": "8" }
    }
  });

  // GPU
  await prisma.product.create({
    data: {
      title: 'Asus GeForce RTX 4090 TUF', slug: 'rtx-4090', price: 95000,
      imageUrl: 'https://content.rozetka.com.ua/goods/images/big/292671350.jpg',
      categoryId: categories['gpu'].id,
      specifications: { "Чіп": "NVIDIA", "Модель": "RTX 4090", "Пам'ять": "24 ГБ", "Тип пам'яті": "GDDR6X" }
    }
  });

  // RAM
  await prisma.product.create({
    data: {
      title: 'Kingston Fury Beast 32GB', slug: 'kingston-32gb', price: 5400,
      imageUrl: 'https://content.rozetka.com.ua/goods/images/big/263595562.jpg',
      categoryId: categories['ram'].id,
      specifications: { "Тип": "DDR5", "Обсяг": "32 ГБ", "Частота": "6000 МГц" }
    }
  });

  // SSD
  await prisma.product.create({
    data: {
      title: 'Samsung 990 PRO 1TB', slug: 'samsung-990-pro', price: 4500,
      imageUrl: 'https://content.rozetka.com.ua/goods/images/big/296792604.jpg',
      categoryId: categories['storage'].id,
      specifications: { "Тип": "SSD", "Форм-фактор": "M.2", "Об'єм": "1 ТБ", "Інтерфейс": "PCI-E 4.0" }
    }
  });

  // PSU
  await prisma.product.create({
    data: {
      title: 'Be Quiet! Pure Power 12 M 850W', slug: 'be-quiet-850w', price: 6200,
      imageUrl: 'https://content.rozetka.com.ua/goods/images/big/317371900.jpg',
      categoryId: categories['psu'].id,
      specifications: { "Потужність": "850 Вт", "Сертифікат": "Gold 80+", "Модульний": "Так" }
    }
  });

  // Case
  await prisma.product.create({
    data: {
      title: 'NZXT H5 Flow', slug: 'nzxt-h5', price: 4100,
      imageUrl: 'https://content.rozetka.com.ua/goods/images/big/297241316.jpg',
      categoryId: categories['case'].id,
      specifications: { "Форм-фактор": "ATX", "Колір": "Чорний", "Матеріал": "Сталь/Скло" }
    }
  });

  console.log('✅ База даних успішно засіяна!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });