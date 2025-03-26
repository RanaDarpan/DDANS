import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  getAllStaff,
  updateUser,
  deleteUser,
  createStaff,
} from '../controllers/userController.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authMiddleware(['admin']), getAllUsers);

// Get all staff members (Admin/Authority only)
router.get('/staff', authMiddleware(['admin', 'authority']), getAllStaff);


router.post('/staff/create',authMiddleware(['admin']),createStaff);


// Update user details (Admin only)
router.put('/:id', authMiddleware(['admin']), updateUser);

// Delete user (Admin only)
router.delete('/:id', authMiddleware(['admin']), deleteUser);

export default router;