const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create the Booking Schema with payment details
const bookingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  field: {
    type: String,
    required: true,
    default:'Top Futsal',
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true, // Example: "10:00 AM - 11:00 AM"
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'cash', 'bank_transfer'],
    required: false, // Optional, in case payment method is needed
  },
  amount: {
    type: Number,
    required: true, // The total cost of the booking
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Export the Booking model
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
