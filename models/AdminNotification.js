const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['order', 'user', 'system', 'payment'],
    default: 'order'
  },
  data: {
    type: Object,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

adminNotificationSchema.index({ createdAt: -1 });
adminNotificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
