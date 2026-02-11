import prisma from '../prismaClient.js';

// 1. Перевірка: чи є активна сесія + чи існує юзер в БД
export const protect = async (req, res, next) => {
  // Спочатку перевіряємо, чи є запис у сесії (швидка перевірка)
  if (req.session && req.session.user) {
    try {
      // ПОВНА ПЕРЕВІРКА: Йдемо в базу даних за свіжими даними
      const user = await prisma.user.findUnique({
        where: { id: req.session.user.id },
        // Вибираємо тільки потрібні поля (пароль не тягнемо!)
        select: { 
          id: true, 
          email: true, 
          role: true, 
          fullName: true 
        } 
      });

      // Якщо юзера в базі вже немає (наприклад, видалили), а сесія висіла
      if (!user) {
        // Знищуємо "мертву" сесію
        req.session.destroy((err) => {
            if (err) console.error('Помилка знищення сесії:', err);
        });
        // Очищаємо куку на клієнті
        res.clearCookie('connect.sid'); 
        return res.status(401).json({ error: 'Користувач більше не існує. Авторизуйтесь знову.' });
      }

      // Записуємо СВІЖІ дані юзера в req.user
      // Тепер у наступних контролерах (і в middleware admin) ми використовуємо актуальні дані з БД
      req.user = user; 
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ error: 'Помилка перевірки авторизації' });
    }
  } else {
    res.status(401).json({ error: 'Не авторизований. Сесія відсутня.' });
  }
};

// 2. Перевірка: чи це АДМІН?
export const admin = (req, res, next) => {
  // Тут ми вже використовуємо req.user, який ми заповнили в protect
  // Це гарантує, що ми перевіряємо роль з бази, а не зі старої сесії
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Доступ заборонено: потрібні права адміністратора' });
  }
};