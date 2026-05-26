const mongoose = require('mongoose');

const ForumPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  content: String,
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  flagged: { type: Boolean, default: false },
  flagReason: String
});
  

module.exports = mongoose.model('ForumPost', ForumPostSchema);