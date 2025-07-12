import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

import bookingsRouter from './routes/bookings.js';
import availabilityRouter from './routes/availability.js';
import authRouter from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/admin.js'; // ✅ added admin routes

import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRoutes);          // 🧑 User profile
app.use('/api/bookings', bookingsRouter);   // 📅 Booking endpoints
app.use('/api/availability', availabilityRouter); // 📆 Time slot availability
app.use('/api/admin', adminRoutes);         // 🛡️ Admin panel routes

// ✅ Basic Test Route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// ✅ DB Test Route
app.get('/api/time', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching time from DB', error);
    res.status(500).json({ error: 'DB connection error' });
  }
});

// ✅ Global Error Handler
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
