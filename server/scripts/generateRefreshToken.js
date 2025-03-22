import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline'; // Use import instead of require

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url); // Convert file URL to file path
const __dirname = path.dirname(__filename); // Get the directory name

const credentialsPath = path.resolve(__dirname, '../credentials.json'); // Path to credentials.json
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

const oauth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);

// Generate an authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive.file'],
});

console.log('Authorize this app by visiting this URL:', authUrl);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Refresh Token:', tokens.refresh_token);
  } catch (error) {
    console.error('Error retrieving access token:', error.message);
  } finally {
    rl.close();
  }
});