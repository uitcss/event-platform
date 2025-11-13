import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Question from '../models/Question.js';

// -------------------- GET SUBMISSIONS FOR VALIDATION --------------------
export const getSubmissionsForValidation = async (req, res) => {
  try {
    const submissions = await Submission.find({ is_correct: null })
      .populate([
        { path: 'user_id', select: 'name email' },
        { path: 'question_id', select: 'question_text correct_answer' },
        { path: 'round_id', select: 'round_name' }
      ])
      .lean();

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions for validation:', error);
    res.status(500).json({ message: 'Server error while fetching submissions' });
  }
};


// -------------------- VALIDATE SUBMISSION --------------------
export const validateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    let { is_correct } = req.body;

    // Convert string "true"/"false" to boolean (optional)
    if (typeof is_correct === "string")
      is_correct = is_correct === "true";

    if (typeof is_correct !== "boolean") {
      return res.status(400).json({ message: 'is_correct must be a boolean value' });
    }

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { is_correct },
      { new: true }
    )
      .populate([
        { path: 'user_id', select: 'name email' },
        { path: 'question_id', select: 'question_text correct_answer' },
        { path: 'round_id', select: 'round_name' }
      ])
      .lean();

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


// -------------------- GET VALIDATION STATS --------------------
export const getValidationStats = async (req, res) => {
  try {
    const [
      totalSubmissions,
      pendingValidation,
      correctSubmissions,
      incorrectSubmissions
    ] = await Promise.all([
      Submission.countDocuments(),
      Submission.countDocuments({ is_correct: null }),
      Submission.countDocuments({ is_correct: true }),
      Submission.countDocuments({ is_correct: false })
    ]);

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
