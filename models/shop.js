import { Schema, model } from "mongoose";

const ShopSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please add a shop name"],
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("Shop", ShopSchema);