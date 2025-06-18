const express = require('express');
const router = express.Router();
const amadeus = require('../utils/amadeus');
const auth = require('../middleware/auth');
const FlightSeat = require('../models/FlightSeat');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Read system prompt (optional)
let systemPrompt = '';
try {
  systemPrompt = fs.readFileSync(
    path.join(__dirname, '..', '..', 'src', 'aiprompt.txt'),
    'utf-8'
  );
  console.log('AI prompt loaded successfully');
} catch (error) {
  console.log('AI prompt file not found, AI features will be disabled');
}

// Search flights
router.get('/search', async (req, res) => {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      infants = 0,
      travelClass = 'ECONOMY',
      nonStop = false
    } = req.query;

    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const searchParams = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      children,
      infants,
      travelClass,
      nonStop
    };

    if (returnDate) {
      searchParams.returnDate = returnDate;
    }

    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    
    // Process and enhance flight data with seat availability
    const enhancedFlights = await Promise.all(
      response.data.map(async (flight) => {
        const flightNumber = flight.itineraries[0].segments[0].carrierCode + 
                           flight.itineraries[0].segments[0].number;
        
        // Get seat availability for this flight
        const seatInfo = await FlightSeat.findOne({
          flightNumber,
          flightDate: departureDate
        });

        return {
          ...flight,
          seatAvailability: seatInfo ? {
            available: seatInfo.getAvailableSeats(),
            nextAvailable: seatInfo.getNextAvailableSeat()
          } : null
        };
      })
    );

    res.json(enhancedFlights);
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({ error: 'Failed to search flights' });
  }
});

// Get flight status
router.post('/status', async (req, res) => {
  try {
    const { carrierCode, flightNumber, scheduledDepartureDate } = req.body;

    if (!carrierCode || !flightNumber || !scheduledDepartureDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: carrierCode, flightNumber, scheduledDepartureDate' 
      });
    }

    const response = await amadeus.schedule.flights.get({
      carrierCode,
      flightNumber,
      scheduledDepartureDate
    });

    const flightData = response.data[0];
    if (!flightData) {
      return res.status(404).json({ error: 'No flight status found' });
    }

    const departure = flightData.flightPoints.find(p => p.departure);
    const arrival = flightData.flightPoints.find(p => p.arrival);

    if (!departure || !arrival) {
      return res.status(404).json({ error: 'Flight departure or arrival info not found' });
    }

    // Get airport names
    const originAirportResp = await amadeus.referenceData.locations.get({
      keyword: departure.iataCode,
      subType: 'AIRPORT'
    });
    const originAirportName = originAirportResp.data[0]?.name || 'Unknown Airport';

    const destinationAirportResp = await amadeus.referenceData.locations.get({
      keyword: arrival.iataCode,
      subType: 'AIRPORT'
    });
    const destinationAirportName = destinationAirportResp.data[0]?.name || 'Unknown Airport';

    // Get airline info
    const airlinesResp = await amadeus.referenceData.airlines.get({
      airlineCodes: carrierCode
    });
    const airlineInfo = airlinesResp.data[0];
    const airlineFullName = airlineInfo?.commonName || airlineInfo?.businessName || carrierCode;

    const departureTime = departure.departure?.timings.find(t => t.qualifier === 'STD')?.value || 'Unknown';
    const arrivalTime = arrival.arrival?.timings.find(t => t.qualifier === 'STA')?.value || 'Unknown';

    const status = {
      airlineCode: flightData.flightDesignator.carrierCode,
      airlineName: airlineFullName,
      airlineLogoUrl: `https://pics.avs.io/200/200/${carrierCode}.png`,
      flightNumber: flightData.flightDesignator.flightNumber,
      origin: departure.iataCode,
      originAirportName,
      departureTime,
      departureTerminal: 'Unknown',
      departureGate: 'Unknown',
      destination: arrival.iataCode,
      destinationAirportName,
      arrivalTime,
      arrivalTerminal: 'Unknown',
      arrivalGate: 'Unknown',
      status: flightData.status || 'Scheduled'
    };

    res.json({ status });
  } catch (error) {
    console.error('Flight status error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch flight status',
      details: error.response?.data || error.message
    });
  }
});

// AI Assistant
router.post('/ai-assistant', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
      generationConfig: {
        temperature: 0.3,
      },
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(query);
    const text = result.response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("AI Assistant error:", error.message);
    res.status(500).json({
      error: "Failed to process query with AI assistant",
      details: error.message
    });
  }
});

// Get flight details
router.get('/:flightNumber', async (req, res) => {
  try {
    const { flightNumber } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Get seat availability
    const seatInfo = await FlightSeat.findOne({
      flightNumber,
      flightDate: date
    });

    if (!seatInfo) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.json({
      flightNumber,
      date,
      seatAvailability: {
        available: seatInfo.getAvailableSeats(),
        nextAvailable: seatInfo.getNextAvailableSeat()
      }
    });
  } catch (error) {
    console.error('Flight details error:', error);
    res.status(500).json({ error: 'Failed to get flight details' });
  }
});

// Get airport suggestions
router.get('/airports/suggestions', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'AIRPORT'
    });

    res.json(response.data);
  } catch (error) {
    console.error('Airport suggestions error:', error);
    res.status(500).json({ error: 'Failed to get airport suggestions' });
  }
});

// Get flight offers price
router.post('/price', async (req, res) => {
  try {
    const { flightOffers } = req.body;

    if (!flightOffers) {
      return res.status(400).json({ error: 'Flight offers are required' });
    }

    const response = await amadeus.shopping.flightOffers.pricing.post(flightOffers);
    res.json(response.data);
  } catch (error) {
    console.error('Flight price error:', error);
    res.status(500).json({ error: 'Failed to get flight price' });
  }
});

module.exports = router; 