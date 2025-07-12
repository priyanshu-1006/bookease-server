import pool from '../db.js';

// ✅ GET current user profile
export const getUserProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, address, role, joined FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bookings = await pool.query(
      'SELECT id, date, time FROM bookings WHERE user_id = $1 ORDER BY date DESC, time DESC',
      [userId]
    );

    res.json({ user: result.rows[0], bookings: bookings.rows });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ PUT update user profile
export const updateUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const { phone, address } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET phone = $1, address = $2 WHERE id = $3 RETURNING id, name, email, phone, address, role, joined',
      [phone, address, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
