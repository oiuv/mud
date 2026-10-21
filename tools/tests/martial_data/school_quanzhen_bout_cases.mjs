// Source-backed player combinations with original heartbeat bouts; not teacher clones.
import assert from 'node:assert/strict';
import { validateBoutRecord } from './bout_cases.mjs';
import { validateAttackRoundCounts } from './school_wudang_passive_cases.mjs';

export const quanzhenBoutProfiles = [
    { skill: 'chongyang-shenzhang', usage: 'strike', pair: ['finger', 'zhongnan-zhi'],
        teacher: 'cui', perform: 'chongyang-shenzhang.lian' },
    { skill: 'haotian-zhang', usage: 'strike', pair: ['hand', 'qixing-shou'],
        teacher: 'hao', perform: 'haotian-zhang.ju' },
    { skill: 'kongming-quan', usage: 'unarmed', teacher: 'ma', perform: 'kongming-quan.kong' },
];

export function quanzhenBoutConditions(catalog, { smoke = false } = {}) {
    const properties = { str: 36, int: 36, con: 36, dex: 36, combat_exp: 10000000,
        qi: 10000, eff_qi: 10000, max_qi: 10000, neili: 6000, max_neili: 6000, jiali: 0 };
    return quanzhenBoutProfiles.flatMap(profile =>
        [0, 50].flatMap(jiali =>
            ['ordinary', 'perform'].map(strategy => {
                const { skill, usage, pair, teacher, perform } = profile;
                const armed = usage !== 'unarmed' && strategy !== 'perform';
                const combination = skill + (pair ? '-' + pair[1] : '');
                const special = [skill, 'quanzhen-xinfa', 'tianshan-feidu', 'quanzhen-jian',
                    ...(pair ? [pair[1]] : [])];
                const paths = special.map(id => {
                    const source = catalog.skills.find(s => s.id === id);
                    assert.ok(source, '缺少全真组合源码：' + id);
                    return source.path;
                });
                const skills = Object.fromEntries(['force', 'dodge', 'parry', usage, 'sword',
                    ...special, ...(pair ? [pair[0]] : [])].map(id => [id, 400]));
                return {
                    id: `school-quanzhen-bout-${combination}-l400-jiali${jiali}-${strategy}`,
                    stage: 'school',
                    entry_id: paths[0], method: 'bout', samples: smoke ? 2 : 20,
                    parameters: {
                        school: 'quanzhen', family: '全真教', collection_group: 'quanzhen-bout',
                        combination, skill, usage, paired: !!pair, ability: 'bout', level: 400,
                        observation: 'original_heartbeat_bout', strategy,
                        first: 'alternating_index',
                        actor: {
                            skills,
                            mappings: {
                                force: 'quanzhen-xinfa', dodge: 'tianshan-feidu', parry: skill,
                                sword: 'quanzhen-jian', [usage]: skill,
                                ...(pair ? { [pair[0]]: pair[1] } : {}),
                            },
                            preparations: armed ? {} : {
                                [usage]: skill, ...(pair ? { [pair[0]]: pair[1] } : {}),
                            },
                            properties: {
                                ...properties, jiali,
                                gender: '男性', 'family/family_name': '全真教',
                                [`can_perform/${perform.split('.')[0]}/${perform.split('.')[1]}`]: 1,
                            },
                            ...(armed && strategy !== 'perform' ? { equipment: { type: usage === 'strike' ? 'sword' : usage, hold: false } } : {}),
                        },
                        target: {
                            skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                            mappings: {}, preparations: {},
                            properties: { ...properties },
                            equipment: { type: 'sword', hold: false },
                        },
                        action: strategy === 'perform' ? 'perform ' + usage + '.' + perform.split('.')[1] : 'ordinary',
                        fighting: true,
                        observe_seconds: smoke ? 3 : 30,
                        expected: 'observed', not_applicable: '',
                        qualification_sources: [
                            ...paths,
                            `kungfu/class/quanzhen/${teacher}.c`,
                            'kungfu/class/quanzhen/quanzhen.h',
                            'feature/attack.c', 'feature/action.c', 'feature/skill.c',
                            'feature/attribute.c', 'feature/damage.c',
                            'inherit/char/char.c', 'inherit/skill/force.c',
                            'adm/daemons/combatd.c', 'include/combat.h',
                            'kungfu/skill/sword.c',
                            'kungfu/skill/' + perform.split('.')[0] + '/' + perform.split('.')[1] + '.c',
                        ],
                        qualification_note: '400级实验组合，参考全真教师的武学与全真心法/天山飞渡配置，不复制NPC属性或声称教师可授400级。'
                            + '互备来自两组原valid_combine声明（重阳神掌↔终南指法、昊天掌↔七星手），空明拳无互备接口可单备。'
                            + '原USER心跳、自然恢复及30秒计时，每条件20场交替先手。'
                            + '普通策略不自动施展绝招；绝招策略心跳内尝试' + perform + '，保留原busy/费用/随机。'
                            + '双方先天36、气血10000、内力6000、经验10000000；右方基本内功/闪躲/招架600、剑法200。'
                            + '持器使用伤害50标准演武兵器。内力支出、恢复和净变化分别观察，不冒充同培养成本或全真全部组合。',
                    },
                };
            }),
        ),
    );
}

export function validateQuanzhenBoutRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'quanzhen');
    assert.equal(raw.outcome, p.expected);
    assert.equal(p.observation, 'original_heartbeat_bout');
    if (p.strategy === 'ordinary') {
        assert.equal(raw.launches.length, 0, '普通策略不得主动施展绝招');
    }
    assert.equal(raw.interfaces.length, 0);
    validateBoutRecord(raw, condition);
    validateAttackRoundCounts(raw);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side];
        assert.equal(before.userp, 1);
        assert.equal(before.interactive, 1);
        assert.equal(before.wizardp, 0);
        assert.deepEqual(before.mappings, config.mappings);
        assert.deepEqual(before.preparations, config.preparations);
        for (const [key, value] of Object.entries(config.skills))
            assert.equal(before.skills[key], value, '技能等级不符：' + key);
        for (const key of ['str', 'int', 'con', 'dex', 'combat_exp', 'qi', 'eff_qi', 'max_qi', 'neili', 'max_neili', 'jiali'])
            assert.equal(before[key], config.properties[key], '初态不符：' + key);
        assert.equal(before.temp.combat_time ?? 0, 0, '不得预置交锋计数');
        assert.equal(before.weapon, config.equipment?.type ?? 'none');
        if (config.equipment) assert.equal(before.weapon_damage, 50);
        for (const event of raw.attacks.filter(a => a.actor === side)) {
            const allowed = config.equipment
                ? [config.equipment.type]
                : Object.keys(config.preparations);
            assert.ok(allowed.includes(event.attack_usage),
                '实际选技不属于本组合：' + event.attack_usage);
        }
    }
    const forceCalls = raw.passives.filter(e => e.route === 'force');
    for (const e of forceCalls) {
        assert.ok(e.actor === 0 || e.actor === 1, '内功调用归属异常');
    }
    if (p.strategy === 'perform') {
        assert.ok(raw.launches.some(row => row.actor === raw.before[0].object),
            '绝招策略组没有实际发动');
    }
}
