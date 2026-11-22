import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { swaggerSpec } from '../src/config/swagger.js';

const docsDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = join(docsDirectory, 'openapi.json');

mkdirSync(docsDirectory, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(swaggerSpec, null, 2)}\n`, 'utf8');

console.log(`OpenAPI document written to ${outputPath}`);
