import DutyOrder from '../models/DutyOrder.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import DigitalSignature from '../models/DigitalSignature.js';
// import { sendEmail } from '../utils/emailSender.js';
import { sendEmail } from '../utils/sendEmail.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import axios from 'axios'; // To fetch the signature image
import { fileURLToPath } from 'url';
import { uploadFileToGoogleDrive } from '../utils/googleDriveUploader.js';



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

    // Validate signature URL format
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
    if (!urlRegex.test(signatureUrl)) {
      return res.status(400).json({ message: 'Invalid signature URL format' });
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

    // Fetch the signature image
    let signatureImage;
    try {
      const response = await axios.get(signatureUrl, { responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'];
      if (!contentType.startsWith('image/')) {
        return res.status(400).json({ message: 'The provided URL does not point to a valid image' });
      }
      signatureImage = response.data; // Binary image data
    } catch (error) {
      return res.status(400).json({ message: 'Failed to fetch signature image. Ensure the URL is valid.' });
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

    // Fetch additional details for the PDF
    const staff = await User.findById(dutyOrder.staff_id);
    const authority = await User.findById(req.user.id);

    // Generate a PDF with enhanced content
    const pdfFileName = `DutyOrder_${dutyOrder._id}.pdf`;
    const pdfPath = path.resolve(__dirname, '../public/files', pdfFileName); // Save locally first
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Pipe the PDF content to a file
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Add professional header with color
    doc.fillColor('#007BFF').fontSize(20).text('Duty Order Approval Letter', { align: 'center' }).moveDown(0.5);
    doc.fillColor('#333').fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' }).moveDown(0.5);

    // Add recipient details
    doc.fillColor('#333').fontSize(14).text(`To: ${staff?.name || 'Unknown Staff Member'}`);
    doc.fontSize(10).text(`Staff ID: ${dutyOrder.staff_id}`);
    doc.text(`Email: ${staff?.email || 'No email provided'}`).moveDown(0.5);

    // Add order details
    doc.fillColor('#007BFF').fontSize(14).text('Order Details:');
    doc.fillColor('#333').fontSize(10).text(`Order ID: ${dutyOrder._id}`);
    doc.text(`Duty Date: ${new Date(dutyOrder.duty_date).toLocaleDateString()}`);
    doc.text(`Description: ${dutyOrder.description}`);
    doc.text(`Status: ${dutyOrder.status}`).moveDown(0.5);

    // Add approver details
    doc.fillColor('#007BFF').fontSize(14).text('Approved By:');
    doc.fillColor('#333').fontSize(10).text(`Name: ${authority?.name || 'Unknown Authority'}`);
    doc.text(`Email: ${authority?.email || 'No email provided'}`);
    doc.text(`Approval Timestamp: ${new Date().toLocaleString()}`).moveDown(0.5);

    // Embed the signature image
    if (signatureImage) {
      doc.fillColor('#007BFF').fontSize(12).text('Authority Signature:');
      doc.image(signatureImage, {
        fit: [150, 75], // Adjust size as needed
        align: 'center',
        valign: 'center',
      });
    }

    // Ensure footer fits on the same page
    const bottomMargin = 30; // Distance from the bottom of the page
    const footerHeight = 40; // Height reserved for footer (line + text)

    // Check remaining space on the current page
    const remainingSpace = doc.page.height - doc.y - bottomMargin;
    if (remainingSpace < footerHeight) {
      doc.addPage(); // Move to a new page if there isn't enough space
    }

    // Calculate footer position
    const footerY = doc.page.height - bottomMargin;

    // Add colored line above the footer
   // Add footer text above the line
doc.fillColor('#333').fontSize(8).text(
  'Thank you for your cooperation. This is a system-generated document and does not require a physical signature.',
  50,
  footerY - footerHeight + 5, // Adjusted y-coordinate to move text above the line
  { align: 'center', width: doc.page.width - 100 }
);

    // Finalize the PDF
    doc.end();

    // Wait for the file to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Upload the PDF to Google Drive
    const publicPdfUrl = await uploadFileToGoogleDrive(pdfPath, pdfFileName);

    // Save the PDF URL in the database
    dutyOrder.signature_file_url = publicPdfUrl;
    await dutyOrder.save();

    // Notify the staff via email
    if (staff && staff.email) {
      const emailSubject = 'Your Duty Order Has Been Approved!';
      const emailText = `
Dear ${staff?.name || 'Team Member'},

We are pleased to inform you that your duty order has been successfully approved by ${authority?.name || 'an authority'}.

Order Details:
- Order ID: ${dutyOrder._id}
- Duty Date: ${new Date(dutyOrder.duty_date).toLocaleDateString()}
- Description: ${dutyOrder.description}

You can view and download the approved duty order letter using the following link:
${publicPdfUrl}

If you have any questions or need further assistance, please feel free to reach out.

Thank you for your cooperation!

Best regards,
${authority?.name || 'Management Team'}
`;

      await sendEmail(staff.email, emailSubject, emailText);
    }

    res.status(200).json({
      message: 'Duty order approved successfully',
      dutyOrder,
      pdfUrl: publicPdfUrl, // Include the PDF URL in the response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







// Get all duty orders (for admin/authority)
export const getAllDutyOrders = async (req, res) => {
  try {
    const dutyOrders = await DutyOrder.find().populate('staff_id', 'name email');
    res.status(200).json(dutyOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get duty order by ID (for admin/authority)
export const getDutyOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const dutyOrder = await DutyOrder.findById(id).populate('staff_id', 'name email');
    if (!dutyOrder) {
      return res.status(404).json({ message: 'Duty order not found' });
    }
    res.status(200).json(dutyOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update duty order (for admin/authority)
export const updateDutyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await DutyOrder.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Duty order not found' });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete duty order (for admin/authority)
export const deleteDutyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await DutyOrder.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Duty order not found' });
    }
    res.status(200).json({ message: 'Duty order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// Reject a duty order (Authority only)
export const rejectDutyOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    // Validate input
    if (!orderId || !reason) {
      return res.status(400).json({ message: 'Order ID and rejection reason are required' });
    }

    // Update duty order status
    const dutyOrder = await DutyOrder.findByIdAndUpdate(
      orderId,
      { status: 'rejected', rejected_by: req.user.id, rejection_reason: reason },
      { new: true }
    );

    if (!dutyOrder) {
      return res.status(404).json({ message: 'Duty order not found' });
    }

    // Create audit log
    const auditLog = new AuditLog({
      action: 'Duty Order Rejected',
      performed_by: req.user.id,
      details: { order_id: orderId, reason },
    });
    await auditLog.save();

    // Send notification to staff
    const notification = new Notification({
      staff_id: dutyOrder.staff_id,
      message: `Your duty order has been rejected: ${reason}`,
    });
    await notification.save();

    res.status(200).json({ message: 'Duty order rejected successfully', dutyOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel a duty order (Admin/Authority only)
export const cancelDutyOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    // Validate input
    if (!orderId || !reason) {
      return res.status(400).json({ message: 'Order ID and cancellation reason are required' });
    }

    // Update duty order status
    const dutyOrder = await DutyOrder.findByIdAndUpdate(
      orderId,
      { status: 'cancelled', cancelled_by: req.user.id, cancellation_reason: reason },
      { new: true }
    );

    if (!dutyOrder) {
      return res.status(404).json({ message: 'Duty order not found' });
    }

    // Create audit log
    const auditLog = new AuditLog({
      action: 'Duty Order Cancelled',
      performed_by: req.user.id,
      details: { order_id: orderId, reason },
    });
    await auditLog.save();

    // Send notification to staff
    const notification = new Notification({
      staff_id: dutyOrder.staff_id,
      message: `Your duty order has been cancelled: ${reason}`,
    });
    await notification.save();

    res.status(200).json({ message: 'Duty order cancelled successfully', dutyOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};