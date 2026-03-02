import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Вбудований модуль для генерації токенів
import prisma from '../prismaClient.js';
import sendEmail from '../utils/sendEmail.js'; // Наш відправник листів

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

// 4. Отримати дані про себе
export const getMe = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({ 
      where: { id: req.session.user.id },
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: true, 
        phone: true,     
        address: true,   
        orders: true 
      } 
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5. Зміна пароля (з кабінету, коли людина пам'ятає старий)
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

// 6. Оновлення профілю (ім'я, телефон, адреса)
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    
    // Оновлюємо дані користувача
    const updatedUser = await prisma.user.update({
      where: { id: req.session.user.id },
      data: { fullName, phone, address },
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: true, 
        phone: true, 
        address: true 
      }
    });

    // Оновлюємо дані в сесії
    req.session.user = { ...req.session.user, fullName: updatedUser.fullName };
    
    req.session.save(() => {
       res.json(updatedUser);
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка оновлення профілю' });
  }
};


// ==========================================
// НОВІ ФУНКЦІЇ: ВІДНОВЛЕННЯ ПАРОЛЯ
// ==========================================

// 7. Запит на скидання пароля (відправка листа)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Шукаємо користувача
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Користувача з такою поштою не знайдено' });
    }

    // Генеруємо випадковий токен
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Хешуємо токен для бази
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Зберігаємо токен в базу (діє 15 хвилин)
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: passwordResetToken,
        resetPasswordExpires,
      },
    });

    // URL для React-фронтенду
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Лист
    const message = `Ви запросили скидання пароля. Перейдіть за посиланням нижче, щоб встановити новий пароль:\n\n${resetUrl}\n\nЯкщо ви цього не робили, просто проігноруйте цей лист.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Відновлення пароля 🔒 - Nexora PC',
        message: `Ви запросили скидання пароля. Перейдіть за посиланням: ${resetUrl}`,
        html: `
          <div style="background-color: #f4f5f7; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              
              <div style="background-color: #16a34a; padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; font-weight: 900;">PC SHOP</h1>
              </div>
              
              <div style="padding: 40px 30px; color: #374151;">
                <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Відновлення доступу</h2>
                <p style="font-size: 16px; line-height: 1.6;">Привіт, <strong>${user.fullName || 'користувач'}</strong>! 👋</p>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  Ми отримали запит на скидання пароля для вашого облікового запису. Якщо це були ви, натисніть на кнопку нижче, щоб створити новий надійний пароль.
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${resetUrl}" style="background-color: #16a34a; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3);">
                    Створити новий пароль
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 0; padding: 15px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #16a34a;">
                  ⏳ Посилання дійсне лише <strong>15 хвилин</strong>.<br/>
                  Якщо ви не надсилали цей запит, просто проігноруйте цей лист. Ваш акаунт залишається в повній безпеці.
                </p>
              </div>
              
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  &copy; ${new Date().getFullYear()} Nexora PC. Всі права захищені.<br/>
                  Це автоматичний лист, будь ласка, не відповідайте на нього.
                </p>
              </div>

            </div>
          </div>
        `
      });

      res.status(200).json({ success: true, message: 'Лист із посиланням відправлено на вашу пошту' });
    } catch (error) {
      // Відкат: якщо лист не пішов, видаляємо токени
      await prisma.user.update({
        where: { email },
        data: { resetPasswordToken: null, resetPasswordExpires: null },
      });
      console.error('Помилка відправки листа:', error);
      return res.status(500).json({ error: 'Не вдалося відправити лист. Спробуйте пізніше' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

// 8. Збереження нового пароля (по токену з листа)
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Хешуємо токен з URL, щоб порівняти з базою
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Шукаємо юзера з активним токеном
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Посилання недійсне або його час (15 хв) вийшов' });
    }

    // Хешуємо новий пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Оновлюємо пароль та очищаємо токени відновлення
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.status(200).json({ success: true, message: 'Пароль успішно змінено. Тепер ви можете увійти.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
};