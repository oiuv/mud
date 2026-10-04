// Share the CLOTH isolated driver/transaction fixtures, not game behavior.
import { resolve } from 'node:path';
process.argv[2] = resolve(process.argv[2] || 'bin/driver.exe');
process.argv.push('--boots');
await import('./test_cloth_objects.mjs');
