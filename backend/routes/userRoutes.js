import express from 'express';
import {
  getAllUsers,
  getUsersByRound,
  getUserById,
  promoteUser,
  deactivateUser,
  depromoteUser,
  activateUser
} from '../controllers/userControllers.js';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';

const userRoutes = express.Router();

userRoutes.use(adminAuthMiddleware);

// Get all users
userRoutes.get('/', getAllUsers);

// Get users by round
userRoutes.get('/round/:roundId', getUsersByRound);

// Get single user by ID
userRoutes.get('/:id', getUserById);

// Promote user to next round → increments current_round
userRoutes.patch('/:id/promote', promoteUser);

// Deactivate user → sets is_active = false
userRoutes.patch('/:id/deactivate', deactivateUser);

// Depromote user to previous round → decrements current_round
userRoutes.patch('/:id/depromote', depromoteUser);

// Activate user → sets is_active = true
userRoutes.patch('/:id/activate', activateUser);

export default userRoutes;
