const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';
let token = '';

// Test review data
const testReview = {
  airline: 'Delta',
  flightNumber: 'DL123',
  rating: 5,
  comment: 'Great flight!'
};

// Simple login and review test
const runTest = async () => {
  try {
    // Login first to get token
    console.log('Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    token = loginResponse.data.token;
    console.log('Login successful, token received:', token);
    
    // Create review with more detailed error logging
    console.log('\nCreating review...');
    try {
      const createReviewResponse = await axios({
        method: 'post',
        url: `${API_URL}/reviews`,
        headers: { Authorization: `Bearer ${token}` },
        data: testReview
      });
      console.log('Review created:', createReviewResponse.data);
    } catch (error) {
      console.error('Review creation failed:');
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request data:', error.config?.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

// Run test
runTest();
