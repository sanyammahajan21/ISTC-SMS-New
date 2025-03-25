import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teacherId = url.searchParams.get("teacherId");
    const subjectName = url.searchParams.get("subject");

    if (!teacherId || !subjectName) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Fetch results for the specific subject under the teacher
    const results = await prisma.result.findMany({
      where: { 
        teacherId: teacherId,
        subject: { name: subjectName }  // Ensure only this subject
      },
      include: {
        student: { select: { id: true, name: true } },
      },
    });

    if (results.length === 0) {
      return NextResponse.json({ error: "No results found for this subject" }, { status: 404 });
    }

    // Prepare data for the Excel sheet
    const data = results.map(res => ({
      Student_ID: res.student.id,
      Student_Name: res.student.name,
      Sessional_Exam: res.sessionalExam || "N/A",
      End_Term: res.endTerm ?? "N/A",
      Overall_Mark: res.overallMark,
      Grade: res.grade,
      Verified: res.verified ? "Yes" : "No",
    }));

    // Create a workbook for this specific subject
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, subjectName);

    // Convert to buffer
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new Response(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${teacherId}_${subjectName}_results.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}