import prisma from '../prismaClient.js';

// --- УНІВЕРСАЛЬНИЙ БУДІВНИК ЗАПИТІВ ---
const buildWhereClause = (query) => {
  const { 
    category, minPrice, maxPrice, sort, limit, page, skip, minWattage, 
    ...dynamicSpecs // Сюди потрапляє ВСЕ: "Сокет", "Тип пам'яті", "Колір" тощо
  } = query;

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

  const jsonFilters = [];

  // 3. АВТОМАТИЗАЦІЯ: Пошук по будь-яким вхідним характеристикам
  Object.entries(dynamicSpecs).forEach(([key, value]) => {
    if (!value || value === 'undefined' || value === 'null') return;

    // Створюємо фільтр: ключ у JSON (path) має дорівнювати значенню (equals)
    jsonFilters.push({
      specifications: {
        path: [key],   // Наприклад: "Сокет"
        equals: value  // Наприклад: "LGA1700"
      }
    });
  });

  // Спеціальний фільтр для БЖ (залишаємо кириличний ключ як у вас в базі)
  if (minWattage) {
    jsonFilters.push({
      specifications: { path: ['Потужність'], gte: Number(minWattage) }
    });
  }

  if (jsonFilters.length > 0) {
    where.AND = jsonFilters;
  }

  return where;
};

// --- ОСНОВНИЙ МЕТОД ОТРИМАННЯ ТОВАРІВ ---
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Для конструктора беремо багато товарів
    const skip = (page - 1) * limit;

    const where = buildWhereClause(req.query);
    const { sort } = req.query;

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: sort === 'price_asc' ? { price: 'asc' } : { id: 'desc' },
      take: limit,
      skip: skip
    });

    const total = await prisma.product.count({ where });

    res.json({ products, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Решта методів (getProductBySlug, createProduct тощо) залишаються без змін у вашому файлі
// 2. Отримати один товар по slug (з відгуками)
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { 
        category: true,
        reviews: {
          include: {
            user: {
              select: { fullName: true } 
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
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

// 3. Отримати схожі товари
export const getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: { categoryId: true }
    });

    if (!currentProduct) return res.status(404).json({ error: 'Product not found' });

    const similar = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        id: { not: parseInt(id) }
      },
      take: 4,
      include: { category: true }
    });

    res.json(similar);
  } catch (error) {
    console.error('Error fetching similar products:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 4. Отримати один товар по ID (для адмінки)
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

// 5. Отримати доступні фільтри (динамічно з JSON)
export const getFilters = async (req, res) => {
  try {
    // Будуємо базовий where (наприклад, тільки для категорії 'cpu')
    // Важливо: ми не передаємо specs у buildWhereClause, бо хочемо отримати ВСІ можливі фільтри для категорії
    const { category } = req.query;
    const where = category ? { category: { slug: category } } : {};
    
    const products = await prisma.product.findMany({
      where,
      select: { specifications: true }
    });

    const filters = {};
    products.forEach(p => {
      if (p.specifications && typeof p.specifications === 'object') {
        Object.entries(p.specifications).forEach(([key, value]) => {
          if (!filters[key]) filters[key] = new Set();
          filters[key].add(value);
        });
      }
    });

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

// 6. Створити товар
export const createProduct = async (req, res) => {
  try {
    const { title, price, images, categoryId, specifications, stock } = req.body;
    
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9а-яіїєґ]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        title,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 10,
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

// 7. Оновити товар
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, images, categoryId, specifications, stock } = req.body;
    
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        title,
        price: parseFloat(price),
        stock: stock !== undefined ? parseInt(stock) : undefined,
        images: images,
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

// 8. Видалити товар
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId } }),
      prisma.orderItem.deleteMany({ where: { productId } }),
      prisma.review.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } })
    ]);

    res.json({ success: true, message: 'Product and related data deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error during deletion' });
  }
};

// 9. Масове створення (Batch)
export const createProductsBatch = async (req, res) => {
  try {
    const products = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products provided' });
    }

    const categories = await prisma.category.findMany();
    const createdProducts = [];
    const errors = [];

    for (const item of products) {
      try {
        const category = categories.find(c => 
          c.name.toLowerCase().trim() === item.categoryName?.toLowerCase().trim()
        );

        if (!category) {
          errors.push(`Категорію "${item.categoryName}" не знайдено для товару "${item.title}"`);
          continue;
        }

        const slug = item.title.toLowerCase()
          .replace(/[^a-z0-9а-яіїєґ]+/g, '-')
          .replace(/^-+|-+$/g, '') 
          + '-' + Date.now() + Math.floor(Math.random() * 1000);

        const product = await prisma.product.create({
          data: {
            title: item.title,
            price: parseFloat(item.price),
            stock: item.stock ? parseInt(item.stock) : 10,
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

// 10. Додати відгук
export const createReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = await prisma.review.create({
      data: {
        text,
        rating: Number(rating),
        userId,
        productId: Number(id)
      },
      include: {
        user: { select: { fullName: true } }
      }
    });

    res.status(201).json(review);

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 11. Видалити відгук
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({
      where: { id: Number(id) }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.review.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Review deleted' });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};