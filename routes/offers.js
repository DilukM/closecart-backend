import { Router } from "express";
const router = Router();
import { protect } from "../middleware/auth.js";
import {
  getOffers,
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  uploadOfferImageController
} from "../controllers/offerController.js";

router.route("/").get(protect, getOffers).post(protect, createOffer);
router.route("/all").get(getAllOffers);

router.route("/:id").put(protect, updateOffer).delete(protect, deleteOffer);
router
  .route("/:id/image")
  .put(protect, uploadOfferImageController);

export default router;
