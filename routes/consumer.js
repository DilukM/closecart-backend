import express from "express";
import {
  signUp,
  signIn,
  googleSignIn,
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
import { consumerProtect } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/google-signin", googleSignIn);
router.put("/change-password", consumerProtect, changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/update-profile/:id", consumerProtect, updateProfile);
router.post("/upload-image/:id", consumerProtect, uploadProfileImage);
router.delete("/delete-profile", consumerProtect, deleteProfile);

router.get("/liked-shops/:id", consumerProtect, getLikedShops);
router.post("/liked-shops", consumerProtect, addLikedShop);
router.delete("/liked-shops", consumerProtect, deleteLikedShop);

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
