import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js'; // Імпортуємо Prisma, щоб знайти юзера

// 1. Перевірка: чи залогінений юзер?
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Отримуємо токен
      token = req.headers.authorization.split(' ')[1];

      // Розшифровуємо токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Знаходимо юзера в базі (без пароля)
      // Це важливо! Ми беремо реальну роль з бази даних.
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true } // Беремо тільки потрібні поля
      });

      if (!req.user) {
         return res.status(401).json({ error: 'Користувача не знайдено' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Не авторизований, токен невірний' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Немає токена, авторизація відхилена' });
  }
};

// 2. Перевірка: чи це АДМІН?
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next(); // Все ок, пропускаємо
  } else {
    res.status(403).json({ error: 'Доступ заборонено: потрібні права адміністратора' });
  }
};