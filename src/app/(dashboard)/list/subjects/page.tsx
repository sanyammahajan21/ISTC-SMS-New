import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Subject, Teacher, Semester, Branch } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { SubjectFilters } from "@/components/Filter";

type SubjectList = Subject & { teachers: Teacher[] };

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },
    {
      header: "Teachers",
      accessor: "teachers",
      className: "hidden md:table-cell",
    },
    {
      header: "Curriculum",
      accessor: "Curriculum",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: SubjectList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">
        {item.teachers.map((teacher) => teacher.name).join(",")}
      </td>
      <td className="hidden md:table-cell">
        {item.fileUrl && (
          <a
            href={`/api/files/${item.fileUrl}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Curriculum
          </a>
        )}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "registrar") && (
            <>
              <FormContainer table="subject" type="update" data={item} branchId={item.branchId} />
              <FormContainer table="subject" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, branchId, semester, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // Query logic
  const query: Prisma.SubjectWhereInput = {};

  // Search functionality
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            // Case-insensitive search without `mode`
            query.name = {
              contains: value.toLowerCase(), // Convert search term to lowercase
            };
            break;
          default:
            break;
        }
      }
    }
  }

  // Filter by branch
  if (branchId) {
    query.branchId = parseInt(branchId); // Parse branchId as an integer
  }

  // Filter by semester
  if (semester) {
    query.semesterId = parseInt(semester); // Parse semester as an integer
  }

  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teachers: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.subject.count({ where: query }),
  ]);

  // Fetch branches and semesters for filters
  const branches = await prisma.branch.findMany().catch(() => []);
  const semesters = await prisma.semester
    .findMany({
      where: branchId ? { branchId: parseInt(branchId) } : {}, // Filter semesters by branchId
    })
    .catch(() => []);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <SubjectFilters
              branches={branches}
              semesters={semesters}
              branchId={branchId}
              semester={semester}
            />
            {(role === "admin" || role === "registrar") && (
              <FormContainer table="subject" type="create" branchId={branchId}/>
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

export default SubjectListPage;
