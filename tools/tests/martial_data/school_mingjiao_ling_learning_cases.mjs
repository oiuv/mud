// Finite original USER qualification/practice slice. No teaching, attacks or game mutations.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution } from './statistics.mjs';

const skill = 'shenghuo-ling', god = 'shenghuo-shengong';
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const sha = x => createHash('sha256').update(x).digest('hex');
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 1000, max_neili: 2400, jingli: 1000, str: 36, con: 36,
    dex: 36, int: 40, gender: '男性', character: '光明磊落', combat_exp: 100000000,
    jiali: 0, potential: 10000, learned_points: 0, 'family/family_name': '明教',
    'env/auto_regenerate': 0 };
export const mingjiaoLingLearningSourcePaths = [
    'kungfu/skill/shenghuo-ling.c', 'kungfu/skill/shenghuo-shengong.c',
    'kungfu/skill/force.c', 'kungfu/skill/sword.c', 'kungfu/skill/blade.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c', 'kungfu/skill/literate.c',
    'cmds/skill/practice.c', 'cmds/skill/learn.c', 'cmds/skill/enable.c',
    'inherit/skill/skill.c', 'inherit/skill/force.c', 'clone/user/user.c', 'inherit/char/char.c',
    'feature/skill.c', 'feature/attribute.c', 'feature/equip.c', 'feature/itemmake.c',
    'feature/dbase.c', 'feature/damage.c', 'feature/action.c', 'feature/attack.c', 'feature/condition.c',
    'feature/name.c', 'mudcore/inherit/dbase.c', 'mudcore/inherit/action.c',
    'clone/weapon/gangjian.c', 'clone/weapon/gangdao.c', 'inherit/weapon/sword.c',
    'inherit/weapon/blade.c', 'inherit/misc/equip.c', 'inherit/item/item.c', 'adm/daemons/itemd.c',
    'adm/single/simul_efun/message.c', 'adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c',
    'data/e2c_dict.o', 'include/globals.h', 'include/command.h', 'include/skill.h',
    'include/dbase.h', 'include/weapon.h', 'mudcore/include/ansi.h',
];
export const mingjiaoLingLearningReviewedSourceHash = '97597075c017cbfa2fac9ece9b4b16dbe1481bde02508e7970d77cd91bc12415';
export const mingjiaoLingLearningAbsentPaths = [];
const evidenceHash = e => sha(JSON.stringify(mingjiaoLingLearningSourcePaths.map(p => [p, e[p]])));
const config = (skills = {}, properties = {}, extra = {}) => ({
    skills: { [skill]: 200, force: 200, sword: 201, [god]: 200, unarmed: 200, dodge: 200,
        parry: 200, ...skills }, mappings: {}, preparations: {}, properties: { ...pool, ...properties }, ...extra });
const refusals = {
    int: '你先天悟性不足，无法领会圣火令法。\n', force: '你的内功火候不到，无法学习圣火令法。\n',
    sword: '你的基本剑法火候不到，无法学习圣火令法。\n', neili: '你的内功修为不足，无法学习圣火令法。\n',
    str: '你现在膂力太差，无法学习圣火令法。\n', effectiveInt: '你现在无法领悟圣火令法的要诣。\n',
    dex: '你现在身法太差，无法学习圣火令法。\n', relativeForce: '你的内功修为不足，无法领会更高深的圣火令法。\n',
    god: '你的圣火神功水平有限，无法领会更高深的圣火令法。\n',
    relativeSword: '你的基本剑法水平有限，无法领会更高深的圣火令法。\n',
    weapon: '你使用的武器不对。\n', level: '你还没有掌握圣火令法中所有的奥妙，无法通过锻炼获得提升。\n',
    qi: '你的体力不够练圣火令法。\n', practiceNeili: '你的内力不够练圣火令法。\n',
    basicEqual: '你的基本剑法火候不够，难以继续提升你圣火令法的水平。\n',
    unmapped: '你只能练习用 enable 指定的特殊技能。\n', busy: '你现在正忙着呢。\n',
    fighting: '你已经在战斗中了，学一点实战经验吧。\n',
};
const progressNotice = '你试着练习圣火令法，但是并没有任何进步。\n';
function plans() {
    const out = [];
    const add = (variant, method, ability, actor = config(), extra = {}) => out.push({
        id: 'school-mingjiao-ling-learning-' + variant, stage: 'school', method, parameters: {
            school: 'mingjiao', family: '明教', collection_group: 'mingjiao-ling-learning', variant,
            skill, usage: 'sword', ability, level: actor.skills[skill], actor, target: config(),
            named_participants: true, fighting: false, room: {}, expected: 'observed', not_applicable: '',
            observation: 'single_action_immediate', observe_seconds: 0,
            action: method === 'practice' ? 'practice sword 1' : 'test_interface',
            qualification_sources: mingjiaoLingLearningSourcePaths,
            qualification_note: '真实非巫师USER的有限资格与原练习实验。201接口通过不是教师能教到201；无预加载激发、动作采集或额外完成次数探针。保留原返回、熟练、资源与部分完成提示，不冒充自然师承或完整圣火令。',
            ...extra } });
    const iface = (v, ability, actor, result, extra = {}) => add(v, 'interface', ability, actor,
        { interface: { object: '/kungfu/skill/' + skill, function: ability, ...extra.interface },
            interface_result: result, command_return: 1, ...extra });
    for (const argument of ['sword', 'parry', 'force']) iface('enable-' + argument, 'valid_enable', config(),
        Number(argument !== 'force'), { interface: { object: '/kungfu/skill/' + skill, function: 'valid_enable', argument } });
    iface('type', 'type', config(), 'martial');
    iface('learn-level', 'valid_learn_level', config(), 200);
    const learn = (v, actor = config(), refusal = '') => iface('learn-' + v, 'valid_learn', actor,
        Number(!refusal), { expected: refusal ? 'refused' : 'observed', refusal });
    learn('baseline');
    learn('int31-literate90', config({ literate: 90 }, { int: 31 }), refusals.int);
    learn('int32-literate80', config({ literate: 80 }, { int: 32 }));
    learn('force199', config({ force: 199 }), refusals.force);
    learn('sword199', config({ [skill]: 180, sword: 199 }), refusals.sword);
    learn('sword200', config({ [skill]: 180, sword: 200 }));
    learn('max-neili2399', config({}, { max_neili: 2399 }), refusals.neili);
    learn('str34', config({}, { str: 14 }), refusals.str);
    learn('str35', config({}, { str: 15 }));
    learn('int39', config({}, { int: 39 }), refusals.effectiveInt);
    learn('dex34', config({}, { dex: 14 }), refusals.dex);
    learn('dex35', config({}, { dex: 15 }));
    const relative = (skills = {}) => config({ [skill]: 201, force: 201, sword: 202, [god]: 201, ...skills });
    learn('relative-force200', relative({ force: 200 }), refusals.relativeForce);
    learn('relative-force201', relative());
    learn('ling200-god0', config({ [god]: 0 }));
    learn('relative-god200', relative({ [god]: 200 }), refusals.god);
    learn('relative-god201', relative());
    learn('relative-sword200', relative({ sword: 200 }), refusals.relativeSword);
    learn('relative-sword201', relative({ sword: 201 }));
    const practiceActor = (level, properties = {}, extra = {}) => config({ [skill]: level,
        sword: Math.max(201, level + 1), force: Math.max(200, level), [god]: level },
    { max_neili: 6000, ...properties }, { mappings: { sword: skill },
        equipment: { type: 'sword', program: '/clone/weapon/gangjian' }, ...extra });
    const practice = (v, level = 200, properties = {}, extra = {}) => add('practice-' + v,
        'practice', 'practice', practiceActor(level, properties, extra.actor),
        { repetitions: 1, completed: 1, command_return: 1, practice_started: true,
            refusal: '', ...Object.fromEntries(Object.entries(extra).filter(([k]) => k !== 'actor')) });
    for (const level of [180, 200, 400, 800]) practice(String(level), level);
    const denied = (refusal, extra = {}) => ({ completed: 0, command_return: 0, expected: 'refused', refusal, ...extra });
    practice('level179', 179, {}, denied(refusals.level));
    practice('no-weapon', 200, {}, denied(refusals.weapon, { actor: { equipment: undefined } }));
    practice('blade', 200, {}, denied(refusals.weapon, { actor: { equipment: { type: 'blade', program: '/clone/weapon/gangdao' } } }));
    practice('qi79', 180, { qi: 79, neili: 80 }, denied(refusals.qi));
    practice('neili79', 180, { qi: 80, neili: 79 }, denied(refusals.practiceNeili));
    practice('minimum', 180, { qi: 80, neili: 80 });
    const early = (refusal, actor = {}, extra = {}) => denied(refusal, { practice_started: false, actor, ...extra });
    const equalActor = practiceActor(200); equalActor.skills.sword = 200;
    add('practice-basic-equal', 'practice', 'practice', equalActor, { repetitions: 1,
        ...early(refusals.basicEqual), actor: equalActor, action: 'practice sword 1' });
    practice('unmapped', 200, {}, early(refusals.unmapped, { mappings: {} }));
    practice('busy', 200, {}, early(refusals.busy, { busy: 1 }));
    practice('fighting', 200, {}, early(refusals.fighting, {}, { fighting: true }));
    practice('partial3', 200, { qi: 130, neili: 150 }, { repetitions: 3, completed: 2,
        command_return: 0, action: 'practice sword 3', refusal: refusals.qi });
    practice('complete3', 200, { qi: 180, neili: 220 }, { repetitions: 3, completed: 3,
        action: 'practice sword 3' });
    // JSON plans must never contain an undefined property masquerading as explicit absence.
    return JSON.parse(JSON.stringify(out));
}
export function mingjiaoLingLearningConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const evidence = Object.fromEntries(mingjiaoLingLearningSourcePaths.map(p => [p, sha(readSource(p))]));
    assert.equal(evidenceHash(evidence), mingjiaoLingLearningReviewedSourceHash, '来源改变须重新复审');
    const source = catalog.skills.find(s => s.id === skill);
    assert.equal(source?.path, 'kungfu/skill/' + skill + '.c'); assert.equal(source.sha256, evidence[source.path]);
    return plans().map(c => ({ ...c, entry_id: 'kungfu/skill/' + skill + '.c', samples: 2,
        parameters: { ...c.parameters, source_evidence: evidence, absent_sources: mingjiaoLingLearningAbsentPaths } }));
}
const map = x => { assert.ok(x && typeof x === 'object' && !Array.isArray(x)); return x; };
const integer = x => { assert.ok(Number.isSafeInteger(x)); return x; };
const field = (o, k) => { assert.ok(Object.hasOwn(map(o), k), 'missing ' + k); return o[k]; };
// Original LPC zero can be serialized as JSON null; missing fields never count as zero.
const num = x => x === null ? 0 : integer(x);
const sparse = (o, k) => Object.hasOwn(map(o), k) ? num(o[k]) : 0;
const metric = (o, k) => { const n = Object.hasOwn(map(o), k) ? integer(o[k]) : 0; assert.ok(n >= 0); return n; };
const plain = s => { assert.equal(typeof s, 'string'); return s.replace(/\x1b\[(?:[0-9;]*m|256D|K)/g, ''); };
function parameters(c) {
    const plan = plans().find(p => p.id === c.id); assert.ok(plan, '未知条件');
    assert.equal(c.stage, plan.stage); assert.equal(c.method, plan.method); assert.equal(c.samples, 2);
    assert.equal(c.entry_id, 'kungfu/skill/' + skill + '.c');
    const { source_evidence, absent_sources, ...rest } = map(c.parameters);
    assert.deepEqual(rest, plan.parameters); assert.deepEqual(absent_sources, []);
    assert.deepEqual(Object.keys(map(source_evidence)), mingjiaoLingLearningSourcePaths);
    for (const h of Object.values(source_evidence)) assert.match(h, /^[0-9a-f]{64}$/);
    assert.equal(evidenceHash(source_evidence), mingjiaoLingLearningReviewedSourceHash); return c.parameters;
}
const cultivation = ['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
    'special_skill/guimai', 'special_skill/wuxing', 'class', 'family/family_name', 'wudang-jiuyang',
    'immune/poison', 'character', 'env/no_learn', 'env/auto_regenerate', 'doing', 'tattoo/tattoo_str',
    'reborn/str', 'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex'];
function initial(s, cfg, side, p) {
    assert.match(field(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(s.id, side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(field(s, k), 1);
    for (const k of ['wizardp', 'ghost', 'conditions']) assert.equal(num(field(s, k)), 0);
    assert.equal(num(field(s, 'busy')), cfg.busy ?? 0); assert.equal(field(s, 'fighting_opponent'), Number(p.fighting));
    assert.deepEqual(field(s, 'skills'), cfg.skills); assert.deepEqual(field(s, 'mappings'), cfg.mappings);
    assert.deepEqual(field(s, 'preparations'), {}); assert.deepEqual(field(s, 'learned'), {});
    for (const [k, v] of Object.entries(cfg.properties)) {
        const actual = field(k.includes('/') || k === 'character' ? s.cultivation : s, k);
        assert.equal(v === 0 ? num(actual) : actual, v, k);
    }
    for (const k of cultivation.filter(k => !Object.hasOwn(cfg.properties, k))) assert.equal(num(field(s.cultivation, k)), 0, k);
    const melee = Math.max(0, ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0));
    assert.equal(field(s, 'effective_str'), cfg.properties.str + Math.trunc(melee / 10));
    assert.equal(field(s, 'effective_int'), cfg.properties.int + Math.trunc((cfg.skills.literate ?? 0) / 10));
    assert.equal(field(s, 'effective_dex'), cfg.properties.dex + Math.trunc(cfg.skills.dodge / 10));
    assert.equal(field(s, 'effective_con'), cfg.properties.con + Math.trunc(cfg.skills.force / 10));
    const gear = cfg.equipment, apply = gear ? { armor: 100, damage: 25, dodge: -2 } : { armor: 100 };
    assert.deepEqual(field(s.temp, 'apply'), apply);
    for (const k of ['powerup', 'shield', 'no_exert', 'guarding', 'str', 'dex']) assert.equal(sparse(s.temp, k), 0);
    for (const k of ['handing', 'secondary_weapon']) { assert.equal(field(s, k), 'none'); assert.deepEqual(field(s, k + '_details'), {}); }
    assert.equal(field(s, 'ammunition'), 0);
    assert.equal(field(s, 'weapon'), gear?.type ?? 'none'); assert.equal(field(s, 'weapon_damage'), gear ? 25 : 0);
    assert.equal(field(s, 'weapon_flag'), gear ? 4 : 0);
    if (!gear) { assert.deepEqual(field(s, 'weapon_details'), {}); assert.equal(sparse(s.temp, 'weapon'), 0); }
    else {
        const d = map(field(s, 'weapon_details')); assert.match(field(d, 'object'), new RegExp('^' + gear.program + '#\\d+$'));
        assert.deepEqual(Object.keys(d).sort(), ['object', 'program', 'skill_type', 'flag', 'weight', 'material', 'rigidity', 'consistence', 'damage', 'no_wield'].sort());
        assert.equal(d.program, gear.program); assert.equal(d.skill_type, gear.type); assert.equal(d.flag, 4);
        assert.equal(d.weight, gear.type === 'sword' ? 6000 : 7000); assert.equal(d.material, 'steel');
        assert.equal(d.consistence, 100); assert.equal(d.damage, 25); assert.equal(num(d.rigidity), 0); assert.equal(num(d.no_wield), 0);
        assert.equal(field(s.temp, 'weapon'), d.object);
    }
    assert.deepEqual(field(s, 'effective_skills'), Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
        [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + sparse(apply, k)])));
}
// Exact original practice + normal (not weak) F_SKILL progress, no cognition/room/wuxing bonus.
function gain(p) {
    const l = p.actor.skills[skill], basic = p.actor.skills.sword, rawInt = p.actor.properties.int;
    const amount = Math.trunc((l >= 500 ? basic : l >= 300 ? basic * 3 : basic * 6 + 30) / Math.sqrt(rawInt) / 6);
    return 1 + Math.trunc(amount * 100 / (l + 100));
}
function stable(before, after) {
    const removed = new Set([...resources, 'learned', 'temp']);
    const keep = s => Object.fromEntries(Object.entries(map(s)).filter(([k]) => !removed.has(k)));
    assert.deepEqual(keep(after), keep(before), '原身份/技能/有效属性/忙乱/装备不得漂移');
}
export function validateMingjiaoLingLearningRecord(raw, c) {
    const p = parameters(c), practice = c.method === 'practice', completed = practice ? p.completed : 0;
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, c.id); assert.equal(raw.method, c.method);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    assert.ok([0, 1].includes(integer(field(raw, 'index'))));
    if (['error', 'not_applicable'].includes(raw.outcome)) {
        assert.ok(plain(field(raw, 'reason')).trim(), '未知结果必须保留原理由');
        return null;
    }
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(field(raw, k)?.length, 2, k);
    for (const k of ['actions', 'directs', 'attacks', 'passives', 'defenses', 'dodge_checks', 'launches',
        'refusals', 'callbacks', 'dropped', 'terminals']) assert.deepEqual(field(raw, k), [], k);
    assert.ok(Array.isArray(field(raw, 'interfaces'))); assert.equal(Object.hasOwn(raw, 'preparation'), false);
    assert.equal(Object.hasOwn(raw, 'skill_loads'), false, '不通过 enable parry 污染空映射资格');
    assert.deepEqual(raw.after, raw.immediate, '此切片没有异步效果/自主心跳');
    assert.equal(field(raw, 'command_accepted'), p.command_return);
    for (const k of ['no_fight', 'practice_improve', 'research_improve']) assert.equal(num(field(raw.movement_room, k)), 0);
    const [b, t] = raw.before, a = raw.immediate[0]; assert.notEqual(b.object, t.object);
    for (const side of [0, 1]) {
        const before = raw.before[side], after = raw.immediate[side], cfg = side ? p.target : p.actor;
        initial(before, cfg, side, p); stable(before, after);
        for (const [k, n] of Object.entries(map(raw.metrics[side]))) {
            integer(n); assert.ok(n >= 0, '未知计数不可填0');
            assert.equal(n, !side && k === 'qi_cost' ? completed * 50 : !side && k === 'neili_cost' ? completed * 70 : 0, k);
        }
        for (const k of resources) {
            const fee = !side && k === 'qi' ? completed * 50 : !side && k === 'neili' ? completed * 70 : 0;
            assert.equal(metric(raw.metrics[side], k + '_cost'), fee); assert.equal(metric(raw.metrics[side], k + '_recovery'), 0);
            assert.equal(after[k], before[k] - fee, k);
        }
    }
    assert.deepEqual(raw.immediate[1], t); // no training fee or qualification side effect on the opponent
    const learnedGain = completed * gain(p);
    assert.deepEqual(a.learned, learnedGain ? { [skill]: learnedGain } : {});
    const expectedTemp = structuredClone(b.temp), actualTemp = structuredClone(a.temp);
    delete expectedTemp.notify_fail; delete actualTemp.notify_fail;
    if (practice && p.practice_started) {
        assert.equal(sparse(expectedTemp.time ?? {}, 'practice'), 0);
        assert.ok(integer(field(actualTemp.time, 'practice')) > 0); delete actualTemp.time.practice;
        if (!Object.keys(actualTemp.time).length) delete actualTemp.time;
    }
    assert.deepEqual(actualTemp, expectedTemp, '只允许原练习时间和原 notify_fail 变化');
    const notice = practice ? p.refusal || progressNotice : p.refusal || '';
    if (notice) assert.equal(field(a.temp, 'notify_fail'), notice);
    else assert.equal(Object.hasOwn(a.temp, 'notify_fail'), Object.hasOwn(b.temp, 'notify_fail'));
    assert.equal(plain(field(raw, 'reason')), p.expected === 'refused' ? p.refusal : '');
    let result = null, implementedBy = null, loadedBefore = null;
    if (practice) { assert.deepEqual(raw.interfaces, []); assert.equal(Object.hasOwn(raw, 'interface_context'), false); }
    else {
        assert.equal(raw.interfaces.length, 1); const event = raw.interfaces[0];
        for (const [k, v] of Object.entries(p.interface)) assert.equal(field(event, k), v);
        const actual = field(event, 'result'); result = typeof actual === 'number' || actual === null ? num(actual) : actual;
        assert.deepEqual(result, p.interface_result);
        implementedBy = field(event, 'implemented_by');
        assert.equal(implementedBy, ['type', 'valid_learn_level'].includes(p.ability) ? '/inherit/skill/skill' : '/kungfu/skill/' + skill);
        const context = map(field(raw, 'interface_context'));
        assert.deepEqual(Object.keys(context).sort(), ['entry_actor', 'loaded_before', 'return_actor']);
        assert.equal(context.entry_actor, b.object); assert.equal(context.return_actor, b.object);
        loadedBefore = num(field(context, 'loaded_before')); assert.ok([0, 1].includes(loadedBefore));
        // --case/resume can start a new driver at another interface; run-order audit owns first0→later1.
    }
    return { method: c.method, ability: p.ability, interface_result: result, implemented_by: implementedBy,
        loaded_before: loadedBefore, command_accepted: raw.command_accepted, completed,
        learned_gain: learnedGain, qi_cost: completed * 50, neili_cost: completed * 70,
        effective_str: b.effective_str, effective_int: b.effective_int, effective_dex: b.effective_dex,
        notice: notice || null };
}
export function mingjiaoLingLearningEffects(rows, c) {
    parameters(c); const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, c.id); assert.equal(row.raw?.condition_id, c.id); assert.equal(row.raw.method, c.method);
        assert.equal(row.raw.outcome, row.outcome); assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        const observed = validateMingjiaoLingLearningRecord(row.raw, c);
        if (observed !== null) known.push(observed);
    }
    const unknown = counts.error + counts.not_applicable;
    const values = f => distribution([...known.map(f), ...Array(unknown).fill(null)]);
    const labels = f => Object.fromEntries([...new Set(known.map(f).filter(x => typeof x === 'string'))]
        .map(s => [s, known.filter(x => f(x) === s).length]));
    return { samples: rows.length, counts, validated: known.length, unknown,
        interface: { result: values(o => typeof o.interface_result === 'number' ? o.interface_result : null),
            texts: labels(o => o.interface_result), implemented_by: labels(o => o.implemented_by),
            loaded_before: values(o => o.loaded_before) },
        practice: { completed: values(o => o.method === 'practice' ? o.completed : null),
            learned_gain: values(o => o.method === 'practice' ? o.learned_gain : null),
            qi_cost: values(o => o.qi_cost), neili_cost: values(o => o.neili_cost),
            command_accepted: values(o => o.command_accepted), notices: labels(o => o.notice) },
        effective: { str: values(o => o.effective_str), int: values(o => o.effective_int), dex: values(o => o.effective_dex) },
        unknown_scopes: ['仅40个确定性资格/原练习条件，不证明自然拜师、教师上限或完整圣火令。',
            '接口201通过不等于原learn自然教授到201；练习命令返回0也可能完成2次并增加熟练。',
            '不选攻击动作或估计冷载随机系数；首次真实USER上下文与保留加载按原件顺序另外核验。',
            '错误/不适用没有完整效果信息，独立未知，不填零；本批不采研究、其余绝招与自然教学。'] };
}
