import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teacherId = url.searchParams.get("teacherId");
    const subjectId = url.searchParams.get("subjectId");

    if (!teacherId || !subjectId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const results = await prisma.result.findMany({
      where: { 
        teacherId: teacherId, 
        subjectId: Number(subjectId),
        verified: true, // Only fetch verified results
      },
      select: {
        student: { select: { id: true, name: true } },
        overallMark: true,
        sessionalExam: true,
        endTerm: true,
        grade: true,
      },
    });

    const data = results.map((res) => ({
      Student_ID: res.student.id,
      Student_Name: res.student.name,
      Sessional_Exam: res.sessionalExam || "N/A",
      End_Term: res.endTerm ?? "N/A",
      Overall_Mark: res.overallMark,
      Grade: res.grade,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new Response(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="results_${teacherId}_${subjectId}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}