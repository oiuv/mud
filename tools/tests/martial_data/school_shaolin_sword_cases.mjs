// Original Damo sword commands. Experimental qualifications are not acquisition proof.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const damoConditions = { luan: 'damo_luanqi', shang: 'damo_shangshen', zhe: 'damo_zheyuan' };
export const damoMoves = ['luan', 'shang', 'zhe', 'qingxin', 'sanjue'];

export function shaolinSwordConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? 'damo-jian' : `damo-jian/${ability}`));
        assert.ok(source, '缺少达摩剑源码');
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry, '缺少达摩剑原入口');
        const actor = {
            skills: { sword: level, 'damo-jian': level, force: level, 'hunyuan-yiqi': level,
                parry: level, dodge: level, 'shaolin-shenfa': level, buddhism: level,
                'martial-cognize': level, ...extra.skills },
            mappings: { sword: 'damo-jian', parry: 'damo-jian', force: 'hunyuan-yiqi', dodge: 'shaolin-shenfa' },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
                combat_exp: 100000000, gender: '男性', 'family/family_name': '少林派',
                ...(method === 'perform' && ability !== 'sanjue' ? { [`can_perform/damo-jian/${ability}`]: 1 } : {}),
                ...extra.properties },
            ...(extra.noWeapon ? {} : { equipment: { type: extra.weapon ?? 'sword', hold: false } }),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: { ...extra.targetProperties }, equipment: { type: 'sword', hold: false },
            ...(ability === 'qingxin' ? { temp: { powerup: 1, 'apply/attack': 150, 'apply/defense': 90, ...extra.targetTemp } } : {}),
        };
        result.push({ id: `school-shaolin-sword-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? (extra.expiry ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-sword',
                combination: 'damo-jian+hunyuan-yiqi', skill: 'damo-jian', usage: 'sword', ability, level,
                actor, target, fighting: extra.fighting ?? true,
                observation: extra.expiry ? 'timed_effect' : 'single_action_immediate',
                observe_seconds: extra.expiry ? Math.trunc((Math.trunc(actor.skills.sword / 2) + actor.skills['damo-jian']
                    + Math.trunc(actor.skills.force / 2) + actor.skills['hunyuan-yiqi']) / 20) + 2 : 0,
                action: method === 'ordinary' ? 'ordinary' : `perform sword.${ability}`,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, 'kungfu/skill/damo-jian.c',
                    'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/shaolin-shenfa.c', 'inherit/skill/shaolin.c',
                    'kungfu/class/shaolin/cheng-shang.c', 'kungfu/class/shaolin/da-mo.c',
                    'feature/condition.c', 'inherit/condition/damo.c', 'feature/attribute.c',
                    'feature/skill.c', 'cmds/skill/perform.c', 'adm/daemons/combatd.c',
                    ...(damoConditions[ability] ? [`kungfu/condition/${damoConditions[ability]}.c`] : [])])],
                qualification_note: '真实非巫师USER；参考澄尚的达摩剑/混元一气功/少林身法组合，等级与授招仅实验赋值，不证明师承获取或同养成成本。三绝剑原入口不检查can_perform，四种其他绝招分别给原领悟键。清心目标powerup及150/90属性为显式状态输入，不声称来自某一内功增益；到期仍由原start_call_out执行。异常由原命中回调affect_by施加，不预置目标异常，不以即时记录证明后续发作。',
            } });
    }
    for (const level of [200, 400, 800]) for (const ability of ['ordinary', ...damoMoves]) add(ability, level);
    for (const ability of damoMoves) {
        const neili = ability === 'sanjue' ? 150 : 300;
        for (const [suffix, extra] of [
            ['no-grant', { properties: { [`can_perform/damo-jian/${ability}`]: 0 }, expected: ability === 'sanjue' ? 'observed' : 'refused' }],
            ['low-neili', { properties: { neili: neili - 1 } }],
            ['no-weapon', { noWeapon: true }], ['wrong-weapon', { weapon: 'blade' }],
            ['busy', { busy: true }], ['no-fight', { fighting: false }],
        ]) add(ability, 200, { suffix: '-' + suffix, expected: 'refused', checks: 2, ...extra });
        add(ability, 200, { suffix: '-minimum-neili', properties: { neili }, checks: 2 });
        if (ability !== 'sanjue') {
            add(ability, 200, { suffix: '-low-skill', skills: { 'damo-jian': 199 }, expected: 'refused', checks: 2 });
            for (const [suffix, force] of [['low-target-force', 2], ['high-target-force', 100000]])
                add(ability, 200, { suffix: '-' + suffix, targetSkills: { force }, checks: 2 });
        }
        if (damoConditions[ability]) {
            for (const offset of [-1, 0]) add(ability, 200, { suffix: offset ? '-low-max-neili' : '-minimum-max-neili',
                properties: { max_neili: 2000 + offset }, expected: offset ? 'refused' : 'observed', checks: 2 });
            add(ability, 200, { suffix: '-piyi', targetSkills: { force: 2 },
                targetProperties: { 'special_skill/piyi': 1 }, checks: 2 });
        }
    }
    for (const offset of [-1, 0]) {
        for (const [field, special] of [['force', 'hunyuan-yiqi'], ['dodge', 'shaolin-shenfa'], ['sword', 'damo-jian']])
            add('sanjue', 200, { suffix: `${offset ? '-low' : '-minimum'}-${field}`, checks: 2,
                skills: { [field]: 2, [special]: 199 + offset + (field === 'dodge' ? 1 : 0) },
                expected: offset ? 'refused' : 'observed' });
        add('sanjue', 200, { suffix: offset ? '-low-dex' : '-minimum-dex',
            properties: { dex: 10 + offset }, expected: offset ? 'refused' : 'observed', checks: 2 });
    }
    add('qingxin', 200, { suffix: '-no-buff', targetTemp: { powerup: 0 }, checks: 2 });
    add('qingxin', 200, { suffix: '-already-suppressed', targetTemp: { damo_qingxin: 1 }, expected: 'refused', checks: 2 });
    add('qingxin', 200, { suffix: '-low-max-neili', properties: { max_neili: 1999 }, checks: 2 });
    add('qingxin', 200, { suffix: '-expiry', targetSkills: { force: 2 }, expiry: true, checks: 2 });
    return result;
}

export function validateShaolinSwordRecord(raw, condition) {
    const p = condition.parameters, [before, oldTarget] = raw.before, [actor, target] = raw.immediate;
    assert.equal(raw.outcome, p.expected);
    assert.ok(['single_action_immediate', 'timed_effect'].includes(p.observation));
    for (const [state, config] of [[before, p.actor], [oldTarget, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, config.mappings);
        for (const [key, value] of Object.entries(config.skills)) assert.equal(state.skills[key] ?? 0, value);
        for (const key of ['neili', 'max_neili', 'jiali', 'dex'])
            if (Object.hasOwn(config.properties, key)) assert.equal(state[key], config.properties[key]);
    }
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.equal(actor.neili, before.neili - cost); assert.equal(actor.max_neili, before.max_neili);
    assert.equal(raw.dropped.length, 0);
    for (const suffix of ['force', 'dodge', 'sword', 'dex']) {
        if (condition.id.endsWith(`-minimum-${suffix}`) && p.ability === 'sanjue')
            assert.equal(suffix === 'dex' ? before.effective_dex : before.effective_skills[suffix], suffix === 'dex' ? 30 : 200);
        if (condition.id.endsWith(`-low-${suffix}`) && p.ability === 'sanjue')
            assert.equal(suffix === 'dex' ? before.effective_dex : before.effective_skills[suffix], suffix === 'dex' ? 29 : 199);
    }
    const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(raw.launches.length, 0);
        assert.equal(attacks.length, 0); assert.ok(raw.reason.length > 0);
        assert.deepEqual(target, oldTarget); return;
    }
    assert.equal(actor.weapon, 'sword');
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0); assert.equal(attacks.length, 1); assert.equal(cost, 0); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, 'damo-jian');
    assert.equal(raw.launches[0].argument, p.ability);
    assert.equal(actor.temp.apply?.attack ?? 0, before.temp.apply?.attack ?? 0);
    if (p.ability === 'sanjue') {
        assert.equal(cost, 75); assert.equal(direct, 0); assert.equal(attacks.length, 3);
        assert.ok(attacks.every(a => a.type === 0)); assert.ok([1, 2, 3].includes(actor.busy)); return;
    }
    assert.equal(attacks.length, 0);
    if (p.ability === 'qingxin') {
        assert.equal(cost, 200); assert.equal(actor.busy, 1); assert.equal(direct, 0);
        const suppressed = Boolean(target.temp.damo_qingxin);
        if (condition.id.endsWith('-low-target-force') || condition.id.endsWith('-expiry')) assert.ok(suppressed);
        if (condition.id.endsWith('-high-target-force') || condition.id.endsWith('-no-buff')) assert.ok(!suppressed);
        for (const key of ['attack', 'defense']) assert.equal(target.temp.apply?.[key] ?? 0,
            suppressed ? 0 : oldTarget.temp.apply?.[key] ?? 0);
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) assert.equal(target[key], oldTarget[key]);
        assert.equal(target.temp.powerup, oldTarget.temp.powerup);
        if (p.observation === 'timed_effect') {
            const calls = raw.callbacks.filter(c => c.side === 1);
            assert.deepEqual(calls.map(c => c.phase), ['before', 'after']);
            assert.ok(raw.elapsed >= p.observe_seconds - 1);
            assert.ok(calls[0].elapsed >= p.observe_seconds - 3 && calls[1].elapsed >= calls[0].elapsed);
            assert.equal(calls[0].state.temp.damo_qingxin, 1);
            for (const state of [calls[1].state, raw.after[1]]) {
                assert.ok(!state.temp.damo_qingxin);
                for (const key of ['attack', 'defense']) assert.equal(state.temp.apply?.[key], oldTarget.temp.apply?.[key]);
                assert.equal(state.temp.powerup, 1);
            }
            assert.equal(raw.after[0].neili, actor.neili);
        }
        return;
    }
    assert.ok(damoConditions[p.ability]); assert.ok([0, 1].includes(direct));
    assert.equal(cost, direct ? 200 : 100); assert.equal(actor.busy, direct ? 2 : 4);
    const info = target.conditions?.[damoConditions[p.ability]];
    if (condition.id.endsWith('-low-target-force') || condition.id.endsWith('-piyi')) assert.equal(direct, 1);
    if (condition.id.endsWith('-high-target-force')) assert.equal(direct, 0);
    if (!direct || p.target.properties['special_skill/piyi']) assert.ok(!info);
    else {
        assert.ok(info && typeof info === 'object');
        const level = p.actor.skills['damo-jian'];
        assert.ok(Number.isInteger(info.level) && info.level >= level && info.level < 2 * level);
        assert.equal(info.id, before.id); assert.equal(typeof info.name, 'string');
        assert.ok(info.name.length > 0); assert.equal(info.remain % info.level, 0);
        assert.ok(info.remain / info.level >= 5 && info.remain / info.level < 5 + Math.trunc(level / 20));
    }
    if (p.ability === 'luan' || !direct) {
        assert.equal(target.jing, oldTarget.jing); assert.equal(target.eff_jing, oldTarget.eff_jing);
    } else {
        assert.ok(target.jing < oldTarget.jing && target.eff_jing < oldTarget.eff_jing);
    }
    assert.equal(target.neili, oldTarget.neili, '即时折元不等于已观察异常内力支出');
}

// Only actual snapshots/events become statistics; no expected-outcome synthesis.
export function shaolinSwordEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw?.immediate?.[1] && r.raw?.before?.[1]).map(r => r.raw);
    const info = raw.map(r => Object.values(r.immediate[1].conditions || {}).filter(v => v && typeof v === 'object')).flat();
    const delta = (r, key) => Number.isFinite(r.before[1][key]) && Number.isFinite(r.immediate[1][key])
        ? r.before[1][key] - r.immediate[1][key] : null;
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        condition_applied: probability(raw.filter(r => Object.keys(r.immediate[1].conditions || {}).length > 0).length, raw.length),
        condition_level: distribution(info.map(i => i.level)), condition_remaining: distribution(info.map(i => i.remain)),
        condition_duration_units: distribution(info.map(i => Number.isFinite(i.remain) && i.level > 0 ? i.remain / i.level : null)),
        qingxin_suppressed: probability(raw.filter(r => r.immediate[1].temp?.damo_qingxin).length, raw.length),
        target_loss: Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'].map(key => [key, distribution(raw.map(r => delta(r, key)))])),
        regular_attacks: distribution(raw.map(r => r.attacks?.filter(a => a.actor === 0 && a.target === 1 && a.type === 0).length)),
        target_callback_end: distribution(raw.flatMap(r => (r.callbacks ?? []).filter(c => c.side === 1 && c.phase === 'after').map(c => c.elapsed))),
    };
}
