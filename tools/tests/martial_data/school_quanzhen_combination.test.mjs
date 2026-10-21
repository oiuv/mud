import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { digest } from './ledger.mjs';
import { quanzhenPairs, quanzhenSingles, quanzhenCombinationConditions, validateQuanzhenCombinationRecord }
    from './school_quanzhen_combination_cases.mjs';
import { wudangCombinationEffects, validateSchoolCombatPlan } from './school_combat_report.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = quanzhenCombinationConditions(catalog);
const pick = suffix => {
    const c = cases.find(x => x.id === 'school-quanzhen-combination-' + suffix);
    assert.ok(c, suffix); return c;
};

test('全真互备注册正式与烟雾条件、原准备与选招探针、校验及冻结输入', () => {
    for (const smoke of [false, true]) {
        const selected = schoolCombatConditions(catalog, { smoke })
            .filter(c => c.parameters.collection_group === 'quanzhen-combination');
        assert.deepEqual(selected, quanzhenCombinationConditions(catalog, { smoke }));
        if (!smoke) validateSchoolCombatPlan(selected, catalog);
        for (const c of selected) validateSchoolCombatRecord(row(c), c);
    }
    const fixture = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.equal(fixture.match(/"quanzhen-combination"/g)?.length, 5);
    const execution = readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8');
    assert.ok(execution.includes("'tools/tests/martial_data/school_quanzhen_combination_cases.mjs'"));
});

// These fabricated records exercise the collector. They are not gameplay samples.
function row(c, attacks = 1) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties,
        userp: 1, interactive: 1, wizardp: 0, skills: structuredClone(config.skills),
        mappings: structuredClone(config.mappings), preparations: {}, preparation_order: [],
        cultivation: { 'family/family_name': config.properties['family/family_name'] },
        weapon: config.equipment?.type ?? 'none', temp: {},
        effective_skills: { force: 300 }, effective_dex: p.combination.endsWith('dex8-round') ? 8 : 36,
    }));
    const raw = { method: c.method, before, outcome: p.expected,
        interfaces: [], launches: [], attacks: [], prepare_steps: [], metrics: [{}, {}] };
    let previous = structuredClone(before[0]);
    for (const e of p.prepare_commands ?? []) {
        const after = structuredClone(previous);
        after.preparations = structuredClone(e.preparations);
        after.preparation_order = Object.keys(after.preparations);
        raw.prepare_steps.push({ ...e, before: previous, after, reason: e.accepted ? '' : '原命令拒绝' });
        previous = after;
    }
    raw.immediate = [structuredClone(previous), structuredClone(before[1])];
    if (c.method === 'interface') raw.interfaces = [{ ...p.interface, result: p.combine_result }];
    if (c.method === 'round') {
        raw.immediate[0].temp.guarding = Number(attacks === 0);
        for (let index = 0; index < attacks; index++) {
            const usage = p.actor.equipment ? 'sword' : previous.preparation_order[index] ?? 'unarmed';
            raw.attacks.push({ actor: 0, target: 1, type: p.target.busy ? 2 : 0, result: 0,
                action_flag: index, attack_usage: usage, attack_skill: p.actor.mappings[usage] ?? 0 });
        }
    }
    return raw;
}

test('全真互备142条件4596计划记录；两组独立互备与空明拳缺接口分开', () => {
    assert.equal(cases.length, 142); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4596);
    assert.equal(quanzhenCombinationConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 284);
    assert.deepEqual(['interface', 'prepare', 'round'].map(m => cases.filter(c => c.method === m).length),
        [29, 69, 44]);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        validateQuanzhenCombinationRecord(row(c), c);
    }
    assert.throws(() => quanzhenCombinationConditions({ skills: [] }));
    assert.throws(() => quanzhenCombinationConditions(catalog, { samples: -1 }));
});

test('互备声明来自实际函数；空明拳缺接口而非返回假的允许结果', () => {
    for (const [a, , b] of quanzhenPairs) {
        const entryA = catalog.skills.find(s => s.id === a).entries.find(e => e.function === 'valid_combine');
        const entryB = catalog.skills.find(s => s.id === b).entries.find(e => e.function === 'valid_combine');
        assert.ok(entryA && entryA.evidence.text.includes('"' + b + '"'));
        assert.ok(entryB && entryB.evidence.text.includes('"' + a + '"'));
        assert.ok(!entryA.evidence.text.includes('"' + a + '"'));
    }
    for (const skill of Object.keys(quanzhenSingles))
        assert.equal(catalog.skills.find(s => s.id === skill).entries.find(e => e.function === 'valid_combine'),
            undefined);
    for (const c of cases.filter(c => c.method === 'interface' && Object.hasOwn(quanzhenSingles, c.parameters.skill)))
        assert.equal(c.parameters.combine_result, null);
    const li = readFileSync(join(root, 'kungfu/class/quanzhen/li.c'), 'utf8');
    assert.ok(li.includes('prepare_skill("finger", "zhongnan-zhi")'));
    assert.ok(li.includes('prepare_skill("strike", "chongyang-shenzhang")'));
    const qiu = readFileSync(join(root, 'kungfu/class/quanzhen/qiu.c'), 'utf8');
    assert.ok(qiu.includes('prepare_skill("hand", "qixing-shou")'));
    assert.ok(qiu.includes('prepare_skill("strike", "haotian-zhang")'));
});

test('两组互备分别可备，跨组组合按原声明拒绝', () => {
    for (const [a, , b] of quanzhenPairs) for (const first of [a, b]) for (const level of [200, 400, 800])
        for (const route of ['names', 'basics', 'sequential']) {
            const c = pick(`${a}-${b}-${first}-${route}-l${level}`);
            assert.ok(c.parameters.prepare_commands.every(s => s.accepted === 1));
            assert.equal(c.parameters.prepare_commands.length, route === 'sequential' ? 2 : 1);
        }
    for (const c of cases.filter(x => x.id.includes('cross-incompatible')))
        assert.equal(c.parameters.expected, 'refused');
    assert.equal(pick('chongyang-shenzhang-zhongnan-zhi-three-at-once-l200').parameters.expected, 'refused');
    assert.deepEqual(pick('chongyang-shenzhang-zhongnan-zhi-third-refused-l200').parameters.prepare_commands
        .map(s => s.accepted), [1, 0]);
    assert.equal(pick('chongyang-shenzhang-zhongnan-zhi-no-minimum-l1').parameters.expected, 'observed');
});

test('空明拳单备与出招不强行要求互备门槛', () => {
    for (const level of [200, 400, 800]) {
        const c = pick(`kongming-quan-solo-l${level}`), r = row(c);
        assert.deepEqual(r.immediate[0].preparations, { unarmed: 'kongming-quan' });
        validateQuanzhenCombinationRecord(r, c);
        assert.throws(() => validateQuanzhenCombinationRecord(row(c, 2), c));
    }
    for (const c of cases.filter(x => x.parameters.skill === 'kongming-quan' && x.method === 'interface'))
        assert.equal(c.parameters.combine_result, null);
});

test('单轮守势、持剑、取消、低身法与忙乱目标分开，不保证每轮双击', () => {
    const c = pick('chongyang-shenzhang-zhongnan-zhi-pair-jiali50-l400'), r = row(c, 0);
    validateQuanzhenCombinationRecord(r, c);
    assert.equal(wudangCombinationEffects([{ raw: r }]).double_given_attack.rate, null);
    for (const suffix of ['armed-round', 'cancel-round', 'dex8-round']) {
        const c = pick(`chongyang-shenzhang-zhongnan-zhi-${suffix}-l400`);
        validateQuanzhenCombinationRecord(row(c), c);
        assert.throws(() => validateQuanzhenCombinationRecord(row(c, 2), c));
    }
    const busy = pick('chongyang-shenzhang-zhongnan-zhi-busy-target-round-l400');
    assert.throws(() => validateQuanzhenCombinationRecord(row(busy, 0), busy));
    const low = pick('chongyang-shenzhang-zhongnan-zhi-dex8-round-l400'), bad = row(low);
    bad.before[0].effective_dex = 9;
    assert.throws(() => validateQuanzhenCombinationRecord(bad, low));
});

test('缺少计数、假玩家、额外内功、错误前后状态均不能通过', () => {
    const c = pick('chongyang-shenzhang-allows-zhongnan-zhi-l200');
    for (const change of [r => { r.before[0].userp = 0; }, r => { r.before[1].wizardp = 1; },
        r => { r.before[0].mappings.force = 'quanzhen-xinfa'; }, r => { delete r.metrics[0]; },
        r => { r.metrics[0].neili_cost = null; }, r => { r.immediate[0].neili--; },
        r => { r.interfaces[0].result = 0; }, r => { r.launches.push({}); }]) {
        const bad = row(c); change(bad);
        assert.throws(() => validateQuanzhenCombinationRecord(bad, c));
    }
});
