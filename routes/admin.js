import express from 'express';
import { verifyToken, checkAdmin } from '../middleware/verifyToken.js';
import {
  getAllBookingsForAdmin,
  deleteBookingByIdForAdmin,
} from '../controllers/bookingController.js';

const router = express.Router();

// ✅ GET /api/admin/bookings - Get all bookings (admin only)
router.get('/bookings', verifyToken, checkAdmin, getAllBookingsForAdmin);

// ✅ DELETE /api/admin/bookings/:id - Delete a booking (admin only)
router.delete('/bookings/:id', verifyToken, checkAdmin, deleteBookingByIdForAdmin);

export default router;
