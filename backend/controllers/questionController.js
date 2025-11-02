import asyncHandler from 'express-async-handler';//auto try catch for async functions
import mongoose from 'mongoose';
import Question from '../models/Question.js';
import Round from '../models/Round.js';

//Get questions for a round
const getQuestionsByRound = asyncHandler(async (req, res) => {
  try {
    const { roundId } = req.params;
    
    // Check if round exists
    const round = await Round.findById(roundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }
    
    const questions = await Question.find({ round_id: roundId })
      .populate('round_id', 'round_name round_id time_limit_minutes is_active')
      .exec();      
    
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

//Create a new question for a round
const createQuestion = asyncHandler(async (req, res) => {
  try {
    const { roundId } = req.params;
    const { question_text, question_type, options, correct_answer } = req.body;
    
    // Check if round exists
    const round = await Round.findById(roundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }
    
    // Validate required fields
    if (!question_text || !question_type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide question text and type'
      });
    }

    // Validate options for MCQ type and already handled in frontend
    if (question_type === 'MCQ' && (!options || !Array.isArray(options) || options.length < 2)) {
      return res.status(400).json({
        success: false,
        message: 'MCQ questions require at least 2 options'
      });
    }
    
    // Create new question
    const newQuestion = new Question({
      round_id: round._id,
      question_text,
      question_type,
      options: question_type === 'MCQ' ? options : undefined,
      correct_answer
    });

    const savedQuestion = await newQuestion.save();
    
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: savedQuestion
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message
    });
  }
});

//update a questin
const updateQuestion = asyncHandler(async (req, res) => {
  try {
    const { questionId } = req.params;
    const updateData = { ...req.body };
    
    // do not change round_id through this end point
    if (updateData.round_id) {
      delete updateData.round_id;
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: updateData },//update only the fields provided in updateData object (instead of replacing the whole document).
      { new: true, runValidators: true }
    );
    
    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
});

//delete a question
const deleteQuestion = asyncHandler(async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const deletedQuestion = await Question.findByIdAndDelete(questionId);
    
    if (!deletedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
});

export {
  getQuestionsByRound,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
