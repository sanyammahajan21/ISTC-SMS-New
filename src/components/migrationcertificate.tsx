'use client';

import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Student, Branch } from '@prisma/client';

interface MigrationCertificateProps {
  student: Student & {
    branch: Branch;
  };
}

const MigrationCertificate = ({ student }: MigrationCertificateProps) => {
  
  const handleDownload = async () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font
      doc.setFont('helvetica');
      
      // Add certificate content
      const currentDate = new Date();
      const formattedDate = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
      
      // Format certificate number - using student's username instead of id substring
      // Assuming username is the roll number format like "2019-079"
      const certificateNumber = student.username;
      
      // Extract from date from student's createdAt
      const createdAtDate = new Date(student.createdAt);
      const fromMonthYear = `${createdAtDate.toLocaleString('default', { month: 'short' })} ${createdAtDate.getFullYear()}`;
      
      // Current date for "to" date
      const toMonthYear = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;
      
      // Add certificate number and date (positioned as in the template)
      doc.setFontSize(14);
      doc.text(`No.Prin./Char/${certificateNumber}/ISTC `, 32, 79);
      doc.text(`Dated: ${formattedDate}`, 140, 79);
      
      // Add certificate title
      doc.setFontSize(16);
      doc.text('MIGRATION CERTIFICATE', 105, 97, { align: 'center' });
      
      // Add underline
      doc.setLineWidth(0.5);
      doc.line(70, 98, 140, 98);
      
      // Add certificate text
      doc.setFontSize(14);
      
      // Split the text to handle wrapping
      const text = `This is to certify that ${student.name.toUpperCase()}, Roll No. ${student.username}, S/o/D/o Sh. ${student.fatherName.toUpperCase()} was a bonafide student of this institute from ${fromMonthYear} to ${toMonthYear}.`;
      
      const splitText = doc.splitTextToSize(text, 140);
      doc.text(splitText, 30, 110);
      
      // Add the "No Objection" text with proper spacing as in the template
      const objectionText = "The institute has No Objection for his/her further studies from any recognized Board/Institute or University.";
      const splitObjText = doc.splitTextToSize(objectionText, 150);
      doc.text(splitObjText, 29, 141);
      
      // Add principal signature with indentation as in the template
      doc.text('(Principal)', 157, 163);
      
      // Save the PDF
      doc.save(`${student.name}_migration_certificate.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
    >
      Download Migration Certificate
    </button>
  );
};

export default MigrationCertificate;