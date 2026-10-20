import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b3SourcePaths, b3ReviewedSourceHash, b3PerformConditions, validateB3Record,
    b3Effects, b3Schools } from './b3_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b3PerformConditions(catalog, read);
const smoke = b3PerformConditions(catalog, read, { smoke: true });

function state(cfg, side) {
    const src = side ? cfg.target : cfg.actor;
    // Condition temp config uses flat "apply/attack" keys; snapshots nest them.
    const temp = { apply: { armor: 100 } };
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

function trace(c, { hit = true, input = 100, attacks = 5, busy = 5, instant = false } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b3Schools[`${p.skill}/${p.ability}`];
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
    if (p.kind === 'direct') {
        const fee = hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee; b.busy = hit ? cfg.hitBusy : cfg.missBusy;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.dodge_checks = [{ result: 0 }];
            raw.metrics[0].direct = 1;
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
        }
    } else if (p.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: 0 };
        if (hit) {
            const swordEff = Math.trunc((b.skills.sword ?? 0) / 2) + (b.skills[cfg.skill] ?? 0);
            v.busy = Math.trunc(swordEff / 26) + 2;
        } else {
            b.busy = 1;
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        if (instant) {
            const fee = cfg.instantFee;
            b.neili -= fee; b.busy = 1;
            raw.metrics[0] = { neili_cost: fee };
            v.eff_qi = 1; v.eff_jing = 1; v.living = 0;
        } else {
            const n = cfg.comboAttacks ?? attacks;
            const fee = cfg.fee;
            b.neili -= fee; raw.metrics[0] = { neili_cost: fee };
            b.busy = Math.min(cfg.comboBusyMax ?? 5, busy);
            for (let i = 0; i < n; i++) {
                raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 20 });
                v.qi -= 20;
            }
            if (cfg.comboDirect && hit) {
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
                raw.metrics[0].direct = 1;
                const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
                v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
            }
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B3 批量矩阵：55 条件、kind 分发 direct 6/control 1/combo 3、ID 与 families 契约', () => {
    assert.equal(cases.length, 55);
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, control: 0, combo: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b3-[a-z]/i, '条件 ID 使用 b3- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.deepEqual(c.parameters.families, ['大理段家', '血刀门', '大轮寺']);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b3SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l200')) kinds[c.parameters.kind]++;
    }
    assert.deepEqual(kinds, { direct: 6, control: 1, combo: 3 });
    // Special constraints surface as explicit variants.
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b3-longxiang-gong-tun-already-active'));
    assert.ok(ids.includes('b3-mingwang-jian-ruo-target-busy'));
    assert.ok(ids.includes('b3-longxiang-gong-die-instant-kill'));
    assert.ok(ids.includes('b3-longxiang-gong-zhen-instant-kill'));
    assert.ok(ids.includes('b3-longxiang-gong-die-wrong-force'));
    assert.ok(ids.includes('b3-yujiamu-quan-jiang-angry'));
    assert.ok(ids.includes('b3-mingwang-jian-xiang-no-weapon'));
});

test('B3 来源钉住真实字节', () => {
    for (const path of b3SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b3SourcePaths.every(p => !p.includes('..')));
    assert.match(b3ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b3ReviewedSourceHash);
});

test('direct 契约：费用分支、支持集与拒绝文本', () => {
    const c = cases.find(x => x.id === 'b3-dashou-yin-yin-baseline-l200');
    const hit = trace(c, { input: 120 });
    validateB3Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 100);
    const missC = cases.find(x => x.id === 'b3-dashou-yin-yin-miss');
    const miss = trace(missC, { hit: false });
    validateB3Record(miss, missC);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 40);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateB3Record(bad, c));
    const noDirect = structuredClone(hit); noDirect.directs = [];
    assert.throws(() => validateB3Record(noDirect, c));
});

test('control 契约：若悲零费用与忙乱', () => {
    const ruo = cases.find(x => x.id === 'b3-mingwang-jian-ruo-baseline-l200');
    const hit = trace(ruo, { hit: true });
    validateB3Record(hit, ruo);
    assert.equal(hit.before[0].neili, hit.immediate[0].neili);
    // query_skill("sword") = raw_sword/2 + mapped = 100+200 = 300; 300/26+2 = 13.
    assert.equal(hit.immediate[1].busy, 13);
    assert.ok([0, null].includes(hit.immediate[0].busy));
    const miss = trace(ruo, { hit: false });
    validateB3Record(miss, ruo);
    assert.equal(miss.immediate[0].busy, 1);
    const active = cases.find(x => x.id === 'b3-mingwang-jian-ruo-target-busy');
    assert.equal(active.parameters.expected, 'refused');
    validateB3Record(trace(active), active);
});

test('combo 契约：象跌势攻击数与费用', () => {
    const die = cases.find(x => x.id === 'b3-longxiang-gong-die-baseline-l200');
    const z = trace(die, { attacks: 5 });
    validateB3Record(z, die);
    assert.equal(z.immediate[0].neili, z.before[0].neili - 300);
    // Fixed fee, fixed attack count.
    const bad = structuredClone(z); bad.immediate[0].neili = z.before[0].neili - 310;
    bad.after = structuredClone(bad.immediate);
    assert.throws(() => validateB3Record(bad, die));
});

test('combo 契约：真·般若极命中带直伤', () => {
    const zhen = cases.find(x => x.id === 'b3-longxiang-gong-zhen-baseline-l200');
    const hit = trace(zhen, { input: 200 });
    validateB3Record(hit, zhen);
    assert.equal(hit.directs.length, 1);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 600);
    const miss = trace(zhen, { hit: false });
    validateB3Record(miss, zhen);
    assert.equal(miss.directs.length, 0);
});

test('instant-kill 契约：内力碾压即倒', () => {
    const die = cases.find(x => x.id === 'b3-longxiang-gong-die-instant-kill');
    const z = trace(die, { instant: true });
    validateB3Record(z, die);
    assert.equal(z.immediate[0].neili, z.before[0].neili - 50);
    assert.equal(z.attacks.length, 0);
    const zhen = cases.find(x => x.id === 'b3-longxiang-gong-zhen-instant-kill');
    const z2 = trace(zhen, { instant: true });
    validateB3Record(z2, zhen);
    assert.equal(z2.immediate[0].neili, z2.before[0].neili - 100);
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b3-dashou-yin-yin-baseline-l200');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB3Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b3Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});

test('kind 支持集复用 slice2：direct 伤害落点必须在支持集内', () => {
    const c = cases.find(x => x.id === 'b3-mingwang-jian-xiang-baseline-l200');
    const raw = trace(c, { input: 80 });
    const support = slice2SupportSet(80, 45, raw.before[0], raw.before[1], 'WEAPON');
    assert.ok(support.some(s => s.qi === raw.immediate[1].qi && s.eff_qi === raw.immediate[1].eff_qi));
    validateB3Record(raw, c);
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
        'longxiang-gong/tun': ['「龙吞势」无法连续施展。\n'],
        'mingwang-jian/ruo': ['目前正自顾不暇，放胆攻击吧。\n'],
        'longxiang-gong/die': ['你没有激发龙象般若功为内功，难以施展「象跌势」。\n'],
        'mingwang-jian/xiang': ['你使用的武器不对，难以施展「降魔」。\n'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b3Schools)) {
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
