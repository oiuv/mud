import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b13SourcePaths, b13ReviewedSourceHash, b13PerformConditions, validateB13Record,
    b13Effects, b13Schools } from './b13_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b13PerformConditions(catalog, read);
const smoke = b13PerformConditions(catalog, read, { smoke: true });

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
        case 'cuff20-2': {
            const level = b.effective_skills?.cuff ?? b.skills.cuff ?? 300;
            return Math.trunc(level / 20) + 2;
        }
        case 'strike25-2': {
            const level = b.effective_skills?.strike ?? b.skills.strike ?? 300;
            return Math.trunc(level / 25) + 2;
        }
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null,
    directs = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b13Schools[`${p.skill}/${p.ability}`];
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
        if (cfg.tempStats) {
            const gain = Math.trunc((b.skills[cfg.skill] ?? 300) / 6);
            b.temp.str = (b.temp.str ?? 0) + gain;
            b.temp.dex = (b.temp.dex ?? 0) + gain;
        }
    } else if (cfg.kind === 'direct') {
        const fee = cfg.feeEqualsInput
            ? (hit ? input : (cfg.feeMiss ?? 0))
            : cfg.unconditionalFee ? (cfg.feeHit ?? 0)
                : hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        b.neili -= fee;
        const busyMin = hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
        b.busy = busyMin;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            const support = cfg.percentRange
                ? (() => {
                    const out = [];
                    for (let pct = cfg.percentRange[0]; pct <= cfg.percentRange[1]; pct++)
                        out.push(...slice2SupportSet(input, pct, before[0], before[1], cfg.directType));
                    return out;
                })()
                : slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
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

test('B13 批量矩阵：13 招/58 条件、kind 分发 direct 6/combo 2/control 2/multi 1/buff 1/array 1，ID 与 families 契约', () => {
    assert.equal(cases.length, 58, 'conditions 58');
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, multi: 0, control: 0, combo: 0, buff: 0, array: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b13-[a-z]/i, '条件 ID 使用 b13- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b13-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.ok(['华山派', '大理段家'].includes(c.parameters.families[0]));
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b13SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300') || c.id.endsWith('-no-team')) kinds[c.parameters.kind]++;
    }
    assert.equal(kinds.direct, 6);
    assert.equal(kinds.combo, 2);
    assert.equal(kinds.control, 2);
    assert.equal(kinds.multi, 1);
    assert.equal(kinds.buff, 1);
    assert.equal(kinds.array, 1);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b13-shunv-jian-ning-baseline-l300'));
    assert.ok(ids.includes('b13-fanliangyi-dao-makearray-no-team'));
    assert.ok(ids.includes('b13-duanjia-jian-jing-baseline-l300'));
    assert.ok(ids.includes('b13-duanjia-jian-lian-baseline-l300'));
    assert.ok(ids.includes('b13-poyu-quan-feng-target-busy'));
    assert.ok(ids.includes('b13-huashan-zhang-piao-target-busy'));
    assert.ok(ids.includes('b13-poyu-quan-lei-already-active'));
    assert.equal(cases.find(x => x.id === 'b13-fanliangyi-dao-makearray-no-team').parameters.expected,
        'refused');
    assert.deepEqual(cases.find(x => x.id === 'b13-duanjia-jian-jing-baseline-l300').parameters.families,
        ['大理段家']);
    assert.deepEqual(cases.find(x => x.id === 'b13-huashan-quan-song-baseline-l300').parameters.families,
        ['华山派']);
});

test('B13 来源钉住真实字节', () => {
    for (const path of b13SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b13SourcePaths.every(p => !p.includes('..')));
    assert.match(b13ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b13ReviewedSourceHash);
});

test('direct 契约：宁氏一剑与风起云涌与惊天一剑条件费用与忙乱窗口', () => {
    const ning = cases.find(x => x.id === 'b13-shunv-jian-ning-baseline-l300');
    const nh = trace(ning, { input: 120 });
    validateB13Record(nh, ning);
    assert.equal(nh.before[0].neili - nh.immediate[0].neili, 220);
    const nm = trace(ning, { hit: false });
    validateB13Record(nm, ning);
    assert.equal(nm.before[0].neili - nm.immediate[0].neili, 120);
    const yong = cases.find(x => x.id === 'b13-kuangfeng-jian-yong-baseline-l300');
    const yh = trace(yong, { input: 90 });
    validateB13Record(yh, yong);
    assert.equal(yh.before[0].neili - yh.immediate[0].neili, 230);
    const ym = trace(yong, { hit: false });
    validateB13Record(ym, yong);
    assert.equal(ym.before[0].neili - ym.immediate[0].neili, 120);
    const jing = cases.find(x => x.id === 'b13-duanjia-jian-jing-baseline-l300');
    const jh = trace(jing, { input: 150 });
    validateB13Record(jh, jing);
    assert.equal(jh.before[0].neili - jh.immediate[0].neili, 150, 'hit fee equals damage input');
    const jm = trace(jing, { hit: false });
    validateB13Record(jm, jing);
    assert.equal(jm.before[0].neili - jm.immediate[0].neili, 100);
});

test('direct 契约：破石一击与混元无极与苍松式直伤', () => {
    const po = cases.find(x => x.id === 'b13-poyu-quan-po-baseline-l300');
    const ph = trace(po, { input: 200 });
    validateB13Record(ph, po);
    assert.equal(ph.before[0].neili - ph.immediate[0].neili, 220);
    const pm = trace(po, { hit: false });
    validateB13Record(pm, po);
    assert.equal(pm.before[0].neili - pm.immediate[0].neili, 120);
    const wuji = cases.find(x => x.id === 'b13-hunyuan-zhang-wuji-baseline-l300');
    const wh = trace(wuji, { input: 160 });
    validateB13Record(wh, wuji);
    assert.equal(wh.before[0].neili - wh.immediate[0].neili, 220);
    const wm = trace(wuji, { hit: false });
    validateB13Record(wm, wuji);
    assert.equal(wm.before[0].neili - wm.immediate[0].neili, 120);
    const song = cases.find(x => x.id === 'b13-huashan-quan-song-baseline-l300');
    const sh = trace(song, { input: 60 });
    validateB13Record(sh, song);
    assert.equal(sh.before[0].neili - sh.immediate[0].neili, 60);
    const sm = trace(song, { hit: false });
    validateB13Record(sm, song);
    assert.equal(sm.before[0].neili - sm.immediate[0].neili, 50);
});

test('multi 契约：华岳三神峰三段连斩无扣费', () => {
    const c = cases.find(x => x.id === 'b13-fanliangyi-dao-san-baseline-l300');
    const hit = trace(c, { input: 100, directs: 3, busy: 3 });
    validateB13Record(hit, c);
    assert.equal(hit.directs.length, 3);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 0, 'threshold-only fee');
    const partial = trace(c, { input: 80, directs: 1, busy: 3 });
    validateB13Record(partial, c);
    assert.equal(partial.directs.length, 1);
    const miss = trace(c, { hit: false });
    validateB13Record(miss, c);
    assert.equal(miss.directs.length, 0);
});

test('control 契约：封闭手 cuff/20+2 与飞絮飘渺 strike/25+2 忙乱', () => {
    const feng = cases.find(x => x.id === 'b13-poyu-quan-feng-baseline-l300');
    const fh = trace(feng, { hit: true });
    validateB13Record(fh, feng);
    assert.equal(fh.before[0].neili - fh.immediate[0].neili, 40);
    // query_skill effective cuff 450 (raw 300 mapped to poyu-quan 300):
    // 450/20+2 = 24
    assert.equal(fh.immediate[1].busy, 24);
    const fm = trace(feng, { hit: false });
    validateB13Record(fm, feng);
    assert.equal(fm.before[0].neili - fm.immediate[0].neili, 40);
    assert.ok(!fm.immediate[1].busy);
    const piao = cases.find(x => x.id === 'b13-huashan-zhang-piao-baseline-l300');
    const ph = trace(piao, { hit: true });
    validateB13Record(ph, piao);
    assert.equal(ph.before[0].neili - ph.immediate[0].neili, 30);
    // effective strike 450: 450/25+2 = 20
    assert.equal(ph.immediate[1].busy, 20);
});

test('buff 契约：雷动九天临时力道身法增益', () => {
    const c = cases.find(x => x.id === 'b13-poyu-quan-lei-baseline-l300');
    const t = trace(c);
    validateB13Record(t, c);
    assert.equal(t.before[0].neili - t.immediate[0].neili, 400);
    assert.equal(t.immediate[0].temp.lei, 1);
    // level 300: str/dex gain 300/6 = 50
    assert.equal((t.immediate[0].temp.str ?? 0) - (t.before[0].temp.str ?? 0), 50);
    assert.equal((t.immediate[0].temp.dex ?? 0) - (t.before[0].temp.dex ?? 0), 50);
});

test('combo 契约：风扫落叶六连击与五绝连环五连击', () => {
    const sao = cases.find(x => x.id === 'b13-kuangfeng-jian-sao-baseline-l300');
    const st = trace(sao, { attacks: 6, planned: 6, busy: 3 });
    validateB13Record(st, sao);
    assert.equal(st.before[0].neili - st.immediate[0].neili, 150);
    assert.equal(st.attacks.filter(a => a.actor === 0).length, 6);
    const lian = cases.find(x => x.id === 'b13-duanjia-jian-lian-baseline-l300');
    const lt = trace(lian, { attacks: 5, planned: 5, busy: 2 });
    validateB13Record(lt, lian);
    assert.equal(lt.before[0].neili - lt.immediate[0].neili, 100);
    assert.equal(lt.attacks.filter(a => a.actor === 0).length, 5);
});

test('特殊约束分支：目标忙乱、化蝶式重入、双剑和壁无队伍', () => {
    for (const id of ['b13-poyu-quan-feng-target-busy', 'b13-huashan-zhang-piao-target-busy']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB13Record(trace(c), c);
    }
    const lei = cases.find(x => x.id === 'b13-poyu-quan-lei-already-active');
    assert.equal(lei.parameters.expected, 'refused');
    validateB13Record(trace(lei), lei);
    const arr = cases.find(x => x.id === 'b13-fanliangyi-dao-makearray-no-team');
    assert.equal(arr.parameters.expected, 'refused');
    assert.equal(arr.parameters.kind, 'array');
    validateB13Record(trace(arr), arr);
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b13-shunv-jian-ning-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB13Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b13Effects(rows, c);
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
        'poyu-quan/feng': ['目前正自顾不暇，放胆攻击吧'],
        'huashan-zhang/piao': ['目前正自顾不暇，放胆攻击吧'],
        'poyu-quan/lei': ['你已经在运功中了'],
        'fanliangyi-dao/makearray': ['反两仪刀共需两人'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b13Schools)) {
        const texts = sourceRefusals(abilityFile(cfg));
        for (const gate of cfg.gates) {
            checked++;
            assert.ok(texts.includes(gate.refusal), `${key}/${gate.key} refusal matches source`);
        }
        for (const s of specials[key] ?? []) {
            checked++;
            assert.ok(texts.some(t => t.includes(s)), `${key} special refusal matches source`);
        }
        if (key === 'fanliangyi-dao/makearray') {
            checked++;
            const noTeam = cases.find(x => x.id === 'b13-fanliangyi-dao-makearray-no-team');
            assert.ok(texts.includes(noTeam.parameters.refusal), 'no-team refusal matches source');
        }
    }
    assert.ok(checked >= 25);
});
