import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "registrar"
    | "course"
    | "branch"
    | "lecture"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "course":
        const courseTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: courseTeachers };
        break;
      case "branch":
        const branchGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const branchTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: branchTeachers, grades: branchGrades };
        break;
      case "teacher":
        const teacherCourses = await prisma.course.findMany({
          select: { id: true, name: true },
        });
        relatedData = { courses: teacherCourses };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentBranches = await prisma.branch.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { branches: studentBranches, grades: studentGrades };
        break;
      case "exam":
        const examLectures = await prisma.lectures.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lectures: examLectures };
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
