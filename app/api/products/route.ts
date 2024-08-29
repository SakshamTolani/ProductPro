import { NextResponse, NextRequest } from 'next/server';
import Product from '../../../models/Product';
import { connectDB } from '../../../lib/connectDB';
import { verifyJWT } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const products = await Product.find();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = verifyJWT(token);
    if (decoded.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const productData = await request.json();
    const newProduct = new Product(productData);
    await newProduct.save();
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}