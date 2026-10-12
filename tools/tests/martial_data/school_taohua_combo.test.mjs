import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { taohuaComboConditions, taohuaComboSourcePaths, taohuaComboFixtureRequirements,
    taohuaComboActions, taohuaComboExtraAction, validateTaohuaComboRecord, taohuaComboEffects } from './school_taohua_combo_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value)
    ? value : JSON.stringify(value)).digest('hex');
const skills = ['xuanfeng-tui', 'xuanfeng-tui/kuang', 'lanhua-shou', 'lanhua-shou/fei'].map(id => {
    const path = `kungfu/skill/${id}.c`, text = read(path), parsed = scanSource(text);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(text), entries: parsed.functions.filter(f => f.name === 'perform')
        .map(f => ({ id: `${path}:${f.line}:${f.name}`, role: 'perform' })) };
});
const catalog = { skills, source_fingerprint: hash(skills), dictionary_sha256: hash('offline-taohua-combo-no-dictionary') };
const cases = taohuaComboConditions(catalog, read), smoke = taohuaComboConditions(catalog, read, { smoke: true });
const pick = (ability = 'kuang', variant = 'baseline', level = 200) => {
    const c = cases.find(x => x.id === `school-taohua-combo-${ability}-l${level}-${variant}`);
    assert.ok(c); return c;
};
const copy = structuredClone;

function snapshot(cfg, side, nonlethal) {
    const special = k => k.includes('/') || k === 'character';
    const apply = { armor: 100, ...(cfg.equipment ? { damage: 50, dodge: -1 } : {}) };
    const strongest = Math.max(0, ...['unarmed', 'hand', 'finger', 'strike', 'claw', 'cuff'].map(k => cfg.skills[k] ?? 0));
    return { ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !special(k))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => special(k))),
        object: `/tests/actor#${100 + side}`, id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, living: 1, ghost: 0, fighting_opponent: 1, killing_opponent: nonlethal ? 0 : 1,
        busy: cfg.busy ?? null,
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations),
        preparation_order: Object.keys(cfg.preparations), learned: {}, temp: { apply }, conditions: null,
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, level]) =>
            [key, Math.trunc(level / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_str: cfg.properties.str + Math.trunc(strongest / 10), effective_con: cfg.properties.con + Math.trunc(cfg.skills.force / 10),
        weapon: cfg.equipment ? 'sword' : 'none', weapon_damage: cfg.equipment ? 50 : 0,
        weapon_flag: cfg.equipment ? 4 : 0, weapon_details: cfg.equipment ? { object: '/tests/sword#202',
            program: '/tests/sword', skill_type: 'sword', weight: 3000, flag: 4, damage: 50, consistence: 100 } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}

// One explicitly synthetic, source-reachable path. No RNG forcing or real driver is involved.
function trace(c, options = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.nonlethal), snapshot(p.target, 1, p.nonlethal)];
    const raw = { kind: 'sample', condition_id: c.id, method: 'perform', outcome: p.expected,
        before, immediate: copy(before), after: [], metrics: [{}, {}], command_accepted: Number(accepted),
        actions: [], attacks: [], dodge_checks: [], passives: [], launches: [], refusals: [], defenses: [],
        interfaces: [], dropped: [], terminals: [], callbacks: [], reason: '', elapsed: 0.01 };
    const [a, t] = raw.immediate;
    if (!accepted) {
        const msg = options.colored ? '\x1b[1;36m' + p.refusal + '\x1b[0m' : p.refusal;
        raw.reason = '\x1b[256D\x1b[K' + msg; a.temp.notify_fail = msg;
        raw.refusals = [{ actor: a.object, reason: raw.reason }];
    } else {
        const kuang = p.ability === 'kuang', fee = kuang ? 100 : 150;
        const gate = options.boost ?? p.variant !== 'gate-miss';
        const bonus = kuang ? (p.actor.properties['family/family_name'] === '桃花岛' ? Math.trunc(p.actor.skills[p.skill] / 4) : 0)
            : gate ? Math.trunc(p.actor.skills[p.skill] / 5) : 0;
        raw.launches = [{ actor: a.object, skill: p.skill, argument: `${p.ability} right` }];
        raw.metrics[0].ability_launched = 1; raw.metrics[0].neili_cost = fee; a.neili -= fee;
        a.temp.notify_fail = '你所使用的外功中没有这种功能。\n';
        if (kuang || bonus) a.temp.apply.attack = bonus;
        if (kuang) a.temp.apply.unarmed_damage = Math.trunc(bonus / 2);
        const patterns = options.results ?? [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < patterns.length; i++) {
            if (!a.fighting_opponent) break;
            if (kuang && !(t.busy ?? 0) && (i % 2 === 0)) t.busy = 1;
            if (!kuang) a.temp.action_flag = before[0].preparation_order.indexOf('hand');
            const surcharge = options.surchargeAt?.includes(i);
            const unlocked = taohuaComboActions[p.skill].filter(x => p.actor.skills[p.skill] > x.lvl).length;
            const action = copy(surcharge ? taohuaComboExtraAction
                : taohuaComboActions[p.skill][options.actionIndex ?? Math.max(0, unlocked - 6)]);
            if (surcharge) { a.neili -= 300; raw.metrics[0].neili_cost += 300; }
            raw.actions.push({ actor: 0, target: 1, skill: p.skill, action });
            a.temp.fight = { attack: action.attack ?? null, dodge: action.dodge, parry: action.parry ?? null };
            for (const phase of ['base', 'settled']) raw.dodge_checks.push({ actor: 0, target: 1,
                type: 0, phase, ap: 1000, dp: phase === 'settled' && t.busy ? 100 : 300,
                busy: t.busy, skill: null });
            const result = patterns[i], unarmed = a.temp.apply.unarmed_damage ?? 0;
            const first = Math.trunc(unarmed / 2), force = a.effective_str + Math.trunc(action.force * a.effective_str / 100);
            const incoming = first + Math.trunc(action.damage * first / 100) + Math.trunc(force / 3);
            let damage = incoming + Math.trunc(incoming * (a.str * 2 + a.effective_str) / 300);
            damage = damage > 400 ? Math.trunc((damage - 400) / 4) + 300 : damage > 200 ? Math.trunc((damage - 200) / 2) + 200 : damage;
            if (result !== 0 || options.zeroDamage?.includes(i)) damage = 0;
            if (result === 0) raw.passives.push({ actor: 0, target: 1, skill: p.skill, incoming,
                factor: 0, route: 'martial', result: null, before: copy([a, t]), after: copy([a, t]),
                neili_after: a.neili, target_eff_qi_after: t.eff_qi, target_busy_after: t.busy });
            raw.attacks.push({ actor: 0, target: 1, type: 0, result, damage,
                attack_usage: p.usage, attack_skill: p.skill, action_flag: a.temp.action_flag ?? null,
                apply_attack: a.temp.apply.attack ?? null, apply_unarmed_damage: a.temp.apply.unarmed_damage ?? null, neili: a.neili });
            const metric = result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry';
            raw.metrics[0][metric] = (raw.metrics[0][metric] ?? 0) + 1;
            if (damage) {
                raw.metrics[1].qi_cost = (raw.metrics[1].qi_cost ?? 0) + damage;
                t.qi -= damage; t.busy = 0;
                if (p.nonlethal && t.qi * 3 <= t.max_qi) { a.fighting_opponent = 0; t.fighting_opponent = 0; }
            }
        }
        a.temp.apply.attack = 0;
        if (kuang) a.temp.apply.unarmed_damage = 0;
        a.busy = options.busy ?? (kuang ? 4 : 2);
        if ((options.progress ?? 1) > 0) a.learned[p.skill] = options.progress ?? 1;
    }
    raw.after = copy(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
function reject(c, change, options) {
    const raw = trace(c, options); change(raw); raw.after = copy(raw.immediate);
    assert.throws(() => validateTaohuaComboRecord(raw, c));
}

test('单命令正执行成本1/23/476均受理，统计不累加成本且原记录不改写', () => {
    for (const condition of cases.filter(item => item.parameters.expected === 'observed')) {
        const records = [1, 23, 476].map(cost => {
            const raw = trace(condition); raw.command_accepted = cost; return raw;
        });
        const before = records.map(raw => JSON.stringify(raw));
        for (const raw of records) assert.equal(validateTaohuaComboRecord(raw, condition).accepted, true);
        const wrap = raw => ({ condition_id: condition.id, outcome: raw.outcome, raw });
        assert.deepEqual(taohuaComboEffects(records.map(wrap), condition),
            taohuaComboEffects(records.map(raw => wrap({ ...raw, command_accepted: 1 })), condition));
        assert.deepEqual(records.map(raw => JSON.stringify(raw)), before, '原成本不可归一化或回填');
    }
});

test('命令成本必须显式非负安全整数，拒绝只允许0且不能以缺值冒充', () => {
    const invalid = [undefined, null, false, true, '1', {}, [], -1, 0.5, NaN, Infinity,
        Number.MAX_SAFE_INTEGER + 1];
    for (const condition of cases) {
        const missing = trace(condition); delete missing.command_accepted;
        assert.throws(() => validateTaohuaComboRecord(missing, condition), condition.id);
        for (const cost of invalid) {
            const raw = trace(condition); raw.command_accepted = cost;
            assert.throws(() => validateTaohuaComboRecord(raw, condition), condition.id + ': ' + String(cost));
        }
        if (condition.parameters.expected === 'observed') {
            const raw = trace(condition); raw.command_accepted = 0;
            assert.throws(() => validateTaohuaComboRecord(raw, condition), '已受理不可记0成本');
        } else {
            const zero = trace(condition); zero.command_accepted = 0;
            assert.equal(validateTaohuaComboRecord(zero, condition).accepted, false);
            for (const cost of [1, 23, 476]) {
                const raw = trace(condition); raw.command_accepted = cost;
                assert.throws(() => validateTaohuaComboRecord(raw, condition), '拒绝不可记正成本');
            }
        }
    }
});

test('24有限条件/1420正式/48烟雾；只单备、不初始化action_flag或拼接双招', () => {
    assert.equal(cases.length, 24); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1420);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 48);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 10);
    assert.equal(new Set(cases.map(c => c.id)).size, 24);
    assert.deepEqual(smoke.map(({ samples, ...c }) => c), cases.map(({ samples, ...c }) => c));
    for (const ability of ['kuang', 'fei']) assert.deepEqual(cases.filter(c => c.parameters.ability === ability
        && c.parameters.variant === 'baseline').map(c => c.parameters.level), [200, 400, 800]);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.samples, p.expected === 'refused' ? 2 : 100);
        assert.equal(p.actor.properties.jiali, 0); assert.equal(p.target.properties.jiali, 0);
        assert.equal(p.actor.temp, undefined); assert.ok(Object.keys(p.actor.preparations).length <= 1);
        assert.equal(p.action, `perform ${p.usage}.${p.ability} right`); assert.equal(p.observe_seconds, 0);
        assert.equal(p.named_participants, true); assert.equal(p.actor.skills['zuoyou-hubo'], undefined);
    }
    assert.equal(cases.filter(c => c.parameters.variant === 'jingluo-surcharge').length, 1);
    assert.deepEqual(cases.filter(c => c.parameters.nonlethal).map(c => c.parameters.variant), ['low-qi', 'low-qi']);
    assert.ok(taohuaComboFixtureRequirements.every(s => typeof s === 'string' && s));
});

test('目录入口与全部原字节SHA冻结，数值/选招文本对应现存源码', () => {
    for (const c of cases) for (const path of taohuaComboSourcePaths)
        assert.equal(c.parameters.source_evidence[path], hash(read(path)));
    for (const [skill, actions] of Object.entries(taohuaComboActions)) {
        const source = read(`kungfu/skill/${skill}.c`);
        for (const a of actions) for (const [key, value] of Object.entries(a))
            assert.ok(source.includes(`"${key}": ${typeof value === 'number' ? value : JSON.stringify(value)}`), `${skill}/${key}/${value}`);
        assert.match(source, /level > action\[i - 1\]\["lvl"\]/);
    }
    assert.match(read('kungfu/skill/lanhua-shou/fei.c'), /member_array\("hand", keys\(p\)\)/);
    assert.match(read('kungfu/skill/xuanfeng-tui/kuang.c'), /add_temp\("apply\/unarmed_damage", -count \/ 2\)/);
    for (const bad of [0, -1, NaN, 1.5, Infinity, '100']) assert.throws(() => taohuaComboConditions(catalog, read, { samples: bad }));
    assert.throws(() => taohuaComboConditions(catalog));
    assert.throws(() => taohuaComboConditions(catalog, () => ''));
    for (const mutation of [c => c.skills[1].sha256 = '0'.repeat(64), c => c.skills[1].entries = [],
        c => c.skills[1].entries[0].id += ':other', c => c.skills[1].path = 'wrong.c']) {
        const broken = copy(catalog); mutation(broken); assert.throws(() => taohuaComboConditions(broken, read));
    }
});

test('真实create/open隔离台账及非法ID/入口/覆盖/输入漂移负例，不运行驱动', () => {
    const inventory = { source_fingerprint: catalog.source_fingerprint, versions: { note: 'offline synthetic plan only' },
        files: taohuaComboSourcePaths.map(path => ({ path, sha256: hash(read(path)) })) };
    const execution = { kind: 'offline-taohua-combo-plan', source_files: cases[0].parameters.source_evidence };
    const directory = mkdtempSync(join(tmpdir(), 'mud-taohua-combo-plan-'));
    const manifest = createSeries(directory, { inventory, catalog, conditions: cases, execution });
    assert.deepEqual(openSeries(directory, manifest.identity).identity.conditions, cases);
    const small = createSeries(join(directory, 'smoke'), { inventory, catalog, conditions: smoke, execution });
    assert.deepEqual(openSeries(join(directory, 'smoke'), small.identity).identity.conditions, smoke);
    const wrong = copy(cases); wrong[0].id += '-中文';
    assert.throws(() => createSeries(join(directory, 'bad-id'), { inventory, catalog, conditions: wrong, execution }));
    wrong[0].id = cases[0].id; wrong[0].entry_id = 'kungfu/skill/nonexistent.c:1:perform';
    assert.throws(() => createSeries(join(directory, 'bad-entry'), { inventory, catalog, conditions: wrong, execution }));
    assert.throws(() => createSeries(directory, { inventory, catalog, conditions: cases, execution }));
    const drift = copy(manifest.identity); drift.conditions[0].parameters.actor.properties.neili++;
    assert.throws(() => openSeries(directory, drift));
});

test('所有固定条件合成契约通过，保留原记录/显式null，无raw.parameters依赖', () => {
    for (const c of cases) {
        const raw = trace(c), frozen = JSON.stringify(raw), result = validateTaohuaComboRecord(raw, c);
        assert.equal(result.accepted, c.parameters.expected === 'observed');
        assert.equal(Object.hasOwn(raw, 'parameters'), false); assert.equal(JSON.stringify(raw), frozen);
    }
    for (const ability of ['kuang', 'fei']) {
        const c = pick(ability), raw = trace(c, { results: [-1, -2, 0, -1, 0, -2], zeroDamage: [2] });
        assert.equal(validateTaohuaComboRecord(raw, c).attacks, 6);
    }
});

test('狂风桃花lvl/4及其半数徒手加成逐击真实核验，结束恢复，非桃花仍可发动', () => {
    for (const [level, bonus, damage] of [[100, 25, 12], [200, 50, 25], [400, 100, 50], [800, 200, 100]]) {
        const c = pick('kuang', level === 100 ? 'minimum' : 'baseline', level), raw = trace(c);
        assert.equal(validateTaohuaComboRecord(raw, c).attack_bonus, bonus);
        assert.ok(raw.attacks.every(x => x.apply_attack === bonus && x.apply_unarmed_damage === damage));
        reject(c, r => r.attacks[2].apply_unarmed_damage++);
    }
    const other = pick('kuang', 'other-family'); assert.equal(validateTaohuaComboRecord(trace(other), other).attack_bonus, 0);
    reject(other, r => r.attacks.forEach(a => a.apply_attack = 50));
    reject(pick(), r => r.immediate[0].temp.apply.attack = 50);
    reject(pick(), r => r.immediate[0].temp.apply.unarmed_damage = 25);
});

test('飞花用有效parry+hand对目标有效parry，门失败仍六击/耗150/计发动', () => {
    for (const boost of [true, false]) {
        const c = pick('fei'), result = validateTaohuaComboRecord(trace(c, { boost }), c);
        assert.equal(result.gate_bonus, boost); assert.equal(result.attacks, 6); assert.equal(result.neili_cost, 150);
    }
    const miss = pick('fei', 'gate-miss'); assert.equal(validateTaohuaComboRecord(trace(miss), miss).gate_bonus, false);
    assert.throws(() => validateTaohuaComboRecord(trace(miss, { boost: true }), miss));
    for (const c of [pick('fei'), pick('fei', 'baseline', 400), pick('fei', 'baseline', 800)])
        reject(c, r => r.attacks[1].apply_attack = 1);
    reject(pick('fei'), r => r.attacks[1].apply_attack = 0);
    reject(pick('fei'), r => { r.metrics[0].ability_launched = 0; r.launches = []; }, { boost: false });
});

test('原单备keys=hand、实际hand攻击序，fei原0标记保留，不清flag伪造回合修复', () => {
    const c = pick('fei'), raw = trace(c); validateTaohuaComboRecord(raw, c);
    assert.deepEqual(raw.before[0].preparation_order, ['hand']); assert.equal(raw.immediate[0].temp.action_flag, 0);
    for (const mutate of [r => r.before[0].preparation_order = ['strike', 'hand'],
        r => r.attacks[0].attack_usage = 'strike', r => r.attacks[0].attack_skill = 'luoying-shenzhang',
        r => r.actions[0].skill = 'luoying-shenzhang', r => r.attacks[3].action_flag = 1,
        r => delete r.immediate[0].temp.action_flag, r => r.immediate[0].temp.action_flag = null,
        r => r.before[0].temp.action_flag = 1]) reject(c, mutate);
});

test('静态动作严格level大于lvl，不把招名查询的>=或额外兰花动作混淆', () => {
    const c = pick(); validateTaohuaComboRecord(trace(c, { actionIndex: 6 }), c);
    assert.throws(() => validateTaohuaComboRecord(trace(c, { actionIndex: 7 }), c));
    validateTaohuaComboRecord(trace(pick('kuang', 'baseline', 400), { actionIndex: 7 }), pick('kuang', 'baseline', 400));
    const min = pick('fei', 'minimum', 140);
    validateTaohuaComboRecord(trace(min, { actionIndex: 5 }), min);
    assert.throws(() => validateTaohuaComboRecord(trace(min, { actionIndex: 6 }), min));
    for (const mutate of [r => r.actions[0].action.force++, r => r.actions[0].action.action += '错误',
        r => r.actions[0].action.lvl = 1, r => r.actions[0].action.parry = 0]) reject(pick('fei'), mutate);
});

test('原NewRandom仅选已解锁末至多六项，低门槛与各档支持集逐项核验', () => {
    for (const ability of ['kuang', 'fei']) {
        const minimum = ability === 'kuang' ? 100 : 140;
        for (const level of [minimum, 200, 400, 800]) {
            const c = pick(ability, level === minimum ? 'minimum' : 'baseline', level);
            const table = taohuaComboActions[c.parameters.skill];
            const unlocked = table.filter(a => level > a.lvl).length;
            for (let actionIndex = 0; actionIndex < table.length; actionIndex++) {
                const raw = trace(c, { actionIndex });
                if (actionIndex >= Math.max(0, unlocked - 6) && actionIndex < unlocked)
                    assert.doesNotThrow(() => validateTaohuaComboRecord(raw, c));
                else assert.throws(() => validateTaohuaComboRecord(raw, c),
                    `${ability}/${level}不可选下标${actionIndex}`);
            }
        }
    }
});

test('仅一项经络200/内力3000对照，300额外费逐击扣且与基础150分账', () => {
    const c = pick('fei', 'jingluo-surcharge');
    for (const surchargeAt of [[], [1], [0, 1, 2, 3, 4, 5]]) {
        const raw = trace(c, { surchargeAt }), r = validateTaohuaComboRecord(raw, c);
        assert.equal(r.action_surcharges, surchargeAt.length); assert.equal(r.neili_cost, 150 + 300 * surchargeAt.length);
        assert.equal(r.action_surcharge_opportunities, 6);
    }
    assert.throws(() => validateTaohuaComboRecord(trace(pick('fei'), { surchargeAt: [0] }), pick('fei')));
    reject(c, r => r.attacks[1].neili += 300, { surchargeAt: [1] });
    reject(c, r => { r.immediate[0].neili += 300; r.metrics[0].neili_cost -= 300; }, { surchargeAt: [0] });
    reject(c, r => r.actions[0].action.lvl = 0, { surchargeAt: [0] });
    reject(c, r => r.actions[0].action.action = '普通点穴', { surchargeAt: [0] });
});

test('kuang真实随机置忙和普通命中interrupt分开，已有50不覆盖，fei不凭空控忙', () => {
    const c = pick('kuang', 'target-busy50'), raw = trace(c, { results: [-1, -1, 0, -2, -2, -2] });
    const r = validateTaohuaComboRecord(raw, c);
    assert.equal(raw.dodge_checks[0].busy, 50); assert.equal(raw.dodge_checks[4].busy, 50);
    assert.equal(r.target_busy_initial, 50); assert.equal(r.target_busy_final, 1);
    assert.equal(r.busy_starts, 1); assert.equal(r.busy_opportunities, 2);
    const normal = trace(pick(), { zeroDamage: [0] });
    validateTaohuaComboRecord(normal, pick());
    assert.equal(normal.dodge_checks[2].busy, 1, '最终伤害0不能打断前一次忙乱');
    reject(c, r => { r.dodge_checks[0].busy = 1; r.dodge_checks[1].busy = 1; });
    reject(pick('fei'), r => { r.dodge_checks[0].busy = 1; r.dodge_checks[1].busy = 1; });
    reject(pick(), r => r.immediate[1].busy = 1);
    reject(pick(), r => r.dodge_checks[1].dp = r.dodge_checks[0].dp);
});

test('两条低qi原切磋收招允许不足六击，拒绝空数组/伪提前结束/继续攻击', () => {
    for (const ability of ['kuang', 'fei']) {
        const c = pick(ability, 'low-qi'), raw = trace(c), r = validateTaohuaComboRecord(raw, c);
        assert.ok(r.attacks >= 1 && r.attacks < 6); assert.equal(r.early_stop, true);
        reject(c, x => x.immediate[0].fighting_opponent = 1);
        for (const side of [0, 1]) {
            reject(c, x => x.before[side].killing_opponent = 1);
            reject(c, x => delete x.before[side].killing_opponent);
        }
        const dodges = trace(c, { results: Array(6).fill(-1) });
        assert.equal(validateTaohuaComboRecord(dodges, c).early_stop, false);
    }
    reject(pick(), x => { x.immediate[0].fighting_opponent = 0; x.immediate[1].fighting_opponent = 0; });
    assert.throws(() => validateTaohuaComboRecord(trace(pick(), { results: [] }), pick()));
    assert.throws(() => validateTaohuaComboRecord(trace(pick(), { results: [0] }), pick()));
    assert.throws(() => validateTaohuaComboRecord(trace(pick(), { results: Array(7).fill(-1) }), pick()));
    reject(pick(), x => x.before[0].killing_opponent = 0);
});

test('被动命中路径包括最终伤害0，无缺失hit_ob效果，计数和实际扣血闭合', () => {
    const c = pick(), raw = trace(c, { zeroDamage: [0, 1] });
    assert.equal(validateTaohuaComboRecord(raw, c).hits, 6); assert.equal(raw.passives.length, 6);
    for (const mutate of [r => r.passives.pop(), r => r.passives.push(copy(r.passives[0])),
        r => r.passives[0].result = 1, r => r.passives[0].route = 'force',
        r => r.passives[0].after[1].qi--, r => r.passives[0].before[1].object = '/tests/actor#999',
        r => r.passives[0].target_busy_after = 8, r => r.passives[0].neili_after++, r => r.passives[0].incoming = 1,
        r => r.metrics[0].hit--, r => r.metrics[0].riposte = 1,
        r => { r.immediate[1].qi--; r.metrics[1].qi_cost++; },
        r => { r.metrics[0].neili_cost++; r.metrics[0].neili_recovery = 1; },
        r => r.attacks[0].damage = 10000, r => r.attacks[0].type = 1,
        r => r.attacks[0].result = -1]) reject(c, mutate, { zeroDamage: [0] });
    reject(c, r => { r.attacks[0].damage = 1; r.immediate[1].qi--; r.metrics[1].qi_cost++; }, { zeroDamage: [0] });
});

test('所有局部拒绝保留同源提示，0攻击/费用/熟练，非目标随机失败', () => {
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) {
        const raw = trace(c, { colored: true }), r = validateTaohuaComboRecord(raw, c);
        assert.equal(r.accepted, false); assert.equal(r.neili_cost, 0); assert.equal(r.attack_bonus, null);
        reject(c, x => x.immediate[0].learned[c.parameters.skill] = 1);
        reject(c, x => { x.immediate[0].neili--; x.metrics[0].neili_cost = 1; });
        reject(c, x => delete x.immediate[0].temp.notify_fail);
        reject(c, x => x.immediate[0].temp.notify_fail += '不同');
    }
    reject(pick(), r => r.immediate[0].temp.notify_fail = '其它\n');
    reject(pick(), r => r.immediate[1].temp.notify_fail = '其它\n');
});

test('原busy区间/弱熟练与命中分离，未知/缺字段/无关状态仍拒', () => {
    for (const ability of ['kuang', 'fei']) for (const value of ability === 'kuang' ? [1, 6] : [null, 0, 1, 2]) {
        const raw = trace(pick(ability)); raw.immediate[0].busy = value; raw.after = copy(raw.immediate);
        validateTaohuaComboRecord(raw, pick(ability));
    }
    for (const [ability, value] of [['kuang', 0], ['kuang', 7], ['fei', 3], ['fei', -1], ['fei', 'callback']])
        reject(pick(ability), r => r.immediate[0].busy = value);
    validateTaohuaComboRecord(trace(pick('fei'), { boost: false, progress: 0 }), pick('fei'));
    reject(pick('fei', 'baseline', 400), r => r.immediate[0].learned = {});
    for (const mutate of [r => r.immediate[0].temp.extra = 1, r => r.immediate[1].temp.extra = 1,
        r => r.immediate[0].temp.apply.hand = 1, r => r.before[0].skills.hand = 999,
        r => r.before[0].effective_str++, r => r.immediate[0].cultivation.character = '狡黠多变',
        r => r.immediate[0].weapon = 'sword', r => r.immediate[0].object = r.before[1].object,
        r => delete r.attacks[0].apply_attack, r => delete r.attacks[0].apply_unarmed_damage,
        r => r.attacks[0].apply_unarmed_damage = '0', r => delete r.dodge_checks[0].busy,
        r => delete r.before[0].conditions, r => delete r.before[0].preparation_order,
        r => r.metrics[0].heartbeats = 1, r => r.metrics[0].neili_cost = null,
        r => r.metrics[1] = null, r => r.immediate[0].learned.other = 1,
        r => r.launches[0].actor = r.before[1].object, r => r.launches[0].argument = 'fei',
        r => r.callbacks = [{ state: 'done' }], r => r.elapsed = null]) reject(pick('fei'), mutate);
});

test('外层与raw条件在所有结果分类前同源，缺键/错ID不能混入未知分母', () => {
    const c = pick('fei');
    for (const outcome of ['observed', 'error', 'not_applicable']) {
        const raw = outcome === 'observed' ? trace(c) : { condition_id: c.id, outcome };
        const record = row(raw), frozen = JSON.stringify(record);
        taohuaComboEffects([record], c);
        assert.equal(JSON.stringify(record), frozen);
        for (const id of ['foreign-condition', null, undefined]) {
            const wrong = copy(record);
            if (id === undefined) delete wrong.condition_id;
            else wrong.condition_id = id;
            assert.throws(() => taohuaComboEffects([wrong], c));
        }
    }
    assert.equal(hash(cases), 'c2232aaf06dc8b3bdc49ab1071d98e1d92ef59587e5c5a87f5e6868c413d595c');
    assert.equal(hash(smoke), 'a34becd237a5cb3a99459e924d391b241bda13777a8e42b4465d574005b0412a');
});

test('统计分母分离受理/门加成/实际攻击/条件选招/忙乱，冻结condition且未知不是0', () => {
    const c = pick('fei'), report = taohuaComboEffects([row(trace(c)), row(trace(c, { boost: false }))], c);
    assert.equal(report.acceptance.rate, 1); assert.equal(report.bonus_given_accepted.rate, 0.5);
    assert.equal(report.hit_given_attack.trials, 12); assert.equal(report.actor_neili_cost.mean, 150);
    assert.equal(report.kuang_busy_given_available_attack.rate, null);
    assert.equal(report.lanhua_surcharge_given_eligible_action.rate, null);
    const extra = pick('fei', 'jingluo-surcharge'), more = taohuaComboEffects([row(trace(extra, { surchargeAt: [1, 2] }))], extra);
    assert.equal(more.base_cost.mean, 150); assert.equal(more.action_surcharge_cost.mean, 600);
    assert.equal(more.lanhua_surcharge_given_eligible_action.trials, 6);
    assert.equal(more.lanhua_surcharge_given_eligible_action.successes, 2);
    const unknown = { kind: 'sample', condition_id: c.id, method: 'perform', outcome: 'error' };
    for (const rows of [[], [row(unknown)]]) {
        const empty = taohuaComboEffects(rows, c);
        assert.equal(empty.actor_neili_cost.mean, null); assert.equal(empty.attacks_per_accepted.mean, null);
        assert.equal(empty.bonus_given_accepted.rate, null); assert.equal(empty.hit_given_attack.rate, null);
    }
    const mixed = taohuaComboEffects([row(trace(c)), row(unknown)], c);
    assert.equal(mixed.unknown_effect_samples, 1); assert.equal(mixed.acceptance.trials, 1);
    const refused = pick('fei', 'neili299'), no = taohuaComboEffects([row(trace(refused))], refused);
    assert.equal(no.refusal.rate, 1); assert.equal(no.attacks_per_accepted.mean, null); assert.equal(no.actor_neili_cost.mean, 0);
    const wrongParameters = trace(c); wrongParameters.parameters = { ability: 'kuang', skill: 'wrong' };
    assert.equal(taohuaComboEffects([row(wrongParameters)], c).actor_neili_cost.mean, 150);
    assert.throws(() => taohuaComboEffects([row(trace(pick()))], c));
    assert.throws(() => taohuaComboEffects([{ ...row(trace(c)), outcome: 'refused' }], c));
});
