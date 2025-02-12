const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user');
const Shop = require('../models/shop');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ success: true, token });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, shopName, shopAddress } = req.body;
    
    const shop = await Shop.create({ name: shopName, address: shopAddress });
    const user = await User.create({ email, password, shop: shop._id });
    
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};