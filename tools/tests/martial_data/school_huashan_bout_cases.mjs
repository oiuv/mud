// Source-backed player combinations with original heartbeat bouts; not teacher clones.
import assert from 'node:assert/strict';
import { validateBoutRecord } from './bout_cases.mjs';
import { validateAttackRoundCounts } from './school_wudang_passive_cases.mjs';

export const huashanBoutProfiles = [
    { skill: 'poyu-quan', usage: 'cuff', pair: ['strike', 'hunyuan-zhang'],
        teacher: 'feng-buping', perform: 'poyu-quan.po' },
    { skill: 'huashan-quan', usage: 'cuff', pair: ['strike', 'huashan-zhang'],
        teacher: 'feng-buping', perform: 'huashan-quan.song' },
    // huashan-quanfa/zhangfa have no perform subdirectory — ordinary strategy only
    { skill: 'huashan-quanfa', usage: 'cuff', pair: ['strike', 'huashan-zhangfa'],
        teacher: 'feng-buping', perform: null },
];

export function huashanBoutConditions(catalog, { smoke = false } = {}) {
    const properties = { str: 36, int: 36, con: 36, dex: 36, combat_exp: 10000000,
        qi: 10000, eff_qi: 10000, max_qi: 10000, neili: 6000, max_neili: 6000, jiali: 0 };
    return huashanBoutProfiles.flatMap(profile =>
        [0, 50].flatMap(jiali =>
            (profile.perform ? ['ordinary', 'perform'] : ['ordinary']).map(strategy => {
                const { skill, usage, pair, teacher, perform } = profile;
                const armed = false;  // All pairs are cuff/strike, unarmed
                const combination = skill + '-' + pair[1];
                const special = [skill, 'zixia-shengong', 'huashan-shenfa',
                    'huashan-jian', pair[1]];
                const paths = special.map(id => {
                    const source = catalog.skills.find(s => s.id === id);
                    assert.ok(source, '缺少华山组合源码：' + id);
                    return source.path;
                });
                const skills = Object.fromEntries(
                    ['force', 'dodge', 'parry', usage, pair[0], 'sword',
                        ...special].map(id => [id, 400]));
                return {
                    id: `school-huashan-bout-${combination}-l400-jiali${jiali}-${strategy}`,
                    stage: 'school',
                    entry_id: paths[0], method: 'bout', samples: smoke ? 2 : 20,
                    parameters: {
                        school: 'huashan', family: '华山派', collection_group: 'huashan-bout',
                        combination, skill, usage, paired: true, ability: 'bout', level: 400,
                        observation: 'original_heartbeat_bout', strategy,
                        first: 'alternating_index',
                        actor: {
                            skills,
                            mappings: {
                                force: 'zixia-shengong', dodge: 'huashan-shenfa',
                                parry: skill, sword: 'huashan-jian',
                                [usage]: skill, [pair[0]]: pair[1],
                            },
                            preparations: { [usage]: skill, [pair[0]]: pair[1] },
                            properties: {
                                ...properties, jiali,
                                gender: '男性', 'family/family_name': '华山派',
                                ...(perform ? { [`can_perform/${perform.split('.')[0]}/${perform.split('.')[1]}`]: 1 } : {}),
                            },
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
                            `kungfu/class/huashan/${teacher}.c`,
                            'kungfu/class/huashan/jianzong.h',
                            'kungfu/class/huashan/qizong.h',
                            'feature/attack.c', 'feature/action.c', 'feature/skill.c',
                            'feature/attribute.c', 'feature/damage.c',
                            'inherit/char/char.c', 'inherit/skill/force.c',
                            'adm/daemons/combatd.c', 'include/combat.h',
                            'kungfu/skill/sword.c',
                            ...(perform ? ['kungfu/skill/' + perform.split('.')[0] + '/' + perform.split('.')[1] + '.c'] : []),
                        ],
                        qualification_note: '400级实验组合，参考风不平/岳不群的武学与紫霞神功/华山身法配置，不复制NPC属性。'
                            + '三组互备各自独立（劈石破玉拳↔混元掌、华山拳↔华山掌、华山拳法↔华山掌法），跨组互备拒绝。'
                            + '原USER心跳、自然恢复及30秒计时，每条件20场交替先手。'
                            + '普通策略不自动施展绝招；绝招策略心跳内尝试' + perform + '。'
                            + '双方先天36、气血10000、内力6000、经验10000000；右方基本内功/闪躲/招架600、剑法200。'
                            + '内力支出、恢复和净变化分别观察。',
                    },
                };
            }),
        ),
    );
}

export function validateHuashanBoutRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'huashan');
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
    }
    if (p.strategy === 'perform') {
        assert.ok(raw.launches.some(row => row.actor === raw.before[0].object),
            '绝招策略组没有实际发动');
    }
}
