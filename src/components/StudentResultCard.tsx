import React from "react";
import prisma from "@/lib/prisma";

interface Student {
  id: string;
  name: string;
}

interface Result {
  subject: string;
  sessionalExam: string;
  endTerm: string;
  overallMark: string;
  grade: string;
}

interface StudentResultCardProps {
  student: Student;
  results: Result[];
}

const StudentResultCard: React.FC<StudentResultCardProps> = ({ student, results }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl border border-gray-200">
      {/* Student Info */}
      <h2 className="text-xl font-semibold text-gray-800">{student.name}</h2>
      <p className="text-sm text-gray-500 mb-4">Student ID: {student.id}</p>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="p-2 border">Subject</th>
              <th className="p-2 border">Sessional Exam</th>
              <th className="p-2 border">End Term Exam</th>
              <th className="p-2 border">Overall Marks</th>
              <th className="p-2 border">Grade</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className="text-sm text-gray-800 border-t">
                <td className="p-2 border">{result.subject}</td>
                <td className={`p-2 border ${result.sessionalExam === "-" ? "text-gray-400" : "text-gray-800"}`}>
                  {result.sessionalExam}
                </td>
                <td className="p-2 border">{result.endTerm}</td>
                <td className="p-2 border">{result.overallMark}</td>
                <td className="p-2 border">{result.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentResultCard;