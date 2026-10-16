import test from 'node:test';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { digest } from './ledger.mjs';
import { gumuCombinationSkills, gumuCombinationPairs, gumuCombinationConditions,
    gumuCombinationFixtureRequirements, validateGumuCombinationRecord, gumuCombinationEffects } from './school_gumu_combination_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuCombinationConditions(catalog), copy = structuredClone;
const pick = suffix => { const c = cases.find(c => c.id === 'school-gumu-combination-' + suffix); assert.ok(c, suffix); return c; };
const meinv = 'meinv-quan';

// Synthetic observation records only, never gameplay evidence.
function row(c, attacks = 1) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => ({ ...cfg.properties, userp: 1, interactive: 1, wizardp: 0,
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: {}, preparation_order: [],
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        weapon: cfg.equipment?.type ?? 'none', temp: {}, effective_skills: { force: 300 },
        effective_str: cfg.properties.str + Math.trunc(Math.max(...['unarmed', 'strike', 'hand', 'cuff', 'finger', 'claw']
            .map(k => cfg.skills[k] ?? 0)) / 10), effective_dex: cfg.properties.dex + Math.trunc(cfg.skills.dodge / 10),
    }));
    const raw = { method: c.method, before, outcome: p.expected,
        interfaces: [], launches: [], attacks: [], prepare_steps: [], metrics: [{}, {}] };
    let previous = copy(before[0]);
    for (const e of p.prepare_commands ?? []) {
        const after = copy(previous); after.preparations = copy(e.preparations);
        after.preparation_order = Object.keys(after.preparations);
        raw.prepare_steps.push({ ...e, before: previous, after, reason: e.accepted ? '' : '原命令拒绝' });
        previous = after;
    }
    raw.immediate = [copy(previous), copy(before[1])];
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

test('古墓互备198条件8432计划记录，42查询74准备82攻击轮，统一入口接入', () => {
    assert.equal(cases.length, 198); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 8432);
    assert.equal(gumuCombinationConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 396);
    assert.deepEqual(['interface', 'prepare', 'round'].map(m => cases.filter(c => c.method === m).length), [42, 74, 82]);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 32);
    assert.equal(new Set(cases.map(c => c.id)).size, 198); assert.equal(gumuCombinationFixtureRequirements.length, 4);
    for (const c of cases) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        assert.deepEqual(c.parameters.actor.preparations, {}); validateGumuCombinationRecord(row(c), c);
    }
    assert.throws(() => gumuCombinationConditions({ skills: [] }));
    assert.throws(() => gumuCombinationConditions(catalog, { samples: -1 }));
    const registration = readFileSync(join(root, 'tools/tests/martial_data/school_combat_cases.mjs'), 'utf8');
    assert.ok(registration.includes('./school_gumu_combination_cases.mjs'));
});

test('追加互备条件，不改变旧12428条件332564计划记录的完整内容', () => {
    const all = schoolCombatConditions(catalog);
    const old = all.slice(0, 12428);
    assert.equal(old.length, 12428); assert.equal(old.reduce((n, c) => n + c.samples, 0), 332564);
    assert.equal(digest(old), 'd339b62a92bf10546a5e0e8c9ce93c5510a3394411bb0aca8e0608699dbab00e');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-combination'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    assert.ok(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8')
        .includes('tools/tests/martial_data/school_gumu_combination_cases.mjs'));
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    const exertInit = '    if (current["parameters"]["collection_group"] == "mingjiao-jiuyang-exert") {\n'
        + '        current["actions"] = ({});\n        current["directs"] = ({});\n'
        + '        current["busy_calls"] = ({});\n        current["skill_messages"] = ({});\n    }\n';
    const remainingInit = '    if (is_mingjiao_remaining_perform()) {\n'
        + '        current["actions"] = ({});\n        current["directs"] = ({});\n'
        + '        current["busy_calls"] = ({});\n        current["skill_messages"] = ({});\n'
        + '        current["perform_steps"] = ({});\n        current["needle_hits"] = ({});\n'
        + '        passive_before = ([]);\n        remaining_perform_flower = 0;\n    }\n';
    const baseInit = '    if (is_mingjiao_remaining_base()) {\n'
        + '        current["actions"] = ({});\n        current["directs"] = ({});\n'
        + '        current["busy_calls"] = ({});\n        current["skill_messages"] = ({});\n'
        + '        current["interface_steps"] = ({});\n        passive_before = ([]);\n    }\n';
    assert.equal(runner.split(baseInit).length, 2, 'one exact remaining-base-only initialization');
    assert.equal(runner.split(remainingInit).length, 2, 'one exact remaining-perform-only initialization');
    assert.equal(runner.split(exertInit).length, 2, 'one exact exert-only initialization');
    const tokens = text => tokenize(text).filter(t => !['whitespace', 'comment', 'directive'].includes(t.kind))
        .map(t => t.text).join(' ');
    assert.equal(runner.split('current["interfaces"] = ({});').length, 2);
    assert.ok(tokens(runner).includes(tokens('if (member_array(current["parameters"]["collection_group"], '
        + '({ "gumu-combination", "mingjiao-combination" })) != -1) current["prepare_steps"] = ({});')),
        'only the two explicit combination groups initialize preparation steps');
});

test('保留美女vliad错名，两掌仅向美女声明，其余无原接口，不增加反向许可', () => {
    for (const skill of Object.keys(gumuCombinationSkills)) {
        const source = catalog.skills.find(s => s.id === skill);
        const fn = source.entries.find(e => e.function === 'valid_combine');
        if (gumuCombinationPairs.includes(skill)) {
            assert.ok(fn); assert.ok(fn.evidence.text.includes('"meinv-quan"'));
        } else assert.equal(fn, undefined);
        for (const c of cases.filter(c => c.method === 'interface' && c.parameters.skill === skill)) {
            const result = gumuCombinationPairs.includes(skill) ? Number(c.parameters.interface.combo === meinv) : null;
            assert.equal(c.parameters.combine_result, result); validateGumuCombinationRecord(row(c), c);
        }
    }
    assert.ok(readFileSync(join(root, 'kungfu/skill/meinv-quan.c'), 'utf8').includes('int vliad_combine('));
    for (const path of ['inherit/skill/skill.c', 'feature/clean_up.c'])
        assert.doesNotMatch(readFileSync(join(root, path), 'utf8'), /\bvalid_combine\s*\(/);
});

test('两参数检查第一门，分步检查新加入一门；双向结果与保留状态分别核对', () => {
    for (const palm of gumuCombinationPairs) for (const level of [200, 400, 800]) {
        for (const first of [palm, meinv]) for (const route of ['names', 'basics', 'sequential']) {
            const c = pick(`${palm}-${first}-${route}-l${level}`), steps = c.parameters.prepare_commands;
            if (route === 'sequential') {
                assert.deepEqual(steps.map(s => s.accepted), first === meinv ? [1, 1] : [1, 0]);
                assert.equal(Object.keys(steps.at(-1).preparations).length, first === meinv ? 2 : 1);
            } else {
                assert.equal(steps[0].accepted, Number(first === palm));
                assert.equal(Object.keys(steps[0].preparations).length, first === palm ? 2 : 0);
            }
            validateGumuCombinationRecord(row(c), c);
        }
    }
});

test('命令拒绝不取消原准备；取消后可重选，两项上限不等于第三门不兼容', () => {
    for (const palm of gumuCombinationPairs) {
        for (const [suffix, flags] of [['third-refused', [1, 0]], ['pair-while-one', [1, 0]],
            ['repeat-one', [1, 0]], ['cancel-and-replace', [1, 1, 1]]]) {
            const c = pick(`${palm}-${suffix}-l200`); assert.deepEqual(c.parameters.prepare_commands.map(s => s.accepted), flags);
            validateGumuCombinationRecord(row(c), c);
        }
        for (const suffix of ['three-at-once', 'same-skill', 'unlearned', 'unmapped', 'cancel-empty'])
            assert.equal(pick(`${palm}-${suffix}-l200`).parameters.expected, 'refused');
    }
    const c = pick('tianluo-diwang-third-refused-l200'), bad = row(c);
    bad.prepare_steps[1].after.preparations = {};
    assert.throws(() => validateGumuCombinationRecord(bad, c));
});

test('单备不以valid_combine为门槛，等级1及持剑准备不额外添加原本没有的禁令', () => {
    for (const skill of Object.keys(gumuCombinationSkills)) {
        const c = pick(`${skill}-single-prepare-l200`);
        assert.equal(c.parameters.expected, 'observed'); validateGumuCombinationRecord(row(c), c);
    }
    for (const palm of gumuCombinationPairs) {
        for (const suffix of ['no-minimum-l1', 'armed-prepare-l200']) {
            const c = pick(`${palm}-${suffix}`); assert.equal(c.parameters.expected, 'observed'); validateGumuCombinationRecord(row(c), c);
        }
        assert.equal(pick(`${palm}-no-minimum-reverse-l1`).parameters.expected, 'refused');
    }
});

test('错误顺序后仍按实际保留的单门或未准备状态出招，不预置两种准备', () => {
    for (const palm of gumuCombinationPairs) for (const [first, route, expected] of [
        [meinv, 'names', meinv], [palm, 'sequential', palm]]) {
        const c = pick(`${palm}-${first}-${route}-j0-l400`), r = row(c);
        assert.equal(r.attacks[0].attack_skill, expected); validateGumuCombinationRecord(r, c);
        assert.throws(() => validateGumuCombinationRecord(row(c, 2), c));
    }
    const c = pick('unprepared-basic-l400'), r = row(c);
    assert.equal(r.attacks[0].attack_skill, 0); validateGumuCombinationRecord(r, c);
});

test('互备只可能随机双击，守势／有效身法8／持剑／忙乱目标及膂力必攻分列', () => {
    const low = pick('tianluo-diwang-tianluo-diwang-names-j0-l200');
    for (const count of [0, 1, 2]) validateGumuCombinationRecord(row(low, count), low);
    const high = pick('tianluo-diwang-tianluo-diwang-names-j0-l400');
    assert.throws(() => validateGumuCombinationRecord(row(high, 0), high));
    for (const palm of gumuCombinationPairs) {
        for (const name of ['dex8-round', 'armed-round', 'cancel-round']) {
            const c = pick(`${palm}-${name}-l400`); validateGumuCombinationRecord(row(c), c);
            assert.throws(() => validateGumuCombinationRecord(row(c, 2), c));
        }
        const c = pick(`${palm}-busy-target-round-l400`);
        validateGumuCombinationRecord(row(c, 2), c);
        assert.throws(() => validateGumuCombinationRecord(row(c, 0), c));
    }
});

test('使用真实mapping keys次序，不假定命令输入顺序；反击不当第二次主攻', () => {
    const c = pick('fireice-strike-fireice-strike-names-j0-l400'), r = row(c, 2);
    const order = r.prepare_steps[0].after.preparation_order.reverse();
    r.immediate[0].preparation_order = [...order];
    for (let i = 0; i < 2; i++) {
        r.attacks[i].attack_usage = order[i]; r.attacks[i].attack_skill = c.parameters.actor.mappings[order[i]];
    }
    r.attacks.splice(1, 0, { actor: 1, target: 0, type: 1, result: -1 });
    validateGumuCombinationRecord(r, c);
    const effects = gumuCombinationEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(effects.primary_attacks, 2);
    const bad = copy(r); bad.immediate[0].preparation_order = ['strike', 'strike'];
    assert.throws(() => validateGumuCombinationRecord(bad, c));
    r.attacks[2].attack_skill = r.attacks[0].attack_skill;
    assert.throws(() => validateGumuCombinationRecord(r, c));
});

test('状态／身份／未知计数／额外施展或心跳不允许伪造完整记录', () => {
    const c = pick('tianluo-diwang-allows-meinv-quan-l200');
    for (const mutate of [r => { r.before[0].userp = 0; }, r => { r.before[1].wizardp = 1; },
        r => { r.before[0].mappings.force = 'yunv-xinjing'; }, r => { delete r.metrics[0]; },
        r => { r.metrics[0].neili_cost = null; }, r => { r.metrics[1].heartbeats = 1; },
        r => { r.immediate[0].neili--; }, r => { r.interfaces[0].result = 0; },
        r => { r.launches.push({}); }, r => { r.before[0].effective_dex = 36; }]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuCombinationRecord(r, c));
    }
    const round = pick('tianluo-diwang-tianluo-diwang-names-j50-l400'), r = row(round, 2);
    validateGumuCombinationRecord(r, round); r.metrics[0].neili_cost = 50;
    assert.throws(() => validateGumuCombinationRecord(r, round));
});

test('互备、出招与未知分母分开，缺少数据不计零攻击或拒绝', () => {
    const round = pick('tianluo-diwang-tianluo-diwang-names-j0-l200'), r = row(round, 0);
    const prepare = pick('tianluo-diwang-tianluo-diwang-sequential-l200'), p = row(prepare);
    const effects = gumuCombinationEffects([{ outcome: 'observed', raw: r }, { outcome: 'observed', raw: p },
        { outcome: 'error' }, { outcome: 'observed', raw: { method: 'round' } }]);
    assert.equal(effects.samples, 2); assert.equal(effects.unknown_samples, 2);
    assert.equal(effects.commands, 3); assert.equal(effects.accepted, 2); assert.equal(effects.rejected, 1);
    assert.equal(effects.guarding_rounds, 1); assert.equal(effects.double_given_attack.rate, null);
});
