import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ConsumerSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  phone: {
    type: String,
    unique: true,
    required: [true, "Please add a phone number"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "other",
    required: [true, "Please select a gender"],
  },
  birthday: {
    type: Date,
    required: [true, "Please add a birthday"],
    default: Date.now,
  },
  favoriteShops: [
    {
      type: Schema.ObjectId,
      ref: "Shop",
    },
  ],
  likedShops: [
    {
      type: Schema.ObjectId,
      ref: "Shop",
    },
  ],
  likedOffers: [
    {
      type: Schema.ObjectId,
      ref: "Offer",
    },
  ],
  interestedCategories: [
    {
      type: String,
    },
  ],
  interestedTags: [
    {
      type: String,
    },
  ],
  locationHistory: [
    {
      type: String,
    },
  ],
  imageUrl: {
    type: String,
    required: [true, "Please add an image URL"],
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Encrypt password using bcrypt
ConsumerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
ConsumerSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
ConsumerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
ConsumerSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

export default model("Consumer", ConsumerSchema);
