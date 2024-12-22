const Booking = require('../models/bookingModel');
const BookingTable = require('../models/bookingTableModel');
const User = require('../models/userModel');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { userId, field, date, timeSlot, amount, paymentMethod, paymentStatus } = req.body;

    // Validate required fields
    if (!userId || !date || !timeSlot || !amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create the new booking
    const newBooking = new Booking({
      user: userId,
      field,
      date,
      timeSlot,
      amount,
      paymentMethod,
      status: 'pending',        // Default status
      paymentStatus: paymentStatus || 'pending', // Default payment status
    });

    let booking = await newBooking.save();
    if (booking) {
      return res.status(201).json({ message: 'Booking created successfully' });
    }
    else {
      return res.status(500).json({ error: 'Failed to create booking' });
    }

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

//check booking time

const checkAvailability = async (date, timeSlot) => {
  const existingBooking = await Booking.findOne({
    date: date,
    timeSlot: timeSlot,
    status: 'pending' || 'confirmed',
  });

  if (existingBooking) {
    // Time slot is already booked
    return false;
  }
  // Time slot is available
  return true;
};

const handleBookingSubmission = async (req, res, next) => {
  const { userId, field, date, timeSlot, amount, paymentMethod, paymentStatus } = req.body;

  // const { userId, date, timeSlot } = req.body;  
  // Check if the time slot is already booked
  const isAvailable = await checkAvailability(date, timeSlot);
  if (!isAvailable) {
    return res.status(400).json({ error: 'Time slot is already booked!' });
  }
  // If available, create a new booking
  const newBooking = new BookingTable({
    userId,
    date,
    timeSlot,
    status: 'booked',
  });

  await newBooking.save();
  req.body = req.body;
  next();
};

//fetch booking time by date
const fetchBookingTimeByDate = async (req, res) => {
  const { date } = req.query;
  console.log(date)
  try {
    const bookings = await Booking.find({ date }).populate('user', 'username');

    if (!bookings) {
      return res.status(400).json({ error: "No bookings found for the selected date." });
    }

    return res.status(200).json(bookings);
    // res.send(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



// Fetch all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email'); // Populating user info (name, email)
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch booking by ID
const getBookingById = async (req, res) => {
  try {
    const { userid } = req.params;
    const booking = await Booking.find({ user: userid, status: "pending" });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId, status, paymentMethod } = req.body;

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update payment status and payment method (if provided)
    booking.paymentStatus = status; // 'completed', 'pending', or 'failed'
    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }

    await booking.save();

    res.status(200).json({
      message: 'Payment status updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the booking by ID and delete it
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
//upadate delete
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Update the booking status to "cancelled"
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Booking status updated to "cancelled" successfully',
      booking,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//update confirm
const updateConfirm = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Update the booking status to "cancelled"
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "confirmed", paymentStatus: "completed" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Booking status updated to "confirmed" successfully',
      booking,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updatePaymentStatus,
  deleteBooking,
  handleBookingSubmission,
  fetchBookingTimeByDate,
  cancelBooking,
  updateConfirm
};
