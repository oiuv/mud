import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { digest } from './ledger.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan } from './school_combat_report.mjs';
import { emeiDefenseProfiles, emeiDefenseConditions, validateEmeiDefenseRecord,
    emeiDefenseEffects } from './school_emei_defense_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = emeiDefenseConditions(catalog);
const pick = suffix => { const c = cases.find(x => x.id === 'school-emei-defense-' + suffix); assert.ok(c, suffix); return c; };

// Synthetic observer records test collection contracts, not real game outcomes.
function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties,
        userp: 1, interactive: 1, wizardp: 0,
        cultivation: { 'family/family_name': config.properties['family/family_name'] },
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        weapon: config.equipment?.type ?? 'none',
        weapon_details: config.equipment ? { program: '/tests/' + config.equipment.type } : {},
        busy: config.busy ?? 0, temp: { apply: {} }, effective_skills: { force: 300 },
    }));
    before[1].effective_skills[p.usage] = Math.trunc(p.level / 2) + (p.target.mappings[p.usage] ? p.level : 0);
    const raw = { outcome: 'observed', before, immediate: structuredClone(before), launches: [],
        interfaces: [], defense_messages: [], defenses: [], dodge_checks: [], attacks: [], metrics: [{}, {}] };
    if (c.method === 'ordinary') {
        raw.attacks = [{ actor: 0, target: 1, type: 0, result: -1 }];
        raw.dodge_checks = ['base', 'settled'].map(phase => ({ actor: 0, target: 1, type: 0, phase,
            ap: 100, dp: p.target.busy && phase === 'settled' ? 100 : 300, skill: p.target.mappings.dodge ?? 0 }));
    } else {
        const i = { ...p.interface, implemented_by: 0, result: null };
        if (p.ability === 'valid_enable') {
            i.implemented_by = p.interface.object;
            i.result = Number((p.skill === 'zhutian-bu' ? ['dodge', 'move'] : ['parry']).includes(p.interface.usage));
        } else if (p.ability === 'query_dodge_msg') {
            i.implemented_by = p.interface.object; i.result = '$n原始闪避文字\n';
        } else if (p.ability === 'direct') {
            i.implemented_by = '/adm/daemons/combatd'; i.result = 91;
            raw.metrics = [{ direct: 1 }, { qi_cost: 91 }];
            if (p.usage === 'parry') raw.defenses = [{ actor: 0, target: 1, skill: p.skill, result: null }];
        }
        raw.interfaces = [i];
        if (p.ability === 'valid_damage') raw.defenses = [{ actor: 0, target: 1, skill: p.skill, result: null }];
    }
    return raw;
}

test('峨嵋十门182条件8498计划记录，来源、ID和配置指纹完整', () => {
    assert.equal(emeiDefenseProfiles.length, 10); assert.equal(cases.length, 182);
    assert.equal(cases.filter(c => c.parameters.usage === 'parry').length, 162);
    assert.equal(cases.filter(c => c.parameters.usage === 'dodge').length, 20);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 8498);
    assert.equal(emeiDefenseConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 364);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(digest(cases), '6ee73850f68ba42a1eef494d49ecd34efb49b120d4bff729a09912ab4d6b8f69');
    for (const c of cases) {
        for (const source of c.parameters.qualification_sources) assert.ok(existsSync(join(root, source)), source);
        validateEmeiDefenseRecord(row(c), c);
    }
    assert.throws(() => emeiDefenseConditions({ skills: [] }));
    assert.throws(() => emeiDefenseConditions(catalog, { samples: 0 }));
});

test('当前源码九门可招架、一门轻功；未实现防御接口不伪造为零加成实现', () => {
    const missing = ['query_effect_parry', 'query_effect_dodge', 'valid_damage', 'query_parry_msg'];
    for (const p of emeiDefenseProfiles) {
        const source = catalog.skills.find(s => s.id === p.skill);
        assert.ok(source.entries.some(e => e.function === 'valid_enable'));
        assert.ok(!source.entries.some(e => missing.includes(e.function)), p.skill);
        assert.equal(source.entries.some(e => e.function === 'query_dodge_msg'), p.skill === 'zhutian-bu');
        assert.match(readFileSync(join(root, source.path), 'utf8'), /inherit\s+SKILL\s*;/);
    }
    for (const file of ['inherit/skill/skill.c', 'feature/clean_up.c']) {
        const source = readFileSync(join(root, file), 'utf8');
        for (const fn of missing) assert.doesNotMatch(source, new RegExp('\\b' + fn + '\\s*\\('));
    }
});

test('峨嵋防御正式及烟雾完整接入，执行器冻结配置并保留接口和消息观察', () => {
    for (const smoke of [false, true]) {
        const selected = schoolCombatConditions(catalog, { smoke }).filter(c => c.parameters.collection_group === 'emei-defense');
        assert.deepEqual(selected, emeiDefenseConditions(catalog, { smoke }));
        if (!smoke) validateSchoolCombatPlan(selected, catalog);
        for (const c of selected) validateSchoolCombatRecord(row(c), c);
    }
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.equal((runner.match(/"shaolin-defense",\s+"emei-defense"/g) ?? []).length, 4);
    assert.match(readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8'),
        /'tools\/tests\/martial_data\/school_emei_defense_cases\.mjs'/);
});

test('防御配置仅激发一项，保留未激发、持器、忙乱和零内力对照', () => {
    for (const c of cases) {
        const p = c.parameters;
        assert.deepEqual(p.actor.mappings, {});
        assert.ok(Object.keys(p.target.mappings).every(k => k === p.usage));
        assert.equal(p.actor.properties.jiali, 0); assert.equal(p.target.properties.jiali, 0);
        assert.equal(p.observe_seconds, 0); assert.equal(p.expected, 'observed');
        assert.equal(c.samples, ['ordinary', 'direct', 'query_dodge_msg'].includes(p.ability) ? 100 : 2);
    }
    for (const p of emeiDefenseProfiles.filter(p => p.usage !== 'dodge')) {
        assert.deepEqual(pick(`${p.skill}-parry-ordinary-l400-unmapped`).parameters.target.mappings, {});
        assert.equal(pick(`${p.skill}-parry-ordinary-l400-neili0`).parameters.target.properties.neili, 0);
        assert.equal(pick(`${p.skill}-parry-ordinary-l400-opposite-equipment`).parameters.target.equipment?.type ?? 'none',
            p.weapon === 'none' ? 'sword' : 'none');
    }
});

test('身份、观测缺项、来源、映射与额外绝招不能静默接受', () => {
    const c = pick('emei-jian-parry-query_effect_parry-l400');
    for (const change of [r => { r.before[0].wizardp = 1; }, r => { r.before[1].interactive = 0; },
        r => { r.before[1].cultivation['family/family_name'] = '其他'; },
        r => { r.before[1].mappings.force = 'linji-zhuang'; }, r => { delete r.defense_messages; },
        r => { delete r.metrics[1]; }, r => { r.metrics[1].neili_cost = null; },
        r => { delete r.interfaces[0].result; }, r => { delete r.interfaces[0].implemented_by; },
        r => { r.interfaces[0].implemented_by = c.parameters.interface.object; },
        r => { r.launches.push({}); }, r => { r.immediate[1].neili--; }]) {
        const bad = row(c); change(bad); assert.throws(() => validateEmeiDefenseRecord(bad, c));
    }
});

test('装备轻功修正与忙乱DP保留；反击不混入单次主攻击', () => {
    const c = pick('zhutian-bu-dodge-ordinary-l400-armed'), r = row(c);
    r.before[1].temp.apply.dodge = -1; r.before[1].effective_skills.dodge--;
    r.attacks.push({ actor: 1, target: 0, type: 0, result: 0 });
    validateEmeiDefenseRecord(r, c);
    r.before[1].effective_skills.dodge++; assert.throws(() => validateEmeiDefenseRecord(r, c));
    const b = pick('zhutian-bu-dodge-ordinary-l400-busy'), s = row(b);
    s.dodge_checks[0].dp = 302; s.dodge_checks[1].dp = 100;
    validateEmeiDefenseRecord(s, b); s.dodge_checks[1].dp = 302;
    assert.throws(() => validateEmeiDefenseRecord(s, b));
});

test('公共直伤只查招架；轻功不得冒充减伤钩子，1000输入不当作实际伤害', () => {
    for (const skill of ['emei-jian', 'zhutian-bu']) {
        const c = pick(`${skill}-${skill === 'zhutian-bu' ? 'dodge' : 'parry'}-direct-l400`), r = row(c);
        validateEmeiDefenseRecord(r, c);
        assert.equal(r.metrics[1].qi_cost, 91);
        const bad = structuredClone(r); bad.metrics[1].qi_cost = 0;
        assert.throws(() => validateEmeiDefenseRecord(bad, c));
        if (skill === 'zhutian-bu') r.defenses.push({ actor: 0, target: 1, skill, result: null });
        else r.defenses = [];
        assert.throws(() => validateEmeiDefenseRecord(r, c));
    }
});

test('招架条件概率排除闪避、反击和错误记录，不含样本时为未知', () => {
    const c = pick('emei-jian-parry-ordinary-l400');
    const rows = [-1, -1, -2, 0].map(result => {
        const raw = row(c); raw.attacks[0].result = result;
        raw.attacks.push({ actor: 1, target: 0, type: 0, result: 0 });
        return { outcome: 'observed', raw };
    });
    rows.push({ outcome: 'error', raw: {} });
    const result = emeiDefenseEffects(rows);
    assert.equal(result.samples, 4); assert.equal(result.primary_attacks, 4); assert.equal(result.hit, 1);
    assert.equal(result.parry.rate, 0.25); assert.equal(result.parry_given_not_dodged.rate, 0.5);
    assert.equal(emeiDefenseEffects([]).parry.rate, null);
});

test('缺失接口、缺失元数据、稀疏零计数分开统计，不填充未知', () => {
    const c = pick('emei-jian-parry-query_effect_parry-l400'), missing = row(c), unknown = row(c);
    delete unknown.interfaces[0].implemented_by; delete unknown.metrics[1];
    const text = row(pick('zhutian-bu-dodge-query_dodge_msg-l400'));
    const result = emeiDefenseEffects([missing, unknown, text].map(raw => ({ outcome: 'observed', raw })));
    assert.equal(result.missing_interfaces, 1); assert.equal(result.unknown_interfaces, 1);
    assert.equal(result.interface_numbers.mean, null); assert.equal(result.interface_texts.length, 1);
    assert.equal(result.defender_neili_cost.n, 2); assert.equal(result.defender_neili_cost.unknown, 1);
    assert.equal(result.defender_neili_cost.mean, 0);
    const bad = row(pick('zhutian-bu-dodge-query_dodge_msg-l400'));
    bad.interfaces[0].result = 0;
    assert.throws(() => validateEmeiDefenseRecord(bad, pick('zhutian-bu-dodge-query_dodge_msg-l400')));
});
