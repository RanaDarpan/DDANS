// import { google } from 'googleapis';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';

// dotenv.config();
// // Initialize Google Drive API with service account
// const auth = new google.auth.GoogleAuth({
//   keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
//   scopes: ['https://www.googleapis.com/auth/drive'],
// });

// const drive = google.drive({ version: 'v3', auth });

// // Function to upload a file to Google Drive
// export const uploadFileToGoogleDrive = async (filePath, fileName) => {
//   try {
//     const fileMetadata = {
//       name: fileName,
//       parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Folder ID of the shared folder
//     };

//     const media = {
//       mimeType: 'application/pdf',
//       body: fs.createReadStream(filePath),
//     };

//     const response = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: 'id, webViewLink',
//     });

//     // Make the file publicly readable
//     await drive.permissions.create({
//       fileId: response.data.id,
//       requestBody: {
//         role: 'reader',
//         type: 'anyone',
//       },
//     });

//     return response.data.webViewLink; // Public URL of the uploaded file
//   } catch (error) {
//     console.error('Error uploading file to Google Drive:', error.message);
//     throw error;
//   }
// };

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the service account key
const serviceAccountKeyPath = path.resolve(__dirname, '../service-account-key.json'); // Adjust the path
const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountKeyPath, 'utf8'));

// Initialize Google Drive API with service account
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountKey,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Function to upload a file to Google Drive
export const uploadFileToGoogleDrive = async (filePath, fileName) => {
  try {
    console.log('Uploading file:', fileName);
    console.log('Using folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Folder ID of the shared folder
    };

    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    console.log('File uploaded successfully:', response.data);

    // Make the file publicly readable
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return response.data.webViewLink; // Public URL of the uploaded file
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error.message);
    throw error;
  }
};