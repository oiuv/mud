// Finite source-reviewed preparation only. No game writes, driver, RNG or samples here.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';
import { gumuMovementGain } from './school_gumu_movement_cases.mjs';
import { gumuBuffPower } from './school_gumu_exert_cases.mjs';

const skills = ['shenghuo-bu', 'qingfu-shenfa', 'lingxu-bu'];
const qingfu = skills[1], resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const sha = x => createHash('sha256').update(x).digest('hex');
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jingli: 1000, str: 36, int: 36,
    con: 36, dex: 36, gender: '男性', character: '光明磊落', combat_exp: 100000000,
    jiali: 0, potential: 10000, learned_points: 0, 'family/family_name': '明教', 'env/auto_regenerate': 0 };
export const mingjiaoMovementSourcePaths = [
    ...skills.map(s => `kungfu/skill/${s}.c`),
    'kungfu/skill/dodge.c', 'kungfu/skill/unarmed.c', 'kungfu/skill/parry.c', 'kungfu/skill/force.c',
    'kungfu/class/mingjiao/weiyixiao.c', 'kungfu/class/mingjiao/xiexun.c', 'kungfu/class/mingjiao/fanyao.c',
    'kungfu/class/mingjiao/mingjiao.h', 'cmds/skill/practice.c', 'cmds/skill/learn.c',
    'inherit/skill/skill.c', 'clone/user/user.c', 'inherit/char/char.c',
    'feature/skill.c', 'feature/attribute.c', 'feature/damage.c', 'feature/action.c', 'feature/attack.c',
    'feature/dbase.c', 'feature/equip.c', 'feature/condition.c', 'mudcore/inherit/action.c',
    'mudcore/inherit/dbase.c', 'adm/daemons/combatd.c', 'adm/daemons/race/human.c',
    'adm/single/simul_efun/message.c', 'adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c',
    'data/e2c_dict.o', 'include/globals.h', 'include/skill.h', 'include/command.h', 'include/combat.h',
    'mudcore/include/ansi.h',
];
export const mingjiaoMovementReviewedSourceHash = '9fdbd21aaf2199ac353caeffbbbb5da669261cdbf12cc52cee727bbde3aa25bc';
export const mingjiaoMovementAbsentPaths = [];
const evidenceHash = e => sha(JSON.stringify(mingjiaoMovementSourcePaths.map(p => [p, e[p]])));
const config = (s = {}, mappings = {}, properties = {}, extra = {}) => ({
    skills: { force: 600, unarmed: 600, parry: 600, dodge: 600, ...s }, mappings,
    preparations: {}, properties: { ...pool, ...properties }, ...extra });
const extraDP = l => l < 50 ? 0 : l < 100 ? 10 : l < 150 ? 20 : l < 200 ? 30
    : l < 250 ? 40 : l < 300 ? 50 : l < 350 ? 60 : 80;
const qiRefusal = s => s === qingfu ? '你的体力太低了，不能练青蝠身法。\n'
    : s === skills[0] ? '你的体力太差了，无法练习圣火步法。\n' : '你的体力太差了，不能练凌虚步。\n';
const neiliRefusal = '你的内力不够练青蝠身法。\n';
const names = { 'shenghuo-bu': '圣火步法', 'qingfu-shenfa': '青蝠身法', 'lingxu-bu': '凌虚步' };
const messages = {
    'shenghuo-bu': ['$n身形急转，避过了$N的攻势。\n', '可是$n拔地而起，躲过了$N这一招。\n', '$n作闪右避，总算躲过了$N这一招。\n'],
    'qingfu-shenfa': ['只见$n一招「福满乾坤」，身形陡然纵起，躲过了$N这一招。\n',
        '$n一式「五蝠献寿」，身形晃动，向一旁飘出，避开了$N这一招。。\n$n使出「洞天福地」，一个空心筋斗向后翻出，避开了$N的凌厉攻势。\n',
        '$n一招「云龙百蝠」，身随意转，$N只觉眼前一花，$n已绕至$N的身后。\n'],
    'lingxu-bu': ['$n一式「雪地莲花」，身子掣忽一转，$N只觉的眼前一花，失去了目标。\n',
        '$n一式「一狐冲天」，双脚点地，身子突然拔高了丈许，缓缓飘落在$N身后。\n',
        '$n一式「移行幻影」，身行一晃，顿时无数条身影一下子出现在$N的面前。\n',
        '$n一式「狡兔三窟」，飘然向后一退，躲开$N的凌厉攻势。\n',
        '$n一式「烟雨飘渺」，身体急转，化为一道白光，虚幻不定的出现在$N的周围。\n'],
};
const green = ['只见$n长啸一声犹如一只蝙蝠一样纵身而起，于半空倒立，$N这招却扑了个空。\n',
    '但见$n身法轻盈无比，忽然跃高忽而落下，令$N完全无从攻击。\n'];
const failedBH = '但见$n身法轻盈无比，忽然跃高忽而落下，$N不假思索，飞身出招，更是巧妙无方。\n';
const plain = s => s.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');

function plans() {
    const out = [];
    const add = (variant, skill, ability, actor = config(), extra = {}) => {
        const method = ability === 'ordinary' ? 'ordinary' : ability === 'practice' ? 'practice' : 'interface';
        out.push({ id: 'school-mingjiao-movement-' + variant, stage: 'school', method, parameters: {
            school: 'mingjiao', family: '明教', collection_group: 'mingjiao-movement', variant, skill,
            usage: 'dodge', ability, level: actor.skills[skill] ?? extra.target?.skills[skill] ?? 200,
            actor, target: config(), named_participants: true, fighting: false, room: {},
            expected: 'observed', not_applicable: '', observation: 'single_action_immediate', observe_seconds: 0,
            action: method === 'ordinary' ? 'ordinary' : method === 'practice' ? 'practice dodge 1' : 'test_interface',
            qualification_sources: mingjiaoMovementSourcePaths,
            qualification_note: '普通USER的有限配功实验，不冒充自然师承或完整明教。凌虚步只按范遥实际自用关系纳入。缺接口由原function_exists与返回值观测，不当作实现默认值；原随机与青蝠副效应不改。',
            ...extra } });
    };
    const iface = (v, s, ability, actor, extra = {}) => add(v, s, ability, actor,
        { interface: { object: '/kungfu/skill/' + s, function: ability, ...extra.interface }, ...extra });
    for (const s of skills) for (const argument of ['dodge', 'move', 'parry'])
        iface(`enable-${s}-${argument}`, s, 'valid_enable', config({ [s]: 200 }),
            { interface: { object: '/kungfu/skill/' + s, function: 'valid_enable', argument } });
    for (const s of [skills[0], skills[2]]) iface('learn-' + s, s, 'valid_learn', config({ [s]: 50 }));
    for (const [variant, dex, dodge, refusal] of [['dex25', 25, 100, '你先天身法太差，无法学习青蝠身法。\n'],
        ['basic99', 26, 99, '你轻功根基不足，无法学习青蝠身法。\n'], ['minimum', 26, 100, '']])
        iface('learn-qingfu-' + variant, qingfu, 'valid_learn', config({ dodge, [qingfu]: 50 }, {}, { dex }),
            { expected: refusal ? 'refused' : 'observed', refusal });
    for (const s of skills) {
        const practice = (variant, level, properties = {}, times = 1, completed = 1, refusal = '') =>
            add(`practice-${s}-${variant}`, s, 'practice', config({ dodge: level + 1, [s]: level }, { dodge: s }, properties),
                { repetitions: times, completed, action: 'practice dodge ' + times,
                    command_return: Number(times === completed), expected: completed ? 'observed' : 'refused', refusal });
        for (const l of [200, 400, 800]) practice(String(l), l);
        if (s === qingfu) {
            practice('qi59', 200, { qi: 59, neili: 60 }, 1, 0, qiRefusal(s));
            practice('neili59', 200, { qi: 60, neili: 59 }, 1, 0, neiliRefusal);
            practice('minimum', 200, { qi: 60, neili: 60 });
            practice('partial-qi', 200, { qi: 110, neili: 200 }, 3, 2, qiRefusal(s));
            practice('partial-neili', 200, { qi: 200, neili: 115 }, 3, 2, neiliRefusal);
        } else {
            practice('qi49', 200, { qi: 49 }, 1, 0, qiRefusal(s));
            practice('minimum', 200, { qi: 50 });
            practice('partial-qi', 200, { qi: 90 }, 3, 2, qiRefusal(s));
        }
        add('practice-' + s + '-basic-equal', s, 'practice', config({ dodge: 200, [s]: 200 }, { dodge: s }),
            { repetitions: 1, completed: 0, action: 'practice dodge 1', command_return: 0,
                expected: 'refused', refusal: '你的基本轻功火候不够，难以继续提升你' + names[s] + '的水平。\n', early_practice: true });
    }
    for (const l of [49, 50, 99, 100, 149, 150, 199, 200, 249, 250, 299, 300, 349, 350, 400, 800])
        iface('extra-qingfu-' + l, qingfu, 'query_effect_dodge', config(), { target: config({ dodge: l, [qingfu]: l }, { dodge: qingfu }) });
    for (const s of [skills[0], skills[2]]) for (const ability of ['query_effect_dodge', 'valid_damage'])
        iface('missing-' + s + '-' + ability, s, ability, config(),
            { target: config({ dodge: 400, [s]: 400 }, { dodge: s }), ...(ability === 'valid_damage' ? { interface: {
                object: '/kungfu/skill/' + s, function: ability, damage: 1000 } } : {}) });
    for (const s of skills) iface('msg-' + s, s, 'query_dodge_msg', config({ [s]: 200 }), { randomized: true });
    const damage = (v, level, basic, attackerDodge, count = 0, extra = {}) => iface('damage-qingfu-' + v,
        qingfu, 'valid_damage', config({ dodge: attackerDodge, ...(count ? { count } : {}), ...extra.skills }), {
            target: config({ dodge: basic, [qingfu]: level }, { dodge: qingfu }),
            interface: { object: '/kungfu/skill/' + qingfu, function: 'valid_damage', damage: 1000 },
            randomized: true, ...extra.parameters });
    damage('guard99', 99, 100, 300, 0, { parameters: { randomized: false } });
    damage('unconscious100', 100, 100, 300, 0, { parameters: { randomized: false, target_state: 'unconscious' } });
    damage('base100', 100, 100, 300);
    for (const l of [200, 400, 800]) damage('growth' + l, l, l, l * 3);
    damage('inner-always100', 100, 100, 100);
    damage('count99fail', 100, 100, 800, 99, { parameters: { randomized: false } });
    damage('count100fail', 100, 100, 800, 100);
    damage('math100control', 100, 100, 800, 0, { skills: { mathematics: 100 }, parameters: { randomized: false } });
    for (const s of skills) {
        for (const l of [200, 400, 800]) add(`ordinary-${s}-${l}`, s, 'ordinary', config(),
            { target: config({ dodge: l, [s]: l }, { dodge: s }), fighting: true, randomized: true });
        add(`ordinary-${s}-unmapped400`, s, 'ordinary', config(),
            { target: config({ dodge: 400, [s]: 400 }), fighting: true, randomized: true });
        iface('direct-' + s, s, 'do_damage', config(), { target: config({ dodge: 400, [s]: 400 }, { dodge: s }),
            interface: { object: '/adm/daemons/combatd', function: 'do_damage', damage: 1000, attack_type: 0 }, randomized: true });
    }
    add('ordinary-qingfu-busy2', qingfu, 'ordinary', config(), { target: config({ dodge: 400, [qingfu]: 400 },
        { dodge: qingfu }, {}, { busy: 2 }), fighting: true, randomized: true });
    return out;
}
export function mingjiaoMovementConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const evidence = Object.fromEntries(mingjiaoMovementSourcePaths.map(p => [p, sha(readSource(p))]));
    assert.equal(evidenceHash(evidence), mingjiaoMovementReviewedSourceHash, '来源变动必须先复审');
    for (const s of skills) { const source = catalog.skills.find(x => x.id === s);
        assert.equal(source?.path, 'kungfu/skill/' + s + '.c'); assert.equal(source.sha256, evidence[source.path]); }
    return plans().map(c => ({ ...c, entry_id: 'kungfu/skill/' + c.parameters.skill + '.c',
        samples: smoke || !c.parameters.randomized ? 2 : samples,
        parameters: { ...c.parameters, source_evidence: evidence, absent_sources: mingjiaoMovementAbsentPaths } }));
}
const map = x => { assert.ok(x && typeof x === 'object' && !Array.isArray(x)); return x; };
const integer = x => { assert.ok(Number.isSafeInteger(x)); return x; };
const num = x => x === null ? 0 : integer(x);
const field = (o, k) => { assert.ok(Object.hasOwn(map(o), k), 'missing ' + k); return o[k]; };
const metric = (m, k) => { map(m); const n = Object.hasOwn(m, k) ? integer(m[k]) : 0; assert.ok(n >= 0); return n; };
function parameters(c) {
    const plan = plans().find(x => x.id === c.id); assert.ok(plan); assert.equal(c.method, plan.method);
    assert.equal(c.stage, 'school'); assert.equal(c.entry_id, 'kungfu/skill/' + plan.parameters.skill + '.c');
    const { source_evidence: evidence, absent_sources, ...rest } = map(c.parameters);
    assert.deepEqual(rest, plan.parameters); assert.deepEqual(Object.keys(map(evidence)), mingjiaoMovementSourcePaths);
    assert.equal(evidenceHash(evidence), mingjiaoMovementReviewedSourceHash); assert.deepEqual(absent_sources, []);
    assert.ok(Number.isSafeInteger(c.samples) && c.samples > 0); return c.parameters;
}
function initial(s, cfg, side, p) {
    assert.match(field(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(s.id, side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive']) assert.equal(field(s, k), 1);
    for (const k of ['wizardp', 'ghost']) assert.equal(num(field(s, k)), 0);
    assert.equal(s.living, side && p.target_state === 'unconscious' ? 0 : 1);
    assert.equal(num(field(s, 'busy')), cfg.busy ?? 0); assert.equal(s.fighting_opponent, Number(p.fighting));
    assert.deepEqual(s.skills, cfg.skills); assert.deepEqual(s.mappings, cfg.mappings); assert.deepEqual(s.preparations, {});
    assert.deepEqual(s.learned, {}); assert.equal(num(field(s, 'conditions')), 0);
    for (const [k, v] of Object.entries(cfg.properties)) assert.equal(k.includes('/') || k === 'character' ? s.cultivation[k] : s[k],
        side && p.target_state === 'unconscious' && ['qi', 'jing'].includes(k) ? 0 : v, k);
    for (const k of ['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
        'special_skill/guimai', 'special_skill/wuxing', 'class', 'wudang-jiuyang', 'immune/poison', 'env/no_learn'])
        assert.equal(num(field(s.cultivation, k)), 0);
    assert.equal(s.effective_int, s.int); assert.equal(s.effective_str, s.str + Math.trunc(s.skills.unarmed / 10));
    assert.deepEqual(s.temp.apply, { armor: 100 }); assert.equal(s.craze, 0); assert.equal(s.max_craze, 5000);
    for (const k of ['guarding', 'str', 'dex', 'powerup', 'fight']) assert.equal(s.temp[k] ?? 0, 0);
    for (const k of ['weapon', 'handing', 'secondary_weapon']) { assert.equal(s[k], 'none'); assert.deepEqual(s[k + '_details'], {}); }
    for (const k of ['weapon_damage', 'weapon_flag', 'ammunition']) assert.equal(s[k], 0);
    assert.deepEqual(s.effective_skills, Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
        [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)])));
}
function stable(b, a) {
    const removed = new Set([...resources, 'learned', 'busy', 'temp', 'craze']);
    const keep = s => Object.fromEntries(Object.entries(s).filter(([k]) => !removed.has(k)));
    assert.deepEqual(keep(a), keep(b), '静态身份/技能/映射漂移');
    assert.deepEqual(a.temp.apply, b.temp.apply);
}
function damageResult(result, incoming, b, t, bh = 0) {
    const level = t.skills[qingfu] ?? 0, eligible = level >= 100 && !!t.living;
    const ap = b.effective_skills.dodge + (b.skills.count ?? 0), dp = Math.trunc(t.skills.dodge / 2) + level;
    const successPossible = eligible && Math.trunc(ap / 2) < dp;
    if (result && typeof result === 'object') {
        assert.ok(successPossible); assert.deepEqual(Object.keys(result).sort(), ['damage', 'msg']);
        assert.equal(result.damage, -incoming); assert.equal(typeof result.msg, 'string');
        assert.ok(green.includes(plain(result.msg))); assert.equal(num(bh), 0); return true;
    }
    assert.equal(num(result), 0);
    if (bh) { assert.ok(eligible && (b.skills.count ?? 0) >= 100);
        assert.ok(Math.trunc(ap / 2) + Math.max(0, ap - 1) >= dp); assert.equal(plain(bh), failedBH); }
    return false;
}
const compress = d => d > 400 ? Math.trunc((d - 400) / 4) + 300 : d > 200 ? Math.trunc((d - 200) / 2) + 200 : Math.max(0, d);
function outcome(d, w, t) {
    const eff = Math.max(-1, t.eff_qi - w), qi = w ? Math.min(Math.max(-1, t.qi - d), eff) : Math.max(-1, t.qi - d);
    return { qi, eff_qi: eff, qi_cost: t.qi - qi, eff_qi_cost: t.eff_qi - eff,
        craze: Math.min(t.max_craze, t.craze + (d > 150 ? Math.trunc(d / 5) : 0) + (w > 150 ? Math.trunc(w / 3) : 0)) };
}
function support(input, b, t, direct) {
    const str = b.str * 2 + b.effective_str, k = str < 40 ? str : str < 70 ? Math.trunc((str - 30) / 2) + 20 : Math.trunc((str - 60) / 4) + 30;
    const base = input + Math.trunc(input * (direct ? k / 50 : str / 300)), out = [];
    for (const pre of new Set([base, base + Math.trunc(base * 7 / b.int)])) {
        const d = direct ? pre > 1500 ? Math.trunc((pre - 1500) / 4) + 1000 : pre > 500 ? Math.trunc((pre - 500) / 2) + 500 : pre : compress(pre);
        if (!direct) out.push({ damage: d, ...outcome(d, 0, t) });
        for (let r = 0; r < 100; r++) {
            let w = direct ? Math.trunc((d - r) * 50 / 100) : compress(pre - r);
            w -= Math.trunc(w * 20 / 100); w -= Math.trunc(w * (t.con - 10) / 100);
            out.push({ damage: d, ...outcome(d, Math.max(0, w), t) });
        }
    }
    if (!direct) out.push({ damage: 0, ...outcome(0, 0, t) }); return out;
}
export function validateMingjiaoMovementRecord(raw, c) {
    const p = parameters(c), ordinary = c.method === 'ordinary', direct = p.ability === 'do_damage', practice = c.method === 'practice';
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, c.id); assert.equal(raw.method, c.method);
    assert.ok(Number.isSafeInteger(raw.index) && raw.index >= 0 && raw.index < c.samples);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(raw.outcome)) {
        assert.ok(typeof raw.reason === 'string' && raw.reason.trim());
        return null;
    }
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2, k);
    for (const k of ['actions', 'directs', 'attacks', 'passives', 'defenses', 'defense_messages', 'dodge_checks',
        'interfaces', 'launches', 'refusals', 'callbacks', 'dropped', 'terminals']) assert.ok(Array.isArray(field(raw, k)), k);
    for (const k of ['passives', 'launches', 'refusals', 'callbacks', 'dropped']) assert.deepEqual(raw[k], []);
    const unconsciousPreparation = p.variant === 'damage-qingfu-unconscious100';
    assert.deepEqual(raw.terminals, unconsciousPreparation ? [{ side: 1, state: 'unconscious' }] : []);
    if (unconsciousPreparation) {
        const preparation = map(field(raw, 'preparation'));
        assert.deepEqual(Object.keys(preparation).sort(), ['after', 'before']);
        initial(preparation.before, p.target, 1, { ...p, target_state: undefined });
        const expected = structuredClone(preparation.before);
        expected.living = 0; expected.qi = 0; expected.jing = 0;
        expected.temp.block_msg = { all: 1 };
        assert.deepEqual(preparation.after, expected, '原预置昏迷只改变活性、当前气血/精神与屏蔽消息');
        assert.deepEqual(raw.before[1], preparation.after, '施用窗口从原昏迷准备终态开始');
    } else assert.equal(Object.hasOwn(raw, 'preparation'), false, '不能将其它终态伪装为预置昏迷');
    for (const e of raw.defense_messages) { assert.ok([0, 1].includes(e.side)); assert.equal(typeof e.type, 'string'); assert.equal(typeof e.text, 'string'); }
    assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(Object.keys(map(raw.bhinfo)).sort(), ['after', 'before', 'cleared']);
    assert.equal(num(raw.bhinfo.before), 0); assert.equal(num(raw.bhinfo.cleared), 0);
    for (const k of ['no_fight', 'practice_improve', 'research_improve']) assert.equal(num(field(raw.movement_room, k)), 0);
    for (const side of [0, 1]) {
        initial(raw.before[side], side ? p.target : p.actor, side, p); stable(raw.before[side], raw.immediate[side]);
        for (const v of Object.values(map(raw.metrics[side]))) assert.ok(integer(v) >= 0);
        for (const k of ['heartbeats', 'quick', 'riposte', 'ability_launched']) assert.equal(metric(raw.metrics[side], k), 0);
        for (const k of resources) { assert.equal(metric(raw.metrics[side], k + '_recovery'), 0);
            assert.equal(raw.immediate[side][k], raw.before[side][k] - metric(raw.metrics[side], k + '_cost')); }
    }
    const [b, t] = raw.before, [a, end] = raw.immediate;
    assert.equal(num(a.busy), num(b.busy));
    assert.ok(num(end.busy) >= 0);
    for (const side of [0, 1]) {
        const beforeTemp = structuredClone(raw.before[side].temp), afterTemp = structuredClone(raw.immediate[side].temp);
        delete beforeTemp.notify_fail; delete afterTemp.notify_fail;
        if (!side && practice && !p.early_practice) {
            assert.ok(Number.isSafeInteger(afterTemp.time?.practice) && afterTemp.time.practice > 0);
            delete afterTemp.time.practice; if (!Object.keys(afterTemp.time).length) delete afterTemp.time;
        }
        if (!side && ordinary) {
            assert.deepEqual(Object.keys(map(afterTemp.fight)).sort(), ['attack', 'dodge', 'parry']);
            for (const v of Object.values(afterTemp.fight)) assert.equal(num(v), 0); delete afterTemp.fight;
        }
        assert.deepEqual(afterTemp, beforeTemp, '只允许原练习time/默认攻击fight/notify变化');
    }
    for (const k of ['jing', 'eff_jing']) for (const side of [0, 1]) assert.equal(metric(raw.metrics[side], k + '_cost'), 0);
    assert.equal(metric(raw.metrics[1], 'neili_cost'), 0); assert.deepEqual(end.learned, {});
    assert.equal(a.craze, b.craze); let canceled = false, interfaceValue = null, gain = 0, baseDP = null, settledDP = null;
    if (practice) {
        assert.deepEqual(raw.interfaces, []); assert.equal(raw.command_accepted, p.command_return);
        const count = p.completed, qiFee = p.skill === qingfu ? 50 : 40, neiliFee = p.skill === qingfu ? 55 : 0;
        assert.equal(metric(raw.metrics[0], 'qi_cost'), count * qiFee); assert.equal(metric(raw.metrics[0], 'neili_cost'), count * neiliFee);
        gain = count * gumuMovementGain(p); assert.deepEqual(a.learned, gain ? { [p.skill]: gain } : {});
        if (p.refusal) assert.equal(a.temp.notify_fail, p.refusal);
        if (p.expected === 'refused') assert.equal(plain(raw.reason), p.refusal); else assert.equal(raw.reason, '');
    } else { assert.deepEqual(a.learned, {}); for (const k of resources) assert.equal(metric(raw.metrics[0], k + '_cost'), 0); }
    if (!ordinary) {
        assert.deepEqual(raw.actions, []); assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.dodge_checks, []);
        if (!practice) {
            assert.equal(raw.interfaces.length, 1); const event = raw.interfaces[0];
            for (const k of ['object', 'function', ...(p.interface.argument ? ['argument'] : [])]) assert.equal(event[k], p.interface[k]);
            interfaceValue = field(event, 'result'); const missing = p.variant.startsWith('missing-');
            assert.equal(field(event, 'implemented_by'), missing ? 0 : direct ? '/adm/daemons/combatd' : '/kungfu/skill/' + p.skill);
            if (missing) assert.equal(num(interfaceValue), 0);
            else if (p.ability === 'valid_enable') assert.equal(num(interfaceValue), Number(['dodge', 'move'].includes(p.interface.argument)));
            else if (p.ability === 'valid_learn') { assert.equal(num(interfaceValue), Number(p.expected === 'observed'));
                if (p.expected === 'refused') { assert.equal(a.temp.notify_fail, p.refusal); assert.equal(plain(raw.reason), p.refusal); } }
            else if (p.ability === 'query_effect_dodge') assert.equal(num(interfaceValue), extraDP(t.skills[qingfu]));
            else if (p.ability === 'query_dodge_msg') assert.ok(messages[p.skill].includes(interfaceValue));
            else if (p.ability === 'valid_damage') canceled = damageResult(interfaceValue, 1000, b, t, raw.bhinfo.after);
            else { assert.equal(typeof interfaceValue, 'string'); assert.ok(interfaceValue.length > 0); }
        }
    } else {
        assert.deepEqual(raw.interfaces, []); assert.deepEqual(raw.directs, []); assert.equal(raw.actions.length, 1);
        const action = raw.actions[0]; assert.equal(action.actor, 0); assert.equal(action.target, 1); assert.equal(num(action.skill), 0);
        assert.deepEqual(Object.keys(action.action).sort(), ['action', 'damage_type']);
        assert.ok(['瘀伤', '抓伤'].includes(action.action.damage_type)); assert.equal(typeof action.action.action, 'string');
        assert.equal(raw.attacks.length, 1); const attack = raw.attacks[0];
        assert.equal(attack.actor, 0); assert.equal(attack.target, 1); assert.equal(attack.type, 0); assert.ok([0, -1, -2].includes(attack.result));
        assert.ok(integer(attack.damage) >= 0); assert.equal(raw.dodge_checks.length, 2);
        const [base, settled] = raw.dodge_checks; const amount = p.target.mappings.dodge === qingfu ? extraDP(t.skills[qingfu]) : 0;
        const originalDP = gumuBuffPower(t, 'dodge'); baseDP = originalDP;
        // The base probe is before the special extra; settled is after extra/clamp/busy.
        const adjustedDP = originalDP + Math.trunc(originalDP / 100) * amount;
        settledDP = p.target.busy ? Math.trunc(Math.max(1, adjustedDP) / 3) : Math.max(1, adjustedDP);
        for (const [event, phase, dp] of [[base, 'base', baseDP], [settled, 'settled', settledDP]]) {
            assert.equal(event.actor, 0); assert.equal(event.target, 1); assert.equal(event.type, 0); assert.equal(event.phase, phase);
            assert.equal(event.ap, gumuBuffPower(b, 'attack')); assert.equal(event.dp, dp); assert.equal(num(event.busy), p.target.busy ?? 0);
            assert.equal(field(event, 'skill'), p.target.mappings.dodge ?? 0);
        }
        assert.equal(raw.defenses.length, Number(attack.result === 0 && !!p.target.mappings.dodge));
        if (raw.defenses.length) { const e = raw.defenses[0]; assert.equal(e.actor, 0); assert.equal(e.target, 1);
            assert.equal(e.skill, p.skill); assert.equal(e.route, 'ordinary-dodge'); assert.ok(integer(e.incoming) >= 32 && e.incoming <= 63);
            canceled = p.skill === qingfu ? damageResult(field(e, 'result'), e.incoming, b, t) : (assert.equal(num(field(e, 'result')), 0), false);
        }
        if (attack.result !== 0 || canceled) assert.equal(attack.damage, 0);
        const inputs = raw.defenses.length ? [raw.defenses[0].incoming] : Array.from({ length: 32 }, (_, i) => 32 + i);
        const options = attack.result !== 0 || canceled ? [{ damage: 0, ...outcome(0, 0, t) }]
            : inputs.flatMap(input => support(input, b, t, false));
        assert.ok(options.some(o => o.damage === attack.damage && o.qi === end.qi && o.eff_qi === end.eff_qi
            && o.craze === end.craze && o.qi_cost === metric(raw.metrics[1], 'qi_cost') && o.eff_qi_cost === metric(raw.metrics[1], 'eff_qi_cost')));
        for (const [k, result] of [['hit', 0], ['dodge', -1], ['parry', -2]]) assert.equal(metric(raw.metrics[0], k), Number(attack.result === result));
    }
    if (direct) {
        assert.equal(raw.directs.length, 1); const event = raw.directs[0];
        assert.equal(event.actor, 0); assert.equal(event.target, 1); assert.equal(event.type, 0);
        assert.equal(event.damage, 1000); assert.equal(event.percent, 50); assert.equal(event.weapon, 'none');
        assert.equal(event.weapon_object, '');
        assert.ok(support(1000, b, t, true).some(o => o.qi === end.qi && o.eff_qi === end.eff_qi && o.craze === end.craze
            && o.qi_cost === metric(raw.metrics[1], 'qi_cost') && o.eff_qi_cost === metric(raw.metrics[1], 'eff_qi_cost')));
        assert.deepEqual(raw.defenses, []); assert.equal(metric(raw.metrics[0], 'direct'), 1);
    } else { assert.deepEqual(raw.directs, []); assert.equal(metric(raw.metrics[0], 'direct'), 0); }
    if (!ordinary) for (const k of ['hit', 'dodge', 'parry']) assert.equal(metric(raw.metrics[0], k), 0);
    // Original integer busy2 has interrupt=0. A positive landed ordinary hit calls
    // interrupt_me(actor, ...); who != defender returns after clearing busy.
    assert.equal(num(end.busy), ordinary && raw.attacks[0].damage > 0 && num(t.busy) > 0 ? 0 : num(t.busy));
    if (!ordinary && !direct) { assert.deepEqual(raw.immediate[1], t); assert.equal(metric(raw.metrics[0], 'hit'), 0);
        assert.equal(metric(raw.metrics[0], 'dodge'), 0); assert.equal(metric(raw.metrics[0], 'parry'), 0);
        assert.equal(metric(raw.metrics[0], 'eff_qi_cost'), 0);
        if (p.ability === 'valid_damage') assert.deepEqual(raw.defenses, [{ actor: 0, target: 1,
            skill: p.skill, incoming: 1000, result: interfaceValue, route: 'interface' }]); else assert.deepEqual(raw.defenses, []);
    }
    if (p.ability !== 'valid_damage' || p.skill !== qingfu) assert.equal(num(raw.bhinfo.after), 0);
    for (const k of ['hit', 'dodge', 'parry', 'direct']) assert.equal(metric(raw.metrics[1], k), 0);
    const costs = Object.fromEntries(resources.map(k => [k, metric(raw.metrics[0], k + '_cost')]));
    return { method: c.method, ability: p.ability, interface_result: c.method === 'interface'
        && (typeof interfaceValue === 'number' || interfaceValue === null) ? num(interfaceValue) : null,
        interface_text: typeof interfaceValue === 'string' ? interfaceValue : null, implemented_by: raw.interfaces[0]?.implemented_by ?? null,
        command_attempts: Number(practice), commands_accepted: practice ? raw.command_accepted : 0,
        completed_repetitions: practice ? p.completed : 0, learned_gain: gain, costs,
        recovery: Object.fromEntries(resources.map(k => [k, 0])), net: Object.fromEntries(resources.map(k => [k, a[k] - b[k]])),
        target_costs: Object.fromEntries(resources.map(k => [k, metric(raw.metrics[1], k + '_cost')])),
        primary_attacks: raw.attacks.length, dodge: ordinary && raw.attacks[0].result === -1,
        parry: ordinary && raw.attacks[0].result === -2, cancel: canceled, bhinfo_side_effect: !!raw.bhinfo.after,
        base_dp: baseDP, settled_dp: settledDP, extra_dp_percent: ordinary && p.target.mappings.dodge === qingfu ? extraDP(t.skills[qingfu]) : null,
        defense_calls: raw.defenses.length, cancellation_calls: Number(canceled) };
}
export function mingjiaoMovementEffects(rows, c) {
    parameters(c); const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) { assert.equal(row.condition_id, c.id); assert.equal(row.raw?.condition_id, c.id);
        assert.equal(row.raw.method, c.method); assert.equal(row.raw.outcome, row.outcome); assert.ok(Object.hasOwn(counts, row.outcome));
        const observation = validateMingjiaoMovementRecord(row.raw, c);
        counts[row.outcome]++; if (!['error', 'not_applicable'].includes(row.outcome)) known.push(observation); }
    const unknown = counts.error + counts.not_applicable, values = f => distribution([...known.map(f), ...Array(unknown).fill(null)]);
    const sum = k => known.reduce((n, o) => n + o[k], 0), ord = known.filter(o => o.method === 'ordinary');
    const vd = known.filter(o => o.ability === 'valid_damage'), chance = (a, k) => probability(a.filter(o => o[k]).length, a.length);
    return { samples: rows.length, counts, validated_samples: known.length, unknown_samples: unknown,
        interface_result: values(o => o.interface_result), interface_texts: Object.fromEntries([...new Set(known.map(o => o.interface_text).filter(Boolean))].map(s => [s, known.filter(o => o.interface_text === s).length])),
        // Preserve raw function_exists=0 in the trace; classify its known absence only in display.
        implemented_by: Object.fromEntries([...new Set(known.filter(o => o.method === 'interface').map(o => o.implemented_by === 0 ? 'missing' : o.implemented_by))]
            .map(s => [s, known.filter(o => o.method === 'interface' && (o.implemented_by === 0 ? 'missing' : o.implemented_by) === s).length])),
        command_attempts: sum('command_attempts'), commands_accepted: sum('commands_accepted'),
        completed_repetitions: values(o => o.completed_repetitions), learned_gain: values(o => o.learned_gain),
        costs: Object.fromEntries(resources.map(k => [k, values(o => o.costs[k])])), recovery: Object.fromEntries(resources.map(k => [k, values(o => o.recovery[k])])),
        net: Object.fromEntries(resources.map(k => [k, values(o => o.net[k])])), target_costs: Object.fromEntries(resources.map(k => [k, values(o => o.target_costs[k])])),
        primary_attacks: sum('primary_attacks'), dodge: chance(ord, 'dodge'), parry: chance(ord, 'parry'), cancel: chance(ord, 'cancel'),
        interface_cancel: chance(vd, 'cancel'), bhinfo_side_effect: chance(vd, 'bhinfo_side_effect'),
        base_dp: values(o => o.base_dp), settled_dp: values(o => o.settled_dp), extra_dp_percent: values(o => o.extra_dp_percent),
        defense_calls: sum('defense_calls'), cancellation_calls: sum('cancellation_calls'),
        unknown_scopes: ['有限配功不是自然师承或完整门派；凌虚步仅NPC自用关联', '接口零返回不能区分隐藏coin/内层失败；仅统计可观察副效应',
            '普通防御率与公共直伤路径分开，不作DPS排名；未采研究/移动实战/门派互搏/复杂装备', '文案按冻结原文保留，包括青蝠合并消息及已有错字'] };
}
