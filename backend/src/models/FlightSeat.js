const mongoose = require('mongoose');

const flightSeatSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true },
  flightDate: { type: Date, required: true },
  takenSeats: { type: [Number], default: [] }
});

// Method to get available seats count
flightSeatSchema.methods.getAvailableSeatsCount = function() {
  return 30 - this.takenSeats.length;
};

// Method to get next available seat
flightSeatSchema.methods.getNextAvailableSeat = function() {
  const allSeats = Array.from({ length: 30 }, (_, i) => i + 1);
  const availableSeats = allSeats.filter(seat => !this.takenSeats.includes(seat));
  return availableSeats[0] || null;
};

module.exports = mongoose.models.FlightSeat || mongoose.model('FlightSeat', flightSeatSchema); 