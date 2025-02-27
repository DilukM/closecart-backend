
import { Schema, model } from "mongoose";

const LocationSchema = new Schema({
  userId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});



export default model("Location", LocationSchema);