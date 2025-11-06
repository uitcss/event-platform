import express from 'express';
import authMiddleware from '../middleware/adminAuthMiddleware.js';
import { 
  getResultsByRound, 
  getAllResults, 
  getUserResults 
} from '../controllers/resultController.js';


// api/results routes
const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all results for a specific round
router.get('/round/:roundId', getResultsByRound);

// Get all rounds' results, this route is not used in the frontend currently
router.get('/', getAllResults);

// Get a user's results across all rounds
router.get('/user/:userId', getUserResults);



export default router;