import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// protect - необов'язково для createOrder, якщо дозволяєш гостям, 
// але ми зробимо для авторизованих для простоти
router.post('/checkout', protect, orderController.createOrder);
router.get('/my', protect, orderController.getMyOrders);
router.get('/all', protect, admin, orderController.getAllOrders);
router.put('/:id/status', protect, admin, orderController.updateOrderStatus);
// Цей роут має бути відкритим для LiqPay!
router.post('/callback', orderController.liqpayCallback);

export default router;