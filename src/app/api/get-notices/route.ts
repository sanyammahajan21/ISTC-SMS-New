// src/app/api/get-notices/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch all notices from the database using Prisma
        const notices = await prisma.notice.findMany({
            orderBy: {
                timestamp: 'desc',
            },
        });

        // Return the notices as a JSON response
        return NextResponse.json(notices, { status: 200 });
    } catch (error) {
        console.error('Error fetching notices:', error);
        return NextResponse.json(
            { message: 'Failed to fetch notices' },
            { status: 500 }
        );
    }
}