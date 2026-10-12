// Offline preparation only: original prepare commands followed by one original fight round.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateWudangCombinationRecord } from './school_wudang_combination_cases.mjs';
import { wudangCombinationEffects } from './school_combat_report.mjs';
import { distribution } from '../weapon_balance/statistics.mjs';

export const taohuaCombinationSkills = {
    'xuanfeng-tui': 'unarmed', 'pikong-zhang': 'strike',
    'lanhua-shou': 'hand', 'luoying-shenzhang': 'strike',
};
export const taohuaCombinationPairs = [
    ['xuanfeng-tui', 'pikong-zhang'], ['lanhua-shou', 'luoying-shenzhang'],
];
// Original static action attack/dodge/parry triples; level 400 unlocks every table row,
// but NewRandom only selects from the last min(6, table.length) unlocked rows.
// This checks the already observed final fight mapping, not a second query_action call.
export const taohuaCombinationFightValues = {
    'xuanfeng-tui': [[10, 45, 45], [20, 50, 50], [30, 55, 55], [35, 60, 60],
        [35, 70, 70], [40, 90, 90], [40, 100, 100], [45, 115, 115]],
    'pikong-zhang': [[18, 30, 15], [25, 40, 30], [35, 50, 55], [42, 40, 65]],
    'lanhua-shou': [15, 20, 25, 25, 30, 35, 40, 45].map(dodge => [null, dodge, null]),
    'luoying-shenzhang': [[12, 4, 5], [14, 7, 8], [17, 10, 13], [22, 17, 15],
        [29, 20, 25], [33, 13, 16], [38, 30, 25], [44, 34, 26],
        [52, 43, 45], [72, 41, 55], [79, 36, 61], [84, 41, 65]],
};
export const taohuaCombinationSourcePaths = [
    ...Object.keys(taohuaCombinationSkills).map(s => `kungfu/skill/${s}.c`),
    ...['unarmed', 'hand', 'strike', 'parry', 'dodge', 'force'].map(s => `kungfu/skill/${s}.c`),
    'cmds/skill/prepare.c', 'feature/skill.c', 'feature/attack.c', 'feature/attribute.c',
    'feature/action.c', 'mudcore/inherit/action.c', 'feature/damage.c', 'feature/equip.c',
    'feature/dbase.c', 'mudcore/inherit/dbase.c', 'inherit/skill/skill.c',
    'clone/user/user.c', 'inherit/char/char.c', 'adm/daemons/combatd.c',
    'include/globals.h', 'include/combat.h',
];
export const taohuaCombinationFixtureRequirements = [
    'Unregistered, real samples zero. Append this independent module only in a new unlocked collector version; preserve all old ordered conditions.',
    'Reuse the existing original prepare sequence / COMBAT_D->fight dispatcher; add only taohua-combination to its group allowlist. Never prefill preparations, action_flag or guarding.',
    'Reuse snapshot preparation_order/effective_dex, character and secondary weapon fields through narrow group allowlists; preserve the actual mapping keys order, not the command argument order.',
    'Reuse observe_attack attack_usage/attack_skill/action_flag allowlist. No new probe, selected-action capture, callback, RNG replacement, repeated fight call or natural heartbeat window.',
    'Both original pair directions accept the original special names. Read every actual prepare step and its return; the same prepared pair does not imply two actual attacks.',
    'At these fixed values actor effective_str=76 > random(72), so guarding is unreachable. Target has no guarding flag and never takes an initial round, so retaliation is also unreachable; reject fabricated records instead of forcing either branch.',
    'Reuse validateWudangCombinationRecord and wudangCombinationEffects; report this group separately with taohuaCombinationEffects(rows, frozenCondition), never raw.parameters.',
    'Freeze this module/test, school_combat_report.mjs, school_wudang_combination_cases.mjs and weapon_balance/statistics.mjs in new source manifests. Four source action tables are static; no cold-load identity workaround or reload per sample.',
];
const hash = value => createHash('sha256').update(value).digest('hex');
const defaults = { str: 36, dex: 36, int: 30, con: 30, age: 25, gender: '男性',
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 6000, max_neili: 6000, combat_exp: 10000000, potential: 10000,
    jiali: 0, character: '光明磊落' };
const preparation = names => Object.fromEntries(names.map(s => [taohuaCombinationSkills[s], s]));

export function taohuaCombinationConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof readSource, 'function');
    const source_evidence = Object.fromEntries(taohuaCombinationSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    for (const skill of Object.keys(taohuaCombinationSkills)) {
        const source = catalog.skills.find(s => s.id === skill), path = `kungfu/skill/${skill}.c`;
        assert.equal(source?.path, path); assert.equal(source.sha256, source_evidence[path]);
    }
    const result = [];
    for (const pair of taohuaCombinationPairs) {
        const actor = { skills: { ...Object.fromEntries(pair.map(s => [s, 400])),
            ...Object.fromEntries(pair.map(s => [taohuaCombinationSkills[s], 400])),
            force: 600, parry: 400, dodge: 600 },
        mappings: { ...preparation(pair), parry: pair[0] }, preparations: {},
        properties: { ...defaults, 'family/family_name': '桃花岛' } };
        const target = { skills: { unarmed: 600, force: 600, dodge: 600, parry: 600 },
            mappings: {}, preparations: {}, properties: { ...defaults } };
        function add(method, names, variant) {
            const source = catalog.skills.find(s => s.id === names[0]);
            result.push({ id: `school-taohua-combination-${names.join('-')}-${variant}-l400`,
                stage: 'school', entry_id: source.path, method, samples: smoke ? 1 : method === 'prepare' ? 2 : 100,
                parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-combination',
                    skill: names[0], level: 400, ability: method, combination: variant, pair: [...pair],
                    actor: structuredClone(actor), target: structuredClone(target),
                    prepare_commands: [{ action: `prepare ${names.join(' ')}`, accepted: 1,
                        preparations: preparation(names) }],
                    action: method === 'round' ? 'fight_round' : 'prepare_sequence',
                    observation: 'single_action_immediate', observe_seconds: 0,
                    fighting: method === 'round', expected: 'observed', not_applicable: '',
                    source_evidence: { ...source_evidence }, qualification_sources: [...taohuaCombinationSourcePaths],
                    qualification_note: '真实非巫师USER，400级技能为合法实验初态，不代表拜师或学习成本。'
                        + '原名称prepare命令，空准备起步；单备与双备使用同一组实际技能/映射/资源。'
                        + '基本内功600不映射特殊内功，加力0，无经络学、绝招标记或目标守势初始化。'
                        + '只调用一次原fight并读取实际keys、出手与资源；不保证双击，不代表完整交锋。',
                } });
        }
        for (const names of [pair, [...pair].reverse()]) add('prepare', names, 'pair-prepare');
        for (const skill of pair) add('round', [skill], 'solo-round');
        for (const names of [pair, [...pair].reverse()]) add('round', names, 'pair-round');
    }
    return result;
}

function map(value, name) { assert.ok(value && typeof value === 'object' && !Array.isArray(value), name); return value; }
function field(value, key) { assert.ok(Object.hasOwn(value, key), `缺少 ${key}`); return value[key]; }
function integer(value, name) { assert.ok(Number.isSafeInteger(value), name); return value; }
function falseValue(value, name) { assert.ok(value === null || value === 0, name); }
function count(metrics, key) {
    const n = Object.hasOwn(metrics, key) ? integer(metrics[key], key) : 0;
    assert.ok(n >= 0, key); return n;
}
function order(state) {
    map(field(state, 'preparations'), 'preparations');
    assert.ok(Array.isArray(field(state, 'preparation_order')), 'preparation_order');
    assert.deepEqual([...state.preparation_order].sort(), Object.keys(state.preparations).sort(), '实际keys完整且无重复');
}
function initial(state, cfg, side) {
    map(state, 'USER state');
    assert.match(field(state, 'object'), /^\/tests\/actor#\d+$/); assert.equal(state.id, side ? 'right' : 'left');
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(field(state, key), 1, key);
    for (const key of ['wizardp', 'ghost']) assert.equal(field(state, key), 0, key);
    falseValue(field(state, 'busy'), 'initial busy');
    map(state.cultivation, 'cultivation'); map(state.temp, 'temp');
    assert.deepEqual(map(field(state.temp, 'apply'), 'initial apply'), { armor: 100 }, '本组初始apply仅含原夹具护甲100');
    for (const [key, value] of Object.entries(cfg.properties))
        assert.equal(key.includes('/') || key === 'character' ? field(state.cultivation, key) : field(state, key), value, key);
    assert.deepEqual(state.skills, cfg.skills); assert.deepEqual(state.mappings, cfg.mappings);
    assert.deepEqual(state.preparations, {}); order(state); assert.deepEqual(state.learned, {});
    assert.equal(cfg.mappings.force, undefined); assert.equal(cfg.skills['jingluo-xue'], undefined);
    map(state.effective_skills, 'effective_skills');
    for (const [skill, level] of Object.entries(cfg.skills))
        assert.equal(field(state.effective_skills, skill), Math.trunc(level / 2) + (cfg.skills[cfg.mappings[skill]] ?? 0), skill);
    const highest = Math.max(0, ...['unarmed', 'hand', 'finger', 'strike', 'cuff', 'claw'].map(k => cfg.skills[k] ?? 0));
    assert.equal(state.effective_str, cfg.properties.str + Math.trunc(highest / 10));
    assert.equal(state.effective_dex, cfg.properties.dex + Math.trunc(cfg.skills.dodge / 10));
    assert.equal(state.effective_con, cfg.properties.con + Math.trunc(cfg.skills.force / 10));
    for (const key of ['weapon', 'secondary_weapon', 'handing']) assert.equal(field(state, key), 'none');
    for (const key of ['weapon_details', 'secondary_weapon_details', 'handing_details']) assert.deepEqual(field(state, key), {});
    assert.equal(field(state, 'weapon_damage'), 0); assert.equal(field(state, 'weapon_flag'), 0);
    for (const key of ['action_flag', 'guarding', 'combat_time', 'fight']) assert.equal(Object.hasOwn(state.temp, key), false, key);
    const condition = field(state, 'conditions');
    assert.ok(condition === null || condition === 0 || (typeof condition === 'object' && !Array.isArray(condition)
        && Object.keys(condition).length === 0), 'no initial condition');
}

export function validateTaohuaCombinationRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'taohua'); assert.equal(p.collection_group, 'taohua-combination');
    assert.equal(raw.kind, 'sample'); assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, condition.method);
    assert.ok(['prepare', 'round'].includes(condition.method)); assert.equal(p.expected, 'observed');
    assert.equal(p.observe_seconds, 0); assert.equal(p.actor.properties.jiali, 0); assert.equal(p.target.properties.jiali, 0);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['prepare_steps', 'attacks', 'interfaces', 'launches', 'callbacks', 'terminals', 'dropped'])
        assert.ok(Array.isArray(raw[key]), key);
    for (const key of ['interfaces', 'launches', 'callbacks', 'terminals', 'dropped']) assert.deepEqual(raw[key], [], key);
    assert.equal(raw.reason, ''); assert.deepEqual(raw.after, raw.immediate, '无延迟或自然心跳窗口');
    assert.notEqual(raw.before[0].object, raw.before[1].object);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) initial(raw.before[side], cfg, side);
    // force_me returns the original command evaluation cost, not the command's boolean.
    // The legacy validator receives a disposable boolean view; the source record stays intact.
    const preparedView = { ...raw, prepare_steps: raw.prepare_steps.map(step => {
        const cost = integer(field(step, 'accepted'), '原准备命令成本');
        assert.ok(cost >= 0, '原准备命令成本非负');
        return { ...step, accepted: Number(cost > 0) };
    }) };
    validateWudangCombinationRecord(preparedView, condition);
    for (const state of [...raw.before, ...raw.immediate, ...raw.prepare_steps.flatMap(s => [s.before, s.after])]) order(state);
    for (const step of raw.prepare_steps) assert.equal(step.reason, '', '受理准备不伪造拒绝原因');
    const prepared = raw.prepare_steps.at(-1).after;
    assert.deepEqual(raw.immediate[0].preparation_order, prepared.preparation_order, 'fight不能改变实际keys顺序');
    const attacks = raw.attacks;
    if (condition.method === 'prepare') assert.equal(attacks.length, 0);
    else {
        assert.ok(raw.before[0].effective_str > Math.trunc(raw.before[1].effective_str * 3 / 4) - 1);
        assert.ok(attacks.length >= 1 && attacks.length <= (prepared.preparation_order.length === 2 ? 2 : 1),
            '本组必然进攻，但双备不保证两击');
        assert.equal(raw.immediate[0].temp.guarding, 0);
        for (const [index, attack] of attacks.entries()) {
            assert.equal(attack.actor, 0); assert.equal(attack.target, 1, '初态无目标守势，不可伪造反击');
            assert.equal(attack.type, 0, '非忙乱目标的原普通攻击');
            const usage = prepared.preparation_order[index];
            assert.equal(attack.attack_usage, usage); assert.equal(attack.attack_skill, p.actor.mappings[usage]);
            if (index === 0) falseValue(field(attack, 'action_flag'), 'first action flag');
            else assert.equal(field(attack, 'action_flag'), 1);
            assert.ok([0, -1, -2].includes(attack.result));
            assert.ok(integer(attack.damage, 'actual damage') >= 0);
            if (attack.result !== 0) assert.equal(attack.damage, 0);
        }
        if (attacks.length === 2) assert.equal(raw.immediate[0].temp.action_flag, 0, '原第二击结束恢复标记');
    }
    for (const side of [0, 1]) {
        const before = side === 0 ? prepared : raw.before[1], after = raw.immediate[side];
        const metrics = map(raw.metrics[side], 'metrics'), ownAttacks = side ? [] : attacks;
        for (const [key, code] of [['hit', 0], ['dodge', -1], ['parry', -2]])
            assert.equal(count(metrics, key), ownAttacks.filter(a => a.result === code).length, key);
        for (const key of ['quick', 'riposte', 'direct', 'ability_launched', 'heartbeats']) assert.equal(count(metrics, key), 0, key);
        for (const resource of ['neili', 'qi', 'eff_qi', 'jing', 'eff_jing']) {
            const cost = count(metrics, resource + '_cost'), recovery = count(metrics, resource + '_recovery');
            assert.equal(recovery, 0, '无恢复：' + resource);
            assert.equal(integer(before[resource], resource) - integer(after[resource], resource), cost, '资源账：' + resource);
            if (!side || !['qi', 'eff_qi'].includes(resource)) assert.equal(cost, 0, resource);
        }
        assert.equal(count(metrics, 'qi_cost'), side ? attacks.reduce((n, a) => n + a.damage, 0) : 0);
        assert.ok(count(metrics, 'eff_qi_cost') <= count(metrics, 'qi_cost'), '原创伤不能超过本组实际气血损失');
        assert.ok(after.qi > 0 && after.eff_qi > 0, '本组无濒死或终态');
        falseValue(field(after, 'busy'), 'no induced busy');
        const stableBefore = structuredClone(before), stableAfter = structuredClone(after);
        for (const state of [stableBefore, stableAfter]) {
            delete state.qi; delete state.eff_qi;
            if (side === 0 && condition.method === 'round') {
                for (const key of ['guarding', 'action_flag', 'fight']) delete state.temp[key];
            }
        }
        assert.deepEqual(stableAfter, stableBefore, '身份/装备/修为/准备/其他temp均保留');
        if (!side && condition.method === 'round') {
            const fight = map(field(after.temp, 'fight'), '原攻击留下的fight');
            assert.deepEqual(Object.keys(fight).sort(), ['attack', 'dodge', 'parry']);
            for (const key of ['attack', 'dodge', 'parry'])
                assert.ok(fight[key] === null || Number.isSafeInteger(fight[key]), key);
            const values = ['attack', 'dodge', 'parry'].map(k => fight[k] ?? 0);
            assert.ok(taohuaCombinationFightValues[attacks.at(-1).attack_skill].slice(-6)
                .some(v => v.every((n, i) => (n ?? 0) === values[i])), '最后fight来自实际最后武学的原静态表');
            if (attacks.length === 1) assert.equal(Object.hasOwn(after.temp, 'action_flag'), false);
        }
    }
    return { commands: raw.prepare_steps.length, attacks: attacks.length,
        target_qi_loss: count(raw.metrics[1], 'qi_cost'), target_wound: count(raw.metrics[1], 'eff_qi_cost'),
        preparation_order: [...prepared.preparation_order] };
}

export function taohuaCombinationEffects(rows, condition) {
    assert.ok(condition?.parameters?.collection_group === 'taohua-combination', '使用冻结条件');
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        if (row.raw) {
            assert.equal(row.raw.condition_id, condition.id); assert.equal(row.raw.outcome, row.outcome);
        }
        if (row.outcome === 'observed') assert.ok(row.raw, '正常观察必须有原始证据');
    }
    const usable = rows.filter(r => r.outcome === 'observed' && r.raw);
    const facts = usable.map(r => {
        assert.equal(r.condition_id, condition.id); assert.equal(r.raw.outcome, r.outcome);
        return validateTaohuaCombinationRecord(r.raw, condition);
    });
    return { samples: usable.length, unknown_samples: rows.length - usable.length,
        ...wudangCombinationEffects(usable),
        actual_preparation_orders: [...new Set(facts.map(f => JSON.stringify(f.preparation_order)))].map(s => JSON.parse(s)),
        target_qi_loss: distribution(facts.map(f => f.target_qi_loss)),
        target_wound: distribution(facts.map(f => f.target_wound)),
        note: '准备受理、出手轮数和双击分母分开；固定初态守势/反击不可达。无内力消耗不是普遍武学零成本结论。' };
}
