import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

import bookingsRouter from './routes/bookings.js';
import availabilityRouter from './routes/availability.js';
import authRouter from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';

import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Local dev
  'https://bookease-client-uxab.vercel.app' // Vercel frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// ✅ Body Parser
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingsRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// ✅ Test Route
app.get('/', (req, res) => {
  res.send('✅ BookEase Backend is Running!');
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

// ✅ Start Server for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
