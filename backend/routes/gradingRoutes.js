import express from 'express';
import authMiddleware from '../middleware/adminAuthMiddleware.js';

const gradingRoutes = express.Router();

gradingRoutes.use(authMiddleware);

//Get all submissions for a round pending grading
gradingRoutes.get('/round/:roundId', (req, res) => {
  res.send('Grading route is working');
});

// Mark a single answer correct/incorrect (payload: {is_correct: true/false})
gradingRoutes.patch('/submission/:submissionId/mark',(req, res) => {
  res.send('Grading route is working');
} );

//Finalize grading for a submission → sets is_graded = true
gradingRoutes.post('/submission/:submissionId/finalize',(req, res) => {
  res.send('Grading route is working');
} );


export default gradingRoutes;


