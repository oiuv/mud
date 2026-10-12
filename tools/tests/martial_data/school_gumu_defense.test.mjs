import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { digest } from './ledger.mjs';
import { gumuDefenseProfiles, gumuDefenseFixtureRequirements, gumuDefenseConditions,
    tianluoParryCoefficient, tianluoDefenseChance, validateGumuDefenseRecord, gumuDefenseEffects,
} from './school_gumu_defense_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuDefenseConditions(catalog);
const pick = (skill, ability, level = 400, suffix = '') => {
    const c = cases.find(c => c.parameters.skill === skill && c.parameters.ability === ability
        && c.parameters.level === level && c.id.endsWith(`-l${level}${suffix ? '-' + suffix : ''}`));
    assert.ok(c, [skill, ability, level, suffix].join('/')); return c;
};
const tianluo = 'tianluo-diwang', object = '/kungfu/skill/' + tianluo;
const owner = c => ['valid_enable', 'query_dodge_msg'].includes(c.parameters.ability)
    || c.parameters.skill === tianluo && ['query_effect_parry', 'valid_damage'].includes(c.parameters.ability)
    ? '/kungfu/skill/' + c.parameters.skill : 0;

// Synthetic traces exercise the collector only; they are not driver samples.
function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, side) => ({
        qi: 10000, eff_qi: 10000, ...cfg.properties, userp: 1, interactive: 1, wizardp: 0,
        living: side === 1 && p.target_state === 'unconscious' ? 0 : 1,
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        weapon: cfg.equipment?.type ?? 'none',
        weapon_details: cfg.equipment ? { program: '/tests/' + cfg.equipment.type } : {},
        busy: cfg.busy ?? 0, temp: { apply: {} }, effective_skills: { force: Math.trunc(cfg.skills.force / 2) },
    }));
    before[1].effective_skills[p.usage] = Math.trunc(p.level / 2) + (p.target.mappings[p.usage] ? p.level : 0);
    const r = { outcome: 'observed', method: c.method, before, immediate: structuredClone(before),
        launches: [], interfaces: [], defense_messages: [], defenses: [], dodge_checks: [], attacks: [], metrics: [{}, {}] };
    if (p.ability === 'ordinary') {
        r.attacks.push({ actor: 0, target: 1, type: 0, result: -1 });
        r.dodge_checks = ['base', 'settled'].map(phase => ({ actor: 0, target: 1, type: 0, phase,
            ap: 100, dp: p.target.busy && phase === 'settled' ? 100 : 300, skill: p.target.mappings.dodge ?? 0 }));
        return r;
    }
    const i = { ...p.interface, result: null, implemented_by: owner(c) }; r.interfaces.push(i);
    if (p.ability === 'valid_enable') {
        const profile = gumuDefenseProfiles.find(x => x.skill === p.skill);
        const allowed = !profile ? [] : p.skill === tianluo && p.level <= 30 ? ['strike']
            : profile.usage === 'dodge' ? ['dodge', 'move'] : [profile.usage, 'parry'];
        i.result = Number(allowed.includes(p.interface.usage));
    } else if (p.ability === 'query_dodge_msg') i.result = '$n一式原始闪避描写。\n';
    else if (p.skill === tianluo && p.ability === 'query_effect_parry')
        i.result = tianluoParryCoefficient(p.level, before[1].weapon);
    else if (p.ability === 'valid_damage' || p.ability === 'direct') {
        const routed = p.ability === 'valid_damage' || !!p.target.mappings.parry;
        const success = routed && p.skill === tianluo && tianluoDefenseChance(...before) > 0;
        const result = success ? { damage: -1000, msg: '$n双掌化解。\n' } : null;
        if (routed) r.defenses.push({ actor: 0, target: 1, skill: p.skill, incoming: 1000,
            result, route: p.ability === 'valid_damage' ? 'interface' : 'direct' });
        if (p.ability === 'valid_damage') i.result = result;
        else {
            i.implemented_by = '/adm/daemons/combatd'; i.result = success ? 0 : 91;
            r.metrics = [{ direct: 1 }, { qi_cost: success ? 0 : 91 }];
            r.immediate[1].qi -= success ? 0 : 91;
        }
    }
    return r;
}

test('古墓15门防御与两门暗器否定声明，362条件19442计划记录，统一入口接入', () => {
    assert.equal(gumuDefenseProfiles.length, 15); assert.equal(cases.length, 362);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 19442);
    assert.equal(gumuDefenseConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 724);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(gumuDefenseFixtureRequirements.length, 4);
    for (const c of cases) {
        assert.equal(c.parameters.school, 'gumu'); assert.equal(c.parameters.expected, 'observed');
        assert.equal(c.parameters.observation_role, 'defense'); assert.equal(c.parameters.observe_seconds, 0);
        assert.deepEqual(c.parameters.actor.mappings, {});
        assert.ok(Object.keys(c.parameters.target.mappings).every(k => k === c.parameters.usage));
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        validateGumuDefenseRecord(row(c), c);
    }
    for (const path of ['school_combat_cases.mjs', 'execution.mjs'])
        assert.match(readFileSync(join(root, 'tools/tests/martial_data', path), 'utf8'), /school_gumu_defense/);
    assert.throws(() => gumuDefenseConditions({ skills: [] }));
    assert.throws(() => gumuDefenseConditions(catalog, { samples: 0 }));
});

test('追加防御不改变旧12626条件340996计划记录，低级接口不强行激发招架', () => {
    const all = schoolCombatConditions(catalog), old = all.slice(0, 12626);
    assert.equal(old.length, 12626); assert.equal(old.reduce((n, c) => n + c.samples, 0), 340996);
    assert.equal(digest(old), '2b1a26156ac49f4202b6fe449d8689fca590a4403398f9de15749b689de4500b');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-defense'), cases);
    for (const c of cases) {
        validateSchoolCombatRecord(row(c), c);
        if (c.parameters.skill === tianluo && c.parameters.level <= 30) assert.deepEqual(c.parameters.target.mappings, {});
    }
});

test('当前源码仅天罗有独立招架系数和化解，两身法只提供原闪避文案，缺接口仍缺失', () => {
    for (const { skill, usage } of gumuDefenseProfiles) {
        const source = catalog.skills.find(s => s.id === skill), names = source.entries.map(e => e.function);
        assert.equal(names.includes('query_effect_parry'), skill === tianluo);
        assert.equal(names.includes('valid_damage'), skill === tianluo);
        assert.equal(names.includes('query_dodge_msg'), usage === 'dodge');
        assert.equal(names.includes('query_effect_dodge'), false); assert.equal(names.includes('query_parry_msg'), false);
    }
    for (const path of ['inherit/skill/skill.c', 'feature/clean_up.c'])
        assert.doesNotMatch(readFileSync(join(root, path), 'utf8'), /\b(query_effect_parry|query_effect_dodge|query_parry_msg|valid_damage)\s*\(/);
    for (const skill of ['bingpo-shenzhen', 'yufeng-zhen']) {
        assert.match(readFileSync(join(root, 'kungfu/skill', skill + '.c'), 'utf8'), /return usage == "throwing";/);
        for (const c of cases.filter(c => c.parameters.skill === skill)) {
            assert.deepEqual(c.parameters.target.mappings, {}); assert.equal(row(c).interfaces[0].result, 0);
        }
    }
});

test('天罗招架声明严格超过30级且必须查询防守者，不用进攻者this_player代替', () => {
    for (const level of [30, 31]) for (const usage of ['parry', 'strike']) {
        const c = pick(tianluo, 'valid_enable', level, 'boundary-' + usage), r = row(c);
        assert.equal(r.interfaces[0].result, Number(usage === 'strike' || level === 31));
        validateGumuDefenseRecord(r, c);
        delete r.interfaces[0].player_side; assert.throws(() => validateGumuDefenseRecord(r, c));
        r.interfaces[0].player_side = 0; assert.throws(() => validateGumuDefenseRecord(r, c));
    }
});

test('天罗空手60／160／240／320系数边界，不将100系数写成必然招架', () => {
    assert.deepEqual([0, 59, 60, 159, 160, 239, 240, 319, 320, 800].map(n => tianluoParryCoefficient(n)),
        [0, 0, 40, 40, 60, 60, 80, 80, 100, 100]);
    const c = pick(tianluo, 'query_effect_parry', 400, 'armed'), r = row(c);
    assert.equal(r.interfaces[0].result, 0); validateGumuDefenseRecord(r, c);
    r.interfaces[0].result = 100; assert.throws(() => validateGumuDefenseRecord(r, c));
    const normal = pick(tianluo, 'ordinary', 800), hit = row(normal);
    hit.attacks[0].result = 0;
    hit.defenses.push({ actor: 0, target: 1, skill: tianluo, route: 'ordinary', incoming: 91,
        result: { damage: -91, msg: '化解' } });
    validateGumuDefenseRecord(hit, normal);
});

test('额外化解使用有效内功和count、严格小于；mathematics不替代，概率只约束确定端点', () => {
    const c = pick(tianluo, 'valid_damage', 200, 'count0'), r = row(c);
    assert.equal(tianluoDefenseChance(...r.before), 0.5); validateGumuDefenseRecord(r, c);
    r.defenses[0].result = null; r.interfaces[0].result = null; validateGumuDefenseRecord(r, c);
    const lower = pick(tianluo, 'valid_damage', 100, 'count0'), low = row(lower);
    assert.equal(tianluoDefenseChance(...low.before), 0); validateGumuDefenseRecord(low, lower);
    low.defenses[0].result = { damage: -1000, msg: '伪成功' }; low.interfaces[0].result = low.defenses[0].result;
    assert.throws(() => validateGumuDefenseRecord(low, lower));
    const high = pick(tianluo, 'valid_damage', 800, 'count0'), h = row(high);
    assert.equal(tianluoDefenseChance(...h.before), 1);
    h.defenses[0].result = null; h.interfaces[0].result = null; assert.throws(() => validateGumuDefenseRecord(h, high));
    const math = row(pick(tianluo, 'valid_damage', 200, 'mathematics1200'));
    const count = row(pick(tianluo, 'valid_damage', 200, 'count1200'));
    assert.equal(tianluoDefenseChance(...math.before), 0.5); assert.equal(tianluoDefenseChance(...count.before), 0);
    // Original failure may update combat display, but does not return that string.
    count.defenses[0].result = '看透虚实'; count.interfaces[0].result = '看透虚实';
    assert.throws(() => validateGumuDefenseRecord(count, pick(tianluo, 'valid_damage', 200, 'count1200')));
});

test('持器／99级／原昏迷无额外化解，忙乱和零内力不擅增限制，接口不依赖映射', () => {
    for (const [level, suffix, chance] of [[200, 'defender-armed', 0], [99, 'count0', 0],
        [400, 'unconscious', 0], [200, 'busy', 0.5], [200, 'neili0', 0.5], [200, 'unmapped', 0.5],
        [200, 'attacker-armed', 0.5], [200, 'force200', 1], [200, 'force2400', 0]]) {
        const c = pick(tianluo, 'valid_damage', level, suffix), r = row(c);
        assert.equal(tianluoDefenseChance(...r.before), chance, suffix); validateGumuDefenseRecord(r, c);
    }
});

test('公共直伤只查已映射招架且落实化解；不把返回1000抵消误记成1000掉血', () => {
    for (const skill of [tianluo, 'yunv-shenfa', 'qixing-bu', 'yunv-jian']) {
        const c = pick(skill, 'direct'), r = row(c); validateGumuDefenseRecord(r, c);
        assert.equal(r.defenses.length, c.parameters.usage === 'parry' ? 1 : 0);
        assert.equal(r.metrics[1].qi_cost, skill === tianluo ? 0 : 91);
        const bad = structuredClone(r); bad.metrics[1].qi_cost = skill === tianluo ? 91 : 0;
        assert.throws(() => validateGumuDefenseRecord(bad, c));
    }
    const c = pick(tianluo, 'direct', 200, 'unmapped'), r = row(c);
    assert.equal(r.defenses.length, 0); assert.equal(r.metrics[1].qi_cost, 91); validateGumuDefenseRecord(r, c);
    r.defenses.push({ actor: 0, target: 1, skill: tianluo, route: 'direct', incoming: 1000, result: null });
    assert.throws(() => validateGumuDefenseRecord(r, c));
});

test('普通闪避与忙乱DP、持器修正和反击保持，命中结果不保证有最终伤害', () => {
    const c = pick('yunv-shenfa', 'ordinary', 400, 'busy'), r = row(c);
    r.dodge_checks[0].dp = 302; r.dodge_checks[1].dp = 100; validateGumuDefenseRecord(r, c);
    r.dodge_checks[1].dp = 302; assert.throws(() => validateGumuDefenseRecord(r, c));
    const a = pick('qixing-bu', 'ordinary', 400, 'armed'), v = row(a);
    v.before[1].temp.apply.dodge = -1; v.before[1].effective_skills.dodge--;
    v.attacks.push({ actor: 1, target: 0, type: 1, result: 0 }); validateGumuDefenseRecord(v, a);
    v.before[1].effective_skills.dodge++; assert.throws(() => validateGumuDefenseRecord(v, a));
    const t = pick(tianluo, 'ordinary', 800), h = row(t); h.attacks[0].result = 0;
    h.defenses.push({ actor: 0, target: 1, skill: tianluo, route: 'ordinary', incoming: 91,
        result: { damage: -91, msg: '化解' } }); validateGumuDefenseRecord(h, t);
    h.attacks[0].result = -2; assert.throws(() => validateGumuDefenseRecord(h, t));
    const d = pick('yunv-shenfa', 'ordinary', 400), hit = row(d); hit.attacks[0].result = 0;
    hit.defenses.push({ actor: 0, target: 1, skill: 'yunv-shenfa', route: 'ordinary-dodge', incoming: 91, result: null });
    validateGumuDefenseRecord(hit, d);
    hit.defenses[0].route = 'ordinary'; assert.throws(() => validateGumuDefenseRecord(hit, d));
});

test('命中后到达原轻功化解接口必须留证，不能把观测器过滤造成的缺记录当未调用', () => {
    for (const skill of ['yunv-shenfa', 'qixing-bu', 'tianluo-diwang', 'meinv-quan']) {
        const c = pick(skill, 'ordinary'), r = row(c); r.attacks[0].result = 0;
        assert.throws(() => validateGumuDefenseRecord(r, c));
        r.defenses.push({ actor: 0, target: 1, skill,
            route: c.parameters.usage === 'dodge' ? 'ordinary-dodge' : 'ordinary', incoming: 91, result: null });
        validateGumuDefenseRecord(r, c);
    }
    assert.match(readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8'),
        /route == "ordinary-dodge" && member_array[\s\S]*?\(\{ "emei-shexing", "gumu-defense" \}\)/);
});

test('完整身份、资源账和接口元数据不可缺失，不把未知、额外绝招或心跳伪作有效记录', () => {
    const c = pick('meinv-quan', 'query_effect_parry');
    for (const mutate of [r => { r.before[0].wizardp = 1; }, r => { r.before[1].interactive = 0; },
        r => { r.before[1].mappings.force = 'yunv-xinjing'; }, r => { delete r.metrics[1]; },
        r => { r.metrics[1].neili_cost = null; }, r => { r.metrics[1].qi_cost = null; },
        r => { r.metrics[1].qi_cost = 1; }, r => { r.method = 'ordinary'; },
        r => { r.metrics[0].heartbeats = 1; }, r => { r.immediate[1].neili--; },
        r => { delete r.defense_messages; }, r => { r.launches.push({}); },
        r => { delete r.interfaces[0].result; }, r => { delete r.interfaces[0].implemented_by; },
        r => { r.interfaces[0].implemented_by = object; }, r => { r.interfaces[0].result = 40; }]) {
        const r = row(c); mutate(r); assert.throws(() => validateGumuDefenseRecord(r, c));
    }
});

test('统计分开普通招架／闪避与额外化解，各调用路径单独分母，缺记录不补零', () => {
    const c = pick(tianluo, 'ordinary', 800);
    const attacks = [-1, -1, -2, 0].map(result => {
        const raw = row(c); raw.attacks[0].result = result;
        raw.attacks.push({ actor: 1, target: 0, type: 1, result: 0 });
        return { outcome: 'observed', raw };
    });
    const query = row(pick(tianluo, 'valid_damage', 800, 'count0'));
    const direct = row(pick(tianluo, 'direct', 200, 'count1200'));
    const unknown = row(pick(tianluo, 'valid_damage', 800, 'count0')); delete unknown.defenses[0].result;
    const data = gumuDefenseEffects([...attacks, ...[query, direct, unknown].map(raw => ({ outcome: 'observed', raw })),
        { outcome: 'observed' }, { outcome: 'error', raw: {} }]);
    assert.equal(data.samples, 7); assert.equal(data.unknown_samples, 2); assert.equal(data.primary_attacks, 4);
    assert.equal(data.parry.rate, 0.25); assert.equal(data.parry_given_not_dodged.rate, 0.5);
    assert.equal(data.tianluo_calls, 3); assert.equal(data.tianluo_unknown, 1);
    assert.equal(data.tianluo_by_route.interface.rate, 1); assert.equal(data.tianluo_by_route.direct.rate, 0);
    assert.equal(data.tianluo_by_route.ordinary.rate, null);
    assert.equal(gumuDefenseEffects([]).parry.rate, null);
});
