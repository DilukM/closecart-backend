import Consumer from "../models/consumer.js";
import ErrorResponse from "../utils/errorResponse.js";
import sendEmail from "../utils/sendEmail.js";
import { cloudinary, createUploader } from "../config/cloudinary.js";
import { createNotification } from "../services/notificationService.js";

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ success: true, token });
};

// Configure storage for consumer profile images
const upload = createUploader("closecart_consumer_profiles", (req, file) => {
  // Use the user ID as filename
  const userId = req.params.id || "unknown";
  return `user_${userId}`;
}).single("profileImage");

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const user = await Consumer.create({ name, email, password, phone });

    // Create welcome notification for new user
    await createNotification({
      user: user._id,
      title: "Welcome to CloseCart!",
      message: `Hi ${name}, welcome to CloseCart! We're excited to have you on board.`,
      type: "system",
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    const user = await Consumer.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Create welcome back notification when user signs in
    await createNotification({
      user: user._id,
      title: "Welcome Back!",
      message: `Welcome back to CloseCart, ${user.name}! We've missed you.`,
      type: "system",
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const googleSignIn = async (req, res, next) => {
  try {
    const { email, name, googleId, imageUrl } = req.body;

    if (!email || !googleId) {
      return next(new ErrorResponse("Please provide email and googleId", 400));
    }

    // Check if user exists
    let user = await Consumer.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Create new user if they don't exist
      user = await Consumer.create({
        name,
        email,
        googleId,
        imageUrl,
        password:
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8), // Generate random password
      });
      isNewUser = true;
    } else {
      // Update the googleId if it doesn't exist
      if (!user.googleId) {
        user.googleId = googleId;
        if (imageUrl) user.imageUrl = imageUrl;
        await user.save();
      }
    }

    // Create appropriate notification based on whether user is new or returning
    if (isNewUser) {
      await createNotification({
        user: user._id,
        title: "Welcome to CloseCart!",
        message: `Hi ${name}, thanks for joining CloseCart with your Google account!`,
        type: "system",
      });
    } else {
      await createNotification({
        user: user._id,
        title: "Google Sign-In Successful",
        message: `Welcome back, ${name}! You've successfully signed in with Google.`,
        type: "system",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const getAllProfiles = async (req, res, next) => {
  try {
    const users = await Consumer.find();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const uploadProfileImage = async (req, res, next) => {
  try {
    // Use the middleware as a function with callbacks
    upload(req, res, async function (err) {
      if (err) {
        return next(new ErrorResponse(err.message, 400));
      }

      if (!req.file) {
        return next(new ErrorResponse("Please upload an image file", 400));
      }

      // Get user ID from authenticated user
      const userId = req.params.id;

      // Cloudinary automatically uploads the file
      // req.file.path contains the URL from Cloudinary
      const imageUrl = req.file.path;

      res.status(200).json({
        success: true,
        data: { imageUrl },
      });
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next(
        new ErrorResponse("Please provide both old and new passwords", 400)
      );
    }

    const user = await Consumer.findById(req.user.id).select("+password");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return next(new ErrorResponse("Old password is incorrect", 401));
    }

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, data: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await Consumer.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("There is no user with that email", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,
      birthday: req.body.birthday,
      imageUrl: req.body.imageUrl,
    };

    const user = await Consumer.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const user = await Consumer.findByIdAndDelete(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res
      .status(200)
      .json({ success: true, data: "Profile deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getLikedOffers = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.params.id).populate("likedOffers");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res.status(200).json({ success: true, data: user.likedOffers });
  } catch (err) {
    next(err);
  }
};

export const addLikedOffer = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.body.userId);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const offerId = req.body.offerId;

    if (!offerId) {
      return next(new ErrorResponse("Please provide an offer ID", 400));
    }

    if (user.likedOffers.includes(offerId)) {
      return next(new ErrorResponse("Offer already liked", 400));
    }

    user.likedOffers.push(offerId);
    await user.save();

    res.status(200).json({ success: true, data: user.likedOffers });
  } catch (err) {
    next(err);
  }
};

export const deleteLikedOffer = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.body.userId);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const offerId = req.body.offerId;

    if (!user.likedOffers.includes(offerId)) {
      return next(new ErrorResponse("Offer not found in liked offers", 404));
    }

    user.likedOffers = user.likedOffers.filter(
      (id) => id.toString() !== offerId
    );
    await user.save();

    res.status(200).json({ success: true, data: user.likedOffers });
  } catch (err) {
    next(err);
  }
};

export const getLikedShops = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.params.id).populate("likedShops");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res.status(200).json({ success: true, data: user.likedShops });
  } catch (err) {
    next(err);
  }
};

export const addLikedShop = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.body.userId);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const shopId = req.body.shopId;

    if (!shopId) {
      return next(new ErrorResponse("Please provide a shop ID", 400));
    }

    if (user.likedShops.includes(shopId)) {
      return next(new ErrorResponse("Shop already liked", 400));
    }

    user.likedShops.push(shopId);
    await user.save();

    res.status(200).json({ success: true, data: user.likedShops });
  } catch (err) {
    next(err);
  }
};

export const deleteLikedShop = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.body.userId);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const shopId = req.body.shopId;

    if (!user.likedShops.includes(shopId)) {
      return next(new ErrorResponse("Shop not found in liked shops", 404));
    }

    user.likedShops = user.likedShops.filter((id) => id.toString() !== shopId);
    await user.save();

    res.status(200).json({ success: true, data: user.likedShops });
  } catch (err) {
    next(err);
  }
};

export const getFavoriteShops = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.user.id).populate("favoriteShops");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res.status(200).json({ success: true, data: user.favoriteShops });
  } catch (err) {
    next(err);
  }
};

export const addFavoriteShop = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const shopId = req.body.shopId;

    if (!shopId) {
      return next(new ErrorResponse("Please provide a shop ID", 400));
    }

    if (user.favoriteShops.includes(shopId)) {
      return next(new ErrorResponse("Shop already in favorites", 400));
    }

    user.favoriteShops.push(shopId);
    await user.save();

    res.status(200).json({ success: true, data: user.favoriteShops });
  } catch (err) {
    next(err);
  }
};

export const deleteFavoriteShop = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const shopId = req.params.id;

    if (!user.favoriteShops.includes(shopId)) {
      return next(new ErrorResponse("Shop not found in favorite shops", 404));
    }

    user.favoriteShops = user.favoriteShops.filter(
      (id) => id.toString() !== shopId
    );
    await user.save();

    res.status(200).json({ success: true, data: user.favoriteShops });
  } catch (err) {
    next(err);
  }
};

export const getInterestedCategories = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res.status(200).json({ success: true, data: user.interestedCategories });
  } catch (err) {
    next(err);
  }
};

export const addInterestedCategory = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const category = req.body.category;

    if (!category) {
      return next(new ErrorResponse("Please provide a category", 400));
    }

    if (user.interestedCategories.includes(category)) {
      return next(
        new ErrorResponse("Category already in interested categories", 400)
      );
    }

    user.interestedCategories.push(category);
    await user.save();

    res.status(200).json({ success: true, data: user.interestedCategories });
  } catch (err) {
    next(err);
  }
};

export const deleteInterestedCategory = async (req, res, next) => {
  try {
    const user = await Consumer.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const category = req.params.category;

    if (!user.interestedCategories.includes(category)) {
      return next(
        new ErrorResponse("Category not found in interested categories", 404)
      );
    }

    user.interestedCategories = user.interestedCategories.filter(
      (cat) => cat !== category
    );
    await user.save();

    res.status(200).json({ success: true, data: user.interestedCategories });
  } catch (err) {
    next(err);
  }
};
