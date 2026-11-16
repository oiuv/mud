// Verify every transcribed number in the 6.1 summary tables against the stats JSONs.
// Run from repo root after regenerating tools/martial_summary/a61_*.json.
// Expected row strings are BUILT from the JSONs, so any transcription drift fails.
import { readFileSync } from 'node:fs';
const doc = readFileSync('docs/reviews/2026-11-15-6.1-three-layer-summary-final.md', 'utf8');
const s1 = JSON.parse(readFileSync('tools/martial_summary/a61_stats.json', 'utf8'));
const truth = JSON.parse(readFileSync('tools/martial_summary/a61_probe_truth.json', 'utf8'));
const costs = JSON.parse(readFileSync('tools/martial_summary/a61_costs.json', 'utf8'));
let fail = 0, checked = 0;
const fmt = n => n.toLocaleString('en-US');
const need = frag => { checked++; if (!doc.includes(frag)) { console.log('DOC-MISSING:', frag); fail++; } };
// range cell: min..max with '+' on positive side only in mixed-sign ranges; null -> —
const rng = v => {
    if (!v) return '—';
    const mixed = v.min < 0 || v.max < 0;
    const f = n => (mixed && n > 0 ? '+' : '') + fmt(n);
    return v.min === v.max ? f(v.min) : `${f(v.min)}..${f(v.max)}`;
};
// ---- school-combat rows (unchanged format) ----
const g = k => s1.schools[k];
const row = (name, v) => need('| ' + name + ' | ' + fmt(v.series) + ' | ' + fmt(v.conditions) + ' | '
    + fmt(v.planned) + ' | ' + fmt(v.recorded) + ' | ' + fmt(v.observed) + ' | ' + fmt(v.refused) + ' | ' + v.error + ' |');
row('古墓 gumu', g('gumu'));
row('明教 mingjiao', g('mingjiao'));
row('峨嵋 emei', g('emei'));
row('全真 quanzhen', g('quanzhen'));
row('桃花 taohua', g('taohua'));
row('华山 huashan', g('huashan'));
row('武当 wudang', g('wudang'));
row('其他/公共（b 系列审查、公共武学等）', g('other'));
const sp = {};
for (const k of ['s1', 'slice', 'slice1', 'slice2', 'slice3', 'slice4', 'slice5', 'slice6', 'slice7', 'slice8', 'composite', 'public', 'npc'])
    for (const f of ['series', 'conditions', 'planned', 'recorded', 'observed', 'refused', 'error']) sp[f] = (sp[f] ?? 0) + (g(k)?.[f] ?? 0);
row('专项组（s1/slice/slice1-8/composite/public/npc）', sp);
const t = s1.corpora.teaching;
need('| ' + fmt(t.planned) + ' | ' + fmt(t.recorded) + ' | ' + fmt(t.observed) + ' | ' + fmt(t.refused) + ' | ' + t.error + ' | ' + fmt(t.missing) + ' |');
const r23 = (name, v) => need('| ' + name + ' | ' + fmt(v.series) + ' | ' + fmt(v.conditions) + ' | '
    + fmt(v.planned) + ' | ' + fmt(v.recorded) + ' | ' + fmt(v.observed) + ' | ' + fmt(v.refused) + ' | ' + v.error + ' | ' + v.missing + ' |');
r23('school-scene 场景', s1.corpora['school-scene']);
r23('abilities 旧能力集（2026-10）', s1.corpora.abilities);
for (const [k, v] of Object.entries(s1.catalog.roles)) need('| ' + k + ' | ' + fmt(v) + ' |');
// ---- probe table (file/coverage dual view) ----
const t3 = truth.total;
need('| 61,170 | 61,089 | 61,070 | ' + fmt(t3.observed) + ' | ' + fmt(t3.refused) + ' | 19 | 81 |');
for (const v of ['413,048', '107,269', '61,070', '81,589', '4,367', '1,816', '669,241']) need(v);
// ---- cost class split table (built from costs.totals) ----
{
    const c = costs.totals.byClass;
    need('| 正常施放 normal_effect | ' + fmt(c.normal_effect) + ' |');
    need('| 合法落空/反噬 miss_backlash | ' + fmt(c.miss_backlash) + ' |');
    need('| 资格拒绝 refused | ' + fmt(c.refused) + ' |');
    need('| 取代/校验失败 unverified | ' + fmt(c.unverified) + ' |');
    need('| 无契约 no_contract | ' + fmt(c.no_contract) + ' |');
    need('合法落空 ' + fmt(costs.totals.miss));
    need('反噬自伤 ' + fmt(costs.totals.backlash));
    need('entry-closure ' + fmt(costs.unverifiedByVia['entry-closure']) + ' / superseded ' + fmt(costs.unverifiedByVia.superseded) + ' / special（MA-144）' + fmt(costs.unverifiedByVia.special));
}
// ---- normal-effect cost table + envelope table (rows built from byUsage) ----
const USAGE_ROWS = [['strike', 'strike 徒手'], ['sword', 'sword 剑'], ['unarmed', 'unarmed 拳掌'], ['finger', 'finger 指'],
    ['blade', 'blade 刀'], ['whip', 'whip 鞭'], ['cuff', 'cuff 拳'], ['throwing', 'throwing 暗器'], ['hand', 'hand 拿'],
    ['claw', 'claw 爪'], ['staff', 'staff 杖'], ['club', 'club 棍'], ['dagger', 'dagger 匕首'], ['hammer', 'hammer 锤'],
    ['axe', 'axe 斧'], ['spear', 'spear 枪'], ['force', 'force 内功'], ['dodge', 'dodge 身法']];
const CHS = ['neili', 'qi_self', 'busy', 'qi_cost', 'eff_qi_cost'];
const costRow = (label, entriesN, samplesN, bucket) =>
    need('| ' + label + ' | ' + fmt(entriesN) + ' | ' + fmt(samplesN) + ' | ' + CHS.map(ch => rng(bucket[ch])).join(' | ') + ' |');
for (const [u, label] of USAGE_ROWS) {
    const b = costs.byUsage[u].normal_effect;
    costRow(label, costs.byUsage[u].entriesPerClass.normal_effect, b?.samples ?? 0, b ?? {});
}
for (const [u, label] of USAGE_ROWS) {
    const b = costs.byUsage[u].env;
    costRow(label, costs.byUsage[u].entries, b.samples, b);
}
// ---- key fixed fragments ----
need('| 剑 sword | 93 | 8 | **101** |');
need('884 系列用 `8ae4d9c9eb8a`、72 系列用 `f569f0295278`');
need('| 8ae4d9c9eb8a | 884 | 100,393 | 693,372 | 551,898 | 561,920 |');
need('1,351 正式关联 + 206 源码处置');
need('entry-closure 4,800 / superseded 200 / special（MA-144）200 = 5,200');
need('MA-001..MA-144');
need('【gapfill5/probe-perform-daojian-guizhen-xue-20】');
need('全尝试观测包络');
need('init_xsword');
need('set("skill_type", "sword")');
need('1,691 个样本文件但无 coverage.json');
need('tools/martial_summary/a61_costs.json');
need('641 条目 / 61,070 样本，按结局与验证状态分账');
need('-1,120..+100');
need('合法落空 ' + costs.totals.miss);
need('反噬自伤 ' + costs.totals.backlash);
need('| strike 徒手 | 0 | 100 | -10,000 | 7,500 | 全 0 |');
need('qi_self -10..0；neili -499..0；busy 1..5');
console.log(checked, 'fragments checked;', fail, 'missing');
console.log(fail === 0 ? 'DOC-CHECK PASS' : 'DOC-CHECK FAIL');
process.exit(fail ? 1 : 0);
