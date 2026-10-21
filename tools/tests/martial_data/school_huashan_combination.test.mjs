import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { huashanPairs, huashanCombinationConditions, validateHuashanCombinationRecord }
    from './school_huashan_combination_cases.mjs';
import { wudangCombinationEffects, validateSchoolCombatPlan } from './school_combat_report.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = huashanCombinationConditions(catalog);
const pick = suffix => {
    const c = cases.find(x => x.id === 'school-huashan-combination-' + suffix);
    assert.ok(c, suffix); return c;
};

test('华山互备注册正式与烟雾条件、原准备与选招探针、校验及冻结输入', () => {
    for (const smoke of [false, true]) {
        const selected = schoolCombatConditions(catalog, { smoke })
            .filter(c => c.parameters.collection_group === 'huashan-combination');
        assert.deepEqual(selected, huashanCombinationConditions(catalog, { smoke }));
        if (!smoke) validateSchoolCombatPlan(selected, catalog);
        for (const c of selected) validateSchoolCombatRecord(row(c), c);
    }
    const fixture = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.equal(fixture.match(/"huashan-combination"/g)?.length, 5);
    const execution = readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8');
    for (const f of ['school_huashan_combination_cases.mjs', 'school_taohua_bout.test.mjs', 'school_taohua_bout_cases.mjs', 'school_mingjiao_bout.test.mjs', 'school_mingjiao_bout_cases.mjs', 'school_huashan_bout.test.mjs', 'school_huashan_bout_cases.mjs', 'school_quanzhen_bout.test.mjs', 'school_quanzhen_bout_cases.mjs'])
        assert.ok(execution.includes(f), 'execution.mjs missing: ' + f);
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

test('华山互备198条件5688计划记录；三组独立互备不冒充同一互备网', () => {
    assert.equal(cases.length, 198); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 5688);
    assert.equal(huashanCombinationConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 396);
    assert.deepEqual(['interface', 'prepare', 'round'].map(m => cases.filter(c => c.method === m).length),
        [42, 102, 54]);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        validateHuashanCombinationRecord(row(c), c);
    }
    assert.throws(() => huashanCombinationConditions({ skills: [] }));
    assert.throws(() => huashanCombinationConditions(catalog, { samples: -1 }));
});

test('互备声明来自实际函数；华山拳法接口为cuff而非unarmed', () => {
    for (const [a, , b] of huashanPairs) {
        const entryA = catalog.skills.find(s => s.id === a).entries.find(e => e.function === 'valid_combine');
        const entryB = catalog.skills.find(s => s.id === b).entries.find(e => e.function === 'valid_combine');
        assert.ok(entryA && entryA.evidence.text.includes('"' + b + '"'));
        assert.ok(entryB && entryB.evidence.text.includes('"' + a + '"'));
    }
    const quanfa = catalog.skills.find(s => s.id === 'huashan-quanfa');
    assert.ok(quanfa.entries.some(e => e.function === 'valid_enable' && e.evidence.text.includes('"cuff"')));
    const yue = readFileSync(join(root, 'kungfu/class/huashan/yue-buqun.c'), 'utf8');
    assert.ok(yue.includes('prepare_skill("strike", "hunyuan-zhang")'));
    assert.ok(yue.includes('prepare_skill("cuff", "poyu-quan")'));
    const lao = readFileSync(join(root, 'kungfu/class/huashan/lao.c'), 'utf8');
    assert.ok(lao.includes('prepare_skill("strike", "huashan-zhang")'));
});

test('三组互备分别可备，跨组组合按原声明拒绝', () => {
    for (const [a, , b] of huashanPairs) for (const first of [a, b]) for (const level of [200, 400, 800])
        for (const route of ['names', 'basics', 'sequential']) {
            const c = pick(`${a}-${b}-${first}-${route}-l${level}`);
            assert.ok(c.parameters.prepare_commands.every(s => s.accepted === 1));
            assert.equal(c.parameters.prepare_commands.length, route === 'sequential' ? 2 : 1);
        }
    for (const c of cases.filter(x => x.id.includes('cross-incompatible')))
        assert.equal(c.parameters.expected, 'refused');
    assert.equal(pick('poyu-quan-hunyuan-zhang-three-at-once-l200').parameters.expected, 'refused');
    assert.deepEqual(pick('poyu-quan-hunyuan-zhang-third-refused-l200').parameters.prepare_commands
        .map(s => s.accepted), [1, 0]);
    assert.equal(pick('poyu-quan-hunyuan-zhang-no-minimum-l1').parameters.expected, 'observed');
});

test('单轮守势、持剑、取消、低身法与忙乱目标分开，不保证每轮双击', () => {
    const c = pick('poyu-quan-hunyuan-zhang-pair-jiali50-l400'), r = row(c, 0);
    validateHuashanCombinationRecord(r, c);
    assert.equal(wudangCombinationEffects([{ raw: r }]).double_given_attack.rate, null);
    for (const suffix of ['armed-round', 'cancel-round', 'dex8-round']) {
        const c = pick(`poyu-quan-hunyuan-zhang-${suffix}-l400`);
        validateHuashanCombinationRecord(row(c), c);
        assert.throws(() => validateHuashanCombinationRecord(row(c, 2), c));
    }
    const busy = pick('poyu-quan-hunyuan-zhang-busy-target-round-l400');
    assert.throws(() => validateHuashanCombinationRecord(row(busy, 0), busy));
    const low = pick('poyu-quan-hunyuan-zhang-dex8-round-l400'), bad = row(low);
    bad.before[0].effective_dex = 9;
    assert.throws(() => validateHuashanCombinationRecord(bad, low));
});

test('缺少计数、假玩家、额外内功、错误前后状态均不能通过', () => {
    const c = pick('poyu-quan-allows-hunyuan-zhang-l200');
    for (const change of [r => { r.before[0].userp = 0; }, r => { r.before[1].wizardp = 1; },
        r => { r.before[0].mappings.force = 'zixia-shengong'; }, r => { delete r.metrics[0]; },
        r => { r.metrics[0].neili_cost = null; }, r => { r.immediate[0].neili--; },
        r => { r.interfaces[0].result = 0; }, r => { r.launches.push({}); }]) {
        const bad = row(c); change(bad);
        assert.throws(() => validateHuashanCombinationRecord(bad, c));
    }
});
