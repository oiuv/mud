import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { emeiSupportConditions } from './school_emei_support_cases.mjs';
import { healingStepExpected } from './school_wudang_healing_cases.mjs';
import { dispelExpected } from './school_wudang_dispel_cases.mjs';
import { dispelEffects } from './school_public_force_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = emeiSupportConditions(catalog);
const group = name => cases.filter(c => c.parameters.collection_group === 'emei-' + name);

test('峨嵋辅助477条件9186计划记录注册且旧10482条件完整指纹不变', () => {
    const all = preOctober29SchoolConditions(catalog);
    const historical = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school));
    const old = historical.filter(c => !c.id.startsWith('school-emei-support-')
        && !['emei-jiuyin', 'emei-jiuyin-buff', 'emei-yijin', 'emei-shexing', 'emei-jiuyin-learning', 'emei-jiuyin-passive', 'emei-npc', 'emei-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 10482); assert.equal(old.reduce((n, c) => n + c.samples, 0), 263566);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        'c9ffc7f6728d9bd2be0b78443fef4f0e91051e1dddc0f8fae6b883ae4c61150c');
    assert.deepEqual(all.filter(c => c.id.startsWith('school-emei-support-')), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.equal(cases.length, 477); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 9186);
    for (const [name, count, samples] of [['healing', 114, 228], ['dispel', 312, 7680], ['buffs', 51, 1278]]) {
        assert.equal(group(name).length, count);
        assert.equal(group(name).reduce((n, c) => n + c.samples, 0), samples);
    }
});

test('三门峨嵋映射、女性和大乘资格明确，不混入武当少林教学', () => {
    assert.deepEqual([...new Set(cases.map(c => c.parameters.skill))].sort(),
        ['emei-jiuyang', 'emei-xinfa', 'linji-zhuang']);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(p.school, 'emei'); assert.equal(p.family, '峨嵋派');
        assert.equal(p.actor.properties['family/family_name'], '峨嵋派');
        assert.equal(p.actor.properties.gender, '女性');
        assert.equal(p.actor.skills.mahayana, Math.max(200, p.level));
        assert.ok(!p.actor.skills.buddhism && !p.actor.skills['taiji-jian']);
        assert.ok(!p.qualification_sources.some(s => /class\/(wudang|shaolin)\//.test(s)));
        assert.ok(p.qualification_note.includes('实验赋值'));
        for (const path of p.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    }
    assert.ok(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8')
        .includes("'tools/tests/martial_data/school_emei_support_cases.mjs'"));
    for (const bad of [0, -1, 1.5]) assert.throws(() => emeiSupportConditions(catalog, { samples: bad }));
    assert.throws(() => emeiSupportConditions({ ...catalog, skills: catalog.skills.filter(s => s.id !== 'mahayana') }));
});

test('原心跳观察与即时调用分开，冒烟840条不充当正式随机分布', () => {
    const smoke = emeiSupportConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 840);
    for (const c of smoke) assert.equal(c.samples, c.method === 'healing' ? 1 : 2);
    for (const c of group('healing')) {
        assert.equal(c.method, 'healing'); assert.equal(c.parameters.observe_seconds, 90);
        assert.equal(c.samples, 2); assert.ok(c.parameters.qualification_note.includes('非reborn转世'));
    }
    for (const c of [...group('dispel'), ...group('buffs')]) assert.equal(c.parameters.observe_seconds, 0);
});

test('疗伤使用原有效内功、任督与天佑，不虚构峨嵋倍率', () => {
    for (const level of [200, 400, 800]) {
        const state = { mappings: { force: 'linji-zhuang' }, eff_qi: 1000, max_qi: 10000,
            eff_jing: 1000, max_jing: 10000, neili: 6000, effective_skills: { force: level * 1.5 },
            effective_con: 36, cultivation: { breakup: 0, 'special_skill/divine': 0 } };
        assert.equal(healingStepExpected('heal', state).gain, 10 + level / 2);
        assert.equal(healingStepExpected('inspire', state).gain, 5 + level / 4);
        state.cultivation.breakup = 1; state.cultivation['special_skill/divine'] = 1;
        assert.equal(healingStepExpected('heal', state).gain, (10 + level / 2 + 72) * 3);
        assert.equal(healingStepExpected('inspire', state).gain, 5 + level / 4);
    }
});

// Synthetic verifier inputs are not driver measurements or gameplay success evidence.
function dispelRow(c) {
    const p = c.parameters, before = [p.actor, p.target].map((cfg, side) => {
        const skills = structuredClone(cfg.skills), effective_skills = {};
        for (const [key, value] of Object.entries(skills))
            effective_skills[key] = Math.trunc(value / 2) + (skills[cfg.mappings[key]] ?? 0);
        return { ...cfg.properties, id: side ? 'right' : 'left', skills, effective_skills,
            userp: 1, interactive: 1, playerp: 1, wizardp: 0,
            mappings: structuredClone(cfg.mappings), conditions: structuredClone(cfg.conditions || {}),
            cultivation: Object.fromEntries(['breakup', 'special_skill/divine', 'immune/poison',
                'family/family_name', 'character'].map(k => [k, cfg.properties[k]])),
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

test('全部驱除配置校验异常状态、费用和忙乱，不能把部分减轻冒充清除', () => {
    for (const c of group('dispel')) validateSchoolCombatRecord(dispelRow(c), c);
    const c = group('dispel').find(c => c.id.endsWith('freezing-self-l200-partial'));
    const raw = dispelRow(c); assert.ok(raw.after[0].conditions.freezing.remain > 0);
    raw.after[0].conditions = {}; raw.immediate = structuredClone(raw.after);
    assert.throws(() => validateSchoolCombatRecord(raw, c));
});

test('峨嵋核验拒绝身份或资格错误、缺观测及伪造施展成功', () => {
    const c = group('dispel')[0];
    for (const mutate of [r => { r.before[0].userp = 0; }, r => { r.before[0].wizardp = 1; },
        r => { r.before[0].interactive = 0; }, r => { r.before[0].gender = '男性'; },
        r => { r.before[0].skills.mahayana = 0; }, r => { r.before[0].cultivation.character = '阴险奸诈'; },
        r => { r.metrics[1] = undefined; }, r => { r.metrics[0].neili_cost = NaN; },
        r => { r.launches = []; }]) {
        const raw = dispelRow(c); mutate(raw); assert.throws(() => validateSchoolCombatRecord(raw, c));
    }
});

test('驱除汇总把受理但不变、部分减轻、不可驱除与未知分开', () => {
    for (const [suffix, outcome] of [['drunk-self-l200-neili299', 'unchanged'],
        ['freezing-self-l200-partial', 'partial'], ['bandaged-self-l200-not-dispellable', 'unchanged']]) {
        const c = group('dispel').find(c => c.id.endsWith(suffix)), raw = dispelRow(c);
        const result = dispelEffects([{ outcome: 'observed', raw }], c.parameters);
        assert.equal(result.command_accepted, 1); assert.equal(result.outcomes[outcome], 1);
        delete raw.after[0].conditions;
        assert.equal(dispelEffects([{ outcome: 'observed', raw }], c.parameters).outcomes.unknown, 1);
    }
});

test('强化原序列独立记补给，峨嵋剑法映射和存储探针边界明确', () => {
    for (const c of group('buffs')) {
        const p = c.parameters;
        assert.ok(p.buff_steps.length <= 6); assert.ok(p.qualification_note.includes('不代替登录'));
        assert.ok(p.buff_steps.every(s => ['exert power', 'exert tianmo'].includes(s.command)
            || [6000, 8000].includes(s.refill_neili)));
        if (p.combination === 'sword-highest') assert.equal(p.actor.mappings.sword, 'emei-jian');
        if (p.combination === 'axe-highest' || p.combination === 'spear-highest') assert.equal(p.power_selected, 'force');
    }
    assert.equal(group('buffs').filter(c => c.parameters.persistence_probe).length, 6);
    assert.equal(group('buffs').filter(c => c.parameters.combination === 'paired').length, 6);
});
