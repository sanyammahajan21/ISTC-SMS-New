'use client';

import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Student, Branch, Result, Subject } from '@prisma/client';

interface MarksSheetCertificateProps {
  student: Student & {
    branch: Branch & { _count: { lectures: number } };
    results: (Result & { subject: Subject })[];
  };
}

const MarksSheetCertificate = ({ student }: MarksSheetCertificateProps) => {
  
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
      return `JULY ${currentYear-1} to JANUARY ${currentYear}`;
    }
  };
  
  const handleDownload = async () => {
    try {
      // Filter results for current semester
      const currentSemesterResults = student.results.filter(result => 
        result.subject.semesterId === student.semesterId
      );

      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font
      doc.setFont('helvetica');
      
      const scale = 0.24;
      
      // Top header section
      // Date (top right)
      doc.setFontSize(10);
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'long' })}, ${currentDate.getFullYear()}`;
      
      // Program information
      doc.setFontSize(12);
      // Roll number or username (top left)
      doc.text(student.username, 213 * scale, (1234 - 1150) * scale);
      
      // Diploma program name (centered)
      doc.text(`DIPLOMA IN ${student.branch.name.toUpperCase()}`, 176 * scale, (1234 - 969) * scale);
      
      // Semester period based on odd/even semester
      const semesterPeriod = getSemesterPeriod();
      doc.text(semesterPeriod, 310 * scale, (1234 - 882) * scale);
      doc.text(` ${student.semesterId}`, 570 * scale, (1234 - 906) * scale);
      
      // Student information
      doc.setFontSize(11);
      // Student name
      doc.text(student.name.toUpperCase(), 357 * scale, (1234 - 830) * scale);
      
      // Father's name
      doc.text(student.fatherName.toUpperCase(), 357 * scale, (1234 - 791) * scale);
      
      // Mother's name (if available)
      doc.text(student.motherName?.toUpperCase() || 'MOTHER NAME', 359 * scale, (1234 - 755) * scale);
      
      // Roll number again
      doc.text(student.username, 359 * scale, (1234 - 715) * scale);
      
      // Subjects with marks - using exact positions from document
      doc.setFontSize(10);
      
      // Calculate totals for summary
      let totalMarks = 0;
      let totalMaxMarks = 0;
      
      // The starting positions for subjects based on original document
      const subjectStartY = 1234 - 610; // From bottom of page
      const yIncrement = 26; // Space between subjects
      
      // Limit to 8 subjects or fewer if there are less
      const displaySubjects = currentSemesterResults.slice(0, 8);
      
      displaySubjects.forEach((result, index) => {
        // Serial number
        doc.text(`${index + 1}`, 78 * scale, (subjectStartY + index * yIncrement) * scale);
        
        // Subject name
        doc.text(result.subject.name, 120 * scale, (subjectStartY + index * yIncrement) * scale);
        
        // Calculate sessional and end term marks
        const sessionalMarks = Number(result.sessionalExam) || 0;
        const endTermMarks = Number(result.endTerm) || 0;
        const sessionalMax = 50;
        const endTermMax = result.subject.maxMarks || 100;
        
        // Sessional marks
        doc.text(`${sessionalMarks}`, 585 * scale, (subjectStartY + index * yIncrement) * scale);
        
        // End term marks
        doc.text(`${endTermMarks}`, 680 * scale, (subjectStartY + index * yIncrement) * scale);
        
        // Calculate grade based on percentage
        const totalSubjectMarks = sessionalMarks + endTermMarks;
        const totalSubjectMaxMarks = endTermMax;
        
        // Add grade
        doc.text(result.grade, 773 * scale, (subjectStartY + index * yIncrement) * scale);
        
        // Update totals
        totalMarks += totalSubjectMarks;
        totalMaxMarks += totalSubjectMaxMarks;
      });
      
      // Add total marks at specific position based on original layout
      doc.setFontSize(12);
      doc.text(`${totalMarks}/${totalMaxMarks}`, 284 * scale, (1234 - 270) * scale);
      
      // Pass/Fail status based on original layout
      const percentage = (totalMarks / totalMaxMarks) * 100;
      doc.text(percentage >= 33 ? 'PASS' : 'FAIL', 284 * scale, (1234 - 220) * scale);
      
      // Add current date at the bottom
      doc.text(formattedDate, 187 * scale, (1234 - 65) * scale);
      
      // Save the PDF
      doc.save(`${student.name}_marks_sheet.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky transition-colors"
    >
      Download Marks Sheet
    </button>
  );
};

export default MarksSheetCertificate;