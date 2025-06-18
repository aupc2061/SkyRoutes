import { NextResponse } from 'next/server';
var Amadeus = require('amadeus');

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received search request body:', body);

    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults = '1',
      children = '0',
      infants = '0',
      travelClass = 'ECONOMY',
      nonStop = false
    } = body;

    // Validate required parameters
    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Making Amadeus API request with parameters:', {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      children,
      infants,
      travelClass,
      nonStop
    });

    // Make request to Amadeus API
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      children,
      infants,
      travelClass,
      nonStop,
      currencyCode: 'USD',
      max: 20 // Limit results to 20 offers
    });

    console.log('Amadeus API response:', response.data);

    // Return the flight offers
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Flight search error:', error);
    
    // Handle Amadeus API errors
    if (error.response) {
      console.error('Amadeus API error details:', error.response.data);
      return NextResponse.json(
        { 
          error: error.response.data.errors?.[0]?.detail || 'Flight search failed',
          code: error.code
        },
        { status: error.response.status || 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
