import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getDutyOrderStats,
  getUserActivityReport,
  getNotificationStats,
  getCustomDateRangeReport,
} from '../controllers/statsController.js';

const router = express.Router();

// 1. Get duty order statistics (Admin/Authority only)
router.get('/duty-orders', authMiddleware(['admin', 'authority']), getDutyOrderStats);

// 2. Get user activity report (Admin only)
router.get('/user-activity', authMiddleware(['admin']), getUserActivityReport);

// 3. Get notification statistics (Admin/Authority only)
router.get('/notifications', authMiddleware(['admin', 'authority']), getNotificationStats);

// 4. Get custom date range report (Admin only)
router.get('/custom-report', authMiddleware(['admin']), getCustomDateRangeReport);

export default router;