import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaDirectMoves, taohuaDirectConditions, taohuaDirectBounds,
    taohuaDirectEffects } from './school_taohua_direct_cases.mjs';
import { taohuaDirectReport, schoolCombatEffects, schoolCombatMarkdown } from './school_combat_report.mjs';
import { summarizeSamples } from './statistics.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const ids = [...new Set(taohuaDirectMoves.flatMap(d => [d.skill, `${d.skill}/${d.ability}`]))];
const catalog = { skills: ids.map(id => {
    const path = `kungfu/skill/${id}.c`, source = read(path), scanned = scanSource(source);
    assert.deepEqual(scanned.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: scanned.functions.filter(f => f.name === 'perform')
        .map(f => ({ id: `${path}:${f.line}:perform`, role: 'perform' })) };
}) };
const cases = taohuaDirectConditions(catalog, read);
const smoke = taohuaDirectConditions(catalog, read, { smoke: true });
const pick = (ability = 'tao', variant = 'baseline', level = 200) => {
    const c = cases.find(c => c.parameters.ability === ability && c.parameters.variant === variant && c.parameters.level === level);
    assert.ok(c, `${ability} ${variant} ${level}`); return c;
};

function snapshot(config, side) {
    const equipped = !!config.equipment, cultivationKey = k => k.includes('/') || k === 'character';
    const apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    const unarmed = Math.max(...['unarmed', 'finger', 'strike', 'hand', 'claw', 'cuff'].map(k => config.skills[k] ?? 0));
    return { ...Object.fromEntries(Object.entries(config.properties).filter(([k]) => !cultivationKey(k))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([k]) => cultivationKey(k))),
        object: `/tests/actor#${side + 100}`, id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0, fighting_opponent: 1,
        busy: null, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations), learned: {}, temp: { apply },
        effective_str: config.properties.str + Math.trunc(unarmed / 10),
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([k, n]) => [k,
            Math.trunc(n / 2) + (config.skills[config.mappings[k]] ?? 0) + (apply[k] ?? 0)])),
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0, weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { object: `/tests/sword#${side + 200}`, program: '/tests/sword',
            skill_type: 'sword', damage: 50, flag: 4, weight: 3000, consistence: 100,
            material: null, rigidity: null, no_wield: null } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

// Synthetic source-shaped examples, not driver samples or measured damage data.
function trace(c, { index = 0, hit, cost = 23, wear = false, progress = 1 } = {}) {
    const p = c.parameters, d = taohuaDirectMoves.find(d => d.skill === p.skill && d.ability === p.ability);
    const accepted = p.expected === 'observed', before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const raw = { kind: 'sample', condition_id: c.id, index, method: 'perform', outcome: p.expected,
        command_accepted: accepted ? cost : 0, before, immediate: structuredClone(before), after: [],
        metrics: [{}, {}], launches: [], refusals: [], directs: [], attacks: [], dropped: [], terminals: [],
        callbacks: [], passives: [], defenses: [], interfaces: [], dodge_checks: [], reason: '', elapsed: 0.01 };
    if (accepted) {
        const bounds = taohuaDirectBounds(...before, d); hit ??= bounds.hit_numerator > 0;
        raw.launches = [{ actor: before[0].object, skill: d.skill, argument: d.ability + ' right' }];
        raw.metrics[0].ability_launched = 1;
        raw.metrics[0].neili_cost = hit ? d.hitFee : d.missFee;
        raw.immediate[0].neili -= raw.metrics[0].neili_cost;
        raw.immediate[0].busy = hit ? 2 : d.ability === 'tian' ? 2 : 3;
        if (progress) raw.immediate[0].learned[d.skill] = progress;
        if (hit) {
            const input = bounds.input_min;
            raw.directs = [{ actor: 0, target: 1, type: d.usage === 'sword' ? 1 : 0, damage: input,
                percent: d.percent, weapon: d.usage === 'sword' ? 'sword' : 'none',
                weapon_object: d.usage === 'sword' ? before[0].weapon_details.object : '' }];
            raw.metrics[0].direct = 1;
            // One legal neutral branch: no intellect proc and zero armor roll.
            let damage = input + (d.usage === 'sword' ? 50 : 0);
            const strength = before[0].str * 2 + before[0].effective_str;
            damage += Math.trunc(damage * (Math.trunc((strength - 60) / 4) + 30) / 50);
            if (damage > 1500) damage = Math.trunc((damage - 1500) / 4) + 1000;
            else if (damage > 500) damage = Math.trunc((damage - 500) / 2) + 500;
            let wound = Math.trunc(damage * d.percent / 100);
            wound -= Math.trunc(wound * 20 / 100); wound -= Math.trunc(wound * 26 / 100);
            Object.assign(raw.metrics[1], { qi_cost: damage, eff_qi_cost: wound });
            raw.immediate[1].qi -= damage; raw.immediate[1].eff_qi -= wound;
            if (d.ability === 'zhuan') raw.immediate[1].busy = 2;
            if (wear && d.ability === 'tian') raw.immediate[0].weapon_details.consistence--;
        }
    } else {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals = [{ actor: before[0].object, reason: raw.reason }];
        raw.immediate[0].temp.notify_fail = raw.reason;
    }
    raw.after = structuredClone(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, index: raw.index,
    outcome: raw.outcome, reason: raw.reason, raw });
const error = (c, index = 0) => row({ kind: 'sample', condition_id: c.id, index,
    method: 'perform', outcome: 'error', reason: '原错误 | <详情>\n第二行' });
function report(c, rows) {
    const s = taohuaDirectReport(rows, c);
    const result = summarizeSamples({ fingerprint: 'synthetic', versions: {},
        identity: { conditions: [c], execution: { smoke: false } } }, rows);
    result.evidence_sha256 = 'synthetic-only';
    result.totals = { conditions: 1, samples: rows.length, observed: s.counts.observed,
        refused: s.counts.refused, errors: s.counts.error };
    const summary = result.conditions[0];
    assert.deepEqual(summary.counts, s.counts); assert.equal(summary.planned, s.planned);
    assert.equal(summary.recorded, s.recorded); assert.equal(summary.missing, s.missing);
    summary.effects = schoolCombatEffects(rows); summary.taohua_direct = s;
    return result;
}

test('固定41/1650/41矩阵不变，全部原条件经报告消费而非只测受理', () => {
    assert.equal(cases.length, 41); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1650);
    assert.equal(smoke.length, 41); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 41);
    assert.equal(hash(cases), '8014b5cd664eb8ebf146106533b2913e190b5c3347092e4dd924be8073d394b0');
    assert.equal(hash(smoke), '7d13af9641c8fd82953e97df131662b1e24038e8d41dbf943d89eb6be6f95942');
    for (const c of cases) {
        const rows = [row(trace(c))], original = JSON.stringify(rows), s = taohuaDirectReport(rows, c);
        assert.equal(s.recorded, 1); assert.equal(s.counts[c.parameters.expected], 1);
        assert.deepEqual(s.effects, taohuaDirectEffects(rows, c));
        assert.equal(Object.hasOwn(rows[0].raw, 'parameters'), false);
        assert.equal(JSON.stringify(rows), original);
        assert.doesNotThrow(() => schoolCombatMarkdown(report(c, rows)));
    }
});

test('consumer传原冻结condition，summary的planned不冒充samples或入口绑定', () => {
    const source = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(source, /condition\.taohua_direct = taohuaDirectReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\)/);
    for (const mutate of [c => { c.planned = c.samples; delete c.samples; },
        c => c.samples = 0, c => c.samples = 1.5, c => c.method = 'attack',
        c => c.parameters.collection_group = 'taohua-zhuan', c => c.parameters.skill = 'tanzhi-shentong',
        c => c.parameters.ability = 'ding', c => c.parameters.usage = 'sword',
        c => c.parameters.action = 'perform finger.tao missing', c => c.parameters.observe_seconds = 1,
        c => c.parameters.observation = 'natural_bout', c => c.parameters.expected = 'not_applicable',
        c => c.parameters.not_applicable = 'skip']) {
        const c = structuredClone(pick()); mutate(c);
        assert.throws(() => taohuaDirectReport([], c));
    }
});

test('四招命中入参只含命中，实际损血/创伤和技能费用含所有受理含失手', () => {
    for (const d of taohuaDirectMoves) {
        const c = pick(d.ability), a = trace(c), b = trace(c, { index: 1, hit: false });
        const rows = [row(a), row(b), error(c, 2)], s = taohuaDirectReport(rows, c), e = s.effects;
        assert.deepEqual(s.counts, { observed: 2, refused: 0, error: 1, not_applicable: 0 });
        assert.equal(e.validated, 2); assert.equal(e.unknown_or_unobserved, 1);
        assert.equal(e.hit_when_accepted.trials, 2); assert.equal(e.hit_when_accepted.successes, 1);
        assert.equal(e.direct_input_when_hit.n, 1); assert.equal(e.direct_input_when_hit.mean, a.directs[0].damage);
        assert.equal(e.qi_damage.n, 2); assert.equal(e.qi_damage.mean, a.metrics[1].qi_cost / 2);
        assert.equal(e.qi_wound.n, 2); assert.equal(e.qi_wound.mean, a.metrics[1].eff_qi_cost / 2);
        assert.notEqual(e.direct_input_when_hit.mean, a.metrics[1].qi_cost);
        assert.equal(e.actor_neili_cost.mean, (d.hitFee + d.missFee) / 2);
        assert.equal(e.learned_delta.n, 2); assert.equal(e.learned_delta.mean, 1);
        assert.equal(s.commands.accepted_execution_cost.mean, 23);
        const md = schoolCombatMarkdown(report(c, rows));
        assert.match(md, /1\/2；50\.00%/); assert.match(md, /实际气血\/创伤：受理分布/);
        assert.match(md, /原错误 \\\| &lt;详情&gt;<br>第二行/);
    }
});

test('原命令成本1/23/476只计三次受理，不当作内力费或命中数', () => {
    const c = pick(), rows = [1, 23, 476].map((cost, index) => row(trace(c, { cost, index })));
    const s = taohuaDirectReport(rows, c);
    assert.equal(s.effects.accepted, 3); assert.equal(s.effects.hit_when_accepted.trials, 3);
    assert.equal(s.commands.accepted_execution_cost.mean, 500 / 3);
    assert.equal(s.effects.actor_neili_cost.mean, 80);
    for (const cost of [null, undefined, false, true, '23', -1, 0, 0.5, NaN, Infinity]) {
        const raw = trace(c); raw.command_accepted = cost;
        assert.throws(() => taohuaDirectReport([row(raw)], c));
    }
});

test('天外清音普通剑只统计命中耐久，非剑和无命中不造零值', () => {
    const c = pick('tian'), rows = [row(trace(c, { wear: true })), row(trace(c, { index: 1 })),
        row(trace(c, { index: 2, hit: false }))];
    const s = taohuaDirectReport(rows, c);
    assert.equal(s.ordinary_sword_wear_when_hit.n, 2);
    assert.equal(s.ordinary_sword_wear_when_hit.mean, 0.5);
    const miss = taohuaDirectReport([row(trace(c, { hit: false }))], c);
    assert.equal(miss.ordinary_sword_wear_when_hit.n, 0);
    assert.equal(miss.ordinary_sword_wear_when_hit.mean, null);
    assert.equal(taohuaDirectReport([row(trace(pick()))], pick()).ordinary_sword_wear_when_hit, null);
    for (const mutate of [r => delete r.immediate[0].weapon_details.consistence,
        r => r.immediate[0].weapon_details.consistence = null,
        r => r.immediate[0].weapon_details.consistence = 98,
        r => r.immediate[0].weapon_details.damage++, r => r.immediate[0].weapon_details.object = '/other',
        r => r.passives.push({ actor: 0, target: 1, route: 'weapon' })]) {
        const raw = trace(c); mutate(raw); raw.after = structuredClone(raw.immediate);
        assert.throws(() => taohuaDirectReport([row(raw)], c));
    }
    const badMiss = trace(c, { hit: false }); badMiss.immediate[0].weapon_details.consistence = 99;
    badMiss.after = structuredClone(badMiss.immediate);
    assert.throws(() => taohuaDirectReport([row(badMiss)], c));
});

test('保证失手的高防御条件保留实际费用、零损伤与未知命中输入', () => {
    for (const d of taohuaDirectMoves) {
        const c = pick(d.ability, 'high-defense'), s = taohuaDirectReport([row(trace(c))], c);
        assert.equal(s.effects.hit_when_accepted.rate, 0);
        assert.equal(s.effects.direct_input_when_hit.mean, null);
        assert.equal(s.effects.qi_damage.mean, 0); assert.equal(s.effects.qi_wound.mean, 0);
        assert.equal(s.effects.actor_neili_cost.mean, d.missFee);
    }
});

test('缺样/错误/全拒绝保留空分母，拒绝命令0不替代正常效果', () => {
    const c = pick();
    for (const rows of [[], [error(c)]]) {
        const s = taohuaDirectReport(rows, c);
        assert.equal(s.missing, c.samples - rows.length);
        assert.equal(s.effects.hit_when_accepted.rate, null);
        assert.equal(s.effects.qi_damage.mean, null); assert.equal(s.effects.actor_neili_cost.mean, null);
        assert.equal(s.commands.accepted_execution_cost.mean, null);
        const md = schoolCombatMarkdown(report(c, rows));
        assert.match(md, /未知（分母0）/); assert.doesNotMatch(md, /0\/0；0\.00%/);
    }
    const refused = pick('tao', 'low-skill'), rows = [row(trace(refused))];
    const s = taohuaDirectReport(rows, refused);
    assert.equal(s.effects.refused, 1); assert.equal(s.effects.accepted, 0);
    assert.equal(s.commands.refused_execution_cost.mean, 0); assert.equal(s.effects.actor_neili_cost.mean, null);
    assert.equal(s.refusals[0].reason, rows[0].reason);
    rows[0].raw.command_accepted = 23;
    assert.throws(() => taohuaDirectReport(rows, refused));
});

test('所有结果先核外层/raw身份索引结果理由，错误和拒绝不豁免', () => {
    for (const [c, original] of [[pick(), row(trace(pick()))], [pick(), error(pick())],
        [pick('tao', 'low-skill'), row(trace(pick('tao', 'low-skill')))]]) {
        for (const mutate of [r => delete r.condition_id, r => r.condition_id = 'foreign',
            r => r.condition_id = null, r => delete r.raw, r => r.raw.condition_id = 'foreign',
            r => r.raw.method = 'attack', r => delete r.index, r => r.index = -1,
            r => r.index = c.samples, r => r.index = 0.5, r => r.raw.index = 1,
            r => r.outcome = 'not_applicable', r => r.raw.outcome = 'foreign',
            r => delete r.reason, r => r.reason = null, r => r.raw.reason = 'other']) {
            const bad = structuredClone(original); mutate(bad);
            assert.throws(() => taohuaDirectReport([bad], c));
        }
        assert.throws(() => taohuaDirectReport([original, structuredClone(original)], c));
    }
    const bad = error(pick()); bad.reason = ''; bad.raw.reason = '';
    assert.throws(() => taohuaDirectReport([bad], pick()));
});

test('报告不填补缺失/null资源计数，不接受额外普通攻击或错误direct归属', () => {
    const c = pick();
    for (const mutate of [r => delete r.metrics, r => r.metrics[0] = null,
        r => r.metrics[1].qi_cost = null, r => delete r.metrics[1].qi_cost,
        r => r.metrics[1].eff_qi_cost++, r => r.metrics[0].neili_cost++,
        r => r.directs[0].actor = 1, r => r.directs[0].target = 0,
        r => r.directs[0].damage = null, r => r.directs[0].percent++,
        r => r.metrics[0].hit = 1, r => r.metrics[1].dodge = 1, r => r.metrics[0].parry = 1,
        r => r.immediate[0].learned[c.parameters.skill] = 2]) {
        const raw = trace(c); mutate(raw); raw.after = structuredClone(raw.immediate);
        const original = JSON.stringify(raw);
        assert.throws(() => taohuaDirectReport([row(raw)], c));
        assert.equal(JSON.stringify(raw), original);
    }
    const raw = trace(c), before = JSON.stringify(raw), original = taohuaDirectReport([row(raw)], c);
    raw.parameters = { actor: { skills: { finger: 99999 } }, expected: 'refused', ability: 'tian' };
    assert.deepEqual(taohuaDirectReport([row(raw)], c), original);
    delete raw.parameters; assert.equal(JSON.stringify(raw), before);
});

test('Markdown专用两表不借generic sides，明确所有分母与普通剑非武学被动', () => {
    for (const c of [pick(), pick('tian'), pick('tao', 'low-skill')]) {
        const result = report(c, [row(trace(c))]);
        result.conditions[0].sides = null; result.conditions[0].effects = null;
        const md = schoolCombatMarkdown(result);
        const split = md.indexOf('## 桃花岛·四项直伤'); assert.ok(split > 0);
        assert.equal(md.slice(0, split).includes('| ' + c.id + ' |'), false);
        assert.equal(md.split('| ' + c.id + ' |').length - 1, 2);
        assert.match(md, /直伤入参不等于最终损血/); assert.match(md, /受理分布包含原失手的零伤害/);
        assert.match(md, /不是玉箫剑法被动/); assert.match(md, /不是实测解除秒数/);
        assert.match(md, /不作强弱排名/);
    }
});
