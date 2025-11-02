import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  round_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: true
  },
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  user_answer: {
    type: String,
    required: true
  },
  is_correct: {
    type: Boolean,
    default: null // Will be set by admin during manual grading
  },
  auto_graded:{
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
