// Zhou's additional attacking skills, not her NPC loadout or an acquisition simulation.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const emeiJiuyinAttacks = [
    { skill: 'jiuyin-baiguzhao', usage: 'claw', ability: 'duo', minimum: 140, neili: 300 },
    { skill: 'jiuyin-baiguzhao', usage: 'claw', ability: 'zhua', minimum: 120, neili: 240 },
    { skill: 'cuixin-zhang', usage: 'strike', ability: 'cui', minimum: 120, neili: 500 },
    { skill: 'yinlong-bian', usage: 'whip', ability: 'zhu', minimum: 100, neili: 300 },
];

export function emeiJiuyinConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? d.skill : `${d.skill}/${ability}`));
        assert.ok(source, '缺少原九阴入口：' + d.skill + '/' + ability);
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry);
        const grant = `can_perform/${d.skill}${ability === 'zhua' ? '' : '/' + ability}`;
        const actor = {
            skills: { [d.usage]: level, [d.skill]: level, force: level, 'yijin-duangu': level,
                dodge: level, 'shexing-lifan': level, parry: level, 'martial-cognize': level, ...extra.skills },
            mappings: { [d.usage]: d.skill, parry: d.skill, force: 'yijin-duangu', dodge: 'shexing-lifan' },
            preparations: d.usage === 'whip' || extra.unprepared ? {} : { [d.usage]: d.skill },
            properties: { neili: 6000, max_neili: 6000, jiali: 0, str: 36, int: 36, con: 36, dex: 36,
                combat_exp: 100000000, shen: 200000, gender: '女性', 'family/family_name': '峨嵋派',
                ...(method === 'perform' ? { [grant]: 1 } : {}), ...extra.properties },
            ...(d.usage === 'whip' && !extra.noWeapon ? { equipment: { type: extra.weapon ?? 'whip', hold: false } }
                : extra.weapon ? { equipment: { type: extra.weapon, hold: false } } : {}),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.noMap) delete actor.mappings[d.usage];
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: { ...extra.targetProperties }, equipment: { type: 'sword', hold: false } };
        result.push({ id: `school-emei-jiuyin-${d.skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? (extra.wait ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-jiuyin',
                combination: `${d.skill}+yijin-duangu+shexing-lifan`, skill: d.skill, usage: d.usage, ability, level,
                actor, target, fighting: extra.fighting ?? true, action: method === 'ordinary' ? 'ordinary' : `perform ${d.usage}.${ability}`,
                observation: extra.wait ? 'timed_effect' : 'single_action_immediate', observe_seconds: extra.wait ?? 0,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    'kungfu/class/emei/zhou.c', 'kungfu/skill/yijin-duangu.c', 'kungfu/skill/shexing-lifan.c',
                    'kungfu/condition/cuixin_zhang.c', 'inherit/condition/poison.c',
                    'feature/attribute.c', 'feature/skill.c', 'feature/damage.c', 'feature/condition.c',
                    'inherit/skill/skill.c', 'inherit/skill/force.c', 'cmds/skill/perform.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；参考周芷若额外九阴技能的实验组合，技能、领悟及资源为实验赋值，不是NPC原配装或可向她学习的证明（五门额外技能均no_teach）。单备/招架按valid_enable，银龙实验持鞭；不更改NPC三条错误配招或为NPC补装备。原随机、伤害、死亡、资源与回调分别记录。催心即时样本不冒充毒伤完整生命周期。',
            } });
    }
    const ordinary = new Set();
    for (const d of emeiJiuyinAttacks) {
        for (const level of [200, 400, 800]) {
            if (!ordinary.has(d.skill)) add(d, 'ordinary', level);
            add(d, d.ability, level);
        }
        ordinary.add(d.skill);
        const check = (suffix, extra = {}) => add(d, d.ability, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        const grant = `can_perform/${d.skill}${d.ability === 'zhua' ? '' : '/' + d.ability}`;
        check('no-grant', { properties: { [grant]: 0 }, expected: 'refused' });
        check('low-skill', { skills: { [d.skill]: d.minimum - 1 }, expected: 'refused' });
        check('minimum-skill', { skills: { [d.skill]: d.minimum } });
        check('low-neili', { properties: { neili: d.neili - 1 }, expected: 'refused' });
        check('minimum-neili', { properties: { neili: d.neili } });
        check('busy', { busy: true, expected: 'refused' });
        check('no-fight', { fighting: false, expected: 'refused' });
        check('no-map', { noMap: true, expected: 'refused' });
        check('wrong-weapon', { weapon: 'sword', expected: 'refused' });
        if (d.usage === 'whip') {
            check('no-weapon', { noWeapon: true, expected: 'refused' });
            check('low-force', { skills: { force: 129 }, expected: 'refused' });
            check('minimum-force', { skills: { force: 130 } });
        } else {
            check('unprepared', { unprepared: true, expected: d.ability === 'cui' ? 'observed' : 'refused' });
            if (d.ability === 'cui') {
                check('low-force', { skills: { force: 2, 'yijin-duangu': 118 }, expected: 'refused' });
                check('minimum-force', { skills: { force: 2, 'yijin-duangu': 119 } });
                check('expiry', { targetSkills: { force: 2, parry: 2 }, wait: 11 });
            }
        }
        const defense = d.ability === 'zhua' ? ['dodge'] : d.ability === 'duo' ? ['parry', 'dodge'] : ['force', 'parry'];
        for (const [suffix, value] of [['low-defense', 2], ['high-defense', 100000]])
            check(suffix, { targetSkills: Object.fromEntries(defense.map(key => [key, value])) });
        if (d.ability === 'duo') {
            check('second-hit', { targetSkills: { parry: 100000, dodge: 2 } });
            // query_con() includes basic force / 10: keep that contribution low as well.
            check('first-hit', { targetSkills: { parry: 2, dodge: 100000, force: 2 } });
        }
        if (d.ability === 'zhua') {
            check('duo-grant-only', { properties: { [grant]: { duo: 1 } } });
            // Hit forced by source thresholds, not by replacing random(). Boundary is strict > 2*M.
            for (const [suffix, maximum] of [['twice-equal', 3000], ['twice-exceeded', 2999]])
                check(suffix, { targetSkills: { dodge: 2 }, targetProperties: { neili: maximum, max_neili: maximum } });
            for (const [suffix, maximum] of [['weak-force', 7502], ['weak-force-equal', 7500]])
                check(suffix, { targetSkills: { dodge: 2, force: 10000 },
                    targetProperties: { neili: maximum, max_neili: maximum } });
        }
    }
    return result;
}

export function validateEmeiJiuyinRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'emei-jiuyin');
    assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'attacks', 'dropped', 'terminals']) assert.ok(Array.isArray(raw[key]), key);
    const [b, bt] = raw.before, [a, t] = raw.immediate;
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings);
        assert.deepEqual(state.preparations, cfg.preparations ?? {});
        assert.equal(state.weapon, cfg.equipment?.type ?? 'none');
        assert.equal(state.busy ?? 0, cfg.busy ?? 0);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value, key);
        for (const [key, value] of Object.entries(cfg.properties)) {
            if (key.startsWith('can_perform/')) assert.deepEqual(state.jiuyin_grants[key] ?? 0, value, key);
            else if (key === 'family/family_name') assert.equal(state.cultivation[key], value);
            else assert.equal(state[key], value, key);
        }
    }
    assert.ok(raw.metrics.every(m => m && typeof m === 'object' && !Array.isArray(m)));
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.ok(Number.isSafeInteger(cost) && cost >= 0); assert.ok(Number.isSafeInteger(direct) && direct >= 0);
    assert.equal(a.neili, b.neili - cost); assert.equal(a.max_neili, b.max_neili);
    if (p.expected === 'refused') {
        assert.ok(raw.reason); assert.equal(cost, 0); assert.equal(direct, 0);
        assert.equal(raw.launches.length, 0); assert.equal(raw.attacks.length, 0);
        assert.deepEqual(t, bt); assert.equal(raw.terminals.length, 0); return;
    }
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0); assert.equal(direct, 0); assert.equal(cost, 0);
        assert.equal(raw.attacks.filter(e => e.actor === 0 && e.target === 1).length, 1); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill);
    assert.equal(raw.launches[0].argument, p.ability); assert.equal(raw.attacks.length, 0);
    assert.ok(direct === 0 || direct === 1);
    const death = raw.terminals.filter(e => e.side === 1 && e.state === 'death').length;
    if (p.ability === 'duo') {
        assert.ok(cost === 100 || cost === 250); assert.equal(a.busy, cost === 100 ? 2 : 3);
        if (cost === 100) assert.equal(direct, 1);
        if (condition.id.endsWith('-first-hit')) { assert.equal(cost, 100); assert.equal(direct, 1); }
        if (condition.id.endsWith('-second-hit')) { assert.equal(cost, 250); assert.equal(direct, 1); }
    } else if (p.ability === 'zhua') {
        assert.ok(cost === 50 || cost === 230); assert.equal(a.busy, 2);
        const hit = cost === 230;
        const rebound = hit && b.max_neili < Math.trunc(bt.max_neili * 4 / 5)
            && b.effective_skills.force < bt.effective_skills.force;
        const lethal = hit && !rebound && b.max_neili > bt.max_neili * 2;
        assert.equal(direct, Number(hit && !rebound && !lethal));
        assert.equal(death, Number(lethal)); assert.equal(t.ghost ?? 0, Number(lethal));
        // Original USER death leaves the ghost at 1, not zero HP.
        if (lethal) for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(t[key], 1);
        else if (direct) assert.ok(t.busy >= 1 && t.busy <= 3);
        if (condition.id.endsWith('-twice-exceeded')) assert.equal(death, 1);
        if (condition.id.endsWith('-twice-equal') || condition.id.endsWith('-weak-force-equal')) assert.equal(direct, 1);
        if (condition.id.endsWith('-weak-force')) { assert.ok(rebound); assert.equal(t.qi, bt.qi); }
        if (!hit || rebound) for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(t[key], bt[key]);
    } else if (p.ability === 'cui') {
        assert.equal(cost, direct ? 260 : 120); assert.equal(a.busy, direct ? 2 : 3);
        assert.equal(t.temp.cuixin ?? 0, direct);
        assert.equal((t.temp.apply?.parry ?? 0) - (bt.temp.apply?.parry ?? 0), direct ? -Math.trunc(b.skills[p.skill] / 8) : 0);
        if (p.observe_seconds) {
            assert.equal(direct, 1); assert.equal(raw.after[1].temp.cuixin ?? 0, 0);
            assert.equal(raw.after[1].temp.apply?.parry ?? 0, bt.temp.apply?.parry ?? 0);
            assert.ok(raw.elapsed >= 10, '自然回调未完整等待');
        }
    } else {
        assert.equal(p.ability, 'zhu'); assert.equal(cost, direct ? 200 : 100);
        assert.equal(a.busy, direct ? 2 : 3);
    }
    if (p.ability !== 'zhua') { assert.equal(death, 0); assert.equal(raw.dropped.length, 0); }
    if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
    if (condition.id.endsWith('-low-defense')) assert.equal(direct, 1);
}

export function emeiJiuyinEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        direct: distribution(raw.map(r => r.metrics[0].direct ?? 0)),
        neili_cost: distribution(raw.map(r => r.metrics[0].neili_cost ?? 0)),
        deaths: probability(raw.filter(r => r.terminals.some(e => e.side === 1 && e.state === 'death')).length, raw.length),
        target_loss: Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing', 'max_neili'].map(key =>
            [key, distribution(raw.map(r => r.before[1][key] - r.immediate[1][key]))])),
        parry_delta: distribution(raw.map(r => (r.immediate[1].temp.apply?.parry ?? 0) - (r.before[1].temp.apply?.parry ?? 0))),
        after_parry_delta: distribution(raw.map(r => (r.after[1].temp.apply?.parry ?? 0) - (r.before[1].temp.apply?.parry ?? 0))),
    };
}
