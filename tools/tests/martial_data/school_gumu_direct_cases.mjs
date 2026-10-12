// Source-reviewed Gumu direct damage and disarming; shared isolated execution.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const gumuDirectMoves = [
    { skill: 'suxin-jian', usage: 'sword', ability: 'he', minimum: 80, force: 120, neili: 400, grant: false },
    { skill: 'yinsuo-jinling', usage: 'whip', ability: 'feng', minimum: 140, force: 200, neili: 400, grant: true },
    { skill: 'yinsuo-jinling', usage: 'whip', ability: 'kai', minimum: 140, force: 180, neili: 300, grant: true },
    { skill: 'sanwu-shou', usage: 'whip', ability: 'kong', minimum: 140, force: 180, neili: 300, grant: true },
];

export function gumuDirectConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(d, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === `${d.skill}/${d.ability}`);
        const entry = source?.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry, '缺少古墓原伤害入口：' + d.skill + '/' + d.ability);
        const dodge = d.skill === 'sanwu-shou' ? 'qixing-bu' : 'yunv-shenfa';
        const actor = {
            skills: { [d.usage]: level, [d.skill]: level, force: level, 'yunv-xinjing': level,
                parry: level, dodge: level, [dodge]: level,
                ...(d.ability === 'he' ? { 'quanzhen-jian': level, 'yunv-jian': level } : {}), ...extra.skills },
            mappings: { [d.usage]: d.skill, parry: d.skill, force: 'yunv-xinjing', dodge },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, combat_exp: 10000000,
                str: 36, int: 36, con: 36, dex: 36, gender: '女性', 'family/family_name': '古墓派',
                [`can_perform/${d.skill}/${d.ability}`]: 1, ...extra.properties },
            ...(extra.noWeapon ? {} : { equipment: { type: extra.weapon ?? d.usage, hold: false } }),
            ...(extra.busy ? { busy: extra.busy } : {}),
        };
        if (extra.noMap) delete actor.mappings[d.usage];
        const target = {
            skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills }, mappings: {},
            properties: { combat_exp: 10000000, gender: '女性', shen: 0, ...extra.targetProperties },
            ...(extra.targetUnarmed ? {} : { equipment: { type: 'sword', hold: false } }),
            ...(extra.targetBusy ? { busy: extra.targetBusy } : {}),
        };
        result.push({ id: `school-gumu-direct-${d.skill}-${d.ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method: 'perform', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-direct',
                combination: `${d.skill}+yunv-xinjing+${dodge}`, skill: d.skill, usage: d.usage,
                ability: d.ability, level, actor, target, fighting: extra.fighting ?? true,
                observation: 'single_action_immediate', observe_seconds: 0,
                action: `perform ${d.usage}.${d.ability}`, expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    `kungfu/class/gumu/${d.skill === 'sanwu-shou' ? 'li' : 'longnv'}.c`,
                    'kungfu/class/gumu/gumu.h', 'kungfu/skill/yunv-xinjing.c', `kungfu/skill/${dodge}.c`,
                    ...(d.ability === 'he' ? ['kungfu/skill/quanzhen-jian.c', 'kungfu/skill/yunv-jian.c'] : []),
                    ...(extra.skills ? Object.keys(extra.skills).map(s => `kungfu/skill/${s}.c`) : []),
                    'feature/skill.c', 'feature/attribute.c', 'feature/damage.c', 'feature/equip.c',
                    'inherit/weapon/sword.c', 'inherit/weapon/whip.c',
                    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；参考古墓已学组合，师承、等级、领悟为实验赋值，不证明自然可得。双剑合璧不查领悟或第二把实体剑，失败不扣内力；风神诀两段伤害与缴械分开；无孔不入按目标性别及正邪独立对照。加力0、普通演武兵器，无心经口诀预置；直伤调用不等于伤害数值或普通命中。沿原随机，不改游戏。',
            } });
    }
    for (const d of gumuDirectMoves) {
        for (const level of [200, 400, 800]) add(d, level);
        const check = (suffix, extra = {}) => add(d, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        check('no-grant', { properties: { [`can_perform/${d.skill}/${d.ability}`]: 0 },
            expected: d.grant ? 'refused' : 'observed' });
        for (const offset of [-1, 0]) {
            const label = offset ? 'low' : 'minimum', expected = offset ? 'refused' : 'observed';
            check(label + '-skill', { skills: { [d.skill]: d.minimum + offset }, expected });
            check(label + '-neili', { properties: { neili: d.neili + offset }, expected });
            check(label + '-force', { skills: { force: 2, 'yunv-xinjing': d.force - 1 + offset }, expected });
        }
        check('no-weapon', { noWeapon: true, expected: 'refused' });
        check('wrong-weapon', { weapon: d.usage === 'sword' ? 'whip' : 'sword', expected: 'refused' });
        check('busy', { busy: 2, expected: 'refused' });
        check('no-fight', { fighting: false, expected: 'refused' });
        check('no-map', { noMap: true, expected: 'refused' });
        check('target-busy', { targetBusy: 50 });
        for (const high of [false, true]) add(d, 200, { suffix: high ? '-high-defense' : '-low-defense',
            targetSkills: Object.fromEntries(['force', 'parry', 'dodge'].map(k => [k, high ? 100000 : 2])) });
        if (d.ability === 'he') {
            for (const offset of [-1, 0]) check(offset ? 'low-quanzhen' : 'minimum-quanzhen', {
                skills: { 'quanzhen-jian': 50 + offset }, expected: offset ? 'refused' : 'observed' });
            for (const yunv of [0, 800]) add(d, 200, { suffix: '-yunv' + yunv, skills: { 'yunv-jian': yunv } });
        }
        if (d.ability === 'feng') {
            add(d, 200, { suffix: '-target-unarmed', targetUnarmed: true });
            for (const field of ['parry', 'dodge', 'force']) for (const high of [false, true])
                add(d, 200, { suffix: `-${high ? 'high' : 'low'}-target-${field}`,
                    targetSkills: { [field]: high ? 100000 : 2 } });
            add(d, 200, { suffix: '-additional-whips', skills: { 'sanwu-shou': 200, 'yunzhou-fufa': 200 } });
        }
        if (d.ability === 'kong') for (const level of [200, 400, 800])
            for (const [gender, shen, suffix] of [['女性', 200000, 'righteous-female'],
                ['男性', 0, 'neutral-male'], ['男性', 200000, 'righteous-male']])
                add(d, level, { suffix: '-' + suffix, targetProperties: { gender, shen } });
    }
    return result;
}

export function validateGumuDirectRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-direct'); assert.equal(condition.method, 'perform');
    const d = gumuDirectMoves.find(x => x.skill === p.skill && x.ability === p.ability);
    assert.ok(d, '未经核对的古墓伤害入口'); assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'attacks', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    assert.ok(raw.metrics.every(x => x && typeof x === 'object' && !Array.isArray(x)));
    const [b, bt] = raw.before, [a, t] = raw.immediate;
    for (const state of [b, bt, a, t]) {
        assert.ok(Object.hasOwn(state, 'busy'), '缺少忙乱观察');
        assert.ok(Number.isSafeInteger(state.busy ?? 0) && (state.busy ?? 0) >= 0);
    }
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings); assert.equal(state.weapon, cfg.equipment?.type ?? 'none');
        assert.equal(state.busy ?? 0, cfg.busy ?? 0);
        for (const [key, value] of Object.entries(cfg.skills)) {
            assert.equal(state.skills[key] ?? 0, value, key);
            assert.equal(state.effective_skills[key], Math.trunc(value / 2)
                + (cfg.skills[cfg.mappings[key]] ?? 0) + (state.temp.apply[key] ?? 0), '有效等级：' + key);
        }
        for (const key of ['neili', 'max_neili', 'jiali', 'gender', 'shen', 'str', 'int', 'con', 'dex', 'combat_exp'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key], key);
    }
    const counter = (side, key) => {
        const value = Object.hasOwn(raw.metrics[side], key) ? raw.metrics[side][key] : 0;
        assert.ok(Number.isSafeInteger(value) && value >= 0, '无效计数：' + key); return value;
    };
    assert.equal(raw.attacks.length, 0, '原直伤不伪造成普通攻击');
    const cost = counter(0, 'neili_cost'), direct = counter(0, 'direct');
    assert.equal(a.neili, b.neili - cost); assert.equal(a.weapon, b.weapon);
    assert.deepEqual(a.temp.apply, b.temp.apply);
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'max_neili']) {
        assert.ok(Number.isFinite(b[key])); assert.equal(a[key], b[key]);
    }
    for (const side of [0, 1]) for (const key of ['jing_cost', 'eff_jing_cost', 'neili_recovery'])
        assert.equal(counter(side, key), 0);
    for (const key of ['qi_cost', 'eff_qi_cost']) assert.equal(counter(0, key), 0);
    assert.equal(counter(1, 'direct'), 0); assert.equal(counter(1, 'neili_cost'), 0);
    for (const key of ['jing', 'eff_jing', 'neili', 'max_neili']) {
        assert.ok(Number.isFinite(bt[key])); assert.equal(t[key], bt[key]);
    }
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(raw.launches.length, 0);
        for (const key of ['qi_cost', 'eff_qi_cost']) assert.equal(counter(1, key), 0);
        assert.equal(raw.dropped.length, 0); assert.equal(a.busy, b.busy); assert.deepEqual(t, bt);
        assert.ok(typeof raw.reason === 'string' && raw.reason.length > 0); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, d.skill);
    assert.equal(raw.launches[0].argument, d.ability);
    assert.ok(Number.isSafeInteger(a.busy));
    if (d.ability === 'feng') {
        assert.ok(direct <= 2);
        const held = bt.weapon !== 'none', disarmed = held && t.weapon === 'none';
        assert.equal(t.weapon, disarmed ? 'none' : bt.weapon);
        assert.equal(raw.dropped.length, disarmed ? 1 : 0);
        if (disarmed) {
            assert.equal(raw.dropped[0].type, bt.weapon);
            assert.equal(raw.dropped[0].object, bt.weapon_details.object);
        }
        assert.equal(cost, !held ? 300 : disarmed ? 350 : 330);
        assert.ok(a.busy >= 2 && a.busy <= 5);
        if (condition.id.endsWith('-low-defense')) { assert.equal(direct, 2); assert.ok(disarmed); }
        if (condition.id.endsWith('-high-defense')) { assert.equal(direct, 0); assert.ok(!disarmed); }
        for (const field of ['parry', 'dodge']) {
            if (condition.id.endsWith('-low-target-' + field)) assert.ok(direct >= 1);
            if (condition.id.endsWith('-high-target-' + field)) assert.ok(direct <= 1);
        }
        if (condition.id.endsWith('-low-target-force')) assert.ok(disarmed);
        if (condition.id.endsWith('-high-target-force')) assert.ok(!disarmed);
    } else {
        assert.ok(direct <= 1); assert.equal(t.weapon, bt.weapon); assert.equal(raw.dropped.length, 0);
        if (d.ability === 'he') {
            assert.equal(cost, direct ? 350 : 0); assert.equal(a.busy, direct ? 2 : 3);
        } else {
            assert.equal(cost, direct ? 220 : 100);
            if (direct) assert.ok(a.busy >= (d.ability === 'kai' ? 2 : 1) && a.busy <= 3);
            else assert.equal(a.busy, 4);
        }
        if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
        // 合璧 uses random(force) > target_force/2, so even the low-defense case can miss.
        if (condition.id.endsWith('-low-defense') && d.ability !== 'he') assert.equal(direct, 1);
    }
    for (const [key, metric] of [['qi', 'qi_cost'], ['eff_qi', 'eff_qi_cost']]) {
        assert.ok(Number.isFinite(bt[key]) && Number.isFinite(t[key]));
        assert.equal(bt[key] - t[key], counter(1, metric), '资源观察闭合：' + key);
        if (!direct) assert.equal(counter(1, metric), 0);
    }
}

export function gumuDirectEffects(records) {
    const rows = records.filter(r => r.outcome === 'observed').map(r => r.raw);
    const metric = (r, key) => r?.metrics?.[0]
        ? (Object.hasOwn(r.metrics[0], key) ? r.metrics[0][key] : 0) : null;
    const measured = rows.filter(r => Number.isFinite(metric(r, 'direct')));
    const held = rows.filter(r => typeof r?.before?.[1]?.weapon === 'string' && r.before[1].weapon !== 'none'
        && typeof r?.immediate?.[1]?.weapon === 'string');
    const delta = (r, key) => Number.isFinite(r?.before?.[1]?.[key]) && Number.isFinite(r?.immediate?.[1]?.[key])
        ? r.before[1][key] - r.immediate[1][key] : null;
    return { samples: rows.length, unknown_or_unobserved: records.length - rows.length,
        direct_calls: distribution(rows.map(r => metric(r, 'direct'))),
        any_direct_call: probability(measured.filter(r => metric(r, 'direct') > 0).length, measured.length),
        disarmed_when_held: probability(held.filter(r => r.immediate[1].weapon === 'none').length, held.length),
        unmeasured_weapon_state: rows.filter(r => typeof r?.before?.[1]?.weapon !== 'string'
            || typeof r?.immediate?.[1]?.weapon !== 'string').length,
        neili_cost: distribution(rows.map(r => metric(r, 'neili_cost'))),
        actor_busy: distribution(rows.map(r => r?.immediate?.[0]?.busy)),
        target_loss: Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']
            .map(key => [key, distribution(rows.map(r => delta(r, key)))])),
    };
}
