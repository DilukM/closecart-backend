import { Router } from 'express';
const router = Router();
import { protect } from '../middleware/auth.js';
import { getShop, updateShop } from '../controllers/shopController.js';

router.route('/:shopId')
  .get(protect, getShop)
  .put(protect, updateShop);

  router.route('/:shopId/location')
  .put(protect, updateShopLocation);

export default router;