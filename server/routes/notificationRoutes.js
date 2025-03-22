// import express from 'express';
// import { authMiddleware } from '../middleware/authMiddleware.js';
// import Notification from '../models/Notification.js';

// const router = express.Router();

// // Get all notifications for a user (Staff only)
// router.get('/all', authMiddleware(['staff']), async (req, res) => {
//   try {
//     const notifications = await Notification.find({ staff_id: req.user.id });
//     res.status(200).json({ notifications });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// export default router;


import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications for a user (Staff only)
router.get('/all', authMiddleware(['staff']), async (req, res) => {
  try {
    const notifications = await Notification.find({ staff_id: req.user.id });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;