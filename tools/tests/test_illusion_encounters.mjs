// Frozen token baseline of maze.c encounter/inventory/init before extraction.
// Function names and stack storage are normalized; probabilities, amounts and order stay exact.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tokenSequence } from '../../fluffos/tools/lpc-syntax/format.mjs';

const source = readFileSync(new URL('../../inherit/room/illusion_base.lpc', import.meta.url), 'utf8')
    .replaceAll('initialize_illusion_inventory', 'setInventory')
    .replaceAll('spawn_illusion_demon', 'setDemon')
    .replaceAll('run_illusion_encounter', 'init');
const start = source.indexOf('\nvoid setInventory(int x, int y, int z) {');
const spawn = source.indexOf('\nvoid setDemon(', start);
if (start < 0 || spawn < 0) throw new Error('Encounter function boundary missing');
// Only translate how a room records a drop. The isolated driver suite checks the actual stack and reset behavior.
const inventory = source.slice(start, spawn)
    .replace('incense_amount = 0;', 'mapping inv = ([]);')
    .replace(/incense_amount = (\d+);/g, 'inv["/clone/misc/yinzongxiang"] = $1;')
    .replace(/^    \/\/ 登记一堆[^\n]*\n/m, '')
    .replace('set("objects", incense_amount ? ([ INCENSE: 1 ]) : ([]));', 'set("objects", inv);');
const digest = createHash('sha256').update(JSON.stringify(tokenSequence(inventory + source.slice(spawn)))).digest('hex');
if (digest !== '6f0788d54bfb25d46fe65a768fb47b3172b165c390d917fd3a83adf919d7d001')
    throw new Error('Encounter behavior changed: review against the original maze baseline');
console.log('ILLUSION encounter token baseline PASS');
