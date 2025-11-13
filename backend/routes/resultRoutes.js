import express from 'express';
import { 
  getResultsByRound, 
  getAllResults, 
  getUserResults 
} from '../controllers/resultController.js';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';


// api/results routes
const router = express.Router();

// Apply auth middleware to all routes
router.use(adminAuthMiddleware);

// Get all results for a specific round
router.get('/round/:roundId', getResultsByRound);

// Get all rounds' results, this route is not used in the frontend currently
router.get('/', getAllResults);

// Get a user's results across all rounds
router.get('/user/:userId', getUserResults);



export default router;