// Original two-stage action; no heartbeat combat or synthetic callback timing.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const gumuFireiceFixtureRequirements = [
    'Capture immediate_metrics before yielding and cumulative metrics at completion.',
    'Observe entry to the original perform2 in the temporary source copy, with source/probe hashes and unchanged control flow.',
    'Keep the original zero-delay call_out; do not invoke perform2 directly or replace random().',
    'Keep actors alive through the observation window; ordinary heartbeat combat is outside this isolated two-stage action.',
    'Capture character and actual grants/preparations; absence of a grant or preparation is not a refusal for this entry.',
];

export function gumuFireiceConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source = catalog.skills.find(s => s.id === 'fireice-strike/binghuo');
    const entry = source?.entries.find(e => e.role === 'perform')?.id;
    assert.ok(entry, '缺少冰火二重天入口');
    const result = [];
    function add(level = 200, extra = {}) {
        const actor = {
            skills: { strike: level, 'fireice-strike': level, parry: level, force: level,
                'yunv-xinjing': level, dodge: level, 'yunv-shenfa': level, ...extra.skills },
            mappings: { strike: 'fireice-strike', parry: 'fireice-strike', force: 'yunv-xinjing', dodge: 'yunv-shenfa' },
            preparations: extra.noPrepare ? {} : { strike: 'fireice-strike' },
            properties: { neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 10000000,
                str: 36, int: 36, con: 36, dex: 36, gender: '女性', character: '光明磊落',
                'family/family_name': '古墓派', 'can_perform/fireice-strike/binghuo': 0, ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: extra.busy } : {}),
        };
        if (extra.noMap) delete actor.mappings.strike;
        const target = { skills: { force: 200, parry: 200, dodge: 200, sword: 200,
            ...(extra.jiuyang ? { 'jiuyang-shengong': 200 } : {}), ...extra.targetSkills },
            mappings: extra.jiuyang ? { force: 'jiuyang-shengong' } : {}, preparations: {},
            properties: { combat_exp: 10000000, jiali: 0, gender: '男性', character: '光明磊落' },
            equipment: { type: 'sword', hold: false }, ...(extra.targetBusy ? { busy: extra.targetBusy } : {}) };
        const expected = extra.expected ?? 'observed';
        result.push({ id: `school-gumu-fireice-l${level}${extra.suffix ?? ''}`, stage: 'school', entry_id: entry,
            method: 'perform', samples: smoke ? 2 : extra.checks ?? (expected === 'refused' ? 2 : samples),
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-fireice',
                skill: 'fireice-strike', ability: 'binghuo', usage: 'strike', level,
                combination: 'fireice-strike+yunv-xinjing+yunv-shenfa', actor, target,
                fighting: extra.fighting ?? true, action: 'perform strike.binghuo', expected, not_applicable: '',
                observation: 'original_zero_delay_followup', observe_seconds: 1,
                qualification_sources: [source.path, 'kungfu/skill/fireice-strike.c', 'kungfu/skill/yunv-xinjing.c',
                    'kungfu/skill/yunv-shenfa.c', 'kungfu/skill/jiuyang-shengong.c', 'kungfu/class/gumu/li.c',
                    'kungfu/class/gumu/yang.c', 'kungfu/class/gumu/gumu.h', 'feature/skill.c', 'feature/action.c',
                    'feature/damage.c', 'feature/equip.c', 'inherit/weapon/sword.c', 'mudcore/inherit/action.c',
                    'inherit/skill/skill.c', 'cmds/skill/perform.c', 'adm/daemons/combatd.c'],
                qualification_note: '真实非巫师USER、光明磊落、加力0。原入口不检查领悟或准备；保留原命令映射与忙乱限制，不伪造额外门槛。九阳化解按双方基本内功，不把文案反震当实际自伤。普通分支150级不安排第二掌，151级起保留原call_out(0)及回调内力600门槛；即时与结束快照、费用和直伤独立。仅测同场存活目标，不冒充自然交锋或离场／昏迷生命周期。',
            } });
    }
    for (const level of [150, 151, 200, 400, 800]) add(level);
    for (const level of [151, 200]) for (const neili of [800, 899, 900])
        add(level, { suffix: '-neili' + neili, properties: { neili } });
    for (const high of [false, true]) {
        add(200, { suffix: high ? '-high-parry' : '-low-parry', targetSkills: { parry: high ? 100000 : 2 } });
        add(200, { suffix: high ? '-high-dodge' : '-low-dodge',
            targetSkills: { parry: 2, dodge: high ? 100000 : 2 } });
    }
    for (const force of [2, 200, 100000])
        add(200, { suffix: '-jiuyang-force' + force, jiuyang: true, targetSkills: { force } });
    for (const level of [120, 800]) add(200, { suffix: '-jiuyang-special' + level, jiuyang: true,
        targetSkills: { 'jiuyang-shengong': level } });
    add(200, { suffix: '-target-busy', targetBusy: 50 });
    const check = (suffix, extra = {}) => add(200, { suffix: '-' + suffix, checks: 2, ...extra });
    check('no-prepare', { noPrepare: true });
    check('with-grant', { properties: { 'can_perform/fireice-strike/binghuo': 1 } });
    for (const low of [false, true]) {
        const suffix = low ? 'low' : 'minimum', expected = low ? 'refused' : 'observed';
        check(suffix + '-skill', { skills: { 'fireice-strike': 150 - Number(low) }, expected });
        check(suffix + '-yunv', { skills: { 'yunv-xinjing': 120 - Number(low) }, expected });
        check(suffix + '-max-neili', { properties: { max_neili: 800 - Number(low), neili: 800 }, expected });
        check(suffix + '-neili', { properties: { neili: 800 - Number(low) }, expected });
    }
    check('no-map', { noMap: true, expected: 'refused' });
    check('busy', { busy: 2, expected: 'refused' });
    check('no-fight', { fighting: false, expected: 'refused' });
    check('weapon', { weapon: true, expected: 'refused' });
    return result;
}

function counter(metrics, side, key) {
    assert.ok(metrics?.[side] && typeof metrics[side] === 'object' && !Array.isArray(metrics[side]));
    const value = Object.hasOwn(metrics[side], key) ? metrics[side][key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效或未知计数：' + key);
    return value;
}

function busy(state) {
    assert.ok(Object.hasOwn(state, 'busy'), '缺少忙乱观测');
    const value = state.busy === null ? 0 : state.busy;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效忙乱观测');
    return value;
}

export function validateGumuFireiceRecord(raw, c) {
    const p = c.parameters;
    assert.equal(p.collection_group, 'gumu-fireice'); assert.equal(c.method, 'perform');
    assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'after', 'immediate_metrics', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'attacks', 'dropped', 'fireice_followups']) assert.ok(Array.isArray(raw[key]), key);
    const [b, bt] = raw.before, [a, t] = raw.immediate, [end, et] = raw.after;
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.equal(state.cultivation.character, cfg.properties.character); assert.equal(state.weapon, cfg.equipment?.type ?? 'none');
        assert.equal(busy(state), cfg.busy ?? 0);
        assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.preparations, cfg.preparations);
        for (const [key, value] of Object.entries(cfg.skills)) {
            assert.equal(state.skills[key], value);
            assert.equal(state.effective_skills[key], Math.trunc(value / 2)
                + (cfg.skills[cfg.mappings[key]] ?? 0) + (state.temp.apply[key] ?? 0));
        }
        for (const [key, value] of Object.entries(cfg.properties))
            assert.equal(key.includes('/') || key === 'character' ? state.cultivation[key] : state[key], value, key);
    }
    assert.equal(raw.attacks.length, 0); assert.equal(raw.dropped.length, 0);
    for (const [states, metrics] of [[raw.immediate, raw.immediate_metrics], [raw.after, raw.metrics]]) {
        for (const side of [0, 1]) {
            busy(states[side]);
            for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
                const cost = counter(metrics, side, key + '_cost');
                assert.equal(counter(metrics, side, key + '_recovery'), 0);
                assert.ok(Number.isFinite(raw.before[side][key]) && Number.isFinite(states[side][key]));
                assert.equal(raw.before[side][key] - states[side][key], cost);
                if (side === 0 && key !== 'neili' || side === 1 && !['qi', 'eff_qi'].includes(key)) assert.equal(cost, 0);
            }
            assert.equal(counter(metrics, side, 'heartbeats'), 0);
            assert.equal(states[side].max_neili, raw.before[side].max_neili);
            assert.equal(states[side].weapon, raw.before[side].weapon);
            assert.deepEqual(states[side].temp.apply, raw.before[side].temp.apply);
        }
        assert.equal(counter(metrics, 1, 'direct'), 0);
    }
    const first = counter(raw.immediate_metrics, 0, 'direct'), total = counter(raw.metrics, 0, 'direct');
    const initialCost = counter(raw.immediate_metrics, 0, 'neili_cost'), cost = counter(raw.metrics, 0, 'neili_cost');
    for (const side of [0, 1]) for (const key of ['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost', 'neili_cost', 'direct'])
        assert.ok(counter(raw.metrics, side, key) >= counter(raw.immediate_metrics, side, key), '累计计数不能回退');
    assert.ok([0, 1].includes(first)); assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    if (p.expected === 'refused') {
        assert.equal(raw.launches.length, 0); assert.equal(first, 0); assert.equal(total, 0);
        assert.equal(cost, 0); assert.equal(initialCost, 0); assert.ok(raw.reason?.length > 0);
        assert.equal(raw.fireice_followups.length, 0);
        for (const side of [0, 1]) {
            assert.equal(raw.immediate[side].busy, raw.before[side].busy);
            for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili', 'busy'])
                assert.equal(raw.after[side][key], raw.before[side][key]);
        }
        return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, 'fireice-strike');
    assert.equal(raw.launches[0].argument, 'binghuo');
    const jiuyang = bt.mappings.force === 'jiuyang-shengong';
    if (jiuyang) {
        assert.equal(first, 0); assert.ok([100, 200].includes(initialCost));
        assert.equal(busy(a), initialCost === 100 ? busy(b) : 3); assert.equal(busy(t), busy(bt));
        if (initialCost === 100) assert.ok(b.skills.force - 1 > Math.trunc(bt.skills.force / 4));
    } else {
        assert.equal(initialCost, first ? 300 : 100); assert.equal(a.busy, first ? 1 : 3);
        assert.equal(busy(t), first ? 1 : busy(bt));
        if (first) assert.ok(b.effective_skills.parry - 1 > Math.trunc(bt.effective_skills.parry / 3));
    }
    if (!first) { assert.equal(t.qi, bt.qi); assert.equal(t.eff_qi, bt.eff_qi); }
    const scheduled = !jiuyang && first === 1 && b.skills['fireice-strike'] > 150;
    assert.equal(raw.fireice_followups.length, Number(scheduled));
    if (scheduled) {
        const event = raw.fireice_followups[0];
        assert.equal(event.phase, 'entry'); assert.equal(event.function, 'perform2');
        assert.ok(Number.isFinite(event.elapsed) && event.elapsed >= 0 && event.elapsed <= raw.elapsed);
        assert.equal(event.same_room, 1); assert.equal(event.target_living, 1);
        assert.equal(event.actor_neili, a.neili); assert.deepEqual(event.metrics, raw.immediate_metrics);
    }
    const eligible = scheduled && a.neili >= 600;
    const second = total - first;
    assert.ok([0, 1].includes(second)); assert.equal(et.busy, t.busy);
    if (!eligible) {
        assert.equal(second, 0); assert.equal(cost, initialCost); assert.equal(end.busy, a.busy);
    } else {
        assert.equal(cost - initialCost, second ? 300 : 100); assert.equal(end.busy, second ? 1 : 3);
        if (second) assert.ok(b.effective_skills.dodge - 1 > Math.trunc(bt.effective_skills.dodge / 2));
    }
    if (!second) for (const key of ['qi', 'eff_qi']) assert.equal(et[key], t[key]);
}

export function gumuFireiceEffects(records) {
    const rows = records.filter(r => r.outcome === 'observed').map(r => r.raw);
    const value = (r, field, key) => r[field]?.[0]
        ? (Object.hasOwn(r[field][0], key) ? r[field][0][key] : 0) : null;
    const known = rows.filter(r => Array.isArray(r.fireice_followups));
    return { samples: rows.length, callback_entered: probability(known.filter(r => r.fireice_followups.length > 0).length, known.length),
        first_direct_calls: distribution(rows.map(r => value(r, 'immediate_metrics', 'direct'))),
        total_direct_calls: distribution(rows.map(r => value(r, 'metrics', 'direct'))),
        first_neili_cost: distribution(rows.map(r => value(r, 'immediate_metrics', 'neili_cost'))),
        total_neili_cost: distribution(rows.map(r => value(r, 'metrics', 'neili_cost'))),
        followup_neili_cost: distribution(rows.map(r => {
            const first = value(r, 'immediate_metrics', 'neili_cost'), total = value(r, 'metrics', 'neili_cost');
            return Number.isFinite(first) && Number.isFinite(total) ? total - first : null;
        })), unknown_callback: rows.length - known.length, unobserved: records.length - rows.length };
}
