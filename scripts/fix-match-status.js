const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting script to fix invalid match statuses...');
  try {
    const updatedCount = await prisma.$executeRaw`UPDATE "Match" SET "status" = 'SCHEDULED' WHERE "status" = ''`;
    console.log(`Successfully fixed ${updatedCount} matches with invalid status.`);
    if (updatedCount === 0) {
      console.log('No invalid match statuses found.');
    }
  } catch (error) {
    console.error('An error occurred while trying to fix match statuses:', error);
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
