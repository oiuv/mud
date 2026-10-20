import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice8SourcePaths, slice8Conditions, validateSlice8Record, slice8Effects,
    slice8SupportSet } from './school_slice8_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = slice8Conditions(catalog, read), smoke = slice8Conditions(catalog, read, { smoke: true });

function state(cfg, side) {
    const src = side ? cfg.target : cfg.actor;
    const handSkills = ['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'];
    const improve = Math.max(0, ...handSkills.map(s => src.skills[s] || 0));
    const equip = src.equipment;
    const held = Boolean(equip?.hold);
    const weapon = equip && !held ? equip.type : 'none';
    const handing = held ? equip.type : 'none';
    return {
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        skills: { ...src.skills }, learned: {}, mappings: { ...src.mappings },
        preparations: { ...src.preparations },
        temp: { apply: { armor: 100, ...(equip && !held ? { damage: 50, dodge: -1 } : {}) },
            ...(held ? { handing: '/tests/weapon#' + (200 + side) } : {}) },
        busy: null,
        qi: src.properties.qi, eff_qi: src.properties.eff_qi, jing: src.properties.jing,
        eff_jing: src.properties.eff_jing, neili: src.properties.neili, max_neili: src.properties.max_neili,
        str: src.properties.str, int: src.properties.int, con: src.properties.con,
        dex: src.properties.dex, shen: src.properties.shen, gender: src.properties.gender,
        character: src.properties.character,
        weapon, weapon_damage: equip && !held ? 50 : 0, weapon_flag: 0,
        weapon_details: equip && !held
            ? { object: '/tests/weapon#' + (200 + side), skill_type: weapon, consistence: 100 } : {},
        handing, ammunition: held ? 10 : 0,
        handing_details: held
            ? { object: '/tests/weapon#' + (200 + side), skill_type: handing, consistence: 100,
                amount: 10, name: '演武金蛇锥' } : {},
        effective_str: src.properties.str + Math.trunc(improve / 10),
        effective_skills: { ...src.skills },
        conditions: 0,
    };
}

const fees = {
    tangmen: { hit: 100, miss: 100, hitBusy: 2, missBusy: 3 },
    xiakedao: { hit: 600, miss: 300, hitBusy: 3, missBusy: 2, percent: 80, percentRange: [80, 84] },
    yunlong: { hit: 180, miss: 100, hitBusy: 2, missBusy: 4, percent: 30 },
};

const busyValue = v => Array.isArray(v) ? v[v.length - 1] : v;

function trace(c, { hit = true, input = 100 } = {}) {
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
        const f = fees[p.school];
        const fee = hit ? f.hit : f.miss;
        b.neili -= fee;
        b.busy = busyValue(hit ? f.hitBusy : f.missBusy);
        if (p.school === 'tangmen') {
            if (hit) {
                b.ammunition -= 1;
                b.handing_details = { ...b.handing_details, amount: 9 };
                v.qi -= input; v.eff_qi -= input;
            } else {
                b.ammunition = 0; b.handing = 'none'; b.handing_details = {};
                delete b.temp.handing;
                raw.dropped = [{ object: before[0].handing_details.object, name: '演武金蛇锥',
                    type: 'throwing' }];
                v.neili = Math.max(0, v.neili - 1000);
            }
        } else if (hit) {
            raw.directs = [{ actor: 0, target: 1, damage: input, percent: f.percent }];
            raw.dodge_checks = [{ result: 0 }];
            raw.metrics[0] = { direct: 1 };
            const support = slice8SupportSet(input, f.percent, before[0], before[1],
                p.school === 'xiakedao' ? 'UNARMED' : 'WEAPON', f.percentRange);
            const out = support[0];
            v.qi = out.qi; v.eff_qi = out.eff_qi;
            if (p.school === 'xiakedao') {
                v.jing -= Math.trunc(input / 2);
                v.eff_jing -= Math.trunc(input / 3);
                v.neili -= 375;
            }
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('38 条件有限矩阵：tangmen 16、xiakedao 10、yunlong 12；正式 676、烟雾 63，ID 唯一', () => {
    assert.equal(cases.length, 38);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 676);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 63);
    assert.equal(new Set(cases.map(c => c.id)).size, 38);
    for (const [dir, want] of [['tangmen', 16], ['xiakedao', 10], ['yunlong', 12]]) {
        assert.equal(cases.filter(c => c.parameters.collection_group === 'slice8-' + dir).length, want, dir);
    }
    for (const c of cases) {
        assert.equal(c.stage, 'school');
        assert.equal(c.parameters.not_applicable, '');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.ok(slice8SourcePaths.includes(c.parameters.base_source.path));
    }
});

test('tangmen 契约：receive 无 do_damage、wound=100%伤害、费用 100/100、忙乱 2/3、夹具 hold', () => {
    const hitC = cases.find(x => x.id === 'school-slice8-tangmen-perform-hit');
    assert.equal(hitC.parameters.actor.equipment.hold, true);
    assert.equal(hitC.parameters.actor.equipment.type, 'throwing');
    const hit = trace(hitC, { input: 300 });
    validateSlice8Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 100);
    assert.equal(hit.immediate[0].busy, 2);
    assert.equal(hit.directs.length, 0);
    assert.equal(hit.immediate[0].ammunition, 9);
    assert.equal(hit.immediate[1].qi, 10000 - 300);
    assert.equal(hit.immediate[1].eff_qi, 10000 - 300);
    const missC = cases.find(x => x.id === 'school-slice8-tangmen-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice8Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 100);
    assert.equal(miss.immediate[0].busy, 3);
    assert.equal(miss.dropped.length, 1);
    assert.equal(miss.dropped[0].type, 'throwing');
    assert.equal(miss.immediate[0].ammunition, 0);
    assert.equal(miss.immediate[1].neili, 5000);
    const bad = trace(hitC, { input: 300 });
    bad.immediate[1].eff_qi = 10000 - 200;
    bad.after = structuredClone(bad.immediate);
    assert.throws(() => validateSlice8Record(bad, hitC), /wound = 100%/);
});

test('xiakedao 契约：UNARMED percentRange 80-84、反向命中等号成立、严禁 literate、费用 600/300', () => {
    const hitC = cases.find(x => x.id === 'school-slice8-xiakedao-perform-hit');
    assert.equal(hitC.parameters.grant, undefined);
    assert.ok(hitC.parameters.actor.properties['can_perform/taixuan-gong/hun']);
    const hit = trace(hitC, { input: 300 });
    validateSlice8Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 600);
    assert.equal(hit.immediate[0].busy, 3);
    assert.equal(hit.immediate[1].jing, 10000 - 150);
    assert.equal(hit.immediate[1].eff_jing, 10000 - 100);
    assert.equal(hit.immediate[1].neili, 6000 - 375);
    const missC = cases.find(x => x.id === 'school-slice8-xiakedao-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice8Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 300);
    assert.equal(miss.immediate[0].busy, 2);
    // percentRange: support set must accept each tier 80..84.
    for (let pct = 80; pct <= 84; pct++) {
        const support = slice8SupportSet(300, pct, hit.before[0], hit.before[1], 'UNARMED', [80, 84]);
        assert.ok(support.length > 0, 'percent ' + pct);
    }
    // literate is hard-forbidden.
    const literate = trace(hitC, { input: 300 });
    literate.before[0].skills.literate = 100;
    literate.immediate[0].skills.literate = 100;
    literate.after = structuredClone(literate.immediate);
    assert.throws(() => validateSlice8Record(literate, hitC), /literate/);
});

test('yunlong 契约：WEAPON 30% 直伤、非标准命中、费用 180/100、忙乱 2/4、hit 转向容错', () => {
    const hitC = cases.find(x => x.id === 'school-slice8-yunlong-perform-hit');
    assert.equal(hitC.parameters.target.skills.force, 0);
    const hit = trace(hitC, { input: 300 });
    validateSlice8Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 180);
    assert.equal(hit.immediate[0].busy, 2);
    const missC = cases.find(x => x.id === 'school-slice8-yunlong-perform-miss');
    assert.equal(missC.parameters.target.skills.force, 100000);
    const miss = trace(missC, { hit: false });
    validateSlice8Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 100);
    assert.equal(miss.immediate[0].busy, 4);
    // 1/250 hit-steering flake (random()=0) must validate as a miss branch.
    const flake = trace(hitC, { hit: false });
    validateSlice8Record(flake, hitC);
    assert.equal(flake.directs.length, 0);
    assert.equal(flake.immediate[0].neili, 6000 - 100);
});

test('tangmen/xiakedao/yunlong learn 门边界：dex 29/30、int 37/38、max_neili 899/900', () => {
    const tLow = cases.find(x => x.id === 'school-slice8-tangmen-interface-learn-dex-29');
    const tHigh = cases.find(x => x.id === 'school-slice8-tangmen-interface-learn-dex-30');
    assert.equal(tLow.parameters.refusal, '你的身法不够灵巧，无法学习唐门暗器。\n');
    assert.equal(tLow.parameters.actor.properties.dex, 29);
    assert.equal(tHigh.parameters.actor.properties.dex, 30);
    validateSlice8Record(trace(tLow), tLow);
    validateSlice8Record(trace(tHigh), tHigh);
    const xLow = cases.find(x => x.id === 'school-slice8-xiakedao-interface-learn-int-37');
    const xHigh = cases.find(x => x.id === 'school-slice8-xiakedao-interface-learn-int-38');
    assert.equal(xLow.parameters.refusal, '你若有所悟，然而总是有点不明白。\n');
    assert.equal(xLow.parameters.actor.properties.int, 37);
    assert.equal(xHigh.parameters.actor.properties.int, 38);
    validateSlice8Record(trace(xLow), xLow);
    validateSlice8Record(trace(xHigh), xHigh);
    const yLow = cases.find(x => x.id === 'school-slice8-yunlong-interface-learn-max_neili-899');
    const yHigh = cases.find(x => x.id === 'school-slice8-yunlong-interface-learn-max_neili-900');
    assert.equal(yLow.parameters.refusal, '你的内力不够。\n');
    assert.equal(yLow.parameters.actor.properties.max_neili, 899);
    assert.equal(yHigh.parameters.actor.properties.max_neili, 900);
    validateSlice8Record(trace(yLow), yLow);
    validateSlice8Record(trace(yHigh), yHigh);
});

test('tangmen 资格门 5 对与 boyun-suowu 折叠 250；xiakedao grant 与 yunlong 无 grant', () => {
    for (const [key, low, high] of [['level', 179, 180], ['boyun', 179, 180],
        ['force', 199, 200], ['max_neili', 1199, 1200], ['neili', 149, 150]]) {
        const lowC = cases.find(x => x.id === `school-slice8-tangmen-perform-gate-${key}-${low}`);
        const highC = cases.find(x => x.id === `school-slice8-tangmen-perform-gate-${key}-${high}`);
        assert.equal(lowC.parameters.expected, 'refused', key);
        assert.equal(highC.parameters.expected, 'observed', key);
        validateSlice8Record(trace(lowC), lowC);
        validateSlice8Record(trace(highC), highC);
    }
    const base = cases.find(x => x.id === 'school-slice8-tangmen-perform-baseline-l250');
    assert.equal(base.parameters.actor.skills['boyun-suowu'], 250);
    assert.ok(!Object.keys(base.parameters.actor.properties).some(k => k.startsWith('can_perform/')));
    const xBase = cases.find(x => x.id === 'school-slice8-xiakedao-perform-baseline-l250');
    assert.equal(xBase.parameters.actor.properties['can_perform/taixuan-gong/hun'], 1);
    const yBase = cases.find(x => x.id === 'school-slice8-yunlong-perform-baseline-l250');
    assert.ok(!Object.keys(yBase.parameters.actor.properties).some(k => k.startsWith('can_perform/')));
});

test('拒绝/接口/普通攻击契约与错误样本豁免', () => {
    const refusal = cases.find(x => x.id === 'school-slice8-tangmen-perform-gate-level-179');
    const r = trace(refusal); validateSlice8Record(r, refusal);
    assert.equal(r.directs.length, 0);
    const learn = cases.find(x => x.id === 'school-slice8-xiakedao-interface-learn-int-37');
    validateSlice8Record(trace(learn), learn);
    const learnOk = cases.find(x => x.id === 'school-slice8-xiakedao-interface-learn-int-38');
    validateSlice8Record(trace(learnOk), learnOk);
    const ordinary = cases.find(x => x.id === 'school-slice8-yunlong-ordinary-baseline-l250');
    validateSlice8Record(trace(ordinary), ordinary);
    const err = trace(refusal); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateSlice8Record(err, refusal), null);
    const dup = trace(ordinary); dup.index = ordinary.samples;
    assert.throws(() => validateSlice8Record(dup, ordinary));
});

test('effects 汇总分母独立：错误不入效果、命中率有界', () => {
    const c = cases.find(x => x.id === 'school-slice8-yunlong-perform-hit');
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c, { input: 300 }) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: trace(c) },
    ];
    rows[1].raw.outcome = 'error'; rows[1].raw.reason = 'driver interruption';
    const e = slice8Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});
