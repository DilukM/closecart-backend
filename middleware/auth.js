import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/errorResponse.js";
import User from "../models/user.js";

export async function protect(req, res, next) {
  let token;
  console.log("req.headers.authorization", req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("token", token);
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
}

export function shopOwnership(req, res, next) {
  if (req.user.shop.toString() !== req.params.shopId) {
    return next(
      new ErrorResponse(`User not authorized to manage this shop`, 403)
    );
  }
  next();
}
