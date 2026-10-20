import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b11SourcePaths, b11ReviewedSourceHash, b11PerformConditions, validateB11Record,
    b11Effects, b11Schools } from './b11_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b11PerformConditions(catalog, read);
const smoke = b11PerformConditions(catalog, read, { smoke: true });

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
    switch (cfg.targetBusyFormula) {
        case 'skill18-2': return Math.trunc((b.skills[cfg.skill] ?? 300) / 18) + 2;
        case 'damage15': return 2;
        case 'random3': return 1;
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null,
    directs = null, stolen = false } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b11Schools[`${p.skill}/${p.ability}`];
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
        if (!cfg.weaponSteal && hit) v.busy = targetBusyFor(cfg, b, hit);
        if (cfg.weaponSteal && hit) {
            v.equipment = null;
            b.equipment = { type: 'sword', hold: false };
        }
    } else if (cfg.kind === 'multi') {
        b.learned = { [p.skill]: 1 };
        const n = directs ?? (hit ? cfg.multiDirects : 0);
        const fee = cfg.feeMin + Math.floor((cfg.feeMax - cfg.feeMin) / 2);
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee, direct: n };
        b.busy = Math.min(cfg.hitBusyMax, Math.max(cfg.hitBusyMin, busy));
        let qi = v.qi;
        for (let i = 0; i < n; i++) {
            const dmg = input;
            raw.directs.push({ actor: 0, target: 1, type: 0, damage: dmg });
            qi = Math.max(1, qi - dmg);
        }
        v.qi = qi;
    } else if (cfg.kind === 'direct' && cfg.receiveOnly) {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee;
        b.busy = cfg.meBusy ?? 2;
        raw.metrics[0] = { neili_cost: cfg.fee };
        if (hit) {
            v.qi = Math.max(1, v.qi - input);
            v.eff_qi = Math.max(1, v.eff_qi - Math.floor(input / 2));
        }
    } else if (cfg.kind === 'direct') {
        const crushHit = hit && cfg.crush && p.variant === 'instant-death';
        const fee = crushHit ? cfg.crushFee
            : cfg.unconditionalFee ? (cfg.feeHit ?? 0)
                : hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        b.neili -= fee;
        const busyMin = crushHit ? cfg.crushBusy
            : hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
        b.busy = busyMin;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            if (crushHit) {
                v.eff_qi = 0; v.qi = 0; v.ghost = 1; v.living = 0;
            } else {
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
                raw.metrics[0].direct = 1;
                const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
                v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
                if (cfg.followupAttacks) {
                    for (let i = 0; i < cfg.followupAttacks; i++) {
                        raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 5 });
                        v.qi = Math.max(1, v.qi - 5);
                    }
                }
                if (cfg.targetBusyOnHit) v.busy = targetBusyFor(cfg, b, hit);
            }
        } else if (cfg.followupAttacks) {
            for (let i = 0; i < cfg.followupAttacks; i++) {
                raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 5 });
                v.qi = Math.max(1, v.qi - 5);
            }
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

test('B11 批量矩阵：13 招/约70 条件、kind 分发 direct 9/multi 1/control 2/combo 1，ID 与 families 契约', () => {
    assert.ok(cases.length >= 55 && cases.length <= 100, 'conditions ~70');
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, multi: 0, control: 0, combo: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b11-[a-z]/i, '条件 ID 使用 b11- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b11-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.deepEqual(c.parameters.families, ['丐帮']);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b11SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    assert.equal(kinds.direct, 9);
    assert.equal(kinds.multi, 1);
    assert.equal(kinds.control, 2);
    assert.equal(kinds.combo, 1);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b11-xianglong-zhang-hui-baseline-l300'));
    assert.ok(ids.includes('b11-guanri-jian-guan-baseline-l300'));
    assert.ok(ids.includes('b11-pomie-jinzhen-du-baseline-l300'));
    assert.ok(ids.includes('b11-xiaoyaoyou-xian-target-busy'));
    assert.ok(ids.includes('b11-xianglong-zhang-qu-no-weapon'));
    assert.ok(ids.includes('b11-suohou-gong-suo-instant-death'));
});

test('B11 来源钉住真实字节', () => {
    for (const path of b11SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b11SourcePaths.every(p => !p.includes('..')));
    assert.match(b11ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b11ReviewedSourceHash);
});

test('direct 契约：震惊百里与绝命一踢条件费用与忙乱窗口', () => {
    const zhen = cases.find(x => x.id === 'b11-xianglong-zhang-zhen-baseline-l300');
    const hit = trace(zhen, { input: 120 });
    validateB11Record(hit, zhen);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 400);
    const miss = trace(zhen, { hit: false });
    validateB11Record(miss, zhen);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 200);
    const jue = cases.find(x => x.id === 'b11-jueming-tui-jue-baseline-l300');
    const jh = trace(jue, { input: 80 });
    validateB11Record(jh, jue);
    assert.equal(jh.immediate[0].neili, jh.before[0].neili - 100);
    const jm = trace(jue, { hit: false });
    validateB11Record(jm, jue);
    assert.equal(jm.immediate[0].neili, jm.before[0].neili - 30);
});

test('direct 契约：焚阳剑与傲尘剑兵器直伤', () => {
    const fen = cases.find(x => x.id === 'b11-guanri-jian-fen-baseline-l300');
    const hit = trace(fen, { input: 150 });
    validateB11Record(hit, fen);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 300);
    const miss = trace(fen, { hit: false });
    validateB11Record(miss, fen);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 100);
    const ao = cases.find(x => x.id === 'b11-pichen-jian-ao-baseline-l300');
    const ah = trace(ao, { input: 90 });
    validateB11Record(ah, ao);
    assert.equal(ah.immediate[0].neili, ah.before[0].neili - 150);
});

test('direct 契约：观日神诀无条件费用与后续九剑', () => {
    const c = cases.find(x => x.id === 'b11-guanri-jian-guan-baseline-l300');
    const hit = trace(c, { input: 200 });
    validateB11Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 600);
    assert.equal(hit.attacks.filter(a => a.actor === 0).length, 9);
    const miss = trace(c, { hit: false });
    validateB11Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 600);
    assert.equal(miss.attacks.filter(a => a.actor === 0).length, 9);
});

test('direct 契约：五丁开山非标准命中', () => {
    const c = cases.find(x => x.id === 'b11-tongchui-zhang-kai-baseline-l300');
    const hit = trace(c, { input: 60 });
    validateB11Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 80);
    const miss = trace(c, { hit: false });
    validateB11Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 30);
});

test('multi 契约：亢龙有悔三掌连击', () => {
    const c = cases.find(x => x.id === 'b11-xianglong-zhang-hui-baseline-l300');
    const hit = trace(c, { input: 100, directs: 3, busy: 4 });
    validateB11Record(hit, c);
    assert.equal(hit.directs.length, 3);
    const fee = hit.immediate[0].neili - hit.before[0].neili;
    // stored as positive spent
    assert.ok(hit.before[0].neili - hit.immediate[0].neili >= 400);
    assert.ok(hit.before[0].neili - hit.immediate[0].neili <= 800);
    const partial = trace(c, { input: 80, directs: 1, busy: 3 });
    validateB11Record(partial, c);
    assert.equal(partial.directs.length, 1);
    const miss = trace(c, { hit: false, directs: 0 });
    validateB11Record(miss, c);
    assert.equal(miss.directs.length, 0);
});

test('control 契约：双龙取水夺械', () => {
    const c = cases.find(x => x.id === 'b11-xianglong-zhang-qu-baseline-l300');
    const hit = trace(c, { hit: true, stolen: true });
    validateB11Record(hit, c);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 300);
    const miss = trace(c, { hit: false });
    validateB11Record(miss, c);
    assert.equal(miss.before[0].neili - miss.immediate[0].neili, 200);
});

test('control 契约：仙游诀 skill/18+2 忙乱', () => {
    const c = cases.find(x => x.id === 'b11-xiaoyaoyou-xian-baseline-l300');
    const hit = trace(c, { hit: true });
    validateB11Record(hit, c);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 80);
    // level 300: 300/18+2 = 18
    assert.equal(hit.immediate[1].busy, 18);
    const miss = trace(c, { hit: false });
    validateB11Record(miss, c);
    assert.equal(miss.before[0].neili - miss.immediate[0].neili, 50);
    assert.ok(!miss.immediate[1].busy);
});

test('combo 契约：飞龙在天六连击', () => {
    const c = cases.find(x => x.id === 'b11-xianglong-zhang-fei-baseline-l300');
    const t = trace(c, { attacks: 6, planned: 6, busy: 3 });
    validateB11Record(t, c);
    assert.equal(t.before[0].neili - t.immediate[0].neili, 300);
    assert.equal(t.attacks.filter(a => a.actor === 0).length, 6);
});

test('receive 契约：金针渡劫暗器散射', () => {
    const c = cases.find(x => x.id === 'b11-pomie-jinzhen-du-baseline-l300');
    const hit = trace(c, { input: 150 });
    validateB11Record(hit, c);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 100);
    const miss = trace(c, { hit: false });
    validateB11Record(miss, c);
    assert.equal(miss.before[0].neili - miss.immediate[0].neili, 100);
});

test('特殊约束分支：目标忙乱、夺械无兵器、碾压即倒、暗器不足', () => {
    for (const id of ['b11-xiaoyaoyou-xian-target-busy']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB11Record(trace(c), c);
    }
    const noWeapon = cases.find(x => x.id === 'b11-xianglong-zhang-qu-no-weapon');
    assert.equal(noWeapon.parameters.expected, 'refused');
    validateB11Record(trace(noWeapon), noWeapon);
    const crush = cases.find(x => x.id === 'b11-suohou-gong-suo-instant-death');
    assert.equal(crush.parameters.expected, 'observed');
    validateB11Record(trace(crush, { hit: true }), crush);
    for (const id of ['b11-pomie-jinzhen-du-no-throwing', 'b11-pomie-jinzhen-du-thin-throwing']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB11Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b11-xianglong-zhang-zhen-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB11Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b11Effects(rows, c);
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
        'xiaoyaoyou/xian': ['目前正自顾不暇，放胆攻击吧'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b11Schools)) {
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
