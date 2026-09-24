// Frozen token baseline of maze.c encounter/inventory/init before extraction.
// Function renaming is normalized; probabilities, tables and execution order must stay exact.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tokenSequence } from '../../fluffos/tools/lpc-syntax/format.mjs';

const source = readFileSync(new URL('../../inherit/room/illusion_base.lpc', import.meta.url), 'utf8')
    .replaceAll('initialize_illusion_inventory', 'setInventory')
    .replaceAll('spawn_illusion_demon', 'setDemon')
    .replaceAll('run_illusion_encounter', 'init');
const start = source.indexOf('\nvoid setInventory(int x, int y, int z) {');
if (start < 0) throw new Error('Encounter function boundary missing');
const digest = createHash('sha256').update(JSON.stringify(tokenSequence(source.slice(start)))).digest('hex');
if (digest !== '6f0788d54bfb25d46fe65a768fb47b3172b165c390d917fd3a83adf919d7d001')
    throw new Error('Encounter behavior changed: review against the original maze baseline');
console.log('ILLUSION encounter token baseline PASS');
