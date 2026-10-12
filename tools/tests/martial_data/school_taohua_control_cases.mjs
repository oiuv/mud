// Independent finite preparation; not registered and not a real-driver result.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 10000, max_neili: 10000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 34, shen: 0, gender: '男性', character: '光明磊落' };
const abilities = {
    fu: { skill: 'lanhua-shou', usage: 'hand', name: '兰花拂穴', minimum: 120 },
    sui: { skill: 'luoying-shenjian', usage: 'sword', name: '随波逐流', minimum: 80 },
};
const noFunction = '你所使用的外功中没有这种功能。\n';
const terminalPrefix = '\x1b[256D\x1b[K';
const hash = value => createHash('sha256').update(value).digest('hex');

export const taohuaControlSourcePaths = [
    'kungfu/skill/lanhua-shou/fu.c', 'kungfu/skill/lanhua-shou.c',
    'kungfu/skill/luoying-shenjian/sui.c', 'kungfu/skill/luoying-shenjian.c',
    'kungfu/skill/hand.c', 'kungfu/skill/sword.c', 'kungfu/skill/force.c',
    'kungfu/skill/bibo-shengong.c', 'kungfu/skill/jingluo-xue.c',
    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'feature/sserver.c', 'feature/skill.c',
    'feature/action.c', 'mudcore/inherit/action.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c',
    'feature/attack.c', 'feature/attribute.c', 'feature/equip.c', 'feature/name.c',
    'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/misc/equip.c',
    'adm/single/simul_efun/message.c', 'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];

export const taohuaControlFixtureRequirements = [
    'Register only in a later shared window; freeze this module/test, statistics dependencies and all source_evidence in a new series. No old manifest or game source changes.',
    'Reuse original perform hand.fu right / perform sword.sui right on two connected nonwizard USERs. named_participants must use original set_name and present(right) must be the prepared target.',
    'Add only this group to snapshot reads of the corresponding can_perform grant, character, actual fighting_opponent and secondary_weapon/details; retain actual skills, effective skills, preparations, weapon and resource snapshots.',
    'Reuse existing original target start_busy(50) preparation, with explicit 光明磊落 and no zuoyou-hubo. Reset counters only after preparation. Do not clear target busy or refill neili in the command window.',
    'Reuse original launch/refusal and resource counters; no new probe or direct-damage callback. Preserve temp.notify_fail including color and line ending and its relation to the actual query_notify_fail reason.',
    'Only single_action_immediate is in scope. Keep the existing non-bout heartbeat suppression, original random/start_busy and actual integer busy values; no natural release or seconds inference.',
    'Report taohuaControlEffects(rows, frozenCondition), never raw.parameters. Accepted attempts, refusals, acquired control, pre-existing target busy and original remaining negative neili have separate denominators.',
];

export function taohuaControlConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0, '样本数须为正整数');
    assert.equal(typeof readSource, 'function', '须冻结实际来源字节');
    const evidence = Object.fromEntries(taohuaControlSourcePaths.map(path => {
        const source = readSource(path);
        assert.ok((typeof source === 'string' || Buffer.isBuffer(source)) && source.length > 0, path);
        return [path, hash(source)];
    }));
    const result = [];
    for (const [ability, definition] of Object.entries(abilities)) {
        const { skill, usage, name, minimum } = definition;
        const grant = `can_perform/${skill}/${ability}`;
        const source = catalog.skills.find(item => item.id === `${skill}/${ability}`);
        const base = catalog.skills.find(item => item.id === skill);
        for (const [item, path] of [[source, `kungfu/skill/${skill}/${ability}.c`], [base, `kungfu/skill/${skill}.c`]]) {
            assert.equal(item?.path, path, '原武学来源');
            assert.equal(item.sha256, evidence[path], '目录与当前字节不同');
        }
        const entry = source.entries.find(item => item.role === 'perform')?.id;
        assert.ok(typeof entry === 'string' && entry.startsWith(source.path + ':'), '原 perform 入口');
        assert.match(entry.slice(source.path.length), /^:\d+:perform$/);
        function add(tag, level = 200, extra = {}) {
            const armed = extra.weapon ?? ability === 'sui';
            const actor = { skills: { [usage]: level, [skill]: level,
                ...(ability === 'fu' ? { 'jingluo-xue': 200 } : {}),
                force: 200, 'bibo-shengong': 200, ...extra.skills },
            mappings: { [usage]: skill, force: 'bibo-shengong' },
            preparations: ability === 'fu' && !extra.noPrepare ? { hand: skill } : {},
            properties: { ...defaults, neili: 800, max_neili: 3000, 'family/family_name': '桃花岛',
                [grant]: 1, ...extra.properties },
            ...(armed ? { equipment: { type: 'sword', hold: false } } : {}) };
            const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200,
                ...extra.targetSkills }, mappings: {}, preparations: {}, properties: { ...defaults },
            equipment: { type: 'sword', hold: false }, ...(extra.targetBusy ? { busy: extra.targetBusy } : {}) };
            result.push({ id: `school-taohua-control-${ability}-l${level}-${tag}`, stage: 'school',
                entry_id: entry, method: 'perform', samples: smoke ? 2 : extra.checks ?? samples,
                parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-control',
                    skill, ability, usage, level, variant: tag, actor, target, named_participants: true,
                    fighting: true, target_state: 'living', action: `perform ${usage}.${ability} right`,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed', not_applicable: '',
                    refusal: extra.refusal ?? '', refusal_scope: extra.refusal ? 'ability' : '',
                    gate_expectation: extra.gate ?? 'random', source_evidence: { ...evidence },
                    ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: '真实非巫师USER与原显式目标命令；技能、领悟仅为实验初态，不代表教学或养成成本。'
                        + '仅即时纯控制，受理和命中分账；原忙乱整数不当秒数，不观察自然解忙。'
                        + '原随机、费用和负内力原样保留；不补款、不改游戏。',
                } });
        }
        for (const level of [200, 400, 800]) add('baseline', level);
        add('guaranteed-hit', 200, { targetSkills: { parry: ability === 'fu' ? 598 : 298 }, gate: 'hit' });
        add('guaranteed-miss', 200, { targetSkills: { parry: ability === 'fu' ? 1796 : 898 }, gate: 'miss', checks: 2 });
        add('minimum', minimum, { skills: ability === 'fu' ? { 'jingluo-xue': 120 } : { force: 100, 'bibo-shengong': 50 },
            properties: { neili: 100 }, targetSkills: { parry: ability === 'fu' ? 356 : 118 }, gate: 'hit' });
        if (ability === 'sui') for (const neili of [100, 180])
            add(`miss-neili${neili}`, 200, { properties: { neili }, targetSkills: { parry: 898 }, gate: 'miss', checks: 2 });
        const refuse = (tag, refusal, extra = {}) => add(tag, 200, { ...extra, refusal, checks: 2 });
        refuse('no-grant', noFunction, { properties: { [grant]: 0 } });
        refuse('target-busy50', '右试弟子目前正自顾不暇，放胆攻击吧。\n', { targetBusy: 50 });
        refuse('wrong-weapon', ability === 'fu' ? '「兰花拂穴」只能空手施展。\n'
            : '你使用的武器不对，难以施展「随波逐流」。\n', { weapon: ability === 'fu' });
        refuse(`skill${minimum - 1}`, ability === 'fu' ? '你兰花拂穴手不够娴熟，难以施展「兰花拂穴」。\n'
            : '你落英神剑不够娴熟，难以施展「随波逐流」。\n', { skills: { [skill]: minimum - 1 } });
        if (ability === 'fu') {
            refuse('jingluo119', '你对经络学的了解不够，难以施展「兰花拂穴」。\n', { skills: { 'jingluo-xue': 119 } });
            refuse('no-prepare', '你没有准备兰花拂穴手，难以施展「兰花拂穴」。\n', { noPrepare: true });
        } else refuse('force99', '你的内功火候不足，难以施展「随波逐流」。\n', { skills: { force: 98, 'bibo-shengong': 50 } });
        refuse('neili99', ability === 'fu' ? `你现在真气不足，难以施展「${name}」。\n`
            : `你现在的真气不足，难以施展「${name}」。\n`, { properties: { neili: 99 } });
    }
    return result;
}

function mapping(value, label) {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value), label); return value;
}
function integer(value, label) { assert.ok(Number.isSafeInteger(value), label); return value; }
function field(object, key) { assert.ok(Object.hasOwn(object, key), '缺少 ' + key); return object[key]; }
function busy(state) {
    const value = field(state, 'busy');
    assert.ok(value === null || (Number.isSafeInteger(value) && value >= 0), '原忙乱');
    return value === null ? 0 : value;
}
function sparse(values, key) {
    mapping(values, '缺少原映射'); return integer(Object.hasOwn(values, key) ? values[key] : 0, key);
}
function counter(metrics, key) {
    const value = sparse(metrics, key); assert.ok(value >= 0, '负计数 ' + key); return value;
}
function initial(state, config, side, p) {
    assert.match(state?.object ?? '', /^\/tests\/actor#\d+$/);
    assert.equal(state.id, side ? 'right' : 'left');
    for (const key of ['userp', 'playerp', 'interactive', 'living', 'fighting_opponent']) assert.equal(state[key], 1, key);
    for (const key of ['wizardp', 'ghost']) assert.equal(state[key], 0, key);
    assert.equal(busy(state), config.busy ?? 0);
    assert.deepEqual(state.skills, config.skills); assert.deepEqual(state.mappings, config.mappings);
    assert.deepEqual(state.preparations, config.preparations); assert.deepEqual(state.learned, {});
    const temp = mapping(state.temp, '实际临时数据'), apply = mapping(temp.apply, '实际属性加成');
    // These explicit initial states do not grant temporary combat effects or busy reduction.
    for (const key of ['no_perform', 'no_exert', 'str', 'debuff']) if (Object.hasOwn(temp, key))
        assert.ok(temp[key] === null || temp[key] === 0, '非实验临时初态 ' + key);
    const expectedApply = { armor: 100, ...(config.equipment ? { damage: 50, dodge: -1 } : {}) };
    for (const key of new Set([...Object.keys(apply), ...Object.keys(expectedApply)]))
        assert.equal(sparse(apply, key), expectedApply[key] ?? 0, '原属性 ' + key);
    const effective = mapping(state.effective_skills, '实际有效等级');
    for (const [key, value] of Object.entries(config.skills))
        assert.equal(effective[key], Math.trunc(value / 2) + (config.skills[config.mappings[key]] ?? 0)
            + sparse(apply, key), '有效 ' + key);
    const unarmed = Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => config.skills[k] ?? 0));
    assert.equal(state.effective_str, config.properties.str + Math.trunc(unarmed / 10));
    assert.equal(state.effective_con, config.properties.con + Math.trunc(config.skills.force / 10));
    for (const [key, value] of Object.entries(config.properties)) {
        const current = key.includes('/') || key === 'character'
            ? field(mapping(state.cultivation, '实际资格'), key) : field(state, key);
        if (key === `can_perform/${p.skill}/${p.ability}` && value === 0) assert.ok(current === 0 || current === null);
        else assert.equal(current, value, key);
    }
    assert.equal(state.weapon, config.equipment ? 'sword' : 'none');
    assert.equal(state.weapon_damage, config.equipment ? 50 : 0);
    assert.equal(state.weapon_flag, config.equipment ? 4 : 0);
    assert.equal(state.secondary_weapon, 'none'); assert.deepEqual(state.secondary_weapon_details, {});
    assert.equal(state.handing, 'none'); assert.deepEqual(state.handing_details, {});
    const weapon = mapping(state.weapon_details, '实际武器');
    if (!config.equipment) assert.deepEqual(weapon, {});
    else {
        assert.equal(weapon.program, '/tests/sword'); assert.match(weapon.object, /^\/tests\/sword#\d+$/);
        for (const [key, value] of Object.entries({ skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100 }))
            assert.equal(weapon[key], value, key);
    }
}
function unchangedPart(state) {
    const copy = structuredClone(state);
    for (const key of ['busy', 'neili', 'learned']) delete copy[key];
    delete copy.temp.notify_fail;
    return copy;
}

export function validateTaohuaControlRecord(raw, condition) {
    const p = condition.parameters, definition = abilities[p.ability];
    assert.equal(p.collection_group, 'taohua-control'); assert.ok(definition);
    assert.equal(p.skill, definition.skill); assert.equal(p.usage, definition.usage);
    assert.equal(p.action, `perform ${p.usage}.${p.ability} right`);
    assert.equal(p.named_participants, true); assert.equal(p.fighting, true); assert.equal(p.target_state, 'living');
    assert.equal(condition.method, 'perform'); assert.equal(raw.method, 'perform');
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, condition.id);
    assert.ok(['observed', 'refused'].includes(p.expected)); assert.equal(raw.outcome, p.expected);
    assert.equal(p.observe_seconds, 0); assert.equal(p.observation, 'single_action_immediate');
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.ok(Array.isArray(raw[key]) && raw[key].length === 2, key);
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'dropped', 'terminals', 'callbacks'])
        assert.deepEqual(raw[key], [], '纯控制无 ' + key);
    for (const key of ['actions', 'directs']) if (Object.hasOwn(raw, key)) assert.deepEqual(raw[key], []);
    assert.deepEqual(raw.after, raw.immediate, '即时窗口不能混入自然心跳');
    const [before, target] = raw.before, [after, end] = raw.immediate;
    assert.notEqual(before.object, target.object);
    const accepted = p.expected === 'observed';
    assert.ok(Object.hasOwn(raw, 'command_accepted'), '缺少原命令执行成本');
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted >= 0,
        '原命令执行成本必须是非负安全整数');
    assert.equal(raw.command_accepted > 0, accepted, '命令受理按正成本判定，拒绝必须为零');
    for (const side of [0, 1]) {
        initial(raw.before[side], side ? p.target : p.actor, side, p);
        mapping(raw.immediate[side].temp, '实际结束临时数据');
        assert.deepEqual(unchangedPart(raw.immediate[side]), unchangedPart(raw.before[side]), '无关状态不得变化');
        for (const key of ['hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats'])
            assert.equal(counter(raw.metrics[side], key), 0, key);
        assert.equal(counter(raw.metrics[side], 'ability_launched'), side ? 0 : Number(accepted));
    }
    if (accepted) {
        assert.deepEqual(raw.launches, [{ actor: before.object, skill: p.skill, argument: `${p.ability} right` }]);
        assert.deepEqual(raw.refusals, []); assert.equal(raw.reason, '');
        assert.equal(after.temp.notify_fail, noFunction, '成功入口也保留原默认提示');
    } else {
        assert.deepEqual(raw.launches, []);
        assert.equal(typeof raw.reason, 'string');
        assert.equal(raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''), p.refusal, '原拒绝正文');
        assert.deepEqual(raw.refusals, [{ actor: before.object, reason: raw.reason }]);
        assert.equal(after.temp.notify_fail, raw.reason.startsWith(terminalPrefix)
            ? raw.reason.slice(terminalPrefix.length) : raw.reason, '原提示/终端理由同源');
    }
    assert.deepEqual(Object.hasOwn(end.temp, 'notify_fail') ? end.temp.notify_fail : undefined,
        Object.hasOwn(target.temp, 'notify_fail') ? target.temp.notify_fail : undefined);
    const ap = before.effective_skills[p.usage];
    const dp = p.ability === 'fu' ? Math.trunc(target.effective_skills.parry / 2) : target.effective_skills.parry;
    const acquired = accepted ? busy(end) > busy(target) : null;
    let cost = 0, actorBusy = busy(before), targetBusy = busy(target);
    if (accepted) {
        assert.equal(busy(target), 0, '已有忙乱应被原技能拒绝');
        if (Math.trunc(ap / 2) > dp) assert.equal(acquired, true, '原比较必命中');
        if (Math.trunc(ap / 2) + ap - 1 <= dp) assert.equal(acquired, false, '原比较必失手');
        if (p.gate_expectation !== 'random') assert.equal(acquired ? 'hit' : 'miss', p.gate_expectation);
        if (p.ability === 'fu') {
            cost = acquired ? 100 : 0; actorBusy = acquired ? 1 : 2;
            targetBusy = acquired ? Math.trunc(ap / 30) + 2 : 0;
        } else {
            cost = acquired ? 80 : 180; actorBusy = acquired ? 0 : 1;
            targetBusy = acquired ? Math.trunc(before.skills[p.skill] / 22) + 1 : 0;
        }
    }
    assert.equal(busy(after), actorBusy, '施术者原忙乱');
    assert.equal(busy(end), targetBusy, '目标原忙乱，未换算秒数');
    for (const side of [0, 1]) for (const key of health) {
        const paid = !side && key === 'neili' ? cost : 0;
        assert.equal(counter(raw.metrics[side], key + '_cost'), paid, '原毛扣 ' + key);
        assert.equal(counter(raw.metrics[side], key + '_recovery'), 0, '不得补款 ' + key);
        assert.equal(raw.immediate[side][key], raw.before[side][key] - paid, '原资源闭合 ' + key);
        integer(raw.immediate[side][key], key);
    }
    const learned = mapping(after.learned, '结束熟练');
    assert.ok(Object.keys(learned).every(key => key === p.skill), '只有原招式技能熟练增长');
    const progress = sparse(learned, p.skill);
    if (!accepted) assert.deepEqual(learned, before.learned);
    else if (before.effective_skills[p.skill] >= 120) assert.equal(progress, 1);
    else assert.ok([0, 1].includes(progress), '原弱熟练只能0/1');
    assert.deepEqual(end.learned, target.learned);
    return { accepted, acquired, ap, dp, actor_busy: actorBusy, target_busy_before: busy(target),
        target_busy_after: targetBusy, target_busy_gain: targetBusy - busy(target), actor_neili_cost: cost,
        actor_neili_remaining: after.neili, negative_neili: after.neili < 0, learned_delta: progress };
}

export function taohuaControlEffects(rows, condition) {
    assert.equal(condition.parameters.collection_group, 'taohua-control');
    const known = [], counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.method, condition.method); assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        if (row.outcome === 'error') continue;
        known.push(validateTaohuaControlRecord(row.raw, condition));
    }
    const accepted = known.filter(item => item.accepted), controlled = accepted.filter(item => item.acquired);
    return { samples: rows.length, counts, known_command_samples: known.length, accepted_samples: accepted.length,
        refused_samples: counts.refused, unknown_effect_samples: counts.error,
        acceptance: probability(accepted.length, known.length), refusal: probability(counts.refused, known.length),
        control_given_accepted: probability(controlled.length, accepted.length),
        control_per_known_command: probability(controlled.length, known.length),
        accepted_misses: accepted.length - controlled.length,
        target_busy_initial: distribution(known.map(item => item.target_busy_before)),
        target_busy_final: distribution(known.map(item => item.target_busy_after)),
        acquired_busy: distribution(controlled.map(item => item.target_busy_gain)),
        negative_neili: probability(accepted.filter(item => item.negative_neili).length, accepted.length),
        learned_progress: probability(accepted.filter(item => item.learned_delta > 0).length, accepted.length),
        ...Object.fromEntries(['ap', 'dp', 'actor_busy', 'actor_neili_cost', 'actor_neili_remaining', 'learned_delta']
            .map(key => [key, distribution(accepted.map(item => item[key]))])) };
}
