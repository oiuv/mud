// Original commands only. Death, injury recovery and buffs are separate outcomes.
import assert from 'node:assert/strict';

export const quanzhenAdvancedMoves = [
    ['xiantian-gong', 'hun', 200, 500, 4000],
    ['xiantian-gong', 'fen', 240, 600, 4000],
    ['xiantian-gong', 'dang', 240, 800, 4000],
    ['xiantian-gong', 'jian', 280, 1000, 5000],
    ['kongming-quan', 'kong', 150, 150, 0],
    ['kongming-quan', 'ruo', 100, 100, 0],
];

export function quanzhenAdvancedConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, ability, level, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary'
            : ['hup', 'powerup', 'shield'].includes(ability) ? 'exert' : 'perform';
        const id = method === 'ordinary' ? skill : `${skill}/${skill === 'xiantian-gong' ? method + '/' : ''}${ability}`;
        const source = catalog.skills.find(s => s.id === id);
        assert.ok(source, '缺少全真进阶原源码：' + id);
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry);
        const force = skill === 'xiantian-gong' ? skill : 'xuanmen-neigong';
        const actor = {
            skills: { force: level, unarmed: level, parry: level, dodge: level,
                [force]: level, [skill]: level, 'jinguan-yusuo': level, 'jinyan-gong': level,
                taoism: level, 'martial-cognize': level,
                ...(ability === 'jian' ? { finger: level, 'yiyang-zhi': level, 'jingluo-xue': level } : {}),
                ...extra.skills },
            mappings: { force, dodge: 'jinyan-gong', parry: 'jinguan-yusuo',
                // Xiantian only accepts unarmed mapping at raw level >= 180.
                ...(method !== 'exert' ? { unarmed: skill } : {}),
                ...(ability === 'jian' && !extra.unmappedFinger ? { finger: 'yiyang-zhi' } : {}) },
            preparations: method !== 'exert' && !extra.unprepared ? { unarmed: skill } : {},
            properties: { jiali: 0, neili: 6000, max_neili: 6000, int: 36, con: 36,
                character: '光明磊落', 'family/family_name': '全真教',
                ...(method === 'perform' || ability === 'hup' ? { [`can_perform/${skill}/${ability}`]: 1 } : {}),
                ...(ability === 'hup' ? { qi: 6000, eff_qi: 8000, max_qi: 10000 } : {}),
                ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
        };
        result.push({ id: `school-quanzhen-advanced-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method,
            samples: smoke ? (extra.duration ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'quanzhen', family: '全真教', collection_group: 'quanzhen-advanced',
                combination: `${force}/jinyan-gong/jinguan-yusuo`, skill,
                usage: method === 'exert' ? 'force' : 'unarmed', ability, level,
                observation: extra.duration ? 'timed_effect' : 'single_action_immediate', actor,
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                    mappings: {}, properties: {}, equipment: { type: 'sword', hold: false },
                    ...(extra.targetBusy ? { busy: extra.targetBusy } : {}) },
                action: method === 'ordinary' ? 'ordinary' : method === 'exert' ? `exert ${ability}` : `perform unarmed.${ability}`,
                fighting: true, observe_seconds: extra.duration ? level + 2 : 0,
                not_applicable: '', expected: extra.expected ?? 'observed',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${skill}.c`,
                    `kungfu/skill/${force}.c`, 'kungfu/skill/jinguan-yusuo.c', 'kungfu/skill/jinyan-gong.c',
                    ...(ability === 'jian' ? ['kungfu/skill/yiyang-zhi.c', 'kungfu/skill/jingluo-xue.c'] : []),
                    ...(ability === 'hup' ? ['kungfu/skill/force/recover.c'] : []),
                    'kungfu/class/quanzhen/wang.c', 'kungfu/class/quanzhen/zhou.c',
                    'cmds/skill/perform.c', 'cmds/skill/exert.c', 'feature/skill.c',
                    'feature/action.c', 'feature/damage.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；先天功或玄门内功，金雁轻功、金关招架。空明拳不复制周伯通禁教的易筋锻骨/蛇行狸翻；乾阳剑气额外赋值一阳指/经络学，不证明可由王重阳学到。领悟及资源为实验赋值，200级不足门槛原样拒绝。死亡走原逻辑，恢复从明确伤势开始，计时增益保持原回调；非完整NPC、养成或交锋评测。',
            } });
    }
    for (const level of [200, 400, 800]) {
        for (const skill of ['xiantian-gong', 'kongming-quan']) add(skill, 'ordinary', level);
        for (const [skill, ability, minimum] of quanzhenAdvancedMoves)
            add(skill, ability, level, level < minimum ? { checks: 2, expected: 'refused' } : {});
        for (const ability of ['powerup', 'shield', 'hup'])
            add('xiantian-gong', ability, level, ability === 'hup' ? { checks: 2 } : {});
    }
    for (const [skill, ability, minimum, neili, maxNeili] of quanzhenAdvancedMoves) {
        const refusal = { checks: 2, expected: 'refused' };
        for (const [suffix, extra] of [
            ['-no-grant', { properties: { [`can_perform/${skill}/${ability}`]: 0 } }],
            ['-low-neili', { properties: { neili: neili - 1 } }],
            ['-low-skill', { skills: { [skill]: minimum - 1 } }],
            ['-armed', { weapon: true }], ['-unprepared', { unprepared: true }],
            ...(maxNeili ? [['-low-max-neili', { properties: { max_neili: maxNeili - 1 } }]] : []),
        ]) add(skill, ability, 400, { ...refusal, ...extra, suffix });
    }
    for (const [suffix, extra] of [
        ['-low-yiyang', { skills: { 'yiyang-zhi': 279 } }],
        ['-low-jingluo', { skills: { 'jingluo-xue': 199 } }],
        ['-unmapped-finger', { unmappedFinger: true }],
    ]) add('xiantian-gong', 'jian', 400, { ...extra, suffix, checks: 2, expected: 'refused' });
    add('kongming-quan', 'ruo', 400, { suffix: '-target-busy', targetBusy: 3, checks: 2, expected: 'refused' });
    for (const ability of ['fen', 'dang']) for (const max_neili of [12000, 12001])
        add('xiantian-gong', ability, 400, { suffix: `-max${max_neili}`, properties: { max_neili } });
    for (const [suffix, properties] of [
        ['-small-wound', { qi: 9000, eff_qi: 9900 }],
        ['-low-reserve', { neili: 250 }],
        ['-recover', { qi: 9000, eff_qi: 10000 }],
    ]) add('xiantian-gong', 'hup', 400, { suffix, properties, checks: 2 });
    for (const [ability, suffix, extra] of [
        ['hup', '-no-grant', { properties: { 'can_perform/xiantian-gong/hup': 0 } }],
        ['hup', '-low-skill', { skills: { 'xiantian-gong': 199 } }],
        ['hup', '-low-max-neili', { properties: { max_neili: 999 } }],
        ['hup', '-low-neili', { properties: { neili: 199 } }],
        ['hup', '-healthy', { properties: { qi: 10000, eff_qi: 10000 } }],
        ['powerup', '-low-neili', { properties: { neili: 149 } }],
        ['shield', '-low-neili', { properties: { neili: 199 } }],
        ['shield', '-low-skill', { skills: { 'xiantian-gong': 49 } }],
    ]) add('xiantian-gong', ability, 400, { ...extra, suffix, checks: 2, expected: 'refused' });
    for (const ability of ['powerup', 'shield'])
        add('xiantian-gong', ability, 60, { suffix: '-expiry', duration: true, checks: 2 });
    return result;
}

export function validateQuanzhenAdvancedRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0], target = raw.immediate[1];
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
    assert.ok(Array.isArray(raw.background_stopped), '测试服后台任务边界必须有记录');
    assert.ok(raw.background_stopped.every(path => /^\/adm\/daemons\/quest\/(capture|deliver|explore|judge|search|shen|supply|trace)$/.test(path)));
    assert.deepEqual(before.preparations, p.actor.preparations);
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    assert.equal(actor.max_neili, before.max_neili);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(raw.launches.length, 0);
        assert.equal(direct, 0); assert.equal(raw.attacks.length, 0); assert.ok(raw.reason.length > 0);
        return;
    }
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0); assert.equal(attacks.length, 1); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill);
    assert.ok(direct === 0 || direct === 1);
    switch (p.ability) {
        case 'hun':
        case 'jian': {
            const base = p.ability === 'hun' ? 280 : 600;
            // hit_ob may add 30 per landed attack; keep it in the actual resource bill.
            assert.ok(attacks.length <= 5 && attacks.length >= 0);
            if (!raw.terminals.length) assert.equal(attacks.length, 5);
            assert.ok(cost >= base && cost <= base + 30 * attacks.length && (cost - base) % 30 === 0);
            assert.ok(p.ability === 'hun' ? actor.busy >= 1 && actor.busy <= 5 : actor.busy >= 3 && actor.busy <= 5);
            assert.equal(actor.temp.apply?.attack ?? 0, before.temp.apply?.attack ?? 0);
            if (p.ability === 'hun') assert.equal(direct, 0);
            break;
        }
        case 'fen':
        case 'dang': {
            assert.equal(attacks.length, 0);
            if (target.ghost) {
                assert.ok(before.max_neili > raw.before[1].max_neili * 2);
                assert.equal(direct, 0); assert.equal(cost, 0); assert.equal(actor.busy, 2);
                assert.ok(raw.terminals.some(t => t.side === 1 && t.state === 'death'));
                assert.equal(raw.before[1].max_neili - target.max_neili, 20);
            } else if (direct) {
                const dropped = target.weapon === 'none';
                assert.equal(cost, p.ability === 'fen' ? 500 : dropped ? 550 : 400);
                assert.equal(actor.busy, 3);
                if (dropped) assert.ok(raw.dropped.some(d => d.type === 'sword'));
            } else { assert.equal(cost, 120); assert.equal(actor.busy, 4); }
            break;
        }
        case 'kong': assert.equal(cost, 80); assert.equal(actor.busy, direct ? 3 : 2); break;
        case 'ruo':
            assert.equal(cost, 50); assert.equal(direct, 0);
            if (target.busy) { assert.equal(target.busy, Math.floor(p.level / 16) + 2); assert.ok(!actor.busy); }
            else assert.equal(actor.busy, 2);
            break;
        case 'hup': {
            assert.equal(direct, 0); assert.equal(attacks.length, 0);
            assert.equal(before.eff_qi, p.actor.properties.eff_qi);
            assert.equal(before.max_qi, p.actor.properties.max_qi);
            const wound = before.max_qi - before.eff_qi;
            if (wound) {
                const restored = Math.min(wound, Math.floor(before.max_qi / 10), before.neili - 100);
                assert.equal(cost, restored + 100); assert.equal(actor.busy, 3);
                assert.equal(actor.eff_qi - before.eff_qi, restored);
                assert.equal(actor.qi - before.qi, Math.min(Math.floor(restored * 3 / 2), actor.eff_qi - before.qi));
            } else {
                const q = before.eff_qi - before.qi;
                assert.equal(cost, Math.max(20, Math.floor(100 * q / before.effective_skills.force)));
                assert.equal(actor.eff_qi, before.eff_qi); assert.equal(actor.qi, before.eff_qi);
                assert.equal(actor.busy, 1);
            }
            break;
        }
        case 'powerup':
        case 'shield': {
            const flag = p.ability, shield = flag === 'shield';
            const fields = shield ? ['armor'] : ['attack', 'dodge', 'parry'];
            assert.equal(cost, 100); assert.equal(direct, 0); assert.equal(attacks.length, 0);
            assert.equal(actor.temp[flag], 1);
            assert.ok(shield ? actor.busy === 2 : [1, 2, 3].includes(actor.busy));
            for (const field of fields) assert.equal((actor.temp.apply?.[field] ?? 0) - (before.temp.apply?.[field] ?? 0),
                Math.floor(p.level * (shield ? 1 / 2 : 2 / 5)));
            if (p.observation === 'timed_effect') {
                assert.equal(p.observe_seconds, p.level + 2); assert.ok(raw.elapsed >= p.observe_seconds);
                assert.deepEqual(raw.callbacks.map(c => [c.side, c.phase]), [[0, 'before'], [0, 'after']]);
                const [enter, exit] = raw.callbacks;
                assert.ok(enter.elapsed >= p.level && exit.elapsed >= enter.elapsed && exit.elapsed <= raw.elapsed);
                assert.equal(enter.state.temp[flag], 1);
                for (const field of fields) assert.equal(enter.state.temp.apply[field], actor.temp.apply[field]);
                for (const state of [exit.state, raw.after[0]]) {
                    assert.ok(!state.temp[flag]); assert.equal(state.neili, actor.neili);
                    for (const field of fields) assert.equal(state.temp.apply?.[field] ?? 0, before.temp.apply?.[field] ?? 0);
                }
            }
            break;
        }
        default: assert.fail('未核对全真进阶能力');
    }
}
