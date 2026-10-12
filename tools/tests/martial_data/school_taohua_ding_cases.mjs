// Independent preparation: no shared registration and no real-driver samples.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const skill = 'tanzhi-shentong', grant = 'can_perform/tanzhi-shentong/ding';
const owner = '/kungfu/skill/tanzhi-shentong/ding';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 10000, max_neili: 10000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 34, shen: 0, gender: '男性', character: '光明磊落' };
const sha256 = source => createHash('sha256').update(source).digest('hex');

export const taohuaDingSourcePaths = [
    'kungfu/skill/tanzhi-shentong/ding.c', 'kungfu/skill/tanzhi-shentong.c',
    'kungfu/skill/finger.c', 'kungfu/skill/force.c', 'kungfu/skill/bibo-shengong.c',
    'kungfu/skill/jingluo-xue.c', 'kungfu/class/taohua/huang.c',
    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'feature/sserver.c', 'feature/skill.c',
    'feature/attack.c', 'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c',
    'feature/equip.c', 'feature/action.c', 'mudcore/inherit/dbase.c',
    'mudcore/inherit/action.c', 'inherit/char/char.c', 'inherit/weapon/sword.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c', 'data/e2c_dict.o',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];

export const taohuaDingFixtureRequirements = [
    'Register/freeze only in a later shared window, including this module/test, statistics dependencies and all source_evidence bytes. Keep original RNG and call_out delay.',
    'Reuse perform finger.ding right on two connected nonwizard USERs. Original set_name aliases and present(right) must identify the exact target; no fallback to an implicit target.',
    'Extend only this group snapshot with actual ding grant, character, fighting_opponent, secondary_weapon/details, and an explicit no_perform read (present null/0 is unset, missing is unknown).',
    'Allow only frozen no_perform=1 and busy values through the existing preparation path. Reuse original unconcious and preparation terminal isolation. Do not rewrite actor resources or clear target busy after preparation.',
    'Reuse launch/refusal observations and add only a scoped actual query_notify_fail read for public busy/no_perform early returns that precede the existing do_perform hook; do not fabricate ability entry.',
    'Reuse the existing do_damage direct argument observer (actor/target, type, damage, percent, weapon/object) and existing set/receive_damage/jiali resource counters. No new combat formula or RNG probe.',
    'For the one natural window only, reuse observe_callback with two uniquely anchored, reverse-checked ding_end entry/exit observations on a temporary copy; record exact daemon owner, function, side, elapsed and original target snapshot. Original callback has no bound actor wrapper.',
    'Keep non-bout combat heartbeats suppressed by the existing strategy, without altering original start_busy/interrupt_me or daemon timer; natural no_perform removal is observed, natural busy release is not measured.',
    'Report taohuaDingEffects(rows, frozenCondition), never raw.parameters: command acceptance, hit, input damage, actual qi/wound, jiali/ability fees, busy, learned progress and observed timer removal have distinct denominators.',
];

export function taohuaDingConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0, '样本数必须是正整数');
    assert.equal(typeof readSource, 'function', '必须冻结实际来源字节');
    const source = catalog.skills.find(item => item.id === skill + '/ding');
    const base = catalog.skills.find(item => item.id === skill);
    const evidence = Object.fromEntries(taohuaDingSourcePaths.map(path => [path, sha256(readSource(path))]));
    for (const [item, path] of [[source, taohuaDingSourcePaths[0]], [base, taohuaDingSourcePaths[1]]]) {
        assert.equal(item?.path, path, '必须使用当前弹指神通来源');
        assert.equal(item.sha256, evidence[path], '目录清单与来源字节不同');
    }
    const entry = source.entries.find(item => item.role === 'perform')?.id;
    assert.match(entry ?? '', /^kungfu\/skill\/tanzhi-shentong\/ding\.c:\d+:perform$/);
    const result = [];
    function add(tag, level = 200, extra = {}) {
        const actor = { skills: { finger: level, [skill]: level, 'jingluo-xue': 200,
            force: 200, 'bibo-shengong': 200, ...extra.skills },
        mappings: { ...(!extra.noMap ? { finger: skill } : {}), force: 'bibo-shengong' },
        preparations: extra.noPrepare || extra.noMap ? {} : { finger: skill },
        properties: { ...pool, neili: 300, max_neili: 1500, 'family/family_name': '桃花岛',
            [grant]: 1, ...extra.properties },
        ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
        ...(extra.actorBusy ? { busy: extra.actorBusy } : {}),
        ...(extra.actorBlocked ? { temp: { no_perform: 1 } } : {}) };
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200,
            ...extra.targetSkills }, mappings: {}, preparations: {}, properties: { ...pool },
        equipment: { type: 'sword', hold: false },
        ...(extra.targetBusy ? { busy: extra.targetBusy } : {}),
        ...(extra.targetBlocked ? { temp: { no_perform: 1 } } : {}) };
        result.push({ id: `school-taohua-ding-l${level}-${tag}`, stage: 'school', entry_id: entry,
            method: 'perform', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-ding',
                skill, ability: 'ding', usage: 'finger', level, variant: tag, actor, target,
                named_participants: true, fighting: extra.fighting ?? true,
                target_state: extra.unconscious ? 'unconscious' : 'living',
                action: 'perform finger.ding right', observation: extra.natural
                    ? 'single_action_natural_callback' : 'single_action_immediate',
                observe_seconds: extra.natural ? 6 : 0,
                expected: extra.refusal ? 'refused' : 'observed', not_applicable: '',
                refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? extra.scope ?? 'ability' : '',
                gate_expectation: extra.gate ?? 'random', source_evidence: { ...evidence },
                ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                base_source: { path: base.path, sha256: base.sha256 },
                qualification_note: '真实非巫师USER与原命令；领悟/技能仅作实验资格，不重复教师学习。'
                    + '禁招与忙乱分账；保留目标原忙乱。REMOTE输入、实际气血、创伤、加力和招式费用分账。'
                    + '六秒窗口仅验证原1+random(5)回调解禁，不估忙乱解除时间或实战胜率。',
            } });
    }
    for (const level of [200, 400, 800]) add('baseline', level);
    add('minimum', 120, { skills: { 'jingluo-xue': 120 }, targetSkills: { parry: 178 }, gate: 'hit' });
    add('parry298', 200, { targetSkills: { parry: 298 }, gate: 'hit' });
    add('parry898', 200, { targetSkills: { parry: 898 }, gate: 'miss', checks: 2 });
    add('jiali50', 200, { targetSkills: { parry: 298 }, properties: { jiali: 50 }, gate: 'hit' });
    add('target-busy50', 200, { targetSkills: { parry: 298 }, targetBusy: 50, gate: 'hit' });
    add('natural-release', 200, { targetSkills: { parry: 298 }, gate: 'hit', natural: true, checks: 2 });
    const refused = (tag, refusal, extra = {}) => add(tag, 200, { ...extra, refusal, checks: 2 });
    refused('no-grant', '你所使用的外功中没有这种功能。\n', { properties: { [grant]: 0 } });
    refused('no-fight', '「定昆仑」只能对战斗中的对手使用。\n', { fighting: false });
    refused('sword', '「定昆仑」只能空手施展。\n', { weapon: true });
    refused('target-no-perform', '对方现在已经无法控制真气，放胆攻击吧。\n', { targetBlocked: true });
    refused('skill119', '你的弹指神通不够娴熟，难以施展「定昆仑」。\n', { skills: { [skill]: 119 } });
    refused('jingluo119', '你对经络学的了解不够，难以施展「定昆仑」。\n', { skills: { 'jingluo-xue': 119 } });
    refused('no-map', 'unmapped-finger-command', { noMap: true, scope: 'command' });
    refused('no-prepare', '你没有准备弹指神通，难以施展「定昆仑」。\n', { noPrepare: true });
    refused('max-neili1499', '你的内力修为不足，难以施展「定昆仑」。\n', { properties: { max_neili: 1499 } });
    refused('neili299', '你现在的真气不够，难以施展「定昆仑」。\n', { properties: { neili: 299 } });
    refused('unconscious-target', '对方都已经这样了，用不着这么费力吧？\n', { unconscious: true });
    refused('actor-busy2', '( 你上一个动作还没有完成，不能施用外功。)\n', { actorBusy: 2, scope: 'command' });
    refused('actor-no-perform', '你只觉全身力道竟似涣散了一般，全然无法控制。\n', { actorBlocked: true, scope: 'command' });
    return result;
}

function map(value, label) {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value), label); return value;
}
function integer(value, label) { assert.ok(Number.isSafeInteger(value), label); return value; }
function field(state, key) { assert.ok(Object.hasOwn(state, key), '缺少 ' + key); return state[key]; }
function flag(state, key) {
    const value = field(state, key);
    assert.ok(value === null || value === 0 || value === 1, '无效 ' + key); return value === 1 ? 1 : 0;
}
function busy(state) {
    const value = field(state, 'busy');
    assert.ok(value === null || (Number.isSafeInteger(value) && value >= 0), '无效 busy');
    return value === null ? 0 : value;
}
function count(metrics, key) {
    map(metrics, '缺少原计数映射');
    const value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效计数 ' + key); return value;
}
function sparse(values, key) {
    map(values, '缺少原映射');
    return integer(Object.hasOwn(values, key) ? values[key] : 0, key);
}
function skills(state, config) {
    assert.deepEqual(state.skills, config.skills, '原始修为');
    assert.deepEqual(state.mappings, config.mappings, '激发');
    assert.deepEqual(state.preparations, config.preparations, '互备');
    const apply = map(state.temp?.apply, '实际 apply');
    for (const [key, value] of Object.entries(config.skills)) {
        assert.equal(state.effective_skills?.[key], Math.trunc(value / 2)
            + (config.skills[config.mappings[key]] ?? 0) + sparse(apply, key), '有效 ' + key);
    }
    const unarmed = Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => config.skills[k] ?? 0));
    assert.equal(state.effective_str, config.properties.str + Math.trunc(unarmed / 10) + sparse(apply, 'str'), '有效膂力');
    assert.equal(state.effective_con, config.properties.con + Math.trunc((config.skills.force ?? 0) / 10)
        + sparse(apply, 'con'), '有效根骨');
    const expectedApply = { armor: 100, ...(config.equipment ? { damage: 50, dodge: -1 } : {}) };
    for (const key of new Set([...Object.keys(apply), ...Object.keys(expectedApply)]))
        assert.equal(sparse(apply, key), expectedApply[key] ?? 0, '未知属性加成 ' + key);
    for (const [key, value] of Object.entries(config.properties)) {
        if (health.includes(key)) continue;
        assert.equal(key.includes('/') || key === 'character' ? state.cultivation?.[key] : state[key], value, key);
    }
}
function identity(state, side, config, p) {
    assert.match(state?.object ?? '', /^\/tests\/actor#\d+$/);
    assert.equal(state.id, side ? 'right' : 'left');
    for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1, key);
    assert.equal(state.wizardp, 0); assert.equal(state.ghost, 0);
    assert.equal(state.living, side && p.target_state === 'unconscious' ? 0 : 1);
    assert.equal(state.fighting_opponent, Number(p.fighting));
    busy(state); const blocked = flag(state, 'no_perform');
    const temp = map(state.temp, '实际临时数据');
    if (Object.hasOwn(temp, 'str')) assert.ok(temp.str === null || temp.str === 0, '无额外临时膂力');
    assert.ok(!Object.hasOwn(temp, 'debuff'), '本组无互搏伤害系数');
    if (blocked) assert.equal(temp.no_perform, 1, '禁招原值');
    else if (Object.hasOwn(temp, 'no_perform')) assert.ok(temp.no_perform === null || temp.no_perform === 0, '禁招未清');
    map(state.learned, '原熟练映射');
    for (const value of Object.values(state.learned)) assert.ok(Number.isSafeInteger(value) && value >= 0, '原熟练值');
    for (const key of health) integer(state[key], key);
    skills(state, config);
    assert.equal(state.weapon, config.equipment ? 'sword' : 'none');
    assert.equal(state.weapon_damage, config.equipment ? 50 : 0);
    assert.equal(state.weapon_flag, config.equipment ? 4 : 0);
    assert.equal(state.secondary_weapon, 'none'); assert.deepEqual(state.secondary_weapon_details, {});
    assert.equal(state.handing, 'none'); assert.deepEqual(state.handing_details, {});
    const details = map(state.weapon_details, '原武器快照');
    if (!config.equipment) assert.deepEqual(details, {});
    else {
        assert.equal(details.program, '/tests/sword'); assert.match(details.object, /^\/tests\/sword#\d+$/);
        for (const [key, value] of Object.entries({ skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100 }))
            assert.equal(details[key], value, key);
    }
}

// Finite support of the original integer calculation, only for these neutral inputs.
// No forcing of either random branch and no claim about other target states.
export function taohuaDingQiSupport(input, actor) {
    integer(input, 'REMOTE 输入');
    let damage = input + Math.trunc(actor.jiali * input / 200);
    const str = actor.str * 2 + actor.effective_str;
    const strength = str < 40 ? str : str < 70 ? Math.trunc((str - 30) / 2) + 20 : Math.trunc((str - 60) / 4) + 30;
    damage += Math.trunc(damage * strength / 50);
    const factor = actor.int < 16 ? 10 : actor.int < 40 ? 7 : 4;
    const values = [damage];
    if (actor.int > 9) values.push(damage + Math.trunc(damage * factor / actor.int));
    return [...new Set(values.map(value => value > 1500 ? Math.trunc((value - 1500) / 4) + 1000
        : value > 500 ? Math.trunc((value - 500) / 2) + 500 : value))];
}

export function validateTaohuaDingRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'taohua-ding'); assert.equal(condition.method, 'perform');
    assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, 'perform');
    assert.equal(raw.outcome, p.expected); assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.ok(Array.isArray(raw[key]) && raw[key].length === 2, key);
    for (const key of ['launches', 'refusals', 'directs', 'callbacks']) assert.ok(Array.isArray(raw[key]), key);
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'dropped', 'terminals'])
        assert.deepEqual(raw[key], [], '本窗口不应有 ' + key);
    assert.notEqual(raw.before[0].object, raw.before[1].object, '必须是两个实际USER');
    const accepted = p.expected === 'observed', hit = raw.directs.length === 1;
    const commandCost = integer(field(raw, 'command_accepted'), '原命令执行成本');
    assert.ok(commandCost >= 0, '原命令执行成本不能为负');
    assert.equal(commandCost > 0, accepted, '命令受理按正成本判定，拒绝必须为零');
    assert.ok(raw.directs.length <= 1 && (accepted || !hit), '原单次 REMOTE');
    if (accepted) {
        assert.deepEqual(raw.launches, [{ actor: raw.before[0].object, skill, argument: 'ding right' }]);
        assert.deepEqual(raw.refusals, []);
        assert.equal(raw.reason, '');
        const ap = raw.before[0].effective_skills.finger, dp = raw.before[1].effective_skills.parry;
        if (Math.trunc(ap / 2) > dp) assert.ok(hit, '原随机支持集必命中');
        if (Math.trunc(ap / 2) + ap - 1 <= dp) assert.ok(!hit, '原随机支持集必失手');
        if (p.gate_expectation !== 'random') assert.equal(hit, p.gate_expectation === 'hit');
        if (hit) {
            const event = raw.directs[0];
            assert.equal(event.actor, 0); assert.equal(event.target, 1);
            assert.equal(event.type, 2); assert.equal(event.percent, 0);
            assert.equal(event.weapon, 'none'); assert.equal(event.weapon_object, '');
            integer(event.damage, '原输入 damage');
            assert.ok(event.damage >= Math.trunc(ap / 4)
                && event.damage < Math.trunc(ap / 4) + Math.trunc(ap / 2), '原输入随机支持集');
        }
    } else {
        assert.deepEqual(raw.launches, []);
        assert.equal(typeof raw.reason, 'string'); assert.ok(raw.reason.length);
        assert.deepEqual(raw.refusals, [{ actor: raw.before[0].object, reason: raw.reason }], '原拒绝同源');
        const text = raw.reason.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
        // Current dictionary is 基本指法. Driver 328aaf10 f_range uses EGC indices:
        // original [4..7] is empty, not the legacy two-byte assumption "指法".
        if (p.refusal === 'unmapped-finger-command') assert.equal(text, '你现在的(finger)中并没有这种外功。\n');
        else assert.equal(text, p.refusal, '原拒绝入口');
    }
    if (p.target_state === 'unconscious') {
        const prep = map(raw.preparation, '原昏迷准备证据');
        assert.equal(prep.before.object, raw.before[1].object); assert.equal(prep.before.living, 1);
        assert.equal(prep.before.qi, p.target.properties.qi); assert.equal(prep.before.jing, p.target.properties.jing);
        assert.deepEqual(prep.after, raw.before[1]);
        assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }]);
    } else assert.ok(!Object.hasOwn(raw, 'preparation') || Object.keys(raw.preparation).length === 0);
    const qiLoss = raw.before[1].qi - raw.immediate[1].qi;
    if (hit) assert.ok(taohuaDingQiSupport(raw.directs[0].damage, raw.before[0]).includes(qiLoss), '原 REMOTE 实际掉血');
    else assert.equal(qiLoss, 0);
    for (const side of [0, 1]) {
        const config = side ? p.target : p.actor;
        for (const phase of ['before', 'immediate', 'after']) {
            const state = raw[phase][side]; identity(state, side, config, p);
            assert.equal(state.object, raw.before[side].object, '换了角色');
            assert.deepEqual(state.weapon_details, raw.before[side].weapon_details, 'REMOTE 不磨损武器');
            assert.deepEqual(state.temp.apply, raw.before[side].temp.apply, '属性被改写');
        }
        const before = raw.before[side], immediate = raw.immediate[side], after = raw.after[side];
        assert.deepEqual(before.learned, {}, '没有预植熟练进度');
        for (const key of health) {
            const initial = side && p.target_state === 'unconscious' && ['qi', 'jing'].includes(key) ? 0 : config.properties[key];
            assert.equal(before[key], initial, '初态 ' + key);
            const cost = !side && key === 'neili' && accepted ? (hit ? 200 + before.jiali : 150)
                : side && key === 'qi' && hit ? qiLoss : 0;
            assert.equal(count(raw.metrics[side], key + '_cost'), cost, '毛扣 ' + key);
            assert.equal(count(raw.metrics[side], key + '_recovery'), 0, '不可混入恢复 ' + key);
            assert.equal(immediate[key], before[key] - cost, '即时资源 ' + key);
            assert.equal(after[key], immediate[key], '计时窗口资源 ' + key);
        }
        assert.equal(busy(before), config.busy ?? 0, '初始忙乱');
        assert.equal(busy(immediate), !side && accepted ? hit ? 2 : 1 : busy(before), '施展后原忙乱');
        assert.equal(busy(after), busy(immediate), '未运行角色忙乱心跳');
        assert.equal(flag(before, 'no_perform'), config.temp?.no_perform ?? 0, '初始禁招');
        assert.equal(flag(immediate, 'no_perform'), side && hit ? 1 : flag(before, 'no_perform'), '即时禁招');
        assert.equal(flag(after, 'no_perform'), side && hit && p.observe_seconds ? 0 : flag(immediate, 'no_perform'), '最终禁招');
        const progress = sparse(immediate.learned, skill) - sparse(before.learned, skill);
        if (!side && accepted) {
            assert.ok([0, 1].includes(progress), '原弱熟练');
            if (before.effective_skills[skill] >= 120) assert.equal(progress, 1, '熟练随机支持集必增1');
        } else assert.equal(progress, 0, '未受理/目标不能成长');
        for (const key of new Set([...Object.keys(before.learned), ...Object.keys(immediate.learned)]))
            if (key !== skill) assert.equal(sparse(immediate.learned, key), sparse(before.learned, key), '无关熟练');
        assert.deepEqual(after.learned, immediate.learned, '窗口不能额外练习');
        assert.equal(count(raw.metrics[side], 'ability_launched'), !side && accepted ? 1 : 0);
        assert.equal(count(raw.metrics[side], 'direct'), !side && hit ? 1 : 0);
        for (const key of ['attack', 'hit', 'dodge', 'parry', 'quick', 'riposte', 'heartbeats'])
            assert.equal(count(raw.metrics[side], key), 0, '非普通战斗 ' + key);
    }
    if (p.observe_seconds) {
        assert.ok(accepted && hit); assert.equal(p.observe_seconds, 6);
        assert.equal(raw.callbacks.length, 2, '必须实际观察原解禁回调');
        const [before, after] = raw.callbacks;
        for (const [event, phase, state] of [[before, 'before', raw.immediate[1]], [after, 'after', raw.after[1]]]) {
            assert.equal(event.owner, owner); assert.equal(event.function, 'ding_end');
            assert.equal(event.side, 1); assert.equal(event.phase, phase);
            assert.ok(Number.isFinite(event.elapsed) && event.elapsed >= 0 && event.elapsed <= raw.elapsed);
            assert.deepEqual(event.state, state, '原回调快照同源');
        }
        assert.ok(before.elapsed <= after.elapsed);
        // Only no_perform may differ across the original callback. Keep all other temp data.
        const normalized = structuredClone(raw.immediate[1]);
        normalized.no_perform = raw.after[1].no_perform;
        if (Object.hasOwn(raw.after[1].temp, 'no_perform')) normalized.temp.no_perform = raw.after[1].temp.no_perform;
        else delete normalized.temp.no_perform;
        assert.deepEqual(normalized, raw.after[1], '解禁不能吞掉其它状态变化');
        assert.deepEqual(raw.after[0], raw.immediate[0]);
    } else {
        assert.deepEqual(raw.callbacks, []); assert.deepEqual(raw.after, raw.immediate);
    }
    return { accepted, hit, refusal_scope: accepted ? '' : p.refusal_scope,
        input_damage: hit ? raw.directs[0].damage : null, qi_loss: qiLoss,
        wound: raw.before[1].eff_qi - raw.after[1].eff_qi,
        ability_neili: accepted ? hit ? 200 : 150 : 0, jiali_neili: hit ? raw.before[0].jiali : 0,
        total_neili: raw.before[0].neili - raw.after[0].neili,
        actor_busy: busy(raw.immediate[0]), target_busy: busy(raw.immediate[1]),
        learned_gain: sparse(raw.after[0].learned, skill) - sparse(raw.before[0].learned, skill),
        release_observed: p.observe_seconds ? true : null,
        release_elapsed: p.observe_seconds ? raw.callbacks[1].elapsed : null };
}

export function taohuaDingEffects(rows, condition) {
    const checked = [];
    let errors = 0, notApplicable = 0;
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id, '报告必须按冻结条件分组');
        if (row.outcome === 'error') { errors++; continue; }
        if (row.outcome === 'not_applicable') { notApplicable++; continue; }
        assert.equal(row.outcome, row.raw?.outcome, '报告结果与原件不符');
        checked.push(validateTaohuaDingRecord(row.raw, condition));
    }
    const accepted = checked.filter(item => item.accepted), hits = accepted.filter(item => item.hit);
    const known = key => distribution(accepted.map(item => item[key]));
    return { observed: accepted.length, refused: checked.length - accepted.length, errors,
        not_applicable: notApplicable, invalid_or_unknown: errors + notApplicable,
        command_refused: checked.filter(item => item.refusal_scope === 'command').length,
        ability_refused: checked.filter(item => item.refusal_scope === 'ability').length,
        hit: probability(hits.length, accepted.length), input_damage_on_hit: distribution(hits.map(item => item.input_damage)),
        qi_loss: known('qi_loss'), wound: known('wound'), ability_neili: known('ability_neili'),
        jiali_neili: known('jiali_neili'), total_neili: known('total_neili'),
        actor_busy: known('actor_busy'), target_busy: known('target_busy'), learned_gain: known('learned_gain'),
        release_observed: checked.filter(item => item.release_observed === true).length,
        release_unobserved: hits.filter(item => item.release_observed === null).length,
        release_elapsed: distribution(checked.filter(item => item.release_observed === true).map(item => item.release_elapsed)),
        limitations: ['仅固定中性目标；percent=0在本组无创伤，不代表所有目标状态都无创伤。',
            '命令拒绝、招式拒绝、受理后失手与命中分别统计；拒绝/错误不进入命中分母。',
            '禁招自然回调与角色忙乱不同；即时样本没有观察解除，不记作零秒解除。',
            '两次六秒自然窗口只验机制，不估计1至5秒随机延迟分布；保留实际测时。'] };
}
