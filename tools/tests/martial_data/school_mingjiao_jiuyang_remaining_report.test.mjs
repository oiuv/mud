// Pure synthetic evidence only. No driver, model or other test-module import.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { digest } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { mingjiaoJiuyangRemainingConditions } from './school_mingjiao_jiuyang_remaining_cases.mjs';
import { mingjiaoJiuyangRemainingReport, mingjiaoJiuyangRemainingMarkdown } from './school_mingjiao_jiuyang_remaining_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url)), read = p => readFileSync(root + p, 'utf8');
const skill = 'jiuyang-shengong', flag = 'can_learn/' + skill + '/enable_weapon';
const catalog = { skills: ['jiu', 'ri'].map((a, i) => {
    const path = `kungfu/skill/${skill}/perform/${a}.c`;
    return { path, sha256: sha256(read(path)), entries: [{ id: `${path}:${i ? 10 : 8}:perform` }] };
}) };
const cases = mingjiaoJiuyangRemainingConditions(catalog, read);
const pick = (ability, variant) => { const c = cases.find(c => c.parameters.ability === ability && c.parameters.variant === variant); assert.ok(c); return c; };
const envelope = (raw, c) => ({ format: 1, fingerprint: 'a'.repeat(64), condition_id: c.id, condition_sha256: digest(c),
    index: raw.index, outcome: raw.outcome, reason: raw.reason, raw, raw_sha256: digest(raw), recorded: '2026-10-14T00:00:00.000Z' });
const diagnostic = (c, outcome = 'error', index = 0) => envelope({ kind: 'sample', condition_id: c.id, method: c.method,
    index, elapsed: .01, outcome, reason: 'synthetic <error>|`\x1b[31m\nonly' }, c);

function state(cfg, side, p) {
    const s = { object: '/tests/actor#' + (100 + side), id: ['left', 'right', 'third'][side], userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, ghost: null, living: 1, busy: cfg.busy ?? null,
        fighting_opponent: Number(side === 2 ? p.extra_target_fighting : p.fighting),
        killing_opponent: Number(side === 2 ? p.extra_target_fighting : p.fighting), conditions: null,
        craze: 0, max_craze: 5000, skills: structuredClone(cfg.skills), learned: {}, mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), cultivation: Object.fromEntries(['improve/neili', 'breakup',
            'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai'].map(k => [k, null])),
        temp: { user_setup: 1, apply: { armor: 100, ...(side ? {} : { attack: 0 }) }, ...(cfg.temp ?? {}) },
        weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {}, secondary_weapon: 'none',
        secondary_weapon_details: {}, handing: 'none', handing_details: {} };
    delete s.temp['apply/attack'];
    assert.ok(!cfg.equipment && !cfg.secondary_equipment, 'narrow fixture has no gear');
    for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
        if (k.includes('/') || ['character', 'class', 'reborn', 'doing'].includes(k)) s.cultivation[k] = v;
        else s[k] = v;
    }
    s.effective_int = s.int; s.effective_str = s.str + Math.trunc(cfg.skills.unarmed / 10);
    s.effective_con = s.con + Math.trunc(cfg.skills.force / 10); s.effective_dex = s.dex + Math.trunc(cfg.skills.dodge / 10);
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2)
        + (cfg.mappings[k] === skill && (k === 'force' || cfg.properties.reborn
            && (['unarmed', 'parry'].includes(k) || cfg.properties[flag] && ['sword', 'blade'].includes(k))) ? cfg.skills[skill] : 0)
        + (s.temp.apply[k] ?? 0)]));
    return s;
}
const busy = (side, before, after) => ({ side, caller_side: 0, requested: after, before, after });
function base(c) {
    const p = c.parameters, before = [state(p.actor, 0, p), state(p.target, 1, p)];
    const raw = { kind: 'sample', condition_id: c.id, method: 'perform', index: 0, elapsed: .01,
        outcome: p.expected, reason: '', command_accepted: Number(p.expected === 'observed'), before,
        after: structuredClone(before), immediate: [], metrics: [{}, {}],
        actions: [], attacks: [], passives: [], dodge_checks: [], busy_calls: [], skill_messages: [],
        directs: [], defenses: [], interfaces: [], callbacks: [], dropped: [], terminals: [], launches: [], refusals: [],
        enemy_context: { before: p.fighting ? [1] : [], after: p.fighting ? [1] : [] } };
    if (p.extra_target) {
        raw.extra_target_before = state(p.extra_target, 2, p); raw.extra_target_immediate = structuredClone(raw.extra_target_before);
        raw.extra_target_after = structuredClone(raw.extra_target_before); raw.extra_target_metrics = {};
        if (p.extra_target_fighting) raw.enemy_context = { before: [1, 2], after: [1, 2] };
    }
    return raw;
}
function riTrace(c, hits = [true, true], nominal) {
    const p = c.parameters, raw = base(c), before = raw.before;
    if (p.target_state) {
        raw.preparation = { before: structuredClone(before[1]), after: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        const t = raw.preparation.after; t.living = 0; t.qi = t.jing = 0; t.temp.block_msg = { all: 1 };
        raw.before[1] = structuredClone(t); raw.after[1] = structuredClone(t);
    }
    const a = raw.after[0]; a.neili -= 1000; a.busy = 5; a.learned = { [skill]: 1 };
    a.temp.notify_fail = '你所使用的外功中没有这种功能。\n';
    raw.launches = [{ actor: before[0].object, skill, argument: 'ri' }]; raw.busy_calls = [busy(0, 0, 5)];
    raw.skill_messages = [{ side: 0, type: 'combat', text: 'synthetic RI original invocation shape' }];
    raw.metrics[0] = { neili_cost: 1000, ability_launched: 1 };
    const ap = before[0].skills.force + before[0].skills.unarmed + before[0].skills['martial-cognize'] + before[0].skills[skill] + before[0].con * 10;
    for (const side of raw.enemy_context.before) {
        const b = side === 1 ? raw.before[1] : raw.extra_target_before;
        const t = side === 1 ? raw.after[1] : raw.extra_target_after, m = side === 1 ? raw.metrics[1] : raw.extra_target_metrics;
        const hit = hits[side - 1], d = nominal ?? Math.trunc(ap / 4), w = Math.trunc(d / 2), j = Math.trunc(d / 6), jw = Math.trunc(d / 10);
        if (hit) {
            t.eff_qi = Math.max(-1, b.eff_qi - w); t.qi = Math.min(Math.max(-1, b.qi - d), t.eff_qi);
            t.eff_jing = Math.max(-1, b.eff_jing - jw); t.jing = Math.min(Math.max(-1, b.jing - j), t.eff_jing);
            t.craze = Math.min(b.max_craze, [d, w, j, jw].reduce((n, v, i) => n + (v > 150 ? Math.trunc(v / (i % 2 ? 3 : 5)) : 0), 0));
            t.busy = 1; raw.busy_calls.push(busy(side, b.busy ?? 0, 1));
        }
        t.neili = Math.max(0, b.neili - (hit ? 500 : 0));
        m.neili_cost = hit ? 500 : 0; m.neili_recovery = Math.max(0, (hit ? 500 : 0) - b.neili);
        for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing']) m[k + '_cost'] = b[k] - t[k];
    }
    raw.immediate = structuredClone(raw.after);
    if (p.extra_target) raw.extra_target_immediate = structuredClone(raw.extra_target_after);
    return raw;
}

function refusedTrace(c) {
    const raw = base(c), p = c.parameters;
    raw.reason = p.refusal; raw.refusals = [{ actor: raw.before[0].object, reason: p.refusal }];
    raw.after[0].temp.notify_fail = p.refusal; raw.immediate = structuredClone(raw.after);
    return raw;
}

const selected = { action: '$N飞身一跃而起，身法陡然加快，朝着$n$l快速攻出数十拳', force: 510,
    attack: 190, dodge: 100, parry: 90, damage: 180, damage_type: '刺伤', weapon: '九阳无极劲' };
function power(s, usage, attack) {
    const l = s.effective_skills[usage] + (attack ? s.temp.apply.attack : 0), exp = 6950000;
    let n = l < 1 ? Math.trunc(exp / 2) : (l > 500 ? Math.trunc(l / 10) * l * l : Math.trunc(l ** 3 / 10)) + exp;
    n = Math.trunc(n / 30) * (attack ? s.str : s.dex);
    if (attack && l >= 1) n += Math.trunc(n / 100) * selected.attack;
    return Math.max(1, n);
}
function jiuTrace(c, hit = false) {
    const raw = base(c), b = raw.before, current = structuredClone(b);
    current[0].neili -= 300; current[0].temp.notify_fail = '你所使用的外功中没有这种功能。\n';
    raw.skill_messages = [{ side: 0, type: 'vision', text: '忙强振精神，勉强抵挡。\n' }];
    raw.launches = [{ actor: b[0].object, skill, argument: 'jiu right' }];
    let triggered = 0;
    for (let id = 1; id <= 9; id++) {
        raw.actions.push({ actor: 0, target: 1, skill, attack_id: id, action: structuredClone(selected), before: structuredClone(current) });
        current[0].temp.fight = { attack: selected.attack, dodge: selected.dodge, parry: selected.parry };
        for (const phase of ['base', 'settled']) raw.dodge_checks.push({ actor: 0, target: 1, type: 0, attack_id: id,
            phase, busy: current[1].busy, skill: 0, ap: power(current[0], 'unarmed', true), dp: power(current[1], 'dodge', false) });
        if (hit) {
            const bonus = current[0].effective_str + Math.trunc(selected.force * current[0].effective_str / 100);
            const incoming = Math.trunc((2 * bonus - 1) / 3), yes = incoming >= 150 && current[0].neili >= 300
                && Math.trunc(incoming / 5) > current[1].effective_con;
            const passive = { actor: 0, target: 1, skill, attack_id: id, route: 'martial', factor: 0,
                incoming, before: structuredClone(current), result: yes ? '只见$N九阳内劲自体内迸发，真气随招式而荡漾，摧毁了$n的真元！\n' : null };
            if (yes) {
                triggered++; const wound = Math.trunc((incoming - 80) / 2);
                current[0].neili -= 50; current[1].eff_qi -= wound;
                current[1].qi = Math.min(current[1].qi, current[1].eff_qi);
                current[1].craze = Math.min(5000, current[1].craze + (wound > 150 ? Math.trunc(wound / 3) : 0));
            }
            passive.after = structuredClone(current); passive.neili_after = current[0].neili;
            passive.target_eff_qi_after = current[1].eff_qi; passive.target_busy_after = current[1].busy;
            raw.passives.push(passive);
        }
        raw.attacks.push({ actor: 0, target: 1, type: 0, attack_id: id, result: hit ? 0 : -1, damage: 0, after: structuredClone(current) });
    }
    current[0].busy = 3; current[0].learned = { [skill]: 1 };
    raw.busy_calls = [busy(0, null, 3)]; raw.metrics[0] = { neili_cost: 300 + 50 * triggered, ability_launched: 1, [hit ? 'hit' : 'dodge']: 9 };
    raw.metrics[1] = { qi_cost: b[1].qi - current[1].qi, eff_qi_cost: b[1].eff_qi - current[1].eff_qi };
    raw.after = current; raw.immediate = structuredClone(current); return raw;
}

test('finite scope and no-evidence reports retain unknown rather than zero', () => {
    assert.equal(cases.length, 53); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2556);
    assert.equal(mingjiaoJiuyangRemainingConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 106);
    for (const c of cases) {
        const s = mingjiaoJiuyangRemainingReport([], c);
        assert.equal(s.context.source_count, 132); assert.equal(s.effects, null); assert.equal(s.coverage.missing, c.samples);
        assert.match(mingjiaoJiuyangRemainingMarkdown(s), /未观测：没有原件/);
    }
});

test('diagnostic identity is checked before unknown totals and escaped display', () => {
    for (const ability of ['jiu', 'ri']) {
        const c = cases.find(c => c.parameters.ability === ability && c.parameters.expected === 'observed');
        const rows = [diagnostic(c), diagnostic(c, 'not_applicable', 1)], s = mingjiaoJiuyangRemainingReport(rows, c);
        assert.equal(s.coverage.known, 0); assert.equal(s.coverage.unknown, 2); assert.equal(s.effects.actor_neili_cost, null);
        assert.equal(s.effects.qi_cost, null); assert.equal(s.effects.target_neili_net, null);
        const md = mingjiaoJiuyangRemainingMarkdown(s);
        assert.match(md, /未知/); assert.match(md, /&lt;error&gt;\\\|&#96;\\x1b/);
        assert.doesNotMatch(md, /<error>/);
        const bad = structuredClone(s); bad.effects.actor_neili_cost = 0;
        assert.throws(() => mingjiaoJiuyangRemainingMarkdown(bad));
    }
});

test('ledger identities, original digest, slots and frozen parameters cannot be forged', () => {
    const c = cases[0], row = diagnostic(c);
    for (const mutate of [r => { r.condition_id += '-wrong'; }, r => { r.raw.condition_id += '-wrong'; },
        r => { r.raw.method = 'interface'; }, r => { r.index = r.raw.index = null; },
        r => { r.index = r.raw.index = -1; }, r => { r.index = r.raw.index = c.samples; },
        r => { r.reason = r.raw.reason = ''; }, r => { r.raw.elapsed = -1; }, r => { delete r.raw.elapsed; },
        r => { r.outcome = 'refused'; }, r => { r.reason = 'different reason'; }, r => { r.raw.kind = 'event'; }]) {
        const b = structuredClone(row); mutate(b); b.raw_sha256 = digest(b.raw);
        assert.throws(() => mingjiaoJiuyangRemainingReport([b], c));
    }
    const badHash = structuredClone(row); badHash.raw_sha256 = '0'.repeat(64);
    assert.throws(() => mingjiaoJiuyangRemainingReport([badHash], c));
    const badConditionHash = structuredClone(row); badConditionHash.condition_sha256 = '0'.repeat(64);
    assert.throws(() => mingjiaoJiuyangRemainingReport([badConditionHash], c));
    assert.throws(() => mingjiaoJiuyangRemainingReport([row, row], c));
    const changed = structuredClone(c); changed.parameters.source_evidence[Object.keys(changed.parameters.source_evidence)[0]] = '0'.repeat(64);
    assert.throws(() => mingjiaoJiuyangRemainingReport([], changed));
    const mixed = structuredClone(row); mixed.raw.condition_id = cases[1].id; mixed.raw_sha256 = digest(mixed.raw);
    assert.throws(() => mingjiaoJiuyangRemainingReport([mixed], c));
});

test('JIU nine actual ordinary calls have their own denominator and public zero is observed', () => {
    const c = pick('jiu', '400'), raw = jiuTrace(c), s = mingjiaoJiuyangRemainingReport([envelope(raw, c)], c);
    assert.equal(s.effects.attacks, 9); assert.equal(s.effects.dodge, 9); assert.equal(s.effects.hit, 0);
    assert.equal(s.effects.jiu_bonus_off, 1); assert.equal(s.effects.actor_neili_cost, 300);
    assert.equal(s.effects.public_damage.n, 9); assert.equal(s.effects.public_damage.mean, 0);
    const md = mingjiaoJiuyangRemainingMarkdown(s);
    assert.match(md, /九个独立施展样本/); assert.match(md, /真实闪避／招架的零值/);
    const bad = structuredClone(s); bad.effects.jiu_bonus_off = 9;
    assert.throws(() => mingjiaoJiuyangRemainingMarkdown(bad));
    const invalid = structuredClone(raw); delete invalid.actions[0].before;
    assert.throws(() => mingjiaoJiuyangRemainingReport([envelope(invalid, c)], c));
});

test('RI joint four-resource input, negative neili net and hit/miss denominators stay separate', () => {
    const c = pick('ri', 'target-neili-1'), hit = riTrace(c), miss = riTrace(c, [false]); miss.index = 1;
    const s = mingjiaoJiuyangRemainingReport([envelope(hit, c), envelope(miss, c)], c), e = s.effects;
    assert.equal(e.ri_hits, 1); assert.equal(e.ri_misses, 1); assert.equal(e.ri_enemy_trials, 2);
    assert.equal(e.target_neili_cost, 500); assert.equal(e.target_neili_recovery, 502); assert.equal(e.target_neili_net, -2);
    assert.equal(e.ri_damage.n, 1); assert.equal(e.ri_targets['1'].nominal_damage.n, 1);
    assert.equal(e.jing_cost, Math.trunc(e.ri_damage.mean / 6));
    assert.equal(e.eff_jing_cost, Math.trunc(e.ri_damage.mean / 10));
    assert.match(mingjiaoJiuyangRemainingMarkdown(s), /净扣为毛扣减恢复，可为负数/);
    const bad = structuredClone(s); bad.effects.target_neili_net = 0;
    assert.throws(() => mingjiaoJiuyangRemainingMarkdown(bad));
    const corrupt = structuredClone(hit); corrupt.metrics[1].jing_cost++;
    assert.throws(() => mingjiaoJiuyangRemainingReport([envelope(corrupt, c)], c));
});

test('JIU one affordable passive trigger is not nine fees or public damage', () => {
    const c = pick('jiu', 'neili600'), raw = jiuTrace(c, true), s = mingjiaoJiuyangRemainingReport([envelope(raw, c)], c);
    assert.equal(s.effects.attacks, 9); assert.equal(s.effects.hit, 9); assert.equal(s.effects.passive_calls, 9);
    assert.equal(s.effects.passive_triggered, 1); assert.equal(s.effects.passive_neili_cost, 50);
    assert.equal(s.effects.actor_neili_cost, 350); assert.equal(s.effects.public_damage.mean, 0);
    assert.ok(s.effects.passive_wound > 0); assert.equal(s.effects.eff_qi_cost, s.effects.passive_wound);
    assert.match(mingjiaoJiuyangRemainingMarkdown(s), /实际合格附伤另扣50/);
    const bad = structuredClone(s); bad.effects.passive_neili_cost = 450;
    assert.throws(() => mingjiaoJiuyangRemainingMarkdown(bad));
});

test('RI bystander is not an enemy miss; unconscious nominal ambiguity is preserved', () => {
    const c = pick('ri', 'nonenemy-bystander'), s = mingjiaoJiuyangRemainingReport([envelope(riTrace(c), c)], c);
    assert.equal(s.effects.ri_enemy_trials, 1); assert.equal(s.effects.ri_targets['2'].enemy, false);
    assert.equal(s.effects.ri_targets['2'].trials, 0); assert.deepEqual(s.effects.ri_targets['2'].nominal_supports, {});
    assert.match(mingjiaoJiuyangRemainingMarkdown(s), /旁观者（无判定）/);
    const asleep = pick('ri', 'unconscious-enemy'), raw = riTrace(asleep, [true], 416);
    const a = mingjiaoJiuyangRemainingReport([envelope(raw, asleep)], asleep);
    assert.equal(a.effects.ri_damage_ambiguous, 1); assert.equal(a.effects.ri_damage.n, 0);
    assert.deepEqual(a.effects.ri_targets['1'].nominal_supports, { '[416,417]': 1 });
    assert.equal(a.effects.qi_cost, 1); assert.equal(a.effects.jing_cost, 1);
    assert.match(mingjiaoJiuyangRemainingMarkdown(a), /不选第一个冒充真实随机值/);
    const bad = structuredClone(a); bad.effects.ri_targets['1'].nominal_supports = { '[417,416]': 1 };
    assert.throws(() => mingjiaoJiuyangRemainingMarkdown(bad));
});

test('body refusal and mixed diagnostics never become successful free samples', () => {
    const c = pick('ri', 'neili1999'), s = mingjiaoJiuyangRemainingReport([envelope(refusedTrace(c), c)], c);
    assert.equal(s.effects.refused_commands, 1); assert.equal(s.effects.ri_enemy_trials, 0);
    assert.equal(s.effects.ri_damage.mean, null); assert.match(mingjiaoJiuyangRemainingMarkdown(s), /未观测／不适用/);
    const known = pick('ri', '400'), raw = riTrace(known), mixed = mingjiaoJiuyangRemainingReport([
        envelope(raw, known), diagnostic(known, 'error', 1)], known);
    assert.equal(mixed.effects.ri_targets['1'].recorded, 1); assert.equal(mixed.effects.ri_targets['1'].trials, null);
    assert.equal(mixed.effects.ri_targets['1'].qi_cost, null); assert.equal(mixed.effects.ri_damage.n, 1);
    assert.match(mingjiaoJiuyangRemainingMarkdown(mixed), /未知/);
    const bad = structuredClone(mixed); bad.effects.ri_targets['1'].trials = 1;
    assert.throws(() => mingjiaoJiuyangRemainingMarkdown(bad));
});
