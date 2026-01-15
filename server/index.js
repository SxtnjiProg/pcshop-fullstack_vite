import express from 'express';
import cors from 'cors';

// --- ІМПОРТИ РОУТІВ ---
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';

// --- ІМПОРТИ КОНТРОЛЕРІВ ---
import * as categoryController from './controllers/categoryController.js';
import * as statsController from './controllers/statsController.js';
import * as productController from './controllers/productController.js'; // <--- ЦЕ ТРЕБА ДЛЯ ФІЛЬТРІВ
import * as userController from './controllers/userController.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- МАРШРУТИ ---

app.get('/api/admin/users', userController.getUsers);
app.put('/api/admin/users/:id/role', userController.updateUserRole); // <--- НОВЕ
app.delete('/api/admin/users/:id', userController.deleteUser);       // <--- НОВЕ

// 1. Товари та Категорії
app.use('/api/products', productRoutes);
app.get('/api/categories', categoryController.getAllCategories);

// 👇 Маршрут для фільтрів (виправляє помилку 404)
app.get('/api/filters', productController.getFilters);

// 2. Авторизація
app.use('/api/auth', authRoutes);

// 3. Адмін-панель (Тільки статистика поки що)
app.get('/api/admin/stats', statsController.getDashboardStats);

app.get('/', (req, res) => {
  res.send('🚀 API is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});