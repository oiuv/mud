// Reviewed Shaolin follow-up; measure the original branches, never adjust them.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const shaolinAdditional = [
    { skill: 'hongye-daofa', usage: 'blade', teacher: 'cheng-xing', moves: [['kuang', 150, 800], ['leiting', 80, 500]] },
    { skill: 'jiechen-dao', usage: 'blade', teacher: 'cheng-xin2', moves: [['xiuluo', 180, 1000]] },
    { skill: 'ranmu-daofa', usage: 'blade', teacher: 'da-mo', moves: [['huo', 180, 600], ['zhenyan', 180, 500]] },
    { skill: 'qingliang-jian', usage: 'sword', teacher: 'cheng-he', moves: [['ming', 80, 80]] },
    { skill: 'leiming-bian', usage: 'whip', teacher: 'cheng-zhi2', moves: [['cibei', 160, 1500]] },
    { skill: 'qingyun-bian', usage: 'whip', teacher: 'cheng-zhi2', moves: [['duan', null, 201]] },
];

export function shaolinAdditionalConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? d.skill : `${d.skill}/${ability}`));
        assert.ok(source, `缺少原源码 ${d.skill}/${ability}`);
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry);
        const actor = {
            skills: { [d.usage]: level, [d.skill]: level, force: level, 'hunyuan-yiqi': level,
                parry: level, dodge: level, 'shaolin-shenfa': level, buddhism: level,
                'shaolin-xinfa': level, 'martial-cognize': level, ...extra.skills },
            mappings: { [d.usage]: d.skill, parry: d.skill, force: 'hunyuan-yiqi', dodge: 'shaolin-shenfa', ...extra.mappings },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
                shen: 200000, combat_exp: 100000000, gender: '男性', 'family/family_name': '少林派', ...extra.properties },
            ...(extra.noWeapon ? {} : { equipment: { type: extra.weapon ?? d.usage, hold: false } }),
            ...(extra.busy ? { busy: 2 } : {}), ...(extra.temp ? { temp: extra.temp } : {}),
        };
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: { shen: 0, ...extra.targetProperties },
            ...(extra.targetUnarmed ? {} : { equipment: { type: 'sword', hold: false } }) };
        result.push({ id: `school-shaolin-additional-${d.skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? (extra.expiry ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-additional',
                combination: `${d.skill}+hunyuan-yiqi`, skill: d.skill, usage: d.usage, ability, level,
                actor, target, fighting: extra.fighting ?? true,
                observation: extra.expiry ? 'timed_effect' : 'single_action_immediate',
                observe_seconds: extra.expiry ? actor.skills[d.skill] + 2 : 0,
                action: method === 'ordinary' ? 'ordinary' : `perform ${d.usage}.${ability}`,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    `kungfu/class/shaolin/${d.teacher}.c`, 'kungfu/class/shaolin/cheng.h', 'kungfu/class/shaolin/shaolin.h',
                    'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/shaolin-shenfa.c', 'inherit/skill/shaolin.c',
                    'feature/attribute.c', 'feature/skill.c', 'cmds/skill/enable.c', 'cmds/skill/perform.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；教学配置仅提供武学归属依据，等级/资源为实验赋值，不等于可向教师学到本等级。青云鞭由当前实验角色运行原enable命令，并记录enable前是否已加载及当前角色资源；不重载共享技能对象，已加载时不宣称捕获首次初始化者。未模拟完整养成或门派NPC的全部配装。连击、被动缴械、加力费用与解除均运行原逻辑，不固定随机、不改时钟。',
            } });
    }
    for (const d of shaolinAdditional) {
        for (const level of [200, 400, 800])
            for (const ability of ['ordinary', ...d.moves.map(m => m[0])]) add(d, ability, level);
        for (const [ability, minimum, neili] of d.moves) {
            const check = (suffix, extra = {}) => add(d, ability, 200, { suffix: '-' + suffix, checks: 2, ...extra });
            check('low-neili', { properties: { neili: neili - 1 }, expected: 'refused' });
            check('minimum-neili', { properties: { neili } });
            check('busy', { busy: true, expected: 'refused' });
            check('no-fight', { fighting: false, expected: ability === 'zhenyan' ? 'observed' : 'refused' });
            check('no-weapon', { noWeapon: true, expected: ability === 'duan' ? 'observed' : 'refused' });
            check('wrong-weapon', { weapon: d.usage === 'sword' ? 'blade' : 'sword', expected: ability === 'duan' ? 'observed' : 'refused' });
            if (minimum) for (const offset of [-1, 0]) check(offset ? 'low-skill' : 'minimum-skill',
                { skills: { [d.skill]: minimum + offset }, expected: offset ? 'refused' : 'observed' });
            if (ability === 'zhenyan') {
                check('already-active', { temp: { zhen_yan: 1 }, expected: 'refused' });
                check('expiry', { expiry: true });
            }
            if (['huo', 'ming', 'cibei'].includes(ability)) {
                const defense = { huo: 'force', ming: 'parry', cibei: 'dodge' }[ability];
                check('low-defense', { targetSkills: { [defense]: 2 } });
                check('high-defense', { targetSkills: { [defense]: 100000 } });
            }
            if (['huo', 'zhenyan', 'xiuluo'].includes(ability)) {
                check('wrong-force', { skills: { 'taiji-shengong': 200 }, mappings: { force: 'taiji-shengong' }, expected: 'refused' });
                const max = ability === 'zhenyan' ? 2500 : 3000;
                for (const offset of [-1, 0]) check(offset ? 'low-max-neili' : 'minimum-max-neili',
                    { properties: { max_neili: max + offset }, expected: offset ? 'refused' : 'observed' });
            }
            if (['huo', 'ming'].includes(ability)) {
                const threshold = ability === 'huo' ? 250 : 100;
                for (const offset of [-1, 0]) check(offset ? 'low-force' : 'minimum-force',
                    { skills: { force: 2, 'hunyuan-yiqi': threshold - 1 + offset }, expected: offset ? 'refused' : 'observed' });
            }
            if (ability === 'xiuluo') {
                for (const [key, value] of [['blade', 180], ['hunyuan-yiqi', 140]])
                    for (const offset of [-1, 0]) check(`${key}-${offset ? 'low' : 'minimum'}`,
                        { skills: { [key]: value + offset }, expected: offset ? 'refused' : 'observed' });
                for (const con of [13, 14]) check(`con-${con}`, { properties: { con }, expected: con === 13 ? 'refused' : 'observed' });
                add(d, ability, 200, { suffix: '-jiali50', properties: { jiali: 50 } });
            }
            if (ability === 'cibei') {
                for (const offset of [-1, 0]) {
                    check(offset ? 'low-buddhism' : 'minimum-buddhism', { skills: { buddhism: 150 + offset }, expected: offset ? 'refused' : 'observed' });
                    check(offset ? 'low-shen' : 'minimum-shen', { properties: { shen: 200000 + offset }, expected: offset ? 'refused' : 'observed' });
                }
                add(d, ability, 200, { suffix: '-shen3000000', properties: { shen: 3000000 } });
                add(d, ability, 200, { suffix: '-target-unarmed', targetUnarmed: true });
                add(d, 'ordinary', 200, { suffix: '-target-unarmed', targetUnarmed: true });
            }
            if (ability === 'duan') {
                for (const key of ['force', 'whip']) for (const offset of [-1, 0])
                    check(`${key}-${offset ? 'low' : 'minimum'}`, { skills: { [key]: 100 + offset }, expected: offset ? 'refused' : 'observed' });
                add(d, ability, 800, { suffix: '-minimum-neili', properties: { neili: 201 } });
                add(d, 'ordinary', 200, { suffix: '-changed-resources', properties: { max_neili: 12000, shen: 3000000 } });
            }
        }
    }
    return result;
}

const temp = (s, key) => key.split('/').reduce((v, k) => v?.[k], s.temp) ?? 0;
export function validateShaolinAdditionalRecord(raw, condition) {
    const p = condition.parameters, [before, oldTarget] = raw.before, [actor, target] = raw.immediate;
    assert.equal(raw.outcome, p.expected);
    for (const [state, cfg] of [[before, p.actor], [oldTarget, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value);
        for (const key of ['neili', 'max_neili', 'shen', 'str', 'con', 'jiali', 'combat_exp'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key]);
        for (const [key, value] of Object.entries(cfg.temp ?? {})) assert.equal(temp(state, key), value);
    }
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1);
    assert.equal(actor.neili, before.neili - cost); assert.equal(actor.max_neili, before.max_neili);
    assert.equal(actor.jiali, before.jiali);
    if (p.skill === 'qingyun-bian') {
        assert.equal(raw.skill_load_context.actor, before.object);
        assert.equal(raw.skill_load_context.max_neili, before.max_neili);
        assert.equal(raw.skill_load_context.shen, before.shen);
        assert.ok([0, 1].includes(raw.skill_load_context.already_loaded));
    }
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(raw.launches.length, 0); assert.equal(attacks.length, 0);
        assert.ok(raw.reason.length > 0); assert.deepEqual(target, oldTarget);
        for (const key of ['apply/attack', 'apply/damage', 'apply/defense', 'zhen_yan']) assert.equal(temp(actor, key), temp(before, key));
        return;
    }
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0); assert.equal(attacks.length, 1);
        assert.ok(({ 'ranmu-daofa': [0, 100], 'leiming-bian': [0, 50] }[p.skill] ?? [0]).includes(cost));
        return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill); assert.equal(raw.launches[0].argument, p.ability);
    if (p.ability !== 'zhenyan') {
        for (const key of ['apply/attack', 'apply/damage', 'apply/defense']) assert.equal(temp(actor, key), temp(before, key));
        // Leiming may legitimately unwield the target weapon and remove its dodge modifier.
        if (p.ability === 'duan') for (const key of ['apply/armor', 'apply/dodge']) assert.equal(temp(target, key), temp(oldTarget, key));
    }
    const count = attacks.length;
    if (p.ability === 'kuang') { assert.equal(count, 6); assert.equal(cost, 300); assert.ok([2, 3].includes(actor.busy)); }
    if (p.ability === 'leiting') { assert.ok([0, 1].includes(direct)); assert.equal(count, 1 - direct); assert.equal(cost, direct * 50); assert.equal(actor.busy, 1); }
    if (p.ability === 'xiuluo') { assert.ok(count >= 4 && count <= 7); assert.ok(cost >= 600); assert.ok([1, 2, 3].includes(actor.busy)); }
    if (p.ability === 'huo' || p.ability === 'ming') {
        assert.ok([0, 1].includes(direct)); assert.equal(count, 0);
        assert.equal(cost, (p.ability === 'huo' ? 200 : 20) * (direct + 1));
        if (p.ability === 'ming') assert.equal(actor.busy, direct ? 2 : 3);
        else assert.ok([2, 3].includes(actor.busy));
        if (condition.id.endsWith('-low-defense')) assert.equal(direct, 1);
        if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
    }
    if (p.ability === 'cibei') {
        assert.equal(direct, 0); assert.ok(count === 0 || count >= 3 && count <= 6);
        if (!count) { assert.equal(cost, 200); assert.ok([0, 1].includes(actor.busy ?? 0)); }
        else { assert.ok(cost >= 300 && cost <= 300 + 50 * count && cost % 50 === 0); assert.ok([2, 3].includes(actor.busy)); }
        if (condition.id.endsWith('-low-defense')) assert.ok(count > 0);
        if (condition.id.endsWith('-high-defense')) assert.equal(count, 0);
    }
    if (p.ability === 'duan') {
        assert.equal(direct, 0); assert.ok(count >= 2 && count <= 7);
        const low = Math.max(150, Math.min(480, Math.trunc(before.skills.force / 2)));
        const high = Math.max(150, Math.min(480, Math.trunc(before.skills.force / 2) + Math.trunc(before.skills[p.skill] / 3) - 1));
        assert.ok(cost >= low && cost <= high); assert.ok([2, 3].includes(actor.busy));
    }
    if (p.ability === 'zhenyan') {
        assert.equal(cost, 400); assert.equal(count, 0); assert.equal(direct, 0); assert.equal(temp(actor, 'zhen_yan'), 1);
        assert.equal(actor.busy ?? 0, p.fighting ? 2 : 0);
        for (const key of ['attack', 'defense', 'damage'])
            assert.equal(temp(actor, `apply/${key}`) - temp(before, `apply/${key}`), Math.trunc(before.skills[p.skill] * (key === 'damage' ? 1 / 4 : 2 / 5)));
        if (p.observation === 'timed_effect') {
            assert.ok(raw.elapsed >= p.observe_seconds - 1); assert.equal(temp(raw.after[0], 'zhen_yan'), 0);
            for (const key of ['apply/attack', 'apply/defense', 'apply/damage']) assert.equal(temp(raw.after[0], key), temp(before, key));
            assert.deepEqual(raw.callbacks.filter(c => c.side === 0).map(c => c.phase), ['before', 'after']);
            assert.equal(raw.after[0].neili, actor.neili);
        }
    }
}

export function shaolinAdditionalEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw?.immediate?.[0]).map(r => r.raw);
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        attacks: distribution(raw.map(r => r.attacks.filter(a => a.actor === 0 && a.target === 1).length)),
        target_neili_cost: distribution(raw.map(r => r.before[1].neili - r.immediate[1].neili)),
        negative_neili: probability(raw.filter(r => r.immediate[0].neili < 0).length, raw.length),
        buff: probability(raw.filter(r => temp(r.immediate[0], 'zhen_yan')).length, raw.length),
        attributes: Object.fromEntries(['attack', 'defense', 'damage'].map(k => [k,
            distribution(raw.map(r => temp(r.immediate[0], `apply/${k}`) - temp(r.before[0], `apply/${k}`)))])),
    };
}
