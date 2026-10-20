import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice2SourcePaths, slice2Conditions, validateSlice2Record, slice2Effects,
    slice2SupportSet, slice2ComposeSupport, slice2WuduCount } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = slice2Conditions(catalog, read), smoke = slice2Conditions(catalog, read, { smoke: true });

test('xuanming ordinary poison is source-bounded, not an arbitrary condition whitelist', () => {
    const c = cases.find(x => x.id === 'school-slice2-xuanming-ordinary-baseline-l250');
    const good = trace(c);
    for (const snapshots of [good.before, good.immediate])
        snapshots[0].effective_skills.strike = 375;
    good.metrics[0].neili_cost = 100;
    good.immediate[0].neili -= 100;
    good.immediate[1].conditions = {
        xuanming_poison: { level: 0, remain: 0, id: 'left', name: '玄冥寒毒' },
    };
    good.after = structuredClone(good.immediate);
    assert.equal(validateSlice2Record(good, c).hit, true);
    for (const mutate of [
        r => { r.immediate[1].conditions.wrong_poison = 1; },
        r => { r.immediate[1].conditions.xuanming_poison.level = 3; },
        r => { r.immediate[1].conditions.xuanming_poison.remain = 1; },
        r => { r.before[0].effective_skills.strike = 299; },
        r => { r.attacks[0].result = -1; },
    ]) {
        const bad = structuredClone(good); mutate(bad);
        bad.after = structuredClone(bad.immediate);
        assert.throws(() => validateSlice2Record(bad, c));
    }
});

function state(cfg, side) {
    const src = side ? cfg.target : cfg.actor;
    const handSkills = ['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'];
    const improve = Math.max(0, ...handSkills.map(s => src.skills[s] || 0));
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
        jiali: src.properties.jiali,
        effective_str: src.properties.str + Math.trunc(improve / 10),
        effective_skills: { ...src.skills },
        conditions: 0,
    };
}

function trace(c, { hit = true, input = 100, input2 = 120, gain = 6, palm1 = true, palm2 = true } = {}) {
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
        if (p.collection_group === 'slice2-wudu') {
            const count = slice2WuduCount(before[1]);
            const fee = hit ? count : 0;
            b.neili -= fee;
            if (hit) {
                b.busy = 2;
                raw.directs = [{ actor: 0, target: 1, damage: input }];
                raw.dodge_checks = [{ result: 0 }];
                raw.metrics[0] = { direct: 1 };
                const support = slice2SupportSet(input, 70 + count, before[0], before[1], 'REMOTE');
                const out = support[0];
                v.qi = out.qi; v.eff_qi = out.eff_qi;
                v.eff_jing -= 8; v.jing = Math.min(v.jing, v.eff_jing);
                v.conditions = { wudu_shenzhang: { level: count, id: 'left', name: '噬心毒', remain: count * 5 } };
            } else {
                b.busy = 2; v.busy = 1;
            }
        } else if (p.collection_group === 'slice2-tiezhang') {
            const fee = hit ? 250 : 100;
            b.neili -= fee; b.busy = hit ? 3 : 4;
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, damage: input }];
                raw.dodge_checks = [{ result: 0 }];
                raw.metrics[0] = { direct: 1 };
                const support = slice2SupportSet(input, 65, before[0], before[1], 'UNARMED');
                const out = support[0];
                v.qi = out.qi; v.eff_qi = out.eff_qi;
            }
        } else if (p.collection_group === 'slice2-shenlong') {
            // Synthesize one of three branches via hit + fee hints on the variant.
            const parry = p.variant === 'hit-dodge' ? false : hit;
            const dodge = p.variant === 'hit-dodge' ? true : (p.variant === 'miss' ? false : hit && !parry ? true : false);
            let fee, percent, busy;
            if (parry && hit) { fee = 150; percent = 50; busy = 2; }
            else if (dodge && hit) { fee = 180; percent = 55; busy = 3; }
            else { fee = 100; busy = 3; }
            b.neili -= fee; b.busy = busy;
            if (fee !== 100) {
                raw.directs = [{ actor: 0, target: 1, damage: input }];
                raw.dodge_checks = [{ result: fee === 150 ? 0 : -1 }];
                raw.metrics[0] = { direct: 1 };
                const support = slice2SupportSet(input, percent, before[0], before[1], 'REMOTE');
                const out = support[0];
                v.qi = out.qi; v.eff_qi = out.eff_qi;
            }
        } else {
            // xuanming: two palms; palm1/palm2 flags select which hit.
            const [hit1, miss1] = [200, 100], [hit2, miss2] = [300, 150];
            const fee = (palm1 ? hit1 : miss1) + (palm2 ? hit2 : miss2);
            b.neili -= fee; b.busy = 4;
            const hits = [];
            if (palm1) hits.push({ damage: input, percent: 60 });
            if (palm2) hits.push({ damage: input2, percent: 80 });
            if (hits.length) {
                raw.directs = hits.map(h => ({ actor: 0, target: 1, damage: h.damage }));
                raw.dodge_checks = hits.map(() => ({ result: 0 }));
                raw.metrics[0] = { direct: hits.length };
                if (hits.length === 2) {
                    const out = slice2ComposeSupport(input, 60, input2, 80,
                        before[0], before[1], 'UNARMED')[0];
                    v.qi = out.qi; v.eff_qi = out.eff_qi;
                } else {
                    const out = slice2SupportSet(hits[0].damage, hits[0].percent,
                        before[0], before[1], 'UNARMED')[0];
                    v.qi = out.qi; v.eff_qi = out.eff_qi;
                }
                v.conditions = { xuanming_poison: { level: 0, id: 'left', name: '玄冥寒毒', remain: 0 } };
            }
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('51 条件有限矩阵：每派 11-14 条件、正式 904、烟雾 85，ID 唯一', () => {
    assert.equal(cases.length, 51);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 904);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 85);
    assert.equal(new Set(cases.map(c => c.id)).size, 51);
    for (const dir of ['wudu', 'tiezhang', 'shenlong', 'xuanming']) {
        assert.ok(cases.some(c => c.parameters.collection_group === 'slice2-' + dir), dir);
    }
    for (const c of cases) {
        assert.equal(c.stage, 'school');
        assert.equal(c.parameters.not_applicable, '');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.ok(slice2SourcePaths.includes(c.parameters.base_source.path));
    }
});

test('wudu 契约：count 依赖目标、fee=count、miss 不扣内、毒与精神创伤', () => {
    const hitC = cases.find(x => x.id === 'school-slice2-wudu-perform-hit');
    const hit = trace(hitC, { input: 260 });
    validateSlice2Record(hit, hitC);
    assert.equal(slice2WuduCount(hit.before[1]), 30);
    assert.equal(hit.immediate[0].neili, 6000 - 30);
    assert.equal(hit.immediate[1].conditions.wudu_shenzhang.level, 30);
    const missC = cases.find(x => x.id === 'school-slice2-wudu-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice2Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000);
    assert.equal(miss.immediate[1].busy, 1);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateSlice2Record(bad, hitC));
});

test('tiezhang 契约：UNARMED 直伤、费用 250/100、忙乱 3/4', () => {
    const hitC = cases.find(x => x.id === 'school-slice2-tiezhang-perform-hit');
    const hit = trace(hitC, { input: 300 });
    validateSlice2Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 250);
    assert.equal(hit.immediate[0].busy, 3);
    const missC = cases.find(x => x.id === 'school-slice2-tiezhang-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice2Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 100);
    assert.equal(miss.immediate[0].busy, 4);
});

test('shenlong 契约：三段费用 150/180/100 与 percent 50/55', () => {
    const parryC = cases.find(x => x.id === 'school-slice2-shenlong-perform-hit-parry');
    const parry = trace(parryC, { input: 150 });
    validateSlice2Record(parry, parryC);
    assert.equal(parry.immediate[0].neili, 6000 - 150);
    assert.equal(parry.immediate[0].busy, 2);
    const dodgeC = cases.find(x => x.id === 'school-slice2-shenlong-perform-hit-dodge');
    const dodge = trace(dodgeC, { hit: true });
    validateSlice2Record(dodge, dodgeC);
    assert.equal(dodge.immediate[0].neili, 6000 - 180);
    assert.equal(dodge.immediate[0].busy, 3);
    const missC = cases.find(x => x.id === 'school-slice2-shenlong-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice2Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 100);
});

test('xuanming 契约：双 do_damage、费用组合、me busy 4、毒覆盖', () => {
    const hitC = cases.find(x => x.id === 'school-slice2-xuanming-perform-hit');
    const both = trace(hitC, { input: 200, input2: 260, palm1: true, palm2: true });
    validateSlice2Record(both, hitC);
    assert.equal(both.directs.length, 2);
    assert.equal(both.immediate[0].neili, 6000 - 500);
    assert.equal(both.immediate[0].busy, 4);
    assert.ok(both.immediate[1].conditions.xuanming_poison);
    const missC = cases.find(x => x.id === 'school-slice2-xuanming-perform-miss');
    const miss = trace(missC, { hit: false, palm1: false, palm2: false });
    validateSlice2Record(miss, missC);
    assert.equal(miss.directs.length, 0);
    assert.equal(miss.immediate[0].neili, 6000 - 250);
    // Single-palm combinations also pass through the same validator.
    const one = trace(hitC, { input: 200, input2: 260, palm1: true, palm2: false });
    validateSlice2Record(one, hitC);
    assert.equal(one.directs.length, 1);
    assert.equal(one.immediate[0].neili, 6000 - 350);
    const two = trace(hitC, { input: 200, input2: 260, palm1: false, palm2: true });
    validateSlice2Record(two, hitC);
    assert.equal(two.directs.length, 1);
    assert.equal(two.immediate[0].neili, 6000 - 400);
});

test('拒绝/接口/普通攻击契约与错误样本豁免', () => {
    const refusal = cases.find(x => x.id === 'school-slice2-wudu-perform-gate-force-199');
    const r = trace(refusal); validateSlice2Record(r, refusal);
    const learn = cases.find(x => x.id === 'school-slice2-tiezhang-interface-learn-str-31');
    validateSlice2Record(trace(learn), learn);
    const learnOk = cases.find(x => x.id === 'school-slice2-tiezhang-interface-learn-str-32');
    validateSlice2Record(trace(learnOk), learnOk);
    const ordinary = cases.find(x => x.id === 'school-slice2-shenlong-ordinary-baseline-l200');
    validateSlice2Record(trace(ordinary), ordinary);
    const err = trace(refusal); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateSlice2Record(err, refusal), null);
    const dup = trace(ordinary); dup.index = ordinary.samples;
    assert.throws(() => validateSlice2Record(dup, ordinary));
});

test('effects 汇总分母独立：错误不入效果、命中率有界', () => {
    const c = cases.find(x => x.id === 'school-slice2-wudu-perform-hit');
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c, { input: 260 }) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: trace(c) },
    ];
    rows[1].raw.outcome = 'error'; rows[1].raw.reason = 'driver interruption';
    const e = slice2Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});
