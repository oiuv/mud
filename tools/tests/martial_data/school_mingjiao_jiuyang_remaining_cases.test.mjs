import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { mingjiaoJiuyangRemainingConditions as conditions, mingjiaoJiuyangRemainingSourcePaths as sources,
    mingjiaoJiuyangRemainingReviewedSourceHash as reviewed, mingjiaoJiuyangRemainingAbsentPaths as absent,
    validateMingjiaoJiuyangRemainingCondition as condition, validateMingjiaoJiuyangRemainingRecord as record,
    mingjiaoJiuyangRemainingEffects as effects } from './school_mingjiao_jiuyang_remaining_cases.mjs';
import { validateRecord as general } from './execution.mjs';
import { validateSchoolCombatRecord as school } from './school_combat_cases.mjs';
const root = fileURLToPath(new URL('../../../', import.meta.url)), read = p => readFileSync(root + p), copy = v => structuredClone(v);
const hash = b => createHash('sha256').update(b).digest('hex'), skill = 'jiuyang-shengong';
const catalog = { skills: ['jiu', 'ri'].map(a => { const path = `kungfu/skill/${skill}/perform/${a}.c`;
    return { path, sha256: hash(read(path)), entries: [{ id: `${path}:${a === 'jiu' ? 8 : 10}:perform` }] }; }) };
const cases = conditions(catalog, read), pick = (a, variant = '400') => { const c = cases.find(c => c.parameters.ability === a && c.parameters.variant === variant); assert.ok(c); return c; };
const weapon = (cfg, serial) => ({ object: `${cfg.program}#${serial}`, program: cfg.program, skill_type: cfg.type,
    flag: cfg.type === 'dagger' ? 6 : 4, weight: 6000, material: 'steel', rigidity: null, consistence: 100,
    damage: cfg.type === 'dagger' ? 13 : 25, no_wield: null, stable: 37, is_item_make: 0 });
function state(cfg, side, p, awake = false) {
    const s = { object: '/tests/actor#' + (100 + side), id: ['left', 'right', 'third'][side], userp: 1, playerp: 1, interactive: 1, wizardp: 0, ghost: 0,
        living: 1, busy: cfg.busy ?? null, conditions: null, fighting_opponent: Number(side === 2 ? p.extra_target_fighting : p.fighting),
        killing_opponent: Number(side === 2 ? p.extra_target_fighting : p.fighting), skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations), learned: {},
        cultivation: Object.fromEntries(['improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai'].map(k => [k, null])),
        temp: { user_setup: 1, apply: { armor: 100, ...(cfg.equipment ? { damage: 25, dodge: -2 } : {}), ...(!side ? { attack: 0 } : {}) } },
        craze: 0, max_craze: 5000, weapon: cfg.equipment?.type ?? 'none', weapon_damage: cfg.equipment ? 25 : 0, weapon_flag: cfg.equipment ? 4 : 0,
        weapon_details: cfg.equipment ? weapon(cfg.equipment, 200) : {}, secondary_weapon: cfg.secondary_equipment?.type ?? 'none',
        secondary_weapon_details: cfg.secondary_equipment ? weapon(cfg.secondary_equipment, 201) : {}, handing: 'none', handing_details: {},
        environment: '/tests/runner', inventory: [], encumbrance: 0, max_encumbrance: 89000 };
    for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
        if (k.includes('/') || ['character', 'class', 'reborn', 'doing'].includes(k)) s.cultivation[k] = v; else s[k] = v;
    }
    for (const [k, v] of Object.entries(cfg.temp ?? {})) if (k === 'apply/attack') s.temp.apply.attack = v; else s.temp[k] = v;
    for (const slot of ['weapon', 'secondary_weapon']) if (Object.keys(s[slot + '_details']).length) {
        s.temp[slot] = s[slot + '_details'].object; s.inventory.push(s.temp[slot]); s.encumbrance += 6000;
    }
    const active = k => cfg.mappings[k] === skill && (k === 'force' || cfg.properties.reborn && ['unarmed', 'parry'].includes(k));
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2) + (active(k) ? cfg.skills[skill] : 0) + (s.temp.apply[k] ?? 0)]));
    s.effective_str = s.str + Math.trunc(cfg.skills.unarmed / 10); s.effective_int = s.int;
    s.effective_con = s.con + Math.trunc(cfg.skills.force / 10); s.effective_dex = s.dex + Math.trunc(cfg.skills.dodge / 10);
    if (side === 1 && p.target_state && !awake) { s.living = 0; s.qi = s.jing = 0; s.temp.block_msg = { all: 1 }; }
    return s;
}
// Independent source equations; this is explicitly synthetic, never a sampled USER trace.
function receive(s, d = 0, w = 0, j = 0, ej = 0) {
    const e = copy(s); e.qi = Math.max(-1, e.qi - d); e.eff_qi = Math.max(-1, e.eff_qi - w); if (w) e.qi = Math.min(e.qi, e.eff_qi);
    e.jing = Math.max(-1, e.jing - j); e.eff_jing = Math.max(-1, e.eff_jing - ej); if (ej) e.jing = Math.min(e.jing, e.eff_jing);
    e.craze = Math.min(s.max_craze, s.craze + [[d, 5], [w, 3], [j, 5], [ej, 3]].reduce((n, [v, den]) => n + (v > 150 ? Math.trunc(v / den) : 0), 0)); return e;
}
const selected = { action: '$N飞身一跃而起，身法陡然加快，朝着$n$l快速攻出数十拳', force: 510, attack: 190, dodge: 100, parry: 90, damage: 180, damage_type: '刺伤', weapon: '\x1b[1;31m九阳无极劲\x1b[0m' };
function power(s, usage, attack = false) {
    const l = s.effective_skills[usage] + (attack ? s.temp.apply.attack : 0), exp = 6950000;
    let n = l < 1 ? Math.trunc(exp / 2) : (l > 500 ? Math.trunc(l / 10) * l * l : Math.trunc(l ** 3 / 10)) + exp;
    n = Math.trunc(n / 30) * (attack ? s.str : s.dex); if (attack && l >= 1) n += Math.trunc(n / 100) * selected.attack; return Math.max(1, n);
}
export function syntheticJiuyangRemainingTrace(c, { hit = false, bonus = false, weak = 1, publicHit = false, busy = false, index = 0, reverse = false, nominalOffset = 0 } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed', jiu = p.ability === 'jiu';
    const before = [state(p.actor, 0, p), state(p.target, 1, p)], immediate = copy(before);
    const raw = { kind: 'sample', condition_id: c.id, method: 'perform', index, elapsed: .01, outcome: p.expected, reason: '',
        before, immediate, after: [], metrics: [{}, {}], interfaces: [], actions: [], attacks: [], passives: [], defenses: [], dodge_checks: [], callbacks: [],
        dropped: [], terminals: [], skill_messages: [], busy_calls: [], launches: [], refusals: [], directs: [], command_accepted: Number(accepted),
        enemy_context: { before: p.fighting ? p.extra_target_fighting ? reverse ? [2, 1] : [1, 2] : [1] : [], after: [] } };
    if (p.extra_target) { raw.extra_target_before = state(p.extra_target, 2, p); raw.extra_target_immediate = copy(raw.extra_target_before); raw.extra_target_metrics = {}; }
    raw.enemy_context.after = copy(raw.enemy_context.before);
    if (p.target_state) raw.preparation = { before: state(p.target, 1, p, true), after: copy(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
    const allBefore = [...before, ...(p.extra_target ? [raw.extra_target_before] : [])], allAfter = [...immediate, ...(p.extra_target ? [raw.extra_target_immediate] : [])];
    const allMetrics = [...raw.metrics, ...(p.extra_target ? [raw.extra_target_metrics] : [])];
    if (!accepted) { raw.reason = '\x1b[256D\x1b[K' + p.refusal; raw.refusals = [{ actor: before[0].object, reason: raw.reason }]; immediate[0].temp.notify_fail = p.refusal; }
    else {
        immediate[0].temp.notify_fail = '你所使用的外功中没有这种功能。\n';
        raw.launches = [{ actor: before[0].object, skill, argument: jiu ? 'jiu right' : 'ri' }]; raw.metrics[0].ability_launched = 1;
        if (jiu) {
            let current = copy(before); current[0].temp.notify_fail = immediate[0].temp.notify_fail; current[0].neili -= 300;
            const ap = before[0].effective_skills.unarmed + before[0].con * 20, dp = before[1].effective_skills.parry + before[1].con * 20;
            if (Math.trunc(ap / 2) > dp) bonus = true; if (Math.trunc(ap / 2) + ap - 1 <= dp) bonus = false;
            const count = bonus ? Math.trunc(ap / 9) : 0; current[0].temp.apply.attack = count;
            raw.skill_messages.push({ side: 0, type: 'vision', text: bonus ? '顿感头晕目眩，不知该如何抵挡。\n' : '忙强振精神，勉强抵挡。\n' });
            for (let i = 1; i <= 9; i++) {
                if (busy && !current[1].busy) { raw.busy_calls.push({ side: 1, caller_side: 0, requested: 1, before: current[1].busy, after: 1 }); current[1].busy = 1; }
                raw.actions.push({ actor: 0, target: 1, skill, attack_id: i, action: copy(selected), before: copy(current) });
                current[0].temp.fight = { attack: selected.attack, dodge: selected.dodge, parry: selected.parry };
                for (const phase of ['base', 'settled']) raw.dodge_checks.push({ actor: 0, target: 1, type: 0, attack_id: i, phase,
                    busy: current[1].busy, skill: 0, ap: power(current[0], 'unarmed', true), dp: phase === 'settled' && current[1].busy ? Math.trunc(power(current[1], 'dodge') / 3) : power(current[1], 'dodge') });
                let d = 0;
                if (hit) {
                    const v = { actor: 0, target: 1, attack_id: i, skill, route: 'martial', factor: 0, before: copy(current) };
                    const b = current[0].effective_str + Math.trunc(selected.force * current[0].effective_str / 100); v.incoming = Math.trunc((2 * b - 1) / 3);
                    const trigger = v.incoming >= 150 && current[0].neili >= 300 && Math.trunc(v.incoming / 5) > current[1].effective_con;
                    const w = trigger ? Math.trunc((v.incoming - 80) / 2) : 0;
                    current[0].neili -= trigger ? 50 : 0; current[1] = receive(current[1], 0, w);
                    v.result = trigger ? '只见$N九阳内劲自体内迸发，真气随招式而荡漾，摧毁了$n的真元！\n' : null;
                    v.after = copy(current); v.neili_after = current[0].neili; v.target_eff_qi_after = current[1].eff_qi; v.target_busy_after = current[1].busy; raw.passives.push(v);
                    if (publicHit) { const n = v.incoming + Math.trunc(v.incoming * (current[0].str * 2 + current[0].effective_str) / 300);
                        d = n > 400 ? Math.trunc((n - 400) / 4) + 300 : n > 200 ? Math.trunc((n - 200) / 2) + 200 : n;
                        current[1] = receive(current[1], d); }
                }
                raw.attacks.push({ actor: 0, target: 1, type: 0, attack_id: i, result: hit ? 0 : -1, damage: d, after: copy(current) });
                if (d > 0 && current[1].busy) current[1].busy = 0;
            }
            current[0].temp.apply.attack = 0; current[0].busy = 3;
            raw.busy_calls.push({ side: 0, caller_side: 0, requested: 3, before: null, after: 3 });
            raw.immediate = current; raw.metrics[0][hit ? 'hit' : 'dodge'] = 9;
        } else {
            immediate[0].neili -= 1000; immediate[0].busy = 5; raw.busy_calls.push({ side: 0, caller_side: 0, requested: 5, before: null, after: 5 });
            raw.skill_messages.push({ side: 0, type: 'vision', text: '气团爆裂开来，向四周电射而出，光芒足以和日月争辉。\n' });
            const ap = before[0].skills.force + before[0].skills.unarmed + before[0].skills['martial-cognize'] + before[0].skills[skill] + before[0].con * 10;
            for (const side of raw.enemy_context.before) {
                const b = allBefore[side], dp = b.effective_skills.force * 2 + b.skills['martial-cognize'] + b.con * 10;
                const yes = Math.trunc(ap / 2) > dp || hit && Math.trunc(ap / 2) + ap - 1 > dp;
                let a = copy(b);
                if (yes) { const d = Math.trunc(ap / 4) + nominalOffset; assert.ok(d < Math.trunc(ap / 4) + Math.trunc(ap / 3));
                    a = receive(a, d, Math.trunc(d / 2), Math.trunc(d / 6), Math.trunc(d / 10));
                    raw.busy_calls.push({ side, caller_side: 0, requested: 1, before: a.busy, after: 1 }); a.busy = 1;
                    a.neili -= 500; allMetrics[side].neili_cost = 500;
                    raw.skill_messages.push({ side, type: 'tell', text: '你只觉眼前金光万道，周围空气几欲沸腾，光芒便如利箭一般透体而入。\n' });
                } else raw.skill_messages.push({ side, type: 'tell', text: '你只觉眼前金光万道，周围空气几欲沸腾，大惊之下连忙急运内功，抵御开来。\n' });
                if (a.neili < 0) { allMetrics[side].neili_recovery = -a.neili; a.neili = 0; }
                if (side === 1) raw.immediate[1] = a; else raw.extra_target_immediate = a;
            }
        }
        if (weak) raw.immediate[0].learned = { [skill]: weak };
    }
    const finish = [...raw.immediate, ...(p.extra_target ? [raw.extra_target_immediate] : [])];
    for (let side = 0; side < finish.length; side++) for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
        if (k === 'neili' && !jiu && side) continue;
        const diff = allBefore[side][k] - finish[side][k]; if (diff) allMetrics[side][k + (diff > 0 ? '_cost' : '_recovery')] = Math.abs(diff);
    }
    raw.after = copy(raw.immediate); if (p.extra_target) raw.extra_target_after = copy(raw.extra_target_immediate); return raw;
}
const reject = (c, r, change) => { const bad = copy(r); change(bad); assert.throws(() => record(bad, c)); };
test('fixed53:JIU25/RI28,25 random100+28det2=2556,smoke106;132 original source/4absences', () => {
    assert.equal(cases.length, 53); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2556);
    assert.deepEqual(['jiu', 'ri'].map(a => cases.filter(c => c.parameters.ability === a).length), [25, 28]);
    assert.equal(conditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 106); assert.equal(sources.length, 132);
    assert.equal(hash(JSON.stringify(sources.map(p => [p, hash(read(p))]))), reviewed); assert.equal(absent.length, 4); cases.forEach(condition);
    assert.throws(() => conditions(catalog, p => p === absent[0] ? Buffer.from('added') : read(p)));
    assert.throws(() => conditions(catalog, p => p === 'adm/daemons/combatd.c' ? Buffer.from('changed') : read(p)));
    const bad = copy(pick('jiu')); bad.parameters.actor.properties.neili++; assert.throws(() => condition(bad));
});
test('all53 full synthetic records pass actual general/school/special consumers,including3USER/gear/unconscious', () => {
    for (const c of cases) { const r = syntheticJiuyangRemainingTrace(c); general(r, c); school(r, c); assert.ok(record(r, c)); }
    assert.equal(syntheticJiuyangRemainingTrace(pick('jiu', 'dual')).before[0].secondary_weapon_details.flag, 6);
});
test('JIU original9 ordinarycalls;passive50 before public0;599/600/650 fees and complete restoration', () => {
    for (const [variant, maxTrigger] of [['neili599', 0], ['neili600', 1], ['neili650', 2]]) {
        const c = pick('jiu', variant), r = syntheticJiuyangRemainingTrace(c, { hit: true, bonus: true }); const e = record(r, c);
        assert.equal(e.attacks, 9); assert.equal(e.passive_triggered, maxTrigger); assert.equal(e.actor_neili_cost, 300 + maxTrigger * 50);
        assert.equal(e.public_damage.reduce((a, b) => a + b, 0), 0); assert.ok(maxTrigger ? e.passive_wound > 0 : e.passive_wound === 0);
        assert.equal(r.immediate[0].temp.apply.attack, 0);
        reject(c, r, b => { b.metrics[0].neili_cost++; b.immediate[0].neili--; b.after = copy(b.immediate); });
    }
    const c = pick('jiu', 'no-passive-con'), r = syntheticJiuyangRemainingTrace(c, { hit: true }); assert.equal(record(r, c).passive_triggered, 0);
});
test('JIU lateinterrupt only positive publicD clears busy;frames beforelateinterrupt retain1', () => {
    const c = pick('jiu', '800'), r = syntheticJiuyangRemainingTrace(c, { hit: true, publicHit: true, busy: true, bonus: true });
    const e = record(r, c); assert.ok(e.public_damage.every(d => d > 0)); assert.equal(r.attacks[8].after[1].busy, 1); assert.equal(r.immediate[1].busy, 0);
    reject(c, r, b => { b.immediate[1].busy = 1; b.after = copy(b.immediate); });
    reject(c, r, b => { b.attacks[0].after[1].busy = 0; });
    reject(c, r, b => { b.actions[1].attack_id = 1; }); reject(c, r, b => { b.passives[0].factor = 1; });
    reject(c, r, b => { b.dodge_checks[1].dp++; }); reject(c, r, b => { b.actions[1].before[0].neili++; });
});
test('RI strict actual enemyorder and3USER spectator exclusion;no public/passive/direct paths', () => {
    for (const variant of ['two-enemies', 'mixed-enemies', 'nonenemy-bystander']) {
        const c = pick('ri', variant), r = syntheticJiuyangRemainingTrace(c, { hit: true, reverse: true }); const e = record(r, c);
        assert.equal(e.ri_enemy_trials, variant === 'nonenemy-bystander' ? 1 : 2);
        assert.equal(e.ri_targets['2'].enemy, variant !== 'nonenemy-bystander');
        reject(c, r, b => { b.enemy_context.after.reverse(); b.enemy_context.after.push(2); });
        reject(c, r, b => { b.extra_target_metrics.qi_cost = 1; }); reject(c, r, b => { delete b.extra_target_before; });
    }
});
test('RI all4damage/wound counters and nominalsupportjoint;lowneili real500gross+SET0 recovery onhit/miss', () => {
    for (const n of [-1, 0, 499, 500]) for (const hit of [false, true]) {
        const c = pick('ri', 'target-neili' + n), r = syntheticJiuyangRemainingTrace(c, { hit }); const e = record(r, c);
        assert.equal(e.target_neili_cost, hit ? 500 : 0); assert.equal(e.target_neili_recovery, Math.max(0, (hit ? 500 : 0) - n));
        assert.equal(e.target_neili_net, n - Math.max(0, n - (hit ? 500 : 0)));
        reject(c, r, b => { b.metrics[1].neili_recovery = (b.metrics[1].neili_recovery ?? 0) + 1; });
    }
    const c = pick('ri', '800'), r = syntheticJiuyangRemainingTrace(c, { hit: true, nominalOffset: 800 }); const e = record(r, c);
    assert.ok(e.jing_cost > 150 && e.eff_jing_cost > 150);
    reject(c, r, b => { b.immediate[1].craze--; b.after = copy(b.immediate); });
    reject(c, r, b => { b.immediate[1].eff_jing--; b.metrics[1].eff_jing_cost++; b.after = copy(b.immediate); });
});
test('RI unconscious nominalD can be ambiguous;retainalljointcandidates,neverfirstasobservedDamage', () => {
    const c = pick('ri', 'unconscious-enemy'), r = syntheticJiuyangRemainingTrace(c, { hit: true }); const e = record(r, c);
    assert.equal(e.qi_cost, 1); assert.equal(e.jing_cost, 1); assert.ok(e.ri_targets['1'].nominal_support.length > 0);
    const f = effects([{ raw: r }], c); assert.equal(f.ri_damage.n, Number(e.ri_targets['1'].nominal_support.length === 1));
    assert.equal(f.ri_damage_ambiguous, Number(e.ri_targets['1'].nominal_support.length > 1));
    reject(c, r, b => { b.preparation.terminals = []; }); reject(c, r, b => { b.terminals.push({ side: 1, state: 'unconscious' }); });
});
test('exactouterbranch/noRNGforcing;minimumweak100natural0/1 vs125always1', () => {
    for (const weak of [0, 1]) record(syntheticJiuyangRemainingTrace(pick('jiu', 'minimum'), { weak }), pick('jiu', 'minimum'));
    const c = pick('ri', 'minimum'), r = syntheticJiuyangRemainingTrace(c); reject(c, r, b => { b.immediate[0].learned = {}; b.after = copy(b.immediate); });
    const hard = pick('ri', 'outer-impossible'); assert.equal(hard.samples, 2); assert.equal(record(syntheticJiuyangRemainingTrace(hard), hard).ri_hits, 0);
    const easy = pick('ri', 'outer-always'); assert.equal(record(syntheticJiuyangRemainingTrace(easy), easy).ri_hits, 1);
});
test('failclosed normal fields/index/elapsed/fee/grants/IDs/notify literal;diagnostic unknown neverzero', () => {
    const c = pick('ri'), r = syntheticJiuyangRemainingTrace(c, { hit: true });
    for (const k of ['metrics', 'enemy_context', 'immediate', 'skill_messages', 'busy_calls']) reject(c, r, b => { delete b[k]; });
    for (const index of [null, -1, c.samples]) reject(c, r, b => { b.index = index; });
    reject(c, r, b => { b.before[0].cultivation['can_perform/jiuyang-shengong/ri'] = 0; });
    reject(c, r, b => { b.before[0].userp = 0; }); reject(c, r, b => { b.busy_calls[0].caller_side = 1; });
    const refused = pick('jiu', 'busy1'), rr = syntheticJiuyangRemainingTrace(refused);
    reject(refused, rr, b => { b.immediate[0].temp.notify_fail += 'extra'; b.after = copy(b.immediate); });
    const diagnostic = { kind: 'sample', condition_id: c.id, method: 'perform', index: 0, elapsed: 0, outcome: 'error', reason: 'synthetic failure' };
    assert.equal(record(diagnostic, c), null); assert.equal(effects([{ raw: diagnostic }], c).actor_neili_cost, null);
    reject(c, diagnostic, b => { b.reason = ''; }); reject(c, diagnostic, b => { b.elapsed = null; }); reject(c, diagnostic, b => { b.index = null; });
});
test('Effects honestknown/unknown,signedneilinet and planeRI roles/frequencies', () => {
    const c = pick('ri', 'target-neili-1'), rows = [false, true].map((hit, index) => ({ raw: syntheticJiuyangRemainingTrace(c, { hit, index }) }));
    const e = effects(rows, c); assert.equal(e.validated, 2); assert.equal(e.target_neili_net, -2); assert.equal(e.ri_targets['1'].trials, 2);
    assert.equal(e.ri_damage.n, 1); assert.equal(Object.values(e.ri_targets['1'].nominal_supports).reduce((a, b) => a + b, 0), 1);
    const mixed = effects([rows[0], { raw: { kind: 'sample', condition_id: c.id, method: 'perform', index: 1, elapsed: .1, outcome: 'not_applicable', reason: 'synthetic unknown' } }], c);
    assert.equal(mixed.target_neili_net, null); assert.equal(mixed.ri_targets['1'].trials, null); assert.equal(mixed.ri_targets['1'].recorded, 1);
});
test('command execution cost is a present nonnegative integer,not boolean;positive23/476 remain oneacceptedcommand', () => {
    for (const ability of ['jiu', 'ri']) {
        const c = pick(ability), r = syntheticJiuyangRemainingTrace(c);
        for (const cost of [1, 23, 476]) {
            const positive = copy(r); positive.command_accepted = cost;
            general(positive, c); school(positive, c); assert.equal(record(positive, c).accepted, true);
            const e = effects([{ raw: positive }], c); assert.equal(e.accepted_commands, 1); assert.equal(e.refused_commands, 0);
        }
        for (const cost of [0, -1, null, 1.5, false, '23']) reject(c, r, bad => { bad.command_accepted = cost; });
        reject(c, r, bad => { delete bad.command_accepted; });
        const refused = pick(ability, 'busy1'), rr = syntheticJiuyangRemainingTrace(refused);
        assert.equal(rr.command_accepted, 0); assert.equal(record(rr, refused).accepted, false);
        for (const cost of [23, 476, -1, null, .5]) reject(refused, rr, bad => { bad.command_accepted = cost; });
        assert.equal(effects([{ raw: rr }], refused).refused_commands, 1);
    }
});
