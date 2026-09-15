const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Initialize Paystack payment
// @route   POST /api/payments/initialize
// @access  Private
exports.initializePayment = async (req, res, next) => {
  try {
    const { orderId, email } = req.body;

    if (!orderId || !email) {
      return res.status(400).json({
        success: false,
        message: 'orderId and email are required',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }

    // Always charge the order's own recorded total — never a client-supplied
    // amount — so a buyer can't pay less than the order is actually worth.
    const amountInPesewas = Math.round(order.totalPrice * 100);

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret || paystackSecret.includes('xxxxxxxx')) {
      // Development / mock mode
      return res.status(200).json({
        success: true,
        message: 'Payment initialized (mock mode - set real Paystack keys)',
        data: {
          authorization_url: `https://checkout.paystack.com/mock/${orderId}`,
          access_code: 'mock_access_code',
          reference: `mock_ref_${orderId}_${Date.now()}`,
          orderId,
        },
      });
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInPesewas,
        currency: 'GHS',
        reference: `order_${orderId}_${Date.now()}`,
        callback_url: `${process.env.FRONTEND_URL}/order/success?orderId=${orderId}`,
        metadata: {
          orderId: orderId.toString(),
          userId: req.user.id,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({
        success: false,
        message: data.message || 'Failed to initialize payment',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
        orderId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Paystack payment (frontend callback)
// @route   GET /api/payments/verify/:reference
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret || paystackSecret.includes('xxxxxxxx')) {
      // Mock verification for development — still mark the order paid so the
      // checkout flow completes end-to-end without real Paystack keys.
      // Mock references are shaped "mock_ref_<orderId>_<timestamp>".
      const parts = reference.split('_');
      const orderId = parts.length >= 3 ? parts[2] : null;
      if (orderId) {
        await markOrderAsPaid(orderId, {
          id: `mock_${reference}`,
          status: 'success',
          reference,
          update_time: new Date().toISOString(),
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Payment verified (mock mode)',
        data: {
          status: 'success',
          reference,
        },
      });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      }
    );

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Make sure this transaction belongs to an order owned by the requester
    const orderId = data.data.metadata?.orderId;
    const order = orderId ? await Order.findById(orderId) : null;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for this reference',
      });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this payment',
      });
    }

    const paidOrder = await markOrderAsPaid(
      orderId,
      {
        id: data.data.id,
        status: data.data.status,
        reference: data.data.reference,
        update_time: new Date().toISOString(),
      },
      data.data.amount
    );

    if (!paidOrder) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount does not match the order total',
      });
    }

    // Return only the minimal, non-sensitive fields — never the full
    // Paystack payload (which can include customer email/card details)
    res.status(200).json({
      success: true,
      data: {
        status: data.data.status,
        reference: data.data.reference,
        amount: data.data.amount,
        orderId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Mark order as paid + deduct stock.
 * paidAmountPesewas is what Paystack actually confirms was charged — if it
 * doesn't match the order's own total, refuse rather than trust the caller.
 */
async function markOrderAsPaid(orderId, paymentResult, paidAmountPesewas) {
  const order = await Order.findById(orderId);

  if (!order || order.isPaid) {
    return order;
  }

  const expectedPesewas = Math.round(order.totalPrice * 100);
  if (
    typeof paidAmountPesewas === 'number' &&
    paidAmountPesewas !== expectedPesewas
  ) {
    console.warn(
      `Amount mismatch for order ${orderId}: paid ${paidAmountPesewas}, expected ${expectedPesewas}`
    );
    return null;
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = paymentResult;
  order.status = 'processing';

  // Deduct stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }
  }

  await order.save();
  return order;
}

// @desc    Paystack Webhook (charge.success)
// @route   POST /api/payments/webhook
// @access  Public (verified by signature)
exports.paystackWebhook = async (req, res, next) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // 1. Verify signature
    if (secret && !secret.includes('xxxxxxxx')) {
      const hash = crypto
        .createHmac('sha512', secret)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest('hex');

      const signature = req.headers['x-paystack-signature'] || '';
      const hashBuffer = Buffer.from(hash, 'hex');
      const signatureBuffer = Buffer.from(signature, 'hex');

      const isValid =
        hashBuffer.length === signatureBuffer.length &&
        crypto.timingSafeEqual(hashBuffer, signatureBuffer);

      if (!isValid) {
        console.warn('Invalid Paystack webhook signature');
        return res.status(401).json({ message: 'Invalid signature' });
      }
    }

    const event = req.body;

    // 2. Handle only successful charge events
    if (event.event === 'charge.success') {
      const { reference, metadata, id, status, paid_at } = event.data;

      const orderId = metadata?.orderId;

      if (!orderId) {
        console.warn('Webhook received without orderId in metadata');
        return res.status(200).json({ received: true });
      }

      const order = await markOrderAsPaid(
        orderId,
        {
          id: id?.toString() || reference,
          status: status || 'success',
          reference,
          update_time: paid_at || new Date().toISOString(),
        },
        event.data.amount
      );

      if (order) {
        console.log(`Order ${orderId} marked as paid via webhook. Ref: ${reference}`);
      }
    }

    // Always return 200 so Paystack stops retrying
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    // Still return 200 to avoid infinite retries on our side
    res.status(200).json({ received: true, error: error.message });
  }
};
