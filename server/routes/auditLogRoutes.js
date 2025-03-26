import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getAllAuditLogs,
  getAuditLogById,
  deleteOldAuditLogs,
  deleteSelectedAuditLogs,
} from '../controllers/auditLogController.js';

const router = express.Router();

// Get all audit logs
router.get('/', authMiddleware(['admin', 'authority']), getAllAuditLogs);

// Get audit log by ID
router.get('/:id', authMiddleware(['admin', 'authority']), getAuditLogById);

// Delete all old audit logs (Admin only)
router.delete('/cleanup', authMiddleware(['admin']), deleteOldAuditLogs);

// Delete selected audit logs (Admin only)
router.delete('/selected', authMiddleware(['admin']), deleteSelectedAuditLogs);

export default router;