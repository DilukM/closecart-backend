import express from "express";
import {
  getUserNotificationsHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
  createNotificationHandler,
} from "../controllers/notificationController.js";
import { consumerProtect } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(consumerProtect);

// Get all notifications for a user
router.get("/user/:userId", getUserNotificationsHandler);

// Create a new notification
router.post("/", createNotificationHandler);

// Mark notification as read
router.patch("/:notificationId/read", markAsReadHandler);

// Mark all notifications as read for a user
router.patch("/user/:userId/read-all", markAllAsReadHandler);

// Delete a notification
router.delete("/:notificationId", deleteNotificationHandler);

export default router;
