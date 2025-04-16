import Shop from "../models/shop.js";

export async function getShopById(shopId) {
  return await Shop.findById(shopId);
}
export async function getAllShopsService() {
  return await Shop.find();
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
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];
  
  // Create update object with only the provided days
  const businessHoursUpdate = {};
  
  Object.keys(businessHours).forEach(day => {
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