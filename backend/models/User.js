import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  university: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: {
    type: String,
    required: true
  },
//   payment_screenshot_url: {
//     type: String,
//     required: true
//   },
//   payment_status: {
//     type: String,
//     enum: ['Pending', 'Approved'],
//     default: 'Pending'
//   },
  is_active: {
    type: Boolean,
    default: false
  },
  current_round: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
