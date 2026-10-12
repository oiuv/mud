// Original Wudang weapon commands; qualification setup is not a teaching claim.
import assert from 'node:assert/strict';

export const wudangWeaponMoves = [
    { skill: 'wudang-jian', usage: 'sword', ability: 'sheng', minimum: 60, neili: 50, force: 80 },
    { skill: 'shenmen-jian', usage: 'sword', ability: 'ci', minimum: 120, neili: 200 },
    { skill: 'liangyi-jian', usage: 'sword', ability: 'ren', minimum: 120, neili: 200, max_neili: 1500, automatic: true },
    { skill: 'raozhi-roujian', usage: 'sword', ability: 'chuan', grant: 'chuankong', minimum: 100, neili: 250, force: 150 },
    { skill: 'rouyun-jian', usage: 'sword', ability: 'tao', minimum: 140, neili: 200, force: 180, dodge: 180 },
    { skill: 'xuanxu-dao', usage: 'blade', ability: 'huan', minimum: 80, neili: 250, force: 120 },
];

export function wudangWeaponConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(move, ability, level = 200, extra = {}) {
        const { skill, usage } = move, method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? skill : `${skill}/${ability}`));
        assert.ok(source, '缺少武当兵器能力原源码');
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry, '缺少武当兵器原入口');
        const force = ['wudang-jian', 'raozhi-roujian', 'wudang-zhang'].includes(skill) ? 'wudang-xinfa' : 'taiji-shengong';
        const actor = {
            skills: { [usage]: level, [skill]: level, force: level, [force]: level,
                dodge: level, tiyunzong: level, parry: level, taoism: level,
                'martial-cognize': level, ...extra.skills },
            mappings: { [usage]: skill, parry: skill, force, dodge: 'tiyunzong' },
            preparations: usage === 'strike' ? { strike: skill } : {},
            properties: { jiali: 0, neili: 6000, max_neili: 6000, int: 36, con: 36,
                combat_exp: 100000000, 'family/family_name': '武当派',
                ...(method === 'perform' && !move.automatic ? { [`can_perform/${skill}/${move.grant ?? ability}`]: 1 } : {}),
                ...extra.properties },
            ...(extra.noWeapon || usage === 'strike' ? {} : { equipment: { type: extra.weapon ?? usage, hold: false } }),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        result.push({ id: `school-wudang-weapons-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-weapons',
                combination: `${skill}+${force}`, skill, usage, ability, level, actor,
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
                    mappings: {}, properties: {},
                    ...(extra.unarmedTarget ? {} : { equipment: { type: 'sword', hold: false } }) },
                observation: 'single_action_immediate', action: method === 'ordinary' ? 'ordinary' : `perform ${usage}.${ability}`,
                fighting: extra.fighting ?? true, observe_seconds: 0, not_applicable: '', expected: extra.expected ?? 'observed',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${skill}.c`, `kungfu/skill/${force}.c`,
                    'kungfu/skill/tiyunzong.c', 'kungfu/class/wudang/zhang.c', 'kungfu/class/wudang/guxu.c',
                    'kungfu/class/wudang/yin.c', 'kungfu/class/wudang/xi.c', 'cmds/skill/perform.c',
                    'feature/skill.c', 'feature/action.c', 'feature/damage.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；武当目录实际已配置武学，按原valid_enable选择受测兵器和招架，不复制完整NPC。武当剑/绕指柔剑/武当掌使用武当心法，其余太极神功，均用梯云纵。技能和必要领悟为实验赋值，不证明教学或同养成成本；两仪剑无授招检查，绕指柔剑按真实chuankong键。中性目标最大内力6000，神门普攻被动被原最大内力门槛阻止，未冒充该被动已测。',
            } });
    }
    for (const level of [200, 400, 800]) {
        for (const move of wudangWeaponMoves) {
            add(move, 'ordinary', level); add(move, move.ability, level);
        }
        add({ skill: 'taiji-dao', usage: 'blade' }, 'ordinary', level);
        add({ skill: 'wudang-zhang', usage: 'strike' }, 'ordinary', level);
    }
    for (const move of wudangWeaponMoves) {
        const grant = `can_perform/${move.skill}/${move.grant ?? move.ability}`;
        const variants = [
            ['no-grant', { properties: { [grant]: 0 }, expected: move.automatic ? 'observed' : 'refused' }],
            ['low-neili', { properties: { neili: move.neili - 1 } }],
            ['low-skill', { skills: { [move.skill]: move.minimum - 1 } }],
            ['no-weapon', { noWeapon: true }],
            ['wrong-weapon', { weapon: move.usage === 'sword' ? 'blade' : 'sword' }],
            ['busy', { busy: true }], ['no-fight', { fighting: false }],
        ];
        for (const [suffix, opts] of variants) add(move, move.ability, 200,
            { checks: 2, expected: 'refused', ...opts, suffix: '-' + suffix });
        add(move, move.ability, 200, { suffix: '-minimum-skill', skills: { [move.skill]: move.minimum }, checks: 2 });
        add(move, move.ability, 200, { suffix: '-minimum-neili', properties: { neili: move.neili }, checks: 2 });
        for (const [field, minimum] of [['force', move.force], ['dodge', move.dodge]]) if (minimum) {
            const special = field === 'dodge' ? 'tiyunzong' : ['wudang-jian', 'raozhi-roujian'].includes(move.skill) ? 'wudang-xinfa' : 'taiji-shengong';
            for (const offset of [-1, 0]) add(move, move.ability, 200,
                { suffix: offset ? `-low-${field}` : `-minimum-${field}`, checks: 2,
                    // The original equipped test sword contributes apply/dodge=-1.
                    skills: { [field]: 2, [special]: minimum - 1 + offset + (field === 'dodge' ? 1 : 0) },
                    expected: offset ? 'refused' : 'observed' });
        }
        if (move.max_neili) for (const offset of [-1, 0]) add(move, move.ability, 200,
            { suffix: offset ? '-low-max-neili' : '-minimum-max-neili', checks: 2,
                properties: { max_neili: move.max_neili + offset }, expected: offset ? 'refused' : 'observed' });
        if (move.ability === 'ci') add(move, move.ability, 200,
            { suffix: '-unarmed-target', unarmedTarget: true, expected: 'refused', checks: 2 });
        if (move.grant) add(move, move.ability, 200, { suffix: '-wrong-grant-key', checks: 2, expected: 'refused',
            properties: { [grant]: 0, [`can_perform/${move.skill}/${move.ability}`]: 1 } });
        if (move.ability !== 'tao') for (const parry of [2, 100000]) add(move, move.ability, 200,
            { suffix: parry === 2 ? '-low-target-parry' : '-high-target-parry', checks: 2, targetSkills: { parry } });
    }
    return result;
}

export function validateWudangWeaponRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0], target = raw.immediate[1];
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    assert.deepEqual(before.preparations, p.actor.preparations);
    assert.equal(actor.max_neili, before.max_neili);
    assert.equal(actor.neili, before.neili - cost);
    const move = wudangWeaponMoves.find(m => m.skill === p.skill);
    for (const field of ['force', 'dodge']) {
        if (condition.id.endsWith(`-minimum-${field}`)) assert.equal(before.effective_skills[field], move[field]);
        if (condition.id.endsWith(`-low-${field}`)) assert.equal(before.effective_skills[field], move[field] - 1);
    }
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(raw.launches.length, 0);
        assert.equal(raw.attacks.length, 0); assert.equal(raw.dropped.length, 0); assert.ok(raw.reason.length > 0);
        assert.equal(target.weapon, raw.before[1].weapon); return;
    }
    const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0); assert.equal(attacks.length, 1); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill);
    assert.equal(actor.weapon, p.usage);
    if (p.ability === 'ci') {
        assert.equal(direct, 0); assert.equal(attacks.length, 0);
        const disarmed = target.weapon === 'none';
        assert.equal(raw.dropped.length, disarmed ? 1 : 0);
        assert.equal(cost, disarmed ? 120 : 40); assert.ok(disarmed ? [2, 3].includes(actor.busy) : actor.busy === 3);
        assert.equal(target.busy ?? 0, disarmed ? 2 : 0);
        assert.equal(raw.metrics[1].qi_cost ?? 0, 0); assert.equal(raw.metrics[1].eff_qi_cost ?? 0, 0);
        if (condition.id.endsWith('-low-target-parry')) assert.ok(disarmed);
        if (condition.id.endsWith('-high-target-parry')) assert.ok(!disarmed);
    } else if (p.ability === 'tao') {
        assert.equal(direct, 0); assert.equal(attacks.length, 3); assert.equal(cost, 150);
        assert.ok([1, 2, 3].includes(actor.busy));
        for (const key of ['attack', 'damage']) assert.equal(actor.temp.apply?.[key] ?? 0, before.temp.apply?.[key] ?? 0);
    } else {
        assert.ok(direct === 0 || direct === 1); assert.equal(attacks.length, 0);
        const fees = { sheng: [20, 30], ren: [100, 180], chuan: [60, 150], huan: [60, 180] };
        assert.ok(fees[p.ability]); assert.equal(cost, fees[p.ability][direct]);
        assert.equal(actor.busy, direct ? 2 : 3);
        if (condition.id.endsWith('-low-target-parry')) assert.equal(direct, 1);
        if (condition.id.endsWith('-high-target-parry')) assert.equal(direct, 0);
    }
}
