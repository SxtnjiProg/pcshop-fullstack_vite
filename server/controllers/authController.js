import bcrypt from 'bcryptjs';
import prisma from '../prismaClient.js';

// 1. Реєстрація
export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Цей email вже зайнятий' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'USER'
      }
    });

    // ЗБЕРІГАЄМО СЕСІЮ В БАЗІ
    req.session.user = { id: user.id, role: user.role };
    
    // Зберігаємо явно, щоб переконатися, що сесія записалась перед відповіддю
    req.session.save(err => {
        if (err) return res.status(500).json({ error: 'Session save error' });
        
        res.json({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
            // Токен більше не потрібен!
        });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. Логін
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user && (await bcrypt.compare(password, user.password))) {
        // ЗБЕРІГАЄМО СЕСІЮ
        req.session.user = { id: user.id, role: user.role };

        req.session.save(err => {
            if (err) return res.status(500).json({ error: 'Session save error' });

            res.json({
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            });
        });
    } else {
      res.status(401).json({ error: 'Невірний email або пароль' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3. Логаут (Вихід)
export const logout = async (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Could not log out' });
        
        // Очищаємо cookie на клієнті
        res.clearCookie('connect.sid'); 
        res.json({ message: 'Logged out successfully' });
    });
};

// 4. Отримати дані про себе (з сесії)
export const getMe = async (req, res) => {
  try {
    // Якщо сесії немає, middleware це перехопить раніше, але для надійності:
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({ 
      where: { id: req.session.user.id },
      select: { id: true, email: true, fullName: true, role: true, orders: true } 
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5. Зміна пароля (залишається майже без змін, але беремо id з сесії)
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.session.user.id } });

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ error: 'Старий пароль невірний' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Пароль успішно змінено' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};