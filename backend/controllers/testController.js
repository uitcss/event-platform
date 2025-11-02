import EventSetting from "../models/EventSettings.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Round from "../models/Round.js";
import mongoose from "mongoose";

const getActiveQuestions = async (req, res) => {
  try {

    //before sending questions check if user is active
    const {userId} = req;
    const user = await User.findById(userId);
    if(!user || !user.is_active){
      return res.status(403).json({
        success: false,
        message: "User is not active. Please contact admin.",
      });
    }

    // Find the active round
    const activeRound = await Round.findOne({ is_active: true });

    if (!activeRound) {
      return res.status(404).json({
        success: false,
        message: "No active round found",
      });
    }

    // Fetch questions for the active round
    let questions = await Question.find({ round_id: activeRound._id })
      .populate("round_id", "round_name round_id is_active time_limit_minutes");

    // Shuffle questions (Fisher-Yates algorithm)
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    res.status(200).json({
      success: true,
      message: `Questions for active round (${activeRound.round_name}) fetched successfully`,
      round: {
        id: activeRound._id,
        round_id: activeRound.round_id,
        name: activeRound.round_name,
        time_limit_minutes: activeRound.time_limit_minutes,
      },
      questions, // Shuffled array of question objects
    });

  } catch (error) {
    console.error("Error fetching questions for active round:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching questions for active round",
    });
  }
};



const loginUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if(user.is_logged_in){
      return res.status(403).json({ message: "User already logged in from another device." });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ message: "User is not active. Please contact admin." });
    }

    // Get global active round from EventSetting
    const activeRoundSetting = await EventSetting.findOne({ setting_key: "active_round" });
    const globalRound = activeRoundSetting ? parseInt(activeRoundSetting.setting_value) : null;

    if (globalRound === null) {
      return res.status(500).json({ message: "Global round not set. Contact admin." });
    }

    // Check if user's current round matches or exceeds global round
    if (user.current_round !== globalRound) {
      return res.status(403).json({ message: "You are not eligible for this round." });
    }


    user.is_logged_in = true;

    // Successful login
    res.status(200).json({ message: "Login successful", id: user._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Auto-grading utility 
const autoGrade = async (question, userAnswer) => {
  try {
    // Only auto-grade MCQ and TrueFalse
    if (question.question_type !== 'MCQ' && question.question_type !== 'TrueFalse') {
      return {}; // means "no auto-grade"
    }

    // TRUE / FALSE
    if (question.question_type === 'TrueFalse') {
      const correctBool = (typeof question.correct_answer === 'boolean')
        ? question.correct_answer
        : String(question.correct_answer).toLowerCase() === 'true';

      const userBool = (typeof userAnswer === 'boolean')
        ? userAnswer
        : String(userAnswer).toLowerCase() === 'true';

      return { is_correct: userBool === correctBool };
    }

    // MCQ (single-choice only)
    if (question.question_type === 'MCQ') {
      const correct = String(question.correct_answer).trim();
      const user = String(userAnswer).trim();
      return { is_correct: user === correct };
    }

    return {};
  } catch (error) {
    console.error('Error in autoGrade:', error);
    // Return explicit false so caller can mark incorrect if desired
    return { is_correct: false };
  }
};

// submitAnswers controller (no score/feedback fields)
const submitAnswers = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { userId, roundId, answers } = req.body; //answers: [{ questionId, user_answer }, ...]

    if (!userId || !roundId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data. User ID, round ID, and answers array are required."
      });
    }

    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) throw { status: 404, message: "User not found" };

      const round = await Round.findById(roundId).session(session);
      if (!round) throw { status: 404, message: "Round not found" };

      for (const ans of answers) {
        const { questionId, user_answer } = ans;
        if (!questionId) throw { status: 400, message: "Each answer must include a valid questionId" };

        const question = await Question.findById(questionId).session(session);
        if (!question) throw { status: 404, message: `Question with ID ${questionId} not found` };

        // Only auto-grade if the question type is MCQ or TrueFalse (exact strings)
        let gradingResult = {};
        if (question.question_type === 'MCQ' || question.question_type === 'TrueFalse') {
          gradingResult = await autoGrade(question, user_answer);
        }

        const existingSubmission = await Submission.findOne({
          user_id: userId,
          question_id: questionId,
          round_id: roundId
        }).session(session);

        if (existingSubmission) {
          existingSubmission.user_answer = user_answer;
          existingSubmission.submitted_at = new Date();

          // Apply auto-grade result only when available
          if (Object.keys(gradingResult).length > 0) {
            existingSubmission.is_correct = gradingResult.is_correct;
            existingSubmission.auto_graded = true;
          } else {
            existingSubmission.auto_graded = false;
          }

          await existingSubmission.save({ session });
        } else {
          const submissionData = {
            user_id: userId,
            round_id: roundId,
            question_id: questionId,
            user_answer,
            submitted_at: new Date(),
            is_correct: Object.keys(gradingResult).length > 0 ? gradingResult.is_correct : null,
            auto_graded: Object.keys(gradingResult).length > 0
          };

          await Submission.create([submissionData], { session });
        }
      }
          user.is_logged_in = false;
          await user.save();
    });

    session.endSession();
    return res.status(200).json({ success: true, message: "Answers submitted successfully" });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error && error.status && error.message) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    console.error("Error in submitAnswers:", error);
    return res.status(500).json({ success: false, message: "Server error while processing your submission" });
  }
};


export { getActiveQuestions, loginUser, submitAnswers };
