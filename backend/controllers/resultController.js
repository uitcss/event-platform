import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Round from '../models/Round.js';
import EventSetting from '../models/EventSettings.js';

// Helper function to get question weight
const getQuestionWeight = async () => {
  const questionWeightSetting = await EventSetting.findOne({ setting_key: 'question_weight' });
  if (!questionWeightSetting) {
    throw new Error('Question weight not configured');
  }
  return typeof questionWeightSetting.setting_value === 'string' 
    ? parseFloat(questionWeightSetting.setting_value) 
    : Number(questionWeightSetting.setting_value);
};

// Service function to get results for a specific round
const calculateRoundResults = async (roundId) => {
  const questionWeight = await getQuestionWeight();
  
  return await Submission.aggregate([
    { $match: { round_id: new mongoose.Types.ObjectId(roundId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: '$user_id',
        name: { $first: '$user.name' },
        email: { $first: '$user.email' },
        correctAnswers: {
          $sum: { $cond: [{ $eq: ['$is_correct', true] }, 1, 0] }
        },
        totalQuestions: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        user_id: '$_id',
        name: 1,
        email: 1,
        round: roundId,
        score: { $multiply: ['$correctAnswers', questionWeight] },
        total_marks_possible: { $multiply: ['$totalQuestions', questionWeight] },
        correct_answers: '$correctAnswers',
        total_questions: '$totalQuestions'
      }
    },
    { $sort: { score: -1 } }
  ]);
};

// Get results for a specific round
export const getResultsByRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const results = await calculateRoundResults(roundId);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error in getResultsByRound:', error);
    res.status(500).json({ 
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all rounds' results
export const getAllResults = async (req, res) => {
  try {
    // Get question weight first
    const questionWeight = await getQuestionWeight();

    // Single aggregation pipeline to get all results
    const results = await Round.aggregate([
      { $sort: { round_id: 1 } },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'round_id',
          as: 'submissions'
        }
      },
      { $unwind: '$submissions' },
      {
        $lookup: {
          from: 'users',
          localField: 'submissions.user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: {
            roundId: '$_id',
            roundName: '$round_name',
            userId: '$user._id',
            userName: '$user.name',
            userEmail: '$user.email'
          },
          correct_answers: {
            $sum: { $cond: [{ $eq: ['$submissions.is_correct', true] }, 1, 0] }
          },
          total_questions: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            roundId: '$_id.roundId',
            roundName: '$_id.roundName'
          },
          results: {
            $push: {
              user_id: '$_id.userId',
              name: '$_id.userName',
              email: '$_id.userEmail',
              correct_answers: '$correct_answers',
              total_questions: '$total_questions',
              score: { $multiply: ['$correct_answers', questionWeight] },
              total_marks_possible: { $multiply: ['$total_questions', questionWeight] },
              round: '$_id.roundId'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          round: '$_id.roundId',
          roundName: '$_id.roundName',
          results: {
            $sortArray: {
              input: '$results',
              sortBy: { score: -1 }
            }
          }
        }
      },
      { $sort: { 'roundName': 1 } }
    ]);
    console.log(results);
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error in getAllResults:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get user's results across all rounds, this function is currently not used in the frontend
export const getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const questionWeight = await getQuestionWeight();
    
    // Get all submissions for the user with round details in a single query
    const results = await Submission.aggregate([
      { 
        $match: { 
          user_id: new mongoose.Types.ObjectId(userId),
          is_correct: { $ne: null }
        } 
      },
      {
        $lookup: {
          from: 'rounds',
          localField: 'round_id',
          foreignField: '_id',
          as: 'round'
        }
      },
      { $unwind: '$round' },
      {
        $group: {
          _id: '$round_id',
          round_id: { $first: '$round.round_id' },
          round_name: { $first: '$round.round_name' },
          correct_answers: {
            $sum: { $cond: [{ $eq: ['$is_correct', true] }, 1, 0] }
          },
          total_questions: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          round: '$_id',
          round_id: 1,
          round_name: 1,
          score: { $multiply: ['$correct_answers', questionWeight] },
          total_marks_possible: { $multiply: ['$total_questions', questionWeight] },
          correct_answers: 1,
          total_questions: 1
        }
      },
      { $sort: { round_id: 1 } }
    ]);
    
    res.status(200).json(results || []);
  } catch (error) {
    console.error('Error in getUserResults:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
      
