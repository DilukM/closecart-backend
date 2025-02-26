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

router.route("/").get(protect, getOffers).post(protect, createOffer);
router.route("/all").get(getAllOffers);

router.route("/:id").put(protect, updateOffer).delete(protect, deleteOffer);

export default router;
