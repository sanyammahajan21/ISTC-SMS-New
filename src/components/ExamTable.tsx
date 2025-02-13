"use client";

import { Exam } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface ExamTableProps {
  exams: Exam[];
  branches: { id: number; name: string }[];
  semesters: { id: number; level: number }[];
  subjects: { id: number; name: string }[];
  onEdit: (exam: Exam) => void;
  onDelete: (examId: number) => void;
}

const ExamTable = ({
  exams,
  branches,
  semesters,
  subjects,
  onEdit,
  onDelete,
}: ExamTableProps) => {
  const router = useRouter();
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const getBranchName = (branchId: number) => {
    return branches.find((branch) => branch.id === branchId)?.name || "N/A";
  };

  const getSemesterLevel = (semesterId: number) => {
    return semesters.find((semester) => semester.id === semesterId)?.level || "N/A";
  };

  const getSubjectName = (subjectId: number) => {
    return subjects.find((subject) => subject.id === subjectId)?.name || "N/A";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Branch
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Semester
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {exams.map((exam) => (
            <tr key={exam.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{exam.title}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {new Date(exam.startTime).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {new Date(exam.endTime).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {getBranchName(exam.branchId)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Semester {getSemesterLevel(exam.semesterId)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {getSubjectName(exam.subjectId)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 flex gap-2">
                <button
                  onClick={() => onEdit(exam)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(exam.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamTable;