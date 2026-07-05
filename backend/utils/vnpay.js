const crypto = require('crypto');
const qs = require('qs'); // npm install qs  — needed for {encode:false} stringify, which VNPay's signing requires

// ============================================================================
// VNPAY SIGNING HELPERS
// Implements VNPay's documented request-signing algorithm: sort params
// alphabetically, build an unencoded query string, HMAC-SHA512 it with your
// Hash Secret. This MUST run server-side — the Hash Secret can never reach
// the browser, or anyone could forge a "successful payment" callback.
// ============================================================================

function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted;
}

function pad(n) { return n.toString().padStart(2, '0'); }

// VNPay wants vnp_CreateDate as yyyyMMddHHmmss, in the Asia/Ho_Chi_Minh timezone.
function vnpTimestamp(date = new Date()) {
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function sign(params, hashSecret) {
  const sorted = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });
  return crypto.createHmac('sha512', hashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex');
}

// Builds the full redirect URL the frontend should send the browser to.
function buildPaymentUrl({ txnRef, amount, orderInfo, ipAddr }) {
  const { VNP_TMNCODE, VNP_HASHSECRET, VNP_URL, VNP_RETURNURL } = process.env;
  if (!VNP_TMNCODE || !VNP_HASHSECRET || !VNP_URL || !VNP_RETURNURL) {
    throw new Error('Missing VNPay env vars: VNP_TMNCODE, VNP_HASHSECRET, VNP_URL, VNP_RETURNURL');
  }

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNP_TMNCODE,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(amount) * 100, // VNPay expects amount x100, no decimals
    vnp_ReturnUrl: VNP_RETURNURL,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: vnpTimestamp(),
  };

  const secureHash = sign(params, VNP_HASHSECRET);
  const finalParams = { ...sortObject(params), vnp_SecureHash: secureHash };
  return `${VNP_URL}?${qs.stringify(finalParams, { encode: false })}`;
}

// Verifies a callback (return URL or IPN) actually came from VNPay and
// wasn't tampered with, by re-signing everything except the hash itself
// and comparing.
function verifyCallback(query, hashSecret) {
  const { vnp_SecureHash, vnp_SecureHashType, ...rest } = query;
  const recomputed = sign(rest, hashSecret);
  return recomputed === vnp_SecureHash;
}

module.exports = { buildPaymentUrl, verifyCallback, vnpTimestamp };