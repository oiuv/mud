// Source-backed player combinations with original heartbeat bouts; not teacher clones.
import assert from 'node:assert/strict';
import { validateBoutRecord } from './bout_cases.mjs';
import { validateAttackRoundCounts } from './school_wudang_passive_cases.mjs';

const perfUsageMap = { 'pikong-zhang': 'strike', 'luoying-shenzhang': 'strike', 'xuanfeng-tui': 'unarmed', 'lanhua-shou': 'hand' };

export const taohuaBoutProfiles = [
    { skill: 'xuanfeng-tui', usage: 'unarmed', pair: ['strike', 'pikong-zhang'],
        teacher: 'feng', perform: 'pikong-zhang.dai' },
    { skill: 'lanhua-shou', usage: 'hand', pair: ['strike', 'luoying-shenzhang'],
        teacher: 'chen', perform: 'luoying-shenzhang.zhuan' },
];

export function taohuaBoutConditions(catalog, { smoke = false } = {}) {
    const properties = { str: 36, int: 36, con: 36, dex: 36, combat_exp: 10000000,
        qi: 10000, eff_qi: 10000, max_qi: 10000, neili: 6000, max_neili: 6000, jiali: 0 };
    return taohuaBoutProfiles.flatMap(profile =>
        [0, 50].flatMap(jiali =>
            ['ordinary', 'perform'].map(strategy => {
                const { skill, usage, pair, teacher, perform } = profile;
                const armed = false;  // Both pairs are unarmed/hand/strike
                const combination = skill + '-' + pair[1];
                const special = [skill, 'luoying-xinfa', 'anying-fuxiang', pair[1], 'qimen-wuxing'];
                const paths = special.map(id => {
                    const source = catalog.skills.find(s => s.id === id);
                    assert.ok(source, '缺少桃花组合源码：' + id);
                    return source.path;
                });
                const skills = Object.fromEntries(
                    ['force', 'dodge', 'parry', usage, pair[0],
                        ...special].map(id => [id, 400]));
                return {
                    id: `school-taohua-bout-${combination}-l400-jiali${jiali}-${strategy}`,
                    stage: 'school',
                    entry_id: paths[0], method: 'bout', samples: smoke ? 2 : 20,
                    parameters: {
                        school: 'taohua', family: '桃花岛', collection_group: 'taohua-bout',
                        combination, skill, usage, paired: true, ability: 'bout', level: 400,
                        observation: 'original_heartbeat_bout', strategy,
                        first: 'alternating_index',
                        actor: {
                            skills,
                            mappings: {
                                force: 'luoying-xinfa', dodge: 'anying-fuxiang',
                                parry: skill, [usage]: skill, [pair[0]]: pair[1],
                            },
                            preparations: { [usage]: skill, [pair[0]]: pair[1] },
                            properties: {
                                ...properties, jiali,
                                gender: '男性', 'family/family_name': '桃花岛',
                                [`can_perform/${perform.split('.')[0]}/${perform.split('.')[1]}`]: 1,
                            },
                        },
                        target: {
                            skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                            mappings: {}, preparations: {},
                            properties: { ...properties },
                            equipment: { type: 'sword', hold: false },
                        },
                        action: strategy === 'perform' ? 'perform ' + perfUsageMap[perform.split('.')[0]] + '.' + perform.split('.')[1] : 'ordinary',
                        fighting: true,
                        observe_seconds: smoke ? 3 : 30,
                        expected: 'observed', not_applicable: '',
                        qualification_sources: [
                            ...paths,
                            `kungfu/class/taohua/${teacher}.c`,
                            'kungfu/class/taohua/taohua.h',
                            'feature/attack.c', 'feature/action.c', 'feature/skill.c',
                            'feature/attribute.c', 'feature/damage.c',
                            'inherit/char/char.c', 'inherit/skill/force.c',
                            'adm/daemons/combatd.c', 'include/combat.h',
                            'kungfu/skill/' + perform.split('.')[0] + '/' + perform.split('.')[1] + '.c',
                        ],
                        qualification_note: '400级实验组合，参考桃花教师的武学与落英心法/暗影浮香配置，不复制NPC属性。'
                            + '旋风腿↔劈空掌、兰花手↔落英神剑掌为双向互备。'
                            + '原USER心跳、自然恢复及30秒计时，每条件20场交替先手。'
                            + '普通策略不自动施展绝招；绝招策略心跳内尝试' + perform + '。'
                            + '双方先天36、气血10000、内力6000、经验10000000。',
                    },
                };
            }),
        ),
    );
}

export function validateTaohuaBoutRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'taohua');
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
