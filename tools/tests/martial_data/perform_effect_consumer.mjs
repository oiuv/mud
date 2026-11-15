// Specialized effect/callback consumer for perform/exert probe records.
// Source-code-based effect verification: extracts expected effect fields from
// skill source code and verifies observed records match. Unrelated changes
// (e.g., target qi change for a buff skill) do NOT count as effects.
import assert from 'node:assert/strict';

// Extract expected effect fields from skill source code.
// Returns { actorFields: [...], targetFields: [...], effectValues: {...} } based on source code.
// NOTE: regex extraction is a CANDIDATE list for further review, not proof of semantics.
// Comments are stripped before extraction to avoid false positives.
export function extractEffectFields(source) {
    // Strip line comments and block comments (keep string literals for key matching)
    const stripped = source
        .replace(/\/\/[^\n]*/g, '')           // line comments
        .replace(/\/\*[\s\S]*?\*\//g, '');     // block comments
    const actorFields = new Set();
    const targetFields = new Set();
    const effectValues = {};
    // Extract exact values from set_temp("key", value) where value is a literal
    for (const m of stripped.matchAll(/(?:me->|this_object\(\)->)set_temp\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*\)/g))
        effectValues['temp/' + m[1]] = { exact: parseInt(m[2]) };
    // Extract exact values from target->receive_damage("qi", literal) — target effect only.
    // me->receive_damage("qi", ...) is actor self-damage (cost), NOT a target effect.
    for (const m of stripped.matchAll(/target->receive_damage\s*\(\s*"qi"\s*,\s*(\d+)\s*\)/g)) {
        const val = parseInt(m[1]);
        if (!effectValues['target/qi'] || val > (effectValues['target/qi'].min ?? 0))
            effectValues['target/qi'] = { min: val };
    }
    // set_temp("key", ...) / add_temp("key", ...) on me → actor temp
    for (const m of stripped.matchAll(/(?:me->|this_object\(\)->)(?:set|add)_temp\s*\(\s*"([^"]+)"/g))
        actorFields.add('temp/' + m[1]);
    // me->set("key", ...) → actor property (for grants/can_perform)
    for (const m of stripped.matchAll(/me->set\s*\(\s*"(can_perform\/[^"]+)"/g))
        actorFields.add('grants/' + m[1]);
    // target->receive_damage("qi", ...) or COMBAT_D->do_damage(me, target, ...) → target qi
    if (/target->receive_damage\s*\(\s*"qi"/.test(stripped) || /do_damage\s*\(\s*me\s*,\s*target/.test(stripped)) targetFields.add('target/qi');
    // target->receive_damage("jing", ...) → target jing
    if (/target->receive_damage\s*\(\s*"jing"/.test(stripped)) targetFields.add('target/jing');
    // target->start_busy(...) → target busy
    if (/target->start_busy\s*\(/.test(stripped)) targetFields.add('target/busy');
    // me->start_busy(...) → actor busy (side effect, not main effect)
    // me->receive_damage("qi", ...) on self → actor qi cost (not effect)
    return { actorFields: [...actorFields], targetFields: [...targetFields], effectValues };
}

export function validatePerformEffectRecord(raw, condition) {
    assert.equal(raw.condition_id, condition.id);
    if (raw.outcome === 'error') return;
    const p = condition.parameters;
    const data = raw.raw || raw;
    const before = data.before?.[0];
    const after = data.after?.[0];
    // Both observed and refused require before/after snapshots
    assert.ok(before && after, '缺少前后状态快照');
    if (raw.outcome === 'observed') {
        const actor = data.immediate?.[0];
        assert.ok(actor, '观察记录缺少施放者状态');
        const usage = p.usage;
        const skill = p.skill;
        const mapped = actor.mappings?.[usage];
        // The effective mapping must match the DECLARED configuration: base-force
        // exerts dispatch through a real mapped force skill (never a force->force
        // self-map), so the frozen condition's actor.mappings is the expectation.
        const expectedMapping = p.actor?.mappings?.[usage] ?? skill;
        assert.equal(mapped, expectedMapping, `技能映射未生效：${usage} 应映射 ${expectedMapping}，实际 ${mapped}`);
        // Precondition verification (A3: 合法施展的必要前置状态)：the effect_contract may
        // declare `precondition` requirements (e.g., holding a poison item). Verify against
        // the actor's ACTUAL state, so "observed" is only accepted when the legitimate setup
        // was in place — not just that some effect happened.
        const pre = p.effect_contract?.precondition;
        if (pre) {
            if (pre.handing_program !== undefined) {
                const prog = actor.handing_details?.program ?? '';
                assert.ok(String(prog).includes(pre.handing_program),
                    `前置不满足：需手持 ${pre.handing_program}，实际 handing_program=${prog || '(none)'}`);
            }
            if (pre.holding_poison === true) {
                const isPoison = (actor.handing_details?.poison !== undefined && actor.handing_details.poison !== null)
                    || String(actor.handing_details?.program ?? '').includes('poison');
                assert.ok(isPoison, '前置不满足：需手持毒药物品');
            }
            if (pre.marks !== undefined) {
                for (const [mk, mv] of Object.entries(pre.marks))
                    assert.equal(actor.marks?.[mk], mv, `前置不满足：mark ${mk} 应为 ${mv}`);
            }
            if (pre.temp_equals !== undefined) {
                for (const [tk, tv] of Object.entries(pre.temp_equals))
                    assert.equal(data.immediate?.[0]?.temp?.[tk], tv, `前置不满足：temp ${tk} 应为 ${tv}`);
            }
        }
        // REASONING: An "observed" outcome means the game applied an effect.
        // Type-specific assertions prevent counting unrelated changes as effects.
        // - exert (powerup/shield/heal): effect must be on the ACTOR (temp/marks/grants/skills/mappings).
        //   Target qi changes are NOT exert effects — they come from unrelated sources.
        // - perform (combat): effect may be on actor (buffs) OR target (damage/busy/control).
        // Resource costs (neili/qi/jing on actor) are NOT effects — they are costs.
        const filterTemp = (t) => {
            if (!t) return {};
            const filtered = { ...t };
            delete filtered.notify_fail;
            delete filtered.user_setup;
            return filtered;
        };
        const targetBefore = data.before?.[1];
        const targetAfter = data.after?.[1];
        const hasActorEffect =
            (after.temp && before.temp && Object.keys(filterTemp(after.temp)).length > Object.keys(filterTemp(before.temp)).length) ||
            (after.marks && before.marks && Object.keys(after.marks).length > Object.keys(before.marks).length) ||
            JSON.stringify(after.grants ?? {}) !== JSON.stringify(before.grants ?? {}) ||
            JSON.stringify(after.skills ?? {}) !== JSON.stringify(before.skills ?? {}) ||
            JSON.stringify(after.mappings ?? {}) !== JSON.stringify(before.mappings ?? {});
        const hasTargetEffect = targetBefore && targetAfter && (
            // Damage: substantial qi decrease (not trivial -1 from background sources)
            ((targetBefore.qi ?? 0) - (targetAfter.qi ?? 0)) > 1 ||
            ((targetBefore.eff_qi ?? 0) - (targetAfter.eff_qi ?? 0)) > 1 ||
            ((targetBefore.jing ?? 0) - (targetAfter.jing ?? 0)) > 1 ||
            // Control: busy applied
            ((targetAfter.busy ?? 0) - (targetBefore.busy ?? 0)) > 0 ||
            // Debuff: new temp/marks on target
            Object.keys(filterTemp(targetAfter.temp)).length > Object.keys(filterTemp(targetBefore.temp)).length ||
            Object.keys(targetAfter.marks ?? {}).length > Object.keys(targetBefore.marks ?? {}).length
        );
        // Source-code-based effect verification: the effect must match the ability's
        // expected effect fields (extracted from source code). Unrelated changes don't count.
        const contract = p.effect_contract;
        // BRANCH-AWARE validation (A4/A6): when the contract documents source branches
        // (hit / miss / protection / no-benefit), a sample is valid iff it matches ONE
        // documented branch exactly on its declared deltas. Legal misses and protection
        // branches are correct outcomes, not failures.
        if (contract?.branches && Object.keys(contract.branches).length) {
            const targetBefore = data.before?.[1];
            const targetAfter = data.after?.[1];
            const tQiDrop = (targetBefore?.qi ?? 0) - (targetAfter?.qi ?? 0);
            const tJingDrop = (targetBefore?.jing ?? 0) - (targetAfter?.jing ?? 0);
            const tBusyDelta = (targetAfter?.busy ?? 0) - (targetBefore?.busy ?? 0);
            const aNeiliDelta = (after.neili ?? 0) - (before.neili ?? 0);
            const aMaxNeiliDelta = (after.max_neili ?? 0) - (before.max_neili ?? 0);
            const aBusy = after.busy ?? 0;
            // Mechanism events captured by probes (A4: reuse combat mechanism/events,
            // do not rebuild the combat engine). metrics[0]=actor, metrics[1]=target.
            const m0 = data.metrics?.[0] ?? {};
            const m1 = data.metrics?.[1] ?? {};
            const launched = m0.ability_launched ?? 0;
            const mNeiliCost = m0.neili_cost ?? 0;
            const mDirect = m0.direct ?? 0;
            const mQiCost = m1.qi_cost ?? 0;
            const mJingCost = m1.jing_cost ?? 0;
            const mEffQiCost = m1.eff_qi_cost ?? 0;
            // Launch identity: the correct ability/skill must have been invoked.
            if (contract.mechanism?.launch_argument !== undefined || contract.mechanism?.launch_skill !== undefined) {
                const launches = data.launches ?? [];
                const match = launches.some(l =>
                    (contract.mechanism.launch_argument === undefined || l.argument === contract.mechanism.launch_argument) &&
                    (contract.mechanism.launch_skill === undefined || l.skill === contract.mechanism.launch_skill));
                assert.ok(match, `observed 缺少正确发动事件：期望 argument=${contract.mechanism.launch_argument} skill=${contract.mechanism.launch_skill}，实际 ${JSON.stringify(launches)}`);
            }
            // Resolve nested temp path like "apply/attack" against a temp object.
            const resolveTemp = (temp, path) => {
                if (!temp) return undefined;
                let cur = temp;
                for (const seg of path.split('/')) {
                    if (cur === null || typeof cur !== 'object') return undefined;
                    cur = cur[seg];
                }
                return cur;
            };
            let matchedBranch = null;
            for (const [name, br] of Object.entries(contract.branches)) {
                // Bounds checks support min+max simultaneously (R04: a wildly
                // inflated value must be rejected, not just a trivial one).
                const qiOk = (br.target_qi !== undefined ? tQiDrop === br.target_qi
                    : br.target_qi_min !== undefined ? tQiDrop >= br.target_qi_min : true)
                    && (br.target_qi_max === undefined || tQiDrop <= br.target_qi_max);
                const jingOk = (br.target_jing !== undefined ? tJingDrop === br.target_jing
                    : br.target_jing_min !== undefined ? tJingDrop >= br.target_jing_min : true)
                    && (br.target_jing_max === undefined || tJingDrop <= br.target_jing_max);
                const tBusyOk = (br.target_busy !== undefined ? tBusyDelta === br.target_busy
                    : br.target_busy_min !== undefined ? tBusyDelta >= br.target_busy_min : true)
                    && (br.target_busy_max === undefined || tBusyDelta <= br.target_busy_max);
                const neiliOk = br.actor_neili !== undefined ? aNeiliDelta === br.actor_neili : true;
                const maxNeiliOk = (br.actor_max_neili !== undefined ? aMaxNeiliDelta === br.actor_max_neili : true)
                    && (br.actor_max_neili_min === undefined || aMaxNeiliDelta >= br.actor_max_neili_min)
                    && (br.actor_max_neili_max === undefined || aMaxNeiliDelta <= br.actor_max_neili_max);
                const busyOk = br.actor_busy !== undefined ? aBusy === br.actor_busy
                    : (br.actor_busy_min !== undefined || br.actor_busy_max !== undefined)
                        ? (br.actor_busy_min === undefined || aBusy >= br.actor_busy_min)
                            && (br.actor_busy_max === undefined || aBusy <= br.actor_busy_max)
                    : true;
                // actor_temp_changed: { "apply/attack": true } requires that nested temp key
                // to differ between before and after (source: add_temp("apply/attack", -extra)).
                let tempOk = true;
                if (br.actor_temp_changed) {
                    for (const path of Object.keys(br.actor_temp_changed)) {
                        const bv = resolveTemp(before.temp, path);
                        const av = resolveTemp(after.temp, path);
                        if (JSON.stringify(bv) === JSON.stringify(av)) { tempOk = false; break; }
                    }
                }
                // target_conditions_cleared: dispel-type exerts require the target to carry a
                // condition before and have it cleared after (source: target->clear_condition()).
                let condOk = true;
                if (br.target_conditions_cleared) {
                    const beforeConds = targetBefore?.conditions;
                    const afterConds = targetAfter?.conditions;
                    const hadBefore = beforeConds && (Array.isArray(beforeConds) ? beforeConds.length > 0 : Object.keys(beforeConds).length > 0);
                    const emptyAfter = !afterConds || (Array.isArray(afterConds) ? afterConds.length === 0 : Object.keys(afterConds).length === 0);
                    condOk = hadBefore && emptyAfter;
                }
                // target_condition_added: poison-craft performs apply a condition to the
                // target (source: target->apply_condition("poison-supply", 1)).
                if (br.target_condition_added) {
                    const afterConds = targetAfter?.conditions ?? {};
                    condOk = condOk && Object.hasOwn(afterConds, br.target_condition_added)
                        && !Object.hasOwn(targetBefore?.conditions ?? {}, br.target_condition_added);
                }
                // target_unconscious / actor_unconscious: the perform knocks the
                // target or the performer out (source: x->unconcious()); observable
                // as living flipping to false. The tao backfire branch also carries
                // the self-damage qi->0 with it (unconcious() zeroes qi).
                if (br.target_unconscious) {
                    condOk = condOk && targetAfter?.living === 0
                        && targetBefore?.living !== 0;
                }
                if (br.actor_unconscious) {
                    condOk = condOk && after.living === 0 && before.living !== 0;
                }
                // handing_consumed: the held poison item is used up (source:
                // du->add_amount(-1) / destruct(du)). Observable as the hand slot
                // emptying or the item's amount/weight decreasing.
                if (br.handing_consumed) {
                    const hb = before.handing_details ?? {};
                    const ha = after.handing_details ?? {};
                    const hadItem = hb.object !== undefined && hb.object !== null;
                    const emptied = ha.object === undefined || ha.object === null;
                    const shrunk = (!emptied && ((ha.weight ?? Infinity) < (hb.weight ?? 0)
                        || (ha.amount ?? Infinity) < (hb.amount ?? 0)));
                    condOk = condOk && hadItem && (emptied || shrunk);
                }
                // target_moved / actor_moved: travel-style effects (source: x->move(room));
                // observable as the environment (room) changing between snapshots —
                // object identity (file_name) does not change on move.
                // *_moved_to_any: the destination must be one of the source-declared
                // rooms (A4: 动作对象/目的地按源码限定；只验"换了地方"会被任意终点骗过).
                if (br.target_moved) {
                    condOk = condOk && targetAfter?.environment && targetBefore?.environment
                        && targetAfter.environment !== targetBefore.environment;
                }
                if (br.target_moved_to_any) {
                    condOk = condOk && br.target_moved_to_any.includes(targetAfter?.environment);
                }
                if (br.actor_moved) {
                    condOk = condOk && after.environment && before.environment
                        && after.environment !== before.environment;
                }
                if (br.actor_moved_to_any) {
                    condOk = condOk && br.actor_moved_to_any.includes(after.environment);
                }
                // Mechanism-event checks (probe-captured metrics). These validate the combat
                // mechanism actually executed without rebuilding the damage formula.
                const launchedOk = br.ability_launched !== undefined ? launched === br.ability_launched : true;
                const mNeiliOk = (br.neili_cost !== undefined ? mNeiliCost === br.neili_cost
                    : br.neili_cost_min !== undefined ? mNeiliCost >= br.neili_cost_min : true)
                    && (br.neili_cost_max === undefined || mNeiliCost <= br.neili_cost_max);
                const mDirectOk = (br.direct !== undefined ? mDirect === br.direct
                    : br.direct_min !== undefined ? mDirect >= br.direct_min : true)
                    && (br.direct_max === undefined || mDirect <= br.direct_max);
                const mQiOk = (br.target_qi_cost !== undefined ? mQiCost === br.target_qi_cost
                    : br.target_qi_cost_min !== undefined ? mQiCost >= br.target_qi_cost_min : true)
                    && (br.target_qi_cost_max === undefined || mQiCost <= br.target_qi_cost_max);
                const mJingOk = (br.target_jing_cost !== undefined ? mJingCost === br.target_jing_cost
                    : br.target_jing_cost_min !== undefined ? mJingCost >= br.target_jing_cost_min : true)
                    && (br.target_jing_cost_max === undefined || mJingCost <= br.target_jing_cost_max);
                const mEffQiOk = (br.target_eff_qi_cost !== undefined ? mEffQiCost === br.target_eff_qi_cost
                    : br.target_eff_qi_cost_min !== undefined ? mEffQiCost >= br.target_eff_qi_cost_min : true)
                    && (br.target_eff_qi_cost_max === undefined || mEffQiCost <= br.target_eff_qi_cost_max);
                // target_eff_jing_cost: jing wound channel (source: receive_wound("jing", ...)).
                const mEffJingCost = m1.eff_jing_cost ?? 0;
                const mEffJingOk = (br.target_eff_jing_cost !== undefined ? mEffJingCost === br.target_eff_jing_cost
                    : br.target_eff_jing_cost_min !== undefined ? mEffJingCost >= br.target_eff_jing_cost_min : true)
                    && (br.target_eff_jing_cost_max === undefined || mEffJingCost <= br.target_eff_jing_cost_max);
                // actor_qi_delta: exact actor qi change over the observation window
                // (includes delayed call_out costs, e.g. qianzhu-wandushou/suck release).
                // actor_qi_max: cap on the final actor qi (e.g. unconcious() self-damage
                // drops qi to 0 — removing that must fail).
                const aQiDelta = (after.qi ?? 0) - (before.qi ?? 0);
                const aQiDeltaOk = (br.actor_qi_delta !== undefined ? aQiDelta === br.actor_qi_delta : true)
                    && (br.actor_qi_max === undefined || (after.qi ?? 0) <= br.actor_qi_max);
                // actor_eff_qi_delta: healing-style effects (source: me->add("eff_qi", ...)).
                const aEffQiDelta = (after.eff_qi ?? 0) - (before.eff_qi ?? 0);
                const aEffQiDeltaOk = br.actor_eff_qi_delta_min !== undefined
                    ? aEffQiDelta >= br.actor_eff_qi_delta_min
                    : br.actor_eff_qi_delta !== undefined ? aEffQiDelta === br.actor_eff_qi_delta : true;
                // target_neili_delta: energy-drain effects (source: target->add("neili", -cost)).
                const tNeiliDelta = (targetBefore?.neili ?? 0) - (targetAfter?.neili ?? 0);
                const tNeiliOk = br.target_neili_min !== undefined ? tNeiliDelta >= br.target_neili_min
                    : br.target_neili !== undefined ? tNeiliDelta === br.target_neili : true;
                // target_max_neili_delta: max-energy drain (source: target->add("max_neili", -sucked)).
                const tMaxNeiliDelta = (targetBefore?.max_neili ?? 0) - (targetAfter?.max_neili ?? 0);
                const tMaxNeiliOk = br.target_max_neili !== undefined
                    ? tMaxNeiliDelta === br.target_max_neili : true;
                // target_eff_qi_recovery: curing mechanism (source: target->receive_curing("qi", ...)).
                const tEffRec = m1.eff_qi_recovery ?? 0;
                const tEffRecOk = br.target_eff_qi_recovery_min !== undefined
                    ? tEffRec >= br.target_eff_qi_recovery_min
                    : br.target_eff_qi_recovery !== undefined ? tEffRec === br.target_eff_qi_recovery : true;
                // Heal/curing mechanism: metrics[0].qi_recovery (source: receive_heal/receive_curing).
                const mQiRec = m0.qi_recovery ?? 0;
                const healOk = br.actor_qi_recovery !== undefined ? mQiRec === br.actor_qi_recovery
                    : br.actor_qi_recovery_min !== undefined ? mQiRec >= br.actor_qi_recovery_min : true;
                if (qiOk && jingOk && tBusyOk && neiliOk && maxNeiliOk && busyOk && tempOk && condOk
                    && launchedOk && mNeiliOk && mDirectOk && mQiOk && mJingOk && mEffQiOk && mEffJingOk && aQiDeltaOk
                    && aEffQiDeltaOk && tNeiliOk && tMaxNeiliOk && tEffRecOk && healOk) { matchedBranch = name; break; }
            }
            assert.ok(matchedBranch,
                `observed 结果不匹配任何源码分支（target/qi -${tQiDrop}, target/jing -${tJingDrop}, target/busy +${tBusyDelta}, `
                + `actor neili ${aNeiliDelta}, max_neili ${aMaxNeiliDelta}, busy ${aBusy}）；已声明分支：${Object.keys(contract.branches).join(', ')}`);
            return [{ outcome: raw.outcome, effect_verified: true, branch: matchedBranch }];
        }
        if (contract && (contract.actorFields?.length || contract.targetFields?.length)) {
            // Verify EVERY expected effect field changed (A4: multiple necessary effects
            // must all be verified, not any arbitrary one), with value constraints where
            // the contract declares them (effectValues supports temp/ paths too).
            const filterTemp = (t) => {
                if (!t) return {};
                const filtered = { ...t };
                delete filtered.notify_fail;
                delete filtered.user_setup;
                return filtered;
            };
            const actorTempBefore = filterTemp(before.temp);
            const actorTempAfter = filterTemp(after.temp);
            const targetBefore = data.before?.[1];
            const targetAfter = data.after?.[1];

            // Resolve nested temp path ("apply/attack" -> temp.apply.attack).
            const resolveTemp = (temp, path) => {
                if (!temp) return undefined;
                let cur = temp;
                for (const seg of path.split('/')) {
                    if (cur === null || typeof cur !== 'object') return undefined;
                    cur = cur[seg];
                }
                return cur;
            };
            const missing = [];
            for (const field of contract.actorFields || []) {
                if (field.startsWith('temp/')) {
                    const key = field.slice(5);
                    const bv = resolveTemp(before.temp, key);
                    const av = resolveTemp(after.temp, key);
                    let ok = av !== undefined && JSON.stringify(av) !== JSON.stringify(bv);
                    // Numeric contract values bind to the source formula over the declared
                    // config; exact/min/options are checked against the observed DELTA for
                    // add-style keys and the observed VALUE for set-style flags. `options`
                    // covers source branches with distinct literal values (A4: every branch
                    // value is source-derived; never inferred from samples).
                    const ev = contract.effectValues?.[field];
                    if (ok && ev) {
                        const delta = (typeof av === 'number' && typeof bv === 'number') ? av - bv : undefined;
                        const matchOne = n => av === n || delta === n;
                        if (Array.isArray(ev.options))
                            ok = ev.options.some(matchOne);
                        else if (ev.exact !== undefined)
                            ok = matchOne(ev.exact);
                        else if (ev.min !== undefined)
                            ok = (typeof av === 'number' && av >= ev.min)
                                || (delta !== undefined && delta >= ev.min);
                    }
                    if (!ok) missing.push(field + (ev ? ` (值需 ${JSON.stringify(ev)})` : ''));
                } else if (field.startsWith('grants/')) {
                    const key = field.slice(7);
                    if (JSON.stringify(after.grants?.[key]) === JSON.stringify(before.grants?.[key]))
                        missing.push(field);
                }
            }
            for (const field of contract.targetFields || []) {
                if (field === 'target/qi' && targetBefore && targetAfter) {
                    const qiDrop = (targetBefore.qi ?? 0) - (targetAfter.qi ?? 0);
                    // Require explicit value constraint from source code. No default minimum —
                    // trivial qi changes (e.g., -2) do NOT prove a real damage effect.
                    // Per goal A4: "无契约、字段缺失或语义未支持时，保持'调查/待核实'"
                    const ev = contract.effectValues?.['target/qi'];
                    if (ev?.min !== undefined && qiDrop >= ev.min) continue;
                    if (ev?.exact !== undefined && qiDrop === ev.exact) continue;
                    // No value constraint → insufficient contract, do not match
                    missing.push(field + (ev ? ` (值需 ${JSON.stringify(ev)})` : ' (缺数值约束)'));
                } else if (field === 'target/jing' && targetBefore && targetAfter) {
                    const jingDrop = (targetBefore.jing ?? 0) - (targetAfter.jing ?? 0);
                    const ev = contract.effectValues?.['target/jing'];
                    if (ev?.min !== undefined && jingDrop >= ev.min) continue;
                    if (ev?.exact !== undefined && jingDrop === ev.exact) continue;
                    missing.push(field + (ev ? ` (值需 ${JSON.stringify(ev)})` : ' (缺数值约束)'));
                } else if (field === 'target/busy' && targetBefore && targetAfter) {
                    const busyDelta = (targetAfter.busy ?? 0) - (targetBefore.busy ?? 0);
                    const ev = contract.effectValues?.['target/busy'];
                    if (ev?.min !== undefined && busyDelta >= ev.min) continue;
                    if (ev?.exact !== undefined && busyDelta === ev.exact) continue;
                    missing.push(field + (ev ? ` (值需 ${JSON.stringify(ev)})` : ' (缺数值约束)'));
                } else {
                    missing.push(field + ' (缺少目标前后快照)');
                }
            }
            assert.ok(missing.length === 0,
                `observed 结果缺少源码预期效果：${missing.join('; ')}`);
        } else {
            // No contract: fall back to generic check (actor effect OR substantial target effect)
            const hasGameEffect = hasActorEffect || hasTargetEffect;
            assert.ok(hasGameEffect,
                'observed 结果无游戏效果：actor 状态和目标状态均无显著效果变化，仅扣资源或微小气血变化不算效果');
        }
        assert.ok(data.metrics?.[0], '缺少资源账观察');
    }
    if (raw.outcome === 'refused') {
        // REASONING: A "refused" outcome means the game did NOT apply the skill's main effect.
        // Source-code-based validation: most skills check conditions BEFORE side effects,
        // so refusal has NO qi/neili/busy changes. Exception: skills that perform actions
        // BEFORE the refusal check (e.g., shedao-qigong/chang3 deducts qi/neili, applies busy
        // before checking enemy neili). Only conditions with `refusal_side_effects` configured
        // may have those specific side effects.
        //
        // FIXTURE-FAILURE vs LEGITIMATE REFUSAL (A5/A6): if the effect_contract declares a
        // `precondition` and it is NOT met in the record, the refusal is due to a collection
        // fixture gap (e.g., poison not held), NOT a legitimate qualification-boundary refusal.
        // Such records must not count as valid "expected=refused" evidence.
        const actor0 = data.immediate?.[0] ?? data.before?.[0];
        const pre = p.effect_contract?.precondition;
        if (pre && actor0) {
            let preMet = true;
            if (pre.holding_poison === true) {
                const isPoison = (actor0.handing_details?.poison !== undefined && actor0.handing_details.poison !== null)
                    || String(actor0.handing_details?.program ?? '').includes('poison');
                preMet = preMet && isPoison;
            }
            if (pre.handing_program !== undefined) {
                preMet = preMet && String(actor0.handing_details?.program ?? '').includes(pre.handing_program);
            }
            if (pre.marks !== undefined) {
                for (const [mk, mv] of Object.entries(pre.marks))
                    preMet = preMet && actor0.marks?.[mk] === mv;
            }
            assert.ok(preMet,
                'fixture-failure 拒绝：前置未满足（如毒药未持握）却记为 refused，属采集夹具缺口非合法资格边界');
        }
        const filterTemp = (t) => {
            if (!t) return {};
            const filtered = { ...t };
            delete filtered.notify_fail;
            delete filtered.user_setup;
            return filtered;
        };
        // No new temp/marks/grants (no buff/debuff applied)
        const hasEffectChange =
            JSON.stringify(after.skills ?? {}) !== JSON.stringify(before.skills ?? {}) ||
            JSON.stringify(after.mappings ?? {}) !== JSON.stringify(before.mappings ?? {}) ||
            JSON.stringify(after.grants ?? {}) !== JSON.stringify(before.grants ?? {}) ||
            Object.keys(filterTemp(after.temp)).length > Object.keys(filterTemp(before.temp)).length ||
            Object.keys(after.marks ?? {}).length > Object.keys(before.marks ?? {}).length;
        assert.ok(!hasEffectChange, 'refused 结果却有游戏效果变化（新 temp/marks/grants/skills/mappings）');
        // Check qi/neili/busy against source-code-documented refusal side effects
        const rse = p.refusal_side_effects; // e.g., { qi: 'decrease', qi_exact: 10, neili: 'decrease', busy: 'increase' }
        const qiDelta = (after.qi ?? 0) - (before.qi ?? 0);
        const neiliDelta = (after.neili ?? 0) - (before.neili ?? 0);
        const busyDelta = (after.busy ?? 0) - (before.busy ?? 0);
        if (rse?.qi_exact !== undefined) {
            // Exact value required: qi MUST change by exactly this amount (source: receive_damage("qi", N))
            assert.equal(qiDelta, -rse.qi_exact,
                `refused 气血变化（${qiDelta}）应为 -${rse.qi_exact}（源码 receive_damage("qi", ${rse.qi_exact})）`);
        } else if (rse?.qi !== undefined) {
            // Direction-only config is INSUFFICIENT per goal A5: "验证数值/范围、对象、时序
            // 和必要条件，不仅判断方向正确". Require explicit qi_exact when qi side effect exists.
            throw new assert.AssertionError({ message:
                `refusal_side_effects 配置了 qi: '${rse.qi}' 但缺少 qi_exact 精确值；`
                + `方向匹配不足以证明数值正确（当前 qi 变化 ${qiDelta}）` });
        } else if (qiDelta !== 0) {
            assert.ok(false, `refused 有气血变化（${qiDelta}），但源码无拒绝扣血分支`);
        }
        if (rse?.neili_exact !== undefined) {
            assert.equal(neiliDelta, -rse.neili_exact,
                `refused 内力变化（${neiliDelta}）应为 -${rse.neili_exact}`);
        } else if (neiliDelta !== 0) {
            assert.ok(rse?.neili === 'decrease' && neiliDelta < 0,
                `refused 有内力变化（${neiliDelta}），但源码无拒绝扣内力分支`);
        }
        if (busyDelta !== 0) {
            assert.ok(rse?.busy === 'increase' && busyDelta > 0,
                `refused 有忙乱变化（${busyDelta}），但源码无拒绝设忙乱分支`);
        }
    }
    return [{ outcome: raw.outcome, effect_verified: raw.outcome === 'observed' }];
}

export function performEffectSummary(records) {
    const observed = records.filter(r => r.outcome === 'observed');
    const refused = records.filter(r => r.outcome === 'refused');
    const errors = records.filter(r => r.outcome === 'error');
    return {
        total: records.length,
        observed: observed.length,
        refused: refused.length,
        errors: errors.length,
        effect_types: observed.reduce((acc, r) => {
            const skill = r.skill || 'unknown';
            acc[skill] = (acc[skill] || 0) + 1;
            return acc;
        }, {}),
    };
}

// Counter-example tests: verify consumer rejects unrelated changes and accepts real effects.
// These are principled negative/positive pairs, not hardcoded sample rejections.
export function runEffectConsumerCounterExamples() {
    const baseCondition = {
        id: 'test-cond', parameters: { kind: 'exert', usage: 'force', skill: 'test-skill' },
    };
    const baseRaw = {
        condition_id: 'test-cond', outcome: 'observed', index: 0,
        raw: {
            before: [{ qi: 10000, neili: 5000, temp: { user_setup: 1 }, marks: {}, grants: {}, skills: {}, mappings: {} },
                { qi: 10000, eff_qi: 10000, jing: 10000, busy: 0, temp: {}, marks: {} }],
            after: [{ qi: 10000, neili: 4900, temp: { user_setup: 1 }, marks: {}, grants: {}, skills: {}, mappings: {} },
                { qi: 10000, eff_qi: 10000, jing: 10000, busy: 0, temp: {}, marks: {} }],
            immediate: [{ mappings: { force: 'test-skill' } }],
            metrics: [{}],
        },
    };
    const results = [];

    // Positive: exert with actor temp change (real powerup)
    {
        const raw = structuredClone(baseRaw);
        raw.raw.after[0].temp = { user_setup: 1, powerup: 1 };
        try { validatePerformEffectRecord(raw, baseCondition); results.push({ name: 'exert-with-temp', pass: true }); }
        catch (e) { results.push({ name: 'exert-with-temp', pass: false, error: e.message }); }
    }

    // Negative: exert with only target qi -1 (unrelated change)
    {
        const raw = structuredClone(baseRaw);
        raw.raw.after[1].qi = 9999;
        try { validatePerformEffectRecord(raw, baseCondition); results.push({ name: 'exert-target-qi-1', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'exert-target-qi-1', pass: true }); }
    }

    // Negative: exert with only neili cost (no effect)
    {
        const raw = structuredClone(baseRaw);
        try { validatePerformEffectRecord(raw, baseCondition); results.push({ name: 'exert-only-cost', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'exert-only-cost', pass: true }); }
    }

    // Negative: refused with new temp (effect in refusal)
    {
        const raw = structuredClone(baseRaw);
        raw.outcome = 'refused';
        raw.raw.after[0].temp = { user_setup: 1, powerup: 1 };
        try { validatePerformEffectRecord(raw, baseCondition); results.push({ name: 'refused-with-temp', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'refused-with-temp', pass: true }); }
    }

    // Positive: refused with qi side effect but no temp change (shedao-qigong pattern)
    // Source: me->receive_damage("qi", 10) → qi_exact: 10
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters,
            refusal_side_effects: { qi: 'decrease', qi_exact: 10, neili: 'decrease', busy: 'increase' } } };
        const raw = structuredClone(baseRaw);
        raw.outcome = 'refused';
        raw.raw.after[0].qi = 9990;
        raw.raw.after[0].neili = 4571;
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'refused-qi-sideeffect', pass: true }); }
        catch (e) { results.push({ name: 'refused-qi-sideeffect', pass: false, error: e.message }); }
    }

    // Negative: refused with direction-only config (no qi_exact) → should reject
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters,
            refusal_side_effects: { qi: 'decrease', neili: 'decrease', busy: 'increase' } } };
        const raw = structuredClone(baseRaw);
        raw.outcome = 'refused';
        raw.raw.after[0].qi = 9990;
        raw.raw.after[0].neili = 4571;
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'refused-direction-only', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'refused-direction-only', pass: true }); }
    }

    // Negative: refused with qi change but NO refusal_side_effects configured
    {
        const raw = structuredClone(baseRaw);
        raw.outcome = 'refused';
        raw.raw.after[0].qi = 9990;
        try { validatePerformEffectRecord(raw, baseCondition); results.push({ name: 'refused-qi-no-rse', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'refused-qi-no-rse', pass: true }); }
    }

    // Positive: perform with target damage
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'perform', usage: 'unarmed' } };
        const raw = structuredClone(baseRaw);
        raw.raw.immediate[0].mappings = { unarmed: 'test-skill' };
        raw.raw.before[1].qi = 10000;
        raw.raw.after[1].qi = 8000;
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'perform-target-damage', pass: true }); }
        catch (e) { results.push({ name: 'perform-target-damage', pass: false, error: e.message }); }
    }

    // Negative: powerup with effect_contract (actor/temp) but only target qi -2 (unrelated)
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters,
            effect_contract: { actorFields: ['temp/powerup'], targetFields: [] } } };
        const raw = structuredClone(baseRaw);
        raw.raw.after[1].qi = 9998; // target qi -2, no actor temp change
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'contract-target-qi-2', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'contract-target-qi-2', pass: true }); }
    }

    // Positive: powerup with effect_contract (actor/temp) and matching temp change
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters,
            effect_contract: { actorFields: ['temp/powerup'], targetFields: [] } } };
        const raw = structuredClone(baseRaw);
        raw.raw.after[0].temp = { user_setup: 1, powerup: 1 };
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'contract-temp-match', pass: true }); }
        catch (e) { results.push({ name: 'contract-temp-match', pass: false, error: e.message }); }
    }

    // Negative: multi-field contract where only the flag temp appears (bonus missing).
    // A4/A7: "仅有标记，必要属性增益缺失 → 拒绝".
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'exert',
            effect_contract: { actorFields: ['temp/apply/attack', 'temp/powerup'], targetFields: [],
                effectValues: { 'temp/powerup': { exact: 1 } } } } };
        const raw = structuredClone(baseRaw);
        raw.raw.after[0].temp = { user_setup: 1, powerup: 1 }; // flag only, apply/attack missing
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'multi-field-flag-only', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'multi-field-flag-only', pass: true }); }
    }
    // Negative: multi-field with wrong bonus value (attack +10, source formula expects +66).
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'exert',
            effect_contract: { actorFields: ['temp/apply/attack', 'temp/powerup'], targetFields: [],
                effectValues: { 'temp/apply/attack': { exact: 66 }, 'temp/powerup': { exact: 1 } } } } };
        const raw = structuredClone(baseRaw);
        raw.raw.after[0].temp = { user_setup: 1, powerup: 1, apply: { attack: 10 } };
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'multi-field-wrong-value', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'multi-field-wrong-value', pass: true }); }
    }
    // Positive: multi-field with correct bonuses and flag (powerup pattern).
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'exert',
            effect_contract: { actorFields: ['temp/apply/attack', 'temp/apply/defense', 'temp/powerup'], targetFields: [],
                effectValues: { 'temp/apply/attack': { exact: 66 }, 'temp/apply/defense': { exact: 66 }, 'temp/powerup': { exact: 1 } } } } };
        const raw = structuredClone(baseRaw);
        raw.raw.after[0].temp = { user_setup: 1, powerup: 1, apply: { attack: 66, defense: 66 } };
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'multi-field-full-match', pass: true }); }
        catch (e) { results.push({ name: 'multi-field-full-match', pass: false, error: e.message }); }
    }

    // Branch-value options (source has two value branches): accept either, reject others.
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'exert',
            effect_contract: { actorFields: ['temp/apply/attack'], targetFields: [],
                effectValues: { 'temp/apply/attack': { options: [100, 200] } } } } };
        for (const [name, val, expect] of [['options-branch-a', 100, true], ['options-branch-b', 200, true], ['options-wrong', 150, false]]) {
            const raw = structuredClone(baseRaw);
            raw.raw.after[0].temp = { user_setup: 1, apply: { attack: val } };
            try { validatePerformEffectRecord(raw, cond); results.push({ name, pass: expect }); }
            catch (e) { results.push({ name, pass: !expect, error: e.message }); }
        }
    }

    // Negative: refusal side effect with wrong value (qi=0 instead of qi=-10)
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters,
            refusal_side_effects: { qi: 'decrease', qi_exact: 10, neili: 'decrease', busy: 'increase' } } };
        const raw = structuredClone(baseRaw);
        raw.outcome = 'refused';
        raw.raw.after[0].qi = 10000; // qi unchanged (should be -10)
        raw.raw.after[0].neili = 4571;
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'refusal-wrong-value', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'refusal-wrong-value', pass: true }); }
    }

    // Negative: target damage below source-code minimum (qi -2, but min is 300)
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'perform', usage: 'unarmed',
            effect_contract: { actorFields: [], targetFields: ['target/qi'], effectValues: { 'target/qi': { min: 300 } } } } };
        const raw = structuredClone(baseRaw);
        raw.raw.immediate[0].mappings = { unarmed: 'test-skill' };
        raw.raw.before[1].qi = 10000;
        raw.raw.after[1].qi = 9998; // only -2, but min is 300
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'damage-below-min', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'damage-below-min', pass: true }); }
    }

    // Positive: target damage above source-code minimum (qi -500, min is 300)
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'perform', usage: 'unarmed',
            effect_contract: { actorFields: [], targetFields: ['target/qi'], effectValues: { 'target/qi': { min: 300 } } } } };
        const raw = structuredClone(baseRaw);
        raw.raw.immediate[0].mappings = { unarmed: 'test-skill' };
        raw.raw.before[1].qi = 10000;
        raw.raw.after[1].qi = 9500; // -500, above min 300
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'damage-above-min', pass: true }); }
        catch (e) { results.push({ name: 'damage-above-min', pass: false, error: e.message }); }
    }

    // Negative: refusal side effect with qi=0 (should be -10 per source code)
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters,
            refusal_side_effects: { qi: 'decrease', qi_exact: 10, neili: 'decrease', busy: 'increase' } } };
        const raw = structuredClone(baseRaw);
        raw.outcome = 'refused';
        raw.raw.after[0].qi = 0; // qi=0 (归零), should be -10
        raw.raw.after[0].neili = 4571;
        try { validatePerformEffectRecord(raw, cond); results.push({ name: 'refusal-qi-zero', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'refusal-qi-zero', pass: true }); }
    }

    // Branch-aware validation (A4/A6): source-documented branches.
    const branchContract = { actorFields: [], targetFields: ['target/qi'],
        effectValues: { 'target/qi': { min: 150 } },
        branches: {
            hit: { target_qi_min: 150, actor_neili: -220, actor_busy: 2 },
            miss: { target_qi: 0, actor_neili: -100, actor_busy: 3 },
            blocked_by_neili: { target_qi: 0, actor_neili: -150, actor_busy: 3 },
        } };
    const branchCond = { ...baseCondition, parameters: { ...baseCondition.parameters,
        kind: 'perform', usage: 'strike', effect_contract: branchContract } };
    const branchRaw = (qiDrop, neiliDelta, busy) => {
        const raw = structuredClone(baseRaw);
        raw.raw.immediate[0].mappings = { strike: 'test-skill' };
        raw.raw.before[1].qi = 10000; raw.raw.after[1].qi = 10000 - qiDrop;
        raw.raw.after[0].neili = 5000 + neiliDelta;
        raw.raw.after[0].busy = busy;
        return raw;
    };
    // Positive: hit branch
    {
        try { validatePerformEffectRecord(branchRaw(692, -220, 2), branchCond); results.push({ name: 'branch-hit', pass: true }); }
        catch (e) { results.push({ name: 'branch-hit', pass: false, error: e.message }); }
    }
    // Positive: blocked_by_neili branch (legal protection branch, no damage)
    {
        try { validatePerformEffectRecord(branchRaw(0, -150, 3), branchCond); results.push({ name: 'branch-blocked', pass: true }); }
        catch (e) { results.push({ name: 'branch-blocked', pass: false, error: e.message }); }
    }
    // Negative: matches NO branch (qi -50 with hit-branch neili/busy)
    {
        try { validatePerformEffectRecord(branchRaw(50, -220, 2), branchCond); results.push({ name: 'branch-no-match', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'branch-no-match', pass: true }); }
    }
    // Negative: wrong neili for blocked branch (-150 expected, -10 given)
    {
        try { validatePerformEffectRecord(branchRaw(0, -10, 3), branchCond); results.push({ name: 'branch-wrong-neili', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'branch-wrong-neili', pass: true }); }
    }

    // Branch: target_conditions_cleared (dispel-type). Source: target->clear_condition().
    const dispelContract = { actorFields: [], targetFields: [], effectValues: {},
        branches: { dispel_other: { actor_neili: -250, target_conditions_cleared: true,
            actor_busy_min: 2, actor_busy_max: 4 } } };
    const dispelCond = { ...baseCondition, parameters: { ...baseCondition.parameters,
        kind: 'exert', usage: 'force', effect_contract: dispelContract } };
    const dispelRaw = (beforeConds, afterConds, neiliDelta, busy) => {
        const raw = structuredClone(baseRaw);
        raw.raw.immediate[0].mappings = { force: 'test-skill' };
        raw.raw.before[1].conditions = beforeConds;
        raw.raw.after[1].conditions = afterConds;
        raw.raw.after[0].neili = 5000 + neiliDelta;
        raw.raw.after[0].busy = busy;
        return raw;
    };
    // Positive: condition cleared with correct neili/busy
    {
        try { validatePerformEffectRecord(dispelRaw({ drunk: 10 }, {}, -250, 3), dispelCond); results.push({ name: 'dispel-cleared', pass: true }); }
        catch (e) { results.push({ name: 'dispel-cleared', pass: false, error: e.message }); }
    }
    // Negative: condition NOT cleared (dispel didn't work)
    {
        try { validatePerformEffectRecord(dispelRaw({ drunk: 10 }, { drunk: 10 }, -250, 3), dispelCond); results.push({ name: 'dispel-not-cleared', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'dispel-not-cleared', pass: true }); }
    }
    // Negative: no pre-existing condition (nothing to dispel — wrong branch claim)
    {
        try { validatePerformEffectRecord(dispelRaw({}, {}, -250, 3), dispelCond); results.push({ name: 'dispel-no-precondition', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'dispel-no-precondition', pass: true }); }
    }

    // Branch: target_unconscious (shedu-qiqiao/da pattern: target->unconcious()).
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'perform', usage: 'strike',
            effect_contract: { actorFields: [], targetFields: [], effectValues: {},
                branches: { knockout: { target_unconscious: true, actor_neili: -50, actor_busy: 2 } } } } };
        const mk = (living) => {
            const raw = structuredClone(baseRaw);
            raw.raw.immediate[0].mappings = { strike: 'test-skill' };
            raw.raw.before[1].living = 1;
            raw.raw.after[1].living = living;
            raw.raw.after[0].neili = 5000 - 50;
            raw.raw.after[0].busy = 2;
            return raw;
        };
        try { validatePerformEffectRecord(mk(0), cond); results.push({ name: 'knockout-accept', pass: true }); }
        catch (e) { results.push({ name: 'knockout-accept', pass: false, error: e.message }); }
        try { validatePerformEffectRecord(mk(1), cond); results.push({ name: 'knockout-still-living', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'knockout-still-living', pass: true }); }
    }
    // Branch: actor_moved (rouyun-steps/zong pattern: me->move(room) -> environment change).
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'perform', usage: 'dodge',
            effect_contract: { actorFields: [], targetFields: [], effectValues: {},
                branches: { flee: { actor_moved: true } } } } };
        const mk = (moved) => {
            const raw = structuredClone(baseRaw);
            raw.raw.immediate[0].mappings = { dodge: 'test-skill' };
            raw.raw.before[0].environment = '/tests/runner';
            raw.raw.after[0].environment = moved ? '/d/city/wumiao' : '/tests/runner';
            return raw;
        };
        try { validatePerformEffectRecord(mk(true), cond); results.push({ name: 'actor-moved-accept', pass: true }); }
        catch (e) { results.push({ name: 'actor-moved-accept', pass: false, error: e.message }); }
        try { validatePerformEffectRecord(mk(false), cond); results.push({ name: 'actor-not-moved', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'actor-not-moved', pass: true }); }
    }
    // Branch: actor_moved_to_any — the destination must be one of the source-declared
    // rooms; an arbitrary room change must be rejected (A4/A7).
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'perform', usage: 'dodge',
            effect_contract: { actorFields: [], targetFields: [], effectValues: {},
                branches: { flee: { actor_moved: true, actor_moved_to_any: ['/d/city/wumiao', '/d/city/kedian'] } } } } };
        const mk = (dest) => {
            const raw = structuredClone(baseRaw);
            raw.raw.immediate[0].mappings = { dodge: 'test-skill' };
            raw.raw.before[0].environment = '/tests/runner';
            raw.raw.after[0].environment = dest;
            return raw;
        };
        try { validatePerformEffectRecord(mk('/d/city/kedian'), cond); results.push({ name: 'moved-to-legal-room', pass: true }); }
        catch (e) { results.push({ name: 'moved-to-legal-room', pass: false, error: e.message }); }
        try { validatePerformEffectRecord(mk('/d/city/not_a_valid_destination'), cond); results.push({ name: 'moved-to-wrong-room', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'moved-to-wrong-room', pass: true }); }
    }
    // Branch: handing_consumed (poison item used up: add_amount(-1) / destruct).
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'perform', usage: 'strike',
            effect_contract: { actorFields: [], targetFields: [], effectValues: {},
                branches: { shot: { handing_consumed: true, actor_neili: -100 } } } } };
        const mk = (consumed) => {
            const raw = structuredClone(baseRaw);
            raw.raw.immediate[0].mappings = { strike: 'test-skill' };
            raw.raw.before[0].handing_details = { object: '/tests/poison_item#1', weight: 500 };
            raw.raw.after[0].handing_details = consumed ? { object: '/tests/poison_item#1', weight: 490 }
                : { object: '/tests/poison_item#1', weight: 500 };
            raw.raw.after[0].neili = 5000 - 100;
            return raw;
        };
        try { validatePerformEffectRecord(mk(true), cond); results.push({ name: 'handing-consumed-accept', pass: true }); }
        catch (e) { results.push({ name: 'handing-consumed-accept', pass: false, error: e.message }); }
        try { validatePerformEffectRecord(mk(false), cond); results.push({ name: 'handing-not-consumed', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'handing-not-consumed', pass: true }); }
    }
    // Branch: target_condition_added (liandu pattern: target->apply_condition("poison-supply")).
    {
        const cond = { ...baseCondition, parameters: { ...baseCondition.parameters, kind: 'perform', usage: 'finger',
            effect_contract: { actorFields: [], targetFields: [], effectValues: {},
                branches: { extract: { target_condition_added: 'poison-supply', actor_neili: -50 } } } } };
        const mk = (added) => {
            const raw = structuredClone(baseRaw);
            raw.raw.immediate[0].mappings = { finger: 'test-skill' };
            raw.raw.after[0].neili = 5000 - 50;
            if (added) raw.raw.after[1].conditions = { 'poison-supply': { remain: 1 } };
            return raw;
        };
        try { validatePerformEffectRecord(mk(true), cond); results.push({ name: 'cond-added-accept', pass: true }); }
        catch (e) { results.push({ name: 'cond-added-accept', pass: false, error: e.message }); }
        try { validatePerformEffectRecord(mk(false), cond); results.push({ name: 'cond-added-missing', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'cond-added-missing', pass: true }); }
    }

    // Mechanism-event validation (metrics/launches) for combat-settled + heal abilities.
    const mechContract = { actorFields: [], targetFields: [], effectValues: {},
        mechanism: { launch_argument: 'hup', launch_skill: 'xiantian-gong' },
        branches: { heal: { ability_launched: 1, neili_cost: 1100, actor_qi_recovery: 1000, actor_busy: 3 } } };
    const mechCond = { ...baseCondition, parameters: { ...baseCondition.parameters,
        kind: 'exert', usage: 'force', skill: 'xiantian-gong', effect_contract: mechContract } };
    const mechRaw = (metrics0, launches, qiAfter, busy) => {
        const raw = structuredClone(baseRaw);
        raw.raw.immediate[0].mappings = { force: 'xiantian-gong' };
        raw.raw.metrics = [metrics0, {}];
        raw.raw.launches = launches;
        raw.raw.after[0].qi = qiAfter;
        raw.raw.after[0].busy = busy;
        return raw;
    };
    const goodLaunch = [{ actor: '/tests/actor#1', argument: 'hup', skill: 'xiantian-gong' }];
    // Positive: heal mechanism fully matches source-derived deterministic values
    {
        const raw = mechRaw({ qi_recovery: 1000, neili_cost: 1100, ability_launched: 1 }, goodLaunch, 6000, 3);
        try { validatePerformEffectRecord(raw, mechCond); results.push({ name: 'mech-heal-exact', pass: true }); }
        catch (e) { results.push({ name: 'mech-heal-exact', pass: false, error: e.message }); }
    }
    // Negative: claims heal but qi_recovery=0 (no actual healing)
    {
        const raw = mechRaw({ qi_recovery: 0, neili_cost: 1100, ability_launched: 1 }, goodLaunch, 5000, 3);
        try { validatePerformEffectRecord(raw, mechCond); results.push({ name: 'mech-heal-zero-recovery', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'mech-heal-zero-recovery', pass: true }); }
    }
    // Negative: wrong neili_cost (fabricated branch)
    {
        const raw = mechRaw({ qi_recovery: 1000, neili_cost: 999, ability_launched: 1 }, goodLaunch, 6000, 3);
        try { validatePerformEffectRecord(raw, mechCond); results.push({ name: 'mech-heal-wrong-cost', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'mech-heal-wrong-cost', pass: true }); }
    }
    // Negative: wrong launch identity (different ability invoked)
    {
        const raw = mechRaw({ qi_recovery: 1000, neili_cost: 1100, ability_launched: 1 },
            [{ actor: '/tests/actor#1', argument: 'shield', skill: 'xiantian-gong' }], 6000, 3);
        try { validatePerformEffectRecord(raw, mechCond); results.push({ name: 'mech-wrong-launch', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'mech-wrong-launch', pass: true }); }
    }
    // Negative: ability_launched=0 (never fired)
    {
        const raw = mechRaw({ qi_recovery: 1000, neili_cost: 1100, ability_launched: 0 }, goodLaunch, 6000, 3);
        try { validatePerformEffectRecord(raw, mechCond); results.push({ name: 'mech-not-launched', pass: false, error: 'should have been rejected' }); }
        catch (e) { results.push({ name: 'mech-not-launched', pass: true }); }
    }

    return results;
}
