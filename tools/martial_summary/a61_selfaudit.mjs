// 6.1 self-audit arithmetic checks: exit non-zero on any inconsistency.
// Run from repo root after regenerating tools/martial_summary/a61_*.json.
import { readFileSync } from 'node:fs';
const stats = JSON.parse(readFileSync('tools/martial_summary/a61_stats.json', 'utf8'));
const truth = JSON.parse(readFileSync('tools/martial_summary/a61_probe_truth.json', 'utf8'));
const costs = JSON.parse(readFileSync('tools/martial_summary/a61_costs.json', 'utf8'));
const ledger = JSON.parse(readFileSync('C:/tools/msys64/home/oiuv/mud-evidence/martial-data/acceptance-51-53-20261115-final/coverage-ledger.json', 'utf8'));
let fail = 0;
const eq = (name, a, b) => { if (a !== b) { console.log('MISMATCH', name, a, '!=', b); fail++; } else console.log('OK', name, '=', a); };
// 1. school-combat corpus totals = sum of condition-prefix groups
const sc = stats.corpora['school-combat'];
const groups = Object.values(stats.schools);
for (const k of ['conditions', 'planned', 'recorded', 'observed', 'refused', 'error'])
    eq('school-sum ' + k, groups.reduce((a, g) => a + (g[k] ?? 0), 0), sc[k]);
// series: grouped + ungrouped (conditions without school- prefix) = corpus series (doc note: 8)
const ungrouped = sc.series - groups.reduce((a, g) => a + g.series, 0);
eq('school ungrouped series (doc note)', ungrouped, 8);
// 2. probe ground truth: files = observed+refused+error; unique = files
const t = truth.total;
eq('probe files=outcome sum', t.files, t.observed + t.refused + t.error + t.not_applicable);
eq('probe slots unique', t.uniqueSlots, t.files);
eq('probe dup', t.dup, 0);
eq('probe planned-files=100 (file view)', 61170 - t.files, 100);
eq('probe cov recorded=outcome+error', t.cov_recorded, t.observed + t.refused + t.cov_error);
eq('probe cov missing+error=100', t.cov_missing + t.cov_error, 100);
eq('probe cov planned identity', t.cov_recorded + t.cov_missing, 61170);
// 2b. cost class split (outcome x verification) adds up to the corpus
const clsSum = Object.values(costs.totals.byClass).reduce((a, b) => a + b, 0);
eq('cost class sum = files', clsSum, t.files);
eq('cost envelope total', costs.totals.all, t.files);
eq('cost unverified via sum', Object.values(costs.unverifiedByVia).reduce((a, b) => a + b, 0), 5200);
eq('cost no_contract = 200 (MA-136)', costs.totals.byClass.no_contract, 200);
eq('cost refused + observed classes = observed/refused files',
    costs.totals.byClass.refused + costs.totals.byClass.normal_effect + costs.totals.byClass.miss_backlash + costs.totals.byClass.unverified + costs.totals.byClass.no_contract, t.files);
// 3. ledger identity
eq('ledger sum', Object.values(ledger.totals).reduce((a, b) => a + b, 0), 730);
eq('ledger byKind sum', Object.values(ledger.by_kind).reduce((a, b) => a + b, 0), 730);
eq('ledger verified split', 588 + 39 + 95, 722);
// 4. catalog role sum
const roles = stats.catalog.roles;
eq('catalog roles sum', Object.values(roles).reduce((a, b) => a + b, 0), 5055);
eq('perform+exert', roles.perform + roles.exert, 730);
// 5. probe validation split
eq('replay pass split', 7364 + 48306, 55670);
eq('replay accounting', 55670 + 5200 + 200, 61070);
// 6. weapon dedup identities
const wd = JSON.parse(readFileSync('tools/martial_summary/a61_weapon_dedup.json', 'utf8'));
const singles = Object.values(wd.perCat).reduce((n, v) => n + v.single, 0);
eq('weapon single parents', singles, 232);
eq('weapon parents identity', singles + wd.mixedTotal + wd.nonWeapon + wd.none, wd.parents);
eq('sword parents', wd.perCat.sword.single + wd.perCat.sword.mixed, 101);
eq('combat singles 228 (excl. 4 playing)', singles - wd.perCat['chuixiao-jifa'].single, 228);
// 7. cost channel sanity: unarmed neili upper +100 (chang2), and spear normal_effect has no samples
eq('cost entries', costs.entries.length, 641);
eq('cost samples sum', costs.entries.reduce((a, e) => a + e.samples, 0), 61070);
eq('unarmed neili upper +100 (chang2 envelope)', costs.byUsage.unarmed.env.neili.max, 100);
eq('spear normal_effect samples = 0 (all refused)', costs.byUsage.spear.normal_effect?.samples ?? 0, 0);
eq('spear refused samples = 300', costs.byUsage.spear.refused.samples, 300);
const dian = costs.entries.find(e=>e.id==='kungfu/skill/taiji-shengong/dian.c:5:exert');
eq('dian treatment has 100 normal observations', dian.counts.normal_effect, 100);
eq('dian treatment is not backlash', dian.backlash, 0);
const roar = costs.entries.find(e=>e.id==='kungfu/skill/surge-force/roar.c:7:exert');
eq('surge roar no-effect branch is not backlash', roar.backlash, 0);
eq('surge roar no-effect observations retained', roar.miss, 100);
// 8. fingerprint version stats
const fp = JSON.parse(readFileSync('tools/martial_summary/a61_fingerprints.json', 'utf8'));
const fps = Object.entries(fp.byFp).sort((x, y) => y[1].series - x[1].series);
eq('fp groups', fps.length, 2);
eq('fp series sum', fps.reduce((n, [, g]) => n + g.series, 0), 956);
eq('fp cross identical+diff+onlyMinor', fp.cross.same + fp.cross.diff.length + fp.cross.onlyMinor, fp.cross.compared);
eq('fp diff skills', fp.cross.diff.length, 3);
// 9. failure dispositions attachment
const fd = JSON.parse(readFileSync('C:/tools/msys64/home/oiuv/mud-evidence/martial-data/acceptance-51-53-20261115-final/failure-dispositions.json', 'utf8'));
const byVia = {}; for (const f of fd) byVia[f.via] = (byVia[f.via] ?? 0) + (f.failed ?? 0);
eq('disposition entry-closure', byVia['entry-closure'], 4800);
eq('disposition sum', byVia['entry-closure'] + byVia.superseded + byVia.special, 5200);
console.log(fail === 0 ? 'SELF-AUDIT PASS' : 'SELF-AUDIT FAIL');
process.exit(fail ? 1 : 0);
