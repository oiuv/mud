// Independent synthetic contracts only: no driver, player data or evidence writes.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { digest } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { mingjiaoJiuyangLearningConditions } from './school_mingjiao_jiuyang_learning_cases.mjs';
import { mingjiaoJiuyangLearningReport, mingjiaoJiuyangLearningMarkdown } from './school_mingjiao_jiuyang_learning_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(root + path, 'utf8');
const path = 'kungfu/skill/jiuyang-shengong.c';
const catalog = { skills: [{ id: 'jiuyang-shengong', sha256: sha256(read(path)),
    entries: [[207, 'valid_learn'], [341, 'difficult_level'], [337, 'practice_skill']]
        .map(([line, name]) => ({ id: `${path}:${line}:${name}` })) }] };
const cases = mingjiaoJiuyangLearningConditions(catalog, read);
const pick = variant => { const c = cases.find(c => c.parameters.variant === variant); assert.ok(c, variant); return c; };
const permission = 'can_learn/jiuyang-shengong/enable_weapon';
const envelope = (raw, c) => ({ format: 1, fingerprint: 'a'.repeat(64), condition_id: c.id,
    condition_sha256: digest(c), index: raw.index, outcome: raw.outcome, reason: raw.reason,
    raw, raw_sha256: digest(raw), recorded: '2026-10-14T00:00:00.000Z' });
const diagnostic = (c, outcome = 'error', index = 0) => envelope({ kind: 'sample', condition_id: c.id,
    method: c.method, index, elapsed: .01, outcome, reason: 'explicit synthetic diagnostic' }, c);

function state(cfg, side) {
    const s = { object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null, fighting_opponent: 0, conditions: null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations),
        learned: {}, cultivation: Object.fromEntries(['improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
            'special_skill/guimai'].map(key => [key, null])), temp: { user_setup: 1, apply: { armor: 100 } },
        craze: 0, max_craze: 5000, weapon: 'none', weapon_details: {}, weapon_damage: 0, weapon_flag: 0,
        handing: 'none', handing_details: {} };
    for (const [key, value] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(key)) {
        if (key.includes('/') || ['reborn', 'character', 'class', 'doing'].includes(key)) s.cultivation[key] = value;
        else s[key] = value;
    }
    assert.ok(!cfg.temp, 'fixture is limited to the selected source cases');
    s.effective_int = s.int + Math.trunc((cfg.skills.literate ?? 0) / 10);
    s.effective_con = s.con + Math.trunc(cfg.skills.force / 10);
    s.effective_str = s.str + Math.trunc(cfg.skills.unarmed / 10);
    s.effective_dex = s.dex + Math.trunc(cfg.skills.dodge / 10);
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) => [key,
        Math.trunc(value / 2) + (cfg.mappings[key] === 'jiuyang-shengong' ? cfg.skills['jiuyang-shengong'] : 0)]));
    return s;
}
function known(c, index = 0) {
    const p = c.parameters, before = [state(p.actor, 0), state(p.target, 1)];
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index, elapsed: .01, outcome: p.expected,
        reason: '', before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        actions: [], attacks: [], directs: [], passives: [], defenses: [], dodge_checks: [], launches: [],
        refusals: [], callbacks: [], dropped: [], terminals: [], interfaces: [], skill_messages: [] };
    if (c.method === 'practice') {
        const reason = '九阳神功只能用学(learn)的来增加熟练度。\n';
        raw.command_accepted = 0; raw.reason = '\x1b[256D\x1b[K' + reason;
        raw.immediate[0].temp.notify_fail = reason; raw.immediate[0].temp.time = { practice: 100 };
    } else {
        raw.command_accepted = p.interface_repetitions; raw.interface_steps = [];
        let current = structuredClone(before[0]);
        for (let i = 0; i < p.interface_repetitions; i++) {
            const start = structuredClone(current), after = structuredClone(current);
            let result, reason = '', messages = [];
            if (p.ability === 'difficult_level') result = (p.actor.skills['liumai-shenjian'] ?? 0) > 200 && !p.actor.properties.reborn ? 1400 : 1000;
            else {
                assert.equal(p.variant, 'repeat-ineligible', 'only explicit double-call fixture');
                result = i ? 0 : 1;
                if (!i) {
                    after.cultivation[permission] = 1;
                    messages = [{ side: 0, type: 'write', text: '你学会了利用九阳神功驾御兵器！\n' }];
                } else {
                    reason = '你对刀剑功夫的理解还不够，无法继续领会更高深的九阳神功。\n';
                    after.temp.notify_fail = reason;
                }
            }
            const implemented_by = '/kungfu/skill/jiuyang-shengong';
            raw.interface_steps.push({ command: 'test_interface', entry_actor: current.object, return_actor: current.object,
                before: start, after, result, reason, messages, implemented_by });
            raw.interfaces.push({ object: p.interface.object, function: p.ability, result, implemented_by }); current = after;
        }
        raw.immediate[0] = current;
        raw.skill_messages = structuredClone(raw.interface_steps.flatMap(step => step.messages));
    }
    raw.after = structuredClone(raw.immediate); return envelope(raw, c);
}

test('factory is exactly 37/74 deterministic qualification, difficulty and forbidden-practice conditions', () => {
    assert.equal(cases.length, 37); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 74);
    assert.equal(mingjiaoJiuyangLearningConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 74);
    assert.equal(cases.filter(c => c.parameters.ability === 'valid_learn').length, 32);
    assert.equal(cases.filter(c => c.parameters.interface_repetitions === 2).length, 4);
    const c = pick('repeat-ineligible'), s = mingjiaoJiuyangLearningReport([], c);
    assert.equal(s.context.source_count, 125); assert.equal(s.effects, null); assert.equal(s.coverage.missing, 2);
    assert.match(mingjiaoJiuyangLearningMarkdown(s), /未观测/);
});

test('same USER first-call permission and second-call refusal are [1,0], not two learned iterations', () => {
    const c = pick('repeat-ineligible'), rows = [known(c), known(c, 1)], before = structuredClone(rows);
    const s = mingjiaoJiuyangLearningReport(rows, c), e = s.effects;
    assert.deepEqual(s.steps.map(step => step.result), [1, 0, 1, 0]);
    assert.equal(e.commands, 4); assert.equal(e.commands_accepted, 4); assert.equal(e.interface_calls, 4);
    assert.equal(e.allowed, 2); assert.equal(e.refused, 2); assert.equal(e.flag_set, 2);
    assert.deepEqual(e.interface_values, { '0': 2, '1': 2 });
    assert.equal(s.coverage.observed, 2); assert.equal(s.coverage.refused, 0);
    assert.equal(e.learned_points, 0); assert.equal(e.net_learned, 0);
    assert.equal(s.steps[0].permission_before, 0); assert.equal(s.steps[1].permission_before, 1);
    const md = mingjiaoJiuyangLearningMarkdown(s);
    assert.match(md, /逐次接口调用/); assert.match(md, /次调拒绝/); assert.match(md, /不是授课/);
    assert.doesNotMatch(md, /伤害排行|0DPS/); assert.deepEqual(rows, before);
});

test('difficulty 1400 and forbidden practice are original observations, not experience or paid learning', () => {
    const d = pick('difficulty-six201-reborn0'), s = mingjiaoJiuyangLearningReport([known(d)], d);
    assert.deepEqual(s.effects.interface_values, { '1400': 1 }); assert.equal(s.effects.allowed, 1);
    assert.equal(s.effects.skill_upgrades, 0); assert.match(mingjiaoJiuyangLearningMarkdown(s), /非零难度返回/);
    const p = pick('practice-forbidden'), r = mingjiaoJiuyangLearningReport([known(p)], p);
    assert.equal(r.coverage.refused, 1); assert.equal(r.effects.practice_attempts, 1); assert.equal(r.effects.practice_completed, 0);
    assert.equal(r.effects.jing_cost, 0); assert.equal(r.effects.neili_cost, 0); assert.equal(r.effects.commands_accepted, 0);
    assert.match(mingjiaoJiuyangLearningMarkdown(r), /练习拒绝/); assert.doesNotMatch(mingjiaoJiuyangLearningMarkdown(r), /接口原返回分类/);
});

test('error and not-applicable metadata remain unknown before state; missing samples are not synthetic zero', () => {
    const c = pick('repeat-ineligible'), rows = [diagnostic(c), diagnostic(c, 'not_applicable', 1)];
    const s = mingjiaoJiuyangLearningReport(rows, c);
    assert.deepEqual(s.coverage, { planned: 2, recorded: 2, observed: 0, refused: 0, error: 1, not_applicable: 1, known: 0, unknown: 2, missing: 0 });
    assert.equal(s.effects.commands, null); assert.equal(s.effects.jing_cost, null); assert.equal(s.effects.flag_set, null);
    assert.deepEqual(s.steps, []); assert.match(mingjiaoJiuyangLearningMarkdown(s), /未知/);
    const mixed = mingjiaoJiuyangLearningReport([known(c), diagnostic(c, 'error', 1)], c);
    assert.equal(mixed.effects.interface_calls, null); assert.deepEqual(mixed.effects.interface_values, { '0': 1, '1': 1 });
    assert.equal(mixed.steps.length, 2); mingjiaoJiuyangLearningMarkdown(mixed);
});

test('ledger identity, method, reason, index, raw SHA and duplicates fail closed', () => {
    const c = pick('repeat-ineligible'), good = diagnostic(c);
    for (const mutate of [r => r.index = null, r => r.index = -1, r => r.raw.index = c.samples,
        r => r.condition_id = 'wrong', r => r.raw.condition_id = 'wrong', r => r.condition_sha256 = '0'.repeat(64),
        r => r.raw.method = 'perform',
        r => r.raw.elapsed = null, r => r.raw.kind = 'wrong', r => r.reason = 'different',
        r => r.raw.reason = '', r => delete r.raw.reason, r => r.outcome = 'observed']) {
        const wrong = structuredClone(good); mutate(wrong); wrong.raw_sha256 = digest(wrong.raw);
        assert.throws(() => mingjiaoJiuyangLearningReport([wrong], c));
    }
    const badHash = structuredClone(good); badHash.raw_sha256 = '0'.repeat(64);
    assert.throws(() => mingjiaoJiuyangLearningReport([badHash], c));
    assert.throws(() => mingjiaoJiuyangLearningReport([good, good], c));
});

test('normal traces reject missing steps, wrong source, flag/result swaps and hidden resource changes', () => {
    const c = pick('repeat-ineligible'), good = known(c);
    for (const mutate of [r => delete r.raw.interface_steps, r => delete r.raw.metrics,
        r => delete r.raw.skill_messages, r => r.raw.skill_messages = [],
        r => r.raw.interface_steps[0].implemented_by = '/inherit/skill/skill',
        r => r.raw.interface_steps[1].entry_actor = r.raw.before[1].object,
        r => r.raw.interface_steps[1].result = 1, r => r.raw.interface_steps[0].messages = [],
        r => r.raw.after[0].neili--]) {
        const wrong = structuredClone(good); mutate(wrong); wrong.raw_sha256 = digest(wrong.raw);
        assert.throws(() => mingjiaoJiuyangLearningReport([wrong], c));
    }
    const drift = structuredClone(c); drift.parameters.source_evidence[path] = '0'.repeat(64);
    assert.throws(() => mingjiaoJiuyangLearningReport([good], drift));
});

test('renderer preserves qualification/call denominators, original values and escaped messages', () => {
    const c = pick('repeat-ineligible'), s = mingjiaoJiuyangLearningReport([known(c)], c);
    for (const mutate of [r => r.effects.interface_values = { '1': 1 }, r => r.effects.commands = 1,
        r => r.effects.flag_set = 2, r => r.effects.skill_upgrades = 1, r => r.coverage.missing = 0]) {
        const bad = structuredClone(s); mutate(bad); assert.throws(() => mingjiaoJiuyangLearningMarkdown(bad));
    }
    const original = JSON.stringify(s), displayed = structuredClone(s);
    displayed.steps[0].messages[0].text = '<script>|`\x1b[31m';
    displayed.steps[1].reason = '<reason>|`';
    const md = mingjiaoJiuyangLearningMarkdown(displayed);
    assert.match(md, /&lt;script&gt;/); assert.match(md, /&lt;reason&gt;/); assert.doesNotMatch(md, /<script>|<reason>|\x1b/);
    assert.equal(JSON.stringify(s), original);
    const unknown = mingjiaoJiuyangLearningReport([diagnostic(c)], c); unknown.effects.neili_cost = 0;
    assert.throws(() => mingjiaoJiuyangLearningMarkdown(unknown));
});
