// Independent synthetic contracts. Never start a driver or import another test module.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { digest } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { mingjiaoJiuyangDirectConditions } from './school_mingjiao_jiuyang_direct_cases.mjs';
import { mingjiaoJiuyangDirectReport, mingjiaoJiuyangDirectMarkdown } from './school_mingjiao_jiuyang_direct_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url)), read = p => readFileSync(root + p, 'utf8');
const skill = 'jiuyang-shengong', flag = 'can_learn/' + skill + '/enable_weapon';
const paths = ['hun', 'po', 'pi'].map(a => `kungfu/skill/${skill}/perform/${a}.c`);
const catalog = { skills: paths.map((path, i) => ({ path, sha256: sha256(read(path)),
    entries: [{ id: `${path}:${i ? 10 : 8}:perform` }] })) };
const cases = mingjiaoJiuyangDirectConditions(catalog, read);
const pick = (ability, variant) => { const c = cases.find(c => c.parameters.ability === ability && c.parameters.variant === variant); assert.ok(c); return c; };
const envelope = (raw, c) => ({ format: 1, fingerprint: 'a'.repeat(64), condition_id: c.id, condition_sha256: digest(c),
    index: raw.index, outcome: raw.outcome, reason: raw.reason, raw, raw_sha256: digest(raw), recorded: '2026-10-14T00:00:00.000Z' });
const diagnostic = (c, outcome = 'error', index = 0) => envelope({ kind: 'sample', condition_id: c.id, method: c.method,
    index, elapsed: .01, outcome, reason: 'synthetic diagnostic only' }, c);

function state(cfg, side, p) {
    const s = { object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, ghost: 0, living: 1, busy: cfg.busy ?? null,
        fighting_opponent: Number(p.fighting), killing_opponent: Number(p.fighting), conditions: null,
        craze: 0, max_craze: 5000, skills: structuredClone(cfg.skills), learned: {}, mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), cultivation: Object.fromEntries(['improve/neili', 'breakup',
            'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai'].map(k => [k, null])),
        temp: { user_setup: 1, apply: cfg.equipment ? { armor: 100, damage: 25, dodge: -2 } : { armor: 100 }, ...(cfg.temp ?? {}) },
        weapon: cfg.equipment?.type ?? 'none', weapon_damage: cfg.equipment ? 25 : 0, weapon_flag: cfg.equipment ? 4 : 0,
        weapon_details: {}, secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
    for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
        if (k.includes('/') || ['character', 'class', 'reborn', 'doing'].includes(k)) s.cultivation[k] = v;
        else s[k] = v;
    }
    if (cfg.equipment) {
        s.weapon_details = { object: cfg.equipment.program + '#200', program: cfg.equipment.program,
            skill_type: cfg.equipment.type, weight: cfg.equipment.type === 'blade' ? 7000 : 6000,
            damage: 25, flag: 4, material: 'steel', stable: 37, consistence: 100, rigidity: null, no_wield: null, is_item_make: 0 };
        s.temp.weapon = s.weapon_details.object;
    }
    assert.ok(!cfg.secondary_equipment, 'fixture is limited to source cases without a secondary weapon');
    s.effective_int = s.int; s.effective_str = s.str + Math.trunc(cfg.skills.unarmed / 10);
    s.effective_con = s.con + Math.trunc(cfg.skills.force / 10); s.effective_dex = s.dex + Math.trunc(cfg.skills.dodge / 10);
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2)
        + (cfg.mappings[k] === skill && (k === 'force' || cfg.properties.reborn
            && (['unarmed', 'parry'].includes(k) || cfg.properties[flag] && ['sword', 'blade'].includes(k))) ? cfg.skills[skill] : 0)
        + (s.temp.apply[k] ?? 0)]));
    return s;
}
function trace(c, { index = 0, hit = false, weak = 1, wear = false } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed', hun = p.ability === 'hun';
    const before = [state(p.actor, 0, p), state(p.target, 1, p)], immediate = structuredClone(before);
    const [b, t] = before, [a, end] = immediate;
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index, elapsed: .01, outcome: p.expected,
        reason: '', before, immediate, after: [], metrics: [{}, {}], command_accepted: Number(accepted),
        actions: [], attacks: [], passives: [], defenses: [], dodge_checks: [], interfaces: [], callbacks: [], dropped: [],
        directs: [], launches: [], refusals: [], busy_calls: [], skill_messages: [], terminals: [] };
    if (!accepted) {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal; a.temp.notify_fail = p.refusal;
        raw.refusals.push({ actor: b.object, reason: raw.reason });
    } else {
        raw.launches.push({ actor: b.object, skill, argument: p.ability + ' right' });
        a.temp.notify_fail = '你所使用的外功中没有这种功能。\n';
        a.busy = hun ? hit ? 1 : 3 : 2;
        raw.busy_calls.push({ side: 0, caller_side: 0, requested: a.busy, before: null, after: a.busy });
        const fee = hun ? hit ? 250 : 50 : hit ? 350 : 150;
        a.neili -= fee; raw.metrics[0].neili_cost = fee; raw.metrics[0].ability_launched = 1;
        if (weak) a.learned[skill] = weak;
        raw.skill_messages.push({ side: 0, type: 'tell_object', text: hun ? hit ? '气团射得更快\n' : '发出的气团拨开\n'
            : hit ? '内息散乱\n' : '看透\n' });
        if (hit) {
            const input = hun ? Math.trunc((2 * b.skills[skill] + b.con * 10 + b.skills['martial-cognize']) / 2)
                : b.effective_skills[p.usage] + b.skills.force;
            raw.directs.push({ actor: 0, target: 1, type: hun ? 0 : 1, damage: input, percent: hun ? 50 : 85,
                weapon: b.weapon, weapon_object: hun ? '' : b.weapon_details.object }); raw.metrics[0].direct = 1;
            const n = input + (hun ? 0 : 25), strength = b.str * 2 + b.effective_str;
            const k = strength < 40 ? strength : strength < 70 ? Math.trunc((strength - 30) / 2) + 20 : Math.trunc((strength - 60) / 4) + 30;
            let d = n + Math.trunc(n * k / 50);
            d = d > 1500 ? Math.trunc((d - 1500) / 4) + 1000 : d > 500 ? Math.trunc((d - 500) / 2) + 500 : d;
            let w = Math.trunc(d * (hun ? 50 : 85) / 100);
            w -= Math.trunc(w * 20 / 100); w -= Math.trunc(w * (t.con - 10) / 100);
            end.eff_qi -= w; end.qi = Math.min(t.qi - d, end.eff_qi);
            end.craze = Math.min(t.max_craze, (d > 150 ? Math.trunc(d / 5) : 0) + (w > 150 ? Math.trunc(w / 3) : 0));
            raw.metrics[1].qi_cost = t.qi - end.qi; raw.metrics[1].eff_qi_cost = w;
            if (!hun) { const cost = Math.trunc(input / 4) + Math.trunc(input / 8); end.neili -= cost;
                raw.metrics[1].neili_cost = cost; if (wear) a.weapon_details.consistence = 99; }
        }
    }
    raw.after = structuredClone(immediate); return envelope(raw, c);
}

test('direct report uses exact 54/1186/108 plan and 129 frozen sources with six absent fallback paths', () => {
    assert.equal(cases.length, 54); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1186);
    assert.equal(mingjiaoJiuyangDirectConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 108);
    assert.equal(cases.filter(c => c.parameters.random_effects).length, 11);
    const s = mingjiaoJiuyangDirectReport([], pick('hun', 'minimum'));
    assert.equal(s.context.source_count, 129); assert.equal(s.effects, null); assert.equal(s.coverage.missing, 100);
    assert.match(mingjiaoJiuyangDirectMarkdown(s), /未观测/);
});

test('hun hit and miss retain distinct fees, busy states and direct-input/public-resource denominators', () => {
    const c = pick('hun', '400'), rows = [trace(c, { hit: true }), trace(c, { index: 1 })], saved = structuredClone(rows);
    const s = mingjiaoJiuyangDirectReport(rows, c), e = s.effects;
    assert.equal(e.accepted_commands, 2); assert.equal(e.gate_hits, 1); assert.equal(e.gate_misses, 1);
    assert.equal(e.actor_neili_cost, 300); assert.equal(e.target_neili_cost, 0); assert.equal(e.direct_calls, 1);
    assert.deepEqual(e.actor_busy, { '1': 1, '3': 1 }); assert.equal(e.input_damage.n, 1); assert.equal(e.public_damage.n, 1);
    assert.equal(e.weak_gain, 2); assert.equal(e.weapon_wear, 0);
    const md = mingjiaoJiuyangDirectMarkdown(s); assert.match(md, /1\/2/); assert.match(md, /没有九阳武学附伤费用/);
    assert.doesNotMatch(md, /0DPS|伤害排行/); assert.deepEqual(rows, saved);
});

test('po and pi final use original input, not public damage; wear is original single weapon hit', () => {
    for (const ability of ['po', 'pi']) {
        const c = pick(ability, '800'), row = trace(c, { hit: true, wear: true }), s = mingjiaoJiuyangDirectReport([row], c), e = s.effects;
        const input = row.raw.directs[0].damage;
        assert.equal(e.target_neili_cost, Math.trunc(input / 4) + Math.trunc(input / 8));
        assert.equal(e.actor_neili_cost, 350); assert.equal(e.weapon_wear, 1); assert.equal(e.public_damage.n, 1);
        assert.notEqual(e.input_damage.mean, e.public_damage.mean); assert.equal(e.qi_cost, e.public_damage.mean);
        assert.equal(e.eff_qi_cost, e.public_wound.mean); assert.deepEqual(row.raw.callbacks, []);
        assert.match(mingjiaoJiuyangDirectMarkdown(s), /原final同步/);
        const bad = structuredClone(row); bad.raw.immediate[1].neili++; bad.raw.after = structuredClone(bad.raw.immediate);
        bad.raw_sha256 = digest(bad.raw); assert.throws(() => mingjiaoJiuyangDirectReport([bad], c));
    }
});

test('minimum weak gain zero is valid; original command refusal is not an accepted miss', () => {
    for (const ability of ['hun', 'po']) {
        const c = pick(ability, 'minimum'), s = mingjiaoJiuyangDirectReport([trace(c, { hit: true, weak: 0 })], c);
        assert.equal(s.effects.weak_gain, 0); assert.match(mingjiaoJiuyangDirectMarkdown(s), /随机0或1/);
    }
    const c = pick('hun', 'busy1'), s = mingjiaoJiuyangDirectReport([trace(c)], c);
    assert.equal(s.effects.accepted_commands, 0); assert.equal(s.effects.refused_commands, 1);
    assert.equal(s.effects.gate_probability.trials, 0); assert.equal(s.effects.actor_neili_cost, 0);
    assert.equal(s.effects.input_damage.mean, null); mingjiaoJiuyangDirectMarkdown(s);
});

test('error, not-applicable and missing samples preserve unknown, without requiring fake normal state', () => {
    const c = pick('hun', '400'), s = mingjiaoJiuyangDirectReport([diagnostic(c), diagnostic(c, 'not_applicable', 1)], c);
    assert.equal(s.coverage.unknown, 2); assert.equal(s.coverage.missing, 98); assert.equal(s.effects.qi_cost, null);
    assert.equal(s.effects.actor_neili_cost, null); assert.deepEqual(s.effects.actor_busy, {});
    assert.match(mingjiaoJiuyangDirectMarkdown(s), /未知/);
    const mixed = mingjiaoJiuyangDirectReport([trace(c, { hit: true }), diagnostic(c, 'error', 1)], c);
    assert.equal(mixed.effects.direct_calls, null); assert.equal(mixed.effects.public_damage.n, 1);
    assert.equal(mixed.effects.gate_probability.trials, 1); mingjiaoJiuyangDirectMarkdown(mixed);
});

test('ledger metadata, parameter source proof, raw integrity, missing fields and duplicate slots fail closed', () => {
    const c = pick('hun', '400'), good = diagnostic(c);
    for (const mutate of [r => r.index = null, r => r.index = -1, r => r.index = c.samples,
        r => r.raw.index = 1, r => r.condition_id = 'wrong', r => r.raw.condition_id = 'wrong',
        r => r.condition_sha256 = '0'.repeat(64), r => r.raw.method = 'interface', r => r.raw.elapsed = null,
        r => r.raw.kind = 'wrong', r => r.raw.reason = '', r => delete r.raw.reason, r => r.reason = 'wrong', r => r.outcome = 'observed']) {
        const bad = structuredClone(good); mutate(bad); bad.raw_sha256 = digest(bad.raw);
        assert.throws(() => mingjiaoJiuyangDirectReport([bad], c));
    }
    const hash = structuredClone(good); hash.raw_sha256 = '0'.repeat(64); assert.throws(() => mingjiaoJiuyangDirectReport([hash], c));
    assert.throws(() => mingjiaoJiuyangDirectReport([good, good], c));
    const changed = structuredClone(c); changed.parameters.source_evidence[paths[0]] = '0'.repeat(64);
    assert.throws(() => mingjiaoJiuyangDirectReport([good], changed));
    for (const field of ['metrics', 'busy_calls', 'skill_messages', 'directs']) {
        const bad = trace(c, { hit: true }); delete bad.raw[field]; bad.raw_sha256 = digest(bad.raw);
        assert.throws(() => mingjiaoJiuyangDirectReport([bad], c));
    }
});

test('Markdown rejects fabricated totals/denominators, escapes raw reasons and never rewrites JSON observations', () => {
    const c = pick('po', '800'), s = mingjiaoJiuyangDirectReport([trace(c, { hit: true })], c);
    for (const mutate of [r => r.effects.gate_probability.trials = 2, r => r.effects.gate_misses = 1,
        r => r.effects.direct_calls = 0, r => r.effects.public_damage.n = 0, r => r.effects.actor_busy = {},
        r => r.effects.eff_jing_cost = 1, r => r.coverage.missing = 0]) {
        const bad = structuredClone(s); mutate(bad); assert.throws(() => mingjiaoJiuyangDirectMarkdown(bad));
    }
    const raw = diagnostic(c); raw.reason = raw.raw.reason = '<script>|`\x1b[31m'; raw.raw_sha256 = digest(raw.raw);
    const unknown = mingjiaoJiuyangDirectReport([raw], c), saved = structuredClone(unknown);
    const md = mingjiaoJiuyangDirectMarkdown(unknown);
    assert.match(md, /&lt;script&gt;/); assert.doesNotMatch(md, /<script>|\x1b/); assert.deepEqual(unknown, saved);
    unknown.effects.target_neili_cost = 0; assert.throws(() => mingjiaoJiuyangDirectMarkdown(unknown));
});
