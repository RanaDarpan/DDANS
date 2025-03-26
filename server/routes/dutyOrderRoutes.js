import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createDutyOrder,
  approveDutyOrder,
  getAllDutyOrders,
  getDutyOrderById,
  updateDutyOrder,
  deleteDutyOrder,
  rejectDutyOrder,
  cancelDutyOrder,
} from '../controllers/DutyOrderController.js';

const router = express.Router();

// Create duty order (Admin only)
router.post('/create', authMiddleware(['admin']), createDutyOrder);

// Approve duty order (Authority only)
router.post('/approve', authMiddleware(['authority']), approveDutyOrder);

// Get all duty orders (Admin/Authority only)
router.get('/', authMiddleware(['admin', 'authority']), getAllDutyOrders);

// Get duty order by ID (Admin/Authority only)
router.get('/:id', authMiddleware(['admin', 'authority']), getDutyOrderById);

// Update duty order (Admin/Authority only)
router.put('/:id', authMiddleware(['admin', 'authority']), updateDutyOrder);

// Delete duty order (Admin only)
router.delete('/:id', authMiddleware(['admin']), deleteDutyOrder);

router.post('/reject',authMiddleware(['authority']),rejectDutyOrder);
router.post('/cancel',authMiddleware(['admin','authority']),cancelDutyOrder);

export default router;