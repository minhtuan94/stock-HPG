import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const row = await prisma.quarterlyAnalysis.findFirst({
    orderBy: { generatedAt: "desc" },
    select: {
      strength: true,
      weakness: true,
      trend: true,
    },
  });

  console.log(row);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
