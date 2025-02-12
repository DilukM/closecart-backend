import { Schema, model } from "mongoose";

const ShopSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please add a shop name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("Shop", ShopSchema);
