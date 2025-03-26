import DigitalSignature from '../models/DigitalSignature.js';

// Get all digital signatures (for admin/authority)
export const getAllDigitalSignatures = async (req, res) => {
  try {
    const signatures = await DigitalSignature.find()
      .populate('order_id', 'description')
      .populate('signed_by', 'name email');
    res.status(200).json(signatures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get digital signature by ID (for admin/authority)
export const getDigitalSignatureById = async (req, res) => {
  try {
    const { id } = req.params;
    const signature = await DigitalSignature.findById(id)
      .populate('order_id', 'description')
      .populate('signed_by', 'name email');
    if (!signature) {
      return res.status(404).json({ message: 'Digital signature not found' });
    }
    res.status(200).json(signature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};