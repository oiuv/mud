// Build discovery inputs only from explicitly reviewed, source-bound setups.
// Missing qualification is a pending item, never an invented unarmed/force fallback.
import assert from 'node:assert/strict';
import { scanSource, sha256 } from './inventory.mjs';
import { categoryCandidates } from './catalog.mjs';

const unarmed = new Set(['unarmed', 'finger', 'hand', 'claw', 'cuff', 'strike', 'leg']);
const weapons = new Set(['axe', 'blade', 'club', 'dagger', 'hammer', 'spear', 'staff', 'sword', 'whip', 'throwing']);
const identifier = /^[a-z][a-z0-9_-]*$/;
const object = v => v && typeof v === 'object' && !Array.isArray(v);

export function buildPerformProbePlan(coverage, readSource, { profiles = {} } = {}) {
    assert.equal(typeof readSource, 'function', '源码读取器必需；不能猜测用法');
    const conditions = [], pending = [];
    for (const entry of coverage.entries.filter(e => !['formal', 'smoke'].includes(e.coverage))) {
        try {
            assert.ok(/^kungfu\/skill\/[a-z0-9_/-]+\.(?:c|lpc)$/.test(entry.path)
                && !entry.path.split('/').includes('..'), '入口不是公开武学源码');
            const profile = profiles[entry.id];
            assert.ok(object(profile), '缺少逐入口核对的 profile');
            assert.ok(profile.qualification_note?.trim(), '缺少资格配置依据');
            const source = readSource(entry.path);
            assert.equal(sha256(source), entry.sha256, '入口源码版本已改变');
            const parts = entry.path.replace(/^kungfu\/skill\//, '').replace(/\.(?:c|lpc)$/, '').split('/');
            const skill = parts[0], ability = parts.at(-1), isExert = entry.kind === 'exert';
            assert.ok(identifier.test(skill) && identifier.test(ability));
            let parentPath, parentSource;
            for (const path of [`kungfu/skill/${skill}.c`, `kungfu/skill/${skill}.lpc`]) {
                try { parentSource = readSource(path); parentPath = path; break; } catch {}
            }
            assert.ok(parentPath && parentSource, '主技能缺失，不能伪造替代技能');
            const usage = profile.usage;
            assert.ok(isExert ? usage === 'force' : unarmed.has(usage) || weapons.has(usage),
                '必须明确指定攻击用法；招架不是绝招用法');
            const candidates = categoryCandidates({ path: parentPath, sha256: sha256(parentSource),
                ...scanSource(parentSource) }).flatMap(d => d.candidates.map(c => c.value));
            // Static candidates are a sanity check, not a proof of dynamic eligibility.
            assert.ok(candidates.includes(usage), '指定用法不在主技能声明中，须单独核实动态/继承来源');
            const actor = structuredClone(profile.actor ?? {});
            actor.skills = { force: 200, dodge: 200, parry: 200, [usage]: 200, [skill]: 200,
                ...actor.skills };
            actor.mappings = { ...actor.mappings, [usage]: skill };
            if (unarmed.has(usage)) actor.preparations = { ...actor.preparations, [usage]: skill };
            if (weapons.has(usage)) {
                assert.equal(actor.equipment?.type, usage, '持器用法必须配置对应兵器');
                assert.equal(Boolean(actor.equipment.hold), usage === 'throwing', '暗器手持与普通持器不同');
            } else assert.ok(!actor.equipment, '徒手/运功不能偷偷配剑');
            actor.properties = { name: '数据采集', gender: '男性', str: 30, con: 30, dex: 30, int: 30,
                combat_exp: 1000000, max_neili: 5000, neili: 5000, ...actor.properties };
            // Grants, family, special prerequisites and targets must come from the reviewed setup.
            assert.ok(['observed', 'refused', 'error'].includes(profile.expected), '必须声明预期结果');
            const samples = profile.samples ?? (profile.deterministic === true ? 2 : 100);
            assert.ok(Number.isSafeInteger(samples) && samples >= (profile.deterministic === true ? 2 : 100),
                '随机效果正式采样不少于100，确定性检查须显式声明');
            const observe = profile.observe_seconds;
            assert.ok(Number.isFinite(observe) && observe >= 0, '必须明确观察窗口');
            const paths = [...new Set([entry.path, parentPath, ...(profile.qualification_sources ?? [])])];
            assert.ok(paths.every(p => /^(?:kungfu\/skill|cmds\/skill|feature)\/[a-z0-9_./-]+\.(?:c|lpc|h)$/.test(p)
                && !p.split('/').includes('..')), '资格来源超出公开武学依赖');
            const evidence = paths.map(path => ({ path, sha256: sha256(readSource(path)) }));
            assert.ok(profile.target_argument === undefined || typeof profile.target_argument === 'string',
                '目标参数必须是明确字符串');
            const suffix = profile.target_argument ? ' ' + profile.target_argument : '';
            assert.ok(!/[\r\n]/.test(suffix));
            conditions.push({
                id: `probe-${entry.kind}-${skill}-${ability}`, stage: 'school', method: entry.kind,
                entry_id: entry.id, samples, status: 'configured_not_executed',
                parameters: { skill, ability, kind: entry.kind, usage, variant: 'probe',
                    probe_contract: 2, qualification_note: profile.qualification_note,
                    actor, target: structuredClone(profile.target ?? {}),
                    named_participants: true, fighting: Boolean(profile.fighting),
                    action: (isExert ? `exert ${ability}` : `perform ${usage}.${ability}`) + suffix,
                    observe_seconds: observe, expected: profile.expected, not_applicable: '',
                    qualification_sources: paths, qualification_evidence: evidence,
                    source_evidence: { path: entry.path, sha256: entry.sha256, line: entry.line },
                    note: '来源已绑定的调查条件；须通过专用效果消费者才可计正常效果覆盖。' },
            });
        } catch (error) {
            pending.push({ entry_id: entry.id, path: entry.path, reason: error.message });
        }
    }
    return { conditions, pending };
}

export function performProbeConditions(coverage, readSource, options = {}) {
    const plan = buildPerformProbePlan(coverage, readSource, options);
    assert.equal(plan.pending.length, 0,
        `存在 ${plan.pending.length} 项待配置；先查看 buildPerformProbePlan().pending，不得用兜底配置开采：`
        + plan.pending.map(p => p.entry_id + ': ' + p.reason).join('; '));
    return plan.conditions;
}
