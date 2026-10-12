// Original hit passives and USER condition heartbeat; no simulated ticks or RNG.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';

export const jiuyinPassiveGroup = 'emei-jiuyin-passive';
const claw = 'jiuyin-baiguzhao', palm = 'cuixin-zhang', conditionName = 'cuixin_zhang';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const common = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 10000, max_neili: 10000, str: 36, int: 36, con: 36, dex: 36,
    jiali: 0, combat_exp: 100000000, 'immune/poison': 0, 'special_skill/piyi': 0 };

export function emeiJiuyinPassiveConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(skill, suffix, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill); assert.ok(source, skill);
        const usage = skill === claw ? 'claw' : 'strike', level = extra.level ?? 200;
        const method = extra.method ?? 'interface';
        const actor = { properties: { ...common, jiali: skill === palm ? 10 : 0, ...extra.properties },
            skills: { [usage]: level, [skill]: level, force: 200, ...extra.skills },
            mappings: { [usage]: skill }, preparations: { [usage]: skill } };
        const target = { properties: { ...common, ...extra.targetProperties },
            skills: { force: (extra.force ?? 0) * 2, dodge: 2, parry: 2 }, mappings: {}, preparations: {},
            ...(extra.prior ? { conditions: { [conditionName]: extra.prior } } : {}) };
        if (method === 'condition') {
            // Original heartbeat remains on actor 0, who is the victim in this series.
            target.properties = actor.properties; target.skills = actor.skills;
            target.mappings = actor.mappings; target.preparations = actor.preparations;
            actor.properties = { ...common, ...extra.victimProperties };
            actor.skills = { force: (extra.force ?? 300) * 2 }; actor.mappings = {}; actor.preparations = {};
            if (!extra.seedByHit) actor.conditions = { [conditionName]: {
                level: 200, remain: extra.remain ?? 200, id: 'foreign', name: '催心掌掌力' } };
        }
        const random = extra.random ?? (skill === palm && method !== 'condition');
        result.push({ id: `school-emei-jiuyin-passive-${skill}-${suffix}`, stage: 'school',
            entry_id: source.path, method, samples: smoke ? (random ? 2 : 1) : random ? samples : 2,
            parameters: { school: 'emei', collection_group: jiuyinPassiveGroup, skill, usage, level,
                ability: method === 'condition' ? conditionName : 'hit_ob', combination: suffix, actor, target,
                action: method === 'ordinary' ? 'ordinary' : method === 'interface' ? 'test_interface' : 'original_condition_heartbeat',
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + skill,
                    function: 'hit_ob', damage: extra.damage ?? 200, factor: extra.factor ?? 0 } } : {}),
                fighting: method === 'ordinary', observation: method === 'condition' ? 'original_condition_heartbeat' : 'single_action_immediate',
                observe_seconds: method === 'condition' ? 45 : 0, ticks: extra.ticks ?? 1,
                condition_name: conditionName, seed_by_hit: !!extra.seedByHit, expected: 'observed', not_applicable: '',
                qualification_sources: [source.path, 'kungfu/class/emei/zhou.c', 'adm/daemons/combatd.c',
                    'feature/attribute.c', 'feature/skill.c', 'feature/damage.c', 'feature/condition.c',
                    'inherit/char/char.c', 'kungfu/condition/cuixin_zhang.c', 'inherit/condition/poison.c', 'include/condition.h'],
                qualification_note: '独立hit_ob与原普攻分开，接口伤害不是实际命中伤害。真实非巫师USER、实验能力而非NPC原配装；生命周期actor0为受掌者，仅其原心跳启用。seed_by_hit走原催心掌施加，其余明确预置异常；不手调时钟、随机或强迫命中。生命周期两次仅核对分支，不估随机损伤分布；不冒充完整交锋或玩家可学。',
            } });
    }
    for (const [damage, str] of [[99, 0], [100, 19], [100, 20], [104, 20], [105, 20], [209, 41], [210, 41], [1000, 36]])
        add(claw, `damage${damage}-str${str}`, { damage, targetProperties: { str } });
    for (const level of [200, 400, 800]) for (const skill of [claw, palm])
        add(skill, 'ordinary-l' + level, { level, method: 'ordinary', random: true });
    for (const level of [79, 80, 200, 400, 800]) add(palm, 'level' + level, { level, random: level >= 80 });
    for (const jiali of [9, 10, 100]) add(palm, 'jiali' + jiali, { properties: { jiali }, random: jiali >= 10 });
    for (const damage of [0, 1, -1]) add(palm, 'damage' + damage, { damage, random: damage !== 0 });
    for (const force of [19, 20, 119, 218, 219]) add(palm, 'force' + force, { force });
    add(palm, 'piyi', { targetProperties: { 'special_skill/piyi': 1 } });
    add(palm, 'full-immunity', { targetProperties: { 'immune/poison': -1 } });
    add(palm, 'factor10000', { factor: 10000 });
    for (const id of ['left', 'foreign']) for (const level of [5, 300])
        add(palm, `merge-${id}-${level}`, { prior: { id, level, remain: 600, name: '催心掌掌力' } });
    add(palm, 'heartbeat-expire', { method: 'condition' });
    add(palm, 'heartbeat-two-ticks', { method: 'condition', ticks: 2, remain: 400 });
    add(palm, 'heartbeat-no-force', { method: 'condition', ticks: 2, remain: 400, force: 0 });
    add(palm, 'heartbeat-piyi', { method: 'condition', victimProperties: { 'special_skill/piyi': 1 } });
    add(palm, 'heartbeat-full-immunity', { method: 'condition', victimProperties: { 'immune/poison': -1 } });
    add(palm, 'hit-then-expire', { method: 'condition', seedByHit: true, level: 100, force: 0,
        victimProperties: { 'immune/poison': 200 } });
    add(palm, 'hit-then-immune', { method: 'condition', seedByHit: true, force: 0,
        victimProperties: { 'immune/poison': -1 } });
    add(palm, 'hit-then-persist', { method: 'condition', seedByHit: true, force: 0, ticks: 2 });
    return result;
}

export function palmProbability(level, jiali, force, damage, piyi = 0) {
    if (level < 80 || jiali < 10 || !damage || piyi) return 0;
    return Math.max(0, Math.min(level, level - (force - jiali * 2 + 1))) / level;
}

export function poisonDamageBounds(level, kind) {
    let d = level;
    if (kind === 'jing') d = level >= 64 ? 24 + Math.trunc((level - 64) / 8)
        : level >= 32 ? 16 + Math.trunc((level - 32) / 4) : Math.trunc(level / 2);
    else d = level > 300 ? 100 + Math.trunc((level - 300) / 12)
        : level > 60 ? 60 + Math.trunc((level - 60) / 6) : level;
    d = Math.max(10, d); return [Math.trunc(d / 2), Math.trunc(d / 2) + d - 1];
}

function validateApplication(event, before, after, attacker) {
    const b = before.conditions?.[conditionName], a = after.conditions?.[conditionName];
    const level = attacker.skills[palm], jiali = attacker.jiali;
    const chance = palmProbability(level, jiali, before.effective_skills.force ?? 0,
        event.incoming, before.cultivation['special_skill/piyi']);
    const applied = typeof event.result === 'string' && event.result.length > 0;
    if (chance === 0 || chance === 1) assert.equal(applied, chance === 1);
    if (!applied) { assert.deepEqual(a, b); return; }
    assert.ok(a); assert.equal(a.id, !b || b.id === attacker.id ? attacker.id : '...');
    assert.equal(a.name, '催心掌掌力');
    // Reconstruct all allowed random (strength,duration) pairs; preserve merge semantics.
    const durations = Array.from({ length: Math.trunc(level / 10) }, (_, i) => Math.trunc(level / 100) + i);
    assert.ok(Array.from({ length: jiali }, (_, i) => jiali + i).some(n =>
        Math.max(b?.level ?? 0, n) === a.level && durations.some(d => (b?.remain ?? 0) + n * d === a.remain)),
    '原强度、持续与叠加剩余量必须一致');
}

export function validateJiuyinPassiveRecord(raw, c) {
    const p = c.parameters, [b, bt] = raw.before, [a, t] = raw.immediate;
    assert.equal(raw.outcome, 'observed'); assert.equal(raw.launches.length, 0);
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value);
        for (const [key, value] of Object.entries(cfg.properties))
            assert.equal(key.includes('/') ? state.cultivation[key] : state[key], value, key);
        assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.conditions || {}, cfg.conditions || {});
    }
    if (c.method === 'condition') {
        assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 0);
        assert.equal(raw.passives.length, Number(p.seed_by_hit));
        if (p.seed_by_hit) {
            const e = raw.passives[0]; assert.equal(e.actor, 1); assert.equal(e.target, 0);
            validateApplication(e, b, a, bt);
        } else assert.deepEqual(raw.immediate, raw.before);
        assert.equal(raw.condition_events.length, p.ticks * 2); assert.equal(raw.condition_heartbeats.length, p.ticks);
        for (let i = 0; i < p.ticks; i++) {
            const [pre, post] = raw.condition_events.slice(i * 2, i * 2 + 2), settled = raw.condition_heartbeats[i];
            assert.equal(pre.phase, 'before'); assert.equal(post.phase, 'after');
            for (const e of [pre, post]) { assert.equal(e.name, conditionName); assert.equal(e.daemon, '/kungfu/condition/' + conditionName); }
            const previous = i ? raw.condition_heartbeats[i - 1].state : a;
            for (const k of health) assert.equal(pre.state[k], previous[k]);
            assert.deepEqual(pre.state.conditions, previous.conditions);
            const v = pre.state.conditions[conditionName], immune = p.actor.properties['immune/poison'];
            const piyi = p.actor.properties['special_skill/piyi'];
            for (const kind of ['qi', 'jing']) {
                const damage = pre.state[kind] - post.state[kind];
                const [min, max] = poisonDamageBounds(v.level, kind);
                if (piyi || immune === -1) assert.equal(damage, 0);
                else assert.ok(damage >= min && damage <= max);
                assert.equal(pre.state['eff_' + kind] - post.state['eff_' + kind], Math.trunc(damage / 2));
            }
            const recover = piyi || immune === -1 || pre.state.effective_skills.force + immune > Math.trunc(v.level / 2) + v.level - 1;
            const remain = v.remain - immune, cleared = piyi || immune === -1 || (recover && remain <= v.level);
            assert.equal(post.flag, cleared ? 0 : 3);
            assert.deepEqual(settled.state.conditions || {}, cleared ? {} : {
                [conditionName]: { ...v, remain: recover ? remain - v.level : v.remain } });
            for (const k of health) {
                assert.ok(settled.state[k] >= post.state[k]);
                if (post.flag & 2) assert.equal(settled.state[k], post.state[k]);
            }
            assert.ok(pre.elapsed >= 0 && post.elapsed >= pre.elapsed && settled.elapsed >= post.elapsed);
            if (i) assert.ok(pre.elapsed > raw.condition_heartbeats[i - 1].elapsed);
        }
        for (const k of health) assert.equal(raw.after[0][k], raw.condition_heartbeats.at(-1).state[k]);
        assert.deepEqual(raw.after[0].conditions, raw.condition_heartbeats.at(-1).state.conditions);
        assert.deepEqual(raw.after[1], bt); assert.ok(raw.elapsed > 0 && raw.elapsed < p.observe_seconds);
        return;
    }
    const events = raw.passives.filter(e => e.skill === p.skill);
    if (c.method === 'interface') {
        assert.equal(events.length, 1); assert.equal(raw.interfaces.length, 1); assert.equal(raw.attacks.length, 0);
        assert.equal(events[0].incoming, p.interface.damage); assert.equal(events[0].route, 'interface');
        assert.equal(events[0].factor, p.interface.factor); assert.deepEqual(a, b);
    } else {
        assert.equal(raw.interfaces.length, 0); assert.equal(raw.attacks.length, 1);
        assert.ok(events.length <= 1);
    }
    if (p.skill === palm) {
        if (events.length) validateApplication(events[0], bt, t, b);
        else assert.deepEqual(t.conditions, bt.conditions);
        if (c.method === 'interface') for (const k of health) assert.equal(t[k], bt[k]);
    } else if (c.method === 'interface') {
        const damage = p.interface.damage, trigger = damage >= 100 && Math.trunc(damage / 5) > bt.effective_str;
        assert.equal(typeof events[0].result === 'string' && !!events[0].result, trigger);
        const wound = trigger ? Math.trunc((damage - 100) / 2) : 0;
        assert.equal(bt.eff_qi - t.eff_qi, wound);
        assert.equal(t.qi, Math.min(bt.qi, t.eff_qi));
        for (const k of ['jing', 'eff_jing', 'neili']) assert.equal(t[k], bt[k]);
    }
}

export function jiuyinPassiveEffects(rows) {
    const raw = rows.map(r => r.raw), events = raw.flatMap(r => r.passives);
    const ticks = raw.flatMap(r => (r.condition_heartbeats ?? []).map((settled, i) => ({
        before: r.condition_events[i * 2], after: r.condition_events[i * 2 + 1], settled })));
    return { samples: raw.length, passive_calls: events.length,
        triggered: events.filter(e => typeof e.result === 'string' && e.result.length > 0).length,
        incoming: distribution(events.map(e => e.incoming)),
        immediate_target_loss: Object.fromEntries(health.map(k => [k, distribution(raw.map(r => r.before[1][k] - r.immediate[1][k]))])),
        condition_ticks: ticks.length, cleared: raw.filter(r => r.condition_events?.length && !r.after[0].conditions?.[conditionName]).length,
        tick_damage: Object.fromEntries(health.map(k => [k, distribution(ticks.map(t => t.before.state[k] - t.after.state[k]))])),
        first_tick_seconds: distribution(raw.filter(r => r.condition_events?.length).map(r => r.condition_events[0].elapsed)),
    };
}
