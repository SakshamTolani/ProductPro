//app/upload/route.ts

import { NextResponse } from 'next/server';
import { storage } from '../../../lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { verifyJWT } from '../../../lib/auth';

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    verifyJWT(token);
    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const filename = `${uuidv4()}.jpg`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const bucket = storage.bucket();
    const fileRef = bucket.file(filename);

    await fileRef.save(fileBuffer, {
      contentType: file.type,
      public: true,
      metadata: {
        firebaseStorageDownloadTokens: uuidv4(),
      },
    });

    const publicUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to upload image' }, { status: 500 });
  }
}