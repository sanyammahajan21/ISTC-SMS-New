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

  
    const file = formData.get("file") as Blob; // Get the file from the form data

    if ( !file) {
      return NextResponse.json(
        { success: false, error: "Missing file " },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, "uploadedteachers.xlsx");
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
    

    const teacherData = xlsx.utils.sheet_to_json<{
      Name: string;
      TeacherID: string;
    }>(sheet);

    
    if (!teacherData.every((row) => row.Name && row.TeacherID)) {
      return NextResponse.json({ success: false, error: "Invalid Excel columns." }, { status: 400 });
    }


    const teachers = teacherData.map((row) => ({
      name: row.Name,
      username: row.TeacherID,  
         
    }));

 
    await prisma.teacher.createMany({ data: teachers, skipDuplicates: false });

    return NextResponse.json({ success: true, message: "Teachers imported successfully" });
  } catch (error) {
    console.error("Error importing teachers:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}
