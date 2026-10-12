import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { buildCatalog } from './catalog.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { validateExpectedOutcomes, validateRecord } from './execution.mjs';
import { taohuaPassiveSourcePaths, taohuaPassiveConditions, taohuaPassiveBounds,
    validateTaohuaPassiveRecord, taohuaPassiveEffects } from './school_taohua_passive_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const sha = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const path = 'kungfu/skill/yuxiao-jian.c', text = read(path), parsed = scanSource(text);
assert.deepEqual(parsed.lexical_issues, []);
const fn = parsed.functions.find(value => value.name === 'hit_ob');
assert.ok(fn);
const weaponPath = 'include/weapon.h', weaponSource = read(weaponPath);
const catalogInventory = { source_fingerprint: sha('taohua-passive-selftest-only'),
    files: [{ path, sha256: sha(text), scope: 'skill', ...parsed },
        { path: weaponPath, sha256: sha(weaponSource), scope: 'header', ...scanSource(weaponSource) }],
    versions: { fixture: 'synthetic-only' } };
const catalog = buildCatalog(catalogInventory, 'dict ([])');
const cases = taohuaPassiveConditions(catalog, read), smoke = taohuaPassiveConditions(catalog, read, { smoke: true });
const choose = (variant = 'baseline', level = 200) => {
    const found = cases.find(value => value.parameters.variant === variant && value.parameters.level === level);
    assert.ok(found); return found;
};
const message = '\x1b[1;37m$N\x1b[1;37m手中演武兵器\x1b[1;37m发出阵阵箫音，让$n\x1b[1;37m感到难受至极。\n\x1b[0m';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];

function snapshot(cfg, side) {
    const special = key => key.includes('/') || key === 'character';
    const apply = { armor: 100, ...(cfg.equipment ? { damage: 50, dodge: -1 } : {}) };
    return { ...Object.fromEntries(Object.entries(cfg.properties).filter(([key]) => !special(key))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([key]) => special(key))),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, living: 1, ghost: 0, fighting_opponent: 0, busy: null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), learned: {}, temp: { apply }, conditions: null,
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) => [key,
            Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_con: cfg.properties.con + Math.trunc(cfg.skills.force / 10), effective_str: cfg.properties.str,
        weapon: cfg.equipment ? 'sword' : 'none', weapon_damage: cfg.equipment ? 50 : 0,
        weapon_flag: cfg.equipment ? 4 : 0, weapon_details: cfg.equipment ? {
            object: '/tests/sword#200', program: '/tests/sword', skill_type: 'sword', weight: 3000,
            damage: 50, flag: 4, consistence: 100, material: null, rigidity: null, no_wield: null,
        } : {}, secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {}, ammunition: 0 };
}

function sync(raw) {
    raw.after = structuredClone(raw.immediate);
    const e = raw.passives[0]; e.before = structuredClone(raw.before); e.after = structuredClone(raw.immediate);
    e.neili_after = raw.immediate[0].neili; e.target_eff_qi_after = raw.immediate[1].eff_qi;
    e.target_busy_after = raw.immediate[1].busy;
    raw.interfaces[0].result = e.result;
    raw.metrics = [{}, {}];
    for (const side of [0, 1]) for (const key of health) {
        const cost = raw.before[side][key] - raw.immediate[side][key];
        if (cost) raw.metrics[side][key + '_cost'] = cost;
    }
    return raw;
}

function record(condition = choose(), { triggered = false, wound, result = null } = {}) {
    const p = condition.parameters;
    const before = [snapshot(p.actor, 0), snapshot(p.target, 1)], immediate = structuredClone(before);
    if (triggered) {
        const requested = wound ?? Math.trunc(p.interface.damage * 2 / 3);
        immediate[0].neili -= 60;
        immediate[1].eff_jing = Math.max(-1, before[1].eff_jing - requested);
        immediate[1].jing = Math.min(before[1].jing, immediate[1].eff_jing);
    }
    return sync({ kind: 'sample', condition_id: condition.id, method: 'interface', outcome: 'observed',
        reason: '', command_accepted: 53, index: 0, elapsed: 0.001, before, immediate,
        passives: [{ actor: 0, target: 1, route: 'interface', skill: 'yuxiao-jian', incoming: p.interface.damage,
            factor: 0, result: triggered ? message : result }],
        interfaces: [{ object: p.interface.object, function: 'hit_ob' }], actions: [], attacks: [],
        defenses: [], dodge_checks: [], launches: [], refusals: [], callbacks: [], terminals: [], dropped: [], skill_loads: [] });
}
const wrap = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
const validate = (raw, c) => { validateRecord(raw, c); return validateTaohuaPassiveRecord(raw, c); };

test('16 个独立条件：1110 正式计划、16 烟雾，不改变随机或展开排列', () => {
    assert.equal(cases.length, 16); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1110);
    assert.equal(smoke.length, 16); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 16);
    assert.equal(new Set(cases.map(c => c.id)).size, 16);
    assert.deepEqual(taohuaPassiveConditions(catalog, read), cases);
    assert.deepEqual(cases.map(({ samples, ...c }) => c), smoke.map(({ samples, ...c }) => c));
    assert.equal(cases.filter(c => c.samples === 2).length, 5);
    assert.equal(cases.filter(c => c.samples === 100).length, 11);
    assert.equal(sha(cases), '1c34e98de633e6777e87df2a565ca6088ca0dbc0591e20a471051e490b289f0a');
    assert.equal(sha(smoke), 'ca8207fd1539745c1e34f39f78854bd668211486bfcd3aa457fcb0afc4f2eb0b');
    assert.equal(sha(Object.entries(cases[0].parameters.source_evidence)),
        '50587944c58350ab57a47120530555f4858b54fe2b30d30ce94a908ffbb474d3');
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    for (const c of cases) {
        assert.match(c.id, /^[a-z][a-z0-9_-]*$/);
        assert.equal(c.parameters.observe_seconds, 0); assert.equal(c.parameters.fighting, false);
        assert.equal(c.parameters.expected, 'observed');
        assert.equal(Object.keys(c.parameters.source_evidence).length, taohuaPassiveSourcePaths.length);
        assert.equal(c.parameters.actor.equipment.type, 'sword');
        assert.equal(Object.hasOwn(c.parameters.actor, 'temp'), false);
        assert.equal(c.parameters.actor.mappings.force, undefined);
    }
});

test('缺源、失配摘要、伪造入口或无效采样参数不得生成条件', () => {
    for (const options of [{ samples: 0 }, { samples: -1 }, { samples: 1.5 }])
        assert.throws(() => taohuaPassiveConditions(catalog, read, options));
    assert.throws(() => taohuaPassiveConditions(catalog, undefined));
    assert.throws(() => taohuaPassiveConditions(catalog, file => file === path ? '' : read(file)));
    assert.throws(() => taohuaPassiveConditions(catalog, file => file === path ? read(file) + '\n' : read(file)));
    for (const mutate of [c => { c.skills[0].entries = []; }, c => { c.skills[0].path = 'fake.c'; },
        c => { c.skills[0].entries.find(e => e.function === 'hit_ob').id = 'fake:1:hit_ob'; },
        c => { c.skills[0].entries.find(e => e.function === 'hit_ob').role = 'perform'; },
        c => { delete c.skills[0].entries.find(e => e.function === 'hit_ob').evidence; }]) {
        const bad = structuredClone(catalog); mutate(bad); assert.throws(() => taohuaPassiveConditions(bad, read));
    }
});

test('真实离线 createSeries/openSeries 验证原入口及标识，未冒充全局注册', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mud-taohua-passive-ledger-'));
    const inventory = { source_fingerprint: catalog.source_fingerprint, versions: { fixture: 'synthetic-only' } };
    const options = { inventory, catalog, conditions: cases, execution: { collection: 'school-combat', synthetic_only: true } };
    try {
        const manifest = createSeries(join(dir, 'valid'), options);
        assert.deepEqual(openSeries(join(dir, 'valid'), manifest.identity).identity.conditions, cases);
        const smokeManifest = createSeries(join(dir, 'smoke'), { ...options, conditions: smoke });
        assert.deepEqual(openSeries(join(dir, 'smoke'), smokeManifest.identity).identity.conditions, smoke);
        assert.throws(() => createSeries(join(dir, 'valid'), options));
        for (const [name, mutate] of [
            ['id', c => { c[0].id += '/invalid'; }], ['entry', c => { c[0].entry_id += '-fake'; }],
            ['duplicate', c => { c[1].id = c[0].id; }], ['samples', c => { c[0].samples = 0; }],
        ]) {
            const bad = structuredClone(cases); mutate(bad);
            assert.throws(() => createSeries(join(dir, name), { ...options, conditions: bad }));
        }
        const changed = structuredClone(manifest.identity); changed.conditions[0].parameters.interface.damage++;
        assert.throws(() => openSeries(join(dir, 'valid'), changed));
    } finally {
        assert.equal(dirname(resolve(dir)), resolve(tmpdir()));
        assert.ok(basename(dir).startsWith('mud-taohua-passive-ledger-'));
        rmSync(dir, { recursive: true, force: true });
    }
});

test('16 条均接受真实空返回；命令返回成本不伪装成被动成功', () => {
    for (const c of cases) for (const value of [0, null]) {
        const raw = record(c, { result: value });
        assert.equal(validate(raw, c).triggered, false);
        for (const cost of [1, 319]) { raw.command_accepted = cost; validate(raw, c); }
    }
    for (const cost of [0, null, undefined, -1, '1', 0.5]) {
        const raw = record(); raw.command_accepted = cost;
        assert.throws(() => validate(raw, choose()));
    }
});

test('11 个随机条件的原支持端点，普通剑无箫资格也能产生原返回', () => {
    for (const c of cases.filter(c => c.samples === 100)) {
        const before = record(c).before, bound = taohuaPassiveBounds(...before, c.parameters.interface.damage);
        assert.equal(bound.eligible, true);
        for (const wound of [bound.source_wound_min, bound.source_wound_max])
            assert.equal(validate(record(c, { triggered: true, wound }), c).triggered, true);
    }
    const c = choose('chuixiao-absent'), before = record(c).before;
    assert.equal(Object.hasOwn(before[0].skills, 'chuixiao-jifa'), false);
    assert.deepEqual(taohuaPassiveBounds(...before, 600), {
        eligible: true, effective_chuixiao: 0, source_wound_min: 400, source_wound_max: 400,
    });
    assert.equal(taohuaPassiveBounds(...record(choose('chuixiao400')).before, 600).source_wound_max, 499);
});

test('五个确定守卫与 119/120、581/582 的有效根骨比较', () => {
    for (const c of cases.filter(c => c.samples === 2)) {
        assert.equal(validate(record(c), c).eligible, false);
        assert.throws(() => validate(record(c, { triggered: true }), c));
    }
    assert.equal(record().before[1].effective_con, 96);
    assert.equal(record(choose('incoming120-con19')).before[1].effective_con, 19);
    const c = choose('incoming581-con96'), bad = record(c, { triggered: true });
    bad.before[1].effective_con = 36;
    assert.throws(() => validate(sync(bad), c), '不能用原始根骨替换原 query_con');
});

test('两项精神夹制分别计量，-1 不是已发生昏迷或死亡', () => {
    const lower = choose('jing-below-eff'), small = record(lower, { triggered: true, wound: 449 });
    const a = validate(small, lower);
    assert.equal(a.eff_jing_loss, 449); assert.equal(a.jing_loss, 0);
    const clipped = choose('eff-jing-clipped');
    for (const wound of [400, 449]) {
        const raw = record(clipped, { triggered: true, wound }), result = validate(raw, clipped);
        assert.equal(result.eff_jing_loss, 201); assert.equal(result.jing_loss, 101);
        assert.equal(raw.after[1].eff_jing, -1); assert.equal(raw.after[1].jing, -1);
        assert.equal(raw.after[1].living, 1); assert.equal(raw.after[1].ghost, 0);
        assert.deepEqual(raw.terminals, []); assert.equal(result.clipped, true);
    }
    const raw = record(clipped, { triggered: true });
    raw.metrics[1].eff_jing_cost = 400;
    assert.throws(() => validate(raw, clipped), '不能把原请求400当实际夹制损失201');
});

test('非夹制支持区间、当前精神夹制和 60 内力费用不可被净账替代', () => {
    const c = choose();
    for (const wound of [399, 450]) assert.throws(() => validate(record(c, { triggered: true, wound }), c));
    for (const mutate of [
        r => { r.immediate[0].neili++; }, r => { r.immediate[1].jing++; },
        r => { r.immediate[1].qi--; }, r => { r.immediate[0].jing--; },
        r => { r.immediate[1].neili--; }, r => { r.immediate[1].eff_qi--; },
    ]) { const raw = record(c, { triggered: true }); mutate(raw); assert.throws(() => validate(sync(raw), c)); }
    for (const side of [0, 1]) for (const key of health) {
        const raw = record(c, { triggered: true });
        raw.metrics[side][key + '_cost'] = (raw.metrics[side][key + '_cost'] ?? 0) + 1;
        raw.metrics[side][key + '_recovery'] = 1;
        assert.throws(() => validate(raw, c));
    }
});

test('返回、接口与被动的归属/前后值不可用空缺或伪造文本代替', () => {
    const c = choose();
    for (const value of [undefined, false, true, 1, -1, '', '箫音', message.replace('演武兵器', '玉箫')]) {
        const raw = record(c); raw.passives[0].result = value;
        raw.interfaces[0].result = value; assert.throws(() => validate(raw, c));
    }
    for (const mutate of [
        r => { delete r.passives[0].result; }, r => { delete r.interfaces[0].result; },
        r => { r.passives[0].actor = -1; }, r => { r.passives[0].target = 0; },
        r => { r.passives[0].skill = 'other'; }, r => { r.passives[0].route = 'martial'; },
        r => { r.passives[0].incoming++; }, r => { r.passives[0].factor = null; },
        r => { r.interfaces[0].object = '/kungfu/skill/other'; }, r => { r.interfaces[0].function = 'perform'; },
        r => { r.passives[0].after[1].object = r.before[0].object; },
        r => { r.passives[0].target_eff_qi_after--; }, r => { delete r.passives[0].target_busy_after; },
        r => { r.passives[0].neili_after++; },
    ]) { const raw = record(c); mutate(raw); assert.throws(() => validate(raw, c)); }
});

test('合法 0/null 与缺键分别处理；身份、整张技能与实际装备不得漂移', () => {
    const c = choose();
    for (const empty of [0, null]) {
        const raw = record(c);
        for (const pair of [raw.before, raw.immediate]) for (const state of pair) {
            state.busy = empty; state.conditions = empty;
        }
        validate(sync(raw), c);
    }
    for (const mutate of [
        r => { delete r.before[0].busy; }, r => { delete r.before[1].conditions; },
        r => { r.before[0].wizardp = 1; }, r => { delete r.before[0].playerp; },
        r => { r.before[1].object = r.before[0].object; }, r => { r.before[0].skills.extra = 100; },
        r => { r.before[0].effective_skills['chuixiao-jifa'] = null; },
        r => { delete r.before[0].effective_skills['chuixiao-jifa']; },
        r => { r.before[0].temp.apply.attack = 1; }, r => { r.before[0].fighting_opponent = 1; },
        r => { delete r.before[0].weapon_details.rigidity; }, r => { r.before[0].weapon_details.no_wield = 1; },
        r => { r.immediate[0].weapon_details.consistence = 99; },
        r => { r.immediate[0].learned['yuxiao-jian'] = 1; }, r => { r.immediate[1].skills.force++; },
        r => { r.immediate[1].living = 0; },
    ]) { const raw = record(c); mutate(raw); assert.throws(() => validate(sync(raw), c)); }
});

test('额外攻击/直伤/心跳、缺计数和非整数零均拒绝', () => {
    const c = choose();
    for (const key of ['actions', 'attacks', 'defenses', 'dodge_checks', 'launches', 'refusals',
        'callbacks', 'terminals', 'dropped', 'skill_loads', 'directs', 'attack_rounds']) {
        const raw = record(c); raw[key] = [{}]; assert.throws(() => validate(raw, c));
    }
    for (const key of ['hit', 'dodge', 'parry', 'quick', 'riposte', 'direct', 'heartbeats', 'neili_cost'])
        for (const value of [1, null, undefined, '0', -1, 0.5]) {
            const raw = record(c); raw.metrics[0][key] = value; assert.throws(() => validate(raw, c));
        }
    for (const mutate of [r => { delete r.metrics; }, r => { r.metrics[1] = null; },
        r => { delete r.actions; }, r => { delete r.immediate; }, r => { r.passives = []; }]) {
        const raw = record(c); mutate(raw); assert.throws(() => validate(raw, c));
    }
});

test('纯命中接口两侧均无绝招发动，缺省零与显式零保留，伪造计数拒绝', () => {
    const c = choose();
    for (const triggered of [false, true]) for (const side of [0, 1]) {
        const raw = record(c, { triggered });
        assert.equal(Object.hasOwn(raw.metrics[side], 'ability_launched'), false);
        validate(raw, c);
        raw.metrics[side].ability_launched = 0;
        validate(raw, c);
        for (const value of [1, null, undefined, '0', -1, 0.5, false, true]) {
            const bad = structuredClone(raw);
            bad.metrics[side].ability_launched = value;
            assert.throws(() => validate(bad, c));
        }
    }
});

test('报告分母、未知请求、当前精神/有效精神不合并；无 raw.parameters 仍可复算', () => {
    const c = choose('eff-jing-clipped'), success = record(c, { triggered: true });
    assert.equal(Object.hasOwn(success, 'parameters'), false);
    const unknown = { condition_id: c.id, outcome: 'error', raw: { condition_id: c.id, outcome: 'error', reason: '合成故障' } };
    const stats = taohuaPassiveEffects([wrap(success), wrap(record(c)), unknown], c);
    assert.equal(stats.records, 3); assert.equal(stats.interface_calls, 2); assert.equal(stats.unknown_or_unobserved, 1);
    assert.equal(stats.trigger_when_eligible.successes, 1); assert.equal(stats.trigger_when_eligible.trials, 2);
    assert.equal(stats.triggered_eff_jing_loss.mean, 201); assert.equal(stats.triggered_jing_loss.mean, 101);
    assert.equal(stats.triggered_neili_cost.mean, 60); assert.equal(stats.immediate_clipped, 1);
    assert.deepEqual(stats.requested_wound, { observation: 'not_observed', source_support_if_triggered: { min: 400, max: 449 } });
    assert.equal(stats.later_unconsciousness_or_death, 'not_observed');
    const failureOnly = taohuaPassiveEffects([unknown], c);
    assert.equal(failureOnly.actor_neili_cost.mean, null); assert.equal(failureOnly.trigger_per_call.rate, null);
    const blocked = choose('neili499'), guard = taohuaPassiveEffects([wrap(record(blocked))], blocked);
    assert.equal(guard.guard_no_effect, 1); assert.equal(guard.trigger_per_call.trials, 1);
    assert.equal(guard.trigger_when_eligible.trials, 0);
});

test('报告所有结果分类前锁定冻结条件及原件同源，不吞错账或拒绝', () => {
    const c = choose();
    for (const outcome of ['observed', 'error', 'not_applicable']) {
        const row = outcome === 'observed' ? wrap(record(c))
            : { condition_id: c.id, outcome, raw: { condition_id: c.id, outcome } };
        for (const value of ['foreign', null, undefined]) {
            assert.throws(() => taohuaPassiveEffects([{ ...row, condition_id: value }], c));
            assert.throws(() => taohuaPassiveEffects([{ ...row, raw: { ...row.raw, condition_id: value } }], c));
        }
        assert.throws(() => taohuaPassiveEffects([{ ...row, raw: { ...row.raw, outcome: 'refused' } }], c));
    }
    assert.throws(() => taohuaPassiveEffects([{ condition_id: c.id, outcome: 'refused', raw: { condition_id: c.id, outcome: 'refused' } }], c));
    const raw = record(c, { triggered: true }); raw.metrics[0].neili_cost = 0;
    assert.throws(() => taohuaPassiveEffects([wrap(raw)], c));
});

console.log(JSON.stringify({ preparation: 'taohua-passive', real_samples: 0, conditions: cases.length,
    planned_formal: cases.reduce((n, c) => n + c.samples, 0), planned_smoke: smoke.length,
    formal_sha256: sha(cases), smoke_sha256: sha(smoke), source_count: taohuaPassiveSourcePaths.length,
    source_sha256: sha(Object.entries(cases[0].parameters.source_evidence)) }));
