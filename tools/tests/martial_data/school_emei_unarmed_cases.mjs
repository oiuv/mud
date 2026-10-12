// Original Emei hand/strike/finger actions. Full powerup -> zhao stays a separate pending sequence.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';

export const emeiUnarmed = [
    { skill: 'jieshou-jiushi', usage: 'hand', ability: 'jie', minimum: 100, neili: 200, maxNeili: 800, defense: 'parry' },
    { skill: 'jinding-zhang', usage: 'strike', ability: 'bashi', minimum: 100, neili: 200, force: 100, defense: 'force' },
    { skill: 'piaoxue-zhang', usage: 'strike', ability: 'yun', minimum: 150, neili: 200, maxNeili: 2000, force: 200 },
    { skill: 'sixiang-zhang', usage: 'strike', ability: 'xing', minimum: 60, neili: 200, defense: 'parry' },
    { skill: 'tiangang-zhi', usage: 'finger', ability: 'ling', minimum: 100, neili: 100, force: 150, defense: 'dodge' },
];

export function emeiUnarmedConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const id = method === 'ordinary' ? d.skill : `${d.skill}/${ability}`;
        const source = catalog.skills.find(s => s.id === id);
        assert.ok(source, '缺少峨嵋原武学：' + id);
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry, '缺少峨嵋原入口：' + id);
        const actor = {
            skills: { [d.usage]: level, [d.skill]: level, force: level, 'linji-zhuang': level,
                parry: level, dodge: level, 'zhutian-bu': level, mahayana: level,
                buddhism: level, 'martial-cognize': level, ...extra.skills },
            mappings: { [d.usage]: d.skill, parry: d.skill, force: 'linji-zhuang', dodge: 'zhutian-bu' },
            preparations: extra.unprepared ? {} : { [d.usage]: d.skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
                shen: 200000, combat_exp: 100000000, gender: '女性', 'family/family_name': '峨嵋派',
                ...(method === 'perform' ? { [`can_perform/${d.skill}/${ability}`]: 1 } : {}),
                ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.noMap) delete actor.mappings[d.usage];
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: {}, equipment: { type: 'sword', hold: false },
            ...(extra.targetBusy ? { busy: 3 } : {}) };
        result.push({ id: `school-emei-unarmed-${d.skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-unarmed',
                combination: `${d.skill}+linji-zhuang`, skill: d.skill, usage: d.usage, ability, level,
                actor, target, fighting: extra.fighting ?? true, observation: 'single_action_immediate',
                observe_seconds: 0, action: method === 'ordinary' ? 'ordinary' : `perform ${d.usage}.${ability}`,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    'kungfu/class/emei/miejue.c', 'kungfu/class/emei/emei.h',
                    'kungfu/skill/linji-zhuang.c', 'kungfu/skill/zhutian-bu.c', 'kungfu/skill/mahayana.c',
                    'feature/attribute.c', 'feature/skill.c', 'feature/damage.c',
                    'inherit/skill/force.c', 'inherit/skill/skill.c', 'cmds/skill/perform.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；参考峨嵋教师已学技能与临济/诸天，单备和招架为有类别依据的实验配置，不复制NPC专属属性。女性、等级、领悟及资源仅实验赋值，不证明师承获得或同培养成本。运行原perform与随机；直接伤害、创伤、精神、控制和普通连击分别记账。凌空指穴未要求空手或准备，保留原行为，不人为加门槛。'
                    + (ability === 'zhao' ? '佛光普照本组仅采未强化的拒绝，未预写powerup；原运功后施展及九阳目标分支仍待独立采集。' : ''),
            } });
    }
    for (const d of emeiUnarmed) {
        for (const level of [200, 400, 800]) for (const ability of ['ordinary', d.ability]) add(d, ability, level);
        const check = (suffix, extra = {}) => add(d, d.ability, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        for (const [suffix, extra] of [
            ['no-grant', { properties: { [`can_perform/${d.skill}/${d.ability}`]: 0 } }],
            ['low-skill', { skills: { [d.skill]: d.minimum - 1 } }],
            ['low-neili', { properties: { neili: d.neili - 1 } }],
            ['busy', { busy: true }], ['no-fight', { fighting: false }], ['no-map', { noMap: true }],
        ]) check(suffix, { ...extra, expected: 'refused' });
        check('weapon', { weapon: true, expected: d.ability === 'ling' ? 'observed' : 'refused' });
        check('unprepared', { unprepared: true, expected: d.ability === 'ling' ? 'observed' : 'refused' });
        check('minimum-skill', { skills: { [d.skill]: d.minimum } });
        check('minimum-neili', { properties: { neili: d.neili } });
        if (d.force) for (const offset of [-1, 0])
            check(offset ? 'low-force' : 'minimum-force', { skills: { force: 2, 'linji-zhuang': d.force - 1 + offset },
                expected: offset ? 'refused' : 'observed' });
        else check('no-force-threshold', { skills: { force: 2, 'linji-zhuang': 1 } });
        if (d.maxNeili) for (const offset of [-1, 0])
            check(offset ? 'low-max-neili' : 'minimum-max-neili', { properties: {
                neili: d.maxNeili + offset, max_neili: d.maxNeili + offset },
                expected: offset ? 'refused' : 'observed' });
        if (d.defense) {
            check('low-defense', { targetSkills: { [d.defense]: 2 } });
            check('high-defense', { targetSkills: { [d.defense]: 100000 } });
        }
        if (['xing', 'ling'].includes(d.ability)) check('target-busy', {
            targetBusy: true, expected: d.ability === 'ling' ? 'refused' : 'observed' });
        if (d.skill === 'piaoxue-zhang') for (const level of [200, 400, 800]) add(d, 'zhao', level,
            { suffix: '-no-powerup', checks: 2, expected: 'refused' });
    }
    return result;
}

export function validateEmeiUnarmedRecord(raw, condition) {
    const p = condition.parameters, d = emeiUnarmed.find(x => x.skill === p.skill);
    assert.equal(p.collection_group, 'emei-unarmed'); assert.ok(d);
    assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'attacks', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    const [b, bt] = raw.before, [a, t] = raw.immediate;
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings);
        assert.deepEqual(state.preparations, cfg.preparations ?? {});
        assert.equal(state.weapon, cfg.equipment?.type ?? 'none');
        assert.equal(state.busy ?? 0, cfg.busy ?? 0);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value, key);
        for (const key of ['neili', 'max_neili', 'jiali', 'shen', 'gender', 'str', 'int', 'con', 'dex', 'combat_exp'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key], key);
    }
    assert.ok(raw.metrics.every(x => x && typeof x === 'object' && !Array.isArray(x)));
    const metric = (side, key) => Object.hasOwn(raw.metrics[side], key) ? raw.metrics[side][key] : 0;
    const cost = metric(0, 'neili_cost'), direct = metric(0, 'direct');
    assert.ok(Number.isSafeInteger(cost) && cost >= 0); assert.ok(Number.isSafeInteger(direct) && direct >= 0);
    assert.equal(a.neili, b.neili - cost); assert.equal(a.max_neili, b.max_neili);
    assert.equal(raw.dropped.length, 0);
    for (const key of ['attack', 'damage', 'dodge']) assert.equal(a.temp.apply?.[key] ?? 0, b.temp.apply?.[key] ?? 0);
    if (condition.id.endsWith('-minimum-force') || condition.id.endsWith('-low-force'))
        assert.equal(b.effective_skills.force, d.force - (condition.id.endsWith('-low-force') ? 1 : 0));
    if (p.ability === 'zhao') {
        assert.equal(p.expected, 'refused'); assert.ok(!b.temp.powerup);
        assert.ok(b.skills['piaoxue-zhang'] >= 180 && b.effective_skills.force >= 300);
        assert.ok(b.neili >= 1000 && b.max_neili >= 3500);
        assert.equal(b.weapon, 'none'); assert.equal(b.mappings.strike, 'piaoxue-zhang');
        assert.equal(b.preparations.strike, 'piaoxue-zhang');
        assert.match(raw.reason, /全身功力/);
    }
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0);
        assert.equal(raw.launches.length, 0); assert.equal(raw.attacks.length, 0);
        assert.ok(typeof raw.reason === 'string' && raw.reason.length > 0);
        assert.deepEqual(t, bt);
        return;
    }
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    assert.equal(a.weapon, b.weapon);
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0); assert.equal(direct, 0);
        assert.equal(attacks.length, 1); assert.equal(cost, 0); return;
    }
    assert.equal(p.ability, d.ability);
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill);
    assert.equal(raw.launches[0].argument, p.ability);
    assert.equal(t.neili, bt.neili);
    if (p.ability === 'yun') {
        assert.equal(cost, 100); assert.equal(direct, 0); assert.equal(attacks.length, 3);
        assert.ok(attacks.every(x => x.type === 0));
        assert.ok(Number.isInteger(a.busy) && a.busy >= 2 && a.busy <= 4);
        return;
    }
    assert.equal(attacks.length, 0);
    if (p.ability === 'ling') {
        assert.equal(direct, 0);
        const control = Number(t.busy > 0);
        assert.equal(cost, control ? 100 : 30); assert.equal(a.busy ?? 0, control ? 0 : 3);
        assert.equal(t.busy ?? 0, control ? Math.trunc(b.skills[p.skill] / 22) + 2 : 0);
        if (condition.id.endsWith('-low-defense')) assert.equal(control, 1);
        if (condition.id.endsWith('-high-defense')) assert.equal(control, 0);
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(t[key], bt[key]);
        return;
    }
    assert.ok(direct === 0 || direct === 1);
    if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
    if (condition.id.endsWith('-low-defense') && p.ability !== 'bashi') assert.equal(direct, 1);
    const costs = { jie: [100, 200], bashi: [0, 100], xing: [50, 80] }[p.ability];
    assert.equal(cost, costs[direct]);
    assert.equal(a.busy, p.ability === 'jie' ? (direct ? 3 : 4) : (direct ? 2 : 3));
    if (p.ability === 'jie' && direct) {
        const damage = metric(1, 'jing_cost');
        assert.ok(Number.isSafeInteger(damage));
        assert.ok(damage >= Math.trunc(b.skills[p.skill] / 2)
            && damage < Math.trunc(b.skills[p.skill] / 2) + Math.trunc(b.skills[p.skill] / 3));
        assert.equal(metric(1, 'eff_jing_cost'), damage);
        assert.equal(bt.jing - t.jing, damage); assert.equal(bt.eff_jing - t.eff_jing, damage);
        assert.ok(metric(1, 'qi_cost') >= Math.trunc(damage * 3 / 2));
        assert.ok(metric(1, 'eff_qi_cost') >= Math.trunc(damage * 3 / 2));
        assert.equal(t.busy, 1);
    } else for (const key of ['jing', 'eff_jing']) assert.equal(t[key], bt[key]);
    if (p.ability === 'xing') {
        if (bt.busy) assert.equal(t.busy, bt.busy);
        else assert.ok((t.busy ?? 0) === 0 || direct && t.busy === Math.trunc(b.effective_skills.strike / 60) + 1);
    }
    if (!direct) for (const key of ['qi', 'eff_qi']) assert.equal(t[key], bt[key]);
}

export function emeiUnarmedEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw?.before?.[1] && r.raw?.immediate?.[1]).map(r => r.raw);
    const metric = (r, key) => r.metrics?.[0] ? (Object.hasOwn(r.metrics[0], key) ? r.metrics[0][key] : 0) : null;
    // LPC is_busy() undefined is encoded as null when idle; absent/invalid observations stay unknown.
    const busy = state => state.busy === null ? 0 : Number.isFinite(state.busy) ? state.busy : null;
    const delta = (r, key) => Number.isFinite(r.before[1][key]) && Number.isFinite(r.immediate[1][key])
        ? r.before[1][key] - r.immediate[1][key] : null;
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        direct_calls: distribution(raw.map(r => metric(r, 'direct'))),
        regular_attacks: distribution(raw.map(r => Array.isArray(r.attacks)
            ? r.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0).length : null)),
        target_busy_before: distribution(raw.map(r => busy(r.before[1]))),
        target_busy_after: distribution(raw.map(r => busy(r.immediate[1]))),
        target_loss: Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'].map(key => [key, distribution(raw.map(r => delta(r, key)))])),
    };
}
