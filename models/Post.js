const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mediaType: {
    type: String,
    enum: ['text', 'photo', 'video'],
    required: true,
  },
  mediaUrl: {
    type: String,
    required: function() { return this.mediaType === 'photo' || this.mediaType === 'video'; }
  },
  caption: {
    type: String,
    trim: true,
    default: '',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Post', postSchema);