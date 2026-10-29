import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { panlongTanConditions, panlongTanSupport, validatePanlongTanRecord } from './school_panlong_tan_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root)), cases = panlongTanConditions(catalog, read);
const find = suffix => cases.find(c => c.id.endsWith(suffix));
function row(c, hit = true) {
    const p = c.parameters, before = [p.actor, p.target].map((cfg, i) => ({
        ...structuredClone(cfg.properties), object: '/tests/actor#' + i,
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations),
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, ghost: 0, living: 1,
        learned: {}, busy: cfg.busy ?? null, temp: { apply: { armor: 100 } }, effective_str: 90,
        effective_skills: { claw: Math.trunc((cfg.skills.claw ?? 0) / 2) + (cfg.skills['panlong-zhao'] ?? 0),
            force: Math.trunc(cfg.skills.force / 2) + (cfg.skills['miaojia-neigong'] ?? 0),
            parry: Math.trunc(cfg.skills.parry / 2) },
        tan_grant: cfg.properties['can_perform/panlong-zhao/tan'] ?? null,
        weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'none' : cfg.equipment?.type ?? 'none',
        secondary_weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none',
        secondary_weapon_details: cfg.equipment?.slot === 'secondary_weapon' ? { program: '/tests/sword' } : {},
    }));
    const prepBefore = structuredClone(before[1]);
    if (p.target_state === 'unconscious') { before[1].living = 0; before[1].qi = 0; before[1].jing = 0; }
    const r = { method: 'perform', outcome: p.expected, before, immediate: structuredClone(before),
        command_accepted: Number(p.expected === 'observed'), reason: p.refusal, metrics: [{}, {}],
        launches: [], attacks: [], directs: [], passives: [], interfaces: [],
        refusals: p.expected === 'refused' ? [{ actor: before[0].object, reason: p.refusal }] : [],
        ...(p.target_state === 'unconscious' ? { preparation: { before: prepBefore,
            after: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] } } : {}) };
    if (p.expected === 'observed') {
        const [b, t] = before, [a, v] = r.immediate;
        if (p.target.skills.parry >= 100000) hit = false;
        r.launches.push({ actor: b.object, skill: p.skill, argument: 'tan right' });
        a.learned['panlong-zhao'] = 1; a.busy = hit ? 1 : 3;
        let fee = hit ? 150 : 50;
        if (hit) {
            const input = 60 + Math.trunc(b.effective_skills.claw / 3);
            r.directs.push({ actor: 0, target: 1, type: 0, percent: 45, damage: input });
            const supported = panlongTanSupport(input, b, t)[0];
            v.qi = supported.qi; v.eff_qi = supported.eff_qi; r.metrics[0].direct = 1;
            if (b.jiali && b.neili - 150 >= b.jiali) fee += b.jiali;
        }
        a.neili -= fee; r.metrics[0].neili_cost = fee;
        r.metrics[1].qi_cost = t.qi - v.qi; r.metrics[1].eff_qi_cost = t.eff_qi - v.eff_qi;
    }
    r.after = structuredClone(r.immediate); return r;
}

test('云中探爪原命令19条件628正式/38烟雾，原书房仅来源不冒充取得', () => {
    assert.equal(cases.length, 19); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 628);
    assert.equal(panlongTanConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 38);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 's1-panlong-tan'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    assert.throws(() => panlongTanConditions(catalog, p => read(p) + ' '), /重新审阅/);
    assert.ok(cases.every(c => c.parameters.action === 'perform claw.tan right'));
});
test('成功直伤支出150另扣加力，失手50；忙乱1/3及原伤害整数范围不可套金玉', () => {
    const c = find('l400-jiali50');
    validatePanlongTanRecord(row(c, false), c);
    assert.equal(row(c).metrics[0].neili_cost, 200);
    for (const mutate of [r => { r.metrics[0].neili_cost = 150; }, r => { r.directs[0].percent = 100; },
        r => { r.directs[0].damage = 1; }, r => { r.immediate[0].busy = 2; r.after = structuredClone(r.immediate); },
        r => { r.immediate[1].qi--; r.after = structuredClone(r.immediate); }]) {
        const r = row(c); mutate(r); assert.throws(() => validatePanlongTanRecord(r, c));
    }
});
test('实际初态/领悟/发动及无普通攻击/被动回调必须核对', () => {
    const c = find('l200-jiali0');
    for (const mutate of [r => { r.before[0].tan_grant = 0; }, r => { r.before[0].preparations = {}; },
        r => { r.launches = []; }, r => { r.launches[0].argument = 'man right'; },
        r => { r.before[0].wizardp = 1; }, r => { r.passives.push({ route: 'force' }); },
        r => { r.metrics[0].heartbeats = 1; }, r => { delete r.directs; }]) {
        const r = row(c); mutate(r); assert.throws(() => validatePanlongTanRecord(r, c));
    }
});
test('副手单持原本允许，学习双手拒绝不能强加给绝招；极端招架仅选择原分支', () => {
    assert.equal(find('main-weapon').parameters.expected, 'refused');
    assert.equal(find('secondary-only').parameters.expected, 'observed');
    const r = row(find('secondary-only')); r.before[0].secondary_weapon_details.program = '/fake/sword';
    assert.throws(() => validatePanlongTanRecord(r, find('secondary-only')));
    assert.equal(row(find('high-dp')).directs.length, 0);
    const impossible = row(find('low-dp'), false);
    assert.throws(() => validatePanlongTanRecord(impossible, find('low-dp')));
});
test('拒绝保持零发动和零费用；原昏迷准备、早期忙乱拒绝不可伪造', () => {
    const c = find('unconscious');
    for (const mutate of [r => { delete r.preparation.before; }, r => { r.preparation.before.qi--; },
        r => { r.preparation.terminals = []; }, r => { r.before[1].qi = 10000; }]) {
        const r = row(c); mutate(r); assert.throws(() => validatePanlongTanRecord(r, c));
    }
    const b = find('actor-busy'), r = row(b); r.refusals = [];
    assert.throws(() => validatePanlongTanRecord(r, b));
    const no = find('no-grant'), bad = row(no); bad.immediate[0].neili--; bad.after = structuredClone(bad.immediate);
    assert.throws(() => validatePanlongTanRecord(bad, no));
});
