// Source-reviewed Gumu control skills; execution uses the shared isolated runner.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const gumuControls = [
    { skill: 'yunv-jian', usage: 'sword', ability: 'mei', minimum: 40, neili: 60, cost: 50,
        teacher: 'longnv', dodge: 'yunv-shenfa', dodgeMinimum: 60, grant: true },
    { skill: 'yinsuo-jinling', usage: 'whip', ability: 'dian', minimum: 80, neili: 150, cost: 120,
        teacher: 'longnv', dodge: 'yunv-shenfa', force: 100, grant: true },
    { skill: 'yunzhou-fufa', usage: 'whip', ability: 'feng', minimum: 60, neili: 100, cost: 80,
        teacher: 'li', dodge: 'qixing-bu', grant: false },
    { skill: 'sanwu-shou', usage: 'whip', ability: 'wei', minimum: 70, neili: 100, cost: 80,
        teacher: 'li', dodge: 'qixing-bu', grant: true },
];

export function gumuControlConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(d, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === `${d.skill}/${d.ability}`);
        const entry = source?.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry, '缺少古墓原控制入口：' + d.skill);
        const actor = {
            skills: { [d.usage]: level, [d.skill]: level, force: level, 'yunv-xinjing': level,
                parry: level, dodge: level, [d.dodge]: level, ...extra.skills },
            mappings: { [d.usage]: d.skill, parry: d.skill, force: 'yunv-xinjing', dodge: d.dodge },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, combat_exp: 10000000,
                str: 36, int: 36, con: 36, dex: 36, gender: '女性', 'family/family_name': '古墓派',
                [`can_perform/${d.skill}/${d.ability}`]: 1, ...extra.properties },
            ...(extra.noWeapon ? {} : { equipment: { type: extra.weapon ?? d.usage, hold: false } }),
            ...(extra.busy ? { busy: extra.busy } : {}),
        };
        if (extra.noMap) delete actor.mappings[d.usage];
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: { combat_exp: 10000000, ...extra.targetProperties },
            equipment: { type: 'sword', hold: false }, ...(extra.targetBusy ? { busy: extra.targetBusy } : {}) };
        result.push({ id: `school-gumu-control-${d.skill}-${d.ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method: 'perform', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-control',
                combination: `${d.skill}+yunv-xinjing+${d.dodge}`, skill: d.skill, usage: d.usage,
                ability: d.ability, level, actor, target, fighting: extra.fighting ?? true,
                observation: 'single_action_immediate', observe_seconds: 0,
                action: `perform ${d.usage}.${d.ability}`, expected: extra.expected ?? 'observed',
                not_applicable: '', qualification_sources: [source.path, `kungfu/skill/${d.skill}.c`,
                    `kungfu/class/gumu/${d.teacher}.c`, 'kungfu/class/gumu/gumu.h',
                    'kungfu/skill/yunv-xinjing.c', `kungfu/skill/${d.dodge}.c`,
                    'feature/skill.c', 'feature/equip.c', 'inherit/weapon/sword.c',
                    'inherit/weapon/whip.c', 'cmds/skill/perform.c', 'inherit/skill/skill.c'],
                qualification_note: '真实非巫师USER，参考小龙女／李莫愁已学武学，不克隆原NPC。持器、映射、领悟、等级和师承为实验初态，不等于自然养成或已通过学习资格。四招只观测原控制、费用与忙乱；风魔舞原入口没有领悟检查，不替游戏补门槛。特殊技能无专属映射时的query_skill为原始等级一半，不能用原始等级替代控制公式。',
            } });
    }
    for (const d of gumuControls) {
        for (const level of [200, 400, 800]) add(d, level);
        const check = (suffix, extra) => add(d, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        check('no-grant', { properties: { [`can_perform/${d.skill}/${d.ability}`]: 0 },
            expected: d.grant ? 'refused' : 'observed' });
        check('low-skill', { skills: { [d.skill]: d.minimum - 1 }, expected: 'refused' });
        check('minimum-skill', { skills: { [d.skill]: d.minimum } });
        check('low-neili', { properties: { neili: d.neili - 1 }, expected: 'refused' });
        check('minimum-neili', { properties: { neili: d.neili } });
        check('no-weapon', { noWeapon: true, expected: 'refused' });
        check('wrong-weapon', { weapon: d.usage === 'sword' ? 'whip' : 'sword', expected: 'refused' });
        check('busy', { busy: 2, expected: 'refused' });
        check('no-fight', { fighting: false, expected: 'refused' });
        check('no-map', { noMap: true, expected: 'refused' });
        check('target-busy', { targetBusy: 50, expected: d.ability === 'mei' ? 'observed' : 'refused' });
        if (d.force) for (const offset of [-1, 0]) check(offset ? 'low-force' : 'minimum-force', {
            skills: { force: 2, 'yunv-xinjing': d.force - 1 + offset }, expected: offset ? 'refused' : 'observed',
        });
        else check('no-force-threshold', { skills: { force: 2, 'yunv-xinjing': 1 } });
        if (d.dodgeMinimum) for (const offset of [-1, 0]) check(offset ? 'low-dodge' : 'minimum-dodge', {
            // The original test sword has apply/dodge=-1; keep that equipment effect.
            skills: { dodge: 2, [d.dodge]: d.dodgeMinimum + offset }, expected: offset ? 'refused' : 'observed',
        });
        for (const high of [false, true]) add(d, 200, { suffix: high ? '-high-defense' : '-low-defense',
            ...(d.ability === 'mei' ? { targetSkills: { dodge: high ? 100000 : 2 } }
                : { targetProperties: { combat_exp: high ? 1000000000 : 1 } }) });
    }
    return result;
}

export function validateGumuControlRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-control'); assert.equal(condition.method, 'perform');
    const d = gumuControls.find(x => x.skill === p.skill && x.ability === p.ability);
    assert.ok(d, '未经核对的古墓控制技'); assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'attacks', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    const [b, bt] = raw.before, [a, t] = raw.immediate;
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings); assert.equal(state.weapon, cfg.equipment?.type ?? 'none');
        assert.equal(state.busy ?? 0, cfg.busy ?? 0);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value, key);
        for (const key of ['neili', 'max_neili', 'jiali', 'gender', 'str', 'int', 'con', 'dex', 'combat_exp'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key], key);
    }
    for (const [key, value] of Object.entries(p.actor.skills)) {
        const expected = Math.trunc(value / 2) + (p.actor.skills[p.actor.mappings[key]] ?? 0)
            + (b.temp.apply[key] ?? 0);
        assert.equal(b.effective_skills[key], expected, '原始与有效等级不能混用：' + key);
    }
    const counter = (side, key) => {
        const value = Object.hasOwn(raw.metrics[side], key) ? raw.metrics[side][key] : 0;
        assert.ok(Number.isSafeInteger(value) && value >= 0, '无效计数：' + key);
        return value;
    };
    for (const side of [0, 1]) {
        assert.ok(raw.metrics[side] && typeof raw.metrics[side] === 'object' && !Array.isArray(raw.metrics[side]));
        for (const key of ['direct', 'qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost', 'neili_recovery'])
            assert.equal(counter(side, key), 0, key);
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'max_neili']) {
            assert.ok(Number.isFinite(raw.before[side][key]), key);
            assert.equal(raw.immediate[side][key], raw.before[side][key], key);
        }
        assert.deepEqual(raw.immediate[side].temp.apply, raw.before[side].temp.apply);
    }
    assert.equal(counter(1, 'neili_cost'), 0); assert.equal(t.neili, bt.neili);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.dropped.length, 0);
    const cost = counter(0, 'neili_cost');
    assert.equal(a.neili, b.neili - cost);
    if (p.expected === 'refused') {
        assert.equal(cost, 0); assert.equal(raw.launches.length, 0); assert.equal(a.busy, b.busy);
        assert.deepEqual(t, bt); assert.ok(typeof raw.reason === 'string' && raw.reason.length > 0);
        return;
    }
    assert.equal(cost, d.cost); assert.equal(raw.launches.length, 1);
    assert.equal(raw.launches[0].skill, d.skill); assert.equal(raw.launches[0].argument, d.ability);
    // An unset original query_busy() is JSON null, not a missing observation.
    for (const state of [b, bt, a, t]) assert.ok(Object.hasOwn(state, 'busy'));
    const targetBusy = t.busy ?? 0, actorBusy = a.busy ?? 0;
    assert.ok(Number.isSafeInteger(targetBusy) && targetBusy >= 0);
    assert.ok(Number.isSafeInteger(actorBusy) && actorBusy >= 0);
    const applied = targetBusy !== (bt.busy ?? 0);
    if (condition.id.endsWith('-high-defense')) assert.equal(applied, false);
    if (d.ability === 'mei') {
        if (condition.id.endsWith('-low-defense')) assert.equal(applied, true);
        if (applied) {
            assert.ok(targetBusy >= 2 && targetBusy <= 1 + Math.trunc(b.skills[d.skill] / 24));
            assert.ok(actorBusy === 0 || actorBusy === 1);
        } else assert.equal(actorBusy, 2);
    } else {
        assert.ok(d.ability === 'dian' ? [1, 2].includes(a.busy) : a.busy === 1);
        if (applied) {
            const effective = b.effective_skills[d.skill];
            if (d.ability === 'dian') assert.ok(t.busy >= 2 && t.busy <= Math.min(13, 1 + Math.trunc(effective / 25)));
            else assert.equal(t.busy, Math.trunc(effective / (d.ability === 'wei' ? 20 : 25)) + 2);
        }
    }
}

export function gumuControlEffects(records) {
    const rows = records.filter(r => r.outcome === 'observed').map(r => r.raw);
    const busy = state => state && Object.hasOwn(state, 'busy') ? state.busy ?? 0 : null;
    const measured = rows.filter(r => Number.isFinite(busy(r.before?.[1])) && Number.isFinite(busy(r.immediate?.[1])));
    return { samples: rows.length, unmeasured_control: rows.length - measured.length,
        control_applied: probability(measured.filter(r => busy(r.immediate[1]) !== busy(r.before[1])).length, measured.length),
        // Busy counters are original ticks, not elapsed wall-clock seconds.
        target_busy: distribution(rows.map(r => busy(r.immediate?.[1]))),
        actor_busy: distribution(rows.map(r => busy(r.immediate?.[0]))),
        neili_cost: distribution(rows.map(r => r.metrics?.[0]
            ? (Object.hasOwn(r.metrics[0], 'neili_cost') ? r.metrics[0].neili_cost : 0) : null)),
        unknown_or_unobserved: records.length - rows.length };
}
