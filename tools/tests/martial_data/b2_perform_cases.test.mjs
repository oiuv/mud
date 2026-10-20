import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b2SourcePaths, b2ReviewedSourceHash, b2PerformConditions, validateB2Record,
    b2Effects, b2Schools } from './b2_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b2PerformConditions(catalog, read);
const smoke = b2PerformConditions(catalog, read, { smoke: true });

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

function trace(c, { hit = true, input = 100, attacks = 5, busy = 5 } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b2Schools[`${p.skill}/${p.ability}`];
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
    if (p.kind === 'direct' && cfg.receiveOnly) {
        b.neili -= cfg.feeNeili; b.jingli -= cfg.feeJingli; b.busy = cfg.meBusy;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: cfg.feeNeili };
        if (hit) {
            v.qi -= 100; v.eff_qi -= 50; v.jing -= 30; v.eff_jing -= 15;
            v.busy = 3; v.neili -= 500;
        } else {
            v.neili -= 200;
        }
    } else if (p.kind === 'direct') {
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
        b.neili -= cfg.fee; b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: cfg.fee };
        if (hit) {
            v.busy = Math.trunc((b.skills[cfg.skill] ?? 0) / 16) + 2;
        } else {
            b.busy = 2;
        }
    } else if (p.kind === 'buff') {
        b.neili -= cfg.fee; b.busy = cfg.meBusy;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: cfg.fee };
        b.temp[cfg.buff] = 1;
        const skill = b.skills[cfg.skill] ?? 0;
        if (p.ability === 'sui')
            b.temp.apply = { ...(b.temp.apply ?? {}), defense: Math.trunc(skill / 3),
                attack: -Math.trunc(skill / 6) };
    } else {
        const n = attacks;
        const fee = n * 20;
        b.neili -= fee; raw.metrics[0] = { neili_cost: fee };
        b.busy = busy;
        b.learned = { [p.skill]: 1 };
        for (let i = 0; i < n; i++) {
            raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 20 });
            v.qi -= 20;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B2 批量矩阵：53 条件、kind 分发 7/1/1/1、ID 与 families 契约', () => {
    assert.equal(cases.length, 53);
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, control: 0, buff: 0, combo: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b2-[a-z]/i, '条件 ID 使用 b2- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.deepEqual(c.parameters.families, ['红花会', '明教', '神龙教', '武当']);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b2SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l200')) kinds[c.parameters.kind]++;
    }
    assert.deepEqual(kinds, { direct: 7, control: 1, buff: 1, combo: 1 });
    // Special constraints surface as explicit variants.
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b2-taiji-jian-chan-target-busy'));
    assert.ok(ids.includes('b2-taiji-jian-jia-target-busy'));
    assert.ok(ids.includes('b2-taiji-jian-jia-no-weapon'));
    assert.ok(ids.includes('b2-taiji-jian-sui-already-active'));
    assert.ok(ids.includes('b2-taiji-quan-yin-target-busy'));
});

test('B2 来源钉住真实字节', () => {
    for (const path of b2SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b2SourcePaths.every(p => !p.includes('..')));
    assert.match(b2ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b2ReviewedSourceHash);
});

test('direct 契约：费用分支、支持集与拒绝文本', () => {
    const c = cases.find(x => x.id === 'b2-taiji-jian-jia-baseline-l200');
    const hit = trace(c, { input: 120 });
    validateB2Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 80);
    const missC = cases.find(x => x.id === 'b2-taiji-jian-jia-miss');
    const miss = trace(missC, { hit: false });
    validateB2Record(miss, missC);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 60);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateB2Record(bad, c));
    const noDirect = structuredClone(hit); noDirect.directs = [];
    assert.throws(() => validateB2Record(noDirect, c));
});

test('tu receiveOnly 契约：无 do_damage、jingli 费用与接收伤害', () => {
    const tu = cases.find(x => x.id === 'b2-taiji-quan-tu-baseline-l200');
    const hit = trace(tu, { hit: true });
    validateB2Record(hit, tu);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 1000);
    assert.equal(hit.immediate[0].jingli, hit.before[0].jingli - 1000);
    assert.deepEqual(hit.directs, []);
    assert.equal(hit.immediate[1].busy, 3);
    assert.equal(hit.before[1].neili - hit.immediate[1].neili, 500);
    const missC = cases.find(x => x.id === 'b2-taiji-quan-tu-miss');
    const miss = trace(missC, { hit: false });
    validateB2Record(miss, missC);
    assert.equal(miss.before[1].neili - miss.immediate[1].neili, 200);
});

test('control 契约：缠字诀固定费用与忙乱', () => {
    const chan = cases.find(x => x.id === 'b2-taiji-jian-chan-baseline-l200');
    const chanHit = trace(chan, { hit: true });
    validateB2Record(chanHit, chan);
    assert.equal(chanHit.before[0].neili - chanHit.immediate[0].neili, 30);
    assert.equal(chanHit.immediate[1].busy, 14);
    assert.ok([0, null].includes(chanHit.immediate[0].busy));
    const miss = trace(chan, { hit: false });
    validateB2Record(miss, chan);
    assert.equal(miss.immediate[0].busy, 2);
});

test('buff 契约：随字诀临时效果', () => {
    const sui = cases.find(x => x.id === 'b2-taiji-jian-sui-baseline-l200');
    validateB2Record(trace(sui), sui);
    const active = cases.find(x => x.id === 'b2-taiji-jian-sui-already-active');
    assert.equal(active.parameters.expected, 'refused');
    validateB2Record(trace(active), active);
});

test('combo 契约：剑轮岚转攻击数与费用', () => {
    const zhuan = cases.find(x => x.id === 'b2-taiji-jian-zhuan-baseline-l200');
    const z = trace(zhuan, { attacks: 5 });
    validateB2Record(z, zhuan);
    assert.equal(z.immediate[0].neili, z.before[0].neili - 100);
    // Fee must be a multiple of 20; a non-multiple fails.
    const bad = structuredClone(z); bad.immediate[0].neili = z.before[0].neili - 110;
    bad.after = structuredClone(bad.immediate);
    assert.throws(() => validateB2Record(bad, zhuan));
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b2-taiji-jian-jia-baseline-l200');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB2Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b2Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});

test('kind 支持集复用 slice2：direct 伤害落点必须在支持集内', () => {
    const c = cases.find(x => x.id === 'b2-taiji-quan-zhan-baseline-l200');
    const raw = trace(c, { input: 80 });
    const support = slice2SupportSet(80, 20, raw.before[0], raw.before[1], 'UNARMED');
    assert.ok(support.some(s => s.qi === raw.immediate[1].qi && s.eff_qi === raw.immediate[1].eff_qi));
    validateB2Record(raw, c);
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
        'taiji-jian/chan': ['目前正自顾不暇，放胆攻击吧。\n'],
        'taiji-jian/jia': ['目前正自顾不暇，放胆攻击吧。\n',
            '对方没有使用兵器，难以施展「驾字诀」。\n'],
        'taiji-jian/sui': ['你现在正在施展「随字诀」。\n'],
        'taiji-quan/yin': ['目前正自顾不暇，放胆攻击吧。\n'],
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b2Schools)) {
        const texts = sourceRefusals(join(root, 'kungfu/skill', cfg.skill, cfg.ability + '.c'));
        for (const gate of cfg.gates) {
            checked++;
            assert.ok(texts.includes(gate.refusal), `${key}/${gate.key} refusal matches source`);
        }
        for (const s of specials[key] ?? []) {
            checked++;
            assert.ok(texts.some(t => t.includes(s)), `${key} special refusal matches source`);
        }
    }
    assert.ok(checked >= 28);
});
