// Finite original qualification queries. A successful gate is not teaching or cultivation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mingjiaoJiuyangSourcePaths } from './school_mingjiao_jiuyang_cases.mjs';

const copy = v => structuredClone(v), sha = v => createHash('sha256').update(v).digest('hex');
const skill = 'jiuyang-shengong', object = '/kungfu/skill/' + skill;
const group = 'mingjiao-jiuyang-learning', prefix = 'school-mingjiao-learning-jiuyang-';
const flag = 'can_learn/jiuyang-shengong/enable_weapon';
export const mingjiaoJiuyangLearningSourcePaths = [...new Set([...mingjiaoJiuyangSourcePaths,
    'kungfu/skill/liumai-shenjian.c'])];
export const mingjiaoJiuyangLearningReviewedSourceHash = '700450cd84f598bc5a85009b97f753ca7df6c6d10af5547290d84b8d52c8901d';
const evidenceHash = e => sha(JSON.stringify(mingjiaoJiuyangLearningSourcePaths.map(p => [p, e[p]])));
const properties = { name: '试侠', gender: '男性', race: '人类', class: '', character: '光明磊落',
    str: 36, int: 34, con: 38, dex: 36, shen: 90000, combat_exp: 100000000,
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 3500, max_neili: 3500, jingli: 1000, max_jingli: 1000, potential: 10000, learned_points: 0,
    jiali: 0, reborn: 0, [flag]: 0, 'family/family_name': '明教',
    'env/auto_regenerate': 0, 'env/no_learn': 0, doing: 0,
    'tattoo/tattoo_str': 0, 'tattoo/tattoo_int': 0, 'tattoo/tattoo_con': 0, 'tattoo/tattoo_dex': 0,
    'special_skill/wuxing': 0 };
const actor = () => ({ skills: { force: 200, unarmed: 200, parry: 200, dodge: 200,
    sword: 0, blade: 0, 'martial-cognize': 100, [skill]: 200 }, mappings: {}, preparations: {}, properties: copy(properties) });
const neutral = () => ({ skills: { force: 200, unarmed: 200, parry: 200, dodge: 200 }, mappings: {}, preparations: {},
    properties: { ...copy(properties), name: '试客', neili: 1000, max_neili: 1000 } });
const messages = {
    gender: '你无根无性，阴阳不调，难以领会高深的九阳神功。\n',
    character: '九阳神功正大恢弘，气度俨然，你怎么也学不得神似。\n',
    int: '你觉得九阳神功过于艰深，难以理解。\n',
    con: '你的先天根骨孱弱，无法运转九阳神功。\n',
    max_neili: '你的内力修为太浅，无法运转九阳神功。\n',
    cognize: '你觉得九阳神功过于深奥，以自己的武学修养全然无法明白。\n',
    force: '你的基本内功修为不足，难以运转九阳神功。\n',
    relative_force: '你对基本内功的理解还不够，无法继续领会更高深的九阳神功。\n',
    unarmed: '你对基本拳脚的理解还不够，无法继续领会更高深的九阳神功。\n',
    weapon: '你对刀剑功夫的理解还不够，无法继续领会更高深的九阳神功。\n',
    practice: '九阳神功只能用学(learn)的来增加熟练度。\n',
};
const enableNotice = '你学会了利用九阳神功驾御兵器！\n';
// This order is the original short-circuit order, including the first-call mutation.
function gate(cfg, enabled) {
    const p = cfg.properties, s = cfg.skills, level = s[skill] ?? 0;
    const key = p.gender === '无性' ? 'gender' : ['狡黠多变', '阴险奸诈'].includes(p.character) ? 'character'
        : p.int < 34 ? 'int' : p.con < 38 ? 'con' : p.max_neili < 3500 ? 'max_neili'
        : s['martial-cognize'] < 100 ? 'cognize' : s.force < 200 ? 'force' : s.force < level ? 'relative_force'
        : s.unarmed < level ? 'unarmed' : enabled && s.sword < level && s.blade < level ? 'weapon' : '';
    return { result: Number(!key), reason: key ? messages[key] : '', flag_set: Number(!key && !enabled) };
}
function plans() {
    const out = [];
    const add = (variant, ability, cfg, repetitions = 1, method = 'interface') => {
        const decisions = []; let enabled = cfg.properties[flag];
        for (let i = 0; i < repetitions; i++) {
            const d = ability === 'valid_learn' ? gate(cfg, enabled) : ability === 'difficult_level'
                ? { result: (cfg.skills['liumai-shenjian'] ?? 0) > 200 && !cfg.properties.reborn ? 1400 : 1000, reason: '', flag_set: 0 }
                : { result: 0, reason: messages.practice, flag_set: 0 };
            decisions.push(d); if (d.flag_set) enabled = 1;
        }
        const expected = decisions.some(d => d.result) ? 'observed' : 'refused';
        out.push({ id: prefix + variant, stage: 'school', method, parameters: {
            school: 'mingjiao', family: '明教', collection_group: group, variant, skill, usage: 'force', ability,
            level: cfg.skills[skill], actor: cfg, target: neutral(), named_participants: true,
            action: method === 'practice' ? 'practice force 1' : 'test_interface',
            ...(method === 'interface' ? { interface: { object, function: ability }, interface_repetitions: repetitions } : { repetitions: 1, completed: 0 }),
            fighting: false, room: {}, observe_seconds: 0, observation: 'single_action_immediate',
            expected, not_applicable: '', formal_samples: 2, qualification_sources: [...mingjiaoJiuyangLearningSourcePaths],
            qualification_note: '原普通USER的有限资格/难度查询与禁止练习；技能、师承及转世是明示实验输入，接口通过不是授课、成长或自然养成。首次许可写入及同角色下一次拒绝分步保存；不含研究、融合、容量、五绝招及三运功。',
        } });
    };
    const learn = (v, edit = () => {}, n = 1) => { const a = actor(); edit(a); add(v, 'valid_learn', a, n); };
    for (const [v, gender] of [['male', '男性'], ['female', '女性'], ['eunuch', '无性']]) learn('sex-' + v, a => { a.properties.gender = gender; });
    for (const [v, character] of [['ruthless', '心狠手辣'], ['cunning', '狡黠多变'], ['sinister', '阴险奸诈']])
        learn('character-' + v, a => { a.properties.character = character; });
    for (const [key, vals] of [['int', [33, 34]], ['con', [37, 38]], ['max_neili', [3499, 3500]]])
        for (const n of vals) learn(key + n, a => { a.properties[key] = n; if (key === 'max_neili') a.properties.neili = n; });
    for (const n of [99, 100]) learn('cognize' + n, a => { a.skills['martial-cognize'] = n; });
    for (const n of [199, 200]) learn('force' + n, a => { a.skills.force = n; });
    for (const usage of ['force', 'unarmed']) for (const n of [399, 400]) learn('relative-' + usage + n, a => {
        a.skills[skill] = a.skills.force = a.skills.unarmed = 400; a.skills[usage] = n;
    });
    for (const [v, sword, blade] of [['neither', 399, 399], ['sword', 400, 399], ['blade', 399, 400], ['both', 400, 400]])
        learn('flag1-' + v, a => { a.skills[skill] = a.skills.force = a.skills.unarmed = 400;
            a.skills.sword = sword; a.skills.blade = blade; a.properties[flag] = 1; });
    learn('first-ineligible');
    learn('repeat-ineligible', undefined, 2);
    learn('repeat-sword', a => { a.skills.sword = 200; }, 2);
    learn('repeat-blade', a => { a.skills.blade = 200; }, 2);
    learn('repeat-reborn', a => { a.properties.reborn = 1; }, 2);
    learn('raw-int-effective-high', a => { a.properties.int = 33; a.skills.literate = 200; });
    learn('raw-con-effective-high', a => { a.properties.con = 37; a.temp = { 'apply/con': 5 }; });
    learn('raw0', a => { a.skills[skill] = 0; a.skills.force = 700; });
    for (const level of [200, 201]) for (const reborn of [0, 1]) { const a = actor(); a.skills['liumai-shenjian'] = level;
        a.properties.reborn = reborn; add('difficulty-six' + level + '-reborn' + reborn, 'difficult_level', a); }
    const practice = actor(); practice.skills.force = 201; practice.skills.sword = 200;
    practice.properties[flag] = 1; practice.mappings.force = skill;
    add('practice-forbidden', 'practice_skill', practice, 1, 'practice');
    assert.equal(out.length, 37); assert.equal(out.filter(c => c.parameters.ability === 'valid_learn').length, 32);
    return out;
}
const entry = (p, evidence) => { const path = 'kungfu/skill/jiuyang-shengong.c';
    const line = { valid_learn: 207, difficult_level: 341, practice_skill: 337 }[p.ability];
    return { id: `${path}:${line}:${p.ability}`, path, line, function: p.ability, role: 'query_or_gate', sha256: evidence[path] }; };
export function mingjiaoJiuyangLearningConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.equal(typeof readSource, 'function');
    assert.equal(mingjiaoJiuyangLearningSourcePaths.length, 125);
    const evidence = Object.fromEntries(mingjiaoJiuyangLearningSourcePaths.map(p => { const b = readSource(p);
        assert.ok((typeof b === 'string' || Buffer.isBuffer(b)) && b.length); return [p, sha(b)]; }));
    assert.equal(evidenceHash(evidence), mingjiaoJiuyangLearningReviewedSourceHash, 'source changed: review required');
    const base = catalog.skills.find(s => s.id === skill); assert.equal(base?.sha256, evidence['kungfu/skill/jiuyang-shengong.c']);
    for (const ability of ['valid_learn', 'difficult_level', 'practice_skill'])
        assert.ok(base.entries.some(e => e.id === entry({ ability }, evidence).id), 'original entry ' + ability);
    return plans().map(c => ({ ...c, entry_id: entry(c.parameters, evidence).id, samples: 2, status: 'prepared_not_sampled',
        parameters: { ...c.parameters, source_entry: entry(c.parameters, evidence), source_evidence: copy(evidence),
            reviewed_source_hash: mingjiaoJiuyangLearningReviewedSourceHash, absent_sources: [],
            qualification_evidence: mingjiaoJiuyangLearningSourcePaths.map(path => ({ path, sha256: evidence[path] })) } }));
}
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v)); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing ' + k); return v[k]; };
const integer = v => { assert.ok(Number.isSafeInteger(v)); return v; };
const zero = v => { assert.ok(v === null || v === 0); return 0; };
const number = v => v === null ? 0 : integer(v);
const empty = v => { if (v && typeof v === 'object') assert.deepEqual(v, {}); else zero(v); };
// Only numeric SGR and the exact two CSI controls emitted by the original notify_fail.
const plain = v => { assert.equal(typeof v, 'string'); return v.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[256D\x1b\[K/g, ''); };
let fixed;
export function validateMingjiaoJiuyangLearningCondition(c) {
    fixed ??= new Map(plans().map(c => [c.id, c])); const p = fixed.get(own(c, 'id')); assert.ok(p, 'unknown finite condition');
    assert.equal(c.stage, p.stage); assert.equal(c.method, p.method); assert.equal(c.samples, 2);
    const { source_entry, source_evidence, reviewed_source_hash, absent_sources, qualification_evidence, ...rest } = map(own(c, 'parameters'));
    assert.deepEqual(rest, p.parameters); assert.deepEqual(Object.keys(map(source_evidence)), mingjiaoJiuyangLearningSourcePaths);
    for (const h of Object.values(source_evidence)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(evidenceHash(source_evidence), mingjiaoJiuyangLearningReviewedSourceHash);
    assert.equal(reviewed_source_hash, mingjiaoJiuyangLearningReviewedSourceHash);
    assert.deepEqual(source_entry, entry(rest, source_evidence)); assert.equal(c.entry_id, source_entry.id); assert.deepEqual(absent_sources, []);
    assert.deepEqual(qualification_evidence, mingjiaoJiuyangLearningSourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    return c.parameters;
}
function initial(s, cfg, side) {
    assert.match(own(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(own(s, 'id'), side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(s, k), 1);
    for (const k of ['wizardp', 'ghost', 'busy', 'fighting_opponent']) zero(own(s, k));
    empty(own(s, 'conditions')); assert.deepEqual(own(s, 'skills'), cfg.skills);
    assert.deepEqual(own(s, 'mappings'), cfg.mappings); assert.deepEqual(own(s, 'preparations'), cfg.preparations);
    assert.deepEqual(own(s, 'learned'), {});
    const cult = map(own(s, 'cultivation'));
    for (const [k, v] of Object.entries(cfg.properties)) {
        if (['name', 'race'].includes(k)) continue;
        const actual = k.includes('/') || ['reborn', 'character', 'class', 'doing'].includes(k) ? own(cult, k) : own(s, k);
        if (v === 0) zero(actual); else assert.equal(actual, v, k);
    }
    for (const k of ['improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai']) zero(own(cult, k));
    const apply = { armor: 100, ...(cfg.temp?.['apply/con'] ? { con: cfg.temp['apply/con'] } : {}) };
    assert.deepEqual(own(s.temp, 'apply'), apply);
    for (const k of ['str', 'dex', 'fight', 'guarding', 'powerup', 'shield']) if (Object.hasOwn(s.temp, k)) empty(s.temp[k]);
    assert.equal(own(s, 'effective_int'), s.int + Math.trunc((cfg.skills.literate ?? 0) / 10));
    assert.equal(own(s, 'effective_con'), s.con + Math.trunc(cfg.skills.force / 10) + (apply.con ?? 0));
    assert.equal(own(s, 'effective_str'), s.str + Math.trunc(cfg.skills.unarmed / 10));
    assert.equal(own(s, 'effective_dex'), s.dex + Math.trunc(cfg.skills.dodge / 10));
    assert.deepEqual(own(s, 'effective_skills'), Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k,
        Math.trunc(v / 2) + (cfg.mappings[k] === skill ? cfg.skills[skill] : 0)])));
    assert.equal(own(s, 'craze'), 0);
    // Original USER query_max_craze:893, with constants at885–886.
    assert.equal(own(s, 'max_craze'), cfg.properties.character === '光明磊落' ? 5000
        : cfg.properties.character === '心狠手辣' ? 4000 : 0);
    assert.equal(own(s, 'weapon'), 'none'); assert.deepEqual(own(s, 'weapon_details'), {});
    assert.equal(own(s, 'weapon_damage'), 0); assert.equal(own(s, 'weapon_flag'), 0);
    assert.equal(own(s, 'handing'), 'none'); assert.deepEqual(own(s, 'handing_details'), {});
}
function transition(before, after, decision, practice = false) {
    const expected = copy(before), actual = copy(after);
    if (decision.flag_set) expected.cultivation[flag] = 1;
    if (decision.reason) assert.equal(plain(own(after.temp, 'notify_fail')), decision.reason);
    else if (Object.hasOwn(after.temp, 'notify_fail')) assert.equal(after.temp.notify_fail, before.temp.notify_fail);
    delete expected.temp.notify_fail; delete actual.temp.notify_fail;
    if (practice) {
        assert.ok(integer(own(own(after.temp, 'time'), 'practice')) > 0);
        delete actual.temp.time.practice;
        if (!Object.hasOwn(before.temp, 'time')) { assert.deepEqual(actual.temp.time, {}); delete actual.temp.time; }
        else if (Object.hasOwn(before.temp.time, 'practice')) actual.temp.time.practice = before.temp.time.practice;
    }
    assert.deepEqual(actual, expected, 'unexplained state/resource/skill mutation');
}
function messageList(list) {
    assert.ok(Array.isArray(list)); return list.map(e => {
        assert.equal(own(e, 'side'), 0); assert.equal(typeof own(e, 'type'), 'string'); return plain(own(e, 'text'));
    });
}
export function validateMingjiaoJiuyangLearningRecord(raw, c) {
    const p = validateMingjiaoJiuyangLearningCondition(c);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), c.id); assert.equal(own(raw, 'method'), c.method);
    assert.ok(Number.isSafeInteger(own(raw, 'index')) && raw.index >= 0 && raw.index < c.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(own(raw, 'outcome'))) {
        assert.ok(typeof own(raw, 'reason') === 'string' && raw.reason.trim()); return null;
    }
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) { assert.ok(Array.isArray(own(raw, k))); assert.equal(raw[k].length, 2); }
    for (const k of ['actions', 'attacks', 'directs', 'passives', 'defenses', 'dodge_checks', 'launches', 'refusals', 'callbacks', 'dropped', 'terminals'])
        assert.deepEqual(own(raw, k), []);
    initial(raw.before[0], p.actor, 0); initial(raw.before[1], p.target, 1);
    assert.notEqual(raw.before[0].object, raw.before[1].object);
    assert.deepEqual(raw.immediate[1], raw.before[1]); assert.deepEqual(raw.after, raw.immediate);
    for (const m of raw.metrics) { map(m); for (const [k, v] of Object.entries(m)) assert.equal(integer(v), 0, 'unexpected event ' + k); }
    const result = { commands: c.method === 'interface' ? p.interface_repetitions : 1, commands_accepted: 0,
        interface_calls: 0, allowed: 0, refused: 0, flag_set: 0, practice_attempts: 0, practice_completed: 0,
        jing_cost: 0, neili_cost: 0, learned_points: 0, skill_upgrades: 0, net_learned: 0, interface_values: [] };
    if (c.method === 'interface') {
        const steps = own(raw, 'interface_steps'), interfaces = own(raw, 'interfaces');
        assert.ok(Array.isArray(steps) && Array.isArray(interfaces)); assert.equal(steps.length, p.interface_repetitions);
        assert.equal(interfaces.length, steps.length); assert.equal(own(raw, 'command_accepted'), steps.length);
        let previous = raw.before[0];
        for (const [i, step] of steps.entries()) {
            assert.equal(own(step, 'command'), 'test_interface');
            assert.equal(own(step, 'entry_actor'), previous.object); assert.equal(own(step, 'return_actor'), previous.object);
            assert.deepEqual(own(step, 'before'), previous); map(own(step, 'after'));
            const d = p.ability === 'valid_learn' ? gate(p.actor, number(previous.cultivation[flag]))
                : { result: (p.actor.skills['liumai-shenjian'] ?? 0) > 200 && !p.actor.properties.reborn ? 1400 : 1000, reason: '', flag_set: 0 };
            assert.equal(own(step, 'result'), d.result); assert.equal(plain(own(step, 'reason')), d.reason);
            assert.equal(own(step, 'implemented_by'), object);
            assert.deepEqual(interfaces[i], { object, function: p.ability, result: d.result, implemented_by: object });
            const texts = messageList(own(step, 'messages')); assert.deepEqual(texts, d.flag_set ? [enableNotice] : []);
            transition(previous, step.after, d); previous = step.after;
            result.interface_calls++; result.allowed += Number(!!d.result); result.refused += Number(!d.result);
            result.flag_set += d.flag_set; result.interface_values.push(d.result);
        }
        assert.deepEqual(own(raw, 'skill_messages'), steps.flatMap(s => s.messages));
        assert.deepEqual(previous, raw.immediate[0]); result.commands_accepted = steps.length;
        assert.equal(own(raw, 'reason'), p.expected === 'observed' ? '' : steps.at(-1).reason);
    } else {
        assert.equal(own(raw, 'command_accepted'), 0); assert.deepEqual(own(raw, 'interfaces'), []);
        assert.ok(!Object.hasOwn(raw, 'interface_steps'));
        assert.deepEqual(own(raw, 'skill_messages'), []);
        transition(raw.before[0], raw.immediate[0], { result: 0, reason: messages.practice, flag_set: 0 }, true);
        assert.equal(plain(own(raw, 'reason')), messages.practice); result.practice_attempts = 1; result.refused = 1;
    }
    return result;
}
export function mingjiaoJiuyangLearningEffects(rows, c) {
    validateMingjiaoJiuyangLearningCondition(c); assert.ok(Array.isArray(rows));
    const values = rows.map(r => validateMingjiaoJiuyangLearningRecord(own(r, 'raw'), c)), known = values.filter(Boolean), unknown = rows.length - known.length;
    const keys = ['commands', 'commands_accepted', 'interface_calls', 'allowed', 'refused', 'flag_set', 'practice_attempts', 'practice_completed',
        'jing_cost', 'neili_cost', 'learned_points', 'skill_upgrades', 'net_learned'];
    const counts = {}; for (const r of known) for (const v of r.interface_values) counts[String(v)] = (counts[String(v)] ?? 0) + 1;
    return { validated: known.length, unknown, ...Object.fromEntries(keys.map(k => [k, unknown ? null : known.reduce((n, r) => n + r[k], 0)])),
        interface_values: counts, qualification_note: c.parameters.qualification_note };
}
