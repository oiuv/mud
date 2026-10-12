// Registered Gumu weapon-learning observations; frozen condition parameters remain unchanged.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';

// skill, usage, effective force, max neili, basic floor, learning requires weapon,
// practice qi/neili floors, actual qi/neili costs, NPC source.
export const gumuWeaponLearningProfiles = [
    ['yunv-jian', 'sword', 0, 0, 15, true, 35, 30, 25, 20, 'lin'],
    ['suxin-jian', 'sword', 100, 2000, 100, true, 75, 70, 60, 60, 'longnv'],
    ['quanzhen-jian', 'sword', 150, 1000, 100, false, 60, 60, 55, 53, 'longnv'],
    ['xuantie-jian', 'sword', 380, 5000, 0, false, 80, 80, 65, 70, 'yang'],
    ['yinsuo-jinling', 'whip', 100, 500, 30, true, 50, 60, 45, 55, 'longnv'],
    ['yunzhou-fufa', 'whip', 80, 400, 20, true, 40, 50, 35, 40, 'li'],
    ['sanwu-shou', 'whip', 120, 800, 100, true, 60, 70, 55, 60, 'li'],
    ['bingpo-shenzhen', 'throwing', 80, 0, 0, false, 80, 80, 72, 65, 'li'],
    ['yufeng-zhen', 'throwing', 60, 0, 0, false, 60, 60, 52, 35, 'longnv'],
];
export const gumuWeaponLearningFixtureRequirements = [
    'Register a new series; preserve original player-context loading of suxin, quanzhen, yinsuo and sanwu action tables.',
    'Use original weapon initialization and configured id/room properties; observe the actual weapon id and room flag, not merely its name.',
    'Record raw/effective attributes, configured cultivation fields and skill progress; distinguish direct practice_skill from the full practice command.',
];
const profile = skill => { const d = gumuWeaponLearningProfiles.find(d => d[0] === skill); assert.ok(d, skill); return d; };
const effective = (a, k) => Math.trunc((a.skills[k] ?? 0) / 2) + (a.skills[a.mappings[k]] ?? 0)
    + (a.temp?.['apply/' + k] ?? (k === 'dodge' && a.equipment ? -1 : 0));
const dexterity = a => a.properties.dex + Math.trunc((a.skills.dodge ?? 0) / 10)
    + (a.properties['tattoo/tattoo_dex'] ?? 0) + (a.properties['reborn/dex'] ?? 0) + (a.temp?.['apply/dex'] ?? 0);

// Deterministic source oracle, not a replacement for invoking the original LPC.
export function gumuWeaponLearningAllowed(p, ability = p.ability) {
    const [skill, usage, force, max, basic, armed, qi, neili] = profile(p.skill);
    const a = p.actor, s = a.skills, q = a.properties, weapon = a.equipment;
    if (ability === 'practice_skill') return q.qi >= qi && q.neili >= neili
        && (usage === 'throwing' || weapon?.type === usage)
        && (skill !== 'xuantie-jian' || !!p.room['can_practice_xiantie-jian'] && weapon?.id === 'xuantie jian');
    assert.equal(ability, 'valid_learn');
    if (effective(a, 'force') < force || q.max_neili < max || (s[usage] ?? 0) < basic) return false;
    if (armed && weapon?.type !== usage) return false;
    if ((s[usage] ?? 0) < (s[skill === 'yunv-jian' ? 'suxin-jian' : skill] ?? 0)) return false;
    if (['suxin-jian', 'yinsuo-jinling'].includes(skill) && q.gender !== '女性') return false;
    if (skill === 'suxin-jian' && q.int < 28 || skill === 'yinsuo-jinling' && q.dex < 28) return false;
    if (skill === 'sanwu-shou' && !['心狠手辣', '国士无双'].includes(q.character)) return false;
    if (skill === 'xuantie-jian' && (q.int < 34 || q.str < 34 || ['心狠手辣', '阴险奸诈'].includes(q.character)
        || (s['martial-cognize'] ?? 0) < 220 || (s.force ?? 0) < s[skill])) return false;
    if (usage === 'throwing' && (effective(a, 'dodge') < (skill === 'bingpo-shenzhen' ? 100 : 80)
        || dexterity(a) < (skill === 'bingpo-shenzhen' ? 34 : 26))) return false;
    return true;
}

export function gumuWeaponPracticeGain(p) {
    const s = p.actor.skills, q = p.actor.properties, l = s[p.skill], b = s[p.usage];
    let gain = Math.trunc((l >= 500 ? b : l >= 300 ? b * 3 : b * 6 + 30) / Math.sqrt(q.int) / 6);
    if (q['special_skill/wuxing']) gain += Math.trunc(gain * 20 / 100);
    gain += Math.trunc(gain * (p.room.practice_improve ?? 0) / 100);
    gain += Math.trunc(gain * (s['martial-cognize'] ?? 0) / 500);
    return 1 + Math.trunc(gain * 100 / (l + 100));
}

export function gumuWeaponLearningConditions(catalog, { smoke = false } = {}) {
    const result = [];
    function add(skill, ability, level = 200, extra = {}) {
        const d = profile(skill), usage = extra.usage ?? d[1], source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, skill);
        const actor = { skills: { force: Math.max(600, level + 1), 'suxin-jue': 400, dodge: 400,
            'yunv-shenfa': 400, [d[1]]: level + 1, [usage]: level + 1, [skill]: level,
            ...(skill === 'xuantie-jian' ? { 'martial-cognize': 220 } : {}), ...extra.skills },
            mappings: { force: 'suxin-jue', dodge: 'yunv-shenfa', [usage]: skill },
            properties: { qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000, jingli: 10000,
                neili: 6000, max_neili: 6000, int: 36, con: 36, str: 36, dex: 36,
                character: '国士无双', gender: '女性', shen: 0, jiali: 0, combat_exp: 100000000,
                learned_points: 0, 'family/family_name': '古墓派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}), ...(extra.temp ? { temp: extra.temp } : {}) };
        const weapon = extra.weapon ?? (d[1] === 'throwing' ? 'none' : d[1]);
        if (weapon !== 'none') actor.equipment = { type: weapon, hold: false,
            id: extra.weaponId ?? (skill === 'xuantie-jian' ? 'xuantie jian' : 'test weapon') };
        if (extra.unmappedForce) delete actor.mappings.force;
        if (extra.unmappedDodge) delete actor.mappings.dodge;
        if (extra.unmapped) delete actor.mappings[usage];
        const p = { school: 'gumu', family: '古墓派', collection_group: 'gumu-weapon-learning',
            skill, usage, ability, level, actor, target: { skills: {}, mappings: {}, properties: {} },
            room: { ...(skill === 'xuantie-jian' ? { 'can_practice_xiantie-jian': 1 } : {}), ...extra.room },
            action: ability === 'practice' ? `practice ${usage} ${extra.times ?? 1}` : 'test_interface',
            ...(ability === 'practice' ? {} : { interface: { object: '/kungfu/skill/' + skill, function: ability } }),
            costs: { qi: d[8], neili: d[9] }, repetitions: extra.times ?? 1,
            observation: 'single_action_immediate', fighting: extra.fighting ?? false, observe_seconds: 0,
            not_applicable: '', qualification_sources: [...new Set([source.path, `kungfu/skill/${d[1]}.c`,
                `kungfu/skill/${usage}.c`, 'kungfu/skill/suxin-jian.c', 'kungfu/skill/suxin-jue.c',
                'kungfu/skill/yunv-shenfa.c', 'kungfu/skill/force.c', 'kungfu/skill/dodge.c',
                'kungfu/skill/literate.c', 'kungfu/skill/martial-cognize.c', `kungfu/class/gumu/${d[10]}.c`,
                'cmds/skill/enable.c', 'cmds/skill/practice.c', 'cmds/skill/learn.c',
                'feature/attribute.c', 'feature/skill.c', 'feature/damage.c'])],
            qualification_note: '真实非巫师USER；原valid_learn、直接practice_skill及完整practice命令分列。已掌握等级、性格、场地及武器ID为实验状态，不证明师承可得或自然抵达练功地点。保留玉女查素心、玄铁原场地键及ID、针法有效身法；不加持针或暗器消费要求。直接练习不复查学习资格也不自动增长熟练度，完整命令按原门槛和部分完成记录。研究及实际授课另行采集。',
        };
        if (ability === 'practice') {
            const eligible = !extra.busy && !p.fighting && !p.room.no_fight && !p.room.pigging
                && p.repetitions >= 1 && p.repetitions <= 50 && actor.mappings[usage] === skill
                && actor.skills[skill] > 0 && actor.skills[usage] > actor.skills[skill]
                && !actor.properties['env/no_learn'] && actor.properties.combat_exp >= level ** 3 / 10
                && gumuWeaponLearningAllowed(p, 'valid_learn');
            p.completed = 0;
            if (eligible) for (let i = 0; i < p.repetitions; i++) {
                const trial = structuredClone(p);
                trial.actor.properties.qi -= i * d[8]; trial.actor.properties.neili -= i * d[9];
                if (!gumuWeaponLearningAllowed(trial, 'practice_skill')) break;
                p.completed++;
            }
            p.expected = p.completed > 0 ? 'observed' : 'refused';
            p.command_return = Number(p.completed > 0 && p.completed === p.repetitions);
        } else p.expected = gumuWeaponLearningAllowed(p) ? 'observed' : 'refused';
        result.push({ id: `school-gumu-weapon-learning-${skill}-${ability}-l${level}${extra.suffix ? '-' + extra.suffix : ''}`,
            stage: 'school', entry_id: source.path, method: ability === 'practice' ? 'practice' : 'interface',
            samples: smoke ? 1 : 2, parameters: p });
    }
    const edge = (skill, ability, suffix, extra = {}) => add(skill, ability, extra.level ?? 200, { suffix, ...extra });
    for (const d of gumuWeaponLearningProfiles) {
        const [skill, usage, force, max, basic, , qi, neili, qiCost, neiliCost] = d;
        for (const l of [200, 400, 800]) for (const ability of ['valid_learn', 'practice_skill', 'practice']) add(skill, ability, l);
        for (const ability of ['valid_learn', 'practice_skill', 'practice']) {
            for (const weapon of ['none', usage === 'sword' ? 'whip' : 'sword']) edge(skill, ability, 'weapon-' + weapon, { weapon });
            edge(skill, ability, 'male', { properties: { gender: '男性' } });
            edge(skill, ability, 'other-family', { properties: { 'family/family_name': '武当派' } });
        }
        for (const value of [199, 200]) edge(skill, 'valid_learn', 'basic' + value, { skills: { [usage]: value } });
        for (const [key, floor] of [['force', force], ['max', max], ['basic', basic]]) {
            for (const v of floor ? [floor - 1, floor] : [0]) edge(skill, 'valid_learn', key + v, {
                ...(key === 'force' ? { skills: { force: v * 2 }, unmappedForce: true }
                    : key === 'max' ? { properties: { max_neili: v, neili: v } } : { level: 1, skills: { [usage]: v } }) });
        }
        for (const ability of ['practice_skill', 'practice']) {
            for (const v of [qi - 1, qi]) edge(skill, ability, 'qi' + v, { properties: { qi: v } });
            for (const v of [neili - 1, neili]) edge(skill, ability, 'neili' + v, { properties: { neili: v } });
        }
        for (const [suffix, properties] of [['partial-qi', { qi: qi + qiCost }], ['partial-neili', { neili: neili + neiliCost }]])
            edge(skill, 'practice', suffix, { properties, times: 3 });
        edge(skill, 'practice', 'times50', { times: 50 });
        edge(skill, 'practice', 'equal-basic', { skills: { [usage]: 200 } });
        if (usage !== 'throwing') edge(skill, 'practice', 'parry', { usage: 'parry' });
    }
    for (const [skill, attr, floor] of [['suxin-jian', 'int', 28], ['yinsuo-jinling', 'dex', 28],
        ['xuantie-jian', 'int', 34], ['xuantie-jian', 'str', 34]]) for (const ability of ['valid_learn', 'practice_skill', 'practice'])
        for (const v of [floor - 1, floor]) edge(skill, ability, attr + v, { properties: { [attr]: v } });
    for (const skill of ['sanwu-shou', 'xuantie-jian']) for (const [suffix, character] of [
        ['guangming', '光明磊落'], ['jiaoxia', '狡黠多变'], ['xinhen', '心狠手辣'], ['yinxian', '阴险奸诈']])
        for (const ability of ['valid_learn', 'practice_skill', 'practice']) edge(skill, ability, suffix, { properties: { character } });
    for (const key of ['force', 'martial-cognize']) for (const v of key === 'force' ? [199, 200] : [219, 220])
        edge('xuantie-jian', 'valid_learn', key + v, { skills: { [key]: v } });
    for (const ability of ['valid_learn', 'practice_skill', 'practice']) {
        edge('xuantie-jian', ability, 'wrong-room', { room: { 'can_practice_xiantie-jian': 0, 'can_practice_xuantie-jian': 1 } });
        edge('xuantie-jian', ability, 'wrong-id', { weaponId: 'test sword' });
        for (const suxin of [0, 200, 201, 202]) edge('yunv-jian', ability, 'suxin' + suxin, { skills: { 'suxin-jian': suxin } });
        edge('yunv-jian', ability, 'own800-basic201', { level: 800, skills: { sword: 201 } });
    }
    for (const [skill, dodge, dex] of [['bingpo-shenzhen', 100, 34], ['yufeng-zhen', 80, 26]]) {
        for (const v of [dodge - 1, dodge]) edge(skill, 'valid_learn', 'dodge' + v, { skills: { dodge: v * 2 }, unmappedDodge: true });
        for (const v of [dex - 1, dex]) edge(skill, 'valid_learn', 'effective-dex' + v, {
            skills: { dodge: 0 }, properties: { dex: v } });
        for (const bonus of ['tattoo/tattoo_dex', 'reborn/dex', 'apply/dex']) edge(skill, 'valid_learn', bonus.replace('/', '-'), {
            skills: { dodge: 0 }, properties: { dex: dex - 1, ...(bonus === 'apply/dex' ? {} : { [bonus]: 1 }) },
            ...(bonus === 'apply/dex' ? { temp: { [bonus]: 1 } } : {}) });
    }
    for (const [suffix, extra] of [['busy', { busy: true }], ['fighting', { fighting: true }], ['unmapped', { unmapped: true }],
        ['no-fight', { room: { no_fight: 1 } }], ['pigging', { room: { pigging: 1 } }], ['times0', { times: 0 }], ['times51', { times: 51 }],
        ['no-learn', { properties: { 'env/no_learn': 'yunv-jian' } }], ['low-exp', { properties: { combat_exp: 799999 } }]])
        edge('yunv-jian', 'practice', suffix, extra);
    for (const l of [299, 300, 499, 500]) add('yunv-jian', 'practice', l);
    for (const [suffix, extra] of [['int9', { properties: { int: 9 } }], ['literate500', { skills: { literate: 500 } }],
        ['wuxing', { properties: { 'special_skill/wuxing': 1 } }], ['cognize500', { skills: { 'martial-cognize': 500 } }],
        ['room50', { room: { practice_improve: 50 } }]]) edge('yunv-jian', 'practice', suffix, extra);
    return result;
}

const fields = ['character', 'family/family_name', 'special_skill/wuxing',
    'tattoo/tattoo_dex', 'reborn/dex', 'env/no_learn'];
const roomFields = ['no_fight', 'pigging', 'practice_improve',
    'can_practice_xiantie-jian', 'can_practice_xuantie-jian'];
const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const countedResources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const mapping = value => value && typeof value === 'object' && !Array.isArray(value);
const idle = value => value === null ? 0 : value;

export function validateGumuWeaponLearningRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-weapon-learning'); assert.equal(raw.outcome, p.expected);
    assert.equal(raw.method, condition.method);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2);
    assert.ok(mapping(raw.weapon_learning_room), '必须观察实际房间属性，不用配置回显代替');
    for (const k of roomFields) {
        assert.ok(Object.hasOwn(raw.weapon_learning_room, k), '实际房间条件缺项：' + k);
        assert.equal(raw.weapon_learning_room[k] ?? 0, p.room[k] ?? 0, k);
    }
    for (const key of ['attacks', 'launches', 'callbacks', 'terminals']) assert.deepEqual(raw[key], []);
    assert.ok(Array.isArray(raw.interfaces)); assert.deepEqual(raw.after, raw.immediate);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side], after = raw.immediate[side], m = raw.metrics[side];
        for (const state of [before, after]) {
            assert.equal(state.userp, 1); assert.equal(state.playerp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
            assert.ok(typeof state.object === 'string' && state.object.length > 0); assert.equal(state.object, before.object);
            for (const k of resources) assert.ok(Number.isSafeInteger(state[k]), k + ' 不得缺失或未知');
            assert.ok(Object.hasOwn(state, 'busy') && Number.isSafeInteger(idle(state.busy)) && idle(state.busy) >= 0,
                '显式 null 空闲和快照缺项不能混同');
            for (const k of ['skills', 'mappings', 'learned', 'effective_skills', 'cultivation', 'temp', 'weapon_details']) assert.ok(mapping(state[k]), k);
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
        assert.ok(mapping(m));
        for (const v of Object.values(m)) assert.ok(Number.isSafeInteger(v) && v >= 0, '未知计量不能当零');
        assert.equal(m.heartbeats ?? 0, 0); assert.equal(m.direct ?? 0, 0);
        for (const k of countedResources) {
            assert.equal(m[k + '_cost'] ?? 0, before[k] - after[k], k + ' 实际扣费');
            assert.equal(m[k + '_recovery'] ?? 0, 0, k + ' 无恢复分支');
        }
        const apply = { armor: 100, ...(cfg.equipment ? { damage: 50, dodge: -1 } : {}) };
        for (const [k, v] of Object.entries(cfg.temp ?? {})) if (k.startsWith('apply/')) apply[k.slice(6)] = v;
        assert.ok(mapping(before.temp.apply));
        for (const k of new Set([...Object.keys(apply), ...Object.keys(before.temp.apply)])) {
            if (Object.hasOwn(before.temp.apply, k)) assert.ok(Number.isSafeInteger(before.temp.apply[k]), '未知装备加成：' + k);
            assert.equal(before.temp.apply[k] ?? 0, apply[k] ?? 0, k + ' 实际装备加成');
        }
        assert.deepEqual(before.effective_skills, Object.fromEntries(Object.keys(cfg.skills).map(k => [k, effective(cfg, k)])));
        assert.deepEqual(after.effective_skills, before.effective_skills);
        assert.deepEqual(after.temp.apply, before.temp.apply);
        assert.equal(before.weapon, cfg.equipment?.type ?? 'none'); assert.equal(after.weapon, before.weapon);
        if (cfg.equipment) {
            const w = before.weapon_details;
            assert.ok(typeof w.object === 'string' && w.object.length > 0, '原装备对象必须可追溯');
            assert.equal(w.program, '/tests/' + cfg.equipment.type); assert.equal(w.skill_type, cfg.equipment.type);
            assert.equal(w.id, cfg.equipment.id); assert.equal(w.weight, 3000); assert.equal(w.damage, 50);
            assert.equal(before.temp.weapon, w.object); assert.equal(before.weapon_damage, w.damage); assert.equal(before.weapon_flag, w.flag);
        } else assert.deepEqual(before.weapon_details, {});
        assert.deepEqual(after.weapon_details, before.weapon_details);
    }
    const b = raw.before[0], a = raw.immediate[0];
    assert.equal(b.effective_dex, dexterity(p.actor)); assert.equal(a.effective_dex, b.effective_dex);
    assert.equal(b.effective_int, b.int + Math.trunc((b.skills.literate ?? 0) / 10));
    assert.equal(a.effective_int, b.effective_int, '练习分母使用先天悟性，不是有效悟性');
    for (const k of ['skills', 'mappings', 'cultivation']) assert.deepEqual(a[k], b[k]);
    assert.deepEqual(raw.immediate[1], raw.before[1]); assert.ok(Object.values(raw.metrics[1]).every(v => v === 0));
    const completed = condition.method === 'practice' ? p.completed : p.ability === 'practice_skill' ? Number(p.expected === 'observed') : 0;
    assert.equal(a.qi, b.qi - completed * p.costs.qi); assert.equal(a.neili, b.neili - completed * p.costs.neili);
    for (const k of [...resources.filter(k => !['qi', 'neili'].includes(k)), 'jingli', 'learned_points', 'str', 'int', 'con', 'dex', 'combat_exp']) assert.equal(a[k], b[k]);
    const learned = structuredClone(b.learned);
    if (condition.method === 'practice' && completed) learned[p.skill] = completed * gumuWeaponPracticeGain(p);
    assert.deepEqual(a.learned, learned);
    if (condition.method === 'interface') {
        assert.equal(raw.command_accepted, 1, '观察命令受理不等于原资格允许');
        assert.equal(raw.interfaces.length, 1);
        for (const [k, v] of Object.entries(p.interface)) assert.equal(raw.interfaces[0][k], v);
        assert.equal(raw.interfaces[0].result, Number(gumuWeaponLearningAllowed(p)));
        assert.equal(raw.interfaces[0].implemented_by, p.interface.object);
    } else {
        assert.deepEqual(raw.interfaces, []); assert.equal(raw.command_accepted, p.command_return);
    }
    if (p.expected === 'refused') assert.ok(raw.reason);
}

// Pass normalized rows for one frozen condition. Raw records intentionally carry no parameters.
export function gumuWeaponLearningEffects(rows, condition) {
    const p = condition?.parameters, valid = ['valid_learn', 'practice_skill', 'practice'].includes(p?.ability);
    const known = rows.filter(r => ['observed', 'refused'].includes(r.outcome)), raws = known.map(r => r.raw);
    const gain = r => {
        const b = r.before?.[0]?.learned, a = r.immediate?.[0]?.learned;
        if (!p?.skill || !mapping(b) || !mapping(a)) return null;
        const before = Object.hasOwn(b, p.skill) ? b[p.skill] : 0, after = Object.hasOwn(a, p.skill) ? a[p.skill] : 0;
        return Number.isFinite(before) && Number.isFinite(after) ? after - before : null;
    };
    const cost = (r, k) => mapping(r.metrics?.[0]) ? Object.hasOwn(r.metrics[0], k + '_cost') ? r.metrics[0][k + '_cost'] : 0 : null;
    const practice = valid && p.ability === 'practice', direct = valid && p.ability === 'practice_skill';
    return {
        ability: valid ? p.ability : 'unknown_ability', attempts: known.length,
        observed: known.filter(r => r.outcome === 'observed').length, refused: known.filter(r => r.outcome === 'refused').length,
        errors: rows.filter(r => r.outcome === 'error').length,
        qualification_allowed: valid && p.ability === 'valid_learn' ? raws.filter(r => r.interfaces?.[0]?.result === 1).length : null,
        command_accepted: practice ? raws.filter(r => r.command_accepted === 1).length : null,
        partial_practice: practice ? raws.filter(r => r.command_accepted === 0 && gain(r) > 0).length : null,
        completed_repetitions: distribution(raws.map(r => practice || direct
            ? Number.isFinite(cost(r, 'qi')) && p.costs?.qi > 0 ? cost(r, 'qi') / p.costs.qi : null : null)),
        learned_gain: distribution(raws.map(gain)), qi_cost: distribution(raws.map(r => cost(r, 'qi'))),
        neili_cost: distribution(raws.map(r => cost(r, 'neili'))),
    };
}
