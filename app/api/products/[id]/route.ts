import { NextResponse, NextRequest } from 'next/server';
import Product from '../../../../models/Product';
import { connectDB } from '../../../../lib/connectDB';
import { verifyJWT } from '../../../../lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = verifyJWT(token);
    if (decoded.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const updates = await request.json();

    // Ensure all fields are properly updated, including imageUrl
    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        title: updates.title,
        description: updates.description,
        price: updates.price,
        imageUrl: updates.imageUrl
      },
      { new: true }
    );

    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Failed to update product' }, { status: 500 });
  }
}