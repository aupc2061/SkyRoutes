import mongoose from 'mongoose';

const flightSeatSchema = new mongoose.Schema({
  flightNumber: { 
    type: String, 
    required: true
  },
  flightDate: {
    type: String,
    required: true // e.g., '2025-06-11'
  },
  takenSeats: [{
    type: Number,  // Storing seat numbers (1-30)
    min: 1,
    max: 30
  }],
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound unique index for flightNumber + flightDate
flightSeatSchema.index({ flightNumber: 1, flightDate: 1 }, { unique: true });

// Method to get next available seat
flightSeatSchema.methods.getNextAvailableSeat = function() {
  const takenSeats = new Set(this.takenSeats);
  for (let i = 1; i <= 30; i++) {
    if (!takenSeats.has(i)) {
      return i;
    }
  }
  return null; // No seats available
};

// Method to check if seats are available
flightSeatSchema.methods.getAvailableSeatsCount = function() {
  return 30 - this.takenSeats.length;
};

export const FlightSeat = mongoose.models.FlightSeat || mongoose.model('FlightSeat', flightSeatSchema); 