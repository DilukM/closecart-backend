import ErrorResponse from "../utils/errorResponse.js";
import User from "../models/user.js";
import Shop from "../models/shop.js";

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ success: true, token });
};

export async function register(req, res, next) {
  try {
    const { email, password, shopName, phone, shopAddress, category } = req.body;

    const shop = await Shop.create({
      name: shopName,
      address: shopAddress,
      category: category,
    });
    const user = await User.create({ email, password, phone, shop: shop._id });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
}
