// Independent preparation only. No registration, driver execution or recorded samples.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution } from './statistics.mjs';
import { gumuBuffPower } from './school_gumu_exert_cases.mjs';

const bibo = 'bibo-shengong', luoying = 'luoying-xinfa', anying = 'anying-fuxiang';
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jingli: 1000,
    str: 36, int: 36, con: 36, dex: 36, gender: '男性', character: '光明磊落',
    combat_exp: 100000000, jiali: 0, potential: 10000, learned_points: 0,
    'family/family_name': '桃花岛', 'env/auto_regenerate': 0 };
const cultivationFields = ['character', 'family/family_name', 'env/auto_regenerate', 'env/no_learn',
    'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/guimai', 'special_skill/wuxing',
    'special_skill/self', 'class', 'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

export const taohuaForceSourcePaths = [
    'kungfu/skill/bibo-shengong.c', 'kungfu/skill/luoying-xinfa.c', 'kungfu/skill/anying-fuxiang.c',
    'kungfu/skill/bibo-shengong/powerup.c', 'kungfu/skill/force/recover.c', 'kungfu/skill/force.c',
    'kungfu/skill/chuixiao-jifa.c', 'kungfu/skill/huashan-xinfa.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'kungfu/class/taohua/huang.c', 'kungfu/class/taohua/rong.c',
    'cmds/skill/exert.c', 'cmds/skill/research.c', 'cmds/skill/practice.c', 'cmds/skill/learn.c',
    'inherit/skill/force.c', 'inherit/skill/skill.c', 'clone/user/user.c', 'inherit/char/char.c',
    'feature/skill.c', 'feature/attribute.c', 'feature/damage.c', 'feature/action.c', 'feature/attack.c',
    'feature/dbase.c', 'feature/equip.c', 'feature/condition.c', 'mudcore/inherit/action.c',
    'mudcore/inherit/dbase.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c', 'data/e2c_dict.o',
    'include/globals.h', 'include/skill.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
export const taohuaForceAbsentPaths = ['bibo-shengong/recover', 'luoying-xinfa/powerup',
    'luoying-xinfa/recover', 'force/powerup'].flatMap(id => ['c', 'lpc'].map(ext => `kungfu/skill/${id}.${ext}`));
export const taohuaForceFixtureRequirements = [
    'Register only after the frozen run. Preserve the 29 conditions and source evidence, save actual tool/dependency bytes, and run independent smoke/formal series; do not reuse another school denominator.',
    'Reuse two connected nonwizard USERs and named_participants for exert powerup right. Add only taohua-force to existing fighting_opponent, effective_int, cultivation fields, secondary_weapon, powers and original room snapshot whitelists; no new observation framework.',
    'Reuse original can_learn(player, skill) dispatch and function_exists ownership, plus player capacity dispatch; allow only the declared interfaces, not the generic valid_learn fallback for compatibility/capacity.',
    'Only A7 prepares apply/attack=7 and apply/defense=11. Only A6 enables two original exert powerup commands; preserve repeat_steps, launch/refusal counts and cumulative metrics. No resource refill or manual expiry.',
    'Reuse the existing original bound eval_function before/after observer and 52-second window at raw bibo50; do not accelerate time, call remove_effect directly or enable autonomous combat/regen heartbeats.',
    'Reuse practice/research commands and movement_room(no_fight/practice_improve/research_improve) plus research_room(no_fight/pigging/research_improve). Capture actual clocks in temp/time and all sparse resource counters; partial practice return0 still retains progress.',
    'Report taohuaForceEffects(normalizedRows, frozenCondition). Interface return, command attempts/acceptance, launch, progress, gross costs/recovery, busy and callback pairs have separate denominators; raw.parameters is not evidence.',
];

function actor(skills, mappings = {}, properties = {}, temp) {
    return { skills, mappings, preparations: {}, properties: { ...pool, ...properties }, ...(temp ? { temp } : {}) };
}

// The finite source-reviewed matrix, before catalog line IDs and source hashes are attached.
function plans() {
    const result = [], target = actor({ force: 200, unarmed: 200, dodge: 200, parry: 200 });
    function add(variant, method, skill, ability, config, extra = {}) {
        const expected = extra.expected ?? 'observed';
        result.push({ id: 'school-taohua-force-' + variant, stage: 'school', method,
            parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-force', variant,
                skill, usage: skill === anying ? 'dodge' : 'force', ability,
                level: config.skills[skill] ?? 200, actor: config, target: structuredClone(target),
                named_participants: true, fighting: false, room: {}, expected, not_applicable: '',
                observation: 'single_action_immediate', observe_seconds: 0,
                action: method === 'interface' ? 'test_interface' : `${method} ${ability}`,
                command_return: method === 'interface' ? 1 : Number(expected === 'observed'),
                qualification_sources: taohuaForceSourcePaths,
                qualification_note: '原USER配功子集为实验输入，不冒充自然师承；专用强化与公共恢复、资格与容量、研究与暗影练习分别计量。原时间/随机/费用/成长保持，部分练习返回0不丢弃已完成进度；不重复NPC闭包、曲谱或整套公共内功。',
                ...extra } });
    }
    const exertActor = (skill = bibo, properties = {}, skills = {}, temp) => actor(
        { force: 200, [skill]: 200, 'chuixiao-jifa': 100, unarmed: 200, dodge: 200, parry: 200, ...skills },
        { force: skill }, properties, temp);
    add('a1-powerup', 'exert', bibo, 'powerup', exertActor());
    add('a2-fighting', 'exert', bibo, 'powerup', exertActor(), { fighting: true });
    add('a3-neili99', 'exert', bibo, 'powerup', exertActor(bibo, { neili: 99 }),
        { expected: 'refused', refusal: '你的真气不够！' });
    add('a4-neili100', 'exert', bibo, 'powerup', exertActor(bibo, { neili: 100 }));
    add('a5-other', 'exert', bibo, 'powerup', exertActor(), { action: 'exert powerup right',
        expected: 'refused', refusal: '你只能用碧波神功提升自己的战斗力。\n' });
    add('a6-repeat', 'exert', bibo, 'powerup', exertActor(), { repeat_actions: ['exert powerup', 'exert powerup'] });
    add('a7-expiry', 'exert', bibo, 'powerup', exertActor(bibo, {}, { [bibo]: 50 },
        { 'apply/attack': 7, 'apply/defense': 11 }), { observation: 'timed_effect', observe_seconds: 52 });
    add('a8-no-powerup', 'exert', luoying, 'powerup', exertActor(luoying),
        { expected: 'refused', refusal: '你所学的内功中没有这种功能。\n' });
    for (const [variant, skill] of [['a9-bibo-recover', bibo], ['a10-luoying-recover', luoying]])
        add(variant, 'exert', skill, 'recover', exertActor(skill, { qi: 9900 }));
    const qualification = (force = 10, level = 50, music = 100, gender = '男性') =>
        actor({ force, [bibo]: level, 'chuixiao-jifa': music }, { force: bibo }, { gender });
    const iface = (variant, skill, ability, config, expected = 'observed') => add(variant, 'interface', skill, ability, config,
        { expected, interface: { object: ability === 'can_learn' ? '/cmds/skill/learn'
            : ability.startsWith('query_') ? 'player' : '/kungfu/skill/' + skill, function: ability,
        ...(ability === 'can_learn' ? { argument: skill } : {}) } });
    iface('b1-qualified', bibo, 'valid_learn', qualification());
    iface('b2-music99', bibo, 'valid_learn', qualification(10, 50, 99), 'refused');
    iface('b3-eunuch49', bibo, 'valid_learn', qualification(10, 49, 100, '无性'));
    iface('b4-eunuch50', bibo, 'valid_learn', qualification(10, 50, 100, '无性'), 'refused');
    iface('b5-force9', bibo, 'valid_learn', qualification(9), 'refused');
    iface('b6-known-luoying', bibo, 'can_learn', actor({ force: 200, [luoying]: 200 }, { force: luoying }));
    iface('b7-known-bibo', luoying, 'can_learn', actor({ force: 200, [bibo]: 200, 'chuixiao-jifa': 100 }, { force: bibo }));
    iface('b8-known-huashan', bibo, 'can_learn', actor({ force: 200, 'huashan-xinfa': 200 }, { force: 'huashan-xinfa' }), 'refused');
    const capacity = mapping => actor({ force: 340, [bibo]: 340, [luoying]: 320 }, { force: mapping });
    iface('b9-total-capacity', bibo, 'query_neili_limit', capacity(bibo));
    iface('b10-current-bibo', bibo, 'query_current_neili_limit', capacity(bibo));
    iface('b11-current-luoying', luoying, 'query_current_neili_limit', capacity(luoying));
    for (const [variant, extra] of [['b12-research-alone', {}], ['b13-research-pair', { [luoying]: 200 }]])
        add(variant, 'research', bibo, 'research', actor({ force: 200, [bibo]: 200, 'chuixiao-jifa': 100, ...extra }, { force: bibo }),
            { action: 'research bibo-shengong 1', repetitions: 1, completed: 1 });
    for (const [variant, level, qi, repetitions, completed] of [
        ['c1-level29', 29, 50, 1, 1], ['c2-level30', 30, 50, 1, 1],
        ['c3-level49', 49, 50, 1, 1], ['c4-level50', 50, 50, 1, 1],
        ['c5-qi49', 50, 49, 1, 0], ['c6-partial', 50, 90, 3, 2],
    ]) add(variant, 'practice', anying, 'practice', actor({ dodge: level + 1, [anying]: level }, { dodge: anying }, { qi }),
        { action: `practice dodge ${repetitions}`, repetitions, completed,
            expected: completed ? 'observed' : 'refused', command_return: Number(completed === repetitions),
            ...(!completed ? { refusal: '你的体力太差了，不能练暗影浮香。\n' } : {}) });
    return result;
}

export function taohuaForceConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(taohuaForceSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((Buffer.isBuffer(bytes) || typeof bytes === 'string') && bytes.length > 0, path);
        return [path, hash(bytes)];
    }));
    // Missing original entries are part of the reviewed fallback behavior, not generated files.
    for (const path of taohuaForceAbsentPaths) {
        let missing = false;
        try { readSource(path); } catch (error) { if (error.code === 'ENOENT') missing = true; else throw error; }
        assert.ok(missing, '原缺席入口出现或未能确认缺席：' + path);
    }
    for (const id of [bibo, luoying, anying, bibo + '/powerup', 'force/recover']) {
        const file = catalog.skills.find(s => s.id === id), path = `kungfu/skill/${id}.c`;
        assert.equal(file?.path, path); assert.equal(file.sha256, evidence[path]);
    }
    return plans().map(condition => {
        const p = condition.parameters;
        const entrySource = condition.method === 'exert' && p.skill === bibo && p.ability === 'powerup'
            ? bibo + '/powerup' : p.ability === 'recover' ? 'force/recover' : p.skill;
        const source = catalog.skills.find(s => s.id === entrySource);
        const entry = entrySource.includes('/') ? source.entries.find(e => e.role === 'exert')?.id : source.path;
        assert.ok(entry && (entrySource.includes('/') ? new RegExp(`^${source.path}:\\d+:exert$`).test(entry) : true), entrySource);
        return { ...condition, entry_id: entry,
            samples: smoke ? 2 : ['a2-fighting', 'b12-research-alone', 'b13-research-pair'].includes(p.variant) ? samples : 2,
            parameters: { ...p, source_evidence: evidence, absent_sources: taohuaForceAbsentPaths } };
    });
}

function map(value, label) { assert.ok(value && typeof value === 'object' && !Array.isArray(value), label); return value; }
function int(value, label) { assert.ok(Number.isSafeInteger(value), label); return value; }
function idleField(value, key) {
    assert.ok(Object.hasOwn(value, key), '缺少明确空值字段：' + key);
    if (value[key] === null) return 0;
    return int(value[key], key);
}
function sparse(value, key) { map(value, '缺少原映射'); return Object.hasOwn(value, key) ? int(value[key], key) : 0; }
function metric(value, key) { const n = sparse(value, key); assert.ok(n >= 0, key); return n; }
function learnt(state) {
    const table = map(state.learned, '缺少熟练映射');
    for (const value of Object.values(table)) assert.ok(Number.isSafeInteger(value) && value >= 0);
    return table;
}
function conditionParameters(condition) {
    const p = map(condition.parameters, '缺少冻结条件'), plan = plans().find(c => c.id === condition.id);
    assert.ok(plan, '未审核条件ID');
    assert.equal(condition.stage, plan.stage); assert.equal(condition.method, plan.method);
    const { source_evidence: evidence, absent_sources: absent, ...rest } = p;
    assert.deepEqual(rest, plan.parameters, '有限矩阵不得漂移');
    assert.deepEqual(Object.keys(map(evidence)), taohuaForceSourcePaths);
    for (const value of Object.values(evidence)) assert.match(value, /^[a-f0-9]{64}$/);
    assert.deepEqual(absent, taohuaForceAbsentPaths);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    const source = condition.method === 'exert' && p.skill === bibo && p.ability === 'powerup'
        ? 'kungfu/skill/bibo-shengong/powerup.c' : p.ability === 'recover' ? 'kungfu/skill/force/recover.c' : `kungfu/skill/${p.skill}.c`;
    if (source.endsWith('/powerup.c') || source.endsWith('/recover.c')) assert.match(condition.entry_id, new RegExp(`^${source}:\\d+:exert$`));
    else assert.equal(condition.entry_id, source);
    return p;
}

export function taohuaForceResearchSupport(p) {
    assert.equal(p.skill, bibo); assert.equal(p.actor.skills[bibo], 200); assert.equal(p.actor.properties.int, 36);
    // query_scale first rewrites force-capable skill names to "force": 150/120, NOT default80/120.
    const related = [p.actor.skills.force, ...(p.actor.skills[luoying] ? [p.actor.skills[luoying]] : [])].sort((a, b) => b - a);
    const scaled = related.reduce((sum, level, i) => sum + level * [150, 120][i], 0);
    const bound = Math.trunc(Math.trunc(scaled / 15) / 100) + Math.trunc(200 / 50) + Math.trunc((36 / 12) ** 2);
    return { random_bound: bound, gains: [...new Set(Array.from({ length: bound }, (_, draw) => 1 + Math.trunc(draw * 100 / 300)))] };
}
export function taohuaForcePracticeGain(p) {
    const amount = Math.trunc((p.actor.skills.dodge * 6 + 30) / Math.sqrt(p.actor.properties.int) / 6);
    return 1 + Math.trunc(amount * 100 / (p.actor.skills[anying] + 100));
}
function interfaceValue(p) {
    if (p.ability === 'valid_learn') return Number(p.actor.skills.force >= 10 && p.actor.skills['chuixiao-jifa'] >= 100
        && !(p.actor.properties.gender === '无性' && p.actor.skills[bibo] > 49));
    if (p.ability === 'can_learn') return Number(!p.actor.skills['huashan-xinfa']);
    assert.ok(['query_neili_limit', 'query_current_neili_limit'].includes(p.ability));
    const s = p.actor.skills, base = Math.trunc(s.force / 2) * 10;
    const eligible = p.ability === 'query_neili_limit' ? [bibo, luoying] : [p.actor.mappings.force];
    return Math.max(base, ...eligible.map(skill => base + s[skill] * 10
        + (skill === bibo ? Math.trunc(Math.trunc(s[skill] ** 2 * 225 / 100) / 200) : 0)));
}
function identity(s) {
    map(s, '缺少角色快照'); assert.match(s.object, /^\/tests\/actor#\d+$/);
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(s[key], 1, key);
    for (const key of ['wizardp', 'ghost']) assert.equal(s[key], 0, key);
    assert.ok(idleField(s, 'busy') >= 0); assert.ok([0, 1].includes(s.fighting_opponent));
    for (const k of ['temp', 'skills', 'mappings', 'preparations', 'effective_skills', 'cultivation']) map(s[k], k);
    for (const k of ['skills', 'effective_skills']) for (const value of Object.values(s[k])) int(value, k);
    learnt(s); map(s.temp.apply, '缺少apply');
    for (const value of Object.values(s.temp.apply)) int(value, 'apply');
    for (const k of [...resources, 'max_qi', 'max_jing', 'max_neili', 'potential', 'learned_points']) int(s[k], k);
    assert.ok(Object.hasOwn(s, 'conditions'));
    if (s.conditions !== null && s.conditions !== 0) assert.deepEqual(map(s.conditions), {});
    for (const slot of ['weapon', 'handing', 'secondary_weapon']) {
        assert.equal(s[slot], 'none'); assert.deepEqual(s[slot + '_details'], {});
    }
    for (const k of ['weapon_damage', 'weapon_flag', 'ammunition']) assert.equal(s[k], 0);
}
function stable(b, a) {
    const except = new Set([...resources, 'learned', 'learned_points', 'busy', 'temp', 'powers']);
    const keep = state => Object.fromEntries(Object.entries(state).filter(([key]) => !except.has(key)));
    assert.deepEqual(keep(a), keep(b), '原身份/属性/装备/技能/映射不得改变');
}
function cleanTemp(state) { const temp = structuredClone(state.temp); delete temp.notify_fail; return temp; }
function normalizedApply(temp) {
    const result = structuredClone(temp);
    for (const key of Object.keys(result.apply)) if (result.apply[key] === 0) delete result.apply[key];
    // delete_temp removes powerup; explicit LPC zero/null is also an observed absence.
    if (Object.hasOwn(result, 'powerup') && [0, null].includes(result.powerup)) delete result.powerup;
    return result;
}
function refusal(raw, text) {
    assert.equal(typeof raw.reason, 'string'); assert.ok(raw.reason.length > 0);
    if (text) assert.equal(raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''), text);
}
function qualificationRefusal(p) {
    return { 'b2-music99': '你没有精通吹箫技法，无法领会碧波神功的奥秘。\n',
        'b4-eunuch50': '你无根无性，阴阳不调，难以领会高深的碧波神功。\n',
        'b5-force9': '你的基本内功火候不够，不能学习特殊内功。\n',
        'b8-known-huashan': '你发现自身所学的华山心法和碧波神功冲突不已，根本没办法并存。\n' }[p.variant];
}

export function validateTaohuaForceRecord(raw, condition) {
    const p = conditionParameters(condition), ok = p.expected === 'observed';
    assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, condition.method); assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'after', 'metrics']) {
        assert.ok(Array.isArray(raw[key]), key); assert.equal(raw[key].length, 2, key);
    }
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'dropped', 'terminals']) assert.deepEqual(raw[key], [], key);
    for (const key of ['actions', 'directs']) if (Object.hasOwn(raw, key)) assert.deepEqual(raw[key], []);
    for (const key of ['interfaces', 'launches', 'refusals', 'callbacks']) assert.ok(Array.isArray(raw[key]), key);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    assert.equal(Object.hasOwn(raw, 'preparation'), false);
    const [b, target] = raw.before, a = raw.immediate[0], end = raw.after[0];
    assert.notEqual(b.object, target.object);
    // force_me preserves command()'s positive execution cost, not the lfun's 1.
    // Only the existing repeat runner replaces the outer field with a boolean.
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted >= 0);
    assert.equal(p.repeat_actions ? raw.command_accepted : Number(raw.command_accepted > 0), p.command_return);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side];
        for (const phase of ['before', 'immediate', 'after']) { identity(raw[phase][side]); stable(state, raw[phase][side]); }
        assert.equal(state.id, side ? 'right' : 'left'); assert.equal(idleField(state, 'busy'), 0);
        assert.equal(state.fighting_opponent, Number(p.fighting));
        assert.deepEqual(state.skills, cfg.skills); assert.deepEqual(state.mappings, cfg.mappings);
        assert.deepEqual(state.preparations, {}); assert.deepEqual(learnt(state), {});
        for (const [key, value] of Object.entries(cfg.properties)) {
            if (key.includes('/') || key === 'character') {
                assert.ok(Object.hasOwn(state.cultivation, key), key);
                assert.equal(value === 0 ? idleField(state.cultivation, key) : state.cultivation[key], value, key);
            } else assert.equal(state[key], value, key);
        }
        for (const key of cultivationFields.filter(key => !Object.hasOwn(cfg.properties, key)))
            assert.equal(idleField(state.cultivation, key), 0, key);
        const apply = { armor: 100 };
        for (const [key, value] of Object.entries(cfg.temp ?? {})) apply[key.slice(6)] = value;
        assert.deepEqual(state.temp.apply, apply, '固定空手加成，不偷加有效技能或属性');
        assert.deepEqual(state.effective_skills, Object.fromEntries(Object.entries(cfg.skills)
            .map(([key, level]) => [key, Math.trunc(level / 2) + (cfg.skills[cfg.mappings[key]] ?? 0)])));
        assert.equal(state.effective_int, cfg.properties.int);
        const strongest = Math.max(0, ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0));
        assert.equal(state.effective_str, cfg.properties.str + Math.trunc(strongest / 10));
        assert.equal(sparse(state.temp, 'powerup'), 0); assert.equal(sparse(state.temp, 'no_exert'), 0);
        const counters = map(raw.metrics[side], '缺少原毛资源账');
        for (const value of Object.values(counters)) assert.ok(Number.isSafeInteger(value) && value >= 0, '未知计量不能补零');
        for (const key of ['hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats']) assert.equal(metric(counters, key), 0, key);
    }
    assert.deepEqual(raw.immediate[1], target); assert.deepEqual(raw.after[1], target);
    const exert = condition.method === 'exert', practice = condition.method === 'practice', research = condition.method === 'research';
    const buff = exert && p.ability === 'powerup' && ok, recover = exert && p.ability === 'recover';
    const completed = practice || research ? p.completed : null;
    const qiCost = practice ? completed * (p.level < 30 ? 10 : p.level < 50 ? 25 : 40) : 0;
    const costs = { qi: qiCost, jing: research ? 27 : 0, neili: buff ? 100 : recover ? 33 : 0 };
    for (const side of [0, 1]) for (const key of resources) {
        const cost = side ? 0 : costs[key] ?? 0, heal = !side && recover && key === 'qi' ? 100 : 0;
        assert.equal(metric(raw.metrics[side], key + '_cost'), cost, key + ' 原毛支出');
        assert.equal(metric(raw.metrics[side], key + '_recovery'), heal, key + ' 原毛恢复');
        for (const phase of ['immediate', 'after'])
            assert.equal(raw[phase][side][key], raw.before[side][key] - cost + heal, key + ' 原净差');
    }
    assert.equal(metric(raw.metrics[0], 'ability_launched'), Number(exert && ok));
    assert.ok(Object.values(raw.metrics[1]).every(value => value === 0));
    const learnedSkill = exert ? recover ? 'force' : p.skill : p.skill;
    const gain = sparse(learnt(a), learnedSkill);
    for (const [key, value] of Object.entries(a.learned)) if (key !== learnedSkill) assert.equal(value, 0, '只能增长原入口所对应技能');
    if (exert) assert.equal(gain, Number(ok));
    else if (practice) assert.equal(gain, completed * taohuaForcePracticeGain(p));
    else if (research) assert.ok(taohuaForceResearchSupport(p).gains.includes(gain), '原研究随机支持集合');
    else assert.equal(gain, 0);
    assert.deepEqual(end.learned, a.learned); assert.deepEqual(raw.immediate[1].learned, target.learned);
    assert.equal(a.learned_points - b.learned_points, research ? 1 : 0); assert.equal(end.learned_points, a.learned_points);
    if (exert) {
        assert.equal(raw.interfaces.length, 0);
        assert.deepEqual(raw.launches, ok ? [{ actor: b.object, skill: recover ? 'force' : p.skill, argument: p.action.slice(6) }] : []);
        assert.equal(raw.refusals.length, !ok || p.repeat_actions ? 1 : 0);
        if (raw.refusals.length) {
            assert.equal(raw.refusals[0].actor, b.object);
            refusal(raw.refusals[0], p.repeat_actions ? '你已经在运功中了。\n' : p.refusal);
            assert.equal(raw.refusals[0].reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''), a.temp.notify_fail);
        }
        if (!ok) { refusal(raw, p.refusal); assert.equal(raw.reason, raw.refusals[0].reason); }
        else assert.equal(raw.reason, '');
    } else {
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.refusals, []);
        if (condition.method === 'interface') {
            assert.equal(raw.interfaces.length, 1); const event = raw.interfaces[0];
            for (const [key, value] of Object.entries(p.interface)) assert.equal(event[key], value);
            assert.equal(idleField(event, 'result'), interfaceValue(p));
            assert.equal(event.implemented_by, p.ability === 'can_learn' ? '/cmds/skill/learn'
                : p.ability.startsWith('query_') ? '/clone/user/user' : '/kungfu/skill/' + p.skill);
        } else assert.deepEqual(raw.interfaces, []);
        if (!ok) {
            refusal(raw, p.refusal ?? qualificationRefusal(p));
            assert.equal(typeof a.temp.notify_fail, 'string');
            assert.equal(raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''),
                a.temp.notify_fail.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''));
        }
        else assert.equal(raw.reason, '');
    }
    assert.ok(p.fighting && buff ? [1, 2, 3].includes(idleField(a, 'busy')) : idleField(a, 'busy') === 0);
    assert.equal(idleField(end, 'busy'), idleField(a, 'busy'));
    const expectedTemp = cleanTemp(b), actualTemp = cleanTemp(a);
    if (practice || research) {
        const key = practice ? 'practice' : 'research';
        const time = map(actualTemp.time, '缺少原命令冷却时间');
        assert.ok(Number.isSafeInteger(time[key]) && time[key] > 0, '必须是真实time()');
        const beforeTime = expectedTemp.time ?? {};
        assert.equal(sparse(beforeTime, key), 0, '初态不预置本次冷却');
        delete time[key];
        if (!Object.keys(time).length) delete actualTemp.time;
    }
    if (buff) {
        for (const key of ['attack', 'defense']) expectedTemp.apply[key] = sparse(expectedTemp.apply, key) + Math.trunc(p.level / 3);
        expectedTemp.powerup = 1;
    }
    assert.deepEqual(normalizedApply(actualTemp), normalizedApply(expectedTemp), '未声明临时变化');
    if (exert) for (const s of [b, a, end]) {
        assert.deepEqual(Object.keys(map(s.powers)).sort(), ['attack', 'dodge', 'parry']);
        for (const key of ['attack', 'dodge', 'parry']) assert.equal(s.powers[key], gumuBuffPower(s, key), '原skill_power：' + key);
    }
    if (p.repeat_actions) {
        assert.equal(raw.repeat_steps?.length, 2);
        const [first, second] = raw.repeat_steps;
        assert.deepEqual(first.before, b); assert.deepEqual(second.before, first.after); assert.deepEqual(second.after, a);
        for (const [i, step] of raw.repeat_steps.entries()) {
            assert.equal(step.action, p.repeat_actions[i]);
            assert.ok(Number.isSafeInteger(step.accepted) && step.accepted >= 0);
            assert.equal(Number(step.accepted > 0), 1 - i);
            assert.equal(step.launches_before, i); assert.equal(step.launches_after, 1);
            assert.equal(step.refusals_before, 0); assert.equal(step.refusals_after, i);
            assert.deepEqual(step.metrics, raw.metrics[0], '重复拒绝无额外费用/发动');
        }
        assert.equal(first.reason, ''); assert.equal(second.reason, raw.refusals[0].reason);
        const clean = state => ({ ...state, temp: cleanTemp(state) });
        assert.deepEqual(clean(first.after), clean(a), '第二次命令只改变拒绝提示');
    } else assert.equal(Object.hasOwn(raw, 'repeat_steps'), false);
    if (!p.observe_seconds) { assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.callbacks, []); }
    else {
        assert.deepEqual(raw.callbacks.map(c => [c.side, c.phase]), [[0, 'before'], [0, 'after']]);
        const [x, y] = raw.callbacks;
        for (const event of [x, y]) {
            assert.ok(Number.isFinite(event.elapsed) && event.elapsed >= 0);
            identity(event.state); stable(a, event.state); assert.equal(event.state.object, b.object);
        }
        assert.ok(x.elapsed >= p.level - 1 && y.elapsed >= x.elapsed && y.elapsed <= raw.elapsed);
        assert.ok(raw.elapsed >= p.observe_seconds - 1);
        assert.deepEqual(x.state, a); assert.deepEqual(y.state, end);
        assert.deepEqual(normalizedApply(cleanTemp(end)), normalizedApply(cleanTemp(b)), '到期必须仅恢复本次加成');
        assert.equal(end.object, b.object); assert.equal(end.id, b.id);
    }
    if (practice || research) {
        for (const key of ['no_fight', 'practice_improve', 'research_improve']) assert.equal(idleField(map(raw.movement_room), key), 0);
        if (research) for (const key of ['no_fight', 'pigging', 'research_improve']) assert.equal(idleField(map(raw.research_room), key), 0);
    }
    return { method: condition.method, interface_result: condition.method === 'interface' ? interfaceValue(p) : null,
        command_attempts: condition.method === 'interface' ? 0 : p.repeat_actions?.length ?? 1,
        commands_accepted: condition.method === 'interface' ? 0 : p.repeat_actions ? 1 : Number(raw.command_accepted > 0),
        launches: raw.launches.length, completed, learned_skill: learnedSkill, learned_gain: gain,
        learned_points: a.learned_points - b.learned_points, busy: idleField(a, 'busy'),
        costs: Object.fromEntries(resources.map(key => [key, metric(raw.metrics[0], key + '_cost')])),
        recovery: Object.fromEntries(resources.map(key => [key, metric(raw.metrics[0], key + '_recovery')])),
        net: Object.fromEntries(resources.map(key => [key, a[key] - b[key]])),
        powers_delta: exert ? Object.fromEntries(['attack', 'dodge', 'parry'].map(key => [key, a.powers[key] - b.powers[key]])) : null,
        callback_pairs: raw.callbacks.length / 2, expiry_seconds: raw.callbacks.length ? raw.callbacks[0].elapsed : null };
}
export function taohuaForceEffects(rows, condition) {
    conditionParameters(condition);
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, observations = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.method, condition.method); assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        if (row.outcome === 'error') continue;
        observations.push(validateTaohuaForceRecord(row.raw, condition));
    }
    const sum = key => observations.reduce((total, item) => total + item[key], 0);
    const knownAndUnknown = values => [...values, ...Array(counts.error).fill(null)];
    const values = key => distribution(knownAndUnknown(observations.map(item => item[key])));
    return { samples: rows.length, counts, unknown_samples: counts.error, validated_samples: observations.length,
        interface_samples: observations.filter(o => o.method === 'interface').length,
        interface_result: values('interface_result'), command_attempts: sum('command_attempts'),
        commands_accepted: sum('commands_accepted'), launches: sum('launches'),
        progressed_samples: observations.filter(o => o.learned_gain > 0).length,
        partial_practice_samples: observations.filter(o => o.method === 'practice' && o.commands_accepted === 0 && o.completed > 0).length,
        completed_repetitions: values('completed'), learned_gain: values('learned_gain'), learned_points: values('learned_points'),
        costs: Object.fromEntries(resources.map(key => [key, distribution(knownAndUnknown(observations.map(o => o.costs[key])))])),
        recovery: Object.fromEntries(resources.map(key => [key, distribution(knownAndUnknown(observations.map(o => o.recovery[key])))])),
        net: Object.fromEntries(resources.map(key => [key, distribution(knownAndUnknown(observations.map(o => o.net[key])))])),
        busy_histogram: Object.fromEntries([0, 1, 2, 3].map(value => [value, observations.filter(o => o.busy === value).length])),
        powers_delta: Object.fromEntries(['attack', 'dodge', 'parry'].map(key => [key, distribution(knownAndUnknown(observations.map(o => o.powers_delta?.[key])))])),
        callback_pairs: sum('callback_pairs'), expiry_seconds: values('expiry_seconds') };
}
