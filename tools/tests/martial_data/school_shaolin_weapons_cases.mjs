// Explicit Shaolin blade/club/staff observations; no acquisition or balance claims.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const shaolinWeapons = [
    { skill: 'cibei-dao', usage: 'blade', ability: 'sheshen', teacher: 'cheng-xing', minimum: 60, neili: 200, buff: 'cbd_sheshen' },
    { skill: 'xiuluo-dao', usage: 'blade', ability: 'suoming', teacher: 'cheng-xin2', minimum: 135, neili: 250 },
    { skill: 'zui-gun', usage: 'club', ability: 'zuida', teacher: 'cheng-ling', neili: 500, buff: 'zg_zuida' },
    { skill: 'weituo-gun', usage: 'club', ability: 'fumo', teacher: 'cheng-ji', minimum: 140, neili: 800 },
    { skill: 'weituo-chu', usage: 'staff', ability: 'jishi', teacher: 'cheng-ji', minimum: 120, neili: 601, buff: 'sl_leidong' },
    { skill: 'yecha-gun', usage: 'club', ability: 'hongxia', teacher: 'cheng-ji', minimum: 120, neili: 200 },
];

export function shaolinWeaponConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? d.skill : `${d.skill}/${ability}`));
        assert.ok(source, `缺少少林武学 ${d.skill}/${ability}`);
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry, '缺少原入口');
        const actor = {
            skills: { [d.usage]: level, [d.skill]: level, force: level, 'hunyuan-yiqi': level,
                parry: level, dodge: level, 'shaolin-shenfa': level, buddhism: level,
                'martial-cognize': level, ...extra.skills },
            mappings: { [d.usage]: d.skill, parry: d.skill, force: 'hunyuan-yiqi', dodge: 'shaolin-shenfa', ...extra.mappings },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
                shen: 200000, combat_exp: 100000000, gender: '男性', 'family/family_name': '少林派',
                ...(ability === 'jishi' ? { 'can_perform/weituo-chu/jishi': 1 } : {}), ...extra.properties },
            ...(extra.noWeapon ? {} : { equipment: { type: extra.weapon ?? d.usage, hold: false } }),
            ...(extra.busy ? { busy: 2 } : {}), ...(extra.temp ? { temp: extra.temp } : {}),
            ...(extra.drunk ? { conditions: { drunk: extra.drunk } } : {}),
        };
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: { shen: 0, ...extra.targetProperties }, equipment: { type: 'sword', hold: false },
            ...(extra.targetBusy ? { busy: 2 } : {}) };
        const duration = ability === 'sheshen' ? Math.trunc(actor.skills[d.skill] / 4)
            : ability === 'zuida' ? Math.trunc(actor.skills[d.skill] / 3)
            : Math.trunc(Math.trunc((Math.trunc(actor.skills.staff / 2) + actor.skills[d.skill]) / 3) * 2 / 3);
        result.push({ id: `school-shaolin-weapons-${d.skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? (extra.expiry ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-weapons',
                combination: `${d.skill}+hunyuan-yiqi`, skill: d.skill, usage: d.usage, ability, level,
                actor, target, fighting: extra.fighting ?? true, observation: extra.expiry ? 'timed_effect' : 'single_action_immediate',
                observe_seconds: extra.expiry ? duration + 2 : 0,
                action: method === 'ordinary' ? 'ordinary' : `perform ${d.usage}.${ability}`,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    `kungfu/class/shaolin/${d.teacher}.c`, 'kungfu/class/shaolin/cheng.h', 'kungfu/class/shaolin/shaolin.h',
                    'kungfu/class/shaolin/da-mo.c', 'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/shaolin-shenfa.c',
                    'inherit/skill/shaolin.c', 'feature/attribute.c', 'feature/skill.c',
                    'cmds/skill/perform.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；依据澄字辈教师的技能与混元一气功/少林身法配置，技能、资源及即世即空领悟为实验赋值，不证明向该教师可学到本等级。醉意及阻断标记仅在独立边界中显式预置；运行原命令、随机及解除回调，不加速时间。韦陀杵原call_out不经角色start_call_out，终点状态与角色回调证据分别记录。',
            } });
    }
    for (const d of shaolinWeapons) {
        for (const level of [200, 400, 800]) for (const ability of ['ordinary', d.ability]) add(d, ability, level);
        const check = (suffix, extra = {}) => add(d, d.ability, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        check('low-neili', { properties: { neili: d.neili - 1 }, expected: 'refused' });
        check('minimum-neili', { properties: { neili: d.neili } });
        check('busy', { busy: true, expected: 'refused' });
        check('no-fight', { fighting: false, expected: ['sheshen', 'zuida'].includes(d.ability) ? 'observed' : 'refused' });
        // Hongxia omits a weapon check; preserve and measure that original behavior.
        check('no-weapon', { noWeapon: true, expected: d.ability === 'hongxia' ? 'observed' : 'refused' });
        check('wrong-weapon', { weapon: 'sword', expected: d.ability === 'hongxia' ? 'observed' : 'refused' });
        if (d.minimum) for (const offset of [-1, 0]) check(offset ? 'low-skill' : 'minimum-skill',
            { skills: { [d.skill]: d.minimum + offset }, expected: offset ? 'refused' : 'observed' });
        if (d.buff) {
            check('already-active', { temp: { [d.buff]: 1 }, expected: 'refused' });
            check('expiry', { expiry: true });
        } else {
            const defense = d.ability === 'fumo' ? 'force' : 'parry';
            check('low-defense', { targetSkills: { [defense]: 2 } });
            check('high-defense', { targetSkills: { [defense]: 100000 } });
        }
        if (['suoming', 'fumo', 'zuida'].includes(d.ability)) {
            const threshold = d.ability === 'zuida' ? 150 : 200;
            for (const offset of [-1, 0]) check(offset ? 'low-force' : 'minimum-force',
                { skills: { force: 2, 'hunyuan-yiqi': threshold - 1 + offset }, expected: offset ? 'refused' : 'observed' });
        }
        if (d.ability === 'fumo') {
            check('low-shen', { properties: { shen: 9999 }, expected: 'refused' });
            check('minimum-shen', { properties: { shen: 10000 } });
            for (const level of [200, 400, 800]) add(d, d.ability, level, { suffix: '-evil-target', targetProperties: { shen: -200000 } });
        }
        if (d.ability === 'hongxia') check('target-busy', { targetBusy: true, expected: 'refused' });
        if (d.ability === 'zuida') {
            check('powerup', { temp: { powerup: 1 }, expected: 'refused' });
            check('wrong-force', { skills: { 'taiji-shengong': 200 }, mappings: { force: 'taiji-shengong' }, expected: 'refused' });
            for (const offset of [-1, 0]) {
                check(offset ? 'low-str' : 'minimum-str', { properties: { str: 25 + offset }, expected: offset ? 'refused' : 'observed' });
                check(offset ? 'low-club' : 'minimum-club', { skills: { club: 2, 'zui-gun': 99 + offset }, expected: offset ? 'refused' : 'observed' });
            }
            for (const drunk of [9, 30]) add(d, d.ability, 200, { suffix: `-drunk-${drunk}`, drunk });
        }
        if (d.ability === 'jishi') {
            check('no-grant', { properties: { 'can_perform/weituo-chu/jishi': 0 }, expected: 'refused' });
            for (const offset of [-1, 0]) {
                check(offset ? 'low-force' : 'minimum-force', { skills: { force: 120 + offset }, expected: offset ? 'refused' : 'observed' });
                check(offset ? 'low-max-neili' : 'minimum-max-neili', { properties: { max_neili: 1501 + offset }, expected: offset ? 'refused' : 'observed' });
            }
        }
    }
    return result;
}

const temp = (s, key) => key.split('/').reduce((v, k) => v?.[k], s.temp) ?? 0;
export function validateShaolinWeaponRecord(raw, condition) {
    const p = condition.parameters, [before, oldTarget] = raw.before, [actor, target] = raw.immediate;
    assert.equal(raw.outcome, p.expected);
    for (const state of [before, actor]) {
        assert.ok(Number.isFinite(state.effective_str) && Number.isFinite(state.effective_dex));
        assert.ok(Object.hasOwn(state, 'busy'));
    }
    for (const [state, cfg] of [[before, p.actor], [oldTarget, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value);
        for (const key of ['neili', 'max_neili', 'shen', 'str'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key]);
        for (const [key, value] of Object.entries(cfg.temp ?? {})) assert.equal(temp(state, key), value);
        for (const [key, value] of Object.entries(cfg.conditions ?? {})) assert.equal(state.conditions[key], value);
    }
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.equal(actor.neili, before.neili - cost); assert.equal(actor.max_neili, before.max_neili);
    assert.equal(raw.dropped.length, 0);
    const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(raw.launches.length, 0); assert.equal(attacks.length, 0);
        assert.ok(raw.reason.length > 0); assert.deepEqual(target, oldTarget);
        for (const key of ['apply/attack', 'apply/damage', 'apply/dodge', 'str', 'dex', 'cbd_sheshen', 'zg_zuida', 'sl_leidong'])
            assert.equal(temp(actor, key), temp(before, key));
        return;
    }
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0); assert.equal(attacks.length, 1); assert.equal(cost, 0); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill); assert.equal(raw.launches[0].argument, p.ability);
    assert.equal(attacks.length, 0);
    const d = shaolinWeapons.find(x => x.skill === p.skill);
    if (!d.buff) {
        assert.ok([0, 1].includes(direct));
        const costs = { suoming: [60, 180], fumo: [100, 300], hongxia: [130, 200] }[p.ability];
        assert.equal(cost, costs[direct]); assert.equal(actor.busy, direct ? (p.ability === 'hongxia' ? 1 : 2) : 3);
        if (condition.id.endsWith('-low-defense')) assert.equal(direct, 1);
        if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
        if (p.ability === 'hongxia') assert.ok((target.busy ?? 0) === 0 || direct && target.busy === Math.trunc(before.effective_skills.club / 30) + 2);
        return;
    }
    assert.equal(direct, 0); assert.equal(temp(actor, d.buff), 1);
    assert.equal(cost, { sheshen: 100, zuida: 150, jishi: 300 }[p.ability]);
    assert.equal(actor.busy ?? 0, p.ability === 'jishi' ? 1 : p.fighting ? 2 : 0);
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) assert.equal(target[key], oldTarget[key]);
    if (p.ability === 'sheshen') {
        assert.equal(temp(actor, 'apply/attack') - temp(before, 'apply/attack'), Math.trunc(before.skills[p.skill] / 3));
        assert.equal(temp(actor, 'apply/dodge') - temp(before, 'apply/dodge'), -Math.trunc(before.skills[p.skill] / 5));
    } else if (p.ability === 'zuida') {
        for (const key of ['str', 'dex']) {
            const delta = temp(actor, key) - temp(before, key);
            assert.equal(delta % before[key], 0);
            assert.ok(delta >= 0 && delta / before[key] < Math.trunc((before.conditions?.drunk ?? 0) / 3) + 2);
            // Public attribute getters exclude these root fields. Combat separately consumes root str.
            assert.equal(actor[`effective_${key}`], before[`effective_${key}`]);
        }
    } else {
        const requested = Math.trunc((before.skills[p.skill] + before.skills.buddhism) / 6), cap = before.weapon_damage * 2;
        for (const key of ['attack', 'damage']) assert.equal(temp(actor, `apply/${key}`) - temp(before, `apply/${key}`), Math.min(requested, cap));
        assert.ok(Object.hasOwn(actor.weapon_details, 'rigidity') && Object.hasOwn(before.weapon_details, 'rigidity'));
        assert.equal(actor.weapon_details.rigidity ?? 0, (before.weapon_details.rigidity ?? 0) + (requested <= cap ? 1 : 0));
    }
    if (p.observation === 'timed_effect') {
        assert.ok(raw.elapsed >= p.observe_seconds - 1); assert.ok(!temp(raw.after[0], d.buff));
        for (const key of ['apply/attack', 'apply/damage', 'apply/dodge', 'str', 'dex']) assert.equal(temp(raw.after[0], key), temp(before, key));
        assert.equal(raw.after[0].neili, actor.neili);
        if (p.ability !== 'jishi') {
            const calls = raw.callbacks.filter(c => c.side === 0);
            assert.deepEqual(calls.map(c => c.phase), ['before', 'after']);
            assert.ok(calls[0].elapsed >= p.observe_seconds - 3); assert.ok(!temp(calls[1].state, d.buff));
        }
    }
}

export function shaolinWeaponEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw?.before?.[0] && r.raw?.immediate?.[0]).map(r => r.raw);
    const delta = (r, key) => temp(r.immediate[0], key) - temp(r.before[0], key);
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        applied: probability(raw.filter(r => shaolinWeapons.some(d => d.buff && temp(r.immediate[0], d.buff))).length, raw.length),
        attributes: Object.fromEntries(['apply/attack', 'apply/damage', 'apply/dodge', 'str', 'dex'].map(key => [key, distribution(raw.map(r => delta(r, key)))])),
        effective_str_delta: distribution(raw.map(r => r.immediate[0].effective_str - r.before[0].effective_str)),
        effective_dex_delta: distribution(raw.map(r => r.immediate[0].effective_dex - r.before[0].effective_dex)),
        rigidity_delta: distribution(raw.map(r => r.immediate[0].weapon_details?.rigidity - r.before[0].weapon_details?.rigidity)),
        callbacks_finished: distribution(raw.flatMap(r => r.callbacks.filter(c => c.side === 0 && c.phase === 'after').map(c => c.elapsed))),
    };
}
