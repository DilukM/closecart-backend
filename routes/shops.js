const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getShop,
  updateShop
} = require('../controllers/shopController');

router.route('/:shopId')
  .get(protect, getShop)
  .put(protect, updateShop);

module.exports = router;