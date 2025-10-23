const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Counter name is required'],
    unique: true
  },
  sequence_value: {
    type: Number,
    required: [true, 'Sequence value is required'],
    default: 0
  }
}, {
  timestamps: true,
  collection: 'counters'
});

// Note: name field already has unique: true, so index is automatically created

// Static method to get next sequence value
counterSchema.statics.getNextSequence = async function(counterName) {
  const counter = await this.findOneAndUpdate(
    { name: counterName },
    { $inc: { sequence_value: 1 } },
    {
      new: true,
      upsert: true, // Create if doesn't exist
      setDefaultsOnInsert: true
    }
  );
  return counter.sequence_value;
};

// Static method to initialize counter
counterSchema.statics.initializeCounter = async function(counterName, initialValue = 0) {
  const counter = await this.findOneAndUpdate(
    { name: counterName },
    { sequence_value: initialValue },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
  return counter.sequence_value;
};

// Static method to reset counter
counterSchema.statics.resetCounter = async function(counterName, newValue = 0) {
  const counter = await this.findOneAndUpdate(
    { name: counterName },
    { sequence_value: newValue },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
  return counter.sequence_value;
};

module.exports = mongoose.model('Counter', counterSchema);
