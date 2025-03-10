import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const branches = [
  "Electronics",
  "Mechanical",
  "Die and Mould Making",
  "Mechatronics",
];

async function main() {
  for (const name of branches) {
    const branch = await prisma.branch.create({
      data: {
        name,
        capacity: 100, // Set a default capacity value, modify as needed
        semesters: {
          create: Array.from({ length: 8 }, (_, i) => ({ level: i + 1 })),
        },
      },
      include: {
        semesters: true,
      },
    });
    console.log(`Branch ${branch.name} with 8 semesters seeded successfully`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
