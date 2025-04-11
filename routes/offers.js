import { Router } from "express";
const router = Router();
import { protect } from "../middleware/auth.js";
import {
  getOffers,
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from "../controllers/offerController.js";
import { createUploadMiddleware } from "../config/cloudinary.js";

// Create upload middleware for offers
const handleUpload = createUploadMiddleware(
  "closecart_offers",
  (req, file) => `offer_${Date.now()}`
);

// Apply routes with middleware
router
  .route("/")
  .get(protect, getOffers)
  .post(protect, handleUpload, createOffer);
router.route("/all").get(getAllOffers);

router
  .route("/:id")
  .put(protect, handleUpload, updateOffer)
  .delete(protect, deleteOffer);

export default router;
