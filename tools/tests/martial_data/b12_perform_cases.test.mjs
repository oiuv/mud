import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b12SourcePaths, b12ReviewedSourceHash, b12PerformConditions, validateB12Record,
    b12Effects, b12Schools } from './b12_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b12PerformConditions(catalog, read);
const smoke = b12PerformConditions(catalog, read, { smoke: true });

function state(cfg, side) {
    const src = side ? cfg.target : cfg.actor;
    const temp = { apply: { armor: 1 } };
    for (const [key, value] of Object.entries(src.temp ?? {})) {
        const parts = key.split('/');
        let node = temp;
        for (const part of parts.slice(0, -1)) node = node[part] ??= {};
        node[parts.at(-1)] = value;
    }
    return {
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        skills: { ...src.skills }, learned: {}, mappings: { ...src.mappings },
        preparations: { ...src.preparations },
        temp,
        busy: src.busy ?? null,
        qi: src.properties.qi, eff_qi: src.properties.eff_qi, jing: src.properties.jing,
        eff_jing: src.properties.eff_jing, neili: src.properties.neili,
        max_neili: src.properties.max_neili,
        jingli: src.properties.jingli, max_jingli: src.properties.max_jingli,
        str: src.properties.str, int: src.properties.int, con: src.properties.con,
        dex: src.properties.dex, shen: src.properties.shen,
        gender: src.properties.gender, character: src.properties.character,
        combat_exp: src.properties.combat_exp,
        effective_str: src.properties.str, effective_dex: src.properties.dex + 20,
        effective_skills: Object.fromEntries(Object.entries(src.skills).map(([k, v]) =>
            [k, src.mappings?.[k] ? Math.trunc(v / 2) + (src.skills[src.mappings[k]] ?? 0) : Math.trunc(v / 2)])),
        conditions: { ...(src.conditions ?? {}) },
        equipment: src.equipment ? { ...src.equipment } : null,
    };
}

function targetBusyFor(cfg, b, hit) {
    if (!hit) return 0;
    // query_skill(skill) is the effective level in the driver snapshot.
    const level = b.effective_skills?.[cfg.skill] ?? b.skills[cfg.skill] ?? 300;
    switch (cfg.targetBusyFormula) {
        case 'skill20-1': return Math.trunc(level / 20) + 1;
        case 'skill30-2': return Math.trunc(level / 30) + 2;
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null,
    directs = null, stole = false } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b12Schools[`${p.skill}/${p.ability}`];
    const before = [state(p, 0), state(p, 1)];
    const raw = {
        kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        outcome: p.expected, elapsed: 0.01, before,
        immediate: structuredClone(before), after: structuredClone(before),
        metrics: [{}, {}], actions: [], attacks: [], passives: [], defenses: [],
        dodge_checks: [], interfaces: [], callbacks: [], dropped: [], terminals: [],
        launches: [], refusals: [], directs: [], reason: '',
    };
    const b = raw.immediate[0], v = raw.immediate[1];
    if (!accepted) {
        raw.reason = p.refusal;
        raw.refusals = [{ actor: before[0].object, reason: p.refusal }];
        raw.after = structuredClone(raw.immediate);
        return raw;
    }
    raw.launches = [{ actor: before[0].object, skill: p.skill, argument: p.ability + ' right' }];
    if (cfg.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        const fee = hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee;
        b.busy = hit ? (cfg.meBusyHit ?? 0) : (cfg.meBusyMiss ?? 0);
        raw.metrics[0] = { neili_cost: fee };
        if (hit) v.busy = targetBusyFor(cfg, b, hit);
    } else if (cfg.kind === 'multi') {
        b.learned = { [p.skill]: 1 };
        const n = directs ?? (hit ? cfg.multiDirects : 0);
        b.neili -= cfg.fee;
        raw.metrics[0] = { neili_cost: cfg.fee, direct: n };
        b.busy = Math.min(cfg.hitBusyMax, Math.max(cfg.hitBusyMin, busy));
        let qi = v.qi;
        for (let i = 0; i < n; i++) {
            const dmg = input;
            raw.directs.push({ actor: 0, target: 1, type: 0, damage: dmg });
            qi = Math.max(1, qi - dmg);
        }
        v.qi = qi;
    } else if (cfg.kind === 'buff') {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee;
        b.busy = cfg.meBusy ?? 0;
        raw.metrics[0] = { neili_cost: cfg.fee };
        b.temp[cfg.buff] = 1;
        if (cfg.tempDex) {
            const gain = Math.trunc((b.skills[cfg.skill] ?? 300) / 50);
            b.temp.dex = (b.temp.dex ?? 0) + gain;
        }
    } else if (cfg.kind === 'direct') {
        const crushHit = hit && cfg.crush && p.variant === 'instant-death';
        const stealHit = hit && cfg.weaponSteal && p.variant === 'steal-weapon';
        const fee = crushHit ? cfg.crushFee
            : stealHit ? cfg.feeHit
                : cfg.unconditionalFee ? (cfg.feeHit ?? 0)
                    : hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        b.neili -= fee;
        const busyMin = crushHit ? cfg.crushBusy
            : hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
        b.busy = busyMin;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: fee };
        if (crushHit) {
            v.eff_qi = 0; v.qi = 0; v.ghost = 1; v.living = 0;
        } else if (stealHit) {
            v.equipment = null;
            b.equipment = { type: 'sword', hold: false };
        } else if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
            if (cfg.targetBusyOnHit) v.busy = targetBusyFor(cfg, b, hit);
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = attacks ?? cfg.comboAttacks ?? 6;
        const plan = planned ?? n;
        const fee = cfg.feePerAttack ? plan * cfg.feePerAttack : cfg.fee;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee };
        b.busy = Math.min(cfg.comboBusyMax, Math.max(cfg.comboBusyMin, busy));
        for (let i = 0; i < n; i++) {
            raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 20 });
            v.qi -= 20;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B12 批量矩阵：13 招/66 条件、kind 分发 direct 8/combo 2/control 1/multi 1/buff 1，ID 与 families 契约', () => {
    assert.equal(cases.length, 66, 'conditions 66');
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, multi: 0, control: 0, combo: 0, buff: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b12-[a-z]/i, '条件 ID 使用 b12- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b12-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.deepEqual(c.parameters.families, ['红花会']);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b12SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    assert.equal(kinds.direct, 8);
    assert.equal(kinds.combo, 2);
    assert.equal(kinds.control, 1);
    assert.equal(kinds.multi, 1);
    assert.equal(kinds.buff, 1);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b12-baihua-cuoquan-hong-baseline-l300'));
    assert.ok(ids.includes('b12-zhuangzi-wu-hua-baseline-l300'));
    assert.ok(ids.includes('b12-huilong-bifa-cang-baseline-l300'));
    assert.ok(ids.includes('b12-baihua-cuoquan-luan-target-busy'));
    assert.ok(ids.includes('b12-jiandun-zhusuo-fu-target-busy'));
    assert.ok(ids.includes('b12-baihua-cuoquan-hong-instant-death'));
    assert.ok(ids.includes('b12-zhuihun-jian-zhu-steal-weapon'));
    assert.ok(ids.includes('b12-zhuangzi-wu-hua-already-active'));
    assert.ok(ids.includes('b12-huilong-bifa-cang-no-throwing'));
});

test('B12 来源钉住真实字节', () => {
    for (const path of b12SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b12SourcePaths.every(p => !p.includes('..')));
    assert.match(b12ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b12ReviewedSourceHash);
});

test('direct 契约：战神轰天诀与刀影重重与追魂夺命条件费用与忙乱窗口', () => {
    const hong = cases.find(x => x.id === 'b12-baihua-cuoquan-hong-baseline-l300');
    const hh = trace(hong, { input: 120 });
    validateB12Record(hh, hong);
    assert.equal(hh.before[0].neili - hh.immediate[0].neili, 400);
    const hm = trace(hong, { hit: false });
    validateB12Record(hm, hong);
    assert.equal(hm.before[0].neili - hm.immediate[0].neili, 150);
    const ying = cases.find(x => x.id === 'b12-hanwang-qingdao-ying-baseline-l300');
    const yh = trace(ying, { input: 90 });
    validateB12Record(yh, ying);
    assert.equal(yh.before[0].neili - yh.immediate[0].neili, 80);
    const ym = trace(ying, { hit: false });
    validateB12Record(ym, ying);
    assert.equal(ym.before[0].neili - ym.immediate[0].neili, 40);
    const zhui = cases.find(x => x.id === 'b12-zhuihun-jian-zhui-baseline-l300');
    const zh = trace(zhui, { input: 150 });
    validateB12Record(zh, zhui);
    assert.equal(zh.before[0].neili - zh.immediate[0].neili, 150);
});

test('direct 契约：雷霆万钧与催魂掌直伤', () => {
    const lei = cases.find(x => x.id === 'b12-benlei-zhang-lei-baseline-l300');
    const lh = trace(lei, { input: 200 });
    validateB12Record(lh, lei);
    assert.equal(lh.before[0].neili - lh.immediate[0].neili, 300);
    const lm = trace(lei, { hit: false });
    validateB12Record(lm, lei);
    assert.equal(lm.before[0].neili - lm.immediate[0].neili, 200);
    const cui = cases.find(x => x.id === 'b12-heisha-zhang-cui-baseline-l300');
    const ch = trace(cui, { input: 60 });
    validateB12Record(ch, cui);
    assert.equal(ch.before[0].neili - ch.immediate[0].neili, 100);
    const cm = trace(cui, { hit: false });
    validateB12Record(cm, cui);
    assert.equal(cm.before[0].neili - cm.immediate[0].neili, 0);
});

test('direct 契约：百花错乱百分比零直伤', () => {
    const c = cases.find(x => x.id === 'b12-baihua-cuoquan-luan-baseline-l300');
    const hit = trace(c, { input: 80 });
    validateB12Record(hit, c);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 200);
    const miss = trace(c, { hit: false });
    validateB12Record(miss, c);
    assert.equal(miss.before[0].neili - miss.immediate[0].neili, 130);
});

test('multi 契约：千头万绪三段连击', () => {
    const c = cases.find(x => x.id === 'b12-jiandun-zhusuo-qian-baseline-l300');
    const hit = trace(c, { input: 100, directs: 3, busy: 4 });
    validateB12Record(hit, c);
    assert.equal(hit.directs.length, 3);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 300);
    const partial = trace(c, { input: 80, directs: 1, busy: 3 });
    validateB12Record(partial, c);
    assert.equal(partial.directs.length, 1);
});

test('control 契约：缚字诀 skill/20+1 忙乱', () => {
    const c = cases.find(x => x.id === 'b12-jiandun-zhusuo-fu-baseline-l300');
    const hit = trace(c, { hit: true });
    validateB12Record(hit, c);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 0);
    // query_skill effective 150 (raw 300 / 2): 150/20+1 = 8
    assert.equal(hit.immediate[1].busy, 8);
    const miss = trace(c, { hit: false });
    validateB12Record(miss, c);
    assert.ok(!miss.immediate[1].busy);
});

test('buff 契约：化蝶临时身法增益', () => {
    const c = cases.find(x => x.id === 'b12-zhuangzi-wu-hua-baseline-l300');
    const t = trace(c);
    validateB12Record(t, c);
    assert.equal(t.before[0].neili - t.immediate[0].neili, 200);
    assert.equal(t.immediate[0].temp.hua_die, 1);
    // level 300: dex gain 300/50 = 6
    assert.equal((t.immediate[0].temp.dex ?? 0) - (t.before[0].temp.dex ?? 0), 6);
});

test('combo 契约：百花错易六连击与夺命连环五连击', () => {
    const yi = cases.find(x => x.id === 'b12-baihua-cuoquan-yi-baseline-l300');
    const yt = trace(yi, { attacks: 6, planned: 6, busy: 3 });
    validateB12Record(yt, yi);
    assert.equal(yt.before[0].neili - yt.immediate[0].neili, 300);
    assert.equal(yt.attacks.filter(a => a.actor === 0).length, 6);
    const lian = cases.find(x => x.id === 'b12-lianhuan-mizongtui-lian-baseline-l300');
    const lt = trace(lian, { attacks: 5, planned: 5, busy: 2 });
    validateB12Record(lt, lian);
    assert.equal(lt.before[0].neili - lt.immediate[0].neili, 150);
    assert.equal(lt.attacks.filter(a => a.actor === 0).length, 5);
});

test('direct 契约：掌藏龙暗器直伤与消耗', () => {
    const c = cases.find(x => x.id === 'b12-huilong-bifa-cang-baseline-l300');
    const hit = trace(c, { input: 150 });
    validateB12Record(hit, c);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 100);
    assert.equal(hit.directs.length, 1);
    const miss = trace(c, { hit: false });
    validateB12Record(miss, c);
    assert.equal(miss.before[0].neili - miss.immediate[0].neili, 0);
});

test('特殊约束分支：目标忙乱、碾压即倒、夺械、化蝶重入、暗器不足', () => {
    for (const id of ['b12-baihua-cuoquan-luan-target-busy', 'b12-jiandun-zhusuo-fu-target-busy']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB12Record(trace(c), c);
    }
    const crush = cases.find(x => x.id === 'b12-baihua-cuoquan-hong-instant-death');
    assert.equal(crush.parameters.expected, 'observed');
    validateB12Record(trace(crush, { hit: true }), crush);
    const zhuCrush = cases.find(x => x.id === 'b12-zhuihun-jian-zhu-instant-death');
    validateB12Record(trace(zhuCrush, { hit: true }), zhuCrush);
    const steal = cases.find(x => x.id === 'b12-zhuihun-jian-zhu-steal-weapon');
    assert.equal(steal.parameters.expected, 'observed');
    validateB12Record(trace(steal, { hit: true }), steal);
    for (const id of ['b12-zhuangzi-wu-hua-already-active', 'b12-huilong-bifa-cang-no-throwing']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB12Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b12-baihua-cuoquan-hong-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB12Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b12Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});

const ansiMacros = ['HIM', 'NOR', 'HIG', 'HIR', 'HIY', 'HIC', 'HIW', 'CYN', 'YEL', 'GRN',
    'BLU', 'MAG', 'WHT', 'RED', 'HBRED', 'HBWHT', 'HBYEL', 'HBGRN', 'HBBLU', 'HBCYN',
    'HBMAG', 'HBBLK', 'BLK', 'BBLU', 'BRED', 'BGRN', 'BYEL', 'BCYN', 'BMAG', 'BBLK',
    'U', 'BLI', 'REV', 'HBU', 'BEEP'];

function sourceRefusals(path) {
    const src = readFileSync(path, 'utf8');
    const defs = Object.fromEntries(ansiMacros.map(n => [n, '""']));
    for (const line of src.split('\n')) {
        const m = line.match(/^#define\s+(\w+)\s+(.+)$/);
        if (m && m[2].includes('"')) defs[m[1]] = m[2];
    }
    const expand = expr => {
        let out = expr;
        for (let guard = 0; guard < 30; guard++) {
            let changed = false;
            out = out.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (all, name) => {
                if (defs[name] !== undefined && defs[name].includes('"')) {
                    changed = true;
                    return '(' + defs[name] + ')';
                }
                return all;
            });
            if (!changed) break;
        }
        return out;
    };
    const literal = text => {
        const parts = [...text.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
        let s = parts.join('');
        s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        return s.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
    };
    return [...src.matchAll(/notify_fail\(([\s\S]*?)\);/g)].map(x => literal(expand(x[1])));
}

test('拒绝文本与原 notify_fail 逐字节一致，含特殊约束分支', () => {
    const specials = {
        'baihua-cuoquan/luan': ['目前正自顾不暇，放胆攻击吧'],
        'jiandun-zhusuo/fu': ['目前正自顾不暇，放胆攻击吧'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b12Schools)) {
        const texts = sourceRefusals(abilityFile(cfg));
        for (const gate of cfg.gates) {
            checked++;
            assert.ok(texts.includes(gate.refusal), `${key}/${gate.key} refusal matches source`);
        }
        for (const s of specials[key] ?? []) {
            checked++;
            assert.ok(texts.some(t => t.includes(s)), `${key} special refusal matches source`);
        }
    }
    assert.ok(checked >= 25);
});
