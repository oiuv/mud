import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b8SourcePaths, b8ReviewedSourceHash, b8PerformConditions, validateB8Record,
    b8Effects, b8Schools } from './b8_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b8PerformConditions(catalog, read);
const smoke = b8PerformConditions(catalog, read, { smoke: true });

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
        effective_skills: { ...src.skills },
        conditions: { ...(src.conditions ?? {}) },
    };
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 5, planned = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b8Schools[`${p.skill}/${p.ability}`];
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
    if (cfg.kind === 'buff') {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee; b.busy = cfg.meBusy;
        raw.metrics[0] = { neili_cost: cfg.fee };
        if (cfg.stackBuff) b.temp[cfg.buff] = (b.temp[cfg.buff] ?? 0) + 1;
        else b.temp[cfg.buff] = 1;
        if (cfg.tempDex) {
            const skill = b.skills[cfg.skill] ?? 300;
            b.temp.dex = (b.temp.dex ?? 0) + Math.trunc(skill / 50);
        } else if (cfg.buff === 'jingangbuhuai') {
            const force = b.skills.force ?? 300;
            b.temp.apply.armor = (b.temp.apply.armor ?? 0) + Math.trunc(force / 2);
            b.temp.apply.force = (b.temp.apply.force ?? 0) + Math.trunc(force / 3);
        } else if (cfg.stackBuff) {
            b.temp.apply.attack = (b.temp.apply.attack ?? 0) + 2;
            b.temp.apply.dodge = (b.temp.apply.dodge ?? 0) + 1;
            b.temp.apply.parry = (b.temp.apply.parry ?? 0) + 1;
        } else if (cfg.buff === 'sl_leidong') {
            const skill = b.skills[cfg.skill] ?? 300;
            const buddhism = b.skills.buddhism ?? 300;
            const amount = Math.trunc((skill + buddhism) / 6);
            b.temp.apply.attack = (b.temp.apply.attack ?? 0) + amount;
            b.temp.apply.damage = (b.temp.apply.damage ?? 0) + amount;
        }
    } else if (cfg.receiveOnly) {
        b.learned = { [p.skill]: 1 };
        const fee = hit ? 300 : 200;
        b.neili -= fee;
        b.busy = hit ? 2 : 0;
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            v.qi = Math.max(0, before[1].qi - input);
            v.eff_qi = Math.max(0, before[1].eff_qi - Math.trunc(input / 3));
        }
    } else if (cfg.crush && p.variant === 'instant-death') {
        b.learned = { [p.skill]: 1 };
        const spent = 800;
        b.busy = 3;
        b.neili -= spent;
        raw.metrics[0] = { neili_cost: spent };
        v.eff_qi = 1; v.qi = 1; v.living = 0;
    } else if (cfg.kind === 'direct') {
        const fee = cfg.unconditionalFee ? (cfg.feeHit ?? 0)
            : hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        b.neili -= fee;
        b.busy = hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
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
            if (cfg.targetBusyOnHit === 'ap30') {
                const ap = (b.skills.club ?? 0) + (b.skills[cfg.skill] ?? 0);
                v.busy = Math.trunc(ap / 30) + 2;
            }
        }
    } else if (cfg.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        b.busy = hit ? 0 : 2;
        b.neili -= 200;
        raw.metrics[0] = { neili_cost: 200 };
        if (hit) {
            const lv = b.skills[cfg.skill] ?? 300;
            v.busy = Math.trunc(lv / 20) + 2;
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = attacks ?? cfg.comboAttacks ?? 6;
        const plan = planned ?? n;
        const fee = cfg.fee;
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

test('B8 批量矩阵：15 招/约90 条件、kind 分发 direct 4/combo 6/buff 4/control 1（含慈悲字诀 receive 直伤），ID 与 families 契约', () => {
    assert.ok(cases.length >= 55 && cases.length <= 80, 'conditions ~61');
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, control: 0, combo: 0, buff: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b8-[a-z]/i, '条件 ID 使用 b8- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b8-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.deepEqual(c.parameters.families, ['少林派']);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b8SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    assert.equal(kinds.combo, 6);
    assert.equal(kinds.control, 1);
    assert.equal(kinds.buff, 4);
    assert.equal(kinds.direct, 4);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b8-luohan-gun-xiangmo-baseline-l300'));
    assert.ok(ids.includes('b8-jiasha-fumogong-zhe-instant-death'));
    assert.ok(ids.includes('b8-longxing-jian-xian-already-active'));
    assert.ok(ids.includes('b8-qujing-gunfa-zhen-wrong-force'));
    assert.ok(ids.includes('b8-dacheng-fosuo-chanrao-target-busy'));
});

test('B8 来源钉住真实字节', () => {
    for (const path of b8SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b8SourcePaths.every(p => !p.includes('..')));
    assert.match(b8ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b8ReviewedSourceHash);
});

test('direct 契约：罗汉降魔无条件费用', () => {
    const c = cases.find(x => x.id === 'b8-luohan-gun-xiangmo-baseline-l300');
    const hit = trace(c, { input: 120 });
    validateB8Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 50);
    const miss = trace(c, { hit: false });
    validateB8Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 50);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateB8Record(bad, c));
});

test('direct 契约：红霞贯日命中分支与目标忙乱', () => {
    const c = cases.find(x => x.id === 'b8-yecha-gun-hongxia-baseline-l300');
    const hit = trace(c, { input: 200 });
    validateB8Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 200);
    const miss = trace(c, { hit: false });
    validateB8Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 130);
});

test('receive 契约：慈悲字诀直接伤血', () => {
    const c = cases.find(x => x.id === 'b8-leiming-bian-cibei-baseline-l300');
    const hit = trace(c, { input: 100 });
    validateB8Record(hit, c);
    assert.equal(hit.directs.length, 0);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 300);
    const miss = trace(c, { hit: false });
    validateB8Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 200);
});

test('combo 契约：震雷乾坤与避云遮日', () => {
    const zhen = cases.find(x => x.id === 'b8-qujing-gunfa-zhen-baseline-l300');
    const t = trace(zhen, { attacks: 6, busy: 3 });
    validateB8Record(t, zhen);
    assert.equal(t.immediate[0].neili, t.before[0].neili - 200);
    assert.equal(t.attacks.length, 6);
    const zhe = cases.find(x => x.id === 'b8-jiasha-fumogong-zhe-baseline-l300');
    const z = trace(zhe, { attacks: 1, busy: 2 });
    validateB8Record(z, zhe);
    assert.equal(z.immediate[0].neili, z.before[0].neili - 300);
});

test('control 契约：缠绕诀忙乱', () => {
    const c = cases.find(x => x.id === 'b8-dacheng-fosuo-chanrao-baseline-l300');
    const h = trace(c, { hit: true });
    validateB8Record(h, c);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 200);
    // level 300 dacheng-fosuo; target busy = 300/20+2 = 17.
    assert.equal(h.immediate[1].busy, 17);
    const m = trace(c, { hit: false });
    validateB8Record(m, c);
    assert.ok(!m.immediate[1].busy);
});

test('buff 契约：即世即空与金刚不坏', () => {
    const jishi = cases.find(x => x.id === 'b8-weituo-chu-jishi-baseline-l300');
    const h = trace(jishi, {});
    validateB8Record(h, jishi);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 300);
    assert.equal(h.immediate[0].temp.sl_leidong, 1);
    const jingang = cases.find(x => x.id === 'b8-jingang-buhuaiti-jingang-baseline-l300');
    const j = trace(jingang, {});
    validateB8Record(j, jingang);
    assert.equal(j.immediate[0].temp.jingangbuhuai, 1);
});

test('特殊约束分支：即倒、目标忙乱、已激活、错误内功', () => {
    for (const id of ['b8-jiasha-fumogong-zhe-instant-death']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'observed');
        validateB8Record(trace(c, { input: 80 }), c);
    }
    for (const id of ['b8-dacheng-fosuo-chanrao-target-busy', 'b8-longxing-jian-xian-already-active',
        'b8-qujing-gunfa-zhen-wrong-force']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB8Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b8-luohan-gun-xiangmo-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB8Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b8Effects(rows, c);
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
        'longxing-jian/xian': ['神龙已经厌倦'],
        'jingang-buhuaiti/jingang': ['已经运起金刚不坏'],
        'weituo-chu/jishi': ['目前气血翻涌'],
        'yiwei-dujiang/dujiang': ['已经运起「一苇渡江」'],
        'qujing-gunfa/zhen': ['没有激发少林内功'],
        'dacheng-fosuo/chanrao': ['目前正自顾不暇，放胆攻击吧'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b8Schools)) {
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
