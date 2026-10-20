import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b17SourcePaths, b17ReviewedSourceHash, b17PerformConditions, validateB17Record,
    b17Effects, b17Schools } from './b17_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b17PerformConditions(catalog, read);
const smoke = b17PerformConditions(catalog, read, { smoke: true });

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
    const effSkill = name => {
        const raw = b.skills?.[name] ?? 0;
        const mapped = b.mappings?.[name];
        return Math.trunc(raw / 2) + (mapped ? (b.skills?.[mapped] ?? 0) : 0);
    };
    switch (cfg.targetBusyFormula) {
        case 'cuff25-2': return Math.trunc(effSkill('cuff') / 25) + 2;
        case 'staff19-2': return Math.trunc(effSkill('staff') / 19) + 2;
        case 'staff27-2': return Math.trunc(effSkill('staff') / 27) + 2;
        case 'strike30-2': return Math.trunc(effSkill('strike') / 30) + 2;
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null,
    directs = null, death = false, disarm = false } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b17Schools[`${p.skill}/${p.ability}`];
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
        b.neili -= cfg.fee;
        b.busy = cfg.meBusy;
        raw.metrics[0] = { neili_cost: cfg.fee };
        b.temp[cfg.buff] = 1;
        if (cfg.tempStats) {
            const gain = Math.trunc((b.skills[cfg.skill] ?? 300) / 50);
            b.temp.dex = (b.temp.dex ?? 0) + gain;
        }
        if (cfg.buffApply) {
            const skill = b.skills[cfg.skill] ?? 300;
            b.temp.apply = { ...(b.temp.apply ?? {}) };
            b.temp.apply.attack = (b.temp.apply.attack ?? 0) - Math.trunc(skill / 4);
            b.temp.apply.dodge = (b.temp.apply.dodge ?? 0) + Math.trunc(skill / 3);
        }
    } else if (cfg.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        const fee = hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee;
        b.busy = hit ? (cfg.meBusyHitMin ?? cfg.meBusyHit ?? 0) : (cfg.meBusyMiss ?? 0);
        raw.metrics[0] = { neili_cost: fee };
        if (hit) v.busy = targetBusyFor(cfg, b, hit);
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
    } else if (cfg.kind === 'throwing') {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee;
        b.busy = cfg.meBusy;
        raw.metrics[0] = { neili_cost: cfg.fee };
        if (hit) {
            v.qi = Math.max(1, v.qi - input);
            v.eff_qi = Math.max(1, v.eff_qi - input);
        }
    } else if (cfg.kind === 'sacrifice') {
        b.learned = { [p.skill]: 1 };
        b.max_neili -= 50;
        if (hit) {
            b.neili = 0;
            b.max_neili -= 25;
            b.busy = cfg.hitBusyMin;
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0] = { direct: 1 };
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
        } else {
            b.busy = cfg.missBusy;
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
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
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

test('B17 批量矩阵：24 招条件、kind 分发，ID 与 families 契约', () => {
    assert.ok(cases.length >= 60, 'conditions at least 60, got ' + cases.length);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b17-[a-z]/i, '条件 ID 使用 b17- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b17-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.ok(['关外胡家', '欧阳世家', '昆仑派'].includes(c.parameters.families[0]));
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b17SourcePaths.includes(c.parameters.base_source.path));
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300') || c.id.endsWith('non-snake-refusal'))
            kinds['baseline-' + c.parameters.kind] = (kinds['baseline-' + c.parameters.kind] ?? 0) + 1;
    }
    // 24 entries: direct 9, control 4, combo 2, multi 1, throwing 2, buff 2,
    // sacrifice 1, special 3 (snake-only refusal conditions).
    assert.ok((kinds['baseline-direct'] ?? 0) >= 8, 'direct baselines');
    assert.ok((kinds['baseline-control'] ?? 0) >= 3, 'control baselines');
    assert.ok((kinds['baseline-combo'] ?? 0) >= 2, 'combo baselines');
    assert.ok((kinds['baseline-multi'] ?? 0) >= 1, 'multi baselines');
    assert.ok((kinds['baseline-throwing'] ?? 0) >= 2, 'throwing baselines');
    assert.ok((kinds['baseline-buff'] ?? 0) >= 2, 'buff baselines');
    assert.ok((kinds['baseline-sacrifice'] ?? 0) >= 1, 'sacrifice baselines');
    assert.ok((kinds['baseline-special'] ?? 0) >= 2, 'special refusal baselines');
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b17-hua-quan-juan-baseline-l300'));
    assert.ok(ids.includes('b17-hujia-quan-kuai-baseline-l300'));
    assert.ok(ids.includes('b17-chuncan-zhang-jian-baseline-l300'));
    assert.ok(ids.includes('b17-sixiang-bufa-fei-baseline-l300'));
    assert.ok(ids.includes('b17-chuangwang-dao-xiong-baseline-l300'));
    assert.ok(ids.includes('b17-baisheng-daofa-heng-baseline-l300'));
    assert.ok(ids.includes('b17-lingshe-zhangfa-qianshe-baseline-l300'));
    assert.ok(ids.includes('b17-lingshe-zhangfa-wanshi-baseline-l300'));
    assert.ok(ids.includes('b17-lingshe-zhangfa-chan-baseline-l300'));
    assert.ok(ids.includes('b17-lingshe-quan-rou-baseline-l300'));
    assert.ok(ids.includes('b17-hamagong-zhen-baseline-l300'));
    assert.ok(ids.includes('b17-zhentian-quan-shi-baseline-l300'));
    assert.ok(ids.includes('b17-kunlun-qifa-liu-baseline-l300'));
    assert.ok(ids.includes('b17-zhengliangyi-jian-sui-baseline-l300'));
    assert.ok(ids.includes('b17-zhengliangyi-jian-wu-baseline-l300'));
    assert.ok(ids.includes('b17-sanyin-shou-sun-baseline-l300'));
    assert.ok(ids.includes('b17-qiankun-jian-riyue-baseline-l300'));
    assert.ok(ids.includes('b17-qiankun-jian-ni-baseline-l300'));
    assert.ok(ids.includes('b17-kunlun-zhang-kong-baseline-l300'));
    assert.ok(ids.includes('b17-mantian-xing-shan-baseline-l300'));
    assert.ok(ids.includes('b17-shedu-qiqiao-da-non-snake-refusal'));
    assert.ok(ids.includes('b17-shedu-qiqiao-liandu-non-snake-refusal'));
    assert.deepEqual(cases.find(x => x.id === 'b17-hua-quan-juan-baseline-l300').parameters.families,
        ['关外胡家']);
    assert.deepEqual(cases.find(x => x.id === 'b17-lingshe-zhangfa-qianshe-baseline-l300').parameters.families,
        ['欧阳世家']);
    assert.deepEqual(cases.find(x => x.id === 'b17-zhentian-quan-shi-baseline-l300').parameters.families,
        ['昆仑派']);
});

test('B17 来源钉住真实字节', () => {
    for (const path of b17SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b17SourcePaths.every(p => !p.includes('..')));
    if (b17ReviewedSourceHash !== 'PENDING') {
        assert.match(b17ReviewedSourceHash, /^[a-f0-9]{64}$/);
        const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
        assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b17ReviewedSourceHash);
    }
});

test('direct 契约：华拳与闯王刀与百胜刀分支费用', () => {
    const juan = cases.find(x => x.id === 'b17-hua-quan-juan-baseline-l300');
    const jh = trace(juan, { input: 120 });
    validateB17Record(jh, juan);
    assert.equal(jh.before[0].neili - jh.immediate[0].neili, 250);
    const jm = trace(juan, { hit: false });
    validateB17Record(jm, juan);
    assert.equal(jm.before[0].neili - jm.immediate[0].neili, 80);
    const xiong = cases.find(x => x.id === 'b17-chuangwang-dao-xiong-baseline-l300');
    const xh = trace(xiong, { input: 80 });
    validateB17Record(xh, xiong);
    assert.equal(xh.before[0].neili - xh.immediate[0].neili, 30);
    const xm = trace(xiong, { hit: false });
    validateB17Record(xm, xiong);
    assert.equal(xm.before[0].neili - xm.immediate[0].neili, 10);
    const heng = cases.find(x => x.id === 'b17-baisheng-daofa-heng-baseline-l300');
    const hh = trace(heng, { input: 200 });
    validateB17Record(hh, heng);
    assert.equal(hh.before[0].neili - hh.immediate[0].neili, 350);
    const hm = trace(heng, { hit: false });
    validateB17Record(hm, heng);
    assert.equal(hm.before[0].neili - hm.immediate[0].neili, 150);
});

test('direct 契约：灵蛇杖法与灵蛇拳与震天拳与昆仑掌分支费用', () => {
    const wanshi = cases.find(x => x.id === 'b17-lingshe-zhangfa-wanshi-baseline-l300');
    const wh = trace(wanshi, { input: 150 });
    validateB17Record(wh, wanshi);
    assert.equal(wh.before[0].neili - wh.immediate[0].neili, 350);
    const wm = trace(wanshi, { hit: false });
    validateB17Record(wm, wanshi);
    assert.equal(wm.before[0].neili - wm.immediate[0].neili, 100);
    const rou = cases.find(x => x.id === 'b17-lingshe-quan-rou-baseline-l300');
    const rh = trace(rou, { input: 90 });
    validateB17Record(rh, rou);
    assert.equal(rh.before[0].neili - rh.immediate[0].neili, 100);
    const rm = trace(rou, { hit: false });
    validateB17Record(rm, rou);
    assert.equal(rm.before[0].neili - rm.immediate[0].neili, 50);
    const shi = cases.find(x => x.id === 'b17-zhentian-quan-shi-baseline-l300');
    const sh = trace(shi, { input: 80 });
    validateB17Record(sh, shi);
    assert.equal(sh.before[0].neili - sh.immediate[0].neili, 150);
    const sm = trace(shi, { hit: false });
    validateB17Record(sm, shi);
    assert.equal(sm.before[0].neili - sm.immediate[0].neili, 50);
});

test('buff 契约：作茧自缚与飞天神行临时增益', () => {
    const jian = cases.find(x => x.id === 'b17-chuncan-zhang-jian-baseline-l300');
    const jh = trace(jian, { hit: true });
    validateB17Record(jh, jian);
    assert.equal(jh.before[0].neili - jh.immediate[0].neili, 150);
    const fei = cases.find(x => x.id === 'b17-sixiang-bufa-fei-baseline-l300');
    const fh = trace(fei, { hit: true });
    validateB17Record(fh, fei);
    assert.equal(fh.before[0].neili - fh.immediate[0].neili, 200);
});

test('control 契约：奔拳快打与灵蛇缠身与点字诀忙乱', () => {
    const kuai = cases.find(x => x.id === 'b17-hujia-quan-kuai-baseline-l300');
    const kh = trace(kuai, { hit: true });
    validateB17Record(kh, kuai);
    assert.equal(kh.before[0].neili - kh.immediate[0].neili, 40);
    const chan = cases.find(x => x.id === 'b17-lingshe-zhangfa-chan-baseline-l300');
    const ch = trace(chan, { hit: true });
    validateB17Record(ch, chan);
    assert.equal(ch.before[0].neili - ch.immediate[0].neili, 0, 'no fee');
});

test('combo 契约：千蛇出洞与日月乾坤按攻击扣费', () => {
    const qianshe = cases.find(x => x.id === 'b17-lingshe-zhangfa-qianshe-baseline-l300');
    const qt = trace(qianshe, { attacks: 5, planned: 5, busy: 3 });
    validateB17Record(qt, qianshe);
    assert.equal(qt.before[0].neili - qt.immediate[0].neili, 100);
    const riyue = cases.find(x => x.id === 'b17-qiankun-jian-riyue-baseline-l300');
    const rt = trace(riyue, { attacks: 6, planned: 6, busy: 4 });
    validateB17Record(rt, riyue);
    assert.equal(rt.before[0].neili - rt.immediate[0].neili, 120);
});

test('multi 契约：蟾震九天无条件费用', () => {
    const zhen = cases.find(x => x.id === 'b17-hamagong-zhen-baseline-l300');
    const both = trace(zhen, { input: 80, directs: 3 });
    validateB17Record(both, zhen);
    assert.equal(both.before[0].neili - both.immediate[0].neili, 400);
});

test('throwing 契约：星光闪烁与流星电闪费用与忙乱', () => {
    const shan = cases.find(x => x.id === 'b17-mantian-xing-shan-baseline-l300');
    const hit = trace(shan, { input: 80, hit: true });
    validateB17Record(hit, shan);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 80);
    assert.equal(hit.immediate[0].busy, 2);
    const liu = cases.find(x => x.id === 'b17-kunlun-qifa-liu-baseline-l300');
    const lh = trace(liu, { input: 80, hit: true });
    validateB17Record(lh, liu);
    assert.equal(lh.before[0].neili - lh.immediate[0].neili, 100);
    assert.equal(lh.immediate[0].busy, 2);
});

test('sacrifice 契约：玉碎昆冈最大内力损失', () => {
    const sui = cases.find(x => x.id === 'b17-zhengliangyi-jian-sui-baseline-l300');
    const hit = trace(sui, { input: 200 });
    validateB17Record(hit, sui);
    const miss = trace(sui, { hit: false });
    validateB17Record(miss, sui);
});

test('特殊约束分支：目标忙乱拒绝与蛇类拒绝', () => {
    for (const id of ['b17-hujia-quan-kuai-target-busy', 'b17-kunlun-zhang-kong-target-busy']) {
        const c = cases.find(x => x.id === id);
        if (c) {
            assert.equal(c.parameters.expected, 'refused');
            validateB17Record(trace(c), c);
        }
    }
    for (const id of ['b17-shedu-qiqiao-da-non-snake-refusal', 'b17-shedu-qiqiao-liandu-non-snake-refusal']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB17Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b17-hua-quan-juan-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB17Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b17Effects(rows, c);
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

test('拒绝文本与原 notify_fail 逐字节一致', () => {
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b17Schools)) {
        const texts = sourceRefusals(abilityFile(cfg));
        for (const gate of cfg.gates) {
            checked++;
            assert.ok(texts.includes(gate.refusal), `${key}/${gate.key} refusal matches source`);
        }
    }
    assert.ok(checked >= 30);
});
