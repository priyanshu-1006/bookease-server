import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/availability?date=2025-06-20&serviceId=1
router.get('/', async (req, res) => {
  const { date, serviceId } = req.query;

  if (!date || !serviceId) {
    return res.status(400).json({ message: 'Missing date or serviceId' });
  }

  const allSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
  ];

  try {
    const result = await pool.query(
      `SELECT time FROM bookings WHERE date = $1 AND service_id = $2`,
      [date, serviceId]
    );

    const bookedSlots = result.rows.map(row => row.time);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ availableSlots });
  } catch (err) {
    console.error('❌ Error checking availability:', err);
    res.status(500).json({ error: 'Server error while checking availability' });
  }
});

export default router;
