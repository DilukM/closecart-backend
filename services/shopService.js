const Shop = require('../models/shop');

exports.getShopById = async (shopId) => {
  return await Shop.findById(shopId);
};

exports.updateShop = async (shopId, updateData) => {
  return await Shop.findByIdAndUpdate(shopId, updateData, {
    new: true,
    runValidators: true
  });
};