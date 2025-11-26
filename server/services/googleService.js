const { google } = require('googleapis');
require('dotenv').config();

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

function createOAuthClient() {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function generateAuthUrl(scopes = ['https://www.googleapis.com/auth/calendar.events']) {
  const oAuth2Client = createOAuthClient();
  return oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
}

async function getTokensFromCode(code) {
  const oAuth2Client = createOAuthClient();
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens; // { access_token, refresh_token, expiry_date, ... }
}

async function createCalendarEvent(tokens, calendarEvent) {
  const oAuth2Client = createOAuthClient();
  oAuth2Client.setCredentials(tokens);
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  const res = await calendar.events.insert({ calendarId: 'primary', requestBody: calendarEvent });
  return res.data;
}

module.exports = { generateAuthUrl, getTokensFromCode, createCalendarEvent };