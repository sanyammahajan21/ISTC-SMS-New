import { subjectsData } from "@/lib/data";
import {PrismaClient, SubjectType} from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // ADMIN
  await prisma.admin.create({
    data: {
      id: "admin1",
      username: "admin1",
    },
  });
  await prisma.admin.create({
    data: {
      id: "admin2",
      username: "admin2",
    },
  });

  // GRADE
  for (let i = 1; i <= 6; i++) {
    await prisma.semester.create({
      data: {
        level: i,
      },
    });
  }

  // CLASS
  for (let i = 1; i <= 6; i++) {
    await prisma.branch.create({
      data: {
        name: `${i}A`, 
        semesterId: i, 
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
      },
    });
  }

  // SUBJECT
  const subjects = [
    {
      name: "Mathematics",
      subjectCode: "MATH101",
      type: SubjectType.THEORY, // Use enum instead of string
      maxMarks: 100,
      branchId: 1,
      semesterId: 1,
    },
    {
      name: "Physics",
      subjectCode: "PHY102",
      type: SubjectType.THEORY,
      maxMarks: 100,
      branchId: 1,
      semesterId: 1,
    },
    {
      name: "Computer Science",
      subjectCode: "CS103",
      type: SubjectType.THEORY,
      maxMarks: 100,
      branchId: 2,
      semesterId: 2,
    },
  ];

  for (const subject of subjects) {
    await prisma.subject.create({
      data: subject,
    });
  }

//   // TEACHER
//   for (let i = 1; i <= 15; i++) {
//     await prisma.teacher.create({
//       data: {
//         id: `teacher${i}`, // Unique ID for the teacher
//         username: `teacher${i}`,
//         name: `TName${i}`,
//         surname: `TSurname${i}`,
//         email: `teacher${i}@example.com`,
//         phone: `123-456-789${i}`,
//         address: `Address${i}`,
//         bloodType: "A+",
//         sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
//         courses: { connect: [{ id: (i % 10) + 1 }] }, 
//         branches: { connect: [{ id: (i % 6) + 1 }] }, 
//         birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
//       },
//     });
//   }

//   // registrar
//   for (let i = 1; i <= 5; i++) {
//     await prisma.registrar.create({
//       data: {
//         id: `registrar${i}`, // Unique ID for the teacher
//         username: `registrar${i}`,
//         name: `RName${i}`,
//         surname: `RSurname${i}`,
//         email: `registrar${i}@example.com`,
//         phone: `123-456-789${i}`,
//         address: `Address${i}`,
//         bloodType: "A+",
//         sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
//         birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
//       },
//     });
//   }
  

//   // LESSON
//   for (let i = 1; i <= 30; i++) {
//     await prisma.lectures.create({
//       data: {
//         name: `Lectures${i}`, 
//         day: Day[
//           Object.keys(Day)[
//             Math.floor(Math.random() * Object.keys(Day).length)
//           ] as keyof typeof Day
//         ], 
//         startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
//         endTime: new Date(new Date().setHours(new Date().getHours() + 3)), 
//         courseId: (i % 10) + 1, 
//         branchId: (i % 6) + 1, 
//         teacherId: `teacher${(i % 15) + 1}`, 
//       },
//     });
//   }


//   // STUDENT
//   for (let i = 1; i <= 50; i++) {
//     await prisma.student.create({
//       data: {
//         id: `student${i}`, 
//         username: `student${i}`, 
//         name: `SName${i}`,
//         fatherName: `FatherName ${i}`,
//         motherName: `MotherName ${i}`,
//         // parentId: `parentId${Math.ceil(i / 2) % 25 || 25}`, 
//         gradeId: (i % 6) + 1, 
//         branchId: (i % 6) + 1, 
//       },
//     });
//   }

//   // EXAM
//   for (let i = 1; i <= 10; i++) {
//     await prisma.exam.create({
//       data: {
//         title: `Exam ${i}`, 
//         startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
//         endTime: new Date(new Date().setHours(new Date().getHours() + 2)), 
//         lecturesId: (i % 30) + 1, 
//       },
//     });
//   }

//   // ASSIGNMENT
//   for (let i = 1; i <= 10; i++) {
//     await prisma.assignment.create({
//       data: {
//         title: `Assignment ${i}`, 
//         startDate: new Date(new Date().setHours(new Date().getHours() + 1)), 
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), 
//         lecturesId: (i % 30) + 1, 
//       },
//     });
//   }

//   // RESULT
//   for (let i = 1; i <= 10; i++) {
//     await prisma.result.create({
//       data: {
//         score: 90, 
//         studentId: `student${i}`, 
//         ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }), 
//       },
//     });
//   }

//   // ATTENDANCE
//   for (let i = 1; i <= 10; i++) {
//     await prisma.attendance.create({
//       data: {
//         date: new Date(), 
//         present: true, 
//         studentId: `student${i}`, 
//         lecturesId: (i % 30) + 1, 
//       },
//     });
//   }

//   // ANNOUNCEMENT
//   for (let i = 1; i <= 5; i++) {
//     await prisma.announcement.create({
//       data: {
//         title: `Announcement ${i}`, 
//         startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
//         endTime: new Date(new Date().setHours(new Date().getHours() + 2)), 
//         branchId: (i % 5) + 1, 
//       },
//     });
//   }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
