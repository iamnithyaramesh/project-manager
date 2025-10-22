const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { auth } = require('../middleware/auth');

// Initialize Google Calendar API
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Get calendar events
router.get('/events', auth, async (req, res) => {
  try {
    const { accessToken, email } = req.query;

    if (!accessToken) {
      return res.status(400).json({ message: 'Access token required' });
    }

    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: email || 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];
    res.json({ events });
  } catch (error) {
    console.error('Calendar Error:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events' });
  }
});

// Check employee availability
router.post('/check-availability', auth, async (req, res) => {
  try {
    const { accessToken, startTime, endTime, email } = req.body;

    if (!accessToken || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime,
        timeMax: endTime,
        items: [{ id: email || 'primary' }]
      }
    });

    const busy = response.data.calendars[email || 'primary'].busy || [];
    const isAvailable = busy.length === 0;

    res.json({ isAvailable, busy });
  } catch (error) {
    console.error('Calendar Error:', error);
    res.status(500).json({ message: 'Failed to check availability' });
  }
});

// Create calendar event
router.post('/create-event', auth, async (req, res) => {
  try {
    const { accessToken, summary, description, startTime, endTime, attendees } = req.body;

    if (!accessToken || !summary || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary,
      description,
      start: { dateTime: startTime, timeZone: 'UTC' },
      end: { dateTime: endTime, timeZone: 'UTC' },
      attendees: attendees || []
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    res.json({ event: response.data });
  } catch (error) {
    console.error('Calendar Error:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

module.exports = router;




