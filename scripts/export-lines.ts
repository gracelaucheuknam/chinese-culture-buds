/**
 * Export all dialogue lines to CSV for ElevenLabs batch generation.
 * Usage: npx tsx scripts/export-lines.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getAllLines } from '../src/content/lines/index';

const rows = [['lineId', 'yue', 'pu']];

for (const line of getAllLines()) {
  rows.push([
    line.id,
    `"${line.yue.replaceAll('"', '""')}"`,
    `"${line.pu.replaceAll('"', '""')}"`,
  ]);
}

const csv = rows.map((r) => r.join(',')).join('\n') + '\n';
const out = resolve(process.cwd(), 'lines-export.csv');
writeFileSync(out, csv, 'utf-8');
console.log(`Exported ${rows.length - 1} lines → ${out}`);
