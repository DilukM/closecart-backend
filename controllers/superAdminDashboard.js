import Shop from "../models/shop.js";
import Offer from "../models/offer.js";
import asyncHandler from "../middleware/async.js";
import ErrorResponse from "../utils/errorResponse.js";
import fs from "fs";
import csv from "csv-parser";
import { Readable } from "stream";

// @desc    Create a shop
// @route   POST /api/v1/superadmin/shops
// @access  Private (SuperAdmin only)
export const createShop = asyncHandler(async (req, res, next) => {
  // Add the superadmin id to req.body

  const shop = await Shop.create(req.body);

  res.status(201).json({
    success: true,
    data: shop,
  });
});

// @desc    Get all shops
// @route   GET /api/v1/superadmin/shops
// @access  Private (SuperAdmin only)
export const getShops = asyncHandler(async (req, res, next) => {
  const shops = await Shop.find();

  res.status(200).json({
    success: true,
    count: shops.length,
    data: shops,
  });
});

// @desc    Update shop
// @route   PUT /api/v1/superadmin/shops/:id
// @access  Private (SuperAdmin only)
export const updateShop = asyncHandler(async (req, res, next) => {
  let shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(
      new ErrorResponse(`Shop not found with id of ${req.params.id}`, 404)
    );
  }

  shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: shop,
  });
});

// @desc    Delete shop
// @route   DELETE /api/v1/superadmin/shops/:id
// @access  Private (SuperAdmin only)
export const deleteShop = asyncHandler(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(
      new ErrorResponse(`Shop not found with id of ${req.params.id}`, 404)
    );
  }

  await shop.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Create an offer
// @route   POST /api/v1/superadmin/offers
// @access  Private (SuperAdmin only)
export const createOffer = asyncHandler(async (req, res, next) => {
  // Add the superadmin id to req.body

  const offer = await Offer.create(req.body);

  res.status(201).json({
    success: true,
    data: offer,
  });
});

// @desc    Get all offers
// @route   GET /api/v1/superadmin/offers
// @access  Private (SuperAdmin only)
export const getOffers = asyncHandler(async (req, res, next) => {
  const offers = await Offer.find();

  res.status(200).json({
    success: true,
    count: offers.length,
    data: offers,
  });
});

// @desc    Update offer
// @route   PUT /api/v1/superadmin/offers/:id
// @access  Private (SuperAdmin only)
export const updateOffer = asyncHandler(async (req, res, next) => {
  let offer = await Offer.findById(req.params.id);

  if (!offer) {
    return next(
      new ErrorResponse(`Offer not found with id of ${req.params.id}`, 404)
    );
  }

  offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: offer,
  });
});

// @desc    Delete offer
// @route   DELETE /api/v1/superadmin/offers/:id
// @access  Private (SuperAdmin only)
export const deleteOffer = asyncHandler(async (req, res, next) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return next(
      new ErrorResponse(`Offer not found with id of ${req.params.id}`, 404)
    );
  }

  await offer.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Import shops and offers from CSV
// @route   POST /api/v1/superadmin/import/csv
// @access  Private (SuperAdmin only)
export const importFromCSV = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.csv) {
    return next(new ErrorResponse("Please upload a CSV file", 400));
  }

  const csvFile = req.files.csv;

  // Check if the file is CSV
  if (!csvFile.mimetype.includes("csv")) {
    return next(new ErrorResponse("Please upload a CSV file", 400));
  }

  // Immediately send a response to avoid timeout
  res.status(202).json({
    success: true,
    message: "CSV import started. Processing in the background.",
  });

  // Process in background
  const results = [];
  const shopMap = new Map();
  let createdShopsCount = 0;
  let createdOffersCount = 0;
  const BATCH_SIZE = 50; // Process 50 records at a time

  const bufferStream = Readable.from(csvFile.data.toString());

  bufferStream
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        // Process in batches
        for (let i = 0; i < results.length; i += BATCH_SIZE) {
          const batch = results.slice(i, i + BATCH_SIZE);
          const shopPromises = [];
          const offerPromises = [];

          for (const row of batch) {
            // Process shop
            let shop = shopMap.get(row.shop);

            if (!shop) {
              shop = await Shop.findOne({ name: row.shop });

              if (!shop) {
                const shopData = {
                  name: row.shop,
                  address: row.address,
                  phone: row.phone,
                  category:
                    row.shop_category || row.category || "Uncategorized",
                };

                const shopPromise = Shop.create(shopData).then((newShop) => {
                  shopMap.set(row.shop, newShop);
                  createdShopsCount++;
                  return newShop;
                });

                shopPromises.push(shopPromise);
              } else {
                shopMap.set(row.shop, shop);
              }
            }
          }

          // Wait for all shop creations to complete in this batch
          await Promise.all(shopPromises);

          // Process offers after shops are created
          for (const row of batch) {
            const shop = shopMap.get(row.shop);

            if (shop) {
              const startDate = new Date(
                row.start_date.split("/").reverse().join("-")
              );
              const endDate = new Date(
                row.end_date.split("/").reverse().join("-")
              );

              const offerData = {
                title: row.title,
                imageUrl: row.image_url,
                description: row.description,
                startDate,
                discount: row.discount || 15,
                endDate,
                category: row.category,
                shop: shop._id,
                offerUrl: row.offer_url,
              };

              const offerPromise = Offer.create(offerData).then(() => {
                createdOffersCount++;
              });

              offerPromises.push(offerPromise);
            }
          }

          // Wait for all offer creations to complete in this batch
          await Promise.all(offerPromises);

          // Give a small breathing room for the server
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log(
          `CSV import completed: ${createdShopsCount} shops and ${createdOffersCount} offers created`
        );
      } catch (err) {
        console.error(`Error processing CSV: ${err.message}`);
      }
    });
});
