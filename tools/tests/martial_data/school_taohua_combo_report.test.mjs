import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaComboConditions, taohuaComboSourcePaths, taohuaComboActions,
    taohuaComboExtraAction, taohuaComboEffects } from './school_taohua_combo_cases.mjs';
import { taohuaComboReport, schoolCombatMarkdown } from './school_combat_report.mjs';
import { summarizeSamples } from './statistics.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const catalog = { skills: ['xuanfeng-tui', 'xuanfeng-tui/kuang', 'lanhua-shou', 'lanhua-shou/fei'].map(id => {
    const path = `kungfu/skill/${id}.c`, source = read(path), parsed = scanSource(source);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: parsed.functions.filter(f => f.name === 'perform')
        .map(f => ({ id: `${path}:${f.line}:perform`, role: 'perform' })) };
}) };
const cases = taohuaComboConditions(catalog, read), smoke = taohuaComboConditions(catalog, read, { smoke: true });
const pick = (ability = 'kuang', variant = 'baseline', level = 200) => {
    const condition = cases.find(c => c.parameters.ability === ability && c.parameters.variant === variant
        && c.parameters.level === level);
    assert.ok(condition, `${ability}/${variant}/${level}`); return condition;
};
const copy = structuredClone;

function snapshot(config, side, nonlethal) {
    const qualified = key => key.includes('/') || key === 'character';
    const apply = { armor: 100, ...(config.equipment ? { damage: 50, dodge: -1 } : {}) };
    const strongest = Math.max(0, ...['unarmed', 'hand', 'finger', 'strike', 'claw', 'cuff'].map(k => config.skills[k] ?? 0));
    return { ...Object.fromEntries(Object.entries(config.properties).filter(([key]) => !qualified(key))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([key]) => qualified(key))),
        object: `/tests/actor#${100 + side}`, id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, living: 1, ghost: 0, fighting_opponent: 1, killing_opponent: nonlethal ? 0 : 1,
        busy: config.busy ?? null, skills: copy(config.skills), mappings: copy(config.mappings),
        preparations: copy(config.preparations), preparation_order: Object.keys(config.preparations),
        learned: {}, temp: { apply }, conditions: null,
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, level]) =>
            [key, Math.trunc(level / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_str: config.properties.str + Math.trunc(strongest / 10),
        effective_con: config.properties.con + Math.trunc(config.skills.force / 10),
        weapon: config.equipment ? 'sword' : 'none', weapon_damage: config.equipment ? 50 : 0,
        weapon_flag: config.equipment ? 4 : 0, weapon_details: config.equipment ? {
            object: '/tests/sword#202', program: '/tests/sword', skill_type: 'sword', weight: 3000,
            flag: 4, damage: 50, consistence: 100, rigidity: null, no_wield: null, material: null,
        } : {}, secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

// Synthetic, source-reachable protocol examples only; no driver or forced RNG.
function trace(condition, options = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.nonlethal), snapshot(p.target, 1, p.nonlethal)];
    const raw = { kind: 'sample', condition_id: condition.id, index: options.index ?? 0, method: 'perform',
        outcome: p.expected, before, immediate: copy(before), after: [], metrics: [{}, {}],
        command_accepted: accepted ? (options.cost ?? 23) : 0, actions: [], attacks: [], dodge_checks: [],
        passives: [], launches: [], refusals: [], defenses: [], interfaces: [], dropped: [],
        terminals: [], callbacks: [], reason: '', elapsed: 0.01 };
    const [actor, target] = raw.immediate;
    if (!accepted) {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        actor.temp.notify_fail = p.refusal;
        raw.refusals = [{ actor: actor.object, reason: raw.reason }];
    } else {
        const kuang = p.ability === 'kuang', fee = kuang ? 100 : 150;
        const gate = options.boost ?? p.variant !== 'gate-miss';
        const bonus = kuang ? (p.actor.properties['family/family_name'] === '桃花岛' ? Math.trunc(p.level / 4) : 0)
            : gate ? Math.trunc(p.level / 5) : 0;
        raw.launches = [{ actor: actor.object, skill: p.skill, argument: `${p.ability} right` }];
        raw.metrics[0].ability_launched = 1; raw.metrics[0].neili_cost = fee; actor.neili -= fee;
        actor.temp.notify_fail = '你所使用的外功中没有这种功能。\n';
        if (kuang || bonus) actor.temp.apply.attack = bonus;
        if (kuang) actor.temp.apply.unarmed_damage = Math.trunc(bonus / 2);
        const unlocked = taohuaComboActions[p.skill].filter(action => p.level > action.lvl);
        const actionIndex = options.actionIndex ?? Math.max(0, unlocked.length - 6);
        const results = options.results ?? [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < results.length; i++) {
            if (!actor.fighting_opponent) break;
            if (kuang && !(target.busy ?? 0) && i % 2 === 0) target.busy = 1;
            if (!kuang) actor.temp.action_flag = before[0].preparation_order.indexOf('hand');
            const surcharge = options.surchargeAt?.includes(i);
            const action = copy(surcharge ? taohuaComboExtraAction : taohuaComboActions[p.skill][actionIndex]);
            if (surcharge) { actor.neili -= 300; raw.metrics[0].neili_cost += 300; }
            raw.actions.push({ actor: 0, target: 1, skill: p.skill, action });
            actor.temp.fight = { attack: action.attack ?? null, dodge: action.dodge, parry: action.parry ?? null };
            for (const phase of ['base', 'settled']) raw.dodge_checks.push({ actor: 0, target: 1, type: 0,
                phase, ap: 1000, dp: phase === 'settled' && target.busy ? 100 : 300, busy: target.busy, skill: null });
            const result = results[i], unarmed = actor.temp.apply.unarmed_damage ?? 0;
            const first = Math.trunc(unarmed / 2), force = actor.effective_str + Math.trunc(action.force * actor.effective_str / 100);
            const incoming = first + Math.trunc(action.damage * first / 100) + Math.trunc(force / 3);
            let damage = incoming + Math.trunc(incoming * (actor.str * 2 + actor.effective_str) / 300);
            damage = damage > 400 ? Math.trunc((damage - 400) / 4) + 300 : damage > 200 ? Math.trunc((damage - 200) / 2) + 200 : damage;
            if (result !== 0 || options.zeroDamage?.includes(i)) damage = 0;
            if (result === 0) raw.passives.push({ actor: 0, target: 1, skill: p.skill, incoming, factor: 0,
                route: 'martial', result: options.callbackResult ?? null, before: copy([actor, target]), after: copy([actor, target]),
                neili_after: actor.neili, target_eff_qi_after: target.eff_qi, target_busy_after: target.busy });
            raw.attacks.push({ actor: 0, target: 1, type: 0, result, damage, attack_usage: p.usage,
                attack_skill: p.skill, action_flag: actor.temp.action_flag ?? null,
                apply_attack: actor.temp.apply.attack ?? null, apply_unarmed_damage: actor.temp.apply.unarmed_damage ?? null,
                neili: actor.neili });
            const metric = result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry';
            raw.metrics[0][metric] = (raw.metrics[0][metric] ?? 0) + 1;
            if (damage) {
                raw.metrics[1].qi_cost = (raw.metrics[1].qi_cost ?? 0) + damage;
                target.qi -= damage; target.busy = 0;
                if (p.nonlethal && target.qi * 3 <= target.max_qi) { actor.fighting_opponent = 0; target.fighting_opponent = 0; }
            }
        }
        actor.temp.apply.attack = 0;
        if (kuang) actor.temp.apply.unarmed_damage = 0;
        actor.busy = options.busy ?? (kuang ? 4 : 2);
        if ((options.progress ?? 1) > 0) actor.learned[p.skill] = options.progress ?? 1;
    }
    raw.after = copy(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, index: raw.index, outcome: raw.outcome, reason: raw.reason, raw });
const exceptional = (c, outcome = 'error', index = 0) => row({ kind: 'sample', condition_id: c.id, index,
    method: c.method, outcome, reason: '原记录 | <详情>\n下一行' });
function report(c, rows) {
    const s = taohuaComboReport(rows, c);
    const result = summarizeSamples({ fingerprint: 'synthetic-only', versions: {},
        identity: { conditions: [c], execution: { smoke: false } } }, rows);
    result.evidence_sha256 = 'synthetic-only';
    result.totals = { conditions: 1, samples: rows.length, observed: s.counts.observed,
        refused: s.counts.refused, errors: s.counts.error };
    const summary = result.conditions[0];
    assert.deepEqual(summary.counts, s.counts); assert.equal(summary.planned, s.planned);
    assert.equal(summary.recorded, s.recorded); assert.equal(summary.missing, s.missing);
    summary.effects = null; summary.taohua_combo = s;
    return result;
}

test('固定24/1420/48与33来源不变，全条件合成通过冻结condition报告消费', () => {
    assert.equal(cases.length, 24); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1420);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 48); assert.equal(taohuaComboSourcePaths.length, 33);
    assert.equal(hash(cases), 'c2232aaf06dc8b3bdc49ab1071d98e1d92ef59587e5c5a87f5e6868c413d595c');
    assert.equal(hash(smoke), 'a34becd237a5cb3a99459e924d391b241bda13777a8e42b4465d574005b0412a');
    for (const c of cases) {
        const raw = trace(c), rows = [row(raw)], original = JSON.stringify([rows, c]);
        const s = taohuaComboReport(rows, c);
        assert.deepEqual(s.effects, taohuaComboEffects(rows, c));
        assert.equal(s.recorded, 1); assert.equal(s.missing, c.samples - 1);
        assert.equal(s.commands.accepted, Number(c.parameters.expected === 'observed'));
        assert.equal(Object.hasOwn(raw, 'parameters'), false);
        assert.equal(JSON.stringify([rows, c]), original);
        assert.match(schoolCombatMarkdown(report(c, rows)), /原六击循环/);
    }
});

test('正命令成本不变成受理次数或内力费；拒绝原0单列且无伤害分母', () => {
    const c = pick('fei'), rows = [1, 23, 476].map((cost, index) => row(trace(c, { cost, index })));
    const s = taohuaComboReport(rows, c);
    assert.equal(s.commands.accepted, 3); assert.equal(s.commands.accepted_execution_cost.mean, 500 / 3);
    assert.equal(s.effects.acceptance.successes, 3); assert.equal(s.effects.actor_neili_cost.mean, 150);
    assert.equal(s.attacks.total, 18);
    const rejected = pick('fei', 'neili299'), no = taohuaComboReport([row(trace(rejected))], rejected);
    assert.equal(no.commands.refused, 1); assert.equal(no.commands.refused_execution_cost.mean, 0);
    assert.equal(no.effects.actor_neili_cost.mean, 0); assert.equal(no.effects.damage_per_accepted.n, 0);
    assert.equal(no.effects.damage_per_accepted.mean, null); assert.equal(no.effects.hit_given_attack.rate, null);
    for (const bad of [null, false, true, '23', -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        const r = row(trace(c)); r.raw.command_accepted = bad; assert.throws(() => taohuaComboReport([r], c));
    }
    const missing = row(trace(c)); delete missing.raw.command_accepted;
    assert.throws(() => taohuaComboReport([missing], c));
    const wrong = row(trace(rejected)); wrong.raw.command_accepted = 23;
    assert.throws(() => taohuaComboReport([wrong], rejected));
});

test('fei门失败仍计受理/六击/150费，命中与加成分母分开', () => {
    const c = pick('fei'), results = [0, -1, -2, -1, 0, -2];
    const rows = [row(trace(c, { results, boost: true })), row(trace(c, { results, boost: false, index: 1 }))];
    const s = taohuaComboReport(rows, c);
    assert.equal(s.effects.bonus_given_accepted.rate, 0.5); assert.equal(s.effects.acceptance.rate, 1);
    assert.deepEqual(s.attacks, { total: 12, hit: 4, dodge: 4, parry: 4, zero_damage_hits: 0, short_combos: 0 });
    assert.equal(s.effects.hit_given_attack.successes, 4); assert.equal(s.effects.hit_given_attack.trials, 12);
    assert.equal(s.effects.actor_neili_cost.mean, 150);
    const gate = pick('fei', 'gate-miss'), miss = taohuaComboReport([row(trace(gate))], gate);
    assert.equal(miss.effects.bonus_given_accepted.successes, 0); assert.equal(miss.attacks.total, 6);
});

test('狂风门派加成和结束回收严格；可置忙机会/实际开始/目标初忙与终忙独立', () => {
    const c = pick('kuang', 'target-busy50'), r = row(trace(c, { results: [-1, -1, 0, -2, -2, -2] }));
    const s = taohuaComboReport([r], c);
    assert.equal(s.effects.attack_bonus.mean, 50); assert.equal(s.effects.target_busy_initial.mean, 50);
    assert.equal(s.effects.target_busy_final.mean, 1); assert.equal(s.effects.kuang_busy_given_available_attack.trials, 2);
    assert.equal(s.effects.kuang_busy_given_available_attack.successes, 1); assert.equal(s.effects.actor_busy.mean, 4);
    const other = pick('kuang', 'other-family'), no = taohuaComboReport([row(trace(other))], other);
    assert.equal(no.commands.accepted, 1); assert.equal(no.effects.attack_bonus.mean, 0);
    const bad = copy(r); bad.raw.immediate[0].temp.apply.attack = 50; bad.raw.after = copy(bad.raw.immediate);
    assert.throws(() => taohuaComboReport([bad], c));
});

test('兰花按逐击资格选招，闪避/招架仍保留300毛费，与基础150及命令成本分账', () => {
    const c = pick('fei', 'jingluo-surcharge');
    const r = row(trace(c, { results: [-1, -2, -1, -2, -1, -2], surchargeAt: [0, 2, 5] }));
    const s = taohuaComboReport([r], c);
    assert.deepEqual(s.extra_action, { selected: 3, hit: 0, dodge: 2, parry: 1 });
    assert.equal(s.effects.lanhua_surcharge_given_eligible_action.trials, 6);
    assert.equal(s.effects.lanhua_surcharge_given_eligible_action.successes, 3);
    assert.equal(s.effects.base_cost.mean, 150); assert.equal(s.effects.action_surcharge_cost.mean, 900);
    assert.equal(s.effects.actor_neili_cost.mean, 1050); assert.equal(s.commands.accepted_execution_cost.mean, 23);
    assert.equal(s.effects.damage_per_accepted.mean, 0); assert.equal(s.effects.learned_delta.mean, 1);
    const bad = copy(r); bad.raw.attacks[2].neili += 300;
    assert.throws(() => taohuaComboReport([bad], c));
    const baseline = pick('fei'), ordinary = taohuaComboReport([row(trace(baseline))], baseline);
    assert.equal(ordinary.effects.lanhua_surcharge_given_eligible_action.rate, null);
    assert.throws(() => taohuaComboReport([row(trace(baseline, { surchargeAt: [0] }))], baseline));
});

test('低qi原非杀伤切磋短连与全闪避六击分开，不把计划6击补成实际出手', () => {
    for (const ability of ['kuang', 'fei']) {
        const c = pick(ability, 'low-qi');
        const rows = [row(trace(c)), row(trace(c, { results: Array(6).fill(-1), index: 1 }))];
        const s = taohuaComboReport(rows, c), short = rows[0].raw.attacks.length;
        assert.ok(short >= 1 && short < 6); assert.equal(s.attacks.total, short + 6);
        assert.equal(s.attacks.short_combos, 1); assert.equal(s.effects.early_stop_given_accepted.rate, 0.5);
        assert.equal(s.effects.attacks_per_accepted.mean, (short + 6) / 2);
        const bad = copy(rows[0]); bad.raw.before[0].killing_opponent = 1;
        assert.throws(() => taohuaComboReport([bad], c));
    }
});

test('原武学回调0/null与未到达、命中零伤及弱熟练彼此分开', () => {
    const c = pick('fei'), rows = [row(trace(c, { results: [0, -1, -2, 0, -1, -2], zeroDamage: [0], callbackResult: 0 })),
        row(trace(c, { results: [0, -1, -2, 0, -1, -2], index: 1, progress: 0, boost: false }))];
    const s = taohuaComboReport(rows, c);
    assert.deepEqual(s.martial_callback, { reached: 4, returned_zero: 2, returned_null: 2, not_reached: 8 });
    assert.equal(s.attacks.zero_damage_hits, 1); assert.equal(s.effects.learned_delta.mean, 0.5);
    const bad = copy(rows[0]); delete bad.raw.passives[0].result;
    assert.throws(() => taohuaComboReport([bad], c));
    bad.raw.passives[0].result = 1; assert.throws(() => taohuaComboReport([bad], c));
});

test('错误/未适用/缺样本不伪造零费用或零效果，实际理由与空分母保留', () => {
    const c = pick('fei'), rows = [exceptional(c), exceptional(c, 'not_applicable', 1)];
    const s = taohuaComboReport(rows, c);
    assert.deepEqual(s.counts, { observed: 0, refused: 0, error: 1, not_applicable: 1 });
    assert.equal(s.missing, c.samples - 2); assert.equal(s.effects.unknown_effect_samples, 2);
    assert.equal(s.effects.actor_neili_cost.mean, null); assert.equal(s.commands.accepted_execution_cost.mean, null);
    assert.equal(s.effects.hit_given_attack.rate, null); assert.equal(s.effects.bonus_given_accepted.rate, null);
    assert.deepEqual(s.exceptional.map(x => x.reason), rows.map(x => x.reason));
    const empty = taohuaComboReport([], c);
    assert.equal(empty.missing, c.samples); assert.equal(empty.effects.attacks_per_accepted.mean, null);
    const mixed = taohuaComboReport([row(trace(c, { index: 2 })), ...rows], c);
    assert.equal(mixed.effects.acceptance.trials, 1); assert.equal(mixed.effects.actor_neili_cost.n, 1);
    assert.equal(mixed.effects.unknown_effect_samples, 2);
});

test('所有结果分类前逐项锁outer/raw ID/index/outcome/reason，重复/越界/缺字段拒绝', () => {
    for (const outcome of ['observed', 'refused', 'error', 'not_applicable']) {
        const c = outcome === 'refused' ? pick('fei', 'neili299') : pick('fei');
        const good = ['observed', 'refused'].includes(outcome) ? row(trace(c)) : exceptional(c, outcome);
        const changes = [r => r.condition_id = 'foreign', r => delete r.condition_id,
            r => r.raw.condition_id = 'foreign', r => delete r.raw.condition_id,
            r => r.index = 1, r => r.raw.index = 1, r => delete r.index, r => delete r.raw.index,
            r => { r.index = c.samples; r.raw.index = c.samples; }, r => { r.index = -1; r.raw.index = -1; },
            r => { r.index = 0.5; r.raw.index = 0.5; }, r => r.outcome = 'foreign',
            r => r.raw.outcome = 'foreign', r => delete r.outcome, r => delete r.raw.outcome,
            r => r.reason = 'different', r => r.raw.reason = 'different', r => delete r.reason,
            r => delete r.raw.reason, r => { r.reason = null; r.raw.reason = null; },
            r => { r.reason = 0; r.raw.reason = 0; }, r => r.raw.kind = 'other', r => r.raw.method = 'ordinary',
            r => delete r.raw, r => r.raw = null];
        for (const change of changes) { const bad = copy(good); change(bad); assert.throws(() => taohuaComboReport([bad], c)); }
        assert.throws(() => taohuaComboReport([good, copy(good)], c));
        if (['error', 'not_applicable'].includes(outcome)) for (const reason of ['', '   ']) {
            const bad = copy(good); bad.reason = reason; bad.raw.reason = reason;
            assert.throws(() => taohuaComboReport([bad], c));
        }
    }
});

test('仅原冻结condition控制绑定/参数，不读取raw.parameters或summary planned代samples', () => {
    const c = pick('fei'), raw = trace(c);
    raw.parameters = { collection_group: 'wrong', ability: 'kuang', level: 800 };
    const s = taohuaComboReport([row(raw)], c);
    assert.equal(s.name, '影落飞花'); assert.equal(s.effects.base_cost.mean, 150);
    for (const change of [x => delete x.samples, x => x.samples = 0, x => x.samples = 1.5,
        x => x.parameters.collection_group = 'wrong', x => x.parameters.ability = 'kuang',
        x => x.parameters.skill = 'wrong', x => x.parameters.usage = 'unarmed',
        x => x.parameters.action = 'perform hand.fei missing', x => x.method = 'ordinary',
        x => x.entry_id += '-other', x => x.parameters.ability_source.path = 'wrong.c',
        x => x.parameters.base_source.path = 'wrong.c', x => x.parameters.observe_seconds = 1,
        x => x.parameters.named_participants = false, x => x.parameters.fighting = false,
        x => x.parameters.target_state = 'unconscious', x => x.parameters.expected = 'maybe']) {
        const bad = copy(c); change(bad); assert.throws(() => taohuaComboReport([row(raw)], bad));
    }
    const summary = report(c, [row(raw)]).conditions[0];
    assert.equal(summary.samples, undefined); assert.ok(summary.planned);
    assert.throws(() => taohuaComboReport([row(raw)], summary));
});

test('已知样本不能借报告聚合掩盖缺账、错误归属、未恢复加成或越界选招', () => {
    const c = pick('fei');
    for (const change of [r => r.raw.metrics[0].neili_cost = null, r => delete r.raw.metrics[1],
        r => r.raw.attacks[0].actor = 1, r => r.raw.passives[0].target = 0,
        r => r.raw.actions[0].skill = 'xuanfeng-tui', r => r.raw.before[0].effective_str++,
        r => r.raw.metrics[0].heartbeats = 1, r => r.raw.immediate[0].temp.apply.attack = 40]) {
        const bad = row(trace(c)); change(bad); assert.throws(() => taohuaComboReport([bad], c));
    }
    assert.throws(() => taohuaComboReport([row(trace(c, { actionIndex: 0 }))], c), '高等级已解锁但不在末六式仍拒');
});

test('专用Markdown不走generic伤害表，分别显示成本/连击/加成/逐击费/初终忙与未知', () => {
    for (const c of [pick('kuang', 'target-busy50'), pick('fei', 'jingluo-surcharge'), pick('fei', 'low-qi')]) {
        const r = row(trace(c)), summary = report(c, [r]);
        Object.defineProperty(summary.conditions[0], 'sides', { get() { throw new Error('不得套通用side伤害表'); } });
        const markdown = schoolCombatMarkdown(summary);
        for (const text of ['原命令成本：受理/拒绝', '实际击数：受理分布', '飞花有加成/受理',
            '兰花额外选中/有资格选招', '狂风实际置忙/可置忙攻击', '目标初始/最终忙乱',
            '弱熟练增量：已知命令分布', '基础费 100', '基础费 150', '先按当时', '自然DPS观察']) assert.ok(markdown.includes(text), text);
        assert.equal(markdown.slice(0, markdown.indexOf('## 桃花岛·狂风')).includes(`| ${c.id} |`), false);
    }
    const c = pick('fei'), markdown = schoolCombatMarkdown(report(c, [exceptional(c)]));
    assert.match(markdown, /未知（分母0）/); assert.match(markdown, /未观察（n=0/);
    assert.ok(markdown.includes('原记录 \\| &lt;详情&gt;<br>下一行'));
    assert.ok(!markdown.includes('| undefined')); assert.ok(!markdown.includes('| NaN'));
});

test('实际strict consumer传原conditions成员，COMBO generic分支显式跳过', () => {
    const source = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(source, /condition\.taohua_combo = taohuaComboReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\)/);
    assert.match(source, /if \(condition\.parameters\.collection_group === 'taohua-combo'\) condition\.effects = null;/);
    assert.match(source, /report\.conditions\.filter\(c => !c\.mingjiao_force_remaining && !c\.mingjiao_remaining_base && !c\.mingjiao_remaining_perform && !c\.mingjiao_teachers && !c\.mingjiao_apprentice_learning && !c\.mingjiao_ling_perform && !c\.mingjiao_ling_learning && !c\.mingjiao_shenghuo && !c\.mingjiao_shengong && !c\.mingjiao_movement && !c\.mingjiao_xinfa && !c\.mingjiao_qishang && !c\.mingjiao_core && !c\.taohua_combo &&/);
});
