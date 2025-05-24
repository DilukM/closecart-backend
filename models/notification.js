import { Schema, model } from "mongoose";

const NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Consumer",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["info", "success", "warning", "error","system","order","offer","shop"],
    default: "info",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
NotificationSchema.index({ user: 1, createdAt: -1 });

export default model("Notification", NotificationSchema);
