"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
  getAllSemesters,
  getAllBranches,
  fetchSubjects,
  getAllTeachers,
} from "@/lib/actions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

interface Exam {
  id?: number;
  subjectId: number;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  semesterId: number;
  branchId: number;
  teacherInvigilatorId?: string | null;
  externalInvigilatorId?: number | null;
  externalInvigilator?: {
    id: number;
    name: string;
  } | null;
}

interface Semester {
  id: number;
  level: number;
  branchId: number;
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

interface Teacher {
  id: string;
  name: string;
}

interface ExternalInvigilator {
  id: number;
  name: string;
}

interface ExamPageProps {
  role?: string;
}

interface ExternalInvigilatorInput {
  id: string;
  name: string;
}

export default function ExamPage({ role }: ExamPageProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
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
  const [duration, setDuration] = useState<string>("50");
  const [availableSemesters, setAvailableSemesters] = useState<Semester[]>([]);
  const [externalInvigilatorName, setExternalInvigilatorName] = useState("");
  const [invigilatorType, setInvigilatorType] = useState<
    "teacher" | "external"
  >("teacher");
  const [externalInvigilators, setExternalInvigilators] = useState<
    ExternalInvigilatorInput[]
  >([]);

  const teacherOptions = teachers.map((teacher) => ({
    value: teacher.id,
    label: teacher.name,
  }));

  const [selectedTeacherOptions, setSelectedTeacherOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const addExternalInvigilator = () => {
    setExternalInvigilators((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "" },
    ]);
  };
  const removeExternalInvigilator = (id: string) => {
    setExternalInvigilators((prev) => prev.filter((item) => item.id !== id));
  };
  const handleExternalInvigilatorChange = (id: string, value: string) => {
    setExternalInvigilators((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: value } : item))
    );
  };

  // When updating an exam, populate the form with existing data
  // const handleUpdateExam = (exam: Exam) => {
  //   setForm({
  //     id: exam.id,
  //     subjectId: exam.subjectId,
  //     examDate: new Date(exam.examDate),
  //     startTime: new Date(exam.startTime),
  //     endTime: new Date(exam.endTime),
  //     semesterId: exam.semesterId,
  //     branchId: exam.branchId,
  //   });

  //   if (exam.teacherInvigilators?.length) {
  //     const selectedTeachers = exam.teacherInvigilators.map(teacher => ({
  //       value: teacher.id,
  //       label: teacher.name
  //     }));
  //     setSelectedTeacherOptions(selectedTeachers);
  //     setInvigilatorType("teacher");
  //   } else if (exam.externalInvigilators?.length) {
  //     setExternalInvigilators(
  //       exam.externalInvigilators.map(invigilator => ({
  //         id: invigilator.id.toString(),
  //         name: invigilator.name
  //       }))
  //     );
  //     setInvigilatorType("external");
  //   }
  // };

  useEffect(() => {
    async function fetchData() {
      const examsResponse = await getAllExams();
      const semestersResponse = await getAllSemesters();
      const branchesResponse = await getAllBranches();
      const teachersResponse = await getAllTeachers();

      if (examsResponse?.success) setExams(examsResponse?.data ?? []);
      if (semestersResponse?.success)
        setSemesters(semestersResponse?.data ?? []);
      if (branchesResponse?.success) setBranches(branchesResponse?.data ?? []);
      if (teachersResponse?.success) setTeachers(teachersResponse?.data ?? []);
    }
    fetchData();
  }, []);
  useEffect(() => {
    if (selectedSemester && selectedBranch) {
      fetchSubjects(selectedSemester, selectedBranch).then((response) => {
        if (response?.success) {
          setSubjects(response?.data ?? []);
        } else {
          console.error("Failed to fetch subjects:", response?.error);
        }
      });
    } else {
      setSubjects([]);
    }
  }, [selectedSemester, selectedBranch]);
  useEffect(() => {
    if (form.branchId) {
      const filteredSemesters = semesters.filter(
        (semester) => semester.branchId === form.branchId
      );
      setAvailableSemesters(filteredSemesters);
    } else {
      setAvailableSemesters([]);
    }
  }, [form.branchId, semesters]);

  useEffect(() => {
    if (form.semesterId && form.branchId) {
      fetchSubjects(form.semesterId, form.branchId).then((response) => {
        if (response?.success) {
          setSubjects(response?.data ?? []);
        } else {
          console.error("Failed to fetch subjects:", response?.error);
        }
      });
    } else {
      setSubjects([]);
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
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (!value) return;

    setForm((prev) => {
      let updatedDate;

      if (type === "date") {
        const existingTime =
          prev[name] instanceof Date
            ? prev[name].toTimeString().split(" ")[0]
            : "00:00:00";
        updatedDate = new Date(`${value}T${existingTime}`);
      } else if (type === "time") {
        const existingDate =
          prev[name] instanceof Date
            ? prev[name].toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];
        updatedDate = new Date(`${existingDate}T${value}`);
      }

      if (isNaN(updatedDate.getTime())) return prev;

      return { ...prev, [name]: updatedDate };
    });
  };

  const calculateEndTime = (startTime: Date, duration: string): Date => {
    const endTime = new Date(startTime);
    if (duration === "50") {
      endTime.setMinutes(endTime.getMinutes() + 50);
    } else if (duration === "90") {
      endTime.setMinutes(endTime.getMinutes() + 90);
    }
    return endTime;
  };

  const checkForOverlappingExams = async (exam: Exam): Promise<boolean> => {
    const response = await getAllExams();
    if (!response?.success) return false;

    const existingExams = response.data;

    return existingExams.some((existingExam) => {
      if (exam.id && existingExam.id === exam.id) return false;
      return (
        existingExam.branchId === exam.branchId &&
        existingExam.semesterId === exam.semesterId &&
        existingExam.examDate.toISOString().split("T")[0] ===
          exam.examDate.toISOString().split("T")[0] &&
        ((existingExam.startTime <= exam.startTime &&
          existingExam.endTime > exam.startTime) ||
          (existingExam.startTime < exam.endTime &&
            existingExam.endTime >= exam.endTime) ||
          (existingExam.startTime >= exam.startTime &&
            existingExam.endTime <= exam.endTime))
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.subjectId ||
      !form.examDate ||
      !form.startTime ||
      !form.semesterId ||
      !form.branchId
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const endTime = calculateEndTime(form.startTime, duration);

    const payload = {
      subjectId: form.subjectId,
      examDate: new Date(form.examDate),
      startTime: new Date(form.startTime),
      endTime: new Date(endTime),
      semesterId: form.semesterId,
      branchId: form.branchId,
      // Always include both types if they have values
      ...(selectedTeacherOptions.length > 0 && {
        teacherInvigilatorIds: selectedTeacherOptions.map(
          (option) => option.value
        ),
      }),
      ...(externalInvigilators.length > 0 && {
        externalInvigilators: externalInvigilators.map((invigilator) => ({
          name: invigilator.name,
        })),
      }),
    };

    try {
      const response = form.id
        ? await updateExam({ ...payload, id: form.id })
        : await createExam(payload);

      if (response.success) {
        toast.success(`Exam ${form.id ? "updated" : "created"} successfully`);
        const examsResponse = await getAllExams();
        if (examsResponse?.success) setExams(examsResponse.data);
        setForm({
          subjectId: 0,
          examDate: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          semesterId: form.semesterId,
          branchId: form.branchId,
        });
        setExternalInvigilators([]);
        setSelectedTeacherOptions([]);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save exam");
    }
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
      teacherInvigilatorId: exam.teacherInvigilatorId || undefined,
      externalInvigilatorId: exam.externalInvigilatorId || undefined,
    });

    if (exam.externalInvigilator) {
      setInvigilatorType("external");
      setExternalInvigilatorName(exam.externalInvigilator.name);
    } else {
      setInvigilatorType("teacher");
    }
  };

  const handleDeleteExam = async (examId: number) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      await deleteExam(examId);
      const response = await getAllExams();
      if (response?.success) setExams(response?.data ?? []);
    }
  };

  const availableSubjects = subjects.filter(
    (subject) => !exams.some((exam) => exam.subjectId === subject.id)
  );

  const downloadCompleteDatesheet = async () => {
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

    let startY = y + pdfImageHeight + 20;

    branches.forEach((branch) => {
      semesters.forEach((semester) => {
        const filteredExams = exams.filter(
          (exam) =>
            exam.branchId === branch.id && exam.semesterId === semester.id
        );

        if (filteredExams.length > 0) {
          doc.setFontSize(18);
          doc.text(
            `Exam Datesheet - ${branch.name} - Semester ${semester.level}`,
            10,
            startY
          );

          const tableData = filteredExams.map((exam) => {
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
            head: [
              [
                "Subject Code",
                "Subject Name",
                "Exam Date",
                "Start Time",
                "End Time",
              ],
            ],
            body: tableData,
            startY: startY + 10,
          });

          startY = doc.previousAutoTable.finalY + 20;
        }
      });
    });

    doc.save("Complete_Datesheet.pdf");
  };

  const downloadSchedulePDF = async (
    exams: Exam[],
    branchName: string,
    semesterLevel: number
  ) => {
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
    const y = 10; // Make sure this is defined
  
    doc.addImage(img, "PNG", x, y, pdfImageWidth, pdfImageHeight);
  
    doc.setFontSize(18);
    doc.text(
      `Exam Datesheet - ${branchName} - Semester ${semesterLevel}`,
      15,
      y + pdfImageHeight + 10
    );
  
    const tableData = exams.map((exam) => {
      const subject = subjects.find((sub) => sub.id === exam.subjectId);
      
      // Format teacher invigilators
      const teacherNames = exam.teacherInvigilators?.map(t => t.name).join(', ') || 'None';
      
      // Format external invigilators
      const externalNames = exam.externalInvigilators?.map(e => `${e.name} (External)`).join(', ') || 'None';
      
      // Combine all invigilators
      const allInvigilators = `${teacherNames}${teacherNames && externalNames ? '\n' : ''}${externalNames}`;
  
      return [
        subject?.subjectCode || "N/A",
        subject?.name || "N/A",
        new Date(exam.examDate).toLocaleDateString(),
        new Date(exam.startTime).toTimeString().substring(0, 5),
        new Date(exam.endTime).toTimeString().substring(0, 5),
        allInvigilators
      ];
    });
  
    autoTable(doc, {
      head: [
        ["Subject Code", "Subject Name", "Exam Date", "Start Time", "End Time", "Invigilators"],
      ],
      body: tableData,
      startY: y + pdfImageHeight + 20,
      styles: {
        cellPadding: 5,
        fontSize: 10,
        valign: 'middle'
      },
      columnStyles: {
        5: { 
          cellWidth: 'auto',
          minCellHeight: 20
        }
      }
    });
  
    doc.save(`Exam_Schedule_${branchName}_Semester_${semesterLevel}.pdf`);
  };

  return (
    <div className="w-full mx-auto p-4">
      {role === "registrar" && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 p-4 rounded-md shadow-md mb-6"
        >
          <h1 className="text-2xl font-bold mb-4">Manage Exams</h1>
          <div className="gap-4">
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

            {/* Semester Selection */}
            <select
              name="semesterId"
              value={form.semesterId}
              onChange={handleChange}
              className="p-2 border rounded-md"
              required
              disabled={!form.branchId}
            >
              <option value="">Select Semester</option>
              {availableSemesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {`Semester ${sem.level}`}
                </option>
              ))}
            </select>

            {/* Subject Selection */}
            <select
              name="subjectId"
              value={form.subjectId || 0}
              onChange={handleChange}
              className="p-2 border rounded-md"
              required
              disabled={!form.semesterId}
            >
              <option value="">Select Subject</option>
              {availableSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.subjectCode})
                </option>
              ))}
            </select>

            {/* Exam Date */}
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

            {/* Start Time */}
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

            {/* Duration */}
            <select
              name="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="p-2 border rounded-md"
              required
            >
              <option value="50">50 Minutes</option>
              <option value="90">1 Hour 30 Minutes</option>
            </select>

            {/* Invigilator Selection */}
            <div className="mb-4">
              <div className="mb-4">
                <label className="block mb-2">Select Teachers</label>
                <Select
                  options={teacherOptions}
                  value={selectedTeacherOptions}
                  onChange={(selectedOptions) => {
                    setSelectedTeacherOptions(
                      selectedOptions as { value: string; label: string }[]
                    );
                  }}
                  placeholder="Select Teachers"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isMulti
                  isClearable
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">External Invigilators</label>
                {externalInvigilators.map((invigilator) => (
                  <div key={invigilator.id} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Invigilator Name"
                      value={invigilator.name}
                      onChange={(e) =>
                        handleExternalInvigilatorChange(
                          invigilator.id,
                          e.target.value
                        )
                      }
                      className="p-2 border rounded-md flex-grow"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeExternalInvigilator(invigilator.id)}
                      className="bg-red-500 text-white p-2 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExternalInvigilator}
                  className="bg-blue-500 text-white p-2 rounded-md mt-2"
                >
                  Add External Invigilator
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-md w-full mt-4"
            >
              {form.id ? "Update Exam" : "Add Exam"}
            </button>
          </div>
        </form>
      )}
      <h1 className="text-2xl font-bold mb-4">Exam Datesheet</h1>
      <div className="flex gap-4 mb-6">
        <select
          value={selectedBranch}
          onChange={(e) => {
            setSelectedBranch(Number(e.target.value) || "");
            setSelectedSemester("");
          }}
          className="p-2 border rounded-md"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(Number(e.target.value) || "")}
          className="p-2 border rounded-md"
          disabled={!selectedBranch} 
        >
          <option value="">Select Semester</option>
          {semesters
            .filter((semester) => semester.branchId === selectedBranch) 
            .map((semester) => (
              <option key={semester.id} value={semester.id}>
                {`Semester ${semester.level}`}
              </option>
            ))}
        </select>
        <button
          onClick={downloadCompleteDatesheet}
          className="bg-green-500 text-white p-2 rounded-md ml-auto"
        >
          Download Complete Datesheet
        </button>
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
                <th className="p-2 border">Invigilator</th>
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
                  const teacherInvigilators = exam.teacherInvigilators || [];
                  const externalInvigilators = exam.externalInvigilators || [];

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
                        {new Date(exam.startTime)
                          .toTimeString()
                          .substring(0, 5)}
                      </td>
                      <td className="p-2 border">
                        {new Date(exam.endTime).toTimeString().substring(0, 5)}
                      </td>
                      <td className="p-2 border">
                        {/* Teacher Invigilators */}
                        {exam.teacherInvigilators?.length > 0 && (
                          <div className="mb-1">
                            {exam.teacherInvigilators.map((teacher) => (
                              <div key={teacher.id} className="font-medium">
                                {teacher.name} 
                              </div>
                            ))}
                          </div>
                        )}

                        {/* External Invigilators */}
                        {exam.externalInvigilators?.length > 0 && (
                          <div className="mb-1">
                            {exam.externalInvigilators.map((invigilator) => (
                              <div key={invigilator.id}>
                                {invigilator.name}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* No invigilators case */}
                        {!exam.teacherInvigilators?.length &&
                          !exam.externalInvigilators?.length && (
                            <div className="text-gray-400">Not assigned</div>
                          )}
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
