// Compile-only temporary mudlib; no NPC constructors or live game service.
import { resolve } from 'node:path';
process.argv[2] = resolve(process.argv[2] || 'bin/lpcc.exe');
process.argv.push('--headwear');
await import('./compile_cloth_callers.mjs');
