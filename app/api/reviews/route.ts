import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '../../../lib/connectDB';
import { verifyJWT } from '../../../lib/auth';
import Review from '../../../models/Review';
import User from '../../../models/User';  // Import the User model
import Product from '../../../models/Product';  // Import the Product model

export async function POST(request: NextRequest) {
  await connectDB();
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = verifyJWT(token);
    const { productId, changes } = await request.json();

    const newReview = new Review({
      productId,
      changes,
      userId: decoded.id,
      status: 'pending'
    });

    await newReview.save();
    return NextResponse.json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Failed to submit review' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  await connectDB();
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = verifyJWT(token);
    const reviews = await Review.find({ author: decoded.id });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Failed to fetch reviews' }, { status: 500 });
  }
}