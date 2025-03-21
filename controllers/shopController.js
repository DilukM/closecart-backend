import ErrorResponse from "../utils/errorResponse.js";
import { getShopById, updateShop as updateShopService } from "../services/shopService.js";

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
    if (!req.body.longitude || !req.body.latitude) {
      return next(
        new ErrorResponse("Please provide longitude and latitude", 400)
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

    // Create the GeoJSON point object
    const locationData = {
      location: {
        type: "Point",
        coordinates: [
          parseFloat(req.body.longitude),
          parseFloat(req.body.latitude)
        ]
      }
    };

    // Update just the location
    shop = await updateShopService(req.params.shopId, locationData);

    res.status(200).json({ 
      success: true, 
      data: {
        shop,
        location: shop.location
      } 
    });
  } catch (err) {
    next(err);
  }
}
