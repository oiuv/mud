// Original Linji powerup and its prerequisite for Piaoxue zhao. Not a replacement executor.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';

const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const applyKeys = ['attack', 'dodge', 'damage'];
const bonus = (s, key) => s.temp.apply?.[key] ?? 0;
const sources = ['kungfu/skill/linji-zhuang.c', 'kungfu/skill/linji-zhuang/powerup.c',
    'kungfu/skill/mahayana.c', 'kungfu/class/emei/miejue.c', 'kungfu/class/emei/emei.h',
    'inherit/skill/force.c', 'inherit/skill/skill.c', 'cmds/skill/exert.c',
    'feature/action.c', 'feature/skill.c', 'feature/damage.c', 'clone/user/user.c'];
const note = '真实非巫师USER，实验赋予等级和资源；女性峨嵋配置来自原教师，非自然养成证明。'
    + '按原exert扣费、忙乱和绑定回调，不预写强化结果；sex普通字段与gender分列，学习限制不冒充运功限制。'
    + '即时与自然到期分开；重复施展不补给，不手工清除标记或加速回调。';

function entry(catalog, id, role) {
    const source = catalog.skills.find(s => s.id === id);
    assert.ok(source, '缺少峨嵋来源：' + id);
    const found = source.entries.find(e => e.role === role);
    assert.ok(found, '缺少峨嵋入口：' + id);
    return found.id;
}

function actor(level, extra = {}) {
    return { skills: { force: level, 'linji-zhuang': level, mahayana: level, ...extra.skills },
        mappings: extra.unmapped ? {} : { force: 'linji-zhuang' }, preparations: {},
        properties: { qi: 10000, eff_qi: 10000, max_qi: 10000,
            jing: 10000, eff_jing: 10000, max_jing: 10000,
            neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
            combat_exp: 100000000, jiali: 0, shen: 200000, gender: '女性', sex: 0,
            'family/family_name': '峨嵋派', ...extra.properties },
        ...(extra.busy ? { busy: 2 } : {}), ...(extra.temp ? { temp: extra.temp } : {}) };
}

export function emeiExertConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const entryId = entry(catalog, 'linji-zhuang/powerup', 'exert'), result = [];
    function add(level, extra = {}) {
        const random = extra.fighting && extra.expected !== 'refused';
        result.push({ id: `school-emei-exert-linji-zhuang-powerup-l${level}${extra.suffix ?? ''}`,
            stage: 'school', method: 'exert', entry_id: entryId,
            samples: smoke ? (random ? 2 : 1) : (random ? samples : 2),
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-exert',
                skill: 'linji-zhuang', usage: 'force', ability: 'powerup', level,
                combination: extra.suffix ?? 'base', actor: actor(level, extra),
                target: { skills: {}, mappings: {}, preparations: {}, properties: {} },
                named_participants: true, action: `exert powerup${extra.other ? ' right' : ''}`,
                fighting: extra.fighting ?? false, expected: extra.expected ?? 'observed', not_applicable: '',
                observation: extra.expiry ? 'timed_effect' : 'single_action_immediate',
                observe_seconds: extra.expiry ? level + 2 : 0,
                ...(extra.repeat ? { repeat_actions: ['exert powerup', 'exert powerup'] } : {}),
                qualification_sources: [...sources], qualification_note: note } });
    }
    for (const level of [200, 400, 800]) {
        add(level); add(level, { suffix: '-fighting', fighting: true });
        add(level, { suffix: '-sex', properties: { sex: 1 } });
        add(level, { suffix: '-sex-fighting', properties: { sex: 1 }, fighting: true });
    }
    for (const [suffix, extra] of [
        ['low-neili', { properties: { neili: 99 } }], ['busy', { busy: true }],
        ['other', { other: true }], ['unmapped', { unmapped: true }],
        ['no-exert', { temp: { no_exert: 1 } }], ['already', { temp: { powerup: 1 } }],
    ]) add(200, { suffix: '-' + suffix, ...extra, expected: 'refused' });
    for (const [suffix, extra] of [
        ['minimum-neili', { properties: { neili: 100 } }], ['repeat', { repeat: true }],
        ['other-family', { properties: { 'family/family_name': '华山派' } }],
        ['male', { properties: { gender: '男性' } }], ['eunuch', { properties: { gender: '无性' } }],
        ...[0, 9, 10].map(n => ['mahayana-' + n, { skills: { mahayana: n } }]),
    ]) add(200, { suffix: '-' + suffix, ...extra });
    for (const level of [1, 199, 200, 201]) add(level, { suffix: '-cap-boundary' });
    for (const sex of [0, 1]) add(50, { suffix: '-expiry-sex-' + sex, expiry: true,
        properties: { sex }, temp: { 'apply/attack': 7, 'apply/dodge': 11, 'apply/damage': 13 } });
    return result;
}

export function emeiZhaoConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const entryId = entry(catalog, 'piaoxue-zhang/zhao', 'perform'), result = [];
    entry(catalog, 'linji-zhuang/powerup', 'exert');
    function add(level, extra = {}) {
        const a = actor(level, extra);
        a.skills = { strike: level, 'piaoxue-zhang': level, parry: level, dodge: level,
            'zhutian-bu': level, buddhism: level, 'martial-cognize': level, ...a.skills };
        a.mappings = { ...a.mappings, parry: 'piaoxue-zhang', dodge: 'zhutian-bu',
            ...(extra.noMap ? {} : { strike: 'piaoxue-zhang' }) };
        a.preparations = extra.unprepared ? {} : { strike: 'piaoxue-zhang' };
        a.properties['can_perform/piaoxue-zhang/zhao'] = extra.noGrant ? 0 : 1;
        if (extra.weapon) a.equipment = { type: 'sword', hold: false };
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200,
            ...(extra.jiuyang ? { 'jiuyang-shengong': 200 } : {}), ...extra.targetSkills },
            mappings: extra.jiuyang ? { force: 'jiuyang-shengong' } : {}, preparations: {},
            properties: {}, equipment: { type: 'sword', hold: false } };
        result.push({ id: `school-emei-zhao-l${level}${extra.suffix ?? ''}`, stage: 'school',
            entry_id: entryId, method: 'perform', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-zhao',
                skill: 'piaoxue-zhang', usage: 'strike', ability: 'zhao', level,
                combination: 'piaoxue-zhang+linji-zhuang', actor: a, target,
                action: 'perform strike.zhao', fighting: extra.fighting ?? true,
                powerup_before_combat: true, powerup_expected: extra.powerupExpected ?? 'observed',
                expected: extra.expected ?? 'observed', not_applicable: '',
                observation: extra.expiry ? 'timed_effect' : 'single_action_immediate',
                observe_seconds: extra.expiry ? a.skills['linji-zhuang'] + 2 : 0,
                qualification_sources: [...sources, 'kungfu/skill/piaoxue-zhang.c',
                    'kungfu/skill/piaoxue-zhang/zhao.c', 'kungfu/skill/zhutian-bu.c',
                    'kungfu/skill/jiuyang-shengong.c', 'cmds/skill/perform.c', 'adm/daemons/combatd.c'],
                qualification_note: note + '先在非战斗状态执行原exert powerup，再建立实验敌对并执行原perform；不补内力或清忙。'
                    + '前置与绝招分别留存快照、发动次数和扣费。绝招拒绝不抹掉前置的100内力支出；九阳目标仅原分支，不宣称免疫所有伤害。' } });
    }
    for (const level of [200, 400, 800]) {
        add(level); add(level, { suffix: '-sex', properties: { sex: 1 } });
        add(level, { suffix: '-jiuyang-target', jiuyang: true, checks: 2 });
        add(level, { suffix: '-low-defense', targetSkills: { force: 2, dodge: 2 }, checks: 2 });
        add(level, { suffix: '-high-defense', targetSkills: { force: 100000, dodge: 100000 }, checks: 2 });
    }
    const check = (suffix, extra) => add(200, { suffix: '-' + suffix, checks: 2, ...extra });
    for (const [suffix, extra] of [
        ['no-grant', { noGrant: true }], ['low-skill', { skills: { 'piaoxue-zhang': 179 } }],
        ['low-force', { skills: { force: 2, 'linji-zhuang': 298 } }],
        ['low-neili', { properties: { neili: 1099 } }],
        ['low-max-neili', { properties: { neili: 3499, max_neili: 3499 } }],
        ['weapon', { weapon: true }], ['unprepared', { unprepared: true }],
        ['no-map', { noMap: true }], ['no-fight', { fighting: false }],
        ['busy', { busy: true, powerupExpected: 'refused' }],
        ['no-exert', { temp: { no_exert: 1 }, powerupExpected: 'refused' }],
        ['unmapped-force', { unmapped: true, powerupExpected: 'refused' }],
        ['powerup-low-neili', { properties: { neili: 99 }, powerupExpected: 'refused' }],
        ['powerup-minimum-neili', { properties: { neili: 100 } }],
    ]) check(suffix, { ...extra, expected: 'refused' });
    for (const [suffix, extra] of [
        ['minimum-skill', { skills: { 'piaoxue-zhang': 180 } }],
        ['minimum-force', { skills: { force: 2, 'linji-zhuang': 299 } }],
        ['minimum-neili', { properties: { neili: 1100 } }],
        ['minimum-max-neili', { properties: { neili: 3500, max_neili: 3500 } }],
    ]) check(suffix, extra);
    for (const jiuyang of [false, true]) check('expiry-' + (jiuyang ? 'jiuyang' : 'miss'), {
        expiry: true, jiuyang, skills: { force: 500, 'linji-zhuang': 50 },
        targetSkills: jiuyang ? {} : { force: 100000, dodge: 100000 },
        temp: { 'apply/attack': 7, 'apply/dodge': 11, 'apply/damage': 13 } });
    return result;
}

// Expected deltas only: these functions never supply values to the running game.
export function emeiPowerupBonus(state) {
    const level = state.skills['linji-zhuang'], knowledge = state.skills.mahayana ?? 0;
    return { attack: Math.trunc(level / 3), dodge: Math.trunc(level / 3),
        damage: Math.min(state.cultivation.sex ? 0 : Math.trunc(level / 2), 100) + Math.trunc(knowledge / 10) };
}

function sameResources(b, a, except = []) {
    for (const key of resources.filter(k => !except.includes(k))) {
        assert.ok(Number.isFinite(b[key]) && Number.isFinite(a[key]), key);
        assert.equal(a[key], b[key], key);
    }
}

function metric(raw, side, key) {
    const map = raw.metrics[side];
    assert.ok(map && typeof map === 'object' && !Array.isArray(map));
    const value = Object.hasOwn(map, key) ? map[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, key);
    return value;
}

function verifyInput(raw, p) {
    assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'callbacks', 'attacks', 'interfaces']) assert.ok(Array.isArray(raw[key]), key);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 0);
    for (const [i, cfg] of [p.actor, p.target].entries()) {
        const s = raw.before[i];
        assert.equal(s.userp, 1); assert.equal(s.interactive, 1); assert.equal(s.wizardp, 0);
        assert.deepEqual(s.skills, cfg.skills); assert.deepEqual(s.mappings, cfg.mappings);
        assert.deepEqual(s.preparations, cfg.preparations); assert.equal(s.busy ?? 0, cfg.busy ?? 0);
        assert.equal(s.weapon, cfg.equipment?.type ?? 'none');
        for (const key of resources.concat(['str', 'int', 'con', 'dex', 'gender', 'combat_exp', 'jiali', 'shen']))
            if (Object.hasOwn(cfg.properties, key)) assert.equal(s[key], cfg.properties[key], key);
        for (const key of ['sex', 'family/family_name']) {
            assert.ok(Object.hasOwn(s.cultivation, key));
            assert.equal(s.cultivation[key] ?? 0, cfg.properties[key] ?? 0, key);
        }
        for (const [key, value] of Object.entries(cfg.temp ?? {}))
            assert.equal(key.startsWith('apply/') ? bonus(s, key.slice(6)) : s.temp[key], value);
    }
}

function powerupStep(b, a, success, fighting = false) {
    sameResources(b, a, ['neili']); assert.equal(b.neili - a.neili, success ? 100 : 0);
    assert.deepEqual(a.skills, b.skills); assert.deepEqual(a.mappings, b.mappings);
    assert.deepEqual(a.preparations, b.preparations);
    const expected = emeiPowerupBonus(b);
    for (const key of applyKeys) assert.equal(bonus(a, key) - bonus(b, key), success ? expected[key] : 0);
    if (success) {
        assert.equal(a.temp.powerup, 1);
        if (fighting) assert.ok(a.busy >= 1 && a.busy <= 3); else assert.equal(a.busy ?? 0, 0);
    } else {
        assert.equal(a.temp.powerup ?? 0, b.temp.powerup ?? 0); assert.equal(a.busy, b.busy);
    }
}

function expiry(raw, p, original) {
    const [a, t] = raw.immediate, [end] = raw.after;
    assert.deepEqual(raw.after[1], t);
    if (!p.observe_seconds) {
        assert.equal(raw.callbacks.length, 0); assert.deepEqual(end, a); return;
    }
    assert.deepEqual(raw.callbacks.map(s => [s.side, s.phase]), [[0, 'before'], [0, 'after']]);
    const [x, y] = raw.callbacks;
    assert.ok(x.elapsed >= original.skills['linji-zhuang'] - 1);
    assert.ok(y.elapsed >= x.elapsed && y.elapsed <= raw.elapsed);
    assert.ok(raw.elapsed >= p.observe_seconds - 1); assert.equal(x.state.temp.powerup, 1);
    for (const key of applyKeys) assert.equal(bonus(x.state, key), bonus(a, key));
    for (const state of [y.state, end]) {
        assert.ok(!state.temp.powerup); sameResources(a, state);
        for (const key of applyKeys) assert.equal(bonus(state, key), bonus(original, key));
    }
}

export function validateEmeiExertRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'emei-exert'); assert.equal(condition.method, 'exert');
    verifyInput(raw, p);
    const b = raw.before[0], a = raw.immediate[0], success = p.expected === 'observed';
    assert.equal(raw.command_accepted, Number(success));
    assert.deepEqual(raw.before[1], raw.immediate[1]);
    if (p.repeat_actions) {
        assert.equal(raw.repeat_steps?.length, 2);
        for (const [i, s] of raw.repeat_steps.entries()) {
            assert.equal(s.action, p.repeat_actions[i]);
            assert.deepEqual(s.before, i ? raw.repeat_steps[i - 1].after : b);
            assert.equal(s.accepted, Number(!i)); assert.equal(s.launches_after - s.launches_before, Number(!i));
            powerupStep(s.before, s.after, !i);
            if (i) { assert.ok(s.reason); assert.ok(s.refusals_after > s.refusals_before); }
        }
        assert.deepEqual(a, raw.repeat_steps.at(-1).after);
    } else powerupStep(b, a, success, p.fighting);
    assert.equal(raw.launches.length, Number(success));
    assert.ok(raw.launches.every(s => s.skill === 'linji-zhuang' && s.argument === 'powerup'));
    assert.equal(metric(raw, 0, 'neili_cost'), success ? 100 : 0);
    for (const side of [0, 1]) for (const key of resources) for (const kind of ['cost', 'recovery'])
        if (!(side === 0 && key === 'neili' && kind === 'cost')) assert.equal(metric(raw, side, key + '_' + kind), 0);
    assert.equal(metric(raw, 0, 'direct'), 0);
    if (!success) assert.ok(raw.reason);
    expiry(raw, p, b);
}

export function validateEmeiZhaoRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'emei-zhao'); assert.equal(condition.method, 'perform');
    verifyInput(raw, p); assert.equal(p.powerup_before_combat, true);
    const step = raw.powerup;
    assert.equal(step?.action, 'exert powerup'); assert.deepEqual(step.before, raw.before);
    assert.equal(step.after?.length, 2);
    const ready = p.powerup_expected === 'observed', success = p.expected === 'observed';
    assert.equal(step.accepted, Number(ready)); assert.equal(step.launches_before, 0);
    assert.equal(step.launches_after, Number(ready));
    powerupStep(step.before[0], step.after[0], ready);
    assert.deepEqual(step.before[1], step.after[1]);
    const [b, bt] = step.after, [a, t] = raw.immediate;
    assert.equal(raw.action_attempted, Number(ready));
    assert.equal(raw.command_accepted, Number(success));
    if (!ready) assert.ok(step.reason);
    assert.equal(raw.launches.length, Number(ready) + Number(success));
    if (ready) assert.deepEqual([raw.launches[0].skill, raw.launches[0].argument], ['linji-zhuang', 'powerup']);
    if (success) assert.deepEqual([raw.launches.at(-1).skill, raw.launches.at(-1).argument], ['piaoxue-zhang', 'zhao']);
    const direct = metric(raw, 0, 'direct'); assert.ok(direct === 0 || direct === 1);
    const immune = bt.mappings.force === 'jiuyang-shengong';
    const cost = success ? (immune || direct ? 600 : 400) : 0;
    assert.equal(metric(raw, 0, 'neili_cost'), Number(ready) * 100 + cost);
    assert.equal(b.neili - a.neili, cost); sameResources(b, a, ['neili']);
    assert.deepEqual(a.skills, b.skills); assert.deepEqual(a.mappings, b.mappings);
    assert.deepEqual(a.preparations, b.preparations);
    for (const key of applyKeys) assert.equal(bonus(a, key), bonus(b, key));
    assert.equal(a.temp.powerup ?? 0, b.temp.powerup ?? 0);
    assert.equal(a.busy, success ? (immune || direct ? 3 : 4) : b.busy);
    assert.equal(metric(raw, 0, 'neili_recovery'), 0);
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) {
        assert.equal(metric(raw, 0, key + '_cost'), 0); assert.equal(metric(raw, 0, key + '_recovery'), 0);
        assert.equal(bt[key] - t[key], metric(raw, 1, key + '_cost'));
        assert.equal(metric(raw, 1, key + '_recovery'), 0);
    }
    assert.equal(metric(raw, 1, 'neili_cost'), 0); assert.equal(metric(raw, 1, 'neili_recovery'), 0);
    sameResources(bt, t, ['qi', 'eff_qi']); assert.equal(t.busy, bt.busy);
    if (!success || immune || !direct) {
        assert.equal(direct, 0); assert.deepEqual(t, bt);
    }
    if (!success) assert.ok(raw.reason);
    if (success) {
        assert.ok(b.skills['piaoxue-zhang'] >= 180 && b.effective_skills.force >= 300);
        assert.ok(b.neili >= 1000 && b.max_neili >= 3500); assert.equal(b.temp.powerup, 1);
        assert.equal(b.weapon, 'none'); assert.equal(b.mappings.strike, 'piaoxue-zhang');
        assert.equal(b.preparations.strike, 'piaoxue-zhang');
        const ap = b.effective_skills.strike + b.effective_skills.force + b.str * 5;
        const dp = bt.effective_skills.dodge + bt.effective_skills.force + bt.con * 5;
        if (!immune && Math.trunc(ap / 2) > dp) assert.equal(direct, 1);
        if (!immune && Math.trunc(ap / 2) + ap - 1 <= dp) assert.equal(direct, 0);
    }
    expiry(raw, p, raw.before[0]);
}

export function emeiExertEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' || r.outcome === 'refused').map(r => r.raw);
    const delta = (a, b, key) => Number.isFinite(a?.[key]) && Number.isFinite(b?.[key]) ? a[key] - b[key] : null;
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        prelude_cost: distribution(raw.filter(r => r?.powerup).map(r => delta(r.powerup.before?.[0], r.powerup.after?.[0], 'neili'))),
        action_cost: distribution(raw.map(r => delta(r?.powerup?.after?.[0] ?? r?.before?.[0], r?.immediate?.[0], 'neili'))),
        total_cost: distribution(raw.map(r => delta(r?.before?.[0], r?.immediate?.[0], 'neili'))),
        apply: Object.fromEntries(applyKeys.map(key => [key, distribution(raw.map(r => {
            const a = r?.immediate?.[0], b = r?.before?.[0];
            return a?.temp && b?.temp ? bonus(a, key) - bonus(b, key) : null;
        }))])),
        callback_seconds: distribution(raw.map(r => r?.callbacks?.find(s => s.side === 0 && s.phase === 'before')?.elapsed)),
    };
}
