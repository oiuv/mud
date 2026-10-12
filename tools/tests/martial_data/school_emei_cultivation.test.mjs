import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { emeiForces, emeiKnowledge, emeiCultivationFields, emeiCultivationPending, emeiForceBonus, emeiForceCapacity,
    emeiResearchBound, emeiCultivationConditions, emeiCultivationInterface,
    validateEmeiCultivationRecord } from './school_emei_cultivation_cases.mjs';
import { schoolCultivationEffects, validateSchoolCombatPlan } from './school_combat_report.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = emeiCultivationConditions(catalog);
const pick = suffix => { const c = cases.find(x => x.id === 'school-emei-cultivation-' + suffix); assert.ok(c, suffix); return c; };

// No driver result is invented: these records test only validation/report behavior.
function row(c, maximum = false) {
    const p = c.parameters, before = [p.actor, p.target].map(cfg => ({
        qi: 10000, eff_qi: 10000, ...cfg.properties,
        userp: 1, interactive: 1, wizardp: 0, weapon: 'none', temp: {}, busy: cfg.busy ?? 0,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {},
        cultivation: Object.fromEntries(emeiCultivationFields.map(k => [k, cfg.properties[k] ?? null])),
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原接口提示',
        attacks: [], launches: [], interfaces: [], metrics: [{}, {}], command_accepted: p.command_return };
    if (c.method === 'research') {
        const a = r.immediate[0]; a.learned_points += p.completed;
        a.jing = p.clear_jing ? 0 : a.jing - p.completed * Math.trunc(1000 / a.int);
        if (p.completed) a.learned[p.skill] = p.completed * (maximum ? emeiResearchBound(p) : 1);
    } else r.interfaces.push({ ...p.interface, result: emeiCultivationInterface(p) });
    return r;
}

test('峨嵋修养263条件5720计划记录，53随机研究与210确定性/拒绝条件分列', () => {
    assert.equal(cases.length, 263); assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 5720);
    assert.equal(cases.filter(c => c.method === 'research').length, 96);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 70);
    assert.equal(cases.filter(c => c.method === 'research' && c.parameters.expected === 'observed').length, 53);
    assert.equal(emeiCultivationConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 316);
    const entries = new Set(catalog.skills.map(s => s.path));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id));
        assert.ok(c.parameters.actor.properties.neili <= c.parameters.actor.properties.max_neili);
        for (const file of c.parameters.qualification_sources) assert.ok(existsSync(join(root, file)), file);
        for (const skill of Object.keys(c.parameters.actor.skills)) assert.ok(catalog.skills.some(s => s.id === skill), skill);
        for (const maximum of [false, true]) validateEmeiCultivationRecord(row(c, maximum), c);
    }
    assert.throws(() => emeiCultivationConditions({ skills: [] }));
    assert.throws(() => emeiCultivationConditions(catalog, { samples: 0 }));
});

test('valid_learn条件逐项对照原门槛，临济不人为增加基本内功须高于特殊等级的要求', () => {
    for (const c of cases.filter(c => c.parameters.ability === 'valid_learn')) {
        const p = c.parameters, s = p.actor.skills, q = p.actor.properties;
        let allowed;
        switch (p.skill) {
        case 'emei-xinfa': allowed = s.force >= 10; break;
        case 'linji-zhuang': allowed = q.gender === '女性' && s.force >= 40
            && (s.mahayana > s['linji-zhuang'] || s.mahayana >= 200); break;
        case 'emei-jiuyang': allowed = !s['jiuyang-shengong'] && !s['yinyang-shiertian']
            && !(q.gender === '无性' && q['emei-jiuyang'] > 9)
            && q.con >= 34 && s.force >= 100 && q.max_neili >= 1200; break;
        case 'mahayana': allowed = q.shen >= 0; break;
        case 'buddhism': allowed = !(q.guilty > 0); break;
        default: assert.fail(p.skill);
        }
        assert.equal(p.expected, allowed ? 'observed' : 'refused', c.id);
    }
    assert.equal(pick('linji-zhuang-valid_learn-l200-force40').parameters.expected, 'observed');
    assert.equal(pick('linji-zhuang-valid_learn-l199-mahayana199').parameters.expected, 'refused');
    assert.equal(pick('linji-zhuang-valid_learn-l800-mahayana200').parameters.expected, 'observed');
});

test('峨嵋修养接入统一计划和原始记录校验，不把烟雾当正式条件', () => {
    const registered = schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'emei-cultivation');
    assert.deepEqual(registered, cases);
    validateSchoolCombatPlan(registered, catalog);
    assert.throws(() => validateSchoolCombatPlan(emeiCultivationConditions(catalog, { smoke: true }), catalog));
    for (const c of registered) validateSchoolCombatRecord(row(c), c);
    const c = pick('emei-jiuyang-valid_learn-l200-eunuch-attribute10'), invalid = row(c);
    delete invalid.before[0].cultivation['emei-jiuyang'];
    assert.throws(() => validateSchoolCombatRecord(invalid, c));
});

test('女性学习资格和sex对容量的影响互不替换，容量取最大不把兼修求和', () => {
    assert.deepEqual([200, 400, 800].map(l => emeiForceBonus('linji-zhuang', l)), [1130, 3020, 10580]);
    assert.deepEqual([200, 400, 800].map(l => emeiForceBonus('emei-jiuyang', l)), [450, 1800, 7200]);
    assert.equal(emeiForceBonus('linji-zhuang', 800, { sex: 1 }), 0);
    assert.equal(emeiForceBonus('emei-xinfa', 800), 0);
    assert.throws(() => emeiForceBonus('not-a-reviewed-force', 200));
    for (const [mapping, expected] of [['emei-xinfa', 6000], ['linji-zhuang', 9020], ['emei-jiuyang', 7800], ['unmapped', 2000]]) {
        const a = pick('linji-zhuang-query_current_neili_limit-l400-all-' + mapping).parameters.actor;
        assert.equal(emeiForceCapacity(a, true), expected); assert.equal(emeiForceCapacity(a, false), 9020);
        const modified = structuredClone(a); modified.properties.sex = 1;
        assert.equal(emeiForceCapacity(modified, false), 7800);
    }
    assert.equal(emeiForceCapacity(pick('linji-zhuang-query_neili_limit-l400-combined').parameters.actor, false), 17094);
    assert.equal(emeiForceCapacity(pick('linji-zhuang-query_neili_limit-l400-bonze').parameters.actor, false), 9520);
    assert.equal(emeiForceCapacity(pick('linji-zhuang-query_neili_limit-l400-bonze-other-family').parameters.actor, false), 9020);
    assert.equal(emeiForceCapacity(pick('emei-xinfa-query_neili_limit-l201').parameters.actor, false), 3010);
    assert.equal(pick('linji-zhuang-valid_learn-l200-sex').parameters.expected, 'observed');
    assert.equal(pick('linji-zhuang-valid_learn-l200-male').parameters.expected, 'refused');
});

test('峨嵋九阳无性错误读取按原实现单独核对，不借用少林或武当运行结果', () => {
    for (const level of [9, 10, 200, 800])
        assert.equal(pick(`emei-jiuyang-valid_learn-l${level}-eunuch-no-attribute`).parameters.expected, 'observed');
    for (const ability of ['valid_learn', 'research']) {
        assert.equal(pick(`emei-jiuyang-${ability}-l200-eunuch-attribute9`).parameters.expected, 'observed');
        assert.equal(pick(`emei-jiuyang-${ability}-l200-eunuch-attribute10`).parameters.expected, 'refused');
        assert.equal(pick(`emei-jiuyang-${ability}-l200-known-jiuyang-shengong`).parameters.expected, 'refused');
    }
    assert.equal(pick('emei-jiuyang-valid_learn-l200-female-attribute10').parameters.expected, 'observed');
    const c = pick('emei-jiuyang-valid_learn-l200-eunuch-attribute10'), r = row(c);
    delete r.before[0].cultivation['emei-jiuyang'];
    assert.throws(() => validateEmeiCultivationRecord(r, c));
});

test('缺主技能的阴阳十二天分支显式未测，不通过假技能或静默删项掩盖', () => {
    assert.equal(emeiCultivationPending.length, 2);
    assert.deepEqual(emeiCultivationPending.map(x => x.ability), ['valid_learn', 'research']);
    for (const pending of emeiCultivationPending) {
        assert.equal(pending.status, 'unmeasured_legacy_state');
        assert.ok(!catalog.skills.some(s => s.id === pending.dependency));
        for (const extension of ['.c', '.lpc']) assert.ok(!existsSync(join(root, 'kungfu/skill', pending.dependency + extension)));
        for (const file of pending.sources) assert.ok(existsSync(join(root, file)));
        assert.ok(!cases.some(c => Object.hasOwn(c.parameters.actor.skills, pending.dependency)));
    }
});

test('知识的原类型、可学上限和研究拒绝分开，不制造不存在的大乘练习接口', () => {
    for (const skill of emeiKnowledge) for (const level of [200, 400, 800]) {
        assert.equal(pick(`${skill}-research-l${level}`).parameters.expected, 'refused');
        assert.equal(emeiCultivationInterface(pick(`${skill}-type-l${level}`).parameters), 'knowledge');
        assert.equal(emeiCultivationInterface(pick(`${skill}-valid_learn_level-l${level}`).parameters), 999);
    }
    assert.ok(!cases.some(c => c.parameters.skill === 'mahayana' && c.parameters.ability === 'practice_skill'));
    assert.equal(pick('mahayana-valid_learn-l200-evil1').parameters.expected, 'refused');
    assert.equal(pick('mahayana-valid_learn-l200-shen0').parameters.expected, 'observed');
    assert.equal(pick('buddhism-valid_learn-l200-guilty1').parameters.expected, 'refused');
});

test('原研究的随机边界、兼修许可和500级分段；预期计算不代替驱动施展', () => {
    for (const skill of emeiForces) {
        assert.deepEqual([200, 400, 800].map(l => emeiResearchBound(pick(`${skill}-research-l${l}`).parameters)), [11, 12, 11]);
        assert.deepEqual([200, 400, 800].map(l => emeiResearchBound(pick(`${skill}-research-l${l}-all-forces`).parameters)), [19, 21, 16]);
        assert.equal(pick(`${skill}-research-l200-huashan-known`).parameters.expected, skill === 'emei-jiuyang' ? 'observed' : 'refused');
        for (const level of [499, 500]) {
            const c = pick(`${skill}-research-l${level}`); validateEmeiCultivationRecord(row(c, true), c);
        }
    }
    for (const [suffix, maximum] of [['guimai', 14], ['wuxing', 13], ['both', 17]])
        assert.equal(emeiResearchBound(pick('linji-zhuang-research-l200-' + suffix).parameters), maximum);
    const c = pick('linji-zhuang-research-l200'), r = row(c, true);
    r.immediate[0].learned['linji-zhuang']++; assert.throws(() => validateEmeiCultivationRecord(r, c));
});

test('命令返回1不等于研究成功，部分研究保留真实潜能和精神支出', () => {
    const selected = ['', '-jing26', '-partial'].map(suffix => pick('emei-xinfa-research-l200' + suffix));
    const stats = schoolCultivationEffects(selected.map(c => ({ outcome: c.parameters.expected, raw: row(c) })), 'emei-xinfa');
    assert.equal(stats.attempts, 3); assert.equal(stats.command_accepted, 3);
    assert.equal(stats.potential_used.mean, 1); assert.equal(stats.jing_cost.mean, 113 / 3);
    assert.equal(stats.neili_cost.mean, 0);
    const c = selected[2], r = row(c); r.immediate[0].learned_points++;
    assert.throws(() => validateEmeiCultivationRecord(r, c));
    assert.equal(pick('emei-xinfa-research-l200-exp799999').parameters.command_return, 1);
    assert.equal(pick('emei-xinfa-research-l200-exp799999').parameters.completed, 0);
});

test('缺少观测字段、假玩家、查询改状态或额外学习进度均不能通过', () => {
    const c = pick('linji-zhuang-query_neili_limit-l200'), r = row(c);
    r.immediate[0].temp.notify_fail = '原提示'; validateEmeiCultivationRecord(r, c);
    for (const change of [x => { delete x.interfaces[0].result; }, x => { x.before[0].wizardp = 1; },
        x => { x.before[0].interactive = 0; }, x => { x.immediate[0].max_neili++; },
        x => { x.immediate[1].qi--; }, x => { x.interfaces[0].result++; },
        x => { delete x.before[0].cultivation.sex; }]) {
        const bad = structuredClone(r); change(bad); assert.throws(() => validateEmeiCultivationRecord(bad, c));
    }
    const research = pick('linji-zhuang-research-l200'), bad = row(research);
    bad.immediate[0].learned.mahayana = 1; assert.throws(() => validateEmeiCultivationRecord(bad, research));
});

test('驱动空闲busy的null编码允许，缺少busy字段仍不能冒充空闲', () => {
    const c = pick('emei-xinfa-valid_learn-l200'), r = row(c);
    r.before[0].busy = null; r.immediate[0].busy = null;
    validateEmeiCultivationRecord(r, c);
    delete r.before[0].busy;
    assert.throws(() => validateEmeiCultivationRecord(r, c));
});
