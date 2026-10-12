import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { validateRecord } from './execution.mjs';
import { taohuaMusicConditions, taohuaMusicSourcePaths, taohuaMusicFixtureRequirements,
    validateTaohuaMusicRecord, taohuaMusicEffects } from './school_taohua_music_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const skills = ['bihai-chaosheng', 'taohua-yuan'].map(id => {
    const path = `kungfu/skill/${id}.c`, text = read(path), parsed = scanSource(text);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(text), entries: parsed.functions.filter(fn => fn.name === 'do_effect')
        .map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'other_function' })) };
});
const catalog = { skills, source_fingerprint: hash(skills), dictionary_sha256: hash('offline-music-not-dictionary') };
const cases = taohuaMusicConditions(catalog, read), smoke = taohuaMusicConditions(catalog, read, { smoke: true });
const pick = (song = 'bihai', tag = 'baseline', level = 200) => {
    const result = cases.find(c => c.id === `school-taohua-music-${song}-l${level}-${tag}`);
    assert.ok(result, `${song}/${tag}/${level}`); return result;
};

function state(config, side) {
    const qualify = key => key.includes('/') || key === 'character';
    return { ...Object.fromEntries(Object.entries(config.properties).filter(([key]) => !qualify(key))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([key]) => qualify(key))),
        object: '/tests/actor#' + (100 + side), id: ['left', 'right', 'third'][side], environment: '/tests/runner',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, ghost: 0, is_character: 1, living: 1,
        busy: config.busy ?? null, skills: structuredClone(config.skills), mappings: {}, preparations: {}, learned: {},
        conditions: structuredClone(config.conditions ?? null), hostility: { enemies: [], killers: [], wants: [] },
        temp: { user_setup: 1, apply: { armor: 100 } },
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, value]) => [key, Math.trunc(value / 2)])),
        effective_str: config.properties.str, effective_con: config.properties.con + Math.trunc(config.skills.force / 10),
        weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {}, handing: 'none', handing_details: {},
        secondary_weapon: 'none', secondary_weapon_details: {} };
}
function flute(p, owner) {
    const armed = p.instrument.mode === 'weapon';
    return { object: p.instrument.program + '#500', program: p.instrument.program, environment: owner.object,
        valid_as_xiao: 1, input_id: 'xiao', id_matches: 1, play_owner: '/inherit/misc/_xiao',
        weight: armed ? 500 : 600, material: armed ? 'stone' : 'bamboo', skill_type: armed ? 'sword' : null,
        damage: armed ? 40 : null, flag: armed ? 4 : null, consistence: armed ? 100 : null,
        equipped: null, present_in_actor: 1, present_in_room: 0 };
}
function recordMetrics(before, after) {
    return Object.fromEntries(health.flatMap(key => {
        const delta = after[key] - before[key];
        return delta ? [[key + (delta > 0 ? '_recovery' : '_cost'), Math.abs(delta)]] : [];
    }));
}
// Construct only synthetic protocol records. No MUD execution, random manipulation or frequency evidence.
function trace(condition, { hit = true, heal = 10, busy = 3, commandCost = 37 } = {}) {
    const p = condition.parameters, states = [state(p.actor, 0), state(p.target, 1), state(p.extra_target, 2)];
    const item = flute(p, states[0]);
    const preparation = { action: p.instrument.preparation_action, actor: states[0].object,
        accepted: p.instrument.preparation_action ? 19 : null,
        before: { actor: structuredClone(states[0]), instrument: structuredClone(item) } };
    if (p.instrument.mode === 'hand') {
        states[0].temp.handing = item.object; states[0].handing = null;
        states[0].handing_details = structuredClone(item);
    } else if (p.instrument.mode === 'weapon') {
        item.equipped = 'wielded'; states[0].temp.weapon = item.object; states[0].temp.apply.damage = 40;
        states[0].weapon = 'sword'; states[0].weapon_damage = 40; states[0].weapon_flag = 4;
        states[0].weapon_details = structuredClone(item);
    } else if (p.instrument.mode === 'ground') {
        item.environment = '/tests/runner'; item.present_in_actor = 0; item.present_in_room = 1;
    }
    preparation.after = { actor: structuredClone(states[0]), instrument: structuredClone(item) };
    let asleep;
    if (p.target_state === 'unconscious') {
        asleep = { before: structuredClone(states[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        states[1].living = 0; states[1].qi = 0; states[1].jing = 0; states[1].temp.block_msg = { all: 1 };
        asleep.after = structuredClone(states[1]);
    }
    const ctx = { room: { object: '/tests/runner', no_fight: p.room.no_fight ?? null, skybook: p.room.skybook ?? null },
        inventory: [...states.map(s => s.object), ...(p.instrument.mode === 'ground' ? [item.object] : [])], instrument: item };
    const accepted = p.expected === 'observed', after = structuredClone(states);
    const step = { action: p.action, actor: states[0].object, accepted: accepted ? commandCost : 0,
        reason: '', before: structuredClone(states), after };
    if (accepted) {
        after[0].busy = busy;
        const level = Math.trunc(p.actor.skills['chuixiao-jifa'] / 2) + p.actor.skills[p.skill];
        const power = Math.trunc((Math.trunc(level / 5) + states[0].effective_skills.force) / 2);
        for (let side = 1; side < 3; side++) {
            const b = states[side], a = after[side];
            if (p.song === 'bihai') {
                const gap = states[0].max_neili - b.max_neili;
                const possible = level >= 150 && !p.room.no_fight && !p.room.skybook && b.living
                    && !b.conditions?.die_guard && Math.trunc(states[0].effective_skills[p.skill] * 2 / 3) >= b.effective_skills[p.skill]
                    && gap >= 500 && 2 * power - 1 >= b.effective_skills.force;
                const selected = Array.isArray(hit) ? hit[side - 1] : hit;
                if (possible && (power >= b.effective_skills.force || selected)) {
                    const damage = Math.trunc(gap / 10), wound = Math.trunc(damage / 3);
                    a.jing = a.jing >= damage ? a.jing - damage : -1;
                    a.eff_jing = a.eff_jing >= wound ? a.eff_jing - wound : -1;
                    a.jing = Math.min(a.jing, a.eff_jing);
                    after[0].hostility.enemies.push(a.id); after[0].hostility.wants.push(a.id);
                    a.hostility.enemies.push('left'); a.hostility.killers.push('left');
                }
            } else if (level >= 100) a.jing = Math.min(b.jing + heal, b.eff_jing);
        }
    } else {
        after[0].temp.notify_fail = p.refusal; step.reason = '\x1b[256D\x1b[K' + p.refusal;
    }
    const steps = [step];
    if (p.repeat_actions) {
        const final = structuredClone(after); final[0].temp.notify_fail = '你现在停不下来。\n';
        steps.push({ action: 'halt', actor: states[0].object, accepted: 0,
            reason: '\x1b[256D\x1b[K你现在停不下来。\n', before: structuredClone(after), after: final });
    }
    const final = steps.at(-1).after;
    return { kind: 'sample', condition_id: condition.id, method: 'music', outcome: p.expected,
        before: states.slice(0, 2), extra_target_before: states[2], immediate: structuredClone(final.slice(0, 2)),
        extra_target_immediate: structuredClone(final[2]), after: structuredClone(final.slice(0, 2)),
        extra_target_after: structuredClone(final[2]), metrics: states.slice(0, 2).map((b, i) => recordMetrics(b, final[i])),
        extra_target_metrics: recordMetrics(states[2], final[2]), command_accepted: step.accepted,
        reason: step.reason, elapsed: 0.001, music_preparation: preparation,
        ...(asleep ? { preparation: asleep } : {}), music_steps: steps,
        music_context_before: structuredClone(ctx), music_context_after: structuredClone(ctx),
        launches: [], refusals: [], attacks: [], passives: [], defenses: [], dodge_checks: [], interfaces: [],
        terminals: [], callbacks: [], dropped: [] };
}
function synchronize(raw) {
    const final = raw.music_steps.at(-1).after;
    raw.immediate = structuredClone(final.slice(0, 2)); raw.after = structuredClone(raw.immediate);
    raw.extra_target_immediate = structuredClone(final[2]); raw.extra_target_after = structuredClone(final[2]);
    raw.metrics = raw.before.map((b, side) => recordMetrics(b, final[side]));
    raw.extra_target_metrics = recordMetrics(raw.extra_target_before, final[2]);
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
function rejects(c, mutate, options) {
    const raw = trace(c, options); mutate(raw); assert.throws(() => validateTaohuaMusicRecord(raw, c));
}

test('30有限条件/648正式/30烟雾；6个随机效果分布，其余仅2次机制', () => {
    assert.equal(cases.length, 30); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 648);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 30);
    assert.equal(cases.filter(c => c.samples === 100).length, 6);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 4);
    assert.equal(hash(cases), 'c7d9836b34f9a8c572b195ed22802805c0180d6c3190c627c0303427d31c1c58');
    assert.equal(hash(smoke), 'ea368725ff48718946a5b98bbe1bd90e7fde72de770d11bfe6cc5c5d1ffc79a2');
    assert.equal(new Set(cases.map(c => c.id)).size, 30);
    assert.deepEqual(cases.map(c => ({ ...c, samples: 1 })), smoke);
    for (const c of cases) {
        assert.equal(c.parameters.observe_seconds, 0); assert.equal(c.parameters.fighting, false);
        assert.deepEqual(c.parameters.actor.mappings, {}); assert.equal(c.parameters.actor.skills['zuoyou-hubo'], undefined);
        assert.equal(c.parameters.actor.properties.jiali, 0);
    }
    assert.equal(pick('yuan').parameters.name, '桃花怨');
    assert.equal(pick('yuan', 'ground-flute').parameters.instrument.preparation_action, 'drop xiao');
    assert.ok(taohuaMusicFixtureRequirements.some(s => s.includes('No new game probe')));
});

test('32来源冻结，目录入口与字节必须同源，非法样本量/缺来源拒绝', () => {
    assert.equal(taohuaMusicSourcePaths.length, 32);
    assert.equal(hash(cases[0].parameters.source_evidence), '49547fdafe071a37015d7561a2d468779820f909cb5982d9ac822a04aab71555');
    for (const c of cases) for (const path of taohuaMusicSourcePaths)
        assert.equal(c.parameters.source_evidence[path], hash(read(path)));
    for (const samples of [0, -1, 1.5, NaN, '100']) assert.throws(() => taohuaMusicConditions(catalog, read, { samples }));
    assert.throws(() => taohuaMusicConditions(catalog));
    assert.throws(() => taohuaMusicConditions(catalog, () => ''));
    for (const change of [c => c.skills[0].path = 'wrong', c => c.skills[0].sha256 = '0'.repeat(64),
        c => c.skills[0].entries = [], c => c.skills[0].entries[0].id += '-wrong']) {
        const bad = structuredClone(catalog); change(bad); assert.throws(() => taohuaMusicConditions(bad, read));
    }
    assert.match(read('kungfu/skill/taohua-yuan.c'), /obs->receive_heal\("jing", random\(lvl\) \+ 10\)/);
    assert.match(read('kungfu/skill/bihai-chaosheng.c'), /lvl = lvl \/ 5 \+ me->query_skill\("force"\);\s+lvl \/= 2/);
    assert.match(read('feature/damage.c'), /set\("jing", 0\);\s+set\("qi", 0\)/);
});

test('真实create/open计划入口通过，非法ID/入口/覆盖/漂移拒绝，未启动驱动', () => {
    const inventory = { source_fingerprint: catalog.source_fingerprint, versions: { note: 'offline-music-plan-only' },
        files: taohuaMusicSourcePaths.map(path => ({ path, sha256: hash(read(path)) })) };
    const execution = { kind: 'offline-music-plan', source_files: cases[0].parameters.source_evidence };
    const directory = mkdtempSync(join(tmpdir(), 'mud-taohua-music-plan-'));
    const formal = createSeries(directory, { inventory, catalog, conditions: cases, execution });
    assert.deepEqual(openSeries(directory, formal.identity).identity.conditions, cases);
    const small = createSeries(join(directory, 'smoke'), { inventory, catalog, conditions: smoke, execution });
    assert.deepEqual(openSeries(join(directory, 'smoke'), small.identity).identity.conditions, smoke);
    const wrong = structuredClone(cases); wrong[0].id += '-中文';
    assert.throws(() => createSeries(join(directory, 'bad-id'), { inventory, catalog, conditions: wrong, execution }));
    wrong[0].id = cases[0].id; wrong[0].entry_id = 'unknown.c:1:do_effect';
    assert.throws(() => createSeries(join(directory, 'bad-entry'), { inventory, catalog, conditions: wrong, execution }));
    assert.throws(() => createSeries(directory, { inventory, catalog, conditions: cases, execution }));
    const drift = structuredClone(formal.identity); drift.conditions[0].parameters.actor.properties.neili++;
    assert.throws(() => openSeries(directory, drift));
});

test('全部30合成原协议通过专属及公共validateRecord且不改写raw，无raw.parameters', () => {
    for (const c of cases) {
        const raw = trace(c), bytes = JSON.stringify(raw);
        validateRecord(raw, c); validateTaohuaMusicRecord(raw, c);
        assert.equal(Object.hasOwn(raw, 'parameters'), false); assert.equal(JSON.stringify(raw), bytes);
    }
});

test('真实force_me成功为正成本，不硬锁1；失败仍严格0且原字符串同源', () => {
    for (const cost of [1, 19, 999]) validateTaohuaMusicRecord(trace(pick(), { commandCost: cost }), pick());
    for (const cost of [0, -1, 1.5, null, '37']) rejects(pick(), r => { r.music_steps[0].accepted = cost; r.command_accepted = cost; });
    for (const tag of ['unknown-song', 'busy50', 'not-music', 'no-argument']) {
        const c = pick('bihai', tag);
        rejects(c, r => r.music_steps[0].reason = '其他失败\n');
        rejects(c, r => { r.music_steps[0].after[0].temp.notify_fail += '变更'; synchronize(r); });
        rejects(c, r => { r.music_steps[0].accepted = 1; r.command_accepted = 1; });
    }
});

test('三档原逐次整数与双方独立比较支持集；不伪造指定命中频次', () => {
    for (const level of [200, 400, 800]) for (const hit of [false, true, [true, false], [false, true]]) {
        const c = pick('bihai', 'baseline', level); validateTaohuaMusicRecord(trace(c, { hit }), c);
    }
    const hit = validateTaohuaMusicRecord(trace(pick('bihai', 'neili-gap500')), pick('bihai', 'neili-gap500'));
    assert.deepEqual(hit.listeners.map(s => [s.damage, s.wound]), [[50, 16], [50, 16]]);
    const clamp = validateTaohuaMusicRecord(trace(pick('bihai', 'resource-clamp')), pick('bihai', 'resource-clamp'));
    assert.deepEqual(clamp.listeners.map(s => [s.damage, s.wound]), [[6, 16], [13, 13]]);
    const guard = validateTaohuaMusicRecord(trace(pick('bihai', 'song-guard-boundary')), pick('bihai', 'song-guard-boundary'));
    assert.deepEqual(guard.listeners.map(s => s.affected), [false, true]);
    for (const tag of ['music149', 'force-block', 'neili-gap499', 'no-fight', 'skybook']) {
        const c = pick('bihai', tag), effect = validateTaohuaMusicRecord(trace(c), c);
        assert.equal(effect.accepted, true); assert.equal(effect.any_effect, false);
        rejects(c, r => { r.music_steps[0].after[1].jing--; synchronize(r); });
    }
    rejects(pick('bihai', 'music150'), r => {
        r.music_steps[0].after[1] = structuredClone(r.before[1]); synchronize(r);
    });
});

test('桃花怨一次共同恢复参数；逐人独立抽值、越界、超上限或修复创伤拒绝', () => {
    const c = pick('yuan');
    for (const heal of [10, 309]) assert.equal(validateTaohuaMusicRecord(trace(c, { heal }), c).shared_heal_argument, heal);
    for (const heal of [0, 9, 310]) assert.throws(() => validateTaohuaMusicRecord(trace(c, { heal }), c));
    for (const side of [1, 2]) rejects(c, r => { r.music_steps[0].after[side].jing++; synchronize(r); });
    rejects(c, r => { r.music_steps[0].after[1].eff_jing++; synchronize(r); });
    const capped = pick('yuan', 'capped-heal'), result = validateTaohuaMusicRecord(trace(capped), capped);
    assert.deepEqual(result.listeners.map(s => s.recovery), [2, 10]); assert.equal(result.shared_heal_argument, null);
    assert.deepEqual(result.shared_heal_possible, { min: 10, max: 309 });
    rejects(capped, r => { r.music_steps[0].after[1].jing++; synchronize(r); });
    const low = pick('yuan', 'music99'); assert.equal(validateTaohuaMusicRecord(trace(low), low).any_effect, false);
    rejects(low, r => { r.music_steps[0].after[1].jing += 10; synchronize(r); });
});

test('原昏迷准备归零单独记录；桃花怨可恢复精神而不醒，保护不转成拒绝', () => {
    for (const c of [pick('bihai', 'unconscious'), pick('yuan', 'unconscious-guard')]) {
        const raw = trace(c); assert.equal(raw.before[1].qi, 0); assert.equal(raw.before[1].jing, 0);
        const effect = validateTaohuaMusicRecord(raw, c);
        assert.equal(raw.after[1].living, 0); assert.equal(effect.listeners[0].affected, c.parameters.song === 'yuan');
        rejects(c, r => delete r.preparation);
        rejects(c, r => r.preparation.before.object = '/tests/actor#999');
        rejects(c, r => r.terminals.push({ side: 1, state: 'unconscious' }));
        rejects(c, r => { r.music_steps[0].after[1].living = 1; synchronize(r); });
    }
    const c = pick('yuan', 'protected-room'); assert.equal(validateTaohuaMusicRecord(trace(c), c).any_effect, true);
});

test('原hand/carry/wield/drop证据和物品归属严格；命令不存在/换物品/假持箫不接受', () => {
    for (const c of [pick(), pick('bihai', 'carried'), pick('bihai', 'wielded'), pick('yuan', 'ground-flute')]) {
        validateTaohuaMusicRecord(trace(c), c);
        for (const mutate of [r => delete r.music_preparation,
            r => r.music_context_before.instrument.object += '-other',
            r => r.music_context_after.instrument.environment = '/tests/actor#999',
            r => r.music_context_before.instrument.valid_as_xiao = 0,
            r => r.music_context_before.instrument.play_owner = '/tests/fake',
            r => r.music_context_before.instrument.damage = 999,
            r => r.music_context_before.instrument.id_matches = 0,
            r => r.music_context_before.inventory.pop(),
            r => r.music_context_before.inventory.push('/tests/actor#999'),
            r => r.music_preparation.action = 'direct move',
            r => r.music_preparation.before.instrument.foreign = 1,
            r => r.music_preparation.before.actor.neili++]) rejects(c, mutate);
    }
});

test('三USER身份/技能/原资源/场地/忙乱与敌对分账，不忽略第三人', () => {
    const c = pick();
    for (const mutate of [r => r.before[0].wizardp = 1, r => r.extra_target_before.userp = 0,
        r => r.extra_target_before.object = r.before[1].object, r => delete r.extra_target_metrics,
        r => r.extra_target_metrics.jing_cost = null, r => delete r.before[0].busy,
        r => r.before[0].temp.apply.attack = 999, r => r.before[0].effective_skills.force = 600,
        r => r.music_context_before.room.no_fight = 1, r => delete r.music_context_before.room.skybook,
        r => r.metrics[0].heartbeats = 1, r => r.metrics[0].neili_recovery = 1,
        r => r.callbacks.push({ kind: 'music' })]) rejects(c, mutate);
    for (const side of [0, 1, 2]) for (const mutate of [a => a.neili--, a => a.qi--, a => a.skills.force++,
        a => a.temp.apply.armor++, a => a.temp.foreign = 1, a => a.object += '-other', a => a.environment = '/tests/away',
        a => a.hostility.killers.push('foreign')]) rejects(c, r => { mutate(r.music_steps[0].after[side]); synchronize(r); });
    rejects(c, r => { r.music_steps[0].after[0].busy = 2; synchronize(r); });
    rejects(c, r => { r.music_steps[0].after[1].busy = 1; synchronize(r); });
    rejects(c, r => { r.music_steps[0].after[1].jing++; synchronize(r); });
    for (const side of [1, 2]) rejects(c, r => { r.music_steps[0].after[side].temp.notify_fail = '其他提示'; synchronize(r); });
    rejects(c, r => { r.music_steps[0].after[0].hostility.killers = ['right']; synchronize(r); });
});

test('play后原halt因busy拒绝，不撤销即时恢复，不伪造自然取消', () => {
    const c = pick('yuan', 'halt-after-play'), raw = trace(c), result = validateTaohuaMusicRecord(raw, c);
    assert.equal(result.halt_attempted, true); assert.deepEqual(result.listeners.map(s => s.recovery), [10, 10]);
    for (const mutate of [r => r.music_steps[1].accepted = 1, r => r.music_steps[1].reason = '你现在不忙。\n',
        r => r.music_steps[1].before[1].jing--,
        r => { r.music_steps[1].after[0].busy = null; synchronize(r); },
        r => { r.music_steps[1].after[1].jing -= 10; synchronize(r); }]) rejects(c, mutate);
});

test('冻结condition统计，不靠已剥离raw.parameters；同次两人不能伪独立概率', () => {
    const c = pick(), samples = [row(trace(c, { hit: false })), row(trace(c, { hit: [true, false] }))];
    const result = taohuaMusicEffects(samples, c);
    assert.equal(result.acceptance.rate, 1); assert.equal(result.any_effect_given_accepted.rate, 0.5);
    assert.equal(result.accepted_without_effect, 1);
    assert.equal(result.listeners[0].damage_given_eligible.trials, 2);
    assert.equal(result.listeners[0].damage_given_eligible.rate, 0.5);
    assert.equal(result.listeners[1].damage_given_eligible.rate, 0);
    const cap = pick('yuan', 'capped-heal'), capped = taohuaMusicEffects([row(trace(cap))], cap);
    assert.equal(capped.shared_heal_argument.mean, null); assert.equal(capped.shared_heal_argument.unknown, 1);
    assert.equal(capped.listeners[0].jing_recovery.mean, 2);
    const refuse = pick('bihai', 'busy50'), denied = taohuaMusicEffects([row(trace(refuse))], refuse);
    assert.equal(denied.acceptance.rate, 0); assert.equal(denied.any_effect_given_accepted.rate, null);
    assert.equal(denied.actor_costs.neili.mean, 0);
});

test('外层/raw ID和结果先核同源；未知费用/缺记录不是零', () => {
    const c = pick();
    for (const outcome of ['observed', 'error', 'not_applicable']) {
        const raw = outcome === 'observed' ? trace(c) : { condition_id: c.id, outcome, reason: 'not measured' };
        for (const change of [r => delete r.condition_id, r => r.condition_id = 'foreign',
            r => r.raw.condition_id = 'foreign', r => r.outcome = 'refused']) {
            const wrapped = row(structuredClone(raw)); change(wrapped); assert.throws(() => taohuaMusicEffects([wrapped], c));
        }
    }
    const raw = { condition_id: c.id, outcome: 'error', reason: 'not measured' }, before = JSON.stringify(raw);
    const unknown = taohuaMusicEffects([row(raw)], c);
    assert.equal(unknown.unknown_effect_samples, 1); assert.equal(unknown.acceptance.rate, null);
    assert.equal(unknown.actor_costs.neili.mean, null); assert.equal(JSON.stringify(raw), before);
    assert.equal(taohuaMusicEffects([], c).listeners[0].jing_damage.mean, null);
});
