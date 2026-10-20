import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice6SourcePaths, slice6Conditions, validateSlice6Record, slice6Effects,
    slice6SupportSet } from './school_slice6_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = slice6Conditions(catalog, read), smoke = slice6Conditions(catalog, read, { smoke: true });

function state(cfg, side) {
    const src = side ? cfg.target : cfg.actor;
    const handSkills = ['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'];
    const improve = Math.max(0, ...handSkills.map(s => src.skills[s] || 0));
    const weapon = src.equipment?.type ?? 'none';
    return {
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        skills: { ...src.skills }, learned: {}, mappings: { ...src.mappings },
        preparations: { ...src.preparations },
        temp: { apply: { armor: 100, ...(src.equipment ? { damage: 50, dodge: -1 } : {}) } }, busy: null,
        qi: src.properties.qi, eff_qi: src.properties.eff_qi, jing: src.properties.jing,
        eff_jing: src.properties.eff_jing, neili: src.properties.neili, max_neili: src.properties.max_neili,
        str: src.properties.str, int: src.properties.int, con: src.properties.con,
        dex: src.properties.dex, shen: src.properties.shen, gender: src.properties.gender,
        character: src.properties.character,
        weapon, weapon_damage: src.equipment ? 50 : 0, weapon_flag: 0,
        weapon_details: src.equipment
            ? { object: '/tests/weapon#' + (200 + side), skill_type: weapon, consistence: 100 } : {},
        effective_str: src.properties.str + Math.trunc(improve / 10),
        effective_skills: { ...src.skills },
        conditions: 0,
    };
}

function trace(c, { hit = true, input = 100, busy = 5, drop = false, targetBusy = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const before = [state(p, 0), state(p, 1)];
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        outcome: p.expected, elapsed: 0.01, before, immediate: structuredClone(before),
        after: structuredClone(before), metrics: [{}, {}], actions: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], callbacks: [], dropped: [], terminals: [],
        launches: [], refusals: [], directs: [], reason: '' };
    const b = raw.immediate[0], v = raw.immediate[1];
    if (c.method === 'interface') {
        raw.interfaces = [{ ...p.interface, result: accepted ? 1 : 0 }];
        if (!accepted) raw.reason = p.refusal;
    } else if (c.method === 'ordinary') {
        raw.actions = [{ actor: 0, target: 1, action: 'attack' }];
        raw.attacks = [{ actor: 0, target: 1, type: 0, result: 0, damage: 30 }];
        v.qi -= 30;
    } else if (!accepted) {
        raw.reason = p.refusal;
        raw.refusals = [{ actor: before[0].object, reason: p.refusal }];
    } else {
        raw.launches = [{ actor: before[0].object, skill: p.skill, argument: p.ability + ' right' }];
        const school = p.school;
        const fee = school === 'meizhuang' ? (hit ? 300 : 100)
            : school === 'miao' ? 500
                : school === 'ouyang' ? (hit ? 200 : 80)
                    : (hit ? 150 : 50);
        const busyAfter = school === 'miao' ? (hit ? 3 : 4)
            : school === 'meizhuang' ? 2
                : school === 'ouyang' ? (hit ? 3 : 4)
                    : (hit ? 2 : 3);
        b.neili -= fee; b.busy = busyAfter;
        if (drop) {
            b.weapon = 'none'; b.weapon_damage = 0; b.weapon_flag = 0; b.weapon_details = {};
            delete b.temp.weapon;
            b.temp.apply = { armor: 100, damage: 0, dodge: 0 };
            if (b.effective_skills) b.effective_skills.dodge = (b.effective_skills.dodge ?? 0) + 1;
            raw.dropped = [{ object: before[0].weapon_details.object, name: '演武兵器',
                type: 'sword', no_wield: 0 }];
        }
        if (targetBusy !== null) v.busy = targetBusy;
        if (hit) {
            const percent = school === 'meizhuang' ? 100 : school === 'miao' ? 80
                : school === 'ouyang' ? 55 : 20;
            const dtype = school === 'meizhuang' ? 'REMOTE' : school === 'miao' ? 'WEAPON'
                : school === 'ouyang' ? 'WEAPON' : 'UNARMED';
            raw.directs = [{ actor: 0, target: 1, damage: input }];
            raw.dodge_checks = [{ result: 0 }];
            raw.metrics[0] = { direct: 1 };
            const support = slice6SupportSet(input, percent, before[0], before[1], dtype);
            const out = support[0];
            v.qi = out.qi; v.eff_qi = out.eff_qi;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('52 条件有限矩阵：meizhuang 14、miao 14、ouyang/zhenyuan 各 12；正式 908、烟雾 87，ID 唯一', () => {
    assert.equal(cases.length, 52);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 908);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 87);
    assert.equal(new Set(cases.map(c => c.id)).size, 52);
    for (const [dir, want] of [['meizhuang', 14], ['miao', 14], ['ouyang', 12], ['zhenyuan', 12]]) {
        assert.equal(cases.filter(c => c.parameters.collection_group === 'slice6-' + dir).length, want, dir);
    }
    for (const c of cases) {
        assert.equal(c.stage, 'school');
        assert.equal(c.parameters.not_applicable, '');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.ok(slice6SourcePaths.includes(c.parameters.base_source.path));
    }
});

test('meizhuang 双免疫样本与 learnSkills：actor max_neili≥target+500、unarmed/tanqin-jifa 280', () => {
    const hitC = cases.find(x => x.id === 'school-slice6-meizhuang-perform-hit');
    assert.equal(hitC.parameters.actor.properties.max_neili, 6500);
    assert.equal(hitC.parameters.target.properties.max_neili, 6000);
    assert.equal(hitC.parameters.actor.skills.unarmed, 280);
    assert.equal(hitC.parameters.actor.skills['tanqin-jifa'], 280);
    const userp = cases.find(x => x.id === 'school-slice6-meizhuang-perform-immune-userp');
    assert.equal(userp.parameters.actor.properties.max_neili, 6000);
    assert.equal(userp.parameters.target.properties.max_neili, 6000);
    const low = cases.find(x => x.id === 'school-slice6-meizhuang-perform-immune-low');
    assert.equal(low.parameters.target.properties.max_neili, 5);
    // Immune branches are observed performs that take the fee-100 no-direct path.
    for (const c of [userp, low]) {
        const r = trace(c, { hit: false });
        validateSlice6Record(r, c);
        assert.equal(r.immediate[0].neili, 6000 - 100);
        assert.equal(r.directs.length, 0);
    }
});

test('meizhuang 契约：REMOTE 100% 直伤、费用 300/100、忙乱 2/2', () => {
    const hitC = cases.find(x => x.id === 'school-slice6-meizhuang-perform-hit');
    const hit = trace(hitC, { input: 300 });
    validateSlice6Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 300);
    assert.equal(hit.immediate[0].busy, 2);
    assert.equal(hit.directs.length, 1);
    const missC = cases.find(x => x.id === 'school-slice6-meizhuang-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice6Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 100);
    assert.equal(miss.immediate[0].busy, 2);
});

test('miao 契约：WEAPON 80% 直伤、费用两分支均 500、忙乱 3/4', () => {
    const hitC = cases.find(x => x.id === 'school-slice6-miao-perform-hit');
    const hit = trace(hitC, { input: 300 });
    validateSlice6Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 500);
    assert.equal(hit.immediate[0].busy, 3);
    const missC = cases.find(x => x.id === 'school-slice6-miao-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice6Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 500);
    assert.equal(miss.immediate[0].busy, 4);
});

test('miao 掉剑：skill<260 两分支均掉剑，baseline 300 保剑', () => {
    const dropC = cases.find(x => x.id === 'school-slice6-miao-perform-gate-level-200');
    assert.equal(dropC.parameters.actor.skills['miaojia-jian'], 200);
    const dropped = trace(dropC, { input: 200, drop: true });
    validateSlice6Record(dropped, dropC);
    assert.equal(dropped.dropped.length, 1);
    assert.equal(dropped.dropped[0].type, 'sword');
    assert.equal(dropped.immediate[0].weapon, 'none');
    const missDrop = trace(dropC, { hit: false, drop: true });
    validateSlice6Record(missDrop, dropC);
    assert.equal(missDrop.dropped.length, 1);
    const keepC = cases.find(x => x.id === 'school-slice6-miao-perform-baseline-l300');
    const keep = trace(keepC, { input: 300 });
    validateSlice6Record(keep, keepC);
    assert.equal(keep.dropped.length, 0);
    assert.equal(keep.immediate[0].weapon, 'sword');
    const bad = trace(dropC, { input: 200 });
    assert.throws(() => validateSlice6Record(bad, dropC));
});

test('ouyang 契约：WEAPON 55% 直伤、费用 200/80、忙乱 3/4、目标忙乱 1 两分支', () => {
    const hitC = cases.find(x => x.id === 'school-slice6-ouyang-perform-hit');
    const hit = trace(hitC, { input: 300, targetBusy: 1 });
    validateSlice6Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 200);
    assert.equal(hit.immediate[0].busy, 3);
    assert.equal(hit.immediate[1].busy, 1);
    const missC = cases.find(x => x.id === 'school-slice6-ouyang-perform-miss');
    const miss = trace(missC, { hit: false, targetBusy: 1 });
    validateSlice6Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 80);
    assert.equal(miss.immediate[0].busy, 4);
    assert.equal(miss.immediate[1].busy, 1);
    const bad = trace(hitC, { input: 300, targetBusy: 0 });
    assert.throws(() => validateSlice6Record(bad, hitC));
});

test('zhenyuan 契约：UNARMED 20% 直伤、非标准命中、费用 150/50、忙乱 2/3', () => {
    const hitC = cases.find(x => x.id === 'school-slice6-zhenyuan-perform-hit');
    const hit = trace(hitC, { input: 200 });
    validateSlice6Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 150);
    assert.equal(hit.immediate[0].busy, 2);
    assert.equal(hit.directs.length, 1);
    const missC = cases.find(x => x.id === 'school-slice6-zhenyuan-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice6Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 50);
    assert.equal(miss.immediate[0].busy, 3);
});

test('meizhuang learn max_neili 门：2999/3000 边界且 learnSkills 在位', () => {
    const low = cases.find(x => x.id === 'school-slice6-meizhuang-interface-learn-max_neili-2999');
    const high = cases.find(x => x.id === 'school-slice6-meizhuang-interface-learn-max_neili-3000');
    assert.equal(low.parameters.refusal, '你的内力太弱，无法修炼七弦无形剑。\n');
    assert.equal(low.parameters.actor.properties.max_neili, 2999);
    assert.equal(high.parameters.actor.properties.max_neili, 3000);
    assert.equal(low.parameters.actor.skills.unarmed, 280);
    assert.equal(low.parameters.actor.skills['tanqin-jifa'], 280);
    validateSlice6Record(trace(low), low);
    validateSlice6Record(trace(high), high);
});

test('拒绝/接口/普通攻击契约与错误样本豁免', () => {
    const refusal = cases.find(x => x.id === 'school-slice6-meizhuang-perform-gate-level-159');
    const r = trace(refusal); validateSlice6Record(r, refusal);
    const learn = cases.find(x => x.id === 'school-slice6-zhenyuan-interface-learn-max_neili-149');
    validateSlice6Record(trace(learn), learn);
    const learnOk = cases.find(x => x.id === 'school-slice6-zhenyuan-interface-learn-max_neili-150');
    validateSlice6Record(trace(learnOk), learnOk);
    const ordinary = cases.find(x => x.id === 'school-slice6-miao-ordinary-baseline-l300');
    validateSlice6Record(trace(ordinary), ordinary);
    const err = trace(refusal); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateSlice6Record(err, refusal), null);
    const dup = trace(ordinary); dup.index = ordinary.samples;
    assert.throws(() => validateSlice6Record(dup, ordinary));
});

test('effects 汇总分母独立：错误不入效果、命中率有界', () => {
    const c = cases.find(x => x.id === 'school-slice6-meizhuang-perform-hit');
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c, { input: 300 }) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: trace(c) },
    ];
    rows[1].raw.outcome = 'error'; rows[1].raw.reason = 'driver interruption';
    const e = slice6Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});
