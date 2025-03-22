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
    required: [true, "Please add a shop description"],
    maxlength: [500, "Description cannot be more than 500 characters"]
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    enum: [
      "Food", "Retail", "Services", "Entertainment", 
      "Health", "Beauty", "Electronics", "Fashion", "Other"
    ]
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  socialMediaLinks: {
    type: Map,
    of: String,
    default: {}
    // Example: { "facebook": "https://facebook.com/shopname", "instagram": "https://instagram.com/shopname" }
  },
  coverImageUrl: {
    type: String,
    default: "https://via.placeholder.com/1200x300"
  },
  logoUrl: {
    type: String,
    default: "https://via.placeholder.com/200x200"
  },
  businessHours: {
    monday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "17:00" },
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: { type: String, default: "10:00" },
      close: { type: String, default: "15:00" },
      isOpen: { type: Boolean, default: true }
    },
    sunday: {
      open: { type: String, default: "10:00" },
      close: { type: String, default: "15:00" },
      isOpen: { type: Boolean, default: false }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("Shop", ShopSchema);