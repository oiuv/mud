import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { digest } from './ledger.mjs';
import { emeiCombinations, emeiCombinationConditions, validateEmeiCombinationRecord } from './school_emei_combination_cases.mjs';
import { wudangCombinationEffects, validateSchoolCombatPlan } from './school_combat_report.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = emeiCombinationConditions(catalog);
const pick = suffix => { const c = cases.find(x => x.id === 'school-emei-combination-' + suffix); assert.ok(c, suffix); return c; };

test('峨嵋互备注册正式与烟雾条件、原准备与选招探针、校验及冻结输入', () => {
    for (const smoke of [false, true]) {
        const selected = schoolCombatConditions(catalog, { smoke })
            .filter(c => c.parameters.collection_group === 'emei-combination');
        assert.deepEqual(selected, emeiCombinationConditions(catalog, { smoke }));
        if (!smoke) validateSchoolCombatPlan(selected, catalog);
        for (const c of selected) validateSchoolCombatRecord(row(c), c);
    }
    const fixture = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.equal(fixture.match(/"emei-combination"/g)?.length, 4);
    const execution = readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8');
    assert.ok(execution.includes("'tools/tests/martial_data/school_emei_combination_cases.mjs'"));
});

// These fabricated records exercise the collector. They are not gameplay samples.
function row(c, attacks = 1) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties,
        userp: 1, interactive: 1, wizardp: 0, skills: structuredClone(config.skills),
        mappings: structuredClone(config.mappings), preparations: {}, preparation_order: [],
        cultivation: { 'family/family_name': config.properties['family/family_name'] },
        weapon: config.equipment?.type ?? 'none', temp: {},
        effective_skills: { force: 300 }, effective_dex: p.combination === 'dex8-round' ? 8 : 36,
    }));
    const raw = { method: c.method, before, outcome: p.expected,
        interfaces: [], launches: [], attacks: [], prepare_steps: [], metrics: [{}, {}] };
    let previous = structuredClone(before[0]);
    for (const e of p.prepare_commands ?? []) {
        const after = structuredClone(previous); after.preparations = structuredClone(e.preparations);
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

test('峨嵋互备174条件7796计划记录；三个两两互备不冒充三招同时准备', () => {
    assert.equal(cases.length, 174); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 7796);
    assert.equal(emeiCombinationConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 348);
    assert.deepEqual(['interface', 'prepare', 'round'].map(m => cases.filter(c => c.method === m).length), [30, 68, 76]);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(digest(cases), '451ea739e3e46884882725bab73ae5b1ccf367824f3fb14380a596952ea597e6');
    for (const c of cases) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        validateEmeiCombinationRecord(row(c), c);
    }
    assert.throws(() => emeiCombinationConditions({ skills: [] }));
    assert.throws(() => emeiCombinationConditions(catalog, { samples: -1 }));
});

test('互备声明来自实际函数；飘雪与四象缺接口而非返回假的允许结果', () => {
    const teacher = readFileSync(join(root, 'kungfu/class/emei/miejue.c'), 'utf8');
    for (const skill of [...Object.keys(emeiCombinations), 'piaoxue-zhang', 'sixiang-zhang']) {
        assert.ok(teacher.includes(`set_skill("${skill}"`));
        const entry = catalog.skills.find(s => s.id === skill).entries.find(e => e.function === 'valid_combine');
        if (Object.hasOwn(emeiCombinations, skill)) {
            assert.ok(entry);
            for (const other of Object.keys(emeiCombinations).filter(s => s !== skill))
                assert.ok(entry.evidence.text.includes('"' + other + '"'));
        } else {
            assert.equal(entry, undefined);
            for (const c of cases.filter(c => c.method === 'interface' && c.parameters.skill === skill))
                assert.equal(c.parameters.combine_result, null);
        }
    }
    for (const path of ['inherit/skill/skill.c', 'feature/clean_up.c'])
        assert.doesNotMatch(readFileSync(join(root, path), 'utf8'), /\bvalid_combine\s*\(/);
});

test('三档、双向、名称与基本功参数及分步准备均保留原命令', () => {
    for (const a of Object.keys(emeiCombinations)) for (const b of Object.keys(emeiCombinations).filter(s => s !== a))
        for (const level of [200, 400, 800]) for (const route of ['names', 'basics', 'sequential']) {
            const c = pick(`${a}-${b}-${route}-l${level}`), p = c.parameters;
            assert.deepEqual(p.actor.preparations, {}); assert.equal(p.actor.mappings.force, undefined);
            assert.ok(p.prepare_commands.every(s => s.accepted === 1));
            assert.equal(p.prepare_commands.length, route === 'sequential' ? 2 : 1);
        }
    assert.equal(pick('three-at-once-l200').parameters.expected, 'refused');
    assert.deepEqual(pick('third-refused-l200').parameters.prepare_commands.map(s => s.accepted), [1, 0]);
    assert.deepEqual(pick('repeat-one-l200').parameters.prepare_commands.map(s => s.accepted), [1, 0]);
    assert.equal(pick('no-minimum-l1').parameters.expected, 'observed');
});

test('单备两门未声明互备的掌法仍可出招，不强行把互备门槛当单备限制', () => {
    for (const skill of ['piaoxue-zhang', 'sixiang-zhang']) for (const level of [200, 400, 800]) {
        const c = pick(`${skill}-jiali0-l${level}`), r = row(c);
        assert.equal(c.parameters.actor.mappings.strike, skill);
        assert.deepEqual(r.immediate[0].preparations, { strike: skill });
        validateEmeiCombinationRecord(r, c);
        assert.throws(() => validateEmeiCombinationRecord(row(c, 2), c));
    }
});

test('缺少计数、假玩家、额外内功、错误前后状态均不能通过', () => {
    const c = pick('jieshou-jiushi-allows-jinding-zhang-l200');
    for (const change of [r => { r.before[0].userp = 0; }, r => { r.before[1].wizardp = 1; },
        r => { r.before[0].mappings.force = 'linji-zhuang'; }, r => { delete r.metrics[0]; },
        r => { r.metrics[0].neili_cost = null; }, r => { r.immediate[0].neili--; },
        r => { r.interfaces[0].result = 0; }, r => { r.launches.push({}); }]) {
        const bad = row(c); change(bad); assert.throws(() => validateEmeiCombinationRecord(bad, c));
    }
});

test('准备步骤不得回填状态；部分拒绝保留已成功的准备', () => {
    const c = pick('third-refused-l200'), r = row(c);
    const effects = wudangCombinationEffects([{ raw: r }]);
    assert.equal(effects.accepted, 1); assert.equal(effects.rejected, 1);
    const bad = structuredClone(r); bad.prepare_steps[1].before.neili--;
    assert.throws(() => validateEmeiCombinationRecord(bad, c));
    r.prepare_steps[1].accepted = 1; assert.throws(() => validateEmeiCombinationRecord(r, c));
});

test('单轮守势、持剑、取消、低身法与忙乱目标分开，不保证每轮双击', () => {
    const c = pick('jieshou-jiushi-jinding-zhang-jiali0-l400'), r = row(c, 0);
    validateEmeiCombinationRecord(r, c);
    assert.equal(wudangCombinationEffects([{ raw: r }]).double_given_attack.rate, null);
    for (const suffix of ['armed-round-l400', 'cancel-round-l400', 'dex8-round-l400']) {
        const c = pick(suffix); validateEmeiCombinationRecord(row(c), c);
        assert.throws(() => validateEmeiCombinationRecord(row(c, 2), c));
    }
    const busy = pick('busy-target-round-l400');
    assert.throws(() => validateEmeiCombinationRecord(row(busy, 0), busy));
    const low = pick('dex8-round-l400'), bad = row(low); bad.before[0].effective_dex = 9;
    assert.throws(() => validateEmeiCombinationRecord(bad, low));
});

test('按实际准备keys次序核对每击，不把输入顺序或总伤害当作证据', () => {
    const c = pick('jieshou-jiushi-jinding-zhang-jiali0-l400'), r = row(c, 2);
    validateEmeiCombinationRecord(r, c);
    const order = r.prepare_steps[0].after.preparation_order.reverse();
    r.immediate[0].preparation_order = [...order];
    for (let i = 0; i < 2; i++) {
        r.attacks[i].attack_usage = order[i]; r.attacks[i].attack_skill = c.parameters.actor.mappings[order[i]];
    }
    validateEmeiCombinationRecord(r, c);
    r.attacks[1].attack_skill = r.attacks[0].attack_skill;
    assert.throws(() => validateEmeiCombinationRecord(r, c));
});

test('无特殊内功的加力原行为不补扣费，未激发基本拳脚保留LPC零', () => {
    const c = pick('jieshou-jiushi-jinding-zhang-jiali50-l400'), r = row(c, 2);
    validateEmeiCombinationRecord(r, c); r.metrics[0].neili_cost = 50;
    assert.throws(() => validateEmeiCombinationRecord(r, c));
    const empty = pick('unprepared-jiali0-l400'), bare = row(empty);
    assert.equal(bare.attacks[0].attack_skill, 0); validateEmeiCombinationRecord(bare, empty);
    bare.attacks[0].attack_skill = 'jieshou-jiushi';
    assert.throws(() => validateEmeiCombinationRecord(bare, empty));
});
