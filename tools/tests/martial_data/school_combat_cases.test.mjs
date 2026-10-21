import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseArgs, root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = schoolCombatConditions(catalog).filter(c => c.parameters.school === 'huashan'
    && !['huashan-combination', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform'].includes(c.parameters.collection_group));
const original = cases.filter(c => !c.parameters.skill);

test('门派采集独立入口和明确覆盖范围，不改变旧兵器/教学条件', () => {
    assert.equal(parseArgs(['school-combat', '--smoke']).smoke, true);
    assert.equal(parseArgs(['school-combat', '--samples', '10']).samples, 10);
    assert.throws(() => parseArgs(['school-combat', '--level', '100']), /无效/);
    assert.equal(cases.length, 292);
    assert.equal(new Set(cases.map(c => c.id)).size, 292);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 18028);
    const previous = cases.filter(c => !c.parameters.collection_group);
    assert.equal(previous.length, 111);
    assert.equal(previous.reduce((n, c) => n + c.samples, 0), 9336);
    assert.equal(original.length, 47);
    assert.equal(original.reduce((n, c) => n + c.samples, 0), 4014);
    assert.ok(cases.every(c => c.stage === 'school' && c.parameters.school === 'huashan'));
    assert.ok(schoolCombatConditions(catalog, { smoke: true })
        .filter(c => c.parameters.school === 'huashan')
        .every(c => c.samples === (c.id.endsWith('-expiry') ? 1 : 2)));
    const entryIds = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    assert.ok(cases.every(c => entryIds.has(c.entry_id)));
});

test('华山三种组合显式区分内功和招架，不复制岳不群的辟邪与专属加成', () => {
    for (const c of original) {
        const { actor, combination, level } = c.parameters;
        assert.equal(actor.mappings.sword, 'huashan-jian');
        assert.equal(actor.mappings.dodge, 'huashan-shenfa');
        assert.ok(!Object.keys(actor.skills).some(k => k.includes('pixie')));
        assert.ok(!Object.keys(actor.properties).some(k => k.startsWith('apply/')));
        assert.ok(c.parameters.qualification_note.includes('不证明'));
        if (combination === 'jianzong') {
            assert.equal(actor.skills.force / 2 + actor.skills['huashan-xinfa'], 200);
            assert.equal(actor.properties.max_neili, 2000);
        }
        if (combination === 'jianqi') {
            const control = cases.find(x => x.id === `school-huashan-qizong-${c.parameters.ability}-l${level}`);
            const normalized = structuredClone(actor);
            delete normalized.skills['kuangfeng-jian'];
            normalized.mappings.parry = 'huashan-jian';
            assert.deepEqual(normalized, control.parameters.actor);
        }
    }
});

test('即时条件不伪造回调结束；持续条件单列原计时，不把输出状态当施展效果', () => {
    assert.ok(cases.filter(c => !c.id.endsWith('-expiry')).every(c => c.parameters.observe_seconds === 0
        && c.parameters.observation === 'single_action_immediate'));
    const timed = original.filter(c => c.id.endsWith('-expiry'));
    assert.equal(timed.length, 2);
    assert.ok(timed.every(c => c.parameters.level === 150 && c.parameters.observe_seconds === 152
        && c.parameters.observation === 'timed_effect' && c.samples === 2));
    const low = cases.find(c => c.id.endsWith('-qi4000'));
    assert.equal(low.parameters.expected, 'observed');
    assert.equal(low.parameters.effect_expected, 'no_buff');
    assert.equal(original.filter(c => c.parameters.expected === 'refused').length, 3);
    assert.ok(original.filter(c => c.samples === 2).every(c => c.parameters.ability === 'powerup' || c.parameters.ability === 'ziqi'));
});

test('增益到期须有完整原回调、恢复原属性且不重复扣费', () => {
    for (const condition of original.filter(c => c.id.endsWith('-expiry'))) {
        const raw = buffRow(condition), flag = condition.parameters.ability;
        const fields = flag === 'powerup' ? ['attack', 'defense'] : ['damage', 'sword'];
        raw.before[0].neili = 6000;
        raw.immediate[0] = structuredClone(raw.before[0]);
        raw.immediate[0].temp[flag] = 1;
        raw.immediate[0].busy = 3;
        raw.metrics[0].neili_cost = flag === 'powerup' ? 100 : 200;
        raw.immediate[0].neili -= raw.metrics[0].neili_cost;
        for (const field of fields) raw.immediate[0].temp.apply[field] =
            (raw.before[0].temp.apply[field] ?? 0) + (flag === 'powerup' ? 50 : 15);
        raw.after = structuredClone(raw.immediate);
        delete raw.after[0].temp[flag];
        for (const field of fields) raw.after[0].temp.apply[field] = raw.before[0].temp.apply[field] ?? 0;
        raw.elapsed = 152.01;
        raw.callbacks = [
            { side: 0, phase: 'before', elapsed: 150.01, state: structuredClone(raw.immediate[0]) },
            { side: 0, phase: 'after', elapsed: 150.02, state: structuredClone(raw.after[0]) },
        ];
        validateSchoolCombatRecord(raw, condition);
        for (const mutate of [
            r => { r.callbacks = []; },
            r => { r.callbacks[0].elapsed = 10; },
            r => { r.callbacks[1].state.temp[flag] = 1; },
            r => { r.after[0].temp.apply[fields[0]]++; },
            r => { r.after[0].neili++; },
            r => { r.elapsed = 151; },
        ]) {
            const wrong = structuredClone(raw);
            mutate(wrong);
            assert.throws(() => validateSchoolCombatRecord(wrong, condition));
        }
    }
});

test('新增华山七门武学独立映射准备、原门槛及低内功组合', () => {
    const added = cases.filter(c => c.parameters.skill && !c.parameters.collection_group);
    assert.equal(added.length, 64);
    assert.equal(new Set(added.map(c => c.parameters.skill)).size, 7);
    assert.equal(added.filter(c => c.parameters.expected === 'refused').length, 10);
    for (const c of added) {
        const p = c.parameters;
        assert.equal(p.actor.mappings[p.usage], p.skill);
        assert.equal(p.actor.mappings.parry, p.skill);
        if (p.actor.equipment) assert.deepEqual(p.actor.preparations, {});
        else assert.deepEqual(p.actor.preparations, { [p.usage]: p.skill });
        if (p.skill === 'kuangfeng-jian') {
            assert.equal(p.actor.skills.force / 2 + p.actor.skills['huashan-xinfa'], 200);
            assert.equal(p.actor.properties.max_neili, 2000);
        }
        if (c.method === 'perform') {
            const text = readFileSync(new URL('../../../' + p.qualification_sources[1], import.meta.url), 'utf8');
            assert.ok(text.includes('can_perform/' + p.skill + '/' + p.ability));
        }
    }
    const palms = added.filter(c => c.id.includes('piao-l200') && c.parameters.expected === 'observed');
    assert.equal(palms.length, 3);
    for (const c of palms) {
        const actor = structuredClone(c.parameters.actor);
        delete actor.skills.cuff;
        const base = structuredClone(palms[0].parameters.actor);
        delete base.skills.cuff;
        assert.deepEqual(actor, base);
    }
});

test('新增直接伤害的命中与扣费绑定，三神峰不虚构内力消耗', () => {
    for (const [ability, miss, hit] of [['yong', 120, 230], ['ning', 120, 220], ['song', 50, 60], ['po', 120, 220], ['wuji', 120, 220]]) {
        const c = cases.find(c => c.parameters.skill && c.parameters.ability === ability);
        for (const direct of [0, 1]) {
            const raw = additionalRow(c);
            raw.metrics[0] = { direct, neili_cost: direct ? hit : miss };
            raw.immediate[0].busy = direct ? (ability === 'ning' || ability === 'wuji' ? 1 : 2)
                : ['song', 'po', 'wuji'].includes(ability) ? 3 : 2;
            validateSchoolCombatRecord(raw, c);
            raw.metrics[0].neili_cost++;
            assert.throws(() => validateSchoolCombatRecord(raw, c));
        }
    }
    const c = cases.find(c => c.parameters.ability === 'san'), raw = additionalRow(c);
    raw.metrics[0] = { direct: 3, neili_cost: 0 };
    raw.immediate[0].busy = 3;
    validateSchoolCombatRecord(raw, c);
    raw.metrics[0].neili_cost = 320;
    assert.throws(() => validateSchoolCombatRecord(raw, c));
});

test('雷动九天的原回调须撤回筋力与身法，不重复扣费', () => {
    const c = cases.find(c => c.parameters.ability === 'lei' && c.id.endsWith('-expiry'));
    const raw = additionalRow(c);
    raw.immediate[0].temp = { apply: {}, lei: 1, str: 20, dex: 20 };
    raw.immediate[0].busy = 2;
    raw.immediate[0].neili -= 400;
    raw.metrics[0].neili_cost = 400;
    raw.after = structuredClone(raw.immediate);
    raw.after[0].temp = { apply: {} };
    raw.elapsed = 42.1;
    raw.callbacks = [{ side: 0, phase: 'before', elapsed: 40.1, state: structuredClone(raw.immediate[0]) },
        { side: 0, phase: 'after', elapsed: 40.2, state: structuredClone(raw.after[0]) }];
    validateSchoolCombatRecord(raw, c);
    for (const mutate of [r => { r.callbacks = []; }, r => { r.after[0].temp.str = 20; },
        r => { r.callbacks[1].state.neili += 400; }, r => { r.callbacks[0].elapsed = 1; }]) {
        const wrong = structuredClone(raw); mutate(wrong);
        assert.throws(() => validateSchoolCombatRecord(wrong, c));
    }
});

function additionalRow(c) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        temp: { apply: {} }, weapon: config.equipment?.type ?? 'none',
    }));
    return { outcome: 'observed', before, immediate: structuredClone(before),
        launches: [{ skill: c.parameters.skill }], metrics: [{}, {}] };
}

function buffRow(condition) {
    const before = [condition.parameters.actor, condition.parameters.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        temp: { apply: { damage: 50 } },
    }));
    const immediate = structuredClone(before);
    const active = condition.parameters.effect_expected !== 'no_buff';
    immediate[0].busy = 3;
    if (active) {
        immediate[0].temp.ziqi = 1;
        immediate[0].temp.apply.damage += 20;
        immediate[0].temp.apply.sword = 20;
    }
    return { outcome: 'observed', before, immediate, launches: [{ skill: 'zixia-shengong' }],
        metrics: [{ neili_cost: active ? 200 : 0 }, {}] };
}

test('紫气东来四成边界：成功返回而无增益单独识别，资源与增量不许伪造', () => {
    const low = cases.find(c => c.id.endsWith('-qi4000'));
    const high = cases.find(c => c.id.endsWith('-qi4001'));
    validateSchoolCombatRecord(buffRow(low), low);
    validateSchoolCombatRecord(buffRow(high), high);
    const wrong = buffRow(low);
    wrong.immediate[0].temp.ziqi = 1;
    assert.throws(() => validateSchoolCombatRecord(wrong, low));
    const wrongCost = buffRow(high);
    wrongCost.metrics[0].neili_cost = 0;
    assert.throws(() => validateSchoolCombatRecord(wrongCost, high));
    const wrongMapping = buffRow(high);
    wrongMapping.before[0].mappings.force = 'pixie-jian';
    assert.throws(() => validateSchoolCombatRecord(wrongMapping, high));
});
