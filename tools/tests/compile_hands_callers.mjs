// Compile constructors without executing them in a temporary source copy.
import { resolve } from 'node:path';
process.argv[2] = resolve(process.argv[2] || 'bin/lpcc.exe');
process.argv.push('--hands');
await import('./compile_cloth_callers.mjs');
