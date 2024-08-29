import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '../../../../lib/connectDB';
import { verifyJWT } from '../../../../lib/auth';
import User from '../../../../models/User';

export async function GET(request: NextRequest) {
  await connectDB();
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = verifyJWT(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Failed to fetch profile' }, { status: 500 });
  }
}