// Registered Gumu unarmed-learning observations; frozen condition parameters remain unchanged.
import assert from 'node:assert/strict';
import { gumuWeaponPracticeGain, gumuWeaponLearningEffects } from './school_gumu_weapon_learning_cases.mjs';

// skill, usage, effective force, max neili, raw basic floor,
// practice qi/neili floors, actual qi/neili costs, NPC source.
export const gumuUnarmedLearningProfiles = [
    ['meinv-quan', 'unarmed', 60, 0, 30, 50, 60, 35, 40, 'lin'],
    ['tianluo-diwang', 'strike', 80, 0, 40, 60, 50, 50, 35, 'lin'],
    ['chilian-shenzhang', 'strike', 120, 1000, 80, 70, 60, 61, 53, 'li'],
    ['wudu-shenzhang', 'strike', 150, 1200, 120, 90, 80, 81, 73, 'li'],
    ['sad-strike', 'unarmed', 320, 3000, 200, 160, 160, 150, 155, 'yang'],
    ['fireice-strike', 'strike', 100, 450, 0, 60, 60, 50, 54, 'longnv'],
];
export const gumuUnarmedLearningFixtureRequirements = [
    'Load original action tables in the configured player context; do not replace five-poison or sad-strike initialization.',
    'Observe raw and effective strength plus both weapon slots. Secondary-only is an explicit diagnostic placement, not normal wielding or player attainability.',
    'Invoke original valid_learn/practice_skill or the complete practice command; record room, learned progress, resources and command return separately.',
];
const profile = skill => { const d = gumuUnarmedLearningProfiles.find(d => d[0] === skill); assert.ok(d, skill); return d; };
const effectiveForce = a => Math.trunc((a.skills.force ?? 0) / 2) + (a.skills[a.mappings.force] ?? 0);
export const gumuUnarmedLearningStrength = a => a.properties.str
    + Math.trunc(Math.max(0, ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => a.skills[k] ?? 0)) / 10)
    + (a.properties['tattoo/tattoo_str'] ?? 0) + (a.properties['reborn/str'] ?? 0) + (a.temp?.['apply/str'] ?? 0);

// Source oracle only. A driver record must still call the original LPC implementation.
export function gumuUnarmedLearningAllowed(p, ability = p.ability) {
    const [skill, usage, force, max, basic, qi, neili] = profile(p.skill), a = p.actor, q = a.properties;
    if (ability === 'practice_skill') return q.qi >= qi && q.neili >= neili;
    assert.equal(ability, 'valid_learn');
    if (a.equipment || effectiveForce(a) < force || q.max_neili < max
        || (a.skills[usage] ?? 0) < basic || (a.skills[usage] ?? 0) < a.skills[skill]) return false;
    if (skill === 'wudu-shenzhang' && !['心狠手辣', '国士无双'].includes(q.character)) return false;
    if (skill === 'sad-strike' && (q.gender !== '男性' || ['心狠手辣', '阴险奸诈'].includes(q.character)
        || q.str < 34 || q.int < 34 || gumuUnarmedLearningStrength(a) < 45)) return false;
    return true;
}

export function gumuUnarmedLearningConditions(catalog, { smoke = false } = {}) {
    const result = [];
    function add(skill, ability, level = 200, extra = {}) {
        const d = profile(skill), usage = extra.usage ?? d[1], source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, skill);
        const actor = { skills: { force: 600, 'suxin-jue': 400, [d[1]]: Math.max(d[4], level + 1),
            [usage]: Math.max(d[4], level + 1), [skill]: level, ...extra.skills },
            mappings: { force: 'suxin-jue', [usage]: skill },
            properties: { qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000, jingli: 10000,
                neili: 10000, max_neili: 10000, int: 36, str: 36, con: 36, dex: 36,
                character: '国士无双', gender: skill === 'sad-strike' ? '男性' : '女性',
                combat_exp: 100000000, learned_points: 0, jiali: 0, shen: 0,
                'family/family_name': '古墓派', ...extra.properties },
            ...(extra.temp ? { temp: extra.temp } : {}), ...(extra.busy ? { busy: 2 } : {}) };
        if (extra.weapon) actor.equipment = { type: 'sword', hold: false, slot: extra.weapon };
        if (extra.unmappedForce) delete actor.mappings.force;
        if (extra.unmapped) delete actor.mappings[usage];
        const p = { school: 'gumu', family: '古墓派', collection_group: 'gumu-unarmed-learning',
            skill, usage, ability, level, actor, target: { skills: {}, mappings: {}, properties: {} }, room: { ...extra.room },
            action: ability === 'practice' ? `practice ${usage} ${extra.times ?? 1}` : 'test_interface',
            ...(ability === 'practice' ? {} : { interface: { object: '/kungfu/skill/' + skill, function: ability } }),
            costs: { qi: skill === 'fireice-strike' && level < 50 ? 30 : d[7], neili: d[8] },
            repetitions: extra.times ?? 1, observation: 'single_action_immediate',
            fighting: extra.fighting ?? false, observe_seconds: 0, not_applicable: '',
            qualification_sources: [...new Set([source.path, `kungfu/skill/${d[1]}.c`, `kungfu/skill/${usage}.c`,
                'kungfu/skill/suxin-jue.c', 'kungfu/skill/force.c', 'kungfu/skill/martial-cognize.c',
                'kungfu/skill/literate.c', `kungfu/class/gumu/${d[9]}.c`, 'cmds/skill/practice.c',
                'cmds/skill/learn.c', 'cmds/skill/enable.c', 'feature/skill.c', 'feature/attribute.c', 'feature/damage.c'])],
            qualification_note: '真实非巫师USER，原学习资格、直接练习及完整practice分列。掌握等级和师承为实验配置，不证明NPC可教；不把杨过额外授课条件加到技能接口。副手单独放置和负临时膂力是明确的隔离诊断状态，不宣称正常持器或自然成长可达。完整练习保留原门槛、费用、熟练度及部分返回；不改原动作加载、互备拼写或玩家文本。',
        };
        if (ability === 'practice') {
            const eligible = !actor.busy && !p.fighting && (!p.room.no_fight || actor.properties.doing === 'scheme')
                && !p.room.pigging && p.repetitions >= 1 && p.repetitions <= 50
                && actor.mappings[usage] === skill && actor.skills[skill] > 0 && actor.skills[usage] > actor.skills[skill]
                && !actor.properties['env/no_learn'] && actor.properties.combat_exp >= level ** 3 / 10
                && gumuUnarmedLearningAllowed(p, 'valid_learn');
            p.completed = 0;
            if (eligible) for (let i = 0; i < p.repetitions; i++) {
                const trial = structuredClone(p);
                trial.actor.properties.qi -= i * p.costs.qi;
                trial.actor.properties.neili -= i * p.costs.neili;
                if (!gumuUnarmedLearningAllowed(trial, 'practice_skill')) break;
                p.completed++;
            }
            p.expected = p.completed ? 'observed' : 'refused';
            p.command_return = Number(p.completed > 0 && p.completed === p.repetitions);
        } else p.expected = gumuUnarmedLearningAllowed(p) ? 'observed' : 'refused';
        result.push({ id: `school-gumu-unarmed-learning-${skill}-${ability}-l${level}${extra.suffix ? '-' + extra.suffix : ''}`,
            stage: 'school', entry_id: source.path, method: ability === 'practice' ? 'practice' : 'interface',
            samples: smoke ? 1 : 2, parameters: p });
    }
    const edge = (skill, ability, suffix, extra = {}) => add(skill, ability, extra.level ?? 200, { suffix, ...extra });
    for (const d of gumuUnarmedLearningProfiles) {
        const [skill, usage, force, max, basic, qi, neili, qiCost, neiliCost] = d;
        for (const l of [200, 400, 800]) for (const ability of ['valid_learn', 'practice_skill', 'practice']) add(skill, ability, l);
        for (const ability of ['valid_learn', 'practice_skill', 'practice']) {
            for (const weapon of ['weapon', 'secondary_weapon']) edge(skill, ability, weapon, { weapon });
            for (const [suffix, gender] of [['male', '男性'], ['female', '女性']])
                edge(skill, ability, suffix, { properties: { gender } });
            edge(skill, ability, 'other-family', { properties: { 'family/family_name': '武当派' } });
        }
        for (const v of [199, 200]) edge(skill, 'valid_learn', 'basic' + v, { skills: { [usage]: v } });
        for (const [key, floor] of [['force', force], ['max', max], ['floor', basic]])
            for (const v of floor ? [floor - 1, floor] : [0]) edge(skill, 'valid_learn', key + v, {
                ...(key === 'force' ? { skills: { force: v * 2 }, unmappedForce: true }
                    : key === 'max' ? { properties: { max_neili: v, neili: v } } : { level: 1, skills: { [usage]: v } }) });
        for (const ability of ['practice_skill', 'practice']) {
            for (const v of [qi - 1, qi]) edge(skill, ability, 'qi' + v, { properties: { qi: v } });
            for (const v of [neili - 1, neili]) edge(skill, ability, 'neili' + v, { properties: { neili: v } });
        }
        for (const [suffix, properties] of [['partial-qi', { qi: qi + qiCost }], ['partial-neili', { neili: neili + neiliCost }]])
            edge(skill, 'practice', suffix, { properties, times: 3 });
        edge(skill, 'practice', 'times50', { times: 50 });
        edge(skill, 'practice', 'equal-basic', { skills: { [usage]: 200 } });
        edge(skill, 'practice', 'parry', { usage: 'parry' });
    }
    for (const skill of ['wudu-shenzhang', 'sad-strike'])
        for (const [suffix, character] of [['guangming', '光明磊落'], ['jiaoxia', '狡黠多变'],
            ['xinhen', '心狠手辣'], ['yinxian', '阴险奸诈']])
            for (const ability of ['valid_learn', 'practice_skill', 'practice']) edge(skill, ability, suffix, { properties: { character } });
    for (const ability of ['valid_learn', 'practice_skill', 'practice']) {
        for (const attr of ['str', 'int']) for (const v of [33, 34]) edge('sad-strike', ability, attr + v, { properties: { [attr]: v } });
        for (const str of [44, 45]) edge('sad-strike', ability, 'effective-str' + str, {
            properties: { str: 34 }, temp: { 'apply/str': str - 54 } });
        for (const bonus of ['tattoo/tattoo_str', 'reborn/str', 'apply/str']) edge('sad-strike', ability, bonus.replace('/', '-'), {
            properties: { str: 34, ...(bonus === 'apply/str' ? {} : { [bonus]: 1 }) },
            temp: { 'apply/str': bonus === 'apply/str' ? -9 : -10 } });
        // Highest basic unarmed skill contributes, not their sum.
        edge('sad-strike', ability, 'highest-basic', { skills: { strike: 300, claw: 250 },
            properties: { str: 34 }, temp: { 'apply/str': -19 } });
        edge('sad-strike', ability, 'high-effective-low-raw', { properties: { str: 33 }, temp: { 'apply/str': 100 } });
    }
    for (const level of [49, 50]) for (const ability of ['valid_learn', 'practice_skill', 'practice']) add('fireice-strike', ability, level);
    for (const [suffix, extra] of [['busy', { busy: true }], ['fighting', { fighting: true }], ['unmapped', { unmapped: true }],
        ['no-fight', { room: { no_fight: 1 } }], ['scheme', { room: { no_fight: 1 }, properties: { doing: 'scheme' } }],
        ['pigging', { room: { pigging: 1 } }], ['times0', { times: 0 }], ['times51', { times: 51 }],
        ['no-learn', { properties: { 'env/no_learn': 'meinv-quan' } }], ['low-exp', { properties: { combat_exp: 799999 } }]])
        edge('meinv-quan', 'practice', suffix, extra);
    for (const l of [299, 300, 499, 500]) add('meinv-quan', 'practice', l);
    for (const [suffix, extra] of [['int9', { properties: { int: 9 } }], ['literate500', { skills: { literate: 500 } }],
        ['wuxing', { properties: { 'special_skill/wuxing': 1 } }], ['cognize500', { skills: { 'martial-cognize': 500 } }],
        ['room50', { room: { practice_improve: 50 } }]]) edge('meinv-quan', 'practice', suffix, extra);
    return result;
}

const fields = ['character', 'family/family_name', 'special_skill/wuxing',
    'tattoo/tattoo_str', 'reborn/str', 'env/no_learn', 'doing'];
const roomFields = ['no_fight', 'pigging', 'practice_improve'];
const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const countedResources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const mapping = value => value && typeof value === 'object' && !Array.isArray(value);
const idle = value => value === null ? 0 : value;

export function validateGumuUnarmedLearningRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-unarmed-learning'); assert.equal(raw.outcome, p.expected);
    assert.equal(raw.method, condition.method);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2);
    assert.ok(mapping(raw.unarmed_learning_room), '必须观察实际房间属性，不用配置回显代替');
    for (const k of roomFields) {
        assert.ok(Object.hasOwn(raw.unarmed_learning_room, k), '实际房间条件缺项：' + k);
        assert.equal(raw.unarmed_learning_room[k] ?? 0, p.room[k] ?? 0, k);
    }
    for (const k of ['attacks', 'launches', 'callbacks', 'terminals']) assert.deepEqual(raw[k], []);
    assert.ok(Array.isArray(raw.interfaces)); assert.deepEqual(raw.after, raw.immediate);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side], after = raw.immediate[side], metrics = raw.metrics[side];
        for (const state of [before, after]) {
            assert.equal(state.userp, 1); assert.equal(state.playerp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
            assert.ok(typeof state.object === 'string' && state.object.length > 0); assert.equal(state.object, before.object);
            for (const k of resources) assert.ok(Number.isSafeInteger(state[k]), k + ' 不得缺失或未知');
            assert.ok(Object.hasOwn(state, 'busy') && Number.isSafeInteger(idle(state.busy)) && idle(state.busy) >= 0,
                '显式 null 空闲和快照缺项不能混同');
            for (const k of ['skills', 'mappings', 'learned', 'effective_skills', 'cultivation', 'temp',
                'weapon_details', 'secondary_weapon_details']) assert.ok(mapping(state[k]), k);
            for (const k of ['skills', 'learned', 'effective_skills']) for (const v of Object.values(state[k]))
                assert.ok(Number.isSafeInteger(v), k + ' 中未知值不能当零');
            for (const v of Object.values(state.learned)) assert.ok(v >= 0);
            for (const k of fields) assert.ok(Object.hasOwn(state.cultivation, k), '属性缺项：' + k);
            for (const k of ['jingli', 'learned_points']) assert.ok(Object.hasOwn(state, k), k);
        }
        assert.deepEqual(before.skills, cfg.skills); assert.deepEqual(before.mappings, cfg.mappings);
        assert.deepEqual(before.learned, {});
        for (const [k, v] of Object.entries(cfg.properties)) assert.equal(fields.includes(k) ? before.cultivation[k] : before[k], v, k);
        for (const k of fields) assert.equal(before.cultivation[k] ?? 0, cfg.properties[k] ?? 0, k);
        assert.equal(idle(before.busy), cfg.busy ?? 0); assert.equal(after.busy, before.busy);
        assert.ok(mapping(metrics));
        for (const v of Object.values(metrics)) assert.ok(Number.isSafeInteger(v) && v >= 0, '未知计量不能当零');
        assert.equal(metrics.heartbeats ?? 0, 0); assert.equal(metrics.direct ?? 0, 0);
        for (const k of countedResources) {
            assert.equal(metrics[k + '_cost'] ?? 0, before[k] - after[k], k + ' 实际扣费');
            assert.equal(metrics[k + '_recovery'] ?? 0, 0, k + ' 无恢复分支');
        }
        const primary = cfg.equipment?.slot === 'weapon';
        const apply = { armor: 100, ...(primary ? { damage: 50, dodge: -1 } : {}) };
        for (const [k, v] of Object.entries(cfg.temp ?? {})) if (k.startsWith('apply/')) apply[k.slice(6)] = v;
        assert.ok(mapping(before.temp.apply));
        for (const k of new Set([...Object.keys(apply), ...Object.keys(before.temp.apply)])) {
            if (Object.hasOwn(before.temp.apply, k)) assert.ok(Number.isSafeInteger(before.temp.apply[k]), '未知装备加成：' + k);
            assert.equal(before.temp.apply[k] ?? 0, apply[k] ?? 0, k + ' 实际装备加成');
        }
        assert.deepEqual(before.effective_skills, Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k,
            Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (apply[k] ?? 0)])));
        assert.deepEqual(after.effective_skills, before.effective_skills);
        assert.deepEqual(after.temp.apply, before.temp.apply);
        for (const slot of ['weapon', 'secondary_weapon']) {
            const active = cfg.equipment?.slot === slot, details = slot === 'weapon' ? 'weapon_details' : 'secondary_weapon_details';
            assert.equal(before[slot], active ? 'sword' : 'none'); assert.equal(after[slot], before[slot]);
            if (active) {
                const w = before[details];
                assert.ok(typeof w.object === 'string' && w.object.length > 0, '原装备对象必须可追溯');
                assert.equal(w.program, '/tests/sword'); assert.equal(w.skill_type, 'sword');
                assert.equal(w.weight, 3000); assert.equal(w.damage, 50); assert.equal(w.flag, 4);
                assert.equal(before.temp[slot], w.object);
            } else { assert.deepEqual(before[details], {}); assert.equal(before.temp[slot] ?? 0, 0); }
            assert.deepEqual(after[details], before[details]); assert.equal(after.temp[slot], before.temp[slot]);
        }
        assert.equal(before.weapon_damage, primary ? 50 : 0); assert.equal(before.weapon_flag, primary ? 4 : 0);
        assert.equal(after.weapon_damage, before.weapon_damage); assert.equal(after.weapon_flag, before.weapon_flag);
    }
    const b = raw.before[0], a = raw.immediate[0];
    assert.equal(b.effective_str, gumuUnarmedLearningStrength(p.actor)); assert.equal(a.effective_str, b.effective_str);
    assert.equal(b.effective_int, b.int + Math.trunc((b.skills.literate ?? 0) / 10));
    assert.equal(a.effective_int, b.effective_int, '练习分母使用先天悟性，不是有效悟性');
    for (const k of ['skills', 'mappings', 'cultivation']) assert.deepEqual(a[k], b[k]);
    assert.deepEqual(raw.immediate[1], raw.before[1]); assert.ok(Object.values(raw.metrics[1]).every(v => v === 0));
    const n = condition.method === 'practice' ? p.completed : p.ability === 'practice_skill' ? Number(p.expected === 'observed') : 0;
    assert.equal(a.qi, b.qi - n * p.costs.qi); assert.equal(a.neili, b.neili - n * p.costs.neili);
    for (const k of [...resources.filter(k => !['qi', 'neili'].includes(k)), 'jingli', 'learned_points', 'str', 'int', 'con', 'dex', 'combat_exp'])
        assert.equal(a[k], b[k]);
    const learned = structuredClone(b.learned);
    if (condition.method === 'practice' && n) learned[p.skill] = n * gumuWeaponPracticeGain(p);
    assert.deepEqual(a.learned, learned);
    if (condition.method === 'interface') {
        assert.equal(raw.command_accepted, 1, '观察命令受理不等于原资格允许');
        assert.equal(raw.interfaces.length, 1);
        for (const [k, v] of Object.entries(p.interface)) assert.equal(raw.interfaces[0][k], v);
        assert.equal(raw.interfaces[0].result, Number(gumuUnarmedLearningAllowed(p)));
        assert.equal(raw.interfaces[0].implemented_by, p.interface.object);
    } else { assert.deepEqual(raw.interfaces, []); assert.equal(raw.command_accepted, p.command_return); }
    if (p.expected === 'refused') assert.ok(raw.reason);
}

// Both learning groups use the same three original entry kinds; parameters come from the frozen condition.
export function gumuUnarmedLearningEffects(rows, condition) {
    return gumuWeaponLearningEffects(rows, condition);
}
