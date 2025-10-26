import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  round_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: true
  },
  question_type: {
    type: String,
    enum: ['MCQ', 'Fill', 'TrueFalse', 'ShortAnswer'],
    required: true
  },
  question_text: {
    type: String,
    required: true
  },
  options: {
    type: [String], // Only used for MCQ
    required: function () {
      return this.question_type === 'MCQ';
    },
    default: undefined
  },
  correct_answer: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
