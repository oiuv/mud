// 5.1/5.3 final acceptance: integrity -> contract replay (observed/refusal split) ->
// evidence closure -> consistency gates. Non-zero exit for ANY undispositioned
// failure/missing slot, inconsistent totals, or unverified completion claim.
//
// Coverage closure rules (A1/A2/A4):
//   Path A      : specialized-consumer formal evidence with clean process exit.
//   Limited     : complete + observed + validated conditions from non-clean-exit runs,
//                 reused per A2 with the run exit status preserved (never relabelled).
//   Path B      : probe originals with source-derived effect-contract validation on
//                 OBSERVED samples (contract v3; refused-only validation never counts
//                 as effect evidence — R03).
//   Defect      : reproduced game-source defects (repro + impact, not a normal pass).
//   N/A         : unreachable dispatch / missing main skill, with source citations.
//   未完成       : everything else, each with a concrete reason.
//
// Commands (from repo root):
//   node tools/tests/martial_data/acceptance_51_53.mjs --coverage <report.json> [--coverage <report.json> ...]
//   node tools/tests/martial_data/acceptance_51_53.mjs --self-test     (A7 counterexamples + real-original mutations)
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { runContractReplay, resolveContract } from './perform_contract_replay.mjs';
import { openSeries } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { validatePerformEffectRecord, runEffectConsumerCounterExamples } from './perform_effect_consumer.mjs';

const E = 'C:/tools/msys64/home/oiuv/mud-evidence/martial-data';
const ROOT = 'C:/tools/msys64/home/oiuv/mud';
const readSource = p => readFileSync(join(ROOT, p), 'utf8');
const json = p => JSON.parse(readFileSync(p, 'utf8'));

export const PROBE_SERIES = ['perform-probe-formal-20261103-v4', 'perform-probe-formal-20261103-v5',
    'perform-probe-formal-20261104-v6', 'perform-probe-formal-20261109-gapfill',
    'perform-probe-formal-20261109-gapfill2', 'perform-probe-formal-20261109-gapfill3',
    'perform-probe-formal-20261114-chousui', 'perform-probe-formal-20261114-gapfill4',
    'perform-probe-formal-20261114-dispel', 'perform-probe-formal-20261115-gapfill5',
    'perform-probe-formal-20261115-gapfill6', 'perform-probe-formal-20261115-gapfill7'];

// Source-verified special dispositions (R02: labels alone never close an entry).
export const SPECIAL_DISPOSITIONS = {
    'kungfu/skill/six-finger/qi.c:10:perform': {
        disposition: '无独立能力/确实不适用',
        basis: 'six-finger.c::perform_action_file 一律返回 liumai-shenjian/<action>，同名 six-finger/qi.c 不会被派发；真实能力由 liumai-shenjian/qi.c 入口另行覆盖。',
        evidence: ['kungfu/skill/six-finger.c:517 (perform_action_file)', 'kungfu/skill/liumai-shenjian/qi.c'],
    },
    'kungfu/skill/six-finger/six.c:8:perform': {
        disposition: '无独立能力/确实不适用',
        basis: 'six-finger.c::perform_action_file 派发至 liumai-shenjian/six.c，six-finger/six.c 不可达；真实能力由 liumai-shenjian/six.c 入口覆盖。',
        evidence: ['kungfu/skill/six-finger.c:517 (perform_action_file)', 'kungfu/skill/liumai-shenjian/six.c'],
    },
    'kungfu/skill/six-finger/zong.c:8:perform': {
        disposition: '无独立能力/确实不适用',
        basis: 'six-finger.c::perform_action_file 派发至 liumai-shenjian/zong.c，six-finger/zong.c 不可达；真实能力由 liumai-shenjian/zong.c 入口覆盖。',
        evidence: ['kungfu/skill/six-finger.c:517 (perform_action_file)', 'kungfu/skill/liumai-shenjian/zong.c'],
    },
    'kungfu/skill/six-finger/zongheng.c:5:perform': {
        disposition: '无独立能力/确实不适用',
        basis: 'six-finger.c::perform_action_file 派发至 liumai-shenjian/zongheng.c，该文件不存在，入口不可达。',
        evidence: ['kungfu/skill/six-finger.c:517 (perform_action_file)', 'liumai-shenjian/ 目录无 zongheng.c'],
    },
    'kungfu/skill/yinyang-shiertian/exert/powerup.c:7:exert': {
        disposition: '无独立能力/确实不适用',
        basis: '无主技能 kungfu/skill/yinyang-shiertian.c（仅存 exert/ 子目录），无任何派发/引用可达该 exert；emei-jiuyin 等仅 query_skill 数值前置引用同名技能等级，不构成派发。',
        evidence: ['kungfu/skill/ 目录无 yinyang-shiertian.c', '全库无 yinyang-shiertian/exert 引用', 'kungfu/skill/jiuyang-shengong.c:116 (仅等级检查)'],
    },
    'kungfu/skill/sanku-shengong/roar.c:7:exert': {
        disposition: '游戏缺陷已复现',
        basis: 'MA-144：roar.c:34 调用全库未定义 die_protect，userp 目标恒 continue，玩家目标永不受伤害；gapfill4 probe-exert-sanku-shengong-roar-2 100/100 复现（actor neili-150/qi-10/busy1，目标伤害 0）。',
        evidence: ['kungfu/skill/sanku-shengong/roar.c:34', 'perform-probe-formal-20261114-gapfill4/probe-exert-sanku-shengong-roar-2'],
    },
    'kungfu/skill/shenzhaojing/perform/wu.c:8:perform': {
        disposition: '游戏缺陷已复现',
        basis: 'MA-136：wu.c:28-29 要求 query_skill_mapped("unarmed")=="shenzhaojing"，但 shenzhaojing.c:60 valid_enable 仅 force，该前置永不可满足；gapfill5 正式 100/100 复现拒绝"你没有激发神照经神功为拳脚"。',
        evidence: ['kungfu/skill/shenzhaojing/perform/wu.c:28', 'kungfu/skill/shenzhaojing.c:60', 'perform-probe-formal-20261115-gapfill5/probe-perform-shenzhaojing-wu-36'],
    },
    'kungfu/skill/shenzhaojing/perform/ying.c:8:perform': {
        disposition: '游戏缺陷已复现',
        basis: 'MA-136：ying.c 同 wu.c 的 unarmed 映射前置永不可满足（shenzhaojing.c:60 valid_enable 仅 force）；gapfill5 正式 100/100 复现拒绝。',
        evidence: ['kungfu/skill/shenzhaojing/perform/ying.c', 'kungfu/skill/shenzhaojing.c:60', 'perform-probe-formal-20261115-gapfill5/probe-perform-shenzhaojing-ying-37'],
    },
};

export function seriesProcessExit(dir) {
    const runsDir = join(dir, 'runs');
    const detail = [];
    let clean = false;
    if (existsSync(runsDir)) {
        for (const name of readdirSync(runsDir)) {
            const p = join(runsDir, name, 'result.json');
            if (!existsSync(p)) continue;
            const r = json(p);
            const ok = r.process?.code === 0 && r.process.signal === null
                && (r.validation_errors === 0 || (Array.isArray(r.validation_errors) && r.validation_errors.length === 0))
                && r.incomplete_bytes === 0;
            if (ok) clean = true;
            detail.push({ attempt: name, code: r.process?.code, signal: r.process?.signal,
                validation_errors: Array.isArray(r.validation_errors) ? r.validation_errors.length : r.validation_errors,
                incomplete_bytes: r.incomplete_bytes, imported: r.imported });
        }
    }
    return { clean, attempts: detail };
}

// Build the per-entry closure account from coverage reports + replay + special dispositions.
export function buildClosure({ coverageReports, replay, contracts }) {
    // 1) Merge evidence refs across coverage reports (later reports override same series/condition).
    const entryRefs = new Map();
    const consumerVersions = [];
    for (const { report, label } of coverageReports) {
        consumerVersions.push({ label, consumer_hashes: report.consumer_hashes,
            source: report.source, scan: report.scan?.scope });
        for (const e of report.entries) {
            if (!entryRefs.has(e.id)) entryRefs.set(e.id, new Map());
            const m = entryRefs.get(e.id);
            for (const ref of e.evidence) {
                m.set(ref.directory + '|' + ref.condition, { ref, label });
            }
        }
    }
    // 2) Replay outcomes per entry (observed-effect evidence vs refusal-only).
    const replayByEntry = new Map();
    for (const s of replay.series) {
        for (const c of s.conditions) {
            const list = replayByEntry.get(c.entry_id) ?? [];
            list.push({ series: s.series, ...c });
            replayByEntry.set(c.entry_id, list);
        }
    }
    const condToEntry = new Map();
    for (const dir of PROBE_SERIES) {
        const manifestPath = join(E, dir, 'series.json');
        if (!existsSync(manifestPath)) continue;
        for (const c of json(manifestPath).identity.conditions) condToEntry.set(c.id, c.entry_id);
    }
    // Observed-passing complete conditions (effect evidence) — computed from replay rows.
    const obsEffect = new Map(); // entry -> [{series, condition, passed_observed...}]
    for (const s of replay.series) {
        for (const c of s.conditions) {
            if (c.failed === 0 && c.missing === 0 && c.not_applicable === 0 && c.passed_observed > 0) {
                const eid = c.entry_id ?? condToEntry.get(c.id);
                const list = obsEffect.get(eid) ?? [];
                list.push({ series: s.series, condition: c.id, planned: c.planned,
                    passed_observed: c.passed_observed, passed_refused: c.passed_refused,
                    contract_status: c.contract_status });
                obsEffect.set(eid, list);
            }
        }
    }
    // 3) Classify every entry.
    const entries = [];
    for (const [id, refs] of entryRefs) {
        const refList = [...refs.values()];
        const formalClean = [];
        const formalLimited = [];
        for (const { ref, label } of refList) {
            const complete = ref.complete_condition ?? (ref.recorded === ref.planned
                && ref.passed_observed + ref.passed_refused === ref.planned);
            const discovery = /perform-probe-(formal|smoke)/.test(ref.directory);
            if (!complete || ref.passed_observed <= 0 || typeof ref.smoke !== 'boolean' || discovery || ref.smoke) continue;
            const exit = seriesProcessExit(ref.directory);
            (exit.clean ? formalClean : formalLimited).push({
                label, series: ref.directory, condition: ref.condition,
                planned: ref.planned, recorded: ref.recorded,
                passed_observed: ref.passed_observed, passed_refused: ref.passed_refused,
                run_exit: exit });
        }
        const special = SPECIAL_DISPOSITIONS[id];
        const contract = contracts[id];
        const obs = obsEffect.get(id) ?? [];
        let disposition, reason, evidenceLink, limitation = null;
        if (special) {
            disposition = special.disposition;
            reason = special.basis;
            evidenceLink = special.evidence.join('; ');
        } else if (formalClean.length) {
            disposition = '正常效果已核验';
            reason = 'Path A：专用消费者 formal（完整条件 + observed>0 + 成功进程退出）';
            evidenceLink = formalClean.map(r => `${r.label}:${r.series.split(/[\\/]/).pop()}/${r.condition}`).join('; ');
        } else if (formalLimited.length) {
            disposition = '正常效果已核验';
            reason = '有限复用（A2）：完整条件经专用消费者重验通过，原运行进程非零退出，保留原退出状态、不改称成功';
            limitation = formalLimited.map(r => `${r.series.split(/[\\/]/).pop()}: exits=${JSON.stringify(r.run_exit.attempts.map(a => a.code))}`).join('; ');
            evidenceLink = formalLimited.map(r => `${r.label}:${r.series.split(/[\\/]/).pop()}/${r.condition}(obs${r.passed_observed})`).join('; ');
        } else if (obs.length && contract && contract.effect_contract
            && ((contract.effect_contract.branches && Object.keys(contract.effect_contract.branches).length)
                || (contract.effect_contract.actorFields?.length || contract.effect_contract.targetFields?.length))) {
            const strength = contract.effect_contract.branches && Object.keys(contract.effect_contract.branches).length
                ? '分支契约' : '字段+数值契约';
            disposition = '正常效果已核验';
            reason = `Path B：源码派生效果契约（${strength}）在 probe 原件上验证 observed 效果（完整条件、hash 绑定、契约 ${contracts.version ?? ''}）`;
            evidenceLink = obs.map(r => `${r.series.split(/[\\/]/).pop()}/${r.condition}(obs${r.passed_observed})`).join('; ');
        } else {
            disposition = '未完成';
            const kinds = [...new Set(refList.map(({ ref }) => {
                if (ref.passed_refused > 0 && !ref.passed_observed) return '仅拒绝';
                if (ref.recorded) return '有记录未验证';
                return '仅配置';
            }))];
            reason = `未完成（${kinds.join('/')}）：无完整 observed 效果证据；需合法配置补采、旧证据重验或源码处置。`;
            evidenceLink = refList.slice(0, 8).map(({ ref, label }) =>
                `${label}:${ref.directory.split(/[\\/]/).pop()}/${ref.condition}[${ref.status ?? '?'}]`).join('; ');
        }
        entries.push({ id, disposition, reason, evidence_link: evidenceLink,
            limitation, formal_clean: formalClean.map(r => r.condition),
            formal_limited: formalLimited.map(r => r.condition),
            contract_observed: obs.map(r => r.condition) });
    }
    return { entries, consumerVersions, replayByEntry, obsEffect };
}

export function checkConsistency(entries) {
    const errors = [];
    const totals = {};
    const byKind = {};
    for (const e of entries) {
        totals[e.disposition] = (totals[e.disposition] ?? 0) + 1;
        const kind = e.id.includes(':exert') ? 'exert' : 'perform';
        const k = `${kind}/${e.disposition}`;
        byKind[k] = (byKind[k] ?? 0) + 1;
        if (!e.reason || !e.evidence_link) errors.push(`${e.id}: 缺 reason/evidence_link`);
    }
    const totalEntries = entries.length;
    const sum = Object.values(totals).reduce((a, b) => a + b, 0);
    if (sum !== totalEntries) errors.push(`totals 合计 ${sum} != 条目数 ${totalEntries}`);
    const kindSum = Object.values(byKind).reduce((a, b) => a + b, 0);
    if (kindSum !== totalEntries) errors.push(`by_kind 合计 ${kindSum} != 条目数 ${totalEntries}`);
    return { totals, byKind, totalEntries, errors };
}

async function selfTest() {
    const results = runEffectConsumerCounterExamples();
    const failed = results.filter(r => !r.pass);
    console.log(`synthetic counterexamples: ${results.length - failed.length}/${results.length} pass`);
    for (const f of failed) console.log('  FAIL', f.name, f.error);

    // Real-original in-memory mutations (A7): mutate genuine collected samples,
    // never write them back.
    const contracts = json(join(E, 'effect-contracts-20261115-v3/effect-contracts.json')).contracts;
    const mutResults = [];
    const check = (name, fn, expectReject) => {
        try { fn(); mutResults.push({ name, pass: !expectReject }); }
        catch (e) { mutResults.push({ name, pass: expectReject, detail: e.message.slice(0, 100) }); }
    };
    // 1. Real powerup sample: delete buff, keep only unrelated target change -> reject.
    try {
        const dir = join(E, 'perform-probe-formal-20261103-v4/samples');
        const m = json(join(E, 'perform-probe-formal-20261103-v4/series.json'));
        const pc = m.identity.conditions.find(c => c.entry_id === 'kungfu/skill/yijinjing/powerup.c:9:exert');
        const base = json(join(dir, pc.id + '.0.json'));
        const contract = contracts['kungfu/skill/yijinjing/powerup.c:9:exert'];
        const cond = { ...pc, parameters: { ...pc.parameters,
            effect_contract: contract.effect_contract,
            refusal_side_effects: contract.refusal_side_effects ?? pc.parameters.refusal_side_effects } };
        check('real-powerup-accept', () => validatePerformEffectRecord(base, cond), false);
        const mutated = structuredClone(base);
        const data = mutated.raw ?? mutated;
        data.after[0].temp = structuredClone(data.before[0].temp);
        data.after[1].qi = (data.after[1].qi ?? 0) - 300; // unrelated target damage only
        check('real-powerup-delete-buff', () => validatePerformEffectRecord(mutated, cond), true);
        const mutated2 = structuredClone(base);
        const d2 = mutated2.raw ?? mutated2;
        d2.after[0].temp.apply.attack = 5; // wrong bonus value
        d2.after[0].temp.apply.defense = 5;
        check('real-powerup-wrong-value', () => validatePerformEffectRecord(mutated2, cond), true);
    } catch (e) { mutResults.push({ name: 'real-powerup-suite', pass: false, detail: e.message }); }
    // 2. Real chousui hit sample: precondition / necessary-effect / value mutations -> reject.
    try {
        const dir = join(E, 'perform-probe-formal-20261114-chousui/samples');
        const m = json(join(E, 'perform-probe-formal-20261114-chousui/series.json'));
        const pc = m.identity.conditions.find(c => c.entry_id === 'kungfu/skill/chousui-zhang/dan.c:10:perform');
        const base = json(join(dir, pc.id + '.0.json'));
        const contract = contracts['kungfu/skill/chousui-zhang/dan.c:10:perform'];
        const cond = { ...pc, parameters: { ...pc.parameters, effect_contract: contract.effect_contract } };
        check('real-chousui-accept', () => validatePerformEffectRecord(base, cond), false);
        const mutated = structuredClone(base);
        const data = mutated.raw ?? mutated;
        delete data.immediate[0].handing_details; // precondition broken
        check('real-chousui-no-poison', () => validatePerformEffectRecord(mutated, cond), true);
        // A7: deleting the poison effect must fail (necessary effect, not optional).
        const noFx = structuredClone(base);
        const dfx = noFx.raw ?? noFx;
        delete dfx.after[1].conditions;
        check('real-chousui-delete-fire-poison', () => validatePerformEffectRecord(noFx, cond), true);
        // A7: removing the poison-consumption difference must fail.
        const noConsume = structuredClone(base);
        const dc = noConsume.raw ?? noConsume;
        dc.after[0].handing_details = structuredClone(dc.before[0].handing_details);
        dc.immediate[0].handing_details = structuredClone(dc.before[0].handing_details);
        check('real-chousui-remove-consumption', () => validatePerformEffectRecord(noConsume, cond), true);
        // A7/R04: wildly inflated target damage must fail (bounds, not just minimums).
        const inflated = structuredClone(base);
        const di = inflated.raw ?? inflated;
        di.after[1].qi = (di.before[1].qi ?? 0) - 99999;
        di.metrics[1].qi_cost = 99999;
        check('real-chousui-damage-99999', () => validatePerformEffectRecord(inflated, cond), true);
        const inflatedState = structuredClone(base); // state-only inflation also rejected
        const dis = inflatedState.raw ?? inflatedState;
        dis.after[1].qi = (dis.before[1].qi ?? 0) - 99999;
        check('real-chousui-damage-99999-state-only', () => validatePerformEffectRecord(inflatedState, cond), true);
    } catch (e) { mutResults.push({ name: 'real-chousui-suite', pass: false, detail: e.message }); }
    // 2b. Real tao backfire sample: keep the neili zeroing, drop unconscious + self-damage -> reject.
    try {
        const dir = join(E, 'perform-probe-formal-20261115-gapfill5/samples');
        const m = json(join(E, 'perform-probe-formal-20261115-gapfill5/series.json'));
        const pc = m.identity.conditions.find(c => c.entry_id === 'kungfu/skill/chousui-zhang/tao.c:9:perform');
        const base = json(join(dir, pc.id + '.0.json'));
        const contract = contracts['kungfu/skill/chousui-zhang/tao.c:9:perform'];
        const cond = { ...pc, parameters: { ...pc.parameters, effect_contract: contract.effect_contract } };
        check('real-tao-backfire-accept', () => validatePerformEffectRecord(base, cond), false);
        const mutated = structuredClone(base);
        const d = mutated.raw ?? mutated;
        d.after[0].living = 1;            // 撤掉昏迷
        d.after[0].qi = d.before[0].qi;   // 撤掉自伤（qi 归零）
        check('real-tao-backfire-no-unconscious', () => validatePerformEffectRecord(mutated, cond), true);
    } catch (e) { mutResults.push({ name: 'real-tao-suite', pass: false, detail: e.message }); }
    // 2c. Real rouyun sample: move endpoint outside the source-declared rooms -> reject.
    try {
        const dir = join(E, 'perform-probe-formal-20261115-gapfill7/samples');
        const m = json(join(E, 'perform-probe-formal-20261115-gapfill7/series.json'));
        const pc = m.identity.conditions.find(c => c.entry_id === 'kungfu/skill/rouyun-steps/zong.c:7:perform');
        const base = json(join(dir, pc.id + '.0.json'));
        const contract = contracts['kungfu/skill/rouyun-steps/zong.c:7:perform'];
        const cond = { ...pc, parameters: { ...pc.parameters, effect_contract: contract.effect_contract } };
        check('real-rouyun-accept', () => validatePerformEffectRecord(base, cond), false);
        const mutated = structuredClone(base);
        const d = mutated.raw ?? mutated;
        d.after[0].environment = '/d/city/not_a_valid_destination';
        check('real-rouyun-wrong-destination', () => validatePerformEffectRecord(mutated, cond), true);
    } catch (e) { mutResults.push({ name: 'real-rouyun-suite', pass: false, detail: e.message }); }
    // 2d. Cross-shape inflation (R04): settled-damage and direct-wound contracts must
    // reject wildly inflated target damage (the maintainer's 99,999 mutation pattern).
    try {
        const dir5 = join(E, 'perform-probe-formal-20261115-gapfill5/samples');
        const m5 = json(join(E, 'perform-probe-formal-20261115-gapfill5/series.json'));
        for (const [label, eid] of [['canhe', 'kungfu/skill/canhe-zhi/jin.c:10:perform'],
            ['bingxin', 'kungfu/skill/bingxin-jue/freeze.c:7:exert']]) {
            const pc = m5.identity.conditions.find(c => c.entry_id === eid);
            const base = json(join(dir5, pc.id + '.0.json'));
            const ct = contracts[eid];
            const cond = { ...pc, parameters: { ...pc.parameters, effect_contract: ct.effect_contract } };
            check('real-' + label + '-accept', () => validatePerformEffectRecord(base, cond), false);
            const mutated = structuredClone(base);
            const d = mutated.raw ?? mutated;
            d.after[1].qi = (d.before[1].qi ?? 0) - 99999;
            d.metrics[1].qi_cost = 99999;
            check('real-' + label + '-damage-99999', () => validatePerformEffectRecord(mutated, cond), true);
        }
    } catch (e) { mutResults.push({ name: 'real-inflation-suite', pass: false, detail: e.message }); }
    // 3. Identity/hash/slot integrity: wrong sha256 must block (resolveContract).
    {
        const contract = contracts['kungfu/skill/yijinjing/powerup.c:9:exert'];
        const r = resolveContract({ entry_id: 'kungfu/skill/yijinjing/powerup.c:9:exert' },
            { 'kungfu/skill/yijinjing/powerup.c:9:exert': { ...contract, source_sha256: 'deadbeef' } }, readSource);
        mutResults.push({ name: 'hash-mismatch-blocks', pass: r.status === 'hash_mismatch' });
    }
    const mutFailed = mutResults.filter(r => !r.pass);
    console.log(`real-original mutations: ${mutResults.length - mutFailed.length}/${mutResults.length} pass`);
    for (const f of mutFailed) console.log('  FAIL', f.name, f.detail ?? '');
    return failed.length === 0 && mutFailed.length === 0;
}

const isMain = process.argv[1] && process.argv[1].endsWith('acceptance_51_53.mjs');
if (isMain && process.argv.includes('--self-test')) {
    const ok = await selfTest();
    console.log('SELF-TEST:', ok ? 'PASS' : 'FAIL');
    process.exit(ok ? 0 : 1);
} else if (isMain) {
    const args = process.argv.slice(2);
    const coveragePaths = [];
    for (let i = 0; i < args.length; i++)
        if (args[i] === '--coverage') coveragePaths.push(args[++i]);
    if (!coveragePaths.length) {
        console.error('Usage: node acceptance_51_53.mjs --coverage <perform-coverage.json> [--coverage ...] | --self-test');
        process.exit(2);
    }
    const coverageReports = coveragePaths.map(p => ({ report: json(p), label: p.split(/[\\/]/).slice(-2, -1)[0] ?? p }));
    const contractsFile = json(join(E, 'effect-contracts-20261115-v3/effect-contracts.json'));
    const { report: replay } = runContractReplay({
        contractsPath: join(E, 'effect-contracts-20261115-v3/effect-contracts.json'),
        seriesDirs: PROBE_SERIES.filter(d => existsSync(join(E, d, 'series.json'))).map(d => join(E, d)),
        readSource,
    });
    const { entries, consumerVersions } = buildClosure({ coverageReports, replay, contracts: contractsFile.contracts });
    const { totals, byKind, totalEntries, errors } = checkConsistency(entries);
    // Disposition gate over replay failures (R01/R07): every failed sample must be
    // covered by entry closure via OTHER evidence, a special disposition, or an
    // explicit superseded re-collection. Anything else is undispositioned -> FAIL.
    const byId = new Map(entries.map(e => [e.id, e]));
    const superseded = {
        'probe-perform-chousui-zhang-dan-0': 'superseded by perform-probe-formal-20261114-chousui (poison held, 100/100 observed)',
        'probe-exert-sanku-shengong-dispel-375': 'superseded by perform-probe-formal-20261114-dispel (target-condition config, 100/100 observed)',
        'probe-perform-wudoumi-shengong-gui-495': 'v4 missing slots superseded by v5 (refused boundary) + v6 (normal observed) re-collection',
    };
    const failureDispositions = [];
    for (const s of replay.series) {
        for (const c of s.conditions) {
            if (!c.failed && !c.missing) continue;
            const seriesName = s.series.split(/[\\/]/).pop();
            const e = byId.get(c.entry_id);
            let via = null, detail = null;
            if (superseded[c.id]) { via = 'superseded'; detail = superseded[c.id]; }
            else if (e && e.disposition === '正常效果已核验'
                && (e.formal_clean.length || e.formal_limited.length
                    || e.contract_observed.some(id => id !== c.id))) {
                via = 'entry-closure'; detail = e.evidence_link.slice(0, 160);
            } else if (e && (e.disposition === '游戏缺陷已复现' || e.disposition === '无独立能力/确实不适用')) {
                via = 'special'; detail = e.reason.slice(0, 160);
            }
            failureDispositions.push({ series: seriesName, condition: c.id, entry_id: c.entry_id,
                failed: c.failed, missing: c.missing, via, detail });
        }
    }
    const undispositioned = failureDispositions.filter(f => !f.via);
    const outDir = join(E, 'acceptance-51-53-20261115-final');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'failure-dispositions.json'),
        JSON.stringify(failureDispositions, null, 1) + '\n');
    writeFileSync(join(outDir, 'coverage-ledger.json'), JSON.stringify({
        created: new Date().toISOString(),
        note: 'Honest closure ledger: Path A (specialized-consumer formal, clean exit) + limited reuse (A2, non-clean exits preserved) + Path B (source-derived effect contracts on probe originals, observed-only) + defect + N/A (source citations). Refusal-only validation never counts as effect evidence.',
        consumer_versions: consumerVersions, totals, by_kind: byKind,
        replay_totals: replay.totals, entries,
    }, null, 1) + '\n');
    writeFileSync(join(outDir, 'contract-replay.json'), JSON.stringify(replay, null, 1) + '\n');
    console.log('entries:', totalEntries);
    console.log('totals:', JSON.stringify(totals));
    console.log('by_kind:', JSON.stringify(byKind));
    console.log('replay:', JSON.stringify(replay.totals));
    console.log('failures:', replay.failures.length, '| undispositioned:', undispositioned.length);
    for (const f of undispositioned) console.log('UNDISPOSITIONED:', JSON.stringify(f));
    for (const e of errors) console.log('CONSISTENCY-ERROR:', e);
    const ok = errors.length === 0 && replay.totals.hash_blocked === 0 && undispositioned.length === 0;
    console.log('VERDICT:', ok ? 'PASS (closure consistent)' : 'FAIL');
    process.exit(ok ? 0 : 1);
}
