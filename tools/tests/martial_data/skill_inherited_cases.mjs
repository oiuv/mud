// Prepared observations of inherited defaults, not proof that 20 gameplay systems work.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const mapping = value => assert.ok(value && typeof value === 'object' && !Array.isArray(value));
const zero = value => value === 0 || value === null;
const owner = '/inherit/skill/skill';

export const skillInheritedIds = Object.freeze([
    'axe', 'begging', 'blade', 'checking', 'claw', 'club', 'cuff', 'dagger', 'finger', 'hammer',
    'hand', 'mihun-dafa', 'spear', 'staff', 'stealing', 'strike', 'swimming', 'sword', 'throwing', 'whip',
]);

const sourcePath = id => `kungfu/skill/${id}.${id === 'spear' ? 'lpc' : 'c'}`;
export const skillInheritedSourcePaths = Object.freeze([
    ...skillInheritedIds.map(sourcePath),
    'include/globals.h', 'include/skill.h', 'inherit/skill/skill.c', 'feature/clean_up.c',
    'clone/user/user.c', 'inherit/char/char.c', 'feature/skill.c', 'feature/action.c',
    'feature/attack.c', 'feature/attribute.c', 'feature/damage.c', 'feature/condition.c',
    'feature/dbase.c', 'feature/equip.c', 'feature/name.c', 'feature/move.c',
    'mudcore/inherit/action.c', 'mudcore/inherit/dbase.c', 'adm/single/simul_efun/message.c',
]);
export const skillInheritedReviewed = '8bd73eb8146aa4575a83bab909d6159dec66c664e0e1d0aa5df59e4053946b0e';
export const skillInheritedInterfaces = Object.freeze({
    valid_learn: 1, type: 'martial', valid_learn_level: 200,
});
export const skillInheritedFixtureRequirements = Object.freeze([
    'Use only the 20 exact child objects and three actual inherited interfaces. Reuse two connected ordinary USERs and the original test_interface command; no direct-call replacement of the measured command.',
    'Each interface record must include the actual function_exists owner /inherit/skill/skill, exact result and original command execution cost. Missing functions returning zero cannot pass as an implemented interface.',
    'The file entry_id is the existing child file entry: there is no invented local function. Freeze all 39 source/dependency bytes and this module/test in a new series before sampling.',
    'Pure queries must not change visible resources, skills, mappings, temporary state, equipment or the second USER. No combat, natural heartbeat, callback, active effect or random manipulation is requested.',
    'This batch covers default valid_learn/type/valid_learn_level only. valid_research and command-driven begging/stealing/swimming or combat effects remain untested here; absent local functions do not make those gameplay paths complete.',
]);

const properties = Object.freeze({
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jingli: 1000,
    str: 36, int: 36, con: 36, dex: 36, gender: '男性',
    jiali: 0, combat_exp: 100000000,
});

export function skillInheritedConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean');
    assert.equal(typeof readSource, 'function');
    assert.ok(Array.isArray(catalog?.skills));
    const pure = catalog.skills.filter(skill => skill.top_level && skill.entries.length === 0);
    assert.deepEqual(pure.map(skill => skill.id).sort(), [...skillInheritedIds].sort(),
        '纯继承分母变化，须重新核对而非自动扩展');
    const bytes = new Map(skillInheritedSourcePaths.map(path => {
        const content = readSource(path);
        assert.ok((typeof content === 'string' || Buffer.isBuffer(content)) && content.length > 0, path);
        return [path, content];
    }));
    const evidence = Object.fromEntries([...bytes].map(([path, content]) => [path, hash(content)]));
    assert.equal(hash(JSON.stringify(skillInheritedSourcePaths.map(path => [path, evidence[path]]))),
        skillInheritedReviewed, '继承/USER来源改变，须重新审查');
    assert.match(bytes.get('include/globals.h').toString(),
        /^#define\s+SKILL\s+"\/inherit\/skill\/skill"\s*$/m);
    const cases = [];
    for (const id of skillInheritedIds) {
        const source = pure.find(skill => skill.id === id), path = sourcePath(id);
        assert.equal(source.path, path);
        assert.equal(source.sha256, evidence[path], '子文件与目录快照不一致');
        assert.deepEqual(source.entries, []);
        assert.equal(source.inherits.length, 1);
        assert.equal(source.inherits[0].literal, null);
        assert.equal(source.inherits[0].evidence.text.trim(), 'inherit SKILL;');
        const tokens = tokenize(bytes.get(path).toString()).filter(token =>
            !['comment', 'whitespace'].includes(token.kind)).map(token => token.text);
        assert.deepEqual(tokens, ['inherit', 'SKILL', ';'], '只能是无本地行为的继承声明');
        for (const [fn, result] of Object.entries(skillInheritedInterfaces)) {
            cases.push({
                id: `skill-inherited-${id}-${fn.replaceAll('_', '-')}`,
                stage: 'skill', entry_id: path, method: 'interface', samples: smoke ? 1 : 2,
                status: 'prepared_not_sampled',
                parameters: {
                    collection_group: 'public-inherited', skill: id,
                    actor: { skills: { [id]: 200 }, mappings: {}, preparations: {}, properties: { ...properties } },
                    target: { skills: {}, mappings: {}, preparations: {}, properties: { ...properties } },
                    interface: { object: `/kungfu/skill/${id}`, function: fn },
                    action: 'test_interface', fighting: false, observe_seconds: 0,
                    observation: 'single_action_immediate', not_applicable: '', expected: 'observed',
                    expected_result: result, expected_implementation: owner,
                    qualification_sources: [...skillInheritedSourcePaths], source_evidence: { ...evidence },
                    note: '只核验原USER命令取得的公共继承默认接口；不证明师承、自然养成、乞讨/偷窃/泳技玩法或兵器战斗效果完成。',
                },
            });
        }
    }
    assert.equal(cases.length, 60);
    return cases;
}

export function validateSkillInheritedRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(condition.stage, 'skill');
    assert.equal(condition.method, 'interface');
    assert.equal(p.collection_group, 'public-inherited');
    assert.ok(skillInheritedIds.includes(p.skill));
    assert.equal(condition.entry_id, sourcePath(p.skill));
    assert.equal(p.action, 'test_interface');
    assert.equal(p.fighting, false);
    assert.equal(p.observe_seconds, 0);
    assert.deepEqual(p.actor, { skills: { [p.skill]: 200 }, mappings: {}, preparations: {},
        properties: { ...properties } });
    assert.deepEqual(p.target, { skills: {}, mappings: {}, preparations: {}, properties: { ...properties } });
    assert.equal(p.interface.object, `/kungfu/skill/${p.skill}`);
    assert.ok(Object.hasOwn(skillInheritedInterfaces, p.interface.function), '接口不在三项明确范围');
    const expected = skillInheritedInterfaces[p.interface.function];
    assert.equal(p.expected_result, expected);
    assert.equal(p.expected_implementation, owner);
    assert.deepEqual(p.qualification_sources, [...skillInheritedSourcePaths]);
    assert.deepEqual(Object.keys(p.source_evidence), [...skillInheritedSourcePaths]);
    for (const value of Object.values(p.source_evidence)) assert.match(value, /^[a-f0-9]{64}$/);
    assert.equal(hash(JSON.stringify(skillInheritedSourcePaths.map(path => [path, p.source_evidence[path]]))),
        skillInheritedReviewed, '冻结来源被改写');
    assert.equal(raw.kind, 'sample');
    assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, 'interface');
    assert.equal(raw.outcome, 'observed');
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted > 0,
        '必须经原USER命令实际执行');
    assert.deepEqual(raw.interfaces, [{ ...p.interface, result: expected, implemented_by: owner }],
        '实际返回和真实继承来源必须同时核验');
    assert.ok(Array.isArray(raw.before) && raw.before.length === 2);
    for (const [side, state] of raw.before.entries()) {
        mapping(state);
        for (const flag of ['userp', 'playerp', 'interactive', 'living']) assert.equal(state[flag], 1);
        for (const flag of ['wizardp', 'ghost', 'busy']) assert.ok(zero(state[flag]));
        assert.ok(typeof state.object === 'string' && state.object.length > 0);
        assert.equal(state.weapon, 'none');
        assert.equal(state.handing, 'none');
        assert.deepEqual(state.skills, side === 0 ? { [p.skill]: 200 } : {});
        assert.deepEqual(state.mappings, {});
        assert.deepEqual(state.preparations, {});
        for (const [key, value] of Object.entries(properties)) assert.equal(state[key], value, key);
    }
    assert.notEqual(raw.before[0].object, raw.before[1].object);
    assert.deepEqual(raw.immediate, raw.before, '查询不得改变状态');
    assert.deepEqual(raw.after, raw.before, '查询后不得替换原USER或恢复资源');
    assert.ok(Array.isArray(raw.metrics) && raw.metrics.length === 2);
    for (const metrics of raw.metrics) {
        mapping(metrics);
        for (const value of Object.values(metrics)) assert.equal(value, 0, '零净差不能掩盖毛扣费或攻击');
    }
    for (const name of ['launches', 'attacks', 'defenses', 'passives', 'callbacks', 'terminals', 'dropped'])
        assert.deepEqual(raw[name], []);
    return { skill: p.skill, function: p.interface.function, result: expected,
        implemented_by: owner, command_execution_cost: raw.command_accepted,
        scope: 'inherited_defaults_only' };
}
