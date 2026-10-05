// Reuse the isolated driver fixtures, never the live MUD or player data.
import { resolve } from 'node:path';
process.argv[2] = resolve(process.argv[2] || 'bin/driver.exe');
process.argv.push('--headwear');
await import('./test_cloth_objects.mjs');
