import prisma from '../prismaClient.js';
import { LiqPay } from '../utils/LiqPay.js';

const liqpay = new LiqPay(
  process.env.LIQPAY_PUBLIC_KEY,
  process.env.LIQPAY_PRIVATE_KEY
);

// 1. Створення замовлення
export const createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, isCash } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!items || items.length === 0) return res.status(400).json({ error: 'Кошик порожній' });

    let total = 0;
    const orderItemsData = [];

    // --- ПЕРЕВІРКА НАЯВНОСТІ ---
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      
      if (!product) {
        return res.status(400).json({ error: `Товар з ID ${item.productId} не знайдено` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Товару "${product.title}" залишилось лише ${product.stock} шт.` });
      }
      
      total += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // --- СТВОРЕННЯ ЗАМОВЛЕННЯ ---
    const order = await prisma.order.create({
      data: {
        userId,
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        city: shippingInfo.city,
        address: shippingInfo.address,
        total,
        status: 'PENDING',
        ttn: null, // Поки немає ТТН
        items: { create: orderItemsData }
      }
    });

    // --- ЛОГІКА ДЛЯ ГОТІВКИ ---
    if (isCash) {
      // 👇 ВАЖЛИВО: Одразу списуємо товар, бо колбеку LiqPay не буде
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity }
          }
        });
      }

      return res.json({ 
        orderId: order.id, 
        message: 'Order created successfully (Cash)' 
      });
    }

    // --- ЛОГІКА ДЛЯ LIQPAY (КАРТА) ---
    // Товар спишеться тільки коли прийде успішний Callback
    const uniqueOrderId = `${order.id}_${Date.now()}`;
    const paymentParams = {
      action: 'pay',
      amount: total,
      currency: 'UAH',
      description: `Оплата замовлення №${order.id}`,
      order_id: uniqueOrderId,
      version: '3',
      result_url: `http://localhost:5173/profile/orders`,
      server_url: `${process.env.SERVER_URL}/api/orders/callback`,
      sandbox: '1'
    };

    const { data, signature } = liqpay.cnb_object(paymentParams);
    res.json({ orderId: order.id, liqpay: { data, signature } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. Callback LiqPay (Тільки для оплати карткою)
export const liqpayCallback = async (req, res) => {
  try {
    const { data, signature } = req.body;
    if (!data || !signature) return res.status(400).send('No data');

    const validSignature = liqpay.str_to_sign(process.env.LIQPAY_PRIVATE_KEY + data + process.env.LIQPAY_PRIVATE_KEY);
    if (signature !== validSignature) return res.status(400).send('Invalid signature');

    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    const realOrderId = Number(decodedData.order_id.split('_')[0]);
    const { status, transaction_id } = decodedData;

    const order = await prisma.order.findUnique({
      where: { id: realOrderId },
      include: { items: true }
    });

    if (!order) return res.status(404).send('Order not found');

    if ((status === 'success' || status === 'sandbox') && order.status !== 'PAID') {
      
      await prisma.order.update({
        where: { id: realOrderId },
        data: { status: 'PAID', paymentId: transaction_id?.toString() }
      });

      // Списуємо товар
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity }
          }
        });
      }
      
      console.log(`Order #${realOrderId} PAID. Stock updated.`);
    } 
    else if (status === 'failure' || status === 'error') {
       await prisma.order.update({ where: { id: realOrderId }, data: { status: 'CANCELLED' } });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
};

// 3. Отримати ВСІ замовлення (Адмін)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        user: { select: { email: true, fullName: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
};

// 4. Отримати МОЇ замовлення
export const getMyOrders = async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching orders' });
    }
};

// 5. Оновити статус та ТТН (Адмін)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ttn } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        status: status,
        ttn: ttn || null
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};