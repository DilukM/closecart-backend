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

  const results = [];
  const shopMap = new Map(); // To track shops we've already processed
  const createdShops = [];
  const createdOffers = [];

  // Create a readable stream from the uploaded file buffer
  const bufferStream = Readable.from(csvFile.data.toString());

  // Parse the CSV data
  bufferStream
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        // Process each row in the CSV
        for (const row of results) {
          // First check if the shop exists in our map
          let shop = shopMap.get(row.shop);

          // If shop doesn't exist in our map, check the database
          if (!shop) {
            shop = await Shop.findOne({ name: row.shop });

            // If shop doesn't exist in the database, create it
            if (!shop) {
              shop = await Shop.create({
                name: row.shop,
                address: row.address,
                phone: row.phone,
                
              });
              createdShops.push(shop);
            }

            // Add shop to our map
            shopMap.set(row.shop, shop);
          }

          // Create the offer linked to the shop
          const startDate = new Date(
            row.start_date.split("/").reverse().join("-")
          );
          const endDate = new Date(row.end_date.split("/").reverse().join("-"));

          const offer = await Offer.create({
            title: row.title,
            imageUrl: row.image_url,
            description: row.description,
            startDate,
            endDate,
            category: row.category,
            shop: shop._id,
            offerUrl: row.offer_url,
            
          });

          createdOffers.push(offer);
        }

        res.status(201).json({
          success: true,
          data: {
            shopsCreated: createdShops.length,
            offersCreated: createdOffers.length,
            message: `Successfully imported ${createdShops.length} shops and ${createdOffers.length} offers`,
          },
        });
      } catch (err) {
        return next(
          new ErrorResponse(`Error processing CSV: ${err.message}`, 500)
        );
      }
    });
});
