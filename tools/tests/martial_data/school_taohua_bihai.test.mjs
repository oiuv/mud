import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { taohuaBihaiConditions, taohuaBihaiSourcePaths, taohuaBihaiFixtureRequirements,
    validateTaohuaBihaiRecord, taohuaBihaiEffects } from './school_taohua_bihai_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value)
    ? value : JSON.stringify(value)).digest('hex');
const skills = ['yuxiao-jian', 'yuxiao-jian/bihai'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', bytes = read(path), parsed = scanSource(bytes.toString('utf8'));
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(bytes), entries: parsed.functions.filter(fn => fn.name === 'perform')
        .map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'perform' })) };
});
const catalog = { skills }, cases = taohuaBihaiConditions(catalog, read);
const smoke = taohuaBihaiConditions(catalog, read, { smoke: true });
const skill = 'yuxiao-jian', grant = 'can_perform/yuxiao-jian/bihai';
const pick = (tag = 'baseline', level = 200) => {
    const condition = cases.find(item => item.id === `school-taohua-bihai-l${level}-${tag}`);
    assert.ok(condition, tag); return condition;
};

function item(config, side, slot) {
    if (!config) return {};
    const xiao = config.type === 'xsword';
    return { object: '/tests/' + config.type + '#' + (200 + side * 10 + slot), program: '/tests/' + config.type,
        skill_type: 'sword', weight: 3000, flag: 4, damage: xiao ? 45 : 50, consistence: 100,
        material: null, valid_as_xiao: xiao ? 1 : null, valid_as_xiao_source: xiao ? '/inherit/misc/_xiao' : null };
}
function snapshot(config, side, fighting) {
    const weapon = item(config.equipment, side, 1), handing = item(config.handing_equipment, side, 2);
    const apply = { armor: 100, ...(config.equipment ? { damage: weapon.damage, dodge: -1 } : {}) };
    const properties = Object.entries(config.properties);
    return { ...Object.fromEntries(properties.filter(([key]) => !key.includes('/'))),
        cultivation: Object.fromEntries(properties.filter(([key]) => key.includes('/'))),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: Number(fighting), busy: null,
        skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations), learned: {}, temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: config.equipment ? 'sword' : 'none', weapon_damage: weapon.damage ?? 0,
        weapon_flag: weapon.flag ?? 0, weapon_details: weapon,
        secondary_weapon: 'none', secondary_weapon_details: {},
        handing: config.handing_equipment ? 'sword' : 'none', handing_details: handing };
}

// Synthetic unit-test traces only. Default totals are independent, hand-checked source cases;
// they neither consume driver RNG nor enter a real sample ledger.
function trace(condition, { damage, busy = 2, progress = 1 } = {}) {
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
        damage ??= p.level === 400 ? 1796 : p.level === 800 ? 3593 : {
            force0: 898, force2200: 0, minimum: 283, 'no-music-map': 100, 'target-music400': 140,
        }[p.variant] ?? 315;
        const wound = Math.trunc(2 * damage / 3);
        raw.launches.push({ actor: before[0].object, skill, argument: 'bihai right' });
        raw.metrics[0] = { ability_launched: 1, neili_cost: 200 };
        raw.metrics[1] = { jing_cost: damage, eff_jing_cost: wound };
        raw.immediate[0].busy = busy; raw.immediate[0].neili -= 200;
        raw.immediate[1].jing -= damage; raw.immediate[1].eff_jing -= wound;
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
    assert.throws(() => validateTaohuaBihaiRecord(raw, condition));
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });

test('单命令正执行成本1/23/476均受理，统计不累加成本且原记录不改写', () => {
    for (const condition of cases.filter(item => item.parameters.expected === 'observed')) {
        const records = [1, 23, 476].map(cost => {
            const raw = trace(condition); raw.command_accepted = cost; return raw;
        });
        const before = records.map(raw => JSON.stringify(raw));
        for (const raw of records) assert.equal(validateTaohuaBihaiRecord(raw, condition).accepted, true);
        const wrap = raw => ({ condition_id: condition.id, outcome: raw.outcome, raw });
        assert.deepEqual(taohuaBihaiEffects(records.map(wrap), condition),
            taohuaBihaiEffects(records.map(raw => wrap({ ...raw, command_accepted: 1 })), condition));
        assert.deepEqual(records.map(raw => JSON.stringify(raw)), before, '原成本不可归一化或回填');
    }
});

test('命令成本必须显式非负安全整数，拒绝只允许0且不能以缺值冒充', () => {
    const invalid = [undefined, null, false, true, '1', {}, [], -1, 0.5, NaN, Infinity,
        Number.MAX_SAFE_INTEGER + 1];
    for (const condition of cases) {
        const missing = trace(condition); delete missing.command_accepted;
        assert.throws(() => validateTaohuaBihaiRecord(missing, condition), condition.id);
        for (const cost of invalid) {
            const raw = trace(condition); raw.command_accepted = cost;
            assert.throws(() => validateTaohuaBihaiRecord(raw, condition), condition.id + ': ' + String(cost));
        }
        if (condition.parameters.expected === 'observed') {
            const raw = trace(condition); raw.command_accepted = 0;
            assert.throws(() => validateTaohuaBihaiRecord(raw, condition), '已受理不可记0成本');
        } else {
            const zero = trace(condition); zero.command_accepted = 0;
            assert.equal(validateTaohuaBihaiRecord(zero, condition).accepted, false);
            for (const cost of [1, 23, 476]) {
                const raw = trace(condition); raw.command_accepted = cost;
                assert.throws(() => validateTaohuaBihaiRecord(raw, condition), '拒绝不可记正成本');
            }
        }
    }
});

test('固定23条件／732正式／46烟雾；源路径与JSON矩阵有序冻结', () => {
    assert.equal(cases.length, 23); assert.equal(cases.reduce((n, item) => n + item.samples, 0), 732);
    assert.equal(smoke.length, 23); assert.equal(smoke.reduce((n, item) => n + item.samples, 0), 46);
    assert.equal(cases.filter(item => item.parameters.expected === 'observed').length, 12);
    assert.equal(cases.filter(item => item.parameters.expected === 'refused').length, 11);
    assert.equal(cases.filter(item => item.parameters.expected === 'observed').reduce((n, item) => n + item.samples, 0), 710);
    assert.equal(new Set(cases.map(item => item.id)).size, 23);
    assert.deepEqual(cases.map(({ samples, ...item }) => item), smoke.map(({ samples, ...item }) => item));
    assert.equal(hash(cases), 'd5046d8c95e6a655fccfb0b00c310515e5c192ea77cf9e5f2de9151a5e8b5794');
    assert.equal(hash(smoke), 'f90cc6ab9c72930625e7e814a34e381ffa4fbea7e9b15483cf493f60a8d9b3be');
    assert.equal(taohuaBihaiFixtureRequirements.length, 8);
    for (const condition of cases) {
        assert.equal(condition.entry_id, 'kungfu/skill/yuxiao-jian/bihai.c:8:perform');
        const p = condition.parameters;
        assert.equal(p.action, 'perform sword.bihai right'); assert.equal(p.named_participants, true);
        assert.equal(p.observe_seconds, 0); assert.equal(p.observation, 'single_action_immediate');
        assert.deepEqual(Object.keys(p.source_evidence), taohuaBihaiSourcePaths);
        for (const path of taohuaBihaiSourcePaths) assert.equal(p.source_evidence[path], hash(read(path)), path);
    }
});

test('原来源、入口、SHA和样本参数错误不能生成条件', () => {
    for (const samples of [0, -1, 0.5, NaN, Infinity, '100']) assert.throws(() => taohuaBihaiConditions(catalog, read, { samples }));
    assert.throws(() => taohuaBihaiConditions({ skills: [] }, read));
    assert.throws(() => taohuaBihaiConditions(catalog));
    assert.throws(() => taohuaBihaiConditions(catalog, () => ''));
    for (const operation of [c => c.skills[1].entries = [], c => c.skills[1].path = 'invented.c',
        c => c.skills[0].sha256 = '0'.repeat(64), c => c.skills[1].entries[0].id = 'fake.c:8:perform']) {
        const invalid = structuredClone(catalog); operation(invalid); assert.throws(() => taohuaBihaiConditions(invalid, read));
    }
});

test('有限单变量及最低合法输入，无自动教学、曲谱演奏或四段RNG探针', () => {
    const base = pick().parameters;
    assert.equal(base.actor.properties[grant], 1); assert.equal(base.actor.properties.neili, 10000);
    assert.deepEqual(base.actor.preparations, {});
    assert.deepEqual(base.actor.handing_equipment, { type: 'xsword', hold: true, hand_id: 'practice weapon' });
    assert.equal(base.actor.equipment, undefined);
    for (const [tag, part, key, value] of [
        ['force0', 'target', 'force', 0], ['force2200', 'target', 'force', 2200],
        ['target-music400', 'target', 'chuixiao-jifa', 400], ['yuxiao179', 'actor', skill, 179],
        ['bibo179', 'actor', 'bibo-shengong', 179], ['bihai179', 'actor', 'bihai-chaosheng', 179],
    ]) {
        const expected = structuredClone(base[part]); expected.skills[key] = value;
        assert.deepEqual(pick(tag).parameters[part], expected);
    }
    for (const key of [skill, 'bibo-shengong', 'bihai-chaosheng']) assert.equal(pick('minimum', 180).parameters.actor.skills[key], 180);
    const noMusic = structuredClone(base.actor); delete noMusic.mappings['chuixiao-jifa'];
    assert.deepEqual(pick('no-music-map').parameters.actor, noMusic);
    for (const condition of cases) {
        assert.equal(condition.parameters.actor.skills['martial-cognize'], undefined);
        assert.equal(condition.parameters.actor.properties.jiali, 0);
        assert.equal(condition.parameters.target.equipment, undefined);
    }
});

test('23个合成原记录逐条通过且不回写、没有raw.parameters依赖', () => {
    for (const condition of cases) {
        const raw = trace(condition), bytes = JSON.stringify(raw);
        const result = validateTaohuaBihaiRecord(raw, condition);
        assert.equal(result.accepted, condition.parameters.expected === 'observed');
        assert.equal(JSON.stringify(raw), bytes); assert.equal(Object.hasOwn(raw, 'parameters'), false);
        assert.equal(Object.hasOwn(result, 'stage_hits'), false); assert.equal(Object.hasOwn(result, 'random_draws'), false);
    }
});

test('三档原AP/DP及总损伤整数支持，不把总量冒充四段命中证据', () => {
    for (const [level, ap, low, high] of [[200, 700, 315, 1792], [400, 1400, 1796, 3588], [800, 2800, 3593, 7182]]) {
        const condition = pick('baseline', level);
        for (const damage of [low, low + 1, low + 2, high]) {
            const result = validateTaohuaBihaiRecord(trace(condition, { damage }), condition);
            assert.equal(result.ap, ap); assert.equal(result.dp, 600);
            assert.equal(result.jing_damage, damage); assert.equal(result.jing_wound, Math.trunc(2 * damage / 3));
        }
        for (const damage of [0, low - 1, high + 1]) assert.throws(() =>
            validateTaohuaBihaiRecord(trace(condition, { damage }), condition));
    }
    assert.equal(validateTaohuaBihaiRecord(trace(pick('minimum', 180)), pick('minimum', 180)).ap, 630);
    assert.equal(validateTaohuaBihaiRecord(trace(pick('no-music-map')), pick('no-music-map')).ap, 500);
    assert.equal(validateTaohuaBihaiRecord(trace(pick('target-music400')), pick('target-music400')).dp, 700);
});

test('保证全成/总空及总量不连续区间；合法随机分布不设频次门槛', () => {
    const success = pick('force0'), zero = pick('force2200');
    for (const damage of [898, 899, 1792]) assert.equal(validateTaohuaBihaiRecord(trace(success, { damage }), success).positive_effect, true);
    for (const damage of [0, 897, 1793]) assert.throws(() => validateTaohuaBihaiRecord(trace(success, { damage }), success));
    const noEffect = validateTaohuaBihaiRecord(trace(zero), zero);
    assert.equal(noEffect.accepted, true); assert.equal(noEffect.positive_effect, false);
    assert.equal(noEffect.actor_neili_cost, 200);
    assert.throws(() => validateTaohuaBihaiRecord(trace(zero, { damage: 1 }), zero));
    const mixed = pick('no-music-map');
    for (const damage of [0, 100, 101, 779]) validateTaohuaBihaiRecord(trace(mixed, { damage }), mixed);
    for (const damage of [1, 99, 780]) assert.throws(() => validateTaohuaBihaiRecord(trace(mixed, { damage }), mixed));
    assert.equal(taohuaBihaiEffects(Array.from({ length: 100 }, () => row(trace(mixed, { damage: 0 }))), mixed).positive_effect.rate, 0);
    assert.equal(taohuaBihaiEffects(Array.from({ length: 100 }, () => row(trace(mixed, { damage: 100 }))), mixed).positive_effect.rate, 1);
});

test('受理固定200费及忙乱1/2/3，与正伤/零伤和原熟练相互独立', () => {
    for (const condition of [pick(), pick('force2200'), pick('neili300')]) for (const busy of [1, 2, 3]) {
        const result = validateTaohuaBihaiRecord(trace(condition, { busy }), condition);
        assert.equal(result.busy, busy); assert.equal(result.actor_neili_cost, 200); assert.equal(result.target_neili_cost, 0);
    }
    assert.equal(trace(pick('neili300')).immediate[0].neili, 100);
    for (const busy of [0, 4, 1.5, '2', null]) assert.throws(() => validateTaohuaBihaiRecord(trace(pick(), { busy }), pick()));
    for (const operation of [r => { r.metrics[0].neili_cost = 199; r.immediate[0].neili++; },
        r => { r.metrics[0].neili_cost++; r.metrics[0].neili_recovery = 1; },
        r => { r.metrics[1].neili_cost = 1; r.immediate[1].neili--; },
        r => { r.metrics[1].jing_cost++; r.metrics[1].jing_recovery = 1; },
        r => r.metrics[0].neili_cost = null, r => delete r.metrics[0].neili_cost]) mutate(pick(), operation);
});

test('原精神damage与2/3创伤分别计量，气血及max_jing不变', () => {
    for (const damage of [315, 316, 317]) {
        const raw = trace(pick(), { damage }), result = validateTaohuaBihaiRecord(raw, pick());
        assert.equal(raw.immediate[1].jing, 100000 - damage);
        assert.equal(raw.immediate[1].eff_jing, 100000 - Math.trunc(2 * damage / 3));
        assert.equal(result.jing_wound, Math.trunc(2 * damage / 3));
        assert.equal(raw.immediate[1].max_jing, 100000);
    }
    for (const operation of [r => { r.metrics[1].eff_jing_cost++; r.immediate[1].eff_jing--; },
        r => r.immediate[1].max_jing--, r => { r.metrics[1].qi_cost = 1; r.immediate[1].qi--; },
        r => { r.metrics[0].jing_cost = 1; r.immediate[0].jing--; },
        r => { r.metrics[1].eff_jing_cost++; r.metrics[1].eff_jing_recovery = 1; }]) mutate(pick(), operation);
});

test('真实XSWORD折算45及手持优先/主手回退，不给普通剑伪造箫功能', () => {
    for (const tag of ['baseline', 'valid-hand-invalid-primary', 'invalid-hand-valid-primary', 'primary-only']) {
        const c = pick(tag), result = validateTaohuaBihaiRecord(trace(c), c);
        assert.equal(result.accepted, true); assert.equal(result.ap, 700);
    }
    for (const tag of ['invalid-hand-only', 'invalid-primary-only', 'no-instrument'])
        assert.equal(validateTaohuaBihaiRecord(trace(pick(tag)), pick(tag)).accepted, false);
    for (const [tag, slot, damage] of [['baseline', 'handing', 45], ['primary-only', 'weapon', 45],
        ['valid-hand-invalid-primary', 'weapon', 50], ['invalid-hand-valid-primary', 'handing', 50]]) {
        const c = pick(tag); assert.equal(trace(c).before[0][slot + '_details'].damage, damage);
        mutate(c, r => r.before[0][slot + '_details'].damage++);
        mutate(c, r => r.before[0][slot + '_details'].program = '/tests/forged');
        mutate(c, r => r.immediate[0][slot + '_details'].object = '/tests/xsword#999');
        mutate(c, r => r.immediate[0][slot + '_details'].consistence--);
    }
    mutate(pick(), r => r.before[0].handing_details.damage = 50);
    mutate(pick(), r => r.before[0].handing_details.valid_as_xiao_source = '/tests/xsword');
    mutate(pick(), r => r.before[0].temp.apply.damage = 45);
    mutate(pick('primary-only'), r => r.before[0].temp.apply.dodge = 0);
    mutate(pick('invalid-hand-only'), r => r.before[0].handing_details.valid_as_xiao = 1);
    mutate(pick('valid-hand-invalid-primary'), r => r.before[0].weapon_details.object = r.before[0].handing_details.object);
});

test('明确不存在函数的0/null与缺键、假值分开；普通剑不能继承箫来源', () => {
    const condition = pick('invalid-hand-only');
    for (const value of [0, null]) {
        const raw = trace(condition);
        for (const phase of ['before', 'immediate', 'after']) for (const key of ['valid_as_xiao', 'valid_as_xiao_source'])
            raw[phase][0].handing_details[key] = value;
        validateTaohuaBihaiRecord(raw, condition);
    }
    for (const key of ['valid_as_xiao', 'valid_as_xiao_source']) {
        for (const value of [undefined, '', false, '0', [], {}, 1]) mutate(condition, r => r.before[0].handing_details[key] = value);
        mutate(condition, r => delete r.before[0].handing_details[key]);
    }
    mutate(pick(), r => delete r.before[0].handing_details.valid_as_xiao);
    mutate(pick(), r => r.before[0].handing_details.valid_as_xiao = 0);
});

test('11种原拒绝：含公共无激发原串，不假装进入能力门禁', () => {
    for (const condition of cases.filter(item => item.parameters.expected === 'refused')) {
        const raw = trace(condition), result = validateTaohuaBihaiRecord(raw, condition);
        assert.equal(result.accepted, false); assert.equal(result.positive_effect, null);
        assert.equal(result.jing_damage, 0); assert.equal(result.actor_neili_cost, 0);
        assert.equal(result.busy, 0); assert.equal(result.learned_delta, 0);
        mutate(condition, r => { r.immediate[0].learned[skill] = 1; });
        mutate(condition, r => { r.metrics[0].neili_cost = 200; r.immediate[0].neili -= 200; });
        mutate(condition, r => { r.reason = '另一个拒绝\n'; r.refusals[0].reason = r.reason; });
    }
    assert.equal(pick('no-sword-map').parameters.refusal, '你现在的(sword)中并没有这种外功。\n');
    assert.equal(pick('yuxiao179').parameters.refusal.includes('不够, 难以'), true);
});

test('原昏迷准备独立保留，缺证据不按正常初态或本招伤害补值', () => {
    const condition = pick('unconscious-target'); validateTaohuaBihaiRecord(trace(condition), condition);
    for (const operation of [r => delete r.preparation, r => r.preparation = null,
        r => r.preparation.terminals = [], r => r.preparation.terminals[0].side = 0,
        r => r.preparation.before.living = 0, r => r.preparation.before.object = r.before[0].object,
        r => r.preparation.before.jing = 0, r => r.preparation.after.jing = 1,
        r => r.terminals = structuredClone(r.preparation.terminals),
        r => { r.metrics[1].jing_cost = 100000; r.metrics[1].jing_recovery = 100000; }]) mutate(condition, operation);
});

test('真实USER、装备、原技能和有效等级不变，不默认未知资格已满足', () => {
    for (const operation of [r => r.before[0].interactive = 0, r => r.before[0].userp = 0,
        r => r.before[0].playerp = 0, r => r.before[0].wizardp = 1,
        r => r.before[0].effective_skills['chuixiao-jifa']++, r => r.before[1].effective_skills.force++,
        r => r.immediate[0].skills[skill]++, r => r.immediate[0].temp.apply.sword = 1,
        r => r.before[0].temp.apply = null, r => r.before[1].neili = null,
        r => delete r.before[0].secondary_weapon, r => delete r.before[1].fighting_opponent,
        r => r.before[0].handing_details.consistence = 99]) mutate(pick(), operation);
    const condition = pick('no-grant');
    for (const value of [0, null]) {
        const raw = trace(condition); for (const phase of ['before', 'immediate', 'after']) raw[phase][0].cultivation[grant] = value;
        validateTaohuaBihaiRecord(raw, condition);
    }
    for (const value of [undefined, false, '', '0', [], {}]) mutate(condition, r => r.before[0].cultivation[grant] = value);
    mutate(condition, r => delete r.before[0].cultivation[grant]);
    for (const value of [undefined, false, '', '0', -1, 0.5, {}]) mutate(pick(), r => r.before[0].busy = value);
});

test('原命令弱模式熟练不等于教师奖励，零总效果也可以增长', () => {
    for (const condition of [pick(), pick('force2200'), pick('minimum', 180)]) for (const progress of [0, 1])
        assert.equal(validateTaohuaBihaiRecord(trace(condition, { progress }), condition).learned_delta, progress);
    for (const level of [400, 800]) assert.throws(() =>
        validateTaohuaBihaiRecord(trace(pick('baseline', level), { progress: 0 }), pick('baseline', level)));
    for (const operation of [r => r.immediate[0].learned[skill] = 2, r => r.immediate[0].learned[skill] = -1,
        r => r.immediate[0].learned[skill] = null, r => r.immediate[0].learned = [],
        r => delete r.immediate[0].learned, r => r.immediate[0].learned.sword = 1,
        r => r.immediate[1].learned.force = 1]) mutate(pick(), operation);
});

test('即时窗口无普通攻击/COMBAT直伤/后续心跳，实际缺少的明细不伪造空数组', () => {
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'dropped', 'terminals', 'callbacks']) {
        mutate(pick(), r => r[key] = [{}]); mutate(pick(), r => delete r[key]);
    }
    for (const key of ['direct', 'heartbeats', 'quick', 'riposte']) mutate(pick(), r => r.metrics[0][key] = 1);
    for (const key of ['actions', 'directs']) mutate(pick(), r => r[key] = [{}]);
    const raw = trace(pick()); raw.after[0].busy = 3;
    assert.throws(() => validateTaohuaBihaiRecord(raw, pick()));
    mutate(pick(), r => r.launches[0].skill = 'bihai-chaosheng');
    mutate(pick(), r => r.launches[0].actor = r.before[1].object);
    mutate(pick(), r => r.launches[0].argument = 'bihai');
});

test('双方hit/dodge/parry须沿稀疏计数协议为零，空事件不能掩盖矛盾计数', () => {
    for (const condition of [pick(), pick('no-grant')]) {
        const sparse = trace(condition), bytes = JSON.stringify(sparse);
        validateTaohuaBihaiRecord(sparse, condition);
        assert.equal(JSON.stringify(sparse), bytes, '缺省计数不回写或补造事件');
        for (const side of [0, 1]) for (const key of ['hit', 'dodge', 'parry']) {
            assert.equal(Object.hasOwn(sparse.metrics[side], key), false);
            const explicitZero = trace(condition); explicitZero.metrics[side][key] = 0;
            validateTaohuaBihaiRecord(explicitZero, condition);
            for (const value of [1, 99, null, -1])
                mutate(condition, raw => raw.metrics[side][key] = value);
        }
    }
});

test('统计按冻结条件：总效果正值率不是四段命中率，费用分母是已受理', () => {
    const condition = pick('no-music-map'), positive = trace(condition, { damage: 100, busy: 1, progress: 1 });
    const zero = trace(condition, { damage: 0, busy: 3, progress: 0 });
    positive.parameters = { actor: {}, target: {}, level: 9999 };
    const result = taohuaBihaiEffects([row(positive), row(zero)], condition);
    assert.equal(result.samples, 2); assert.equal(result.accepted_samples, 2);
    assert.deepEqual(result.counts, { observed: 2, refused: 0, error: 0, not_applicable: 0 });
    assert.equal(result.positive_effect.trials, 2); assert.equal(result.positive_effect.successes, 1);
    assert.equal(result.positive_effect.rate, 0.5); assert.equal(result.zero_effects, 1);
    assert.equal(result.jing_damage.mean, 50); assert.equal(result.jing_wound.mean, 33);
    assert.equal(result.actor_neili_cost.mean, 200); assert.equal(result.target_neili_cost.mean, 0);
    assert.deepEqual(result.busy_histogram, { 1: 1, 2: 0, 3: 1 }); assert.equal(result.busy.mean, 2);
    assert.equal(result.learned_progress.rate, 0.5);
    assert.throws(() => taohuaBihaiEffects([row(trace(pick()))], condition));
    const refused = pick('no-grant'), effects = taohuaBihaiEffects([row(trace(refused))], refused);
    assert.equal(effects.accepted_samples, 0); assert.equal(effects.refused_samples, 1);
    assert.equal(effects.positive_effect.rate, null); assert.equal(effects.actor_neili_cost.n, 0);
});

test('错误/空集合未知而非零费或零成功；外层身份和结果仍必核', () => {
    const condition = pick(), error = { kind: 'sample', condition_id: condition.id, method: 'perform', outcome: 'error' };
    const effects = taohuaBihaiEffects([row(error)], condition);
    assert.equal(effects.unknown_effect_samples, 1); assert.equal(effects.actor_neili_cost.mean, null);
    assert.equal(effects.actor_neili_cost.n, 0); assert.equal(effects.positive_effect.rate, null);
    assert.equal(taohuaBihaiEffects([], condition).learned_progress.rate, null);
    assert.throws(() => taohuaBihaiEffects([{ ...row(error), outcome: 'observed' }], condition));
    assert.throws(() => taohuaBihaiEffects([row({ ...error, outcome: 'not_applicable' })], condition));
    assert.throws(() => taohuaBihaiEffects([row({ ...error, method: 'play' })], condition));
});
