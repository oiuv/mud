import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaXiaoConditions, taohuaXiaoFixtureRequirements, taohuaXiaoSourcePaths,
    validateTaohuaXiaoRecord, taohuaXiaoEffects } from './school_taohua_xiao_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value)
    ? value : JSON.stringify(value)).digest('hex');
// Only two explicit game files are lexed, not a full inventory or a historical data import.
const skills = ['tanzhi-shentong', 'tanzhi-shentong/xiao'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', source = readFileSync(join(root, path), 'utf8');
    const parsed = scanSource(source);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: parsed.functions.filter(fn => fn.name === 'perform')
        .map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'perform' })) };
});
const catalog = { skills }, cases = taohuaXiaoConditions(catalog), smoke = taohuaXiaoConditions(catalog, { smoke: true });
const skill = 'tanzhi-shentong', grant = 'can_perform/tanzhi-shentong/xiao';
const pick = (tag = 'baseline', level = 200) => {
    const c = cases.find(item => item.id === `school-taohua-xiao-l${level}-${tag}`);
    assert.ok(c, tag); return c;
};

function snapshot(cfg, side, fighting) {
    const equipped = !!cfg.equipment, apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    const fields = Object.entries(cfg.properties);
    return { ...Object.fromEntries(fields.filter(([key]) => !key.includes('/'))),
        cultivation: Object.fromEntries(fields.filter(([key]) => key.includes('/'))),
        object: '/tests/actor#' + (side + 100), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: Number(fighting), busy: null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), learned: {}, temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0, weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { program: '/tests/sword', object: '/tests/sword#' + (side + 200),
            skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100, material: null } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

// Deliberately synthetic data for the independent validator only: never written to a sample ledger.
function trace(condition, { hit, damage, progress } = {}) {
    const p = condition.parameters;
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 });
        preparation.after = structuredClone(before[1]);
    }
    const accepted = p.expected === 'observed';
    const raw = { kind: 'sample', condition_id: condition.id, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        command_accepted: Number(accepted), launches: [], refusals: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [], callbacks: [],
        elapsed: 0.01, reason: '', ...(preparation ? { preparation } : {}) };
    if (accepted) {
        hit ??= p.gate_expectation !== 'miss';
        raw.launches.push({ actor: before[0].object, skill, argument: 'xiao right' });
        raw.metrics[0].ability_launched = 1;
        raw.immediate[0].busy = hit ? 3 : 4;
        if (hit) {
            const ap = Math.trunc(p.actor.skills.finger / 2) + p.actor.skills[skill];
            damage ??= ap;
            const jing = Math.trunc(4 * damage / 3), wound = Math.trunc(damage / 3), gross = 3 * damage;
            const correction = Math.max(gross - p.target.properties.neili, 0);
            raw.metrics[1] = { jing_cost: jing, eff_jing_cost: wound, neili_cost: gross, neili_recovery: correction };
            raw.immediate[1].jing -= jing; raw.immediate[1].eff_jing -= wound;
            raw.immediate[1].neili = Math.max(p.target.properties.neili - gross, 0);
        }
        progress ??= 1;
        if (progress) raw.immediate[0].learned[skill] = progress;
    } else {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals.push({ actor: before[0].object, reason: raw.reason });
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}
function mutate(condition, operation, options) {
    const raw = trace(condition, options); operation(raw); raw.after = structuredClone(raw.immediate);
    assert.throws(() => validateTaohuaXiaoRecord(raw, condition));
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });

test('两侧普通攻防计数必须为零，稀疏缺项不放宽显式非零或坏值', () => {
    const condition = pick();
    for (const side of [0, 1]) for (const key of ['hit', 'dodge', 'parry']) {
        const valid = trace(condition); valid.metrics[side][key] = 0;
        validateTaohuaXiaoRecord(valid, condition);
        for (const value of [1, -1, null, undefined, true, '', [], {}, 0.5])
            mutate(condition, raw => { raw.metrics[side][key] = value; });
    }
});

test('单命令正执行成本1/23/476均受理，统计不累加成本且原记录不改写', () => {
    for (const condition of cases.filter(item => item.parameters.expected === 'observed')) {
        const records = [1, 23, 476].map(cost => {
            const raw = trace(condition); raw.command_accepted = cost; return raw;
        });
        const before = records.map(raw => JSON.stringify(raw));
        for (const raw of records) assert.equal(validateTaohuaXiaoRecord(raw, condition).accepted, true);
        const wrap = raw => ({ condition_id: condition.id, outcome: raw.outcome, raw });
        assert.deepEqual(taohuaXiaoEffects(records.map(wrap), condition),
            taohuaXiaoEffects(records.map(raw => wrap({ ...raw, command_accepted: 1 })), condition));
        assert.deepEqual(records.map(raw => JSON.stringify(raw)), before, '原成本不可归一化或回填');
    }
});

test('命令成本必须显式非负安全整数，拒绝只允许0且不能以缺值冒充', () => {
    const invalid = [undefined, null, false, true, '1', {}, [], -1, 0.5, NaN, Infinity,
        Number.MAX_SAFE_INTEGER + 1];
    for (const condition of cases) {
        const missing = trace(condition); delete missing.command_accepted;
        assert.throws(() => validateTaohuaXiaoRecord(missing, condition), condition.id);
        for (const cost of invalid) {
            const raw = trace(condition); raw.command_accepted = cost;
            assert.throws(() => validateTaohuaXiaoRecord(raw, condition), condition.id + ': ' + String(cost));
        }
        if (condition.parameters.expected === 'observed') {
            const raw = trace(condition); raw.command_accepted = 0;
            assert.throws(() => validateTaohuaXiaoRecord(raw, condition), '已受理不可记0成本');
        } else {
            const zero = trace(condition); zero.command_accepted = 0;
            assert.equal(validateTaohuaXiaoRecord(zero, condition).accepted, false);
            for (const cost of [1, 23, 476]) {
                const raw = trace(condition); raw.command_accepted = cost;
                assert.throws(() => validateTaohuaXiaoRecord(raw, condition), '拒绝不可记正成本');
            }
        }
    }
});

test('固定17条件／720正式／34烟雾，烟雾仅改次数，自检不冒充实际采集', () => {
    assert.equal(cases.length, 17); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 720);
    assert.equal(smoke.length, 17); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 34);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 9);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').reduce((n, c) => n + c.samples, 0), 702);
    assert.equal(new Set(cases.map(c => c.id)).size, 17);
    assert.deepEqual(cases.map(({ samples, ...c }) => c), smoke.map(({ samples, ...c }) => c));
    assert.equal(hash(cases), 'e6852c55078ec1899c9981b3f259d6f2633e8f5d668ea4fb298cc3e37bd2539d');
    assert.equal(hash(smoke), 'fb35782bfa6fbeb886ddf1918d2db2555a63133a1d4205fd73630ac5d54590e4');
    for (const c of cases) {
        assert.equal(c.entry_id, 'kungfu/skill/tanzhi-shentong/xiao.c:8:perform');
        assert.equal(c.parameters.action, 'perform finger.xiao right');
        assert.equal(c.parameters.named_participants, true); assert.equal(c.parameters.observe_seconds, 0);
        assert.deepEqual(c.parameters.qualification_sources, taohuaXiaoSourcePaths);
    }
    assert.equal(taohuaXiaoFixtureRequirements.length, 7);
});

test('六条关键来源固定在c44de8基线且资格链均为存在的游戏源文件', () => {
    const sources = {
        'kungfu/skill/tanzhi-shentong.c': '23b04a8fe57b58d944011d8cce26f9e2afe2228ce2324421586a2183534ece1f',
        'kungfu/skill/tanzhi-shentong/xiao.c': '0ddd6ce7977822f455c942a6adbee7359ece66baf541fbda22f7bb85d911eddb',
        'kungfu/class/taohua/huang.c': 'f5f2ad95ea9bf005b288d81ae9a67457d780b350dbf45865d66c08ec81b9af1e',
        'feature/skill.c': '99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
        'feature/damage.c': '1a57abfa577c4043909cf6f443fd070fb51b3128c4e33ed070809862db200a53',
        'cmds/skill/perform.c': '7bb9b93d1ce1bccf5587c942f2d7c30c8f3e1b5cb96c25719e0aef1032d20054',
    };
    for (const path of taohuaXiaoSourcePaths) {
        const bytes = readFileSync(join(root, path));
        assert.ok(bytes.length > 0); if (sources[path]) assert.equal(hash(bytes), sources[path], path);
    }
});

test('条件只含原真实技能与资格；单个变化边界不扩成全排列', () => {
    const base = pick().parameters;
    assert.deepEqual(base.actor.skills, { finger: 200, [skill]: 200, 'jingluo-xue': 200, force: 200, 'bibo-shengong': 200 });
    assert.equal(base.actor.properties.max_neili, 3000); assert.equal(base.actor.properties.neili, 800);
    assert.equal(base.actor.properties[grant], 1); assert.equal(base.actor.properties.dex, 34);
    assert.equal(base.target.skills.force, 600);
    assert.equal(pick('force298').parameters.target.skills.force / 2, 149);
    assert.equal(pick('force898').parameters.target.skills.force / 2, 449);
    for (const n of [0, 899, 900]) {
        const p = pick('target-neili' + n).parameters;
        const expected = structuredClone(pick('force298').parameters.target); expected.properties.neili = n;
        assert.deepEqual(p.target, expected); assert.deepEqual(p.actor, base.actor);
    }
    for (const c of cases) {
        assert.equal(c.parameters.actor.skills['martial-cognize'], undefined);
        assert.equal(c.parameters.actor.properties.jiali, 0);
    }
});

test('未知原来源及非法样本数不生成条件', () => {
    for (const samples of [0, -1, 0.5, NaN, Infinity, '100']) assert.throws(() => taohuaXiaoConditions(catalog, { samples }));
    assert.throws(() => taohuaXiaoConditions({ skills: [] }));
    for (const operation of [c => c.skills[1].entries = [], c => c.skills[1].path = 'fake.c',
        c => c.skills[0].sha256 = 'not-a-sha']) {
        const invalid = structuredClone(catalog); operation(invalid); assert.throws(() => taohuaXiaoConditions(invalid));
    }
});

test('17个合成即时契约逐条通过；它们不是实测记录', () => {
    for (const c of cases) {
        const original = trace(c), bytes = JSON.stringify(original);
        const result = validateTaohuaXiaoRecord(original, c);
        assert.equal(result.accepted, c.parameters.expected === 'observed');
        assert.equal(JSON.stringify(original), bytes, '校验不回写原件');
        assert.equal(Object.hasOwn(original, 'parameters'), false);
    }
});

test('命中和失手均受理；忙乱为原整数而不是自然耗时', () => {
    for (const level of [200, 400]) for (const hit of [true, false]) {
        const result = validateTaohuaXiaoRecord(trace(pick('baseline', level), { hit }), pick('baseline', level));
        assert.equal(result.accepted, true); assert.equal(result.hit, hit); assert.equal(result.busy, hit ? 3 : 4);
        assert.equal(result.damage_draw === null, !hit);
    }
    mutate(pick(), r => r.immediate[0].busy = 2);
    mutate(pick(), r => r.command_accepted = 0);
    mutate(pick(), r => r.outcome = 'refused');
    mutate(pick(), r => r.launches[0].argument = 'xiao');
    mutate(pick(), r => r.launches[0].actor = r.before[1].object);
});

test('原比较的可达边界，而非预计随机频次', () => {
    assert.throws(() => validateTaohuaXiaoRecord(trace(pick('force298'), { hit: false }), pick('force298')));
    assert.throws(() => validateTaohuaXiaoRecord(trace(pick('force898'), { hit: true }), pick('force898')));
    assert.throws(() => validateTaohuaXiaoRecord(trace(pick('baseline', 800), { hit: false }), pick('baseline', 800)));
    const c = pick();
    const allMiss = Array.from({ length: 100 }, () => row(trace(c, { hit: false, progress: 0 })));
    const allHit = Array.from({ length: 100 }, () => row(trace(c, { hit: true, progress: 1 })));
    assert.equal(taohuaXiaoEffects(allMiss, c).hit.rate, 0);
    assert.equal(taohuaXiaoEffects(allHit, c).hit.rate, 1);
});

test('整数D支持区间与精神伤害/创伤分别截断，max_jing不改', () => {
    for (const level of [200, 400, 800]) {
        const c = pick('baseline', level), ap = level / 2 + level;
        for (const damage of [ap, ap + 1, ap + 2, 2 * ap - 1]) {
            const result = validateTaohuaXiaoRecord(trace(c, { damage }), c);
            assert.equal(result.damage_draw, damage); assert.equal(result.jing_damage, Math.trunc(4 * damage / 3));
            assert.equal(result.jing_wound, Math.trunc(damage / 3));
        }
        for (const damage of [ap - 1, 2 * ap]) assert.throws(() => validateTaohuaXiaoRecord(trace(c, { damage }), c));
        mutate(c, r => r.immediate[1].max_jing--);
        mutate(c, r => { r.metrics[1].eff_jing_cost++; r.immediate[1].eff_jing--; });
        mutate(c, r => { r.metrics[1].jing_cost++; r.immediate[1].jing--; });
    }
});

test('目标内力0/899/900：毛扣、归零修正和净差不是同一个量', () => {
    for (const neili of [0, 899, 900]) for (const damage of [300, 301, 599]) {
        const c = pick('target-neili' + neili), result = validateTaohuaXiaoRecord(trace(c, { damage }), c);
        assert.equal(result.target_neili_gross_cost, 3 * damage);
        assert.equal(result.target_neili_zero_correction, 3 * damage - Math.min(neili, 3 * damage));
        assert.equal(result.target_neili_net_loss, Math.min(neili, 3 * damage));
        assert.equal(result.target_neili_remaining, 0); assert.equal(result.actor_neili_cost, 0);
    }
    const zero = validateTaohuaXiaoRecord(trace(pick('target-neili0')), pick('target-neili0'));
    assert.equal(zero.target_neili_gross_cost, 900); assert.equal(zero.target_neili_net_loss, 0);
});

test('相同净差不能掩盖虚构毛扣/恢复或施术者收费', () => {
    mutate(pick('target-neili0'), r => { r.metrics[1].neili_cost = 0; r.metrics[1].neili_recovery = 0; });
    mutate(pick('target-neili899'), r => { r.metrics[1].neili_cost += 3; r.metrics[1].neili_recovery += 3; });
    mutate(pick(), r => { r.metrics[0].neili_cost = 800; r.metrics[0].neili_recovery = 800; });
    mutate(pick(), r => { r.metrics[1].jing_cost++; r.metrics[1].jing_recovery = 1; });
    mutate(pick(), r => r.metrics[1].neili_cost = null);
    mutate(pick(), r => { r.metrics[1].neili_cost++; r.immediate[1].neili--; });
});

test('九种原拒绝无发动/忙乱/损伤/熟练，拒绝正文必须同源', () => {
    for (const c of cases.filter(item => item.parameters.expected === 'refused')) {
        const result = validateTaohuaXiaoRecord(trace(c), c);
        assert.equal(result.accepted, false); assert.equal(result.hit, null);
        assert.equal(result.jing_damage, 0); assert.equal(result.target_neili_gross_cost, 0);
        assert.equal(result.learned_delta, 0);
        mutate(c, r => { r.immediate[0].learned[skill] = 1; });
        mutate(c, r => { r.reason = '别的拒绝\n'; r.refusals[0].reason = r.reason; });
        mutate(c, r => { r.metrics[1].jing_cost = 1; r.immediate[1].jing--; });
    }
});

test('原准备昏迷与测量终态/扣费隔离；缺证据不补正常状态', () => {
    const c = pick('unconscious-target'), original = trace(c);
    assert.equal(validateTaohuaXiaoRecord(original, c).accepted, false);
    for (const operation of [r => delete r.preparation, r => r.preparation = null,
        r => r.preparation.terminals = [], r => r.preparation.terminals[0].side = 0,
        r => r.preparation.before.living = 0, r => r.preparation.before.object = r.before[0].object,
        r => r.preparation.before.jing = 0, r => r.preparation.after.jing = 1,
        r => r.terminals = structuredClone(r.preparation.terminals),
        r => { r.metrics[1].jing_cost = 10000; r.metrics[1].jing_recovery = 10000; }]) mutate(c, operation);
});

test('身份/缺键/显式零或null分别检查，不宽松接受未知', () => {
    const c = pick('no-grant');
    for (const value of [0, null]) {
        const raw = trace(c); raw.before[0].cultivation[grant] = value;
        raw.immediate[0].cultivation[grant] = value; raw.after = structuredClone(raw.immediate);
        assert.equal(validateTaohuaXiaoRecord(raw, c).accepted, false);
    }
    for (const value of [undefined, false, '', '0', [], {}]) mutate(c, r => {
        r.before[0].cultivation[grant] = value; r.immediate[0].cultivation[grant] = value;
    });
    mutate(c, r => { delete r.before[0].cultivation[grant]; delete r.immediate[0].cultivation[grant]; });
    for (const value of [undefined, false, '', '0', -1, 0.5, {}]) mutate(pick(), r => r.before[0].busy = value);
    for (const key of ['interactive', 'userp', 'playerp']) mutate(pick(), r => r.before[0][key] = 0);
    mutate(pick(), r => delete r.before[1].fighting_opponent);
    mutate(pick(), r => delete r.before[0].secondary_weapon);
    mutate(pick(), r => r.before[1].neili = null);
});

test('原技能/装备/有效等级及临时加成不允许悄悄漂移', () => {
    for (const operation of [r => r.before[0].effective_skills.finger++,
        r => r.before[1].effective_skills.force++, r => r.immediate[0].skills[skill]++,
        r => r.immediate[0].temp.apply.finger = 1, r => r.before[0].temp.apply = null,
        r => r.before[1].weapon_details.object = '/tests/sword#bad',
        r => r.before[1].weapon_details.weight = 2999, r => r.before[1].weapon_details.damage = 49,
        r => r.before[1].weapon_details.consistence = 99,
        r => r.immediate[1].weapon_details.consistence--,
        r => r.immediate[1].weapon_details.object = '/tests/sword#999',
        r => r.before[0].secondary_weapon = 'sword']) mutate(pick(), operation);
});

test('原命令熟练增长0/1与命中独立，不强制随机频次、不偷升等级', () => {
    for (const hit of [true, false]) for (const progress of [0, 1]) {
        const c = pick(); assert.equal(validateTaohuaXiaoRecord(trace(c, { hit, progress }), c).learned_delta, progress);
    }
    for (const level of [400, 800]) assert.throws(() =>
        validateTaohuaXiaoRecord(trace(pick('baseline', level), { progress: 0 }), pick('baseline', level)));
    for (const operation of [r => r.immediate[0].learned[skill] = 2,
        r => r.immediate[0].learned[skill] = -1, r => r.immediate[0].learned[skill] = null,
        r => r.immediate[0].learned = [], r => delete r.immediate[0].learned,
        r => r.immediate[0].learned.finger = 1, r => r.immediate[1].learned.force = 1]) mutate(pick(), operation);
});

test('单次即时记录不接入后续心跳/普通攻击/COMBAT直伤/自然计时', () => {
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'dropped', 'terminals', 'callbacks']) {
        mutate(pick(), r => r[key] = [{}]); mutate(pick(), r => delete r[key]);
    }
    for (const key of ['direct', 'heartbeats', 'quick', 'riposte']) mutate(pick(), r => r.metrics[0][key] = 1);
    for (const key of ['actions', 'directs']) mutate(pick(), r => r[key] = [{}]);
    const raw = trace(pick()); raw.after[0].busy = 2;
    assert.throws(() => validateTaohuaXiaoRecord(raw, pick()));
});

test('统计只用冻结condition及原件：命中分母为受理，不是720计划或直接攻击数', () => {
    const c = pick(), hit = trace(c, { damage: 300, progress: 1 }), miss = trace(c, { hit: false, progress: 0 });
    hit.parameters = { level: 9999, target: { properties: { neili: 0 } } };
    const result = taohuaXiaoEffects([row(hit), row(miss)], c);
    assert.equal(result.samples, 2); assert.equal(result.accepted_samples, 2);
    assert.deepEqual(result.counts, { observed: 2, refused: 0, error: 0, not_applicable: 0 });
    assert.equal(result.hit.trials, 2); assert.equal(result.hit.successes, 1);
    assert.equal(result.hit.rate, 0.5); assert.equal(result.misses, 1);
    assert.equal(result.damage_draw.n, 1); assert.equal(result.damage_draw.unknown, 1);
    assert.equal(result.damage_draw.mean, 300); assert.equal(result.jing_damage.mean, 200);
    assert.equal(result.jing_wound.mean, 50); assert.equal(result.target_neili_gross_cost.mean, 450);
    assert.equal(result.busy.mean, 3.5); assert.equal(result.learned_progress.rate, 0.5);
    assert.throws(() => taohuaXiaoEffects([row(trace(pick('force298')))], c));
    const rejected = pick('no-grant'), refusal = taohuaXiaoEffects([row(trace(rejected))], rejected);
    assert.equal(refusal.accepted_samples, 0); assert.equal(refusal.refused_samples, 1);
    assert.equal(refusal.hit.trials, 0); assert.equal(refusal.hit.rate, null);
    assert.equal(refusal.jing_damage.mean, null); assert.equal(refusal.actor_neili_cost.n, 0);
});

test('错误样本与空集合保持未知，不伪造零费用或成功率', () => {
    const c = pick(), error = { kind: 'sample', condition_id: c.id, method: c.method, outcome: 'error' };
    const effects = taohuaXiaoEffects([row(error)], c);
    assert.equal(effects.samples, 1); assert.equal(effects.unknown_effect_samples, 1);
    assert.equal(effects.actor_neili_cost.n, 0); assert.equal(effects.actor_neili_cost.mean, null);
    assert.equal(effects.hit.rate, null); assert.equal(effects.learned_progress.rate, null);
    const empty = taohuaXiaoEffects([], c); assert.equal(empty.samples, 0); assert.equal(empty.hit.rate, null);
    assert.throws(() => taohuaXiaoEffects([row({ ...error, outcome: 'not_applicable' })], c));
});
