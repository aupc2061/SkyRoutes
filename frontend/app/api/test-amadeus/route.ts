import { NextResponse } from 'next/server';
var Amadeus = require('amadeus');

const amadeus = new Amadeus({
  clientId: "UfPF6GsEUVPXr7qzAEDxa2FPtjutzluf",
  clientSecret: "qbM3FTrVzugtZlOl"
});

export async function GET() {
  try {
    // Simple test search with dummy data
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: 'NYC',
      destinationLocationCode: 'LON',
      departureDate: '2025-06-05',
      adults: '1',
      max: '1'
    });

    // Log the raw response
    console.log('Raw Amadeus Response:', JSON.stringify(response.data, null, 2));

     // Step 2: Pick the first flight offer (for demo)
    const selectedOffer = response.data[0];

    // Optional: If no offer found, handle gracefully
    if (!selectedOffer) {
    return NextResponse.json({
        success: false,
        error: 'No flight offers found'
    }, { status: 404 });
    }

    // Step 3: Call Flight Offers Pricing for details/validation
    const pricingResponse = await amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify({
            data: {
            type: 'flight-offers-pricing',
            flightOffers: [selectedOffer]
            }
        })
    );
  
      // Log the raw pricing response
    console.log('Raw Amadeus Pricing Response:', JSON.stringify(pricingResponse.data, null, 2));

    // Step 4: Return enriched offer
    return NextResponse.json({
        success: true,
        data: {
            searchedOffers: response.data,
            pricedOffer: pricingResponse.data
        }
    });
    } catch (error: any) {
        console.error('Amadeus API Error:', error);
        return NextResponse.json({
        success: false,
        error: error.message || 'Failed to fetch flight offers'
        }, { status: 500 });
    }
} 