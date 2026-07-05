const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpayController.js');
// Guest checkout is allowed by default. If you want to require login before
// paying, uncomment the two lines below:
// const { protect } = require('../middleware/auth');
// router.use(protect);

router.post('/create-payment', vnpayController.createPayment);
router.get('/return', vnpayController.handleReturn);
router.get('/ipn', vnpayController.handleIPN); // confirm GET vs POST against your VNPay merchant portal config

module.exports = router;