import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jsPDF } from "jspdf";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    // Fetch the student with branch information
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { branch: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Create PDF document
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont('arial');

    // Generate formatted date
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleString("default", { month: "long" })} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

    // Extract student details
    const createdAtDate = new Date(student.createdAt);
    const fromMonthYear = `${createdAtDate.toLocaleString("default", { month: "short" })} ${createdAtDate.getFullYear()}`;
    const toMonthYear = `${currentDate.toLocaleString("default", { month: "short" })} ${currentDate.getFullYear()}`;

    // Add certificate details
    doc.setFontSize(14);
    doc.text(`No.Prin./Char/${student.username}/ISTC `, 32, 79);
    doc.text(`Dated: ${formattedDate}`, 140, 79);

    doc.setFontSize(16);
    doc.text("MIGRATION CERTIFICATE", 105, 97, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(70, 98, 140, 98);

    doc.setFontSize(14);
    const text = `This is to certify that ${student.name.toUpperCase()}, Roll No. ${student.username}, S/o/D/o Sh. ${student.fatherName.toUpperCase()} was a bonafide student of this institute from ${fromMonthYear} to ${toMonthYear}.`;

    const splitText = doc.splitTextToSize(text, 140);
    doc.text(splitText, 30, 110);

    const objectionText = "The institute has No Objection for his/her further studies from any recognized Board/Institute or University.";
    const splitObjText = doc.splitTextToSize(objectionText, 150);
    doc.text(splitObjText, 29, 131);

    doc.text("(Principal)", 157, 165);

    // Generate PDF output
    const pdfOutput = doc.output("arraybuffer");

    return new Response(pdfOutput, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${student.name}_migration_certificate.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating migration certificate:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
