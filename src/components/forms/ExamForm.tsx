"use client";

import { useEffect, useState } from "react";
import {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
  getAllSemesters,
  getAllBranches,
  fetchSubjects,
} from "@/lib/actions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
interface Exam {
  id?: number;
  subjectId: number;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  semesterId: number;
  branchId: number;
}

interface Semester {
  id: number;
  level: number;
}

interface Branch {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  subjectCode: string;
  semesterId: number;
  branchId: number;
}

interface ExamPageProps {
  role?: string; 
}

export default function ExamPage({ role }: ExamPageProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | "">("");
  const [selectedBranch, setSelectedBranch] = useState<number | "">("");
  const [form, setForm] = useState<Partial<Exam>>({
    subjectId: 0,
    examDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    semesterId: 0,
    branchId: 0,
  });
  useEffect(() => {
    async function fetchData() {
      const examsResponse = await getAllExams();
      const semestersResponse = await getAllSemesters();
      const branchesResponse = await getAllBranches();

      if (examsResponse?.success) setExams(examsResponse?.data ?? []);
      if (semestersResponse?.success)
        setSemesters(semestersResponse?.data ?? []);
      if (branchesResponse?.success) setBranches(branchesResponse?.data ?? []);
    }
    fetchData();
  }, []);
  useEffect(() => {
    if (selectedSemester && selectedBranch) {
      fetchSubjects(selectedSemester, selectedBranch).then((response) => {
        if (response?.success) {
          setSubjects(response?.data ?? []);
          console.log("Fetched Subjects:", response.data); 
        }
      });
    }
  }, [selectedSemester, selectedBranch]);

  useEffect(() => {
    if (form.semesterId && form.branchId) {
      fetchSubjects(form.semesterId, form.branchId).then((response) => {
        if (response?.success) {
          setSubjects(response?.data ?? []);
          console.log("Fetched Subjects for Create Exam:", response.data); 
        }
      });
    }
  }, [form.semesterId, form.branchId]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["subjectId", "semesterId", "branchId"].includes(name)
        ? Number(value) || 0
        : value,
    }));
    console.log("Form Updated:", { [name]: value }); 
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (!value) return; // Prevent empty values

    setForm((prev) => {
      let updatedDate;

      if (type === "date") {
        // Update only the date part
        const existingTime =
          prev[name] instanceof Date
            ? prev[name].toTimeString().split(" ")[0]
            : "00:00:00";
        updatedDate = new Date(`${value}T${existingTime}`);
      } else if (type === "time") {
        // Update only the time part
        const existingDate =
          prev[name] instanceof Date
            ? prev[name].toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];
        updatedDate = new Date(`${existingDate}T${value}`);
      }

      if (isNaN(updatedDate.getTime())) return prev; // Prevent invalid dates

      return { ...prev, [name]: updatedDate };
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.subjectId ||
      !form.examDate ||
      !form.startTime ||
      !form.endTime ||
      !form.semesterId ||
      !form.branchId
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const payload: Exam = {
      subjectId: form.subjectId!,
      examDate: new Date(
        Date.UTC(
          form.examDate.getFullYear(),
          form.examDate.getMonth(),
          form.examDate.getDate()
        )
      ),
      startTime: new Date(
        Date.UTC(
          form.startTime.getFullYear(),
          form.startTime.getMonth(),
          form.startTime.getDate(),
          form.startTime.getHours(),
          form.startTime.getMinutes()
        )
      ),
      endTime: new Date(
        Date.UTC(
          form.endTime.getFullYear(),
          form.endTime.getMonth(),
          form.endTime.getDate(),
          form.endTime.getHours(),
          form.endTime.getMinutes()
        )
      ),
      semesterId: form.semesterId!,
      branchId: form.branchId!,
    };

    if (form.id) {
      await updateExam(form.id, payload);
    } else {
      await createExam(payload);
    }

    const response = await getAllExams();
    if (response?.success) setExams(response?.data ?? []);

    setForm({
      subjectId: 0,
      examDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      semesterId: 0,
      branchId: 0,
    });
  };
  const handleUpdateExam = (exam: Exam) => {
    setForm({
      id: exam.id,
      subjectId: exam.subjectId,
      examDate: new Date(exam.examDate),
      startTime: new Date(exam.startTime),
      endTime: new Date(exam.endTime),
      semesterId: exam.semesterId,
      branchId: exam.branchId,
    });
  };
  const handleDeleteExam = async (examId: number) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      await deleteExam(examId);
      const response = await getAllExams();
      if (response?.success) setExams(response?.data ?? []);
    }
  };
  const downloadSchedulePDF = async (exams: Exam[], branchName: string, semesterLevel: number) => {
    const doc = new jsPDF();
  
    const headerImage = "/docLogo.png";
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
  
    doc.setFontSize(18);
    doc.text(`Exam Datesheet - ${branchName} - Semester ${semesterLevel}`, 50, y + pdfImageHeight + 10);
  
    const tableData = exams.map((exam) => {
      const subject = subjects.find((sub) => sub.id === exam.subjectId);
      return [
        subject?.subjectCode || "N/A",
        subject?.name || "N/A",
        new Date(exam.examDate).toLocaleDateString(),
        new Date(exam.startTime).toISOString().substring(11, 16),
        new Date(exam.endTime).toISOString().substring(11, 16),
      ];
    });
  
    autoTable(doc, {
      head: [["Subject Code", "Subject Name", "Exam Date", "Start Time", "End Time"]],
      body: tableData,
      startY: y + pdfImageHeight + 20,
    });
  
    doc.save(`Exam_Schedule_${branchName}_Semester_${semesterLevel}.pdf`);
  };

  return (
    <div className="w-full mx-auto p-4">
      {(role === "registrar") && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 p-4 rounded-md shadow-md mb-6"
        >
          <h1 className="text-2xl font-bold mb-4">Manage Exams</h1>
          <div className="gap-4">
            <select
              name="semesterId"
              value={form.semesterId}
              onChange={handleChange}
              className="p-2 border rounded-md"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option
                  key={sem.id}
                  value={sem.id}
                >{`Semester ${sem.level}`}</option>
              ))}
            </select>
            <select
              name="branchId"
              value={form.branchId}
              onChange={handleChange}
              className="p-2 border rounded-md"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <select
              name="subjectId"
              value={form.subjectId || 0}
              onChange={handleChange}
              className="p-2 border rounded-md"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.subjectCode})
                </option>
              ))}
            </select>
            <input
              type="date"
              name="examDate"
              placeholder="Exam Date"
              value={
                form.examDate instanceof Date && !isNaN(form.examDate)
                  ? form.examDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={handleDateChange}
              className="p-2 border rounded-md"
              required
            />
            <input
              type="time"
              name="startTime"
              placeholder="Start Time"
              value={
                form.startTime instanceof Date && !isNaN(form.startTime)
                  ? form.startTime.toTimeString().substring(0, 5)
                  : ""
              }
              onChange={handleDateChange}
              className="p-2 border rounded-md"
              required
            />
            <input
              type="time"
              name="endTime"
              placeholder="End Time"
              value={
                form.endTime instanceof Date && !isNaN(form.endTime)
                  ? form.endTime.toTimeString().substring(0, 5)
                  : ""
              }
              onChange={handleDateChange}
              className="p-2 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md w-full mt-4"
          >
            {form.id ? "Update Exam" : "Add Exam"}
          </button>
        </form>
      )}
      <h1 className="text-2xl font-bold mb-4">Exam Datesheet</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(Number(e.target.value) || "")}
          className="p-2 border rounded-md"
        >
          <option value="">Select Semester</option>
          {semesters.map((sem) => (
            <option
              key={sem.id}
              value={sem.id}
            >{`Semester ${sem.level}`}</option>
          ))}
        </select>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(Number(e.target.value) || "")}
          className="p-2 border rounded-md"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSemester && selectedBranch && (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {branches.find((b) => b.id === selectedBranch)?.name} - Semester{" "}
            {semesters.find((s) => s.id === selectedSemester)?.level}
          </h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Subject Code</th>
                <th className="p-2 border">Subject Name</th>
                <th className="p-2 border">Exam Date</th>
                <th className="p-2 border">Start Time</th>
                <th className="p-2 border">End Time</th>
                {(role === "registrar" || role === "admin") && (
                  <th className="p-2 border">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {exams
                .filter(
                  (exam) =>
                    exam.branchId === selectedBranch &&
                    exam.semesterId === selectedSemester
                )
                .map((exam) => {
                  const subject = subjects.find(
                    (sub) => sub.id === exam.subjectId
                  );
                  return (
                    <tr key={exam.id} className="border">
                      <td className="p-2 border">
                        {subject?.subjectCode || "N/A"}
                      </td>
                      <td className="p-2 border">{subject?.name || "N/A"}</td>
                      <td className="p-2 border">
                      {new Date(exam.examDate).toISOString().split("T")[0]}
                      </td>
                      <td className="p-2 border">
                      {new Date(exam.startTime).toISOString().substring(11, 16)}
                      </td>
                      <td className="p-2 border">
                      {new Date(exam.endTime).toISOString().substring(11, 16)}
                      </td>
                      {(role === "registrar" || role === "admin") && (
                        <td className="p-2 border flex gap-2">
                          <button
                            onClick={() => handleUpdateExam(exam)}
                            className="bg-yellow-500 text-white p-1 rounded-md"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id!)}
                            className="bg-red-500 text-white p-1 rounded-md"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div className="mt-4">
            <button
              onClick={() =>
                downloadSchedulePDF(
                  exams.filter(
                    (exam) =>
                      exam.branchId === selectedBranch &&
                      exam.semesterId === selectedSemester
                  ),
                  branches.find((b) => b.id === selectedBranch)?.name || "N/A",
                  semesters.find((s) => s.id === selectedSemester)?.level || 0
                )
              }
              className="bg-green-500 text-white p-2 rounded-md"
            >
              Download Schedule as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
