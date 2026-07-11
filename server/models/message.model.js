const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      trim: true,
      maxlength: [40, 'Username must be 40 characters or fewer.'],
    },
    message: {
      type: String,
      required: [true, 'Message text is required.'],
      trim: true,
      maxlength: [2000, 'Message must be 2000 characters or fewer.'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Chat history is always fetched sorted by creation time — index it.
messageSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
