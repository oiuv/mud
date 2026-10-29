// Controlled original hit_ob seeding followed only by actual USER heartbeats.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { dushaMemberSources } from './school_dusha_member_cases.mjs';
import { validateGumuPoisonTick } from './school_gumu_poison_cases.mjs';

const name = 'sha_poison', skill = 'dusha-zhang';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 30, int: 36, con: 30, dex: 30, gender: '男性', 'immune/poison': 0, 'special_skill/piyi': 0 };
export function dushaLifecycleConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, hash] of Object.entries(dushaMemberSources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), hash,
            '毒砂掌来源改变，须重新审阅：' + path);
    const source = catalog.skills.find(s => s.id === skill);
    const entry = source?.entries.find(e => e.function === 'hit_ob'); assert.ok(entry);
    function add(suffix, extra = {}) {
        return { id: 'school-s1-shadu-life-' + suffix, stage: 'school', entry_id: entry.id,
            method: 'condition', samples: smoke ? 2 : extra.diagnostic ? 2 : samples,
            parameters: { school: 'lingjiu', family: '碧磷洞', collection_group: 's1-dusha-lifecycle',
                skill, ability: 'hit_ob', usage: 'strike', level: 80,
                actor: { skills: { force: 0, parry: 600, dodge: 600 }, mappings: {}, preparations: {},
                    properties: { ...properties, 'immune/poison': 100, ...extra.properties },
                    ...(extra.nopoison ? { temp: { nopoison: 1 } } : {}) },
                target: { skills: { force: 400, strike: 80, [skill]: 80 }, mappings: {}, preparations: {},
                    properties: { ...properties, jiali: 10, 'family/family_name': '碧磷洞' } },
                named_participants: true, fighting: false, action: 'original_condition_heartbeat',
                seed_mode: 'original_hit_ob', seed_side: 1, seed_incoming: extra.incoming ?? 100,
                condition_name: name, ticks: extra.ticks ?? 1,
                expected_terminal: extra.terminal ?? 'removed',
                expected: 'observed', not_applicable: '',
                observation: 'original_condition_heartbeat', observe_seconds: 45,
                source_evidence: { ...dushaMemberSources },
                qualification_sources: [...Object.keys(dushaMemberSources), 'feature/skill.c',
                    'feature/attribute.c', 'feature/damage.c', 'inherit/char/char.c', 'include/condition.h'],
                qualification_note: 'actor0为受毒真实非巫师USER，actor1仅调用一次原80级/加力10的hit_ob，incoming100为明确受控参数，不是原普通攻击。目标有效内功0使原施毒判定支持集全通过，但不替换随机毒级/时长。正常100样本设置抗毒100以观察一次原心跳内自然毒发后解除，不冒未经培养的正常玩家配置；其余各2条只检查免疫/护毒/不去毒等机制，不估计随机分布。原心跳及5至14秒条件节律保持，不直接调用update_condition，不预置毒种、不循环至命中或清除。无抗力仅观察两次，未解除不能写成完整生命周期。',
            } };
    }
    return [add('resistance100'),
        add('full-immunity', { diagnostic: true, properties: { 'immune/poison': -1 } }),
        add('nopoison', { diagnostic: true, nopoison: true }),
        add('piyi', { diagnostic: true, properties: { 'special_skill/piyi': 1 }, ticks: 0, terminal: 'no_seed' }),
        add('zero-incoming', { diagnostic: true, incoming: 0, ticks: 0, terminal: 'no_seed' }),
        add('no-resistance-two-ticks', { diagnostic: true, properties: { 'immune/poison': 0 }, ticks: 2, terminal: 'tick_limit' })];
}
const n = value => value ?? 0;
const counter = (metrics, side, key) => {
    const v = n(metrics?.[side]?.[key]); assert.ok(Number.isSafeInteger(v) && v >= 0, key); return v;
};
const strip = v => v.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
export function validateDushaLifecycleRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 's1-dusha-lifecycle'); assert.equal(raw.method, 'condition');
    assert.equal(raw.outcome, 'observed'); assert.equal(raw.condition_terminal, p.expected_terminal);
    assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.directs, []); assert.deepEqual(raw.interfaces, []);
    assert.deepEqual(raw.launches, []); assert.deepEqual(raw.dropped, []);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side];
        for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(b[key], 1);
        assert.equal(b.wizardp, 0); assert.equal(b.ghost, 0); assert.equal(n(b.busy), 0);
        assert.equal(b.weapon, 'none'); assert.equal(b.handing, 'none'); assert.equal(n(b.conditions), 0);
        assert.deepEqual(b.skills, config.skills); assert.deepEqual(b.mappings, {}); assert.deepEqual(b.preparations, {});
        for (const [key, value] of Object.entries(config.properties))
            assert.equal(key.includes('/') ? b.cultivation[key] : b[key], value, '实际初态：' + key);
        assert.equal(n(b.temp.nopoison), config.temp?.nopoison ?? 0);
        assert.equal(b.effective_skills.force, Math.trunc(config.skills.force / 2));
        assert.equal(counter(raw.immediate_metrics, side, 'heartbeats'), 0);
        for (const state of [raw.immediate[side], raw.after[side]]) {
            assert.deepEqual(state.skills, b.skills); assert.deepEqual(state.mappings, b.mappings);
            assert.deepEqual(state.preparations, b.preparations); assert.equal(state.weapon, 'none');
            assert.equal(state.max_neili, b.max_neili); assert.equal(n(state.busy), 0);
        }
        for (const [states, metrics] of [[raw.immediate, raw.immediate_metrics], [raw.after, raw.metrics]])
            for (const key of health) assert.equal(b[key] - states[side][key],
                counter(metrics, side, key + '_cost') - counter(metrics, side, key + '_recovery'));
        for (const key of health) {
            assert.equal(raw.immediate[side][key], b[key]);
            assert.equal(counter(raw.immediate_metrics, side, key + '_cost'), 0);
            assert.equal(counter(raw.immediate_metrics, side, key + '_recovery'), 0);
        }
    }
    assert.deepEqual(raw.after[1], raw.immediate[1]); assert.deepEqual(raw.immediate[1], raw.before[1]);
    assert.equal(counter(raw.metrics, 1, 'heartbeats'), 0);
    const seed = raw.condition_seed, passive = raw.passives[0], stored = raw.immediate[0].conditions?.[name];
    const shouldSeed = !!p.seed_incoming && !raw.before[0].cultivation['special_skill/piyi'];
    assert.equal(raw.passives.length, 1); assert.equal(passive.route, 'interface');
    assert.equal(passive.actor, 1); assert.equal(passive.target, 0); assert.equal(passive.skill, skill);
    assert.equal(passive.incoming, p.seed_incoming); assert.equal(passive.factor, 0);
    assert.equal(seed.function, 'hit_ob'); assert.equal(seed.object, '/kungfu/skill/' + skill);
    assert.ok(['/kungfu/skill/' + skill, '/kungfu/skill/' + skill + '.c'].includes(seed.function_owner));
    assert.equal(seed.incoming, p.seed_incoming); assert.equal(seed.factor, 0);
    assert.equal(seed.actor, 1); assert.equal(seed.target, 0); assert.equal(seed.seeded, Number(shouldSeed));
    assert.deepEqual(seed.before, raw.before); assert.deepEqual(seed.after, raw.immediate);
    if (shouldSeed) assert.deepEqual(seed.state, stored);
    else assert.equal(n(seed.state), 0, '未种毒原返回0/缺省null均须确无毒种');
    assert.deepEqual(seed.result, passive.result);
    if (shouldSeed) {
        assert.deepEqual(Object.keys(raw.immediate[0].conditions), [name]);
        assert.deepEqual(Object.keys(stored).sort(), ['id', 'level', 'name', 'remain']);
        assert.equal(stored.id, raw.before[1].id); assert.equal(stored.name, '砂毒');
        assert.ok(Number.isSafeInteger(stored.level) && stored.level >= 10 && stored.level < 20);
        const duration = stored.remain / stored.level;
        assert.ok(Number.isSafeInteger(duration) && duration >= 1 && duration < 5);
        assert.equal(strip(passive.result), '$n忽然感到一股莫名的恶心，全身瘫软，嘴皮乌紫。\n');
    } else {
        assert.equal(n(passive.result), 0); assert.equal(n(raw.immediate[0].conditions), 0);
        assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.metrics, raw.immediate_metrics);
    }
    assert.equal(raw.condition_events.length, p.ticks * 2); assert.equal(raw.condition_heartbeats.length, p.ticks);
    assert.equal(raw.condition_lifecycle_complete, Number(p.expected_terminal === 'removed'));
    for (let i = 0; i < p.ticks; i++) {
        const [pre, post] = raw.condition_events.slice(i * 2, i * 2 + 2), settled = raw.condition_heartbeats[i];
        assert.equal(pre.phase, 'before'); assert.equal(post.phase, 'after');
        for (const event of [pre, post]) {
            assert.equal(event.name, name); assert.equal(event.daemon, '/kungfu/condition/' + name);
            assert.ok(Number.isFinite(event.elapsed) && event.elapsed >= 0 && event.elapsed <= raw.elapsed);
        }
        const previous = i ? raw.condition_heartbeats[i - 1].state : raw.immediate[0];
        for (const key of health) assert.equal(pre.state[key], previous[key]);
        assert.deepEqual(pre.state.conditions, previous.conditions);
        validateGumuPoisonTick(pre, post, settled, name);
        const expectedTransient = structuredClone(pre.state.conditions);
        const immune = pre.state.cultivation['immune/poison'];
        if (!pre.state.temp.nopoison && !pre.state.cultivation['special_skill/piyi']) {
            if (immune === -1) expectedTransient[name].remain = 0;
            else if (immune === 100) expectedTransient[name].remain -= 100;
        }
        assert.deepEqual(post.state.conditions, expectedTransient, '原回调返回前的毒量不得丢失');
        assert.ok(settled.elapsed >= post.elapsed && post.elapsed >= pre.elapsed);
        if (i) assert.ok(pre.elapsed > raw.condition_heartbeats[i - 1].elapsed);
    }
    if (p.ticks) {
        assert.ok(counter(raw.metrics, 0, 'heartbeats') >= p.ticks);
        const last = raw.condition_heartbeats.at(-1).state;
        for (const key of health) assert.equal(raw.after[0][key], last[key]);
        assert.deepEqual(raw.after[0].conditions, last.conditions);
        assert.ok(raw.elapsed > 0 && raw.elapsed < p.observe_seconds);
    }
    if (p.expected_terminal === 'removed') assert.ok(!raw.after[0].conditions?.[name]);
    if (p.expected_terminal === 'tick_limit') assert.deepEqual(raw.after[0].conditions, raw.immediate[0].conditions);
}
