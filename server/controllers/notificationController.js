import Notification from '../models/Notification.js';

// Get all notifications for a user (Staff only)
export const getNotifications = async (req, res) => {
  try {
    const staffId = req.user.id;

    // Debugging: Log the staff ID
    console.log('Fetching notifications for staff ID:', staffId);

    // Fetch notifications for the logged-in staff member
    const notifications = await Notification.find({ staff_id: staffId })
      .sort({ createdAt: -1 }) // Sort by latest first
      .populate('staff_id', 'name email'); // Populate staff details

    // Debugging: Log the query results
    console.log('Notifications fetched:', notifications);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Mark a notification as read (for Staff only)
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Debugging: Log the notification ID
    console.log('Marking notification as read:', id);

    // Update the notification
    const notification = await Notification.findByIdAndUpdate(
      id,
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
    res.status(500).json({ message: error.message });
  }
};



// Delete all read notifications for the logged-in user (Staff/Authority only)
export const deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all read notifications for the user
    const result = await Notification.deleteMany({ staff_id: userId, is_read: true });

    res.status(200).json({ message: `${result.deletedCount} read notifications deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all notifications for the logged-in user (Staff/Authority only)
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all notifications for the user
    const result = await Notification.deleteMany({ staff_id: userId });

    res.status(200).json({ message: `${result.deletedCount} notifications deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete selected notifications (Staff/Authority only)
export const deleteSelectedNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    // Validate input
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty notification IDs provided' });
    }

    // Delete selected notifications
    const result = await Notification.deleteMany({ _id: { $in: notificationIds }, staff_id: req.user.id });

    res.status(200).json({ message: `${result.deletedCount} notifications deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};