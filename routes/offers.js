import { Router } from "express";
const router = Router();
import { protect } from "../middleware/auth.js";
import {
  getOffers,
  getAllOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  getRelatedOffers,
  recordOfferClick,
  getOfferMetricsController,
} from "../controllers/offerController.js";
import { createUploadMiddleware } from "../config/cloudinary.js";

// Create upload middleware for offers
const handleUpload = createUploadMiddleware(
  "closecart_offers",
  (req, file) => `offer_${Date.now()}`
);

// Create upload middleware for offers
const handleUpdateUpload = createUploadMiddleware(
  "closecart_offers",
  (req, file) => `offer_${req.params.id}`
);

// Middleware to log request body
const logRequestBody = (req, res, next) => {
  console.log("Request Body:", req.body);
  console.log("Request File:", req.file);
  next();
};

// Route for recommended offers
router.route("/related").get(getRelatedOffers);

// Apply routes with middleware
router
  .route("/")
  .get(protect, getOffers)
  .post(protect, handleUpload, logRequestBody, createOffer);
router.route("/all").get(getAllOffers);

router
  .route("/:id")
  .get(getOffer)
  .put(protect, handleUpdateUpload, updateOffer)
  .delete(protect, deleteOffer);

// Public metrics routes - no protection needed
router.route("/:id/clicks").post(recordOfferClick);
router.route("/:id/metrics").get(getOfferMetricsController);

export default router;
