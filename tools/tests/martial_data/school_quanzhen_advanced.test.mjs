import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { quanzhenAdvancedEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'quanzhen-advanced');
const by = (ability, suffix = '', level = 400) => cases.find(c => c.parameters.ability === ability && c.id.endsWith(`-l${level}${suffix}`));

test('全真进阶88条件3214样本，既有437条件保持独立', () => {
    assert.equal(cases.length, 88); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3214);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 49);
    assert.equal(schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen'].includes(c.parameters.school) && !['quanzhen-defense', 'quanzhen-practice', 'quanzhen-cultivation', 'quanzhen-auxiliary', 'quanzhen-study', 'quanzhen-recovery', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group)).length, 525);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    assert.ok(cases.every(c => entries.has(c.entry_id)));
    const smoke = schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'quanzhen-advanced');
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 174);
});

test('200级原门槛拒绝；一阳依赖显式赋值；低级内功不非法激发拳脚', () => {
    for (const move of ['fen', 'dang', 'jian']) assert.equal(by(move, '', 200).parameters.expected, 'refused');
    assert.equal(by('jian').parameters.actor.skills['yiyang-zhi'], 400);
    assert.equal(by('jian', '-unmapped-finger').parameters.actor.mappings.finger, undefined);
    for (const ability of ['powerup', 'shield']) {
        const c = by(ability, '-expiry', 60);
        assert.equal(c.parameters.actor.mappings.unarmed, undefined);
        assert.equal(c.parameters.observe_seconds, 62); assert.equal(c.samples, 2);
    }
    assert.equal(by('kong').parameters.actor.mappings.force, 'xuanmen-neigong');
});

function raw(c) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        qi: 10000, eff_qi: 10000, max_qi: 10000, max_neili: 6000, neili: 6000, ghost: 0,
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations ?? {}), weapon: config.equipment?.type ?? 'none',
        temp: { apply: { armor: 100 } }, effective_skills: { force: 600 },
    }));
    return { outcome: c.parameters.expected, before, immediate: structuredClone(before), after: structuredClone(before),
        launches: [{ skill: c.parameters.skill }], metrics: [{}, {}], attacks: [], callbacks: [], terminals: [], dropped: [], background_stopped: [] };
}

test('五连击包含hit_ob额外消耗，临时attack必须撤回', () => {
    for (const ability of ['hun', 'jian']) {
        const c = by(ability), r = raw(c);
        r.metrics[0].neili_cost = (ability === 'hun' ? 280 : 600) + 90;
        r.attacks = Array.from({ length: 5 }, () => ({ actor: 0, target: 1, type: 0 }));
        r.immediate[0].busy = 3;
        validateSchoolCombatRecord(r, c);
        r.immediate[0].temp.apply.attack = 100;
        assert.throws(() => validateSchoolCombatRecord(r, c));
        r.immediate[0].temp.apply.attack = 0; r.attacks.pop();
        assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('瞬杀严格超过两倍，实际ghost及原死亡惩罚不能伪造为直伤', () => {
    const c = by('fen', '-max12001'), r = raw(c);
    r.immediate[1].ghost = 1; r.immediate[1].max_neili -= 20; r.immediate[0].busy = 2;
    r.terminals = [{ side: 1, state: 'death' }];
    validateSchoolCombatRecord(r, c);
    const e = quanzhenAdvancedEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(e.terminal.deaths[1].successes, 1);
    assert.equal(e.surviving_target_qi_cost.mean, null);
    r.metrics[0].direct = 1;
    assert.throws(() => validateSchoolCombatRecord(r, c));
    r.metrics[0].direct = 0; r.before[0].max_neili = 12000; r.immediate[0].max_neili = 12000;
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('神威浩荡碎兵额外扣150，不与落空或死亡混算', () => {
    const c = by('dang'), r = raw(c);
    r.metrics[0] = { direct: 1, neili_cost: 550 }; r.immediate[0].busy = 3;
    r.immediate[1].weapon = 'none'; r.dropped = [{ type: 'sword' }];
    validateSchoolCombatRecord(r, c);
    r.metrics[0].neili_cost = 400;
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('五气朝元的大伤、小伤、低内力、recover分支分别校验', () => {
    for (const [suffix, cost, eff, qi, busy] of [
        ['', 1100, 1000, 1500, 3], ['-small-wound', 200, 100, 150, 3],
        ['-low-reserve', 250, 150, 225, 3], ['-recover', 166, 0, 1000, 1],
    ]) {
        const c = by('hup', suffix), r = raw(c);
        r.metrics[0] = { neili_cost: cost, qi_recovery: qi, eff_qi_recovery: eff };
        r.immediate[0].eff_qi += eff; r.immediate[0].qi += qi; r.immediate[0].busy = busy;
        validateSchoolCombatRecord(r, c);
        const e = quanzhenAdvancedEffects([{ outcome: 'observed', raw: r }]);
        assert.equal(e.healing.qi.mean, qi); assert.equal(e.healing.eff_qi.mean, eff);
        r.immediate[0].qi++;
        assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('增益与护盾各由原回调清除，不只校验终态flag', () => {
    for (const ability of ['powerup', 'shield']) {
        const c = by(ability, '-expiry', 60), r = raw(c);
        const fields = ability === 'shield' ? ['armor'] : ['attack', 'dodge', 'parry'];
        r.metrics[0].neili_cost = 100; r.immediate[0].neili -= 100; r.immediate[0].busy = 2;
        r.immediate[0].temp[ability] = 1;
        for (const f of fields) r.immediate[0].temp.apply[f] = (r.before[0].temp.apply[f] ?? 0) + (ability === 'shield' ? 30 : 24);
        r.after[0].neili = r.immediate[0].neili;
        r.callbacks = [{ side: 0, phase: 'before', elapsed: 60.1, state: structuredClone(r.immediate[0]) },
            { side: 0, phase: 'after', elapsed: 60.11, state: structuredClone(r.after[0]) }]; r.elapsed = 62;
        validateSchoolCombatRecord(r, c);
        r.callbacks[1].state.temp.apply[fields[0]]++;
        assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('原资格拒绝无发动、攻击或内力支出，不纳入效果均值', () => {
    const c = by('jian', '', 200), r = raw(c);
    r.reason = '先天功不足'; r.launches = [];
    validateSchoolCombatRecord(r, c);
    assert.equal(quanzhenAdvancedEffects([{ outcome: 'refused' }]).healing.qi.mean, null);
    r.metrics[0].neili_cost = 1;
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('测试隔离措施必须留证，不能声称停止了武学或战斗对象', () => {
    const c = by('jian', '', 200), r = raw(c);
    r.reason = '先天功不足'; r.launches = [];
    r.background_stopped = ['/adm/daemons/quest/capture'];
    validateSchoolCombatRecord(r, c);
    delete r.background_stopped;
    assert.throws(() => validateSchoolCombatRecord(r, c));
    r.background_stopped = ['/kungfu/skill/xiantian-gong/exert/shield'];
    assert.throws(() => validateSchoolCombatRecord(r, c));
});
