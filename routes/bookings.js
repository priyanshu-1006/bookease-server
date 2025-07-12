// server/routes/bookings.js

import express from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Middleware to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// POST /api/bookings - Save new booking
router.post('/', verifyToken, async (req, res) => {
  const { date, time } = req.body;

  try {
    // Check for duplicate booking
    const existing = await pool.query(
      'SELECT * FROM bookings WHERE user_id = $1 AND date = $2 AND time = $3',
      [req.userId, date, time]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You have already booked this slot' });
    }

    const booked = await pool.query(
      'SELECT * FROM bookings WHERE date = $1 AND time = $2',
      [date, time]
    );

    if (booked.rows.length > 0) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Insert booking
    const result = await pool.query(
      'INSERT INTO bookings (user_id, date, time) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, date, time]
    );

    res.status(201).json({ message: 'Booking confirmed', booking: result.rows[0] });
  } catch (err) {
    console.error('Booking Error:', err);
    res.status(500).json({ error: 'Server error while booking' });
  }
});

// GET /api/bookings/slots/:date - Get booked slots for a day
router.get('/slots/:date', async (req, res) => {
  const { date } = req.params;

  try {
    const result = await pool.query(
      'SELECT time FROM bookings WHERE date = $1',
      [date]
    );
    const bookedTimes = result.rows.map(row => row.time);
    res.json({ booked: bookedTimes });
  } catch (err) {
    console.error('Error fetching slots:', err);
    res.status(500).json({ error: 'Error fetching slots' });
  }
});

export default router;
