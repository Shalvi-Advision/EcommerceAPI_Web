const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
  },
  otp: {
    type: String,
    required: false
  },
  otpExpiresAt: {
    type: Date,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  },
  lastActiveAt: {
    type: Date
  },
  totalActiveMs: {
    type: Number,
    default: 0
  },
  currentSession: {
    sessionId: { type: String },
    startedAt: { type: Date },
    lastSeenAt: { type: Date },
    durationMs: { type: Number, default: 0 },
    device: {
      platform: { type: String },       // ios | android | web
      deviceId: { type: String },       // optional
      appVersion: { type: String }      // optional
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
// Note: mobile field already has unique: true, so index is automatically created
userSchema.index({ otp: 1, otpExpiresAt: 1 });
userSchema.index({ lastActiveAt: 1 });

// Virtual for checking if OTP is expired
userSchema.virtual('isOtpExpired').get(function() {
  return this.otpExpiresAt ? this.otpExpiresAt < new Date() : true;
});

// Instance method to generate OTP
userSchema.methods.generateOtp = function() {
  // For testing purposes, always return "0000"
  // In production, this would generate a random 4-digit OTP
  this.otp = '0000';
  this.otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 5 minutes from now
  return this.otp;
};

// Instance method to verify OTP
userSchema.methods.verifyOtp = function(enteredOtp) {
  if (this.isOtpExpired) {
    return { valid: false, message: 'OTP has expired' };
  }

  if (this.otp !== enteredOtp) {
    return { valid: false, message: 'Invalid OTP' };
  }

  this.isVerified = true;
  this.otp = undefined;
  this.otpExpiresAt = undefined;
  this.lastLoginAt = new Date();

  return { valid: true, message: 'OTP verified successfully' };
};

// Static method to find user by mobile for authentication
userSchema.statics.findByMobile = function(mobile) {
  return this.findOne({ mobile });
};

// Static method to create user if not exists
userSchema.statics.findOrCreateByMobile = function(mobile) {
  return this.findOne({ mobile }).then(user => {
    if (user) {
      return user;
    }

    const newUser = new this({
      mobile,
      isVerified: false
    });

    return newUser.save();
  });
};

// Generate simple session id (avoid extra dependency)
userSchema.methods._newSessionId = function() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

// Start a new session
userSchema.methods.startSession = function(device) {
  const now = new Date();
  const sessionId = this._newSessionId();
  this.currentSession = {
    sessionId,
    startedAt: now,
    lastSeenAt: now,
    durationMs: 0,
    device: {
      platform: device?.platform,
      deviceId: device?.deviceId,
      appVersion: device?.appVersion
    }
  };
  this.lastActiveAt = now;
  return sessionId;
};

// Touch activity and accumulate duration
// capGapMs avoids adding huge gaps (e.g., app was backgrounded/offline)
userSchema.methods.touchActivity = function(now = new Date(), capGapMs = 5 * 60 * 1000) {
  if (!this.currentSession?.lastSeenAt) {
    this.startSession();
    return;
  }
  const last = new Date(this.currentSession.lastSeenAt).getTime();
  const gap = Math.max(0, Math.min(now.getTime() - last, capGapMs));
  this.currentSession.durationMs += gap;
  this.totalActiveMs += gap;
  this.currentSession.lastSeenAt = now;
  this.lastActiveAt = now;
};

// Utility: whether user is considered active within a window (e.g., 10 minutes)
userSchema.methods.isActiveWithin = function(windowMs = 10 * 60 * 1000) {
  if (!this.lastActiveAt) return false;
  return (Date.now() - new Date(this.lastActiveAt).getTime()) <= windowMs;
};

module.exports = mongoose.model('User', userSchema);
