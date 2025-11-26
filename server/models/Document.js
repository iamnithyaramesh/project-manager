const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  size: { type: Number, default: 0 },
  contentType: { type: String, default: 'application/octet-stream' },
  text: { type: String, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
