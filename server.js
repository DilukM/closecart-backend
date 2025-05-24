import express from "express";
import fileUpload from "express-fileupload";
import { protectSuperAdmin } from "../middleware/superAdminAuth.js";
import {
  createShop,
  getShops,
  updateShop,
  deleteShop,
  createOffer,
  getOffers,
  updateOffer,
  deleteOffer,
} from "../controllers/superAdminDashboard.js";

// Import routes

const app = express();
const router = express.Router();

// File Upload
app.use(fileUpload());

// Apply protection to all routes
router.use(protectSuperAdmin);

// Shop routes
router.route("/shops").get(getShops).post(createShop);

router.route("/shops/:id").put(updateShop).delete(deleteShop);

// Offer routes
router.route("/offers").get(getOffers).post(createOffer);

router.route("/offers/:id").put(updateOffer).delete(deleteOffer);

// Mount routers

export default router;
