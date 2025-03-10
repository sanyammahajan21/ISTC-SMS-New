import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Result, Exam, Student, Prisma, Subject, Branch } from "@prisma/client";
import Image from "next/image";
import StudentResultDownload from "@/components/StudentResultDownload";

import { auth } from "@clerk/nextjs/server";

type ResultList = Result & { student: Student; exam: Exam, subject: Subject, branch: Branch };

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Student Name",
      accessor: "student.name",
      className: "hidden md:table-cell",
    },
    {
      header: "Exam",
      accessor: "exam.id",
      className: "hidden md:table-cell",
    },
    {
      header: "Marks",
      accessor: "overallMark",
      className: "hidden md:table-cell",
    },
    {
      header: "Subject",
      accessor: "subject.name",
      className: "hidden md:table-cell",
    },
    ...(role === "registrar" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* <td className="flex items-center gap-4 p-4">{item.id}</td> */}
      <td className="hidden md:table-cell">{item.student.name}</td>
      <td className="hidden md:table-cell">{item.examId}</td>
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

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          // case "search":
          //   query.OR = [
          //     { exam: { id: { contains: value, mode: "insensitive" } } },
          //     { student: { name: { contains: value, mode: "insensitive" } } },
          //   ];
          //   break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS

  switch (role) {
    case "admin":
      break;
    case "teacher":
      // query.OR = [
      //   { exam: { subjects: { teacherId: currentUserId! } } },
      //   { assignment: { lectures: { teacherId: currentUserId! } } },
      // ];
      break;
    case "registrar":
      break;
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true } },
        exam: { select: { id: true } },
        subject: { select: { name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data = dataRes.map((item) => ({
    ...item,
    student: item.student,
    exam: item.exam,
    subject: item.subject,
  }));
  const studentId = searchParams.studentId;

  
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
      <StudentResultDownload role={role} />
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "registrar" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultListPage;
function notFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <h1 className="text-2xl font-semibold">Student not found</h1>
    </div>
  );
}
