// Original Wudang unarmed/throwing commands, not a replacement combat model.
import assert from 'node:assert/strict';

export const wudangUnarmedMoves = [
    { skill: 'zhenshan-zhang', usage: 'strike', ability: 'da', minimum: 40, neili: 50 },
    { skill: 'huzhua-shou', usage: 'claw', ability: 'juehu', minimum: 120, neili: 300 },
    { skill: 'xuangong-quan', usage: 'unarmed', ability: 'xuan', minimum: 120, neili: 200 },
    { skill: 'yitian-zhang', usage: 'strike', ability: 'zheng', minimum: 120, neili: 500 },
    { skill: 'furong-jinzhen', usage: 'throwing', ability: 'xian', minimum: 80, neili: 150 },
];

export function wudangUnarmedConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(move, ability, level = 200, extra = {}) {
        const { skill, usage } = move, throwing = usage === 'throwing';
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? skill : `${skill}/${ability}`));
        assert.ok(source, '缺少武当徒手/暗器原源码');
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry, '缺少武当徒手/暗器原入口');
        const actor = {
            skills: { [usage]: level, [skill]: level, force: level, 'taiji-shengong': level,
                dodge: level, tiyunzong: level, parry: level, taoism: level,
                'martial-cognize': level, ...extra.skills },
            mappings: { [usage]: skill, ...(throwing ? {} : { parry: skill }),
                force: 'taiji-shengong', dodge: 'tiyunzong' },
            preparations: throwing || extra.unprepared ? {} : { [usage]: skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, int: 36, con: 36,
                shen: 200000, combat_exp: 100000000, 'family/family_name': '武当派',
                ...(method === 'perform' ? { [`can_perform/${skill}/${ability}`]: 1 } : {}), ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } }
                : throwing && !extra.noAmmo ? { equipment: { type: 'throwing', hold: true } } : {}),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.unmapped) delete actor.mappings[usage];
        result.push({ id: `school-wudang-unarmed-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-unarmed',
                combination: `${skill}+taiji-shengong`, skill, usage, ability, level, actor,
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
                    mappings: {}, properties: {}, equipment: { type: 'sword', hold: false } },
                observation: 'single_action_immediate', action: method === 'ordinary' ? 'ordinary' : `perform ${usage}.${ability}`,
                fighting: extra.fighting ?? true, observe_seconds: 0, not_applicable: '', expected: extra.expected ?? 'observed',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${skill}.c`,
                    'kungfu/skill/taiji-shengong.c', 'kungfu/skill/tiyunzong.c', 'kungfu/class/wudang/zhang.c',
                    'kungfu/class/wudang/yu.c', 'kungfu/class/wudang/mo.c', 'kungfu/class/wudang/shan.c',
                    'cmds/skill/perform.c', 'feature/skill.c', 'feature/action.c', 'feature/damage.c',
                    'inherit/item/combined.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；武当教师实际配置的单项武学，配太极神功与梯云纵，不复制完整NPC。徒手按valid_enable映射并prepare；虎爪属于claw。芙蓉使用真实THROWING的10枚中性弹药、hand持用、不伪装wield，不含特定暗器毒性或附加hit_ob。领悟/技能/正气仅实验赋值，不证明师承或同养成成本。排云手没有独立绝招文件，本批只采普通攻击；芙蓉不以徒手普攻冒充投掷。',
            } });
    }
    for (const level of [200, 400, 800]) {
        for (const move of [...wudangUnarmedMoves.filter(m => m.usage !== 'throwing'), { skill: 'paiyun-shou', usage: 'hand' }]) {
            add(move, 'ordinary', level);
            add(move, 'ordinary', level, { suffix: '-jiali50', properties: { jiali: 50 } });
        }
        for (const move of wudangUnarmedMoves) add(move, move.ability, level);
    }
    for (const move of wudangUnarmedMoves) {
        const variants = [
            ['no-grant', { properties: { [`can_perform/${move.skill}/${move.ability}`]: 0 } }],
            ['low-skill', { skills: { [move.skill]: move.minimum - 1 } }],
            ['low-neili', { properties: { neili: move.neili - 1 } }],
            ['busy', { busy: true }], ['no-fight', { fighting: false }], ['unmapped', { unmapped: true }],
            ...(move.usage === 'throwing' ? [['no-ammo', { noAmmo: true }], ['weapon-not-ammo', { weapon: true }]]
                : [['armed', { weapon: true }], ['unprepared', { unprepared: true }]]),
        ];
        for (const [suffix, opts] of variants) add(move, move.ability, 200,
            { ...opts, suffix: '-' + suffix, checks: 2, expected: 'refused' });
        add(move, move.ability, 200, { suffix: '-minimum-skill', skills: { [move.skill]: move.minimum }, checks: 2 });
        add(move, move.ability, 200, { suffix: '-minimum-neili', properties: { neili: move.neili }, checks: 2 });
        const field = move.ability === 'juehu' ? 'parry' : 'force';
        if (['da', 'xuan', 'juehu'].includes(move.ability)) {
            add(move, move.ability, 200, { suffix: '-low-defense', targetSkills: { [field]: 2 } });
            add(move, move.ability, 200, { suffix: '-high-defense', targetSkills: { [field]: 100000 }, checks: 2 });
        }
    }
    const move = id => wudangUnarmedMoves.find(m => m.skill === id);
    for (const offset of [-1, 0]) {
        add(move('huzhua-shou'), 'juehu', 200, { suffix: offset ? '-low-shen' : '-minimum-shen',
            properties: { shen: 10000 + offset }, checks: 2, expected: offset ? 'refused' : 'observed' });
        add(move('zhenshan-zhang'), 'da', 200, { suffix: offset ? '-low-max-neili' : '-minimum-max-neili',
            properties: { max_neili: 200 + offset, neili: 50 }, checks: 2, expected: offset ? 'refused' : 'observed' });
        add(move('furong-jinzhen'), 'xian', 200, { suffix: offset ? '-low-force' : '-minimum-force',
            skills: { force: 2, 'taiji-shengong': 119 + offset }, checks: 2, expected: offset ? 'refused' : 'observed' });
    }
    // Isolate the throwing hit branch without changing the original random function.
    for (const [suffix, level] of [['low-defense', 2], ['high-defense', 100000]])
        add(move('furong-jinzhen'), 'xian', 200, { suffix: '-' + suffix,
            targetSkills: { dodge: level, parry: level }, checks: 2 });
    return result;
}

export function validateWudangUnarmedRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0], target = raw.immediate[1];
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    const ammo = p.actor.equipment?.hold ? 10 : 0;
    assert.equal(before.weapon, p.actor.equipment && !p.actor.equipment.hold ? p.actor.equipment.type : 'none');
    assert.equal(before.ammunition, ammo);
    assert.equal(before.shen, p.actor.properties.shen);
    assert.deepEqual(before.preparations, p.actor.preparations);
    assert.equal(actor.neili, before.neili - cost);
    if (condition.id.endsWith('-minimum-force')) assert.equal(before.effective_skills.force, 120);
    if (condition.id.endsWith('-low-force')) assert.equal(before.effective_skills.force, 119);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(raw.launches.length, 0);
        assert.equal(raw.attacks.length, 0); assert.equal(actor.ammunition, ammo);
        assert.equal(actor.shen, before.shen); assert.ok(raw.reason.length > 0); return;
    }
    const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0); assert.equal(attacks.length, 1); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill);
    if (p.ability === 'zheng') {
        assert.equal(direct, 0); assert.equal(attacks.length, 4); assert.equal(cost, 150);
        assert.ok([1, 2, 3, 4].includes(actor.busy));
        assert.equal(actor.temp.apply?.attack ?? 0, before.temp.apply?.attack ?? 0);
    } else if (p.ability === 'xian') {
        assert.equal(direct, 0); assert.equal(attacks.length, 0); assert.equal(cost, 100);
        assert.equal(actor.busy, 2); assert.equal(actor.ammunition, 9);
        const wound = raw.metrics[1].eff_qi_cost ?? 0;
        const scale = Math.trunc((before.effective_skills.force + before.effective_skills.throwing) / 5);
        assert.ok(wound === 0 || (wound >= scale && wound < 2 * scale));
        // receive_wound clamps full qi to eff_qi without calling receive_damage.
        assert.equal(raw.metrics[1].qi_cost ?? 0, wound);
        assert.equal(raw.before[1].qi - target.qi, wound);
        assert.equal(raw.before[1].eff_qi - target.eff_qi, wound);
        if (condition.id.endsWith('-low-defense')) assert.ok(wound > 0);
        if (condition.id.endsWith('-high-defense')) assert.equal(wound, 0);
    } else {
        assert.ok(direct === 0 || direct === 1); assert.equal(attacks.length, 0);
        assert.equal(cost, p.ability === 'da' ? 30 : p.ability === 'xuan' ? 100 : direct ? 200 : 100);
        assert.equal(actor.busy, p.ability === 'juehu' && direct ? 2 : 3);
        if (p.ability !== 'juehu') assert.ok([0, 1, 2].includes(target.busy ?? 0));
        if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
    }
    assert.equal(actor.shen, before.shen - (p.ability === 'juehu' ? 3000 : 0));
}
