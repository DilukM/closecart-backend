import { Router } from "express";
const router = Router();
import { protect } from "../middleware/auth.js";
import {
  getShop,
  getOffers,
  getAllShops,
  updateShop,
  updateShopLocation,
  updateShopBusinessHours,
  uploadShopCoverImage,
  uploadShopLogo,updateShopImages,
} from "../controllers/shopController.js";

router.route("/:shopId").get(getShop).put(protect, updateShop);
router.route("/").get(getAllShops);
router.route("/offers/:shopId").get(getOffers);

router.route("/:shopId/location").put(protect, updateShopLocation);
router.route("/:shopId/business-hours").put(protect, updateShopBusinessHours);
router.route("/:shopId/images").put(protect, updateShopImages);
router.route("/:shopId/cover-image").post(protect, uploadShopCoverImage);
router.route("/:shopId/logo").post(protect, uploadShopLogo);

export default router;
