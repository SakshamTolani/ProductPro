import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '../../../../lib/connectDB';
import { verifyJWT } from '../../../../lib/auth';
import Review from '../../../../models/Review';

export async function GET(request: NextRequest) {
  await connectDB();
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = verifyJWT(token);

    const [totalRequests, approvedRequests, rejectedRequests, pendingRequests] = await Promise.all([
      Review.countDocuments({ userId: decoded.id }),
      Review.countDocuments({ userId: decoded.id, status: 'approved' }),
      Review.countDocuments({ userId: decoded.id, status: 'rejected' }),
      Review.countDocuments({ userId: decoded.id, status: 'pending' })
    ]);

    return NextResponse.json({
      totalRequests,
      approvedRequests,
      rejectedRequests,
      pendingRequests
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ message: 'Failed to fetch user stats' }, { status: 500 });
  }
}