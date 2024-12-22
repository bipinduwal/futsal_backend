const { createBooking, handleBookingSubmission, fetchBookingTimeByDate, getBookingById, deleteBooking, cancelBooking, updateConfirm } = require('../controllers/bookingController');
const { requireSignin } = require('../controllers/userController');
const { validationMethod, amountRules } = require('../utils/ourValidator');

const router  = require('express').Router()

router.post('/createbooking',requireSignin,amountRules, validationMethod, handleBookingSubmission, createBooking);
// router.get('/fetchbookingtimebydate/:date',fetchBookingTimeByDate);
// Updated route handler to use query parameter
router.get('/fetchbookingtimebydate', fetchBookingTimeByDate);
router.post('/fetchbookingbyuser/:userid',getBookingById);
router.post('/cancelbooking/:bookingId',cancelBooking)
router.post('/updateconfirm/:bookingId',updateConfirm)


module.exports = router;