import express from 'express';
// import { signup, login, logout } from '../controllers/authController.js';
import { signup,login,logout } from '../controllers/AuthController.js';

const router = express.Router();

// Define routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

export default router;