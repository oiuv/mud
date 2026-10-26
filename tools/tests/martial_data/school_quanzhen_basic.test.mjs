import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { quanzhenBasicEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'quanzhen-basic');
const by = (move, suffix = '', level = 200) => cases.find(c => c.parameters.ability === move && c.id.endsWith(`-l${level}${suffix}`));

test('全真基础批独立82条件5162样本，旧355条件不变', () => {
    assert.equal(cases.length, 82); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 5162);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 30);
    assert.equal(schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen'].includes(c.parameters.school) && !['quanzhen-advanced', 'quanzhen-defense', 'quanzhen-practice', 'quanzhen-cultivation', 'quanzhen-auxiliary', 'quanzhen-study', 'quanzhen-recovery', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group)).length, 437);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    assert.ok(cases.every(c => entries.has(c.entry_id)));
    const smoke = schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'quanzhen-basic');
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 163);
});

test('双准备基于已有搭配；拒绝条件只降相关资格；到期保留原60秒', () => {
    assert.deepEqual(by('po', '-dual').parameters.actor.preparations, { hand: 'qixing-shou', strike: 'haotian-zhang' });
    assert.deepEqual(by('lian', '-dual').parameters.actor.preparations, { strike: 'chongyang-shenzhang', finger: 'zhongnan-zhi' });
    assert.deepEqual(by('ju', '-unprepared').parameters.actor.preparations, {});
    for (const c of cases.filter(c => c.id.endsWith('-low-force'))) {
        assert.equal(c.parameters.actor.skills.force, 2);
        assert.equal(c.parameters.expected, 'refused');
    }
    const timed = by('powerup', '-expiry', 60);
    assert.equal(timed.parameters.observe_seconds, 62); assert.equal(timed.samples, 2);
});

function raw(c, direct = 0) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations ?? {}), weapon: config.equipment?.type ?? 'none',
        temp: {}, max_neili: config.properties.max_neili ?? 6000,
    }));
    return { outcome: c.parameters.expected, before, immediate: structuredClone(before), after: structuredClone(before),
        launches: [{ skill: c.parameters.skill }], metrics: [{ direct }, {}], attacks: [], callbacks: [] };
}

test('七星三次判定不压成单次；天罡落空不虚构费用', () => {
    for (let direct = 0; direct <= 3; direct++) {
        const c = by('po'), r = raw(c, direct);
        r.metrics[0].neili_cost = 200; r.immediate[0].busy = 2;
        validateSchoolCombatRecord(r, c);
    }
    const c = by('bai'), r = raw(c);
    r.immediate[0].busy = 3;
    validateSchoolCombatRecord(r, c);
    r.metrics[0].neili_cost = 180;
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('重阳四击必须走原普通攻击；准备状态须来自实际快照', () => {
    const c = by('lian', '-dual'), r = raw(c);
    r.attacks = Array.from({ length: 4 }, () => ({ actor: 0, target: 1, type: 0 }));
    r.metrics[0].neili_cost = 80; r.immediate[0].busy = 4;
    validateSchoolCombatRecord(r, c);
    r.before[0].preparations = {};
    assert.throws(() => validateSchoolCombatRecord(r, c));
    r.before[0].preparations = c.parameters.actor.preparations; r.attacks.pop();
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('玄门三项增益经原回调恢复；缺失回调不能通过', () => {
    const c = by('powerup', '-expiry', 60), r = raw(c);
    r.metrics[0].neili_cost = 100; r.immediate[0].neili -= 100;
    r.immediate[0].temp = { powerup: 1, apply: { attack: 15, dodge: 15, parry: 15 } };
    r.immediate[0].busy = 1; r.after[0].neili = r.immediate[0].neili;
    r.callbacks = [{ side: 0, phase: 'before', elapsed: 60, state: structuredClone(r.immediate[0]) },
        { side: 0, phase: 'after', elapsed: 60.01, state: structuredClone(r.after[0]) }];
    r.elapsed = 62;
    validateSchoolCombatRecord(r, c);
    const result = quanzhenBasicEffects([{ outcome: 'observed', raw: r }, { outcome: 'refused' }]);
    assert.deepEqual(Object.values(result.apply_delta).map(d => d.mean), [15, 15, 15]);
    assert.equal(result.final_powerup.successes, 0); assert.equal(result.final_powerup.trials, 1);
    r.callbacks = [];
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('资格拒绝保持零发动零攻击零费用，不计效果样本', () => {
    const c = by('zhi', '-unprepared'), r = raw(c);
    r.launches = []; r.reason = '尚未准备';
    validateSchoolCombatRecord(r, c);
    r.metrics[0].direct = 1;
    assert.throws(() => validateSchoolCombatRecord(r, c));
    assert.equal(quanzhenBasicEffects([{ outcome: 'refused' }]).direct_calls.mean, null);
});
