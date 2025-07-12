import pool from '../config/db.js'; // or '../db.js' if your pool is still there

// ✅ Create a new booking
export const createBooking = async (req, res) => {
  const { userId, serviceId, date, timeSlot } = req.body;

  if (!userId || !serviceId || !date || !timeSlot) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existing = await pool.query(
      `SELECT * FROM bookings WHERE date = $1 AND time = $2 AND service_id = $3`,
      [date, timeSlot, serviceId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'This slot is already booked.' });
    }

    const result = await pool.query(
      `INSERT INTO bookings (user_id, service_id, date, time) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, serviceId, date, timeSlot]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Booking error:', error);
    res.status(500).json({ message: 'Server error while booking.' });
  }
};

// ✅ Admin: Get all bookings with user info
export const getAllBookingsForAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id, b.date, b.time, b.service_id, 
        u.name AS username, u.email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.date DESC, b.time ASC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Admin fetch error:', err.message);
    res.status(500).json({ message: 'Error fetching admin bookings' });
  }
};

// ✅ Admin: Delete a booking by ID
export const deleteBookingByIdForAdmin = async (req, res) => {
  const bookingId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('❌ Admin delete booking error:', err.message);
    res.status(500).json({ message: 'Error deleting booking' });
  }
};
