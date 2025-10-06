import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';

async function main() {
  const url = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_DB_TOKEN;

  if (!url) {
    throw new Error('TURSO_DB_URL is not set');
  }

  const sqlFile = 'prisma/turso-init.sql';
  const raw = readFileSync(sqlFile, 'utf8');

  // Make the SQL idempotent: add IF NOT EXISTS to CREATE statements
  const sql = raw
    .replaceAll(/CREATE TABLE /g, 'CREATE TABLE IF NOT EXISTS ')
    .replaceAll(/CREATE UNIQUE INDEX /g, 'CREATE UNIQUE INDEX IF NOT EXISTS ')
    .replaceAll(/CREATE INDEX /g, 'CREATE INDEX IF NOT EXISTS ');

  const client = createClient({ url, authToken });
  const host = (() => { try { return new URL(url).host; } catch { return url; } })();
  console.log(`Applying schema from ${sqlFile} to libsql host=${host} ...`);
  await client.executeMultiple(sql);
  console.log('Schema applied successfully (idempotent).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
