// Source-backed player combinations; not NPC clones or equal-training-cost builds.
import assert from 'node:assert/strict';
import { validateBoutRecord } from './bout_cases.mjs';
import { validateAttackRoundCounts } from './school_wudang_passive_cases.mjs';

export const emeiBoutGroup = 'emei-bout';
export const emeiBoutProfiles = [
    { skill: 'emei-jian', usage: 'sword', teacher: 'xuan', force: 'emei-xinfa' },
    { skill: 'huifeng-jian', usage: 'sword', teacher: 'miejue' },
    { skill: 'yitian-jian', usage: 'sword', teacher: 'miejue' },
    { skill: 'yanxing-dao', usage: 'blade', teacher: 'kong', force: 'emei-xinfa' },
    { skill: 'jinding-zhang', usage: 'strike', teacher: 'miejue' },
    { skill: 'jieshou-jiushi', usage: 'hand', teacher: 'miejue' },
    { skill: 'tiangang-zhi', usage: 'finger', teacher: 'miejue' },
    { skill: 'piaoxue-zhang', usage: 'strike', teacher: 'fengling', force: 'emei-jiuyang' },
    { skill: 'sixiang-zhang', usage: 'strike', teacher: 'miejue' },
    { skill: 'jinding-zhang', usage: 'strike', teacher: 'miejue', pair: ['hand', 'jieshou-jiushi'] },
    { skill: 'jinding-zhang', usage: 'strike', teacher: 'miejue', pair: ['finger', 'tiangang-zhi'] },
    { skill: 'jieshou-jiushi', usage: 'hand', teacher: 'miejue', pair: ['finger', 'tiangang-zhi'] },
    ...[
        { skill: 'cuixin-zhang', usage: 'strike' },
        { skill: 'jiuyin-baiguzhao', usage: 'claw' },
        { skill: 'yinlong-bian', usage: 'whip' },
        { skill: 'cuixin-zhang', usage: 'strike', pair: ['claw', 'jiuyin-baiguzhao'] },
    ].map(profile => ({ ...profile, teacher: 'zhou', force: 'yijin-duangu', dodge: 'shexing-lifan' })),
];

export function emeiBoutConditions(catalog, { smoke = false } = {}) {
    const properties = { str: 36, int: 36, con: 36, dex: 36, combat_exp: 10000000,
        qi: 10000, eff_qi: 10000, max_qi: 10000, neili: 6000, max_neili: 6000, jiali: 0 };
    return emeiBoutProfiles.flatMap(profile => [0, 50].map(jiali => {
        const { skill, usage, teacher, pair, force = 'linji-zhuang', dodge = 'zhutian-bu' } = profile;
        const armed = ['sword', 'blade', 'whip'].includes(usage);
        const combination = skill + (pair ? '-' + pair[1] : '');
        const special = [skill, force, dodge, 'buddhism', 'mahayana', ...(pair ? [pair[1]] : [])];
        const paths = special.map(id => {
            const source = catalog.skills.find(s => s.id === id);
            assert.ok(source, '缺少峨嵋组合源码：' + id); return source.path;
        });
        const skills = Object.fromEntries(['force', 'dodge', 'parry', usage,
            ...special, ...(pair ? [pair[0]] : [])].map(id => [id, 400]));
        return { id: `school-emei-bout-${combination}-l400-jiali${jiali}`, stage: 'school',
            entry_id: paths[0], method: 'bout', samples: smoke ? 2 : 20,
            parameters: { school: 'emei', family: '峨嵋派', collection_group: emeiBoutGroup,
                combination, skill, usage, paired: !!pair, ability: 'bout', level: 400,
                observation: 'original_heartbeat_bout', strategy: 'ordinary', first: 'alternating_index',
                actor: { skills, mappings: { force, dodge, parry: skill, [usage]: skill,
                    ...(pair ? { [pair[0]]: pair[1] } : {}) },
                    preparations: armed ? {} : { [usage]: skill, ...(pair ? { [pair[0]]: pair[1] } : {}) },
                    properties: { ...properties, jiali, gender: '女性', 'family/family_name': '峨嵋派' },
                    ...(armed ? { equipment: { type: usage, hold: false } } : {}) },
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 }, mappings: {},
                    preparations: {}, properties: { ...properties }, equipment: { type: 'sword', hold: false } },
                action: 'ordinary', fighting: true, observe_seconds: smoke ? 3 : 30,
                expected: 'observed', not_applicable: '',
                qualification_sources: [...paths, `kungfu/class/emei/${teacher}.c`,
                    'feature/attack.c', 'feature/action.c', 'feature/skill.c', 'feature/attribute.c',
                    'feature/damage.c', 'inherit/char/char.c', 'inherit/skill/force.c',
                    'adm/daemons/combatd.c', 'include/combat.h', 'kungfu/skill/sword.c',
                    ...(skill === 'cuixin-zhang' ? ['kungfu/condition/cuixin_zhang.c'] : [])],
                qualification_note: '400级真实非巫师女性USER实验组合，来源为本派NPC已学武学、内功/身法映射及原互备声明，不复制NPC等级、招架、装备或声称可向其学至400级。周芷若九阴五技拒教、原未持鞭；此处持鞭是明确实验输入，不冒充其原配装。主招及招架映射同一武学，双备以首项为招架；三门峨嵋互备及催心/白骨爪均有原双向valid_combine。prepare_skill只设置初态，不预置攻击计数或强化。双方先天36、气血10000、内力6000、经验10000000；目标基本内功/闪躲/招架600、剑法200，无映射、加力0。持器均为伤害50标准演武装备；原USER心跳、恢复、随机及30秒时钟，每条件20场交替先手，只普通策略不自动perform/exert。伤害、创伤、内力支出/恢复及实际终态分账，不作同培养成本排名。',
            } };
    }));
}

export function validateEmeiBoutRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'emei'); assert.equal(raw.method, 'bout');
    assert.equal(raw.outcome, p.expected);
    assert.equal(p.observation, 'original_heartbeat_bout');
    assert.equal(raw.launches.length, 0, '普通策略不得主动施展绝招');
    assert.equal(raw.interfaces.length, 0);
    validateBoutRecord(raw, condition); validateAttackRoundCounts(raw);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side];
        assert.equal(before.userp, 1); assert.equal(before.interactive, 1); assert.equal(before.wizardp, 0);
        assert.deepEqual(before.mappings, config.mappings);
        assert.deepEqual(before.preparations, config.preparations);
        for (const [key, level] of Object.entries(config.skills)) assert.equal(before.skills[key], level);
        for (const key of ['str', 'int', 'con', 'dex', 'combat_exp', 'qi', 'eff_qi', 'max_qi', 'neili', 'max_neili', 'jiali'])
            assert.equal(before[key], config.properties[key], '初态不符：' + key);
        assert.equal(before.temp.combat_time ?? 0, 0, '不得预置交锋计数');
        assert.equal(before.weapon, config.equipment?.type ?? 'none');
        if (config.equipment) assert.equal(before.weapon_damage, 50);
        assert.ok(raw.metrics[side] && typeof raw.metrics[side] === 'object', '计数缺失不是零');
        for (const event of raw.attacks.filter(a => a.actor === side)) {
            const allowed = config.equipment ? [config.equipment.type] : Object.keys(config.preparations);
            assert.ok(allowed.includes(event.attack_usage), '实际选技不属于本组合');
            assert.equal(event.attack_skill, config.mappings[event.attack_usage] ?? 0);
        }
    }
    const forceCalls = raw.passives.filter(e => e.route === 'force');
    for (const event of forceCalls) {
        assert.equal(event.actor, 0); assert.equal(event.target, 1);
        assert.equal(event.skill, p.actor.mappings.force); assert.equal(event.factor, p.actor.properties.jiali);
    }
    if (!p.actor.properties.jiali) assert.equal(forceCalls.length, 0);
    // Four mapped forces inherit FORCE.hit_ob; this opponent has no valid_damage force override.
    // No active ability and equal experience; original regeneration is accounted separately.
    assert.equal(raw.metrics[0].neili_cost ?? 0, forceCalls.length * p.actor.properties.jiali);
    assert.equal(raw.metrics[1].neili_cost ?? 0, 0);
}
