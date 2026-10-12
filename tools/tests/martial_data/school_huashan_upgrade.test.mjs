import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { learnedGain } from './school_huashan_learning_cases.mjs';
import { cognitionReward, rewardBranches } from './school_huashan_upgrade_cases.mjs';
import { schoolUpgradeEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const all = schoolCombatConditions(catalog).filter(c => c.parameters.school === 'huashan');
const cases = all.filter(c => c.parameters.collection_group === 'huashan-upgrade');
const find = suffix => cases.find(c => c.id.endsWith(suffix));

test('升级31条件1434样本，原261条件16594样本保持独立', () => {
    assert.equal(cases.length, 31);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1434);
    const prior = all.filter(c => c.parameters.collection_group !== 'huashan-upgrade');
    assert.equal(prior.length, 261);
    assert.equal(prior.reduce((n, c) => n + c.samples, 0), 16594);
    assert.ok(cases.every(c => c.parameters.actor.properties.int === 39));
    assert.equal(cases.filter(c => c.parameters.action === 'perform sword.jue').length, 3);
});

function row(c, increments = [1, 1]) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings), learned: {},
        nothing: config.properties['can_learn/dugu-jiujian/nothing'] ?? 0,
        dugu_grants: { qi: config.properties['can_perform/dugu/qi'] ?? 0, po: config.properties['can_perform/dugu/po'] ?? 0 },
        conditions: {}, busy: 0, temp: {} }));
    const raw = { outcome: 'observed', before, immediate: structuredClone(before), upgrades: [], launches: [] };
    let previous = before[0];
    for (let i = 0; i < p.cycles; i++) {
        const primed = structuredClone(previous), level = previous.skills['dugu-jiujian'];
        primed.learned['dugu-jiujian'] = (previous.learned['dugu-jiujian'] ?? 0)
            + learnedGain(10000000, level, previous.skills['martial-cognize']);
        const after = structuredClone(primed), step = { before: previous, primed, after, action: p.action };
        if (p.action === 'weak') after.learned['dugu-jiujian']++;
        else {
            after.skills['dugu-jiujian']++; after.learned['dugu-jiujian'] = 0;
            for (const g of ['qi', 'po']) if (!previous.nothing && after.skills['dugu-jiujian'] > (g === 'qi' ? 120 : 150)
                && after.dugu_grants[g] <= 100) after.dugu_grants[g] += increments[i];
            const reward = cognitionReward(previous.skills['martial-cognize'], previous.learned['martial-cognize'] ?? 0,
                rewardBranches(step).length * 3);
            after.skills['martial-cognize'] = reward.level; after.learned['martial-cognize'] = reward.progress;
        }
        raw.upgrades.push(step); previous = after;
    }
    raw.immediate[0] = previous;
    return raw;
}

test('120/150门槛依据升级后的原始等级，零随机增量也合法', () => {
    for (const level of [119, 120, 149, 150, 200, 400, 800]) for (const nothing of [false, true]) {
        const c = find(`l${level}-${nothing ? 'nothing' : 'normal'}`);
        for (const delta of [0, 12]) validateSchoolCombatRecord(row(c, [delta]), c);
        if (!nothing && level >= 120) assert.throws(() => validateSchoolCombatRecord(row(c, [13]), c));
    }
});

test('99至100再至101的两次真实升级状态必须保留重复奖励，不按预想去重', () => {
    for (const grant of ['qi', 'po']) {
        const c = find(`l200-${grant}99`), raw = row(c);
        validateSchoolCombatRecord(raw, c);
        assert.equal(raw.immediate[0].skills['martial-cognize'], 206);
        const effects = schoolUpgradeEffects([{ outcome: 'observed', raw }]);
        assert.equal(effects.rewards, 2); assert.equal(effects.rewards_from_already100, 1);
        assert.equal(effects.repeated_within_sample, 1);
        const lost = structuredClone(raw); lost.upgrades[1].after.skills['martial-cognize'] = 203;
        assert.throws(() => validateSchoolCombatRecord(lost, c));
    }
});

test('weak_mode及无招不触发奖励，101停止领悟；预置阶段不能偷改资格或等级', () => {
    for (const suffix of ['l200-weak', 'l200-weak-nothing', 'l200-qi100-nothing', 'l200-po101']) {
        const c = find(suffix), raw = row(c); validateSchoolCombatRecord(raw, c);
        assert.equal(schoolUpgradeEffects([{ outcome: 'observed', raw }]).rewards, 0);
        const changed = structuredClone(raw); changed.upgrades[0].primed.skills['dugu-jiujian']++;
        assert.throws(() => validateSchoolCombatRecord(changed, c));
        const forged = structuredClone(raw); forged.upgrades[0].primed.dugu_grants.qi++;
        assert.throws(() => validateSchoolCombatRecord(forged, c));
    }
});

test('高等级修养奖励可能只有进度，不能将150万传参视为150万经验或固定升三级', () => {
    assert.deepEqual(cognitionReward(200, 0, 3), { level: 203, progress: 0 });
    assert.deepEqual(cognitionReward(800, 0, 3), { level: 800, progress: 500001 });
});

test('夹具经原improve_skill预置并升级，不调用skill_improved或替换游戏函数', () => {
    const runner = readFileSync(root + '/tools/tests/martial_data/runner.lpc', 'utf8');
    assert.match(runner, /improve_skill\("dugu-jiujian", 10000000, 1\)/);
    assert.match(runner, /improve_skill\("dugu-jiujian", 0, action == "weak"\)/);
    assert.doesNotMatch(runner, /->skill_improved\s*\(/);
});
