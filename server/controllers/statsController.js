import DutyOrder from '../models/DutyOrder.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

// 1. Get duty order statistics (Admin/Authority only)
export const getDutyOrderStats = async (req, res) => {
  try {
    const totalOrders = await DutyOrder.countDocuments();
    const approvedOrders = await DutyOrder.countDocuments({ status: 'approved' });
    const rejectedOrders = await DutyOrder.countDocuments({ status: 'rejected' });
    const pendingOrders = await DutyOrder.countDocuments({ status: 'pending' });

    res.status(200).json({
      totalOrders,
      approvedOrders,
      rejectedOrders,
      pendingOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get user activity report (Admin only)
export const getUserActivityReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query based on date range
    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .populate('performed_by', 'name email');

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get notification statistics (Admin/Authority only)
export const getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const readNotifications = await Notification.countDocuments({ is_read: true });
    const unreadNotifications = await Notification.countDocuments({ is_read: false });

    res.status(200).json({
      totalNotifications,
      readNotifications,
      unreadNotifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get custom date range report (Admin only)
export const getCustomDateRangeReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Fetch data within the date range
    const dutyOrders = await DutyOrder.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    const auditLogs = await AuditLog.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).populate('performed_by', 'name email');

    const notifications = await Notification.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    res.status(200).json({
      dutyOrders,
      auditLogs,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};