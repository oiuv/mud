import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice7SourcePaths, slice7Conditions, validateSlice7Record, slice7Effects,
    slice7SupportSet } from './school_slice7_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = slice7Conditions(catalog, read), smoke = slice7Conditions(catalog, read, { smoke: true });

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

const fees = {
    shang: { hit: 80, miss: 30, hitBusy: 2, missBusy: 3, percent: 35 },
    hu: { hit: 150, miss: 50, hitBusy: 2, missBusy: 3, percent: 65 },
    // 狡黠多变 start_busy trait may decrement busy by 1 when raw value >1.
    none: { hit: 0, miss: 0, hitBusy: [1, 2], missBusy: [2, 3], percent: 50 },
    ultra: { hit: 120, miss: 50, hitBusy: [1, 2], missBusy: [1, 2], percent: 40 },
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
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, damage: input }];
            raw.dodge_checks = [{ result: 0 }];
            raw.metrics[0] = { direct: 1 };
            const support = slice7SupportSet(input, f.percent, before[0], before[1], 'WEAPON');
            const out = support[0];
            v.qi = out.qi; v.eff_qi = out.eff_qi;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('42 条件有限矩阵：shang/hu 各 12、none 8、ultra 10；正式 884、烟雾 71，ID 唯一', () => {
    assert.equal(cases.length, 42);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 884);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 71);
    assert.equal(new Set(cases.map(c => c.id)).size, 42);
    for (const [dir, want] of [['shang', 12], ['hu', 12], ['none', 8], ['ultra', 10]]) {
        assert.equal(cases.filter(c => c.parameters.collection_group === 'slice7-' + dir).length, want, dir);
    }
    for (const c of cases) {
        assert.equal(c.stage, 'school');
        assert.equal(c.parameters.not_applicable, '');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.ok(slice7SourcePaths.includes(c.parameters.base_source.path));
    }
});

test('none/ultra 角色为狡黠多变；none 无 grant 且 skill<90 同文案，不设 can_learn 标记', () => {
    for (const dir of ['none', 'ultra']) {
        const c = cases.find(x => x.id === `school-slice7-${dir}-perform-baseline-l${dir === 'none' ? 200 : 250}`);
        assert.equal(c.parameters.actor.properties.character, '狡黠多变', dir);
        assert.ok(!Object.keys(c.parameters.actor.properties).some(k => k.startsWith('can_perform/')), dir);
        assert.ok(!Object.keys(c.parameters.actor.properties).some(k => k.startsWith('can_learn/')), dir);
    }
    const low = cases.find(x => x.id === 'school-slice7-none-perform-gate-level-89');
    assert.equal(low.parameters.refusal, '你所使用的外功中没有这种功能。\n');
    const high = cases.find(x => x.id === 'school-slice7-none-perform-gate-level-90');
    assert.equal(high.parameters.expected, 'observed');
    const r = trace(low); validateSlice7Record(r, low);
    assert.equal(r.directs.length, 0);
});

test('none 契约：WEAPON 50% 直伤、两分支零内力、忙乱区间 1-2/2-3', () => {
    const hitC = cases.find(x => x.id === 'school-slice7-none-perform-hit');
    const hit = trace(hitC, { input: 300 });
    validateSlice7Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000);
    assert.equal(hit.immediate[0].busy, 2);
    assert.equal(hit.directs.length, 1);
    const missC = cases.find(x => x.id === 'school-slice7-none-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice7Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000);
    assert.equal(miss.immediate[0].busy, 3);
    const bad = trace(hitC, { input: 300 });
    bad.immediate[0].neili = 6000 - 50;
    bad.after = structuredClone(bad.immediate);
    assert.throws(() => validateSlice7Record(bad, hitC));
    const reduced = trace(hitC, { input: 300 });
    reduced.immediate[0].busy = 1;
    reduced.after = structuredClone(reduced.immediate);
    validateSlice7Record(reduced, hitC);
});

test('ultra 契约：反向命中等号成立、费用 120/50、忙乱区间 1-2、绝招在 perform 子目录', () => {
    const hitC = cases.find(x => x.id === 'school-slice7-ultra-perform-hit');
    assert.equal(hitC.parameters.ability, 'juemie');
    assert.ok(hitC.entry_id.includes('never-defeated/perform/juemie.c'));
    const hit = trace(hitC, { input: 300 });
    validateSlice7Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 120);
    assert.equal(hit.immediate[0].busy, 2);
    const missC = cases.find(x => x.id === 'school-slice7-ultra-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice7Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 50);
    assert.equal(miss.immediate[0].busy, 2);
    const reduced = trace(hitC, { input: 300 });
    reduced.immediate[0].busy = 1;
    reduced.after = structuredClone(reduced.immediate);
    validateSlice7Record(reduced, hitC);
});

test('ultra learnSkills 折叠 blade/whip/throwing/martial-cognize 250 且 int 门 21/22', () => {
    const low = cases.find(x => x.id === 'school-slice7-ultra-interface-learn-int-21');
    const high = cases.find(x => x.id === 'school-slice7-ultra-interface-learn-int-22');
    assert.equal(low.parameters.refusal, '你觉得不败神功过于深奥，绝非自己的智力所能理解。\n');
    for (const c of [low, high]) {
        assert.equal(c.parameters.actor.skills.blade, 250);
        assert.equal(c.parameters.actor.skills.whip, 250);
        assert.equal(c.parameters.actor.skills.throwing, 250);
        assert.equal(c.parameters.actor.skills['martial-cognize'], 250);
    }
    validateSlice7Record(trace(low), low);
    validateSlice7Record(trace(high), high);
});

test('shang 契约：WEAPON 35% 直伤、费用 80/30、忙乱 2/3', () => {
    const hitC = cases.find(x => x.id === 'school-slice7-shang-perform-hit');
    const hit = trace(hitC, { input: 300 });
    validateSlice7Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 80);
    assert.equal(hit.immediate[0].busy, 2);
    const missC = cases.find(x => x.id === 'school-slice7-shang-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice7Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 30);
    assert.equal(miss.immediate[0].busy, 3);
});

test('hu 契约：WEAPON 65% 直伤、四分位命中、费用 150/50、忙乱 2/3', () => {
    const hitC = cases.find(x => x.id === 'school-slice7-hu-perform-hit');
    assert.equal(hitC.parameters.target.skills.force, 0);
    const missC = cases.find(x => x.id === 'school-slice7-hu-perform-miss');
    assert.equal(missC.parameters.target.skills.force, 100000);
    const hit = trace(hitC, { input: 300 });
    validateSlice7Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 150);
    assert.equal(hit.immediate[0].busy, 2);
    const miss = trace(missC, { hit: false });
    validateSlice7Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 50);
    assert.equal(miss.immediate[0].busy, 3);
});

test('shang/hu learn max_neili 门与 none learn int 门：边界拒绝/接受', () => {
    const sLow = cases.find(x => x.id === 'school-slice7-shang-interface-learn-max_neili-349');
    const sHigh = cases.find(x => x.id === 'school-slice7-shang-interface-learn-max_neili-350');
    assert.equal(sLow.parameters.refusal, '你的内力不够。\n');
    assert.equal(sLow.parameters.actor.properties.max_neili, 349);
    assert.equal(sHigh.parameters.actor.properties.max_neili, 350);
    validateSlice7Record(trace(sLow), sLow);
    validateSlice7Record(trace(sHigh), sHigh);
    const hLow = cases.find(x => x.id === 'school-slice7-hu-interface-learn-max_neili-1399');
    const hHigh = cases.find(x => x.id === 'school-slice7-hu-interface-learn-max_neili-1400');
    assert.equal(hLow.parameters.actor.properties.max_neili, 1399);
    assert.equal(hHigh.parameters.actor.properties.max_neili, 1400);
    validateSlice7Record(trace(hLow), hLow);
    validateSlice7Record(trace(hHigh), hHigh);
    const nLow = cases.find(x => x.id === 'school-slice7-none-interface-learn-int-38');
    const nHigh = cases.find(x => x.id === 'school-slice7-none-interface-learn-int-39');
    assert.equal(nLow.parameters.refusal, '你的天资不足，无法理解独孤九剑的剑意。\n');
    assert.equal(nLow.parameters.actor.properties.int, 38);
    assert.equal(nHigh.parameters.actor.properties.int, 39);
    validateSlice7Record(trace(nLow), nLow);
    validateSlice7Record(trace(nHigh), nHigh);
});

test('拒绝/接口/普通攻击契约与错误样本豁免', () => {
    const refusal = cases.find(x => x.id === 'school-slice7-shang-perform-gate-level-49');
    const r = trace(refusal); validateSlice7Record(r, refusal);
    const learn = cases.find(x => x.id === 'school-slice7-ultra-interface-learn-int-21');
    validateSlice7Record(trace(learn), learn);
    const learnOk = cases.find(x => x.id === 'school-slice7-ultra-interface-learn-int-22');
    validateSlice7Record(trace(learnOk), learnOk);
    const ordinary = cases.find(x => x.id === 'school-slice7-hu-ordinary-baseline-l250');
    validateSlice7Record(trace(ordinary), ordinary);
    const err = trace(refusal); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateSlice7Record(err, refusal), null);
    const dup = trace(ordinary); dup.index = ordinary.samples;
    assert.throws(() => validateSlice7Record(dup, ordinary));
});

test('effects 汇总分母独立：错误不入效果、命中率有界', () => {
    const c = cases.find(x => x.id === 'school-slice7-ultra-perform-hit');
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c, { input: 300 }) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: trace(c) },
    ];
    rows[1].raw.outcome = 'error'; rows[1].raw.reason = 'driver interruption';
    const e = slice7Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});
