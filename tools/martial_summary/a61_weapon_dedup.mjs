// Weapon usage counts DEDUPED by parent skill identity (one parent counted once),
// split into single-category vs mixed (兼用) parents.
// Run from repo root. Output: tools/martial_summary/a61_weapon_dedup.json (committed deliverable).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const E = 'C:/tools/msys64/home/oiuv/mud-evidence/martial-data';
const OUT = 'tools/martial_summary/a61_weapon_dedup.json';
const json = p => JSON.parse(readFileSync(p, 'utf8'));
const cat = json(`${E}/perform-probe-formal-20261103-v4/catalog.json`);
const weaponSet = ['axe', 'blade', 'club', 'dagger', 'hammer', 'spear', 'staff', 'sword', 'throwing', 'whip', 'chuixiao-jifa'];
const label = { 'chuixiao-jifa': 'xsword(箫/吹箫技法)' };
// unique parents = first path segment of each skill id
const parents = new Map(); // parent -> source text
for (const sk of cat.skills) {
    const base = sk.id.split('/')[0];
    if (parents.has(base)) continue;
    let src = null;
    for (const cand of [`kungfu/skill/${base}.c`, `kungfu/skill/${base}.lpc`])
        if (existsSync(cand)) { try { src = readFileSync(cand, 'utf8'); break; } catch {} }
    parents.set(base, src);
}
const usageOf = src => {
    if (!src) return null;
    const m = /valid_enable\s*\([^)]*\)\s*\{([\s\S]*?)\}/.exec(src);
    if (!m) return new Set();
    const us = new Set();
    for (const w of weaponSet) if (m[1].includes('"' + w + '"')) us.add(w);
    return us;
};
const perCat = {};
for (const w of weaponSet) perCat[w] = { single: 0, mixed: 0, parents: [] };
let nonWeapon = 0, none = 0, mixedTotal = 0;
for (const [base, src] of parents) {
    const us = usageOf(src);
    if (us === null) { none++; continue; }
    const weapons = [...us].filter(w => weaponSet.includes(w));
    if (!weapons.length) { nonWeapon++; continue; }
    if (weapons.length === 1) {
        perCat[weapons[0]].single++;
        perCat[weapons[0]].parents.push(base);
    } else {
        mixedTotal++;
        for (const w of weapons) { perCat[w].mixed++; perCat[w].parents.push(base + '(' + weapons.join('+') + ')'); }
    }
}
writeFileSync(OUT, JSON.stringify({ perCat, parents: parents.size, nonWeapon, none, mixedTotal }, null, 1));
console.log('unique parents:', parents.size, '| non-weapon usage:', nonWeapon, '| no valid_enable:', none, '| mixed parents:', mixedTotal);
for (const w of weaponSet) console.log(label[w] ?? w, 'single:', perCat[w].single, 'mixed:', perCat[w].mixed, '| e.g.', perCat[w].parents.slice(0, 5).join(','));
