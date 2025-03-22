import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performed by is required'],
    },
    details: {
      type: Object,
    },
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);