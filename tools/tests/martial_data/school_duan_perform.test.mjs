import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { duanPerformConditions, duanManSupport, validateDuanPerformRecord } from './school_duan_perform_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = duanPerformConditions(catalog, read);
const find = suffix => cases.find(c => c.id.endsWith(suffix));
function row(c, hit = true) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((a, i) => ({
        ...structuredClone(a.properties), object: '/tests/actor#' + i,
        cultivation: { 'family/family_name': a.properties['family/family_name'] },
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, ghost: 0,
        living: i === 1 && p.target_state === 'unconscious' ? 0 : 1,
        skills: structuredClone(a.skills), mappings: structuredClone(a.mappings),
        preparations: structuredClone(a.preparations), learned: {}, busy: a.busy ?? null,
        temp: { apply: { armor: 100 } }, effective_str: 90,
        effective_skills: { [p.usage]: Math.trunc((a.skills[p.usage] ?? 0) / 2) + (a.skills[p.skill] ?? 0),
            force: Math.trunc(a.skills.force / 2) + (a.skills['duanshi-xinfa'] ?? 0),
            dodge: Math.trunc(a.skills.dodge / 2) },
        duan_grants: { man: a.properties['can_perform/jinyu-quan/man'] ?? null,
            bian: a.properties['can_perform/wuluo-zhang/bian'] ?? null },
        weapon: a.equipment?.slot === 'secondary_weapon' ? 'none' : a.equipment?.type ?? 'none',
        secondary_weapon: a.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none',
        secondary_weapon_details: a.equipment?.slot === 'secondary_weapon' ? { program: '/tests/sword' } : {},
    }));
    const preparationBefore = structuredClone(before[1]);
    preparationBefore.living = 1;
    if (p.target_state === 'unconscious') { before[1].qi = 0; before[1].jing = 0; }
    const r = { method: 'perform', outcome: p.expected, before,
        immediate: structuredClone(before), launches: [], attacks: [], directs: [], passives: [],
        command_accepted: p.expected === 'observed' ? 1 : 0, reason: p.refusal, metrics: [{}, {}],
        refusals: p.expected === 'refused' ? [{ actor: before[0].object, reason: p.refusal }] : [],
        ...(p.target_state === 'unconscious' ? { preparation: { before: preparationBefore,
            after: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] } } : {}) };
    if (p.expected === 'observed') {
        const [b, t] = before, [a, v] = r.immediate;
        r.launches.push({ actor: b.object, skill: p.skill, argument: p.ability + ' right' });
        a.learned[p.skill] = 1;
        if (p.ability === 'man') {
            if (p.target.skills.dodge >= 100000) hit = false;
            a.busy = hit ? 2 : 3;
            let fee = hit ? 150 : 50;
            if (hit) {
                const input = Math.trunc(b.effective_skills.cuff / 2);
                const supported = duanManSupport(input, b, t)[0];
                r.directs.push({ actor: 0, target: 1, type: 0, damage: input, percent: 45 });
                v.qi = supported.qi; v.eff_qi = supported.eff_qi;
                r.metrics[0].direct = 1;
                if (b.jiali && b.neili - 150 >= b.jiali) fee += b.jiali;
            }
            a.neili -= fee; r.metrics[0].neili_cost = fee;
        } else {
            const bonus = p.target.skills.force >= 100000 ? 0 : Math.trunc(b.skills[p.skill] / 10);
            a.busy = 1; a.neili -= 50;
            for (let i = 0; i < 5; i++) {
                r.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 10,
                    attack_skill: p.skill, attack_usage: p.usage,
                    apply_attack: bonus, apply_unarmed_damage: Math.trunc(bonus / 2) });
                if (b.jiali && a.neili > b.jiali) {
                    a.neili -= b.jiali;
                    r.passives.push({ actor: 0, target: 1, route: 'force', skill: 'duanshi-xinfa', factor: b.jiali });
                }
                r.passives.push({ actor: 0, target: 1, route: 'martial', skill: p.skill,
                    factor: 0, incoming: 10, result: null });
            }
            r.metrics[0].neili_cost = b.neili - a.neili;
            v.qi -= 50; v.eff_qi -= 5;
        }
        r.metrics[1].qi_cost = t.qi - v.qi; r.metrics[1].eff_qi_cost = t.eff_qi - v.eff_qi;
    }
    r.after = structuredClone(r.immediate);
    return r;
}
test('两真实绝招38条件1256正式，烟雾76，接入原消费者', () => {
    assert.equal(cases.length, 38); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1256);
    assert.equal(duanPerformConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 76);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 's1-duan-perform'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    assert.throws(() => duanPerformConditions(catalog, p => read(p) + ' '), /须重新审阅/);
});
test('实际授权、准备、存活与发动身份不能由声明冒充', () => {
    const c = find('jinyu-quan-man-l200-jiali0');
    for (const mutate of [r => { r.launches[0].argument = 'bian right'; },
        r => { r.before[0].duan_grants.man = 0; }, r => { r.before[0].preparations = {}; },
        r => { r.before[1].living = 0; }, r => { r.launches = []; }]) {
        const r = row(c); mutate(r); assert.throws(() => validateDuanPerformRecord(r, c));
    }
    const rejected = find('jinyu-quan-man-no-grant'), r = row(rejected);
    r.immediate[0].neili--; r.after = structuredClone(r.immediate);
    assert.throws(() => validateDuanPerformRecord(r, rejected));
});
test('金玉直伤按原整数支持集与150/50分支费用，直伤加力另扣', () => {
    for (const suffix of ['jinyu-quan-man-l200-jiali0', 'jinyu-quan-man-l400-jiali50']) {
        const c = find(suffix); validateDuanPerformRecord(row(c, false), c);
        const r = row(c); r.directs[0].percent = 100;
        assert.throws(() => validateDuanPerformRecord(r, c));
    }
    const c = find('jinyu-quan-man-l200-jiali50'), r = row(c);
    assert.equal(r.metrics[0].neili_cost, 200);
    r.metrics[0].neili_cost = 150; assert.throws(() => validateDuanPerformRecord(r, c));
    const a = row(c); a.immediate[1].qi--; a.after = structuredClone(a.immediate);
    assert.throws(() => validateDuanPerformRecord(a, c));
});
test('风云增强失败仍五击；费用与真实内功回调对应，增益必须撤回', () => {
    const weak = find('wuluo-zhang-bian-high-dp'), r = row(weak);
    assert.equal(r.attacks.length, 5); assert.ok(r.attacks.every(a => a.apply_attack === 0));
    validateDuanPerformRecord(r, weak);
    const c = find('wuluo-zhang-bian-l400-jiali50');
    for (const mutate of [r => r.attacks.pop(), r => { r.passives.pop(); },
        r => { r.attacks[0].apply_attack++; }, r => { r.immediate[0].temp.apply.attack = 40; r.after = structuredClone(r.immediate); }]) {
        const bad = row(c); mutate(bad); assert.throws(() => validateDuanPerformRecord(bad, c));
    }
});
test('原副手区别保留，昏迷只观察原拒绝，不补心跳或其它费用', () => {
    assert.equal(find('jinyu-quan-man-secondary-only').parameters.expected, 'refused');
    assert.equal(find('wuluo-zhang-bian-secondary-only').parameters.expected, 'observed');
    const c = find('wuluo-zhang-bian-unconscious'), r = row(c);
    r.metrics[0].heartbeats = 1; assert.throws(() => validateDuanPerformRecord(r, c));
});

test('真实runner必须显式初始化直伤记录，缺失记录不得视作零次', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /"taohua-direct",\s*"s1-duan-perform",\s*"s1-piaoxu",\s*"mingjiao-qishang"[\s\S]{0,100}current\["directs"\] = \(\{\}\);/);
    const c = find('jinyu-quan-man-l200-jiali0'), r = row(c);
    delete r.directs;
    assert.throws(() => validateDuanPerformRecord(r, c));
});

test('忙乱须采集原命令早期拒绝，昏迷须保留原前后快照而非伪造初态', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /is_taohua_zhuan\(\) \|\|\s*current\["parameters"\]\["collection_group"\] == "s1-duan-perform"/);
    for (const suffix of ['jinyu-quan-man-actor-busy', 'wuluo-zhang-bian-unconscious']) {
        const c = find(suffix), r = row(c); validateDuanPerformRecord(r, c);
        r.refusals = []; assert.throws(() => validateDuanPerformRecord(r, c));
    }
    const c = find('jinyu-quan-man-unconscious');
    for (const mutate of [r => { delete r.preparation.before; },
        r => { r.preparation.before.qi--; }, r => { r.before[1].qi = 10000; },
        r => { r.preparation.terminals = []; }]) {
        const r = row(c); mutate(r); assert.throws(() => validateDuanPerformRecord(r, c));
    }
});

test('五罗每次普通命中还须有空拳脚回调，直伤金玉不能混入该调用', () => {
    const c = find('wuluo-zhang-bian-l400-jiali0');
    for (const mutate of [r => { r.passives = []; },
        r => { r.passives[0].result = 1; }, r => { r.passives[0].route = 'unknown'; }]) {
        const r = row(c); mutate(r); assert.throws(() => validateDuanPerformRecord(r, c));
    }
    const direct = find('jinyu-quan-man-l400-jiali0'), r = row(direct);
    r.passives.push({ route: 'martial' }); assert.throws(() => validateDuanPerformRecord(r, direct));
});
