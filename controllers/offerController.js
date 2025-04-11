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

    if (req.file) {
      req.body.image = req.file.path;
    }

    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, data: offer });
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

    offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: offer });
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
