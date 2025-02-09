import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import prisma from "@/lib/prisma"; // Ensure Prisma is configured
import { writeFile } from "fs/promises";
import { NextRequest } from "next/server";

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export async function POST(req: NextRequest) {
  try {
    // Convert Next.js Request to ArrayBuffer and then Uint8Array
    const data = await req.arrayBuffer();
    const buffer = new Uint8Array(data); // ✅ Convert to Uint8Array

    // Define temp file path
    const tempFilePath = "/tmp/uploaded.xlsx";

    // Write file to /tmp directory
    await writeFile(tempFilePath, buffer);

    // Read Excel file
    const workbook = xlsx.readFile(tempFilePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const studentData = xlsx.utils.sheet_to_json(sheet);

    // Format Data for Prisma
    const students = studentData.map((row: any) => ({
        name: row.Name,
        username: row.RollNo,
        fatherName: row["Father Name"],
        motherName: row["Mother Name"],
        branchId: row.BranchId, // ✅ Ensure this column exists in Excel
        gradeId: row.GradeId,   // ✅ Ensure this column exists in Excel
      }));
    // Bulk Insert into MySQL using Prisma
    await prisma.student.createMany({ data: students, skipDuplicates: true });

    return NextResponse.json({ success: true, message: "Students imported successfully" });
  } catch (error) {
    console.error("Error importing students:", error); // Logs the error for debugging
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred"
    });
  }
}
