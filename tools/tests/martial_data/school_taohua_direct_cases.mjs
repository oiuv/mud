// Finite, unregistered preparation. No driver, mutation of game code, or fabricated samples.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

export const taohuaDirectMoves = [
    { skill: 'canglang-zhi', usage: 'finger', ability: 'tao', name: '碧浪滔天', minimum: 80,
        force: 100, neili: 100, percent: 30, hitFee: 80, missFee: 50 },
    { skill: 'pikong-zhang', usage: 'strike', ability: 'dai', name: '披星戴月', minimum: 80,
        force: 120, neili: 100, percent: 20, hitFee: 50, missFee: 30 },
    { skill: 'luoying-shenzhang', usage: 'strike', ability: 'zhuan', name: '奇门五转', minimum: 120,
        force: 180, neili: 300, percent: 30, hitFee: 150, missFee: 150 },
    { skill: 'yuxiao-jian', usage: 'sword', ability: 'tian', name: '天外清音', minimum: 120,
        force: 0, neili: 1000, percent: 66, hitFee: 120, missFee: 50 },
];
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const pool = { qi: 100000, eff_qi: 100000, max_qi: 100000, jing: 100000,
    eff_jing: 100000, max_jing: 100000, neili: 1200, max_neili: 1200, jiali: 0,
    combat_exp: 100000001, str: 36, int: 36, con: 36, dex: 34, shen: 0,
    gender: '男性', character: '光明磊落' };
const sha256 = value => createHash('sha256').update(value).digest('hex');

export const taohuaDirectSourcePaths = [...new Set([
    ...taohuaDirectMoves.flatMap(d => [`kungfu/skill/${d.skill}.c`, `kungfu/skill/${d.skill}/${d.ability}.c`,
        `kungfu/skill/${d.usage}.c`]),
    'kungfu/skill/force.c', 'kungfu/skill/qimen-wuxing.c', 'kungfu/skill/bibo-shengong.c',
    'kungfu/class/taohua/huang.c', 'kungfu/class/taohua/feng.c', 'kungfu/class/taohua/rong.c',
    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'feature/sserver.c', 'feature/skill.c',
    'feature/attack.c', 'feature/damage.c', 'feature/attribute.c', 'feature/equip.c',
    'feature/action.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c', 'mudcore/inherit/action.c',
    'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/misc/equip.c',
    'adm/daemons/combatd.c', 'adm/daemons/itemd.c', 'adm/single/simul_efun/message.c', 'include/combat.h',
])];

export const taohuaDirectFixtureRequirements = [
    'Remain unregistered until the active Gumu run completes. Freeze this module, test, sources and existing dependency closure in a new series.',
    'Reuse two connected nonwizard USERs, original set_name aliases, command perform usage.ability right and one actual enemy. Tian itself selects its only opponent; do not rewrite it to accept a target argument.',
    'Reuse original ability grants as explicit experimental qualification. Snapshot each actual grant, character, exact preparations, secondary weapon, weapon details and fighting_opponent; do not simulate teaching.',
    'Reuse current single-action execution, launch/refusal, direct argument and resource observers. Add only this group to the existing observe_direct allowlist. Keep normal combat heartbeats suppressed, original start_busy/interrupt and RNG unchanged. No natural recovery or full bout is claimed.',
    'No new combat formula or execution framework: report real do_damage input and real qi/wound separately. Only declared finite input ranges, branch predicates, costs and resource closure are verified here.',
    'No mapped force/parry/dodge on either side and no count/hubo/shenzhaojing or extra item proc. Tian uses the existing ordinary test sword and its original durability path: a hit may reduce consistence 100 to 99. Do not suppress or mislabel this as yuxiao-jian::hit_ob.',
];

export function taohuaDirectConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(taohuaDirectSourcePaths.map(path => [path, sha256(readSource(path))]));
    const conditions = [];
    function add(d, level, variant, extra = {}) {
        const source = catalog.skills.find(s => s.id === `${d.skill}/${d.ability}`);
        const base = catalog.skills.find(s => s.id === d.skill);
        for (const [s, path] of [[source, `kungfu/skill/${d.skill}/${d.ability}.c`], [base, `kungfu/skill/${d.skill}.c`]]) {
            assert.equal(s?.path, path); assert.equal(s.sha256, evidence[path], '来源字节不一致');
        }
        const entry = source.entries.find(e => e.role === 'perform')?.id;
        assert.match(entry ?? '', /\.c:\d+:perform$/);
        const grant = `can_perform/${d.skill}/${d.ability}`;
        const armed = d.usage === 'sword';
        const actor = { skills: { [d.usage]: level, [d.skill]: level, force: 400,
            ...(d.ability === 'zhuan' ? { 'qimen-wuxing': 200 } : {}),
            ...(d.ability === 'tian' ? { 'bibo-shengong': 200 } : {}), ...extra.skills },
        mappings: { [d.usage]: d.skill }, preparations: armed ? {} : { [d.usage]: d.skill },
        properties: { ...pool, 'family/family_name': '桃花岛', [grant]: 1, ...extra.properties },
        ...(armed && !extra.noWeapon || extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}) };
        const target = { skills: { force: 600, dodge: 600, parry: 600, ...extra.targetSkills },
            mappings: {}, preparations: {}, properties: { ...pool } };
        if (extra.noPrepare) actor.preparations = {};
        conditions.push({ id: `school-taohua-direct-${d.skill}-${d.ability}-l${level}-${variant}`,
            stage: 'school', method: 'perform', entry_id: entry, samples: smoke ? 1 : extra.checks ?? samples,
            parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-direct',
                skill: d.skill, usage: d.usage, ability: d.ability, level, variant, actor, target,
                named_participants: true, fighting: true, target_state: 'living',
                action: `perform ${d.usage}.${d.ability} right`, observation: 'single_action_immediate',
                observe_seconds: 0, expected: extra.refusal ? 'refused' : 'observed',
                refusal: extra.refusal ?? '', not_applicable: '', source_evidence: { ...evidence },
                ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                base_source: { path: base.path, sha256: base.sha256 },
                qualification_note: '原命令与原随机；技能、领悟和资格为实验输入，不证明自然取得。无映射内功被动，加力0；同一中性靶。命中判定、直伤入参、真实气血/创伤、费用与忙乱分账，不据单招伤害推断实战胜率。',
            } });
    }
    for (const d of taohuaDirectMoves) {
        for (const level of [200, 400, 800]) add(d, level, 'baseline');
        add(d, 200, 'low-defense', { targetSkills: { force: 2, dodge: 2, parry: 2 } });
        add(d, 200, 'high-defense', { targetSkills: { force: 100000, dodge: 100000, parry: 100000 }, checks: 2 });
        add(d, d.minimum, 'minimum', { skills: { force: d.force ? d.force * 2 : 400,
            ...(d.ability === 'zhuan' ? { 'qimen-wuxing': 120 } : {}),
            ...(d.ability === 'tian' ? { 'bibo-shengong': 120 } : {}) },
        properties: { neili: d.neili }, checks: 2 });
        const reject = (variant, refusal, extra = {}) => add(d, 200, variant, { ...extra, refusal, checks: 2 });
        const skillReason = { tao: '你沧浪指法不够娴熟，难以施展「碧浪滔天」。\n',
            dai: '你劈空掌不够娴熟，难以施展「披星戴月」。\n',
            zhuan: '你的落英神剑掌不够娴熟，难以施展「奇门五转」。\n',
            tian: '你玉箫剑法等级不够，难以施展「天外清音」。\n' };
        reject('low-skill', skillReason[d.ability], { skills: { [d.skill]: d.minimum - 1 } });
        const neiliReason = { tao: '你现在的真气不够，难以施展「碧浪滔天」。\n',
            dai: '你现在的真气不够，难以施展「披星戴月」。\n',
            zhuan: '你现在的内力不够，难以施展「奇门五转」。\n',
            tian: '你现在的真气不足，难以施展「天外清音」。\n' };
        reject('low-neili', neiliReason[d.ability], { properties: { neili: d.neili - 1 } });
        if (d.force) reject('low-force', `你的内功${d.ability === 'zhuan' ? '火候不足' : '修为不够'}，难以施展「${d.name}」。\n`,
            { skills: { force: d.force * 2 - 1 } });
        if (d.ability === 'tao') reject('no-grant', '你所使用的外功中没有这种功能。\n',
            { properties: { [`can_perform/${d.skill}/${d.ability}`]: 0 } });
        if (d.ability === 'dai') reject('sword', '「披星戴月」只能空手施展。\n', { weapon: true });
        if (d.ability === 'zhuan') {
            reject('qimen119', '你对奇门五行的研究不够，难以施展「奇门五转」。\n', { skills: { 'qimen-wuxing': 119 } });
            reject('no-prepare', '你没有准备落英神剑掌，难以施展「奇门五转」。\n', { noPrepare: true });
        }
        if (d.ability === 'tian') {
            reject('bibo119', '你碧波神功修为不够，难以施展「天外清音」。\n', { skills: { 'bibo-shengong': 119 } });
            reject('no-weapon', '你所使用的武器不对，难以施展「天外清音」。\n', { noWeapon: true });
        }
    }
    return conditions;
}

function integer(n, label) { assert.ok(Number.isSafeInteger(n), label); return n; }
function map(value, label) { assert.ok(value && typeof value === 'object' && !Array.isArray(value), label); return value; }
function count(metrics, key) {
    map(metrics, '缺少原计数'); const value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, key); return value;
}
function busy(state) {
    assert.ok(Object.hasOwn(state, 'busy'), '缺少忙乱');
    const value = state.busy === null ? 0 : state.busy; assert.ok(integer(value, '忙乱') >= 0); return value;
}
function movement(p) {
    const d = taohuaDirectMoves.find(d => d.skill === p.skill && d.ability === p.ability && d.usage === p.usage);
    assert.ok(d, '未经核对的直伤武学'); return d;
}

// Exact local ability input range, not a substitute for COMBAT_D or its random generator.
export function taohuaDirectBounds(actor, target, move) {
    const effective = (state, skill) => integer(state.effective_skills?.[skill], '有效 ' + skill);
    let ap, dp, offset = 0, input;
    if (move.ability === 'tao' || move.ability === 'dai') {
        ap = effective(actor, move.usage);
        dp = Math.trunc(effective(target, move.ability === 'tao' ? 'parry' : 'dodge') / 2);
        const part = Math.trunc(ap / (move.ability === 'tao' ? 3 : 2));
        input = [part + (move.ability === 'tao' ? 40 : 0), part];
    } else if (move.ability === 'zhuan') {
        ap = integer(actor.skills[move.skill], move.skill) + integer(actor.skills['qimen-wuxing'], '奇门')
            + effective(actor, 'force') + integer(actor.int, '悟性') * 10;
        dp = effective(target, 'dodge') + effective(target, 'parry') + (target.skills['qimen-wuxing'] ?? 0)
            + integer(target.int, '目标悟性') * 10;
        offset = Math.trunc(ap / 2);
        const part = Math.trunc((effective(actor, 'force') + effective(actor, move.usage)) / 4);
        input = [part, part];
    } else {
        ap = effective(actor, 'sword'); dp = Math.max(1, effective(target, 'force')); offset = Math.trunc(ap / 2);
        const part = Math.trunc((ap + integer(actor.skills['bibo-shengong'], '碧波')) / 2);
        input = [part, part];
    }
    assert.ok(ap > 0 && input[1] > 0);
    const hitCount = Math.max(0, Math.min(ap, offset + ap - 1 - dp));
    return { ap, dp, comparison_min: offset, comparison_max: offset + ap - 1,
        hit_numerator: hitCount, hit_denominator: ap,
        input_min: input[0], input_max: input[0] + input[1] - 1 };
}

export function validateTaohuaDirectRecord(raw, condition) {
    const p = condition.parameters, d = movement(p), accepted = p.expected === 'observed';
    assert.equal(p.collection_group, 'taohua-direct'); assert.equal(condition.method, 'perform');
    assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, 'perform');
    assert.equal(raw.outcome, p.expected);
    assert.ok(Object.hasOwn(raw, 'command_accepted'), '缺少原命令执行成本');
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted >= 0,
        '原命令执行成本必须是非负安全整数');
    assert.equal(raw.command_accepted > 0, accepted, '命令受理按正成本判定，拒绝必须为零');
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'refusals', 'directs', 'attacks', 'dropped', 'terminals']) assert.ok(Array.isArray(raw[key]), key);
    for (const key of ['attacks', 'dropped', 'terminals']) assert.deepEqual(raw[key], [], key);
    for (const key of ['callbacks', 'passives', 'defenses', 'interfaces', 'dodge_checks']) if (Object.hasOwn(raw, key)) assert.deepEqual(raw[key], [], key);
    const [b, t] = raw.before, [a, end] = raw.immediate;
    assert.notEqual(b.object, t.object);
    const bounds = taohuaDirectBounds(b, t, d);
    assert.ok(raw.directs.length <= 1); const hit = accepted ? raw.directs.length === 1 : null;
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side], after = raw.immediate[side];
        assert.match(before.object, /^\/tests\/actor#\d+$/); assert.equal(before.id, side ? 'right' : 'left');
        assert.deepEqual(before.skills, cfg.skills); assert.deepEqual(before.mappings, cfg.mappings);
        assert.deepEqual(before.preparations, cfg.preparations); assert.deepEqual(before.learned, {});
        const apply = map(before.temp?.apply, '原apply');
        const expectedApply = { armor: 100, ...(cfg.equipment ? { damage: 50, dodge: -1 } : {}) };
        for (const key of new Set([...Object.keys(apply), ...Object.keys(expectedApply)]))
            assert.equal(Object.hasOwn(apply, key) ? apply[key] : 0, expectedApply[key] ?? 0, '未知加成 ' + key);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(before.effective_skills?.[key],
            Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0), '有效 ' + key);
        const unarmed = Math.max(...['unarmed', 'finger', 'strike', 'hand', 'claw', 'cuff'].map(k => cfg.skills[k] ?? 0));
        assert.equal(before.effective_str, cfg.properties.str + Math.trunc(unarmed / 10));
        for (const [key, value] of Object.entries(cfg.properties)) {
            const actual = key.includes('/') || key === 'character' ? map(before.cultivation, '资格')[key] : before[key];
            assert.equal(value === 0 && key.startsWith('can_perform/') && actual === null ? 0 : actual, value, key);
        }
        for (const phase of ['before', 'immediate', 'after']) {
            const state = raw[phase][side]; assert.equal(state.object, before.object);
            for (const key of ['userp', 'playerp', 'interactive', 'living', 'fighting_opponent']) assert.equal(state[key], 1, key);
            assert.equal(state.wizardp, 0); assert.equal(state.ghost, 0); busy(state);
            assert.equal(state.weapon, cfg.equipment ? 'sword' : 'none');
            assert.equal(state.weapon_damage, cfg.equipment ? 50 : 0); assert.equal(state.weapon_flag, cfg.equipment ? 4 : 0);
            for (const slot of ['secondary_weapon', 'handing']) { assert.equal(state[slot], 'none'); assert.deepEqual(state[slot + '_details'], {}); }
        }
        if (cfg.equipment) {
            const weapon = map(before.weapon_details, '武器快照');
            assert.match(weapon.object, /^\/tests\/sword#\d+$/); assert.equal(weapon.program, '/tests/sword');
            for (const [key, value] of Object.entries({ skill_type: 'sword', damage: 50, flag: 4, weight: 3000, consistence: 100 })) assert.equal(weapon[key], value);
        } else assert.deepEqual(before.weapon_details, {});
        assert.equal(busy(before), 0);
        const originalWeapon = structuredClone(before.weapon_details);
        if (!side && accepted && hit && d.ability === 'tian') {
            assert.ok([99, 100].includes(after.weapon_details.consistence), '原剑单次耐久支持集');
            originalWeapon.consistence = after.weapon_details.consistence;
        }
        assert.deepEqual(after.weapon_details, originalWeapon, '武器归属/属性或耐久不符');
        for (const key of ['skills', 'mappings', 'preparations', 'cultivation', 'effective_skills', 'effective_str',
            'max_neili', 'max_qi', 'max_jing', 'combat_exp', 'str', 'int', 'con', 'dex', 'jiali', 'shen', 'gender'])
            assert.deepEqual(after[key], before[key], '不应变化 ' + key);
        assert.deepEqual(after.temp.apply, before.temp.apply);
        assert.deepEqual(raw.after[side], after, '没有异步观察窗口');
        for (const key of ['hit', 'dodge', 'parry', 'quick', 'riposte', 'heartbeats']) assert.equal(count(raw.metrics[side], key), 0, key);
        assert.equal(count(raw.metrics[side], 'direct'), side ? 0 : raw.directs.length);
        assert.equal(count(raw.metrics[side], 'ability_launched'), side ? 0 : Number(accepted));
        for (const key of health) {
            const cost = count(raw.metrics[side], key + '_cost');
            assert.equal(count(raw.metrics[side], key + '_recovery'), 0, key + '额外恢复');
            assert.equal(integer(after[key], key), integer(before[key], key) - cost, key + '账不闭合');
            if ((!side && key !== 'neili') || (side && (!hit || !['qi', 'eff_qi'].includes(key)))) assert.equal(cost, 0, key);
        }
    }
    assert.deepEqual(end.learned, {});
    const progress = map(a.learned, '熟练进度'); assert.ok(Object.keys(progress).every(k => k === d.skill));
    const delta = Object.hasOwn(progress, d.skill) ? integer(progress[d.skill], '熟练') : 0;
    if (!accepted) assert.equal(delta, 0);
    else if (b.effective_skills[d.skill] >= 120) assert.equal(delta, 1);
    else assert.ok([0, 1].includes(delta));
    assert.equal(count(raw.metrics[0], 'neili_cost'), accepted ? hit ? d.hitFee : d.missFee : 0);
    if (accepted) {
        assert.deepEqual(raw.launches, [{ actor: b.object, skill: d.skill, argument: d.ability + ' right' }]);
        assert.deepEqual(raw.refusals, []); assert.equal(raw.reason, '');
        if (bounds.hit_numerator === 0) assert.equal(hit, false, '原比较必失手');
        if (bounds.hit_numerator === bounds.hit_denominator) assert.equal(hit, true, '原比较必中');
        if (d.ability === 'tian' && hit) assert.ok(busy(a) >= 1 && busy(a) <= 3);
        else assert.equal(busy(a), hit ? 2 : d.ability === 'tian' ? 2 : 3);
    } else {
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.directs, []);
        assert.equal(typeof raw.reason, 'string'); assert.equal(raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''), p.refusal);
        assert.deepEqual(raw.refusals, [{ actor: b.object, reason: raw.reason }]); assert.equal(busy(a), 0);
    }
    if (hit) {
        const event = raw.directs[0];
        assert.equal(event.actor, 0); assert.equal(event.target, 1); assert.equal(event.type, d.usage === 'sword' ? 1 : 0);
        assert.equal(event.percent, d.percent); integer(event.damage, '直伤入参');
        assert.ok(event.damage >= bounds.input_min && event.damage <= bounds.input_max, '入参超出原随机支持集');
        assert.equal(event.weapon, d.usage === 'sword' ? 'sword' : 'none');
        assert.equal(event.weapon_object, d.usage === 'sword' ? b.weapon_details.object : '');
        assert.ok(count(raw.metrics[1], 'qi_cost') > 0, '中性靶原直伤应造成实际气血损失');
    }
    if (accepted && hit && d.ability === 'zhuan') assert.ok(busy(end) >= 2 && busy(end) <= 4);
    else assert.equal(busy(end), 0);
    return { accepted, hit, ...bounds, direct_input: hit ? raw.directs[0].damage : null,
        actor_neili_cost: count(raw.metrics[0], 'neili_cost'), actor_busy: busy(a), target_busy: busy(end),
        qi_damage: count(raw.metrics[1], 'qi_cost'), qi_wound: count(raw.metrics[1], 'eff_qi_cost'), learned_delta: delta };
}

export function taohuaDirectEffects(records, condition) {
    const valid = records.filter(r => ['observed', 'refused'].includes(r.outcome) && r.raw)
        .map(r => {
            assert.equal(r.condition_id, condition.id, '外层条件与冻结条件不同');
            assert.equal(r.outcome, r.raw.outcome, '外层结果与原记录不同');
            return validateTaohuaDirectRecord(r.raw, condition);
        });
    const accepted = valid.filter(r => r.accepted), hits = accepted.filter(r => r.hit);
    return { records: records.length, validated: valid.length, unknown_or_unobserved: records.length - valid.length,
        accepted: accepted.length, refused: valid.filter(r => !r.accepted).length,
        hit_when_accepted: probability(hits.length, accepted.length),
        direct_input_when_hit: distribution(hits.map(r => r.direct_input)),
        ...Object.fromEntries(['actor_neili_cost', 'actor_busy', 'target_busy', 'qi_damage', 'qi_wound', 'learned_delta']
            .map(key => [key, distribution(accepted.map(r => r[key]))])) };
}
