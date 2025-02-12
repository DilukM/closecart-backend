const ErrorResponse = require('../utils/errorResponse');
const shopService = require('../services/shopService');

exports.getShop = async (req, res, next) => {
  try {
    const shop = await shopService.getShopById(req.params.shopId);
    
    if (!shop) {
      return next(new ErrorResponse(`Shop not found with id ${req.params.shopId}`, 404));
    }
    
    if (shop._id.toString() !== req.user.shop.toString()) {
      return next(new ErrorResponse('Not authorized to access this shop', 403));
    }

    res.status(200).json({ success: true, data: shop });
  } catch (err) {
    next(err);
  }
};

exports.updateShop = async (req, res, next) => {
  try {
    let shop = await shopService.getShopById(req.params.shopId);
    
    if (!shop) {
      return next(new ErrorResponse(`Shop not found with id ${req.params.shopId}`, 404));
    }
    
    if (shop._id.toString() !== req.user.shop.toString()) {
      return next(new ErrorResponse('Not authorized to update this shop', 403));
    }

    shop = await shopService.updateShop(req.params.shopId, req.body);
    res.status(200).json({ success: true, data: shop });
  } catch (err) {
    next(err);
  }
};