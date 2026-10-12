// Registered Gumu use of Quanzhen sword; no game-source changes.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';
import { validateGumuAttackLoads } from './school_gumu_weapons_cases.mjs';

const skill = 'quanzhen-jian', group = 'gumu-quanzhen';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const pool = { qi: 1000000, eff_qi: 1000000, max_qi: 1000000, jing: 1000000, eff_jing: 1000000,
    max_jing: 1000000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 36, shen: 0, gender: '女性', character: '光明磊落' };
const nativeForces = { yunv: 'yunv-xinjing', surge: 'surge-force' };
const minimum = { chan: [80, 100], ding: [100, 150], hua: [200, 500], lian: [180, 400] };
const palms = ['haotian-zhang', 'chongyang-shenzhang'];
// Original fixed action values; the level-300 entry is instead bounded by its one real load.
const fixedActions = [
    [0, 70, 10, 10, 13], [10, 74, 15, 20, 19], [20, 85, 20, 25, 21], [40, 118, 25, 30, 28],
    [60, 130, 30, 35, 32], [80, 150, 33, 45, 39], [100, 170, 36, 42, 48], [120, 193, 40, 55, 54],
    [140, 220, 45, 55, 63], [160, 240, 50, 58, 75], [180, 280, 55, 65, 88],
    [200, 340, 57, 62, 103], [220, 370, 60, 66, 135],
];
const actionLevels = { [skill]: [...fixedActions.map(a => a[0]), 300],
    'haotian-zhang': [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 80, 100, 110, 120, 130, 140, 150, 160],
    'chongyang-shenzhang': [0, 15, 30, 50, 70, 90, 110, 130, 150] };
const grant = ability => `can_perform/${skill}/${ability}`;
const eff = (actor, usage) => Math.trunc((actor.skills[usage] ?? 0) / 2)
    + (actor.skills[actor.mappings[usage]] ?? 0) + (actor.temp?.['apply/' + usage] ?? 0);

export const gumuQuanzhenFixtureRequirements = [
    'Register only this group, freeze its direct imports, pass frozen condition to its validator/report, and run the public plan gate after registration.',
    'Capture the original first quanzhen-jian load through enable parry with a real USER and learned basic parry; retain one global table/load_id and original RNG across all levels.',
    'Reuse original selected-action/attack/hit_ob observers only for this group; record attack_usage/attack_skill, current weapon/object and apply_attack without invoking a skill again.',
    'Extend the existing isolated do_damage probe arguments with already-computed type/damage/percent; record directs with actor/target and current weapon/object only in this group, and prove reverse restoration.',
    'Capture family/grants/wall/character, raw/effective skills, maps/preparations, equipment, busy and resource counters; prepare busy with restore_busy, not start_busy.',
    'Allow the existing original unconscious-target preparation for this group, move its terminal to preparation.terminals and reset combat observation counters before the sample.',
];

export function gumuQuanzhenAllowed(p) {
    if (p.ability === 'ordinary') return true;
    const a = p.actor, ability = p.ability, [level, neili] = minimum[ability];
    return !a.busy && p.fighting && p.target_state === 'living' && a.properties[grant(ability)] > 0
        && a.equipment?.type === 'sword' && a.mappings.sword === skill
        && a.skills[skill] >= level && a.properties.neili >= neili
        && (ability !== 'chan' || !p.target.busy)
        && (ability !== 'ding' || eff(a, 'force') >= 150)
        && (ability !== 'hua' || a.skills['xiantian-gong'] >= 100
            && a.mappings.force === 'xiantian-gong' && a.properties.max_neili >= 4500)
        && (ability !== 'lian' || palms.includes(a.mappings.strike));
}

export function gumuQuanzhenConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source = catalog.skills.find(s => s.id === skill);
    assert.ok(source?.path && /^[a-f0-9]{64}$/.test(source.sha256), '缺少全真剑原源码');
    const result = [];
    function add(tag, ability = 'ordinary', level = 200, extra = {}) {
        const force = nativeForces[extra.native ?? 'yunv']; assert.ok(force);
        const actor = { skills: { sword: level, [skill]: level, parry: level, force: level,
            [force]: level, dodge: level, 'yunv-shenfa': level, unarmed: level, strike: level,
            ...extra.skills }, mappings: { sword: skill, parry: skill, force, dodge: 'yunv-shenfa' },
        preparations: {}, properties: { ...pool, gender: force === 'surge-force' ? '男性' : '女性',
            'family/family_name': '古墓派', 'can_learn/yunv-xinjing/wall': 0,
            ...(ability === 'ordinary' ? {} : { [grant(ability)]: 1 }), ...extra.properties },
        ...(extra.noWeapon ? {} : { equipment: { type: extra.weapon ?? 'sword', hold: false } }),
        ...(extra.busy ? { busy: extra.busy } : {}), ...(extra.temp ? { temp: extra.temp } : {}) };
        if (extra.xiantian) {
            actor.skills['xiantian-gong'] = extra.xiantian;
            if (extra.mapXiantian) actor.mappings.force = 'xiantian-gong';
        }
        if (extra.palm) {
            actor.skills[extra.palm] = extra.palmLevel ?? level;
            if (!extra.noPalmMap) {
                actor.mappings.strike = extra.palm;
                actor.preparations.strike = extra.palm;
            }
        }
        if (extra.wrongPalm) {
            actor.skills['tianluo-diwang'] = level;
            actor.mappings.strike = 'tianluo-diwang'; actor.preparations.strike = 'tianluo-diwang';
        }
        if (extra.noMap) delete actor.mappings.sword;
        if (extra.noForceMap) delete actor.mappings.force;
        if (extra.wrongMap) { actor.skills['yunv-jian'] = level; actor.mappings.sword = 'yunv-jian'; }
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, preparations: {}, properties: { ...pool, gender: '男性' },
            equipment: { type: 'sword', hold: false }, ...(extra.targetBusy ? { busy: extra.targetBusy } : {}) };
        const perform = ability === 'ordinary' ? null : catalog.skills.find(s => s.id === `${skill}/${ability}`);
        const entry = ability === 'ordinary' ? source.path : perform?.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry, '缺少原入口：' + ability);
        const parameters = { school: 'gumu', family: '古墓派', collection_group: group, skill, ability,
            usage: 'sword', level, combination: `${skill}+${actor.mappings.force}+yunv-shenfa`,
            scope: extra.xiantian || extra.palm ? 'mixed-diagnostic' : extra.teacher ? 'teacher-skill-reference' : 'pure-gumu',
            teacher_reference: extra.teacher ?? '', actor, target, fighting: extra.fighting ?? true,
            target_state: extra.targetState ?? 'living', action: ability === 'ordinary' ? 'ordinary' : `perform sword.${ability}`,
            observation: 'single_action_immediate', observe_seconds: 0, expected: '', not_applicable: '',
            gate_expectation: extra.gate ?? 'random',
            capture_skill_loads: [{ skill, path: source.path, sha256: source.sha256 }],
            qualification_sources: [...new Set([source.path, ...(perform ? [perform.path] : []),
                ...Object.keys(actor.skills).map(name => `kungfu/skill/${name}.c`),
                'kungfu/class/gumu/longnv.c', 'kungfu/class/gumu/yang.c', 'kungfu/class/gumu/gumu.h',
                'cmds/skill/enable.c', 'cmds/skill/perform.c', 'feature/skill.c', 'feature/attack.c',
                'feature/attribute.c', 'feature/action.c', 'feature/dbase.c', 'feature/damage.c', 'feature/equip.c',
                'mudcore/inherit/action.c', 'inherit/skill/force.c', 'inherit/skill/skill.c', 'inherit/char/char.c',
                'inherit/weapon/sword.c', 'inherit/weapon/whip.c', 'include/combat.h', 'adm/daemons/combatd.c'])],
            qualification_note: '真实非巫师USER、加力与普通装备明确；200/400/800是归一化技能实验，师父档仅复用已学技能而非复制NPC或证明其激发全真剑。纯古墓无先天功、昊天掌或重阳掌，hua/lian拒绝单列；混合诊断仅说明原接口可达性，不代表古墓可传授。定阳针计入已学先天，化三清只计已配置且valid_enable剑法的原技能；不改公式或随机。大气血池避免通常提前失活，实际终态仍保留。首次300招全局表与原加载者跨样本不变。三连环原参数1是TYPE_RIPOSTE而非TYPE_QUICK；剑、掌、腿及减伤前do_damage输入和最终损血分列。' };
        parameters.expected = gumuQuanzhenAllowed(parameters) ? 'observed' : 'refused';
        result.push({ id: `school-gumu-qz-${tag}`, stage: 'school', entry_id: entry,
            method: ability === 'ordinary' ? 'ordinary' : 'perform', samples: smoke ? 1 : extra.checks ?? samples, parameters });
    }
    for (const native of Object.keys(nativeForces)) for (const level of [200, 400, 800]) {
        for (const jiali of [0, 50]) add(`${native}-ordinary-l${level}-j${jiali}`, 'ordinary', level, { native, properties: { jiali } });
        for (const ability of ['chan', 'ding']) add(`${native}-${ability}-l${level}`, ability, level, { native });
        for (const ability of ['hua', 'lian']) add(`${native}-${ability}-pure-l${level}`, ability, level, { native, checks: 2 });
    }
    for (const level of [300, 301]) add(`ordinary-action-${level}`, 'ordinary', level);
    add('teacher-longnv', 'ordinary', 200, { teacher: 'longnv', skills: { sword: 220, force: 220, 'yunv-xinjing': 220 } });
    add('teacher-yang', 'ordinary', 380, { teacher: 'yang', native: 'surge',
        skills: { force: 390, 'surge-force': 390, parry: 385, dodge: 350, 'yunv-shenfa': 350, unarmed: 385 } });
    for (const level of [200, 400, 800]) {
        add(`mixed-ding-l${level}`, 'ding', level, { xiantian: level });
        add(`mixed-hua-l${level}`, 'hua', level, { xiantian: level, mapXiantian: true });
        for (const [index, palm] of palms.entries()) add(`mixed-lian-p${index}-l${level}`, 'lian', level, { palm });
    }
    const mixed = ability => ability === 'hua' ? { xiantian: 200, mapXiantian: true }
        : ability === 'lian' ? { palm: palms[0] } : {};
    for (const ability of ['chan', 'ding', 'hua', 'lian']) {
        for (const [tag, targetSkills, gate, checks] of [
            ['weak', { force: 0, parry: 0 }, ability === 'chan' || ability === 'hua' ? 'success' : 'random', ability === 'chan' ? 2 : samples],
            ['strong', { force: 100000, parry: 100000 }, 'failure', ability === 'lian' ? samples : 2],
        ]) add(`${ability}-${tag}`, ability, 200, { ...mixed(ability), targetSkills, gate, checks });
        for (const [tag, extra] of [
            ['no-grant', { properties: { [grant(ability)]: 0 } }], ['no-weapon', { noWeapon: true }],
            ['wrong-weapon', { weapon: 'whip' }], ['no-map', { noMap: true }], ['wrong-map', { wrongMap: true }],
            ['busy', { busy: 2 }], ['no-fight', { fighting: false }], ['unconscious', { targetState: 'unconscious' }],
            ['skill-below', { skills: { [skill]: minimum[ability][0] - 1 } }],
            ['skill-at', { skills: { [skill]: minimum[ability][0] } }],
            ['neili-below', { properties: { neili: minimum[ability][1] - 1 } }],
            ['neili-at', { properties: { neili: minimum[ability][1] } }],
        ]) add(`${ability}-${tag}`, ability, 200, { ...mixed(ability), ...extra, checks: 2 });
    }
    add('chan-target-busy', 'chan', 200, { targetBusy: 1, checks: 2 });
    for (const level of [149, 150]) add(`ding-force-${level}`, 'ding', 200,
        { noForceMap: true, skills: { force: level * 2 }, checks: 2 });
    for (const level of [99, 100]) add(`hua-xiantian-${level}`, 'hua', 200,
        { xiantian: level, mapXiantian: true, checks: 2 });
    add('hua-learned-not-mapped', 'hua', 200, { xiantian: 200, checks: 2 });
    for (const max_neili of [4499, 4500]) add(`hua-max-neili-${max_neili}`, 'hua', 200,
        { xiantian: 200, mapXiantian: true, properties: { max_neili }, checks: 2 });
    add('lian-palm-unmapped', 'lian', 200, { palm: palms[0], noPalmMap: true, checks: 2 });
    add('lian-palm-wrong-map', 'lian', 200, { palm: palms[0], wrongPalm: true, checks: 2 });
    add('lian-palm-level1', 'lian', 200, { palm: palms[0], palmLevel: 1, checks: 2 });
    add('hua-existing-attack', 'hua', 200, { xiantian: 200, mapXiantian: true,
        targetSkills: { force: 0, parry: 0 }, temp: { 'apply/attack': 17 }, gate: 'success', checks: 2 });
    return result;
}

function map(value, label) { assert.ok(value && typeof value === 'object' && !Array.isArray(value), label); return value; }
function integer(value, label) { assert.ok(Number.isSafeInteger(value), label); return value; }
function count(values, key) {
    map(values, '缺少原计数映射'); const value = Object.hasOwn(values, key) ? values[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, key); return value;
}
const apply = (s, key) => {
    const values = map(s.temp?.apply, '缺少apply');
    return integer(Object.hasOwn(values, key) ? values[key] : 0, '无效apply/' + key);
};
function busy(s) { assert.ok(Object.hasOwn(s, 'busy')); return integer(s.busy === null ? 0 : s.busy, '无效busy'); }
function identity(s, loading = false) {
    assert.ok(typeof s?.object === 'string' && s.object.length > 0);
    for (const key of ['userp', 'playerp', 'interactive']) assert.equal(s[key], 1);
    assert.equal(s.wizardp, 0); for (const key of ['living', 'ghost', 'fighting_opponent']) assert.ok([0, 1].includes(s[key]), key);
    assert.ok(busy(s) >= 0); for (const key of health) integer(s[key], key);
    const temp = map(s.temp, '缺少临时属性映射');
    // First loading precedes equipment; only that snapshot may not have created apply yet.
    if (!loading || Object.hasOwn(temp, 'apply')) map(temp.apply, '缺少apply');
}
const effective = (s, key) => integer(s.effective_skills?.[key], '缺少原有效技能：' + key);

// query_skills(martial) returns ALL learned skills; only the configured sword-valid
// skills contribute. Accepted cases have exactly quanzhen-jian, not basic sword.
export function gumuQuanzhenHuaPower(state) {
    const keys = Object.keys(state.skills);
    const sum = keys.filter(key => [skill, 'yunv-jian'].includes(key)).slice(0, 5).reduce((n, key) => n + state.skills[key], 0);
    let level = Math.trunc(Math.pow(state.combat_exp * 10, 1 / 3)); level = Math.trunc(level * 4 / 5);
    assert.ok(level > 0);
    const base = state.skills['xiantian-gong'] + effective(state, 'sword');
    return base + Math.trunc(base * (sum * 4 / 100 / level));
}

function validateLoads(raw, p) {
    assert.equal(raw.skill_loads?.length, 1);
    const load = raw.skill_loads[0], expected = p.capture_skill_loads[0];
    for (const key of ['skill', 'path', 'sha256']) assert.equal(load[key], expected[key]);
    for (const key of ['load_id', 'run_id']) assert.ok(typeof load[key] === 'string' && load[key].length > 0);
    identity(load.state, true);
    for (const kind of ['skills', 'effective_skills']) for (const key of ['force', 'sword', 'dodge', 'parry'])
        assert.ok(integer(load.state[kind]?.[key], key) >= 0);
    for (const event of raw.actions) {
        assert.equal(event.actor, 0); assert.equal(event.target, 1);
        const a = map(event.action, '缺少原query_action结果');
        assert.ok(typeof a.action === 'string' && a.action.length > 0);
        assert.ok(typeof a.damage_type === 'string' && a.damage_type.length > 0);
        assert.ok(integer(a.lvl, '缺少原动作等级') < p.actor.skills[event.skill]);
        // Original SKILL::NewRandom limits selection to the last min(6,n) eligible entries.
        const eligible = actionLevels[event.skill]?.filter(level => level < p.actor.skills[event.skill]);
        assert.ok(eligible?.slice(-6).includes(a.lvl), '原NewRandom可选的末六式范围');
        if (event.skill !== skill) {
            assert.equal(p.ability, 'lian'); assert.equal(event.skill, p.actor.mappings.strike);
            assert.ok(palms.includes(event.skill)); continue;
        }
        assert.ok([0, 10, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 300].includes(a.lvl));
        if (a.lvl !== 300) {
            assert.deepEqual(['lvl', 'force', 'attack', 'dodge', 'damage'].map(key => a[key]), fixedActions.find(x => x[0] === a.lvl), '原静态招式数值');
            continue;
        }
        const s = load.state.skills;
        const base = { force: Math.trunc(s.force / 2), attack: Math.trunc(s.sword / 4),
            dodge: Math.trunc(s.dodge / 6), parry: Math.trunc(s.parry / 6), damage: Math.trunc(s.force / 4) };
        const spans = { force: s.force, attack: Math.trunc(s.sword / 2), dodge: Math.trunc(s.force / 3),
            parry: Math.trunc(s.parry / 3), damage: Math.trunc(s.sword / 2) };
        for (const key of Object.keys(base)) assert.ok(Number.isSafeInteger(a[key]) && a[key] >= base[key]
            && a[key] <= base[key] + Math.max(0, spans[key] - 1), '全局动作首次原始技能：' + key);
    }
}
export const validateGumuQuanzhenLoads = rows => validateGumuAttackLoads(rows.filter(r => (r.raw ?? r).outcome !== 'error'),
    [{ skill, usage: 'sword', dynamic: 300 }]);

function validatePassives(raw, p) {
    let cost = 0;
    for (const event of raw.passives) {
        assert.equal(event.actor, 0); assert.equal(event.target, 1);
        assert.ok(['force', 'martial'].includes(event.route));
        assert.equal(event.before?.length, 2); assert.equal(event.after?.length, 2);
        assert.ok(integer(event.incoming, '原hit_ob伤害') > 0); integer(event.factor, '原hit_ob加力');
        assert.ok(Object.hasOwn(event, 'result'));
        for (const side of [0, 1]) for (const phase of ['before', 'after']) {
            const s = event[phase][side]; identity(s); assert.equal(s.object, raw.before[side].object);
            assert.deepEqual(s.skills, raw.before[side].skills); assert.deepEqual(s.mappings, raw.before[side].mappings);
        }
        const b = event.before[0], a = event.after[0], spent = b.neili - a.neili;
        for (const side of [0, 1]) for (const key of health.filter(k => side !== 0 || k !== 'neili'))
            assert.equal(event.before[side][key], event.after[side][key]);
        if (event.route === 'martial') {
            assert.ok([skill, ...palms].includes(event.skill)); assert.equal(event.factor, 0);
            assert.ok(event.result === 0 || event.result === null); assert.equal(spent, 0);
        } else {
            assert.equal(p.ability, 'ordinary'); assert.equal(event.skill, raw.before[0].mappings.force);
            assert.equal(event.factor, raw.before[0].jiali); assert.ok(event.factor > 0);
            if (event.skill === 'surge-force') { integer(event.result); assert.equal(spent, event.factor); }
            else { assert.equal(event.skill, 'yunv-xinjing'); assert.ok(event.result === 0 || event.result === null); assert.equal(spent, 0); }
        }
        cost += spent;
    }
    return cost;
}
const randomRange = (value, base, span, label) => assert.ok(Number.isSafeInteger(value)
    && value >= base && value <= base + Math.max(0, span - 1), label);
const gate = (ap, dp, half) => (half ? Math.trunc(ap / 2) : 0) > dp ? 'success'
    : (half ? Math.trunc(ap / 2) : 0) + Math.max(0, ap - 1) <= dp ? 'failure' : 'random';

function validateWeaponWear(raw, side, accepted) {
    const before = raw.before[side], after = raw.immediate[side];
    assert.equal(after.weapon, before.weapon);
    const start = map(before.weapon_details, '缺少原持器快照'), end = map(after.weapon_details, '缺少结束持器快照');
    if (before.weapon === 'none') { assert.deepEqual(end, start); return; }
    const initial = integer(start.consistence, '缺少原武器耐久'), remaining = integer(end.consistence, '缺少结束武器耐久');
    assert.ok(initial >= 0 && remaining >= 0 && remaining <= initial, '原武器耐久不能增加或变负');
    const fixed = details => Object.fromEntries(Object.entries(details).filter(([key]) => key !== 'consistence'));
    assert.deepEqual(fixed(end), fixed(start), '原持器身份与固定属性未恢复');
    let opportunities = 0;
    if (accepted && before.weapon === 'sword' && start.material !== 'tian jing') {
        // combatd:759-775 calls the original weapon only after this positive martial callback.
        // The eventual attack damage can be zero; force callbacks and palm hits are not sword wear.
        opportunities += raw.passives.filter(event => event.actor === side && event.route === 'martial'
            && event.skill === skill && event.incoming > 0 && (event.result === 0 || event.result === null)
            && ['before', 'after'].every(phase => event[phase]?.[side]?.weapon === 'sword'
                && event[phase][side].weapon_details?.object === start.object)).length;
        // This fixed matrix has no target parry mapping or worn armour callback to stop direct damage
        // before combatd:1063-1070. UNARMED_ATTACK and nonpositive inputs cannot consume the sword.
        opportunities += raw.directs.filter(event => event.actor === side && event.type === 1 && event.damage > 0
            && event.weapon === 'sword' && event.weapon_object === start.object
            && !Object.hasOwn(raw.before[event.target].mappings, 'parry')
            && !Object.hasOwn(raw.before[event.target].temp, 'armor')).length;
    }
    // feature/equip:187 -> itemd:806-827 reduces at most one point per original weapon callback.
    assert.ok(initial - remaining <= opportunities, '武器磨损超出原持剑命中回调机会');
}

export function validateGumuQuanzhenRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, group); assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, condition.method);
    assert.equal(raw.outcome, p.expected); assert.equal(p.expected, gumuQuanzhenAllowed(p) ? 'observed' : 'refused');
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['attacks', 'actions', 'directs', 'passives', 'launches', 'interfaces', 'terminals', 'callbacks', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    for (const key of ['interfaces', 'callbacks', 'dropped']) assert.equal(raw[key].length, 0);
    assert.deepEqual(raw.after, raw.immediate, '只采原即时结果'); assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    const [b, t] = raw.before, [a, end] = raw.immediate, accepted = raw.outcome === 'observed';
    assert.notEqual(b.object, t.object);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side], final = raw.immediate[side];
        for (const phase of ['before', 'immediate', 'after']) { identity(raw[phase][side]); assert.equal(raw[phase][side].object, state.object); }
        assert.deepEqual(state.skills, cfg.skills); assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.preparations, cfg.preparations);
        assert.equal(state.weapon, cfg.equipment?.type ?? 'none'); assert.equal(busy(state), cfg.busy ?? 0);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(effective(state, key), Math.trunc(value / 2)
            + (cfg.skills[cfg.mappings[key]] ?? 0) + apply(state, key));
        for (const [key, value] of Object.entries(cfg.properties)) assert.equal(key.includes('/') || key === 'character'
            ? state.cultivation?.[key] : state[key], side === 1 && p.target_state === 'unconscious' && ['qi', 'jing'].includes(key) ? 0 : value, key);
        for (const key of health) {
            assert.equal(count(raw.metrics[side], key + '_recovery'), 0);
            assert.equal(state[key] - final[key], count(raw.metrics[side], key + '_cost'), key + '账本不闭合');
            if (side === 0 && key !== 'neili' || side === 1 && final.living && ['jing', 'eff_jing', 'neili'].includes(key)) assert.equal(state[key], final[key]);
        }
        assert.deepEqual(final.skills, state.skills); assert.deepEqual(final.mappings, state.mappings); assert.deepEqual(final.preparations, state.preparations);
        assert.equal(apply(final, 'attack'), apply(state, 'attack'), '原攻击加成未回收');
        const withoutAttack = s => Object.fromEntries(Object.entries(s.temp.apply).filter(([key]) => key !== 'attack'));
        assert.deepEqual(withoutAttack(final), withoutAttack(state), '原卸装增益未恢复');
        validateWeaponWear(raw, side, accepted);
        assert.equal(count(raw.metrics[side], 'heartbeats'), 0); assert.equal(count(raw.metrics[side], 'quick'), 0);
        assert.equal(count(raw.metrics[side], 'direct'), raw.directs.filter(e => e.actor === side).length);
        assert.equal(count(raw.metrics[side], 'riposte'), raw.attacks.filter(e => e.actor === side && e.type === 1).length);
        for (const [key, result] of [['hit', 0], ['dodge', -1], ['parry', -2]])
            assert.equal(count(raw.metrics[side], key), raw.attacks.filter(e => e.actor === side && e.result === result).length);
    }
    assert.equal(b.living, 1); assert.equal(a.living, 1); assert.equal(b.ghost, 0); assert.equal(a.ghost, 0);
    assert.equal(t.living, p.target_state === 'unconscious' ? 0 : 1); assert.equal(t.ghost, 0);
    assert.equal(b.fighting_opponent, Number(p.fighting)); assert.equal(apply(b, 'attack'), p.actor.temp?.['apply/attack'] ?? 0);
    if (p.target_state === 'unconscious') {
        const prep = map(raw.preparation, '缺少原昏迷准备'); assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }]);
        identity(prep.before); identity(prep.after); assert.equal(prep.before.object, t.object); assert.deepEqual(prep.after, t);
        assert.equal(prep.before.living, 1); assert.equal(prep.before.qi, p.target.properties.qi); assert.equal(prep.before.jing, p.target.properties.jing);
    } else assert.equal(Object.hasOwn(raw, 'preparation'), false);
    validateLoads(raw, p);
    const launched = accepted && condition.method === 'perform';
    if (condition.method === 'perform') assert.equal(raw.command_accepted, Number(accepted));
    assert.equal(raw.launches.length, Number(launched)); assert.equal(count(raw.metrics[0], 'ability_launched'), Number(launched));
    assert.equal(count(raw.metrics[1], 'ability_launched'), 0);
    if (launched) assert.deepEqual(raw.launches[0], { actor: b.object, skill, argument: p.ability });
    if (!accepted) {
        assert.ok(typeof raw.reason === 'string' && raw.reason.length > 0);
        for (const key of ['attacks', 'actions', 'directs', 'passives', 'terminals']) assert.equal(raw[key].length, 0);
        for (const side of [0, 1]) { assert.equal(busy(raw.immediate[side]), busy(raw.before[side]));
            for (const key of health) assert.equal(count(raw.metrics[side], key + '_cost'), 0); }
        assert.deepEqual(end, t); return { accepted: false };
    }
    for (const terminal of raw.terminals) { assert.equal(terminal.side, 1); assert.ok(['death', 'unconscious'].includes(terminal.state)); }
    const passiveCost = validatePassives(raw, p), totalCost = count(raw.metrics[0], 'neili_cost'), cost = totalCost - passiveCost;
    for (const [i, hit] of raw.attacks.entries()) {
        assert.equal(hit.actor, 0); assert.equal(hit.target, 1); assert.ok([0, -1, -2].includes(hit.result)); assert.ok(integer(hit.damage) >= 0);
        assert.equal(hit.type === null ? 0 : hit.type, p.ability === 'lian' ? 1 : 0); assert.ok(Object.hasOwn(hit, 'type'));
        const palm = p.ability === 'lian' && i === 1;
        assert.equal(hit.attack_usage, palm ? 'strike' : 'sword'); assert.equal(hit.attack_skill, palm ? b.mappings.strike : skill);
        assert.equal(hit.weapon, palm ? 'none' : 'sword'); assert.equal(hit.weapon_object, palm ? '' : b.weapon_details.object);
        assert.ok(Object.hasOwn(hit, 'apply_attack'), '缺少实际攻击期 apply/attack');
        const attackApply = hit.apply_attack === null ? 0 : hit.apply_attack;
        assert.ok(Number.isSafeInteger(attackApply), '实际攻击期 apply/attack 不是整数或原未设置空值');
        assert.equal(attackApply, apply(b, 'attack') + (p.ability === 'hua' ? Math.trunc(b.skills['xiantian-gong'] / 2) : 0));
    }
    for (const direct of raw.directs) {
        assert.equal(direct.actor, 0); assert.equal(direct.target, 1);
        assert.equal(direct.type, p.ability === 'lian' ? 0 : 1);
        assert.equal(direct.percent, { ding: 50, hua: 100, lian: 70 }[p.ability]);
        assert.equal(direct.weapon, p.ability === 'lian' ? 'none' : 'sword');
        assert.equal(direct.weapon_object, p.ability === 'lian' ? '' : b.weapon_details.object);
    }
    assert.equal(raw.actions.length, raw.attacks.length, '大气血池中原选招与已完成普通攻击对应');
    const hits = raw.attacks.filter(h => h.result === 0), martial = raw.passives.filter(e => e.route === 'martial');
    assert.ok(martial.length <= hits.length && martial.length >= hits.filter(h => h.damage > 0).length);
    assert.ok(raw.passives.filter(e => e.route === 'force').length <= (p.ability === 'ordinary' ? hits.length : 0));
    if (p.ability !== 'ordinary') assert.ok(raw.passives.every(e => e.route === 'martial'), '加力0不应触发force回调');
    let branch = null, secondary = null, ap = null, guaranteed = 'random';
    switch (p.ability) {
        case 'ordinary':
            assert.equal(cost, 0); assert.equal(raw.attacks.length, 1); assert.equal(raw.directs.length, 0);
            assert.equal(busy(a), busy(b)); assert.equal(busy(end), busy(t));
            if (raw.attacks[0].result !== 0) assert.equal(raw.passives.length, 0);
            if (!b.jiali) assert.ok(raw.passives.every(e => e.route === 'martial'));
            break;
        case 'chan':
            assert.equal(cost, 50); assert.equal(raw.attacks.length + raw.directs.length + raw.passives.length, 0);
            branch = busy(end) > 0 ? 'success' : 'failure'; ap = effective(b, 'sword');
            assert.equal(busy(end), branch === 'success' ? Math.trunc(b.skills[skill] / 28) + 2 : 0);
            assert.equal(busy(a), branch === 'success' ? 0 : 1); guaranteed = gate(ap, effective(t, 'force'), true);
            break;
        case 'ding': {
            assert.equal(raw.attacks.length + raw.passives.length, 0); assert.ok(raw.directs.length <= 1);
            branch = raw.directs.length ? 'success' : 'failure'; assert.equal(cost, branch === 'success' ? 80 : 30);
            assert.equal(busy(a), 2); ap = effective(b, 'force'); guaranteed = gate(ap, Math.trunc(effective(t, 'force') / 2), false);
            const base = b.skills[skill] + b.skills.force + (b.skills['xiantian-gong'] ?? 0);
            for (const d of raw.directs) randomRange(d.damage, base, Math.trunc(base / 3), '定阳针原已学先天输入');
            break;
        }
        case 'hua':
            assert.equal(cost, 200); assert.ok(raw.directs.length <= 1); assert.ok(raw.attacks.length <= 3);
            branch = raw.directs.length ? 'success' : 'failure'; assert.equal(busy(a), branch === 'success' ? 3 : 2);
            if (branch === 'failure') assert.equal(raw.attacks.length, 0);
            ap = gumuQuanzhenHuaPower(b); guaranteed = gate(ap, effective(t, 'force') + Math.trunc(t.skills.parry * 2 / 3), true);
            for (const d of raw.directs) randomRange(d.damage, Math.trunc(ap / 2), ap, '化三清原输入伤害');
            secondary = raw.attacks.length ? 'success' : branch === 'failure' ? 'not-reached' : end.living && a.fighting_opponent ? 'failure' : 'unknown';
            if (secondary === 'success' && end.living && a.fighting_opponent) assert.equal(raw.attacks.length, 3);
            if (guaranteed === 'success' && end.living && a.fighting_opponent) assert.equal(secondary, 'success');
            break;
        case 'lian':
            assert.equal(raw.attacks.length, 2); assert.ok(raw.directs.length <= 1); assert.equal(busy(a), 3);
            assert.deepEqual(raw.actions.map(e => e.skill), [skill, b.mappings.strike]);
            branch = raw.directs.length ? 'success' : 'failure'; assert.equal(cost, branch === 'success' ? 210 : 110);
            ap = effective(b, 'sword') + b.skills.unarmed; guaranteed = gate(ap, Math.trunc(effective(t, 'parry') / 2), false);
            for (const d of raw.directs) randomRange(d.damage, Math.trunc(ap / 2), ap, '三连环原扫腿输入');
            break;
        default: assert.fail('未知全真动作');
    }
    if (branch !== null && guaranteed !== 'random') assert.equal(branch, guaranteed);
    if (p.gate_expectation !== 'random') assert.equal(guaranteed, p.gate_expectation, '声明的确定门槛错误');
    return { accepted: true, scope: p.scope, branch, secondary, ap, ability_cost: cost, passive_cost: passiveCost,
        total_cost: totalCost, actual_attacks: raw.attacks.length, direct_calls: raw.directs.length,
        direct_inputs: raw.directs.map(e => e.damage), passive_calls: raw.passives.length,
        target_qi_cost: count(raw.metrics[1], 'qi_cost'), target_eff_qi_cost: count(raw.metrics[1], 'eff_qi_cost'),
        busy: busy(a), target_busy: busy(end), attack_residual: apply(a, 'attack') - apply(b, 'attack'),
        target_inactive: !end.living || !a.fighting_opponent };
}

export function gumuQuanzhenEffects(rows, condition) {
    assert.equal(condition?.parameters?.collection_group, group, '统计必须传冻结condition，raw没有parameters');
    const observed = [], counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.ok(Object.hasOwn(counts, row.outcome)); assert.equal(row.raw?.outcome, row.outcome);
        assert.equal(row.raw?.condition_id, condition.id); assert.equal(row.raw?.method, condition.method); counts[row.outcome]++;
        if (row.outcome !== 'error') { const item = validateGumuQuanzhenRecord(row.raw, condition); if (item.accepted) observed.push(item); }
    }
    validateGumuQuanzhenLoads(rows);
    return { samples: rows.length, counts, scope: condition.parameters.scope, ability: condition.parameters.ability,
        teacher_reference: condition.parameters.teacher_reference, normal_effect_denominator: observed.length,
        branch: Object.fromEntries(['success', 'failure', null].map(b => [b ?? 'not-applicable', observed.filter(x => x.branch === b).length])),
        secondary: Object.fromEntries(['success', 'failure', 'not-reached', 'unknown'].map(b => [b, observed.filter(x => x.secondary === b).length])),
        any_direct: probability(observed.filter(x => x.direct_calls > 0).length, observed.length),
        target_inactive_samples: observed.filter(x => x.target_inactive).length,
        direct_input_damage: distribution(observed.flatMap(x => x.direct_inputs)),
        ...Object.fromEntries(['ap', 'ability_cost', 'passive_cost', 'total_cost', 'actual_attacks', 'direct_calls', 'passive_calls',
            'target_qi_cost', 'target_eff_qi_cost', 'busy', 'target_busy', 'attack_residual'].map(k => [k, distribution(observed.map(x => x[k]))])) };
}
