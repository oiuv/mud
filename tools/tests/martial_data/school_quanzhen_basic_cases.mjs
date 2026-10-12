// Ordinary attacks and original commands; never emulate the skill formulas.
import assert from 'node:assert/strict';

export const quanzhenBasicMoves = [
    ['qixing-shou', 'hand', 'po', 150, 300, 200],
    ['haotian-zhang', 'strike', 'ju', 120, 300, 180],
    ['chongyang-shenzhang', 'strike', 'lian', 100, 100, 120],
    ['zhongnan-zhi', 'finger', 'zhi', 60, 60, 80],
    ['tiangang-chenfa', 'whip', 'bai', 120, 200, 0],
];
const partners = {
    'qixing-shou': ['strike', 'haotian-zhang'],
    'haotian-zhang': ['hand', 'qixing-shou'],
    'chongyang-shenzhang': ['finger', 'zhongnan-zhi'],
    'zhongnan-zhi': ['strike', 'chongyang-shenzhang'],
};

export function quanzhenBasicConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, usage, ability, level, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : usage === 'force' ? 'exert' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? skill : `${skill}/${ability}`));
        assert.ok(source, '缺少全真基础能力原源码');
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry);
        const dodge = ['chongyang-shenzhang', 'zhongnan-zhi'].includes(skill) ? 'tianshan-feidu' : 'jinyan-gong';
        const parry = usage === 'force' ? 'tiangang-chenfa' : skill;
        const actor = {
            skills: { force: level, parry: level, dodge: level, unarmed: level,
                'xuanmen-neigong': level, [dodge]: level, [parry]: level,
                [usage]: level, [skill]: level, taoism: level, 'martial-cognize': level,
                ...extra.skills },
            mappings: { force: 'xuanmen-neigong', dodge, parry, [usage]: skill },
            preparations: ['hand', 'strike', 'finger'].includes(usage) ? { [usage]: skill } : {},
            properties: { jiali: 0, neili: 6000, max_neili: 6000, int: 36, con: 36,
                character: '光明磊落', 'family/family_name': '全真教',
                ...(method === 'perform' ? { [`can_perform/${skill}/${ability}`]: 1 } : {}),
                ...extra.properties },
            ...((extra.weapon ?? (usage === 'whip' ? 'whip' : 'none')) === 'none' ? {}
                : { equipment: { type: extra.weapon ?? 'whip', hold: false } }),
        };
        const partner = extra.dual ? partners[skill] : null;
        if (partner) {
            const [basic, special] = partner;
            actor.skills[basic] = level; actor.skills[special] = level;
            actor.mappings[basic] = special; actor.preparations[basic] = special;
        }
        if (extra.unprepared) actor.preparations = {};
        result.push({ id: `school-quanzhen-basic-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method,
            samples: smoke ? (extra.duration ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'quanzhen', family: '全真教', collection_group: 'quanzhen-basic',
                combination: partner ? `${skill}+${partner[1]}` : skill, skill, usage, ability, level,
                observation: extra.duration ? 'timed_effect' : 'single_action_immediate', actor,
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                    mappings: {}, properties: {}, equipment: { type: 'sword', hold: false } },
                action: method === 'ordinary' ? 'ordinary' : method === 'exert' ? `exert ${ability}` : `perform ${usage}.${ability}`,
                fighting: true, observe_seconds: extra.duration ? level + 2 : 0,
                not_applicable: '', expected: extra.expected ?? 'observed',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${skill}.c`,
                    `kungfu/skill/${parry}.c`, `kungfu/skill/${dodge}.c`, 'kungfu/skill/xuanmen-neigong.c',
                    ...(partner ? [`kungfu/skill/${partner[1]}.c`] : []),
                    'kungfu/class/quanzhen/qiu.c', 'kungfu/class/quanzhen/yin.c', 'kungfu/class/quanzhen/ma.c',
                    'kungfu/class/quanzhen/sun.c', 'cmds/skill/perform.c', 'cmds/skill/exert.c',
                    'feature/skill.c', 'feature/action.c', 'feature/damage.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER，玄门内功及教师已有轻功、徒手组合；单项只准备本技能，dual另外准备源码允许且教师在用的搭配。招架选受测技能（内功条件用天罡尘法），不是完整NPC复刻。等级、领悟与资源由实验赋值，不证明教学可得或同养成成本。原计时与反击保留，无自动战斗心跳。',
            } });
    }
    for (const level of [200, 400, 800]) {
        for (const [skill, usage, ability] of quanzhenBasicMoves) {
            add(skill, usage, 'ordinary', level);
            add(skill, usage, ability, level);
            if (partners[skill]) add(skill, usage, ability, level, { dual: true, suffix: '-dual' });
        }
        for (const skill of ['qixing-shou', 'zhongnan-zhi']) {
            const usage = skill === 'qixing-shou' ? 'hand' : 'finger';
            add(skill, usage, 'ordinary', level, { dual: true, suffix: '-dual' });
        }
        add('xuanmen-neigong', 'force', 'powerup', level);
    }
    for (const [skill, usage, ability, minimum, neili, force] of quanzhenBasicMoves) {
        const refused = { checks: 2, expected: 'refused' };
        add(skill, usage, ability, 200, { ...refused, suffix: '-no-grant',
            properties: { [`can_perform/${skill}/${ability}`]: 0 } });
        add(skill, usage, ability, 200, { ...refused, suffix: '-low-neili', properties: { neili: neili - 1 } });
        add(skill, usage, ability, 200, { ...refused, suffix: '-low-skill', skills: { [skill]: minimum - 1 } });
        add(skill, usage, ability, 200, { ...refused, suffix: '-wrong-weapon', weapon: usage === 'whip' ? 'none' : 'sword' });
        if (force) {
            add(skill, usage, ability, 200, { ...refused, suffix: '-unprepared', unprepared: true });
            add(skill, usage, ability, 200, { ...refused, suffix: '-low-force', skills: { force: 2, 'xuanmen-neigong': force - 2 } });
        }
    }
    add('tiangang-chenfa', 'whip', 'bai', 200, { suffix: '-max-neili1499',
        properties: { max_neili: 1499 }, checks: 2, expected: 'refused' });
    add('xuanmen-neigong', 'force', 'powerup', 200, { suffix: '-neili149',
        properties: { neili: 149 }, checks: 2, expected: 'refused' });
    add('xuanmen-neigong', 'force', 'powerup', 60, { suffix: '-expiry', duration: true, checks: 2 });
    return result;
}

export function validateQuanzhenBasicRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0];
    assert.deepEqual(before.preparations, p.actor.preparations);
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
    assert.equal(actor.max_neili, before.max_neili);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(raw.launches.length, 0);
        assert.equal(direct, 0); assert.equal(raw.attacks.length, 0); assert.ok(raw.reason.length > 0);
        return;
    }
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0); assert.equal(attacks.length, 1);
        return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill);
    switch (p.ability) {
        case 'po':
            assert.ok(Number.isInteger(direct) && direct >= 0 && direct <= 3);
            assert.equal(cost, 200); assert.ok([2, 3, 4].includes(actor.busy)); break;
        case 'ju':
        case 'zhi':
        case 'bai': {
            assert.ok(direct === 0 || direct === 1);
            const fees = { ju: [60, 200], zhi: [20, 60], bai: [0, 180] }[p.ability];
            assert.equal(cost, fees[direct]); assert.equal(actor.busy, direct ? 2 : 3); break;
        }
        case 'lian':
            assert.equal(direct, 0); assert.equal(attacks.length, 4);
            assert.equal(cost, 80); assert.ok([1, 2, 3, 4].includes(actor.busy)); break;
        case 'powerup': {
            assert.equal(cost, 100); assert.equal(direct, 0); assert.equal(raw.attacks.length, 0);
            assert.ok([1, 2, 3].includes(actor.busy)); assert.equal(actor.temp.powerup, 1);
            const fields = ['attack', 'dodge', 'parry'];
            for (const field of fields) assert.equal((actor.temp.apply?.[field] ?? 0)
                - (before.temp.apply?.[field] ?? 0), Math.floor(p.level / 4));
            if (p.observation === 'timed_effect') {
                assert.equal(p.observe_seconds, p.level + 2); assert.ok(raw.elapsed >= p.observe_seconds);
                assert.deepEqual(raw.callbacks.map(c => [c.side, c.phase]), [[0, 'before'], [0, 'after']]);
                const [enter, exit] = raw.callbacks;
                assert.ok(enter.elapsed >= p.level && exit.elapsed >= enter.elapsed && exit.elapsed <= raw.elapsed);
                assert.equal(enter.state.temp.powerup, 1);
                for (const field of fields) assert.equal(enter.state.temp.apply[field], actor.temp.apply[field]);
                for (const state of [exit.state, raw.after[0]]) {
                    assert.ok(!state.temp.powerup);
                    for (const field of fields) assert.equal(state.temp.apply?.[field] ?? 0, before.temp.apply?.[field] ?? 0);
                    assert.equal(state.neili, actor.neili);
                }
            }
            break;
        }
        default: assert.fail('未核对全真基础能力');
    }
}
