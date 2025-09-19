#!/usr/bin/env node
// scripts/normalize-crest-files.mjs
// Normalize crest filenames in public/crests and update Team.crestUrl in DB.
// - Slugify names (lowercase, remove diacritics, dash-separate)
// - Collapse duplicates, add numeric suffixes if needed
// - Rename files and update Prisma records accordingly

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import process from 'process';

// Lightweight .env loader (since Node doesn't auto-load .env files)
function loadEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch (e) {
    // ignore
  }
}

// Load env (order: .env, then .env.local to override)
loadEnvFile(path.resolve(process.cwd(), '.env'));
loadEnvFile(path.resolve(process.cwd(), '.env.local'));

const crestDir = path.resolve(process.cwd(), 'public', 'crests');

function slugifyBase(name) {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  // Collapse duplicate halves if exactly repeated
  const half = Math.floor(base.length / 2);
  const first = base.slice(0, half);
  const second = base.slice(half);
  if (first.length > 3 && first === second) return first;
  return base;
}

async function normalizeFiles() {
  const entries = await fsp.readdir(crestDir, { withFileTypes: true });
  const files = entries.filter(e => e.isFile()).map(e => e.name).filter(n => /\.(svg|png|jpe?g)$/i.test(n));
  const mapping = new Map(); // oldName -> newName
  const used = new Set();

  for (const filename of files) {
    const ext = path.extname(filename).toLowerCase();
    const base = path.basename(filename, ext);
    let slug = slugifyBase(base);
    let target = `${slug}${ext}`;
    let i = 1;
    while (used.has(target) && target !== filename) {
      target = `${slug}-${i}${ext}`;
      i += 1;
    }
    used.add(target);
    if (target !== filename) {
      mapping.set(filename, target);
    }
  }

  // Perform renames
  for (const [from, to] of mapping.entries()) {
    const src = path.join(crestDir, from);
    const dst = path.join(crestDir, to);
    await fsp.rename(src, dst);
    console.log(`Renamed: ${from} -> ${to}`);
  }

  // Persist mapping for audit
  const mapPath = path.resolve(process.cwd(), 'scripts', 'crest-normalization-map.json');
  await fsp.writeFile(mapPath, JSON.stringify(Object.fromEntries(mapping), null, 2));

  return mapping;
}

async function updateDatabase(mapping) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const teams = await prisma.team.findMany({ select: { id: true, crestUrl: true } });
    let updated = 0;
    for (const t of teams) {
      if (!t.crestUrl) continue;
      const match = t.crestUrl.match(/^\/crests\/(.+)$/);
      if (!match) continue;
      const oldName = match[1];
      const newName = mapping.get(oldName);
      if (newName && newName !== oldName) {
        await prisma.team.update({ where: { id: t.id }, data: { crestUrl: `/crests/${newName}` } });
        updated += 1;
        console.log(`Updated Team ${t.id}: crestUrl -> /crests/${newName}`);
      }
    }
    return updated;
  } finally {
    await prisma.$disconnect();
  }
}

(async () => {
  try {
    const mapping = await normalizeFiles();
    console.log(`Total files renamed: ${mapping.size}`);
    const updated = await updateDatabase(mapping);
    console.log(`Total teams updated: ${updated}`);
  } catch (e) {
    console.error('Error during crest normalization:', e);
    process.exit(1);
  }
})();
