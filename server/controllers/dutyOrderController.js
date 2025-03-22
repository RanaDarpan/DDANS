// import DutyOrder from '../models/DutyOrder.js';
// import AuditLog from '../models/AuditLog.js';
// import Notification from '../models/Notification.js';
// import DigitalSignature from '../models/DigitalSignature.js';

// // Create a new duty order
// export const createDutyOrder = async (req, res) => {
//   try {
//     const { staff_id, duty_date, description } = req.body;

//     // Validate required fields
//     if (!staff_id || !duty_date || !description) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Create duty order
//     const dutyOrder = new DutyOrder({
//       staff_id,
//       duty_date,
//       description,
//       created_by: req.user.id,
//       status: 'pending',
//     });
//     await dutyOrder.save();

//     // Create audit log
//     const auditLog = new AuditLog({
//       action: 'Duty Order Created',
//       performed_by: req.user.id,
//       details: { order_id: dutyOrder._id },
//     });
//     await auditLog.save();

//     // Send notification to staff
//     const notification = new Notification({
//       staff_id,
//       message: `New duty order: ${description}`,
//     });
//     await notification.save();

//     res.status(201).json({ message: 'Duty order created successfully', dutyOrder });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Approve a duty order (for authorities)
// export const approveDutyOrder = async (req, res) => {
//   try {
//     const { orderId, signatureUrl } = req.body;

//     // Validate input
//     if (!orderId || !signatureUrl) {
//       return res.status(400).json({ message: 'Order ID and signature URL are required' });
//     }

//     // Update duty order status
//     const dutyOrder = await DutyOrder.findByIdAndUpdate(
//       orderId,
//       { status: 'approved', approved_by: req.user.id },
//       { new: true }
//     );

//     if (!dutyOrder) {
//       return res.status(404).json({ message: 'Duty order not found' });
//     }

//     // Save digital signature
//     const digitalSignature = new DigitalSignature({
//       order_id: orderId,
//       signed_by: req.user.id,
//       signature_url: signatureUrl,
//     });
//     await digitalSignature.save();

//     // Create audit log
//     const auditLog = new AuditLog({
//       action: 'Duty Order Approved',
//       performed_by: req.user.id,
//       details: { order_id: orderId, signatureUrl },
//     });
//     await auditLog.save();

//     // Send approval notification
//     const notification = new Notification({
//       staff_id: dutyOrder.staff_id,
//       message: `Your duty order has been approved: ${dutyOrder.description}`,
//     });
//     await notification.save();

//     res.status(200).json({ message: 'Duty order approved successfully', dutyOrder });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };







import DutyOrder from '../models/DutyOrder.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import DigitalSignature from '../models/DigitalSignature.js';
// import { sendEmail } from '../utils/emailSender.js';
import { sendEmail } from '../utils/sendEmail.js';
import User from '../models/User.js';

// Create a new duty order
export const createDutyOrder = async (req, res) => {
  try {
    const { staff_id, duty_date, description } = req.body;

    // Validate required fields
    if (!staff_id || !duty_date || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create duty order
    const dutyOrder = new DutyOrder({
      staff_id,
      duty_date,
      description,
      created_by: req.user.id,
      status: 'pending',
    });
    await dutyOrder.save();

    // Create audit log
    const auditLog = new AuditLog({
      action: 'Duty Order Created',
      performed_by: req.user.id,
      details: { order_id: dutyOrder._id },
    });
    await auditLog.save();

    // Send notification to staff
    const notification = new Notification({
      staff_id,
      message: `New duty order: ${description}`,
    });
    await notification.save();

    res.status(201).json({ message: 'Duty order created successfully', dutyOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a duty order (for authorities)
export const approveDutyOrder = async (req, res) => {
  try {
    const { orderId, signatureUrl } = req.body;

    // Validate input
    if (!orderId || !signatureUrl) {
      return res.status(400).json({ message: 'Order ID and signature URL are required' });
    }

    // Update duty order status
    const dutyOrder = await DutyOrder.findByIdAndUpdate(
      orderId,
      { status: 'approved', approved_by: req.user.id },
      { new: true }
    );

    if (!dutyOrder) {
      return res.status(404).json({ message: 'Duty order not found' });
    }

    // Save digital signature
    const digitalSignature = new DigitalSignature({
      order_id: orderId,
      signed_by: req.user.id,
      signature_url: signatureUrl,
    });
    await digitalSignature.save();

    // Create audit log
    const auditLog = new AuditLog({
      action: 'Duty Order Approved',
      performed_by: req.user.id,
      details: { order_id: orderId, signatureUrl },
    });
    await auditLog.save();

    // Send approval notification
    const notification = new Notification({
      staff_id: dutyOrder.staff_id,
      message: `Your duty order has been approved: ${dutyOrder.description}`,
    });
    await notification.save();

    // Fetch staff email
    const staff = await User.findById(dutyOrder.staff_id);
    if (staff && staff.email) {
      const emailSubject = 'Duty Order Approved';
      const emailText = `Your duty order has been approved. Details: ${dutyOrder.description}`;
      await sendEmail(staff.email, emailSubject, emailText);
    }

    res.status(200).json({ message: 'Duty order approved successfully', dutyOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};