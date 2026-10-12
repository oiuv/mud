import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinSupportConditions } from './school_shaolin_support_cases.mjs';
import { healingStepExpected } from './school_wudang_healing_cases.mjs';
import { dispelExpected } from './school_wudang_dispel_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = shaolinSupportConditions(catalog);
const group = name => cases.filter(c => c.parameters.collection_group === 'shaolin-' + name);

test('少林辅助追加636条件12248条计划，全部旧条件字节级指纹不变', () => {
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !c.id.startsWith('school-shaolin-support-') && !['shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 7167); assert.equal(old.reduce((n, c) => n + c.samples, 0), 166168);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '731e84993f9183a0c183db1aff46ae0c91b248d936c549d62bd3438131feee40');
    assert.deepEqual(all.filter(c => c.id.startsWith('school-shaolin-support-')), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.equal(cases.length, 636); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 12248);
    for (const [name, count, samples] of [['healing', 152, 304], ['dispel', 416, 10240], ['buffs', 68, 1704]]) {
        assert.equal(group(name).length, count);
        assert.equal(group(name).reduce((n, c) => n + c.samples, 0), samples);
    }
});

test('少林资格与佛学隔离独立登记，旧武当剑法和资格不混入', () => {
    assert.equal(new Set(cases.map(c => c.parameters.skill)).size, 4);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(p.school, 'shaolin'); assert.equal(p.family, '少林派');
        assert.equal(p.actor.properties['family/family_name'], '少林派');
        assert.equal(p.actor.skills.buddhism, 800); assert.ok(!p.actor.skills['taiji-jian']);
        assert.ok(!p.qualification_sources.some(s => s.includes('/wudang/')));
        assert.ok(p.qualification_note.includes('实验赋值'));
        for (const path of p.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    }
    assert.ok(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8')
        .includes("'tools/tests/martial_data/school_shaolin_support_cases.mjs'"));
});

test('原心跳与即时驱除分开，冒烟不替代正式重复样本', () => {
    const smoke = shaolinSupportConditions(catalog, { smoke: true });
    for (const c of smoke) assert.equal(c.samples, c.method === 'healing' ? 1 : 2);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 1120);
    for (const c of group('healing')) {
        assert.equal(c.method, 'healing'); assert.equal(c.parameters.observe_seconds, 90);
        assert.ok(c.parameters.qualification_note.includes('非reborn转世'));
    }
    for (const c of [...group('dispel'), ...group('buffs')]) assert.equal(c.parameters.observe_seconds, 0);
});

test('疗伤单跳只依原有效等级和资格，不因门派名称新增加成', () => {
    for (const level of [200, 400, 800]) {
        const state = { mappings: { force: 'yijinjing' }, eff_qi: 1000, max_qi: 10000,
            eff_jing: 1000, max_jing: 10000, neili: 6000, effective_skills: { force: level * 1.5 },
            effective_con: 36, cultivation: { breakup: 0, 'special_skill/divine': 0 } };
        assert.equal(healingStepExpected('heal', state).gain, 10 + level / 2);
        assert.equal(healingStepExpected('inspire', state).gain, 5 + level / 4);
        state.cultivation.breakup = 1; state.cultivation['special_skill/divine'] = 1;
        assert.equal(healingStepExpected('heal', state).gain, (10 + level / 2 + 72) * 3);
        assert.equal(healingStepExpected('inspire', state).gain, 5 + level / 4);
    }
});

// Synthetic records test the verifier only; original driver samples remain separate evidence.
function dispelRow(c) {
    const p = c.parameters, before = [p.actor, p.target].map((cfg, side) => {
        const skills = structuredClone(cfg.skills), effective_skills = {};
        for (const [key, value] of Object.entries(skills))
            effective_skills[key] = Math.trunc(value / 2) + (skills[cfg.mappings[key]] ?? 0);
        return { ...cfg.properties, id: side ? 'right' : 'left', skills, effective_skills, userp: 1, wizardp: 0,
            mappings: structuredClone(cfg.mappings), conditions: structuredClone(cfg.conditions || {}),
            cultivation: Object.fromEntries(['breakup', 'special_skill/divine', 'immune/poison'].map(k => [k, cfg.properties[k]])),
            weapon: 'none', busy: cfg.busy ?? 0, temp: { apply: { armor: 100 } } };
    });
    const e = dispelExpected(before, p), immediate = structuredClone(before);
    immediate[0].neili -= e.cost; immediate[0].busy = e.actorBusy[0]; immediate[1].busy = e.targetBusy[0];
    immediate[p.other ? 1 : 0].conditions = e.conditions;
    return { before, immediate, after: structuredClone(immediate), outcome: p.expected,
        command_accepted: Number(p.expected === 'observed'), reason: p.expected === 'refused' ? '原命令拒绝' : '',
        launches: p.expected === 'observed' ? [{ skill: 'force' }] : [], attacks: [], interfaces: [],
        metrics: [{ neili_cost: e.cost }, {}] };
}

test('驱除全部配置校验状态、费用和忙乱，不把受理算清除', () => {
    for (const c of group('dispel')) validateSchoolCombatRecord(dispelRow(c), c);
    const c = group('dispel').find(c => c.id.endsWith('freezing-self-l200-partial'));
    const raw = dispelRow(c); assert.ok(raw.after[0].conditions.freezing.remain > 0);
    raw.after[0].conditions = {}; raw.immediate = structuredClone(raw.after);
    assert.throws(() => validateSchoolCombatRecord(raw, c));
});

test('少林专属验证拒绝NPC豁免、佛学缺失及错造施展成功', () => {
    const c = group('dispel')[0];
    for (const mutate of [r => { r.before[0].userp = 0; }, r => { r.before[0].wizardp = 1; },
        r => { r.before[0].skills.buddhism = 0; }, r => { r.launches = []; }]) {
        const raw = dispelRow(c); mutate(raw); assert.throws(() => validateSchoolCombatRecord(raw, c));
    }
});

test('强化序列保留原命令和显式补给，不把持久化探针当登录测试', () => {
    for (const c of group('buffs')) {
        const p = c.parameters;
        assert.ok(p.buff_steps.length <= 6);
        assert.ok(p.qualification_note.includes('不代替登录'));
        assert.ok(p.buff_steps.every(s => ['exert power', 'exert tianmo'].includes(s.command)
            || [6000, 8000].includes(s.refill_neili)));
        if (p.combination === 'sword-highest') assert.equal(p.actor.mappings.sword, 'damo-jian');
        if (p.combination === 'axe-highest' || p.combination === 'spear-highest') assert.equal(p.power_selected, 'force');
    }
    assert.equal(group('buffs').filter(c => c.parameters.persistence_probe).length, 8);
});
