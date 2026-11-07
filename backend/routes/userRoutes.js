import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile management
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.delete('/profile', userController.deactivateAccount);

export default router;
