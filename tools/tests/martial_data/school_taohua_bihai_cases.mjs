// Independent preparation only: no shared registration or real-driver observations.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const skill = 'yuxiao-jian', grant = 'can_perform/yuxiao-jian/bihai';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const pool = { qi: 100000, eff_qi: 100000, max_qi: 100000, jing: 100000, eff_jing: 100000,
    max_jing: 100000, neili: 10000, max_neili: 10000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 34, shen: 0, gender: '男性' };
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export const taohuaBihaiSourcePaths = [
    'kungfu/skill/yuxiao-jian/bihai.c', 'kungfu/skill/yuxiao-jian.c',
    'kungfu/skill/sword.c', 'kungfu/skill/force.c', 'kungfu/skill/bibo-shengong.c',
    'kungfu/skill/chuixiao-jifa.c', 'kungfu/skill/bihai-chaosheng.c',
    'kungfu/class/taohua/huang.c', 'cmds/skill/perform.c', 'cmds/std/hand.c',
    'inherit/skill/skill.c', 'feature/sserver.c', 'feature/skill.c', 'feature/attack.c',
    'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c', 'feature/equip.c',
    'feature/action.c', 'mudcore/inherit/dbase.c', 'mudcore/inherit/action.c',
    'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/weapon/xsword.c',
    'inherit/misc/equip.c', 'inherit/misc/_xiao.c', 'adm/daemons/itemd.c',
    'adm/single/simul_efun/message.c', 'adm/single/simul_efun/chinese.c',
    'adm/daemons/chinesed.c', 'data/e2c_dict.o', 'include/globals.h',
    'include/combat.h', 'include/weapon.h', 'include/music.h', 'mudcore/include/ansi.h',
];

export const taohuaBihaiFixtureRequirements = [
    'Register only in a later shared write window; freeze the finite conditions, source_evidence, actual game/LPC copies, driver identity and complete tool/dependency bytes in a new series.',
    'Reuse perform sword.bihai right on two connected nonwizard USERs with original set_name/present aliases. Record the actual grant, fighting_opponent and secondary_weapon/details.',
    'Use already generated /tests/xsword (original XSWORD/MI_XIAO inheritance, init_xsword(50) gives damage45) and /tests/sword (damage50). Never inject valid_as_xiao into an ordinary sword or use the unique jade flute.',
    'For only this group, prepare handing_equipment with the original hand command before creating/wielding an optional primary equipment. Assert exact held/wielded references and ownership; preserve both without bypassing original hand/wield constraints.',
    'In this group equipment snapshots, read actual valid_as_xiao and function_exists(valid_as_xiao): XSWORD must return1 from /inherit/misc/_xiao; ordinary swords must have explicit absent0/null, never a missing key.',
    'Reuse original unconcious preparation and isolate its before/after/terminal evidence and counters. The sample begins after preparation, with original fighting relationships; no synthetic not-living flag.',
    'Reuse launch/refusal and resource observations, without RNG/attack probes. Observe only total jing damage and eff_jing wound; do not reconstruct the four random comparisons or call music play/do_effect.',
    'Report taohuaBihaiEffects(rows, frozenCondition), not raw.parameters. Acceptance, positive/zero aggregate effect, refusal, fee, immediate busy and original learned growth have distinct denominators.',
];

export function taohuaBihaiConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0, '样本数须为正整数');
    assert.equal(typeof readSource, 'function', '必须读取实际来源字节');
    const evidence = Object.fromEntries(taohuaBihaiSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length > 0, path);
        return [path, sha256(bytes)];
    }));
    const source = catalog.skills.find(item => item.id === skill + '/bihai');
    const base = catalog.skills.find(item => item.id === skill);
    for (const [item, path] of [[source, taohuaBihaiSourcePaths[0]], [base, taohuaBihaiSourcePaths[1]]]) {
        assert.equal(item?.path, path, '必须是当前玉箫剑法来源');
        assert.equal(item.sha256, evidence[path], '目录清单与实际来源不符');
    }
    const entry = source.entries.find(item => item.role === 'perform')?.id;
    assert.match(entry ?? '', /^kungfu\/skill\/yuxiao-jian\/bihai\.c:\d+:perform$/);
    const result = [];
    function add(tag, level = 200, extra = {}) {
        const held = Object.hasOwn(extra, 'held') ? extra.held : 'xsword';
        const actor = { skills: { sword: level, [skill]: level, force: level,
            'bibo-shengong': level, 'chuixiao-jifa': level, 'bihai-chaosheng': level, ...extra.skills },
        mappings: { ...(!extra.noSwordMap ? { sword: skill } : {}), force: 'bibo-shengong',
            ...(!extra.noMusicMap ? { 'chuixiao-jifa': 'bihai-chaosheng' } : {}) },
        preparations: {}, properties: { ...pool, 'family/family_name': '桃花岛', [grant]: 1, ...extra.properties },
        ...(held ? { handing_equipment: { type: held, hold: true, hand_id: 'practice weapon' } } : {}),
        ...(extra.primary ? { equipment: { type: extra.primary, hold: false } } : {}) };
        const target = { skills: { force: 600, parry: 600, dodge: 600, 'chuixiao-jifa': 0, ...extra.targetSkills },
            mappings: {}, preparations: {}, properties: { ...pool } };
        result.push({ id: `school-taohua-bihai-l${level}-${tag}`, stage: 'school', entry_id: entry,
            method: 'perform', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-bihai',
                skill, ability: 'bihai', usage: 'sword', level, variant: tag, actor, target,
                named_participants: true, fighting: extra.fighting ?? true,
                target_state: extra.unconscious ? 'unconscious' : 'living',
                action: 'perform sword.bihai right', observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.refusal ? 'refused' : 'observed', not_applicable: '',
                refusal: extra.refusal ?? '', total_gate_expectation: extra.gate ?? 'source_support',
                source_evidence: { ...evidence },
                ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                base_source: { path: base.path, sha256: base.sha256 },
                qualification_note: '真实非巫师USER与原命令；领悟仅作实验资格，不重复黄药师传授。'
                    + '原手持箫优先、主手回退，真实XSWORD继承，不伪造普通剑的valid_as_xiao。'
                    + '四次随机比较只观察总精神损伤/创伤，不反推各段命中；受理零效果仍收费200。'
                    + '即时忙乱1至3与原命令熟练增长单列，不混入曲谱演奏、自然解忙或实战胜率。',
            } });
    }
    for (const level of [200, 400, 800]) add('baseline', level);
    add('force0', 200, { targetSkills: { force: 0 }, gate: 'all_four_source_guaranteed' });
    add('force2200', 200, { targetSkills: { force: 2200 }, gate: 'zero_source_guaranteed', checks: 2 });
    add('minimum', 180);
    add('neili300', 200, { properties: { neili: 300 }, checks: 2 });
    add('no-music-map', 200, { noMusicMap: true });
    add('target-music400', 200, { targetSkills: { 'chuixiao-jifa': 400 } });
    add('valid-hand-invalid-primary', 200, { primary: 'sword', checks: 2 });
    add('invalid-hand-valid-primary', 200, { held: 'sword', primary: 'xsword', checks: 2 });
    add('primary-only', 200, { held: null, primary: 'xsword', checks: 2 });
    const refused = (tag, refusal, extra = {}) => add(tag, 200, { ...extra, refusal, checks: 2 });
    refused('no-grant', '你所使用的外功中没有这种功能。\n', { properties: { [grant]: 0 } });
    refused('no-fight', '「碧海潮生按玉箫」只能对战斗中的对手使用。\n', { fighting: false });
    const noXiao = '你手里没有拿萧，难以施展「碧海潮生按玉箫」。\n';
    refused('no-instrument', noXiao, { held: null });
    refused('invalid-hand-only', noXiao, { held: 'sword' });
    refused('invalid-primary-only', noXiao, { held: null, primary: 'sword' });
    refused('yuxiao179', '你玉箫剑法等级不够, 难以施展「碧海潮生按玉箫」。\n', { skills: { [skill]: 179 } });
    refused('bibo179', '你碧波神功修为不够，难以施展「碧海潮生按玉箫」。\n', { skills: { 'bibo-shengong': 179 } });
    refused('bihai179', '你的碧海潮生曲太低，难以施展「碧海潮生按玉箫」。\n', { skills: { 'bihai-chaosheng': 179 } });
    refused('no-sword-map', '你现在的(sword)中并没有这种外功。\n', { noSwordMap: true });
    refused('neili299', '你现在的内力不够，难以施展「碧海潮生按玉箫」。\n', { properties: { neili: 299 } });
    refused('unconscious-target', '对方都已经这样了，用不着这么费力吧？\n', { unconscious: true });
    return result;
}

function map(value, label) {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value), label); return value;
}
function integer(value, label) { assert.ok(Number.isSafeInteger(value), label); return value; }
function count(metrics, key) {
    map(metrics, '缺少原计数映射');
    const value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效计数：' + key); return value;
}
function absent(value, key) {
    assert.ok(Object.hasOwn(value, key), '缺少明确空值字段：' + key);
    assert.ok(value[key] === 0 || value[key] === null, '不是明确空值：' + key);
}
function busy(state) {
    assert.ok(Object.hasOwn(state, 'busy'), '缺少真实忙乱');
    const value = state.busy === null ? 0 : state.busy;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效忙乱'); return value;
}
function apply(state, key) {
    const values = map(state.temp?.apply, '缺少真实apply映射');
    return integer(Object.hasOwn(values, key) ? values[key] : 0, '无效apply/' + key);
}
function learned(state) {
    const values = map(state.learned, '缺少原熟练映射');
    for (const value of Object.values(values)) assert.ok(Number.isSafeInteger(value) && value >= 0, '无效熟练');
    return values;
}
function identity(state) {
    assert.ok(typeof state?.object === 'string' && state.object.length > 0, '缺少原角色身份');
    for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1, key);
    assert.equal(state.wizardp, 0);
    for (const key of ['living', 'ghost', 'fighting_opponent']) assert.ok([0, 1].includes(state[key]), key);
    busy(state); learned(state); map(state.temp?.apply, '缺少实际apply');
    for (const key of health) integer(state[key], key);
}
function equipment(state, config) {
    assert.equal(state.secondary_weapon, 'none'); assert.deepEqual(state.secondary_weapon_details, {});
    for (const [slot, cfg] of [['weapon', config.equipment], ['handing', config.handing_equipment]]) {
        assert.equal(state[slot], cfg ? 'sword' : 'none');
        const detail = map(state[slot + '_details'], '缺少物品快照：' + slot);
        if (!cfg) { assert.deepEqual(detail, {}); continue; }
        assert.ok(['xsword', 'sword'].includes(cfg.type));
        assert.equal(detail.program, '/tests/' + cfg.type);
        assert.match(detail.object, new RegExp('^/tests/' + cfg.type + '#\\d+$'));
        assert.equal(detail.skill_type, 'sword'); assert.equal(detail.flag, 4);
        assert.equal(detail.weight, 3000); assert.equal(detail.damage, cfg.type === 'xsword' ? 45 : 50);
        assert.equal(detail.consistence, 100);
        if (cfg.type === 'xsword') {
            assert.equal(detail.valid_as_xiao, 1);
            assert.equal(detail.valid_as_xiao_source, '/inherit/misc/_xiao');
        } else {
            absent(detail, 'valid_as_xiao'); absent(detail, 'valid_as_xiao_source');
        }
    }
    if (config.equipment && config.handing_equipment)
        assert.notEqual(state.weapon_details.object, state.handing_details.object, '主手和手持不是同一物件');
    assert.equal(state.weapon_damage, config.equipment ? config.equipment.type === 'xsword' ? 45 : 50 : 0);
    assert.equal(state.weapon_flag, config.equipment ? 4 : 0);
    assert.equal(apply(state, 'armor'), 100);
    assert.equal(apply(state, 'damage'), state.weapon_damage);
    assert.equal(apply(state, 'dodge'), config.equipment ? -1 : 0, '手持物不施加武器属性');
}

// Only the union of possible TOTAL damage ranges is checked. No sampled stage outcome
// or random draw is reconstructed; four independent integer sums have contiguous ranges.
function damageSupport(ap, dp) {
    const half = Math.trunc(ap / 2);
    const gates = [[ap, ap, 5], [ap, half, 4], [half, ap, 3], [half, half, 2]];
    let ranges = [[0, 0]];
    for (const [base, bound, divisor] of gates) {
        const part = Math.trunc(ap / divisor), next = [];
        for (const [low, high] of ranges) {
            if (base <= dp) next.push([low, high]);
            if (base + bound - 1 > dp) next.push([low + part, high + 2 * part - 1]);
        }
        ranges = [];
        for (const range of next.sort((a, b) => a[0] - b[0])) {
            const last = ranges.at(-1);
            if (last && range[0] <= last[1] + 1) last[1] = Math.max(last[1], range[1]);
            else ranges.push([...range]);
        }
    }
    return ranges;
}

export function validateTaohuaBihaiRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'taohua-bihai'); assert.equal(condition.method, 'perform');
    assert.equal(raw.method, condition.method); assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'after', 'metrics']) {
        assert.ok(Array.isArray(raw[key]), key); assert.equal(raw[key].length, 2, key);
    }
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'dropped', 'terminals', 'callbacks'])
        assert.deepEqual(raw[key], [], '即时窗口不应出现其他事件：' + key);
    for (const key of ['launches', 'refusals']) assert.ok(Array.isArray(raw[key]), key);
    for (const key of ['actions', 'directs']) if (Object.hasOwn(raw, key)) assert.deepEqual(raw[key], []);
    assert.deepEqual(raw.after, raw.immediate, '不得混入后续心跳/回调');
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    const [b, t] = raw.before, [a, end] = raw.immediate, accepted = p.expected === 'observed';
    assert.notEqual(b.object, t.object);
    assert.ok(Object.hasOwn(raw, 'command_accepted'), '缺少原命令执行成本');
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted >= 0,
        '原命令执行成本必须是非负安全整数');
    assert.equal(raw.command_accepted > 0, accepted, '命令受理按正成本判定，拒绝必须为零');
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side], final = raw.immediate[side];
        for (const phase of ['before', 'immediate', 'after']) {
            identity(raw[phase][side]); assert.equal(raw[phase][side].object, state.object);
        }
        assert.equal(state.id, side ? 'right' : 'left');
        assert.equal(state.living, side && p.target_state === 'unconscious' ? 0 : 1);
        assert.equal(state.ghost, 0); assert.equal(state.fighting_opponent, Number(p.fighting));
        assert.equal(busy(state), 0); equipment(state, cfg);
        assert.deepEqual(state.skills, cfg.skills); assert.deepEqual(state.mappings, cfg.mappings);
        assert.deepEqual(state.preparations, cfg.preparations); assert.deepEqual(learned(state), {});
        const effective = map(state.effective_skills, '缺少实际有效等级');
        for (const [key, value] of Object.entries(cfg.skills)) {
            assert.equal(apply(state, key), key === 'dodge' && cfg.equipment ? -1 : 0);
            assert.equal(effective[key], Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + apply(state, key), key);
        }
        for (const [key, value] of Object.entries(cfg.properties)) {
            const expected = side && p.target_state === 'unconscious' && ['qi', 'jing'].includes(key) ? 0 : value;
            if (key.includes('/')) {
                const cultivation = map(state.cultivation, '缺少原资格');
                assert.ok(Object.hasOwn(cultivation, key), key);
                if (key === grant && expected === 0) absent(cultivation, key);
                else assert.equal(cultivation[key], expected, key);
            } else assert.equal(state[key], expected, key);
        }
        for (const key of ['id', 'living', 'ghost', 'fighting_opponent', 'skills', 'mappings', 'preparations',
            'cultivation', 'effective_skills', 'weapon', 'weapon_damage', 'weapon_flag', 'weapon_details',
            'secondary_weapon', 'secondary_weapon_details', 'handing', 'handing_details'])
            assert.deepEqual(final[key], state[key], '即时原状态变化：' + key);
        for (const key of Object.keys(cfg.properties).filter(key => !health.includes(key) && !key.includes('/')))
            assert.deepEqual(final[key], state[key], key);
        assert.deepEqual(final.temp.apply, state.temp.apply, '没有原临时属性增减');
        for (const key of ['direct', 'quick', 'riposte', 'heartbeats', 'hit', 'dodge', 'parry'])
            assert.equal(count(raw.metrics[side], key), 0, key);
    }
    assert.equal(busy(end), 0);
    if (p.target_state === 'unconscious') {
        const prep = map(raw.preparation, '缺少原昏迷准备');
        assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }]);
        identity(prep.before); identity(prep.after);
        assert.equal(prep.before.object, t.object); assert.equal(prep.before.id, t.id);
        assert.equal(prep.before.living, 1); assert.equal(prep.before.ghost, 0);
        assert.equal(prep.before.fighting_opponent, 1);
        for (const key of health) assert.equal(prep.before[key], p.target.properties[key]);
        assert.deepEqual(prep.before.skills, t.skills); assert.deepEqual(prep.before.mappings, t.mappings);
        assert.deepEqual(prep.after, t, '准备结束才开始测量');
    } else assert.equal(Object.hasOwn(raw, 'preparation'), false);
    assert.equal(count(raw.metrics[0], 'ability_launched'), Number(accepted));
    assert.equal(count(raw.metrics[1], 'ability_launched'), 0);
    if (accepted) {
        assert.deepEqual(raw.launches, [{ actor: b.object, skill, argument: 'bihai right' }]);
        assert.deepEqual(raw.refusals, []); assert.equal(raw.reason, '');
        assert.ok([1, 2, 3].includes(busy(a)), '原即时忙乱1至3');
    } else {
        assert.deepEqual(raw.launches, []); assert.equal(typeof raw.reason, 'string');
        assert.equal(raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''), p.refusal, '原拒绝路径不符');
        assert.deepEqual(raw.refusals, [{ actor: b.object, reason: raw.reason }]);
        assert.equal(busy(a), 0);
    }
    const ap = b.skills[skill] + b.skills['bibo-shengong'] + b.effective_skills['chuixiao-jifa'];
    const dp = t.effective_skills.force + t.effective_skills.parry + Math.trunc(t.effective_skills['chuixiao-jifa'] / 2);
    const damage = count(raw.metrics[1], 'jing_cost'), wound = Math.trunc(damage * 2 / 3);
    const ranges = damageSupport(ap, dp);
    if (accepted) {
        assert.ok(ranges.some(([low, high]) => damage >= low && damage <= high), '总精神损伤超出原整数可达集合');
        if (p.total_gate_expectation === 'zero_source_guaranteed') assert.equal(damage, 0);
        if (p.total_gate_expectation === 'all_four_source_guaranteed') assert.ok(Math.trunc(ap / 2) > dp);
    } else assert.equal(damage, 0);
    for (const side of [0, 1]) for (const key of health) {
        const cost = side === 0 ? key === 'neili' && accepted ? 200 : 0
            : { jing: damage, eff_jing: wound }[key] ?? 0;
        assert.equal(count(raw.metrics[side], key + '_cost'), cost, '原毛扣不符：' + key);
        assert.equal(count(raw.metrics[side], key + '_recovery'), 0, '本组无恢复/归零修正：' + key);
        assert.equal(raw.immediate[side][key], raw.before[side][key] - cost, '原资源账不闭合：' + key);
    }
    const progress = learned(a);
    assert.ok(Object.keys(progress).every(key => key === skill), '只能增长原绝招对应熟练');
    const learnedDelta = Object.hasOwn(progress, skill) ? progress[skill] : 0;
    if (!accepted) assert.equal(learnedDelta, 0, '拒绝不得增长');
    else if (b.effective_skills[skill] >= 120) assert.equal(learnedDelta, 1, '原命令保证增长');
    else assert.ok([0, 1].includes(learnedDelta), '原命令增长只能0或1');
    assert.deepEqual(learned(end), learned(t), '目标不得增长');
    return { accepted, positive_effect: accepted ? damage > 0 : null, ap, dp,
        jing_damage: damage, jing_wound: wound, actor_neili_cost: count(raw.metrics[0], 'neili_cost'),
        target_neili_cost: count(raw.metrics[1], 'neili_cost'), busy: busy(a), learned_delta: learnedDelta };
}

export function taohuaBihaiEffects(rows, condition) {
    assert.equal(condition.parameters.collection_group, 'taohua-bihai');
    const observations = [], counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.method, condition.method); assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        if (row.outcome === 'error') continue;
        const observation = validateTaohuaBihaiRecord(row.raw, condition);
        if (observation.accepted) observations.push(observation);
    }
    const positive = observations.filter(item => item.positive_effect).length;
    return { samples: rows.length, counts, accepted_samples: observations.length,
        positive_effect: probability(positive, observations.length), zero_effects: observations.length - positive,
        refused_samples: counts.refused, unknown_effect_samples: counts.error,
        learned_progress: probability(observations.filter(item => item.learned_delta > 0).length, observations.length),
        busy_histogram: Object.fromEntries([1, 2, 3].map(value =>
            [value, observations.filter(item => item.busy === value).length])),
        ...Object.fromEntries(['ap', 'dp', 'jing_damage', 'jing_wound', 'actor_neili_cost',
            'target_neili_cost', 'busy', 'learned_delta'].map(key => [key, distribution(observations.map(item => item[key]))])) };
}
