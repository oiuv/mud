// Source-backed sword combinations; qualifications are fixtures, not acquisition claims.
import assert from 'node:assert/strict';

export const quanzhenSwordMoves = [
    ['qixing-jian', 'xing', 60, 50],
    ['quanzhen-jian', 'chan', 80, 100],
    ['quanzhen-jian', 'ding', 100, 150],
    ['quanzhen-jian', 'hua', 200, 500],
    ['quanzhen-jian', 'lian', 180, 400],
    ['tonggui-jian', 'fen', 120, 200],
];

export function quanzhenSwordConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, level, ability, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? skill : `${skill}/${ability}`));
        assert.ok(source, '缺少全真剑法原源码');
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry, '缺少全真剑法原入口');
        const force = extra.force ?? (ability === 'hua' ? 'xiantian-gong' : 'xuanmen-neigong');
        const dodge = skill === 'qixing-jian' ? 'tianshan-feidu' : 'jinyan-gong';
        const parry = skill === 'tonggui-jian' ? 'quanzhen-jian' : skill;
        const palm = extra.palm ?? 'haotian-zhang';
        const actor = {
            skills: { sword: level, parry: level, dodge: level, force: level,
                unarmed: level, strike: level, [skill]: level, [parry]: level,
                [force]: level, [dodge]: level, [palm]: level, taoism: level,
                'martial-cognize': level, ...extra.skills },
            mappings: { sword: skill, parry, force, dodge, strike: palm, ...extra.mappings },
            preparations: { strike: palm },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, int: 36, con: 36,
                character: '光明磊落', 'family/family_name': '全真教',
                ...(method === 'perform' ? { [`can_perform/${skill}/${ability}`]: 1 } : {}),
                ...extra.properties },
            ...(extra.noWeapon ? {} : { equipment: { type: 'sword', hold: false } }),
        };
        if (extra.unmappedPalm) delete actor.mappings.strike;
        result.push({ id: `school-quanzhen-sword-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'quanzhen', family: '全真教', collection_group: 'quanzhen-sword',
                combination: `${force}/${dodge}/${palm}`, skill, usage: 'sword', ability, level,
                observation: 'single_action_immediate', actor,
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
                    mappings: {}, properties: {}, equipment: { type: 'sword', hold: false },
                    ...(extra.targetBusy ? { busy: extra.targetBusy } : {}) },
                action: method === 'ordinary' ? 'ordinary' : `perform sword.${ability}`,
                fighting: true, observe_seconds: 0, not_applicable: '', expected: extra.expected ?? 'observed',
                qualification_sources: [...new Set([`kungfu/skill/${skill}.c`, source.path,
                    `kungfu/skill/${force}.c`, `kungfu/skill/${dodge}.c`, `kungfu/skill/${palm}.c`,
                    `kungfu/skill/${parry}.c`, 'kungfu/class/quanzhen/yin.c',
                    'kungfu/class/quanzhen/qiu.c', 'kungfu/class/quanzhen/wang.c',
                    'cmds/skill/perform.c', 'feature/skill.c', 'feature/action.c',
                    'feature/damage.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；参考尹志平/丘处机的玄门、轻功与剑法映射，一气化三清单列先天功资格。仅准备本次掌法，非完整NPC复刻；同归剑法只激发sword，招架保留全真剑法。技能、资源和领悟为实验赋值，不证明教学可得、同养成成本或门派总体强弱。死亡走原逻辑，仅作用于临时角色。',
            } });
    }
    for (const level of [200, 400, 800]) {
        for (const skill of ['qixing-jian', 'quanzhen-jian', 'tonggui-jian']) add(skill, level, 'ordinary');
        for (const [skill, ability] of quanzhenSwordMoves) add(skill, level, ability);
        // Independent changes: Ding reads learned Xiantian even when not mapped;
        // Lian explicitly accepts either palm and re-equips its original sword.
        add('quanzhen-jian', level, 'ding', { suffix: '-learned-xiantian', skills: { 'xiantian-gong': level } });
        add('quanzhen-jian', level, 'lian', { suffix: '-chongyang', palm: 'chongyang-shenzhang' });
    }
    for (const [skill, ability, minimum, neili] of quanzhenSwordMoves) {
        for (const [suffix, extra] of [
            ['-no-grant', { properties: { [`can_perform/${skill}/${ability}`]: 0 } }],
            ['-low-neili', { properties: { neili: neili - 1 } }],
            ['-low-skill', { skills: { [skill]: minimum - 1 } }],
            ['-no-weapon', { noWeapon: true }],
        ]) add(skill, 200, ability, { suffix, ...extra, checks: 2, expected: 'refused' });
    }
    add('quanzhen-jian', 200, 'hua', { suffix: '-wrong-force', force: 'xuanmen-neigong',
        skills: { 'xiantian-gong': 200 }, checks: 2, expected: 'refused' });
    add('quanzhen-jian', 200, 'hua', { suffix: '-max-neili4499',
        properties: { max_neili: 4499 }, checks: 2, expected: 'refused' });
    add('quanzhen-jian', 200, 'lian', { suffix: '-unmapped-palm',
        unmappedPalm: true, checks: 2, expected: 'refused' });
    add('quanzhen-jian', 200, 'chan', { suffix: '-target-busy', targetBusy: 3,
        checks: 2, expected: 'refused' });
    // Different source branches, not a ranking or a substitution for neutral cases.
    add('tonggui-jian', 200, 'fen', { suffix: '-low-reserves',
        properties: { max_neili: 2000, neili: 2000 }, targetSkills: { force: 1000 } });
    add('tonggui-jian', 400, 'fen', { suffix: '-high-reserves', properties: { max_neili: 8000, neili: 8000 } });
    return result;
}

export function validateQuanzhenSwordRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0], target = raw.immediate[1];
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(raw.launches.length, 0);
        assert.equal(actor.max_neili, before.max_neili);
        assert.ok(raw.reason.length > 0);
        return;
    }
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0);
        return;
    }
    assert.equal(raw.launches.length, 1);
    assert.equal(raw.launches[0].skill, p.skill);
    assert.ok(direct === 0 || direct === 1);
    if (p.ability !== 'fen') {
        assert.equal(actor.max_neili, before.max_neili);
        assert.equal(actor.weapon, 'sword', '三连环也须用原wield恢复剑');
        assert.equal(actor.temp.apply?.attack ?? 0, before.temp.apply?.attack ?? 0);
    }
    switch (p.ability) {
        case 'xing':
            assert.equal(cost, direct ? 30 : 20); assert.equal(actor.busy, direct ? 2 : 3); break;
        case 'chan':
            assert.equal(cost, 50); assert.equal(direct, 0);
            if (target.busy > 0) {
                assert.equal(target.busy, Math.floor(p.level / 28) + 2); assert.ok(!actor.busy);
            } else assert.equal(actor.busy, 1);
            break;
        case 'ding':
            assert.equal(cost, direct ? 80 : 30); assert.equal(actor.busy, 2); break;
        case 'hua':
            assert.equal(cost, 200); assert.equal(actor.busy, direct ? 3 : 2); break;
        case 'lian':
            assert.equal(cost, direct ? 210 : 110); assert.equal(actor.busy, 3);
            assert.equal(raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 1).length, 2);
            break;
        case 'fen': {
            // Full death processing can clear busy, revive resources and drop gear.
            // Preserve actual terminals/ghosts rather than manufacturing damage.
            // Original killer_reward also deducts 20 on this unprotected player's
            // actual death. Report total loss; do not erase the death penalty.
            const loss = before.max_neili - actor.max_neili - (actor.ghost ? 20 : 0);
            assert.ok(loss >= 50 && loss <= 99, '原式固定50加成功分支random(50)');
            assert.ok(cost === 0 || cost === before.neili);
            assert.ok(!direct || cost === before.neili);
            if (!raw.terminals.length) assert.equal(actor.busy, cost ? 6 : 8);
            break;
        }
        default: assert.fail('未核对全真剑招');
    }
}
