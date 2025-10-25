const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  round_id: {
    type: Number,
    required: true,
    ref: 'Round' // References the round (1,2,3)
  },
  question_type: {
    type: String,
    enum: ['MCQ', 'Fill', 'TrueFalse', 'PseudoCode', 'CodeSnippet'],
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
