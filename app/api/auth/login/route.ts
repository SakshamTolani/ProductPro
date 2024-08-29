// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import User from '../../../../models/User';
import { connectDB } from '../../../../lib/connectDB';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  await connectDB();
  const { email, password } = await request.json();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

  return NextResponse.json({ token, role: user.role });
}