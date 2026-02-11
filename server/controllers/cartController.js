import prisma from '../prismaClient.js';

// 1. Отримати кошик юзера
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { 
        product: true // Важливо підтягнути дані про товар (картинку, ціну)
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. Додати товар в кошик (або оновити кількість)
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Перевіряємо, чи є вже цей товар в кошику
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId: Number(productId) }
      }
    });

    if (existingItem) {
      // Якщо є - плюсуємо кількість
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
      return res.json(updatedItem);
    }

    // Якщо немає - створюємо новий
    const newItem = await prisma.cartItem.create({
      data: {
        userId,
        productId: Number(productId),
        quantity
      }
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 3. Змінити кількість (для кнопок + та -)
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // ID запису в кошику (cartItem.id)
    const { quantity } = req.body;

    const updated = await prisma.cartItem.update({
      where: { id: Number(id) },
      data: { quantity: Number(quantity) }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Update failed' });
  }
};

// 4. Видалити товар з кошика
export const deleteCartItem = async (req, res) => {
  try {
    // Тут ми видаляємо не по ID кошика, а по productId, бо так шле фронтенд
    // Або можна переробити логіку. Але для CartContext.tsx ми передаємо productId.
    // Давай знайдемо запис по userId + productId і видалимо його.
    
    const userId = req.user.id;
    const { id: productId } = req.params; // В роуті це буде productId

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId: Number(productId)
      }
    });

    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Delete failed' });
  }
};