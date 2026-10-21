import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { gumuAdvancedMoves, gumuAdvancedFixtureRequirements, gumuAdvancedConditions,
    validateGumuAdvancedRecord, gumuAdvancedEffects } from './school_gumu_advanced_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = gumuAdvancedConditions(catalog);
function pick(ability, suffix = '', level = 200) {
    const c = cases.find(c => c.parameters.ability === ability && c.parameters.level === level
        && c.id === `school-gumu-advanced-${c.parameters.skill}-${ability}-l${level}${suffix}`);
    assert.ok(c, ability + suffix); return c;
}

// Synthetic collector tests only; not evidence of a real command, hit or successful crafting.
function raw(c, options = {}) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, side) => {
        const apply = { armor: 100, damage: cfg.equipment ? 50 : 0, dodge: cfg.equipment ? -1 : 0 };
        for (const [k, v] of Object.entries(cfg.temp ?? {})) apply[k.slice(6)] = v;
        return { userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000,
            jing: 10000, eff_jing: 10000, neili: 6000, max_neili: 6000, ...cfg.properties,
            cultivation: { character: cfg.properties.character ?? 0 },
            skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
            effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
                [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (apply[k] ?? 0)])),
            effective_str: cfg.properties.str + Math.trunc((cfg.skills.unarmed ?? 0) / 10) + (apply.str ?? 0),
            effective_dex: cfg.properties.dex + Math.trunc(cfg.skills.dodge / 10),
            busy: cfg.busy ?? 0, temp: { apply }, weapon: cfg.equipment?.type ?? 'none',
            weapon_details: cfg.equipment ? { object: '/tests/weapon#' + side,
                weight: cfg.equipment.weight, item_make: cfg.equipment.item_make ? 1 : 0,
                item_make_source: cfg.equipment.item_make ? '/feature/itemmake.c' : null,
                name: '演武兵器', value: cfg.equipment.value } : {},
        };
    });
    const r = { before, immediate: structuredClone(before), outcome: p.expected, metrics: [{}, {}],
        attacks: [], dropped: [], launches: [], reason: '' };
    if (p.expected === 'refused') { r.reason = '此刻不能施展'; return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    let cost = 0, damage = 0;
    if (p.ability === 'juan') {
        const applied = options.applied ?? false;
        cost = applied ? 50 : 25; r.immediate[0].busy = applied ? 0 : 2;
        if (applied) r.immediate[1].busy = Math.trunc(before[0].effective_skills.sword / 20) + 2;
    } else if (p.ability === 'dong') {
        const direct = options.direct ?? (c.id.endsWith('-low-defense') ? 1 : 0);
        const broken = options.broken ?? false;
        r.metrics[0].direct = direct; damage = direct * 200;
        cost = (direct ? 400 : 200) + (broken ? 120 : 0); r.immediate[0].busy = 2;
        if (direct) r.immediate[1].busy = 1;
        if (broken) {
            r.immediate[1].weapon = 'none'; r.immediate[1].weapon_details = {};
            r.dropped.push({ object: before[1].weapon_details.object, type: before[1].weapon,
                name: '碎掉的演武兵器', no_wield: '兵器已碎，不能装备。', value: 0 });
        }
    } else {
        const planned = options.planned ?? (p.ability === 'lian' ? 4 : 3);
        const actual = options.actual ?? planned;
        r.attacks = Array.from({ length: actual }, () => ({ actor: 0, target: 1,
            type: p.ability === 'lian' ? 20 : 0, result: 0, damage: 100 }));
        r.metrics[0].hit = actual; damage = actual * 100;
        if (p.ability === 'lian') {
            cost = planned * 20; r.immediate[0].busy = 1;
            // LPC add_temp() may leave a zero-valued key after successful restoration.
            r.immediate[0].temp.apply.attack ??= 0;
        } else {
            cost = 350 + (options.passiveHits ?? 0) * 120; r.immediate[0].busy = 3;
            r.immediate[1].busy ||= 1; r.immediate[0].temp.apply.str ??= 0;
            r.immediate[0].temp.apply.attack ??= 0;
        }
    }
    r.metrics[0].neili_cost = cost; r.immediate[0].neili -= cost;
    if (damage) {
        r.metrics[1].qi_cost = damage; r.metrics[1].eff_qi_cost = damage / 5;
        r.immediate[1].qi -= damage; r.immediate[1].eff_qi -= damage / 5;
    }
    return r;
}

test('101条件3828计划记录，202烟雾与来源闭合，六项夹具能力明确', () => {
    assert.equal(gumuAdvancedMoves.length, 4); assert.equal(cases.length, 101);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3828);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(gumuAdvancedFixtureRequirements.length, 6);
    const entries = new Set(catalog.skills.flatMap(s => s.entries.map(e => e.id)));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id)); assert.equal(c.parameters.actor.properties.jiali, 0);
        for (const file of c.parameters.qualification_sources) assert.ok(existsSync(join(root, file)), file);
        validateGumuAdvancedRecord(raw(c), c);
    }
    const smoke = gumuAdvancedConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 202);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.throws(() => gumuAdvancedConditions({ skills: [] }));
    for (const samples of [0, -1, NaN, 2.2]) assert.throws(() => gumuAdvancedConditions(catalog, { samples }));
});

test('卷／东使用有效内功400门槛，连环剑轻功和迅雷基本内功均用原始等级', () => {
    for (const ability of ['juan', 'dong']) {
        assert.equal(raw(pick(ability)).before[0].effective_skills.force, 600);
        for (const [suffix, level] of [['-low-force', 399], ['-minimum-force', 400]])
            assert.equal(raw(pick(ability, suffix)).before[0].effective_skills.force, level);
    }
    assert.equal(pick('lian', '-low-basic-dodge').parameters.actor.skills.dodge, 99);
    assert.equal(raw(pick('lian', '-low-basic-dodge')).before[0].effective_skills.dodge, 248);
    assert.equal(pick('lian', '-low-basic-dodge').parameters.expected, 'refused');
    assert.equal(pick('lian', '-no-force-threshold').parameters.expected, 'observed');
    assert.equal(pick('xunlei', '-low-basic-force').parameters.actor.skills.force, 199);
    assert.equal(raw(pick('xunlei', '-low-basic-force')).before[0].effective_skills.force, 299);
    for (const ability of ['lian', 'juan', 'dong']) assert.equal(pick(ability, '-no-grant').parameters.expected, 'refused');
    for (const suffix of ['-no-grant', '-no-parry-map', '-no-force-map'])
        assert.equal(pick('xunlei', suffix).parameters.expected, 'observed');
});

test('有效膂力45、身法30与最大内力2000各自核验，不把先天值或有效内功混用', () => {
    for (const [suffix, str, dex, max] of [['-low-effective-str', 44, 56, 6000],
        ['-minimum-effective-str', 45, 56, 6000], ['-low-effective-dex', 56, 29, 6000],
        ['-minimum-effective-dex', 56, 30, 6000], ['-low-max-neili', 56, 56, 1999],
        ['-minimum-max-neili', 56, 56, 2000]]) {
        const c = pick('xunlei', suffix), r = raw(c);
        assert.deepEqual([r.before[0].effective_str, r.before[0].effective_dex, r.before[0].max_neili], [str, dex, max]);
        validateGumuAdvancedRecord(r, c); r.before[0].effective_dex++;
        assert.throws(() => validateGumuAdvancedRecord(r, c));
    }
});

test('连环剑预扣4至8剑，提前停手不改记为实际剑数；高防只保证无额外计划剑数', () => {
    const c = pick('lian');
    for (const planned of [4, 5, 8]) for (const actual of [1, planned])
        validateGumuAdvancedRecord(raw(c, { planned, actual }), c);
    for (const options of [{ planned: 3 }, { planned: 9 }, { planned: 4, actual: 5 }, { actual: 0 }])
        assert.throws(() => validateGumuAdvancedRecord(raw(c, options), c));
    const high = pick('lian', '-high-defense'); validateGumuAdvancedRecord(raw(high), high);
    assert.throws(() => validateGumuAdvancedRecord(raw(high, { planned: 5 }), high));
    const r = raw(c); r.attacks[0].type = 2;
    assert.throws(() => validateGumuAdvancedRecord(r, c)); // Original type is 20, not TYPE_QUICK.
});

test('卷字诀成败费用与自身忙乱不同，低防仍可随机失败，已忙目标拒绝', () => {
    for (const suffix of ['', '-low-defense']) {
        const c = pick('juan', suffix);
        for (const applied of [true, false]) validateGumuAdvancedRecord(raw(c, { applied }), c);
    }
    assert.equal(pick('juan', '-target-busy').parameters.expected, 'refused');
    const high = pick('juan', '-high-defense');
    assert.throws(() => validateGumuAdvancedRecord(raw(high, { applied: true }), high));
    const c = pick('juan'), r = raw(c, { applied: true }); r.immediate[0].busy = 2;
    assert.throws(() => validateGumuAdvancedRecord(r, c));
});

test('大江东去资格和毁兵两条重量边界、打造剑及打造锤区分，毁兵与命中独立', () => {
    assert.equal(pick('dong', '-weight24999').parameters.expected, 'refused');
    for (const suffix of ['', '-weight25001', '-target-ordinary-hammer', '-target-crafted-sword']) {
        const c = pick('dong', suffix);
        for (const direct of [0, 1]) for (const broken of [false, true])
            validateGumuAdvancedRecord(raw(c, { direct, broken }), c);
    }
    for (const suffix of ['-weight25000', '-crafted-weight3000', '-target-crafted-hammer', '-target-unarmed']) {
        const c = pick('dong', suffix);
        for (const direct of [0, 1]) validateGumuAdvancedRecord(raw(c, { direct }), c);
        assert.throws(() => validateGumuAdvancedRecord(raw(c, { direct: 1, broken: true }), c));
    }
    const c = pick('dong');
    for (const change of [r => { r.dropped[0].value = 100; }, r => { r.dropped[0].no_wield = ''; },
        r => { r.dropped[0].object = '/tests/other#3'; }, r => { r.metrics[0].neili_cost = 400; r.immediate[0].neili += 120; }]) {
        const r = raw(c, { direct: 1, broken: true }); change(r);
        assert.throws(() => validateGumuAdvancedRecord(r, c));
    }
});

test('迅雷三击、附伤额外120与原强化恢复分开，不从文案推断命中或虚造领悟要求', () => {
    for (const suffix of ['', '-existing-apply', '-no-grant']) {
        const c = pick('xunlei', suffix);
        for (const passiveHits of [0, 1, 3]) validateGumuAdvancedRecord(raw(c, { passiveHits }), c);
        assert.throws(() => validateGumuAdvancedRecord(raw(c, { passiveHits: 4 }), c));
        assert.throws(() => validateGumuAdvancedRecord(raw(c, { actual: 4 }), c));
        const r = raw(c); r.immediate[0].temp.apply.str++;
        assert.throws(() => validateGumuAdvancedRecord(r, c));
    }
    const c = pick('lian', '-existing-apply'), r = raw(c); r.immediate[0].temp.apply.attack = 0;
    assert.throws(() => validateGumuAdvancedRecord(r, c));
});

test('正常性格分开；狡黠保留公共减忙，不把源码国土错字当合法实验角色', () => {
    for (const level of [200, 400, 800]) for (const [suffix, expected] of [
        ['', '光明磊落'], ['-character-cunning', '狡黠多变'], ['-character-guoshi', '国士无双']]) {
        const c = pick('dong', suffix, level); assert.equal(c.parameters.actor.properties.character, expected);
        const r = raw(c); r.immediate[0].busy = 1;
        if (expected === '狡黠多变') validateGumuAdvancedRecord(r, c);
        else assert.throws(() => validateGumuAdvancedRecord(r, c));
    }
    assert.ok(!cases.some(c => c.parameters.actor.properties.character === '国土无双'));
});

test('拒绝不耗资源，未知指标、错身份、漏计伤害及残留强化不能误报通过', () => {
    for (const d of gumuAdvancedMoves) {
        const c = pick(d.ability, '-low-neili');
        for (const mutate of [r => { r.before[0].wizardp = 1; }, r => { r.before[1].userp = 0; },
            r => { r.metrics[0].neili_cost = null; }, r => { r.immediate[1].qi--; },
            r => { r.launches.push({}); }, r => { r.before[0].weapon_details.item_make = null; }]) {
            const r = raw(c); mutate(r); assert.throws(() => validateGumuAdvancedRecord(r, c));
        }
        const normal = pick(d.ability), r = raw(normal); r.immediate[0].temp.apply.attack = 5;
        assert.throws(() => validateGumuAdvancedRecord(r, normal));
    }
});

test('统计保留未知，攻击次数不是命中数，空手不纳入失去武器分母', () => {
    const rows = [raw(pick('dong'), { broken: true }), raw(pick('dong', '-target-unarmed'), { direct: 1 }),
        raw(pick('lian')), { outcome: 'observed' }].map(r => ({ outcome: r.outcome, raw: r }));
    rows.push({ outcome: 'refused', raw: {} });
    const e = gumuAdvancedEffects(rows);
    assert.equal(e.samples, 4); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(e.attacks.mean, 4 / 3); assert.equal(e.attacks.unknown, 1);
    assert.equal(e.weapon_lost_when_held.trials, 2); assert.equal(e.weapon_lost_when_held.successes, 1);
    assert.equal(e.neili_cost.mean, (320 + 400 + 80) / 3);
    assert.equal(e.target_loss.qi.mean, 200); assert.equal(e.target_loss.eff_qi.mean, 40);
    assert.equal(gumuAdvancedEffects([]).attacks.mean, null);
});

test('接入统一分发，原11776条件及完整JSON指纹不变', () => {
    const all = schoolCombatConditions(catalog);
    const old = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school)
        && !['quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group)
        || ['gumu-control', 'gumu-direct'].includes(c.parameters.collection_group));
    assert.equal(old.length, 11776);
    assert.equal(old.reduce((n, c) => n + c.samples, 0), 296274);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        'fcd7b4b9221701b72d9caebdf9bebdc13e583b8ff0266dcfde504253c0ce9652');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-advanced'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) validateSchoolCombatRecord(raw(c), c);
});

test('已观察的undefined忙乱为零，缺字段及伪造打造来源不可接受', () => {
    const c = pick('juan'), r = raw(c, { applied: true });
    r.before[0].busy = null; r.before[1].busy = null; r.immediate[0].busy = null;
    validateGumuAdvancedRecord(r, c);
    const e = gumuAdvancedEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(e.actor_busy.mean, 0); assert.equal(e.actor_busy.unknown, 0);
    delete r.before[0].busy;
    assert.throws(() => validateGumuAdvancedRecord(r, c));
    const made = pick('dong', '-crafted-weight3000'), trace = raw(made);
    trace.before[0].weapon_details.item_make_source = '/tests/fake_identity';
    assert.throws(() => validateGumuAdvancedRecord(trace, made));
});

test('迅雷省略攻击类型为原普通攻击，缺字段不当作已观察，连环剑仍须20', () => {
    const c = pick('xunlei'), r = raw(c);
    r.attacks[0].type = null;
    validateGumuAdvancedRecord(r, c);
    delete r.attacks[0].type;
    assert.throws(() => validateGumuAdvancedRecord(r, c));
    const lian = pick('lian'), trace = raw(lian); trace.attacks[0].type = null;
    assert.throws(() => validateGumuAdvancedRecord(trace, lian));
});
