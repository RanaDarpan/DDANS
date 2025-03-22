// import express from 'express';
// import { authMiddleware } from '../middleware/authMiddleware.js';
// import { createDutyOrder, approveDutyOrder } from '../controllers/dutyOrderController.js';

// const Dutyrouter = express.Router();

// // Create duty order (Admin only)
// Dutyrouter.post('/create', authMiddleware, createDutyOrder);

// // Approve duty order (Authority only)
// Dutyrouter.post('/approve', authMiddleware, approveDutyOrder);

// export default Dutyrouter;

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createDutyOrder,approveDutyOrder } from '../controllers/DutyOrderController.js';

const router = express.Router();

// Create duty order (Admin only)
router.post('/create', authMiddleware(['admin']), createDutyOrder);

// Approve duty order (Authority only)
router.post('/approve', authMiddleware(['authority']), approveDutyOrder);

export default router;