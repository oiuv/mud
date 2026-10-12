// Existing Nine Yin buffs: experimental USERs, not Zhou's original NPC equipment.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';

export const jiuyinShieldSkills = ['yijin-duangu', 'dafumo-quan', 'cuixin-zhang',
    'jiuyin-baiguzhao', 'shexing-lifan', 'yinlong-bian'];
const applyKeys = ['attack', 'armor', 'force', 'dodge', 'parry', 'strike', 'claw', 'whip', 'damage', 'unarmed_damage', 'str', 'dex'];
const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const flag = ability => ability === 'guiyuan' ? 'gui_yuan' : ability;
const action = ability => ability === 'guiyuan' ? 'perform dodge.guiyuan' : 'exert ' + ability;
const bonus = (state, key) => state.temp.apply?.[key] ?? 0;

export function emeiJiuyinBuffConditions(catalog, { smoke = false } = {}) {
    const result = [];
    function add(ability, level = 200, extra = {}) {
        const skill = ability === 'guiyuan' ? 'shexing-lifan' : 'yijin-duangu';
        const method = ability === 'guiyuan' ? 'perform' : 'exert';
        const source = catalog.skills.find(s => s.id === skill + '/' + ability);
        const entry = source?.entries.find(e => e.role === method)?.id;
        assert.ok(entry, skill + '/' + ability);
        const actor = {
            skills: { force: level, dodge: level, claw: level, strike: level, unarmed: level,
                ...Object.fromEntries(jiuyinShieldSkills.map(s => [s, level])), ...extra.skills },
            mappings: { force: 'yijin-duangu', dodge: 'shexing-lifan', claw: 'jiuyin-baiguzhao',
                strike: 'cuixin-zhang', whip: 'yinlong-bian', unarmed: 'dafumo-quan' },
            preparations: { claw: 'jiuyin-baiguzhao', strike: 'cuixin-zhang' },
            properties: { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
                neili: 6000, max_neili: 6000, str: 36, dex: 36, int: 36, con: 36,
                jiali: 0, combat_exp: 100000000, gender: '女性', 'family/family_name': '峨嵋派', ...extra.properties },
            ...(extra.temp ? { temp: extra.temp } : {}), ...(extra.busy ? { busy: 2 } : {}),
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
        };
        if (extra.noMap) delete actor.mappings[extra.noMap];
        if (extra.noPrepare) delete actor.preparations[extra.noPrepare];
        result.push({ id: `school-emei-buff-jiuyin-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? 1 : 2,
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-jiuyin-buff',
                skill, usage: ability === 'guiyuan' ? 'dodge' : 'force', ability, level,
                combination: 'experimental-six-jiuyin-skills', actor,
                target: { skills: {}, mappings: {}, preparations: {}, properties: {} },
                named_participants: true, action: action(ability) + (extra.other ? ' right' : ''),
                fighting: extra.fighting ?? false, expected: extra.expected ?? 'observed', not_applicable: '',
                observation: extra.wait ? 'timed_effect' : 'single_action_immediate', observe_seconds: extra.wait ?? 0,
                ...(extra.repeat ? { repeat_actions: extra.repeat } : {}),
                qualification_sources: [source.path, 'kungfu/skill/yijin-duangu.c', 'kungfu/skill/shexing-lifan.c',
                    'kungfu/skill/yijin-duangu/powerup.c', 'kungfu/skill/yijin-duangu/shield.c',
                    'kungfu/skill/shexing-lifan/guiyuan.c', 'kungfu/skill/dafumo-quan.c', 'kungfu/class/emei/zhou.c',
                    'feature/attribute.c', 'feature/action.c', 'feature/skill.c', 'inherit/skill/force.c',
                    'inherit/skill/skill.c', 'cmds/skill/perform.c', 'cmds/skill/exert.c'],
                qualification_note: '真实非巫师USER；六门九阴技能、映射和双准备为实验赋值，不冒充周芷若原配置或自然取得。'
                    + '原命令、绑定回调与资源账；确定性状态各两次，三档和最低合法时长分开。'
                    + '九阴归元写temp str/dex但实际属性读apply，原样观察，不在夹具修正。'
                    + '原NPC没有大伏魔拳映射，完整NPC出战与正常学习另采；无攻击不代表没有辅助效果。',
            } });
    }
    for (const ability of ['powerup', 'shield', 'guiyuan']) {
        for (const level of [200, 400, 800]) {
            add(ability, level); add(ability, level, { suffix: '-fighting', fighting: true });
        }
        const minimum = { powerup: 100, shield: 200, guiyuan: 250 }[ability];
        for (const [suffix, extra] of [
            ['low-neili', { properties: { neili: minimum - 1 }, expected: 'refused' }],
            ['minimum-neili', { properties: { neili: minimum } }],
            ['busy', { busy: true, expected: 'refused' }],
            ['unmapped', { noMap: ability === 'guiyuan' ? 'dodge' : 'force', expected: 'refused' }],
            ['already', { temp: { [flag(ability)]: 1 }, expected: 'refused' }],
            ['disabled', { temp: { [ability === 'guiyuan' ? 'no_perform' : 'no_exert']: 1 }, expected: 'refused' }],
            ['repeat', { repeat: [action(ability), action(ability)] }],
            ['other', { other: true, expected: ability === 'guiyuan' ? 'observed' : 'refused' }],
            ['male', { properties: { gender: '男性' } }],
            ['eunuch', { properties: { gender: '无性' } }],
            ['other-family', { properties: { 'family/family_name': '华山派' } }],
        ]) add(ability, 200, { suffix: '-' + suffix, ...extra });
    }
    for (const [level, skills] of [[20, {}], [200, { force: 2, 'yijin-duangu': 199 }]])
        add('powerup', level, { suffix: '-effective-force', skills });
    for (const skill of jiuyinShieldSkills)
        add('shield', 200, { suffix: '-low-' + skill, skills: { [skill]: 199 }, expected: 'refused' });
    for (const usage of ['whip', 'unarmed', 'dodge'])
        add('shield', 200, { suffix: '-unmapped-' + usage, noMap: usage, expected: 'refused' });
    for (const usage of ['claw', 'strike'])
        add('shield', 200, { suffix: '-unprepared-' + usage, noPrepare: usage, expected: 'refused' });
    add('shield', 200, { suffix: '-unequal-levels', skills: { 'dafumo-quan': 219 } });
    for (const [name, skill] of [['skill', 'shexing-lifan'], ['force', 'force'], ['dodge', 'dodge']])
        for (const value of [149, 150]) add('guiyuan', 200, { suffix: '-' + name + '-' + value,
            skills: { [skill]: value }, expected: value === 149 ? 'refused' : 'observed' });
    for (const value of [999, 1000]) add('guiyuan', 200, { suffix: '-max-neili-' + value,
        properties: { max_neili: value, neili: value }, expected: value === 999 ? 'refused' : 'observed' });
    for (const value of [9, 10]) add('guiyuan', 200, { suffix: '-dex-' + value,
        properties: { dex: value }, expected: value === 9 ? 'refused' : 'observed' });
    add('guiyuan', 200, { suffix: '-armed', weapon: true });
    add('guiyuan', 200, { suffix: '-force-unmapped', noMap: 'force' });
    for (const seq of [['powerup', 'shield'], ['shield', 'powerup']])
        add(seq[0], 200, { suffix: '-then-' + seq[1], repeat: seq.map(action) });
    const temp = { 'apply/attack': 7, 'apply/armor': 111, 'apply/force': 5, 'apply/dodge': 11,
        'apply/damage': 13, 'apply/unarmed_damage': 17, 'apply/str': 3, 'apply/dex': 5, str: 7, dex: 11 };
    // Own skill/2, effective force, and six-skill mean are distinct original clocks.
    add('powerup', 20, { suffix: '-expiry', temp: { ...temp, 'apply/force': 0 }, wait: 32 });
    add('shield', 200, { suffix: '-expiry', temp, wait: 202 });
    add('guiyuan', 150, { suffix: '-expiry', temp, wait: 77 });
    return result;
}

export function jiuyinBuffDelta(state, ability) {
    if (ability === 'powerup') return { attack: Math.trunc(state.effective_skills.force / 3) };
    if (ability === 'guiyuan') return {};
    const level = Math.trunc(jiuyinShieldSkills.reduce((n, s) => n + (state.skills[s] ?? 0), 0) / 6);
    return { ...Object.fromEntries(['armor', 'force', 'dodge', 'parry', 'strike', 'claw', 'whip'].map(k => [k, Math.trunc(level / 4)])),
        damage: Math.trunc(level / 12), unarmed_damage: Math.trunc(level / 12) };
}

function verifyStep(before, after, ability, success, fighting) {
    const cost = success ? (ability === 'guiyuan' ? 200 : 100) : 0;
    for (const k of resources) assert.equal(after[k], before[k] - (k === 'neili' ? cost : 0), k);
    assert.deepEqual(after.skills, before.skills); assert.deepEqual(after.mappings, before.mappings);
    assert.deepEqual(after.preparations, before.preparations);
    const delta = success ? jiuyinBuffDelta(before, ability) : {};
    for (const k of applyKeys) assert.equal(bonus(after, k) - bonus(before, k), delta[k] ?? 0, k);
    for (const k of ['str', 'dex']) {
        assert.equal((after.temp[k] ?? 0) - (before.temp[k] ?? 0),
            success && ability === 'guiyuan' ? Math.trunc(before.skills['shexing-lifan'] / 50) : 0, k);
        assert.equal(after['effective_' + k], before['effective_' + k], 'actual ' + k);
    }
    for (const k of ['powerup', 'shield', 'gui_yuan'])
        assert.equal(after.temp[k] ?? 0, success && k === flag(ability) ? 1 : before.temp[k] ?? 0, k);
    assert.equal(after.busy ?? 0, success ? (fighting ? ability === 'powerup' ? 3 : 2 : 0) : before.busy ?? 0);
    return cost;
}

export function validateEmeiJiuyinBuffRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'emei-jiuyin-buff'); assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2, k);
    for (const k of ['launches', 'callbacks', 'attacks', 'terminals']) assert.ok(Array.isArray(raw[k]), k);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.terminals.length, 0);
    const b = raw.before[0], a = raw.immediate[0], end = raw.after[0];
    for (const [i, cfg] of [p.actor, p.target].entries()) {
        const s = raw.before[i];
        assert.equal(s.userp, 1); assert.equal(s.interactive, 1); assert.equal(s.wizardp, 0);
        assert.deepEqual(s.skills, cfg.skills); assert.deepEqual(s.mappings, cfg.mappings);
        assert.deepEqual(s.preparations, cfg.preparations); assert.equal(s.busy ?? 0, cfg.busy ?? 0);
        assert.equal(s.weapon, cfg.equipment?.type ?? 'none');
        for (const [k, v] of Object.entries(cfg.properties))
            assert.equal(k.includes('/') ? s.cultivation[k] : s[k], v, k);
        for (const [k, v] of Object.entries(cfg.temp ?? {}))
            assert.equal(k.startsWith('apply/') ? bonus(s, k.slice(6)) : s.temp[k], v, k);
    }
    assert.deepEqual(raw.immediate[1], raw.before[1]); assert.deepEqual(raw.after[1], raw.before[1]);
    let totalCost = 0, accepted = 0;
    if (p.repeat_actions) {
        assert.equal(raw.repeat_steps?.length, p.repeat_actions.length);
        const used = new Set();
        for (const [i, s] of raw.repeat_steps.entries()) {
            assert.equal(s.action, p.repeat_actions[i]); assert.deepEqual(s.before, i ? raw.repeat_steps[i - 1].after : b);
            const ability = s.action === action('guiyuan') ? 'guiyuan' : s.action.slice(6);
            const ok = !used.has(ability); used.add(ability);
            assert.equal(s.accepted, Number(ok)); assert.equal(s.launches_after - s.launches_before, Number(ok));
            totalCost += verifyStep(s.before, s.after, ability, ok, false); accepted += Number(ok);
            if (!ok) assert.ok(s.reason);
        }
        assert.deepEqual(a, raw.repeat_steps.at(-1).after);
    } else {
        accepted = Number(p.expected === 'observed');
        totalCost = verifyStep(b, a, p.ability, Boolean(accepted), p.fighting);
        if (!accepted) assert.ok(raw.reason);
    }
    assert.equal(raw.command_accepted, Number(accepted > 0)); assert.equal(raw.launches.length, accepted);
    for (const launch of raw.launches) {
        const ability = launch.argument.split(' ')[0];
        assert.ok(['powerup', 'shield', 'guiyuan'].includes(ability));
        assert.equal(launch.skill, ability === 'guiyuan' ? 'shexing-lifan' : 'yijin-duangu');
    }
    for (const [i, m] of raw.metrics.entries()) {
        assert.ok(m && typeof m === 'object' && !Array.isArray(m));
        for (const k of resources) for (const suffix of ['cost', 'recovery'])
            assert.equal(m[k + '_' + suffix] ?? 0, i === 0 && k === 'neili' && suffix === 'cost' ? totalCost : 0);
        assert.equal(m.direct ?? 0, 0);
    }
    if (!p.observe_seconds) { assert.deepEqual(end, a); assert.equal(raw.callbacks.length, 0); return; }
    assert.deepEqual(raw.callbacks.map(c => [c.side, c.phase]), [[0, 'before'], [0, 'after']]);
    const duration = p.ability === 'guiyuan' ? Math.trunc(b.skills['shexing-lifan'] / 2)
        : p.ability === 'powerup' ? b.effective_skills.force
            : Math.trunc(jiuyinShieldSkills.reduce((n, s) => n + b.skills[s], 0) / 6);
    assert.ok(raw.callbacks[0].elapsed >= duration - 1 && raw.elapsed >= p.observe_seconds - 1);
    for (const s of [raw.callbacks[1].state, end]) {
        for (const k of applyKeys) assert.equal(bonus(s, k), bonus(b, k), k);
        for (const k of ['str', 'dex']) assert.equal(s.temp[k] ?? 0, b.temp[k] ?? 0);
        assert.equal(s.temp[flag(p.ability)] ?? 0, 0);
        for (const k of resources) assert.equal(s[k], a[k]);
        assert.equal(s.effective_str, b.effective_str); assert.equal(s.effective_dex, b.effective_dex);
    }
}

export function emeiJiuyinBuffEffects(rows) {
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome) && r.raw).map(r => r.raw);
    const delta = (a, b, k) => Number.isFinite(a?.[k]) && Number.isFinite(b?.[k]) ? a[k] - b[k] : null;
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        cost: distribution(raw.map(r => delta(r.before[0], r.immediate[0], 'neili'))),
        apply: Object.fromEntries(applyKeys.map(k => [k, distribution(raw.map(r => bonus(r.immediate[0], k) - bonus(r.before[0], k)))])),
        attributes: Object.fromEntries(['str', 'dex'].map(k => [k, {
            temporary: distribution(raw.map(r => (r.immediate[0].temp[k] ?? 0) - (r.before[0].temp[k] ?? 0))),
            effective: distribution(raw.map(r => delta(r.immediate[0], r.before[0], 'effective_' + k))),
        }])),
        callback_seconds: distribution(raw.map(r => r.callbacks.find(c => c.phase === 'before')?.elapsed)),
    };
}
