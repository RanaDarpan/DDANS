import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to send an SMS
export const sendSMS = async (to, message) => {
  try {
    const smsResponse = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to, // Recipient phone number
    });

    console.log('SMS sent successfully:', smsResponse.sid);
  } catch (error) {
    console.error('Error sending SMS:', error.message);
  }
};