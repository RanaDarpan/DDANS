import { google } from 'googleapis';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Drive API
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // For local testing
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Function to upload a file to Google Drive
export const uploadFileToGoogleDrive = async (filePath, fileName) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: ['appDataFolder'], // Store in the app-specific folder
    };

    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    // Generate a public URL for the uploaded file
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const result = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink',
    });

    return result.data.webViewLink; // Return the public URL
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error.message);
    throw error;
  }
};