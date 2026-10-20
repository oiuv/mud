import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b6SourcePaths, b6ReviewedSourceHash, b6PerformConditions, validateB6Record,
    b6Effects, b6Schools } from './b6_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b6PerformConditions(catalog, read);
const smoke = b6PerformConditions(catalog, read, { smoke: true });

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
    const cfg = b6Schools[`${p.skill}/${p.ability}`];
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
        b.temp.apply.parry = (b.temp.apply.parry ?? 0) + Math.trunc(b.skills[cfg.skill] / 3);
    } else if (cfg.receiveOnly) {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee; b.busy = cfg.meBusy;
        raw.metrics[0] = { neili_cost: cfg.fee };
        // consume throwing
        b.handing = 'throwing';
        b.handing_details = { object: '/tests/weapon#200', skill_type: 'throwing', consistence: 100, amount: 9 };
        b.ammunition = 10; b.temp.handing = '/tests/weapon#200';
        if (hit) {
            v.qi = Math.max(0, before[1].qi - input);
            v.eff_qi = Math.max(0, before[1].eff_qi - input);
        }
    } else if (cfg.instantDeath && p.variant === 'instant-death') {
        b.learned = { [p.skill]: 1 };
        b.busy = 1;
        b.neili -= 50;
        raw.metrics[0] = { neili_cost: 50 };
        v.eff_qi = 1; v.qi = 1; v.living = 0;
    } else if (cfg.kind === 'direct') {
        const fee = hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        const spent = cfg.ability === 'zhen' ? 50 : fee;
        b.neili -= spent;
        b.busy = hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: spent };
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
            if (cfg.jingWound) {
                v.eff_jing = Math.max(0, before[1].eff_jing - cfg.jingWound[0]);
                v.jing = Math.min(v.eff_jing, before[1].jing);
            }
            if (cfg.poison) v.conditions = { ...(v.conditions ?? {}), [cfg.poison]: { level: 10 } };
            if (cfg.targetBusyOnHit) v.busy = 1;
        } else if (cfg.targetBusyOnMiss) {
            v.busy = cfg.targetBusyOnMiss;
        }
    } else if (cfg.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        const fee = hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            const level = (b.effective_skills?.hand ?? b.skills.hand ?? 0);
            v.busy = Math.trunc(level / 30) + 2;
        } else {
            b.busy = cfg.meBusyMiss ?? 0;
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = attacks ?? cfg.comboAttacks ?? 8;
        const plan = planned ?? n;
        const fee = cfg.feePerAttack ? plan * cfg.feePerAttack : cfg.fee;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee };
        b.busy = Math.min(cfg.comboBusyMax, Math.max(cfg.comboBusyMin, busy));
        for (const key of cfg.applyKeys ?? ['attack'])
            b.temp.apply[key] = (b.temp.apply[key] ?? 0) + 1;
        for (const key of cfg.applyKeys ?? ['attack'])
            b.temp.apply[key] = (b.temp.apply[key] ?? 0) - 1;
        for (let i = 0; i < n; i++) {
            raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 20 });
            v.qi -= 20;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B6 批量矩阵：19 招/约110 条件、kind 分发 direct 13/combo 3/control 1/buff 1/receive 1，ID 与 families 契约', () => {
    assert.ok(cases.length >= 85 && cases.length <= 110, 'conditions ~100');
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, control: 0, combo: 0, buff: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b6-[a-z]/i, '条件 ID 使用 b6- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b6-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 2);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b6SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    // Baseline tally over the 19 moves: 13 direct (incl. 1 receive) + 3 combo + 1 control + 1 buff + 1 more direct.
    assert.equal(kinds.combo, 3);
    assert.equal(kinds.control, 1);
    assert.equal(kinds.buff, 1);
    assert.equal(kinds.direct, 14);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b6-bagua-dao-mang-baseline-l300'));
    assert.ok(ids.includes('b6-dagou-bang-ban-instant-death'));
    assert.ok(ids.includes('b6-bagua-zhang-jia-no-throwing'));
    assert.ok(ids.includes('b6-zhemei-shou-zhe-target-busy'));
    assert.ok(ids.includes('b6-dagou-bang-feng-already-active'));
});

test('B6 per-cluster families：商镇 2 派、丐桃 2 派、胡苗 2 派、杂簇 2 派', () => {
    for (const c of cases) {
        const f = c.parameters.families;
        const skill = c.parameters.skill;
        if (['bagua-dao', 'bagua-quan', 'bagua-zhang', 'bazhen-zhang', 'wai-bagua'].includes(skill))
            assert.deepEqual(f, ['商家堡', '八卦门']);
        else if (skill === 'dagou-bang') assert.deepEqual(f, ['丐帮', '桃花岛']);
        else if (skill === 'hujia-daofa') assert.deepEqual(f, ['关外胡家', '中原苗家']);
        else if (['liuhe-dao', 'liuhe-zhang'].includes(skill)) assert.deepEqual(f, ['丐帮', '关外胡家']);
        else if (['liuyang-zhang', 'zhemei-shou'].includes(skill)) assert.deepEqual(f, ['灵鹫宫', '逍遥派']);
        else if (skill === 'pomopima-jian') assert.deepEqual(f, ['梅庄', '明教']);
        else assert.fail('unexpected skill ' + skill);
    }
});

test('B6 来源钉住真实字节', () => {
    for (const path of b6SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b6SourcePaths.every(p => !p.includes('..')));
    assert.match(b6ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b6ReviewedSourceHash);
});

test('direct 契约：劈天神芒费用分支与支持集', () => {
    const c = cases.find(x => x.id === 'b6-bagua-dao-mang-baseline-l300');
    const hit = trace(c, { input: 120 });
    validateB6Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 150);
    const missC = cases.find(x => x.id === 'b6-bagua-dao-mang-miss');
    const miss = trace(missC, { hit: false });
    validateB6Record(miss, missC);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 60);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateB6Record(bad, c));
});

test('direct 契约：八卦震无条件费用与目标忙乱', () => {
    const c = cases.find(x => x.id === 'b6-wai-bagua-zhen-baseline-l300');
    const hit = trace(c, { input: 80 });
    validateB6Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 50);
    const miss = trace(c, { hit: false });
    validateB6Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 50);
});

test('receive 契约：掌中夹镖暗器消耗', () => {
    const c = cases.find(x => x.id === 'b6-bagua-zhang-jia-baseline-l300');
    const hit = trace(c, { input: 100 });
    validateB6Record(hit, c);
    assert.equal(hit.directs.length, 0);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 100);
    const miss = trace(c, { hit: false });
    validateB6Record(miss, c);
});

test('combo 契约：天刀八势与八方藏刀势', () => {
    const tian = cases.find(x => x.id === 'b6-bagua-dao-tian-baseline-l300');
    const t = trace(tian, { attacks: 8, busy: 3 });
    validateB6Record(t, tian);
    assert.equal(t.immediate[0].neili, t.before[0].neili - 250);
    assert.equal(t.attacks.length, 8);
    const cang = cases.find(x => x.id === 'b6-hujia-daofa-cang-baseline-l300');
    const cg = trace(cang, { attacks: 8, busy: 2 });
    validateB6Record(cg, cang);
    assert.equal(cg.immediate[0].neili, cg.before[0].neili - 220);
    assert.equal(cg.attacks.length, 8);
});

test('combo 契约：天下无狗按计划攻击数扣费', () => {
    const c = cases.find(x => x.id === 'b6-dagou-bang-tian-baseline-l300');
    const t = trace(c, { attacks: 7, planned: 7, busy: 4 });
    validateB6Record(t, c);
    assert.equal(t.immediate[0].neili, t.before[0].neili - 210);
    assert.equal(t.attacks.length, 7);
});

test('control 契约：折梅式忙乱', () => {
    const c = cases.find(x => x.id === 'b6-zhemei-shou-zhe-baseline-l300');
    const h = trace(c, { hit: true });
    validateB6Record(h, c);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 110);
    // level 300 hand; target busy = 300/30+2 = 12.
    assert.equal(h.immediate[1].busy, 12);
    const m = trace(c, { hit: false });
    validateB6Record(m, c);
    assert.equal(m.immediate[0].neili, m.before[0].neili - 80);
    assert.equal(m.immediate[0].busy, 1);
});

test('buff 契约：封字诀临时招架', () => {
    const c = cases.find(x => x.id === 'b6-dagou-bang-feng-baseline-l300');
    const h = trace(c, {});
    validateB6Record(h, c);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 150);
    assert.equal(h.immediate[0].temp.feng_zijue, 1);
    // skill 300; apply/parry += 300/3 = 100 over the prior value.
    assert.equal((h.immediate[0].temp.apply.parry ?? 0) - (h.before[0].temp.apply.parry ?? 0), 100);
});

test('特殊约束分支：即倒、无暗器、目标忙乱、已激活', () => {
    for (const id of ['b6-dagou-bang-ban-instant-death']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'observed');
        validateB6Record(trace(c, { input: 80 }), c);
    }
    for (const id of ['b6-bagua-zhang-jia-no-throwing', 'b6-zhemei-shou-zhe-target-busy',
        'b6-dagou-bang-feng-already-active']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB6Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b6-bagua-dao-mang-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB6Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b6Effects(rows, c);
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
        'dagou-bang/feng': ['你现在正在施展「封字诀」。\n'],
        'bagua-zhang/jia': ['你现在手中并没有拿着暗器。\n'],
        'zhemei-shou/zhe': ['目前正自顾不暇，放胆攻击吧。\n'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b6Schools)) {
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
    assert.ok(checked >= 35);
});
