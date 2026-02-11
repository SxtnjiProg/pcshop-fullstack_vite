import express from 'express';
import * as controller from '../controllers/novaPoshtaController.js';

const router = express.Router();

// Публічні роути
router.post('/cities', controller.searchCities);
router.post('/warehouses', controller.getWarehouses);

export default router;
