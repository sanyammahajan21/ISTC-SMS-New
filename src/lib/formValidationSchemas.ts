import { z } from "zod";

export const courseSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Course name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type CourseSchema = z.infer<typeof courseSchema>;

export const branchSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Branch name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  semesterId: z.coerce.number().optional(),
  supervisorId: z.coerce.string().optional(),
});

export type BranchSchema = z.infer<typeof branchSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Name is required!" }),
  courses: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const registrarSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
});

export type RegistrarSchema = z.infer<typeof registrarSchema>;


export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  fatherName: z.string().min(1, { message: "Father Name is required!" }),
  motherName: z.string().min(1, { message: "Mother Name is required!" }),
  phone: z.string().optional(),
  img: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  semesterId: z.coerce.number().min(1, { message: "Semester is required!" }),
  branchId: z.coerce.number().min(1, { message: "branch name is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lectureId: z.coerce.number({ message: "lecture is required!" }),
});

export type ExamSchema = z.infer<typeof announcementSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  branchId: z.coerce.number({ message: "branch is required!" }),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;
