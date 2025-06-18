const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flightId: { type: String },
  airline: { type: String, required: true },
  flightNumber: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
  helpfulVotes: { type: Number, default: 0 },
  reported: { type: Boolean, default: false },
  // Adding fields to match the existing database indexes
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  flight: { type: String }
});

// Add indexes for better query performance
reviewSchema.index({ airline: 1, flightNumber: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ date: -1 });

// Pre-save middleware to keep user and flight fields in sync with userId and flightId
reviewSchema.pre('save', function(next) {
  // Set user to match userId for compatibility with existing index
  if (this.userId) {
    this.user = this.userId;
  }
  
  // Set flight to match flightId for compatibility with existing index
  if (this.flightId) {
    this.flight = this.flightId;
  } else if (this.flightNumber) {
    this.flight = this.flightNumber;
  }
  
  next();
});

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema); 