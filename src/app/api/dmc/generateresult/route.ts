import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { updateProgress } from '../progress/route';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { semesterId } = await req.json();

    if (!semesterId) {
      return NextResponse.json({ success: false, message: 'Semester ID is required' }, { status: 400 });
    }

    // Find all students in the specified semester who have results
    const students = await prisma.student.findMany({
      where: {
        semesterId: parseInt(semesterId),
        results: {
          some: {} // Only include students who have at least one result
        }
      },
      include: {
        branch: { include: { _count: { select: { lectures: true } } } },
        semester: true,
        results: {
          include: { subject: true },
        }
      }
    });

    if (students.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No students found with results for the selected semester' 
      }, { status: 404 });
    }

    // Reset progress tracking
    updateProgress(0, students.length);

    // Create a ZIP file to store all PDFs
    const zip = new JSZip();
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const folderName = `result_semester_${semesterId}_${timestamp}`;
    
    // Directory to save the zip file temporarily
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    const zipFilePath = path.join(tmpDir, `${folderName}.zip`);
    const publicUrl = `/downloads/${folderName}.zip`;
    
    // Process each student and generate PDF
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Generate PDF for this student
      const pdfDoc = await generateStudentPDF(student);
      
      // Add the PDF to the ZIP file
      const fileName = `${student.name.replace(/\s+/g, '_')}_${student.username}.pdf`;
      zip.file(fileName, pdfDoc.output('arraybuffer'));
      
      // Update progress
      updateProgress(i + 1, students.length);
    }
    
    // Generate ZIP file
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Save the ZIP file to the public directory for download
    const publicDir = path.join(process.cwd(), 'public', 'downloads');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const publicFilePath = path.join(publicDir, `${folderName}.zip`);
    fs.writeFileSync(publicFilePath, new Uint8Array(zipContent));
    
    // Return success response with download URL
    return NextResponse.json({ 
      success: true, 
      message: `Generated result for ${students.length} students`,
      url: publicUrl
    });
    
  } catch (error) {
    console.error('Error generating DMCs:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to generate DMCs' 
    }, { status: 500 });
  }
}


async function generateStudentPDF(student: any) {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
   
  // Calculate graduation year (student creation year + 4)
  const calculateGraduationYear = () => {
    const creationDate = new Date(student.createdAt);
    const graduationYear = creationDate.getFullYear() + 4;
    return graduationYear;
  };
  
  // Determine semester period based on semester number
  const getSemesterPeriod = () => {
    const currentYear = new Date().getFullYear();
    const semesterNumber = Number(student.semesterId);
    
    if (semesterNumber % 2 === 0) {
      return `FEBRUARY ${currentYear} to JUNE ${currentYear}`;
    } else {
      return `JULY ${currentYear} to JANUARY ${currentYear + 1}`;
    }
  };
      // Set font
      doc.setFont('helvetica');
      
      // A4 size: 210x297mm
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      
      // Add border to the document
      doc.setDrawColor(0, 51, 153); // Navy blue border
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
      
      // Add decorative inner border
      doc.setDrawColor(0, 102, 204); // Lighter blue
      doc.setLineWidth(0.2);
      doc.rect(margin + 3, margin + 3, pageWidth - 2 * (margin + 3), pageHeight - 2 * (margin + 3));

      const headerImage = "public/docLogo.png";
      const img = new Image();
      img.src = headerImage;
  
      await new Promise((resolve) => {
        img.onload = resolve;
      });
  
      const imgWidth = 800;
      const imgHeight = 100;
      const aspectRatio = imgWidth / imgHeight;
      const pdfImageWidth = 180;
      const pdfImageHeight = pdfImageWidth / aspectRatio;
      const x = (doc.internal.pageSize.getWidth() - pdfImageWidth) / 2;
      const y = 10;
  
      doc.addImage(img, "PNG", x, y, pdfImageWidth, pdfImageHeight);
  
      const headerTop = 10;
      // Navy blue bar (similar to image)
      doc.setFillColor(0, 28, 99); // Dark navy blue
      doc.rect(margin, headerTop + 25, pageWidth - 2 * margin, 5, 'F');
      
      // Title - Detailed Marks Certificate
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102); // Dark blue
      doc.text("DETAILED MARKS CERTIFICATE", pageWidth / 2, headerTop + 40, { align: 'center' });
      
      // Serial number and Date
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'long' })}, ${currentDate.getFullYear()}`;
      doc.text(`Certificate No: ${Math.floor(Math.random() * 1000000)}`, margin, headerTop + 50);
      doc.text(`Date: ${formattedDate}`, pageWidth - margin, headerTop + 50, { align: 'right' });
      
      // Student details section
      doc.setDrawColor(0, 51, 153);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, headerTop + 55, pageWidth - 2 * margin, 50, 2, 2);
      
      // Student details - Left column headers
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("Student Name:", margin + 5, headerTop + 65);
      doc.text("Father's Name:", margin + 5, headerTop + 75);
      doc.text("Mother's Name:", margin + 5, headerTop + 85);
      doc.text("Roll Number:", margin + 5, headerTop + 95);
      
      // Student details - Right column headers
      doc.text("Branch:", pageWidth / 2 + 5, headerTop + 65);
      doc.text("Semester:", pageWidth / 2 + 5, headerTop + 75);
      doc.text("Semester Period:", pageWidth / 2 + 5, headerTop + 85);
      doc.text("Academic Year:", pageWidth / 2 + 5, headerTop + 95);
      
      // Student details - Values (left column)
      doc.setFont('helvetica', 'normal');
      doc.text(student.name.toUpperCase(), margin + 40, headerTop + 65);
      doc.text(student.fatherName.toUpperCase(), margin + 40, headerTop + 75);
      doc.text(student.motherName?.toUpperCase() || 'N/A', margin + 40, headerTop + 85);
      doc.text(student.username, margin + 40, headerTop + 95);
      
      // Student details - Values (right column)
      doc.text(student.branch.name.toUpperCase(), pageWidth / 2 + 40, headerTop + 65);
      doc.text(`${student.semesterId}`, pageWidth / 2 + 40, headerTop + 75);
      doc.text(getSemesterPeriod(), pageWidth / 2 + 40, headerTop + 85);
      const graduationYear = calculateGraduationYear();
      doc.text(`${graduationYear - 4} - ${graduationYear}`, pageWidth / 2 + 40, headerTop + 95);
      
      // Marks section - Table header
      const tableTop = headerTop + 115;
      doc.setFillColor(230, 230, 230);
      doc.rect(margin, tableTop, pageWidth - 2 * margin, 10, 'F');
      
      // Adjusted column widths to fit everything properly
      const col1 = margin + 7;      // S.No.
      const col2 = margin + 24;     // Subject Code
      const col3 = margin + 53;     // Subject Name
      const col4 = margin + 85;    // Sessional
      const col5 = margin + 105;    // End Term
      const col6 = margin + 130;    // Total
      const col7 = margin + 158;    // Grade (adjusted position)
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text("S.No.", col1, tableTop + 6);
      doc.text("Subject Code", col2, tableTop + 6);
      doc.text("Subject Name", col3, tableTop + 6);
      doc.text("Sessional", col4, tableTop + 6);
      doc.text("End Term", col5, tableTop + 6);
      doc.text("Total", col6, tableTop + 6);
      doc.text("Grade", col7, tableTop + 6);
      
      // Draw vertical lines for table columns
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(col2 - 5, tableTop, col2 - 5, tableTop + 10 + (8 * 8)); // After S.No.
      doc.line(col3 - 5, tableTop, col3 - 5, tableTop + 10 + (8 * 8)); // After Subject Code
      doc.line(col4 - 5, tableTop, col4 - 5, tableTop + 10 + (8 * 8)); // After Subject Name
      doc.line(col5 - 5, tableTop, col5 - 5, tableTop + 10 + (8 * 8)); // After Sessional
      doc.line(col6 - 5, tableTop, col6 - 5, tableTop + 10 + (8 * 8)); // After End Term
      doc.line(col7 - 5, tableTop, col7 - 5, tableTop + 10 + (8 * 8)); // After Total
      
      // Marks section - Data rows
      doc.setFont('helvetica', 'normal');
      
      // Calculate totals for summary
      let totalMarks = 0;
      let totalMaxMarks = 0;
      
      student.results.forEach((result: any, index: number) => {
        if (index >= 8) return; // Only display up to 8 subjects
        
        const yPos = tableTop + 15 + (index * 8);
        
        // Add alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, 'F');
        }
        
        // Draw horizontal line for row
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, yPos + 4, pageWidth - margin, yPos + 4);
        
        // Serial number
        doc.text(`${index + 1}`, col1, yPos);
        
        // Subject code (assuming subject has an id or code)
        doc.text(`${result.subject.id || 'SUB' + (index + 101)}`, col2, yPos);
        
        // Subject name - ensure it doesn't overflow
        const subjectName = result.subject.name;
        if (subjectName.length > 30) {
          doc.text(subjectName.substring(0, 27) + '...', col3, yPos);
        } else {
          doc.text(subjectName, col3, yPos);
        }
        
        // Calculate sessional and end term marks
        const sessionalMarks = Number(result.sessionalExam) || 0;
        const endTermMarks = Number(result.endTerm) || 0;
        const sessionalMax = 50;
        const endTermMax = result.overallMark || 100;
        
        // Sessional marks
        doc.text(`${sessionalMarks}/${sessionalMax}`, col4, yPos);
        
        // End term marks
        doc.text(`${endTermMarks}/${endTermMax}`, col5, yPos);
        
        // Total marks
        const totalSubjectMarks = sessionalMarks + endTermMarks;
        const totalSubjectMaxMarks = sessionalMax + endTermMax;
        doc.text(`${totalSubjectMarks}/${totalSubjectMaxMarks}`, col6, yPos);
        
        // Calculate grade based on percentage
        const percentage = (totalSubjectMarks / totalSubjectMaxMarks) * 100;
        
        let grade = 'F';
        if (percentage >= 90) grade = 'A';
        else if (percentage >= 80) grade = 'B';
        else if (percentage >= 70) grade = 'C+';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';
        
        // Add grade - this column is now properly aligned
        doc.text(grade, col7, yPos);
        
        // Update totals
        totalMarks += totalSubjectMarks;
        totalMaxMarks += totalSubjectMaxMarks;
      });
      
      // Summary section
      const summaryTop = tableTop + 15 + (8 * 8) + 10;
      
      doc.setFillColor(230, 230, 230);
      doc.rect(margin, summaryTop, pageWidth - 2 * margin, 30, 'F');
      
      // Overall percentage and result
      const percentage = (totalMarks / totalMaxMarks) * 100;
      const result = percentage >= 33 ? 'PASS' : 'FAIL';
      let division = '';
      
      if (percentage >= 60) division = 'FIRST DIVISION';
      else if (percentage >= 45) division = 'SECOND DIVISION';
      else if (percentage >= 33) division = 'THIRD DIVISION';
      
      doc.setFont('helvetica', 'bold');
      doc.text("Total Marks:", margin + 5, summaryTop + 10);
      doc.text("Percentage:", margin + 5, summaryTop + 20);
      doc.text("Result:", pageWidth / 2, summaryTop + 10);
      doc.text("Division:", pageWidth / 2, summaryTop + 20);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${totalMarks}/${totalMaxMarks}`, margin + 40, summaryTop + 10);
      doc.text(`${percentage.toFixed(2)}%`, margin + 40, summaryTop + 20);
      doc.text(result, pageWidth / 2 + 40, summaryTop + 10);
      doc.text(division, pageWidth / 2 + 40, summaryTop + 20);
      
      // Signature section
      const signatureTop = summaryTop + 40;
      
      doc.text("______________________", margin + 20, signatureTop +5 );
      doc.text("Principal", margin + 30, signatureTop + 10);
      
      doc.text("______________________", pageWidth - margin - 50, signatureTop +5 );
      doc.text("Examination Controller", pageWidth - margin - 60, signatureTop + 10);
     
      doc.setDrawColor(0, 51, 153);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - margin - 15, pageWidth - margin, pageHeight - margin - 15);
      
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text("INDO SWISS TRAINING CENTRE, SECTOR 30-C, CHANDIGARH - 160030", pageWidth / 2, pageHeight - margin - 10, { align: 'center' });
  


  return doc;
}