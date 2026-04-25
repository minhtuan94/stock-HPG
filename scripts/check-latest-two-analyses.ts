import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.financialReport.findMany({
    where: { symbol: "HPG" },
    orderBy: [{ fiscalYear: "desc" }, { fiscalQuarter: "desc" }],
    take: 2,
    include: {
      analyses: {
        orderBy: { generatedAt: "desc" },
        take: 1,
      },
    },
  });

  for (const row of rows) {
    const a = row.analyses[0];
    console.log(`Q${row.fiscalQuarter}/${row.fiscalYear}`);
    console.log("- strength:", a?.strength);
    console.log("- weakness:", a?.weakness);
    console.log("- trend:", a?.trend);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
