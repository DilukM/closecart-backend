import { find, create, findByIdAndUpdate, findByIdAndDelete } from "../models/offer.js";

export async function getShopOffers(shopId) {
  return await find({ shop: shopId });
}

export async function createOffer(offerData) {
  return await create(offerData);
}

export async function updateOffer(offerId, updateData) {
  return await findByIdAndUpdate(offerId, updateData, {
    new: true,
    runValidators: true,
  });
}

export async function deleteOffer(offerId) {
  return await findByIdAndDelete(offerId);
}
