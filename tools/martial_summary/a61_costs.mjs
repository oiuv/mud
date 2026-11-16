// 6.1 施放成本/伤害通道提取（probe 正式 12 系列，E 原件逐样本），按结局与验证状态分账：
//   normal_effect  发动（observed）且 5.3 重放验证通过——正常施放（目标受效或自体受效）
//   miss_backlash  已验证的攻击落空/保护无效，或有源码分支与昏迷事件支持的反噬
//   refused        拒绝（refused）且验证通过——资格/条件拒绝；只记录拒绝副作用，不计施放成本
//   unverified     5.3 重放失败槽位（entry-closure/superseded/special），另列，按 via 分列
//   no_contract    无契约槽位（MA-136 复现条件），另列
// 另输出 envelope（全尝试观测包络）= 全部样本不分结局的 min..max，仅作尝试包络、不是正常使用成本。
// 通道：neili/qi_self 为 actor before→after 增量；busy 为 after 值（null=未观察，跳过不填零）；
// qi_cost/eff_qi_cost/jing_cost 为目标 metrics（伤害与创伤分列不相加）。
// 依赖：E/acceptance-51-53-20261115-final/{contract-replay,failure-dispositions}.json（5.3 验收账）。
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { cost_outcome } from './cost_outcome.mjs';
const E = 'C:/tools/msys64/home/oiuv/mud-evidence/martial-data';
const A = `${E}/acceptance-51-53-20261115-final`;
const OUT = 'tools/martial_summary/a61_costs.json';
const json = p => JSON.parse(readFileSync(p, 'utf8'));
const SERIES = ['perform-probe-formal-20261103-v4', 'perform-probe-formal-20261103-v5',
    'perform-probe-formal-20261104-v6', 'perform-probe-formal-20261109-gapfill',
    'perform-probe-formal-20261109-gapfill2', 'perform-probe-formal-20261109-gapfill3',
    'perform-probe-formal-20261114-chousui', 'perform-probe-formal-20261114-gapfill4',
    'perform-probe-formal-20261114-dispel', 'perform-probe-formal-20261115-gapfill5',
    'perform-probe-formal-20261115-gapfill6', 'perform-probe-formal-20261115-gapfill7'];
const CLASSES = ['normal_effect', 'miss_backlash', 'refused', 'unverified', 'no_contract'];
const CHANNELS = ['neili', 'qi_self', 'busy', 'qi_cost', 'eff_qi_cost', 'jing_cost'];

// 5.3 验证状态：series+slot -> unverified 结局（slot 键跨系列可能重名，必须带系列）；
// condition -> no_contract
const replay = json(`${A}/contract-replay.json`);
const failedSlot = new Map(replay.failures.map(f => [`${f.series.split(/[\\/]/).pop()}|${f.slot}`, f.outcome]));
const condVia = new Map(json(`${A}/failure-dispositions.json`).map(d => [d.condition, d.via]));
const noContract = new Set(replay.no_contract.map(x => x.condition));

const schoolOf = skill => {
    const map = [['gumu', '古墓'], ['emei', '峨嵋'], ['mingjiao', '明教'], ['huashan', '华山'],
        ['wudang', '武当'], ['shaolin', '少林'], ['quanzhen', '全真'], ['duan', '段氏'], ['taohua', '桃花']];
    for (const [k, v] of map) if (skill.includes(k)) return v;
    return '公共/无前缀';
};
const mm = (o, f, v) => { o[f] = { min: Math.min(o[f]?.min ?? Infinity, v), max: Math.max(o[f]?.max ?? -Infinity, v) }; };

const newBucket = () => ({ samples: 0, miss: 0, backlash: 0, byVia: {}, busy_unknown: 0 });
const entries = new Map(); // entry_id -> { usage, school, conds, counts per class, costs per class+envelope }
for (const name of SERIES) {
    const dir = `${E}/${name}`;
    const meta = json(`${dir}/series.json`);
    const usageBy = new Map(meta.identity.conditions.map(c => [c.id, { usage: c.parameters?.usage ?? '?', entry: c.entry_id }]));
    for (const f of readdirSync(`${dir}/samples`).filter(x => x.endsWith('.json'))) {
        const slot = f.replace(/\.json$/, '');
        const rec = json(`${dir}/samples/${f}`);
        const d = rec.raw ?? rec;
        const u = usageBy.get(rec.condition_id);
        if (!u) continue;
        const e = entries.get(u.entry) ?? {
            usage: u.usage, school: schoolOf(u.entry), conds: new Set(),
            counts: Object.fromEntries(CLASSES.map(c => [c, 0])), miss: 0, backlash: 0,
            byVia: {}, costs: {}, env: { samples: 0, busy_unknown: 0 },
        };
        e.conds.add(rec.condition_id);

        // 结局与验证分账（failedSlot 键 = 系列名|槽位，避免跨系列同名槽位误判）
        let cls;
        if (failedSlot.has(`${name}|${slot}`)) cls = 'unverified';
        else if (noContract.has(rec.condition_id)) cls = 'no_contract';
        else if (rec.outcome === 'refused') cls = 'refused';
        else if (rec.outcome === 'observed') {
            const outcome = cost_outcome(u.entry, d);
            cls = outcome === 'normal' ? 'normal_effect' : 'miss_backlash';
            if (outcome === 'miss') e.miss++;
            if (outcome === 'backlash') e.backlash++;
        } else cls = 'unverified'; // error/N/A 无样本文件，正常不会走到
        e.counts[cls]++;
        if (cls === 'unverified') {
            const via = condVia.get(rec.condition_id) ?? 'unknown';
            e.byVia[via] = (e.byVia[via] ?? 0) + 1;
        }

        // 通道增量（未观察通道跳过，不填零）
        const b0 = d.before?.[0] ?? {}, a0 = d.after?.[0] ?? {};
        const m1 = d.metrics?.[1] ?? {};
        const delta = {};
        if (b0.neili !== undefined && a0.neili !== undefined) delta.neili = a0.neili - b0.neili;
        if (b0.qi !== undefined && a0.qi !== undefined) delta.qi_self = a0.qi - b0.qi;
        if (typeof a0.busy === 'number') delta.busy = a0.busy;
        for (const ch of ['qi_cost', 'eff_qi_cost', 'jing_cost'])
            if (m1[ch] !== undefined && m1[ch] !== null) delta[ch] = m1[ch];
        const busyUnknown = typeof a0.busy !== 'number';

        for (const target of [e.costs[cls] ??= { samples: 0, busy_unknown: 0 }, e.env]) {
            target.samples++;
            if (busyUnknown) target.busy_unknown++;
            for (const ch of CHANNELS) if (delta[ch] !== undefined) mm(target, ch, delta[ch]);
        }
        entries.set(u.entry, e);
    }
}

// rollup per usage
const byUsage = {};
const totals = { all: 0, byClass: Object.fromEntries(CLASSES.map(c => [c, 0])), miss: 0, backlash: 0 };
const unverifiedByVia = {};
for (const e of entries.values()) {
    const g = byUsage[e.usage] ??= { entries: 0, entriesPerClass: Object.fromEntries(CLASSES.map(c => [c, 0])), miss: 0, backlash: 0, env: { samples: 0, busy_unknown: 0 } };
    g.entries++;
    for (const c of CLASSES) {
        if (e.counts[c]) g.entriesPerClass[c]++;
        totals.byClass[c] += e.counts[c];
        if (e.counts[c]) {
            const b = g[c] ??= { samples: 0, busy_unknown: 0 };
            b.samples += e.counts[c];
            const src = e.costs[c];
            if (src) {
                b.busy_unknown += src.busy_unknown ?? 0;
                for (const ch of CHANNELS) {
                    if (src[ch]) { mm(b, ch, src[ch].min); mm(b, ch, src[ch].max); }
                }
            }
        }
    }
    g.miss += e.miss; g.backlash += e.backlash;
    totals.miss += e.miss; totals.backlash += e.backlash;
    for (const [via, n] of Object.entries(e.byVia)) unverifiedByVia[via] = (unverifiedByVia[via] ?? 0) + n;
    totals.all += e.env.samples;
    g.env.samples += e.env.samples; g.env.busy_unknown += e.env.busy_unknown;
    for (const ch of CHANNELS) {
        if (e.env[ch]) { mm(g.env, ch, e.env[ch].min); mm(g.env, ch, e.env[ch].max); }
    }
}

const flat = [...entries.entries()].map(([id, e]) => ({
    id, usage: e.usage, school: e.school, samples: e.env.samples,
    conds: [...e.conds], counts: e.counts, miss: e.miss, backlash: e.backlash, byVia: e.byVia,
    costs: e.costs, env: e.env,
}));
writeFileSync(OUT, JSON.stringify({
    note: 'probe 正式 12 系列逐样本成本/伤害通道，按结局与 5.3 验证状态分账；envelope=全尝试观测包络，非正常使用成本',
    rules: {
        normal_effect: '5.3 验证通过的 observed，包含目标伤害/控制/恢复及自体增益等；正常气血费用不改变治疗成功分类，保护无效与源码反噬按 cost_outcome 分列',
        miss_backlash: 'verified observed：攻击无目标受效或 surge-force/roar 的保护/无伤害分支归 miss；tao 反噬须匹配源码分支和 living 1→0、qi 归零；正常自损费用不作反噬依据',
        refused: 'refused 且验证通过=资格/条件拒绝；通道为拒绝副作用，非施放成本',
        unverified: '5.3 重放失败槽位（via: entry-closure/superseded/special），另列不计正常成本',
        no_contract: '无契约槽位（MA-136 复现条件），另列',
        busy: 'after.busy 数值才记录；null=未观察，跳过不填零（busy_unknown 计数）',
    },
    totals, unverifiedByVia, byUsage, entries: flat,
}, null, 1));
console.log('entries:', entries.size, '| totals:', JSON.stringify(totals), '| unverifiedByVia:', JSON.stringify(unverifiedByVia));
for (const [u, g] of Object.entries(byUsage))
    console.log(u, JSON.stringify({ entries: g.entries, perClass: g.entriesPerClass, miss: g.miss, backlash: g.backlash, env: g.env.samples }));
