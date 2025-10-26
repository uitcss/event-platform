import express from 'express';
import authMiddleware from '../middleware/adminAuthMiddleware.js';
import {
  getQuestionsByRound,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/questionController.js';

//admin only routes to create/update/delete questions for rounds
const questionRoutes = express.Router();

questionRoutes.use(authMiddleware);

// Get all questions for a round
questionRoutes.get('/round/:roundId', getQuestionsByRound);

// Create a new question for a round
questionRoutes.post('/round/:roundId', createQuestion);

// Update a question
questionRoutes.put('/:questionId', updateQuestion);

// Delete a question
questionRoutes.delete('/:questionId', deleteQuestion);

export default questionRoutes;