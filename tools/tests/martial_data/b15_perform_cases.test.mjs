import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b15SourcePaths, b15ReviewedSourceHash, b15PerformConditions, validateB15Record,
    b15Effects, b15Schools } from './b15_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b15PerformConditions(catalog, read);
const smoke = b15PerformConditions(catalog, read, { smoke: true });

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
    const rawSkill = b.skills?.[cfg.skill] ?? 300;
    const rawDodge = b.skills?.dodge ?? 300;
    switch (cfg.targetBusyFormula) {
        case 'skill16': return Math.trunc(rawSkill / 16);
        case 'skill16-2': return Math.trunc(rawSkill / 16) + 2;
        case 'ap45-1': {
            const ap = rawSkill + Math.trunc(rawDodge / 2);
            return Math.trunc(ap / 45) + 1;
        }
        case 'skill25-1': return Math.trunc(rawSkill / 25) + 1;
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null,
    directs = null, death = false } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b15Schools[`${p.skill}/${p.ability}`];
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
        const disarmBranch = cfg.disarm && (c.id.includes('disarm'));
        const fee = disarmBranch ? 200 : hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee;
        b.busy = disarmBranch ? 2 : hit ? (cfg.meBusyHitMin ?? cfg.meBusyHit ?? 0) : (cfg.meBusyMiss ?? 0);
        raw.metrics[0] = { neili_cost: fee };
        if (hit) v.busy = disarmBranch ? 3 : targetBusyFor(cfg, b, hit);
    } else if (cfg.kind === 'multi') {
        b.learned = { [p.skill]: 1 };
        const n = directs ?? (hit ? cfg.multiDirects : 0);
        b.neili -= cfg.fee;
        b.busy = cfg.hitBusyMin;
        raw.metrics[0] = { neili_cost: cfg.fee, direct: n };
        let qi = v.qi;
        for (let i = 0; i < n; i++) {
            raw.directs.push({ actor: 0, target: 1, type: 0, damage: input });
            qi = Math.max(1, qi - input);
        }
        v.qi = qi;
    } else if (cfg.kind === 'sacrifice') {
        b.learned = { [p.skill]: 1 };
        b.max_neili -= 50;
        raw.metrics[0] = { neili_cost: 0 };
        if (!hit) {
            b.busy = cfg.missBusy;
        } else {
            b.neili = 0;
            b.max_neili -= 10;
            b.busy = cfg.hitBusyMin;
            if (death) {
                raw.terminals.push({ actor: 0, target: 1 });
                b.ghost = 1; b.living = 0; b.busy = 0;
                b.max_neili -= 20;
            } else {
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
                raw.metrics[0].direct = 1;
                const support = b15Support(input, cfg.percent, before[0], before[1], cfg.directType);
                v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
            }
        }
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
            const support = b15Support(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = attacks ?? cfg.comboAttacksMax ?? cfg.comboAttacks;
        const plan = planned ?? n;
        const fee = cfg.feePerAttack ? plan * cfg.feePerAttack : cfg.fee;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee };
        b.busy = Math.min(cfg.comboBusyMax, Math.max(cfg.comboBusyMin, busy));
        if (cfg.comboHitBonus) {
            b.temp.apply = { ...(b.temp.apply ?? {}) };
            b.temp.apply.attack = (b.temp.apply.attack ?? 0) - cfg.comboHitBonus;
        }
        for (let i = 0; i < n; i++) {
            raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 20 });
            v.qi -= 20;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

import { slice2SupportSet } from './school_slice2_cases.mjs';
function b15Support(input, percent, actor, target, directType) {
    return slice2SupportSet(input, percent, actor, target, directType);
}

test('B15 批量矩阵：19 招/92 条件、kind 分发 direct 9/combo 4/control 4/multi 1/sacrifice 1，ID 与 families 契约', () => {
    assert.equal(cases.length, 92, 'conditions 92');
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, multi: 0, control: 0, combo: 0, sacrifice: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b15-[a-z]/i, '条件 ID 使用 b15- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b15-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.ok(['全真教', '衡山派'].includes(c.parameters.families[0]));
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b15SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    assert.equal(kinds.direct, 9);
    assert.equal(kinds.control, 4);
    assert.equal(kinds.combo, 4);
    assert.equal(kinds.multi, 1);
    assert.equal(kinds.sacrifice, 1);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b15-jinguan-yusuo-suo-baseline-l300'));
    assert.ok(ids.includes('b15-qixing-shou-po-baseline-l300'));
    assert.ok(ids.includes('b15-tonggui-jian-fen-baseline-l300'));
    assert.ok(ids.includes('b15-kongming-quan-kong-baseline-l300'));
    assert.ok(ids.includes('b15-biluo-zhang-lian-baseline-l300'));
    assert.ok(ids.includes('b15-luoyan-jian-luo-baseline-l300'));
    assert.ok(ids.includes('b15-tonggui-jian-fen-self-death'));
    assert.ok(ids.includes('b15-tianzhu-jian-suo-disarm'));
    assert.ok(ids.includes('b15-jinguan-yusuo-suo-target-busy'));
    assert.ok(ids.includes('b15-liuyun-zhang-die-target-busy'));
    assert.deepEqual(cases.find(x => x.id === 'b15-jinguan-yusuo-suo-baseline-l300').parameters.families,
        ['全真教']);
    assert.deepEqual(cases.find(x => x.id === 'b15-biluo-zhang-lian-baseline-l300').parameters.families,
        ['衡山派']);
});

test('B15 来源钉住真实字节', () => {
    for (const path of b15SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b15SourcePaths.every(p => !p.includes('..')));
    assert.match(b15ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b15ReviewedSourceHash);
});

test('direct 契约：朝拜天罡落空零费用与三花聚顶内力判定', () => {
    const bai = cases.find(x => x.id === 'b15-tiangang-chenfa-bai-baseline-l300');
    const bh = trace(bai, { input: 120 });
    validateB15Record(bh, bai);
    assert.equal(bh.before[0].neili - bh.immediate[0].neili, 180);
    const bm = trace(bai, { hit: false });
    validateB15Record(bm, bai);
    assert.equal(bm.before[0].neili - bm.immediate[0].neili, 0, 'miss pays nothing');
    const ju = cases.find(x => x.id === 'b15-haotian-zhang-ju-baseline-l300');
    const jh = trace(ju, { input: 80 });
    validateB15Record(jh, ju);
    assert.equal(jh.before[0].neili - jh.immediate[0].neili, 200);
    const jm = trace(ju, { hit: false });
    validateB15Record(jm, ju);
    assert.equal(jm.before[0].neili - jm.immediate[0].neili, 60);
});

test('direct 契约：空空如也无条件费用与乱剑覆花同费', () => {
    const kong = cases.find(x => x.id === 'b15-kongming-quan-kong-baseline-l300');
    const kh = trace(kong, { input: 150 });
    validateB15Record(kh, kong);
    assert.equal(kh.before[0].neili - kh.immediate[0].neili, 80);
    const km = trace(kong, { hit: false });
    validateB15Record(km, kong);
    assert.equal(km.before[0].neili - km.immediate[0].neili, 80);
    const luan = cases.find(x => x.id === 'b15-furong-jian-luan-baseline-l300');
    const lh = trace(luan, { input: 90 });
    validateB15Record(lh, luan);
    assert.equal(lh.before[0].neili - lh.immediate[0].neili, 100);
    const lm = trace(luan, { hit: false });
    validateB15Record(lm, luan);
    assert.equal(lm.before[0].neili - lm.immediate[0].neili, 100);
});

test('sacrifice 契约：玉石俱焚先扣最大内力并分支死亡', () => {
    const fen = cases.find(x => x.id === 'b15-tonggui-jian-fen-baseline-l300');
    const hit = trace(fen, { input: 200 });
    validateB15Record(hit, fen);
    assert.equal(hit.before[0].max_neili - hit.immediate[0].max_neili >= 50, true);
    assert.equal(hit.immediate[0].neili, 0);
    const missC = cases.find(x => x.id === 'b15-tonggui-jian-fen-miss');
    const miss = trace(missC, { hit: false });
    validateB15Record(miss, missC);
    assert.equal(miss.before[0].max_neili - miss.immediate[0].max_neili, 50);
    const deathC = cases.find(x => x.id === 'b15-tonggui-jian-fen-self-death');
    const death = trace(deathC, { death: true });
    validateB15Record(death, deathC);
    assert.equal(death.immediate[0].neili, 0);
});

test('multi 契约：破穹云蛟三掌无条件费用', () => {
    const po = cases.find(x => x.id === 'b15-qixing-shou-po-baseline-l300');
    const both = trace(po, { input: 80, directs: 3 });
    validateB15Record(both, po);
    assert.equal(both.before[0].neili - both.immediate[0].neili, 200);
    const one = trace(po, { input: 50, directs: 1 });
    validateB15Record(one, po);
    assert.equal(one.before[0].neili - one.immediate[0].neili, 200);
    const none = trace(po, { hit: false });
    validateB15Record(none, po);
    assert.equal(none.before[0].neili - none.immediate[0].neili, 200);
});

test('control 契约：玄门金锁与空明若玄与流云叠影忙乱', () => {
    const suo = cases.find(x => x.id === 'b15-jinguan-yusuo-suo-baseline-l300');
    const sh = trace(suo, { hit: true });
    validateB15Record(sh, suo);
    assert.equal(sh.before[0].neili - sh.immediate[0].neili, 100);
    assert.equal(sh.immediate[1].busy, targetBusyFor(b15Schools['jinguan-yusuo/suo'], sh.immediate[0], true));
    const sm = trace(suo, { hit: false });
    validateB15Record(sm, suo);
    assert.equal(sm.before[0].neili - sm.immediate[0].neili, 50);
    const ruo = cases.find(x => x.id === 'b15-kongming-quan-ruo-baseline-l300');
    const rh = trace(ruo, { hit: true });
    validateB15Record(rh, ruo);
    assert.equal(rh.before[0].neili - rh.immediate[0].neili, 50);
    const die = cases.find(x => x.id === 'b15-liuyun-zhang-die-baseline-l300');
    const dh = trace(die, { hit: true });
    validateB15Record(dh, die);
    assert.equal(dh.before[0].neili - dh.immediate[0].neili, 80);
});

test('combo 契约：重阳连环掌与峰连碧罗与一剑落九雁按攻击扣费', () => {
    const lian = cases.find(x => x.id === 'b15-chongyang-shenzhang-lian-baseline-l300');
    const lt = trace(lian, { attacks: 4, planned: 4, busy: 2 });
    validateB15Record(lt, lian);
    assert.equal(lt.before[0].neili - lt.immediate[0].neili, 80);
    const biluo = cases.find(x => x.id === 'b15-biluo-zhang-lian-baseline-l300');
    const bt = trace(biluo, { attacks: 5, planned: 5, busy: 3 });
    validateB15Record(bt, biluo);
    assert.equal(bt.before[0].neili - bt.immediate[0].neili, 100);
    const luo = cases.find(x => x.id === 'b15-luoyan-jian-luo-baseline-l300');
    const lt2 = trace(luo, { attacks: 9, planned: 9, busy: 4 });
    validateB15Record(lt2, luo);
    assert.equal(lt2.before[0].neili - lt2.immediate[0].neili, 200);
});

test('特殊约束分支：目标忙乱拒绝与夺械', () => {
    for (const id of ['b15-jinguan-yusuo-suo-target-busy', 'b15-kongming-quan-ruo-target-busy',
        'b15-liuyun-zhang-die-target-busy', 'b15-tianzhu-jian-suo-target-busy']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB15Record(trace(c), c);
    }
    const disarm = cases.find(x => x.id === 'b15-tianzhu-jian-suo-disarm');
    const t = trace(disarm, { hit: true });
    validateB15Record(t, disarm);
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b15-haotian-zhang-ju-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB15Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b15Effects(rows, c);
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
        'jinguan-yusuo/suo': ['目前正自顾不暇，放胆攻击吧'],
        'kongming-quan/ruo': ['目前正自顾不暇，放胆攻击吧'],
        'liuyun-zhang/die': ['目前正自顾不暇，放胆攻击吧'],
        'tianzhu-jian/suo': ['目前正自顾不暇，放胆攻击吧'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b15Schools)) {
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
    assert.ok(checked >= 36);
});
