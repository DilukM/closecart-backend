import SuperAdmin from "../models/SuperAdmin.js";
import asyncHandler from "../middleware/async.js";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Register superadmin
// @route   POST /api/v1/superadmin/register
// @access  Public
export const registerSuperAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Create superadmin
  const superAdmin = await SuperAdmin.create({
    name,
    email,
    password,
  });

  sendTokenResponse(superAdmin, 200, res);
});

// @desc    Login superadmin
// @route   POST /api/v1/superadmin/login
// @access  Public
export const loginSuperAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for superadmin
  const superAdmin = await SuperAdmin.findOne({ email }).select("+password");

  if (!superAdmin) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await superAdmin.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(superAdmin, 200, res);
});

// @desc    Get current logged in superadmin
// @route   GET /api/v1/superadmin/me
// @access  Private
export const getSuperAdminProfile = asyncHandler(async (req, res, next) => {
  const superAdmin = await SuperAdmin.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: superAdmin,
  });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (superAdmin, statusCode, res) => {
  // Create token
  const token = superAdmin.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
