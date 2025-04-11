import ErrorResponse from "../utils/errorResponse.js";
import Offer from "../models/offer.js";

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
  console.log("Creating offer with data:", req.body);
  try {
    // Set the shop from the authenticated user
    req.body.shop = req.user.shop;

    let initialImageUrl = null;
    let publicId = null;

    // Check if an image was uploaded and properly processed by Cloudinary
    if (req.file) {
      initialImageUrl = req.file.path || req.file.secure_url;

      // Extract public_id from the Cloudinary URL
      publicId = req.file.filename || req.file.public_id;

      // Explicitly set the image URL in the offer data
      req.body.image = initialImageUrl;
    } else {
      console.log("No image file uploaded with this offer");
    }

    // Create the offer with all data including the image URL
    const offer = await Offer.create(req.body);

    // If we have an image, rename it to include the offer ID
    if (initialImageUrl && publicId) {
      try {
        // Import cloudinary at the top of the file if not already imported
        const { cloudinary } = await import("../config/cloudinary.js");

        // Generate new public_id using offer ID
        const newPublicId = `offers/offer_${offer._id}`;

        // Rename the image in Cloudinary
        const result = await cloudinary.uploader.rename(publicId, newPublicId);

        // Update the offer with the new image URL
        const updatedOffer = await Offer.findByIdAndUpdate(
          offer._id,
          { image: result.secure_url },
          { new: true }
        );

        // Return the updated offer
        return res.status(201).json({ success: true, data: updatedOffer });
      } catch (renameError) {
        console.error("Error renaming image:", renameError);
        // Continue with the original offer if renaming fails
      }
    }

    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    console.error("Error creating offer:", err);
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

    // Check if a new image was uploaded
    if (req.file) {
      console.log("New image uploaded for offer update:", req.file);
      const imageUrl = req.file.path || req.file.secure_url;
      console.log("New image URL to save:", imageUrl);

      // Update the image field explicitly
      req.body.image = imageUrl;
    }

    offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    console.log("Offer updated successfully with image:", offer.image);
    res.status(200).json({ success: true, data: offer });
  } catch (err) {
    console.error("Error updating offer:", err);
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
