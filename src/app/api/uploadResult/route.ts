import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import prisma from "@/lib/prisma";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Missing file" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, "uploadedresults.xlsx");
    await writeFile(tempFilePath, uint8Array);

    if (!existsSync(tempFilePath)) {
      return NextResponse.json(
        { success: false, error: "File save failed." },
        { status: 400 }
      );
    }

    const fileBuffer = await readFile(tempFilePath);
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const resultData = xlsx.utils.sheet_to_json<{
      StudentID: string;
      SubjectCode: string;
      SessionalExam?: string;
      EndTerm?: number;
      OverallMark: number;
      Grade: string;
    }>(sheet);

    if (
      !resultData.every(
        (row) => row.StudentID && row.SubjectCode && row.OverallMark && row.Grade
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid Excel columns." },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      resultData.map(async (row) => {
        const student = await prisma.student.findUnique({
          where: { id: row.StudentID },
        });
        if (!student) {
          throw new Error(`Student with ID '${row.StudentID}' not found`);
        }

        const subject = await prisma.subject.findFirst({
          where: { subjectCode: row.SubjectCode },
        });
        if (!subject) {
          throw new Error(`Subject with code '${row.SubjectCode}' not found`);
        }

        return {
          studentId: student.id,
          subjectId: subject.id,
          sessionalExam: row.SessionalExam ?? null,
          endTerm: row.EndTerm ?? null,
          overallMark: row.OverallMark,
          grade: row.Grade,
        };
      })
    );

    await prisma.result.createMany({ data: results, skipDuplicates: false });

    return NextResponse.json({
      success: true,
      message: "Results imported successfully",
    });
  } catch (error) {
    console.error("Error importing results:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}
