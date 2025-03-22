import mongoose from 'mongoose';

const digitalSignatureSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DutyOrder',
      required: [true, 'Order ID is required'],
    },
    signed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Signed by is required'],
    },
    signature_url: {
      type: String,
      required: [true, 'Signature URL is required'],
      match: [
        /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/,
        'Please provide a valid URL for the signature',
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model('DigitalSignature', digitalSignatureSchema);