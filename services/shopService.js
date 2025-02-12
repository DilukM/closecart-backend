import Shop from "../models/shop.js";

export async function getShopById(shopId) {
  return await Shop.findById(shopId);
}

export async function updateShop(shopId, updateData) {
  return await Shop.findByIdAndUpdate(shopId, updateData, {
    new: true,
    runValidators: true,
  });
}
