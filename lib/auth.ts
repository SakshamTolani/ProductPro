// lib/auth.ts
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  role: string;
}

export function verifyJWT(token: string): JwtPayload {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  if (typeof decoded === 'string') {
    throw new Error('Invalid token');
  }
  return decoded as JwtPayload;
}