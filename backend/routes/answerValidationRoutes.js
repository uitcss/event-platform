import express from 'express';
import {
  getSubmissionsForValidation,
  validateSubmission,
  getValidationStats
} from '../controllers/answerValidationController.js';
import authMiddleware from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

// Protected admin routes
router.use(authMiddleware);

// Get submissions that need validation
router.get('/', getSubmissionsForValidation);

// Validate a submission
router.put('/:submissionId', validateSubmission);

// Get validation statistics
router.get('/stats', getValidationStats);

export default router;
