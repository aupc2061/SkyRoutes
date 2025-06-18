const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Create new booking
router.post('/', auth, async (req, res) => {
  try {
    const {
      flightId,
      airline,
      flightNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      duration,
      price,
      status
    } = req.body;

    if (!flightId || !airline || !flightNumber) {
      return res.status(400).json({ error: 'Invalid booking data structure' });
    }

    // Add to user's booking history
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          bookingHistory: {
            flightId,
            airline,
            flightNumber,
            origin,
            destination,
            departureTime: new Date(departureTime),
            arrivalTime: new Date(arrivalTime),
            duration,
            price,
            status
          }
        }
      },
      { new: true, select: 'bookingHistory' }
    );

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update booking history' });
    }

    const newBooking = updatedUser.bookingHistory[updatedUser.bookingHistory.length - 1];
    res.status(201).json({ success: true, booking: newBooking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update existing booking
router.patch('/', auth, async (req, res) => {
  try {
    const { bookingId, status, ...otherUpdates } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    // Find user and booking
    const user = await User.findOne({
      _id: req.user.id,
      'bookingHistory.flightId': bookingId
    });
    if (!user) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    // Update booking
    const updateFields = {
      ...(status && { 'bookingHistory.$.status': status }),
      ...Object.entries(otherUpdates).reduce((acc, [key, value]) => ({
        ...acc,
        [`bookingHistory.$.${key}`]: value
      }), {})
    };

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        'bookingHistory.flightId': bookingId
      },
      { $set: updateFields },
      { new: true, select: 'bookingHistory' }
    );

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update booking' });
    }

    const updatedBooking = updatedUser.bookingHistory.find(b => b.flightId === bookingId);
    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Booking update error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

module.exports = router; 