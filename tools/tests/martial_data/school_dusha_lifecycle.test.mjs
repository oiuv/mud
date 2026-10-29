import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { dushaLifecycleConditions, validateDushaLifecycleRecord } from './school_dusha_lifecycle_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root)), cases = dushaLifecycleConditions(catalog, read);
const find = suffix => cases.find(c => c.id.endsWith(suffix));
function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, i) => ({
        ...structuredClone(cfg.properties), id: i ? 'right' : 'left',
        object: '/tests/actor#' + i, userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0,
        ghost: 0, busy: null, weapon: 'none', handing: 'none', conditions: null,
        skills: structuredClone(cfg.skills), mappings: {}, preparations: {},
        effective_skills: { force: Math.trunc(cfg.skills.force / 2) },
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/'))),
        temp: { ...cfg.temp },
    }));
    const immediate = structuredClone(before), m = [{}, {}], metrics = [{}, {}];
    const seeded = !!p.seed_incoming && !before[0].cultivation['special_skill/piyi'];
    const poison = { level: 10, remain: p.ticks === 2 ? 40 : 10, id: 'right', name: '砂毒' };
    if (seeded) immediate[0].conditions = { sha_poison: poison };
    const result = seeded ? '$n忽然感到一股莫名的恶心，全身瘫软，嘴皮乌紫。\n' : null;
    const r = { before, immediate, after: structuredClone(immediate), method: 'condition', outcome: 'observed',
        attacks: [], directs: [], interfaces: [], launches: [], dropped: [],
        passives: [{ route: 'interface', actor: 1, target: 0, skill: p.skill, incoming: p.seed_incoming, factor: 0, result }],
        immediate_metrics: m, metrics, condition_terminal: p.expected_terminal,
        condition_lifecycle_complete: Number(p.expected_terminal === 'removed'),
        condition_seed: { object: '/kungfu/skill/dusha-zhang', function: 'hit_ob',
            function_owner: '/kungfu/skill/dusha-zhang', actor: 1, target: 0, incoming: p.seed_incoming,
            factor: 0, seeded: Number(seeded), state: seeded ? structuredClone(poison) : null,
            result, before: structuredClone(before), after: structuredClone(immediate) },
        condition_events: [], condition_heartbeats: [], elapsed: 2 };
    let current = structuredClone(immediate[0]);
    for (let i = 0; i < p.ticks; i++) {
        const pre = { phase: 'before', name: 'sha_poison', daemon: '/kungfu/condition/sha_poison',
            state: structuredClone(current), elapsed: 2 + i * 10 };
        const immune = current.cultivation['immune/poison'], blocked = !!current.temp.nopoison;
        if (!blocked && immune !== -1) for (const kind of ['qi', 'jing']) {
            current[kind] -= 5; current['eff_' + kind] -= 2;
            metrics[0][kind + '_cost'] = (metrics[0][kind + '_cost'] ?? 0) + 5;
            metrics[0]['eff_' + kind + '_cost'] = (metrics[0]['eff_' + kind + '_cost'] ?? 0) + 2;
        }
        const clear = blocked || immune === -1 || immune === 100;
        if (!blocked && immune === -1) current.conditions.sha_poison.remain = 0;
        if (!blocked && immune === 100) current.conditions.sha_poison.remain -= 100;
        const post = { phase: 'after', name: 'sha_poison', daemon: '/kungfu/condition/sha_poison',
            state: structuredClone(current), elapsed: pre.elapsed + 0.01, flag: clear ? 0 : 3 };
        if (clear) current.conditions = null;
        r.condition_events.push(pre, post);
        r.condition_heartbeats.push({ state: structuredClone(current), elapsed: pre.elapsed + 0.02 });
        r.elapsed = pre.elapsed + 0.03; metrics[0].heartbeats = i + 1;
    }
    r.after[0] = structuredClone(current); return r;
}
test('独立砂毒6条件110正式/12烟雾，旧本体前缀不包含生命周期', () => {
    assert.equal(cases.length, 6); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 110);
    assert.equal(dushaLifecycleConditions(catalog, read, { smoke: true }).reduce((s, c) => s + c.samples, 0), 12);
    const all = schoolCombatConditions(catalog);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 's1-dusha-lifecycle'), cases);
    assert.equal(all.filter(c => c.id.startsWith('school-s1-dusha-')).length, 39);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    assert.throws(() => dushaLifecycleConditions(catalog, path => read(path) + ' '), /重新审阅/);
});
test('原回调种毒有精确归属/参数/毒量，不能用预置状态或额外攻击冒充', () => {
    const c = find('resistance100');
    for (const mutate of [r => { r.condition_seed.function_owner = '/fake'; },
        r => { r.passives[0].actor = 0; }, r => { r.condition_seed.incoming = 0; },
        r => { r.condition_seed.state.level = 20; }, r => { r.attacks.push({}); },
        r => { r.metrics[1].heartbeats = 1; }, r => { r.before[0].wizardp = 1; }]) {
        const r = row(c); mutate(r); assert.throws(() => validateDushaLifecycleRecord(r, c));
    }
});
test('正常毒伤/创伤与清除后恢复分账，回调瞬态负毒量和真实心跳不能缺失', () => {
    const c = find('resistance100');
    for (const mutate of [r => { r.condition_events[1].state.qi = 10000; },
        r => { r.condition_events[1].state.conditions.sha_poison.remain = 10; },
        r => { r.metrics[0].qi_cost = 0; }, r => { r.metrics[0].heartbeats = 0; },
        r => { r.condition_events[1].daemon = '/fake'; }, r => { r.condition_terminal = 'tick_limit'; }]) {
        const r = row(c); mutate(r); assert.throws(() => validateDushaLifecycleRecord(r, c));
    }
});
test('piyi/零伤无种毒不造心跳；免疫/护毒清除与无抗力两次未清分开', () => {
    for (const suffix of ['piyi', 'zero-incoming']) {
        const c = find(suffix), r = row(c); validateDushaLifecycleRecord(r, c);
        r.condition_seed.state = 0; validateDushaLifecycleRecord(r, c);
        r.condition_lifecycle_complete = 1; assert.throws(() => validateDushaLifecycleRecord(r, c));
    }
    for (const suffix of ['full-immunity', 'nopoison']) {
        const c = find(suffix), r = row(c); validateDushaLifecycleRecord(r, c);
        r.condition_events[1].state.qi--; assert.throws(() => validateDushaLifecycleRecord(r, c));
    }
    const c = find('no-resistance-two-ticks'), r = row(c); validateDushaLifecycleRecord(r, c);
    r.condition_events[2].elapsed = 0; assert.throws(() => validateDushaLifecycleRecord(r, c));
});
