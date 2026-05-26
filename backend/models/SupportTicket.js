const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  message: String,
  response: String,
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date
});

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);