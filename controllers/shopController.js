import ErrorResponse from "../utils/errorResponse.js";
import {
  getShopById,
  updateShop as updateShopService,
  updateShopBusinessHours as updateShopBusinessHoursService,
  updateShopImages as updateShopImagesService,
} from "../services/shopService.js";

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
    if (!req.body.location.coordinates) {
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

    // Update just the location
    shop = await updateShopService(req.params.shopId, req.body);

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

/**
 * @desc    Update shop business hours
 * @route   PUT /api/shops/:shopId/business-hours
 * @access  Private
 */
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
