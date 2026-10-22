import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openApiDocument } from './openapi';

/**
 * יוצר את הקובץ docs/openapi.json מתוך src/docs/openapi.ts.
 * הרצה: npm run docs:generate
 */
const outDir = join(__dirname, '..', '..', 'docs');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'openapi.json');
writeFileSync(outFile, `${JSON.stringify(openApiDocument, null, 2)}\n`, 'utf8');
// eslint-disable-next-line no-console
console.log(`OpenAPI written to ${outFile}`);
