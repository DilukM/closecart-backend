import ErrorResponse from "../utils/errorResponse.js";
import multer from "multer";

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import {
  getShopById,
  getShopsWithDetails,
  getAllShopsService,
  updateShop as updateShopService,
  updateShopBusinessHours as updateShopBusinessHoursService,
  updateShopImages as updateShopImagesService,
} from "../services/shopService.js";

// Configure Cloudinary (if not already configured)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure logo storage
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "closecart_shop_logos",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
    public_id: (req, file) => {
      // Use the shop ID as filename
      const shopId = req.params.shopId || "unknown";
      return `shop_${shopId}_logo`;
    },
  },
});

// Configure cover image storage
const coverImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "closecart_shop_covers",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
    public_id: (req, file) => {
      // Use the shop ID as filename
      const shopId = req.params.shopId || "unknown";
      return `shop_${shopId}_cover`;
    },
  },
});

// Setup multer with respective storage
const uploadLogo = multer({ storage: logoStorage }).single("logo");
const uploadCoverImage = multer({ storage: coverImageStorage }).single(
  "coverImage"
);

export async function uploadShopLogo(req, res, next) {
  try {
    console.log(`[uploadShopLogo] Starting logo upload for shopId: ${req.params.shopId}`);
    
    // First check if shop exists and user is authorized
    const shop = await getShopById(req.params.shopId);
    
    if (!shop) {
      console.log(`[uploadShopLogo] Shop not found with id: ${req.params.shopId}`);
      return next(
        new ErrorResponse(`Shop not found with id ${req.params.shopId}`, 404)
      );
    }
    
    console.log(`[uploadShopLogo] Found shop: ${shop.name || shop._id}`);
    console.log(`[uploadShopLogo] Request user shop: ${req.user.shop}, Shop ID: ${shop._id}`);

    if (shop._id.toString() !== req.user.shop.toString()) {
      console.log(`[uploadShopLogo] Authorization failed - User's shop: ${req.user.shop}, Requested shop: ${shop._id}`);
      return next(new ErrorResponse("Not authorized to update this shop", 403));
    }

    console.log(`[uploadShopLogo] User authorized, proceeding with file upload`);
    
    // Use the middleware as a function with callbacks
    uploadLogo(req, res, async function (err) {
      if (err) {
        console.error(`[uploadShopLogo] Upload error:`, err);
        return next(new ErrorResponse(err.message, 400));
      }

      if (!req.file) {
        console.log(`[uploadShopLogo] No file was uploaded`);
        return next(new ErrorResponse("Please upload a logo image file", 400));
      }

      console.log(`[uploadShopLogo] File successfully uploaded to Cloudinary`);
      console.log(`[uploadShopLogo] File details:`, {
        filename: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      });

      // Cloudinary automatically uploads the file
      const logoUrl = req.file.path;

      // Update the shop with the new logo URL:
      console.log(`[uploadShopLogo] Updating shop with new logo URL: ${logoUrl}`);
      await updateShopImagesService(req.params.shopId, { logo: logoUrl });
      console.log(`[uploadShopLogo] Shop logo successfully updated`);

      res.status(200).json({
        success: true,
        data: { logoUrl },
      });
    });
  } catch (err) {
    console.error(`[uploadShopLogo] Unexpected error:`, err);
    next(err);
  }
}

/**
 * @desc    Upload shop cover image
 * @route   POST /api/shops/:shopId/cover-image
 * @access  Private
 */
export async function uploadShopCoverImage(req, res, next) {
  try {
    // First check if shop exists and user is authorized
    const shop = await getShopById(req.params.shopId);

    if (!shop) {
      return next(
        new ErrorResponse(`Shop not found with id ${req.params.shopId}`, 404)
      );
    }

    if (shop._id.toString() !== req.user.shop.toString()) {
      return next(new ErrorResponse("Not authorized to update this shop", 403));
    }

    // Use the middleware as a function with callbacks
    uploadCoverImage(req, res, async function (err) {
      if (err) {
        return next(new ErrorResponse(err.message, 400));
      }

      if (!req.file) {
        return next(new ErrorResponse("Please upload a cover image file", 400));
      }

      // Cloudinary automatically uploads the file
      // req.file.path contains the URL from Cloudinary
      const coverImageUrl = req.file.path;

      // Update the shop with the new cover image URL:
      await updateShopImagesService(req.params.shopId, {
        coverImage: coverImageUrl,
      });

      res.status(200).json({
        success: true,
        data: { coverImageUrl },
      });
    });
  } catch (err) {
    next(err);
  }
}

export async function getShop(req, res, next) {
  try {
    const shop = await getShopById(req.params.shopId);

    if (!shop) {
      return next(
        new ErrorResponse(`Shop not found with id ${req.params.shopId}`, 404)
      );
    }

    if (shop._id.toString() !== req.user.shop.toString()) {
      return next(new ErrorResponse("Not authorized to access this shop", 403));
    }

    res.status(200).json({ success: true, data: shop });
  } catch (err) {
    next(err);
  }
}

export async function getAllShops(req, res, next) {
  try {
    // Use the simple service function to get all shops without filtering
    const shops = await getAllShopsService();

    res.status(200).json({
      success: true,
      count: shops.length,
      data: shops,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateShop(req, res, next) {
  try {
    let shop = await getShopById(req.params.shopId);

    if (!shop) {
      return next(
        new ErrorResponse(`Shop not found with id ${req.params.shopId}`, 404)
      );
    }

    if (shop._id.toString() !== req.user.shop.toString()) {
      return next(new ErrorResponse("Not authorized to update this shop", 403));
    }

    shop = await updateShopService(req.params.shopId, req.body);
    res.status(200).json({ success: true, data: shop });
  } catch (err) {
    next(err);
  }
}

export async function updateShopLocation(req, res, next) {
  try {
    // Check if location data is provided
    if (!req.body.location.lat || !req.body.location.lng) {
      return next(
        new ErrorResponse("Please provide longitude and latitude", 400)
      );
    }
    if (!req.body.address) {
      return next(new ErrorResponse("Please provide address", 400));
    }

    let shop = await getShopById(req.params.shopId);
    if (!shop) {
      return next(
        new ErrorResponse(`Shop not found with id ${req.params.shopId}`, 404)
      );
    }

    if (shop._id.toString() !== req.user.shop.toString()) {
      return next(new ErrorResponse("Not authorized to update this shop", 403));
    }

    // Transform frontend location format to GeoJSON Point format
    const transformedData = {
      address: req.body.address,
      location: {
        type: "Point",
        coordinates: [req.body.location.lng, req.body.location.lat],
      },
      // Copy any other fields that might be in req.body
      ...Object.fromEntries(
        Object.entries(req.body).filter(
          ([key]) => !["location", "address"].includes(key)
        )
      ),
    };

    // Update just the location
    shop = await updateShopService(req.params.shopId, transformedData);

    res.status(200).json({
      success: true,
      data: {
        shop,
        location: shop.location,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateShopBusinessHours(req, res, next) {
  try {
    // Check if business hours data is provided
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new ErrorResponse("Please provide business hours data", 400));
    }

    let shop = await getShopById(req.params.shopId);

    if (!shop) {
      return next(
        new ErrorResponse(`Shop not found with id ${req.params.shopId}`, 404)
      );
    }

    if (shop._id.toString() !== req.user.shop.toString()) {
      return next(new ErrorResponse("Not authorized to update this shop", 403));
    }

    // Validate the structure of each day's business hours
    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const businessHours = {};

    Object.keys(req.body).forEach((day) => {
      if (validDays.includes(day.toLowerCase())) {
        const dayData = req.body[day];

        // Validate the day data
        if (dayData && typeof dayData === "object") {
          businessHours[day] = {
            open: dayData.open || shop.businessHours[day].open,
            close: dayData.close || shop.businessHours[day].close,
            isOpen:
              dayData.isOpen !== undefined
                ? dayData.isOpen
                : shop.businessHours[day].isOpen,
          };
        }
      }
    });

    // Update the business hours using the service
    shop = await updateShopBusinessHoursService(
      req.params.shopId,
      businessHours
    );

    res.status(200).json({
      success: true,
      data: {
        shop,
        businessHours: shop.businessHours,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateShopImages(req, res, next) {
  try {
    // Check if image data is provided
    if (!req.body.logo && !req.body.coverImage) {
      return next(
        new ErrorResponse(
          "Please provide at least one image URL (logo or coverImage)",
          400
        )
      );
    }

    let shop = await getShopById(req.params.shopId);

    if (!shop) {
      return next(
        new ErrorResponse(`Shop not found with id ${req.params.shopId}`, 404)
      );
    }

    if (shop._id.toString() !== req.user.shop.toString()) {
      return next(new ErrorResponse("Not authorized to update this shop", 403));
    }

    const imageData = {
      logo: req.body.logo,
      coverImage: req.body.coverImage,
    };

    // Update the shop images using the service
    shop = await updateShopImagesService(req.params.shopId, imageData);

    res.status(200).json({
      success: true,
      data: {
        shop,
        images: {
          logo: shop.logo,
          coverImage: shop.coverImage,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
