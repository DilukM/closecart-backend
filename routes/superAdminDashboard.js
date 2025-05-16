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

// Route logging middleware
const logRoute = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("Request headers:", req.headers);
  next();
};

// Apply route logging to all routes
router.use(logRoute);

// Apply protection to all routes
// router.use(protectSuperAdmin);

// Shop routes
router.route("/shops").get(getShops).post(createShop);

router.route("/shops/:id").put(updateShop).delete(deleteShop);

// Offer routes
router.route("/offers").get(getOffers).post(createOffer);

router.route("/offers/:id").put(updateOffer).delete(deleteOffer);

// CSV Import route with additional logging
router.route("/import/csv").post((req, res, next) => {
  console.log("CSV import request received");
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Request has files object:", !!req.files);
  if (req.files) {
    console.log("Files keys:", Object.keys(req.files));
  }
  next();
}, importFromCSV);

export default router;
