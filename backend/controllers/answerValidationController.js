import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Question from '../models/Question.js';

// Get all submissions that need validation
export const getSubmissionsForValidation = async (req, res) => {
  try {
    const submissions = await Submission.find({ is_correct: null })
      .populate('user_id', 'name email')
      .populate('question_id', 'question_text correct_answer')
      .populate('round_id', 'round_name');

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions for validation:', error);
    res.status(500).json({ message: 'Server error while fetching submissions' });
  }
};

// Update submission validation status
export const validateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { is_correct } = req.body;

    if (typeof is_correct !== 'boolean') {
      return res.status(400).json({ message: 'is_correct must be a boolean value' });
    }

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { is_correct },
      { new: true }
    )
    .populate('user_id', 'name email')
    .populate('question_id', 'question_text correct_answer')
    .populate('round_id', 'round_name');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.status(200).json({
      message: 'Submission validated successfully',
      submission
    });
  } catch (error) {
    console.error('Error validating submission:', error);
    res.status(500).json({ message: 'Server error while validating submission' });
  }
};

// Get statistics about submissions
export const getValidationStats = async (req, res) => {
  try {
    const totalSubmissions = await Submission.countDocuments();
    const pendingValidation = await Submission.countDocuments({ is_correct: null });
    const correctSubmissions = await Submission.countDocuments({ is_correct: true });
    const incorrectSubmissions = await Submission.countDocuments({ is_correct: false });

    res.status(200).json({
      totalSubmissions,
      pendingValidation,
      validated: totalSubmissions - pendingValidation,
      correctSubmissions,
      incorrectSubmissions
    });
  } catch (error) {
    console.error('Error fetching validation stats:', error);
    res.status(500).json({ message: 'Server error while fetching validation stats' });
  }
};
