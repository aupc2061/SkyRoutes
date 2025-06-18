const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');

// GET /api/reviews - Get reviews with optional filters
router.get('/', async (req, res) => {
  try {
    const { airline, flightNumber } = req.query;
    const query = {};
    if (airline) query.airline = airline;
    if (flightNumber) query.flightNumber = flightNumber;
    console.log('Fetching reviews with query:', query);
    const reviews = await Review.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email')
      .limit(50);
    console.log(`Found ${reviews.length} reviews`);
    res.json(reviews);
  } catch (error) {
    console.error('Reviews fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reviews - Create new review
router.post('/', auth, async (req, res) => {
  try {
    const { airline, flightNumber, rating, comment } = req.body;
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id); // Changed from req.user.id to req.user._id
    
    if (!airline || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Add more detailed console logs for debugging
    console.log('Creating review with data:', {
      userId: req.user._id,
      airline,
      flightNumber,
      rating,
      comment
    });
      // Create the review directly using the authenticated user
    const review = await Review.create({
      userId: req.user._id, // Use _id directly from auth middleware
      user: req.user._id, // Set the user field to match userId for the index
      airline,
      flightNumber,
      flight: flightNumber, // Set the flight field to match flightNumber for the index
      rating,
      comment
    });
    
    console.log('Review created:', review);
    await review.populate('userId', 'name email');
    res.status(201).json(review);
  } catch (error) {
    console.error('Review creation error:', error.message);
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all reviews for a flight
router.get('/flight/:flightNumber', async (req, res) => {
  try {
    const { flightNumber } = req.params;
    const reviews = await Review.find({ flightNumber })
      .sort({ date: -1 })
      .populate('userId', 'name email');

    res.json(reviews);
  } catch (error) {
    console.error('Get flight reviews error:', error);
    res.status(500).json({ error: 'Failed to get flight reviews' });
  }
});

// Get user's reviews
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .sort({ date: -1 })
      .populate('userId', 'name email');

    res.json(reviews);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to get user reviews' });
  }
});

// Get specific review
router.get('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId)
      .populate('userId', 'name email');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to get review' });
  }
});

// Update review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      {
        rating: rating || review.rating,
        comment: comment || review.comment,
        date: new Date()  // Use the date field which exists in the schema
      },
      { new: true }
    );

    res.json(updatedReview);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router; 