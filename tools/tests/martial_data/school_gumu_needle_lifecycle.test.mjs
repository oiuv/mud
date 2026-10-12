import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { digest } from './ledger.mjs';
import { needleRestoreProbes } from './execution.mjs';
import { poisonDamageBounds } from './school_emei_jiuyin_passive_cases.mjs';
import { gumuNeedles } from './school_gumu_throwing_cases.mjs';
import { gumuNeedleLifecycleConditions, gumuNeedleSeedCondition, validateGumuNeedleLifecycleRecord,
    gumuNeedleLifecycleEffects, gumuNeedleLifecycleFixtureRequirements } from './school_gumu_needle_lifecycle_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root));
const cases = gumuNeedleLifecycleConditions(catalog), copy = structuredClone;
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
function pick(skill, suffix) {
    const c = cases.find(c => c.id === `school-gumu-needle-lifecycle-${skill}-${suffix}`); assert.ok(c); return c;
}
function snapshot(cfg, side) {
    const s = { userp: 1, interactive: 1, wizardp: 0, living: 1, busy: cfg.busy ?? 0,
        id: side ? 'right' : 'left', weapon: 'none', conditions: {}, handing_details: {}, temp: { apply: {} },
        ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/'))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')),
        skills: copy(cfg.skills), learned: {}, mappings: copy(cfg.mappings), preparations: copy(cfg.preparations),
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, n]) =>
            [k, Math.trunc(n / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (cfg.temp?.['apply/' + k] ?? 0)])) };
    for (const [k, n] of Object.entries(cfg.temp ?? {})) {
        if (k.startsWith('apply/')) s.temp.apply[k.slice(6)] = n;
        else s.temp[k] = n;
    }
    if (cfg.equipment) {
        const e = cfg.equipment, d = gumuNeedles.find(d => d.program === e.program);
        s.handing_details = { object: e.program + '#synthetic', program: e.program, skill_type: e.type,
            amount: e.amount, daub: { ...d.daub_by, poison_type: d.poison.type,
                poison: { id: d.poison.id, name: d.poison.name, level: d.poison.level, remain: d.poison.remain } } };
    }
    return s;
}

// Synthetic records exercise rejection/acceptance of observations; never counted as driver samples.
function seed(c) {
    const p = c.parameters, d = gumuNeedles.find(d => d.skill === p.skill), restore = p.lifecycle === 'bingpo_restore';
    const before = [p.actor, p.target].map(snapshot), immediate = copy(before), [a, t] = immediate;
    const r = { method: 'perform', outcome: 'observed', before, immediate, attacks: [],
        launches: [{ skill: d.skill, argument: d.ability }], needle_hits: [{ actor: 0, target: 1,
            program: d.program, damage_bonus: d.ability === 'ying' ? 100 : restore ? 180 : 0 }] };
    a.neili -= d.cost; a.handing_details.amount--;
    a.busy = d.ability === 'ying' ? 2 : restore ? 0 : 1;
    r.ammo_cleanup = { checked: true, object_exists: a.handing_details.amount > 0,
        handing_object: a.handing_details.amount > 0 ? a.handing_details.object : null };
    if (d.ability === 'ying') t.eff_qi -= p.level;
    else if (restore) {
        t.qi -= p.level; t.eff_qi -= p.level; t.temp.bingpo = 1;
        for (const [k, n] of [['attack', 70], ['dodge', 70], ['parry', 20]])
            t.temp.apply[k] = (t.temp.apply[k] ?? 0) - n;
    } else { t.qi -= 100; t.eff_qi -= 40; }
    t.qi = Math.min(t.qi, t.eff_qi);
    const poison = a.handing_details.daub.poison;
    poison.remain -= poison.level;
    if (poison.id !== t.id && poison.level >= t.skills.poison
        && poison.level >= Math.trunc(t.effective_skills.force / 2)) {
        if (!t.cultivation['special_skill/piyi']) {
            const level = Math.trunc(poison.level * 8 / 10) + 1;
            t.conditions[d.poison.type] = { id: poison.id, name: poison.name, level, remain: level };
        }
        if (poison.level >= t.effective_skills.force) t.busy = 1;
    }
    r.after = copy(immediate);
    r.metrics = [0, 1].map(side => Object.fromEntries(health.map(k => [k + '_cost', before[side][k] - immediate[side][k]])));
    return r;
}

function trace(c, high = false) {
    const p = c.parameters, initial = seed(c);
    const r = { method: c.method, outcome: 'observed', parameters: copy(p), seed: initial,
        before: copy(initial.before), immediate: copy(initial.immediate), after: copy(initial.after),
        immediate_metrics: copy(initial.metrics), metrics: copy(initial.metrics), elapsed: 0,
        combat_stopped_after_seed: [1, 1], attacks: [], terminals: [], callbacks: [],
        condition_events: [], condition_heartbeats: [], incidental_callbacks: [] };
    if (!initial.ammo_cleanup.object_exists) r.after[0].handing_details = {};
    if (p.lifecycle === 'bingpo_restore') {
        const delay = p.restore_delay[Number(high)], pre = copy(r.after[1]), post = copy(pre);
        for (const [k, n] of [['attack', 70], ['dodge', 70], ['parry', 20]]) post.temp.apply[k] += n;
        delete post.temp.bingpo;
        r.restore_schedule = { program: '/kungfu/skill/bingpo-shenzhen/bing', function: 'back', side: 1, elapsed: 0, delay };
        r.callbacks = [pre, post].map((state, i) => ({ ...r.restore_schedule, phase: i ? 'after' : 'before', state, elapsed: delay }));
        r.after[1] = copy(post); r.elapsed = delay; return r;
    }
    for (let i = 0; i < p.ticks; i++) {
        const pre = copy(r.after[1]), post = copy(pre), info = pre.conditions[p.condition_name];
        assert.ok(info);
        const immune = pre.cultivation['immune/poison'], blocked = pre.cultivation['special_skill/piyi'] || pre.temp.nopoison;
        if (!blocked && immune !== -1) for (const k of ['qi', 'jing']) {
            const damage = poisonDamageBounds(info.level, k)[Number(high)];
            post[k] -= damage; post['eff_' + k] -= Math.trunc(damage / 2);
            r.metrics[1][k + '_cost'] += damage; r.metrics[1]['eff_' + k + '_cost'] += Math.trunc(damage / 2);
        }
        const randomCheck = Math.trunc(info.level / 2) + (high ? info.level - 1 : 0);
        const recover = blocked || immune === -1 || randomCheck < pre.effective_skills.force + immune;
        const clear = recover && (blocked || immune === -1 || info.remain - immune <= info.level);
        if (recover && !blocked) post.conditions[p.condition_name].remain -= immune === -1 ? info.remain : immune;
        if (recover && !clear) post.conditions[p.condition_name].remain -= info.level;
        const settled = copy(post);
        if (clear) settled.conditions = {};
        const elapsed = (i + 1) * 10, common = { side: 1, name: p.condition_name, daemon: '/kungfu/condition/' + p.condition_name, elapsed };
        r.condition_events.push({ ...common, phase: 'before', state: pre }, { ...common, phase: 'after', flag: clear ? 0 : 3, state: post });
        r.condition_heartbeats.push({ side: 1, elapsed, state: settled });
        r.metrics[1].heartbeats = i + 1; r.after[1] = copy(settled); r.elapsed = elapsed;
    }
    return r;
}

test('28项生命周期条件只做56次机制检查；复用原种毒契约且不伪造真实样本', () => {
    assert.equal(cases.length, 28); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 56);
    assert.equal(new Set(cases.map(c => c.id)).size, 28);
    assert.equal(cases.filter(c => c.parameters.lifecycle === 'bingpo_restore').length, 6);
    assert.equal(gumuNeedleLifecycleFixtureRequirements.length, 5);
    for (const c of cases) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        assert.equal(gumuNeedleSeedCondition(c).method, 'perform');
        for (const high of [false, true]) validateGumuNeedleLifecycleRecord(trace(c, high), c);
    }
    const smoke = gumuNeedleLifecycleConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 28);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.throws(() => gumuNeedleLifecycleConditions({ skills: [] }));
});

test('原延迟上下界按实际等级，既有属性准确归还；LPC留下零键不等于残留减益', () => {
    for (const [level, max] of [[120, 9], [200, 14], [400, 27], [800, 54]]) {
        const c = pick('bingpo-shenzhen', 'restore-l' + level);
        assert.deepEqual(c.parameters.restore_delay, [2, max]);
        const r = trace(c, true); validateGumuNeedleLifecycleRecord(r, c);
        assert.deepEqual(r.after[1].temp.apply, { attack: 0, dodge: 0, parry: 0 });
        r.after[1].temp.apply.attack++; assert.throws(() => validateGumuNeedleLifecycleRecord(r, c));
    }
    const c = pick('bingpo-shenzhen', 'restore-existing'), r = trace(c);
    validateGumuNeedleLifecycleRecord(r, c);
    assert.deepEqual(r.after[1].temp.apply, { attack: 17, dodge: 23, parry: 11 });
    r.callbacks[1].state.temp.apply.attack = 0; assert.throws(() => validateGumuNeedleLifecycleRecord(r, c));
});

test('不能用直接回调、提前解除、漏记回调或心跳回血替代原寒冰自然恢复', () => {
    const c = pick('bingpo-shenzhen', 'restore-l200');
    for (const mutate of [r => { delete r.restore_schedule; }, r => { r.restore_schedule.delay = 1; },
        r => { r.restore_schedule.function = 'manual_back'; }, r => { r.restore_schedule.side = 0; },
        r => { r.callbacks = []; }, r => { r.callbacks[0].elapsed = 0; },
        r => { r.callbacks[1].state.qi++; }, r => { r.callbacks[1].state.temp.bingpo = 1; },
        r => { r.metrics[1].heartbeats = 1; }, r => { r.after[1].busy++; },
        r => { r.condition_events.push({}); }]) {
        const r = trace(c); mutate(r); assert.throws(() => validateGumuNeedleLifecycleRecord(r, c));
    }
});

test('最后一枚针先完成原命中，再清理弹药对象；不阻断目标原恢复回调', () => {
    const c = pick('bingpo-shenzhen', 'restore-last-needle'), r = trace(c);
    validateGumuNeedleLifecycleRecord(r, c); assert.equal(r.seed.needle_hits.length, 1);
    assert.equal(r.seed.immediate[0].handing_details.amount, 0); assert.deepEqual(r.after[0].handing_details, {});
    r.after[0].handing_details = copy(r.immediate[0].handing_details);
    assert.throws(() => validateGumuNeedleLifecycleRecord(r, c));
});

test('辟易／制毒者／高内功／高毒技阻施毒；免疫与nopoison由原异常心跳处理', () => {
    for (const d of gumuNeedles) {
        for (const suffix of ['piyi', 'maker', 'high-force', 'high-skill']) {
            const c = pick(d.skill, 'poison-' + suffix), r = trace(c); validateGumuNeedleLifecycleRecord(r, c);
            assert.deepEqual(r.immediate[1].conditions, {}); assert.equal(r.condition_events.length, 0);
            r.metrics[1].qi_cost++; r.metrics[1].qi_recovery = 1;
            assert.throws(() => validateGumuNeedleLifecycleRecord(r, c));
        }
        for (const suffix of ['immune', 'nopoison']) {
            const c = pick(d.skill, 'poison-' + suffix), r = trace(c); validateGumuNeedleLifecycleRecord(r, c);
            assert.ok(r.immediate[1].conditions[d.poison.type]); assert.deepEqual(r.after[1].conditions, {});
            assert.equal(r.condition_events[0].state.qi, r.condition_events[1].state.qi);
        }
    }
});

test('两次持续毒发与一次去毒分开；毒后恢复独立记账，损伤不是净损失', () => {
    for (const d of gumuNeedles) {
        const c = pick(d.skill, 'poison-persist'), r = trace(c); validateGumuNeedleLifecycleRecord(r, c);
        assert.equal(r.condition_heartbeats.length, 2); assert.ok(r.after[1].conditions[d.poison.type]);
        assert.equal(r.metrics[1].qi_cost - r.immediate_metrics[1].qi_cost, 2 * poisonDamageBounds(r.after[1].conditions[d.poison.type].level, 'qi')[0]);
        r.condition_heartbeats[0].state.qi++; assert.throws(() => validateGumuNeedleLifecycleRecord(r, c));
        const clear = pick(d.skill, 'poison-l200'), s = trace(clear);
        s.condition_heartbeats[0].state.qi += 3; s.after[1].qi += 3; s.metrics[1].qi_recovery = 3;
        validateGumuNeedleLifecycleRecord(s, clear);
        s.metrics[1].qi_cost++; s.metrics[1].qi_recovery++;
        assert.throws(() => validateGumuNeedleLifecycleRecord(s, clear));
    }
});

test('身份／时序／种毒记录／停止战斗／总账不一致均拒绝，不偷偷修正原游戏', () => {
    const c = pick('bingpo-shenzhen', 'poison-persist');
    for (const mutate of [r => { r.before[0].wizardp = 1; }, r => { r.seed.needle_hits = []; },
        r => { r.immediate[1].conditions.hanbingdu.id = 'li mochou'; }, r => { r.metrics[0].heartbeats = 1; },
        r => { r.metrics[1].qi_cost = null; }, r => { r.after[1].neili++; },
        r => { r.attacks.push({}); }, r => { r.terminals.push({}); }, r => { r.combat_stopped_after_seed = [1, 0]; },
        r => { r.condition_events[0].side = 0; }, r => { r.condition_events[0].name = 'yufengdu'; },
        r => { r.condition_events[2].elapsed = 0; }, r => { r.condition_heartbeats[1].elapsed = -1; },
        r => { r.after[1].temp.bingpo = 1; }, r => { r.elapsed = c.parameters.observe_seconds; }]) {
        const r = trace(c); mutate(r); assert.throws(() => validateGumuNeedleLifecycleRecord(r, c));
    }
});

test('恢复时刻、毒发伤害和毒后恢复分别汇总；缺失记录保留未知', () => {
    const samples = [pick('bingpo-shenzhen', 'restore-l200'), pick('yufeng-zhen', 'poison-l200'), pick('bingpo-shenzhen', 'poison-persist')];
    const rows = samples.map(c => ({ outcome: 'observed', raw: trace(c) }));
    rows.push({ outcome: 'observed', raw: { parameters: { lifecycle: 'poison_ticks' } } }, { outcome: 'error' }, { outcome: 'observed', raw: {} });
    const e = gumuNeedleLifecycleEffects(rows);
    assert.equal(e.samples, 5); assert.equal(e.unobserved, 1); assert.equal(e.unclassified, 1);
    assert.equal(e.groups.bingpo_restore.samples, 1); assert.equal(e.groups.bingpo_restore.callback_seconds.mean, 2);
    assert.equal(e.groups.poison_ticks.ticks, 3); assert.equal(e.groups.poison_ticks.unknown_tick_records, 1);
    assert.equal(e.groups.poison_ticks.tick_loss.neili.mean, 0);
    assert.equal(e.groups.poison_ticks.recovery_after_tick.qi.mean, 0);
    assert.equal(e.groups.poison_ticks.callback_seconds.mean, null);
});

test('追加28条件但旧12400条件332508计划记录完整指纹不变', () => {
    const all = schoolCombatConditions(catalog);
    const old = all.slice(0, 12400);
    assert.equal(old.length, 12400); assert.equal(old.reduce((n, c) => n + c.samples, 0), 332508);
    assert.equal(digest(old), 'cd1c15aefedc087463f8ae1bb1b3fb2b2de499c0c7528d8035286bd98a7bcabe');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-needle-lifecycle'), cases);
    for (const c of cases) validateSchoolCombatRecord(trace(c), c);
});

test('恢复探针可逐字还原源码；保留原随机调度，只读剩余延迟', () => {
    const original = readFileSync(join(root, 'kungfu/skill/bingpo-shenzhen/bing.c'), 'utf8');
    const { changed, sites } = needleRestoreProbes(original);
    assert.equal(sites.length, 3);
    assert.equal(sites.reduce((s, { anchor, insert }) => s.replace(anchor + insert, anchor), changed), original);
    assert.equal(changed.split('call_out("back", 2 + random(skill / 15), target);').length, 2);
    assert.equal(changed.match(/random\(/g).length, original.match(/random\(/g).length);
    assert.ok(changed.includes('"scheduled", find_call_out("back")'));
    assert.throws(() => needleRestoreProbes(original.replace('void back(object target) {', 'void changed(object target) {')));
});

test('提示清理回调单独留证，不冒充寒冰恢复，也不能暗改资源和减益', () => {
    const c = pick('bingpo-shenzhen', 'restore-l800'), r = trace(c, true);
    r.incidental_callbacks = ['before', 'after'].map(phase => ({ phase, side: 1, elapsed: 15,
        state: copy(r.immediate[1]) }));
    r.incidental_callbacks[0].state.temp.has_announce = { defense3: 1 };
    validateGumuNeedleLifecycleRecord(r, c);
    assert.equal(r.callbacks.length, 2);
    const bad = copy(r); bad.incidental_callbacks[1].state.qi++;
    assert.throws(() => validateGumuNeedleLifecycleRecord(bad, c));
    r.incidental_callbacks.pop(); assert.throws(() => validateGumuNeedleLifecycleRecord(r, c));
});

test('真实null空状态与缺失状态不同；报告使用冻结条件而非已删除的raw参数', () => {
    for (const suffix of ['restore-l200', 'poison-maker']) {
        const c = pick('bingpo-shenzhen', suffix), r = trace(c);
        for (const s of [...r.before, ...r.immediate, ...r.after, ...r.seed.before, ...r.seed.immediate, ...r.seed.after])
            if (Object.keys(s.conditions).length === 0) s.conditions = null;
        validateGumuNeedleLifecycleRecord(r, c);
        delete r.parameters;
        const effects = gumuNeedleLifecycleEffects([{ outcome: 'observed', raw: r }], c);
        assert.equal(effects.unclassified, 0); assert.equal(effects.groups[c.parameters.lifecycle].samples, 1);
        delete r.after[1].conditions;
        assert.throws(() => validateGumuNeedleLifecycleRecord(r, c));
    }
});

test('原USER心跳可增长发呆神功，不算针法效果，也不容许其他技能或进度改变', () => {
    const c = pick('bingpo-shenzhen', 'poison-persist'), r = trace(c);
    r.condition_heartbeats[0].state.temp.start_idle = 1;
    for (const e of r.condition_events.slice(2)) e.state.temp.start_idle = 1;
    const last = r.condition_heartbeats[1].state;
    last.temp.start_idle = 1; last.skills['idle-force'] = 1; last.learned['idle-force'] = 0;
    r.after[1] = copy(last);
    validateGumuNeedleLifecycleRecord(r, c);
    for (const mutate of [
        s => { s.skills.force++; }, s => { s.skills['idle-force'] = 2; },
        s => { s.learned['idle-force'] = 10; }, s => { delete s.temp.start_idle; },
    ]) {
        const bad = copy(r); mutate(bad.condition_heartbeats[1].state);
        bad.after[1] = copy(bad.condition_heartbeats[1].state);
        assert.throws(() => validateGumuNeedleLifecycleRecord(bad, c));
    }
    const bad = copy(r); bad.condition_events[3].state.skills['idle-force'] = 1;
    assert.throws(() => validateGumuNeedleLifecycleRecord(bad, c));
});
