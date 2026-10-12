import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { quanzhenSwordEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'quanzhen-sword');
const by = (move, suffix = '') => cases.find(c => c.parameters.ability === move
    && c.id.endsWith('-l200' + suffix));

test('全真三剑六绝招独立63条件，旧华山292条件保持原样', () => {
    assert.equal(cases.length, 63);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3556);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 28);
    assert.equal(new Set(cases.map(c => c.id)).size, 63);
    assert.equal(schoolCombatConditions(catalog).filter(c => c.parameters.school === 'huashan').length, 292);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    assert.ok(cases.every(c => entries.has(c.entry_id)));
    assert.ok(cases.every(c => c.parameters.actor.properties['family/family_name'] === '全真教'));
    for (const c of cases.filter(c => c.parameters.skill === 'tonggui-jian')) {
        assert.equal(c.parameters.actor.mappings.sword, 'tonggui-jian');
        assert.equal(c.parameters.actor.mappings.parry, 'quanzhen-jian');
    }
});

test('定阳针只改变已学先天；掌法对照与化三清内功门槛明示', () => {
    const base = by('ding'), learned = by('ding', '-learned-xiantian');
    const actor = structuredClone(learned.parameters.actor); delete actor.skills['xiantian-gong'];
    assert.deepEqual(actor, base.parameters.actor);
    assert.equal(by('hua').parameters.actor.mappings.force, 'xiantian-gong');
    assert.equal(by('hua', '-wrong-force').parameters.actor.skills['xiantian-gong'], 200);
    assert.equal(by('hua', '-wrong-force').parameters.expected, 'refused');
    assert.ok(!Object.hasOwn(by('lian', '-unmapped-palm').parameters.actor.mappings, 'strike'));
    assert.equal(by('lian', '-chongyang').parameters.actor.preparations.strike, 'chongyang-shenzhang');
});

function raw(c, direct = 0) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        weapon: config.equipment?.type ?? 'none', temp: {}, max_neili: config.properties.max_neili ?? 6000,
    }));
    return { outcome: c.parameters.expected, before, immediate: structuredClone(before),
        launches: [{ skill: c.parameters.skill }], metrics: [{ direct }, {}], attacks: [], terminals: [] };
}

test('拒绝不冒充零伤害成功；没有扣费和发动才接受拒绝', () => {
    const c = by('hua', '-wrong-force'), r = raw(c);
    r.launches = []; r.reason = '内功未激发';
    validateSchoolCombatRecord(r, c);
    r.metrics[0].neili_cost = 1;
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('群星与定阳按真实直伤分支核验费用，不由气血推定命中', () => {
    for (const [move, costs, busy] of [['xing', [20, 30], [3, 2]], ['ding', [30, 80], [2, 2]]]) {
        for (const direct of [0, 1]) {
            const c = by(move), r = raw(c, direct);
            r.metrics[0].neili_cost = costs[direct]; r.immediate[0].busy = busy[direct];
            validateSchoolCombatRecord(r, c);
            r.metrics[0].neili_cost++;
            assert.throws(() => validateSchoolCombatRecord(r, c));
        }
    }
});

test('三连环检查原两击、重新持剑；化三清临时攻击加成须撤回', () => {
    const c = by('lian'), r = raw(c, 1);
    r.metrics[0].neili_cost = 210; r.immediate[0].busy = 3;
    r.attacks = [{ actor: 0, target: 1, type: 1 }, { actor: 0, target: 1, type: 1 }];
    validateSchoolCombatRecord(r, c);
    r.immediate[0].weapon = 'none';
    assert.throws(() => validateSchoolCombatRecord(r, c));
    const h = by('hua'), hr = raw(h, 1);
    hr.metrics[0].neili_cost = 200; hr.immediate[0].busy = 3;
    validateSchoolCombatRecord(hr, h);
    hr.immediate[0].temp.apply = { attack: 100 };
    assert.throws(() => validateSchoolCombatRecord(hr, h));
});

test('同归式即使失败也损失上限；死亡状态不以虚构伤害补齐', () => {
    const c = by('fen'), r = raw(c);
    r.immediate[0].max_neili -= 50; r.immediate[0].busy = 8;
    validateSchoolCombatRecord(r, c);
    r.immediate[0].max_neili++;
    assert.throws(() => validateSchoolCombatRecord(r, c));
    r.immediate[0].max_neili -= 20; r.metrics[0].neili_cost = 6000;
    r.terminals = [{ side: 0, state: 'death' }, { side: 1, state: 'death' }];
    r.immediate[0].busy = 0; r.immediate[0].ghost = 1; r.immediate[1].ghost = 1;
    r.immediate[0].max_neili -= 20;
    validateSchoolCombatRecord(r, c);
});

test('同归统计保留总上限损失、真实死亡与die调用区别，不排除原攻击类型', () => {
    const r = raw(by('fen'));
    r.immediate[0].max_neili -= 112; r.immediate[1].max_neili -= 20;
    r.immediate[0].ghost = 1; r.immediate[1].ghost = 1;
    r.terminals = [{ side: 0, state: 'death' }, { side: 1, state: 'death' }];
    r.attacks = [{ actor: 0, target: 1, type: 1 }, { actor: 0, target: 1, type: 2 }, { actor: 1, target: 0, type: 1 }];
    const result = quanzhenSwordEffects([{ outcome: 'observed', raw: r }, { outcome: 'refused' }]);
    assert.deepEqual(result.max_neili_loss.map(d => d.mean), [112, 20]);
    assert.equal(result.mutual_deaths.successes, 1); assert.equal(result.mutual_deaths.trials, 1);
    assert.equal(result.actor_attack_calls.mean, 2);
    r.immediate[0].ghost = 0;
    const escaped = quanzhenSwordEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(escaped.death_calls[0], 1); assert.equal(escaped.deaths[0].successes, 0);
});
