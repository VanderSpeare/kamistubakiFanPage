const Order = require('../models/Order');
const Product = require('../models/Product');
const { buildPaymentUrl, verifyCallback } = require('../utils/vnpay');

function generateTxnRef() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// POST /api/vnpay/create-payment   body: { items: [{ slug, qty }] }
//
// Deliberately does NOT accept an amount from the client — every price is
// re-looked-up from the DB here. A payment endpoint that trusts a
// client-submitted total can be trivially tampered with (edit the request
// in devtools, pay $0.01 for a hoodie).
exports.createPayment = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    const orderItems = [];
    let amount = 0;
    for (const { slug, qty } of items) {
      const product = await Product.findOne({ slug, discontinued: false });
      if (!product) return res.status(400).json({ error: `Product "${slug}" is no longer available.` });
      const quantity = Math.max(1, parseInt(qty, 10) || 1);
      orderItems.push({ product: product._id, name: product.name, price: product.price, qty: quantity });
      amount += product.price * quantity;
    }

    const txnRef = generateTxnRef();
    const order = await Order.create({
      txnRef,
      items: orderItems,
      amount,
      status: 'pending',
      user: req.user?._id, // present only if this route is wrapped with `protect` — left open for guest checkout by default
    });

    const orderInfo = `Kamitsubaki Shop order ${txnRef}`;
    const ipAddr = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const paymentUrl = buildPaymentUrl({ txnRef, amount, orderInfo, ipAddr });

    res.json({ paymentUrl, orderId: order._id, txnRef });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/vnpay/return — VNPay redirects the shopper's own browser here.
// Used only for UX (what to show the shopper); NOT the trustworthy source
// of truth for whether payment actually succeeded — see handleIPN below.
exports.handleReturn = async (req, res) => {
  const { VNP_HASHSECRET, FRONTEND_URL } = process.env;
  const valid = verifyCallback(req.query, VNP_HASHSECRET);
  const success = valid && req.query.vnp_ResponseCode === '00';

  try {
    if (valid) {
      await Order.findOneAndUpdate(
        { txnRef: req.query.vnp_TxnRef },
        { status: success ? 'paid' : 'failed', vnpResponseCode: req.query.vnp_ResponseCode }
      );
    }
  } catch {
    // fall through — IPN below is authoritative regardless of what happens here
  }

  const status = success ? 'success' : 'failed';
  res.redirect(`${FRONTEND_URL}/services?view=checkout&vnp_status=${status}&txnRef=${req.query.vnp_TxnRef || ''}`);
};

// GET /api/vnpay/ipn — VNPay's server-to-server confirmation.
// This is the one that should actually decide "did payment succeed" —
// VNPay's own docs note the return URL can be closed/skipped by the
// shopper's browser, while IPN is server-to-server and can't be.
exports.handleIPN = async (req, res) => {
  const { VNP_HASHSECRET } = process.env;
  const query = req.query;
  const valid = verifyCallback(query, VNP_HASHSECRET);
  if (!valid) return res.json({ RspCode: '97', Message: 'Invalid signature' });

  try {
    const order = await Order.findOne({ txnRef: query.vnp_TxnRef });
    if (!order) return res.json({ RspCode: '01', Message: 'Order not found' });
    if (order.amount * 100 !== Number(query.vnp_Amount)) return res.json({ RspCode: '04', Message: 'Amount mismatch' });
    if (order.status !== 'pending') return res.json({ RspCode: '02', Message: 'Order already confirmed' });

    order.status = query.vnp_ResponseCode === '00' ? 'paid' : 'failed';
    order.vnpResponseCode = query.vnp_ResponseCode;
    await order.save();

    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch {
    return res.json({ RspCode: '99', Message: 'Unknown error' });
  }
};