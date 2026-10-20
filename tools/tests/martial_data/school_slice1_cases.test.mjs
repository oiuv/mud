import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice1SourcePaths, slice1Conditions, validateSlice1Record, slice1Effects, slice1SupportSet }
    from './school_slice1_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = slice1Conditions(catalog, read), smoke = slice1Conditions(catalog, read, { smoke: true });

function state(cfg, side) {
    const src = side ? cfg.target : cfg.actor;
    // query_str() = raw str + max(hand-skills)/10 (feature/attribute.c)
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
        dex: src.properties.dex, character: src.properties.character,
        effective_str: src.properties.str + Math.trunc(improve / 10),
        effective_skills: { ...src.skills },
    };
}

function trace(c, { hit = true, input = 100, gain = 6 } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const before = [state(p, 0), state(p, 1)];
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        outcome: p.expected, elapsed: 0.01, before, immediate: structuredClone(before),
        after: structuredClone(before), metrics: [{}, {}], actions: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], callbacks: [], dropped: [], terminals: [],
        launches: [], refusals: [], reason: '' };
    const b = raw.immediate[0], v = raw.immediate[1];
    if (c.method === 'interface') {
        raw.interfaces = [{ ...p.interface, result: accepted ? 1 : 0 }];
        if (!accepted) {
            raw.reason = p.refusal;
        }
    } else if (c.method === 'ordinary') {
        raw.actions = [{ actor: 0, target: 1, action: 'attack' }];
        raw.attacks = [{ actor: 0, target: 1, type: 0, result: 0, damage: 30 }];
        v.qi -= 30;
    } else if (!accepted) {
        raw.reason = p.refusal;
        raw.refusals = [{ actor: before[0].object, reason: p.refusal }];
    } else {
        raw.launches = [{ actor: before[0].object, skill: p.skill, argument: p.ability + ' right' }];
        if (p.collection_group === 'slice1-gaibang') {
            b.neili -= 50;
            if (hit) { b.busy = 1; v.busy = Math.trunc(p.level / 18) + 2; }
            else b.busy = 2;
            raw.dodge_checks = hit ? [{ result: -1 }] : [];
        } else if (p.collection_group === 'slice1-xiaoyao') {
            b.neili -= 400; b.busy = 2;
            b.temp.dex = Math.trunc(b.skills['lingbo-weibu'] / 30); b.temp.lingbo = 1;
        } else {
            const fee = hit ? (p.skill === 'qiankun-jian' ? 150 : 200) : (p.skill === 'qiankun-jian' ? 50 : 100);
            b.neili -= fee; b.busy = hit ? 2 : (p.skill === 'qiankun-jian' ? 3 : 1);
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, damage: input }];
                raw.dodge_checks = [{ result: 0 }];
                raw.metrics[0] = { direct: 1 };
                const support = slice1SupportSet(input, p.skill === 'qiankun-jian' ? 60 : 0,
                    before[0], before[1], p.skill === 'qiankun-jian' ? 'WEAPON' : 'REMOTE');
                const out = support[0];
                v.qi = out.qi; v.eff_qi = out.eff_qi;
                if (p.skill === 'yiyang-zhi') v.temp.no_perform = 1;
            }
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
    for (const dir of ['gaibang', 'xiaoyao', 'kunlun', 'duan']) {
        assert.ok(cases.some(c => c.parameters.collection_group === 'slice1-' + dir), dir);
    }
    for (const c of cases) {
        assert.equal(c.stage, 'school');
        assert.equal(c.parameters.not_applicable, '');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.ok(slice1SourcePaths.includes(c.parameters.base_source.path));
    }
});

test('control 契约：缠字诀命中/未中分支与忙乱公式、费用恒定', () => {
    const c = cases.find(x => x.id === 'school-slice1-gaibang-perform-hit');
    const hit = trace(c);
    validateSlice1Record(hit, c);
    const miss = trace(cases.find(x => x.id === 'school-slice1-gaibang-perform-miss'), { hit: false });
    validateSlice1Record(miss, cases.find(x => x.id === 'school-slice1-gaibang-perform-miss'));
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateSlice1Record(bad, c));
    const badBusy = structuredClone(hit); badBusy.immediate[1].busy = 99;
    assert.throws(() => validateSlice1Record(badBusy, c));
});

test('buff 契约：洛神凌波 dex 增益/lingbo 标记与费用', () => {
    const c = cases.find(x => x.id === 'school-slice1-xiaoyao-perform-hit');
    const raw = trace(c);
    validateSlice1Record(raw, c);
    const bad = structuredClone(raw); bad.immediate[0].temp.dex -= 1;
    assert.throws(() => validateSlice1Record(bad, c));
});

test('direct 契约：乾坤劲/神指点穴费用分支、no_perform 仅命中', () => {
    const qian = cases.find(x => x.id === 'school-slice1-kunlun-perform-hit');
    const qhit = trace(qian); validateSlice1Record(qhit, qian);
    const qmissC = cases.find(x => x.id === 'school-slice1-kunlun-perform-miss');
    const qmiss = trace(qmissC, { hit: false }); validateSlice1Record(qmiss, qmissC);
    const dian = cases.find(x => x.id === 'school-slice1-duan-perform-hit');
    const dhit = trace(dian); validateSlice1Record(dhit, dian);
    assert.equal(dhit.immediate[1].temp.no_perform, 1);
    const dmissC = cases.find(x => x.id === 'school-slice1-duan-perform-miss');
    const dmiss = trace(dmissC, { hit: false }); validateSlice1Record(dmiss, dmissC);
    assert.equal(dmiss.immediate[1].temp.no_perform ?? 0, 0);
    const bad = structuredClone(dhit); bad.directs = [];
    assert.throws(() => validateSlice1Record(bad, dian));
});

test('拒绝/接口/普通攻击契约与错误样本豁免', () => {
    const refusal = cases.find(x => x.id === 'school-slice1-gaibang-perform-gate-level-59');
    const r = trace(refusal); validateSlice1Record(r, refusal);
    const learn = cases.find(x => x.id === 'school-slice1-duan-interface-learn-con-33');
    validateSlice1Record(trace(learn), learn);
    const learnOk = cases.find(x => x.id === 'school-slice1-duan-interface-learn-con-34');
    validateSlice1Record(trace(learnOk), learnOk);
    const ordinary = cases.find(x => x.id === 'school-slice1-kunlun-ordinary-baseline-l200');
    validateSlice1Record(trace(ordinary), ordinary);
    const err = trace(refusal); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateSlice1Record(err, refusal), null);
    const dup = trace(ordinary); dup.index = ordinary.samples;
    assert.throws(() => validateSlice1Record(dup, ordinary));
});

test('effects 汇总分母独立：错误不入效果、命中率有界', () => {
    const c = cases.find(x => x.id === 'school-slice1-gaibang-perform-hit');
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: trace(c) },
    ];
    rows[1].raw.outcome = 'error'; rows[1].raw.reason = 'driver interruption';
    const e = slice1Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});
