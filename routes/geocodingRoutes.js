import express from "express";
import { getAddressFromCoords, getCoordsFromAddress } from "../controllers/geocodingController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Geocoding routes
router.get("/reverse", getAddressFromCoords);
router.get("/forward", getCoordsFromAddress);

export default router;
