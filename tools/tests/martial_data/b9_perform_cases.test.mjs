import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b9SourcePaths, b9ReviewedSourceHash, b9PerformConditions, validateB9Record,
    b9Effects, b9Schools } from './b9_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b9PerformConditions(catalog, read);
const smoke = b9PerformConditions(catalog, read, { smoke: true });

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
    };
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 5, planned = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b9Schools[`${p.skill}/${p.ability}`];
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
        const fee = cfg.unconditionalFee ? cfg.feeHit : hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee;
        b.busy = hit ? cfg.meBusyHit : cfg.meBusyMiss;
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            const lv = b.skills[cfg.skill] ?? 300;
            const eff = (b.effective_skills?.[cfg.skill] ?? lv);
            if (cfg.targetBusyFormula === 'guzhuo22') v.busy = Math.trunc(lv / 22) + 2;
            else if (cfg.targetBusyFormula === 'panlong20') v.busy = Math.trunc(eff / 20) + 1;
        }
    } else if (cfg.receiveOnly) {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee;
        b.busy = cfg.meBusy;
        raw.metrics[0] = { neili_cost: cfg.fee };
        if (hit) {
            v.qi = Math.max(0, before[1].qi - input);
            v.eff_qi = Math.max(0, before[1].eff_qi - Math.trunc(input / 3));
        }
    } else if (cfg.kind === 'direct') {
        const fee = cfg.unconditionalFee ? (cfg.feeHit ?? 0)
            : hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        b.neili -= fee;
        const busyMin = hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
        b.busy = busyMin;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            if (cfg.followupAttacks) {
                v.qi = Math.max(0, before[1].qi - input);
            } else {
                const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
                v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
            }
            if (cfg.targetBusyOnHit === 'ap25') {
                const ap = (b.skills.dagger ?? 0) + (b.skills[cfg.skill] ?? 0);
                v.busy = Math.trunc(ap / 25) + 1;
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

test('B9 批量矩阵：16 招/约90 条件、kind 分发 direct 9/combo 4/control 2/receive 1（含星罗棋布暗器直伤），ID 与 families 契约', () => {
    assert.ok(cases.length >= 70 && cases.length <= 110, 'conditions ~90');
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, control: 0, combo: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b9-[a-z]/i, '条件 ID 使用 b9- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b9-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.deepEqual(c.parameters.families, ['日月神教']);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b9SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    assert.equal(kinds.combo, 4);
    assert.equal(kinds.control, 2);
    assert.equal(kinds.direct, 10);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b9-canghong-bifa-jing-baseline-l300'));
    assert.ok(ids.includes('b9-guzhuo-zhang-zhen-baseline-l300'));
    assert.ok(ids.includes('b9-heixue-shenzhen-luo-no-throwing'));
    assert.ok(ids.includes('b9-heixue-shenzhen-luo-thin-throwing'));
    assert.ok(ids.includes('b9-poyue-zhao-duan-mutual-prepare'));
    assert.ok(ids.includes('b9-guzhuo-zhang-zhuo-target-busy'));
    assert.ok(ids.includes('b9-panlong-suo-chan-target-busy'));
});

test('B9 来源钉住真实字节', () => {
    for (const path of b9SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b9SourcePaths.every(p => !p.includes('..')));
    assert.match(b9ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b9ReviewedSourceHash);
});

test('direct 契约：惊虹一笔条件费用与目标忙乱', () => {
    const c = cases.find(x => x.id === 'b9-canghong-bifa-jing-baseline-l300');
    const hit = trace(c, { input: 120 });
    validateB9Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 200);
    const miss = trace(c, { hit: false });
    validateB9Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 50);
});

test('direct 契约：开天辟地高费用与忙乱窗口', () => {
    const c = cases.find(x => x.id === 'b9-pangu-qishi-kai-baseline-l300');
    const hit = trace(c, { input: 200 });
    validateB9Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 500);
    const miss = trace(c, { hit: false });
    validateB9Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 300);
});

test('direct 契约：大智若愚失手不扣内力', () => {
    const c = cases.find(x => x.id === 'b9-guzhuo-zhang-yu-baseline-l300');
    const hit = trace(c, { input: 150 });
    validateB9Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 300);
    const miss = trace(c, { hit: false });
    validateB9Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili);
});

test('direct 契约：反璞归真后续连击', () => {
    const c = cases.find(x => x.id === 'b9-guzhuo-zhang-zhen-baseline-l300');
    const hit = trace(c, { input: 100 });
    validateB9Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 400);
    const miss = trace(c, { hit: false });
    validateB9Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 400);
});

test('receive 契约：星罗棋布暗器散射直接伤血', () => {
    const c = cases.find(x => x.id === 'b9-heixue-shenzhen-luo-baseline-l300');
    const hit = trace(c, { input: 100 });
    validateB9Record(hit, c);
    assert.equal(hit.directs.length, 0);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 100);
    const miss = trace(c, { hit: false });
    validateB9Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 100);
});

test('combo 契约：天蝎藏针与绝命七杀', () => {
    const cang = cases.find(x => x.id === 'b9-jifeng-cixuefa-cang-baseline-l300');
    const t = trace(cang, { attacks: 5, busy: 3 });
    validateB9Record(t, cang);
    assert.equal(t.immediate[0].neili, t.before[0].neili - 80);
    assert.equal(t.attacks.length, 5);
    const sha = cases.find(x => x.id === 'b9-panlong-suo-sha-baseline-l300');
    const s = trace(sha, { attacks: 6, busy: 4 });
    validateB9Record(s, sha);
    assert.equal(s.immediate[0].neili, s.before[0].neili - 180);
});

test('combo 契约：天旋地转按次扣费', () => {
    const c = cases.find(x => x.id === 'b9-yuanshi-jian-xuan-baseline-l300');
    const t = trace(c, { attacks: 6, planned: 6, busy: 3 });
    validateB9Record(t, c);
    assert.equal(t.immediate[0].neili, t.before[0].neili - 180);
});

test('control 契约：大巧若拙与跗骨缠魂忙乱', () => {
    const zhuo = cases.find(x => x.id === 'b9-guzhuo-zhang-zhuo-baseline-l300');
    const h = trace(zhuo, { hit: true });
    validateB9Record(h, zhuo);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 150);
    // level 300 guzhuo-zhang; target busy = 300/22+2 = 15.
    assert.equal(h.immediate[1].busy, 15);
    const m = trace(zhuo, { hit: false });
    validateB9Record(m, zhuo);
    assert.ok(!m.immediate[1].busy);
    const chan = cases.find(x => x.id === 'b9-panlong-suo-chan-baseline-l300');
    const ch = trace(chan, { hit: true });
    validateB9Record(ch, chan);
    assert.equal(ch.immediate[0].neili, ch.before[0].neili - 80);
    // effective panlong-suo 150 (raw 300 / 2); target busy = 150/20+1 = 8.
    assert.equal(ch.immediate[1].busy, 8);
});

test('特殊约束分支：目标忙乱、缺暗器、暗器不足、互背', () => {
    for (const id of ['b9-guzhuo-zhang-zhuo-target-busy', 'b9-panlong-suo-chan-target-busy',
        'b9-heixue-shenzhen-luo-no-throwing', 'b9-heixue-shenzhen-luo-thin-throwing',
        'b9-poyue-zhao-duan-mutual-prepare']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB9Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b9-canghong-bifa-jing-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB9Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b9Effects(rows, c);
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
        'guzhuo-zhang/zhuo': ['目前正自顾不暇，放胆攻击吧'],
        'panlong-suo/chan': ['目前正自顾不暇，放胆攻击吧'],
        'heixue-shenzhen/luo': ['手中并没有拿着暗器', '至少要有二十枚暗器'],
        'poyue-zhao/duan': ['不谊和镇狱拳法互背'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b9Schools)) {
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
    assert.ok(checked >= 30);
});
