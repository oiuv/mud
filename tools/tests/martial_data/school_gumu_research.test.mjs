import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSeries, openSeries, digest } from './ledger.mjs';
import { validateExpectedOutcomes, validateRecord } from './execution.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatMarkdown, schoolCombatEffects, validateSchoolCombatPlan } from './school_combat_report.mjs';
import { gumuZhiConditions } from './school_gumu_zhi_cases.mjs';
import { gumuQuanzhenConditions } from './school_gumu_quanzhen_cases.mjs';
import { gumuResearchProfiles, gumuResearchFixtureRequirements, gumuResearchAllowed, gumuResearchBound,
    gumuResearchProgress, gumuResearchPlan, gumuResearchConditions, validateGumuResearchRecord,
    gumuResearchEffects } from './school_gumu_research_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sha = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const skills = gumuResearchProfiles.map(({ skill: id }) => {
    const path = 'kungfu/skill/' + id + '.c';
    return { id, path, sha256: sha(readFileSync(join(root, path), 'utf8')), entries: [] };
});
const sourceFingerprint = digest(skills.map(s => ({ path: s.path, sha256: s.sha256 })));
const catalog = { skills, source_fingerprint: sourceFingerprint, dictionary_sha256: '0'.repeat(64) };
const cases = gumuResearchConditions(catalog), smoke = gumuResearchConditions(catalog, { smoke: true });
const pick = (skill = 'yunv-jian', level = 200, suffix = '', upgrade = false) => {
    const c = cases.find(c => c.id === `school-gumu-research-${skill}-${upgrade ? 'upgrade' : 'study'}-l${level}${suffix ? '-' + suffix : ''}`);
    assert.ok(c, `${skill}/${level}/${suffix}/${upgrade}`); return c;
};
const fields = ['character', 'family/family_name', 'special_skill/wuxing', 'env/no_learn',
    'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_dex', 'reborn/dex'];
const effective = (state, cfg) => Object.fromEntries(Object.entries(state.skills).map(([key, n]) =>
    [key, Math.trunc(n / 2) + (state.skills[cfg.mappings[key]] ?? 0) + (state.temp.apply[key] ?? 0)]));

function snapshot(cfg, side) {
    const weapon = cfg.equipment;
    const state = { object: `/tests/actor#${side + 1}`, id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
        neili: 6000, max_neili: 6000, str: 30, int: 30, con: 30, dex: 30, gender: '男性',
        combat_exp: 10000000, potential: 10000, learned_points: null, busy: cfg.busy ?? null,
        cultivation: Object.fromEntries(fields.map(key => [key, cfg.properties[key] ?? null])),
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {}, preparations: {},
        weapon: weapon?.type ?? 'none', weapon_damage: weapon ? 50 : 0, weapon_flag: weapon?.type === 'sword' ? 4 : 0,
        weapon_details: weapon ? { object: '/tests/' + weapon.type + '#5', program: '/tests/' + weapon.type,
            skill_type: weapon.type, weight: 3000, damage: 50, flag: weapon.type === 'sword' ? 4 : 0 } : {},
        temp: { apply: { armor: 100, ...(weapon ? { damage: 50, dodge: -1 } : {}) },
            ...(weapon ? { weapon: '/tests/' + weapon.type + '#5' } : {}) } };
    for (const [key, value] of Object.entries(cfg.properties)) if (!fields.includes(key)) state[key] = value;
    state.effective_skills = effective(state, cfg);
    state.effective_int = state.int + Math.trunc((cfg.skills.literate ?? 0) / 10);
    state.effective_dex = state.dex + Math.trunc((cfg.skills.dodge ?? 0) / 10);
    state.effective_str = state.str + Math.trunc(Math.max(0, ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0)) / 10);
    return state;
}

// Collector contract tests only. These synthetic records are never appended as gameplay evidence.
function record(c, upper = false) {
    const p = c.parameters, before = [snapshot(p.actor, 0), snapshot(p.target, 1)];
    const r = { kind: 'sample', condition_id: c.id, method: c.method, outcome: p.expected, elapsed: 0.01,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        attacks: [], interfaces: [], launches: [], callbacks: [], terminals: [],
        research_room: Object.fromEntries(['no_fight', 'pigging', 'research_improve'].map(k => [k, p.room[k] ?? null])),
        reason: p.expected === 'refused' ? '原研究拒绝或未产生实际学习（合成资料）' : '' };
    if (['suxin-jian', 'quanzhen-jian', 'yinsuo-jinling', 'sanwu-shou', 'wudu-shenzhang', 'sad-strike'].includes(p.skill))
        r.skill_load_context = { actor: before[0].object, already_loaded: 0, skills: structuredClone(p.actor.skills),
            command: `enable ${p.usage} ${p.skill}` };
    const [b, a] = [before[0], r.immediate[0]];
    a.jing = p.clear_jing ? 0 : b.jing - p.completed * Math.trunc(1000 / b.int);
    a.learned_points += p.completed;
    if (p.entered_loop) a.temp.time = { research: 1791792000 };
    if (p.expected === 'refused') a.temp.notify_fail = r.reason;
    if (c.method === 'upgrade') {
        const primed = structuredClone(b); primed.learned[p.skill] = gumuResearchProgress(p, p.primer.amount);
        a.skills[p.skill]++; a.learned[p.skill] = 0; a.effective_skills = effective(a, p.actor);
        r.upgrades = [{ before: structuredClone(b), primed, after: structuredClone(a), accepted: 1,
            action: p.action, implemented_by: '/inherit/skill/skill' }];
    } else {
        r.command_accepted = p.command_return;
        if (p.completed) a.learned[p.skill] = p.completed * (upper ? gumuResearchProgress(p, gumuResearchBound(p) - 1) : 1);
    }
    if (a.jing !== b.jing) r.metrics[0].jing_cost = b.jing - a.jing;
    r.after = structuredClone(r.immediate); return r;
}
function validate(r, c) { validateRecord(r, c); validateSchoolCombatRecord(r, c); }
function mutate(c, change) { const r = record(c); change(r); assert.throws(() => validate(r, c)); }
const rows = raw => [{ outcome: raw.outcome, raw }];

test('十五门研究有限矩阵、独立正式/烟雾指纹及显式结果声明', () => {
    assert.equal(gumuResearchProfiles.length, 15); assert.equal(gumuResearchFixtureRequirements.length, 5);
    assert.equal(cases.length, 138); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4686);
    assert.equal(cases.filter(c => c.samples === 100).length, 45); assert.equal(cases.filter(c => c.method === 'upgrade').length, 17);
    assert.equal(smoke.length, 138); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 138);
    assert.equal(sha(cases), '3be0a860975a3fa849c506fdc74715f23ed85305b843d8c0a3843c9d2f70ba6f');
    assert.equal(sha(smoke), 'c4423756f75a6361121287d2842866fe1656d3826bef533e8d3b3ea6920212d3');
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 96);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').reduce((n, c) => n + c.samples, 0), 84);
    assert.deepEqual(cases.map(c => c.parameters), smoke.map(c => c.parameters));
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    for (const c of cases) {
        assert.ok(!Object.hasOwn(record(c), 'parameters'));
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        for (const name of Object.keys(c.parameters.actor.skills)) assert.ok(existsSync(join(root, 'kungfu/skill/' + name + '.c')), name);
        validate(record(c), c); validate(record(c, true), c);
    }
    for (const samples of [0, -1, 1.5, NaN]) assert.throws(() => gumuResearchConditions(catalog, { samples }));
    assert.throws(() => gumuResearchConditions({ skills: [] }));
});

test('实际createSeries/openSeries验证公共ID、源码入口与完整138条件；不启动driver', () => {
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-research-unit-'));
    try {
        const input = { inventory: { source_fingerprint: sourceFingerprint, versions: { synthetic: true } }, catalog,
            conditions: cases, execution: { synthetic: true, driver_started: false } };
        const manifest = createSeries(directory, input);
        assert.deepEqual(openSeries(directory).identity.conditions, cases);
        assert.equal(openSeries(directory).fingerprint, manifest.fingerprint);
        const second = createSeries(join(directory, 'smoke'), { ...input, conditions: smoke });
        assert.deepEqual(openSeries(join(directory, 'smoke')).identity.conditions, smoke);
        assert.notEqual(second.fingerprint, manifest.fingerprint);
        const invalid = structuredClone(input); invalid.conditions[0].id += '.';
        assert.throws(() => createSeries(join(directory, 'invalid'), invalid), /条件 ID/);
        invalid.conditions[0].id = cases[0].id; invalid.conditions[0].entry_id += '-invalid';
        assert.throws(() => createSeries(join(directory, 'invalid-entry'), invalid), /入口不在源码/);
    } finally {
        const resolved = resolve(directory), parent = resolve(tmpdir());
        assert.ok(resolved.startsWith(parent + '\\mud-gumu-research-unit-') || resolved.startsWith(parent + '/mud-gumu-research-unit-'));
        rmSync(directory, { recursive: true, force: true });
    }
});

test('三组只追加287条件，旧15378完整JSON不变，六份正式/烟雾计划走真实建档入口', () => {
    const inventory = buildInventory(root), fullCatalog = collectCatalog(root, inventory);
    const generators = [gumuZhiConditions, gumuQuanzhenConditions, gumuResearchConditions];
    const groups = ['gumu-zhi', 'gumu-quanzhen', 'gumu-research'];
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-three-plans-unit-'));
    try {
        for (const [isSmoke, count, oldSha] of [
            [false, 396578, '923372129137cf270f21ab854b3b1d0a9d16dc77fa18881d6ff6dfe0913bec90'],
            [true, 25539, '33d125d253cacf0759843fa1a86e723e79125c707816acaca4196b635247c8a6'],
        ]) {
            const all = schoolCombatConditions(fullCatalog, { smoke: isSmoke }).slice(0, 15665);
            const old = all.filter(c => !groups.includes(c.parameters.collection_group));
            assert.equal(old.length, 15378); assert.equal(old.reduce((n, c) => n + c.samples, 0), count);
            assert.equal(sha(old), oldSha); assert.equal(all.length, 15665);
            assert.equal(all.reduce((n, c) => n + c.samples, 0), isSmoke ? 25855 : 406756);
            for (const [index, generator] of generators.entries()) {
                const conditions = generator(fullCatalog, { smoke: isSmoke });
                assert.deepEqual(all.filter(c => c.parameters.collection_group === groups[index]), conditions);
                validateExpectedOutcomes(conditions);
                if (!isSmoke) validateSchoolCombatPlan(conditions, fullCatalog);
                const destination = join(directory, `${index}-${isSmoke ? 'smoke' : 'formal'}`);
                const manifest = createSeries(destination, { inventory, catalog: fullCatalog, conditions,
                    execution: { synthetic: true, driver_started: false } });
                const opened = openSeries(destination);
                assert.deepEqual(opened.identity.conditions, conditions); assert.equal(opened.fingerprint, manifest.fingerprint);
            }
        }
        const original = gumuResearchConditions(fullCatalog), changed = structuredClone(original);
        changed[0].parameters.actor.skills[changed[0].parameters.skill]++;
        assert.throws(() => validateSchoolCombatPlan(changed, fullCatalog), /原审阅版本/);
        changed[0].id += '.';
        assert.throws(() => createSeries(join(directory, 'invalid-id'), { inventory, catalog: fullCatalog,
            conditions: changed, execution: { synthetic: true, driver_started: false } }), /条件 ID/);
    } finally {
        const resolved = resolve(directory), parent = resolve(tmpdir());
        assert.ok(resolved.startsWith(parent + '\\mud-gumu-three-plans-unit-')
            || resolved.startsWith(parent + '/mud-gumu-three-plans-unit-'));
        rmSync(directory, { recursive: true, force: true });
    }
});

test('原研究180门槛仍调用各门valid_learn；玄铁难度500，其余不制造奖励回调', () => {
    for (const { skill, difficult } of gumuResearchProfiles) {
        assert.equal(pick(skill, 179).parameters.expected, 'refused');
        assert.equal(pick(skill, 180).parameters.expected, 'observed');
        assert.equal(pick(skill, 200, 'learn-gate').parameters.expected, 'refused');
        assert.equal(gumuResearchAllowed(pick(skill, 200, 'learn-gate').parameters), false);
        const source = readFileSync(join(root, 'kungfu/skill/' + skill + '.c'), 'utf8');
        assert.doesNotMatch(source, /(?:int|void|mixed)\s+(?:valid_research|skill_improved)\s*\(/);
        assert.equal(difficult, skill === 'xuantie-jian' ? 500 : 0);
        if (difficult) assert.match(source, /int difficult_level\(\)\s*\{\s*return 500;/);
        else assert.doesNotMatch(source, /int difficult_level\(/);
    }
    const skeleton = readFileSync(join(root, 'inherit/skill/skill.c'), 'utf8');
    assert.match(skeleton, /int valid_research\(object me\) \{ return 1; \}/);
    assert.match(skeleton, /void skill_improved\(object me\) \{\}/);
});

test('双基本功相关权重、499/500分段、玄铁难度与修养逐阶段整数截断', () => {
    for (const [skill, level, bound, max] of [['yunv-jian', 200, 39, 13], ['xuantie-jian', 200, 17, 8],
        ['bingpo-shenzhen', 200, 23, 8], ['yunv-jian', 499, 84, 14], ['yunv-jian', 500, 79, 14],
        ['xuantie-jian', 499, 29, 7], ['xuantie-jian', 500, 51, 13]]) {
        const p = pick(skill, level).parameters;
        assert.equal(gumuResearchBound(p), bound); assert.equal(gumuResearchProgress(p, bound - 1), max);
    }
    assert.equal(gumuResearchBound(pick('yunv-jian', 200, 'no-parry').parameters), 23);
    assert.equal(gumuResearchBound(pick('yunv-jian', 200, 'effective-int').parameters), 39);
    assert.equal(gumuResearchBound(pick('yunv-jian', 200, 'int35').parameters), 38);
    const p = pick('yunv-jian', 200, 'all-bonuses').parameters;
    assert.equal(gumuResearchBound(p), 69); assert.equal(gumuResearchProgress(p, 68), 46);
    const c = pick(); mutate(c, r => { r.immediate[0].learned[c.parameters.skill] = 14; r.after = structuredClone(r.immediate); });
    mutate(c, r => { r.immediate[0].learned[c.parameters.skill] = 0; r.after = structuredClone(r.immediate); });
});

test('潜能覆盖请求数，精力实际完成、残余清零和受理无增长分别记账', () => {
    for (const [suffix, expected, accepted, completed, cost] of [
        ['times3-potential2', 'refused', 0, 0, 0], ['times3-potential3', 'observed', 1, 3, 81],
        ['jing26', 'refused', 1, 0, 26], ['eff-jing26', 'refused', 0, 0, 0],
        ['partial', 'observed', 1, 2, 60], ['times100', 'observed', 1, 100, 2700],
        ['exp799999', 'refused', 1, 0, 0], ['exp800000', 'observed', 1, 1, 27]]) {
        const c = pick('yunv-jian', 200, suffix), r = record(c);
        assert.equal(c.parameters.expected, expected); assert.equal(r.command_accepted, accepted);
        assert.equal(r.immediate[0].learned_points, completed); assert.equal(r.metrics[0].jing_cost ?? 0, cost);
        validate(r, c);
    }
    const c = pick('yunv-jian', 200, 'partial');
    mutate(c, r => { r.immediate[0].jing = 6; r.after = structuredClone(r.immediate); r.metrics[0].jing_cost = 54; });
    mutate(c, r => { r.immediate[0].potential -= 2; r.after = structuredClone(r.immediate); });
    mutate(c, r => { r.metrics[0].jing_cost += 1; r.metrics[0].jing_recovery = 1; });
    mutate(pick('yunv-jian', 200, 'exp799999'), r => {
        r.immediate[0].temp.time = { research: 1791792000 }; r.after = structuredClone(r.immediate);
    });
});

test('原weak_mode预置与真实研究跨级分账，继承空回调不增属性或领悟', () => {
    for (const c of cases.filter(c => c.method === 'upgrade')) {
        const r = record(c), p = c.parameters; validate(r, c);
        assert.equal(r.upgrades[0].primed.skills[p.skill], p.level);
        assert.equal(r.immediate[0].skills[p.skill], p.level + 1);
        assert.equal(r.immediate[0].learned[p.skill], 0); assert.equal(r.metrics[0].jing_cost, 27);
        assert.deepEqual(r.immediate[0].cultivation, r.before[0].cultivation);
    }
    const c = pick('xuantie-jian', 199, '', true), r = record(c);
    assert.equal(r.upgrades[0].primed.learned['xuantie-jian'], 4816054);
    for (const change of [x => { x.upgrades[0].primed.skills['xuantie-jian']++; },
        x => { x.upgrades[0].primed.learned['xuantie-jian'] = 3344482; },
        x => { x.upgrades[0].implemented_by = '/kungfu/skill/xuantie-jian'; },
        x => { x.upgrades[0].after = structuredClone(x.upgrades[0].primed); },
        x => { x.immediate[0].str++; x.after = structuredClone(x.immediate); x.upgrades[0].after = structuredClone(x.immediate[0]); }]) mutate(c, change);
});

test('真实USER身份、原房间与属性归属、装备apply和未知计量不能由合成默认补齐', () => {
    const c = pick();
    for (const change of [r => { delete r.before[0].busy; }, r => { delete r.research_room.pigging; },
        r => { r.research_room.research_improve = 1; }, r => { delete r.before[0].cultivation.character; },
        r => { r.before[0].effective_skills.dodge++; }, r => { r.before[0].temp.apply.dodge = 0; },
        r => { r.before[0].weapon_details.object = '/tests/unrelated#2'; },
        r => { delete r.metrics[0]; }, r => { r.metrics[0].jing_cost = null; },
        r => { r.immediate[1].learned_points = 1; r.after = structuredClone(r.immediate); },
        r => { r.immediate[0].mappings.sword = 'suxin-jian'; r.after = structuredClone(r.immediate); },
        r => { r.immediate[0].effective_int++; r.after = structuredClone(r.immediate); }]) mutate(c, change);
});

test('六门动态全局表保留原首次加载上下文，不为等级样本重新造表或暗补basic', () => {
    for (const skill of ['suxin-jian', 'quanzhen-jian', 'yinsuo-jinling', 'sanwu-shou', 'wudu-shenzhang', 'sad-strike']) {
        const c = pick(skill), r = record(c); validate(r, c);
        r.skill_load_context.already_loaded = 1; validate(r, c);
        mutate(c, x => { delete x.skill_load_context; });
        mutate(c, x => { x.skill_load_context.actor = '/tests/unrelated#1'; });
        mutate(c, x => { x.skill_load_context.skills[c.parameters.usage]++; });
        mutate(c, x => { x.skill_load_context.command = 'enable parry ' + skill; });
    }
});

test('报告从冻结condition取参数，预置熟练度不冒充正式研究增长，缺数据保持未知', () => {
    const partial = pick('yunv-jian', 200, 'partial'), p = gumuResearchEffects(rows(record(partial)), partial);
    assert.equal(p.partial_research, 1); assert.equal(p.completed_repetitions.mean, 2);
    assert.equal(p.jing_cost.mean, 60); assert.equal(p.potential_balance_delta.mean, -2);
    const refused = pick('yunv-jian', 200, 'jing26'), r = gumuResearchEffects(rows(record(refused)), refused);
    assert.equal(r.command_accepted, 1); assert.equal(r.accepted_without_growth, 1); assert.equal(r.study_progress_gain.mean, 0);
    const upgrade = pick('xuantie-jian', 199, '', true), u = gumuResearchEffects(rows(record(upgrade)), upgrade);
    assert.equal(u.skill_level_delta.mean, 1); assert.equal(u.primer_progress.mean, 4816054);
    assert.equal(u.learned_net_delta.mean, 0); assert.equal(u.study_progress_gain.n, 0); assert.equal(u.study_progress_gain.unknown, 1);
    const absent = record(partial); delete absent.metrics; delete absent.before[0].learned;
    const missing = gumuResearchEffects(rows(absent), partial);
    assert.equal(missing.jing_cost.unknown, 1); assert.equal(missing.study_progress_gain.unknown, 1);
    const unknown = gumuResearchEffects(rows(record(partial)));
    assert.equal(unknown.ability, 'unknown_ability'); assert.equal(unknown.command_accepted, null);
    assert.equal(unknown.study_progress_gain.n, 0); assert.equal(unknown.study_progress_gain.unknown, 1);
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-only', evidence_sha256: 'no-real-samples',
        totals: { conditions: 2, samples: 2, observed: 2, refused: 0, errors: 0 }, conditions: [
            { ...partial, counts: { observed: 1, refused: 0 }, gumu_research: p, effects: schoolCombatEffects(rows(record(partial))) },
            { ...upgrade, counts: { observed: 1, refused: 0 }, gumu_research: u, effects: schoolCombatEffects(rows(record(upgrade))) },
        ] });
    const heading = markdown.indexOf('## 古墓兵器与徒手研究');
    assert.ok(heading > 0); assert.ok(!markdown.slice(0, heading).includes(partial.id));
    assert.ok(markdown.includes('弱模式预置')); assert.ok(markdown.includes('4816054.00'));
});
