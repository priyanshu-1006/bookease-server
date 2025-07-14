import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

// 🔐 Razorpay config
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🔹 Create Razorpay Order (Fixed ₹1)
router.post('/create-order', async (req, res) => {
  const amountInRupees = 1; // ✅ Always ₹1
  const options = {
    amount: amountInRupees * 100, // Razorpay expects amount in paise
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (error) {
    console.error('❌ Razorpay Order Error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// 🔹 Verify Razorpay Signature
router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    return res.json({ success: true });
  } else {
    return res.status(400).json({ error: 'Invalid signature' });
  }
});

export default router;
