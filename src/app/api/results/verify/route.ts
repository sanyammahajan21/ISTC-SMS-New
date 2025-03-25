import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { teacherId, subjectName } = await req.json();

    if (!teacherId || !subjectName) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Update results for only the selected subject under the teacher
    await prisma.result.updateMany({
      where: { 
        teacherId, 
        subject: { name: subjectName } 
      },
      data: { verified: true },
    });

    return NextResponse.json({ message: `Results for ${subjectName} verified successfully` }, { status: 200 });
  } catch (error) {
    console.error("Error verifying results:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}