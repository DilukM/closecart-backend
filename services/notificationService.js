import Notification from "../models/notification.js";

export const getUserNotifications = async (userId) => {
  try {
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });

    return notifications;
  } catch (error) {
    throw new Error(`Error fetching notifications: ${error.message}`);
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new Error("Notification not found");
    }

    return notification;
  } catch (error) {
    throw new Error(`Error marking notification as read: ${error.message}`);
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return {
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} notifications marked as read`,
    };
  } catch (error) {
    throw new Error(
      `Error marking all notifications as read: ${error.message}`
    );
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      throw new Error("Notification not found");
    }

    return { message: "Notification deleted successfully" };
  } catch (error) {
    throw new Error(`Error deleting notification: ${error.message}`);
  }
};

export const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    throw new Error(`Error creating notification: ${error.message}`);
  }
};
