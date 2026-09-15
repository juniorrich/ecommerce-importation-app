const { body } = require('express-validator');

exports.createOrderRules = [
  body('orderItems').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('orderItems.*.product').isMongoId().withMessage('Invalid product id in order items'),
  body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.region').trim().notEmpty().withMessage('Region is required'),
  body('shippingAddress.phone').optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
  body('paymentMethod').optional().isIn(['paystack', 'cash_on_delivery']).withMessage('Invalid payment method'),
  body('shippingPrice').optional().isFloat({ min: 0 }).withMessage('Invalid shipping price'),
  body('taxPrice').optional().isFloat({ min: 0 }).withMessage('Invalid tax price'),
];

exports.updateOrderStatusRules = [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid order status'),
  body('trackingNumber').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
];
