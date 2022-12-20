import { google } from 'googleapis';

const oauth2Client = new google.auth.GoogleAuth({
  keyFile: 'services/api/google/kiwi-b6082-0ae77d0d7acd.json',
  scopes: ['https://www.googleapis.com/auth/firebase'],
});

export default oauth2Client;
