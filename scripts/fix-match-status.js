const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

function createPrisma() {
  const tursoUrl = process.env.TURSO_DB_URL || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('libsql://') ? process.env.DATABASE_URL : null);
  const tursoToken = process.env.TURSO_DB_TOKEN || process.env.LIBSQL_AUTH_TOKEN;
  if (!tursoUrl) {
    throw new Error("[script] Missing Turso configuration. Set TURSO_DB_URL and TURSO_DB_TOKEN (or DATABASE_URL starting with libsql://). Local file DB is disabled.");
  }
  const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

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
