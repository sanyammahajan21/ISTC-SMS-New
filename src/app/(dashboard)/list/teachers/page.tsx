import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";

type TeacherList = Teacher & { subjects: Subject[] } & { branches: Branch[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Branches",
      accessor: "branches",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin" || role === "registrar"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        {item.subjects.map((subject) => subject.name).join(",")}
      </td>
      <td className="hidden md:table-cell">
        {item.branches.map((branchItem) => branchItem.name).join(",")}
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full  border-4 border-blue-400 bg-white ">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {(role === "admin" || role === "registrar") && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <FormContainer table="teacher" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "branchId":
            query.lectures = {
              some: {
                branchId: parseInt(value),
              },
            };
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        branches: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 m-4 mt-0 border border-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="bg-blue-600 w-2 h-6 rounded mr-2 hidden md:block"></span>
            All Teachers
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden md:block">
            View and manage faculty information
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-auto mb-3 md:mb-0">
            <TableSearch />
          </div>
          
          <div className="flex items-center gap-3 self-end">
            <button className="flex items-center justify-center p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
              <Image src="/filter.png" alt="Filter" width={16} height={16} />
              <span className="ml-2 text-sm font-medium text-blue-700 hidden md:inline">Filter</span>
            </button>
            
            <button className="flex items-center justify-center p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
              <Image src="/sort.png" alt="Sort" width={16} height={16} />
              <span className="ml-2 text-sm font-medium text-blue-700 hidden md:inline">Sort</span>
            </button>
            
            {(role === "admin" || role === "registrar") && (
              <FormContainer table="teacher" type="create" />
            )}
          </div>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
      
      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
       
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default TeacherListPage;
