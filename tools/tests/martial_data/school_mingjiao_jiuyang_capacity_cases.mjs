// Fixed source-bound capacity conditions; registry and native observations are separate.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mingjiaoJiuyangExertSourcePaths, mingjiaoJiuyangExertReviewedSourceHash }
    from './school_mingjiao_jiuyang_exert_cases.mjs';

const skill = 'jiuyang-shengong', group = 'mingjiao-jiuyang-capacity';
const copy = value => structuredClone(value);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const mingjiaoJiuyangCapacitySourcePaths = Object.freeze([...mingjiaoJiuyangExertSourcePaths]);
export const mingjiaoJiuyangCapacityReviewedSourceHash = mingjiaoJiuyangExertReviewedSourceHash;
const evidenceHash = evidence => hash(JSON.stringify(
    mingjiaoJiuyangCapacitySourcePaths.map(path => [path, evidence[path]])));

const pool = {
    name: '试侠', gender: '男性', race: '人类', class: '', character: '光明磊落',
    str: 36, int: 40, con: 40, dex: 36, combat_exp: 100000000,
    qi: 1000000, eff_qi: 1000000, max_qi: 1000000,
    jing: 1000000, eff_jing: 1000000, max_jing: 1000000,
    neili: 9000, max_neili: 9000, jingli: 1000, max_jingli: 1000,
    shen: 90000, jiali: 0, potential: 10000, learned_points: 0,
    reborn: 0, breakup: 0, doing: 0, 'family/family_name': '明教',
    'improve/neili': 0, 'special_skill/mystery': 0, 'special_skill/guimai': 0,
    'special_skill/wuxing': 0, 'env/no_learn': 0, 'env/auto_regenerate': 0,
    'can_learn/jiuyang-shengong/enable_weapon': 1,
    'tattoo/tattoo_str': 0, 'tattoo/tattoo_int': 0,
    'tattoo/tattoo_con': 0, 'tattoo/tattoo_dex': 0,
};
function actor(level) {
    return {
        skills: { force: level, [skill]: level, unarmed: level, sword: level,
            parry: 200, dodge: 200, 'martial-cognize': 100 },
        mappings: { force: skill }, preparations: {}, properties: copy(pool),
    };
}

// Source-derived expectations, not observations or a general-purpose growth formula.
function capacityValue(config, ability) {
    const lvl = config.skills[skill];
    const extra = Math.trunc(Math.trunc(lvl * lvl * 15 * 25 / 100) / 200);
    if (ability === 'query_neili_improve') return extra;
    const base = Math.trunc(config.skills.force / 2);
    let value = (base + lvl) * 10 + extra;
    if (ability === 'query_neili_limit' && config.skills['shenghuo-shengong']) {
        const other = config.skills['shenghuo-shengong'];
        const bonus = Math.trunc(Math.trunc(other * other * 15 * 16 / 100) / 200);
        value = Math.max(value, (base + other) * 10 + bonus);
    }
    const p = config.properties;
    value += Math.trunc(value * p['improve/neili'] / 100);
    if (p.breakup) value += Math.trunc(value * 4 / 10);
    if (p['special_skill/mystery']) value += p.con * 15;
    if (p['special_skill/guimai']) value += Math.trunc(value * 3 / 20);
    if (p.class === 'bonze' && ['大轮寺', '少林派', '峨嵋派', '血刀门'].includes(p['family/family_name']))
        value += 500;
    return value;
}
function plans() {
    const out = [];
    const add = (variant, ability, config) => {
        out.push({
            id: `school-mingjiao-capacity-jiuyang-${variant}-${ability.replace('query_', '')}`,
            stage: 'school', method: 'interface',
            parameters: {
                school: 'mingjiao', family: '明教', collection_group: group, variant,
                skill, usage: 'force', ability, level: config.skills[skill],
                actor: copy(config), target: actor(200), named_participants: true,
                fighting: false, room: {}, action: 'test_interface',
                interface: { object: ability === 'query_neili_improve' ? '/kungfu/skill/' + skill : 'player',
                    function: ability },
                observation: 'single_action_immediate', observe_seconds: 0,
                random_effects: false, formal_samples: 2, expected: 'observed', not_applicable: '',
                expected_return: capacityValue(config, ability),
                qualification_sources: [...mingjiaoJiuyangCapacitySourcePaths],
                qualification_note: '只准备真实USER的原容量查询，未接入执行器或实采。预存技能、许可和资源池是实验输入，不证明自然养成、可传授或兼修合法；不调用improve_neili、不改max_neili。当前映射与全部已学最大值分别观察，保留原.c扫描及整数修正顺序。返回预期来自固定源码，不是实测结果。',
            },
        });
    };
    const limits = ['query_current_neili_limit', 'query_neili_limit'];
    for (const level of [200, 400, 800]) {
        for (const ability of ['query_neili_improve', ...limits]) add('level' + level, ability, actor(level));
    }
    for (const [variant, key, value] of [
        ['improve10', 'improve/neili', 10], ['breakup', 'breakup', 1],
        ['mystery', 'special_skill/mystery', 1], ['guimai', 'special_skill/guimai', 1],
    ]) {
        const config = actor(200); config.properties[key] = value;
        for (const ability of limits) add(variant, ability, config);
    }
    for (const family of ['少林派', '明教']) {
        const config = actor(200); config.properties.class = 'bonze';
        config.properties['family/family_name'] = family;
        for (const ability of limits) add(family === '少林派' ? 'bonze-shaolin' : 'bonze-mingjiao', ability, config);
    }
    const mixed = actor(200); mixed.skills['shenghuo-shengong'] = 1000;
    for (const ability of limits) add('owned-force1000', ability, mixed);
    assert.equal(out.length, 23); assert.equal(new Set(out.map(c => c.id)).size, out.length);
    return out;
}

export function mingjiaoJiuyangCapacityConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(mingjiaoJiuyangCapacitySourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length > 0);
        return [path, hash(bytes)];
    }));
    assert.equal(evidenceHash(evidence), mingjiaoJiuyangCapacityReviewedSourceHash,
        'capacity source changed: review required');
    for (const path of ['kungfu/skill/jiuyang-shengong.c', 'kungfu/skill/shenghuo-shengong.c', 'clone/user/user.c'])
        assert.ok(Object.hasOwn(evidence, path), 'missing original capacity source ' + path);
    const source = catalog.skills.find(s => s.path === `kungfu/skill/${skill}.c`);
    assert.equal(source?.sha256, evidence[`kungfu/skill/${skill}.c`]);
    return plans().map(c => ({ ...c, entry_id: source.path, status: 'prepared_not_sampled', samples: 2,
        parameters: { ...c.parameters, source_evidence: copy(evidence),
            reviewed_source_hash: mingjiaoJiuyangCapacityReviewedSourceHash,
            qualification_evidence: mingjiaoJiuyangCapacitySourcePaths.map(path => ({ path, sha256: evidence[path] })) },
    }));
}

export function validateMingjiaoJiuyangCapacityCondition(condition) {
    assert.ok(condition && typeof condition === 'object' && !Array.isArray(condition));
    assert.deepEqual(Object.keys(condition).sort(),
        ['entry_id', 'id', 'method', 'parameters', 'samples', 'stage', 'status']);
    const plan = plans().find(c => c.id === condition.id); assert.ok(plan, 'unreviewed capacity condition');
    assert.equal(condition.stage, plan.stage); assert.equal(condition.method, plan.method);
    assert.equal(condition.status, 'prepared_not_sampled');
    assert.equal(condition.samples, 2); assert.equal(condition.entry_id, `kungfu/skill/${skill}.c`);
    const { source_evidence, reviewed_source_hash, qualification_evidence, ...parameters } = condition.parameters;
    assert.deepEqual(parameters, plan.parameters, 'capacity parameters drifted');
    assert.deepEqual(Object.keys(source_evidence), [...mingjiaoJiuyangCapacitySourcePaths]);
    for (const digest of Object.values(source_evidence)) assert.match(digest, /^[a-f0-9]{64}$/);
    assert.equal(evidenceHash(source_evidence), mingjiaoJiuyangCapacityReviewedSourceHash);
    assert.equal(reviewed_source_hash, mingjiaoJiuyangCapacityReviewedSourceHash);
    assert.deepEqual(qualification_evidence,
        mingjiaoJiuyangCapacitySourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    return condition.parameters;
}
