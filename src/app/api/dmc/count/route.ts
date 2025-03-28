import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const semesterId = searchParams.get('semesterId');
    
    if (!semesterId) {
      return NextResponse.json({ error: 'Semester ID is required' }, { status: 400 });
    }
    
    // Find all students in the specified semester with results
    const students = await prisma.student.findMany({
      where: {
        semesterId: parseInt(semesterId),
        results: {
          some: {
            subject: {
              semesterId: parseInt(semesterId)
            }
          }
        }
      },
      include: {
        results: {
          where: {
            subject: {
              semesterId: parseInt(semesterId)
            }
          }
        }
      }
    });
    
    // Filter students with only passing grades
    const validStudentCount = students.filter(student => 
      student.results.every(result => result.grade !== 'E')
    ).length;
    
    return NextResponse.json({ count: validStudentCount });
  } catch (error) {
    console.error('Error counting students:', error);
    return NextResponse.json({ error: 'Failed to count students' }, { status: 500 });
  }
}