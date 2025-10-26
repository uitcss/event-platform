import express from 'express';
import authMiddleware from '../middleware/adminAuthMiddleware.js';

const resultRoutes = express.Router();

resultRoutes.use(authMiddleware);

//Get results of a round, in admin view
resultRoutes.get('/round/:roundId', (req, res) => {
  res.send('Result route is working');
});

export default resultRoutes;