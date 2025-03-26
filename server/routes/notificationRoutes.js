import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markNotificationAsRead,
  deleteReadNotifications,
  deleteAllNotifications,
  deleteSelectedNotifications,
} from '../controllers/notificationController.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications for the logged-in staff member
router.get('/', authMiddleware(['staff', 'authority']), getNotifications);

// Mark a notification as read
router.put('/:id/read', authMiddleware(['staff', 'authority']), markNotificationAsRead);

// Delete all read notifications (Staff/Authority only)
router.delete('/read', authMiddleware(['staff', 'authority']), deleteReadNotifications);

// Delete all notifications (Staff/Authority only)
router.delete('/all', authMiddleware(['staff', 'authority']), deleteAllNotifications);

// Delete selected notifications (Staff/Authority only)
router.delete('/selected', authMiddleware(['staff', 'authority']), deleteSelectedNotifications);

// Get all notifications for testing purposes (Admin only)
router.get('/all', authMiddleware(['admin']), async (req, res) => {
  try {
    const notifications = await Notification.find().populate('staff_id', 'name email');
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;