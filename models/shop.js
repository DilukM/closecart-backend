import { Schema, model } from "mongoose";

const ShopSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please add a shop name"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,

    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    enum: [
      "Food",
      "Retail",
      "Hotels & Accommodation",
      "Travel & Transport",
      "Banks",
      "Online",
      "Services",
      "Entertainment",
      "Health",
      "Beauty",
      "Electronics",
      "Fashion",
      "Other",
    ],
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
  },
  socialMediaLinks: {
    type: Map,
    of: String,
    default: {},
  },
  coverImage: {
    type: String,
  },
  logo: {
    type: String,
  },
  businessHours: {
    monday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
      isOpen: { type: Boolean, default: true },
    },
    tuesday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
      isOpen: { type: Boolean, default: true },
    },
    wednesday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
      isOpen: { type: Boolean, default: true },
    },
    thursday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
      isOpen: { type: Boolean, default: true },
    },
    friday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
      isOpen: { type: Boolean, default: true },
    },
    saturday: {
      open: { type: String, default: "10:00" },
      close: { type: String, default: "15:00" },
      isOpen: { type: Boolean, default: true },
    },
    sunday: {
      open: { type: String, default: "10:00" },
      close: { type: String, default: "15:00" },
      isOpen: { type: Boolean, default: false },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("Shop", ShopSchema);
