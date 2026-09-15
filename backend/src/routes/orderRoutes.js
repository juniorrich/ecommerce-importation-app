const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createOrderRules,
  updateOrderStatusRules,
} = require('../validators/orderValidators');

const router = express.Router();

router
  .route('/')
  .post(protect, createOrderRules, validate, createOrder)
  .get(protect, authorize('admin'), getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

// Admin-only manual mark-as-paid (e.g. cash-on-delivery). Paystack orders
// are marked paid via verifyPayment/webhook, which verify with Paystack
// directly — never trust a client-supplied "paid" status for those.
router.route('/:id/pay').put(protect, authorize('admin'), updateOrderToPaid);

router
  .route('/:id/status')
  .put(protect, authorize('admin'), updateOrderStatusRules, validate, updateOrderStatus);

module.exports = router;
