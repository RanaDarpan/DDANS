import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { sendEmail } from '../utils/sendEmail.js';

dotenv.config();

// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in a secure cookie
    res.cookie('jwt', token, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 3600000, // 1 hour (matches token expiration)
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout function
export const logout = (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Signup function
export const signup = async (req, res) => {
  try {
    const { email, password, role, name, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({ email, password, role, name, phone });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Login function
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.status(200).json({ token });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };












// // Logout function
// export const logout = (req, res) => {
//   res.status(200).json({ message: 'Logged out successfully' });
// };



// Existing signup and login logic...

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate password reset token
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Save the token and expiration time

    // Create a reset URL (since there's no frontend, use Postman for testing)
    const resetUrl = `${process.env.SERVER_URL}/api/auth/reset-password`; // Use your server URL
    const message = `You are receiving this email because you (or someone else) requested to reset your password. Please use the following token to reset your password:\n\n${resetToken}\n\nThis token is valid for 10 minutes. If you did not request this, please ignore this email.`;

    await sendEmail(user.email, 'Password Reset Request', message);

    res.status(200).json({ message: 'Password reset token sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find user by reset token and ensure it hasn't expired
    const user = await User.findOne({
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Compare the plain token with the hashed token
    const isValidToken = await bcrypt.compare(resetToken, user.passwordResetToken);
    if (!isValidToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined; // Clear the token
    user.passwordResetExpires = undefined; // Clear the expiration time
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

