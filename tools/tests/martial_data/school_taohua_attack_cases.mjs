// Unregistered offline preparation for original Taohua ordinary attacks.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

export const taohuaAttacks = [
    { skill: 'canglang-zhi', usage: 'finger', levels: [0, 10, 20, 30, 40, 50] },
    { skill: 'pikong-zhang', usage: 'strike', levels: [0, 30, 60, 120] },
    { skill: 'luoying-shenzhang', usage: 'strike', levels: [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220] },
    { skill: 'xuanfeng-tui', usage: 'unarmed', levels: [0, 40, 80, 120, 140, 160, 180, 200] },
    { skill: 'lanhua-shou', usage: 'hand', levels: [0, 30, 60, 80, 100, 120, 140, 160] },
    { skill: 'luoying-shenjian', usage: 'sword', levels: [0, 20, 40, 60, 80, 100, 120] },
];
const sha = value => createHash('sha256').update(value).digest('hex');
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const pool = { qi: 100000, eff_qi: 100000, max_qi: 100000, jing: 100000,
    eff_jing: 100000, max_jing: 100000, neili: 3000, max_neili: 3000,
    combat_exp: 100000001, jiali: 0, str: 36, int: 36, con: 36, dex: 36,
    gender: '男性', shen: 0, character: '光明磊落' };
export const taohuaAttackSourcePaths = [...new Set([
    ...taohuaAttacks.flatMap(d => [`kungfu/skill/${d.skill}.c`, `kungfu/skill/${d.usage}.c`]),
    'kungfu/skill/force.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c', 'kungfu/skill/jingluo-xue.c',
    'kungfu/class/taohua/huang.c', 'kungfu/class/taohua/feng.c', 'kungfu/class/taohua/rong.c',
    'feature/skill.c', 'feature/attack.c', 'feature/attribute.c', 'feature/damage.c', 'feature/equip.c',
    'feature/action.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c', 'mudcore/inherit/action.c',
    'inherit/char/char.c', 'inherit/skill/skill.c', 'inherit/weapon/sword.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/daemons/itemd.c', 'include/combat.h',
])];
export const taohuaAttackFixtureRequirements = [
    'Unregistered preparation only. After the live Gumu series ends, add this group to existing selected-action and passive snapshot allowlists and freeze a new series.',
    'Reuse the original single do_attack call and original selected action. Never call query_action again to identify the selected move or force an outcome.',
    'Use two connected nonwizard USERs, one original preparation, jiali0 and no special force/dodge/parry mappings. No natural heartbeat or recovery is claimed.',
    'Reuse snapshots, resource counters, actual weapon ownership and original consistence handling. Capture character/family, fighting and conditions through the existing narrow snapshot configuration.',
    'The six styles have no own hit_ob. Preserve the original explicit zero/null return on a reached martial callback; dodged or parried attacks have no such call.',
    'Lanhua query_action itself can charge 300 neili before the attack is dodged or parried. Identify its original returned mapping, not the final damage, when counting this branch.',
];

export function taohuaAttackConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(taohuaAttackSourcePaths.map(path => [path, sha(readSource(path))]));
    const rows = [];
    function add(d, level, variant, extra = {}) {
        const source = catalog.skills.find(s => s.id === d.skill);
        assert.equal(source?.path, `kungfu/skill/${d.skill}.c`);
        assert.equal(source.sha256, evidence[source.path]);
        const actor = { skills: { [d.usage]: level, [d.skill]: level, force: 400,
            parry: 600, dodge: 600, ...extra.skills }, mappings: { [d.usage]: d.skill },
            preparations: d.usage === 'sword' ? {} : { [d.usage]: d.skill },
            properties: { ...pool, 'family/family_name': '桃花岛', ...extra.properties },
            ...(d.usage === 'sword' ? { equipment: { type: 'sword', hold: false } } : {}) };
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
            mappings: {}, preparations: {}, properties: { ...pool },
            equipment: { type: 'sword', hold: false } };
        rows.push({ id: `school-taohua-attack-${d.skill}-l${level}-${variant}`, stage: 'school',
            entry_id: source.path, method: 'ordinary', samples: smoke ? 1 : extra.checks ?? samples,
            parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-attack',
                skill: d.skill, usage: d.usage, ability: 'ordinary', level, variant, actor, target,
                combination: d.skill + '+basic-force', named_participants: true, fighting: true,
                target_state: 'living', action: 'ordinary', observation: 'single_action_immediate',
                observe_seconds: 0, expected: 'observed', not_applicable: '', capture_skill_loads: [],
                source_evidence: { ...evidence }, qualification_sources: taohuaAttackSourcePaths,
                qualification_note: '实验 USER 单技普攻，不等于原教师配功或同成本养成。基本内功400，招架和闪躲600不映射特殊技能，加力0。两人气血精神100000用于保留一次原结算；普通攻击不重选动作、不强制命中。兰花额外动作在原query_action内扣300，命中前费用与最后气血净损失分别记账。有限样本不保证每个招式均被随机选到。',
            } });
    }
    for (const d of taohuaAttacks) for (const level of [200, 400, 800]) add(d, level, 'baseline');
    const lanhua = taohuaAttacks.find(d => d.skill === 'lanhua-shou');
    for (const level of [200, 400, 800]) add(lanhua, level, 'extra-enabled', { skills: { 'jingluo-xue': 200 } });
    add(lanhua, 100, 'level100', { skills: { 'jingluo-xue': 200 }, checks: 2 });
    add(lanhua, 200, 'jingluo100', { skills: { 'jingluo-xue': 100 }, checks: 2 });
    add(lanhua, 200, 'neili1000', { skills: { 'jingluo-xue': 200 }, properties: { neili: 1000 }, checks: 2 });
    add(lanhua, 101, 'minimum-extra', { skills: { 'jingluo-xue': 101 }, properties: { neili: 1001 }, checks: 2 });
    return rows;
}

function count(metrics, key) {
    assert.ok(metrics && typeof metrics === 'object' && !Array.isArray(metrics), '缺少计数映射');
    const value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效计数：' + key);
    return value;
}
const normBusy = state => {
    assert.ok(Object.hasOwn(state, 'busy'), '缺少忙乱观测');
    assert.ok(state.busy === null || Number.isSafeInteger(state.busy) && state.busy >= 0);
    return state.busy ?? 0;
};
function checkState(state, cfg, side) {
    for (const key of ['userp', 'interactive', 'living']) assert.equal(state[key], 1, key);
    assert.equal(state.wizardp, 0); assert.equal(state.ghost, 0);
    assert.match(state.object, /^\/tests\/actor#\d+$/); assert.equal(state.id, side ? 'right' : 'left');
    assert.equal(state.fighting_opponent, 1); assert.equal(normBusy(state), 0);
    assert.deepEqual(state.skills, cfg.skills); assert.deepEqual(state.mappings, cfg.mappings);
    assert.deepEqual(state.preparations, cfg.preparations);
    assert.equal(state.secondary_weapon, 'none'); assert.deepEqual(state.secondary_weapon_details, {});
    assert.equal(state.handing, 'none'); assert.deepEqual(state.handing_details, {});
    assert.equal(state.weapon, cfg.equipment?.type ?? 'none');
    if (cfg.equipment) {
        assert.match(state.weapon_details?.object ?? '', /^\/tests\/sword#\d+$/);
        assert.deepEqual({ ...state.weapon_details, object: '' }, { object: '', program: '/tests/sword',
            skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100,
            material: null, rigidity: null, no_wield: null });
    } else assert.deepEqual(state.weapon_details, {});
    assert.ok(Object.hasOwn(state, 'conditions')); assert.deepEqual(state.conditions ?? {}, {});
    const apply = { armor: 100, ...(cfg.equipment ? { damage: 50, dodge: -1 } : {}) };
    assert.deepEqual(state.temp?.apply, apply);
    for (const [key, value] of Object.entries(cfg.properties))
        assert.equal(key.includes('/') || key === 'character' ? state.cultivation[key] : state[key], value, key);
    for (const [key, value] of Object.entries(cfg.skills))
        assert.equal(state.effective_skills[key], Math.trunc(value / 2)
            + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0), key);
}

export function validateTaohuaAttackRecord(raw, c) {
    const p = c.parameters, d = taohuaAttacks.find(x => x.skill === p.skill);
    assert.ok(d); assert.equal(p.collection_group, 'taohua-attack'); assert.equal(c.method, 'ordinary');
    assert.equal(raw.condition_id, c.id); assert.equal(raw.method, c.method); assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['actions', 'attacks', 'passives', 'interfaces', 'launches', 'dropped', 'skill_loads'])
        assert.ok(Array.isArray(raw[key]), key);
    for (const key of ['interfaces', 'launches', 'dropped', 'skill_loads']) assert.equal(raw[key].length, 0, key);
    checkState(raw.before[0], p.actor, 0); checkState(raw.before[1], p.target, 1);
    assert.notEqual(raw.before[0].object, raw.before[1].object);
    assert.deepEqual(raw.after, raw.immediate);
    assert.equal(raw.actions.length, 1); assert.equal(raw.attacks.length, 1);
    const action = raw.actions[0], attack = raw.attacks[0];
    for (const e of [action, attack]) { assert.equal(e.actor, 0); assert.equal(e.target, 1); }
    assert.equal(action.skill, p.skill); assert.equal(attack.type, 0); assert.ok([0, -1, -2].includes(attack.result));
    const chosen = action.action;
    assert.ok(chosen && typeof chosen.action === 'string' && chosen.action.length > 0);
    const extra = d.skill === 'lanhua-shou' && chosen.weapon === '兰花指';
    if (extra) {
        assert.ok(p.actor.skills[d.skill] > 100 && p.actor.skills['jingluo-xue'] > 100 && p.actor.properties.neili > 1000);
        for (const [key, value] of Object.entries({ attack: 100, dodge: 300, parry: 300, damage: 100, force: 200, damage_type: '点穴' }))
            assert.equal(chosen[key], value, key);
        assert.equal(Object.hasOwn(chosen, 'lvl'), false);
    } else {
        const last = d.levels.findLastIndex(n => p.actor.skills[d.skill] > n);
        assert.ok(last >= 0 && d.levels.slice(0, last + 1).includes(chosen.lvl));
        assert.ok(Number.isSafeInteger(chosen.force) && chosen.force >= 0);
        assert.ok(Number.isSafeInteger(chosen.damage) && chosen.damage >= 0);
        assert.equal(chosen.weapon, undefined);
    }
    assert.ok(raw.passives.length <= 1);
    if (attack.result !== 0) assert.equal(raw.passives.length, 0);
    for (const e of raw.passives) {
        assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.route, 'martial');
        assert.equal(e.skill, p.skill); assert.equal(e.factor, 0);
        assert.ok(Object.hasOwn(e, 'result')); assert.ok(e.result === null || e.result === 0);
        assert.equal(e.before?.length, 2); assert.deepEqual(e.after, e.before);
        assert.ok(Number.isSafeInteger(e.incoming) && e.incoming >= 0);
        for (const side of [0, 1]) assert.equal(e.before[side].object, raw.before[side].object);
        assert.equal(e.before[0].neili, raw.before[0].neili - (extra ? 300 : 0));
    }
    for (const side of [0, 1]) {
        const b = raw.before[side], a = raw.immediate[side], m = raw.metrics[side];
        assert.equal(a.object, b.object); assert.equal(a.userp, 1); assert.equal(a.interactive, 1);
        assert.equal(a.wizardp, 0); assert.equal(a.living, 1); assert.equal(a.ghost, 0); assert.equal(normBusy(a), 0);
        assert.deepEqual(a.skills, b.skills); assert.deepEqual(a.mappings, b.mappings);
        assert.deepEqual(a.preparations, b.preparations); assert.deepEqual(a.temp.apply, b.temp.apply);
        assert.deepEqual(a.conditions ?? {}, {}); assert.ok(Object.hasOwn(a, 'conditions'));
        for (const key of ['max_qi', 'max_jing', 'max_neili']) assert.equal(a[key], b[key]);
        for (const key of health) {
            assert.ok(Number.isSafeInteger(a[key]) && a[key] >= 0);
            assert.equal(b[key] - a[key], count(m, key + '_cost'));
            assert.equal(count(m, key + '_recovery'), 0);
            if (side === 0 && key !== 'neili' || side === 1 && !['qi', 'eff_qi'].includes(key)) assert.equal(a[key], b[key]);
        }
        for (const key of ['direct', 'heartbeats']) assert.equal(count(m, key), 0);
        for (const [key, result] of [['hit', 0], ['dodge', -1], ['parry', -2]])
            assert.equal(count(m, key), Number(side === 0 && attack.result === result), key);
        for (const key of ['quick', 'riposte']) assert.equal(count(m, key), 0, key);
        assert.equal(a.weapon, b.weapon);
        const details = structuredClone(b.weapon_details);
        if (a.weapon !== 'none') {
            const mayWear = side === 0 && attack.result === 0 && raw.passives.length === 1;
            assert.ok([details.consistence, details.consistence - Number(mayWear)].includes(a.weapon_details.consistence));
            details.consistence = a.weapon_details.consistence;
        }
        assert.deepEqual(a.weapon_details, details);
    }
    assert.equal(raw.before[0].neili - raw.immediate[0].neili, extra ? 300 : 0);
    if (attack.result !== 0) {
        assert.equal(raw.before[1].qi, raw.immediate[1].qi);
        assert.equal(raw.before[1].eff_qi, raw.immediate[1].eff_qi);
    }
}

export function taohuaAttackEffects(records, condition) {
    const valid = [];
    for (const row of records) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.outcome, row.raw.outcome);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        if (['error', 'not_applicable'].includes(row.outcome)) continue;
        validateTaohuaAttackRecord(row.raw, condition); valid.push(row.raw);
    }
    const extra = valid.map(r => r.actions[0].action.weapon === '兰花指');
    return { samples: valid.length, unknown_or_unobserved: records.length - valid.length,
        hit: probability(valid.filter(r => r.attacks[0].result === 0).length, valid.length),
        lanhua_extra_action: condition.parameters.skill === 'lanhua-shou' ? probability(extra.filter(Boolean).length, extra.length) : null,
        move_counts: Object.fromEntries([...new Set(valid.map(r => r.actions[0].action.skill_name ?? r.actions[0].action.weapon ?? r.actions[0].action.action))]
            .map(move => [move, valid.filter(r => (r.actions[0].action.skill_name ?? r.actions[0].action.weapon ?? r.actions[0].action.action) === move).length])),
        actor_neili_cost: distribution(valid.map(r => r.before[0].neili - r.immediate[0].neili)),
        target_qi_loss: distribution(valid.map(r => r.before[1].qi - r.immediate[1].qi)),
        target_wound: distribution(valid.map(r => r.before[1].eff_qi - r.immediate[1].eff_qi)),
    };
}
