import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '../../../../lib/connectDB';
import { verifyJWT } from '../../../../lib/auth';
import Review from '../../../../models/Review';
import User from '../../../../models/User';  // Import the User model
import Product from '../../../../models/Product';  // Import the Product model
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    await connectDB();
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const decoded = verifyJWT(token);

        if (decoded.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        // Populate userId to get the email, and productId to get the title
        const pendingReviews = await Review.find({ status: 'pending' })
            .populate({ path: 'userId', select: 'email', model: User })
            .populate({ path: 'productId', select: 'title', model: Product })
            .exec();
        return NextResponse.json(pendingReviews);
    } catch (error) {
        console.error('Error fetching pending reviews:', error);
        return NextResponse.json({ message: 'Failed to fetch pending reviews' }, { status: 500 });
    }
}
