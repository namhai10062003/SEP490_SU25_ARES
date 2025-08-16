import express from "express";
import { getRecentNotifications, getUnreadNotifications, getNotifications, markAsRead, markAllAsRead, deleteNotification, sendGlobalNotification, getAllNotifications } from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications for a user
router.get("/:userId", getNotifications);

//getUnreadNotifications
router.get("/unread/:userId", getUnreadNotifications);

//get recent notification
router.get("/recent/:userId", getRecentNotifications);

// Mark as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read for a user
router.patch("/:userId/read-all", markAllAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

// Global notification
router.post("/sendAll", sendGlobalNotification);

// Get All notification admin
router.get("/", getAllNotifications);
export default router;