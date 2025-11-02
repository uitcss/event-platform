import express from 'express';
import authMiddleware from '../middleware/adminAuthMiddleware.js';
import {
  getRounds,
  createRound,
  activateRound,
  updateRoundTime,
  deactivateRound,
  deleteRound,
  getRoundParticipants
} from '../controllers/roundControllers.js';

const roundRoutes = express.Router();

// Apply auth middleware to all routes
roundRoutes.use(authMiddleware);

// Get all rounds
roundRoutes.get('/', getRounds);

// Create new round
roundRoutes.post('/', createRound);

// Activate a round (deactivates others)
roundRoutes.patch('/:id/activate', activateRound);

// Update round time limit
roundRoutes.patch('/:id/time', updateRoundTime);

// Deactivate a round
roundRoutes.patch('/:id/deactivate', deactivateRound);

// Delete a round
roundRoutes.delete('/:id', deleteRound);

// Get participants for a specific round
roundRoutes.get('/:roundId/participants', getRoundParticipants);

export default roundRoutes;