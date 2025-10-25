const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  round_id: {
    type: Number,
    required: true,
    unique: true // 1,2,3,...
  },
  round_name: {
    type: String,
    required: true
  },
  time_limit_minutes: {
    type: Number,
    required: true,
    default: 0   // Will be set from admin panel
  },
  is_active: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Round = mongoose.model('Round', roundSchema);
export default Round;
