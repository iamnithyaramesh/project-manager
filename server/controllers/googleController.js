const { generateAuthUrl, getTokensFromCode, createCalendarEvent } = require('../services/googleService');

exports.authRedirect = (req, res) => {
  const url = generateAuthUrl();
  res.redirect(url);
};

exports.callback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing code');
    const tokens = await getTokensFromCode(code);
    // return tokens to user (persist to DB in production)
    res.json({ tokens });
  } catch (err) {
    console.error('Google callback error', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { tokens, event } = req.body;
    if (!tokens || !event) return res.status(400).json({ error: 'tokens and event required' });
    const created = await createCalendarEvent(tokens, event);
    res.json(created);
  } catch (err) {
    console.error('Create event error', err);
    res.status(500).json({ error: err.message });
  }
};