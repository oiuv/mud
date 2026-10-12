// Explicit experimental qualifications, not a claim about normal training cost.
export const profiles = [
    { type: 'axe', basic: 'axe', skill: 'pangu-qishi', move: 'kai' },
    { type: 'blade', basic: 'blade', skill: 'hujia-daofa', move: 'cang' },
    { type: 'club', basic: 'club', skill: 'jinyuan-gun', move: 'qian' },
    { type: 'dagger', basic: 'dagger', skill: 'jingyue-bifa', move: 'ci' },
    { type: 'hammer', basic: 'hammer', skill: 'hanshan-chuifa', move: 'zhen' },
    { type: 'pin', basic: 'sword', skill: 'pixie-jian', move: 'pi' },
    { type: 'spear', basic: 'spear', skill: 'zhongping-qiang', move: 'ding' },
    { type: 'staff', basic: 'staff', skill: 'dagou-bang', move: 'chan' },
    { type: 'sword', basic: 'sword', skill: 'huashan-jian', move: 'lian' },
    { type: 'throwing', basic: 'throwing', skill: 'jinshe-zhui', move: 'tuwu' },
    { type: 'whip', basic: 'whip', skill: 'chanhun-suo', move: 'duo' },
    { type: 'xsword', basic: 'sword', skill: 'yuxiao-jian', move: 'qing' },
];

export function weaponConditions(catalog, { smoke = false, samples = 100, level = 200 } = {}) {
    const result = [];
    for (const profile of profiles) {
        const skill = catalog.skills.find(s => s.id === `${profile.skill}/${profile.move}`);
        if (!skill) throw new Error(`入口未收录：${profile.skill}/${profile.move}`);
        for (const jiali of smoke ? [0] : [0, 50]) {
            for (const method of ['ordinary', 'perform', ...(smoke ? ['refusal'] : [])]) {
                const actor = {
                    skills: { force: 600, dodge: 600, parry: 600, 'martial-cognize': level,
                        [profile.basic]: level, [profile.skill]: level },
                    mappings: { [profile.basic]: profile.skill },
                    properties: { jiali, [`can_perform/${profile.skill}/${profile.move}`]: 1,
                        ...(method === 'refusal' ? { neili: 0 } : {}) },
                    equipment: { type: profile.type, hold: profile.type === 'throwing',
                        provider: catalog.weapon_types.find(t => t.macro === profile.type.toUpperCase()).provider },
                };
                result.push({ id: `${profile.type}-${method}-l${level}-j${jiali}`, stage: 'weapon',
                    entry_id: method === 'ordinary' ? catalog.skills.find(s => s.id === profile.skill).path
                        : skill.entries.find(e => e.role === 'perform').id,
                    samples: smoke ? 2 : samples, method,
                    parameters: { profile, actor,
                        target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                            mappings: {}, properties: {}, equipment: { type: 'sword', hold: false } },
                        action: method === 'ordinary' ? 'ordinary' : `perform ${profile.basic}.${profile.move}`,
                        fighting: true, observe_seconds: 0,
                        not_applicable: method === 'ordinary' && profile.type === 'throwing'
                            ? '暗器不可 wield，不用徒手普攻或强行传入暗器代替不存在的持器普攻。' : '',
                        qualification_sources: [skill.path, 'cmds/skill/perform.c'],
                        expected: method === 'refusal' ? 'refused' : method === 'ordinary' && profile.type === 'throwing'
                            ? 'not_applicable' : 'observed' },
                });
            }
        }
    }
    return result;
}
