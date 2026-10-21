// Perform-strategy variants for existing bout schools (wudang/emei/shaolin/gumu).
// Each school adds representative perform-strategy bouts on existing profile routes.
import assert from 'node:assert/strict';
import { validateBoutRecord } from './bout_cases.mjs';
import { validateAttackRoundCounts } from './school_wudang_passive_cases.mjs';

// Representative perform per school: { skill, usage, perform (skill.move), force, dodge, teacher }
export const boutPerformProfiles = [
    // Wudang
    { school: 'wudang', family: '武当派', skill: 'taiji-quan', usage: 'unarmed',
        perform: 'taiji-quan.ji', force: 'taiji-shengong', dodge: 'tiyunzong', teacher: 'zhang' },
    { school: 'wudang', family: '武当派', skill: 'taiji-jian', usage: 'sword',
        perform: 'taiji-jian.chan', force: 'taiji-shengong', dodge: 'tiyunzong', teacher: 'zhang', armed: true },
    // Shaolin
    { school: 'shaolin', family: '少林派', skill: 'damo-jian', usage: 'sword',
        perform: 'damo-jian.luan', force: 'hunyuan-yiqi', dodge: 'shaolin-shenfa', teacher: 'cheng-shang', armed: true },
    { school: 'shaolin', family: '少林派', skill: 'luohan-quan', usage: 'cuff',
        perform: 'luohan-quan.xiangmo', force: 'hunyuan-yiqi', dodge: 'shaolin-shenfa', teacher: 'cheng-yi' },
    // Emei
    { school: 'emei', family: '峨嵋派', skill: 'emei-jian', usage: 'sword',
        perform: 'emei-jian.xian', force: 'linji-zhuang', dodge: 'zhutian-bu', teacher: 'xuan', armed: true },
    { school: 'emei', family: '峨嵋派', skill: 'huifeng-jian', usage: 'sword',
        perform: 'huifeng-jian.jue', force: 'linji-zhuang', dodge: 'zhutian-bu', teacher: 'miejue', armed: true },
    // Gumu (need to verify performs exist)
    { school: 'gumu', family: '古墓派', skill: 'meinv-quan', usage: 'unarmed',
        perform: 'meinv-quan.you', force: 'yunv-xinjing', dodge: 'yunv-shenfa', teacher: 'yang' },
];

export function boutPerformConditions(catalog, { smoke = false } = {}) {
    const properties = { str: 36, int: 36, con: 36, dex: 36, combat_exp: 10000000,
        qi: 10000, eff_qi: 10000, max_qi: 10000, neili: 6000, max_neili: 6000, jiali: 0 };
    return boutPerformProfiles.flatMap(profile =>
        [0, 50].map(jiali => {
            const { school, family, skill, usage, perform, force, dodge, teacher, armed = false } = profile;
            const [perfSkill, perfMove] = perform.split('.');
            const special = [skill, force, dodge];
            const paths = special.map(id => {
                const source = catalog.skills.find(s => s.id === id);
                assert.ok(source, '缺少组合源码：' + id);
                return source.path;
            });
            const skills = Object.fromEntries(
                ['force', 'dodge', 'parry', usage, ...special].map(id => [id, 400]));
            return {
                id: `school-${school}-bout-perform-${skill}-l400-jiali${jiali}`,
                stage: 'school',
                entry_id: paths[0], method: 'bout', samples: smoke ? 2 : 20,
                parameters: {
                    school, family, collection_group: school + '-bout-perform',
                    combination: skill, skill, usage, paired: false,
                    ability: 'bout_perform', level: 400,
                    observation: 'original_heartbeat_bout', strategy: 'perform',
                    first: 'alternating_index',
                    actor: {
                        skills,
                        mappings: { force, dodge, parry: skill, [usage]: skill },
                        preparations: armed ? {} : { [usage]: skill },
                        ...(armed ? { equipment: { type: usage === 'sword' ? 'sword' : usage, hold: false } } : {}),
                        properties: {
                            ...properties, jiali,
                            gender: school === 'emei' ? '女性' : '男性',
                            'family/family_name': family,
                            [`can_perform/${perfSkill}/${perfMove}`]: 1,
                        },
                    },
                    target: {
                        skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                        mappings: {}, preparations: {},
                        properties: { ...properties },
                        equipment: { type: 'sword', hold: false },
                    },
                    action: 'perform ' + usage + '.' + perfMove,
                    fighting: true,
                    observe_seconds: smoke ? 3 : 30,
                    expected: 'observed', not_applicable: '',
                    qualification_sources: [
                        ...paths,
                        `kungfu/skill/${perfSkill}/${perfMove}.c`,
                        `kungfu/class/${school}/${teacher}.c`,
                        'feature/attack.c', 'feature/action.c', 'feature/skill.c',
                        'feature/attribute.c', 'feature/damage.c',
                        'inherit/char/char.c', 'inherit/skill/force.c',
                        'adm/daemons/combatd.c', 'include/combat.h',
                        'cmds/skill/perform.c',
                    ],
                    qualification_note: '400级实验组合绝招策略交锋，心跳内自动施展' + perform + '。'
                        + '原USER心跳、自然恢复及30秒计时，每条件20场交替先手。'
                        + (armed ? '持相应兵器。' : '空手施展。') + '保留原busy/费用/随机。'
                        + '双方先天36、气血10000、内力6000、经验10000000。',
                },
            };
        }),
    );
}

export function validateBoutPerformRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(condition.method, 'bout');
    assert.equal(raw.method, 'bout');
    assert.equal(p.strategy, 'perform');
    assert.equal(raw.outcome, p.expected);
    assert.equal(p.observation, 'original_heartbeat_bout');
    assert.equal(raw.interfaces.length, 0);
    validateBoutRecord(raw, condition);
    validateAttackRoundCounts(raw);
    assert.equal(typeof raw.before[0].object, 'string', '须记录真实施展对象');
    assert.ok(raw.before[0].object.length > 0);
    // Must have at least one launch by the real actor, not undefined === undefined.
    assert.ok(raw.launches.some(row => row.actor === raw.before[0].object),
        '绝招策略组没有实际发动');
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side];
        assert.equal(before.userp, 1);
        assert.equal(before.interactive, 1);
        assert.equal(before.wizardp, 0);
        assert.deepEqual(before.skills, config.skills);
        assert.deepEqual(before.mappings, config.mappings);
        assert.deepEqual(before.preparations, config.preparations);
        assert.equal(before.weapon, config.equipment?.type ?? 'none');
        for (const key of ['jiali', 'neili', 'max_neili', 'qi', 'max_qi', 'eff_qi'])
            assert.equal(before[key], config.properties[key], '交锋初态不符：' + key);
    }
}
