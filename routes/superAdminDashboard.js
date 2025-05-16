import express from "express";
import {
  createShop,
  getShops,
  updateShop,
  deleteShop,
  createOffer,
  getOffers,
  updateOffer,
  deleteOffer,
  importFromCSV,
} from "../controllers/superAdminDashboard.js";
import { protectSuperAdmin } from "../middleware/superAdminAuth.js";

const router = express.Router();

// Apply protection to all routes
// router.use(protectSuperAdmin);

// Shop routes
router.route("/shops").get(getShops).post(createShop);

router.route("/shops/:id").put(updateShop).delete(deleteShop);

// Offer routes
router.route("/offers").get(getOffers).post(createOffer);

router.route("/offers/:id").put(updateOffer).delete(deleteOffer);

// CSV Import route
router.route("/import/csv").post(importFromCSV);

export default router;
