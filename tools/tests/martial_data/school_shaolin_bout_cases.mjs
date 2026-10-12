// Assembled player combinations, not teacher clones or equal-training-cost rankings.
import assert from 'node:assert/strict';
import { validateBoutRecord } from './bout_cases.mjs';
import { validateAttackRoundCounts } from './school_wudang_passive_cases.mjs';

export const shaolinBoutProfiles = [
    { skill: 'damo-jian', usage: 'sword', teacher: 'cheng-shang' },
    { skill: 'xiuluo-dao', usage: 'blade', teacher: 'cheng-xin2' },
    { skill: 'weituo-gun', usage: 'club', teacher: 'cheng-ji' },
    { skill: 'weituo-chu', usage: 'staff', teacher: 'cheng-ji' },
    { skill: 'luohan-quan', usage: 'cuff', teacher: 'cheng-yi' },
    { skill: 'luohan-quan', usage: 'cuff', teacher: 'cheng-yi', paired: true },
];

export function shaolinBoutConditions(catalog, { smoke = false } = {}) {
    const properties = { str: 36, int: 36, con: 36, dex: 36, combat_exp: 10000000,
        qi: 10000, eff_qi: 10000, max_qi: 10000, neili: 6000, max_neili: 6000, jiali: 0 };
    return shaolinBoutProfiles.flatMap(profile => [0, 50].map(jiali => {
        const { skill, usage, teacher, paired = false } = profile;
        const armed = usage !== 'cuff', combination = skill + (paired ? '-qinna-shibada' : '');
        const skills = Object.fromEntries(['force', 'hunyuan-yiqi', 'dodge', 'shaolin-shenfa',
            'parry', 'buddhism', usage, skill, ...(paired ? ['unarmed', 'qinna-shibada'] : [])]
            .map(id => [id, 400]));
        const paths = [skill, 'hunyuan-yiqi', 'shaolin-shenfa', 'buddhism', ...(paired ? ['qinna-shibada'] : [])]
            .map(id => {
                const source = catalog.skills.find(s => s.id === id);
                assert.ok(source, '缺少少林组合源码：' + id);
                return source.path;
            });
        return { id: `school-shaolin-bout-${combination}-l400-jiali${jiali}`, stage: 'school',
            entry_id: paths[0], method: 'bout', samples: smoke ? 2 : 20,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-bout',
                combination, skill, usage, paired, ability: 'bout', level: 400,
                observation: 'original_heartbeat_bout', strategy: 'ordinary', first: 'alternating_index',
                actor: { skills, mappings: { force: 'hunyuan-yiqi', dodge: 'shaolin-shenfa', parry: skill,
                    [usage]: skill, ...(paired ? { unarmed: 'qinna-shibada' } : {}) },
                    preparations: armed ? {} : { cuff: skill, ...(paired ? { unarmed: 'qinna-shibada' } : {}) },
                    properties: { ...properties, jiali, gender: '男性', 'family/family_name': '少林派' },
                    ...(armed ? { equipment: { type: usage, hold: false } } : {}) },
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 }, mappings: {},
                    preparations: {}, properties: { ...properties }, equipment: { type: 'sword', hold: false } },
                action: 'ordinary', fighting: true, observe_seconds: smoke ? 3 : 30,
                expected: 'observed', not_applicable: '',
                qualification_sources: [...paths, `kungfu/class/shaolin/${teacher}.c`,
                    ...(paired ? ['kungfu/class/shaolin/cheng-zhi.c'] : []),
                    'kungfu/class/shaolin/cheng.h', 'kungfu/class/shaolin/shaolin.h',
                    'feature/attack.c', 'feature/skill.c', 'feature/damage.c', 'inherit/char/char.c',
                    'inherit/skill/force.c', 'inherit/skill/shaolin.c', 'adm/daemons/combatd.c',
                    'include/combat.h', 'kungfu/skill/sword.c'],
                qualification_note: '400级实验组合，参考澄字辈教师的武学与混元一气功/少林身法配置，不复制NPC属性或声称教师可授400级。韦陀杵是澄寂已学技能而非其当前持器映射；互备来自两门原valid_combine声明，不声称某NPC原配置双备。原USER心跳、自然恢复及30秒计时，每条件20场、交替先手；仅普通策略，不自动perform/exert。双方先天36、气血10000、内力6000、经验10000000；右方基本内功/闪躲/招架600、剑法200，无映射、加力0。持器使用伤害50标准演武兵器，原类别及双手标志保留。prepare_skill仅为明确初态，计数与随机不预置。内力支出、恢复和净变化分别观察，不冒充同培养成本或全少林组合。',
            } };
    }));
}

export function validateShaolinBoutRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'shaolin'); assert.equal(raw.outcome, p.expected);
    assert.equal(p.observation, 'original_heartbeat_bout');
    assert.equal(raw.launches.length, 0, '普通策略不得主动施展绝招');
    assert.equal(raw.interfaces.length, 0);
    validateBoutRecord(raw, condition);
    validateAttackRoundCounts(raw);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side];
        assert.equal(before.userp, 1); assert.equal(before.interactive, 1); assert.equal(before.wizardp, 0);
        assert.deepEqual(before.mappings, config.mappings);
        assert.deepEqual(before.preparations, config.preparations);
        for (const [key, value] of Object.entries(config.skills)) assert.equal(before.skills[key], value);
        for (const key of ['str', 'int', 'con', 'dex', 'combat_exp', 'qi', 'eff_qi', 'max_qi', 'neili', 'max_neili', 'jiali'])
            assert.equal(before[key], config.properties[key], '初态不符：' + key);
        assert.equal(before.temp.combat_time ?? 0, 0, '不得预置交锋计数');
        assert.equal(before.weapon, config.equipment?.type ?? 'none');
        if (config.equipment) assert.equal(before.weapon_damage, 50);
        for (const event of raw.attacks.filter(a => a.actor === side)) {
            const allowed = config.equipment ? [config.equipment.type] : Object.keys(config.preparations);
            assert.ok(allowed.includes(event.attack_usage), '实际选技不属于本组合');
            assert.equal(event.attack_skill, config.mappings[event.attack_usage] ?? 0,
                '实际映射必须保留原LPC零值或武学ID');
        }
    }
    const forces = raw.passives.filter(e => e.route === 'force');
    for (const event of forces) {
        assert.equal(event.actor, 0); assert.equal(event.target, 1);
        assert.equal(event.skill, 'hunyuan-yiqi'); assert.equal(event.factor, p.actor.properties.jiali);
    }
    if (!p.actor.properties.jiali) assert.equal(forces.length, 0);
    assert.equal(raw.metrics[0].neili_cost ?? 0, forces.length * p.actor.properties.jiali);
    assert.equal(raw.metrics[1].neili_cost ?? 0, 0);
}
