const path = require('path');
// load .env from the server folder explicitly to avoid cwd issues
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const uri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();
if (!uri) {
  console.error('MONGODB_URI not set in server/.env (checked path:', path.join(__dirname, '.env') + ')');
  // do not throw here to allow the server to show a clearer message later
} else {
  // mask most of the URI when logging to avoid leaking credentials
  const masked = uri.length > 30 ? uri.slice(0, 20) + '...' + uri.slice(-8) : uri;
  console.log('Loaded MONGODB_URI (masked):', masked);
}

async function connect() {
  if (!uri) throw new Error('MONGODB_URI is required to connect to MongoDB');
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('MongoDB connected to', mongoose.connection.host);
}

module.exports = { connect, mongoose };
