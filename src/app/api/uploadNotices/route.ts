// src/app/api/uploadNotices/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Read the request body as a stream
    const chunks: Uint8Array[] = [];
    const reader = request.body?.getReader();

    if (!reader) {
      return NextResponse.json(
        { message: 'Failed to read request body' },
        { status: 400 }
      );
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    const formData = Buffer.concat(chunks);

    // Extract the boundary from the content-type header
    const contentType = request.headers.get('content-type') || '';
    const boundary = contentType.split('; ')[1]?.replace('boundary=', '') || '';
    const parts = formData.toString().split(`--${boundary}`);

    let title = '';
    let fileBuffer: Buffer | null = null;
    let fileName = '';

    // Parse the multipart form data
    for (const part of parts) {
      if (part.includes('name="title"')) {
        title = part.split('\r\n\r\n')[1].trim();
      } else if (part.includes('name="noticeFile"')) {
        const fileData = part.split('\r\n\r\n')[1].trim();
        const fileHeader = part.split('\r\n')[1];
        fileName = fileHeader.match(/filename="(.+)"/)?.[1] || '';
        fileBuffer = Buffer.from(fileData, 'binary'); // Ensure proper encoding
      }
    }

    if (!title || !fileBuffer || !fileName) {
      return NextResponse.json(
        { message: 'Invalid form data' },
        { status: 400 }
      );
    }

    // Upload file to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // For non-image files
          format: 'pdf', // Explicitly set the file format
          public_id: fileName.replace(/\.[^/.]+$/, ''), // Use the file name as the public ID (without extension)
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      );
      // Convert fileBuffer to a Readable stream
      const readableStream = Readable.from(fileBuffer);
      readableStream.pipe(stream);
    });

    // Save metadata to database using Prisma
    await prisma.notice.create({
      data: {
        title,
        fileUrl: uploadResult.secure_url,
        uploadedBy: 'Registrar',
      },
    });

    return NextResponse.json(
      { message: 'Notice uploaded successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading notice:', error);
    return NextResponse.json(
      { message: 'Failed to upload notice' },
      { status: 500 }
    );
  }
}