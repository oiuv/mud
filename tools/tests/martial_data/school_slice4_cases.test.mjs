import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice4SourcePaths, slice4Conditions, validateSlice4Record, slice4Effects,
    slice4SupportSet } from './school_slice4_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = slice4Conditions(catalog, read), smoke = slice4Conditions(catalog, read, { smoke: true });

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
        effective_str: src.properties.str + Math.trunc(improve / 10),
        effective_skills: { ...src.skills },
        conditions: 0,
    };
}

function trace(c, { hit = true, input = 100, busy = 5 } = {}) {
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
        const fee = hit ? (school === 'xueshan' ? 100 : school === 'xuedao' ? 150
            : school === 'riyue' ? 200 : 60)
            : (school === 'xueshan' ? 50 : school === 'xuedao' ? 100
                : school === 'riyue' ? 150 : 30);
        const busyAfter = school === 'jueqing' ? (hit ? busy : 2)
            : school === 'xueshan' ? (hit ? 2 : 3)
                : school === 'xuedao' ? 2 : (hit ? 2 : 3);
        b.neili -= fee; b.busy = busyAfter;
        if (school === 'xuedao') {
            // receive_wound("qi", 50) on both branches.
            b.eff_qi -= 50; b.qi = Math.min(b.qi, b.eff_qi);
        }
        if (hit) {
            const percent = school === 'xueshan' ? 90 : school === 'xuedao' ? 80
                : school === 'riyue' ? 90 : 24;
            const dtype = school === 'riyue' ? 'REMOTE' : 'WEAPON';
            raw.directs = [{ actor: 0, target: 1, damage: input }];
            raw.dodge_checks = [{ result: 0 }];
            raw.metrics[0] = { direct: 1 };
            const support = slice4SupportSet(input, percent, before[0], before[1], dtype);
            const out = support[0];
            v.qi = out.qi; v.eff_qi = out.eff_qi;
            if (school === 'riyue') v.temp = { ...v.temp, no_perform: 1 };
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('46 条件有限矩阵：每派 10-12 条件、正式 892、烟雾 77，ID 唯一', () => {
    assert.equal(cases.length, 46);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 892);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 77);
    assert.equal(new Set(cases.map(c => c.id)).size, 46);
    for (const dir of ['xueshan', 'xuedao', 'riyue', 'jueqing']) {
        assert.ok(cases.some(c => c.parameters.collection_group === 'slice4-' + dir), dir);
    }
    for (const c of cases) {
        assert.equal(c.stage, 'school');
        assert.equal(c.parameters.not_applicable, '');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.ok(slice4SourcePaths.includes(c.parameters.base_source.path));
    }
});

test('能力路径：xuedao/riyue 位于 perform 子目录，riyue 交叉授权', () => {
    const xue = cases.find(x => x.id === 'school-slice4-xuedao-perform-baseline-l250');
    assert.equal(xue.parameters.ability_source.path, 'kungfu/skill/xuedao-dafa/perform/xue.c');
    const bian = cases.find(x => x.id === 'school-slice4-riyue-perform-baseline-l300');
    assert.equal(bian.parameters.ability_source.path, 'kungfu/skill/kuihua-mogong/perform/bian.c');
    assert.equal(bian.parameters.actor.properties['can_perform/pixie-jian/po'], 1);
    assert.equal(bian.parameters.actor.properties['can_perform/kuihua-mogong/bian'], undefined);
    const feng = cases.find(x => x.id === 'school-slice4-xueshan-perform-baseline-l250');
    assert.equal(feng.parameters.ability_source.path, 'kungfu/skill/xueshan-jian/feng.c');
});

test('xueshan 契约：WEAPON 直伤、费用 100/50、忙乱 2/3', () => {
    const hitC = cases.find(x => x.id === 'school-slice4-xueshan-perform-hit');
    const hit = trace(hitC, { input: 260 });
    validateSlice4Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 100);
    assert.equal(hit.immediate[0].busy, 2);
    assert.equal(hit.directs.length, 1);
    const missC = cases.find(x => x.id === 'school-slice4-xueshan-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice4Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 50);
    assert.equal(miss.immediate[0].busy, 3);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateSlice4Record(bad, hitC));
});

test('xuedao 契约：WEAPON 直伤、自伤创 qi 50、费用 150/100、忙乱 2/2', () => {
    const hitC = cases.find(x => x.id === 'school-slice4-xuedao-perform-hit');
    const hit = trace(hitC, { input: 300 });
    validateSlice4Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 150);
    assert.equal(hit.immediate[0].busy, 2);
    assert.equal(hit.immediate[0].eff_qi, 10000 - 50);
    assert.equal(hit.immediate[0].qi, 9950);
    const missC = cases.find(x => x.id === 'school-slice4-xuedao-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice4Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 100);
    assert.equal(miss.immediate[0].eff_qi, 10000 - 50);
    // 缺自伤创记账必须拒绝。
    const bad = structuredClone(hit);
    bad.immediate[0].eff_qi = 10000; bad.immediate[0].qi = 10000;
    bad.after = structuredClone(bad.immediate);
    assert.throws(() => validateSlice4Record(bad, hitC));
});

test('riyue 契约：REMOTE 直伤、final no_perform、费用 200/150、忙乱 2/3', () => {
    const hitC = cases.find(x => x.id === 'school-slice4-riyue-perform-hit');
    const hit = trace(hitC, { input: 300 });
    validateSlice4Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 200);
    assert.equal(hit.immediate[0].busy, 2);
    assert.equal(hit.immediate[1].temp.no_perform, 1);
    assert.equal(hit.before[1].temp.no_perform, undefined);
    const missC = cases.find(x => x.id === 'school-slice4-riyue-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice4Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 150);
    assert.equal(miss.immediate[0].busy, 3);
    assert.equal(miss.immediate[1].temp.no_perform, undefined);
    // 命中缺 no_perform 记账必须拒绝。
    const bad = structuredClone(hit);
    delete bad.immediate[1].temp.no_perform; bad.after = structuredClone(bad.immediate);
    assert.throws(() => validateSlice4Record(bad, hitC));
});

test('jueqing 契约：WEAPON 24% 直伤、费用 60/30、命中忙乱 1-2', () => {
    const hitC = cases.find(x => x.id === 'school-slice4-jueqing-perform-hit');
    for (const busy of [1, 2]) {
        const hit = trace(hitC, { input: 200, busy });
        validateSlice4Record(hit, hitC);
        assert.equal(hit.immediate[0].neili, 6000 - 60);
        assert.equal(hit.immediate[0].busy, busy);
    }
    const missC = cases.find(x => x.id === 'school-slice4-jueqing-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice4Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 30);
    assert.equal(miss.immediate[0].busy, 2);
    const bad = trace(hitC, { input: 200, busy: 3 });
    assert.throws(() => validateSlice4Record(bad, hitC));
});

test('character 门：xuedao/riyue 用心狠手辣，缺失必须拒绝', () => {
    for (const id of ['school-slice4-xuedao-perform-hit', 'school-slice4-riyue-perform-hit']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.actor.properties.character, '心狠手辣');
        const r = trace(c, { input: 100 });
        validateSlice4Record(r, c);
        const bad = structuredClone(r);
        bad.before[0].character = '光明磊落'; bad.immediate[0].character = '光明磊落';
        bad.after = structuredClone(bad.immediate);
        assert.throws(() => validateSlice4Record(bad, c));
    }
    for (const dir of ['xueshan', 'jueqing']) {
        const c = cases.find(x => x.id === `school-slice4-${dir}-perform-baseline-l250`);
        assert.equal(c.parameters.actor.properties.character, '光明磊落');
    }
});

test('xuedao 自映射折叠：level 门用 force 文案，skill 文案不可达', () => {
    const low = cases.find(x => x.id === 'school-slice4-xuedao-perform-gate-level-219');
    const high = cases.find(x => x.id === 'school-slice4-xuedao-perform-gate-level-220');
    assert.equal(low.parameters.refusal, '你的内功火候不够，难以施展「祭血神刀」。\n');
    assert.equal(low.parameters.actor.skills.force, 0);
    assert.equal(low.parameters.actor.skills['xuedao-dafa'], 219);
    assert.equal(high.parameters.actor.skills.force, 0);
    assert.equal(high.parameters.actor.skills['xuedao-dafa'], 220);
    const r = trace(low); validateSlice4Record(r, low);
    const ok = trace(high); validateSlice4Record(ok, high);
});

test('拒绝/接口/普通攻击契约与错误样本豁免', () => {
    const refusal = cases.find(x => x.id === 'school-slice4-riyue-perform-gate-max_neili-3699');
    const r = trace(refusal); validateSlice4Record(r, refusal);
    const learn = cases.find(x => x.id === 'school-slice4-riyue-interface-learn-dex-37');
    validateSlice4Record(trace(learn), learn);
    const learnOk = cases.find(x => x.id === 'school-slice4-riyue-interface-learn-dex-38');
    validateSlice4Record(trace(learnOk), learnOk);
    const ordinary = cases.find(x => x.id === 'school-slice4-jueqing-ordinary-baseline-l250');
    validateSlice4Record(trace(ordinary), ordinary);
    const err = trace(refusal); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateSlice4Record(err, refusal), null);
    const dup = trace(ordinary); dup.index = ordinary.samples;
    assert.throws(() => validateSlice4Record(dup, ordinary));
});

test('effects 汇总分母独立：错误不入效果、命中率有界', () => {
    const c = cases.find(x => x.id === 'school-slice4-xueshan-perform-hit');
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c, { input: 260 }) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: trace(c) },
    ];
    rows[1].raw.outcome = 'error'; rows[1].raw.reason = 'driver interruption';
    const e = slice4Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});
