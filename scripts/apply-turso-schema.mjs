import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';

async function main() {
  const url = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_DB_TOKEN;

  if (!url) {
    throw new Error('TURSO_DB_URL is not set');
  }

  const sqlFile = 'prisma/turso-init.sql';
  const sql = readFileSync(sqlFile, 'utf8');

  const client = createClient({ url, authToken });
  console.log(`Applying schema from ${sqlFile} to ${url} ...`);
  await client.executeMultiple(sql);
  console.log('Schema applied successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
