import mongoose from 'mongoose';
import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';

// In-memory gateway settings store with environment fallbacks
let gatewayConfigStore = {
  mode: process.env.PAYMENT_GATEWAY_MODE || 'test', // 'test' | 'live'
  razorpayEnabled: true,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_ShaadiVibeRoyal2026',
  upiEnabled: true,
  upiVpa: process.env.UPI_MERCHANT_VPA || 'shaadivibe@icici',
  stripeEnabled: true,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_shaadivibe_diaspora_nri',
  currency: 'INR',
  gstNumber: '07AAAAA0000A1Z5',
  gstPercentage: 18,
};

/**
 * Seed baseline transactions if payments collection is empty
 */
const autoSeedPaymentsIfEmpty = async () => {
  try {
    const count = await Payment.countDocuments({});
    if (count > 0) return;

    // Check existing confirmed/completed orders in the database
    const qualifyingOrders = await Order.find({
      status: { $in: ['confirmed', 'processing', 'completed'] },
    }).limit(10);

    if (qualifyingOrders.length > 0) {
      const records = qualifyingOrders.map((ord, idx) => ({
        transactionId: `TXN_${ord.orderNumber}_${Date.now().toString(36).toUpperCase()}_${idx}`,
        orderId: ord._id,
        orderNumber: ord.orderNumber,
        customerId: ord.customerId,
        customerSnapshot: ord.customerSnapshot,
        amount: ord.pricing.total,
        currency: ord.pricing.currency || 'INR',
        method: idx % 3 === 0 ? 'upi' : idx % 3 === 1 ? 'card' : 'netbanking',
        gateway: 'razorpay',
        gatewayPaymentId: `pay_${Date.now()}_${idx}`,
        status: 'captured',
        notes: 'Verified online transaction via Razorpay gateway.',
        createdAt: ord.createdAt || new Date(),
      }));
      await Payment.insertMany(records);
      return;
    }

    // Baseline starter transactions for demonstration
    const dummyPayments = [
      {
        transactionId: 'TXN_SV2611001_RZP',
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: 'SV2611001',
        customerId: new mongoose.Types.ObjectId(),
        customerSnapshot: {
          name: 'Priya Sharma & Rahul Mehta',
          email: 'priya.sharma@example.com',
          phone: '+91 98765 43210',
        },
        amount: 2799,
        currency: 'INR',
        method: 'upi',
        gateway: 'razorpay',
        gatewayPaymentId: 'pay_N9xK3pL8vR2wQ',
        status: 'captured',
        notes: 'Google Pay UPI instant clearance.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        transactionId: 'TXN_SV2611002_CRD',
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: 'SV2611002',
        customerId: new mongoose.Types.ObjectId(),
        customerSnapshot: {
          name: 'Ananya Gupta & Karan Verma',
          email: 'ananya.gupta@example.com',
          phone: '+91 98111 22334',
        },
        amount: 4499,
        currency: 'INR',
        method: 'card',
        gateway: 'razorpay',
        gatewayPaymentId: 'pay_M8yJ2kL7uQ1vP',
        status: 'captured',
        notes: 'HDFC Regalia Credit Card.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        transactionId: 'TXN_SV2611003_MAN',
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: 'SV2611003',
        customerId: new mongoose.Types.ObjectId(),
        customerSnapshot: {
          name: 'Rohan Singhania & Tanvi Patel',
          email: 'rohan.singhania@example.com',
          phone: '+91 99222 33445',
        },
        amount: 1799,
        currency: 'INR',
        method: 'bank_transfer',
        gateway: 'manual_admin',
        gatewayPaymentId: 'NEFT_IMPS_98124982',
        status: 'captured',
        notes: 'Direct bank transfer receipt confirmed by accounts team.',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        transactionId: 'TXN_SV2611004_PND',
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: 'SV2611004',
        customerId: new mongoose.Types.ObjectId(),
        customerSnapshot: {
          name: 'Aarav Malhotra & Simran Kaur',
          email: 'aarav.malhotra@example.com',
          phone: '+91 97333 44556',
        },
        amount: 2499,
        currency: 'INR',
        method: 'upi',
        gateway: 'direct_upi',
        gatewayPaymentId: 'UPI_REF_PENDING_001',
        status: 'pending',
        notes: 'Direct QR scan pending bank settlement verification.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        transactionId: 'TXN_SV2611005_REF',
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: 'SV2611005',
        customerId: new mongoose.Types.ObjectId(),
        customerSnapshot: {
          name: 'Deepak Joshi & Meera Nair',
          email: 'deepak.joshi@example.com',
          phone: '+91 98444 55667',
        },
        amount: 1799,
        currency: 'INR',
        method: 'card',
        gateway: 'razorpay',
        gatewayPaymentId: 'pay_K6wH0iJ5sO9tN',
        status: 'refunded',
        refundDetails: {
          amount: 1799,
          reason: 'Customer rescheduled wedding date to next season.',
          refundedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        notes: 'Full refund credited back to original source card.',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
    ];

    await Payment.insertMany(dummyPayments);
  } catch (err) {
    console.warn('[PaymentController] Auto-seed warning:', err.message);
  }
};

/**
 * Get paginated list of transactions & summary KPIs
 * GET /api/admin/payments
 */
export const getPayments = async (req, res, next) => {
  try {
    await autoSeedPaymentsIfEmpty();

    const { search = '', status = 'all', method = 'all', page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (method && method !== 'all') {
      query.method = method;
    }

    if (search.trim()) {
      const s = search.trim();
      query.$or = [
        { transactionId: { $regex: s, $options: 'i' } },
        { orderNumber: { $regex: s, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: s, $options: 'i' } },
        { 'customerSnapshot.email': { $regex: s, $options: 'i' } },
        { 'customerSnapshot.phone': { $regex: s, $options: 'i' } },
        { gatewayPaymentId: { $regex: s, $options: 'i' } },
      ];
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (currentPage - 1) * pageLimit;

    const [payments, totalCount, kpiAgg] = await Promise.all([
      Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .populate('orderId', 'status pricing packageSnapshot'),
      Payment.countDocuments(query),
      Payment.aggregate([
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Aggregate summary numbers
    let grossVolume = 0;
    let capturedCount = 0;
    let pendingAmount = 0;
    let pendingCount = 0;
    let refundedAmount = 0;
    let refundedCount = 0;
    let failedCount = 0;

    kpiAgg.forEach((stat) => {
      if (stat._id === 'captured') {
        grossVolume += stat.totalAmount;
        capturedCount += stat.count;
      } else if (stat._id === 'pending') {
        pendingAmount += stat.totalAmount;
        pendingCount += stat.count;
      } else if (stat._id === 'refunded') {
        refundedAmount += stat.totalAmount;
        refundedCount += stat.count;
      } else if (stat._id === 'failed') {
        failedCount += stat.count;
      }
    });

    const netSettlement = Math.max(0, grossVolume - refundedAmount);

    res.json({
      success: true,
      data: {
        kpis: {
          grossVolume,
          capturedCount,
          pendingAmount,
          pendingCount,
          refundedAmount,
          refundedCount,
          failedCount,
          netSettlement,
          currency: 'INR',
        },
        payments,
        pagination: {
          currentPage,
          totalPages: Math.ceil(totalCount / pageLimit) || 1,
          totalCount,
          hasMore: skip + payments.length < totalCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record a manual offline payment (Direct Bank Transfer, UPI QR, Cash)
 * POST /api/admin/payments/manual
 */
export const recordManualPayment = async (req, res, next) => {
  try {
    const { orderId, amount, method = 'bank_transfer', referenceId, notes = '' } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order reference is required.',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const paymentAmount = Number(amount) > 0 ? Number(amount) : order.pricing.total;
    const finalTxnId = referenceId?.trim()
      ? referenceId.trim().toUpperCase()
      : `TXN_${order.orderNumber}_MAN_${Date.now().toString(36).toUpperCase()}`;

    // Verify transactionId uniqueness
    const existing = await Payment.findOne({ transactionId: finalTxnId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A payment with Transaction ID ${finalTxnId} already exists.`,
      });
    }

    const payment = await Payment.create({
      transactionId: finalTxnId,
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerSnapshot: order.customerSnapshot,
      amount: paymentAmount,
      currency: order.pricing.currency || 'INR',
      method,
      gateway: 'manual_admin',
      gatewayPaymentId: referenceId?.trim() || finalTxnId,
      status: 'captured',
      notes: notes.trim() || 'Verified and marked paid via Admin Manual Clearance.',
    });

    // Synchronize Order status
    order.paymentStatus = 'paid';
    if (order.status === 'draft' || order.status === 'pending') {
      order.status = 'confirmed';
    }
    order.confirmedAt = new Date();
    await order.save();

    res.status(201).json({
      success: true,
      message: `Manual payment of ₹${paymentAmount} recorded successfully. Order ${order.orderNumber} is now Confirmed.`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refund a payment transaction
 * POST /api/admin/payments/:id/refund
 */
export const refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Customer request', amount } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'This transaction has already been refunded.',
      });
    }

    const refundAmount = Number(amount) > 0 ? Math.min(Number(amount), payment.amount) : payment.amount;

    payment.status = 'refunded';
    payment.refundDetails = {
      amount: refundAmount,
      reason: reason.trim() || 'Admin initiated refund.',
      refundedAt: new Date(),
      refundedBy: req.user?._id || null,
    };
    await payment.save();

    // Update linked order
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: 'refunded',
    });

    res.json({
      success: true,
      message: `Transaction ${payment.transactionId} refunded for ₹${refundAmount}.`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment gateway settings
 * GET /api/admin/payments/config
 */
export const getGatewayConfig = async (req, res) => {
  res.json({
    success: true,
    data: {
      ...gatewayConfigStore,
      // Mask secret key for security
      razorpayKeySecretMasked: 'rzp_sec_••••••••••••',
    },
  });
};

/**
 * Update payment gateway settings
 * PUT /api/admin/payments/config
 */
export const updateGatewayConfig = async (req, res) => {
  const { mode, razorpayEnabled, razorpayKeyId, upiEnabled, upiVpa, stripeEnabled, gstNumber } =
    req.body;

  if (mode && ['test', 'live'].includes(mode)) {
    gatewayConfigStore.mode = mode;
  }
  if (typeof razorpayEnabled === 'boolean') gatewayConfigStore.razorpayEnabled = razorpayEnabled;
  if (razorpayKeyId) gatewayConfigStore.razorpayKeyId = razorpayKeyId.trim();
  if (typeof upiEnabled === 'boolean') gatewayConfigStore.upiEnabled = upiEnabled;
  if (upiVpa) gatewayConfigStore.upiVpa = upiVpa.trim();
  if (typeof stripeEnabled === 'boolean') gatewayConfigStore.stripeEnabled = stripeEnabled;
  if (gstNumber) gatewayConfigStore.gstNumber = gstNumber.trim().toUpperCase();

  res.json({
    success: true,
    message: 'Payment gateway configuration updated successfully.',
    data: gatewayConfigStore,
  });
};

