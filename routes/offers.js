const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer
} = require('../controllers/offerController');

router.route('/')
  .get(protect, getOffers)
  .post(protect, createOffer);

router.route('/:id')
  .put(protect, updateOffer)
  .delete(protect, deleteOffer);

module.exports = router;