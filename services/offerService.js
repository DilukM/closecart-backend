import Offer from "../models/offer.js";

export async function getShopOffers(shopId) {
  return await Offer.find({ shop: shopId });
}

export async function getAllOffers() {
  return await Offer.find();
}

export async function createOffer(offerData) {
  return await Offer.create(offerData);
}

export async function updateOffer(offerId, updateData) {
  return await Offer.findByIdAndUpdate(offerId, updateData, {
    new: true,
    runValidators: true,
  });
}

export async function deleteOffer(offerId) {
  return await Offer.findByIdAndDelete(offerId);
}

export async function getRelatedOffers(queryParams) {
  const filter = {};

  // Add category filter if provided
  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  // Add tags filter if provided
  if (queryParams.tags) {
    // Handle both single tag and array of tags
    const tags = Array.isArray(queryParams.tags)
      ? queryParams.tags
      : [queryParams.tags];
    filter.tags = { $in: tags };
  }

  // Exclude the current offer if provided
  if (queryParams.exclude) {
    // Use Mongoose's ObjectId for proper comparison
    filter._id = { $ne: queryParams.exclude };
  }

  // Exclude expired offers - where end date is in the past
  const currentDate = new Date();
  filter.endDate = { $gt: currentDate };

  // Parse limit parameter or use default
  const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 4;

  console.log("Finding related offers with filter:", filter); // Add logging to debug

  // Execute query with filters and limit
  return await Offer.find(filter).limit(limit);
}

/**
 * Increment offer clicks
 * @param {string} offerId - The ID of the offer
 * @returns {Promise<Object>} - Updated offer object
 */
export async function incrementOfferClicks(offerId) {
  return await Offer.findByIdAndUpdate(
    offerId,
    { $inc: { clicks: 1 } },
    { new: true }
  ).select('clicks');
}

/**
 * Get offer metrics (clicks)
 * @param {string} offerId - The ID of the offer
 * @returns {Promise<Object>} - Offer metrics object
 */
export async function getOfferMetrics(offerId) {
  return await Offer.findById(offerId).select('clicks title');
}
