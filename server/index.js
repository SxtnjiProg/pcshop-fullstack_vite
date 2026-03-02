import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import pg from 'pg'; // Імпортуємо драйвер PostgreSQL
import dotenv from 'dotenv';
import 'dotenv/config';

// ... твої імпорти роутів та контролерів
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import * as categoryController from './controllers/categoryController.js';
import * as statsController from './controllers/statsController.js';
import * as productController from './controllers/productController.js';
import * as userController from './controllers/userController.js';
import { protect } from './middleware/authMiddleware.js';
import * as aiController from './controllers/aiController.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import novaPoshtaRoutes from './routes/novaPoshtaRoutes.js';

dotenv.config();

const app = express();
const PORT = 5000;

// 1. НАЛАШТУВАННЯ СЕСІЙ
// Створюємо пул з'єднань окремо для сесій
const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

const PgSessionStore = pgSession(session);

app.use(cors({
    origin: 'http://localhost:5173', // Адреса твого фронтенду
    credentials: true, // Дозволяємо cookie
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Підключаємо middleware сесій
app.use(session({
    store: new PgSessionStore({
        pool: pgPool,           // Використовуємо наше з'єднання
        tableName: 'session',   // Таблиця, яку ми створили через Prisma
        createTableIfMissing: false // Ми вже створили її через Prisma
    }),
    secret: process.env.JWT_SECRET || 'super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
        httpOnly: true, // JS на клієнті не бачить cookie (безпека)
        secure: process.env.NODE_ENV === 'production' // true тільки на https
    }
}));

// --- ДАЛІ ТВОЇ МАРШРУТИ ---

app.get('/api/admin/users', userController.getUsers);
app.put('/api/admin/users/:id/role', userController.updateUserRole);
app.delete('/api/admin/users/:id', userController.deleteUser);

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.get('/api/categories', categoryController.getAllCategories);
app.post('/api/categories', categoryController.createCategory); // Для створення
app.delete('/api/categories/:id', categoryController.deleteCategory); // Для видалення
app.get('/api/filters', productController.getFilters);

app.use('/api/auth', authRoutes); // Авторизація працює через сесії
app.get('/api/user/favorites', protect, userController.getFavorites);
app.post('/api/user/favorites', protect, userController.toggleFavorite);

app.get('/api/admin/stats', statsController.getDashboardStats);
app.post('/api/ai/compare', aiController.compareProducts);

app.use('/api/orders', orderRoutes);
app.use('/api/novaposhta', novaPoshtaRoutes);


app.get('/', (req, res) => {
  res.send('🚀 API is running with Prisma Sessions!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});