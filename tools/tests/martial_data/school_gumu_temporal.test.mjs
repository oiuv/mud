import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { schoolCombatEffects, schoolCombatMarkdown } from './school_combat_report.mjs';
import { gumuComboConditions } from './school_gumu_combo_cases.mjs';
import { gumuHuboConditions } from './school_gumu_hubo_cases.mjs';
import { gumuTemporalConditions, validateGumuTemporalRecord, gumuTemporalEffects,
    gumuTemporalFixtureRequirements } from './school_gumu_temporal_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = gumuTemporalConditions(catalog), smoke = gumuTemporalConditions(catalog, { smoke: true });
const clone = value => structuredClone(value);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

// Synthetic observations only. No driver, fake clock or forced random enters a real run.
function states(c) {
    const configs = [c.parameters.actor, c.parameters.target, ...(c.parameters.extra_target ? [c.parameters.extra_target] : [])];
    return configs.map((cfg, side) => ({
        object: `/tests/actor#${side + 1}`, id: ['left', 'right', 'third'][side], environment: '/tests/runner',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: null,
        qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
        neili: 6000, max_neili: 6000,
        ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')),
        skills: clone(cfg.skills), learned: {}, mappings: clone(cfg.mappings), preparations: clone(cfg.preparations),
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) - Number(key === 'dodge' && !!cfg.equipment)])),
        weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? null, clock_seconds: 1000,
        temp: { apply: cfg.equipment ? { dodge: -1 } : {} },
        hostility: { enemies: side ? ['left'] : ['right', ...(configs.length === 3 ? ['third'] : [])],
            killers: side ? ['left'] : ['right', ...(configs.length === 3 ? ['third'] : [])], wants: [] },
    }));
}

function base(c) {
    const initial = states(c);
    return { method: 'perform', outcome: 'observed', command_accepted: 1,
        before: clone(initial.slice(0, 2)), metrics: [{}, {}], launches: [], attacks: [], directs: [],
        terminals: [], dropped: [], ...(initial.length === 3 ? { extra_target_before: clone(initial[2]), extra_target_metrics: {} } : {}) };
}

function cooldownRow(c = cases[0], recovered = 0) {
    const raw = base(c); raw.temporal_steps = [];
    const current = clone(raw.before), metrics = [{}, {}];
    const phases = ['initial', 'early', 'expired'];
    function add(side, key, amount) { metrics[side][key] = (metrics[side][key] ?? 0) + amount; }
    for (const [index, phase] of phases.entries()) {
        if (index) {
            for (const s of current) s.clock_seconds = index === 1 ? 1004 : 1060;
            current[0].busy = 0;
            for (const side of [0, 1]) add(side, 'heartbeats', index === 1 ? 2 : 28);
            current[1].qi -= 250; add(1, 'qi_cost', 250); add(0, 'hit', 1);
            raw.attacks.push({ actor: 0, target: 1, type: 0, result: 1, damage: 250 });
            if (index === 2 && recovered) { current[0].neili += recovered; add(0, 'neili_recovery', recovered); }
        }
        const step = { phase, action: c.parameters.action, before: clone(current), metrics_before: clone(metrics),
            launches_before: raw.launches.length, directs_before: raw.directs.length,
            accepted: Number(index !== 1), reason: '' };
        if (index !== 1) {
            current[0].neili -= 400; add(0, 'neili_cost', 400); add(0, 'direct', 1);
            current[0].busy = 2; current[0].temp.last_perform = { 'sad-strike': { tuo: current[0].clock_seconds } };
            current[0].learned['sad-strike'] = (current[0].learned['sad-strike'] ?? 0) + 1;
            current[1].qi -= 600; current[1].eff_qi -= 400; add(1, 'qi_cost', 600); add(1, 'eff_qi_cost', 400);
            raw.launches.push({ actor: current[0].object, skill: 'sad-strike', argument: 'tuo right' });
            raw.directs.push({ actor: 0, target: 1, type: 0, damage: 800, percent: 120, weapon: 'none', weapon_object: '' });
        } else {
            step.reason = '你刚刚施展完拖泥带水，现在心情没有那么郁闷了。';
            current[0].temp.notify_fail = step.reason;
        }
        Object.assign(step, { after: clone(current), metrics_after: clone(metrics),
            launches_after: raw.launches.length, directs_after: raw.directs.length });
        raw.temporal_steps.push(step);
        if (!index) raw.immediate = clone(current);
    }
    raw.after = clone(current); raw.metrics = clone(metrics); return raw;
}

function targetsRow(c = cases[1], controls = [true, true]) {
    const raw = base(c), current = [...clone(raw.before), clone(raw.extra_target_before)];
    raw.hubo_steps = []; raw.busy_calls = [];
    let retainedBusy = 0;
    for (let index = 0; index < 2; index++) {
        const target = index + 1;
        current[0].busy = 0;
        const step = { argument: c.parameters.perform_arguments[index], before: clone(current), accepted: Number(!current[target].busy), reason: '' };
        if (step.accepted) {
            current[0].neili -= 60; raw.metrics[0].neili_cost = (raw.metrics[0].neili_cost ?? 0) + 60;
            current[0].learned['tianluo-diwang'] = (current[0].learned['tianluo-diwang'] ?? 0) + 1;
            if (controls[index]) {
                raw.busy_calls.push({ side: target, caller_side: 0, requested: 27, before: current[target].busy, after: 27 });
                current[target].busy = 27;
            }
            current[0].busy = controls[index] ? 2 : 1;
            raw.busy_calls.push({ side: 0, caller_side: 0, requested: controls[index] ? 3 : 1, before: 0, after: current[0].busy });
            raw.launches.push({ actor: current[0].object, skill: 'tianluo-diwang', argument: ['wang right', 'wang third'][index] });
        } else {
            step.reason = '第三位演武弟子目前正自顾不暇，放胆攻击吧！';
            current[0].temp.notify_fail = step.reason;
        }
        retainedBusy = Math.max(retainedBusy, current[0].busy);
        step.after = clone(current); raw.hubo_steps.push(step);
    }
    current[0].busy = retainedBusy;
    raw.immediate = clone(current.slice(0, 2)); raw.after = clone(raw.immediate);
    raw.extra_target_immediate = clone(current[2]); raw.extra_target_after = clone(current[2]); return raw;
}

test('只冻结3条件202正式和5烟雾，不实施冰火或闭包忙乱', () => {
    assert.equal(hash(cases), '48739aa1dc7aa154420fb34e85cf4f4308e2c6508d7838a9cf37da2cea3a8a61');
    assert.equal(hash(smoke), 'f132e45214507b6aba120d4dc0e5f34536973b2bf1a08183a7783d18a30cae63');
    assert.equal(cases.length, 3); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 202);
    assert.equal(smoke.length, 3); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 5);
    assert.equal(new Set(cases.map(c => c.id)).size, 3);
    for (const [index, c] of cases.entries()) {
        assert.equal(c.status, 'configured_not_executed'); assert.equal(c.parameters.expected, 'observed');
        assert.deepEqual({ ...c, samples: smoke[index].samples }, smoke[index]);
        assert.equal(c.method, 'perform'); assert.equal(c.parameters.collection_group, 'gumu-temporal');
        assert.ok(!JSON.stringify(c).includes('fireice')); assert.ok(!JSON.stringify(c).includes('stop_busy'));
    }
    assert.ok(gumuTemporalFixtureRequirements.some(s => s.includes('original USER heartbeats')));
    assert.ok(gumuTemporalFixtureRequirements.some(s => s.includes('all three USERs')));
    assert.throws(() => gumuTemporalConditions(catalog, { smoke: 'true' }));
    assert.throws(() => gumuTemporalConditions({ skills: [] }));
});

test('原矩阵不改，拖泥仅改变高气血初值，互搏保留真实资格与随机', () => {
    const combo = gumuComboConditions(catalog), hubo = gumuHuboConditions(catalog);
    const old = [hash(combo), hash(hubo)];
    const original = combo.find(c => c.id === 'school-gumu-combo-sad-strike-tuo-l200-low-defense').parameters;
    for (const side of ['actor', 'target']) {
        const restored = clone(cases[0].parameters[side]);
        for (const field of ['qi', 'eff_qi', 'max_qi']) { assert.equal(restored.properties[field], 1000000); delete restored.properties[field]; }
        assert.deepEqual(restored, original[side]);
    }
    for (const c of cases.slice(1)) {
        const p = c.parameters, baseline = hubo.find(r => r.id === 'school-gumu-hubo-perform-l360').parameters;
        assert.deepEqual(p.actor, baseline.actor);
        assert.equal(p.target.skills.dodge, 200); assert.equal(p.extra_target.skills.dodge, 200);
        assert.deepEqual(p.target, { ...baseline.target, skills: { ...baseline.target.skills, dodge: 200 } });
        assert.deepEqual({ ...p.extra_target, busy: undefined }, { ...p.target, busy: undefined });
        assert.equal(p.action, 'perform strike.wang right and strike.wang third');
        assert.equal(p.observe_seconds, 0); assert.equal(p.fighting, true);
        assert.equal(p.actor.skills['zuoyou-hubo'], 360); assert.equal(p.actor.skills['tianluo-diwang'], 400);
        assert.equal((400 - 1 - Math.trunc(p.target.skills.dodge / 2)) / 400, 299 / 400);
    }
    gumuTemporalConditions(catalog);
    assert.deepEqual([hash(gumuComboConditions(catalog)), hash(gumuHuboConditions(catalog))], old);
});

test('仅时序组补原输入别名并在准备阶段核对right与third精确对象', () => {
    const source = readFileSync(new URL('./runner.lpc', import.meta.url), 'utf8');
    const prepare = source.match(/void prepare_actor\(int side, mapping config\) \{[\s\S]*?\n\}/)?.[0];
    assert.ok(prepare);
    const names = prepare.slice(prepare.indexOf('ob->set("id"'), prepare.indexOf('foreach (key, value in config["properties"]'));
    assert.match(names, /else if \(current\["parameters"\]\["named_participants"\] \|\|\s*current\["parameters"\]\["collection_group"\] == "gumu-temporal"\)\s*ob->set_name\(side == 2 \? "旁试弟子" : side \? "右试弟子" : "左试弟子",\s*\(\{ side == 2 \? "third" : side \? "right" : "left" \}\)\);/);
    assert.match(names, /ob->move\(this_object\(\)\);[\s\S]*?if \(side && current\["parameters"\]\["collection_group"\] == "gumu-temporal"\) \{/);
    assert.match(names, /require\(ob->id\(side == 2 \? "third" : "right"\), "original temporal target input alias"\);/);
    assert.match(names, /require\(present\(side == 2 \? "third" : "right", this_object\(\)\) == ob,\s*"original temporal target resolves to prepared actor"\);/);
    assert.equal(cases[0].parameters.action, 'perform unarmed.tuo right');
    for (const c of cases.slice(1)) {
        assert.equal(c.parameters.action, 'perform strike.wang right and strike.wang third');
        assert.deepEqual(c.parameters.perform_arguments, ['strike.wang right', 'strike.wang third']);
    }
    const failed = cooldownRow();
    failed.command_accepted = 0;
    failed.temporal_steps[0].accepted = 0;
    failed.temporal_steps[0].reason = '这里没有right。\n';
    failed.temporal_steps[0].launches_after = 0;
    assert.throws(() => validateGumuTemporalRecord(failed, cases[0]));
});

test('自然三阶段与双目标所有控制分支的合成记录通过且不改raw', () => {
    const rows = [[cases[0], cooldownRow()], [cases[0], cooldownRow(cases[0], 80)],
        ...[false, true].flatMap(a => [false, true].map(b => [cases[1], targetsRow(cases[1], [a, b])])),
        ...[false, true].map(a => [cases[2], targetsRow(cases[2], [a, false])])];
    for (const [c, raw] of rows) {
        const original = JSON.stringify(raw); validateGumuTemporalRecord(raw, c); assert.equal(JSON.stringify(raw), original);
        assert.ok(!Object.hasOwn(raw, 'parameters'));
    }
});

test('自然冷却不接受忙乱拒绝、60秒前复用、时间戳改写或缺少阶段', () => {
    const changes = [
        r => { r.temporal_steps[1].before[0].busy = 1; },
        r => { r.temporal_steps[1].reason = '你上一个动作还没有完成'; },
        r => { r.temporal_steps[1].before[0].clock_seconds = 1060; },
        r => { r.temporal_steps[2].before[0].clock_seconds = 1059; },
        r => { r.temporal_steps[1].before[0].temp.last_perform['sad-strike'].tuo = 999; },
        r => { r.temporal_steps[2].accepted = 0; },
        r => { r.temporal_steps.pop(); },
        r => { r.metrics[0].heartbeats = 0; },
        r => { r.temporal_steps[1].metrics_after[0].heartbeats++; },
    ];
    for (const change of changes) { const raw = cooldownRow(); change(raw); assert.throws(() => validateGumuTemporalRecord(raw, cases[0])); }
});

test('三阶段原直伤、来源、每招资源账与等待窗口分开', () => {
    const changes = [
        r => { r.directs[0].target = 0; }, r => { r.directs[1].type = 1; },
        r => { r.directs[1].percent = 100; }, r => { r.directs[0].damage = 10; },
        r => { r.launches[0].actor = r.before[1].object; },
        r => { r.temporal_steps[1].launches_after++; },
        r => { r.temporal_steps[2].metrics_after[0].neili_cost = 720; },
        r => { r.temporal_steps[0].metrics_before[0].neili_cost = 1; },
        r => { delete r.temporal_steps[1].metrics_before; },
        r => { delete r.metrics[0].neili_recovery; },
    ];
    for (const change of changes) { const raw = cooldownRow(cases[0], 80); change(raw); assert.throws(() => validateGumuTemporalRecord(raw, cases[0])); }
    const raw = cooldownRow(cases[0], 80), report = gumuTemporalEffects([{ outcome: 'observed', raw }], cases[0]);
    assert.equal(raw.before[0].neili - raw.after[0].neili, 720);
    assert.equal(report.command_neili_cost.n, 3); assert.equal(report.command_neili_cost.max, 400);
    assert.equal(report.waiting_neili_cost.mean, 0); assert.equal(report.total_neili_recovery.mean, 80);
    assert.equal(report.mechanism_only, true); assert.equal(report.cooldown_age_seconds.mean, 60);
});

test('不同目标必须实际三USER同场且各有原敌对关系', () => {
    const changes = [
        r => { r.extra_target_before.object = r.before[1].object; },
        r => { r.extra_target_before.id = 'right'; },
        r => { r.extra_target_before.userp = 0; },
        r => { r.extra_target_before.interactive = 0; },
        r => { r.extra_target_before.environment = '/tests/elsewhere'; },
        r => { r.extra_target_before.hostility.enemies = []; },
        r => { r.before[0].hostility.killers = ['right']; },
        r => { delete r.extra_target_before; },
        r => { r.hubo_steps[0].before.pop(); },
        r => { r.hubo_steps[1].argument = 'strike.wang right'; },
        r => { r.launches[1].argument = 'wang right'; },
    ];
    for (const change of changes) { const raw = targetsRow(); change(raw); assert.throws(() => validateGumuTemporalRecord(raw, cases[1])); }
});

test('原命令保留完整目标参数及弱进度，不把真实增长当夹具写入', () => {
    const changes = [
        r => { r.launches[0].argument = 'wang'; },
        r => { r.hubo_steps[0].after[0].learned['tianluo-diwang'] = 0; },
        r => { r.hubo_steps[0].after[0].learned['tianluo-diwang'] = 2; },
        r => { r.hubo_steps[1].after[0].skills['tianluo-diwang']++; },
        r => { delete r.before[0].learned; },
    ];
    for (const change of changes) { const raw = targetsRow(); change(raw); assert.throws(() => validateGumuTemporalRecord(raw, cases[1])); }
    const rejected = targetsRow(cases[2]); rejected.hubo_steps[1].after[0].learned['tianluo-diwang']++;
    assert.throws(() => validateGumuTemporalRecord(rejected, cases[2]));
    const zero = cooldownRow();
    for (const states of [zero.immediate, zero.after, ...zero.temporal_steps.flatMap(s => [s.before, s.after])])
        if (Object.hasOwn(states[0].learned, 'sad-strike')) states[0].learned['sad-strike'] = 0;
    validateGumuTemporalRecord(zero, cases[0]);
    zero.temporal_steps[2].after[0].learned['sad-strike'] = 2;
    assert.throws(() => validateGumuTemporalRecord(zero, cases[0]));
});

test('仅第二目标已忙不扣第二次内力，不串改首目标或抹首招忙乱', () => {
    const changes = [
        r => { r.hubo_steps[1].accepted = 1; },
        r => { r.hubo_steps[1].reason = '内力不足'; },
        r => { r.hubo_steps[1].after[0].neili -= 60; },
        r => { r.hubo_steps[1].after[1].busy = 0; },
        r => { r.immediate[0].busy = 0; },
        r => { r.extra_target_immediate.busy = 27; },
        r => { r.extra_target_metrics.neili_cost = 60; },
        r => { r.metrics[0].neili_cost = 120; },
    ];
    for (const change of changes) { const raw = targetsRow(cases[2]); change(raw); assert.throws(() => validateGumuTemporalRecord(raw, cases[2])); }
    const raw = targetsRow(cases[2]), report = gumuTemporalEffects([{ outcome: 'observed', raw }], cases[2]);
    assert.equal(raw.command_accepted, 1); assert.equal(raw.launches.length, 1);
    assert.equal(report.second_refused, 1); assert.equal(report.neili_cost.mean, 60);
    assert.equal(report.targets[0].controlled.trials, 1); assert.equal(report.targets[1].controlled.trials, 0);
});

test('目标忙乱仍为27，只有施展者享受互搏忙乱减免', () => {
    const changes = [
        r => { r.busy_calls[0].side = 2; }, r => { r.busy_calls[0].caller_side = 1; },
        r => { r.busy_calls[0].after = 21; }, r => { r.busy_calls[1].requested = 1; },
        r => { r.hubo_steps[1].before[0].busy = 2; },
        r => { r.hubo_steps[0].after[2].busy = 27; },
        r => { r.hubo_steps[1].after[1].busy = 0; },
        r => { r.extra_target_metrics.heartbeats = 1; },
        r => { r.attacks.push({ actor: 0, target: 1 }); },
    ];
    for (const change of changes) { const raw = targetsRow(); change(raw); assert.throws(() => validateGumuTemporalRecord(raw, cases[1])); }
});

test('显式null忙乱可用，缺失/错误类型/终态及缺观察不能当零', () => {
    validateGumuTemporalRecord(targetsRow(), cases[1]);
    const changes = [
        r => { delete r.before[0].busy; }, r => { r.before[0].busy = false; },
        r => { r.before[0].busy = '0'; }, r => { delete r.before[0].clock_seconds; },
        r => { delete r.immediate[0].clock_seconds; }, r => { delete r.extra_target_metrics; },
        r => { r.extra_target_metrics = null; }, r => { r.metrics[0].neili_cost = null; },
        r => { r.terminals.push({ side: 1, event: 'unconscious' }); },
        r => { r.outcome = 'error'; }, r => { r.after[1].living = 0; },
    ];
    for (const change of changes) { const raw = targetsRow(); change(raw); assert.throws(() => validateGumuTemporalRecord(raw, cases[1])); }
});

test('报告只用冻结condition，缺字段与失败记录不混入有效控制分母', () => {
    const raw = targetsRow(cases[1], [true, false]), record = { outcome: 'observed', raw };
    const report = gumuTemporalEffects([record], cases[1]);
    assert.equal(report.valid, 1); assert.equal(report.targets[0].controlled.successes, 1);
    assert.equal(report.targets[1].controlled.successes, 0); assert.equal(report.targets[1].controlled.trials, 1);
    assert.equal(gumuTemporalEffects([record]).unknown, 1);
    assert.equal(gumuTemporalEffects([record], {}).unknown, 1);
    const missing = clone(record); delete missing.raw.extra_target_metrics;
    const bad = gumuTemporalEffects([missing, { outcome: 'error', raw: {} }], cases[1]);
    assert.equal(bad.valid, 0); assert.equal(bad.unknown, 1); assert.equal(bad.errors, 1);
    assert.equal(bad.targets[0].controlled.trials, 0); assert.equal(bad.neili_cost.n, 0);
});

test('Markdown 分列三次命令与等待费用，以及双目标各自受理分母', () => {
    const rows = [cooldownRow(cases[0], 37), targetsRow(cases[1], [true, false]), targetsRow(cases[2])];
    const conditions = cases.map((c, index) => ({ id: c.id, effects: schoolCombatEffects([]),
        gumu_temporal: gumuTemporalEffects([{ outcome: 'observed', raw: rows[index] }], c) }));
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-not-a-series', evidence_sha256: 'synthetic',
        totals: { conditions: 3, samples: 3, observed: 3, refused: 0, errors: 0 }, conditions });
    const cooldown = markdown.indexOf('## 古墓自然时序：拖泥带水冷却');
    const targets = markdown.indexOf('## 古墓双目标互搏：两次原施展分别观察');
    assert.ok(cooldown > 0 && targets > cooldown);
    assert.ok(!markdown.slice(0, cooldown).includes('school-gumu-temporal-'));
    assert.ok(!markdown.slice(cooldown, targets).includes(cases[1].id));
    for (const c of conditions) assert.equal(markdown.split(`| ${c.id} |`).length - 1, 1);
    assert.ok(markdown.includes(`| ${cases[0].id} | 1/0/0 | 1/1 | 60.00 | 266.67/0.00/400.00（3） | 0.00 | 37.00 |`));
    assert.ok(markdown.includes(`| ${cases[1].id} | 1/0/0 | 1 | 2.00 | 0 | 1/1 | 0/1 | 120.00 | 2.00 |`));
    assert.ok(markdown.includes(`| ${cases[2].id} | 1/0/0 | 1 | 1.00 | 1 | 1/1 | 0/0 | 60.00 | 2.00 |`));
    assert.match(markdown, /包含三次实际命令（含提前拒绝的零费用）/);
    assert.match(markdown, /不能把整段交锋损益当作绝招效果/);
    const missing = targetsRow(); delete missing.extra_target_metrics;
    const unknown = { id: cases[1].id, effects: schoolCombatEffects([]),
        gumu_temporal: gumuTemporalEffects([{ outcome: 'observed', raw: missing }], cases[1]) };
    const unknownMarkdown = schoolCombatMarkdown({ fingerprint: 'synthetic', evidence_sha256: 'synthetic',
        totals: { conditions: 1, samples: 1, observed: 1, refused: 0, errors: 0 }, conditions: [unknown] });
    assert.ok(unknownMarkdown.includes(`| ${cases[1].id} | 0/1/0 | 0 | 未知 | 0 | 0/0 | 0/0 | 未知 | 未知 |`));
});

test('真实createSeries/openSeries检查三个ID和来源；不启动驱动或建立正式样本', () => {
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-temporal-unit-'));
    try {
        const input = { inventory, catalog, conditions: cases, execution: { synthetic: true, driver_started: false } };
        const manifest = createSeries(directory, input);
        assert.deepEqual(openSeries(directory).identity.conditions, cases);
        assert.equal(openSeries(directory).fingerprint, manifest.fingerprint);
        createSeries(join(directory, 'smoke'), { ...input, conditions: smoke });
        assert.deepEqual(openSeries(join(directory, 'smoke')).identity.conditions, smoke);
        for (const id of ['school-gumu-时序', 'School-gumu-temporal', 'school.gumu.temporal']) {
            const invalid = clone(input); invalid.conditions[0].id = id;
            assert.throws(() => createSeries(join(directory, 'bad-id'), invalid), /条件 ID/);
        }
        const invalid = clone(input); invalid.conditions[0].entry_id += '-missing';
        assert.throws(() => createSeries(join(directory, 'bad-entry'), invalid), /入口不在源码/);
    } finally {
        assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + 'mud-gumu-temporal-unit-'));
        rmSync(directory, { recursive: true, force: true });
    }
});
