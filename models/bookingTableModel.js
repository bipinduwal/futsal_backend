const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingtableSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // Format: MM/DD/YYYY
        required: true,
    },
    timeSlot: {
        type: String, // Format: 9:00 AM, 10:00 PM
        required: true,
    },
    status: {
        type: String,
        enum: ['available', 'booked','cancel'],
        default: 'available',
    }
});

const BookingTable = mongoose.model('BookingTable', bookingtableSchema);
module.exports = BookingTable;
