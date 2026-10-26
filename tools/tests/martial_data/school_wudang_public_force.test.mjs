import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { wudangForces } from './school_wudang_cultivation_cases.mjs';
import { wudangPublicForceConditions, validateWudangPublicForceRecord } from './school_wudang_public_force_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = wudangPublicForceConditions(catalog);
const find = suffix => { const c = cases.find(x => x.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('公共即时能力登记主入口，保留旧3462条件93486条计划与冻结依赖', () => {
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
    const old = all.filter(c => !['wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 3462); assert.equal(old.reduce((n, c) => n + c.samples, 0), 93486);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'wudang-public-force'), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.match(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8'),
        /'tools\/tests\/martial_data\/school_wudang_public_force_cases\.mjs'/);
    const c = find('power-l200'); validateSchoolCombatRecord(row(c), c);
});

function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => {
        const skills = structuredClone(cfg.skills), effective_skills = {};
        for (const [key, value] of Object.entries(skills))
            effective_skills[key] = Math.trunc(value / 2) + (skills[cfg.mappings[key]] ?? 0);
        return { ...cfg.properties, skills, effective_skills, mappings: structuredClone(cfg.mappings),
            preparations: {}, weapon: 'none', temp: { apply: { armor: 100 } }, conditions: null, busy: cfg.busy ?? 0 };
    });
    const r = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原入口拒绝',
        launches: [], attacks: [], interfaces: [], metrics: [{}, {}], command_accepted: Number(p.expected === 'observed') };
    const [b, bt] = before, [a, t] = r.immediate;
    if (r.command_accepted) {
        r.launches = [{ skill: 'force' }];
        let cost = 0;
        if (p.ability === 'lifeheal') {
            cost = 150;
            t.eff_qi = Math.min(bt.max_qi, bt.eff_qi + 10 + Math.trunc(b.effective_skills.force / 2));
            t.qi = Math.min(t.eff_qi, bt.qi + 10 + Math.trunc(b.effective_skills.force / 3));
        } else if (p.ability === 'dispel') {
            if (p.effect_expected !== 'accepted_no_effect') {
                cost = p.other ? 250 : 100; a.busy = p.other ? 2 : 1;
                if (p.other) t.busy = 1;
            }
        } else if (p.ability === 'power') {
            cost = b.neili;
            a.temp.apply[p.power_selected] = Math.trunc(b.skills['martial-cognize'] / 5);
            a.temp.power = 1; a.busy = p.fighting ? 3 : 0;
        } else if (p.ability === 'tianmo') {
            cost = b.neili;
            const base = b.skills.force + 215, count = Math.trunc(base / 4);
            for (const [key, delta] of [['qi', 700], ['eff_qi', 200], ['jing', 600], ['eff_jing', 100]]) {
                a[key] -= base + delta; r.metrics[0][key + '_cost'] = base + delta;
            }
            Object.assign(a.temp.apply, { str: b.str, int: b.int, con: b.con, dex: b.dex,
                attack: count, damage: b.str * 3, unarmed_damage: b.str * 3 });
            for (const key of Object.keys(b.mappings)) a.temp.apply[key] = Math.trunc(count / 2);
            a.temp.tianmo = 1; a.busy = p.fighting ? 3 : 0;
        }
        a.neili -= cost; r.metrics[0].neili_cost = cost;
    }
    r.after = structuredClone(r.immediate);
    return r;
}

test('公共内功条件保留原命令、三门映射、资格来源与烟雾边界', () => {
    assert.equal(cases.length, 183);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2718);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.deepEqual([...new Set(cases.map(c => c.parameters.skill))], wudangForces);
    const smoke = wudangPublicForceConditions(catalog, { smoke: true });
    assert.equal(smoke.length, cases.length);
    assert.ok(smoke.every(c => c.samples === 2));
    for (const c of cases) {
        assert.equal(c.method, 'exert'); assert.equal(c.parameters.observe_seconds, 0);
        assert.ok(c.parameters.action.startsWith('exert '));
        for (const source of c.parameters.qualification_sources) assert.ok(existsSync(join(root, source)), source);
        assert.ok(!Object.hasOwn(c.parameters.actor.skills, 'jiuyang-shengong'));
        assert.equal(c.parameters.actor.properties['family/family_name'], '武当派');
    }
});

test('即时观察须使用公共force，拒绝不能伪造费用或发动', () => {
    for (const c of cases) validateWudangPublicForceRecord(row(c), c);
    const c = find('lifeheal-l400'), r = row(c); r.launches[0].skill = c.parameters.skill;
    assert.throws(() => validateWudangPublicForceRecord(r, c));
    const refused = find('lifeheal-l200-neili149'), bad = row(refused);
    bad.metrics[0].neili_cost = 150;
    assert.throws(() => validateWudangPublicForceRecord(bad, refused));
});

test('替人疗伤区分当前气血与创伤，并保留小伤封顶', () => {
    const c = find('lifeheal-l400'), r = row(c);
    assert.equal(r.immediate[1].eff_qi, 5310); assert.equal(r.immediate[1].qi, 5210);
    assert.equal(r.metrics[0].neili_cost, 150);
    for (const key of ['qi', 'eff_qi']) {
        const bad = row(c); bad.immediate[1][key]++; bad.after = structuredClone(bad.immediate);
        assert.throws(() => validateWudangPublicForceRecord(bad, c));
    }
    const capped = row(find('lifeheal-l200-small-wound'));
    assert.equal(capped.immediate[1].eff_qi, 10000); assert.equal(capped.immediate[1].qi, 10000);
});

test('dispel受理无作用与无异常但扣费分别记录', () => {
    for (const suffix of ['neili299', 'other-neili299', 'other-busy', 'other-fighting']) {
        const c = find('dispel-l200-' + suffix), r = row(c);
        assert.equal(r.outcome, 'observed'); assert.equal(r.launches.length, 1);
        assert.equal(r.metrics[0].neili_cost, 0); validateWudangPublicForceRecord(r, c);
        r.metrics[0].neili_cost = 100;
        assert.throws(() => validateWudangPublicForceRecord(r, c));
    }
    assert.equal(row(find('dispel-l200-minimum')).immediate[0].neili, 200);
    assert.equal(row(find('dispel-l200-other-minimum')).immediate[0].neili, 50);
    const c = find('dispel-l200'), contaminated = row(c);
    contaminated.before[1].conditions = { poison: 10 };
    assert.throws(() => validateWudangPublicForceRecord(contaminated, c));
});

test('power提升已映射最高项，同级保留内功，未映射剑法不能入选', () => {
    for (const suffix of ['sword-highest', 'sword-tie', 'sword-unmapped']) {
        const c = find('power-l200-' + suffix), r = row(c);
        const expected = suffix === 'sword-highest' ? 'sword' : 'force';
        assert.equal(c.parameters.power_selected, expected);
        assert.deepEqual(r.immediate[0].temp.apply, { armor: 100, [expected]: 40 });
        assert.equal(r.immediate[0].neili, 0); assert.equal(r.metrics[0].neili_cost, 6000);
        validateWudangPublicForceRecord(r, c);
        r.immediate[0].temp.apply[expected]++; r.after = structuredClone(r.immediate);
        assert.throws(() => validateWudangPublicForceRecord(r, c));
    }
    const minimum = row(find('power-l200-minimum'));
    assert.equal(minimum.immediate[0].temp.apply.force, 24);
    assert.equal(minimum.metrics[0].neili_cost, 100);
});

test('天魔保留独立自损、全部映射加成、资质或关系与真实内力耗尽', () => {
    const c = find('tianmo-l400-sword-map'), r = row(c);
    assert.deepEqual(r.immediate[0].temp.apply, { armor: 100, str: 36, int: 36, con: 36, dex: 36,
        attack: 153, damage: 108, unarmed_damage: 108, force: 76, sword: 76 });
    assert.equal(row(find('tianmo-l400-extra-neili')).metrics[0].neili_cost, 9000);
    assert.equal(find('tianmo-l400-both-attributes29').parameters.expected, 'refused');
    assert.equal(find('tianmo-l400-str30-con29').parameters.expected, 'observed');
    assert.equal(find('tianmo-l400-str29-con30').parameters.expected, 'observed');
    for (const mutate of [
        x => x.immediate[0].temp.apply.sword = 0,
        x => x.immediate[0].eff_jing = x.before[0].eff_jing,
        x => x.metrics[0].qi_cost++,
        x => x.immediate[0].neili = 1,
    ]) {
        const bad = row(c); mutate(bad); bad.after = structuredClone(bad.immediate);
        assert.throws(() => validateWudangPublicForceRecord(bad, c));
    }
});

test('白名单拒绝和未测试生命周期不得冒充成功或完整持续结果', () => {
    assert.equal(cases.filter(c => ['roar', 'shot'].includes(c.parameters.ability)).length, 6);
    assert.ok(cases.filter(c => ['roar', 'shot'].includes(c.parameters.ability)).every(c => c.parameters.expected === 'refused'));
    assert.ok(!cases.some(c => ['heal', 'inspire', 'xun'].includes(c.parameters.ability)));
    const c = find('power-l200'), bad = row(c); bad.after[0].temp.power = 0;
    assert.throws(() => validateWudangPublicForceRecord(bad, c));
    const source = readFileSync(join(root, 'tools/tests/martial_data/school_wudang_public_force_cases.mjs'), 'utf8');
    assert.match(source, /没有|另查|另列|不代表/);
});
