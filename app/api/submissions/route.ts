// app/api/submissions/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/connectDB';
import { verifyJWT } from '../../../lib/auth';
import Review from '../../../models/Review';

export async function GET(request: Request) {
    try {
        await connectDB();
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const decoded = verifyJWT(token);
        const submissions = await Review.find({ userId: decoded.id }).populate('productId');
        return NextResponse.json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const decoded = verifyJWT(token);
        const { productId, changes } = await request.json();

        const newSubmission = new Review({
            productId,
            userId: decoded.id,
            changes,
            status: 'pending'
        });

        await newSubmission.save();

        return NextResponse.json({ message: 'Submission created successfully', submission: newSubmission });
    } catch (error) {
        console.error('Error creating submission:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}