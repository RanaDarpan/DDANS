import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAllDigitalSignatures, getDigitalSignatureById } from '../controllers/digitalSignatureController.js';

const router = express.Router();

// Get all digital signatures
router.get('/', authMiddleware(['admin', 'authority']), getAllDigitalSignatures);

// Get digital signature by ID
router.get('/:id', authMiddleware(['admin', 'authority']), getDigitalSignatureById);

export default router;