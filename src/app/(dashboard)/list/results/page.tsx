import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Result,  Student, Subject, Branch, Prisma } from "@prisma/client";
import StudentResultDownload from "@/components/StudentResultDownload";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ResultFilters } from "@/components/Filter";

type ResultList = Result & { student: Student; subject: Subject; branch: Branch };

const ResultListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const teacherId = (sessionClaims?.metadata as { teacherId?: string })?.teacherId;

  const columns = [
    { header: "Student Name", accessor: "student.name", className: "hidden md:table-cell" },
    { header: "Marks", accessor: "overallMark", className: "hidden md:table-cell" },
    { header: "Subject", accessor: "subject.name", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item: ResultList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="hidden md:table-cell">{item.student.name}</td>
      <td className="hidden md:table-cell">{item.overallMark}</td>
      <td className="hidden md:table-cell">{item.subject.name}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "registrar" || role === "teacher") && (
            <>
              <FormContainer table="result" type="update" data={item} />
              <FormContainer table="result" type="delete" id={item.id} />
              
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, branchId, semester, subjectId, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.ResultWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        if (key === "studentName") query.student = { name: { contains: value, mode: "insensitive" } };

      }
    }
  }
  if (branchId) query.student = { ...query.student, branchId: parseInt(branchId) };
  if (semester) query.student = { ...query.student, semester: { level: parseInt(semester) } };
  if (subjectId) query.subjectId = parseInt(subjectId);

  if (role === "teacher" && teacherId) {
    const teacherSubjects = await prisma.subject.findMany({
      where: { teachers: { some: { id: teacherId } } },
      select: { id: true },
    }).catch(() => []);

    query.subjectId = { in: teacherSubjects.map((subject) => subject.id) };
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, branch: true, semester: true } },
        subject: { select: { name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data = dataRes.map((item) => ({ ...item }));

  const branches = await prisma.branch.findMany().catch(() => []);
  const semesters = await prisma.semester.findMany().catch(() => []);
  const subjects = role === "teacher" && teacherId
    ? await prisma.subject.findMany({ where: { teachers: { some: { id: teacherId } } } }).catch(() => [])
    : await prisma.subject.findMany().catch(() => []);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <StudentResultDownload role={role} />
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
      </div>
      <TableSearch />
      <ResultFilters
        branches={branches}
        semesters={semesters}
        subjects={subjects}
        branchId={branchId}
        semester={semester}
        subjectId={subjectId}
      />
      <Table columns={columns} data={data} renderRow={renderRow} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultListPage;
