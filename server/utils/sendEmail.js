import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Створюємо транспортер для Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Вказуємо сервіс напряму
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Налаштовуємо сам лист
  const mailOptions = {
    from: `PC Shop <${process.env.EMAIL_FROM}>`, // Хто відправляє
    to: options.email,                           // Кому відправляємо
    subject: options.subject,                    // Тема листа
    text: options.message,                       // Текст (якщо немає HTML)
    html: options.html,                          // Красива HTML-версія
  };

  // 3. Відправляємо
  await transporter.sendMail(mailOptions);
};

export default sendEmail;