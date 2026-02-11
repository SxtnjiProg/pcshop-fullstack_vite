import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const compareProducts = async (req, res) => {
    try {
        const { product1, product2 } = req.body;

        if (!product1 || !product2) {
            return res.status(400).json({ error: 'Потрібно два товари для порівняння' });
        }

        // Формуємо характеристики в текст, щоб ШІ їх зрозумів
        const specs1 = JSON.stringify(product1.specifications || {});
        const specs2 = JSON.stringify(product2.specifications || {});

        const prompt = `
        Ти помічник інтернет-магазину компʼютерних комплектуючих.
        
        Твоє завдання: Порівняй два товари однієї категорії українською мовою.
        
        Правила:
        1. Не вигадуй точні характеристики.
        2. Не використовуй цифри, якщо вони не вказані в описі.
        3. Описуй тільки ключові відмінності та для чого краще підходить кожен товар (геймінг, робота, бюджетна збірка).
        4. Відповідь має бути лаконічною (3-4 речення).
        
        Товар 1:
        Назва: ${product1.title}
        Ціна: ${product1.price} грн
        Характеристики: ${specs1}
        
        Товар 2:
        Назва: ${product2.title}
        Ціна: ${product2.price} грн
        Характеристики: ${specs2}
        
        Відповідь:`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile', // Дуже швидка модель
            temperature: 0.2, 
            max_tokens: 300,
        });

        const answer = chatCompletion.choices[0]?.message?.content || 'Не вдалося отримати відповідь.';

        res.json({ answer });

    } catch (error) {
        console.error('Groq API Error:', error);
        res.status(500).json({ error: 'Помилка генерації порівняння' });
    }
};