import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaBihaiConditions, taohuaBihaiSourcePaths, taohuaBihaiEffects } from './school_taohua_bihai_cases.mjs';
import { taohuaBihaiReport, schoolCombatMarkdown, readSchoolCombat } from './school_combat_report.mjs';
import { summarizeSamples } from './statistics.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const catalog = { skills: ['yuxiao-jian', 'yuxiao-jian/bihai'].map(id => {
    const path = `kungfu/skill/${id}.c`, source = read(path), parsed = scanSource(source);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: parsed.functions.filter(f => f.name === 'perform')
        .map(f => ({ id: `${path}:${f.line}:perform`, role: 'perform' })) };
}) };
const cases = taohuaBihaiConditions(catalog, read), smoke = taohuaBihaiConditions(catalog, read, { smoke: true });
const copy = structuredClone, skill = 'yuxiao-jian';
const pick = (variant = 'baseline', level = 200) => {
    const c = cases.find(c => c.parameters.variant === variant && c.parameters.level === level);
    assert.ok(c, `${variant}/${level}`); return c;
};

function item(config, side, slot) {
    if (!config) return {};
    const xiao = config.type === 'xsword';
    return { object: `/tests/${config.type}#${200 + side * 10 + slot}`, program: '/tests/' + config.type,
        skill_type: 'sword', weight: 3000, flag: 4, damage: xiao ? 45 : 50, consistence: 100,
        material: null, valid_as_xiao: xiao ? 1 : null, valid_as_xiao_source: xiao ? '/inherit/misc/_xiao' : null };
}
function snapshot(config, side, fighting) {
    const weapon = item(config.equipment, side, 1), handing = item(config.handing_equipment, side, 2);
    const apply = { armor: 100, ...(config.equipment ? { damage: weapon.damage, dodge: -1 } : {}) };
    const properties = Object.entries(config.properties);
    return { ...Object.fromEntries(properties.filter(([key]) => !key.includes('/'))),
        cultivation: Object.fromEntries(properties.filter(([key]) => key.includes('/'))),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: Number(fighting), busy: null, skills: copy(config.skills),
        mappings: copy(config.mappings), preparations: copy(config.preparations), learned: {}, temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: config.equipment ? 'sword' : 'none', weapon_damage: weapon.damage ?? 0,
        weapon_flag: weapon.flag ?? 0, weapon_details: weapon, secondary_weapon: 'none', secondary_weapon_details: {},
        handing: config.handing_equipment ? 'sword' : 'none', handing_details: handing };
}

// Synthetic protocol traces only: hand-checked reachable totals, no driver/RNG or real sample ledger.
function trace(condition, options = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: copy(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 });
        preparation.after = copy(before[1]);
    }
    const raw = { kind: 'sample', condition_id: condition.id, index: options.index ?? 0, method: 'perform',
        outcome: p.expected, before, immediate: copy(before), after: [], metrics: [{}, {}],
        command_accepted: accepted ? options.cost ?? 23 : 0, launches: [], refusals: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [], callbacks: [],
        elapsed: 0.01, reason: '', ...(preparation ? { preparation } : {}) };
    if (accepted) {
        const damage = options.damage ?? (p.level === 400 ? 1796 : p.level === 800 ? 3593 : {
            force0: 898, force2200: 0, minimum: 283, 'no-music-map': 100, 'target-music400': 140,
        }[p.variant] ?? 315);
        const wound = Math.trunc(2 * damage / 3), progress = options.progress ?? 1;
        raw.launches.push({ actor: before[0].object, skill, argument: 'bihai right' });
        raw.metrics[0] = { ability_launched: 1, neili_cost: 200 };
        raw.metrics[1] = { jing_cost: damage, eff_jing_cost: wound };
        raw.immediate[0].busy = options.busy ?? 2; raw.immediate[0].neili -= 200;
        raw.immediate[1].jing -= damage; raw.immediate[1].eff_jing -= wound;
        if (progress) raw.immediate[0].learned[skill] = progress;
    } else {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals.push({ actor: before[0].object, reason: raw.reason });
    }
    raw.after = copy(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, index: raw.index, outcome: raw.outcome, reason: raw.reason, raw });
const error = (condition, index = 0) => row({ kind: 'sample', condition_id: condition.id, index,
    method: condition.method, outcome: 'error', reason: '原记录 | <详情>\n下一行' });
function report(condition, rows) {
    const summary = taohuaBihaiReport(rows, condition);
    const result = summarizeSamples({ fingerprint: 'synthetic-only', versions: {},
        identity: { conditions: [condition], execution: { smoke: false } } }, rows);
    result.evidence_sha256 = 'synthetic-only';
    result.totals = { conditions: 1, samples: rows.length, observed: summary.counts.observed,
        refused: summary.counts.refused, errors: summary.counts.error };
    assert.deepEqual(result.conditions[0].counts, summary.counts);
    assert.equal(result.conditions[0].planned, summary.planned);
    result.conditions[0].effects = null; result.conditions[0].taohua_bihai = summary;
    return result;
}

test('固定23/732/46及36来源不变，全23合成通过冻结condition报告消费', () => {
    assert.equal(cases.length, 23); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 732);
    assert.equal(smoke.length, 23); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 46);
    assert.equal(taohuaBihaiSourcePaths.length, 36);
    assert.equal(hash(cases), 'd5046d8c95e6a655fccfb0b00c310515e5c192ea77cf9e5f2de9151a5e8b5794');
    assert.equal(hash(smoke), 'f90cc6ab9c72930625e7e814a34e381ffa4fbea7e9b15483cf493f60a8d9b3be');
    for (const condition of cases) {
        const rows = [row(trace(condition))], before = JSON.stringify({ condition, rows });
        const result = taohuaBihaiReport(rows, condition);
        assert.deepEqual(result.effects, taohuaBihaiEffects(rows, condition));
        assert.equal(result.planned, condition.samples); assert.equal(result.recorded, 1);
        assert.equal(result.missing, condition.samples - 1); assert.equal(result.counts[condition.parameters.expected], 1);
        assert.equal(Object.hasOwn(rows[0].raw, 'parameters'), false);
        assert.equal(JSON.stringify({ condition, rows }), before, '统计不改写条件或原记录');
    }
});

test('总精神正值与零值独立，执行成本不当次数或200内力费用', () => {
    const c = pick('no-music-map'), rows = [
        row(trace(c, { damage: 100, busy: 1, progress: 1, cost: 23 })),
        row(trace(c, { index: 1, damage: 0, busy: 3, progress: 0, cost: 476 })),
    ];
    rows[0].raw.parameters = { actor: {}, target: {}, level: 9999 };
    const s = taohuaBihaiReport(rows, c), e = s.effects;
    assert.equal(s.commands.accepted, 2); assert.equal(s.commands.accepted_execution_cost.mean, 249.5);
    assert.equal(s.commands.acceptance.successes, 2); assert.equal(s.commands.acceptance.trials, 2);
    assert.equal(e.accepted_samples, 2); assert.equal(e.positive_effect.successes, 1);
    assert.equal(e.positive_effect.trials, 2); assert.equal(e.positive_effect.rate, 0.5); assert.equal(e.zero_effects, 1);
    assert.equal(e.jing_damage.mean, 50); assert.equal(e.jing_wound.mean, 33);
    assert.equal(e.actor_neili_cost.mean, 200); assert.equal(e.target_neili_cost.mean, 0);
    assert.deepEqual(e.busy_histogram, { 1: 1, 2: 0, 3: 1 }); assert.equal(e.busy.mean, 2);
    assert.equal(e.learned_progress.rate, 0.5); assert.equal(e.learned_delta.mean, 0.5);
    for (const item of rows) assert.equal(item.raw.immediate[1].neili, item.raw.before[1].neili);
});

test('高防原总效果0仍扣200并可增长，最低内力300剩100', () => {
    const zero = pick('force2200'), z = taohuaBihaiReport([row(trace(zero))], zero);
    assert.equal(z.effects.zero_effects, 1); assert.equal(z.effects.positive_effect.rate, 0);
    assert.equal(z.effects.jing_damage.mean, 0); assert.equal(z.effects.jing_wound.mean, 0);
    assert.equal(z.effects.actor_neili_cost.mean, 200); assert.equal(z.effects.learned_progress.rate, 1);
    const low = pick('neili300'), raw = trace(low), s = taohuaBihaiReport([row(raw)], low);
    assert.equal(raw.immediate[0].neili, 100); assert.equal(s.effects.actor_neili_cost.mean, 200);
});

test('全部11种拒绝含原昏迷准备，已知零命令成本不混受理效果分母', () => {
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) {
        const raw = trace(c), s = taohuaBihaiReport([row(raw)], c);
        assert.equal(s.commands.refused, 1); assert.equal(s.commands.refused_execution_cost.mean, 0);
        assert.equal(s.commands.acceptance.rate, 0); assert.equal(s.effects.refused_samples, 1);
        assert.equal(s.effects.accepted_samples, 0); assert.equal(s.effects.positive_effect.rate, null);
        assert.equal(s.effects.actor_neili_cost.mean, null); assert.equal(s.effects.actor_neili_cost.n, 0);
        assert.equal(s.effects.jing_damage.n, 0); assert.equal(s.effects.learned_delta.n, 0);
        assert.deepEqual(s.refusals, [{ index: 0, reason: raw.reason }]);
    }
    const c = pick('unconscious-target'), raw = trace(c);
    delete raw.preparation;
    assert.throws(() => taohuaBihaiReport([row(raw)], c), '缺准备不能假定初态或补损失');
});

test('错误/空集合保留未知及缺样本，错误不变成零效果或零费用', () => {
    const c = pick(), e = error(c), bytes = JSON.stringify(e);
    for (const rows of [[], [e]]) {
        const s = taohuaBihaiReport(rows, c);
        assert.equal(s.recorded, rows.length); assert.equal(s.missing, c.samples - rows.length);
        assert.equal(s.effects.unknown_effect_samples, rows.length);
        assert.equal(s.effects.actor_neili_cost.n, 0); assert.equal(s.effects.actor_neili_cost.mean, null);
        assert.equal(s.effects.positive_effect.rate, null); assert.equal(s.commands.acceptance.rate, null);
        assert.equal(s.commands.accepted_execution_cost.n, 0); assert.equal(s.effects.zero_effects, 0);
    }
    assert.equal(JSON.stringify(e), bytes);
    const mixed = taohuaBihaiReport([row(trace(c)), error(c, 1)], c);
    assert.equal(mixed.effects.positive_effect.trials, 1); assert.equal(mixed.effects.actor_neili_cost.n, 1);
    assert.equal(mixed.effects.unknown_effect_samples, 1);
    const na = error(c); na.outcome = na.raw.outcome = 'not_applicable';
    assert.throws(() => taohuaBihaiReport([na], c), '原计划无未适用条件');
});

test('逐条包层/raw的身份、方法、index、结果和理由同源，错误也不能绕过', () => {
    for (const c of [pick(), pick('no-grant')]) for (const make of [c => row(trace(c)), error]) {
        const changes = [r => r.condition_id = 'foreign', r => r.raw.condition_id = 'foreign',
            r => delete r.condition_id, r => delete r.raw.condition_id, r => r.raw = null,
            r => r.raw.kind = 'other', r => r.raw.method = 'play', r => r.raw.index++,
            r => delete r.raw.index, r => r.raw.outcome = 'foreign', r => r.outcome = 'foreign',
            r => delete r.outcome, r => r.raw.reason += 'foreign', r => r.reason = null,
            r => delete r.reason, r => delete r.raw.reason];
        for (const change of changes) {
            const r = make(c); change(r); assert.throws(() => taohuaBihaiReport([r], c));
        }
    }
    for (const reason of ['', ' ', null, 0, undefined]) {
        const r = error(pick()); r.reason = r.raw.reason = reason;
        assert.throws(() => taohuaBihaiReport([r], pick()));
    }
});

test('索引范围与重复严格，传统计summary而非原condition必须拒绝', () => {
    const c = pick(), r = row(trace(c));
    assert.throws(() => taohuaBihaiReport([r, copy(r)], c));
    for (const index of [undefined, null, '0', -1, 0.5, c.samples, NaN, Infinity]) {
        const item = copy(r); item.index = item.raw.index = index;
        assert.throws(() => taohuaBihaiReport([item], c));
    }
    const summary = copy(c); delete summary.samples; summary.planned = c.samples;
    assert.throws(() => taohuaBihaiReport([r], summary));
    const holes = taohuaBihaiReport([row(trace(c, { index: c.samples - 1 }))], c);
    assert.equal(holes.missing, c.samples - 1);
});

test('空样本仍锁原入口/来源/窗口；不将未知绑定或错误scope作为零结果', () => {
    const changes = [c => c.parameters.collection_group = 'taohua-xiao', c => c.parameters.school = 'gumu',
        c => c.parameters.family = '古墓派', c => c.id = '', c => c.samples = 0,
        c => c.method = 'play', c => c.parameters.skill = 'bihai-chaosheng', c => c.parameters.ability = 'xiao',
        c => c.parameters.usage = 'finger', c => c.parameters.action = 'play bihai-chaosheng',
        c => c.entry_id = 'foreign:8:perform', c => c.parameters.ability_source.entry_id = 'foreign',
        c => c.parameters.ability_source.path = 'foreign.c', c => c.parameters.base_source.path = 'foreign.c',
        c => c.parameters.base_source.sha256 = null, c => c.parameters.ability_source.sha256 = '0'.repeat(64),
        c => delete c.parameters.source_evidence, c => c.parameters.observe_seconds = 1,
        c => c.parameters.observation = 'natural', c => c.parameters.expected = 'not_applicable',
        c => c.parameters.not_applicable = 'fallback', c => c.parameters.named_participants = false,
        c => c.parameters.fighting = 1, c => c.parameters.target_state = 'dead'];
    for (const change of changes) {
        const c = copy(pick()); change(c); assert.throws(() => taohuaBihaiReport([], c));
    }
});

test('报告调用原校验：缺费用/假毛账/错误精神取整/假受理及装备未知不能吞掉', () => {
    const c = pick(), changes = [r => delete r.command_accepted, r => r.command_accepted = null,
        r => r.command_accepted = 0, r => r.command_accepted = 1.5,
        r => delete r.metrics[0].neili_cost, r => r.metrics[0].neili_cost = null,
        r => { r.metrics[0].neili_cost++; r.metrics[0].neili_recovery = 1; },
        r => { r.metrics[1].neili_cost = 1; r.immediate[1].neili--; },
        r => { r.metrics[1].eff_jing_cost++; r.immediate[1].eff_jing--; },
        r => { r.metrics[1].qi_cost = 1; r.immediate[1].qi--; },
        r => r.immediate[0].learned[skill] = 2, r => r.metrics[0].hit = 1,
        r => delete r.before[0].handing_details.valid_as_xiao, r => r.before[0].playerp = 0,
        r => r.immediate[0].handing_details.consistence--];
    for (const change of changes) {
        const raw = trace(c); change(raw); raw.after = copy(raw.immediate);
        assert.throws(() => taohuaBihaiReport([row(raw)], c));
    }
});

test('弱熟练仅按已受理实际进度统计，180/200与400/800原门槛不放宽', () => {
    for (const c of [pick(), pick('minimum', 180)]) {
        const s = taohuaBihaiReport([row(trace(c, { progress: 0 })), row(trace(c, { progress: 1, index: 1 }))], c);
        assert.equal(s.effects.learned_progress.rate, 0.5); assert.equal(s.effects.learned_progress.trials, 2);
    }
    for (const level of [400, 800]) {
        const c = pick('baseline', level), s = taohuaBihaiReport([row(trace(c))], c);
        assert.equal(s.effects.learned_delta.mean, 1);
        assert.throws(() => taohuaBihaiReport([row(trace(c, { progress: 0 }))], c));
    }
});

test('Markdown精神专节分母明确、不误套通用气血表，错误文本转义且不伪零', () => {
    const c = pick('no-music-map'), rows = [row(trace(c, { damage: 100 })),
        row(trace(c, { damage: 0, progress: 0, index: 1 })), error(c, 2)];
    const data = report(c, rows), before = JSON.stringify(data);
    const md = schoolCombatMarkdown(data);
    assert.equal(JSON.stringify(data), before);
    assert.match(md, /## 桃花岛·碧海潮生按玉箫：即时总精神效果/);
    assert.match(md, /精神损失\/有效精神创伤：受理分布/);
    assert.match(md, /总效果正值\/受理；零值次数/);
    assert.match(md, /1\/2；50\.00%/);
    assert.match(md, /自身即时忙乱：分布；1\/2\/3次数/);
    assert.match(md, /弱熟练增量；增长\/受理/);
    assert.match(md, /四段内部随机判定未逐段观察/);
    assert.match(md, /内力保持不变，并非归零/);
    assert.match(md, /原命令正整数是执行成本，不是受理次数或内力费用/);
    assert.match(md, /原记录 \\\| &lt;详情&gt;<br>下一行/);
    const generic = md.slice(0, md.indexOf('## 桃花岛·碧海潮生按玉箫'));
    assert.equal(generic.split('\n').some(line => line.startsWith(`| ${c.id} |`)), false);
    const unknown = schoolCombatMarkdown(report(c, [error(c)]));
    assert.match(unknown, /未知（分母0）/); assert.match(unknown, /未观察（n=0，未知=0）/);
    assert.equal(unknown.includes('NaN'), false); assert.equal(unknown.includes('undefined'), false);
});

test('共享consumer使用原冻结condition且排除通用效果，正式reader继续拒绝smoke', () => {
    const source = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(source, /condition\.taohua_bihai = taohuaBihaiReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\);/);
    assert.match(source, /else if \(condition\.parameters\.collection_group === 'taohua-bihai'\) condition\.effects = null;/);
    assert.match(source, /report\.conditions\.filter\(c => !c\.taohua_combo && !c\.taohua_bihai &&/);
    assert.match(readSchoolCombat.toString(), /assert\.equal\(manifest\.identity\.execution\.smoke, false, '烟雾不是完整统计'\)/);
});
