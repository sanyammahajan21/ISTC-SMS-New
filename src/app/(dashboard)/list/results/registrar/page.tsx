import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import ResultTable from "@/components/ResultTable";
import StudentResultDownload from "@/components/StudentResultDownload";
import { ResultFilters } from "@/components/Filter";

interface SearchParams {
  page?: string;
  [key: string]: any;
}

const ResultListPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata)?.role;
  const teacherId = (sessionClaims?.metadata)?.teacherId;

  const query = {};
  if (role === "teacher" && teacherId) {
    const teacherSubjects = await prisma.subject.findMany({
      where: { teachers: { some: { id: teacherId } } },
      select: { id: true },
    });
    query.subjectId = { in: teacherSubjects.map((subject) => subject.id) };
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: true,
        subject: true,
        teacher: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * ((searchParams.page ? parseInt(searchParams.page) : 1) - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md m-4">
      <div className="flex justify-between">
        <StudentResultDownload role={role} />
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
      </div>
      <TableSearch />
      <ResultFilters />
      <ResultTable results={dataRes} role={role} />
      <Pagination page={parseInt(searchParams.page || "1")} count={count} />
    </div>
  );
};

export default ResultListPage;