import express from 'express';

const quizRoutes = express.Router();

//Get questions for the currently active round for logged-in user
quizRoutes.get('/active', (req, res) => {
    res.send('Quiz route is working');
});

//Submit the user's answers to the current round store in Submissions table
quizRoutes.get('/submit', (req, res) => {
    res.send('Quiz route is working');
});

export default quizRoutes;