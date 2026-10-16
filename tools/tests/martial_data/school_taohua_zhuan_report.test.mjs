import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { summarizeSamples } from './statistics.mjs';
import { taohuaZhuanConditions, taohuaZhuanPower, taohuaZhuanDamageSupport,
    taohuaZhuanEffects } from './school_taohua_zhuan_cases.mjs';
import { taohuaZhuanReport, schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const skill = 'tanzhi-shentong';
const catalog = { skills: [skill, skill + '/zhuan'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', source = readFileSync(join(root, path), 'utf8');
    const parsed = scanSource(source); assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: parsed.functions.filter(fn => fn.name === 'perform')
        .map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'perform' })) };
}) };
const cases = taohuaZhuanConditions(catalog);
const pick = (tag = 'baseline', level = 220) => {
    const condition = cases.find(c => c.id === `school-taohua-zhuan-l${level}-${tag}`);
    assert.ok(condition, tag); return condition;
};
function snapshot(cfg, side, fighting) {
    const primary = !!cfg.equipment && cfg.equipment.slot !== 'secondary_weapon';
    const secondary = cfg.equipment?.slot === 'secondary_weapon';
    const apply = { armor: 100, ...(primary ? { damage: 50, dodge: -1 } : {}) };
    const details = { object: '/tests/sword#' + (200 + side), program: '/tests/sword', skill_type: 'sword',
        weight: 3000, damage: 50, flag: 4, consistence: 100 };
    return { ...Object.fromEntries(Object.entries(cfg.properties).filter(([key]) => !key.includes('/'))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([key]) => key.includes('/'))),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: Number(fighting), busy: cfg.busy ?? null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), learned: {}, skill_order: Object.keys(cfg.skills), temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_str: cfg.properties.str + Math.trunc((cfg.skills.finger ?? 0) / 10),
        weapon: primary ? 'sword' : 'none', weapon_damage: primary ? 50 : 0, weapon_flag: primary ? 4 : 0,
        weapon_details: primary ? details : {}, secondary_weapon: secondary ? 'sword' : 'none',
        secondary_weapon_details: secondary ? details : {}, handing: 'none', handing_details: {} };
}

// Explicit synthetic report inputs, never persisted as driver events or ledger samples.
function trace(condition, { hit, progress = 1, percent = 100, fee = 200, index = 0, cost = 23 } = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 }); preparation.after = structuredClone(before[1]);
    }
    const raw = { kind: 'sample', condition_id: condition.id, index, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        command_accepted: accepted ? cost : 0, launches: [], refusals: [], directs: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [], callbacks: [],
        elapsed: 0.01, reason: '', ...(preparation ? { preparation } : {}) };
    const [b, t] = before, [a, end] = raw.immediate, power = taohuaZhuanPower(b, t);
    if (accepted) {
        hit ??= p.gate_expectation !== 'miss' && Math.trunc(power.ap / 2) + power.ap - 1 > power.dp;
        const death = hit && b.max_neili > t.max_neili * 2;
        raw.launches = [{ actor: b.object, skill, argument: 'zhuan right' }]; raw.metrics[0].ability_launched = 1;
        a.busy = hit && !death ? 3 : 2;
        if (progress) a.learned[skill] = progress;
        if (death) {
            for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) { end[key] = 1; raw.metrics[1][key + '_cost'] = t[key] - 1; }
            end.ghost = 1; end.max_neili -= 20; end.combat_exp -= Math.trunc(t.combat_exp * 3 / 100);
            end.potential -= Math.trunc((t.potential - t.learned_points) / 2);
            a.fighting_opponent = 0; end.fighting_opponent = 0;
            end.skills = Object.fromEntries(Object.entries(t.skills).filter(([, n]) => n > 1).map(([key, n]) => [key, n - 1]));
            end.mappings = {}; end.preparations = {}; end.temp.apply.damage = 0; end.temp.apply.dodge = 0;
            end.effective_skills = Object.fromEntries(Object.entries(end.skills).map(([key, n]) => [key, Math.trunc(n / 2)]));
            end.weapon = 'none'; end.weapon_details = {}; end.weapon_damage = 0; end.weapon_flag = 0;
            raw.terminals = [{ side: 1, state: 'death' }];
            raw.dropped = [{ object: '/clone/misc/corpse#300', name: '右侧武者的尸体', type: null, no_wield: null }];
            raw.zhuan_death = { target: t.object, killer: b.object, corpse: '/clone/misc/corpse#300',
                weapon: { ...t.weapon_details, environment: '/clone/misc/corpse#300', equipped: null },
                target_environment: '/d/death/gate', learned_was_mapping: 0,
                conditions_before: {}, conditions_after: { die_guard: 6000 },
                killer_pks_delta: 1, killer_wanted_pks_delta: 0, killer_experience_delta: 0 };
        } else {
            raw.metrics[0].neili_cost = fee; a.neili -= fee;
            if (hit) {
                const input = power.ap, support = taohuaZhuanDamageSupport(b, t, input, percent)[0];
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input, percent, weapon: 'none', weapon_object: '' }];
                raw.metrics[0].direct = 1; raw.metrics[1].qi_cost = support.damage; raw.metrics[1].eff_qi_cost = support.wound;
                end.qi -= support.damage; end.eff_qi -= support.wound;
            }
        }
    } else {
        raw.reason = p.refusal; raw.refusals = [{ actor: b.object, reason: raw.reason }];
    }
    raw.after = structuredClone(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, index: raw.index, outcome: raw.outcome, reason: raw.reason, raw });
const error = (condition, index = 0) => row({ kind: 'sample', condition_id: condition.id, index,
    method: condition.method, outcome: 'error', reason: '原错误 | <详情>\n第二行' });
function report(condition, rows) {
    const result = summarizeSamples({ fingerprint: 'synthetic-only', versions: {}, identity: {
        conditions: [condition], execution: { smoke: false } } }, rows);
    result.conditions[0].effects = null;
    result.conditions[0].taohua_zhuan = taohuaZhuanReport(rows, condition);
    return { ...result, evidence_sha256: 'synthetic-only', totals: { conditions: 1, samples: rows.length,
        observed: rows.filter(r => r.outcome === 'observed').length,
        refused: rows.filter(r => r.outcome === 'refused').length, errors: rows.filter(r => r.outcome === 'error').length } };
}

test('固定24/734/24与两矩阵不改，报告消费原条件而非planned摘要', () => {
    assert.equal(cases.length, 24); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 734);
    assert.equal(hash(cases), 'ab3a00d43bb600e330e34087f6c6a16dfd593856cb4f9139111da0d7c6cd0232');
    const smoke = taohuaZhuanConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 24);
    assert.equal(hash(smoke), 'edc59573f318597bf2d60829614771529017ccf9d2ee030bfa285d639b7586b7');
    for (const condition of cases) {
        const rows = [row(trace(condition))], saved = JSON.stringify({ condition, rows });
        assert.equal(Object.hasOwn(rows[0].raw, 'parameters'), false);
        const summary = report(condition, rows).conditions[0], s = summary.taohua_zhuan;
        assert.deepEqual(s.effects, taohuaZhuanEffects(rows, condition));
        assert.equal(s.recorded, 1); assert.equal(s.missing, condition.samples - 1);
        assert.equal(summary.effects, null); assert.equal(summary.sides.length, 2);
        assert.throws(() => taohuaZhuanReport(rows, summary));
        assert.equal(JSON.stringify({ condition, rows }), saved);
    }
    const source = readFileSync(join(root, 'tools/tests/martial_data/school_combat_report.mjs'), 'utf8');
    assert.match(source, /condition\.taohua_zhuan = taohuaZhuanReport\(rows\.filter\(r => r\.condition_id === condition\.id\),\s*conditions\.find\(c => c\.id === condition\.id\)\)/);
    assert.match(source, /condition\.effects = condition\.npc_bout_effects \|\| \[[^\]]*'taohua-zhuan'[^\]]*\]\.includes\(condition\.parameters\.collection_group\) \? null/);
});

test('普通命中/失手/错误的命令成本、技能费及熟练分母分开', () => {
    const c = pick(), rows = [row(trace(c, { hit: true, cost: 1 })),
        row(trace(c, { hit: false, progress: 0, cost: 23, index: 1 })), error(c, 2)];
    const result = report(c, rows), s = result.conditions[0].taohua_zhuan, e = s.effects;
    assert.equal(s.commands.accepted_execution_cost.mean, 12);
    assert.equal(e.actor_neili_cost.mean, 200); assert.equal(e.hit.successes, 1); assert.equal(e.hit.trials, 2);
    assert.equal(e.misses, 1); assert.equal(e.learned_progress.rate, 0.5); assert.equal(e.unknown_effect_samples, 1);
    assert.equal(e.ordinary_damage_samples, 1); assert.equal(e.ordinary_qi_damage.mean, 987);
    assert.equal(e.ordinary_qi_wound.mean, 731); assert.equal(e.direct_input.mean, 760);
    assert.equal(e.direct_input.unknown, 1); assert.equal(s.death.samples, 0);
    assert.equal(s.death.target_net_loss.qi.mean, null);
    const md = schoolCombatMarkdown(result);
    assert.match(md, /3\/100 \| 2\/0\/1\/97/); assert.match(md, /12\.00 \[3\.20, 20\.80\]/);
    assert.match(md, /1\/2；50\.00%/); assert.match(md, /原错误 \\\| &lt;详情&gt;<br>第二行/);
    assert.match(md, /987\.00/); assert.match(md, /731\.00/); assert.match(md, /不是实测解除秒数/);
});

test('原die无do_damage/零技能费；气血归1、惩罚与奖励独立且保留精确尸体物权', () => {
    const c = pick('max-ratio4001'), rows = [row(trace(c, { cost: 476 }))];
    const result = report(c, rows), s = result.conditions[0].taohua_zhuan, e = s.effects, d = s.death;
    assert.equal(e.hit.rate, 1); assert.equal(e.direct_death.rate, 1);
    assert.equal(e.ordinary_damage_samples, 0); assert.equal(e.ordinary_qi_damage.mean, null);
    assert.equal(e.direct_input.n, 0); assert.equal(e.direct_input.unknown, 1);
    assert.equal(e.actor_neili_cost.mean, 0); assert.equal(s.commands.accepted_execution_cost.mean, 476);
    assert.equal(d.samples, 1);
    assert.deepEqual(Object.fromEntries(Object.entries(d.target_net_loss).map(([k, v]) => [k, v.mean])),
        { qi: 99999, eff_qi: 99999, jing: 99999, eff_jing: 99999, neili: 0,
            max_neili: 20, combat_exp: 3000000, potential: 500 });
    assert.deepEqual(Object.fromEntries(Object.entries(d.killer_delta).map(([k, v]) => [k, v.mean])),
        { pks: 1, wanted_pks: 0, experience: 0 });
    assert.equal(d.ownership[0].corpse, rows[0].raw.dropped[0].object);
    assert.equal(d.ownership[0].weapon.object, rows[0].raw.before[1].weapon_details.object);
    assert.equal(d.ownership[0].weapon.environment, d.ownership[0].corpse);
    assert.equal(d.ownership[0].weapon.equipped, null); assert.equal(d.ownership[0].target_environment, '/d/death/gate');
    const md = schoolCombatMarkdown(result);
    assert.match(md, /没有公共直伤调用、技能内力费用为 0/);
    assert.match(md, /99999\.00\/99999\.00\/99999\.00\/99999\.00\/0\.00/);
    assert.match(md, /20\.00\/3000000\.00\/500\.00/); assert.match(md, /1\.00\/0\.00\/0\.00/);
    assert.match(md, /未观察（n=0，未知=1）/); assert.match(md, /死亡结算，不是普通招式伤害/);
    s.death.ownership[0].weapon.object = '/mutated-report';
    assert.equal(rows[0].raw.zhuan_death.weapon.object, '/tests/sword#201', '报告不能反向改写原物');
});

test('两倍内力边界仍为普通损伤，不从最大内力自行推断直接死亡', () => {
    for (const tag of ['max-ratio3999', 'max-ratio4000']) {
        const c = pick(tag), s = taohuaZhuanReport([row(trace(c))], c);
        assert.equal(s.death.samples, 0); assert.equal(s.effects.direct_death.successes, 0);
        assert.equal(s.effects.ordinary_damage_samples, 1); assert.equal(s.effects.actor_neili_cost.mean, 200);
        assert.equal(s.death.target_net_loss.max_neili.mean, null);
    }
});

test('错误/缺样本/全拒绝保留未知，原命令0仅表示拒绝', () => {
    for (const rows of [[], [error(pick())]]) {
        const s = taohuaZhuanReport(rows, pick());
        assert.equal(s.effects.hit.rate, null); assert.equal(s.effects.direct_death.rate, null);
        assert.equal(s.effects.actor_neili_cost.mean, null); assert.equal(s.death.killer_delta.pks.mean, null);
        assert.equal(s.missing, 100 - rows.length); assert.equal(s.commands.accepted_execution_cost.n, 0);
        const md = schoolCombatMarkdown(report(pick(), rows));
        assert.match(md, /未知（分母0）/); assert.doesNotMatch(md, /0\/0；0\.00%/);
    }
    const c = pick('no-grant'), rows = [row(trace(c))], s = taohuaZhuanReport(rows, c);
    assert.equal(s.effects.refused_samples, 1); assert.equal(s.effects.accepted_samples, 0);
    assert.equal(s.commands.refused_execution_cost.mean, 0); assert.equal(s.effects.actor_neili_cost.mean, null);
    assert.equal(s.refusals[0].reason, rows[0].reason);
});

test('统计封装/raw条件、索引、结果和理由同源，错误亦不豁免', () => {
    const c = pick();
    for (const original of [row(trace(c)), error(c)]) {
        for (const mutate of [r => delete r.condition_id, r => r.condition_id = 'foreign',
            r => r.raw.condition_id = 'foreign', r => r.raw.method = 'attack', r => delete r.index,
            r => r.index = -1, r => r.index = c.samples, r => r.index = 0.5, r => r.raw.index = 1,
            r => r.outcome = 'not_applicable', r => r.raw.outcome = 'refused', r => delete r.reason,
            r => r.reason = null, r => r.raw.reason = 'foreign']) {
            const bad = structuredClone(original); mutate(bad);
            assert.throws(() => taohuaZhuanReport([bad], c));
        }
        assert.throws(() => taohuaZhuanReport([original, structuredClone(original)], c));
    }
    const bad = error(c); bad.reason = ''; bad.raw.reason = '';
    assert.throws(() => taohuaZhuanReport([bad], c));
});

test('死亡的缺失/null数字与错误尸体归属不能被报告填零或改写', () => {
    const c = pick('max-ratio4001');
    for (const mutate of [r => delete r.zhuan_death, r => r.zhuan_death = null,
        r => delete r.zhuan_death.killer_pks_delta, r => r.zhuan_death.killer_pks_delta = null,
        r => delete r.immediate[1].potential, r => r.immediate[1].max_neili = null,
        r => r.zhuan_death.weapon.environment = '/tests/runner', r => r.zhuan_death.weapon.object = '/other',
        r => r.zhuan_death.corpse = '/clone/misc/corpse#999', r => delete r.zhuan_death.weapon.equipped,
        r => r.zhuan_death.weapon.equipped = 'wielded', r => r.terminals = [], r => r.dropped = []]) {
        const raw = trace(c); mutate(raw); raw.after = structuredClone(raw.immediate);
        const saved = JSON.stringify(raw);
        assert.throws(() => taohuaZhuanReport([row(raw)], c)); assert.equal(JSON.stringify(raw), saved);
    }
});

test('报告必须走原效果校验；普通损伤/扣费/原顺序坏值不隐藏', () => {
    const c = pick();
    for (const mutate of [r => delete r.metrics, r => r.metrics[0] = null,
        r => delete r.before[0].skill_order, r => r.directs[0].actor = 1,
        r => r.metrics[1].qi_cost++, r => r.command_accepted = null, r => r.command_accepted = 0,
        r => r.immediate[0].learned[skill] = 2]) {
        const raw = trace(c); mutate(raw); raw.after = structuredClone(raw.immediate);
        assert.throws(() => taohuaZhuanReport([row(raw)], c));
    }
    const raw = trace(c), prior = JSON.stringify(raw);
    const plain = taohuaZhuanReport([row(raw)], c);
    raw.parameters = { actor: { skills: { finger: 99999 } }, expected: 'refused' };
    assert.deepEqual(taohuaZhuanReport([row(raw)], c), plain);
    delete raw.parameters; assert.equal(JSON.stringify(raw), prior);
});

test('Markdown专节不误入普通伤害通表，不把直接死亡当普攻/复活观察', () => {
    for (const c of [pick(), pick('max-ratio4001'), pick('no-grant')]) {
        const result = report(c, [row(trace(c))]);
        // Sides remain available in JSON; the dedicated Markdown must not need them.
        result.conditions[0].sides = null;
        const md = schoolCombatMarkdown(result);
        const split = md.indexOf('## 桃花岛·弹指神通「转乾坤」'); assert.ok(split > 0);
        assert.equal(md.slice(0, split).includes('| ' + c.id + ' |'), false);
        assert.equal(md.split('| ' + c.id + ' |').length - 1, 3);
        assert.match(md, /同步窗口未观察复活或自然后续/); assert.match(md, /净差不冒充单向技能伤害/);
    }
});
