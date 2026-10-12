import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { poisonDamageBounds } from './school_emei_jiuyin_passive_cases.mjs';
import { gumuPoisonConditions, gumuPoisonFactors, validateGumuPoisonRecord,
    gumuPoisonEffects, gumuPoisonFixtureRequirements, validateGumuPoisonLoads } from './school_gumu_poison_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuPoisonConditions(catalog);
const conditionName = 'wudu_shenzhang', health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const copy = structuredClone;
function pick(suffix) {
    const c = cases.find(c => c.id === 'school-gumu-poison-' + suffix); assert.ok(c, suffix); return c;
}

test('万毒接入统一入口，不改变此前12057条件及307910计划记录', () => {
    const all = schoolCombatConditions(catalog);
    const old = all.filter(c => !c.parameters.collection_group?.startsWith('gumu-') ||
        ['gumu-control', 'gumu-direct', 'gumu-advanced', 'gumu-unarmed', 'gumu-combo', 'gumu-fireice'].includes(c.parameters.collection_group));
    assert.equal(old.length, 12057); assert.equal(old.reduce((n, c) => n + c.samples, 0), 307910);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'),
        '4cf495793071e6a8a1dc0a6f5a3ab93f76c28d95ed9c79cfd21f268722064aa6');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-poison'), cases);
    for (const c of cases) validateSchoolCombatRecord(trace(c, !c.id.endsWith('-force100000')), c);
});

// Deliberately synthetic input: validator self-tests are not driver evidence or RNG samples.
function trace(c, hit = true, high = false) {
    const p = c.parameters, lifecycle = c.method === 'condition', side = lifecycle ? 1 : 0, other = 1 - side;
    const before = [p.actor, p.target].map((cfg, i) => ({
        userp: 1, interactive: 1, wizardp: 0, id: i ? 'right' : 'left',
        object: `/tests/actor#${i}`,
        ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')),
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations),
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (k === 'dodge' && cfg.equipment ? -1 : 0)])),
        weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? 0,
        conditions: copy(cfg.conditions ?? {}), temp: { apply: cfg.equipment ? { dodge: -1 } : {}, ...cfg.temp },
    }));
    const r = { condition_id: c.id, method: c.method, before, immediate: copy(before), immediate_metrics: [{}, {}],
        outcome: p.expected, reason: p.expected === 'refused' ? '当前条件不足' : '',
        launches: [], attacks: [], dropped: [], condition_events: [], condition_heartbeats: [], elapsed: 0 };
    r.skill_load_context = { actor: before[side].object, already_loaded: 0,
        skills: copy(before[side].skills), command: 'enable parry wudu-shenzhang' };
    const [b, t] = [before[side], before[other]], [a, v] = [r.immediate[side], r.immediate[other]];
    const { ap, count } = gumuPoisonFactors(b, t);
    if (p.expected !== 'refused' && (!lifecycle || p.seed_mode === 'original_perform')) {
        r.launches.push({ skill: p.skill, argument: p.ability });
        if (hit) {
            const fee = count + (b.jiali > 0 && b.neili >= b.jiali ? b.jiali : 0);
            r.immediate_metrics[side] = { direct: 1, neili_cost: fee };
            a.neili -= fee; a.busy = high ? 3 : 1;
            v.qi -= 100; v.eff_qi -= 40;
            const wound = high ? 11 : 8; v.eff_jing -= wound; v.jing = Math.min(v.jing, v.eff_jing);
            r.immediate_metrics[other] = { qi_cost: 100, eff_qi_cost: 40, jing_cost: wound, eff_jing_cost: wound };
            if (!v.cultivation['special_skill/piyi']) {
                const prior = v.conditions[conditionName];
                const level = b.jiali + (high ? Math.max(0, b.jiali - 1) : 0) + count;
                const duration = Math.trunc(ap / 70) + (high ? Math.max(0, Math.trunc(ap / 30) - 1) : 0);
                const finalLevel = Math.max(prior?.level ?? 0, level);
                v.conditions[conditionName] = { level: finalLevel,
                    remain: (prior?.remain ?? 0) + level * duration,
                    id: !prior || prior.id === b.id ? b.id : '...',
                    name: !prior || prior.name === '噬心毒' ? '噬心毒' : finalLevel >= 100 ? '剧毒' : '毒' };
            }
        } else { a.busy = 2; v.busy = 1; }
    }
    r.after = copy(r.immediate); r.metrics = copy(r.immediate_metrics);
    if (!lifecycle) return r;
    if (p.seed_mode === 'original_perform') r.combat_stopped_after_seed = [1, 1];
    for (let i = 0; i < p.ticks; i++) {
        const pre = copy(r.after[0]), post = copy(pre), info = pre.conditions[conditionName];
        assert.ok(info, '合成生命周期必须有前置异常');
        const immune = pre.cultivation['immune/poison'];
        const blocked = pre.cultivation['special_skill/piyi'] || pre.temp.nopoison;
        if (!blocked && immune !== -1) for (const kind of ['qi', 'jing']) {
            const damage = poisonDamageBounds(info.level, kind)[Number(high)];
            post[kind] -= damage; post['eff_' + kind] -= Math.trunc(damage / 2);
            r.metrics[0][kind + '_cost'] = (r.metrics[0][kind + '_cost'] ?? 0) + damage;
            r.metrics[0]['eff_' + kind + '_cost'] = (r.metrics[0]['eff_' + kind + '_cost'] ?? 0) + Math.trunc(damage / 2);
        }
        const recover = blocked || immune === -1 || info.id === 'nature poison'
            || Math.trunc(info.level / 2) < pre.effective_skills.force + immune;
        const clear = recover && (blocked || immune === -1 || info.remain - immune <= info.level);
        if (recover && !blocked) post.conditions[conditionName].remain -= immune === -1 ? info.remain : immune;
        if (recover && !clear) post.conditions[conditionName].remain -= info.level;
        const settled = copy(post);
        if (clear) settled.conditions = {};
        const elapsed = (i + 1) * 10;
        r.condition_events.push({ phase: 'before', name: conditionName,
            daemon: '/kungfu/condition/' + conditionName, elapsed, state: pre },
        { phase: 'after', name: conditionName, daemon: '/kungfu/condition/' + conditionName,
            elapsed, flag: clear ? 0 : 3, state: post });
        r.condition_heartbeats.push({ elapsed, state: settled });
        r.metrics[0].heartbeats = (r.metrics[0].heartbeats ?? 0) + 1;
        r.after[0] = copy(settled); r.elapsed = elapsed;
    }
    return r;
}

test('万毒54条件2852计划记录；原施展、预置异常和烟雾分开', () => {
    assert.equal(cases.length, 54); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2852);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(cases.filter(c => c.method === 'condition').length, 15);
    assert.equal(cases.filter(c => c.parameters.sampling === 'random_distribution').length, 28);
    for (const c of cases) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        const [a, t] = c.method === 'condition' ? [c.parameters.target, c.parameters.actor] : [c.parameters.actor, c.parameters.target];
        const impossible = t.skills.force / 2 >= Math.trunc((a.skills.strike / 2 + a.skills['wudu-shenzhang']) * 2);
        for (const high of [false, true]) validateGumuPoisonRecord(trace(c, !impossible, high), c);
    }
    const smoke = gumuPoisonConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 108);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.equal(gumuPoisonFixtureRequirements.length, 6);
    assert.throws(() => gumuPoisonConditions({ skills: [] }));
    for (const samples of [0, -1, 1.5, NaN]) assert.throws(() => gumuPoisonConditions(catalog, { samples }));
});

test('正神和性别累加计数、攻击取整，与目标有效内功比较分开', () => {
    for (const [suffix, ap, count] of [['genderf-shen0', 300, 0], ['genderf-shen1', 330, 20],
        ['genderm-shen0', 345, 30], ['genderm-shen1', 379, 50]]) {
        const c = pick(suffix), r = trace(c); assert.deepEqual(gumuPoisonFactors(...r.before), { ap, count });
        validateGumuPoisonRecord(r, c); assert.equal(r.metrics[0].neili_cost, count);
    }
    validateGumuPoisonRecord(trace(pick('force1')), pick('force1'));
    assert.throws(() => validateGumuPoisonRecord(trace(pick('force1'), false), pick('force1')));
    validateGumuPoisonRecord(trace(pick('force100000'), false), pick('force100000'));
    assert.throws(() => validateGumuPoisonRecord(trace(pick('force100000')), pick('force100000')));
    const c = pick('l200-jiali0'), miss = trace(c, false); validateGumuPoisonRecord(miss, c);
    assert.equal(miss.after[0].neili, 6000); assert.equal(miss.after[1].busy, 1);
});

test('120是入口门槛而非固定费用；加力条件扣除并保留原负内力结果', () => {
    for (const jiali of [1, 100, 119, 120, 121, 200]) {
        const c = pick('low-neili-jiali' + jiali), r = trace(c); validateGumuPoisonRecord(r, c);
        assert.equal(r.after[0].neili, 120 - 30 - (jiali <= 120 ? jiali : 0));
        const wrong = copy(r); wrong.immediate_metrics[0].neili_cost = 30; wrong.metrics[0].neili_cost = 30;
        if (jiali <= 120) assert.throws(() => validateGumuPoisonRecord(wrong, c));
    }
    assert.equal(trace(pick('low-neili-jiali120')).after[0].neili, -30);
    for (const suffix of ['minimum-skill', 'minimum-force', 'minimum-neili', 'weapon'])
        assert.equal(pick(suffix).parameters.expected, 'observed');
    for (const suffix of ['low-skill', 'low-force', 'low-neili', 'no-grant', 'no-map', 'no-prepare', 'busy', 'no-fight'])
        validateGumuPoisonRecord(trace(pick(suffix)), pick(suffix));
});

test('同毒合并保留最大强度、累加余量及来源，不把持续参数误作存储字段', () => {
    for (const suffix of ['merge-same-5', 'merge-same-300', 'merge-other-5', 'merge-other-300', 'merge-other-name']) {
        const c = pick(suffix), r = trace(c); validateGumuPoisonRecord(r, c);
        const poison = r.immediate[1].conditions[conditionName];
        assert.equal(poison.remain, 720); assert.equal(poison.level, suffix.includes('300') || suffix.endsWith('name') ? 300 : 30);
        assert.equal(poison.id, suffix.includes('-same-') ? 'left' : '...');
        assert.equal(poison.name, suffix.endsWith('name') ? '剧毒' : '噬心毒');
    }
    const c = pick('l200-jiali50');
    for (const mutate of [x => { x.level = 500; }, x => { x.remain = 1; },
        x => { x.id = 'foreign'; }, x => { x.duration = 4; }]) {
        const r = trace(c); mutate(r.immediate[1].conditions[conditionName]);
        assert.throws(() => validateGumuPoisonRecord(r, c));
    }
});

test('辟易阻施毒但不阻精神创伤；免疫和nopoison待原更新清除', () => {
    for (const suffix of ['piyi', 'full-immunity', 'nopoison']) {
        const c = pick(suffix), r = trace(c); validateGumuPoisonRecord(r, c);
        assert.equal(r.before[1].eff_jing - r.immediate[1].eff_jing, 8);
        assert.equal(!!r.immediate[1].conditions[conditionName], suffix !== 'piyi');
    }
    for (const suffix of ['seed-piyi', 'seed-immune', 'seed-nopoison']) {
        const c = pick(suffix), r = trace(c); validateGumuPoisonRecord(r, c);
        assert.equal(r.condition_heartbeats.length, suffix === 'seed-piyi' ? 0 : 1);
        assert.equal(r.after[0].qi, r.immediate[0].qi); assert.deepEqual(r.after[0].conditions, {});
    }
});

test('零强度仍有原最低毒伤；无内功严格比较不推进余量，不能伪造自然清除', () => {
    for (const suffix of ['preset-expire-0', 'preset-zero-no-force', 'seed-zero']) {
        const c = pick(suffix), r = trace(c); validateGumuPoisonRecord(r, c);
        assert.equal(r.condition_events[0].state.conditions[conditionName].level, 0);
        assert.equal(r.condition_events[0].state.qi - r.condition_events[1].state.qi, 5);
        assert.equal(!!r.after[0].conditions[conditionName], suffix === 'preset-zero-no-force');
    }
    const c = pick('preset-zero-no-force'), bad = trace(c); bad.condition_heartbeats[0].state.conditions = {};
    assert.throws(() => validateGumuPoisonRecord(bad, c));
});

test('沿原心跳分段记录毒发和恢复，原施展种毒与直接预置异常不混淆', () => {
    for (const suffix of ['preset-two-ticks', 'preset-no-force', 'seed-two-ticks', 'seed-persist', 'seed-partial-immune']) {
        const c = pick(suffix), r = trace(c); validateGumuPoisonRecord(r, c);
        assert.equal(r.launches.length, suffix.startsWith('seed-') ? 1 : 0);
        assert.equal(r.condition_events.length, c.parameters.ticks * 2);
        assert.equal(r.metrics[1].heartbeats ?? 0, 0);
    }
    const c = pick('preset-expire-30'), r = trace(c);
    r.condition_heartbeats[0].state.qi += 3; r.after[0].qi += 3; r.metrics[0].qi_recovery = 3;
    validateGumuPoisonRecord(r, c);
    const active = pick('seed-persist'), wrong = trace(active);
    wrong.condition_heartbeats[0].state.qi++; assert.throws(() => validateGumuPoisonRecord(wrong, active));
});

test('未知记账、错误身份、心跳或普攻污染、时序错乱、遗漏停止战斗均拒绝', () => {
    const c = pick('seed-two-ticks');
    for (const mutate of [r => { r.before[0].wizardp = 1; }, r => { r.before[1].interactive = 0; },
        r => { r.immediate_metrics[1] = null; }, r => { r.metrics[0].qi_cost = null; },
        r => { r.immediate_metrics[0].heartbeats = 1; }, r => { r.metrics[1].heartbeats = 1; },
        r => { r.attacks.push({}); }, r => { delete r.combat_stopped_after_seed; },
        r => { r.condition_events[1].elapsed = r.elapsed + 1; },
        r => { r.condition_events[2].elapsed = 0; }, r => { r.condition_events[0].name = 'fake'; },
        r => { r.after[0].qi++; }, r => { r.condition_heartbeats[0].state.conditions[conditionName].remain++; },
        r => { r.immediate[1].neili++; r.immediate_metrics[1].neili_recovery = 1; }]) {
        const r = trace(c); mutate(r); assert.throws(() => validateGumuPoisonRecord(r, c));
    }
});

test('按即时／生命周期各自统计；毒存在率不伪装为新施毒概率，未知不填零', () => {
    const rows = (c, ...hits) => hits.map(hit => {
        const raw = trace(c, hit); return { outcome: raw.outcome, raw };
    });
    const c = pick('l200-jiali0'), result = gumuPoisonEffects(rows(c, true, false), c);
    assert.equal(result.immediate_samples, 2); assert.equal(result.poison_present_after.rate, .5);
    assert.equal(result.immediate_spirit_wound.mean, 4); assert.equal(result.lifecycle_samples, 0);
    for (const suffix of ['seed-zero', 'preset-two-ticks']) {
        const lifecycle = pick(suffix), data = gumuPoisonEffects(rows(lifecycle, true, true), lifecycle);
        assert.equal(data.lifecycle_samples, 2); assert.equal(data.ticks, lifecycle.parameters.ticks * 2);
        assert.equal(data.immediate_samples, 0); assert.equal(data.unclassified, 0);
    }
    const refused = pick('no-grant');
    assert.equal(gumuPoisonEffects(rows(refused, false), refused).unobserved, 1);
    const unknown = gumuPoisonEffects([{ outcome: 'observed', raw: {} }], c);
    assert.equal(unknown.unknown_immediate, 1); assert.equal(unknown.unclassified, 0);
    assert.equal(unknown.poison_present_after.rate, null); assert.equal(unknown.immediate_spirit_wound.mean, null);
    const missing = gumuPoisonEffects(rows(c, true));
    assert.equal(missing.unclassified, 1); assert.equal(missing.immediate_samples, 0);
    const misleading = rows(c, true);
    misleading[0].raw.parameters = { observation: 'original_condition_heartbeat' };
    assert.equal(gumuPoisonEffects(misleading, c).immediate_samples, 1);
});

test('按真实快照位置核对性格和装备有效等级，不从不存在的原始参数推断', () => {
    const c = pick('weapon'), r = trace(c);
    assert.equal(Object.hasOwn(r, 'parameters'), false);
    assert.equal(Object.hasOwn(r.before[0], 'character'), false);
    assert.equal(r.before[0].cultivation.character, '国士无双');
    assert.equal(r.before[0].effective_skills.dodge, 299);
    validateGumuPoisonRecord(r, c);
    for (const mutate of [x => { delete x.before[0].cultivation.character; },
        x => { x.before[0].effective_skills.dodge++; },
        x => { delete x.before[0].temp.apply; }]) {
        const bad = copy(r); mutate(bad); assert.throws(() => validateGumuPoisonRecord(bad, c));
    }
});

test('无忙乱的明确null按0读取，缺字段或无效值仍拒绝', () => {
    const c = pick('l200-jiali0'), r = trace(c);
    for (const states of [r.before, r.immediate, r.after])
        for (const state of states) if (state.busy === 0) state.busy = null;
    validateGumuPoisonRecord(r, c);
    for (const field of ['before', 'immediate', 'after']) {
        const bad = copy(r); delete bad[field][0].busy;
        assert.throws(() => validateGumuPoisonRecord(bad, c));
        for (const value of [undefined, -1, .5, '0']) {
            const invalid = copy(r); invalid[field][1].busy = value;
            assert.throws(() => validateGumuPoisonRecord(invalid, c));
        }
    }
});

test('万毒首次加载上下文指向真正施毒者；异常生命周期反转两侧也不混淆', () => {
    for (const suffix of ['l200-jiali0', 'seed-zero', 'preset-expire-0']) {
        const c = pick(suffix), r = trace(c), side = c.method === 'condition' ? 1 : 0;
        assert.equal(r.skill_load_context.actor, r.before[side].object);
        validateGumuPoisonRecord(r, c);
        for (const mutate of [x => { delete x.skill_load_context; },
            x => { x.skill_load_context.actor = x.before[1 - side].object; },
            x => { x.skill_load_context.skills.strike++; },
            x => { x.skill_load_context.already_loaded = null; },
            x => { x.skill_load_context.command = 'fake'; }]) {
            const wrong = copy(r); mutate(wrong); assert.throws(() => validateGumuPoisonRecord(wrong, c));
        }
    }
});

test('独立万毒进程只允许第一条是首次加载，不用后续状态冒充首次证据', () => {
    for (const first of ['seed-zero', 'l200-jiali0']) {
        const rows = [trace(pick(first)), trace(pick('preset-expire-30')), trace(pick('l200-jiali0'))];
        for (const row of rows.slice(1)) row.skill_load_context.already_loaded = 1;
        validateGumuPoisonLoads(rows);
        for (const mutate of [x => { x[0].skill_load_context.already_loaded = 1; },
            x => { x[1].skill_load_context.already_loaded = 0; },
            x => { x[1].method = 'perform'; }, x => { delete x[2].skill_load_context; }]) {
            const wrong = copy(rows); mutate(wrong); assert.throws(() => validateGumuPoisonLoads(wrong));
        }
    }
});
