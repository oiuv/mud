// Original hand/claw/unarmed entries. No acquisition, random or damage overrides.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const shaolinHands = [
    { skill: 'longzhua-gong', usage: 'claw', ability: 'zhua', raw: 135, neili: 200 },
    { skill: 'yintuoluo-zhua', usage: 'claw', ability: 'chixue', raw: 200, neili: 500, prepared: true, grant: true, empty: true },
    { skill: 'jimie-zhua', usage: 'claw', ability: 'wuwo', raw: 80, neili: 250 },
    { skill: 'fengyun-shou', usage: 'hand', ability: 'qinna', raw: 120, neili: 100 },
    { skill: 'dacidabei-shou', usage: 'hand', ability: 'yin', raw: 180, neili: 800, prepared: true, empty: true },
    { skill: 'qianye-shou', usage: 'hand', ability: 'qianye', raw: 120, neili: 100, teacher: 'cheng-xin' },
    { skill: 'pona-gong', usage: 'unarmed' },
    { skill: 'shaolin-tantui', usage: 'unarmed' },
];

export function shaolinHandConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? d.skill : `${d.skill}/${ability}`));
        assert.ok(source, `缺少手爪源码 ${d.skill}/${ability}`);
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry);
        const actor = {
            skills: { [d.usage]: level, [d.skill]: level, force: level, 'hunyuan-yiqi': level,
                parry: level, dodge: level, 'shaolin-shenfa': level, buddhism: level, 'martial-cognize': level, ...extra.skills },
            mappings: { [d.usage]: d.skill, parry: d.skill, force: 'hunyuan-yiqi', dodge: 'shaolin-shenfa', ...extra.mappings },
            preparations: extra.unprepared ? {} : { [d.usage]: d.skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
                shen: 200000, combat_exp: 100000000, 'family/family_name': '少林派',
                ...(method === 'perform' ? { [`can_perform/${d.skill}/${ability}`]: 1 } : {}), ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.unmapped) delete actor.mappings[d.usage];
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: { ...extra.targetProperties }, equipment: { type: 'sword', hold: false },
            ...(extra.targetBusy ? { busy: 2 } : {}), ...(extra.cloth ? { cloth: extra.cloth } : {}) };
        result.push({ id: `school-shaolin-hands-${d.skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-hands',
                combination: `${d.skill}+hunyuan-yiqi`, skill: d.skill, usage: d.usage, ability, level,
                actor, target, fighting: extra.fighting ?? true,
                observation: extra.death ? 'original_target_heartbeat' : 'single_action_immediate',
                observe_seconds: extra.death ? 30 : 0, ...(extra.death ? { target_heartbeat: true } : {}),
                action: method === 'ordinary' ? 'ordinary' : `perform ${d.usage}.${ability}`,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    `kungfu/class/shaolin/${d.teacher ?? 'xuan-ci'}.c`, 'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/shaolin-shenfa.c',
                    'cmds/skill/perform.c', 'feature/skill.c', 'feature/attribute.c', 'feature/attack.c', 'feature/damage.c',
                    'adm/daemons/combatd.c', ...(extra.cloth ? ['inherit/armor/cloth.c', 'feature/equip.c'] : []),
                    ...Object.values(extra.mappings ?? {}).map(s => `kungfu/skill/${s}.c`)])],
                qualification_note: '真实非巫师USER；等级与领悟为实验赋值，教师声明不等于养成成本。原命令、随机及伤害分支不变；赤血四段追击和特殊重创分别观察，大手印直接伤血与衣甲落地属性单列。特定重创条件启用目标原心跳至死亡或30秒观察窗结束，不预设必死；初次追击与后续心跳攻击分开，普通单次施展不冒充完整交锋。忙乱按计数报告。',
            } });
    }
    for (const d of shaolinHands) for (const level of [200, 400, 800]) {
        add(d, 'ordinary', level);
        if (d.ability) add(d, d.ability, level);
    }
    for (const d of shaolinHands.filter(d => d.ability)) {
        const check = (suffix, extra = {}) => add(d, d.ability, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        for (const offset of [-1, 0]) {
            const edge = offset ? 'low' : 'minimum', expected = offset ? 'refused' : 'observed';
            check(`${edge}-neili`, { properties: { neili: d.neili + offset }, expected });
            check(`${edge}-skill`, { skills: { [d.skill]: d.raw + offset }, expected });
        }
        check('busy', { busy: true, expected: 'refused' });
        check('no-fight', { fighting: false, expected: 'refused' });
        check('unmapped', { unmapped: true, expected: 'refused' });
        check('unprepared', { unprepared: true, expected: d.prepared ? 'refused' : 'observed' });
        check('armed', { weapon: true, expected: d.empty ? 'refused' : 'observed' });
        check('no-grant', { properties: { [`can_perform/${d.skill}/${d.ability}`]: 0 }, expected: d.grant ? 'refused' : 'observed' });
        for (const [suffix, value] of [['low-defense', 2], ['high-defense', 100000]])
            add(d, d.ability, 200, { suffix: '-' + suffix,
                ...(d.ability === 'yin' ? { targetProperties: { combat_exp: value === 2 ? 3 : 300000000 } }
                    : { targetSkills: { parry: value, dodge: value, force: value } }) });
        if (['qinna', 'qianye', 'chixue'].includes(d.ability))
            add(d, d.ability, 200, { suffix: '-target-busy', targetBusy: true });
        if (d.ability === 'chixue') {
            check('force-low', { skills: { force: 2, 'hunyuan-yiqi': 298 }, expected: 'refused' });
            check('force-minimum', { skills: { force: 2, 'hunyuan-yiqi': 299 } });
            for (const skill of ['yijinjing', 'luohan-fumogong', 'taiji-shengong'])
                check(`force-${skill}`, { skills: { [skill]: 200 }, mappings: { force: skill },
                    expected: skill === 'taiji-shengong' ? 'refused' : 'observed' });
            for (const max of [12000, 12001]) for (const neili of [500, 501])
                add(d, d.ability, 800, { suffix: `-max${max}-neili${neili}`, properties: { max_neili: max, neili },
                    ...(max === 12001 && neili === 501 ? { death: true, checks: 6 } : {}) });
        }
        if (d.ability === 'yin') {
            for (const offset of [-1, 0]) {
                const edge = offset ? 'low' : 'minimum', expected = offset ? 'refused' : 'observed';
                check(`${edge}-basic-hand`, { skills: { hand: 180 + offset }, expected });
                check(`${edge}-buddhism`, { skills: { buddhism: 200 + offset }, expected });
                check(`${edge}-strength`, { properties: { str: 15 + offset }, expected });
                check(`${edge}-max-neili`, { properties: { max_neili: 2000 + offset }, expected });
            }
            for (const armor of [199, 200]) for (const jiali of [99, 100])
                add(d, d.ability, 200, { suffix: `-cloth${armor}-jiali${jiali}`, properties: { jiali }, cloth: { armor } });
            add(d, d.ability, 200, { suffix: '-cloth199-miss', properties: { jiali: 100 }, cloth: { armor: 199 },
                targetProperties: { combat_exp: 300000000 } });
        }
    }
    return result;
}

const busy = s => s.busy === null ? 0 : s.busy;
const temp = (s, key) => s.temp?.apply?.[key] ?? 0;
export function validateShaolinHandRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0], target = raw.immediate[1];
    assert.equal(raw.outcome, p.expected);
    for (const [state, cfg] of [[before, p.actor], [raw.before[1], p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.preparations, cfg.preparations ?? {});
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value);
        for (const key of ['qi', 'neili', 'max_neili', 'combat_exp', 'jiali', 'str', 'shen'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key]);
        if (cfg.cloth) {
            assert.equal(state.cloth.armor, cfg.cloth.armor); assert.equal(state.cloth.equipped, 1);
            assert.equal(state.cloth.location, 'actor'); assert.equal(state.cloth.value, 100);
            assert.equal(temp(state, 'armor'), 100 + cfg.cloth.armor);
        }
    }
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    assert.ok(Number.isSafeInteger(raw.immediate_attack_count) && raw.immediate_attack_count >= 0
        && raw.immediate_attack_count <= raw.attacks.length);
    const attacks = raw.attacks.slice(0, raw.immediate_attack_count).filter(a => a.actor === 0 && a.target === 1);
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.equal(actor.neili, before.neili - cost); assert.equal(actor.max_neili, before.max_neili);
    for (const key of ['attack', 'unarmed_damage']) assert.equal(temp(actor, key), temp(before, key));
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(attacks.length, 0); assert.equal(raw.launches.length, 0);
        assert.ok(raw.reason.length > 0); assert.deepEqual(raw.immediate[1], raw.before[1]); return;
    }
    if (condition.method === 'ordinary') {
        assert.equal(attacks.length, 1); assert.equal(raw.launches.length, 0); assert.equal(cost, 0); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill); assert.equal(raw.launches[0].argument, p.ability);
    if (p.ability === 'chixue') {
        assert.ok([100, 400, 500].includes(cost)); assert.equal(direct, cost === 400 ? 1 : 0);
        assert.equal(busy(actor), cost === 100 ? 4 : 3);
        assert.equal(attacks.length, 4);
        // A successful ordinary follow-up interrupts the victim's busy state.
        assert.ok([0, 1, ...(p.target.busy ? [p.target.busy] : [])].includes(busy(target)));
        if (cost === 500) { assert.ok(target.eff_qi <= 0); assert.equal(target.eff_jing, 0); }
        if (p.target_heartbeat) {
            assert.equal(cost, 500);
            if (raw.observation_terminal === 'death') {
                assert.ok(raw.terminals.some(t => t.side === 1 && t.state === 'death'));
                assert.equal(raw.after[1].ghost, 1); assert.ok(raw.elapsed > 0);
            } else {
                assert.equal(raw.observation_terminal, 'window_complete');
                assert.equal(raw.after[1].ghost, 0); assert.ok(raw.elapsed >= p.observe_seconds);
                assert.ok(!raw.terminals.some(t => t.side === 1 && t.state === 'death'));
            }
        }
        if (condition.id.endsWith('-high-defense')) assert.equal(cost, 100);
        return;
    }
    assert.equal(attacks.length, 0);
    if (p.ability === 'yin') {
        assert.equal(direct, 0);
        const damage = Math.trunc(before.skills[p.skill] / 40) * (before.jiali + 1);
        const hit = (raw.metrics[1].qi_cost ?? 0) > 0;
        assert.equal(raw.metrics[1].qi_cost ?? 0, hit ? damage : 0);
        assert.equal(raw.metrics[1].eff_qi_cost ?? 0, hit ? Math.trunc(damage / 3) : 0);
        assert.equal(cost, 200 + (hit ? before.jiali + 1 : 0)); assert.ok([2, 3].includes(busy(actor)));
        if (p.target.cloth) {
            const broken = hit && damage > 500 && p.target.cloth.armor < 200;
            const old = raw.before[1].cloth, item = target.cloth;
            assert.equal(item.object, old.object); assert.equal(item.equipped, broken ? 0 : 1);
            assert.equal(item.location, broken ? 'room' : 'actor'); assert.equal(item.value, broken ? 0 : 100);
            assert.equal(item.armor, broken ? 0 : old.armor); assert.equal(item.name, (broken ? '破碎的' : '') + old.name);
            assert.equal(temp(target, 'armor'), 100 + (broken ? 0 : old.armor));
        }
        if (condition.id.endsWith('-high-defense') || condition.id.endsWith('-miss')) assert.equal(hit, false);
        return;
    }
    assert.ok([0, 1].includes(direct));
    const costs = { zhua: [60, 180], wuwo: [20, 200], qinna: [20, 80], qianye: [30, 100] }[p.ability];
    assert.equal(cost, costs[direct]);
    assert.equal(busy(actor), direct ? ['qinna', 'qianye'].includes(p.ability) ? 1 : 2 : 3);
    if (p.target.busy) assert.equal(busy(target), p.target.busy);
    else if (['qinna', 'qianye'].includes(p.ability)) {
        const ap = before.effective_skills.hand + (p.ability === 'qianye' ? before.effective_skills.force : 0);
        assert.ok([0, Math.trunc(ap / (p.ability === 'qinna' ? 25 : 50)) + 2].includes(busy(target)));
        if (!direct) assert.equal(busy(target), 0);
    } else assert.equal(busy(target), 0);
    if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
}

export function shaolinHandEffects(rows, targetHeartbeat = false) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw?.immediate?.[0]).map(r => r.raw);
    const clothes = raw.filter(r => r.before[1].cloth?.object);
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        target_busy: distribution(raw.map(r => busy(r.immediate[1]))),
        initial_attacks: distribution(raw.map(r => r.attacks.slice(0, r.immediate_attack_count).filter(a => a.actor === 0 && a.target === 1).length)),
        observation_window_completed: raw.filter(r => r.observation_terminal === 'window_complete').length,
        severe_trauma: probability(raw.filter(r => r.immediate[1].eff_qi <= 0 && r.immediate[1].eff_jing === 0).length, raw.length),
        target_death: probability(raw.filter(r => r.terminals?.some(t => t.side === 1 && t.state === 'death')).length,
            targetHeartbeat ? raw.length : 0),
        cloth_broken: probability(clothes.filter(r => r.immediate[1].cloth.location === 'room' && r.immediate[1].cloth.armor === 0).length, clothes.length),
    };
}
