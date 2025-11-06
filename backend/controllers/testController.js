import mongoose from "mongoose";
import EventSetting from "../models/EventSettings.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Round from "../models/Round.js";

// Efficient Fisher-Yates shuffle
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Fast in-memory auto grading
const autoGrade = (question, userAnswer) => {
  try {
    const type = question.question_type;
    const correctAns = String(question.correct_answer).trim().toLowerCase();
    const userAns = String(userAnswer).trim().toLowerCase();

    if (type === "TrueFalse") {
      return { is_correct: correctAns === userAns };
    }
    if (type === "MCQ") {
      return { is_correct: correctAns === userAns };
    }
    return {}; // No auto-grade for other types
  } catch (err) {
    console.error("autoGrade error:", err);
    return { is_correct: false };
  }
};


// Get Active Questions
const getActiveQuestions = async (req, res) => {
  try {
    const { userId } = req.body;

    // Verify active user
    const user = await User.findById(userId).select("is_active current_round");
    if (!user || !user.is_active) {
      return res.status(403).json({
        success: false,
        message: "User is not active. Please contact admin.",
      });
    }

    //  Find active round
    const activeRound = await Round.findOne({ is_active: true }).lean();

    if (!activeRound) {
      return res.status(404).json({
        success: false,
        message: "No active round found.",
      });
    }

    if (activeRound.round_id !== user.current_round) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for this round.",
      });
    }

    // Fetch questions
    const questions = await Question.find(
      { round_id: activeRound._id },
      "-correct_answer" // hide correct answers for participants
    ).lean();

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: "No questions available for this round.",
      });
    }

    //  Shuffle
    const shuffled = shuffleArray(questions);

    return res.status(200).json({
      success: true,
      message: `Fetched ${shuffled.length} questions for ${activeRound.round_name}`,
      round: {
        id: activeRound._id,
        round_id: activeRound.round_id,
        name: activeRound.round_name,
        time_limit_minutes: activeRound.time_limit_minutes,
      },
      questions: shuffled,
    });
  } catch (error) {
    console.error("getActiveQuestions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching questions.",
    });
  }
};

//  Login User
const loginUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email address." });

    if (user.is_logged_in)
      return res
        .status(403)
        .json({ message: "User already logged in on another device." });

    if (!user.is_active)
      return res
        .status(403)
        .json({ message: "User is not active. Contact admin." });

    // Global active round (EventSetting)
    const activeRoundSetting = await EventSetting.findOne(
      { setting_key: "active_round" },
      "setting_value"
    ).lean();

    const globalRound = activeRoundSetting
      ? Number(activeRoundSetting.setting_value)
      : null;

    if (globalRound === null)
      return res
        .status(500)
        .json({ message: "Global round not configured. Contact admin." });

    if (user.current_round !== globalRound)
      return res.status(403).json({
        message: "You are not eligible for this round.",
      });

    user.is_logged_in = true;
    await user.save();

    return res.status(200).json({
      message: "Login successful",
      id: user._id,
    });
  } catch (error) {
    console.error("loginUser Error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
};


//logout user
const logoutUser = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required for logout." });
    }

    const user = await User.findByIdAndUpdate(
      user_id,
      { is_logged_in: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    console.error("logoutUser Error:", error);
    return res.status(500).json({ message: "Server error during logout." });
  }
};


//  Submit Answers
const submitAnswers = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    const { user_id, roundId, answers, time_taken } = req.body;

    // Input validation
    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing user ID",
      });
    }

    if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing round ID",
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answers must be a non-empty array",
      });
    }

    // Validate each answer
    const invalidAnswers = answers.some(answer => 
      !answer.questionId || 
      !mongoose.Types.ObjectId.isValid(answer.questionId) ||
      answer.user_answer === undefined
    );

    if (invalidAnswers) {
      return res.status(400).json({
        success: false,
        message: "Invalid answer format. Each answer must have a valid questionId and user_answer",
      });
    }

    // Fetch user and round in parallel
    const [user, round] = await Promise.all([
      User.findById(user_id).session(session).catch(() => null),
      Round.findById(roundId).session(session).catch(() => null),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found. Please log in again.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Test round not found. The test may have been closed.",
      });
    }

    // Verify active round
    const activeRound = await Round.findOne({ is_active: true })
      .lean()
      .session(session)
      .catch(() => null);

    if (!activeRound) {
      return res.status(400).json({
        success: false,
        message: "No active test round is currently available.",
      });
    }

    if (activeRound._id.toString() !== roundId) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible to submit answers for this round.",
      });
    }

    if (activeRound.round_id !== user.current_round) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for the current test round.",
      });
    }

    // Fetch questions
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({
      _id: { $in: questionIds },
      round_id: roundId,
    })
      .lean()
      .session(session)
      .catch(() => {
        throw new Error("Failed to fetch questions");
      });

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid questions found for submission.",
      });
    }

    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
    const bulkOps = [];
    const currentTime = new Date();

    // Process each answer
    for (const { questionId, user_answer } of answers) {
      const question = questionMap.get(questionId);
      if (!question) continue;

      const grading = autoGrade(question, user_answer);

      bulkOps.push({
        updateOne: {
          filter: {
            user_id: user_id,
            question_id: questionId,
            round_id: roundId,
          },
          update: {
            $set: {
              user_answer: String(user_answer),
              submitted_at: currentTime,
              time_taken: time_taken ?? 0,
              is_correct: grading.is_correct ?? null,
              auto_graded: Object.keys(grading).length > 0,
            },
          },
          upsert: true,
        },
      });
    }

    if (bulkOps.length > 0) {
      // Execute bulk write without session to avoid compatibility issues
      await Submission.bulkWrite(bulkOps);
    }

    // Mark user as logged out
    user.is_logged_in = false;
    await user.save();

    // If we got here, everything was successful
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Your test has been submitted successfully!",
    });
  } catch (error) {
    await session.abortTransaction().catch(() => {});
    
    // Log the full error for debugging
    console.error('Error in submitAnswers:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    // End the session if it's still active
    if (session && session.inTransaction()) {
      await session.endSession().catch(e => console.error('Error ending session:', e));
    }

    console.error("Test submission error:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate submission detected. Please try again.",
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation failed: " + error.message,
      });
    }

    // Handle network/connection errors
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again in a moment.",
      });
    }

    // Default error response
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while processing your submission. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export { getActiveQuestions, loginUser, submitAnswers, logoutUser };
