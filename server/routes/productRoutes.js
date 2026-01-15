import express from 'express';
import * as controller from '../controllers/productController.js';
// Імпортуємо обидва мідлвари
import { protect, admin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// --- ПУБЛІЧНІ (Доступні всім) ---
router.get('/', controller.getProducts);
router.get('/filters', controller.getFilters);
router.get('/:id(\\d+)', controller.getProductById);
router.get('/:slug', controller.getProductBySlug);

// --- ЗАХИЩЕНІ (Тільки для Адмінів) ---
// Спочатку перевіряємо чи залогінений (protect), потім чи адмін (admin)

router.post('/batch', protect, admin, controller.createProductsBatch);
router.post('/', protect, admin, controller.createProduct);
router.put('/:id', protect, admin, controller.updateProduct);
router.delete('/:id', protect, admin, controller.deleteProduct);

export default router;