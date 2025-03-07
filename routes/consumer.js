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

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.put("/change-password", changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/update-profile/:id", updateProfile);
router.put("/upload-image/:id", uploadProfileImage);
router.delete("/delete-profile", deleteProfile);

router.get("/", getAllProfiles);
router.get("/:id", getProfile);

router.get("/liked-offers", getLikedOffers);
router.post("/liked-offers", addLikedOffer);
router.delete("/liked-offers/:id", deleteLikedOffer);

router.get("/liked-shops", getLikedShops);
router.post("/liked-shops", addLikedShop);
router.delete("/liked-shops/:id", deleteLikedShop);

router.get("/favorite-shops", getFavoriteShops);
router.post("/favorite-shops", addFavoriteShop);
router.delete("/favorite-shops/:id", deleteFavoriteShop);

router.get("/interested-categories", getInterestedCategories);
router.post("/interested-categories", addInterestedCategory);
router.delete("/interested-categories/:id", deleteInterestedCategory);

export default router;
