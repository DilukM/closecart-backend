import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
} from "../services/notificationService.js";

// @desc    Get user notifications
// @route   GET /api/notifications/user/:userId
// @access  Private
export const getUserNotificationsHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the authenticated user is requesting their own notifications
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          error: "Not authorized to access these notifications",
        });
    }

    const notifications = await getUserNotifications(userId);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:notificationId/read
// @access  Private
export const markAsReadHandler = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await markNotificationAsRead(notificationId);

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/user/:userId/read-all
// @access  Private
export const markAllAsReadHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the authenticated user is updating their own notifications
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          error: "Not authorized to update these notifications",
        });
    }

    const result = await markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:notificationId
// @access  Private
export const deleteNotificationHandler = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await deleteNotification(notificationId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
export const createNotificationHandler = async (req, res) => {
  try {
    const { user, title, message, type, link } = req.body;

    // Basic validation
    if (!user || !title || !message) {
      return res.status(400).json({
        success: false,
        error: "Please provide user, title and message fields",
      });
    }

    const notification = await createNotification({
      user,
      title,
      message,
      type: type || "info",
      link,
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: "Notification created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
