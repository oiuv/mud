import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { validateRecord } from './execution.mjs';
import { validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { taohuaPoConditions, taohuaPoFixtureRequirements, taohuaPoSourcePaths,
    validateTaohuaPoRecord, taohuaPoEffects } from './school_taohua_po_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value)
    ? value : JSON.stringify(value)).digest('hex');
// Lex only the two named skills. Never read previous samples or a live account.
const catalog = { skills: ['tanzhi-shentong', 'tanzhi-shentong/po'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', source = readFileSync(join(root, path), 'utf8');
    const parsed = scanSource(source); assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(source), entries: parsed.functions.filter(fn => fn.name === 'perform')
        .map(fn => ({ id: `${path}:${fn.line}:${fn.name}`, role: 'perform' })) };
}) };
const cases = taohuaPoConditions(catalog), smoke = taohuaPoConditions(catalog, { smoke: true });
const skill = 'tanzhi-shentong', grant = 'can_perform/tanzhi-shentong/po';
const flower = '/d/items/throwing/taohua_ban';
const pick = (tag = 'baseline') => {
    const c = cases.find(item => item.id === 'school-taohua-po-' + tag); assert.ok(c, tag); return c;
};
function sword(side) {
    return { program: '/tests/sword', object: '/tests/sword#' + (200 + side), skill_type: 'sword',
        weight: 3000, damage: 50, flag: 4, consistence: 100, material: null, no_wield: null,
        amount: null, daub: {}, rigidity: null };
}
function snapshot(cfg, side, fighting) {
    const equipment = cfg.equipment, armed = !!equipment && !equipment.hold;
    const apply = { armor: 100, ...(armed ? { damage: 50, dodge: -1 } : {}) };
    const fields = Object.entries(cfg.properties), object = '/tests/actor#' + (100 + side);
    const hand = !equipment?.hold ? {} : equipment.type === 'sword' ? sword(side) : {
        program: flower, object: flower + '#300', skill_type: 'throwing', flag: 8,
        weight: equipment.amount, amount: equipment.amount, material: 'wood', consistence: 100,
        damage: 2, no_wield: '暗器不是用来装备的。\n', stable: null, daub: {}, rigidity: null };
    return { ...Object.fromEntries(fields.filter(([key]) => !key.includes('/'))),
        cultivation: Object.fromEntries(fields.filter(([key]) => key.includes('/'))),
        object, id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1,
        wizardp: 0, living: 1, ghost: 0, fighting_opponent: Number(fighting), busy: null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), learned: {}, conditions: null,
        temp: { apply, ...(equipment?.hold ? { handing: hand.object } : {}),
            ...(armed ? { weapon: sword(side).object } : {}) },
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: armed ? 'sword' : 'none', weapon_details: armed ? sword(side) : {},
        weapon_damage: armed ? 50 : 0, weapon_flag: armed ? 4 : 0,
        secondary_weapon: 'none', secondary_weapon_details: {},
        handing: equipment?.hold ? equipment.type : 'none', handing_details: hand,
        ammunition: equipment?.hold ? equipment.type === 'throwing' ? equipment.amount : null : 0 };
}

// Synthetic validator inputs only. They are not saved to a ledger or presented as observations.
function trace(condition, { hit, wound, disarm = false, progress = 1 } = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 }); preparation.after = structuredClone(before[1]);
    }
    const old = p.target.equipment ? { ...sword(1), environment: before[1].object, equipped: 'wielded' } : {};
    const raw = { kind: 'sample', condition_id: condition.id, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        command_accepted: Number(accepted), launches: [], refusals: [], needle_hits: [],
        attacks: [], passives: [], defenses: [], dodge_checks: [], interfaces: [],
        dropped: [], terminals: [], callbacks: [], reason: '', elapsed: 0.01,
        po_equipment: { actor_room: '/tests/runner', target_room: '/tests/runner',
            target_weapon: { before: structuredClone(old), immediate: structuredClone(old), after: {} } },
        ...(preparation ? { preparation } : {}) };
    const [a, target] = raw.immediate;
    if (accepted) {
        hit ??= p.gate_expectation !== 'miss';
        raw.launches = [{ actor: before[0].object, skill, argument: 'po right' }];
        raw.metrics[0] = { neili_cost: 300, ability_launched: 1 };
        a.neili -= 300; a.busy = hit ? 2 : 3;
        a.handing_details.amount--; a.ammunition--;
        if (a.ammunition > 0) a.handing_details.weight = a.ammunition;
        if (progress) a.learned[skill] = progress;
        if (hit) {
            const ap = Math.trunc(p.actor.skills.finger / 2) + 2 * p.actor.skills[skill]
                + Math.trunc(p.actor.skills.throwing / 2);
            wound ??= Math.trunc(ap / 2);
            target.eff_qi -= wound; target.qi = Math.min(target.qi, target.eff_qi);
            raw.metrics[1] = { eff_qi_cost: wound, qi_cost: before[1].qi - target.qi };
            raw.needle_hits = [{ actor: 0, target: 1, program: flower,
                object: before[0].handing_details.object, damage_bonus: p.actor.properties.jiali + 300 }];
            if (disarm && p.target.equipment) {
                target.weapon = 'none'; target.weapon_details = {}; target.weapon_damage = 0; target.weapon_flag = 0;
                delete target.temp.weapon; target.temp.apply.damage -= 50; target.temp.apply.dodge += 1;
                target.effective_skills.dodge++;
                Object.assign(raw.po_equipment.target_weapon.immediate, { environment: '/tests/runner', equipped: null });
                raw.dropped.push({ object: before[1].weapon_details.object, name: '演武兵器', type: 'sword', no_wield: null });
            }
        }
    } else {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals = [{ actor: before[0].object, reason: raw.reason }];
    }
    raw.po_equipment.target_weapon.after = structuredClone(raw.po_equipment.target_weapon.immediate);
    raw.after = structuredClone(raw.immediate);
    const empty = accepted && p.actor.equipment.amount === 1;
    raw.ammo_cleanup = { checked: 1, object_exists: Number(!!p.actor.equipment && !empty),
        handing_object: !p.actor.equipment || empty ? null : before[0].handing_details.object };
    if (empty) {
        Object.assign(raw.after[0], { handing: 'none', handing_details: {}, ammunition: 0 });
        raw.after[0].temp.handing = null;
    }
    return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
function mutate(condition, operation, options) {
    const raw = trace(condition, options); operation(raw);
    assert.throws(() => validateTaohuaPoRecord(raw, condition));
}

test('原桃花瓣和错误手持剑经过实际三层消费，不被通用测试品种假设拒绝', () => {
    for (const condition of cases) {
        const raw = trace(condition), bytes = JSON.stringify(raw);
        validateRecord(raw, condition);
        validateSchoolCombatRecord(raw, condition);
        validateTaohuaPoRecord(raw, condition);
        assert.equal(JSON.stringify(raw), bytes);
    }
    const condition = pick(), raw = trace(condition);
    for (const program of ['/tests/throwing', '/d/items/throwing/another']) {
        const changed = structuredClone(raw); changed.before[0].handing_details.program = program;
        assert.throws(() => validateRecord(changed, condition));
    }
    for (const program of ['/tests/throwing', '/private/weapon']) {
        const changed = structuredClone(condition); changed.parameters.actor.equipment.program = program;
        assert.throws(() => validateRecord(raw, changed));
    }
    const notHeld = structuredClone(condition); notHeld.parameters.actor.equipment.hold = false;
    assert.throws(() => validateRecord(raw, notHeld));
    const otherGroup = structuredClone(condition); otherGroup.parameters.collection_group = 'other-group';
    assert.throws(() => validateRecord(raw, otherGroup));
});

test('单命令正执行成本1/23/476均受理，统计不累加成本且原记录不改写', () => {
    for (const condition of cases.filter(item => item.parameters.expected === 'observed')) {
        const records = [1, 23, 476].map(cost => {
            const raw = trace(condition); raw.command_accepted = cost; return raw;
        });
        const before = records.map(raw => JSON.stringify(raw));
        for (const raw of records) assert.equal(validateTaohuaPoRecord(raw, condition).accepted, true);
        const wrap = raw => ({ condition_id: condition.id, outcome: raw.outcome, raw });
        assert.deepEqual(taohuaPoEffects(records.map(wrap), condition),
            taohuaPoEffects(records.map(raw => wrap({ ...raw, command_accepted: 1 })), condition));
        assert.deepEqual(records.map(raw => JSON.stringify(raw)), before, '原成本不可归一化或回填');
    }
});

test('命令成本必须显式非负安全整数，拒绝只允许0且不能以缺值冒充', () => {
    const invalid = [undefined, null, false, true, '1', {}, [], -1, 0.5, NaN, Infinity,
        Number.MAX_SAFE_INTEGER + 1];
    for (const condition of cases) {
        const missing = trace(condition); delete missing.command_accepted;
        assert.throws(() => validateTaohuaPoRecord(missing, condition), condition.id);
        for (const cost of invalid) {
            const raw = trace(condition); raw.command_accepted = cost;
            assert.throws(() => validateTaohuaPoRecord(raw, condition), condition.id + ': ' + String(cost));
        }
        if (condition.parameters.expected === 'observed') {
            const raw = trace(condition); raw.command_accepted = 0;
            assert.throws(() => validateTaohuaPoRecord(raw, condition), '已受理不可记0成本');
        } else {
            const zero = trace(condition); zero.command_accepted = 0;
            assert.equal(validateTaohuaPoRecord(zero, condition).accepted, false);
            for (const cost of [1, 23, 476]) {
                const raw = trace(condition); raw.command_accepted = cost;
                assert.throws(() => validateTaohuaPoRecord(raw, condition), '拒绝不可记正成本');
            }
        }
    }
});

test('固定19条件／822正式／27烟雾，只改样本次数，不包含twice候选', () => {
    assert.equal(cases.length, 19); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 822);
    assert.equal(smoke.length, 19); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 27);
    assert.equal(new Set(cases.map(c => c.id)).size, 19);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 8);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 11);
    assert.deepEqual(cases.map(({ samples, ...c }) => c), smoke.map(({ samples, ...c }) => c));
    assert.equal(hash(cases), 'ee880690ba7e83ae10650a077f15024ab3376418fdbf1cc46e0b5584d0fba436');
    assert.equal(hash(smoke), '8d7498c44125df052c37d4cffb57b8766fbd973a27a936137ed8f31e5285a21e');
    for (const c of cases) {
        assert.equal(c.entry_id, 'kungfu/skill/tanzhi-shentong/po.c:8:perform');
        assert.equal(c.parameters.action, `perform ${c.parameters.usage}.po right`);
        assert.equal(c.parameters.named_participants, true); assert.equal(c.parameters.observe_seconds, 0);
        assert.deepEqual(c.parameters.qualification_sources, taohuaPoSourcePaths);
        assert.equal(c.parameters.actor.skills.hubo, undefined);
    }
    assert.equal(taohuaPoFixtureRequirements.length, 8);
});

test('原命令／物品／损伤来源固定，资格链路径存在；不读正式数据', () => {
    const sources = {
        'kungfu/skill/tanzhi-shentong/po.c': '18296ff0f125f804ccf9a792591c7ff3fa54098c1a4ab25056b707d24ae2116e',
        'kungfu/skill/tanzhi-shentong.c': '23b04a8fe57b58d944011d8cce26f9e2afe2228ce2324421586a2183534ece1f',
        'kungfu/class/taohua/huang.c': 'f5f2ad95ea9bf005b288d81ae9a67457d780b350dbf45865d66c08ec81b9af1e',
        'cmds/skill/perform.c': '7bb9b93d1ce1bccf5587c942f2d7c30c8f3e1b5cb96c25719e0aef1032d20054',
        'feature/skill.c': '99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
        'feature/damage.c': '1a57abfa577c4043909cf6f443fd070fb51b3128c4e33ed070809862db200a53',
        'feature/equip.c': '11f3cec8438a9fdd514cfeb9f8f4287ec1927e3235f4b10106a089acaace4f27',
        'feature/move.c': '94f9652a26101c1cf6dd84ba62de2153732e706f1435582669b94506ca150ac3',
        'inherit/item/combined.c': '428de755aa249d20823ee6db29a4f5b665b344f5d53370a34aafa7e2bca05f8a',
        'inherit/weapon/throwing.c': '3e24ca5fabaa6dfc81a401699e33d41546ed273441e4aee38a4391f61848bfa6',
        'd/items/throwing.lpc': '78b9a80f56ae21cda03718f981d85ca4b37c22fb46e95d8733d5a88d26a5a786',
        'd/items/throwing_data.h': 'd66fb97ed52ca30a3fc37f0e88ca1a5ffcd1875f6305c2bb2efcbb815c9386fb',
        'adm/daemons/itemd.c': '0e25cc75d98d5a443f198f258af9a560d4a8abe87c709061ef7a589bbb325864',
    };
    for (const path of taohuaPoSourcePaths) {
        const bytes = readFileSync(join(root, path)); assert.ok(bytes.length > 0);
        if (sources[path]) assert.equal(hash(bytes), sources[path], path);
    }
});

test('单差异对照和联合最低资格明确，throwing命令不绕过finger激发/准备', () => {
    const b = pick().parameters;
    assert.deepEqual(b.actor.skills, { finger: 200, throwing: 200, [skill]: 200, force: 200, 'bibo-shengong': 200 });
    assert.equal(b.actor.properties.max_neili, 2500); assert.equal(b.actor.properties.neili, 800);
    assert.equal(b.actor.equipment.program, flower); assert.equal(b.actor.equipment.hand_id, 'flower leaf');
    const changes = [
        ['jiali50', p => p.actor.properties.jiali = 50],
        ['throwing-command', p => { p.usage = 'throwing'; p.action = 'perform throwing.po right'; }],
        ['last-ammo', p => p.actor.equipment.amount = 1],
        ['unarmed-target', p => delete p.target.equipment],
        ['target-qi9000', p => p.target.properties.qi = 9000],
        ['dodge1200', p => { p.target.skills.dodge = 1200; p.gate_expectation = 'miss'; }],
    ];
    for (const [tag, change] of changes) {
        const expected = structuredClone(b); change(expected); expected.variant = tag;
        assert.deepEqual(pick(tag).parameters, expected, tag);
    }
    const noMap = pick('no-finger-map').parameters;
    const fingerMissing = structuredClone(pick('throwing-command').parameters.actor); delete fingerMissing.mappings.finger;
    assert.deepEqual(noMap.actor, fingerMissing); assert.equal(noMap.action, 'perform throwing.po right');
    assert.equal(noMap.actor.preparations.finger, skill);
    const min = pick('joint-minimum').parameters;
    for (const key of ['finger', 'throwing', skill]) assert.equal(min.actor.skills[key], 180);
    assert.equal(min.actor.properties.max_neili, 2400); assert.equal(min.actor.properties.neili, 500);
});

test('来源错误或非法样本数不能生成新条件', () => {
    for (const samples of [0, -1, 0.5, NaN, Infinity, '100']) assert.throws(() => taohuaPoConditions(catalog, { samples }));
    assert.throws(() => taohuaPoConditions({ skills: [] }));
    for (const op of [c => c.skills[1].entries = [], c => c.skills[1].path = 'fake.c', c => c.skills[0].sha256 = 'x']) {
        const invalid = structuredClone(catalog); op(invalid); assert.throws(() => taohuaPoConditions(invalid));
    }
});

test('19个合成契约通过且不回写，拒绝不是未命中或免费受理', () => {
    for (const c of cases) {
        const raw = trace(c), bytes = JSON.stringify(raw), observed = validateTaohuaPoRecord(raw, c);
        assert.equal(observed.accepted, c.parameters.expected === 'observed');
        assert.equal(Object.hasOwn(raw, 'parameters'), false); assert.equal(JSON.stringify(raw), bytes);
        if (!observed.accepted) {
            assert.equal(observed.hit, null); assert.equal(observed.actor_neili_cost, 0);
            assert.equal(observed.ammunition_cost, 0); assert.equal(observed.learned_delta, 0);
        }
    }
});

test('基准AP600／持剑DP599；去剑仅恢复1点闪避，联合最低AP540', () => {
    const b = validateTaohuaPoRecord(trace(pick()), pick()); assert.equal(b.ap, 600); assert.equal(b.dp, 599);
    const u = validateTaohuaPoRecord(trace(pick('unarmed-target')), pick('unarmed-target'));
    assert.equal(u.dp, 600); assert.equal(u.disarm_eligible, false);
    const m = validateTaohuaPoRecord(trace(pick('joint-minimum')), pick('joint-minimum'));
    assert.equal(m.ap, 540); assert.equal(m.actor_neili_cost, 300);
    const miss = validateTaohuaPoRecord(trace(pick('dodge1200')), pick('dodge1200'));
    assert.equal(miss.dp, 899); assert.equal(miss.hit, false); assert.equal(miss.learned_delta, 1);
    mutate(pick(), r => r.before[1].effective_skills.dodge = 300);
    mutate(pick(), r => r.before[0].temp.apply.throwing = 50);
    mutate(pick('dodge1200'), () => {}, { hit: true });
});

test('原受理命中和失手都扣300内力及1片，忙乱分别2与3；加力只改回调参数', () => {
    for (const hit of [true, false]) for (const tag of ['baseline', 'jiali50', 'throwing-command']) {
        const c = pick(tag), result = validateTaohuaPoRecord(trace(c, { hit }), c);
        assert.equal(result.hit, hit); assert.equal(result.busy, hit ? 2 : 3);
        assert.equal(result.actor_neili_cost, 300); assert.equal(result.ammunition_cost, 1);
        assert.equal(result.needle_calls, Number(hit));
        assert.equal(result.hit_bonus, hit ? tag === 'jiali50' ? 350 : 300 : null);
        assert.equal(result.wound, hit ? 300 : 0);
    }
    mutate(pick(), r => r.command_accepted = 0); mutate(pick(), r => r.immediate[0].busy = 3);
    mutate(pick(), r => r.metrics[0].neili_cost = 299);
    mutate(pick(), r => r.needle_hits[0].damage_bonus = 350);
    mutate(pick(), r => r.needle_hits.push({ ...r.needle_hits[0] }));
    mutate(pick(), r => r.needle_hits[0].object = flower + '#301');
    mutate(pick(), r => r.needle_hits[0].actor = 1);
    mutate(pick(), r => r.launches[0].argument = 'po');
});

test('创伤支持300..599；当前气血夹制不等于额外直伤，低气血可以零净降', () => {
    for (const tag of ['baseline', 'target-qi9000']) for (const wound of [300, 599]) {
        const c = pick(tag), result = validateTaohuaPoRecord(trace(c, { wound }), c);
        assert.equal(result.wound, wound); assert.equal(result.qi_clamp, tag === 'baseline' ? wound : 0);
        assert.equal(result.target_qi_net_loss, result.qi_clamp);
        assert.equal(result.target_neili_cost, 0); assert.equal(result.target_neili_net_loss, 0);
    }
    for (const wound of [299, 600, 300.5]) mutate(pick(), () => {}, { wound });
    mutate(pick(), r => r.metrics[1].qi_cost *= 2);
    mutate(pick('target-qi9000'), r => { r.immediate[1].qi -= 300; r.metrics[1].qi_cost = 300; });
    // Balanced fictitious expense/recovery must not pass a net-only check.
    for (const side of [0, 1]) for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
        mutate(pick(), r => { const m = r.metrics[side]; m[resource + '_cost'] = (m[resource + '_cost'] ?? 0) + 1;
            m[resource + '_recovery'] = 1; });
    }
    mutate(pick(), r => { r.directs = [{ actor: 0, target: 1, damage: 300 }]; });
});

test('原被缴武器三时点身份及落地事实，保留和缴械均合法而非强迫随机分布', () => {
    for (const disarm of [true, false]) {
        const raw = trace(pick(), { disarm }), result = validateTaohuaPoRecord(raw, pick());
        assert.equal(result.disarmed, disarm); assert.equal(result.disarm_eligible, true);
        assert.equal(raw.immediate[1].effective_skills.dodge, disarm ? 300 : 299);
    }
    for (const op of [r => r.po_equipment.target_weapon.immediate.object = '/tests/sword#999',
        r => r.po_equipment.target_weapon.immediate.environment = r.before[0].object,
        r => r.po_equipment.target_weapon.immediate.environment = '/tests/other_room',
        r => r.po_equipment.target_weapon.immediate.equipped = 'wielded',
        r => r.po_equipment.target_weapon.immediate.consistence = 99,
        r => r.dropped[0].object = '/tests/sword#999',
        r => r.dropped = [], r => r.immediate[1].temp.apply.damage = 50,
        r => r.immediate[1].temp.apply.dodge = -1, r => r.immediate[1].weapon_details = r.before[1].weapon_details,
        r => delete r.po_equipment.target_weapon.immediate.equipped]) mutate(pick(), op, { disarm: true });
    mutate(pick(), r => r.po_equipment.target_weapon.immediate.environment = '/tests/runner');
    mutate(pick(), r => delete r.po_equipment);
    mutate(pick('unarmed-target'), r => r.po_equipment.target_weapon.before = sword(1));
    mutate(pick(), r => r.after[1].weapon = 'sword', { disarm: true });
});

test('最后一片同步amount0仍可原hit_ob，后续自然销毁单列且不允许提前销毁或回填', () => {
    const c = pick('last-ammo');
    for (const hit of [true, false]) {
        const raw = trace(c, { hit }), before = JSON.stringify(raw), result = validateTaohuaPoRecord(raw, c);
        assert.equal(result.naturally_destroyed, true); assert.equal(result.needle_calls, Number(hit));
        assert.equal(raw.immediate[0].handing_details.amount, 0); assert.equal(raw.immediate[0].handing_details.weight, 1);
        assert.equal(raw.after[0].handing, 'none'); assert.equal(JSON.stringify(raw), before);
    }
    for (const op of [r => r.immediate[0].handing_details = {}, r => r.immediate[0].handing = 'none',
        r => r.immediate[0].handing_details.amount = -1, r => r.immediate[0].handing_details.weight = 0,
        r => r.after = structuredClone(r.immediate), r => r.ammo_cleanup.object_exists = 1,
        r => delete r.ammo_cleanup.handing_object, r => r.ammo_cleanup.handing_object = flower + '#300',
        r => r.after[0].neili--, r => r.after[0].temp.apply.armor++,
        r => r.after[0].temp.handing = 'stale-reference', r => delete r.ammo_cleanup]) mutate(c, op);
    const absentTemp = trace(c); delete absentTemp.after[0].temp.handing;
    validateTaohuaPoRecord(absentTemp, c);
    mutate(pick(), r => r.ammo_cleanup.object_exists = 0);
    mutate(pick('no-held'), r => r.ammo_cleanup.object_exists = 1);
});

test('显式原空值只允许null/0；键缺失、错误类型和虚假毒剂不能蒙混', () => {
    for (const zero of [0, null]) {
        const r = trace(pick(), { disarm: true });
        for (const phase of ['before', 'immediate', 'after']) r[phase][0].handing_details.stable = zero;
        for (const phase of ['immediate', 'after']) r.po_equipment.target_weapon[phase].equipped = zero;
        validateTaohuaPoRecord(r, pick());
        const denied = trace(pick('no-grant'));
        for (const phase of ['before', 'immediate', 'after']) denied[phase][0].cultivation[grant] = zero;
        validateTaohuaPoRecord(denied, pick('no-grant'));
    }
    for (const value of [undefined, false, true, '', '0', 1, -1, {}, []]) {
        mutate(pick(), r => r.before[0].handing_details.stable = value);
        mutate(pick(), r => r.po_equipment.target_weapon.immediate.equipped = value, { disarm: true });
        mutate(pick(), r => r.metrics[0].jing_cost = value);
    }
    mutate(pick(), r => delete r.before[0].handing_details.stable);
    mutate(pick(), r => r.before[0].handing_details.daub = { poison: { level: 80 } });
    mutate(pick(), r => delete r.before[0].conditions);
    mutate(pick(), r => r.before[1].conditions = []);
    mutate(pick(), r => delete r.po_equipment.target_room);
    mutate(pick('no-grant'), r => delete r.before[0].cultivation[grant]);
});

test('拒绝边界保持零费用零减量；原昏迷准备与即时终态证据不串账', () => {
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) {
        mutate(c, r => r.reason = '其它错误\n');
        mutate(c, r => r.metrics[0].neili_cost = 300);
        mutate(c, r => r.command_accepted = 1);
        mutate(c, r => r.immediate[0].learned[skill] = 1);
        mutate(c, r => r.needle_hits = [{ actor: 0, target: 1, program: flower, object: 'other', damage_bonus: 300 }]);
    }
    const c = pick('unconscious-target');
    for (const op of [r => delete r.preparation, r => r.preparation.terminals = [],
        r => r.preparation.terminals[0].side = 0, r => r.preparation.before.object = 'not-the-target',
        r => r.preparation.before.qi = 0, r => r.preparation.after.living = 1,
        r => r.terminals = [{ side: 1, state: 'unconscious' }]]) mutate(c, op);
    mutate(pick(), r => r.preparation = {});
});

test('原命令熟练增长0/1与命中无关，缺映射和非法点数失败', () => {
    for (const tag of ['baseline', 'dodge1200', 'joint-minimum']) for (const progress of [0, 1]) {
        const c = pick(tag); assert.equal(validateTaohuaPoRecord(trace(c, { progress }), c).learned_delta, progress);
    }
    for (const value of [2, -1, 0.5, '1', null]) mutate(pick(), r => r.immediate[0].learned[skill] = value);
    mutate(pick(), r => r.immediate[0].learned = []);
    mutate(pick(), r => delete r.immediate[0].learned);
    mutate(pick(), r => r.immediate[0].learned.throwing = 1);
    mutate(pick(), r => r.immediate[1].learned.sword = 1);
    mutate(pick(), r => r.immediate[0].skills[skill]++);
});

test('身份、旁路攻击、额外心跳和跨样本引用必须失败', () => {
    for (const op of [r => r.before[0].wizardp = 1, r => r.before[1].interactive = 0,
        r => r.immediate[0].object = 'replacement', r => r.after[0].playerp = 0,
        r => r.before[0].id = 'somebody', r => r.before[0].fighting_opponent = 0,
        r => r.metrics[0].heartbeats = 1, r => r.attacks = [{ actor: 0, target: 1 }],
        r => r.passives = [{ skill }], r => r.callbacks = [{ phase: 'after' }],
        r => r.before[0].secondary_weapon = 'sword', r => r.condition_id = 'some-other-case',
        r => r.before[0].temp.handing = flower + '#999', r => delete r.before[0].temp.handing,
        r => r.immediate[1].temp.weapon = '/tests/sword#999']) mutate(pick(), op);
});

test('冻结condition统计受理/命中/有器命中缴械分母，错误未知不是免费失手', () => {
    const c = pick();
    const rows = [trace(c, { hit: false, progress: 0 }), trace(c, { hit: true, disarm: false }),
        trace(c, { hit: true, disarm: true })].map(row);
    rows.push(row({ condition_id: c.id, method: 'perform', outcome: 'error' }));
    const bytes = JSON.stringify(rows), result = taohuaPoEffects(rows, c);
    assert.equal(result.samples, 4); assert.equal(result.accepted_samples, 3); assert.equal(result.unknown_effect_samples, 1);
    assert.deepEqual([result.hit.successes, result.hit.trials], [2, 3]);
    assert.deepEqual([result.disarm_among_armed_hits.successes, result.disarm_among_armed_hits.trials], [1, 2]);
    assert.deepEqual([result.disarm_per_accepted.successes, result.disarm_per_accepted.trials], [1, 3]);
    assert.equal(result.actor_neili_cost.mean, 300); assert.equal(result.actor_neili_cost.n, 3);
    assert.equal(result.wound.mean, 200); assert.equal(result.wound_on_hit.mean, 300);
    assert.equal(result.wound_on_hit.n, 2); assert.equal(result.natural_empty_cleanup.trials, 0);
    assert.equal(result.natural_empty_cleanup.rate, null); assert.equal(JSON.stringify(rows), bytes);
    const u = pick('unarmed-target'), unarmed = taohuaPoEffects([row(trace(u))], u);
    assert.equal(unarmed.disarm_among_armed_hits.rate, null); assert.equal(unarmed.disarm_per_accepted.rate, 0);
    const last = pick('last-ammo'), cleanup = taohuaPoEffects([row(trace(last))], last);
    assert.equal(cleanup.natural_empty_cleanup.rate, 1);
    const refused = pick('no-grant'), denied = taohuaPoEffects([row(trace(refused))], refused);
    assert.equal(denied.refused_samples, 1); assert.equal(denied.hit.trials, 0); assert.equal(denied.wound.mean, null);
    assert.equal(taohuaPoEffects([], c).actor_neili_cost.mean, null);
    assert.throws(() => taohuaPoEffects([row(trace(u))], c));
    const unobserved = row({ condition_id: c.id, method: 'perform', outcome: 'not_applicable' });
    assert.throws(() => taohuaPoEffects([unobserved], c));
});
