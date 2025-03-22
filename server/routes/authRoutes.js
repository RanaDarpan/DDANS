import express from 'express';
// import { signup, login, logout } from '../controllers/authController.js';
import { signup,login,logout ,forgotPassword,resetPassword} from '../controllers/AuthController.js';

const router = express.Router();

// Define routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forget-password',forgotPassword);
router.post('/reset-password',resetPassword);


export default router;