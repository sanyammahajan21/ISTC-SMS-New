import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Branch, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";

type StudentList = Student & { branch: Branch };

const StudentListPage = async ({
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
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Semester",
      accessor: "semester",
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
    ...((role === "admin" || role === "registrar")
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: StudentList) => (
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
          <p className="text-xs text-gray-500">{item.branch.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.branch.name[0]}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
             <button className="w-7 h-7 flex items-center justify-center rounded-full  border-4 border-blue-400 bg-white ">
                          <Image src="/view.png" alt="" width={16} height={16} />
                        </button>
          </Link>
          {(role === "admin" || role === "registrar") && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <FormContainer table="student" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.StudentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            // Admin or Registrar will see all students, but teachers will be filtered
            if (role === "teacher") {
              query.branch = {
                lectures: {
                  some: {
                    teacherId: value,
                  },
                },
              };
            }
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
  
  // Perform the transaction
  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        branch: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
  ]);
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 m-4 mt-0 border border-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="bg-blue-500 w-2 h-6 rounded mr-2 hidden md:block"></span>
            All Students
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden md:block">
            View and manage student information
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-auto mb-3 md:mb-0">
            <TableSearch />
          </div>
          
          <div className="flex items-center gap-3 self-end">
            {/* <button className="flex items-center justify-center p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
              <Image src="/filter.png" alt="Filter" width={16} height={16} />
              <span className="ml-2 text-sm font-medium text-blue-700 hidden md:inline">Filter</span>
            </button>
            
            <button className="flex items-center justify-center p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
              <Image src="/sort.png" alt="Sort" width={16} height={16} />
              <span className="ml-2 text-sm font-medium text-blue-700 hidden md:inline">Sort</span>
            </button> */}
            
            {(role === "admin" || role === "registrar") && (
              <FormContainer table="student" type="create" />
            )}
          </div>
        </div>
      </div>
      
      {/* Table Section with Card Styling */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
      
      {/* Pagination with Better Styling */}
      <div className="mt-6 flex justify-center md:justify-end">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default StudentListPage;