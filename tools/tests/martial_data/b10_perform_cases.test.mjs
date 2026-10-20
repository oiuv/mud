import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b10SourcePaths, b10ReviewedSourceHash, b10PerformConditions, validateB10Record,
    b10Effects, b10Schools } from './b10_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b10PerformConditions(catalog, read);
const smoke = b10PerformConditions(catalog, read, { smoke: true });

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

function targetBusyFor(cfg, b, hit) {
    if (!hit) return 0;
    const effSkill = name => {
        const raw = b.skills[name] ?? 0;
        const mapped = b.mappings?.[name];
        return Math.trunc(raw / 2) + (mapped ? (b.skills[mapped] ?? 0) : 0);
    };
    switch (cfg.targetBusyFormula) {
        case 'sword-random-24': {
            const sword = effSkill('sword');
            const n = Math.floor(sword / 24);
            return n > 0 ? 2 + Math.floor(n / 2) : 2;
        }
        case 'ap40': {
            const skill = b.skills[cfg.skill] ?? 300;
            const dodge = b.skills.dodge ?? 200;
            return Math.floor((skill + Math.floor(dodge / 2)) / 40) + 1;
        }
        case 'skill24-2': return Math.floor((b.skills[cfg.skill] ?? 300) / 24) + 2;
        case 'skill-random-26': {
            const level = b.skills[cfg.skill] ?? 300;
            const n = Math.floor(level / 26);
            return n > 0 ? 2 + Math.floor(n / 2) : 2;
        }
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 5, planned = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b10Schools[`${p.skill}/${p.ability}`];
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
        const meMin = cfg.meBusyHitMin ?? cfg.meBusyHit ?? 0;
        b.busy = hit ? meMin : (cfg.meBusyMiss ?? 0);
        raw.metrics[0] = { neili_cost: fee };
        if (hit) v.busy = targetBusyFor(cfg, b, hit);
    } else if (cfg.kind === 'direct') {
        const fee = hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        b.neili -= fee;
        const busyMin = hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
        b.busy = busyMin;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
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

test('B10 批量矩阵：15 招/约70 条件、kind 分发 direct 6/combo 4/control 5，ID 与 families 契约', () => {
    assert.ok(cases.length >= 55 && cases.length <= 95, 'conditions ~70');
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, control: 0, combo: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b10-[a-z]/i, '条件 ID 使用 b10- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b10-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.deepEqual(c.parameters.families, ['绝情谷']);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b10SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    assert.equal(kinds.direct, 6);
    assert.equal(kinds.control, 5);
    assert.equal(kinds.combo, 4);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b10-zilei-jian-luo-baseline-l300'));
    assert.ok(ids.includes('b10-yinyang-ren-heng-baseline-l300'));
    assert.ok(ids.includes('b10-poshui-zhang-tai-baseline-l300'));
    assert.ok(ids.includes('b10-jueqing-zhang-wan-target-busy'));
    assert.ok(ids.includes('b10-yinyang-ren-hua-target-busy'));
    assert.ok(ids.includes('b10-tianjue-dao-suo-target-busy'));
});

test('B10 来源钉住真实字节', () => {
    for (const path of b10SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b10SourcePaths.every(p => !p.includes('..')));
    assert.match(b10ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b10ReviewedSourceHash);
});

test('direct 契约：落雷式与破阳刀条件费用与忙乱窗口', () => {
    const luo = cases.find(x => x.id === 'b10-zilei-jian-luo-baseline-l300');
    const hit = trace(luo, { input: 120 });
    validateB10Record(hit, luo);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 200);
    const miss = trace(luo, { hit: false });
    validateB10Record(miss, luo);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 180);
    const yang = cases.find(x => x.id === 'b10-poguang-dao-yang-baseline-l300');
    const yh = trace(yang, { input: 150 });
    validateB10Record(yh, yang);
    assert.equal(yh.immediate[0].neili, yh.before[0].neili - 200);
});

test('direct 契约：魂飞魄散掌力直伤', () => {
    const c = cases.find(x => x.id === 'b10-jueqing-zhang-hun-baseline-l300');
    const hit = trace(c, { input: 180 });
    validateB10Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 200);
    const miss = trace(c, { hit: false });
    validateB10Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 100);
});

test('direct 契约：泰山压顶高费用与忙乱', () => {
    const c = cases.find(x => x.id === 'b10-poshui-zhang-tai-baseline-l300');
    const hit = trace(c, { input: 200 });
    validateB10Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 180);
    const miss = trace(c, { hit: false });
    validateB10Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 100);
});

test('control 契约：狂风式与寒冰环剑技忙乱', () => {
    const feng = cases.find(x => x.id === 'b10-zilei-jian-feng-baseline-l300');
    const h = trace(feng, { hit: true });
    validateB10Record(h, feng);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 120);
    const m = trace(feng, { hit: false });
    validateB10Record(m, feng);
    assert.ok(!m.immediate[1].busy);
    const bing = cases.find(x => x.id === 'b10-poguang-dao-bing-baseline-l300');
    const bh = trace(bing, { hit: true });
    validateB10Record(bh, bing);
    assert.equal(bh.immediate[0].neili, bh.before[0].neili - 120);
});

test('control 契约：万念俱灰 ap/40 忙乱', () => {
    const c = cases.find(x => x.id === 'b10-jueqing-zhang-wan-baseline-l300');
    const h = trace(c, { hit: true });
    validateB10Record(h, c);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 80);
    // skill 300 + raw dodge 302/2 151 = ap 451; 451/40+1 = 12
    assert.equal(h.immediate[1].busy, 12);
    const m = trace(c, { hit: false });
    validateB10Record(m, c);
    assert.equal(m.immediate[0].neili, m.before[0].neili - 30);
});

test('control 契约：日月无华 skill/24+2 忙乱', () => {
    const c = cases.find(x => x.id === 'b10-yinyang-ren-hua-baseline-l300');
    const h = trace(c, { hit: true });
    validateB10Record(h, c);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 120);
    // level 300: 300/24+2 = 14
    assert.equal(h.immediate[1].busy, 14);
    const m = trace(c, { hit: false });
    validateB10Record(m, c);
    assert.ok(!m.immediate[1].busy);
});

test('combo 契约：阴阳环与九星连珠按次扣费', () => {
    const huan = cases.find(x => x.id === 'b10-yinyang-ren-huan-baseline-l300');
    const h = trace(huan, { attacks: 6, planned: 6, busy: 3 });
    validateB10Record(h, huan);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 120);
    const lian = cases.find(x => x.id === 'b10-guxing-jian-lian-baseline-l300');
    const l = trace(lian, { attacks: 5, planned: 5, busy: 4 });
    validateB10Record(l, lian);
    assert.equal(l.immediate[0].neili, l.before[0].neili - 100);
});

test('combo 契约：千山孤鸿影低段数', () => {
    const c = cases.find(x => x.id === 'b10-guhong-zhang-qian-baseline-l300');
    const t = trace(c, { attacks: 4, planned: 4, busy: 2 });
    validateB10Record(t, c);
    assert.equal(t.immediate[0].neili, t.before[0].neili - 80);
});

test('特殊约束分支：目标忙乱', () => {
    for (const id of ['b10-zilei-jian-feng-target-busy', 'b10-poguang-dao-bing-target-busy',
        'b10-jueqing-zhang-wan-target-busy', 'b10-yinyang-ren-hua-target-busy',
        'b10-tianjue-dao-suo-target-busy']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB10Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b10-zilei-jian-luo-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB10Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b10Effects(rows, c);
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
        'zilei-jian/feng': ['目前正自顾不暇，放胆攻击吧'],
        'poguang-dao/bing': ['目前正自顾不暇，放胆攻击吧'],
        'jueqing-zhang/wan': ['目前正自顾不暇，放胆攻击吧'],
        'yinyang-ren/hua': ['目前正自顾不暇，放胆攻击吧'],
        'tianjue-dao/suo': ['目前正自顾不暇，放胆攻击吧'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b10Schools)) {
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
