import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db.js';
import { verifyToken } from '../middleware/verifyToken.js';

dotenv.config();
const router = express.Router();

// ✅ GET /api/auth/profile – Return user and their bookings
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const userResult = await pool.query(
      'SELECT id, name, email, phone, address, role, joined FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bookingResult = await pool.query(
      'SELECT id, date, time FROM bookings WHERE user_id = $1 ORDER BY date DESC, time DESC',
      [userId]
    );

    const user = userResult.rows[0];
    const bookings = bookingResult.rows;

    res.json({ user, bookings });
  } catch (error) {
    console.error('Profile route error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// ✅ POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, joined, role)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'user')
       RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );

    const user = newUser.rows[0];
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// ✅ POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

export default router;
