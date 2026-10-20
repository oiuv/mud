import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b4SourcePaths, b4ReviewedSourceHash, b4PerformConditions, validateB4Record,
    b4Effects, b4Schools } from './b4_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b4PerformConditions(catalog, read);
const smoke = b4PerformConditions(catalog, read, { smoke: true });

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
        effective_str: src.properties.str, effective_dex: src.properties.dex + 20,
        effective_skills: { ...src.skills },
        conditions: { ...(src.conditions ?? {}) },
    };
}

function trace(c, { hit = true, input = 100, attacks = 5, busy = 5, directs = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b4Schools[`${p.skill}/${p.ability}`];
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
    if (cfg.stages) {
        // multi-direct (xian): n sequential do_damage, fixed fee, me busy 3.
        const n = directs ?? (hit ? 3 : 0);
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee; b.busy = cfg.meBusy;
        raw.metrics[0] = { neili_cost: cfg.fee, direct: n };
        for (let i = 0; i < n; i++) {
            const dmg = input + i * 10;
            raw.directs.push({ actor: 0, target: 1, type: 0, damage: dmg });
        }
        if (n > 0) {
            // Simplified: reduce target qi/eff_qi proportionally to total damage.
            const total = n * input + (n * (n - 1) / 2) * 10;
            v.qi = Math.max(0, before[1].qi - total);
            v.eff_qi = Math.max(0, before[1].eff_qi - total);
        }
    } else if (cfg.kind === 'direct') {
        const fee = hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee; b.busy = hit ? cfg.hitBusy : cfg.missBusy;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.dodge_checks = [{ result: 0 }];
            raw.metrics[0].direct = 1;
            const support = cfg.percentRange
                ? (() => {
                    const out = [];
                    for (let pr = cfg.percentRange[0]; pr <= cfg.percentRange[1]; pr++)
                        out.push(...slice2SupportSet(input, pr, before[0], before[1], cfg.directType));
                    return out;
                })()
                : slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
            if (cfg.hitBuff) {
                const parts = cfg.hitBuff.split('/');
                let node = v.temp;
                for (const part of parts.slice(0, -1)) node = node[part] ??= {};
                node[parts.at(-1)] = 1;
            }
        }
    } else if (cfg.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee;
        raw.metrics[0] = { neili_cost: cfg.fee };
        if (hit) {
            if (cfg.ability === 'gui') {
                const ap = (b.skills[cfg.skill] ?? 0) * 2;
                v.busy = Math.trunc(ap / 45) + 2;
                b.busy = cfg.hitMeBusy;
            } else {
                const level = b.skills[cfg.skill] ?? 0;
                v.busy = Math.trunc(level / 22) + 2;
                b.busy = 0;
            }
        } else {
            b.busy = cfg.missMeBusy;
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = cfg.comboAttacks ?? attacks;
        b.neili -= cfg.fee; raw.metrics[0] = { neili_cost: cfg.fee };
        b.busy = Math.min(cfg.comboBusyMax ?? 5, Math.max(cfg.comboBusyMin ?? 1, busy));
        for (let i = 0; i < n; i++) {
            raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 20 });
            v.qi -= 20;
        }
        for (const key of cfg.applyKeys ?? ['attack']) {
            b.temp.apply[key] = (b.temp.apply[key] ?? 0) + 20;
            b.temp.apply[key] = (b.temp.apply[key] ?? 0) - 20;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B4 批量矩阵：45 条件、kind 分发 direct 4/control 2/combo 2、ID 与 families 契约', () => {
    assert.ok(cases.length >= 44 && cases.length <= 48, 'conditions ~45');
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, control: 0, combo: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b4-[a-z]/i, '条件 ID 使用 b4- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b4-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 3);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b4SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l200')) kinds[c.parameters.kind]++;
    }
    assert.deepEqual(kinds, { direct: 4, control: 2, combo: 2 });
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b4-pixie-jian-duo-already-blind'));
    assert.ok(ids.includes('b4-pixie-jian-gui-target-busy'));
    assert.ok(ids.includes('b4-pixie-jian-po-target-no-perform'));
    assert.ok(ids.includes('b4-huashan-jian-jie-target-busy'));
    assert.ok(ids.includes('b4-pixie-jian-duo-unarmed'));
    assert.ok(ids.includes('b4-huashan-jian-xian-one-direct'));
    assert.ok(ids.includes('b4-huashan-jian-xian-two-direct'));
    assert.ok(ids.includes('b4-huashan-jian-long-no-weapon'));
});

test('B4 per-skill families：pixie 3 派、huashan 4 派', () => {
    for (const c of cases) {
        const f = c.parameters.families;
        if (c.parameters.skill === 'pixie-jian')
            assert.deepEqual(f, ['华山派', '日月神教', '少林派']);
        else assert.deepEqual(f, ['华山派', '日月神教', '慕容世家', '神龙教']);
    }
});

test('B4 来源钉住真实字节', () => {
    for (const path of b4SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b4SourcePaths.every(p => !p.includes('..')));
    if (b4ReviewedSourceHash !== 'PENDING') {
        assert.match(b4ReviewedSourceHash, /^[a-f0-9]{64}$/);
        const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
        assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b4ReviewedSourceHash);
    }
});

test('direct 契约：鬼影夺目费用分支、致盲标记与支持集', () => {
    const c = cases.find(x => x.id === 'b4-pixie-jian-duo-baseline-l200');
    const hit = trace(c, { input: 120 });
    validateB4Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 80);
    assert.equal(hit.immediate[1].temp.block_msg?.all, 1);
    const missC = cases.find(x => x.id === 'b4-pixie-jian-duo-miss');
    const miss = trace(missC, { hit: false });
    validateB4Record(miss, missC);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 50);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateB4Record(bad, c));
});

test('direct 契约：破元剑闪封招与 percent 区间', () => {
    const c = cases.find(x => x.id === 'b4-pixie-jian-po-baseline-l200');
    const hit = trace(c, { input: 200 });
    validateB4Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 200);
    assert.equal(hit.immediate[1].temp.no_perform, 1);
    const miss = trace(c, { hit: false });
    validateB4Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 150);
});

test('direct 契约：天外飞龙掷剑', () => {
    const c = cases.find(x => x.id === 'b4-huashan-jian-long-baseline-l200');
    const hit = trace(c, { input: 150 });
    validateB4Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 200);
    const miss = trace(c, { hit: false });
    validateB4Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 120);
});

test('control 契约：鬼魅身法与截手式忙乱', () => {
    const gui = cases.find(x => x.id === 'b4-pixie-jian-gui-baseline-l200');
    const gh = trace(gui, { hit: true });
    validateB4Record(gh, gui);
    assert.equal(gh.immediate[0].neili, gh.before[0].neili - 50);
    // ap = 200*2 = 400; target busy = 400/45+2 = 10.
    assert.equal(gh.immediate[1].busy, 10);
    const gm = trace(gui, { hit: false });
    validateB4Record(gm, gui);
    assert.equal(gm.immediate[0].busy, 2);
    const jie = cases.find(x => x.id === 'b4-huashan-jian-jie-baseline-l200');
    const jh = trace(jie, { hit: true });
    validateB4Record(jh, jie);
    // level 200; target busy = 200/22+2 = 11.
    assert.equal(jh.immediate[1].busy, 11);
    const jm = trace(jie, { hit: false });
    validateB4Record(jm, jie);
    assert.equal(jm.immediate[0].busy, 1);
});

test('combo 契约：群邪辟易九连击与剑掌五连环', () => {
    const pi = cases.find(x => x.id === 'b4-pixie-jian-pi-baseline-l200');
    const z = trace(pi, { attacks: 9, busy: 5 });
    validateB4Record(z, pi);
    assert.equal(z.immediate[0].neili, z.before[0].neili - 100);
    assert.equal(z.attacks.length, 9);
    const lian = cases.find(x => x.id === 'b4-huashan-jian-lian-baseline-l200');
    const l = trace(lian, { attacks: 5, busy: 2 });
    validateB4Record(l, lian);
    assert.equal(l.immediate[0].neili, l.before[0].neili - 120);
    assert.equal(l.attacks.length, 5);
});

test('multi-direct 契约：夺命连环三仙剑三段', () => {
    const c = cases.find(x => x.id === 'b4-huashan-jian-xian-baseline-l200');
    const hit = trace(c, { input: 100, directs: 3 });
    validateB4Record(hit, c);
    assert.equal(hit.directs.length, 3);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 280);
    assert.equal(hit.immediate[0].busy, 3);
    const miss = trace(c, { hit: false, directs: 0 });
    validateB4Record(miss, c);
    assert.equal(miss.directs.length, 0);
    const one = cases.find(x => x.id === 'b4-huashan-jian-xian-one-direct');
    const o = trace(one, { input: 100, directs: 1 });
    validateB4Record(o, one);
    assert.equal(o.directs.length, 1);
    const two = cases.find(x => x.id === 'b4-huashan-jian-xian-two-direct');
    const t = trace(two, { input: 100, directs: 2 });
    validateB4Record(t, two);
    assert.equal(t.directs.length, 2);
});

test('特殊约束分支：致盲、封招、忙乱、无武器', () => {
    const blind = cases.find(x => x.id === 'b4-pixie-jian-duo-already-blind');
    assert.equal(blind.parameters.expected, 'refused');
    validateB4Record(trace(blind), blind);
    const busy = cases.find(x => x.id === 'b4-pixie-jian-gui-target-busy');
    assert.equal(busy.parameters.expected, 'refused');
    validateB4Record(trace(busy), busy);
    const noPerf = cases.find(x => x.id === 'b4-pixie-jian-po-target-no-perform');
    assert.equal(noPerf.parameters.expected, 'refused');
    validateB4Record(trace(noPerf), noPerf);
    const jieBusy = cases.find(x => x.id === 'b4-huashan-jian-jie-target-busy');
    assert.equal(jieBusy.parameters.expected, 'refused');
    validateB4Record(trace(jieBusy), jieBusy);
    const noWeap = cases.find(x => x.id === 'b4-huashan-jian-long-no-weapon');
    assert.equal(noWeap.parameters.expected, 'refused');
    validateB4Record(trace(noWeap), noWeap);
});

test('unarmed 变体：辟邪徒手也走支持集', () => {
    const c = cases.find(x => x.id === 'b4-pixie-jian-duo-unarmed');
    assert.equal(c.parameters.expected, 'observed');
    const hit = trace(c, { input: 80 });
    validateB4Record(hit, c);
    assert.equal(hit.directs.length, 1);
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b4-pixie-jian-duo-baseline-l200');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB4Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b4Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});

// Gate refusals are the literal notify_fail text; the source builds them by
// concatenating string literals across ANSI macros. Resolve that concatenation
// and assert every recorded refusal is byte-identical after ANSI stripping.
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
        'pixie-jian/duo': ['对方现在什么也看不见，放胆攻击吧。\n'],
        'pixie-jian/gui': ['目前正自顾不暇，放胆攻击吧。\n'],
        'pixie-jian/po': ['对方现在已经无法控制真气，放胆攻击吧。\n'],
        'huashan-jian/jie': ['目前正自顾不暇，放胆攻击吧！\n'],
        'huashan-jian/long': ['你使用的武器不对！\n'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b4Schools)) {
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
    assert.ok(checked >= 20);
});
