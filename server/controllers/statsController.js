import prisma from '../prismaClient.js';

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    
    // --- 1. ДАТИ ДЛЯ ПОРІВНЯННЯ (Цей місяць vs Минулий) ---
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Останній день минулого місяця

    // --- 2. ОТРИМУЄМО ЗАГАЛЬНІ ЛІЧИЛЬНИКИ ---
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    const totalUsers = await prisma.user.count();
    const totalRevenueAgg = await prisma.order.aggregate({ _sum: { total: true } });
    const totalRevenue = totalRevenueAgg._sum.total || 0;

    // --- 3. ОБЧИСЛЮЄМО ТРЕНДИ (ПРИРІСТ) ---
    
    // Дохід за цей місяць
    const revenueThisMonthAgg = await prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: thisMonthStart } }
    });
    const revenueThisMonth = revenueThisMonthAgg._sum.total || 0;

    // Дохід за минулий місяць
    const revenueLastMonthAgg = await prisma.order.aggregate({
      _sum: { total: true },
      where: { 
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd } 
      }
    });
    const revenueLastMonth = revenueLastMonthAgg._sum.total || 0;

    // Нові юзери
    const usersThisMonth = await prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } });
    const usersLastMonth = await prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } });

    // Нові замовлення
    const ordersThisMonth = await prisma.order.count({ where: { createdAt: { gte: thisMonthStart } } });
    const ordersLastMonth = await prisma.order.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } });

    // Функція для розрахунку відсотка
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return (((current - previous) / previous) * 100).toFixed(1);
    };

    // --- 4. ДАНІ ДЛЯ ГРАФІКА (Останні 6 місяців) ---
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const sales = await prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: date, lt: nextDate } }
      });

      // Назва місяця (напр. "Січ", "Лют")
      const monthName = date.toLocaleString('uk-UA', { month: 'short' });
      monthlySales.push({ name: monthName, sales: sales._sum.total || 0 });
    }

    // --- 5. ВІДПОВІДЬ ---
    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      trends: {
        revenue: calculateGrowth(revenueThisMonth, revenueLastMonth),
        orders: calculateGrowth(ordersThisMonth, ordersLastMonth),
        users: calculateGrowth(usersThisMonth, usersLastMonth)
      },
      chartData: monthlySales // Масив для графіка
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
};