const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';
let token = '';
let userId = '';
let bookingId = '';
let reviewId = '';

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

// Test flight search data
const flightSearchData = {
  originLocationCode: 'NYC',
  destinationLocationCode: 'LON',
  departureDate: '2025-06-20',
  adults: 1,
  max: 20
};

// Test booking data
const testBooking = {
  flightId: 'FL123',
  airline: 'Delta',
  flightNumber: 'DL123',
  origin: 'JFK',
  destination: 'LAX',
  departureTime: '2025-06-20T10:00:00Z',
  arrivalTime: '2025-06-20T13:00:00Z',
  duration: '3h',
  price: 350,
  status: 'CONFIRMED'
};

// Test review data
const testReview = {
  airline: 'Delta',
  flightNumber: `DL${Date.now().toString().slice(-6)}`, // Generate a unique flight number for each test run
  rating: 5,
  comment: 'Great flight!'
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, endpoint, data = null) => {
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      headers,
      data
    });
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test Authentication
const testAuth = async () => {
  console.log('\n=== Testing Authentication ===');
  
  try {
    // Try to register
    console.log('Testing registration...');
    try {
      await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('Registration successful');
    } catch (error) {
      if (error.response?.data?.error === 'User already exists') {
        console.log('User already exists, proceeding to login...');
      } else {
        throw error;
      }
    }

    // Login
    console.log('\nTesting login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    token = loginResponse.data.token;
    console.log('Login successful, token received:', token);
  } catch (error) {
    console.error('Auth test failed:', error.response?.data || error.message);
    throw error; // Re-throw to stop further tests if auth fails
  }
};

// Test Flight Search
async function testFlightSearch() {
  console.log('\n=== Testing Flight Search ===');
  
  try {
    const searchRes = await axios.get(`${API_URL}/flights/search`, {
      params: flightSearchData
    });
    console.log('Flight search successful:', searchRes.data.length, 'flights found');
  } catch (error) {
    console.error('Flight search test failed:', error.response?.data || error.message);
  }
}

// Test Booking
const testBookings = async () => {
  console.log('\n=== Testing Booking ===');
  
  try {
    // Create booking
    console.log('Creating booking...');
    const createBookingResponse = await makeAuthRequest('post', '/bookings', testBooking);
    bookingId = createBookingResponse.booking.id;
    console.log('Booking created:', createBookingResponse);

    // Update booking
    console.log('\nUpdating booking...');
    const updateBookingResponse = await makeAuthRequest('patch', '/bookings', {
      bookingId: testBooking.flightId,
      status: 'CANCELLED'
    });
    console.log('Booking updated:', updateBookingResponse);
  } catch (error) {
    console.error('Booking test failed:', error.response?.data || error.message);
  }
};

// Test Reviews
const testReviews = async () => {
  console.log('\n=== Testing Reviews ===');
  
  try {
    // Create review
    console.log('Creating review...');
    const createReviewResponse = await makeAuthRequest('post', '/reviews', testReview);
    reviewId = createReviewResponse._id;
    console.log('Review created:', createReviewResponse);

    // Get reviews by airline
    console.log('\nGetting reviews by airline...');
    const getReviewsByAirlineResponse = await makeAuthRequest('get', '/reviews?airline=Delta');
    console.log('Reviews by airline retrieved:', getReviewsByAirlineResponse.length, 'reviews found');

    // Get reviews by flight number
    console.log('\nGetting reviews by flight number...');
    const getReviewsByFlightResponse = await makeAuthRequest('get', '/reviews?flightNumber=DL123');
    console.log('Reviews by flight number retrieved:', getReviewsByFlightResponse.length, 'reviews found');
    
    // Get reviews by flight via dedicated endpoint
    console.log('\nGetting reviews for flight via /flight endpoint...');
    const getFlightReviewsResponse = await axios.get(`${API_URL}/reviews/flight/DL123`);
    console.log('Flight reviews retrieved:', getFlightReviewsResponse.data.length, 'reviews found');
    
    // Get user's own reviews
    console.log('\nGetting user reviews...');
    const getUserReviewsResponse = await makeAuthRequest('get', '/reviews/user');
    console.log('User reviews retrieved:', getUserReviewsResponse.length, 'reviews found');
    
    // Get specific review by ID
    console.log('\nGetting review by ID...');
    const getReviewByIdResponse = await makeAuthRequest('get', `/reviews/${reviewId}`);
    console.log('Review retrieved by ID:', getReviewByIdResponse);
    
    // Update review
    console.log('\nUpdating review...');
    const updatedComment = 'Updated review: Excellent service!';
    const updateReviewResponse = await makeAuthRequest('put', `/reviews/${reviewId}`, {
      rating: 5,
      comment: updatedComment
    });
    console.log('Review updated:', updateReviewResponse);
    
    // Verify update worked
    console.log('\nVerifying review update...');
    const verifyUpdateResponse = await makeAuthRequest('get', `/reviews/${reviewId}`);
    console.log('Update verification:', 
      verifyUpdateResponse.comment === updatedComment ? 'Success' : 'Failed',
      `(${verifyUpdateResponse.comment})`);
    
    // Delete review
    console.log('\nDeleting review...');
    const deleteReviewResponse = await makeAuthRequest('delete', `/reviews/${reviewId}`);
    console.log('Review deleted:', deleteReviewResponse);
    
    // Verify deletion
    console.log('\nVerifying review deletion...');
    try {
      await makeAuthRequest('get', `/reviews/${reviewId}`);
      console.log('Deletion verification failed: Review still exists');
    } catch (err) {
      console.log('Deletion verification successful: Review no longer exists');
    }
  } catch (error) {
    console.error('Review test failed:', error.response?.data || error.message);
  }
};

// Test User Profile
async function testUserProfile() {
  console.log('\n=== Testing User Profile ===');
  
  try {
    // Get profile
    console.log('Getting profile...');
    const getRes = await makeAuthRequest('get', '/user/profile');
    console.log('Profile retrieved:', getRes);

    // Update profile
    console.log('\nUpdating profile...');
    const updateRes = await makeAuthRequest('put', '/user/profile', {
      name: 'Updated Test User',
      preferences: {
        seat: 'Window',
        meal: 'Vegetarian'
      }
    });
    console.log('Profile updated:', updateRes);
  } catch (error) {
    console.error('Profile test failed:', error.response?.data || error.message);
  }
}

// Run all tests
const runTests = async () => {
  try {
    await testAuth();
    await testFlightSearch();
    await testBookings();
    await testReviews();
    await testUserProfile();
    console.log('\n=== All tests completed ===');
  } catch (error) {
    console.error('Test suite failed:', error);
  }
};

// Run the tests
runTests(); 