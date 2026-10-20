import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b7SourcePaths, b7ReviewedSourceHash, b7PerformConditions, validateB7Record,
    b7Effects, b7Schools } from './b7_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b7PerformConditions(catalog, read);
const smoke = b7PerformConditions(catalog, read, { smoke: true });

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
    const cfg = b7Schools[`${p.skill}/${p.ability}`];
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
        b.temp[cfg.buff] = 1;
        const skill = b.skills[cfg.skill] ?? 300;
        b.temp.apply.attack = (b.temp.apply.attack ?? 0) + Math.trunc(skill * 2 / 5);
        b.temp.apply.defense = (b.temp.apply.defense ?? 0) + Math.trunc(skill * 2 / 5);
        b.temp.apply.damage = (b.temp.apply.damage ?? 0) + Math.trunc(skill / 4);
    } else if (cfg.receiveOnly) {
        b.learned = { [p.skill]: 1 };
        const fee = hit ? 0 : 0;
        b.neili -= fee;
        b.busy = cfg.meBusy ?? 3;
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            v.qi = Math.max(0, before[1].qi - input);
            v.eff_qi = Math.max(0, before[1].eff_qi - Math.trunc(input / 3));
        }
    } else if (cfg.crush && p.variant === 'instant-death') {
        b.learned = { [p.skill]: 1 };
        const spent = cfg.kind === 'combo' ? 500 : 500;
        b.busy = cfg.kind === 'combo' ? 3 : 2;
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
        if (cfg.selfWound === 'quarter') {
            b.qi = Math.max(0, before[0].qi - Math.trunc(input / 4));
        }
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
            if (cfg.selfWound === 'quarter') {
                b.qi = Math.max(0, before[0].qi - Math.trunc(input / 4));
            }
            if (cfg.targetBusyOnHit === 2) v.busy = 2;
            else if (cfg.targetBusyOnHit === 'skill30') {
                const lv = b.effective_skills?.[cfg.skill] ?? b.skills[cfg.skill] ?? 300;
                v.busy = Math.trunc(lv / 30);
            } else if (cfg.targetBusyOnHit === 'ap25') {
                const ap = (b.skills.hand ?? 0) + (b.skills[cfg.skill] ?? 0);
                v.busy = Math.trunc(ap / 25) + 2;
            }
        }
    } else if (cfg.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        const fee = hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            const lv = b.skills[cfg.skill] ?? 300;
            v.busy = Math.trunc(lv / 19) + 2;
        } else {
            b.busy = cfg.meBusyMiss ?? 0;
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

test('B7 批量矩阵：21 招/约120 条件、kind 分发 direct 16/combo 2/control 1/buff 1/receive 2，ID 与 families 契约', () => {
    assert.ok(cases.length >= 90 && cases.length <= 140, 'conditions ~120');
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, control: 0, combo: 0, buff: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b7-[a-z]/i, '条件 ID 使用 b7- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b7-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.deepEqual(c.parameters.families, ['少林派']);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b7SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    assert.equal(kinds.combo, 2);
    assert.equal(kinds.control, 1);
    assert.equal(kinds.buff, 1);
    assert.equal(kinds.direct, 17);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b7-jingang-zhi-fumo-baseline-l300'));
    assert.ok(ids.includes('b7-rulai-zhang-zong-instant-death'));
    assert.ok(ids.includes('b7-yintuoluo-zhua-chixue-instant-death'));
    assert.ok(ids.includes('b7-nianhua-zhi-fuxue-target-busy'));
    assert.ok(ids.includes('b7-ranmu-daofa-zhenyan-already-active'));
});

test('B7 来源钉住真实字节', () => {
    for (const path of b7SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b7SourcePaths.every(p => !p.includes('..')));
    assert.match(b7ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b7ReviewedSourceHash);
});

test('direct 契约：金刚伏魔诀费用分支与支持集', () => {
    const c = cases.find(x => x.id === 'b7-jingang-zhi-fumo-baseline-l300');
    const hit = trace(c, { input: 120 });
    validateB7Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 300);
    const missC = cases.find(x => x.id === 'b7-jingang-zhi-fumo-miss');
    const miss = trace(missC, { hit: false });
    validateB7Record(miss, missC);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 100);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateB7Record(bad, c));
});

test('direct 契约：一指点三脉无条件费用与目标忙乱', () => {
    const c = cases.find(x => x.id === 'b7-jingang-zhi-san-baseline-l300');
    const hit = trace(c, { input: 200 });
    validateB7Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 800);
    assert.equal(hit.immediate[1].busy, 10);
    const miss = trace(c, { hit: false });
    validateB7Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 800);
});

test('direct 契约：菩提寂灭自伤', () => {
    const c = cases.find(x => x.id === 'b7-duoluoye-zhi-jimie-baseline-l300');
    const hit = trace(c, { input: 400 });
    validateB7Record(hit, c);
    assert.equal(hit.immediate[0].qi, hit.before[0].qi - 100);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 500);
});

test('receive 契约：凌空指穴直接伤血', () => {
    const c = cases.find(x => x.id === 'b7-qufannao-zhi-lingkong-baseline-l300');
    const hit = trace(c, { input: 100 });
    validateB7Record(hit, c);
    assert.equal(hit.directs.length, 0);
    const miss = trace(c, { hit: false });
    validateB7Record(miss, c);
});

test('combo 契约：万佛朝宗与群山叠影', () => {
    const zong = cases.find(x => x.id === 'b7-rulai-zhang-zong-baseline-l300');
    const t = trace(zong, { attacks: 6, busy: 3 });
    validateB7Record(t, zong);
    assert.equal(t.immediate[0].neili, t.before[0].neili - 300);
    assert.equal(t.attacks.length, 6);
    const ying = cases.find(x => x.id === 'b7-xumishan-zhang-ying-baseline-l300');
    const y = trace(ying, { attacks: 1, busy: 2 });
    validateB7Record(y, ying);
    assert.equal(y.immediate[0].neili, y.before[0].neili - 150);
});

test('control 契约：拈花拂穴忙乱', () => {
    const c = cases.find(x => x.id === 'b7-nianhua-zhi-fuxue-baseline-l300');
    const h = trace(c, { hit: true });
    validateB7Record(h, c);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 100);
    // level 300 nianhua-zhi; target busy = 300/19+2 = 17.
    assert.equal(h.immediate[1].busy, 17);
    const m = trace(c, { hit: false });
    validateB7Record(m, c);
    assert.equal(m.immediate[0].neili, m.before[0].neili - 30);
    assert.equal(m.immediate[0].busy, 3);
});

test('buff 契约：燃木真焰临时增益', () => {
    const c = cases.find(x => x.id === 'b7-ranmu-daofa-zhenyan-baseline-l300');
    const h = trace(c, {});
    validateB7Record(h, c);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 400);
    assert.equal(h.immediate[0].temp.zhen_yan, 1);
    // skill 300; attack/defense += 120, damage += 75.
    assert.equal((h.immediate[0].temp.apply.attack ?? 0) - (h.before[0].temp.apply.attack ?? 0), 120);
    assert.equal((h.immediate[0].temp.apply.defense ?? 0) - (h.before[0].temp.apply.defense ?? 0), 120);
    assert.equal((h.immediate[0].temp.apply.damage ?? 0) - (h.before[0].temp.apply.damage ?? 0), 75);
});

test('特殊约束分支：即倒、目标忙乱、已激活、错误内功', () => {
    for (const id of ['b7-rulai-zhang-zong-instant-death', 'b7-yintuoluo-zhua-chixue-instant-death']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'observed');
        validateB7Record(trace(c, { input: 80 }), c);
    }
    for (const id of ['b7-nianhua-zhi-fuxue-target-busy', 'b7-ranmu-daofa-zhenyan-already-active',
        'b7-jingang-zhi-fumo-wrong-force']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB7Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b7-jingang-zhi-fumo-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB7Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b7Effects(rows, c);
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
        'ranmu-daofa/zhenyan': ['无法连续施展'],
        'nianhua-zhi/fuxue': ['目前正自顾不暇，放胆攻击吧'],
        'jingang-zhi/fumo': ['没有激发少林内功'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b7Schools)) {
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
    assert.ok(checked >= 40);
});
