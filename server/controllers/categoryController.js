import prisma from '../prismaClient.js'; 

// --- ФУНКЦІЯ ТРАНСЛІТЕРАЦІЇ ---
const transliterate = (text) => {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ie',
    'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'i', 'к': 'k', 'л': 'l',
    'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'iu', 'я': 'ia'
  };

  return text.toLowerCase().split('').map((char) => map[char] || char).join('')
    .replace(/[^a-z0-9]+/g, '-') // Замінюємо все, що не літери/цифри на дефіс
    .replace(/^-+|-+$/g, '');    // Прибираємо дефіси по краях
};

// 1. Отримати всі
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
};

// 2. Створити категорію (З ТРАНСЛІТЕРАЦІЄЮ)
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Назва обов\'язкова' });

    // Використовуємо функцію транслітерації
    // "Відеокарти" -> "videokarty"
    const slug = transliterate(name);

    const category = await prisma.category.create({
      data: { name, slug }
    });

    res.json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Така категорія вже існує' });
    }
    res.status(500).json({ error: 'Error creating category' });
  }
};

// 3. Видалити категорію
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: Number(id) } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Спочатку видаліть товари з цієї категорії' });
    }
    res.status(500).json({ error: 'Error deleting category' });
  }
};