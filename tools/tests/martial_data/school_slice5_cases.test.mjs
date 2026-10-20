import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice5SourcePaths, slice5Conditions, validateSlice5Record, slice5Effects,
    slice5SupportSet } from './school_slice5_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = slice5Conditions(catalog, read), smoke = slice5Conditions(catalog, read, { smoke: true });

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
        const fee = hit ? (school === 'henshan' ? 50 : school === 'songshan' ? 100
            : school === 'lingxiao' ? 50 : 200)
            : (school === 'henshan' ? 30 : school === 'songshan' ? 30
                : school === 'lingxiao' ? 30 : 50);
        // songshan hit busy 2+random(2)=[2,3], miss 2+random(3)=[2,4].
        const busyAfter = school === 'songshan' ? busy
            : school === 'henshan' ? 2
                : school === 'lingxiao' ? (hit ? 2 : 3)
                    : (hit ? 1 : 3);
        b.neili -= fee; b.busy = busyAfter;
        if (hit) {
            const percent = school === 'henshan' ? 10 : school === 'songshan' ? 35
                : school === 'lingxiao' ? 20 : 66;
            const dtype = 'UNARMED';
            raw.directs = [{ actor: 0, target: 1, damage: input }];
            raw.dodge_checks = [{ result: 0 }];
            raw.metrics[0] = { direct: 1 };
            const support = slice5SupportSet(input, percent, before[0], before[1],
                school === 'henshan' ? 'WEAPON' : dtype);
            const out = support[0];
            v.qi = out.qi; v.eff_qi = out.eff_qi;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('48 条件有限矩阵：每派 12 条件、正式 896、烟雾 80，ID 唯一', () => {
    assert.equal(cases.length, 48);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 896);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 80);
    assert.equal(new Set(cases.map(c => c.id)).size, 48);
    for (const dir of ['henshan', 'songshan', 'lingxiao', 'tianlongsi']) {
        assert.ok(cases.some(c => c.parameters.collection_group === 'slice5-' + dir), dir);
    }
    for (const c of cases) {
        assert.equal(c.stage, 'school');
        assert.equal(c.parameters.not_applicable, '');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.ok(slice5SourcePaths.includes(c.parameters.base_source.path));
    }
});

test('tianlongsi grant=null：无 can_perform 授权属性', () => {
    const tian = cases.find(x => x.id === 'school-slice5-tianlongsi-perform-baseline-l250');
    assert.equal(tian.parameters.actor.properties['can_perform/sun-finger/qiankun'], undefined);
    for (const dir of ['henshan', 'songshan', 'lingxiao']) {
        const c = cases.find(x => x.id === `school-slice5-${dir}-perform-baseline-l250`);
        assert.ok(Object.keys(c.parameters.actor.properties).some(k => k.startsWith('can_perform/')),
            dir + ' should have grant');
    }
});

test('henshan 契约：WEAPON 10% 直伤、费用 50/30、忙乱 2/2', () => {
    const hitC = cases.find(x => x.id === 'school-slice5-henshan-perform-hit');
    const hit = trace(hitC, { input: 260 });
    validateSlice5Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 50);
    assert.equal(hit.immediate[0].busy, 2);
    assert.equal(hit.directs.length, 1);
    const missC = cases.find(x => x.id === 'school-slice5-henshan-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice5Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 30);
    assert.equal(miss.immediate[0].busy, 2);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateSlice5Record(bad, hitC));
});

test('songshan 契约：UNARMED 35% 直伤、费用 100/30、忙乱 [2,3]/[2,4]', () => {
    const hitC = cases.find(x => x.id === 'school-slice5-songshan-perform-hit');
    for (const busy of [2, 3]) {
        const hit = trace(hitC, { input: 300, busy });
        validateSlice5Record(hit, hitC);
        assert.equal(hit.immediate[0].neili, 6000 - 100);
        assert.equal(hit.immediate[0].busy, busy);
    }
    const missC = cases.find(x => x.id === 'school-slice5-songshan-perform-miss');
    for (const busy of [2, 3, 4]) {
        const miss = trace(missC, { hit: false, busy });
        validateSlice5Record(miss, missC);
        assert.equal(miss.immediate[0].neili, 6000 - 30);
        assert.equal(miss.immediate[0].busy, busy);
    }
    const bad = trace(hitC, { input: 300, busy: 4 });
    assert.throws(() => validateSlice5Record(bad, hitC));
});

test('lingxiao 契约：UNARMED 20% 直伤、非标准命中、费用 50/30、忙乱 2/3', () => {
    const hitC = cases.find(x => x.id === 'school-slice5-lingxiao-perform-hit');
    const hit = trace(hitC, { input: 200 });
    validateSlice5Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 50);
    assert.equal(hit.immediate[0].busy, 2);
    assert.equal(hit.directs.length, 1);
    const missC = cases.find(x => x.id === 'school-slice5-lingxiao-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice5Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 30);
    assert.equal(miss.immediate[0].busy, 3);
});

test('tianlongsi 契约：UNARMED 66% 直伤、费用 200/50、忙乱 1/3', () => {
    const hitC = cases.find(x => x.id === 'school-slice5-tianlongsi-perform-hit');
    const hit = trace(hitC, { input: 300 });
    validateSlice5Record(hit, hitC);
    assert.equal(hit.immediate[0].neili, 6000 - 200);
    assert.equal(hit.immediate[0].busy, 1);
    assert.equal(hit.directs.length, 1);
    const missC = cases.find(x => x.id === 'school-slice5-tianlongsi-perform-miss');
    const miss = trace(missC, { hit: false });
    validateSlice5Record(miss, missC);
    assert.equal(miss.immediate[0].neili, 6000 - 50);
    assert.equal(miss.immediate[0].busy, 3);
});

test('tianlongsi 性别门：fixture 须男性，缺失必须拒绝', () => {
    const c = cases.find(x => x.id === 'school-slice5-tianlongsi-perform-baseline-l250');
    assert.equal(c.parameters.actor.properties.gender, '男性');
    const r = trace(c, { input: 100 });
    validateSlice5Record(r, c);
    const bad = structuredClone(r);
    bad.before[0].gender = '女性'; bad.immediate[0].gender = '女性';
    bad.after = structuredClone(bad.immediate);
    assert.throws(() => validateSlice5Record(bad, c));
});

test('tianlongsi learn str 门：33/34 边界', () => {
    const low = cases.find(x => x.id === 'school-slice5-tianlongsi-interface-learn-str-33');
    const high = cases.find(x => x.id === 'school-slice5-tianlongsi-interface-learn-str-34');
    assert.equal(low.parameters.refusal, '你的先天膂力孱弱，无法领会一阳指。\n');
    assert.equal(low.parameters.actor.properties.str, 33);
    assert.equal(high.parameters.actor.properties.str, 34);
    const r = trace(low); validateSlice5Record(r, low);
    const ok = trace(high); validateSlice5Record(ok, high);
});

test('拒绝/接口/普通攻击契约与错误样本豁免', () => {
    const refusal = cases.find(x => x.id === 'school-slice5-henshan-perform-gate-level-59');
    const r = trace(refusal); validateSlice5Record(r, refusal);
    const learn = cases.find(x => x.id === 'school-slice5-lingxiao-interface-learn-effective-force-29');
    validateSlice5Record(trace(learn), learn);
    const learnOk = cases.find(x => x.id === 'school-slice5-lingxiao-interface-learn-effective-force-30');
    validateSlice5Record(trace(learnOk), learnOk);
    const ordinary = cases.find(x => x.id === 'school-slice5-songshan-ordinary-baseline-l250');
    validateSlice5Record(trace(ordinary), ordinary);
    const err = trace(refusal); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateSlice5Record(err, refusal), null);
    const dup = trace(ordinary); dup.index = ordinary.samples;
    assert.throws(() => validateSlice5Record(dup, ordinary));
});

test('effects 汇总分母独立：错误不入效果、命中率有界', () => {
    const c = cases.find(x => x.id === 'school-slice5-henshan-perform-hit');
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c, { input: 260 }) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: trace(c) },
    ];
    rows[1].raw.outcome = 'error'; rows[1].raw.reason = 'driver interruption';
    const e = slice5Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});
