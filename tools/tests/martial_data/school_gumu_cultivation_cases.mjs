// Independent conditions and validation; expected values are not driver observations.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';

export const gumuForces = ['suxin-jue', 'yunv-xinjing', 'surge-force'];
export const gumuCultivationSkills = [...gumuForces, 'literate', 'medical', 'taoism', 'martial-cognize'];
const knowledge = ['literate', 'medical', 'taoism'];
const reviewedForces = [...gumuForces, 'huashan-xinfa', 'xuanmen-neigong'];
const capacity = ['query_neili_limit', 'query_current_neili_limit'];
export const gumuCultivationFields = ['improve/neili', 'breakup', 'special_skill/mystery',
    'special_skill/guimai', 'special_skill/wuxing', 'class', 'family/family_name',
    'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int', 'env/no_learn'];
export const gumuCultivationFixtureRequirements = [
    'Register only after the frozen batch; run new smoke/formal series, never reuse another school result.',
    'Observe query_str/query_int as effective_str/effective_int and all configured cultivation fields before and after; reuse the existing snapshot layout and keep raw attributes separate.',
    'Dispatch valid_research(player), valid_force(argument) and learn.can_learn(player, skill) explicitly; do not let the generic interface fallback call valid_learn instead.',
    'Record function_exists ownership, including absent methods and medical.replace_program(literate); retain original notifications.',
];

export function gumuEffectiveAttribute(actor, key) {
    assert.ok(['str', 'int'].includes(key));
    const s = actor.skills, p = actor.properties;
    const bonus = key === 'str' ? Math.max(0, ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => s[k] ?? 0))
        : s.literate ?? 0;
    return p[key] + (p[`tattoo/tattoo_${key}`] ?? 0) + (p[`reborn/${key}`] ?? 0)
        + Math.trunc(bonus / 10) + (actor.temp?.[`apply/${key}`] ?? 0);
}

export function gumuCultivationCanLearn(skill, actor) {
    assert.ok(gumuCultivationSkills.includes(skill));
    const s = actor.skills, p = actor.properties;
    if (skill === 'suxin-jue') return s.force >= 10;
    if (skill === 'yunv-xinjing') return p.gender !== '无性' && s.force >= 150 && p.int >= 32 && p.max_neili >= 2000;
    if (skill === 'surge-force') return p.gender === '男性' && s.force >= 150 && gumuEffectiveAttribute(actor, 'str') >= 45;
    if (skill === 'taoism') return p.gender !== '无性' || s.taoism <= 19;
    return skill !== 'martial-cognize';
}

export function gumuForceAllows(known, candidate) {
    assert.ok(reviewedForces.includes(known), '未核对兼修定义：' + known);
    if (known === 'surge-force') return true;
    const compatible = {
        'suxin-jue': ['yunv-xinjing', 'xuanmen-neigong', 'xiantian-gong', 'quanzhen-xinfa'],
        'yunv-xinjing': ['suxin-jue', 'xuanmen-neigong', 'xiantian-gong', 'quanzhen-xinfa'],
        'xuanmen-neigong': ['quanzhen-xinfa', 'duanshi-xinfa', 'kurong-changong', 'suxin-jue', 'yunv-xinjing', 'xiantian-gong'],
        'huashan-xinfa': ['henshan-xinfa', 'zixia-shengong', 'songshan-xinfa', 'hanbing-zhenqi', 'zhenyue-jue'],
    };
    return compatible[known].includes(candidate);
}

// Public can_learn checks existing forces' permission, not the candidate's list.
export function gumuCultivationCanStudy(skill, actor) {
    assert.ok(gumuForces.includes(skill));
    if (actor.properties['env/no_learn'] === skill) return false;
    return gumuForceAllows(skill, '*') || reviewedForces.filter(k => k !== skill && actor.skills[k])
        .every(k => gumuForceAllows(k, skill));
}

export function gumuForceBonus(skill, level) {
    assert.ok(reviewedForces.includes(skill));
    const multiplier = { 'yunv-xinjing': 16, 'surge-force': 19, 'xuanmen-neigong': 8 }[skill] ?? 0;
    return Math.trunc(Math.trunc(level * level * 15 * multiplier / 100) / 200);
}

export function gumuForceCapacity(actor, current = false) {
    const s = actor.skills, p = actor.properties, base = Math.trunc(s.force / 2) * 10;
    const eligible = current ? [actor.mappings.force].filter(Boolean) : reviewedForces.filter(k => s[k]);
    let value = Math.max(base, ...eligible.map(k => base + s[k] * 10 + gumuForceBonus(k, s[k])));
    value += Math.trunc(value * (p['improve/neili'] ?? 0) / 100);
    if (p.breakup) value += Math.trunc(value * 4 / 10);
    if (p['special_skill/mystery']) value += p.con * 15;
    if (p['special_skill/guimai']) value += Math.trunc(value * 3 / 20);
    if (p.class === 'bonze' && ['大轮寺', '少林派', '峨嵋派', '血刀门'].includes(p['family/family_name'])) value += 500;
    return value;
}

export function gumuResearchBound(p) {
    assert.ok(gumuForces.includes(p.skill));
    const s = p.actor.skills, q = p.actor.properties, level = s[p.skill];
    // Only reviewed action-free forces are included. Do not assume a new force has no query_action bonus.
    const related = [s.force, ...reviewedForces.filter(k => k !== p.skill && s[k]).map(k => s[k])];
    const scale = [150, 120, 50, 40, 20, 8, 5, 2, 1];
    let n = related.sort((a, b) => b - a).slice(0, scale.length).reduce((sum, v, i) =>
        sum + Math.trunc(v * scale[i] / (level >= 500 ? 2 : 1)), 0);
    n = Math.trunc(Math.trunc(n / 15) / (100 + (p.skill === 'yunv-xinjing' ? 400 : 0)));
    n += Math.trunc(level / 50) + Math.trunc((q.int / (level >= 500 ? 6 : 12)) ** 2);
    if (q['special_skill/guimai']) n += Math.trunc(n * 30 / 100);
    if (q['special_skill/wuxing']) n += Math.trunc(n * 20 / 100);
    let amount = Math.max(0, n - 1);
    amount += Math.trunc(amount * (s['martial-cognize'] ?? 0) / 500);
    return 1 + Math.trunc(amount * 100 / (level + 100));
}

export function gumuCultivationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const rows = [], sources = [...new Set([...gumuCultivationSkills, 'force', 'unarmed', 'strike', 'huashan-xinfa', 'xuanmen-neigong'])]
        .map(k => `kungfu/skill/${k}.c`).concat(['inherit/skill/skill.c', 'inherit/skill/force.c',
            'feature/skill.c', 'feature/attribute.c', 'clone/user/user.c', 'cmds/skill/research.c', 'cmds/skill/learn.c',
            ...['li', 'lin', 'longnv', 'yang'].map(k => `kungfu/class/gumu/${k}.c`)]);
    function add(skill, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill); assert.ok(source, skill);
        const research = ability === 'research', force = gumuForces.includes(skill);
        const actor = { skills: { force: level, [skill]: level, ...extra.skills },
            mappings: force && !extra.unmapped ? { force: extra.mapping ?? skill } : {},
            properties: { jiali: 0, neili: 6000, max_neili: 6000, jing: 10000, eff_jing: 10000,
                str: 45, int: 36, con: 36, gender: '男性', combat_exp: 100000000,
                potential: 10000, learned_points: 0, 'family/family_name': '古墓派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}), ...(extra.temp ? { temp: extra.temp } : {}) };
        let expected = extra.expected ?? 'observed';
        if (ability === 'valid_learn') expected = gumuCultivationCanLearn(skill, actor) ? 'observed' : 'refused';
        if (ability === 'can_learn') expected = gumuCultivationCanStudy(skill, actor) ? 'observed' : 'refused';
        if (ability === 'valid_research' && skill === 'martial-cognize' || ability === 'practice_skill') expected = 'refused';
        if (research && (!force || !gumuCultivationCanLearn(skill, actor) || !gumuCultivationCanStudy(skill, actor))) expected = 'refused';
        const times = extra.times ?? 1;
        const object = capacity.includes(ability) ? 'player' : ability === 'can_learn' ? '/cmds/skill/learn' : '/kungfu/skill/' + skill;
        rows.push({ id: `school-gumu-cultivation-${skill}-${ability}-l${level}${extra.suffix ? '-' + extra.suffix : ''}`,
            stage: 'school', entry_id: source.path, method: research ? 'research' : 'interface',
            samples: research && expected === 'observed' ? (smoke ? 2 : samples) : (smoke ? 1 : 2),
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-cultivation', skill,
                usage: force ? 'force' : knowledge.includes(skill) ? 'knowledge' : 'martial', ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} }, action: research ? `research ${skill} ${times}` : 'test_interface',
                ...(!research ? { interface: { object, function: ability,
                    ...(ability === 'can_learn' ? { argument: skill } : ability === 'valid_force' ? { argument: extra.argument } : {}) } } : {}),
                repetitions: times, completed: research && expected === 'observed' ? extra.completed ?? times : 0,
                command_return: extra.commandReturn ?? (research && expected === 'refused' ? 0 : 1),
                clear_jing: extra.clearJing ?? false, fighting: extra.fighting ?? false,
                observation: 'single_action_immediate', observe_seconds: 0, expected, not_applicable: '',
                qualification_sources: sources,
                qualification_note: '真实非巫师USER、原技能与研究命令；资格和资源为实验赋值，不冒充自然师承。先天悟性与有效膂力、兼修方向、最大与激发容量分列；医术复用读书识字，武学修养类型为martial但拒绝学习/研究。原始接口缺失与继承分别记录，研究正返回不等于实际增长。',
            } });
    }
    for (const skill of gumuCultivationSkills) for (const level of [200, 400, 800]) {
        for (const ability of ['valid_learn', 'valid_research', 'type', 'valid_learn_level', 'difficult_level', 'research']) add(skill, ability, level);
        if (gumuForces.includes(skill) || skill === 'taoism') add(skill, 'practice_skill', level);
        if (gumuForces.includes(skill)) {
            for (const ability of ['query_neili_improve', ...capacity]) add(skill, ability, level);
            add(skill, 'research', level, { suffix: 'all-forces', skills: Object.fromEntries(gumuForces.map(k => [k, level])) });
        }
    }
    for (const skill of gumuForces) {
        for (const candidate of ['*', ...gumuForces, 'huashan-xinfa', 'xuanmen-neigong'])
            add(skill, 'valid_force', 200, { suffix: 'to-' + candidate.replace('*', 'wildcard'), argument: candidate });
        for (const known of reviewedForces.filter(k => k !== skill)) for (const ability of ['can_learn', 'research'])
            add(skill, ability, 200, { suffix: 'known-' + known, skills: { [known]: 200 } });
        for (const level of [499, 500]) add(skill, 'research', level);
        add(skill, 'research', 200, { suffix: 'neili0', properties: { neili: 0 } });
        add(skill, 'research', 200, { suffix: 'times100', times: 100 });
        add(skill, 'research', 200, { suffix: 'partial', times: 3, completed: 2, clearJing: true, properties: { jing: 60 } });
        for (const [suffix, extra] of [
            ['busy', { busy: true }], ['fighting', { fighting: true }], ['skill179', { skills: { [skill]: 179 } }],
            ['potential0', { properties: { potential: 0 } }], ['exp799999', { properties: { combat_exp: 799999 }, commandReturn: 1 }],
            ['jing26', { properties: { jing: 26 }, commandReturn: 1, clearJing: true }],
            ['eff-jing26', { properties: { jing: 26, eff_jing: 26 } }], ['no-learn', { properties: { 'env/no_learn': skill } }],
        ]) add(skill, 'research', 200, { suffix, expected: 'refused', ...extra });
        for (const [suffix, properties] of [['guimai', { 'special_skill/guimai': 1 }], ['wuxing', { 'special_skill/wuxing': 1 }],
            ['both', { 'special_skill/guimai': 1, 'special_skill/wuxing': 1 }]]) add(skill, 'research', 200, { suffix, properties });
        add(skill, 'research', 200, { suffix: 'cognize500', skills: { 'martial-cognize': 500 } });
        for (const ability of ['valid_learn', 'research']) {
            for (const force of skill === 'suxin-jue' ? [9, 10] : [149, 150]) add(skill, ability, 200, { suffix: 'force' + force, skills: { force } });
            for (const [suffix, gender] of [['female', '女性'], ['eunuch', '无性']]) add(skill, ability, 200, { suffix, properties: { gender } });
        }
    }
    for (const ability of ['valid_learn', 'research']) {
        for (const int of [31, 32]) add('yunv-xinjing', ability, 200, { suffix: 'int' + int, properties: { int } });
        add('yunv-xinjing', ability, 200, { suffix: 'raw-int31-effective-high', skills: { literate: 500 },
            properties: { int: 31, 'tattoo/tattoo_int': 1, 'reborn/int': 1 }, temp: { 'apply/int': 1 } });
        for (const max_neili of [1999, 2000]) add('yunv-xinjing', ability, 200, { suffix: 'maxneili' + max_neili, properties: { max_neili, neili: max_neili } });
        for (const str of [44, 45]) add('surge-force', ability, 200, { suffix: 'str' + str, properties: { str } });
        for (const unarmed of [89, 90]) add('surge-force', ability, 200, { suffix: 'unarmed' + unarmed, properties: { str: 36 }, skills: { unarmed } });
        add('surge-force', ability, 200, { suffix: 'max-not-sum', properties: { str: 36 }, skills: { unarmed: 80, strike: 80 } });
        add('surge-force', ability, 200, { suffix: 'tattoo-reborn-temp', properties: { str: 36, 'tattoo/tattoo_str': 2, 'reborn/str': 3 }, temp: { 'apply/str': 4 } });
    }
    for (const level of [19, 20]) add('taoism', 'valid_learn', level, { suffix: 'eunuch', properties: { gender: '无性' } });
    for (const ability of capacity) {
        for (const mapping of [...gumuForces, 'unmapped']) add('suxin-jue', ability, 400, {
            suffix: 'all-' + mapping, mapping, unmapped: mapping === 'unmapped', skills: Object.fromEntries(gumuForces.map(k => [k, 400])) });
        for (const [suffix, properties] of [['improve10', { 'improve/neili': 10 }], ['breakup', { breakup: 1 }],
            ['mystery', { 'special_skill/mystery': 1 }], ['guimai', { 'special_skill/guimai': 1 }],
            ['bonze-gumu', { class: 'bonze' }], ['bonze-emei', { class: 'bonze', 'family/family_name': '峨嵋派' }],
            ['combined', { 'improve/neili': 10, breakup: 1, 'special_skill/mystery': 1, 'special_skill/guimai': 1 }]])
            add('surge-force', ability, 400, { suffix, properties });
        add('suxin-jue', ability, 201);
        add('yunv-xinjing', ability, 200, { suffix: 'unqualified-still-query', properties: { int: 1, gender: '无性', neili: 0, max_neili: 0 } });
    }
    return rows;
}

export function gumuCultivationInterface(p) {
    const s = p.skill, a = p.actor;
    switch (p.ability) {
    case 'valid_learn': return Number(gumuCultivationCanLearn(s, a));
    case 'valid_research': return Number(s !== 'martial-cognize');
    case 'can_learn': return Number(gumuCultivationCanStudy(s, a));
    case 'valid_force': return Number(gumuForceAllows(s, p.interface.argument));
    case 'type': return knowledge.includes(s) ? 'knowledge' : 'martial';
    case 'valid_learn_level': return knowledge.includes(s) ? 999 : 200;
    case 'difficult_level': return s === 'yunv-xinjing' ? 400 : 0;
    case 'practice_skill': return 0;
    case 'query_neili_improve': return gumuForceBonus(s, a.skills[s]);
    default: assert.ok(capacity.includes(p.ability)); return gumuForceCapacity(a, p.ability === 'query_current_neili_limit');
    }
}

export function gumuCultivationOwner(p) {
    const f = p.ability, s = p.skill;
    if (capacity.includes(f)) return '/clone/user/user';
    if (f === 'can_learn') return '/cmds/skill/learn';
    if (f === 'valid_learn_level' || f === 'valid_research' && s !== 'martial-cognize'
        || f === 'type' && !knowledge.includes(s)) return '/inherit/skill/skill';
    if (f === 'difficult_level' && s !== 'yunv-xinjing' || f === 'query_neili_improve' && s === 'suxin-jue') return null;
    return '/kungfu/skill/' + (s === 'medical' ? 'literate' : s);
}

export function validateGumuCultivationRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-cultivation');
    for (const k of ['before', 'immediate', 'metrics']) assert.equal(raw[k]?.length, 2);
    for (const k of ['attacks', 'launches', 'interfaces']) assert.ok(Array.isArray(raw[k]));
    const [before, target] = raw.before, [after, finalTarget] = raw.immediate;
    assert.equal(raw.outcome, p.expected); assert.equal(before.weapon, 'none');
    assert.equal(raw.attacks.length, 0); assert.equal(raw.launches.length, 0);
    assert.equal(before.userp, 1); assert.equal(before.interactive, 1); assert.equal(before.wizardp, 0);
    assert.ok(Object.hasOwn(before, 'busy')); assert.equal(before.busy ?? 0, p.actor.busy ?? 0);
    assert.deepEqual(before.skills, p.actor.skills); assert.deepEqual(before.mappings, p.actor.mappings);
    for (const [k, value] of Object.entries(p.actor.properties).filter(([k]) => !gumuCultivationFields.includes(k))) assert.equal(before[k], value, k);
    for (const k of gumuCultivationFields) {
        assert.ok(Object.hasOwn(before.cultivation, k), '缺少原字段：' + k);
        assert.equal(before.cultivation[k] ?? 0, p.actor.properties[k] ?? 0, k);
    }
    for (const k of ['str', 'int']) {
        assert.equal(before['effective_' + k], gumuEffectiveAttribute(p.actor, k));
        assert.equal(after['effective_' + k], before['effective_' + k]);
    }
    assert.deepEqual(after.cultivation, before.cultivation); assert.deepEqual(finalTarget, target);
    assert.deepEqual(after.skills, before.skills, '不跨级样本'); assert.deepEqual(after.mappings, before.mappings);
    for (const k of ['qi', 'eff_qi', 'neili', 'max_neili', 'potential', 'eff_jing', 'str', 'int', 'con']) assert.equal(after[k], before[k]);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1); const i = raw.interfaces[0];
        for (const [k, v] of Object.entries(p.interface)) assert.equal(i[k], v);
        assert.ok(Object.hasOwn(i, 'result'));
        // FluffOS serializes an absent lfun's undefined zero as null; retain the
        // explicit result and ownership fields so missing evidence still fails.
        assert.equal(i.result === null ? 0 : i.result, gumuCultivationInterface(p));
        assert.ok(Object.hasOwn(i, 'implemented_by')); assert.equal(i.implemented_by || null, gumuCultivationOwner(p));
        const a = structuredClone(after), b = structuredClone(before);
        delete a.temp.notify_fail; delete b.temp.notify_fail; assert.deepEqual(a, b);
    } else {
        assert.equal(condition.method, 'research'); assert.equal(raw.interfaces.length, 0);
        assert.equal(raw.command_accepted, p.command_return);
        assert.equal(after.learned_points - before.learned_points, p.completed);
        assert.equal(after.jing, p.clear_jing ? 0 : before.jing - p.completed * Math.trunc(1000 / before.int));
        const gain = (after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0);
        if (p.completed) assert.ok(gain >= p.completed && gain <= p.completed * gumuResearchBound(p));
        else assert.equal(gain, 0);
        for (const k of new Set([...Object.keys(before.learned), ...Object.keys(after.learned)]))
            if (k !== p.skill) assert.equal(after.learned[k] ?? 0, before.learned[k] ?? 0);
    }
    if (p.expected === 'refused') assert.ok(raw.reason);
}

export function gumuCultivationEffects(rows, condition) {
    const research = rows.filter(r => r.method === 'research');
    const delta = (r, k) => Number.isFinite(r.before?.[0]?.[k]) && Number.isFinite(r.immediate?.[0]?.[k])
        ? r.immediate[0][k] - r.before[0][k] : null;
    return { research_samples: research.length, accepted: research.filter(r => r.command_accepted === 1).length,
        progressed: research.filter(r => delta(r, 'learned_points') > 0).length,
        completed_repetitions: distribution(research.map(r => delta(r, 'learned_points'))),
        jing_delta: distribution(research.map(r => delta(r, 'jing'))),
        // Missing snapshots are unknown, not free successful research.
        learned_gain: distribution(research.map(r => {
            const a = r.before?.[0]?.learned, b = r.immediate?.[0]?.learned;
            const skill = condition?.parameters?.skill ?? r.parameters?.skill;
            return a && b && skill ? (b[skill] ?? 0) - (a[skill] ?? 0) : null;
        })) };
}
