import { NextResponse } from 'next/server';
const Amadeus = require('amadeus');

interface FlightPoint {
  iataCode: string;
  departure?: {
    timings: Array<{
      qualifier: string;
      value: string;
    }>;
  };
  arrival?: {
    timings: Array<{
      qualifier: string;
      value: string;
    }>;
  };
}

interface FlightData {
  flightDesignator: {
    carrierCode: string;
    flightNumber: string;
  };
  flightPoints: FlightPoint[];
  status?: string;
}

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET
});

console.log(process.env.AMADEUS_API_KEY, process.env.AMADEUS_API_SECRET);

export async function POST(request: Request) {
  try {
    const { carrierCode, flightNumber, scheduledDepartureDate } = await request.json();

    if (!carrierCode || !flightNumber || !scheduledDepartureDate) {
      return NextResponse.json(
        { error: 'Missing required fields: carrierCode, flightNumber, scheduledDepartureDate' },
        { status: 400 }
      );
    }

    const response = await amadeus.schedule.flights.get({
      carrierCode,
      flightNumber,
      scheduledDepartureDate
    });

    const flightData = response.data[0] as FlightData;
    if (!flightData) {
      return NextResponse.json(
        { error: 'No flight status found' },
        { status: 404 }
      );
    }

    const departure = flightData.flightPoints.find((p: FlightPoint) => p.departure);
    const arrival = flightData.flightPoints.find((p: FlightPoint) => p.arrival);

    if (!departure || !arrival) {
      return NextResponse.json(
        { error: 'Flight departure or arrival info not found' },
        { status: 404 }
      );
    }

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

    const airlinesResp = await amadeus.referenceData.airlines.get({
      airlineCodes: carrierCode
    });
    const airlineInfo = airlinesResp.data[0];
    const airlineFullName = airlineInfo?.commonName || airlineInfo?.businessName || carrierCode;

    const departureTime = departure.departure?.timings.find((t) => t.qualifier === 'STD')?.value || 'Unknown';
    const arrivalTime = arrival.arrival?.timings.find((t) => t.qualifier === 'STA')?.value || 'Unknown';

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

    return NextResponse.json({ status });
  } catch (error: any) {
    console.error('Flight status error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch flight status',
        details: error.response?.data || error.message
      },
      { status: 500 }
    );
  }
} 