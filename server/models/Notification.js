import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);