// Original unarmed attacks and isolated hit_ob observations; no gameplay changes.
import assert from 'node:assert/strict';
import { validateGumuAttackRecord, validateGumuAttackLoads, gumuWeaponEffects } from './school_gumu_weapons_cases.mjs';

export const gumuUnarmedAttacks = [
    { skill: 'meinv-quan', usage: 'unarmed', teacher: 'lin', action_levels: [0, 10, 22, 34, 48, 60, 71, 82, 95, 109, 129, 149, 179] },
    { skill: 'tianluo-diwang', usage: 'strike', teacher: 'longnv', action_levels: [0, 30, 60, 90, 120, 150] },
    { skill: 'chilian-shenzhang', usage: 'strike', teacher: 'li', action_levels: [0, 20, 30, 40, 60, 80, 100, 120, 140, 160] },
    { skill: 'wudu-shenzhang', usage: 'strike', teacher: 'li', dynamic: 200, action_levels: [0, 20, 30, 40, 60, 80, 100, 120, 140, 160, 200] },
    { skill: 'sad-strike', usage: 'unarmed', teacher: 'yang', force: 'surge-force', dynamic: 350,
        action_levels: [0, 10, 20, 40, 60, 80, 100, 120, 140, 160, 70, 200, 220, 240, 260, 280, 300, 350] },
    { skill: 'fireice-strike', usage: 'strike', teacher: 'yang', force: 'surge-force', action_levels: [0, 30, 60, 120] },
];
export const gumuUnarmedAttackFixtureRequirements = [
    'Use original do_attack with one prepared unarmed style; observe rather than repeat query_action.',
    'Capture original first-load player/raw/effective skills and run-local load identity for wudu/sad global actions; do not reload between samples.',
    'Reuse force/martial before-after hit_ob observations and explicit interface allowlist; missing hit_ob returning zero is distinct from a refused command.',
    'Record actual query_str plus skills, tattoos/reborn and temporary attributes; do not equate innate strength with effective strength.',
    'Observe conditions and zero heartbeats separately; ordinary wudu hit_ob does not apply the perform poison, and unarmed yunv force does not gain the weapon-only linked effect.',
];

const resources = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000, str: 36, int: 36, con: 36, dex: 36,
    gender: '女性', shen: 0, character: '光明磊落' };
const wall = 'can_learn/yunv-xinjing/wall';
export function gumuUnarmedAttackConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(d, suffix, extra = {}) {
        const source = catalog.skills.find(s => s.id === d.skill); assert.ok(source, d.skill);
        const level = extra.level ?? 200, method = extra.method ?? 'interface';
        const force = d.force ?? 'yunv-xinjing', forceLevel = d.skill === 'sad-strike' ? Math.max(level, 220) : level;
        const dodge = d.teacher === 'li' ? 'qixing-bu' : 'yunv-shenfa';
        const actor = { skills: { [d.usage]: level, [d.skill]: level, parry: level, force: forceLevel,
            [force]: forceLevel, dodge: level, [dodge]: level, ...extra.skills },
            mappings: { [d.usage]: d.skill, parry: d.skill, force, dodge }, preparations: { [d.usage]: d.skill },
            properties: { ...resources, gender: d.teacher === 'yang' ? '男性' : '女性',
                character: d.teacher === 'li' ? '国士无双' : '光明磊落', 'family/family_name': '古墓派',
                [wall]: 0, ...extra.properties } };
        if (extra.noMap) delete actor.mappings[d.usage];
        if (extra.noPrepare) actor.preparations = {};
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, preparations: {}, equipment: { type: 'sword', hold: false },
            properties: { ...resources, gender: '男性', 'tattoo/tattoo_str': 0, 'reborn/str': 0, ...extra.targetProperties },
            temp: { ...extra.targetTemp } };
        result.push({ id: `school-gumu-unarmed-attack-${d.skill}-${suffix}`, stage: 'school', entry_id: source.path,
            method, samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'gumu', collection_group: 'gumu-unarmed-attack', skill: d.skill, usage: d.usage,
                level, combination: `${d.skill}+${force}+${dodge}`, actor, target,
                ability: method === 'ordinary' ? 'ordinary' : 'hit_ob', action: method === 'ordinary' ? 'ordinary' : 'test_interface',
                fighting: method === 'ordinary', observation: 'single_action_immediate', observe_seconds: 0,
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + d.skill, function: 'hit_ob',
                    damage: extra.damage ?? 200, factor: 0 } } : {}),
                capture_skill_loads: d.dynamic ? [{ skill: d.skill, path: source.path, sha256: source.sha256 }] : [],
                expected: 'observed', not_applicable: '',
                qualification_sources: [source.path, `kungfu/skill/${force}.c`, `kungfu/skill/${dodge}.c`,
                    `kungfu/class/gumu/${d.teacher}.c`, 'kungfu/class/gumu/gumu.h', 'feature/skill.c', 'feature/attack.c',
                    'feature/attribute.c', 'feature/equip.c', 'feature/damage.c', 'inherit/skill/force.c',
                    'inherit/skill/skill.c', 'inherit/char/char.c', 'adm/daemons/combatd.c', 'include/combat.h'],
                qualification_note: '真实非巫师USER，单门徒手准备及原普通攻击；接口低技能／无映射等条件仅隔离hit_ob，不冒充合法学习或可施展组合。'
                    + '黯然200档内功另设220以满足有效内功门槛，其余等级和属性均留原记录；不作同成本养成比较。'
                    + '极意保留首次加载上下文和原随机，黯然70级倒序原样记录，不重排表或主动再次选招。'
                    + '五毒普通附伤按性别、资源与原等级核对，不伪造持续中毒；玉女心经空手不触发持器联动，怒海公共加力另计。'
                    + '气血、创伤、费用、附加数字返回与后续总伤害分开；防御、互备、学习、教师和完整交锋另采。',
            } });
    }
    for (const d of gumuUnarmedAttacks) {
        for (const level of [200, 400, 800]) for (const jiali of [0, 50])
            add(d, `ordinary-l${level}-j${jiali}`, { method: 'ordinary', level, properties: { jiali } });
        if (!d.force) add(d, 'ordinary-wall', { method: 'ordinary', level: 400, properties: { [wall]: 1, jiali: 50 } });
        if (!['wudu-shenzhang', 'sad-strike'].includes(d.skill)) add(d, 'missing-hit', { checks: 2 });
    }
    const wudu = gumuUnarmedAttacks.find(d => d.skill === 'wudu-shenzhang');
    for (const level of [199, 201]) add(wudu, 'ordinary-boundary' + level, { method: 'ordinary', level });
    for (const level of [119, 120, 200, 400, 800]) add(wudu, 'hit-level' + level, { level, ...(level < 120 ? { checks: 2 } : {}) });
    for (const neili of [199, 200]) add(wudu, 'hit-neili' + neili, { properties: { neili }, ...(neili < 200 ? { checks: 2 } : {}) });
    for (const [id, gender] of [['male', '男性'], ['female', '女性'], ['none', '无性']])
        add(wudu, 'hit-gender-' + id, { targetProperties: { gender }, ...(id === 'female' ? { checks: 2 } : {}) });
    for (const damage of [0, 1, 201]) add(wudu, 'hit-damage' + damage, { damage });
    add(wudu, 'hit-no-map', { noMap: true }); add(wudu, 'hit-no-prepare', { noPrepare: true });
    add(wudu, 'hit-piyi', { targetProperties: { 'special_skill/piyi': 1 } });
    add(wudu, 'hit-nopoison', { targetTemp: { nopoison: 1 } });
    const sad = gumuUnarmedAttacks.find(d => d.skill === 'sad-strike');
    for (const level of [70, 71, 160, 161, 350, 351]) add(sad, 'ordinary-boundary' + level, { method: 'ordinary', level });
    const hit = (suffix, extra = {}) => add(sad, 'hit-' + suffix, { ...extra, checks: 2 });
    for (const damage of [0, 149, 150, 154, 155, 179, 180, 184, 185, 201])
        hit('damage' + damage, { damage, targetProperties: { str: 30 } });
    for (const level of [1, 149, 150, 200, 400, 800]) hit('level' + level, { level });
    for (const neili of [0, 1, 149, 150]) hit('neili' + neili, { properties: { neili } });
    for (const str of [39, 40, 41]) hit('str' + str, { targetProperties: { str } });
    for (const unarmed of [90, 100, 110]) hit('target-unarmed' + unarmed, { targetSkills: { unarmed }, targetProperties: { str: 30 } });
    hit('no-map', { noMap: true }); hit('no-prepare', { noPrepare: true }); hit('zero-skill', { skills: { 'sad-strike': 0 } });
    return result;
}

export function validateGumuUnarmedAttackRecord(raw, c) {
    validateGumuAttackRecord(raw, c, 'gumu-unarmed-attack', gumuUnarmedAttacks);
    const cfg = c.parameters.target, target = raw.before[1];
    const best = Math.max(0, ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0));
    const strength = cfg.properties.str + cfg.properties['tattoo/tattoo_str'] + cfg.properties['reborn/str']
        + Math.trunc(best / 10) + (cfg.temp?.['apply/str'] ?? 0);
    assert.equal(target.effective_str, strength, '必须记录原query_str而非先天值');
    for (const [key, value] of Object.entries(cfg.temp ?? {}))
        assert.equal(key.split('/').reduce((v, part) => v?.[part], target.temp), value, key);
    const noConditions = state => {
        assert.ok(Object.hasOwn(state, 'conditions'), '异常状态缺测不能当作无异常');
        assert.deepEqual(state.conditions === null ? {} : state.conditions, {});
    };
    for (const side of [0, 1]) {
        const m = raw.metrics[side]; assert.equal(Object.hasOwn(m, 'heartbeats') ? m.heartbeats : 0, 0);
        for (const state of [raw.before[side], raw.immediate[side], raw.after[side]]) noConditions(state);
    }
    for (const e of raw.passives) {
        assert.equal(e.before[1].effective_str, strength);
        for (const states of [e.before, e.after]) for (const state of states) noConditions(state);
    }
}
export const validateGumuUnarmedAttackLoads = rows => validateGumuAttackLoads(rows, gumuUnarmedAttacks);
export const gumuUnarmedAttackEffects = gumuWeaponEffects;
