import { NextResponse } from 'next/server';
import User from '../../../../models/User';
import { connectDB } from '../../../../lib/connectDB';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await connectDB();
  const { email, password, role } = await request.json();

  const userExists = await User.findOne({ email });
  if (userExists) return NextResponse.json({ message: 'User already exists' }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword,
    role,
  });

  await newUser.save();
  return NextResponse.json({ message: 'User registered successfully' });
}