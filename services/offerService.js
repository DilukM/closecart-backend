const Offer = require("../models/offer");

exports.getShopOffers = async (shopId) => {
  return await Offer.find({ shop: shopId });
};

exports.createOffer = async (offerData) => {
  return await Offer.create(offerData);
};

exports.updateOffer = async (offerId, updateData) => {
  return await Offer.findByIdAndUpdate(offerId, updateData, {
    new: true,
    runValidators: true,
  });
};

exports.deleteOffer = async (offerId) => {
  return await Offer.findByIdAndDelete(offerId);
};
