const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, preferences } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (preferences) {
      updateData.preferences = {
        ...req.user.preferences,
        ...preferences
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update notification preferences
router.put('/notifications', auth, async (req, res) => {
  try {
    const { flightUpdates, checkInReminders, promotionalOffers } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'preferences.notifications': {
            flightUpdates: flightUpdates ?? req.user.preferences.notifications.flightUpdates,
            checkInReminders: checkInReminders ?? req.user.preferences.notifications.checkInReminders,
            promotionalOffers: promotionalOffers ?? req.user.preferences.notifications.promotionalOffers
          }
        }
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Get booking history
router.get('/bookings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('bookingHistory');
    res.json(user.bookingHistory);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get booking history' });
  }
});

// Add booking to history
router.post('/bookings', auth, async (req, res) => {
  try {
    const bookingData = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { bookingHistory: bookingData } },
      { new: true }
    ).select('bookingHistory');

    res.json(user.bookingHistory);
  } catch (error) {
    console.error('Add booking error:', error);
    res.status(500).json({ error: 'Failed to add booking' });
  }
});

// Update booking status
router.put('/bookings/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const user = await User.findOneAndUpdate(
      { 
        _id: req.user.id,
        'bookingHistory.flightId': bookingId 
      },
      { 
        $set: { 'bookingHistory.$.status': status }
      },
      { new: true }
    ).select('bookingHistory');

    if (!user) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(user.bookingHistory);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

module.exports = router; 