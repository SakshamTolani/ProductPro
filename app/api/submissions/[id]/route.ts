// app/api/submissions/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/connectDB';
import { verifyJWT } from '@/lib/auth';
import Review from '@/models/Review';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify the token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyJWT(token);
    const userId = decoded?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to the database
    await connectDB();

    // Find the review submission
    const submission = await Review.findOne({
      _id: new mongoose.Types.ObjectId(params.id),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Fetch the associated product title
    const product = await Product.findById(submission.productId);

    // Prepare the response
    const responseSubmission = {
      ...submission.toObject(),
      productTitle: product ? product.title : 'Unknown Product'
    };

    return NextResponse.json(responseSubmission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
