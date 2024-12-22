const { confirmPayment } = require('../controllers/paymentController');

const router = require('express').Router()

router.post('/confirmpayment', confirmPayment);
module.exports = router;
