import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b1SourcePaths, b1ReviewedSourceHash, b1PerformConditions, validateB1Record,
    b1Effects, b1Schools } from './b1_perform_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b1PerformConditions(catalog, read);
const smoke = b1PerformConditions(catalog, read, { smoke: true });

test('B1 rejects unrelated damo conditions and forged poison metadata', () => {
    const c = cases.find(x => x.id === 'b1-damo-jian-luan-baseline-l200');
    const good = trace(c);
    assert.equal(validateB1Record(good, c).hit, true);
    for (const mutate of [
        v => { v.conditions.damo_shangshen = { ...v.conditions.damo_luanqi }; },
        v => { v.conditions.damo_luanqi.level = 987654321; },
        v => { v.conditions.damo_luanqi.id = 'someone-else'; },
        v => { v.conditions.damo_luanqi.remain = 1; },
        v => { delete v.conditions.damo_luanqi; },
    ]) {
        const bad = structuredClone(good);
        mutate(bad.immediate[1]); bad.after = structuredClone(bad.immediate);
        assert.throws(() => validateB1Record(bad, c));
    }
});

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
    const cfg = b1Schools[`${p.skill}/${p.ability}`];
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
            if (p.skill === 'damo-jian') {
                const [key, name] = { luan: ['damo_luanqi', '乱气之扰'],
                    shang: ['damo_shangshen', '伤神之扰'],
                    zhe: ['damo_zheyuan', '折元之扰'] }[p.ability];
                const level = b.skills[p.skill];
                v.conditions[key] = { id: b.id, name, level, remain: level * 5 };
            }
        }
    } else if (p.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        if (p.ability === 'chan') {
            b.busy = hit ? 1 : 2;
            if (hit) v.busy = Math.trunc((b.skills['riyue-bian'] ?? 0) / 20) + 2;
            raw.metrics[0] = { neili_cost: 0 };
        } else {
            b.neili -= cfg.fee; b.busy = cfg.meBusy;
            raw.metrics[0] = { neili_cost: cfg.fee };
            if (hit && before[1].temp?.powerup) {
                v.temp.apply = { ...(v.temp.apply ?? {}), attack: 0, defense: 0 };
                v.temp.damo_qingxin = 1;
            }
        }
    } else if (p.kind === 'buff') {
        b.neili -= cfg.fee; b.busy = cfg.meBusy;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: cfg.fee };
        b.temp[cfg.buff] = 1;
        const skill = b.skills[cfg.skill] ?? 0;
        if (p.ability === 'feng')
            b.temp.apply = { ...(b.temp.apply ?? {}), attack: -Math.trunc(skill / 4),
                dodge: Math.trunc(skill / 3) };
        else if (p.ability === 'sheshen')
            b.temp.apply = { ...(b.temp.apply ?? {}), attack: Math.trunc(skill / 3),
                dodge: -Math.trunc(skill / 5) };
        else if (p.ability === 'jingang') {
            const count = Math.trunc(Math.trunc(skill / 3) / 2);
            b.temp.str = count * 2;
            b.temp.dex = -Math.trunc(before[0].effective_dex / 10);
        } else {
            b.temp.str = 36; b.temp.dex = 36;
        }
    } else {
        const n = p.ability === 'sanjue' ? 3 : p.ability === 'wuchang' ? 5 : attacks;
        const fee = p.ability === 'he' ? n * 20 : cfg.fee;
        b.neili -= fee; raw.metrics[0] = { neili_cost: fee };
        b.busy = p.ability === 'sanjue' ? 3 : p.ability === 'wuchang' ? 5 : busy;
        b.learned = { [p.skill]: 1 };
        for (let i = 0; i < n; i++) {
            raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 20 });
            v.qi -= 20;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B1 批量矩阵：100 条件、kind 分发 11/2/4/3、ID 与 families 契约', () => {
    assert.equal(cases.length, 100);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0),
        cases.reduce((n, c) => n + c.samples, 0));
    assert.ok(smoke.length > 0 && smoke.length <= cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, control: 0, buff: 0, combo: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b1-[a-z]/i, '条件 ID 使用 b1- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.deepEqual(c.parameters.families, ['慕容世家', '少林派']);
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b1SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l200')) kinds[c.parameters.kind]++;
    }
    assert.deepEqual(kinds, { direct: 11, control: 2, buff: 4, combo: 3 });
    // Special constraints surface as explicit variants.
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b1-damo-jian-qingxin-no-powerup'));
    assert.ok(ids.includes('b1-damo-jian-qingxin-already-suppressed'));
    assert.ok(ids.includes('b1-zui-gun-zuida-powerup-mutex'));
    assert.ok(ids.includes('b1-zui-gun-zuida-wrong-force'));
    assert.ok(ids.includes('b1-jingang-quan-jingang-wrong-force'));
    assert.ok(ids.includes('b1-riyue-bian-chan-target-busy'));
    assert.ok(ids.filter(id => id.startsWith('b1-zui-gun-zuida-drunk-')).length === 2);
});

test('B1 来源钉住真实字节；MA-017 按源码原样记录', () => {
    for (const path of b1SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b1SourcePaths.every(p => !p.includes('..')));
    assert.match(b1ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b1ReviewedSourceHash);
    // da-mo.c carries the swapped ask_qingxin/ask_luan keys; recorded as-is.
    assert.ok(b1SourcePaths.includes('kungfu/class/shaolin/da-mo.c'));
    const daMo = read('kungfu/class/shaolin/da-mo.c').toString('utf8');
    assert.ok(daMo.includes('me->set("can_perform/damo-jian/luan", 1)'));
    assert.ok(daMo.includes('me->set("can_perform/damo-jian/qingxin", 1)'));
    for (const c of cases.filter(c => c.parameters.skill === 'damo-jian'))
        assert.ok(c.parameters.qualification_note.includes('MA-017'));
});

test('direct 契约：费用分支、支持集与拒绝文本', () => {
    const c = cases.find(x => x.id === 'b1-damo-jian-luan-baseline-l200');
    const hit = trace(c, { input: 120 });
    validateB1Record(hit, c);
    assert.equal(hit.immediate[0].neili, hit.before[0].neili - 200);
    const missC = cases.find(x => x.id === 'b1-damo-jian-luan-miss');
    const miss = trace(missC, { hit: false });
    validateB1Record(miss, missC);
    assert.equal(miss.immediate[0].neili, miss.before[0].neili - 100);
    const bad = structuredClone(hit); bad.immediate[0].neili += 1;
    assert.throws(() => validateB1Record(bad, c));
    const noDirect = structuredClone(hit); noDirect.directs = [];
    assert.throws(() => validateB1Record(noDirect, c));
});

test('control 契约：清心清零 apply、缠绕零费用与忙乱', () => {
    const qingxin = cases.find(x => x.id === 'b1-damo-jian-qingxin-baseline-l200');
    const hit = trace(qingxin, { hit: true });
    validateB1Record(hit, qingxin);
    assert.equal(hit.immediate[1].temp.apply.attack, 0);
    assert.equal(hit.immediate[1].temp.apply.defense, 0);
    const miss = trace(qingxin, { hit: false });
    validateB1Record(miss, qingxin);
    assert.equal(miss.immediate[1].temp.apply.attack, 150);
    const none = cases.find(x => x.id === 'b1-damo-jian-qingxin-no-powerup');
    validateB1Record(trace(none, { hit: true }), none);
    const chan = cases.find(x => x.id === 'b1-riyue-bian-chan-baseline-l200');
    const chanHit = trace(chan, { hit: true });
    validateB1Record(chanHit, chan);
    assert.equal(chanHit.before[0].neili, chanHit.immediate[0].neili, '缠绕诀零费用');
    assert.equal(chanHit.immediate[1].busy, 12);
});

test('buff 契约：封魔/舍身/大金刚/八仙醉打临时效果', () => {
    const feng = cases.find(x => x.id === 'b1-banruo-zhang-feng-baseline-l200');
    validateB1Record(trace(feng), feng);
    const sheshen = cases.find(x => x.id === 'b1-cibei-dao-sheshen-baseline-l200');
    validateB1Record(trace(sheshen), sheshen);
    const jingang = cases.find(x => x.id === 'b1-jingang-quan-jingang-baseline-l200');
    validateB1Record(trace(jingang), jingang);
    const zuida = cases.find(x => x.id === 'b1-zui-gun-zuida-baseline-l200');
    validateB1Record(trace(zuida), zuida);
    const mutex = cases.find(x => x.id === 'b1-zui-gun-zuida-powerup-mutex');
    assert.equal(mutex.parameters.expected, 'refused');
    validateB1Record(trace(mutex), mutex);
});

test('combo 契约：三绝/合/无常攻击数与费用', () => {
    const sanjue = cases.find(x => x.id === 'b1-damo-jian-sanjue-baseline-l200');
    const s = trace(sanjue, { attacks: 3 });
    validateB1Record(s, sanjue);
    assert.equal(s.immediate[0].neili, s.before[0].neili - b1Schools['damo-jian/sanjue'].fee);
    const he = cases.find(x => x.id === 'b1-riyue-bian-he-baseline-l200');
    const h = trace(he, { attacks: 7 });
    validateB1Record(h, he);
    assert.equal(h.immediate[0].neili, h.before[0].neili - 140);
    const wuchang = cases.find(x => x.id === 'b1-wuchang-zhang-wuchang-baseline-l200');
    const w = trace(wuchang, { attacks: 5 });
    validateB1Record(w, wuchang);
    assert.equal(w.immediate[0].neili, w.before[0].neili - b1Schools['wuchang-zhang/wuchang'].fee);
    const bad = structuredClone(s); bad.attacks = bad.attacks.slice(0, 2);
    assert.throws(() => validateB1Record(bad, sanjue));
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b1-damo-jian-luan-baseline-l200');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB1Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b1Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});

test('kind 支持集复用 slice2：direct 伤害落点必须在支持集内', () => {
    const c = cases.find(x => x.id === 'b1-qianye-shou-qianye-baseline-l200');
    const raw = trace(c, { input: 80 });
    const support = slice2SupportSet(80, 35, raw.before[0], raw.before[1], 'UNARMED');
    assert.ok(support.some(s => s.qi === raw.immediate[1].qi && s.eff_qi === raw.immediate[1].eff_qi));
    validateB1Record(raw, c);
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
        'banruo-zhang/feng': ['你已经在运功中了。\n'],
        'cibei-dao/sheshen': ['你已经在运功中了。\n'],
        'jingang-quan/jingang': ['你已经在运功中了。\n',
            '你现在没有激发少林内功为内功，难以施展「大金刚神通」。\n'],
        'zui-gun/zuida': ['你已经在运功中了。\n',
            '你现在没有激发少林内功为内功，难以施展「八仙醉打」。\n',
            '你已经运起内功提升战力了，不能再使用「八仙醉打」。\n'],
        'damo-jian/qingxin': ['对方刚刚才中过达摩清心剑，你不必再用一次了。\n'],
        'riyue-bian/chan': ['目前正自顾不暇，放胆攻击吧！\n'],
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b1Schools)) {
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
    assert.ok(checked >= 55);
});
