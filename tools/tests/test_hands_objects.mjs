// Reuse isolated real-driver fixtures; no live service or player data.
import { resolve } from 'node:path';
process.argv[2] = resolve(process.argv[2] || 'bin/driver.exe');
process.argv.push('--hands');
await import('./test_cloth_objects.mjs');
