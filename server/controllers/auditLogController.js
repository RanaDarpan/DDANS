import AuditLog from '../models/AuditLog.js';

// Get all audit logs (for admin/authority)
export const getAllAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 }) // Sort by latest first
      .populate('performed_by', 'name email'); // Populate user details
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get audit log by ID (for admin/authority)
export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await AuditLog.findById(id).populate('performed_by', 'name email');
    if (!log) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all old audit logs (Admin only)
export const deleteOldAuditLogs = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Delete logs older than 30 days
    const result = await AuditLog.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });

    res.status(200).json({ message: `${result.deletedCount} old audit logs deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete selected audit logs (Admin only)
export const deleteSelectedAuditLogs = async (req, res) => {
  try {
    const { logIds } = req.body;

    // Validate input
    if (!Array.isArray(logIds) || logIds.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty log IDs provided' });
    }

    // Delete selected logs
    const result = await AuditLog.deleteMany({ _id: { $in: logIds } });

    res.status(200).json({ message: `${result.deletedCount} audit logs deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};