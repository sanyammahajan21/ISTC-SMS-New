import { PrismaClient, SubjectType, UserSex, Day } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create Admins
  await prisma.admin.createMany({
    data: [
      { id: "admin1", username: "admin1" },
      { id: "admin2", username: "admin2" },
    ],
  });

  // Create 8 Semesters
  for (let i = 1; i <= 8; i++) {
    await prisma.semester.create({
      data: {
        level: i,
      },
    });
  }

  // Create 4 Branches
  const branches = ["A", "B", "C", "D"];
  for (let i = 0; i < branches.length; i++) {
    await prisma.branch.create({
      data: {
        name: `Branch ${branches[i]}`,
        capacity: Math.floor(Math.random() * (30 - 20 + 1)) + 20,
        semesterId: (i % 4) + 1, // Assign branches to semesters
      },
    });
  }

  // Create Subjects
  const subjects = [
    { name: "Mathematics", subjectCode: "MATH101", type: SubjectType.THEORY, maxMarks: 100 },
    { name: "Physics", subjectCode: "PHY102", type: SubjectType.THEORY, maxMarks: 100 },
    { name: "Chemistry", subjectCode: "CHEM103", type: SubjectType.THEORY, maxMarks: 100 },
    { name: "Biology", subjectCode: "BIO104", type: SubjectType.THEORY, maxMarks: 100 },
    { name: "Computer Science", subjectCode: "CS105", type: SubjectType.THEORY, maxMarks: 100 },
    { name: "English", subjectCode: "ENG106", type: SubjectType.THEORY, maxMarks: 100 },
    { name: "History", subjectCode: "HIS107", type: SubjectType.THEORY, maxMarks: 100 },
    { name: "Geography", subjectCode: "GEO108", type: SubjectType.THEORY, maxMarks: 100 },
  ];

  for (const subject of subjects) {
    await prisma.subject.create({
      data: {
        ...subject,
        branchId: Math.floor(Math.random() * 4) + 1, // Assign subjects to random branches
        semesterId: Math.floor(Math.random() * 8) + 1, // Assign subjects to random semesters
      },
    });
  }

  // Create 50 Teachers
  for (let i = 1; i <= 50; i++) {
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `teacher${i}`,
        password: `password${i}`,
        name: `Teacher Name ${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        division: i % 2 === 0 ? "ISTC" : "LIBRARY",
        subjects: {
          connect: [{ id: Math.floor(Math.random() * subjects.length) + 1 }], // Assign random subjects
        },
        branches: {
          connect: [{ id: Math.floor(Math.random() * 4) + 1 }], // Assign random branches
        },
      },
    });
  }

  // Create 100 Students
  for (let i = 1; i <= 100; i++) {
    await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        password: `password${i}`,
        name: `Student Name ${i}`,
        fatherName: `Father Name ${i}`,
        motherName: `Mother Name ${i}`,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
        phone: `123-456-789${i}`,
        email: `student${i}@example.com`,
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        bloodType: i % 4 === 0 ? "A+" : "B+",
        branchId: Math.floor(Math.random() * 4) + 1, // Assign random branches
        semesterId: Math.floor(Math.random() * 8) + 1, // Assign random semesters
      },
    });
  }

  // Create Exams
  for (let i = 1; i <= 20; i++) {
    await prisma.exam.create({
      data: {
        subjectId: Math.floor(Math.random() * subjects.length) + 1, // Assign random subjects
        examDate: new Date(new Date().setDate(new Date().getDate() + i)),
        startTime: new Date(new Date().setHours(9, 0, 0)),
        endTime: new Date(new Date().setHours(12, 0, 0)),
        semesterId: Math.floor(Math.random() * 8) + 1, // Assign random semesters
        branchId: Math.floor(Math.random() * 4) + 1, // Assign random branches
      },
    });
  }

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