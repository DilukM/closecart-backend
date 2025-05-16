import Shop from "../models/shop.js";

export async function getShopById(shopId) {
  return await Shop.findById(shopId);
}

/**
 * Get all shops without filtering
 * @returns {Promise<Array>} - All shops in the database
 */
export async function getAllShopsService() {
  return await Shop.find({});
}

export async function getShopsWithDetails(options = {}) {
  const {
    filters = {},
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
    fields = [],
  } = options;

  // Build query
  let query = Shop.find(filters);

  // Apply sorting
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortDirection };
  query = query.sort(sortOptions);

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const totalShops = await Shop.countDocuments(filters);
  query = query.skip(startIndex).limit(limit);

  // Apply field selection if provided
  if (fields.length > 0) {
    const fieldSelection = fields.join(" ");
    query = query.select(fieldSelection);
  }

  // Execute query
  const shops = await query;

  // Return shops with pagination metadata
  return {
    shops,
    total: totalShops,
    page: parseInt(page),
    pages: Math.ceil(totalShops / limit),
  };
}

export async function updateShop(shopId, updateData) {
  return await Shop.findByIdAndUpdate(shopId, updateData, {
    new: true,
    runValidators: true,
  });
}

/**
 * Update shop business hours
 * @param {string} shopId - The ID of the shop to update
 * @param {Object} businessHours - The business hours data
 * @returns {Promise<Object>} - Updated shop object
 */
export async function updateShopBusinessHours(shopId, businessHours) {
  // Validate that businessHours object contains valid days
  const validDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Create update object with only the provided days
  const businessHoursUpdate = {};

  Object.keys(businessHours).forEach((day) => {
    if (validDays.includes(day.toLowerCase())) {
      // Create the path for the business hours day
      const dayKey = `businessHours.${day.toLowerCase()}`;
      businessHoursUpdate[dayKey] = businessHours[day];
    }
  });

  // Update only the business hours
  const shop = await Shop.findByIdAndUpdate(
    shopId,
    { $set: businessHoursUpdate },
    { new: true, runValidators: true }
  );

  return shop;
}

export async function updateShopImages(shopId, imageData) {
  const updateData = {};

  if (imageData.logo) {
    updateData.logo = imageData.logo;
  }

  if (imageData.coverImage) {
    updateData.coverImage = imageData.coverImage;
  }

  const shop = await Shop.findByIdAndUpdate(
    shopId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return shop;
}

/**
 * Increment shop clicks
 * @param {string} shopId - The ID of the shop
 * @returns {Promise<Object>} - Updated shop object
 */
export async function incrementShopClicks(shopId) {
  return await Shop.findByIdAndUpdate(
    shopId,
    { $inc: { clicks: 1 } },
    { new: true }
  ).select("clicks");
}

/**
 * Increment shop visits
 * @param {string} shopId - The ID of the shop
 * @returns {Promise<Object>} - Updated shop object
 */
export async function incrementShopVisits(shopId) {
  return await Shop.findByIdAndUpdate(
    shopId,
    { $inc: { visits: 1 } },
    { new: true }
  ).select("visits");
}

/**
 * Get shop metrics (clicks and visits)
 * @param {string} shopId - The ID of the shop
 * @returns {Promise<Object>} - Shop metrics object
 */
export async function getShopMetrics(shopId) {
  return await Shop.findById(shopId).select("clicks visits name");
}
