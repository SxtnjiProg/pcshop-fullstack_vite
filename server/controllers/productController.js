import prisma from '../prismaClient.js';

// --- ДОПОМІЖНА ФУНКЦІЯ: БУДІВНИК ЗАПИТІВ ---
const buildWhereClause = (query) => {
  // 👇 ДОДАЛИ: limit, page, skip у виключення, щоб вони не потрапили в specs
  const { category, minPrice, maxPrice, sort, limit, page, skip, ...specs } = query;
  const where = {};

  // 1. Фільтр по категорії
  if (category) {
    where.category = { slug: category };
  }

  // 2. Фільтр по ціні
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  // 3. Фільтр по характеристикам (JSON)
  const jsonFilters = [];
  Object.entries(specs).forEach(([key, value]) => {
    if (!value) return;
    
    const values = Array.isArray(value) ? value : [value];
    const orConditions = values.map(val => ({
      specifications: { path: [key], equals: val }
    }));

    if (orConditions.length > 0) {
      jsonFilters.push({ OR: orConditions });
    }
  });

  if (jsonFilters.length > 0) {
    where.AND = jsonFilters;
  }

  return where;
};


// --- ПУБЛІЧНІ МЕТОДИ (ДЛЯ МАГАЗИНУ) ---

// 1. Отримати список товарів
export const getProducts = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const { sort } = req.query;

    const products = await prisma.product.findMany({
      where,
      include: { category: true }, // Підтягуємо назву категорії
      orderBy: { 
        price: sort === 'asc' ? 'asc' : 'desc' 
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. Отримати один товар по slug (для сторінки товару)
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 3. Отримати один товар по ID (для адмінки, редагування)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true }
    });
    
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4. Отримати доступні фільтри (Facets)
// Це потрібно для сайдбару, щоб показати, які характеристики доступні для вибраної вибірки
export const getFilters = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    
    // Шукаємо тільки поле specifications
    const products = await prisma.product.findMany({
      where,
      select: { specifications: true }
    });

    // Збираємо всі унікальні ключі та значення
    const filters = {};
    products.forEach(p => {
      if (p.specifications && typeof p.specifications === 'object') {
        Object.entries(p.specifications).forEach(([key, value]) => {
          if (!filters[key]) filters[key] = new Set();
          filters[key].add(value);
        });
      }
    });

    // Перетворюємо Set у масив для JSON
    const result = {};
    for (const key in filters) {
      result[key] = Array.from(filters[key]).sort();
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// --- АДМІНСЬКІ МЕТОДИ (CRUD) ---

// 5. Створити товар
export const createProduct = async (req, res) => {
  try {
    const { title, price, images, categoryId, specifications } = req.body;
    
    // Генеруємо унікальний slug із назви
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9а-яіїєґ]+/g, '-') // Замінюємо спецсимволи на дефіс
      .replace(/^-+|-+$/g, '')           // Прибираємо дефіси по краях
      + '-' + Date.now();                // Додаємо час для унікальності

    const product = await prisma.product.create({
      data: {
        title,
        price: parseFloat(price),
        // Якщо база SQLite, Prisma може вимагати JSON.stringify для масивів, 
        // але якщо ти використовуєш нову версію або Postgres - це ок.
        // Для надійності передаємо як є, Prisma Client розбереться з типами.
        images: images || [], 
        categoryId: Number(categoryId),
        specifications: specifications || {},
        slug
      }
    });
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

// 6. Оновити товар
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, images, categoryId, specifications } = req.body;
    
    // При оновленні ми зазвичай НЕ міняємо slug, щоб посилання не ламалися.
    // Але оновлюємо все інше.

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        title,
        price: parseFloat(price),
        images: images, // Оновлюємо масив картинок
        categoryId: Number(categoryId),
        specifications: specifications
      }
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

// 7. Видалити товар
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ 
      where: { id: Number(id) } 
    });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    // Перевірка на обмеження зовнішнього ключа (якщо товар є в замовленнях)
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Cannot delete product because it is in an order.' });
    }
    res.status(500).json({ error: 'Error deleting product' });
  }
};
export const createProductsBatch = async (req, res) => {
  try {
    const products = req.body; // Очікуємо масив об'єктів
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products provided' });
    }

    // 1. Отримуємо всі категорії, щоб знайти їх ID за назвою
    const categories = await prisma.category.findMany();
    
    const createdProducts = [];
    const errors = [];

    // 2. Проходимо по кожному товару
    for (const item of products) {
      try {
        // Шукаємо категорію по назві (нечутливо до регістру)
        const category = categories.find(c => 
          c.name.toLowerCase().trim() === item.categoryName?.toLowerCase().trim()
        );

        if (!category) {
          errors.push(`Категорію "${item.categoryName}" не знайдено для товару "${item.title}"`);
          continue; // Пропускаємо цей товар
        }

        // Генеруємо slug
        const slug = item.title.toLowerCase()
          .replace(/[^a-z0-9а-яіїєґ]+/g, '-')
          .replace(/^-+|-+$/g, '') 
          + '-' + Date.now() + Math.floor(Math.random() * 1000);

        // Створюємо
        const product = await prisma.product.create({
          data: {
            title: item.title,
            price: parseFloat(item.price),
            images: item.images || [],
            categoryId: category.id,
            specifications: item.specifications || {},
            slug
          }
        });
        createdProducts.push(product);
        
      } catch (err) {
        console.error(err);
        errors.push(`Помилка створення "${item.title}": ${err.message}`);
      }
    }

    res.json({ 
      success: true, 
      count: createdProducts.length, 
      errors 
    });

  } catch (error) {
    console.error('Batch create error:', error);
    res.status(500).json({ error: 'Server error during batch import' });
  }
};