import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b5SourcePaths, b5ReviewedSourceHash, b5PerformConditions, validateB5Record,
    b5Effects, b5Schools } from './b5_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b5PerformConditions(catalog, read);
const smoke = b5PerformConditions(catalog, read, { smoke: true });

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

function trace(c, { hit = true, input = 100, attacks = 5, busy = 5, directs = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b5Schools[`${p.skill}/${p.ability}`];
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
    if (cfg.kind === 'heal') {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee; b.qi -= cfg.selfQi; b.jing -= cfg.selfJing; b.busy = cfg.meBusy;
        raw.metrics[0] = { neili_cost: cfg.fee };
        v.eff_qi = before[1].eff_qi + 200; v.eff_jing = before[1].eff_jing + 100;
        v.qi = Math.min(v.eff_qi, before[1].qi); v.jing = Math.min(v.eff_jing, before[1].jing);
    } else if (cfg.instantDeath && p.variant === 'instant-death') {
        // crush branch: no direct, no fee, target dies, me busy 2.
        b.learned = { [p.skill]: 1 };
        b.busy = 2;
        raw.metrics[0] = {};
        v.eff_qi = 1; v.qi = 1; v.living = 0;
    } else if (cfg.stages) {
        // multi-direct: n sequential do_damage, fixed fee, me busy in range.
        const n = directs ?? (hit ? cfg.maxDirects : 0);
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee; b.busy = Math.min(cfg.meBusyMax, Math.max(cfg.meBusyMin, busy));
        raw.metrics[0] = { neili_cost: cfg.fee, direct: n };
        for (let i = 0; i < n; i++) {
            const dmg = input + i * 10;
            raw.directs.push({ actor: 0, target: 1, type: 0, damage: dmg });
        }
        if (n > 0) {
            const total = n * input + (n * (n - 1) / 2) * 10;
            v.qi = Math.max(0, before[1].qi - total);
            v.eff_qi = Math.max(0, before[1].eff_qi - total);
        }
    } else if (cfg.kind === 'direct') {
        const fee = hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee; b.busy = hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
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
        }
    } else if (cfg.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        const fee = hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee };
        b.busy = cfg.meBusy;
        if (hit) {
            const level = b.skills[cfg.skill] ?? 0;
            v.busy = Math.trunc(level / 18) + 2;
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = cfg.comboAttacks ?? attacks;
        b.neili -= cfg.fee; raw.metrics[0] = { neili_cost: cfg.fee };
        if (cfg.selfQi) b.qi -= cfg.selfQi;
        b.busy = Math.min(cfg.comboBusyMax, Math.max(cfg.comboBusyMin, busy));
        if (cfg.comboDirect) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            v.qi = Math.max(0, before[1].qi - input);
            v.eff_qi = Math.max(0, before[1].eff_qi - input);
        }
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

test('B5 批量矩阵：15 招/约80 条件、kind 分发 direct 7/combo 5/control 1/heal 1/multi 1，ID 与 families 契约', () => {
    assert.ok(cases.length >= 70 && cases.length <= 95, 'conditions ~80');
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, control: 0, combo: 0, heal: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b5-[a-z]/i, '条件 ID 使用 b5- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b5-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 2);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b5SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    // Baseline tally over the 15 moves: 7 direct (incl. 2 multi) + 5 combo + 1 control + 1 heal + 1 multi-as-direct.
    assert.equal(kinds.combo, 5);
    assert.equal(kinds.control, 1);
    assert.equal(kinds.heal, 1);
    assert.equal(kinds.direct, 8);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b5-xiantian-gong-dang-instant-death'));
    assert.ok(ids.includes('b5-xiantian-gong-dang-destroy-weapon'));
    assert.ok(ids.includes('b5-xiantian-gong-fen-instant-death'));
    assert.ok(ids.includes('b5-yiyang-zhi-die-three-hits'));
    assert.ok(ids.includes('b5-yiyang-zhi-heal-self-target'));
    assert.ok(ids.includes('b5-tie-zhang-long-target-busy'));
    assert.ok(ids.includes('b5-tie-zhang-juesha-wrong-force'));
    assert.ok(ids.includes('b5-tie-zhang-juesha-tiexian-mutex'));
    assert.ok(ids.includes('b5-feilong-zhang-fei-no-weapon'));
});

test('B5 per-cluster families：段真 2 派、绝铁 2 派', () => {
    for (const c of cases) {
        const f = c.parameters.families;
        if (['xiantian-gong', 'yiyang-zhi'].includes(c.parameters.skill))
            assert.deepEqual(f, ['大理段家', '全真教']);
        else assert.deepEqual(f, ['绝情谷', '铁掌帮']);
    }
});

test('B5 来源钉住真实字节', () => {
    for (const path of b5SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b5SourcePaths.every(p => !p.includes('..')));
    if (b5ReviewedSourceHash !== 'PENDING') {
        assert.match(b5ReviewedSourceHash, /^[a-f0-9]{64}$/);
        const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
        assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b5ReviewedSourceHash);
    }
});

test('direct 契约：一指乾坤费用分支与支持集', () => {
    const c = cases.find(x => x.id === 'b5-yiyang-zhi-qian-baseline-l300');
    const hit = trace(c, { input: 120 });
    validateB5Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 200);
    const missC = cases.find(x => x.id === 'b5-yiyang-zhi-qian-miss');
    const miss = trace(missC, { hit: false });
    validateB5Record(miss, missC);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 150);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateB5Record(bad, c));
});

test('direct 契约：龙飞势掷杖', () => {
    const c = cases.find(x => x.id === 'b5-feilong-zhang-fei-baseline-l300');
    const hit = trace(c, { input: 150 });
    validateB5Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 300);
    const miss = trace(c, { hit: false });
    validateB5Record(miss, c);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 200);
});

test('multi-direct 契约：阳关三叠三段', () => {
    const c = cases.find(x => x.id === 'b5-yiyang-zhi-die-baseline-l300');
    const hit = trace(c, { input: 100, directs: 3 });
    validateB5Record(hit, c);
    assert.equal(hit.directs.length, 3);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 400);
    const miss = trace(c, { hit: false, directs: 0 });
    validateB5Record(miss, c);
    assert.equal(miss.directs.length, 0);
    const one = cases.find(x => x.id === 'b5-yiyang-zhi-die-one-direct');
    const o = trace(one, { input: 100, directs: 1 });
    validateB5Record(o, one);
    assert.equal(o.directs.length, 1);
});

test('multi-direct 契约：阴阳磨两段', () => {
    const c = cases.find(x => x.id === 'b5-tie-zhang-yin-baseline-l300');
    const hit = trace(c, { input: 100, directs: 2 });
    validateB5Record(hit, c);
    assert.equal(hit.directs.length, 2);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 400);
});

test('control 契约：龙影掌忙乱', () => {
    const long = cases.find(x => x.id === 'b5-tie-zhang-long-baseline-l300');
    const lh = trace(long, { hit: true });
    validateB5Record(lh, long);
    assert.equal(lh.immediate[0].neili, lh.before[0].neili - 100);
    // level 300; target busy = 300/18+2 = 18.
    assert.equal(lh.immediate[1].busy, 18);
    const lm = trace(long, { hit: false });
    validateB5Record(lm, long);
    assert.equal(lm.immediate[0].neili, lm.before[0].neili - 80);
});

test('combo 契约：天地混元与九穹绝刹掌', () => {
    const hun = cases.find(x => x.id === 'b5-xiantian-gong-hun-baseline-l300');
    const h = trace(hun, { attacks: 5, busy: 3 });
    validateB5Record(h, hun);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 280);
    assert.equal(h.attacks.length, 5);
    const juesha = cases.find(x => x.id === 'b5-tie-zhang-juesha-baseline-l300');
    const j = trace(juesha, { attacks: 6, busy: 2 });
    validateB5Record(j, juesha);
    assert.equal(j.immediate[0].neili, j.before[0].neili - 300);
    assert.equal(j.before[0].qi - j.immediate[0].qi, 100);
    assert.equal(j.attacks.length, 6);
});

test('combo-direct 契约：乾阳剑气直伤+连击', () => {
    const c = cases.find(x => x.id === 'b5-xiantian-gong-jian-baseline-l300');
    const hit = trace(c, { input: 200, attacks: 5 });
    validateB5Record(hit, c);
    assert.equal(hit.directs.length, 1);
    assert.equal(hit.attacks.length, 5);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 600);
});

test('heal 契约：起死回生非战斗疗伤', () => {
    const c = cases.find(x => x.id === 'b5-yiyang-zhi-heal-baseline-l300');
    const h = trace(c, {});
    validateB5Record(h, c);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 800);
    assert.equal(h.before[0].qi - h.immediate[0].qi, 100);
    assert.equal(h.before[0].jing - h.immediate[0].jing, 50);
    assert.equal(h.immediate[0].busy, 10);
});

test('特殊约束分支：即倒、碎甲、三中封内、自指、忙乱、互背、错内功、无杖', () => {
    for (const id of ['b5-xiantian-gong-dang-instant-death', 'b5-xiantian-gong-fen-instant-death',
        'b5-xiantian-gong-dang-destroy-weapon', 'b5-yiyang-zhi-die-three-hits']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'observed');
        validateB5Record(trace(c, { input: 80 }), c);
    }
    for (const id of ['b5-yiyang-zhi-heal-self-target', 'b5-tie-zhang-long-target-busy',
        'b5-tie-zhang-juesha-wrong-force', 'b5-tie-zhang-juesha-tiexian-mutex',
        'b5-feilong-zhang-fei-no-weapon']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB5Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b5-yiyang-zhi-qian-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB5Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b5Effects(rows, c);
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
        'yiyang-zhi/heal': ['只能对别人施展'],
        'tie-zhang/long': ['目前正自顾不暇，放胆攻击吧。\n'],
        'tie-zhang/juesha': ['你必须激发天雷神功才能施展出「九穹绝刹掌」！\n',
            '施展「九穹绝刹掌」时铁掌掌法不宜和铁线拳互背！\n'],
        'feilong-zhang/fei': ['你所使用的武器不对，难以施展「龙飞势」。\n'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b5Schools)) {
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
