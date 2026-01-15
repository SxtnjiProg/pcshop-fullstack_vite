import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. Реєстрація
export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Перевірка чи є такий юзер
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Цей email вже зайнятий' });

    // Хешування пароля (безпека!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Створення
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'USER' // За замовчуванням
      }
    });

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token: generateToken(user.id)
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
    
    // Перевірка юзера і пароля
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ error: 'Невірний email або пароль' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3. Отримати дані про себе (по токену)
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      select: { id: true, email: true, fullName: true, role: true, orders: true } 
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4. Зміна пароля
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

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