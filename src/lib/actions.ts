"use server";

import { revalidatePath } from "next/cache";
import {
  BranchSchema,
  ExamSchema,
  RegistrarSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  AnnouncementSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean };
export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        type: data.type,
        subjectCode:  data.subjectCode,
        maxMarks:  data.maxMarks,
        branchId: data.branchId,
        semesterId: data.semesterId,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        type: data.type,
        subjectCode:  data.subjectCode,
        maxMarks:  data.maxMarks,
        branchId: data.branchId,
        semesterId: data.semesterId,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export const createBranch = async (
  currentState: CurrentState,
  data: BranchSchema
) => {
  try {
    await prisma.branch.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateBranch = async (
  currentState: CurrentState,
  data: BranchSchema
) => {
  try {
    await prisma.branch.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteBranch = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.branch.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      name: data.name,
      publicMetadata:{role:"teacher"}
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        password: data.password,
        email: data.email || null,
        phone: data.phone || null,
        division: data.division,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
        branches: {
          connect: data.branches?.map((branchId: string) => ({
            id: parseInt(branchId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      name: data.name,

    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        password: data.password,
        email: data.email || null,
        phone: data.phone || null,
        division: data.division,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
        branches: {
          connect: data.branches?.map((branchId: string) => ({
            id: parseInt(branchId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createRegistrar = async (
  currentState: CurrentState,
  data: RegistrarSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password || "",
      name: data.name,
      publicMetadata:{role:"registrar"}
    });

    await prisma.registrar.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        email: data.email || null,
        phone: data.phone || "",
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateRegistrar = async (
  currentState: CurrentState,
  data: RegistrarSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      name: data.name,
    });

    await prisma.registrar.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteRegistrar = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.registrar.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const branchItem = await prisma.branch.findUnique({
      where: { id: data.branchId },
      include: { _count: { select: { students: true } } },
    });

    if (branchItem && branchItem.capacity === branchItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      name: data.name,
      fatherName: data.fatherName,
      motherName: data.motherName,


      publicMetadata:{role:"student"}
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        password: data.password||"",
        name: data.name,
        fatherName: data.fatherName,
        motherName: data.motherName,
        address: data.address,
        birthday:new Date(data.birthday),
        phone: data.phone || "",
        email: data.email,
        sex: data.sex,
        bloodType: data.bloodType,
        semesterId: data.semesterId,
        branchId: data.branchId,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      name: data.name,
      fatherName: data.fatherName,
      motherName: data.motherName,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        password: data.password,
        name: data.name,
        fatherName: data.fatherName,
        motherName: data.motherName,
        address:  data.address,
        birthday: data.birthday,
        phone: data.phone,   
        email: data.email,
        sex: data.sex,
        bloodType: data.bloodType,
        semesterId: data.semesterId,
        branchId: data.branchId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const getAllExams = async () => {
  try {
    const exams = await prisma.exam.findMany();
    return { success: true, data: exams }; // ✅ Wrap the response
  } catch (err) {
    console.log(err);
    return { success: false, data: [] }; // ✅ Handle errors properly
  }
};


export const getAllSemesters = async () => {
  try {
    const semesters = await prisma.semester.findMany();
    return { success: true, data: semesters };
  } catch (err) {
    console.log(err);
    return { success: false, data: [] };
  }
};

export const getAllBranches = async () => {
  try {
    const branches = await prisma.branch.findMany();
    return { success: true, data: branches };
  } catch (err) {
    console.log(err);
    return { success: false, data: [] };
  }
};

export const getExams = async () => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        subject: true,
        semester: true,
        branch: true,
      },
    });
    return { success: true, data: exams };
  } catch (error) {
    return { success: false, error: "Failed to fetch exams" };
  }
};

export async function createExam(data: {
  subjectId: number;
  examDate: Date;
  startTime: Date;
  endTime: Date;
  semesterId: number;
  branchId: number;
}) {
  try {
    const exam = await prisma.exam.create({ data });
    return { success: true, data: exam };
  } catch (error) {
    console.error("Error creating exam:", error);
    return { success: false, error: "Failed to create exam" };
  }
}

export const updateExam = async (
  id: number,
  data: Partial<{
    subjectId: number;
    examDate: Date;
    startTime: Date;
    endTime: Date;
    semesterId: number;
    branchId: number;
  }>
) => {
  try {
    const updatedExam = await prisma.exam.update({
      where: { id },
      data,
    });
    return { success: true, data: updatedExam };
  } catch (error) {
    return { success: false, error: "Failed to update exam" };
  }
};

export const deleteExam = async (id: number) => {
  try {
    await prisma.exam.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete exam" };
  }
};
export const fetchSubjects = async (semesterId: number, branchId: number) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: {
        semesterId: semesterId,
        branchId: branchId,
      },
      include: {
        teachers: true,
        branch: true,
        semester: true,
      },
    });

    return { success: true, data: subjects, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, data: [], error: true };
  }
};


export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        branchId: data.branchId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
 
  try {

    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        branchId: data.branchId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lecture: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
