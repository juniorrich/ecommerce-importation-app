const express = require('express');
const {
  initializePayment,
  verifyPayment,
  paystackWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public webhook (Paystack calls this)
router.post('/webhook', paystackWebhook);

// Protected routes
router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', protect, verifyPayment);

module.exports = router;
