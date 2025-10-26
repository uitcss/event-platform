import express from 'express';
import authMiddleware from '../middleware/adminAuthMiddleware.js';

const userRoutes = express.Router();

userRoutes.use(authMiddleware);

// Get all users
userRoutes.get('/', (req, res) => {
  res.send('User route is working');
});

// Get users by round
userRoutes.get('/round/:roundId', (req, res) => {
  res.send('User route is working');
});

// Get single user by ID
userRoutes.get('/:id', (req, res) => {
  res.send('User route is working');
});


// Promote user to next round → increments current_round
userRoutes.patch('/:id/promote', (req, res) => {
  res.send('User route is working');
});

// Deactivate user → sets is_active = false
userRoutes.patch('/:id/deactivate', (req, res) => {
  res.send('User route is working');
});



export default userRoutes;
