// app/api/reviews/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import Review from '../../../../models/Review';
import Product from '../../../../models/Product';
import { connectDB } from '../../../../lib/connectDB';
import { verifyJWT } from '../../../../lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = verifyJWT(token);
    if (decoded.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const review = await Review.findById(params.id).populate('productId', 'title description price imageUrl');
    if (!review) return NextResponse.json({ message: 'Review not found' }, { status: 404 });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ message: 'Failed to fetch review' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = verifyJWT(token);
    if (decoded.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { status } = await request.json();
    const review = await Review.findById(params.id);
    if (!review) return NextResponse.json({ message: 'Review not found' }, { status: 404 });

    review.status = status;
    await review.save();

    if (status === 'approved') {
      await Product.findByIdAndUpdate(review.productId, review.changes, { new: true });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ message: 'Failed to update review' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string; action: 'approve' | 'reject' } }) {
  await connectDB();
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = verifyJWT(token);
    if (decoded.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    console.log(params.id + " " + params.action);
    
    const review = await Review.findById(params.id);
    if (!review) return NextResponse.json({ message: 'Review not found' }, { status: 404 });

    if (params.action === 'approve') {
      await Product.findByIdAndUpdate(review.productId, review.changes);
      review.status = 'approved';
    } else if (params.action === 'reject') {
      review.status = 'rejected';
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    await review.save();
    return NextResponse.json({ message: `Review ${params.action}d successfully` });
  } catch (error) {
    console.error(`Error ${params.action}ing review:`, error);
    return NextResponse.json({ message: `Failed to ${params.action} review` }, { status: 500 });
  }
}
