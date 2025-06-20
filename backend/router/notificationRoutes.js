import express from "express";
import { getNotifications, markAsRead, deleteNotification } from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications for a user
router.get("/:userId", getNotifications);

// Mark as read
router.patch("/:id/read", markAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;