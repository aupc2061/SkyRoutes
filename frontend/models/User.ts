import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  preferences: {
    seat: { type: String, enum: ['Window', 'Aisle', 'Middle', 'No Preference'] },
    meal: { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'No Preference'] },
    notifications: {
      flightUpdates: { type: Boolean, default: false },
      checkInReminders: { type: Boolean, default: false },
      promotionalOffers: { type: Boolean, default: false }
    }
  },
  bookingHistory: [{
    flightId: String,
    airline: String,
    flightNumber: String,
    origin: String,
    destination: String,
    departureTime: Date,
    arrivalTime: Date,
    duration: String,
    price: Number,
    status: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema); 