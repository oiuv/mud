// Original palm commands: qualification, costs, temporary effects and real attacks.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const shaolinPalms = [
    { skill: 'banruo-zhang', ability: 'feng', teacher: 'cheng-ming', raw: 60, neili: 200 },
    { skill: 'sanhua-zhang', ability: 'san', teacher: 'cheng-si', raw: 135, neili: 200, force: 180 },
    { skill: 'woshi-zhang', ability: 'po', teacher: 'cheng-ming', raw: 120, neili: 400, force: 140 },
    { skill: 'xumishan-zhang', ability: 'ying', teacher: 'du-yuan', raw: 150, neili: 500 },
    { skill: 'shenzhang-bada', ability: 'bafang', teacher: 'xuan-ci', raw: 200, neili: 700, force: 300 },
    { skill: 'rulai-zhang', ability: 'zong', teacher: 'wuming', raw: 150, neili: 500, force: 280 },
];

export function shaolinPalmConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? d.skill : `${d.skill}/${ability}`));
        assert.ok(source, `缺少少林掌法源码 ${d.skill}/${ability}`);
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry);
        const actor = {
            skills: { strike: level, [d.skill]: level, force: level, 'hunyuan-yiqi': level,
                parry: level, dodge: level, 'shaolin-shenfa': level, buddhism: level,
                'martial-cognize': level, ...extra.skills },
            mappings: { strike: d.skill, parry: d.skill, force: 'hunyuan-yiqi', dodge: 'shaolin-shenfa', ...extra.mappings },
            preparations: extra.unprepared ? {} : { strike: d.skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
                shen: 200000, combat_exp: 100000000, 'family/family_name': '少林派',
                ...(method === 'perform' ? { [`can_perform/${d.skill}/${ability}`]: 1 } : {}), ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: 2 } : {}), ...(extra.temp ? { temp: extra.temp } : {}),
        };
        if (extra.unmapped) delete actor.mappings.strike;
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: {}, equipment: { type: 'sword', hold: false } };
        result.push({ id: `school-shaolin-palms-${d.skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? (extra.expiry ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-palms',
                combination: `${d.skill}+hunyuan-yiqi`, skill: d.skill, usage: 'strike', ability, level,
                actor, target, fighting: extra.fighting ?? true,
                observation: extra.expiry || extra.targetHeartbeat ? 'timed_effect' : 'single_action_immediate',
                observe_seconds: extra.expiry ? Math.trunc(actor.skills[d.skill] / 4) + 2 : extra.targetHeartbeat ? 30 : 0,
                ...(extra.targetHeartbeat ? { target_heartbeat: true } : {}),
                action: method === 'ordinary' ? 'ordinary' : `perform strike.${ability}`,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    `kungfu/class/shaolin/${d.teacher}.c`, 'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/shaolin-shenfa.c',
                    'cmds/skill/perform.c', 'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；教师配置只证明来源，技能、领悟及资源为实验赋值，不证明当前可从师取得。逐门按原perform条件采样；千手如来掌使用绝招要求的混元映射，不复制无名僧自用易筋经。普攻只调用一次原do_attack，不冒充double_attack完整攻击轮；action-flag1为单独被动诊断初值，仍走原三实参hit_ob调用。万佛朝宗上限倍数分支保留原死亡处理和资源重置，不将重置当普通伤害。',
            } });
    }
    for (const d of shaolinPalms) for (const level of [200, 400, 800]) {
        add(d, 'ordinary', level); add(d, d.ability, level);
    }
    for (const d of shaolinPalms) {
        const check = (suffix, extra = {}) => add(d, d.ability, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        check('low-neili', { properties: { neili: d.neili - 1 }, expected: 'refused' });
        check('minimum-neili', { properties: { neili: d.neili } });
        check('low-skill', { skills: { [d.skill]: d.raw - 1 }, expected: 'refused' });
        check('minimum-skill', { skills: { [d.skill]: d.raw } });
        check('busy', { busy: true, expected: 'refused' });
        check('no-fight', { fighting: false, expected: d.ability === 'feng' ? 'observed' : 'refused' });
        check('unmapped', { unmapped: true, expected: 'refused' });
        check('unprepared', { unprepared: true, expected: ['ying', 'zong'].includes(d.ability) ? 'refused' : 'observed' });
        check('armed', { weapon: true, expected: ['feng', 'san'].includes(d.ability) ? 'observed' : 'refused' });
        check('no-grant', { properties: { [`can_perform/${d.skill}/${d.ability}`]: 0 },
            expected: d.ability === 'zong' ? 'refused' : 'observed' });
        if (d.force) for (const offset of [-1, 0]) check(`force-${offset ? 'low' : 'minimum'}`,
            { skills: { force: 2, 'hunyuan-yiqi': d.force - 1 + offset }, expected: offset ? 'refused' : 'observed' });
        if (d.ability === 'feng') {
            check('already-active', { temp: { brz_feng: 1 }, expected: 'refused' });
            check('expiry', { expiry: true });
        } else {
            const defense = { san: ['dodge'], po: ['parry'], ying: ['force'], bafang: ['dodge', 'parry'], zong: ['parry'] }[d.ability];
            for (const [suffix, value] of [['low-defense', 2], ['high-defense', 100000]])
                add(d, d.ability, 200, { suffix: '-' + suffix, targetSkills: Object.fromEntries(defense.map(k => [k, value])) });
        }
        if (d.ability === 'zong') {
            check('wrong-force', { skills: { 'yijinjing': 200 }, mappings: { force: 'yijinjing' }, expected: 'refused' });
            check('low-max-neili', { properties: { max_neili: 2999 }, expected: 'refused' });
            check('minimum-max-neili', { properties: { max_neili: 3000 } });
            for (const value of [12000, 12001]) add(d, d.ability, 800,
                { suffix: `-max-neili${value}`, properties: { max_neili: value }, checks: 2, targetHeartbeat: value === 12001 });
            add(d, 'ordinary', 800, { suffix: '-action-flag1', temp: { action_flag: 1 }, targetSkills: { dodge: 2, parry: 2 } });
        }
    }
    return result;
}

const temp = (s, key) => key.split('/').reduce((v, k) => v?.[k], s.temp) ?? 0;
export function validateShaolinPalmRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0];
    assert.equal(raw.outcome, p.expected);
    for (const [state, cfg] of [[before, p.actor], [raw.before[1], p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.preparations, cfg.preparations ?? {});
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value);
        for (const key of ['qi', 'neili', 'max_neili', 'shen', 'jiali', 'combat_exp'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key]);
    }
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1);
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.equal(actor.neili, before.neili - cost); assert.equal(actor.max_neili, before.max_neili);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(attacks.length, 0); assert.equal(raw.launches.length, 0);
        assert.ok(raw.reason.length > 0); assert.deepEqual(raw.immediate[1], raw.before[1]);
        for (const key of ['brz_feng', 'apply/attack', 'apply/dodge']) assert.equal(temp(actor, key), temp(before, key));
        return;
    }
    if (condition.method === 'ordinary') {
        assert.equal(attacks.length, 1); assert.equal(raw.launches.length, 0); assert.equal(cost, 0);
        if (p.skill === 'rulai-zhang') for (const call of raw.passives.filter(e => e.skill === p.skill)) assert.equal(call.result, 0);
        return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill); assert.equal(raw.launches[0].argument, p.ability);
    if (p.ability === 'feng') {
        assert.equal(direct, 0); assert.equal(attacks.length, 0); assert.equal(cost, 100);
        assert.equal(temp(actor, 'brz_feng'), 1); assert.equal(actor.busy === null ? 0 : actor.busy, p.fighting ? 2 : 0);
        assert.equal(temp(actor, 'apply/attack') - temp(before, 'apply/attack'), -Math.trunc(before.skills[p.skill] / 4));
        assert.equal(temp(actor, 'apply/dodge') - temp(before, 'apply/dodge'), Math.trunc(before.skills[p.skill] / 3));
        if (p.observation === 'timed_effect') {
            assert.ok(raw.elapsed >= p.observe_seconds - 1);
            for (const key of ['brz_feng', 'apply/attack', 'apply/dodge']) assert.equal(temp(raw.after[0], key), temp(before, key));
            assert.deepEqual(raw.callbacks.filter(c => c.side === 0).map(c => c.phase), ['before', 'after']);
            assert.equal(raw.after[0].neili, actor.neili);
        }
        return;
    }
    assert.equal(temp(actor, 'apply/attack'), temp(before, 'apply/attack'));
    if (['san', 'po', 'bafang'].includes(p.ability)) {
        assert.ok([0, 1].includes(direct)); assert.equal(attacks.length, 0);
        const costs = { san: [50, 150], po: [120, 250], bafang: [100, 350] }[p.ability];
        assert.equal(cost, costs[direct]); assert.equal(actor.busy, direct || p.ability === 'po' ? 2 : 3);
        if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
        return;
    }
    assert.equal(direct, 0);
    if (p.ability === 'ying') {
        assert.equal(cost, 150); assert.equal(attacks.length, 5); assert.ok(actor.busy >= 1 && actor.busy <= 5); return;
    }
    assert.equal(p.ability, 'zong'); assert.equal(temp(actor, 'rulai-zhang/hit_msg'), 0);
    const lethal = condition.id.endsWith('-max-neili12001');
    assert.equal(cost, lethal ? 500 : 300);
    if (lethal) {
        assert.ok(attacks.length >= 1 && attacks.length <= 9);
        assert.equal(actor.busy, 3);
        // Preserve immediate lethal state, then let the original target heartbeat process it.
        assert.ok(raw.immediate[1].eff_qi <= 0); assert.equal(raw.immediate[1].eff_jing, 0);
        assert.ok(raw.terminals.some(t => t.side === 1 && t.state === 'death'));
        assert.equal(raw.after[1].ghost, 1); assert.ok(raw.elapsed > 0 && raw.elapsed < p.observe_seconds);
    } else {
        assert.equal(attacks.length, 6); assert.ok(actor.busy >= 1 && actor.busy <= 6);
    }
}

export function shaolinPalmEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw?.immediate?.[0]).map(r => r.raw);
    const calls = raw.flatMap(r => (r.passives ?? []).filter(p => p.skill === 'rulai-zhang' && p.route === 'martial'));
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        attack_delta: distribution(raw.map(r => temp(r.immediate[0], 'apply/attack') - temp(r.before[0], 'apply/attack'))),
        dodge_delta: distribution(raw.map(r => temp(r.immediate[0], 'apply/dodge') - temp(r.before[0], 'apply/dodge'))),
        target_death: probability(raw.filter(r => r.terminals.some(t => t.side === 1 && t.state === 'death')).length, raw.length),
        passive_calls: calls.length, passive_nonzero: calls.filter(p => p.result !== 0).length,
        passive_incoming: distribution(calls.map(p => p.incoming)),
    };
}
