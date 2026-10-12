// Dispel follow-up: explicitly applied starting states, original timed USER ticks.
// These are not exert/dispel casts, natural infection or school-exclusive effects.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';

const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];

export function wudangConditionCases(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(name, variant, extra = {}) {
        const force = extra.force ?? 'taiji-shengong';
        const source = catalog.skills.find(s => s.id === force);
        assert.ok(source, '缺少内功映射来源');
        const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000,
            jing: 10000, eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000,
            str: 36, int: 36, con: 36, dex: 36, jiali: 0, combat_exp: 100000000,
            'family/family_name': '武当派', 'immune/poison': 0, 'special_skill/piyi': 0 };
        const level = extra.noForce ? 0 : 200;
        const actor = { properties: { ...properties, ...extra.properties },
            skills: { force: level, [force]: level }, mappings: extra.noForce ? {} : { force }, preparations: {},
            conditions: { [name]: { level: 200, remain: 400, id: 'foreign', name, ...extra.condition } } };
        result.push({ id: `school-wudang-condition-${force}-${name}-${variant}`, stage: 'school',
            entry_id: source.path, method: 'condition', samples: smoke ? 2 : extra.random ? samples : 2,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-condition',
                skill: force, ability: name, usage: 'force', level: 200, combination: variant,
                actor, target: { properties, skills: { force: 200 }, mappings: {}, preparations: {} },
                named_participants: true, fighting: false, action: 'original_condition_heartbeat',
                observation: 'original_condition_heartbeat', ticks: extra.ticks ?? 1, observe_seconds: 45,
                condition_name: name, expected: 'observed', not_applicable: '',
                sampling: extra.random ? 'random_damage_distribution' : 'boundary_checks',
                qualification_sources: [source.path, 'feature/condition.c', 'feature/damage.c', 'feature/skill.c',
                    'inherit/char/char.c', 'include/condition.h',
                    `kungfu/condition/${name}.c`, `inherit/condition/${name === 'freezing' ? 'poison' : 'damo'}.c`],
                qualification_note: '公共驱除的原心跳后续，入口文件仅标识实验内功映射，不表示施展该内功或自然染毒。通过原apply_condition赋值初态，不调用update_condition、不改时钟。普通乱气100个新角色样本；其他只核对确定性或边界分支、不以两次随机伤害估分布。异常id/level为显式故障输入，不能据此认定正常施毒接口接受。',
            } });
    }
    for (const name of ['freezing', 'damo_luanqi']) {
        add(name, 'normal', { random: name === 'damo_luanqi' });
        add(name, 'expire', { condition: { remain: 200 } });
        add(name, 'two-ticks', { ticks: 2 });
        add(name, 'no-force', { noForce: true });
        add(name, 'bad-id', { condition: { id: 0 } });
        add(name, 'bad-level', { condition: { level: 'invalid' } });
    }
    add('freezing', 'full-immunity', { properties: { 'immune/poison': -1 } });
    add('freezing', 'piyi', { properties: { 'special_skill/piyi': 1 } });
    add('freezing', 'nature', { noForce: true, condition: { id: 'nature poison' } });
    for (const force of ['wudang-xinfa', 'wudang-jiuyang']) add('freezing', 'mapping-control', { force });
    return result;
}

// Expected *current* behavior, including recorded MA-082/083; not a proposed fix.
export function conditionTickExpected(before, p) {
    const cnd = before.conditions[p.condition_name], poison = p.condition_name === 'freezing';
    const immunity = p.actor.properties['immune/poison'];
    const empty = { flag: 0, conditions: {}, damage: Object.fromEntries(health.map(k => [k, [0, 0]])) };
    if (typeof cnd.level !== 'number' || (poison && p.actor.properties['special_skill/piyi'])) return empty;
    const result = structuredClone(empty);
    if (poison && immunity !== -1) {
        result.damage = { qi: [33, 33], eff_qi: [16, 16], jing: [25, 25], eff_jing: [12, 12], neili: [0, 0] };
    } else if (!poison) result.damage.qi = [41, 123];
    // All configured force comparisons lie outside the random transition band.
    const recover = before.effective_skills.force >= 300 || (poison && (immunity === -1 || cnd.id === 'nature poison'));
    if (recover && (cnd.remain <= cnd.level || (poison && immunity === -1))) return result;
    result.flag = poison ? 3 : 1;
    result.conditions = { [p.condition_name]: { ...cnd, remain: cnd.remain - (recover ? cnd.level : 0) } };
    return result;
}

export function validateWudangConditionRecord(raw, c) {
    const p = c.parameters;
    assert.equal(c.method, 'condition'); assert.equal(raw.outcome, 'observed');
    assert.deepEqual(raw.immediate, raw.before, '启用心跳不得提前更新状态');
    assert.equal(raw.launches.length, 0); assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 0);
    assert.equal(raw.condition_events.length, p.ticks * 2); assert.equal(raw.condition_heartbeats.length, p.ticks);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side];
        for (const key of resources) assert.equal(b[key], cfg.properties[key]);
        for (const [key, n] of Object.entries(cfg.skills)) assert.equal(b.skills[key] ?? 0, n);
        assert.deepEqual(b.conditions || {}, cfg.conditions || {}); assert.deepEqual(b.mappings, cfg.mappings);
    }
    for (let i = 0; i < p.ticks; i++) {
        const [b, a] = raw.condition_events.slice(i * 2, i * 2 + 2), settled = raw.condition_heartbeats[i];
        assert.equal(b.phase, 'before'); assert.equal(a.phase, 'after');
        for (const e of [b, a]) {
            assert.equal(e.name, p.condition_name); assert.equal(e.daemon, '/kungfu/condition/' + p.condition_name);
            assert.ok(Number.isFinite(e.elapsed) && e.elapsed >= 0 && e.elapsed <= raw.elapsed);
        }
        assert.ok(a.elapsed >= b.elapsed && settled.elapsed >= a.elapsed);
        const previous = i ? raw.condition_heartbeats[i - 1].state : raw.before[0];
        for (const key of health) assert.equal(b.state[key], previous[key], '两次异常更新间无未登记的资源变化');
        assert.deepEqual(b.state.conditions || {}, previous.conditions || {});
        const expected = conditionTickExpected(b.state, p);
        assert.equal(a.flag, expected.flag);
        for (const key of health) {
            const damage = b.state[key] - a.state[key], [min, max] = expected.damage[key];
            assert.ok(Number.isInteger(damage) && damage >= min && damage <= max, '异常更新损伤范围：' + key);
            assert.ok(settled.state[key] >= a.state[key], '更新后的自然恢复不得伪装成额外损伤');
            if (a.flag & 2) assert.equal(settled.state[key], a.state[key], 'NO_HEAL_UP 必须抑制本次回血');
        }
        assert.deepEqual(settled.state.conditions || {}, expected.conditions, '由原宿主清除/保留异常');
        if (i) assert.ok(b.elapsed > raw.condition_heartbeats[i - 1].elapsed, '第二次更新不得同刻模拟');
    }
    const last = raw.condition_heartbeats.at(-1).state;
    for (const key of health) assert.equal(raw.after[0][key], last[key]);
    assert.deepEqual(raw.after[0].conditions, last.conditions);
    assert.deepEqual(raw.after[1], raw.before[1], '旁观角色无心跳及副作用');
    assert.ok((raw.metrics[0].heartbeats ?? 0) >= p.ticks);
    assert.ok(raw.elapsed > 0 && raw.elapsed < p.observe_seconds);
}

export function conditionEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && Array.isArray(r.raw.condition_events)).map(r => r.raw);
    const ticks = raw.flatMap(r => r.condition_heartbeats.map((settled, i) => ({
        before: r.condition_events[i * 2], after: r.condition_events[i * 2 + 1], settled })));
    return { samples: raw.length, unknown: rows.length - raw.length, ticks: ticks.length,
        flag_counts: Object.fromEntries([0, 1, 3].map(flag => [flag, ticks.filter(t => t.after.flag === flag).length])),
        cleared: raw.filter(r => !Object.keys(r.after[0].conditions || {}).length).length,
        damage: Object.fromEntries(health.map(k => [k, distribution(ticks.map(t => t.before.state[k] - t.after.state[k]))])),
        recovery_after_update: Object.fromEntries(health.map(k => [k, distribution(ticks.map(t => t.settled.state[k] - t.after.state[k]))])),
        first_tick_seconds: distribution(raw.map(r => r.condition_events[0].elapsed)),
        tick_intervals: distribution(raw.flatMap(r => r.condition_heartbeats.slice(1).map((e, i) => e.elapsed - r.condition_heartbeats[i].elapsed))),
    };
}
