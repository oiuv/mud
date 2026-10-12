// Original Shaolin exert commands, with explicit input cases and no game-rule replacement.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';

export function shaolinExertConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, ability, level = 200, extra = {}) {
        const missing = ['shaolin-xinfa', 'shaolin-jiuyang'].includes(skill);
        const source = catalog.skills.find(s => s.id === (missing ? skill : `${skill}/${ability}`));
        assert.ok(source, '缺少少林内功来源');
        const actor = { skills: { force: level, [skill]: level, buddhism: 400, ...extra.skills },
            mappings: extra.unmapped ? {} : { force: skill }, preparations: {},
            properties: { qi: ability === 'tong' ? 3000 : 10000, eff_qi: ability === 'tong' ? 5000 : 10000,
                max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
                neili: 6000, max_neili: 6000, int: 36, con: 36, gender: '男性',
                combat_exp: 100000000, jiali: 0, 'family/family_name': '少林派',
                ...(ability === 'tong' ? { 'can_perform/yijinjing/tong': 1 } : {}), ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}), ...(extra.temp ? { temp: extra.temp } : {}) };
        const expected = extra.expected ?? (missing ? 'refused' : 'observed');
        const random = ability === 'powerup' && extra.fighting && expected === 'observed';
        result.push({ id: `school-shaolin-exert-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: missing ? source.path : source.entries.find(e => e.role === 'exert').id,
            method: 'exert', samples: smoke ? (random ? 2 : 1) : random ? samples : 2,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-exert',
                skill, usage: 'force', ability, level, combination: extra.suffix ?? 'base', actor,
                target: { skills: {}, mappings: {}, preparations: {}, properties: {} },
                named_participants: true, action: `exert ${ability}${extra.other ? ' right' : ''}`,
                fighting: extra.fighting ?? false, expected, not_applicable: '',
                observation: extra.expiry ? 'timed_effect' : 'single_action_immediate',
                observe_seconds: extra.expiry ? level + 2 : 0,
                ...(extra.repeat ? { repeat_actions: Array(extra.repeat).fill(`exert ${ability}`) } : {}),
                qualification_sources: [...new Set([source.path, `kungfu/skill/${skill}.c`,
                    'kungfu/skill/force.c', 'inherit/skill/force.c', 'inherit/skill/skill.c',
                    'cmds/skill/exert.c', 'feature/action.c', 'feature/skill.c', 'feature/damage.c',
                    'clone/user/user.c', 'kungfu/class/shaolin/da-mo.c', 'kungfu/class/shaolin/wuming.c'])],
                qualification_note: '真实非巫师USER经原exert；等级、资源、领悟为显式实验资格，不证明NPC自然授课。加力战斗忙乱每条件100次，其余确定性两次；自然到期用原50秒回调，不加速、不手工清除标记。重复命令无补给。临时apply偏移仅用于验证原回调撤除自身增益。少林心法/九阳不存在独有目录，拒绝不等于没有公共内功功能；走火、公共恢复及真实交锋另列。',
            } });
    }
    for (const skill of ['hunyuan-yiqi', 'yijinjing']) {
        for (const level of [200, 400, 800]) {
            add(skill, 'powerup', level);
            add(skill, 'powerup', level, { suffix: '-fighting', fighting: true });
        }
        const minimum = skill === 'hunyuan-yiqi' ? 150 : 200;
        for (const [suffix, extra] of [
            ['low-neili', { properties: { neili: minimum - 1 } }], ['busy', { busy: true }],
            ['other', { other: true }], ['unmapped', { unmapped: true }],
            ['no-exert', { temp: { no_exert: 1 } }], ['already', { temp: { powerup: 1 } }],
        ]) add(skill, 'powerup', 200, { suffix: '-' + suffix, ...extra, expected: 'refused' });
        add(skill, 'powerup', 200, { suffix: '-minimum-neili', properties: { neili: minimum } });
        add(skill, 'powerup', 200, { suffix: '-repeat', repeat: 2 });
        add(skill, 'powerup', 200, { suffix: '-other-family', properties: { 'family/family_name': '华山派' } });
        add(skill, 'powerup', 1, { suffix: '-low-level' });
        add(skill, 'powerup', 50, { suffix: '-expiry', expiry: true,
            temp: { 'apply/attack': 7, 'apply/defense': 11 } });
    }
    for (const level of [200, 400, 800]) {
        add('yijinjing', 'tong', level);
        add('yijinjing', 'tong', level, { suffix: '-fighting', fighting: true });
    }
    for (const [suffix, extra] of [
        ['no-grant', { properties: { 'can_perform/yijinjing/tong': 0 } }],
        ['low-skill', { skills: { yijinjing: 99 } }], ['low-neili', { properties: { neili: 999 } }],
        ['low-max-neili', { properties: { max_neili: 499 } }],
        ['severe', { properties: { qi: 999, eff_qi: 999 } }],
        ['light', { properties: { qi: 8100, eff_qi: 8100 } }],
        ['healthy', { properties: { qi: 10000, eff_qi: 10000 } }],
        ['busy', { busy: true }], ['other', { other: true }], ['unmapped', { unmapped: true }],
        ['no-exert', { temp: { no_exert: 1 } }],
    ]) add('yijinjing', 'tong', 200, { suffix: '-' + suffix, ...extra, expected: 'refused' });
    for (const [suffix, extra] of [
        ['minimum-neili', { properties: { neili: 1000 } }],
        ['minimum-max-neili', { properties: { max_neili: 500 } }],
        ['ten-percent', { properties: { qi: 1000, eff_qi: 1000 } }],
        ['eighty-percent', { properties: { qi: 8000, eff_qi: 8000 } }],
        ['percent-truncation', { properties: { qi: 8099, eff_qi: 8099 } }],
        ['other-family', { properties: { 'family/family_name': '华山派' } }],
        ['repeat', { repeat: 3 }],
    ]) add('yijinjing', 'tong', 200, { suffix: '-' + suffix, ...extra });
    add('yijinjing', 'tong', 100, { suffix: '-minimum', properties: { neili: 500, max_neili: 500 } });
    add('yijinjing', 'tong', 800, { suffix: '-repeat-low-capacity', repeat: 2,
        properties: { qi: 1000, eff_qi: 1000, neili: 8000, max_neili: 500 } });
    for (const skill of ['shaolin-xinfa', 'shaolin-jiuyang'])
        for (const ability of ['powerup', 'tong']) add(skill, ability);
    return result;
}

const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const value = x => x ?? 0;
const temp = x => { const t = structuredClone(x.temp); delete t.notify_fail; return t; };
const bonus = (s, key) => value(s.temp.apply?.[key]);
function sameResources(b, a, except = []) {
    for (const key of resources.filter(k => !except.includes(k))) assert.equal(a[key], b[key], key);
}

// Source-bound oracle for captured transitions, never used to drive the experiment.
export function shaolinExertStep(p, b) {
    if (p.ability === 'powerup') return { cost: 100, capacity: 0, qi: 0, eff_qi: 0,
        eff_qi_added: 0, eff_qi_capped: 0, bonus: Math.trunc(b.skills[p.skill] / 3) };
    const skill = b.skills.yijinjing, eff = Math.min(b.max_qi, b.eff_qi + skill * 8);
    return { cost: skill * 4, capacity: Math.trunc(skill / 4), qi: eff - b.qi,
        eff_qi: eff - b.eff_qi, eff_qi_added: skill * 8,
        eff_qi_capped: Math.max(0, b.eff_qi + skill * 8 - b.max_qi), bonus: 0 };
}

function validateStep(p, b, a, success) {
    if (!success) {
        sameResources(b, a); assert.equal(a.busy, b.busy); assert.deepEqual(temp(a), temp(b)); return;
    }
    const e = shaolinExertStep(p, b);
    assert.equal(b.neili - a.neili, e.cost); assert.equal(b.max_neili - a.max_neili, e.capacity);
    assert.equal(a.qi - b.qi, e.qi); assert.equal(a.eff_qi - b.eff_qi, e.eff_qi);
    sameResources(b, a, ['qi', 'eff_qi', 'neili', 'max_neili']);
    if (p.ability === 'powerup') {
        for (const k of ['attack', 'defense']) assert.equal(bonus(a, k) - bonus(b, k), e.bonus);
        assert.equal(a.temp.powerup, 1);
        if (p.fighting) assert.ok(a.busy >= 1 && a.busy <= 3); else assert.equal(value(a.busy), 0);
    } else {
        assert.deepEqual(temp(a), temp(b)); assert.equal(value(a.busy), p.fighting ? 4 : 0);
    }
}

export function validateShaolinExertRecord(raw, condition) {
    const p = condition.parameters, b = raw.before[0], a = raw.immediate[0], end = raw.after[0];
    assert.equal(condition.method, 'exert'); assert.equal(raw.outcome, p.expected);
    assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 0);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const s = raw.before[side]; assert.equal(s.userp, 1); assert.equal(s.wizardp, 0);
        assert.deepEqual(s.mappings, cfg.mappings); assert.deepEqual(s.skills, cfg.skills);
        for (const key of resources) if (Object.hasOwn(cfg.properties, key)) assert.equal(s[key], cfg.properties[key]);
        assert.equal(s.cultivation['family/family_name'], cfg.properties['family/family_name'] ?? null);
    }
    assert.deepEqual(raw.before[1], raw.after[1]);
    assert.deepEqual(a.skills, b.skills); assert.deepEqual(a.mappings, b.mappings);
    let count = 0, added = 0, capped = 0;
    if (p.repeat_actions) {
        assert.equal(raw.repeat_steps.length, p.repeat_actions.length);
        for (const [i, s] of raw.repeat_steps.entries()) {
            assert.equal(s.action, p.repeat_actions[i]);
            assert.deepEqual(s.before, i ? raw.repeat_steps[i - 1].after : b);
            const success = p.ability === 'powerup' ? i === 0
                : s.before.max_neili >= 500 && s.before.neili >= s.before.skills.yijinjing * 5
                    && Math.trunc(s.before.eff_qi * 100 / s.before.max_qi) <= 80;
            assert.equal(s.accepted, Number(success));
            assert.equal(s.launches_after - s.launches_before, Number(success));
            validateStep(p, s.before, s.after, success); count += Number(success);
            if (success) {
                const e = shaolinExertStep(p, s.before); added += e.eff_qi_added; capped += e.eff_qi_capped;
            }
            if (!success) { assert.ok(s.reason); assert.ok(s.refusals_after > s.refusals_before); }
        }
        assert.deepEqual(a, raw.repeat_steps.at(-1).after);
    } else {
        count = Number(p.expected === 'observed'); validateStep(p, b, a, count);
        if (count) { const e = shaolinExertStep(p, b); added = e.eff_qi_added; capped = e.eff_qi_capped; }
        if (!count) assert.ok(raw.reason);
    }
    assert.equal(raw.launches.length, count); assert.ok(raw.launches.every(s => s.skill === p.skill));
    assert.equal(value(raw.metrics[0].neili_cost), b.neili - a.neili);
    assert.equal(value(raw.metrics[0].neili_recovery), 0);
    // Original tong first adds skill*8, then caps eff_qi with set(). The observer
    // records both mutations; the cap reduction is not damage received in combat.
    assert.equal(value(raw.metrics[0].eff_qi_recovery), added);
    assert.equal(value(raw.metrics[0].eff_qi_cost), capped);
    assert.equal(a.eff_qi - b.eff_qi, added - capped);
    for (const key of ['qi', 'jing', 'eff_jing']) {
        assert.equal(value(raw.metrics[0][key + '_cost']), 0);
        assert.equal(value(raw.metrics[0][key + '_recovery']), a[key] - b[key]);
    }
    if (p.observe_seconds) {
        assert.equal(p.ability, 'powerup');
        assert.deepEqual(raw.callbacks.map(s => [s.side, s.phase]), [[0, 'before'], [0, 'after']]);
        const [x, y] = raw.callbacks;
        assert.ok(x.elapsed >= b.skills[p.skill] - 1 && y.elapsed >= x.elapsed && y.elapsed <= raw.elapsed);
        assert.ok(raw.elapsed >= p.observe_seconds - 1); assert.equal(x.state.temp.powerup, 1);
        for (const s of [y.state, end]) {
            assert.ok(!s.temp.powerup); sameResources(a, s);
            for (const key of ['attack', 'defense']) assert.equal(bonus(s, key), bonus(b, key));
        }
    } else { assert.equal(raw.callbacks.length, 0); assert.deepEqual(end, a); }
}

export function shaolinExertEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const delta = key => distribution(raw.map(r => r.immediate[0][key] - r.before[0][key]));
    return { qi_gain: delta('qi'), eff_qi_gain: delta('eff_qi'), max_neili_delta: delta('max_neili'),
        apply: Object.fromEntries(['attack', 'defense'].map(k => [k,
            distribution(raw.map(r => bonus(r.immediate[0], k) - bonus(r.before[0], k)))])),
        commands: raw.flatMap(r => r.repeat_steps ?? []).length,
        accepted: raw.flatMap(r => r.repeat_steps ?? []).filter(s => s.accepted).length,
        refused: raw.flatMap(r => r.repeat_steps ?? []).filter(s => !s.accepted).length };
}
