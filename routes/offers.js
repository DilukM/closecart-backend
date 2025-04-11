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
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary (if not already configured elsewhere in your app)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for offer images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "closecart_offers",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
    public_id: (req, file) => {
      // Create a unique identifier for the file
      return `offer_${Date.now()}`;
    },
  },
});

// Setup multer with cloudinary storage
const upload = multer({ storage });

// Middleware to handle file upload with error logging
const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({
        success: false,
        message: "File upload failed",
        error: err.message,
      });
    }
    next();
  });
};

// Apply routes with middleware
router
  .route("/")
  .get(protect, getOffers)
  .post(protect, handleUpload, createOffer);
router.route("/all").get(getAllOffers);

router
  .route("/:id")
  .put(protect, handleUpload, updateOffer)
  .delete(protect, deleteOffer);

export default router;
