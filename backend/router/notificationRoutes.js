import express from "express";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications for a user
router.get("/:userId", getNotifications);

// Mark as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read for a user
router.patch("/:userId/read-all", markAllAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;