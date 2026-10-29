// Native body windows retain original first-load action constants; no game fixes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
export const sanyinMemberSources = {
    'kungfu/skill/sanyin-wugongzhao.c': 'cc69ec7d8f857b66cc1c3523216009f6aaa79bf9c75606868908fcb5bbb5b800',
    'kungfu/class/shenlong/yin.c': '5150b7ec3fd9de7f6052145dfcaf8929b09c12d12cf66120c0def9c759552426',
    'cmds/skill/enable.c': 'aed3bbbe4aac9172c2b50beba83542605a459ad6e6fa5270bbc0e87800108396',
    'adm/daemons/combatd.c': '9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6',
};
const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    combat_exp: 100000000, str: 30, int: 36, con: 30, dex: 30, gender: '男性' };
export const sanyinName = level => level < 90 ? null : level < 200 ? '唯我独尊' : '极意';
export function sanyinMemberConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, hash] of Object.entries(sanyinMemberSources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), hash,
            '三阴来源改变，须重新审阅：' + path);
    const source = catalog.skills.find(s => s.id === 'sanyin-wugongzhao'); assert.ok(source);
    const result = [];
    function add(ability, suffix, extra = {}) {
        const level = extra.level ?? 200, ordinary = ability === 'ordinary';
        const entry = ordinary ? source.path : source.entries.find(e => e.function === ability)?.id;
        assert.ok(entry, '缺少原三阴接口：' + ability);
        result.push({ id: `school-s1-sanyin-${ability}-${suffix}`, stage: 'school', entry_id: entry,
            method: ordinary ? 'ordinary' : 'interface', samples: smoke ? 2 : ordinary ? samples : 2,
            parameters: { school: 'shenlong', family: '神龙教', collection_group: 's1-sanyin',
                skill: 'sanyin-wugongzhao', usage: 'claw', ability, level,
                actor: { skills: { force: 400, claw: level, 'sanyin-wugongzhao': level,
                    dodge: level, parry: level, sword: 200, ...extra.skills },
                    mappings: ordinary ? { claw: 'sanyin-wugongzhao' } : {},
                    preparations: ordinary ? { claw: 'sanyin-wugongzhao' } : {},
                    properties: { ...properties, 'family/family_name': '神龙教', ...extra.properties },
                    ...(extra.equipment ? { equipment: extra.equipment } : {}) },
                target: { skills: { force: 600, dodge: 600, parry: 600 }, mappings: {}, preparations: {},
                    properties: { ...properties } }, action: ordinary ? 'ordinary' : 'test_interface',
                fighting: ordinary, observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                expected_result: Object.hasOwn(extra, 'value') ? extra.value : 1, not_applicable: '',
                ...(!ordinary ? { interface: { object: '/kungfu/skill/sanyin-wugongzhao', function: ability,
                    ...(Object.hasOwn(extra, 'argument') ? { argument: extra.argument } : {}),
                    ...(extra.combo ? { combo: extra.combo } : {}) } } : {}),
                capture_skill_loads: [{ skill: source.id, path: source.path, sha256: source.sha256 }],
                source_evidence: { ...sanyinMemberSources },
                qualification_sources: [...Object.keys(sanyinMemberSources), 'inherit/skill/skill.c',
                    'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'feature/equip.c',
                    'feature/action.c', 'feature/attribute.c', 'include/combat.h', 'inherit/char/char.c'],
                qualification_note: '殷锦原准备三阴爪与抽髓掌、激发化功；本批非巫师USER单备三阴且无特殊内功，不复制NPC或冒充授课。首次经原enable parry加载，记录当时有效技能，随后去掉准备外的诊断映射；同驱动保持原共享对象、不按样本重载。极意全局随机属性来自首次加载而非每档重算。学习检查双手，practice不检查双手，原缺失skill_name保持null；只验原接口/普攻，不冒绝招、养成或完整互备。',
            } });
    }
    for (const level of [200, 400, 800]) for (const jiali of [0, 50])
        add('ordinary', `l${level}-jiali${jiali}`, { level, properties: { jiali } });
    add('ordinary', 'l201-jiali0-action-boundary', { level: 201 });
    for (const argument of ['claw', 'parry', 'sword'])
        add('valid_enable', argument, { argument, value: Number(argument !== 'sword') });
    for (const combo of ['chousui-zhang', 'jinyu-quan'])
        add('valid_combine', combo, { combo, value: Number(combo === 'chousui-zhang') });
    add('valid_learn', 'baseline'); add('valid_learn', 'force0', { skills: { force: 0 } });
    for (const max_neili of [199, 200]) add('valid_learn', 'max-neili' + max_neili,
        { properties: { max_neili }, ...(max_neili < 200 ? { value: 0,
            refusal: '你的内力太弱，无法练三阴蜈蚣爪。\n' } : {}) });
    for (const claw of [199, 200]) add('valid_learn', 'basic' + claw,
        { skills: { claw }, ...(claw < 200 ? { value: 0,
            refusal: '你的基本爪法水平有限，无法领会更高深的三阴蜈蚣爪法。\n' } : {}) });
    for (const slot of ['weapon', 'secondary_weapon']) add('valid_learn', slot,
        { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
            value: 0, refusal: '练三阴蜈蚣爪必须空手。\n' });
    add('practice_skill', 'baseline');
    for (const qi of [39, 40]) add('practice_skill', 'qi' + qi, { properties: { qi },
        ...(qi < 40 ? { value: 0, refusal: '你的体力太低了。\n' } : {}) });
    for (const neili of [39, 40]) add('practice_skill', 'neili' + neili, { properties: { neili },
        ...(neili < 40 ? { value: 0, refusal: '你的内力不够练三阴蜈蚣爪。\n' } : {}) });
    for (const slot of ['weapon', 'secondary_weapon']) add('practice_skill', slot,
        { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) } });
    for (const argument of [0, 29, 30, 59, 60, 89, 90, 119, 120, 199, 200, 800])
        add('query_skill_name', 'l' + argument, { argument, value: sanyinName(argument) });
    return result;
}
const n = v => v ?? 0;
const plain = state => {
    const v = structuredClone(state);
    if (v.temp) { delete v.temp.notify_fail; delete v.temp.fight;
        for (const k of Object.keys(v.temp.apply ?? {})) if (!v.temp.apply[k]) delete v.temp.apply[k]; }
    return v;
};
export function validateSanyinMemberRecord(raw, c) {
    const p = c.parameters;
    assert.equal(p.skill, 'sanyin-wugongzhao'); assert.equal(p.collection_group, 's1-sanyin');
    assert.equal(raw.method, c.method); assert.equal(raw.outcome, p.expected);
    assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.launches, []); assert.deepEqual(raw.directs, []);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side];
        for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(b[k], 1);
        assert.equal(b.wizardp, 0); assert.equal(b.ghost, 0);
        assert.deepEqual(b.skills, cfg.skills); assert.deepEqual(b.mappings, cfg.mappings);
        assert.deepEqual(b.preparations, cfg.preparations);
        for (const [k, v] of Object.entries(cfg.properties)) assert.equal(k.includes('/') ? b.cultivation[k] : b[k], v, k);
        assert.equal(n(raw.metrics[side].heartbeats), 0);
        for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) assert.equal(n(raw.metrics[side][k + '_recovery']), 0);
    }
    assert.equal(raw.skill_loads.length, 1);
    const load = raw.skill_loads[0];
    for (const k of ['skill', 'path', 'sha256']) assert.equal(load[k], p.capture_skill_loads[0][k]);
    for (const k of ['load_id', 'run_id']) assert.ok(typeof load[k] === 'string' && load[k].length);
    assert.equal(load.command, 'enable parry sanyin-wugongzhao');
    assert.equal(load.state.userp, 1); assert.equal(load.state.wizardp, 0);
    assert.deepEqual(load.state.mappings, {}); assert.deepEqual(load.state.preparations, {});
    for (const k of ['force', 'claw', 'dodge', 'parry'])
        assert.equal(load.state.effective_skills[k], Math.trunc(load.state.skills[k] / 2));
    const [b, t] = raw.before, [a, v] = raw.immediate, expected = plain(b), target = plain(t);
    assert.equal(b.weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'none' : p.actor.equipment?.type ?? 'none');
    assert.equal(b.secondary_weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none');
    if (b.secondary_weapon !== 'none') assert.equal(b.secondary_weapon_details.program, '/tests/sword');
    if (p.ability === 'ordinary') {
        assert.deepEqual(raw.interfaces, []); assert.equal(raw.attacks.length, 1); assert.equal(raw.actions.length, 1);
        const hit = raw.attacks[0];
        assert.equal(hit.actor, 0); assert.equal(hit.target, 1); assert.equal(hit.type, 0);
        assert.equal(hit.attack_skill, p.skill); assert.equal(hit.attack_usage, 'claw');
        assert.ok([0, -1, -2].includes(hit.result));
        assert.equal(raw.passives.length, Number(hit.result === 0));
        for (const e of raw.passives) {
            assert.equal(e.route, 'martial'); assert.equal(e.skill, p.skill); assert.equal(e.actor, 0);
            assert.equal(e.target, 1); assert.equal(e.factor, 0); assert.equal(n(e.result), 0);
        }
        assert.equal(n(raw.metrics[0].neili_cost), 0);
        assert.equal(n(raw.metrics[1].qi_cost), hit.damage);
        assert.ok(n(raw.metrics[1].eff_qi_cost) >= 0 && n(raw.metrics[1].eff_qi_cost) <= hit.damage);
        target.qi = v.qi; target.eff_qi = v.eff_qi;
        const e = raw.actions[0]; assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.skill, p.skill);
        assert.ok(typeof e.action.action === 'string' && e.action.action.length);
        const level = n(e.action.lvl); assert.ok([0, 30, 60, 90, 120, 200].includes(level) && level < p.level);
        if (level === 200) {
            assert.equal(e.action.skill_name, '极意'); assert.equal(e.action.damage_type, '抓伤');
            const s = load.state.effective_skills;
            const ranges = { force: [Math.trunc(s.force / 2), s.force], attack: [Math.trunc(s.claw / 4), Math.trunc(s.claw / 2)],
                dodge: [Math.trunc(s.dodge / 4), Math.trunc(s.force / 3)], parry: [Math.trunc(s.parry / 4), Math.trunc(s.parry / 3)],
                damage: [Math.trunc(s.force / 3), Math.trunc(s.claw / 3)] };
            for (const [k, [base, span]] of Object.entries(ranges)) assert.ok(Number.isInteger(e.action[k])
                && e.action[k] >= base && e.action[k] <= base + Math.max(0, span - 1), '首次加载范围：' + k);
        } else {
            const values = { 0: [120, 10, 30], 30: [150, 20, 45], 60: [180, 30, 55],
                90: [240, 50, 60], 120: [270, 60, 90] }[level];
            for (const [i, k] of ['force', 'dodge', 'damage'].entries()) assert.equal(e.action[k], values[i]);
            assert.equal(e.action.skill_name ?? null, level >= 90 ? '唯我独尊' : null);
            assert.equal(e.action.damage_type, '抓伤');
            assert.ok(!Object.hasOwn(e.action, 'attack') && !Object.hasOwn(e.action, 'parry'));
        }
    } else {
        assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.actions, []); assert.deepEqual(raw.passives, []);
        assert.equal(raw.interfaces.length, 1); const call = raw.interfaces[0];
        assert.equal(call.object, p.interface.object); assert.equal(call.function, p.ability);
        let permitted;
        if (p.ability === 'query_skill_name') { assert.equal(call.argument, p.interface.argument); permitted = sanyinName(call.argument); }
        else if (p.ability === 'valid_enable') { assert.equal(call.argument, p.interface.argument); permitted = Number(['claw', 'parry'].includes(call.argument)); }
        else if (p.ability === 'valid_combine') { assert.equal(call.combo, p.interface.combo); permitted = Number(call.combo === 'chousui-zhang'); }
        else if (p.ability === 'valid_learn') permitted = Number(b.weapon === 'none' && b.secondary_weapon === 'none'
            && b.max_neili >= 200 && b.skills.claw >= b.skills[p.skill]);
        else { assert.equal(p.ability, 'practice_skill'); permitted = Number(b.qi >= 40 && b.neili >= 40); }
        assert.equal(p.expected_result, permitted); assert.equal(call.result ?? null, permitted);
        if (p.expected === 'refused') {
            const prefix = '\x1b[256D\x1b[K';
            assert.equal(raw.reason.startsWith(prefix) ? raw.reason.slice(prefix.length) : raw.reason, p.refusal);
        }
        if (p.ability === 'practice_skill' && permitted) {
            expected.qi -= 30; expected.neili -= 31;
            assert.equal(raw.metrics[0].qi_cost, 30); assert.equal(raw.metrics[0].neili_cost, 31);
        }
    }
    assert.deepEqual(plain(a), expected); assert.deepEqual(plain(v), target);
}
export function validateSanyinLoads(rows) {
    const loads = new Map(), actions = new Map();
    for (const row of rows) {
        const r = row.raw ?? row, load = r.skill_loads[0], key = load.run_id + ':' + load.load_id;
        if (loads.has(key)) assert.deepEqual(load, loads.get(key), '首次加载来源不得随样本改变');
        else loads.set(key, load);
        for (const e of r.actions) if (e.action.lvl === 200) {
            if (actions.has(key)) assert.deepEqual(e.action, actions.get(key), '全局极意不得逐样本重新随机');
            else actions.set(key, e.action);
        }
    }
    return { loads: loads.size, dynamic_actions: actions.size };
}
