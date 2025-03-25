import { Router } from "express";
const router = Router();
import { protect } from "../middleware/auth.js";
import {
  getShop,
  updateShop,
  updateShopLocation,
  updateShopBusinessHours,
  uploadShopCoverImage,
  uploadShopLogo,
} from "../controllers/shopController.js";

router.route("/:shopId").get(protect, getShop).put(protect, updateShop);

router.route("/:shopId/location").put(protect, updateShopLocation);
router.route("/:shopId/business-hours").put(protect, updateShopBusinessHours);
router.route("/:shopId/cover-image").post(protect, uploadShopCoverImage);
router.route("/:shopId/logo").post(protect, uploadShopLogo);

export default router;
