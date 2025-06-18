import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { Review } from '@/models/Review';
import { User } from '@/models/User';

// GET /api/reviews - Get reviews with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const airline = searchParams.get('airline');
    const flightNumber = searchParams.get('flightNumber');

    await connectDB();

    const query: any = {};
    if (airline) query.airline = airline;
    if (flightNumber) query.flightNumber = flightNumber;

    // Log the query parameters
    console.log('Fetching reviews with query:', query);

    const reviews = await Review.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email')
      .limit(50);

    // Log the number of reviews found
    console.log(`Found ${reviews.length} reviews`);

    return NextResponse.json(reviews, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create new review
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { airline, flightNumber, rating, comment } = body;

    if (!airline || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user ID from email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const review = await Review.create({
      userId: user._id,
      airline,
      flightNumber,
      rating,
      comment,
    });

    // Populate user details
    await review.populate('userId', 'name email');

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 