import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { FlightSeat } from '@/models/FlightSeat';

// Get available seats for a flight
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const flightNumber = searchParams.get('flightNumber');
    const flightDate = searchParams.get('flightDate');

    console.log('[GET] /api/flight-seats params:', { flightNumber, flightDate });

    if (!flightNumber || !flightDate) {
      return NextResponse.json(
        { error: 'Flight number and date are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const flightSeat = await FlightSeat.findOne({ flightNumber, flightDate });
    console.log('[GET] /api/flight-seats found document:', flightSeat);
    
    if (!flightSeat) {
      // If no document exists, all seats are available
      return NextResponse.json({ 
        availableSeats: 30,
        nextAvailableSeat: 1
      });
    }

    return NextResponse.json({
      availableSeats: flightSeat.getAvailableSeatsCount(),
      nextAvailableSeat: flightSeat.getNextAvailableSeat()
    });

  } catch (error) {
    console.error('Flight seats error:', error);
    return NextResponse.json(
      { error: 'Failed to get flight seats' },
      { status: 500 }
    );
  }
}

// Assign a seat for a booking
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to book seats' },
        { status: 401 }
      );
    }

    const { flightNumber, flightDate } = await request.json();
    console.log('[POST] /api/flight-seats received:', { flightNumber, flightDate });

    if (!flightNumber || !flightDate) {
      return NextResponse.json(
        { error: 'Flight number and date are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find or create flight seat document
    let flightSeat = await FlightSeat.findOne({ flightNumber, flightDate });
    console.log('[POST] /api/flight-seats found:', flightSeat);
    
    if (!flightSeat) {
      flightSeat = new FlightSeat({
        flightNumber,
        flightDate,
        takenSeats: [1] // Take the first seat if new document
      });
      console.log('[POST] /api/flight-seats creating new document:', flightSeat);
    } else {
      const nextSeat = flightSeat.getNextAvailableSeat();
      if (!nextSeat) {
        return NextResponse.json(
          { error: 'No seats available' },
          { status: 400 }
        );
      }
      flightSeat.takenSeats.push(nextSeat);
      console.log('[POST] /api/flight-seats updated takenSeats:', flightSeat.takenSeats);
    }

    await flightSeat.save();
    console.log('[POST] /api/flight-seats saved document:', flightSeat);

    return NextResponse.json({
      success: true,
      seatNumber: flightSeat.takenSeats[flightSeat.takenSeats.length - 1],
      availableSeats: flightSeat.getAvailableSeatsCount()
    });

  } catch (error) {
    console.error('Flight seat assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to assign seat' },
      { status: 500 }
    );
  }
} 