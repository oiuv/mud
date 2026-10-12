// Emei weapon observations; experimental players are not copies of teaching NPCs.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const emeiWeapons = [
    { skill: 'emei-jian', usage: 'sword', moves: [{ ability: 'xian', minimum: 60, neili: 100 }] },
    { skill: 'huifeng-jian', usage: 'sword', moves: [
        { ability: 'jue', minimum: 120, neili: 500, force: 200 },
        { ability: 'mie', minimum: 120, neili: 500, force: 180 },
    ] },
    { skill: 'yanxing-dao', usage: 'blade', moves: [{ ability: 'huan', minimum: 60, neili: 80, force: 120 }] },
    { skill: 'yitian-jian', usage: 'sword', moves: [{ ability: 'fumo', minimum: 120, neili: 200 }] },
];

export function emeiWeaponConditions(catalog, { smoke = false, samples = 100 } = {}) {
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
            properties: { jiali: 0, neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
                shen: 200000, combat_exp: 100000000, gender: '女性', 'family/family_name': '峨嵋派',
                ...(method === 'perform' ? { [`can_perform/${d.skill}/${ability}`]: 1 } : {}),
                ...extra.properties },
            ...(extra.noWeapon ? {} : { equipment: { type: extra.weapon ?? d.usage, hold: false } }),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.noMap) delete actor.mappings[d.usage];
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: { shen: 0, ...extra.targetProperties }, equipment: { type: 'sword', hold: false } };
        result.push({ id: `school-emei-weapons-${d.skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-weapons',
                combination: `${d.skill}+linji-zhuang`, skill: d.skill, usage: d.usage, ability, level,
                actor, target, fighting: extra.fighting ?? true, observation: 'single_action_immediate',
                observe_seconds: 0, action: method === 'ordinary' ? 'ordinary' : `perform ${d.usage}.${ability}`,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    'kungfu/class/emei/miejue.c', 'kungfu/class/emei/emei.h',
                    'kungfu/skill/linji-zhuang.c', 'kungfu/skill/zhutian-bu.c', 'kungfu/skill/mahayana.c',
                    'feature/attribute.c', 'feature/skill.c', 'inherit/skill/force.c',
                    'inherit/skill/skill.c', 'inherit/char/char.c', 'cmds/skill/perform.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；参考灭绝已学兵器与临济/诸天组合，招架按各门允许类别实验配置，不等同原NPC当前映射。女性、等级、领悟及资源均为实验赋值，不证明师承获取或同培养成本。运行原perform、随机和公共伤害；绝剑五段分别判定，雁行至多五击，正文不代替命中证据。佛光初现的大乘修养和伏魔的目标正邪另列，正常强弱不是缺陷。',
            } });
    }
    for (const d of emeiWeapons) {
        for (const level of [200, 400, 800]) {
            add(d, 'ordinary', level);
            for (const move of d.moves) add(d, move.ability, level);
        }
        for (const move of d.moves) {
            const check = (suffix, extra = {}) => add(d, move.ability, 200, { suffix: '-' + suffix, checks: 2, ...extra });
            for (const [suffix, extra] of [
                ['no-grant', { properties: { [`can_perform/${d.skill}/${move.ability}`]: 0 } }],
                ['low-skill', { skills: { [d.skill]: move.minimum - 1 } }],
                ['low-neili', { properties: { neili: move.neili - 1 } }],
                ['no-weapon', { noWeapon: true }],
                ['wrong-weapon', { weapon: d.usage === 'sword' ? 'blade' : 'sword' }],
                ['busy', { busy: true }], ['no-fight', { fighting: false }], ['no-map', { noMap: true }],
            ]) check(suffix, { ...extra, expected: 'refused' });
            check('minimum-skill', { skills: { [d.skill]: move.minimum } });
            check('minimum-neili', { properties: { neili: move.neili } });
            if (move.force) for (const offset of [-1, 0])
                check(offset ? 'low-force' : 'minimum-force', { skills: { force: 2, 'linji-zhuang': move.force - 1 + offset },
                    expected: offset ? 'refused' : 'observed' });
            else check('no-force-threshold', { skills: { force: 2, 'linji-zhuang': 1 } });
            if (['xian', 'fumo'].includes(move.ability)) {
                check('low-defense', { targetSkills: { parry: 2 } });
                check('high-defense', { targetSkills: { parry: 100000 } });
            }
            if (move.ability === 'mie') {
                check('low-defense', { targetSkills: { force: 2 }, targetProperties: { combat_exp: 1 } });
                check('high-defense', { targetSkills: { force: 1000000 }, targetProperties: { combat_exp: 1000000000 } });
            }
            if (move.ability === 'jue') {
                check('high-defense', { targetSkills: { parry: 100000 },
                    targetProperties: { str: 100000, int: 100000, con: 100000, dex: 100000 } });
            }
            if (move.ability === 'xian') for (const mahayana of [0, 800])
                add(d, move.ability, 200, { suffix: `-mahayana${mahayana}`, skills: { mahayana } });
            if (move.ability === 'fumo') for (const level of [200, 400, 800])
                add(d, move.ability, level, { suffix: '-evil-target', targetProperties: { shen: -200000 } });
        }
    }
    return result;
}

export function validateEmeiWeaponRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'emei-weapons');
    assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'attacks', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    const [b, bt] = raw.before, [a, t] = raw.immediate;
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings);
        assert.equal(state.weapon, cfg.equipment?.type ?? 'none');
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value, key);
        for (const key of ['neili', 'max_neili', 'jiali', 'shen', 'gender', 'str', 'int', 'con', 'dex', 'combat_exp'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key], key);
    }
    assert.equal(b.busy ?? 0, p.actor.busy ?? 0);
    assert.ok(raw.metrics.every(x => x && typeof x === 'object' && !Array.isArray(x)));
    const cost = Object.hasOwn(raw.metrics[0], 'neili_cost') ? raw.metrics[0].neili_cost : 0;
    const direct = Object.hasOwn(raw.metrics[0], 'direct') ? raw.metrics[0].direct : 0;
    assert.ok(Number.isSafeInteger(cost) && cost >= 0);
    assert.ok(Number.isSafeInteger(direct) && direct >= 0);
    assert.equal(a.neili, b.neili - cost); assert.equal(a.max_neili, b.max_neili);
    assert.equal(raw.dropped.length, 0);
    const attacks = raw.attacks.filter(x => x.actor === 0 && x.target === 1);
    for (const key of ['attack', 'damage', 'dodge']) assert.equal(a.temp.apply?.[key] ?? 0, b.temp.apply?.[key] ?? 0);
    const move = emeiWeapons.find(d => d.skill === p.skill)?.moves.find(x => x.ability === p.ability);
    if (condition.method === 'perform') assert.ok(move, '未经核对的峨嵋施展');
    if (condition.id.endsWith('-minimum-force') || condition.id.endsWith('-low-force'))
        assert.equal(b.effective_skills.force, move.force - (condition.id.endsWith('-low-force') ? 1 : 0));
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0);
        assert.equal(raw.launches.length, 0); assert.equal(raw.attacks.length, 0);
        assert.ok(typeof raw.reason === 'string' && raw.reason.length > 0);
        assert.deepEqual(t, bt);
        return;
    }
    assert.equal(a.weapon, p.usage);
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0); assert.equal(direct, 0);
        assert.equal(attacks.length, 1); assert.equal(cost, 0);
        return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill);
    assert.equal(raw.launches[0].argument, p.ability);
    if (p.ability === 'huan') {
        assert.equal(cost, 80); assert.equal(direct, 0);
        assert.ok(attacks.length >= 1 && attacks.length <= 5);
        assert.ok(attacks.every(x => x.type === 0));
        assert.ok(Number.isInteger(a.busy) && a.busy >= 1 && a.busy <= 4);
        return;
    }
    assert.equal(attacks.length, 0);
    if (p.ability === 'jue') {
        assert.ok(cost >= 400 && cost <= 499); assert.ok(direct <= 5);
        assert.ok(Number.isInteger(a.busy) && a.busy >= 2 && a.busy <= 6);
    } else {
        assert.ok(direct === 0 || direct === 1);
        const mie = p.ability === 'mie';
        assert.equal(cost, mie ? (direct ? 150 : 60) : p.ability === 'xian' ? 75 : 150);
        assert.equal(a.busy, mie ? (direct ? 2 : 3) : 3);
    }
    if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
    if (condition.id.endsWith('-low-defense') && ['xian', 'fumo'].includes(p.ability)) assert.equal(direct, 1);
    for (const key of ['jing', 'eff_jing', 'neili']) assert.equal(t[key], bt[key]);
    if (!direct) for (const key of ['qi', 'eff_qi']) assert.equal(t[key], bt[key]);
}

export function emeiWeaponEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw?.before?.[1] && r.raw?.immediate?.[1]).map(r => r.raw);
    const direct = r => r.metrics?.[0] ? (Object.hasOwn(r.metrics[0], 'direct') ? r.metrics[0].direct : 0) : null;
    const measured = raw.filter(r => Number.isFinite(direct(r)));
    const delta = (r, key) => Number.isFinite(r.before[1][key]) && Number.isFinite(r.immediate[1][key])
        ? r.before[1][key] - r.immediate[1][key] : null;
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        direct_calls: distribution(raw.map(direct)),
        any_direct_call: probability(measured.filter(r => direct(r) > 0).length, measured.length),
        regular_attacks: distribution(raw.map(r => Array.isArray(r.attacks)
            ? r.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0).length : null)),
        target_loss: Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'].map(key => [key, distribution(raw.map(r => delta(r, key)))])),
    };
}
