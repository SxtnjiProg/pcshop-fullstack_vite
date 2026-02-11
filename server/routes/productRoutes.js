import express from 'express';
import * as productController from '../controllers/productController.js'; // <--- Важливий імпорт!
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Публічні роути
router.get('/', productController.getProducts);
router.get('/filters', productController.getFilters);
router.get('/:slug', productController.getProductBySlug); // Для сторінки товару
router.get('/similar/:id', productController.getSimilarProducts); // <--- Новий роут для схожих товарів
router.post('/:id/reviews', protect, productController.createReview);
router.delete('/reviews/:id', protect, productController.deleteReview);
// Адмінські роути
router.get('/admin/:id', protect, admin, productController.getProductById); // Для редагування
router.post('/', protect, admin, productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);
router.post('/batch', protect, admin, productController.createProductsBatch);

export default router;