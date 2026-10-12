// Original exert -> condition daemon. Initial conditions are explicit experiment inputs,
// not proof of natural infection/application. No heartbeat damage or expiry is simulated.
import assert from 'node:assert/strict';
import { wudangForces } from './school_wudang_cultivation_cases.mjs';

const conditionNames = ['drunk', 'ill_kesou', 'freezing', 'damo_luanqi', 'bandaged'];
const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const val = x => x ?? 0;
const trunc = Math.trunc;

export function wudangDispelConditions(catalog, options) {
    return dispelConditions(catalog, options);
}

export function dispelConditions(catalog, { smoke = false, samples = 100 } = {}, profile = {}) {
    const school = profile.school ?? 'wudang', family = profile.family ?? '武当派';
    const source = catalog.skills.find(s => s.id === 'force/dispel');
    const entry = source?.entries.find(e => e.role === 'exert')?.id;
    assert.ok(entry, '缺少公共 dispel 原入口');
    const result = [];
    function add(force, name, other, level = 200, extra = {}) {
        const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000,
            jing: 10000, eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000,
            str: 36, int: 36, con: 36, dex: 36, jiali: 0, combat_exp: 100000000,
            character: '光明磊落', breakup: 0, 'special_skill/divine': 0, 'immune/poison': 0 };
        const actor = { skills: { force: level, [force]: level, ...profile.skills, ...extra.skills },
            mappings: { force }, preparations: {}, properties: { ...properties,
                'family/family_name': family, ...extra.properties } };
        const target = { skills: { force: 600 }, mappings: {}, preparations: {}, properties: { ...properties } };
        const victim = other ? target : actor;
        Object.assign(victim.properties, extra.victimProperties);
        victim.conditions = { [name]: extra.condition ?? (['freezing', 'damo_luanqi'].includes(name)
            ? { level: 200, remain: 100, id: 'foreign', name: name === 'freezing' ? '寒冰真气' : '乱气之扰' } : 20) };
        Object.assign(victim.conditions, extra.additionalConditions);
        if (extra.busy) actor.busy = 2;
        if (extra.targetBusy) target.busy = 3;
        if (extra.noForceMap) actor.mappings = {};
        result.push({ id: `school-${school}-dispel-${force}-${name}-${other ? 'other' : 'self'}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method: 'exert', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school, family, collection_group: `${school}-dispel`,
                combination: extra.suffix ?? 'base', skill: force, usage: 'force', ability: 'dispel', level,
                actor, target, named_participants: true, observation: 'single_action_immediate',
                action: `exert dispel${other ? ' right' : ''}`, other, condition_name: name,
                fighting: extra.fighting ?? false, observe_seconds: 0, not_applicable: '',
                expected: extra.expected ?? 'observed',
                qualification_sources: [source.path, `kungfu/skill/${force}.c`, 'kungfu/skill/force.c',
                    'cmds/skill/exert.c', 'inherit/skill/skill.c', 'feature/condition.c', 'feature/action.c',
                    'feature/skill.c', 'mudcore/inherit/action.c', ...(profile.sources ?? ['kungfu/class/wudang/zhang.c']),
                    ...Object.keys(victim.conditions).map(key => `kungfu/condition/${key}.c`),
                    ...({ ill_kesou: ['inherit/condition/illness.c'], freezing: ['inherit/condition/poison.c'],
                        damo_luanqi: ['inherit/condition/damo.c'] }[name] ?? [])],
                qualification_note: '真实非巫师USER从原exert进入公共force/dispel；通过原apply_condition准备异常快照，非自然染病或施毒证明。三门武当内功分别记录；辅助医毒技能、转世、移经易脉及免毒为独立实验赋值，不证明武当教学提供。只观察即时驱除和原忙乱值，不运行异常伤害/过期心跳，不将受理当清除，也不将忙乱单位当实际秒数。',
            } });
    }
    for (const force of profile.forces ?? wudangForces) for (const other of [false, true]) {
        for (const level of [200, 400, 800]) for (const name of conditionNames.slice(0, 4)) add(force, name, other, level);
        const edge = (name, suffix, extra = {}) => add(force, name, other, 200, { checks: 2, ...extra, suffix: '-' + suffix });
        edge('bandaged', 'not-dispellable');
        edge('drunk', 'force-exact', { condition: other ? 150 : 250 });
        edge('drunk', 'force-short', { condition: other ? 151 : 251 });
        edge('drunk', 'neili299', { properties: { neili: 299 } });
        edge('drunk', 'neili300', { properties: { neili: 300 } });
        edge('drunk', 'busy', { busy: true, expected: 'refused' });
        edge('drunk', 'no-force-map', { noForceMap: true, expected: 'refused' });
        edge('drunk', 'with-bandage', { additionalConditions: { bandaged: 20 } });
        if (other) {
            edge('drunk', 'target-busy', { targetBusy: true });
            edge('drunk', 'target-fighting', { fighting: true });
        }
        edge('ill_kesou', 'force-exact', { condition: other ? 140 : 240 });
        edge('ill_kesou', 'force-short', { condition: other ? 141 : 241 });
        edge('ill_kesou', 'neili-exact', { condition: 30, properties: { neili: other ? 700 : 400 } });
        edge('ill_kesou', 'neili-short', { condition: 30, properties: { neili: other ? 699 : 399 } });
        for (const name of ['freezing', 'damo_luanqi']) {
            const cnd = { level: 200, remain: 100, id: 'foreign', name: name === 'freezing' ? '寒冰真气' : '乱气之扰' };
            edge(name, 'force-exact', { condition: { ...cnd, level: other ? 240 : 290 } });
            edge(name, 'force-short', { condition: { ...cnd, level: other ? 241 : 291 } });
            edge(name, 'partial', { condition: { ...cnd, remain: 20000 } });
            edge(name, 'permanent', { condition: { ...cnd, remain: -1 } });
            edge(name, 'minimum-resource', { properties: { neili: other ? 450 : 300 } });
            if (other) edge(name, 'inner-neili199', { properties: { neili: 449 } });
            edge(name, 'creator', { condition: { ...cnd, level: 5000, remain: 20000, id: 'left' } });
            edge(name, 'creator-force49', { condition: { ...cnd, level: 5000, id: 'left' },
                skills: { force: 2, [force]: 48 } });
            edge(name, 'auxiliary-power', { skills: { poison: 200, medical: 200, 'dispel-poison': 100 } });
            edge(name, 'auxiliary-gate', { condition: { ...cnd, level: 350 },
                skills: { poison: 200, medical: 200, 'dispel-poison': 100 } });
            for (const [suffix, prop] of [['rebirth', { breakup: 1 }], ['divine', { 'special_skill/divine': 1 }],
                ['immunity', { 'immune/poison': 200 }], ['full-immunity', { 'immune/poison': -1 }]])
                edge(name, suffix, { condition: { ...cnd, level: 350 }, victimProperties: prop });
        }
    }
    if (profile.note) for (const c of result) c.parameters.qualification_note = profile.note;
    return result;
}

// Source-derived single-condition oracle, not observed daemon return values.
export function dispelExpected(before, parameters) {
    const [actor, target] = before, other = parameters.other, victim = other ? target : actor;
    const states = structuredClone(victim.conditions || {}), name = parameters.condition_name, cnd = states[name];
    assert.ok(conditionNames.includes(name));
    const entry = other ? 250 : 100;
    let cost = entry, result = 'ignored';
    if (parameters.expected === 'refused' || actor.neili < 300 || (other && (target.busy || parameters.fighting)))
        return { conditions: states, cost: 0, actorBusy: [val(actor.busy), val(actor.busy)], targetBusy: [val(target.busy), val(target.busy)], result: 'not_applied' };
    const force = actor.effective_skills.force, available = actor.neili - entry;
    if (name === 'drunk' || name === 'ill_kesou') {
        let need = cnd + (name === 'drunk' ? 50 : 60), extra = name === 'drunk' ? 0 : cnd * 10;
        if (other) { need = trunc(need * 3 / 2); extra = trunc(extra * 3 / 2); }
        result = force < need || available < extra ? 'failed' : 'cleared';
        if (result === 'cleared') { cost += extra; delete states[name]; }
    } else if (name !== 'bandaged') {
        const poison = name === 'freezing', props = victim.cultivation;
        let need = cnd.level + 10;
        if (props.breakup) need = trunc(need * (poison ? 7 : 6) / 10);
        if (poison) {
            if (props['special_skill/divine']) need = trunc(need * 7 / 10);
            need = props['immune/poison'] === -1 ? 1 : Math.max(1, need - props['immune/poison']);
        }
        if (other) need += trunc(need / 5);
        const own = cnd.id === actor.id;
        if (own) need = 50;
        const ps = val(actor.effective_skills.poison), medical = val(actor.effective_skills.medical);
        const boost = val(actor.skills['dispel-poison']) + val(actor.temp.apply['dispel-poison']);
        const my = force + (poison ? trunc(ps / 5) + trunc(medical / 5) + boost : 0);
        result = 'failed';
        if (available >= 200 && my >= need) {
            if (own) { cost += other ? 150 : 100; delete states[name]; result = 'cleared'; }
            else {
                let power = poison ? my + boost : force + trunc(ps / 2) + trunc(medical / 4);
                if (poison && props.breakup) power += trunc(power * 3 / 10);
                if (poison && props['special_skill/divine']) power += trunc(power * 3 / 10);
                const div = other ? 4 : 2, remain = cnd.remain === -1 ? 10000 : cnd.remain;
                const reduction = trunc(trunc(available * power / (cnd.level + 1)) / div);
                if (reduction >= remain) {
                    cost += trunc(remain * div * (cnd.level + 1) / power);
                    delete states[name]; result = 'cleared';
                } else {
                    cost += available; states[name].remain = remain - reduction; result = 'partial';
                }
            }
        }
    }
    const ok = result === 'cleared' || result === 'partial';
    return { conditions: states, cost, result,
        actorBusy: result === 'ignored' ? [other ? 2 : 1, other ? 2 : 1]
            : ok ? (other ? [2, 4] : [1, 2]) : other ? [6, 11] : [3, 5],
        targetBusy: !other ? [val(target.busy), val(target.busy)] : result === 'ignored' ? [1, 1] : ok ? [1, 2] : [4, 7] };
}

export function validateWudangDispelRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(condition.method, 'exert'); assert.equal(p.observe_seconds, 0);
    assert.equal(raw.outcome, p.expected); assert.deepEqual(raw.after, raw.immediate);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 0);
    assert.equal(raw.launches.length, p.expected === 'refused' ? 0 : 1);
    if (raw.launches.length) { assert.equal(raw.launches[0].skill, 'force'); assert.equal(raw.command_accepted, 1); }
    else assert.ok(raw.reason);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side], a = raw.after[side];
        assert.equal(b.id, side ? 'right' : 'left');
        assert.equal(b.weapon, 'none'); assert.deepEqual(b.mappings, cfg.mappings);
        assert.deepEqual(b.conditions || {}, cfg.conditions || {}, '原异常准备快照');
        for (const [key, n] of Object.entries(cfg.skills)) assert.equal(b.skills[key], n);
        for (const key of resources) assert.equal(b[key], cfg.properties[key]);
        for (const key of ['breakup', 'special_skill/divine', 'immune/poison']) assert.equal(b.cultivation[key], cfg.properties[key]);
        for (const key of resources.filter(k => k !== 'neili')) assert.equal(a[key], b[key]);
        assert.deepEqual(a.temp.apply, b.temp.apply); assert.equal(val(raw.metrics[side].neili_recovery), 0);
        assert.ok(Object.hasOwn(b, 'busy')); assert.equal(val(b.busy), cfg.busy ?? 0);
    }
    const e = dispelExpected(raw.before, p), side = p.other ? 1 : 0;
    assert.deepEqual(raw.after[side].conditions || {}, e.conditions);
    assert.deepEqual(raw.after[1 - side].conditions || {}, raw.before[1 - side].conditions || {});
    assert.equal(raw.after[0].neili, raw.before[0].neili - e.cost);
    assert.equal(val(raw.metrics[0].neili_cost), e.cost);
    assert.equal(raw.after[1].neili, raw.before[1].neili); assert.equal(val(raw.metrics[1].neili_cost), 0);
    for (const [side, range] of [[0, e.actorBusy], [1, e.targetBusy]]) {
        assert.ok(Object.hasOwn(raw.after[side], 'busy'));
        const busy = val(raw.after[side].busy);
        assert.ok(Number.isInteger(busy));
        assert.ok(busy >= range[0] && busy <= range[1], '原外层忙乱范围');
    }
}
