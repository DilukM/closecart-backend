import express from "express";
import {
  signUp,
  signIn,
  getAllProfiles,
  getProfile,
  changePassword,
  forgotPassword,
  updateProfile,
  uploadProfileImage,
  deleteProfile,
  getLikedOffers,
  addLikedOffer,
  deleteLikedOffer,
  getLikedShops,
  addLikedShop,
  deleteLikedShop,
  getFavoriteShops,
  addFavoriteShop,
  deleteFavoriteShop,
  getInterestedCategories,
  addInterestedCategory,
  deleteInterestedCategory,
} from "../controllers/consumerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.get("/liked-shops/:id", protect, getLikedShops);

router.post("/signup", signUp);
router.post("/signin", signIn);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/update-profile/:id", protect, updateProfile);
router.post("/upload-image/:id", protect, uploadProfileImage);
router.delete("/delete-profile", protect, deleteProfile);

router.post("/liked-shops", addLikedShop);
router.delete("/liked-shops/:id", deleteLikedShop);

router.get("/", getAllProfiles);
router.get("/:id", getProfile);

router.get("/liked-offers/:id", getLikedOffers);
router.post("/liked-offers", addLikedOffer);
router.delete("/liked-offers", deleteLikedOffer);

router.get("/favorite-shops", getFavoriteShops);
router.post("/favorite-shops", addFavoriteShop);
router.delete("/favorite-shops/:id", deleteFavoriteShop);

router.get("/interested-categories", getInterestedCategories);
router.post("/interested-categories", addInterestedCategory);
router.delete("/interested-categories/:id", deleteInterestedCategory);

export default router;
