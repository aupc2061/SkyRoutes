import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flightId: { type: String },
  airline: { type: String, required: true },
  flightNumber: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
  helpfulVotes: { type: Number, default: 0 },
  reported: { type: Boolean, default: false }
});

// Add indexes for better query performance
reviewSchema.index({ airline: 1, flightNumber: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ date: -1 });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema); 