import ErrorResponse from "../utils/errorResponse.js";
import Offer from "../models/offer.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for offer images
const offerImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "closecart_offer_images",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
    public_id: (req, file) => {
      // For new offers, we'll update the filename after creation
      // For existing offers, use the offer ID
      const offerId = req.params.id || "temp";
      return `offer_${offerId}_${Date.now()}`;
    },
  },
});

// Setup multer with cloudinary storage
const uploadOfferImage = multer({ storage: offerImageStorage }).single(
  "offerImage"
);

export async function getAllOffers(req, res, next) {
  try {
    const offers = await Offer.find();
    res.status(200).json({ success: true, data: offers });
  } catch (err) {
    next(err);
  }
}

export async function getOffers(req, res, next) {
  try {
    const offers = await Offer.find({ shop: req.user.shop });
    res.status(200).json({ success: true, data: offers });
  } catch (err) {
    next(err);
  }
}

export async function createOffer(req, res, next) {
  try {
    // Handle file upload with multer
    uploadOfferImage(req, res, async (err) => {
      if (err) {
        return next(new ErrorResponse(err.message, 400));
      }

      // Set shop ID from authenticated user
      req.body.shop = req.user.shop;

      let originalImageUrl = null;
      let originalPublicId = null;

      // If an image was uploaded, add the image URL to the offer data
      if (req.file) {
        req.body.imageUrl = req.file.path;
        originalImageUrl = req.file.path;

        // Extract the public_id from the Cloudinary URL or from req.file
        if (req.file.filename) {
          originalPublicId = req.file.filename;
        } else {
          // Extract from path - this depends on your Cloudinary URL structure
          originalPublicId = req.file.path.split("/").pop().split(".")[0];
        }
      }

      try {
        // Create the offer in the database
        const offer = await Offer.create(req.body);

        // If an image was uploaded, rename it with the new offer ID
        if (req.file && originalPublicId) {
          try {
            // Create the new public_id with the actual offer ID
            const newPublicId = `closecart_offer_images/offer_${offer._id}`;

            // Use Cloudinary's rename API to update the public_id
            const result = await cloudinary.uploader.rename(
              `closecart_offer_images/${originalPublicId}`,
              newPublicId
            );

            // Update the offer with the new image URL
            if (result && result.secure_url) {
              offer.imageUrl = result.secure_url;
              await offer.save();
            }
          } catch (renameError) {
            console.error("Error renaming Cloudinary image:", renameError);
            // Continue with original URL if rename fails
          }
        }

        res.status(201).json({ success: true, data: offer });
      } catch (error) {
        // If offer creation fails and we uploaded an image, clean it up
        if (req.file && originalPublicId) {
          try {
            await cloudinary.uploader.destroy(
              `closecart_offer_images/${originalPublicId}`
            );
          } catch (deleteError) {
            console.error(
              "Error deleting orphaned Cloudinary image:",
              deleteError
            );
          }
        }

        // Forward the original error
        next(error);
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateOffer(req, res, next) {
  try {
    let offer = await Offer.findById(req.params.id);

    if (!offer) {
      return next(
        new ErrorResponse(`Offer not found with id ${req.params.id}`, 404)
      );
    }

    if (offer.shop.toString() !== req.user.shop.toString()) {
      return next(
        new ErrorResponse("Not authorized to update this offer", 403)
      );
    }

    // Handle file upload with multer
    uploadOfferImage(req, res, async (err) => {
      if (err) {
        return next(new ErrorResponse(err.message, 400));
      }

      // If an image was uploaded, add the image URL to the offer data
      if (req.file) {
        req.body.imageUrl = req.file.path;
      }

      try {
        // Update the offer
        offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });

        res.status(200).json({ success: true, data: offer });
      } catch (error) {
        next(error);
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteOffer(req, res, next) {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return next(
        new ErrorResponse(`Offer not found with id ${req.params.id}`, 404)
      );
    }

    if (offer.shop.toString() !== req.user.shop.toString()) {
      return next(
        new ErrorResponse("Not authorized to delete this offer", 403)
      );
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}

// Additional function to upload offer image separately
export async function uploadOfferImageController(req, res, next) {
  try {
    let offer = await Offer.findById(req.params.id);

    if (!offer) {
      return next(
        new ErrorResponse(`Offer not found with id ${req.params.id}`, 404)
      );
    }

    if (offer.shop.toString() !== req.user.shop.toString()) {
      return next(
        new ErrorResponse("Not authorized to update this offer", 403)
      );
    }

    // Use the middleware as a function with callbacks
    uploadOfferImage(req, res, async function (err) {
      if (err) {
        return next(new ErrorResponse(err.message, 400));
      }

      if (!req.file) {
        return next(new ErrorResponse("Please upload an image file", 400));
      }

      const imageUrl = req.file.path;

      // Update offer with new image URL
      offer = await Offer.findByIdAndUpdate(
        req.params.id,
        { imageUrl },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        data: {
          imageUrl,
          offer,
        },
      });
    });
  } catch (err) {
    next(err);
  }
}
