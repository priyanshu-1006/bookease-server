import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// GET /api/users/profile - View current user's profile
router.get('/profile', verifyToken, getUserProfile);

// PUT /api/users/profile - Update profile
router.put('/profile', verifyToken, updateUserProfile); // ✅ fixed path

export default router;
