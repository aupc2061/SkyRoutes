import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { User } from '@/models/User';

interface Booking {
  flightId: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: string;
  price: number;
  status: string;
}

// Create new booking
export async function POST(request: Request) {
  try {
    // Get session safely
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to book flights' },
        { status: 401 }
      );
    }

    // Parse booking data safely
    let bookingData;
    try {
      bookingData = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid booking data' },
        { status: 400 }
      );
    }

    // Validate booking data
    if (!bookingData?.flightId || !bookingData?.airline || !bookingData?.flightNumber) {
      return NextResponse.json(
        { error: 'Invalid booking data structure' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Add to user's booking history
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        $push: { 
          bookingHistory: {
            ...bookingData,
            departureTime: new Date(bookingData.departureTime),
            arrivalTime: new Date(bookingData.arrivalTime)
          } 
        } 
      },
      { new: true, select: 'bookingHistory' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update booking history' },
        { status: 500 }
      );
    }

    // Return only the new booking
    const newBooking = updatedUser.bookingHistory[updatedUser.bookingHistory.length - 1];
    return NextResponse.json({ 
      success: true, 
      booking: newBooking
    });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// Update existing booking
export async function PATCH(request: Request) {
  try {
    // Get session safely
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to update bookings' },
        { status: 401 }
      );
    }

    // Parse update data safely
    let updateData;
    try {
      updateData = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid update data' },
        { status: 400 }
      );
    }

    // Validate update data
    const { bookingId, status, ...otherUpdates } = updateData;
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Get user and validate booking ownership using flightId
    const user = await User.findOne({ 
      email: session.user.email,
      'bookingHistory.flightId': bookingId 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the specific booking in the array using flightId
    const updatedUser = await User.findOneAndUpdate(
      { 
        email: session.user.email,
        'bookingHistory.flightId': bookingId
      },
      { 
        $set: {
          'bookingHistory.$.status': status || 'Updated',
          ...Object.entries(otherUpdates).reduce((acc, [key, value]) => ({
            ...acc,
            [`bookingHistory.$.${key}`]: value
          }), {})
        }
      },
      { new: true, select: 'bookingHistory' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    // Find and return the updated booking
    const updatedBooking = updatedUser.bookingHistory.find(
      (booking: Booking) => booking.flightId === bookingId
    );

    return NextResponse.json({ 
      success: true, 
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
} 