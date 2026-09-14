import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Edit this list with your real managers before running `npm run db:seed`,
// or just add them later from the in-app "Manage Managers" page.
const MANAGERS = [
  { name: "Jane Santos", email: "jane.santos@textjune.com" },
  { name: "Mark Rivera", email: "mark.rivera@textjune.com" },
];

async function main() {
  for (const m of MANAGERS) {
    await prisma.manager.upsert({
      where: { email: m.email },
      update: { name: m.name },
      create: m,
    });
  }
  console.log(`Seeded ${MANAGERS.length} managers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
