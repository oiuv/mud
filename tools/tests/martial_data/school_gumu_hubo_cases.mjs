// Independent conditions and validation; synthetic tests are not driver evidence.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

const skill = 'zuoyou-hubo', object = '/kungfu/skill/' + skill;
export const gumuHuboFixtureRequirements = [
    'Register only after the current frozen batch; do not reuse another school teaching sample as Gumu evidence.',
    'Observe original start_busy on either player under the left player command context; preserve requested and actual busy ticks.',
    'Record each original do_perform attempt, result, reason and before/after states, including failed attempts; do not invoke the two moves separately.',
    'Capture skill_improved messages and implementation ownership; keep command acceptance, launches and random gate failure distinct.',
];

export function huboCanLearn(state) {
    const level = state.skills[skill] ?? 0, c = state.cultivation;
    return !(state.gender === '无性' && level >= 50) && !state.skills.count
        && !c['special_skill/qinzong'] && (state.int <= 15 || !!c['special_skill/tiandao'])
        && state.effective_skills.force >= Math.trunc(level * 3 / 4);
}

// Values are original busy counters, not seconds. Zero leaves existing busy untouched.
export function huboBusyValues(level, requested, { own = true, clever = false, before = 0 } = {}) {
    assert.ok(Number.isSafeInteger(level) && level >= 0);
    assert.ok(Number.isSafeInteger(requested) && requested >= 0);
    if (!requested) return [before];
    const layer = Math.min(10, Math.trunc(level / 30));
    const values = own && layer >= 5 ? Array.from({ length: layer - 4 }, (_, i) => Math.max(1, requested - 1 - i))
        : [requested];
    return [...new Set(values.flatMap(n => clever && n > 1 ? [n, n - 1] : [n]))].sort((a, b) => a - b);
}

export function huboGateChance(state, fighting, dual = true) {
    if (state.busy || state.temp.no_perform || state.temp.eff?.['jiuyin-shengong']?.xin) return 0;
    if (!dual) return 1;
    const level = state.skills[skill] ?? 0;
    if (level <= 100 || state.skills.count || state.cultivation['special_skill/qinzong'] || !fighting) return 0;
    return level >= 360 ? 1 : (level - 100) / level;
}

export function gumuHuboConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source = catalog.skills.find(s => s.id === skill); assert.ok(source);
    const rows = [];
    function add(ability, level, extra = {}) {
        const perform = ability === 'perform', busy = ability === 'start_busy';
        const method = perform ? 'perform' : ability === 'research' ? 'research' : 'interface';
        const actor = { skills: { [skill]: level, force: 1200, dodge: 400, strike: 400,
            'tianluo-diwang': 400, count: 0, mathematics: 0, ...extra.skills },
            mappings: perform ? { strike: 'tianluo-diwang' } : {},
            preparations: perform ? { strike: 'tianluo-diwang' } : {},
            properties: { gender: '女性', int: 15, character: '光明磊落', neili: 6000, max_neili: 6000, jiali: 0,
                'family/family_name': '古墓派', 'special_skill/qinzong': 0, 'special_skill/tiandao': 0,
                'can_perform/tianluo-diwang/wang': 1, ...extra.properties },
            ...(extra.busy ? { busy: extra.busy } : {}), ...(extra.temp ? { temp: extra.temp } : {}) };
        const target = { skills: { [skill]: level, dodge: extra.targetDodge ?? 100000, force: 600 },
            mappings: {}, preparations: {}, properties: { gender: '男性', int: 15, character: extra.targetCharacter ?? '光明磊落',
                neili: 6000, max_neili: 6000, jiali: 0 }, ...(extra.targetBusy ? { busy: extra.targetBusy } : {}) };
        const busySide = extra.side ?? 0, busyConfig = busySide ? target : actor;
        const randomBusy = busy && huboBusyValues(level, extra.requested ?? 9, { own: busySide === 0,
            clever: busyConfig.properties.character === '狡黠多变', before: busyConfig.busy ?? 0 }).length > 1;
        const state = { ...actor.properties, skills: actor.skills, cultivation: actor.properties,
            effective_skills: { force: Math.trunc(actor.skills.force / 2) }, busy: actor.busy ?? 0, temp: actor.temp ?? {} };
        const performArguments = extra.arguments ?? ['strike.wang', 'strike.wang'];
        let expected = ['practice_skill', 'research'].includes(ability) ? 'refused' : 'observed';
        if (ability === 'valid_learn') expected = huboCanLearn(state) ? 'observed' : 'refused';
        if (perform) {
            // Source gates only: one successful Wang launch is enough for an observed command,
            // even when the original second attempt is refused after its independent checks.
            const chance = huboGateChance(state, extra.fighting ?? true, performArguments.length === 2);
            const canLaunch = performArguments.includes('strike.wang') && extra.fighting !== false
                && actor.properties['can_perform/tianluo-diwang/wang'] && !target.busy && actor.properties.neili >= 70;
            expected = !chance || !canLaunch ? 'refused' : chance < 1 ? ['observed', 'refused'] : 'observed';
        }
        rows.push({ id: `school-gumu-hubo-${ability}-l${level}${extra.suffix ? '-' + extra.suffix : ''}`,
            stage: 'school', entry_id: source.path, method,
            samples: smoke ? 2 : randomBusy || perform ? samples : 2,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-hubo', skill, ability, level,
                usage: 'knowledge', combination: perform ? 'zuoyou-hubo+tianluo-diwang' : 'single-skill', actor, target,
                action: perform ? `perform ${extra.command ?? 'strike.wang twice'}`
                    : ability === 'research' ? `research ${skill} 1` : 'test_interface',
                ...(perform ? { perform_arguments: performArguments } : {}),
                ...(method === 'interface' ? { interface: { object: busy ? 'player' : object, function: ability,
                    ...(busy ? { player_side: extra.side ?? 0, amount: extra.requested ?? 9 } : {}) } } : {}),
                fighting: perform ? extra.fighting ?? true : false,
                observation: 'single_action_immediate', observe_seconds: 0, not_applicable: '',
                expected,
                qualification_sources: [source.path, 'kungfu/class/gumu/longnv.c', 'kungfu/class/gumu/gumu.h',
                    'kungfu/skill/tianluo-diwang.c', 'kungfu/skill/tianluo-diwang/wang.c',
                    'inherit/skill/skill.c', 'cmds/skill/perform.c', 'cmds/skill/research.c',
                    'feature/action.c', 'feature/skill.c', 'feature/attack.c', 'adm/daemons/combatd.c',
                    'mudcore/inherit/action.c'],
                qualification_note: '真实非巫师USER，实验赋值不证明向小龙女能学到该级。学习、原忙乱调用和原双招命令分列。'
                    + 'count不是mathematics；悟性／性别仅按各入口实际检查，不从学习条件推造施展限制。'
                    + '天罗400级及高气血目标用于隔离命令，无内功映射、加力或自动心跳；保留真实随机、费用、目标忙乱及第二招拒绝。'
                    + '双招必须一次调用原命令，不由夹具清忙后分别执行。命令受理、第一／第二次尝试与实际发动分别记录；忙乱是计数非秒。',
            } });
    }
    for (const level of [1, 49, 50, 100, 101, 149, 150, 200, 300, 360, 400, 800]) add('valid_learn', level);
    for (const level of [49, 50]) for (const [gender, suffix] of [['男性', 'male'], ['女性', 'female'], ['无性', 'asexual']])
        add('valid_learn', level, { suffix, properties: { gender } });
    for (const [suffix, extra] of [['count1', { skills: { count: 1 } }], ['mathematics1', { skills: { mathematics: 1 } }],
        ['qinzong', { properties: { 'special_skill/qinzong': 1 } }], ['int16', { properties: { int: 16 } }],
        ['tiandao', { properties: { int: 36, 'special_skill/tiandao': 1 } }],
        ['tiandao-count', { properties: { int: 36, 'special_skill/tiandao': 1 }, skills: { count: 1 } }]])
        add('valid_learn', 200, { ...extra, suffix });
    for (const level of [149, 150, 200, 800]) for (const low of [false, true])
        add('valid_learn', level, { suffix: low ? 'force-low' : 'force-minimum',
            skills: { force: 2 * (Math.trunc(level * 3 / 4) - Number(low)) } });
    for (const level of [200, 400, 800]) for (const ability of ['type', 'valid_learn_level', 'practice_skill', 'research']) add(ability, level);
    for (const level of [29, 30, 31, 299, 300, 301, 330, 800]) add('skill_improved', level);
    for (const level of [0, 149, 150, 179, 180, 299, 300, 800])
        for (const requested of [1, 2, 3, 9]) for (const side of [0, 1])
            add('start_busy', level, { requested, side, suffix: `n${requested}-side${side}` });
    for (const level of [149, 300]) for (const side of [0, 1]) {
        add('start_busy', level, { requested: 9, side, suffix: `clever-side${side}`,
            properties: { character: '狡黠多变' }, targetCharacter: '狡黠多变' });
        add('start_busy', level, { requested: 0, side, suffix: `zero-side${side}`, busy: 7, targetBusy: 7 });
    }
    for (const level of [0, 100, 101, 149, 150, 200, 299, 300, 359, 360, 400, 800]) {
        add('perform', level);
        add('perform', level, { command: 'strike.wang', arguments: ['strike.wang'], suffix: 'single' });
    }
    for (const [suffix, extra] of [['and', { command: 'strike.wang and strike.wang' }],
        ['first-unknown', { command: 'strike.missing and strike.wang', arguments: ['strike.missing', 'strike.wang'] }],
        ['second-unknown', { command: 'strike.wang and strike.missing', arguments: ['strike.wang', 'strike.missing'] }],
        ['no-grant', { properties: { 'can_perform/tianluo-diwang/wang': 0 } }],
        ['count1', { skills: { count: 1 } }], ['mathematics1', { skills: { mathematics: 1 } }],
        ['qinzong', { properties: { 'special_skill/qinzong': 1 } }], ['int36', { properties: { int: 36 } }],
        ['asexual', { properties: { gender: '无性' } }], ['busy', { busy: 2 }],
        ['no-perform', { temp: { no_perform: 1 } }], ['no-fight', { fighting: false }],
        ['target-busy', { targetBusy: 20 }], ['target-dodge200', { targetDodge: 200 }]]) add('perform', 360, { ...extra, suffix });
    for (const neili of [69, 70, 129, 130]) add('perform', 360, { suffix: `neili${neili}`, properties: { neili } });
    return rows;
}

const count = (raw, side, key) => {
    const m = raw.metrics?.[side]; assert.ok(m && typeof m === 'object' && !Array.isArray(m));
    const value = Object.hasOwn(m, key) ? m[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, key); return value;
};
const property = (s, k) => k.includes('/') || k === 'character' ? s.cultivation[k] : s[k];
// Uninitialized LPC mixed busy values serialize as null. Missing observations do not.
const busy = value => {
    assert.ok(value === null || Number.isSafeInteger(value) && value >= 0, 'missing or invalid busy observation');
    return value === null ? 0 : value;
};
const clean = state => {
    const copy = structuredClone(state); copy.busy = busy(copy.busy); delete copy.temp.notify_fail; return copy;
};

export function validateGumuHuboRecord(raw, condition) {
    const p = condition.parameters; assert.equal(p.collection_group, 'gumu-hubo'); assert.equal(raw.method, condition.method);
    for (const key of ['before', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2);
    for (const key of ['interfaces', 'launches', 'attacks', 'hubo_steps', 'busy_calls']) assert.ok(Array.isArray(raw[key]), key);
    assert.equal(raw.attacks.length, 0, '本组只用控制技，不应有普攻或反击');
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side], a = raw.immediate[side];
        assert.equal(b.userp, 1); assert.equal(b.interactive, 1); assert.equal(b.wizardp, 0);
        assert.equal(b.weapon, 'none'); assert.equal(a.weapon, 'none'); assert.equal(busy(b.busy), cfg.busy ?? 0);
        busy(a.busy);
        assert.deepEqual(b.mappings, cfg.mappings); assert.deepEqual(b.preparations, cfg.preparations);
        for (const [k, n] of Object.entries(cfg.skills)) assert.equal(b.skills[k], n);
        for (const [k, n] of Object.entries(cfg.properties)) assert.equal(property(b, k), n);
        for (const [k, n] of Object.entries(cfg.temp ?? {})) assert.equal(b.temp[k], n);
        assert.equal(b.effective_skills.force, Math.trunc(cfg.skills.force / 2));
        for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            assert.ok(Number.isFinite(b[k]) && Number.isFinite(a[k]));
            assert.equal(b[k] - a[k], count(raw, side, k + '_cost'));
            assert.equal(count(raw, side, k + '_recovery'), 0);
            if (side === 1 || k !== 'neili' || condition.method !== 'perform') assert.equal(a[k], b[k]);
        }
        for (const k of ['heartbeats', 'direct', 'hit', 'dodge', 'parry']) assert.equal(count(raw, side, k), 0);
    }
    if (condition.method === 'perform') return validatePerform(raw, p);
    assert.equal(raw.launches.length, 0); assert.equal(raw.hubo_steps.length, 0);
    if (p.ability === 'start_busy') {
        assert.equal(raw.outcome, 'observed'); assert.equal(raw.interfaces.length, 1); assert.equal(raw.busy_calls.length, 1);
        const i = raw.interfaces[0], s = p.interface.player_side, call = raw.busy_calls[0];
        assert.equal(i.function, p.ability); assert.equal(i.object, 'player'); assert.equal(i.player_side, s);
        assert.equal(i.implemented_by, '/feature/action'); assert.ok(i.result === 0 || i.result === null);
        assert.deepEqual({ side: call.side, caller_side: call.caller_side, requested: call.requested, before: busy(call.before) },
            { side: s, caller_side: 0, requested: p.interface.amount, before: busy(raw.before[s].busy) });
        assert.ok(huboBusyValues(p.level, call.requested, { own: s === 0,
            clever: property(raw.before[s], 'character') === '狡黠多变', before: busy(call.before) }).includes(busy(call.after)));
        assert.equal(busy(raw.immediate[s].busy), busy(call.after));
        const expected = raw.before.map(clean); expected[s].busy = busy(call.after);
        assert.deepEqual(raw.immediate.map(clean), expected); return;
    }
    assert.equal(raw.busy_calls.length, 0);
    assert.deepEqual(raw.immediate.map(clean), raw.before.map(clean));
    if (p.ability === 'research') {
        assert.equal(raw.interfaces.length, 0); assert.equal(raw.command_accepted, 0);
        assert.equal(raw.outcome, 'refused'); assert.ok(raw.reason); return;
    }
    assert.equal(raw.interfaces.length, 1);
    const i = raw.interfaces[0]; assert.equal(i.function, p.ability); assert.equal(i.object, object);
    assert.equal(i.implemented_by, p.ability === 'valid_learn_level' ? '/inherit/skill/skill' : object);
    if (p.ability === 'skill_improved') {
        assert.ok(i.result === 0 || i.result === null); assert.equal(raw.outcome, 'observed');
        assert.ok(Array.isArray(raw.skill_messages)); const text = raw.skill_messages.join('');
        const layer = Math.min(10, Math.trunc(p.level / 30)), names = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        assert.ok(text.includes(layer ? `第${names[layer]}层境界` : '若有所悟'));
        assert.ok(text.includes(!layer ? '潜心领悟' : p.level % 30 ? '加深了一点了解' : '领悟了')); return;
    }
    const result = p.ability === 'type' ? 'knowledge' : p.ability === 'valid_learn_level' ? 999
        : p.ability === 'valid_learn' ? Number(huboCanLearn(raw.before[0])) : 0;
    assert.equal(i.result, result); const refused = ['valid_learn', 'practice_skill'].includes(p.ability) && !result;
    assert.equal(raw.outcome, refused ? 'refused' : 'observed'); if (refused) assert.ok(raw.reason);
}

function validatePerform(raw, p) {
    assert.equal(raw.interfaces.length, 0);
    const args = p.perform_arguments, dual = args.length === 2;
    const chance = huboGateChance(raw.before[0], p.fighting, dual), steps = raw.hubo_steps;
    if (!chance) {
        assert.equal(raw.command_accepted, 0); assert.equal(steps.length, 0);
        assert.equal(raw.busy_calls.length, 0); assert.equal(raw.launches.length, 0);
        assert.deepEqual(raw.immediate.map(clean), raw.before.map(clean));
    } else if (!steps.length) {
        assert.ok(dual && chance < 1); assert.equal(raw.command_accepted, 1);
        assert.equal(raw.launches.length, 0); assert.equal(count(raw, 0, 'neili_cost'), 0);
        assert.equal(busy(raw.immediate[0].busy), 1); assert.equal(busy(raw.immediate[1].busy), busy(raw.before[1].busy));
        assert.equal(raw.busy_calls.length, 1);
        const call = raw.busy_calls[0];
        assert.deepEqual({ ...call, before: busy(call.before), after: busy(call.after) },
            { side: 0, caller_side: 0, requested: 1, before: 0, after: 1 });
    } else {
        assert.equal(steps.length, args.length);
        let neili = raw.before[0].neili, actorBusy = busy(raw.before[0].busy), targetBusy = busy(raw.before[1].busy), successes = 0;
        const calls = [];
        for (const [index, s] of steps.entries()) {
            assert.equal(s.argument, args[index]); assert.equal(s.before[0].neili, neili);
            assert.equal(busy(s.before[0].busy), 0, '原互搏在第二次尝试前暂存忙乱');
            assert.equal(busy(s.before[1].busy), targetBusy);
            const launched = args[index] === 'strike.wang' && !!p.actor.properties['can_perform/tianluo-diwang/wang']
                && p.fighting && !targetBusy && neili >= 70;
            assert.equal(s.accepted, Number(launched));
            if (launched) {
                successes++; neili -= 60;
                const next = busy(s.after[1].busy);
                assert.ok([0, 27].includes(next), '天罗400级控制计数27或不生效');
                if (p.target.skills.dodge >= 798) assert.equal(next, 0);
                assert.ok((next ? [2, 3].flatMap(n => huboBusyValues(p.level, n)) : [1]).includes(busy(s.after[0].busy)));
                if (next) calls.push({ side: 1, requested: [27], before: targetBusy, after: next });
                calls.push({ side: 0, requested: next ? [2, 3] : [1], before: 0, after: busy(s.after[0].busy) });
                targetBusy = next;
            } else {
                assert.ok(s.reason); assert.equal(busy(s.after[0].busy), 0); assert.equal(busy(s.after[1].busy), targetBusy);
            }
            assert.equal(s.after[0].neili, neili); actorBusy = Math.max(actorBusy, busy(s.after[0].busy));
        }
        assert.equal(raw.command_accepted, dual ? 1 : steps[0].accepted);
        assert.equal(raw.launches.length, successes);
        for (const launch of raw.launches) { assert.equal(launch.skill, 'tianluo-diwang'); assert.equal(launch.argument, 'wang'); }
        assert.equal(count(raw, 0, 'neili_cost'), successes * 60);
        assert.equal(raw.immediate[0].neili, neili); assert.equal(busy(raw.immediate[0].busy), actorBusy);
        assert.equal(busy(raw.immediate[1].busy), targetBusy);
        assert.equal(raw.busy_calls.length, calls.length);
        for (const [index, c] of calls.entries()) {
            const actual = raw.busy_calls[index];
            assert.equal(actual.side, c.side);
            for (const key of ['before', 'after']) assert.equal(busy(actual[key]), c[key]);
            assert.ok(c.requested.includes(actual.requested));
        }
    }
    assert.equal(raw.outcome, raw.launches.length ? 'observed' : 'refused');
    if (raw.outcome === 'refused') assert.ok(raw.reason);
    // Left and right both hold hubo: only the active this_player receives its busy reduction.
    for (const call of raw.busy_calls) {
        assert.ok([0, 1].includes(call.side)); assert.equal(call.caller_side, 0);
        assert.ok(huboBusyValues(p.level, call.requested, { own: call.side === 0,
            before: busy(call.before) }).includes(busy(call.after)));
    }
}

export function gumuHuboEffects(records, condition) {
    const rows = records.filter(r => r.outcome !== 'error' && r.raw?.method === 'perform').map(r => r.raw);
    // finish_sample removes duplicated parameters from raw logs; reports use the frozen condition.
    const parameters = raw => condition?.parameters ?? raw.parameters;
    const measured = rows.filter(r => Array.isArray(r.hubo_steps) && Array.isArray(r.launches)
        && Number.isInteger(r.command_accepted) && Array.isArray(parameters(r)?.perform_arguments));
    const dual = measured.filter(r => parameters(r).perform_arguments.length === 2);
    return { command_samples: rows.length, unknown: rows.length - measured.length,
        accepted: probability(measured.filter(r => r.command_accepted).length, measured.length),
        any_launch: probability(measured.filter(r => r.launches.length > 0).length, measured.length),
        two_launches: probability(dual.filter(r => r.launches.length === 2).length, dual.length),
        entered_dual_attempts: dual.filter(r => r.hubo_steps.length === 2).length,
        second_refused: dual.filter(r => r.hubo_steps[1]?.accepted === 0).length,
        actor_busy: distribution(measured.map(r => r.immediate?.[0]?.busy === null ? 0 : r.immediate?.[0]?.busy)),
        neili_cost: distribution(measured.map(r => r.metrics?.[0]
            ? (Object.hasOwn(r.metrics[0], 'neili_cost') ? r.metrics[0].neili_cost : 0) : null)),
        qualification_and_busy_interfaces: records.filter(r => r.raw?.method === 'interface').length,
        errors: records.filter(r => r.outcome === 'error').length };
}
