// Share the isolated compile-only harness; never execute NPC constructors.
import { resolve } from 'node:path';
process.argv[2] = resolve(process.argv[2] || 'bin/lpcc.exe');
process.argv.push('--boots');
await import('./compile_cloth_callers.mjs');
