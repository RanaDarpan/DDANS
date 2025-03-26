import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['admin', 'authority', 'staff'],
      default: 'staff',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      match: [
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
        'Please provide a valid phone number',
      ],
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    passwordResetToken: {
      type: String,
      default: null, // Optional field for existing users
    },
    passwordResetExpires: {
      type: Date,
      default: null, // Optional field for existing users
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate password reset token
userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); // Generate a random token
  this.passwordResetToken = await bcrypt.hash(resetToken, 10); // Hash the token using bcrypt
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
  return resetToken; // Return the plain token (not hashed)
};

export default mongoose.model('User', userSchema);