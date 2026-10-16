// Finite immediate shared-force window; not natural acquisition or a lifecycle test.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { publicForceConditions, validateWudangPublicForceRecord } from './school_wudang_public_force_cases.mjs';

const forces = ['shenghuo-xinfa', 'shenghuo-shengong'];
const abilities = ['lifeheal', 'power', 'dispel', 'tianmo', 'roar', 'shot'];
const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const copy = value => structuredClone(value);
const mapping = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (value, key) => { assert.ok(mapping(value) && Object.hasOwn(value, key), 'missing ' + key); return value[key]; };
const zero = value => { assert.ok(value === null || value === 0, 'expected original zero'); };

export const mingjiaoPublicForceSourcePaths = [
    'kungfu/skill/shenghuo-xinfa.c', 'kungfu/skill/shenghuo-shengong.c',
    'kungfu/skill/force.c', ...abilities.map(a => `kungfu/skill/force/${a}.c`),
    'kungfu/skill/xiaoyao-jian.c', 'kungfu/skill/sword.c', 'kungfu/skill/martial-cognize.c',
    'kungfu/skill/poison.c', 'kungfu/skill/throwing.c',
    'kungfu/class/mingjiao/yangxiao.c', 'kungfu/class/mingjiao/zhangwuji.c',
    'kungfu/class/mingjiao/mingjiao.h', 'cmds/skill/exert.c',
    'inherit/skill/force.c', 'inherit/skill/skill.c', 'clone/user/user.c', 'inherit/char/char.c',
    'feature/skill.c', 'feature/attribute.c', 'feature/damage.c', 'feature/action.c',
    'feature/attack.c', 'feature/dbase.c', 'feature/equip.c', 'feature/condition.c',
    'feature/move.c', 'feature/command.c', 'feature/message.c',
    'mudcore/inherit/action.c', 'mudcore/inherit/dbase.c', 'adm/daemons/combatd.c',
    'adm/single/simul_efun/message.c', 'adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c',
    'data/e2c_dict.o', 'include/globals.h', 'include/skill.h', 'include/command.h',
    'include/combat.h', 'mudcore/include/ansi.h',
];
export const mingjiaoPublicForceReviewedSourceHash = 'e284578cf472b1e9f921550c7e29ba477511c76c2ac1554971c4fef2df02e955';
export const mingjiaoPublicForceEntryIds = Object.freeze({
    lifeheal: 'kungfu/skill/force/lifeheal.c:5:exert',
    power: 'kungfu/skill/force/power.c:35:exert',
    dispel: 'kungfu/skill/force/dispel.c:5:exert',
    tianmo: 'kungfu/skill/force/tianmo.c:9:exert',
    roar: 'kungfu/skill/force/roar.c:7:exert',
    shot: 'kungfu/skill/force/shot.c:5:exert',
});
export const mingjiaoPublicForceAbsentPaths = forces.flatMap(f => abilities.flatMap(a =>
    ['c', 'lpc'].map(ext => `kungfu/skill/${f}/${a}.${ext}`)));
export const mingjiaoPublicForceFixtureRequirements = [
    'Run the original exert command as a connected nonwizard USER, retaining public-force launch ownership and fallback.',
    'Freeze ordered source_evidence and all 24 absent native ability paths; changed or missing provenance fails closed.',
    'Observe exact immediate resource movements, effective skills, original force weak proficiency and no heartbeat/callback contamination.',
];
const sourceHash = evidence => hash(JSON.stringify(mingjiaoPublicForceSourcePaths.map(p => [p, evidence[p]])));
const profile = {
    school: 'mingjiao', family: '明教', forces, sword: 'xiaoyao-jian',
    sources: ['kungfu/class/mingjiao/yangxiao.c', 'kungfu/class/mingjiao/zhangwuji.c', 'inherit/skill/force.c'],
    refusedAbilities: ['roar', 'shot'],
    note: '真实非巫师USER经原exert回退公共force，圣火心法和圣火神功独立统计。'
        + '技能、性格、邪气和资源是实验输入，不证明自然师承；逍遥剑来自杨逍原配置，神功加逍遥剑是受控组合，不称原NPC自用。'
        + 'lifeheal区分当前与有效气血；dispel仅无异常及受理无作用，不代表实际驱毒。'
        + 'power/tianmo只测即时属性与自损，原入口没有到期回调，不据此声称生命周期已测。'
        + 'roar/shot按两内功的公共白名单拒绝；recover/regenerate/heal/inspire不在本矩阵，九阳另列。',
};

function plans(catalog, options) {
    const result = publicForceConditions(catalog, options, profile);
    for (const c of result) {
        Object.assign(c.parameters.actor.properties, { gender: '男性', character: '光明磊落' });
        // Observe the max_neili gate without an impossible current-neili pool.
        if (c.id.endsWith('lifeheal-l200-max-neili299')) c.parameters.actor.properties.neili = 299;
    }
    return result;
}

function checkedParameters(c) {
    assert.equal(c.method, 'exert'); assert.equal(c.stage, 'school');
    assert.ok(Number.isSafeInteger(c.samples) && c.samples > 0);
    const p = c.parameters;
    assert.equal(own(p, 'collection_group'), 'mingjiao-public-force');
    assert.ok(forces.includes(own(p, 'skill')) && abilities.includes(own(p, 'ability')));
    const evidence = own(p, 'source_evidence');
    assert.deepEqual(Object.keys(evidence), mingjiaoPublicForceSourcePaths);
    for (const value of Object.values(evidence)) assert.match(value, /^[a-f0-9]{64}$/);
    assert.equal(sourceHash(evidence), mingjiaoPublicForceReviewedSourceHash);
    assert.equal(own(p, 'reviewed_source_hash'), mingjiaoPublicForceReviewedSourceHash);
    assert.deepEqual(own(p, 'absent_sources'), mingjiaoPublicForceAbsentPaths);
    const catalog = { skills: abilities.map(a => ({ id: 'force/' + a,
        entries: [{ role: 'exert', id: a === p.ability ? c.entry_id : 'unused' }], path: `kungfu/skill/force/${a}.c` })) };
    const expected = plans(catalog, {}).find(v => v.id === c.id);
    assert.ok(expected, 'unknown finite condition');
    const { source_evidence, reviewed_source_hash, absent_sources, ...actual } = p;
    assert.deepEqual(actual, { ...expected.parameters, qualification_sources: mingjiaoPublicForceSourcePaths });
    assert.equal(c.entry_id, mingjiaoPublicForceEntryIds[p.ability]);
    return p;
}

export function mingjiaoPublicForceConditions(catalog, readSource, options = {}) {
    assert.equal(typeof readSource, 'function');
    assert.equal(typeof (options.smoke ?? false), 'boolean');
    assert.ok(Number.isSafeInteger(options.samples ?? 100) && (options.samples ?? 100) > 0);
    for (const id of [...forces, 'xiaoyao-jian']) assert.ok(catalog.skills.some(s => s.id === id), id);
    const evidence = Object.fromEntries(mingjiaoPublicForceSourcePaths.map(p => [p, hash(readSource(p))]));
    assert.equal(sourceHash(evidence), mingjiaoPublicForceReviewedSourceHash, '来源改变须重新核对');
    for (const path of mingjiaoPublicForceAbsentPaths) {
        let absent = false;
        try { const value = readSource(path); absent = value === null || value === undefined; }
        catch (error) { if (error.code === 'ENOENT') absent = true; else throw error; }
        assert.ok(absent, 'native entry appeared: ' + path);
    }
    for (const id of [...forces, 'xiaoyao-jian', ...abilities.map(a => 'force/' + a)]) {
        const source = catalog.skills.find(s => s.id === id);
        assert.equal(source?.sha256, evidence[`kungfu/skill/${id}.c`], 'catalog source changed: ' + id);
    }
    return plans(catalog, options).map(c => ({ ...c, status: 'prepared_not_sampled', parameters: {
        ...c.parameters, qualification_sources: mingjiaoPublicForceSourcePaths,
        source_evidence: copy(evidence), reviewed_source_hash: mingjiaoPublicForceReviewedSourceHash,
        absent_sources: [...mingjiaoPublicForceAbsentPaths],
    } }));
}

function validateSnapshot(s, original) {
    assert.ok(mapping(s)); assert.equal(own(s, 'object'), original.object);
    for (const k of ['userp', 'playerp', 'interactive']) assert.equal(own(s, k), 1);
    zero(own(s, 'wizardp'));
    for (const k of resources) assert.ok(Number.isSafeInteger(own(s, k)), k);
    const busy = own(s, 'busy'); assert.ok(busy === null || Number.isSafeInteger(busy) && busy >= 0);
    assert.ok([null, 0, 1].includes(own(s, 'not_living')));
    const conditions = own(s, 'conditions'); assert.ok(conditions === null || conditions === 0 || mapping(conditions));
    for (const k of ['skills', 'mappings', 'preparations', 'effective_skills', 'cultivation', 'learned', 'temp'])
        assert.ok(mapping(own(s, k)), k);
    assert.ok(mapping(own(s.temp, 'apply')));
    for (const values of [s.skills, s.learned]) for (const v of Object.values(values)) assert.ok(Number.isSafeInteger(v) && v >= 0);
    for (const v of Object.values(s.temp.apply)) assert.ok(Number.isSafeInteger(v));
    assert.deepEqual(s.effective_skills, Object.fromEntries(Object.entries(s.skills).map(([k, v]) =>
        [k, Math.trunc(v / 2) + (s.skills[s.mappings[k]] ?? 0) + (s.temp.apply[k] ?? 0)])));
    for (const k of ['skills', 'mappings', 'preparations', 'cultivation', 'conditions', 'not_living'])
        assert.deepEqual(s[k], original[k], 'unrelated immediate state: ' + k);
    for (const k of ['str', 'int', 'con', 'dex', 'gender', 'combat_exp', 'jiali'])
        if (Object.hasOwn(original, k)) assert.equal(own(s, k), original[k], 'raw attribute must remain unchanged: ' + k);
}

export function validateMingjiaoPublicForceRecord(raw, condition) {
    const p = checkedParameters(condition);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), condition.id);
    assert.equal(own(raw, 'method'), condition.method);
    const index = own(raw, 'index'); assert.ok(Number.isSafeInteger(index) && index >= 0 && index < condition.samples);
    if (['error', 'not_applicable'].includes(own(raw, 'outcome'))) return;
    assert.equal(raw.outcome, p.expected);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.ok(Array.isArray(own(raw, k)) && raw[k].length === 2, k);
    assert.equal(own(raw, 'command_accepted'), Number(p.expected === 'observed'));
    for (const k of ['attacks', 'interfaces', 'launches', 'callbacks', 'terminals']) assert.ok(Array.isArray(own(raw, k)), k);
    assert.deepEqual(raw.callbacks, []); assert.deepEqual(raw.terminals, []);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side], m = raw.metrics[side];
        assert.match(own(b, 'object'), /^\/tests\/actor#\d+$/);
        for (const phase of ['before', 'immediate', 'after']) validateSnapshot(raw[phase][side], b);
        assert.deepEqual(b.skills, cfg.skills); assert.deepEqual(b.mappings, cfg.mappings);
        assert.deepEqual(b.preparations, cfg.preparations); assert.deepEqual(b.learned, {});
        assert.deepEqual(b.temp.apply, { armor: 100 });
        for (const flag of ['power', 'tianmo', 'powerup', 'shield'])
            if (Object.hasOwn(b.temp, flag)) zero(b.temp[flag]);
        assert.equal(b.not_living ?? 0, cfg.properties.not_living ?? 0);
        assert.ok(mapping(m)); for (const v of Object.values(m)) assert.ok(Number.isSafeInteger(v) && v >= 0);
        assert.equal(m.heartbeats ?? 0, 0);
        for (const [k, v] of Object.entries(cfg.properties))
            assert.equal(k.includes('/') || k === 'character' ? own(b.cultivation, k) : own(b, k), v, k);
        assert.equal(b.busy ?? 0, cfg.busy ?? 0);
        const learned = side === 0 && p.expected === 'observed' ? { force: 1 } : {};
        for (const phase of ['immediate', 'after']) assert.deepEqual(raw[phase][side].learned, learned);
        for (const phase of ['immediate', 'after']) {
            const next = copy(raw[phase][side].temp), old = copy(b.temp);
            delete next.notify_fail; delete old.notify_fail;
            if (side === 0 && p.expected === 'observed' && ['power', 'tianmo'].includes(p.ability)) {
                assert.equal(own(next, p.ability), 1); delete next[p.ability]; delete old[p.ability];
            }
            delete next.apply; delete old.apply;
            assert.deepEqual(next, old, 'no unobserved buff or temp mutation');
            if (side === 1) assert.deepEqual(raw[phase][side].temp.apply, b.temp.apply);
        }
        for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            const delta = raw.after[side][k] - b[k]; let cost = Math.max(0, -delta), recovery = Math.max(0, delta);
            if (side === 1 && k === 'qi' && p.expected === 'observed' && p.ability === 'lifeheal') {
                const effective = raw.before[0].effective_skills.force;
                const limit = Math.min(b.max_qi, b.eff_qi + 10 + Math.trunc(effective / 2));
                recovery = 10 + Math.trunc(effective / 3); cost = Math.max(0, b.qi + recovery - limit);
            }
            assert.equal(m[k + '_cost'] ?? 0, cost, 'resource event cost: ' + k);
            assert.equal(m[k + '_recovery'] ?? 0, recovery, 'resource event recovery: ' + k);
            assert.equal(recovery - cost, delta);
        }
        const allowed = new Set([...['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'].flatMap(k => [k + '_cost', k + '_recovery']), 'ability_launched']);
        for (const [k, v] of Object.entries(m)) if (!allowed.has(k)) assert.equal(v, 0, 'unrelated positive metric: ' + k);
    }
    assert.deepEqual(raw.launches.map(launch => {
        assert.equal(own(launch, 'actor'), raw.before[0].object); assert.equal(own(launch, 'skill'), 'force');
        return own(launch, 'argument');
    }), p.expected === 'observed' ? [p.action.slice(6)] : []);
    assert.equal(raw.metrics[0].ability_launched ?? 0, raw.launches.length); assert.equal(raw.metrics[1].ability_launched ?? 0, 0);
    validateWudangPublicForceRecord(raw, condition);
    if (p.expected === 'refused' && ['roar', 'shot'].includes(p.ability)) {
        const clean = own(raw, 'reason').replace(/\x1b\[(?:[0-9;]*m|256D|K)/g, '');
        assert.equal(clean.trim(), '你所学的内功中没有这种功能。');
    }
    if (p.expected === 'observed' && ['power', 'tianmo'].includes(p.ability))
        assert.equal(raw.immediate[0].busy ?? 0, p.fighting ? 3 : 0);
}
