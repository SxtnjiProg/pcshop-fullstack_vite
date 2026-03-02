import prisma from '../prismaClient.js';

// Отримати всіх
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Змінити роль (Make Admin / Make User)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // "ADMIN" або "USER"

    await prisma.user.update({
      where: { id: Number(id) },
      data: { role }
    });
    res.json({ message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating role' });
  }
};

// Видалити юзера
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};

// 1. Отримати список обраного (НОВА ВЕРСІЯ З РЕЙТИНГОМ)
export const getFavorites = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { 
        favorites: {
          include: { 
            category: true, // Залишаємо категорію
            reviews: {      // Завантажуємо відгуки для підрахунку
              select: { rating: true } 
            }
          } 
        } 
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    // Проходимось по кожному товару і рахуємо рейтинг вручну
    const formattedFavorites = user.favorites.map(product => {
      const reviews = product.reviews || [];
      const count = reviews.length;
      
      // Сумуємо всі оцінки
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      
      // Рахуємо середнє (якщо відгуків 0, то рейтинг 0)
      const avgRating = count > 0 ? (totalRating / count) : 0;

      return {
        ...product,          // Всі поля товару
        rating: avgRating,   // Доданий рейтинг
        reviewCount: count,  // Додана кількість відгуків
        reviews: undefined   // Прибираємо масив відгуків, щоб не передавати зайве
      };
    });

    res.json(formattedFavorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. Додати/Видалити з обраного (Перемикач)
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.body.productId);

    // Перевіряємо, чи вже є в обраному
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { favorites: true }
    });

    const exists = user.favorites.some(p => p.id === productId);

    if (exists) {
      // Якщо є -> видаляємо (disconnect)
      await prisma.user.update({
        where: { id: userId },
        data: {
          favorites: { disconnect: { id: productId } }
        }
      });
      res.json({ message: 'Removed', isFavorite: false });
    } else {
      // Якщо немає -> додаємо (connect)
      await prisma.user.update({
        where: { id: userId },
        data: {
          favorites: { connect: { id: productId } }
        }
      });
      res.json({ message: 'Added', isFavorite: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};