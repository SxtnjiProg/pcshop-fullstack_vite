import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout); // <--- ДОДАЛИ ЦЕ

router.get('/me', protect, authController.getMe);
router.put('/password', protect, authController.updatePassword);

export default router;