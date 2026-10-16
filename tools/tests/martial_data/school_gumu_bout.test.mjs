import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createSeries, openSeries, digest } from './ledger.mjs';
import { validateRecord } from './execution.mjs';
import { gumuBoutProfiles, gumuBoutConditions, validateGumuBoutRecord,
    validateGumuBoutLoads, gumuBoutEffects } from './school_gumu_bout_cases.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan, schoolBoutEffects, gumuSchoolBoutEffects,
    schoolCombatEffects, schoolCombatMarkdown } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const ids = [...new Set(['literate', 'martial-cognize', 'unarmed', 'force', 'dodge', 'parry',
    'yunv-xinjing', 'surge-force', 'yunv-shenfa', 'qixing-bu', 'meinv-quan',
    ...gumuBoutProfiles.flatMap(p => [p.skill, p.usage])])];
const skills = ids.map(id => {
    const path = ['c', 'lpc'].map(ext => `kungfu/skill/${id}.${ext}`).find(p => existsSync(join(root, p)));
    assert.ok(path, id); return { id, path, sha256: hash(readFileSync(join(root, path), 'utf8')), entries: [] };
});
const fingerprint = digest(skills.map(s => ({ path: s.path, sha256: s.sha256 })));
const catalog = { skills, source_fingerprint: fingerprint, dictionary_sha256: '0'.repeat(64) };
const cases = gumuBoutConditions(catalog), smoke = gumuBoutConditions(catalog, { smoke: true });
const copy = value => structuredClone(value);
const select = (skill, jiali = 0, level = 400) => cases.find(c => c.parameters.skill === skill
    && c.parameters.actor.properties.jiali === jiali && c.parameters.level === level);

function state(config, side, loading = false) {
    const armed = !loading && config.equipment, type = armed?.type ?? 'none';
    const result = { object: `/tests/actor#${side + 1}`, userp: 1, playerp: 1, interactive: 1,
        wizardp: 0, living: 1, ghost: null, busy: null, cultivation: {}, temp: loading ? {} : { apply: { armor: 100 } },
        skills: copy(config.skills), mappings: loading ? {} : copy(config.mappings),
        preparations: loading ? {} : copy(config.preparations), preparation_order: loading ? [] : Object.keys(config.preparations),
        effective_skills: {}, weapon: type, weapon_damage: armed ? 50 : 0,
        weapon_flag: armed ? type === 'sword' ? 4 : null : 0,
        handing: 'none', handing_details: {}, weapon_details: {} };
    for (const [key, value] of Object.entries(config.properties))
        if (key.includes('/') || key === 'character') result.cultivation[key] = value;
        else result[key] = value;
    if (armed) {
        result.temp.apply.dodge = -1; result.temp.apply.damage = 50;
        result.weapon_details = { object: `/tests/${type}#${side + 10}`, program: `/tests/${type}`,
            skill_type: type, flag: result.weapon_flag, weight: 3000, damage: 50, consistence: 100,
            material: 'steel', rigidity: 0, no_wield: null };
    }
    for (const [key, value] of Object.entries(config.skills)) result.effective_skills[key] = Math.trunc(value / 2)
        + (config.skills[result.mappings[key]] ?? 0) + (result.temp.apply?.[key] ?? 0);
    result.effective_con = result.con + Math.trunc(result.skills.force / 10);
    result.effective_str = result.str + Math.trunc(Math.max(...
        ['unarmed', 'strike', 'cuff', 'hand', 'finger', 'claw'].map(k => result.skills[k] ?? 0)) / 10);
    return result;
}
function row(condition, index = 0) {
    const p = condition.parameters, before = [state(p.actor, 0), state(p.target, 1)];
    const raw = { kind: 'sample', condition_id: condition.id, method: 'bout', outcome: 'observed', index,
        before, immediate: copy(before), after: copy(before), metrics: [{ heartbeats: 1 }, { heartbeats: 1 }],
        actions: [], attacks: [], attack_rounds: [], passives: [], defenses: [], terminals: [],
        launches: [], interfaces: [], elapsed: p.observe_seconds + 0.1, first: index % 2, first_actor: index % 2,
        terminal: 'time_limit', winner: -1, busy_seconds: [0, 0],
        skill_loads: p.capture_skill_loads.map(d => ({ ...d, run_id: 'unit-run',
            load_id: 'unit-run:' + d.skill, command: 'enable parry ' + d.skill, state: state(p.actor, 0, true) })) };
    attack(raw, condition, 0, -1);
    // A successful right attack() can select the original guarding branch.
    raw.attack_rounds.push({ actor: 1, before: 0, after: 1, result: 1 });
    raw.after[1].temp.combat_time = raw.immediate[1].temp.combat_time = 1;
    return raw;
}
function check(raw, condition) { validateRecord(raw, condition); validateGumuBoutRecord(raw, condition); }
function actionValue(skill) {
    const dynamic = { 'suxin-jian': [250, 100, 50, 50, 50, 66],
        'yinsuo-jinling': [300, 200, 100, 66, 66, 100],
        'wudu-shenzhang': [200, 200, 100, 66, 66, 100],
        'sad-strike': [350, 133, 100, 66, undefined, 100] }[skill];
    if (dynamic) {
        const [lvl, force, attack, dodge, parry, damage] = dynamic;
        return { action: '原招式合成契约样例', lvl, force, attack, dodge, damage,
            ...(parry === undefined ? {} : { parry }) };
    }
    return { action: '原招式合成契约样例', lvl: { 'xuantie-jian': 200,
        'tianluo-diwang': 150, 'fireice-strike': 120, 'meinv-quan': 179 }[skill] ?? 0 };
}
function attack(raw, condition, side = 0, result = 0) {
    const p = condition.parameters, config = side ? p.target : p.actor;
    const usage = config.equipment?.type ?? raw.before[side].preparation_order[0];
    raw.attacks.push({ actor: side, target: 1 - side, type: 0, result, damage: 0,
        attack_usage: usage, attack_skill: config.mappings[usage] ?? null, action_flag: 0 });
    raw.actions.push({ actor: side, target: 1 - side, skill: config.mappings[usage] ?? null,
        action: actionValue(config.mappings[usage]) });
    const key = result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry';
    raw.metrics[side][key] = (raw.metrics[side][key] ?? 0) + 1;
    const before = raw.after[side].temp.combat_time ?? 0;
    raw.attack_rounds.push({ actor: side, before, after: before + 1, result: 1 });
    raw.after[side].temp.combat_time = raw.immediate[side].temp.combat_time = before + 1;
    raw.metrics[side].heartbeats = Math.max(raw.metrics[side].heartbeats, before + 1);
}
function passive(raw, condition, { route = 'force', applied = false, incoming = 200, recovery = 0 } = {}) {
    const p = condition.parameters, before = copy(raw.after), after = copy(before);
    const skill = route === 'force' ? p.actor.mappings.force : p.skill;
    const cost = skill === 'surge-force' ? p.actor.properties.jiali : applied
        ? { 'yunv-xinjing': 50, 'wudu-shenzhang': 30, 'xuantie-jian': 120 }[skill] ?? 0 : 0;
    after[0].neili -= cost;
    const damage = applied && skill === 'yunv-xinjing'
        ? Math.trunc(before[0].skills[skill] / (before[0].weapon === 'sword' ? 5 : 4)) : 0;
    const wound = applied ? skill === 'yunv-xinjing' ? Math.trunc(damage * 2 / 3)
        : skill === 'xuantie-jian' ? Math.trunc(incoming * 4 / 5)
            : skill === 'sad-strike' ? Math.trunc((incoming - 100) / 2) : incoming : 0;
    if (damage) after[1].qi = Math.max(-1, after[1].qi - damage);
    if (wound) {
        after[1].eff_qi = Math.max(-1, after[1].eff_qi - wound);
        after[1].qi = Math.min(after[1].qi, after[1].eff_qi);
    }
    const event = { actor: 0, target: 1, skill, incoming, route,
        factor: route === 'force' ? p.actor.properties.jiali : 0,
        result: applied ? '原回调合成返回文案' : skill === 'surge-force' ? 10 : skill === 'wudu-shenzhang' ? 1 : 0,
        before, after, neili_after: after[0].neili, target_eff_qi_after: after[1].eff_qi };
    raw.passives.push(event);
    raw.metrics[0].neili_cost = (raw.metrics[0].neili_cost ?? 0) + cost;
    raw.metrics[0].neili_recovery = (raw.metrics[0].neili_recovery ?? 0) + recovery;
    for (const key of ['qi', 'eff_qi']) raw.metrics[1][key + '_cost']
        = (raw.metrics[1][key + '_cost'] ?? 0) + before[1][key] - after[1][key];
    raw.after = copy(after); raw.after[0].neili += recovery; raw.immediate = copy(raw.after);
    if (route === 'force') passive(raw, condition, { route: 'martial' });
    return event;
}

test('七套400级与单列800玄铁保持16条件/320正式/32烟雾，无NPC或主动策略', () => {
    assert.equal(gumuBoutProfiles.length, 7); assert.equal(cases.length, 16);
    assert.equal(new Set(cases.map(c => c.id)).size, 16);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 320);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 32);
    for (const [i, c] of cases.entries()) {
        assert.match(c.id, /^[a-z][a-z0-9_-]*$/);
        assert.deepEqual({ ...c, samples: 2, parameters: { ...c.parameters, observe_seconds: 3 } }, smoke[i]);
        assert.equal(c.parameters.strategy, 'ordinary'); assert.equal(c.parameters.expected, 'observed');
        assert.equal(c.parameters.first, 'alternating_index'); assert.equal(c.parameters.observe_seconds, 30);
        assert.ok(c.parameters.qualification_sources.every(path => existsSync(join(root, path))), '来源必须存在');
        check(row(c, 0), c); check(row(c, 1), c);
    }
});

test('真实资格、两种双备、女性剑鞭口诀、杨过入门和高阶经验均明确冻结', () => {
    for (const c of cases) {
        const p = c.parameters, a = p.actor;
        assert.equal(a.properties.character, '国士无双'); assert.equal(a.properties.per, 36);
        assert.equal(a.skills.literate, 400); assert.equal(a.skills['martial-cognize'], 400);
        assert.equal(p.target.skills.parry, 600); assert.equal(state(p.target, 1).effective_con, 96);
        assert.equal(state(p.target, 1).effective_skills.dodge, 299);
        assert.equal(a.skills['zuoyou-hubo'], undefined); assert.equal(a.properties['special_skill/tiandao'], undefined);
        if (p.paired) assert.deepEqual(Object.keys(a.preparations), ['strike', 'unarmed']);
        if (a.mappings.force === 'surge-force') {
            assert.equal(a.properties.gender, '男性'); assert.equal(a.skills['yunv-xinjing'], 120);
            assert.ok(state(a, 0).effective_str >= 45);
        }
        if (p.level === 800) {
            assert.equal(p.skill, 'xuantie-jian'); assert.equal(a.properties.combat_exp, 64000000);
            assert.ok(a.properties.combat_exp >= p.level ** 3 / 10); assert.equal(a.skills.unarmed, 400);
        }
    }
    assert.deepEqual(select('wudu-shenzhang').parameters.actor.preparations, { strike: 'wudu-shenzhang' });
    assert.equal(select('wudu-shenzhang').parameters.actor.properties.shen, -100000);
    assert.deepEqual(select('sad-strike').parameters.actor.preparations, { unarmed: 'sad-strike' });
    assert.equal(cases.filter(c => c.parameters.actor.properties['can_learn/yunv-xinjing/wall'] === 1).length, 4);
});

test('初态明确null假值可用，字段缺失/未知类型/伪身份/补属性/错误双备均拒绝', () => {
    const c = select('yinsuo-jinling'), valid = row(c);
    for (const change of [r => delete r.before[0].busy, r => { r.before[0].busy = '0'; },
        r => delete r.before[0].weapon_flag, r => delete r.before[0].weapon_details.flag,
        r => { r.before[0].userp = 0; }, r => { r.before[0].wizardp = 1; },
        r => { r.before[0].effective_skills.dodge++; }, r => { r.before[0].temp.apply.dodge = 0; },
        r => { r.before[0].effective_str = 36; }, r => delete r.before[0].per,
        r => { r.before[0].skills['zuoyou-hubo'] = 400; }, r => { r.before[0].cultivation.character = '光明磊落'; },
        r => { r.before[0].preparations = { strike: 'wudu-shenzhang' }; },
        r => { r.before[0].weapon_details.weight = 1; }, r => { r.metrics[0] = null; },
        r => { r.metrics[0].neili_cost = null; }]) {
        const changed = copy(valid); change(changed); assert.throws(() => check(changed, c));
    }
});

test('公共FORCE按原加力扣费，玉女心经未触发0费用、触发固定50，恢复不抵销总支出', () => {
    for (const [skill, applied, expected] of [['xuantie-jian', false, 50],
        ['suxin-jian', false, 0], ['suxin-jian', true, 50], ['yinsuo-jinling', true, 50]]) {
        const c = select(skill, 50), r = row(c); attack(r, c);
        passive(r, c, { applied, recovery: expected }); check(r, c);
        const report = gumuBoutEffects([{ outcome: 'observed', raw: r }], c);
        assert.equal(report.sides[0].neili_spent.mean, expected);
        assert.equal(report.sides[0].net_neili_loss.mean, 0);
        assert.equal(report.passives[0].neili_spent, expected);
        assert.equal(r.parameters, undefined);
    }
    const c = select('suxin-jian', 50), r = row(c); attack(r, c); passive(r, c);
    r.metrics[0].neili_cost = 50; r.after[0].neili -= 50;
    assert.throws(() => check(r, c), /总费用/);
});

test('五毒固定30与800玄铁固定120是独立费用；400玄铁不伪造特伤，零加力不伪造内功调用', () => {
    for (const [skill, level, expected] of [['wudu-shenzhang', 400, 30], ['xuantie-jian', 800, 120]]) {
        const c = select(skill, 0, level), r = row(c); attack(r, c);
        passive(r, c, { route: 'martial', applied: true }); check(r, c);
        assert.equal(gumuBoutEffects([{ outcome: 'observed', raw: r }], c).passives[1].neili_spent, expected);
    }
    const c = select('xuantie-jian'), r = row(c); attack(r, c);
    passive(r, c, { route: 'martial', applied: true }); assert.throws(() => check(r, c));
    const zero = select('suxin-jian'), z = row(zero); passive(z, zero);
    assert.throws(() => check(z, zero));
});

test('原回调双方引用、路由、门槛与费用错配不得被完整资源账掩盖', () => {
    const c = select('suxin-jian', 50), valid = row(c); attack(valid, c); passive(valid, c, { applied: true });
    for (const change of [r => { r.passives[0].actor = 1; }, r => { r.passives[0].target = 0; },
        r => { r.passives[0].before[0].object = '/tests/other#1'; },
        r => { r.passives[0].skill = 'surge-force'; }, r => { r.passives[0].factor = 0; },
        r => delete r.passives[0].before, r => { r.passives[0].before[0].cultivation['can_learn/yunv-xinjing/wall'] = 0; },
        r => { r.passives[0].before[1].effective_con = 10000; },
        r => { r.passives[0].after[0].neili--; }, r => { r.passives[0].after[1].neili--; }]) {
        const changed = copy(valid); change(changed); assert.throws(() => check(changed, c));
    }
});

test('原兵器磨损允许正攻击机会内下降，不吞静态身份或任意耐久变化', () => {
    const c = select('suxin-jian'), valid = row(c); attack(valid, c);
    passive(valid, c, { route: 'martial' }); valid.after[0].weapon_details.consistence--;
    check(valid, c); // Final damage is zero, but the martial callback proves the weapon-hook path.
    for (const change of [r => { r.after[0].weapon_details.consistence = 101; },
        r => { r.after[0].weapon_details.consistence = 98; }, r => { r.after[0].weapon_details.consistence = -1; },
        r => delete r.after[0].weapon_details.consistence, r => { r.after[0].weapon_details.consistence = null; },
        r => { r.after[0].weapon_details.object += 'other'; }, r => { r.after[0].weapon_details.damage++; }]) {
        const changed = copy(valid); change(changed); assert.throws(() => check(changed, c));
    }
    const idle = row(c); idle.after[0].weapon_details.consistence--; assert.throws(() => check(idle, c));
    const right = row(c); attack(right, c, 1); right.after[1].weapon_details.consistence--;
    check(right, c);
    right.attacks.at(-1).result = -1; assert.throws(() => check(right, c));
});

test('原挂机学习单列，不误拒非战斗idle-force，也不放过战斗技能或同步回调变化', () => {
    const c = select('suxin-jian', 50), valid = row(c); attack(valid, c); passive(valid, c);
    valid.metrics.forEach(m => { m.heartbeats = 30; });
    const setIdle = (s, level = 1) => {
        s.skills['idle-force'] = level; s.effective_skills['idle-force'] = Math.trunc(level / 2);
        s.temp.start_idle = 1;
    };
    for (const event of valid.passives) for (const phase of ['before', 'after']) event[phase].forEach(s => setIdle(s));
    for (const phase of ['immediate', 'after']) valid[phase].forEach(s => setIdle(s));
    check(valid, c);
    const original = copy(valid), effects = gumuBoutEffects([{ outcome: 'observed', raw: valid }], c);
    assert.equal(effects.sides[0].idle_practice.started_samples, 1);
    assert.equal(effects.sides[0].idle_practice.raw_levels_after.mean, 1);
    assert.equal(effects.sides[0].idle_practice.net_levels.mean, 1);
    assert.deepEqual(valid, original, '校验/统计不得删除原技能记录');
    for (const change of [
        s => { s.skills.force++; }, s => { s.skills['other-knowledge'] = 1; },
        s => { s.effective_skills.force++; }, s => { s.mappings.force = 'surge-force'; },
        s => { s.preparations.finger = 'idle-force'; }, s => { s.cultivation.character = '光明磊落'; },
        s => delete s.effective_skills['idle-force'], s => { s.effective_skills['idle-force'] = 1; },
        s => delete s.temp.start_idle, s => { s.temp.learned_idle_force = 1; },
        s => setIdle(s, 0), s => setIdle(s, -1), s => setIdle(s, 1.5), s => setIdle(s, 5),
    ]) {
        const changed = copy(valid); change(changed.passives[0].before[0]);
        assert.throws(() => check(changed, c));
    }
    const synchronous = copy(valid); setIdle(synchronous.passives[0].after[0], 2);
    assert.throws(() => check(synchronous, c), /同步被动/);
    const injected = copy(valid); setIdle(injected.before[0]); assert.throws(() => check(injected, c));
    const short = copy(valid); short.elapsed = 3.5;
    assert.throws(() => check(short, c), /慢拍/);
    const phaseBoundary = copy(valid); phaseBoundary.elapsed = 4.5;
    phaseBoundary.terminal = 'unconscious'; phaseBoundary.winner = 0; phaseBoundary.after[1].living = 0;
    phaseBoundary.terminals = [{ side: 1, state: 'unconscious' }];
    check(phaseBoundary, c); // Integer time() permits two slow beats across this wall-clock window.
    const missingBeat = copy(phaseBoundary); missingBeat.metrics[0].heartbeats = 1;
    assert.throws(() => check(missingBeat, c), /慢拍/);
    for (const phase of ['after', 'immediate']) for (const change of [
        s => { s.skills['idle-force'] = null; }, s => setIdle(s, 999),
        s => delete s.effective_skills['idle-force'], s => { s.effective_skills['idle-force'] = 1; },
        s => delete s.temp.start_idle, s => { s.temp.learned_idle_force = false; },
    ]) {
        const changed = copy(valid); change(changed[phase][0]);
        assert.throws(() => check(changed, c));
        if (phase === 'after') assert.throws(() => gumuBoutEffects([{ outcome: 'observed', raw: changed }], c));
    }
    for (const key of ['start_idle', 'learned_idle_force']) for (const value of [1, false, '', undefined]) {
        const changed = copy(valid); changed.before[0].temp[key] = value;
        assert.throws(() => check(changed, c), /初态/);
    }
    for (const value of [null, 0]) {
        const changed = copy(valid);
        changed.before[0].temp.start_idle = changed.before[0].temp.learned_idle_force = value;
        check(changed, c);
    }
    const death = copy(valid); death.terminal = 'death'; death.winner = 0;
    death.terminals = [{ side: 1, state: 'death' }];
    for (const phase of ['after', 'immediate']) { death[phase][1].ghost = 1; setIdle(death[phase][1], 0); }
    check(death, c);
    assert.equal(gumuBoutEffects([{ outcome: 'observed', raw: death }], c).sides[1].idle_practice.raw_levels_after.mean, 0);
    for (const phase of ['after', 'immediate']) {
        const changed = copy(valid); setIdle(changed[phase][1], 0);
        assert.throws(() => check(changed, c), /慢拍/);
    }
    const unknown = copy(valid); unknown.after[0].skills = null;
    assert.throws(() => gumuBoutEffects([{ outcome: 'observed', raw: unknown }], c), /实际技能/);
});

test('交替先手、真实心跳、自然时间、终态与原攻击轮严格复用公共契约', () => {
    const c = select('tianluo-diwang'), valid = row(c, 1);
    for (const change of [r => { r.first_actor = 0; }, r => { r.elapsed = 29; },
        r => { r.metrics[1].heartbeats = 0; }, r => { r.busy_seconds[0] = 31; },
        r => { r.winner = 0; }, r => { r.launches = [{}]; }, r => { r.interfaces = [{}]; },
        r => { r.attack_rounds = [{ actor: 0, before: 0, after: 2, result: 1 }]; }]) {
        const changed = copy(valid); change(changed); assert.throws(() => check(changed, c));
    }
    const terminal = row(c); terminal.terminal = 'unconscious'; terminal.winner = 0;
    terminal.elapsed = 1; terminal.after[1].living = 0;
    terminal.terminals = [{ side: 1, state: 'unconscious' }]; check(terminal, c);
    terminal.terminals = []; assert.throws(() => check(terminal, c));
    const defense = row(c); defense.defenses = [{ actor: 1, target: 0,
        route: 'ordinary', skill: 'tianluo-diwang', incoming: 100, result: null }];
    check(defense, c);
    delete defense.defenses[0].result; assert.throws(() => check(defense, c));
});

test('原选技、双备顺序、缺少动作和跨样本动态加载变更均被拒绝', () => {
    const c = select('tianluo-diwang'), valid = row(c); attack(valid, c, 0, -1);
    for (const change of [r => { r.attacks[0].attack_skill = 'sad-strike'; },
        r => { r.attacks[0].attack_usage = 'sword'; }, r => { r.actions = []; },
        r => { r.actions[0].skill = 'fireice-strike'; },
        r => { r.before[0].preparation_order.reverse(); }]) {
        const changed = copy(valid); change(changed); assert.throws(() => check(changed, c));
    }
    const dynamic = select('yinsuo-jinling'), a = row(dynamic), b = row(dynamic, 1);
    validateGumuBoutLoads([a, b]); b.skill_loads[0].state.skills.force++;
    assert.throws(() => validateGumuBoutLoads([a, b]));
    const absent = row(dynamic); absent.skill_loads = []; assert.throws(() => check(absent, dynamic));
    const reordered = row(c); reordered.before[0].preparation_order.reverse();
    reordered.attacks[0].attack_usage = 'unarmed';
    reordered.attacks[0].attack_skill = 'meinv-quan'; reordered.actions[0].skill = 'meinv-quan';
    reordered.actions[0].action = actionValue('meinv-quan');
    check(reordered, c); // Same legal map, different observed driver key order.
});

test('原TYPE_RIPOSTE=1与quick=2均可观测，非法类型和伪造计数拒绝', () => {
    const c = select('suxin-jian');
    for (const type of [1, 2]) {
        const r = row(c); attack(r, c, 1, -1);
        r.attacks.at(-1).type = type; r.metrics[1][type === 1 ? 'riposte' : 'quick'] = 1;
        check(r, c);
        for (const bad of [-1, 3, null, '1']) {
            const changed = copy(r); changed.attacks.at(-1).type = bad;
            assert.throws(() => check(changed, c));
        }
        const missing = copy(r); delete missing.metrics[1][type === 1 ? 'riposte' : 'quick'];
        assert.throws(() => check(missing, c));
    }
});

test('攻击轮/出手/计数和应有回调不得删除后自洽，空15心跳不能冒充交锋', () => {
    const c = select('suxin-jian', 50), valid = row(c); attack(valid, c); passive(valid, c);
    check(valid, c);
    for (const change of [r => { r.attack_rounds = []; }, r => { r.attacks = []; r.actions = []; },
        r => { r.metrics[0].hit++; }, r => { r.metrics[0].dodge++; }, r => { r.metrics[0].parry = 1; },
        r => { r.passives = r.passives.filter(e => e.route !== 'force'); },
        r => { r.passives = r.passives.filter(e => e.route !== 'martial'); },
        r => delete r.attack_rounds[0].result, r => { r.attack_rounds[0].actor = 8; },
        r => { r.attack_rounds = []; r.attacks = []; r.actions = []; r.passives = [];
            r.metrics = [{ heartbeats: 15 }, { heartbeats: 15 }];
            r.after = copy(r.before); r.immediate = copy(r.before); }]) {
        const changed = copy(valid); change(changed); assert.throws(() => check(changed, c));
    }
    const noCalls = row(c); attack(noCalls, c); assert.throws(() => check(noCalls, c), /force回调/);
});

test('四门动态动作按真实冷加载技能/有效值约束，不接受假身份或每场重新加载', () => {
    for (const skill of ['suxin-jian', 'yinsuo-jinling', 'wudu-shenzhang', 'sad-strike']) {
        const c = select(skill), valid = row(c); check(valid, c);
        const emptyApply = copy(valid); emptyApply.skill_loads[0].state.temp.apply = {}; check(emptyApply, c);
        for (const change of [r => { r.actions[0].action.force = 1000000; },
            r => { r.actions[0].action.damage = -1; }, r => delete r.actions[0].action.dodge,
            r => { r.skill_loads[0].state.object = '/tests/other#999'; },
            r => { r.skill_loads[0].state.skills.force = 1; },
            r => { r.skill_loads[0].state.effective_skills.force++; },
            r => { r.skill_loads[0].state.mappings.force = 'yunv-xinjing'; },
            r => { r.skill_loads[0].state.weapon = 'sword'; },
            r => { r.skill_loads[0].state.temp.apply = null; },
            r => { r.skill_loads[0].state.temp.apply = { armor: 100 }; },
            r => { r.skill_loads[0].load_id += ':replacement'; }]) {
            const changed = copy(valid); change(changed); assert.throws(() => check(changed, c));
        }
        const next = copy(valid); next.index = 1; next.first = next.first_actor = 1;
        for (const stage of ['before', 'after', 'immediate']) next[stage][0].object = '/tests/actor#900';
        check(next, c); validateGumuBoutLoads([valid, next]);
        assert.throws(() => validateGumuBoutLoads([next]), /首次加载者/);
        const mutated = copy(next); mutated.actions[0].action.force++;
        check(mutated, c); assert.throws(() => validateGumuBoutLoads([valid, mutated]), /全局动作/);
    }
});

test('黯然严格伤害/有效膂力门及玄铁八成创伤，旧80/40合成伪正例必须拒绝', () => {
    for (const [incoming, applied] of [[1, false], [149, false], [150, false], [184, false], [185, true], [200, true]]) {
        const c = select('sad-strike'), valid = row(c); attack(valid, c);
        passive(valid, c, { route: 'martial', incoming, applied }); check(valid, c);
        const wrong = copy(valid); wrong.passives[0].result = applied ? 0 : '伪触发';
        assert.throws(() => check(wrong, c), /黯然/);
    }
    for (const [skill, level, wound] of [['sad-strike', 400, 50], ['xuantie-jian', 800, 160], ['wudu-shenzhang', 400, 200]]) {
        const c = select(skill, 0, level), valid = row(c); attack(valid, c);
        const e = passive(valid, c, { route: 'martial', incoming: 200, applied: true }); check(valid, c);
        assert.equal(e.before[1].eff_qi - e.after[1].eff_qi, wound);
        assert.equal(e.before[1].qi - e.after[1].qi, wound);
        const old = copy(valid); old.passives[0].after[1].qi = 9920;
        old.passives[0].after[1].eff_qi = old.passives[0].target_eff_qi_after = 9960;
        assert.throws(() => check(old, c), /原回调/);
        const noClamp = copy(valid); noClamp.passives[0].after[1].qi = 10000;
        assert.throws(() => check(noClamp, c), /原回调/);
    }
});

test('原回调无触发不伤血，过量创伤截到-1，心经剑鞭随机范围分别校验', () => {
    const c = select('sad-strike'), valid = row(c); attack(valid, c);
    passive(valid, c, { route: 'martial', incoming: 100000, applied: true }); check(valid, c);
    assert.equal(valid.passives[0].after[1].qi, -1); assert.equal(valid.passives[0].after[1].eff_qi, -1);
    for (const bad of [-2, -10000, 0]) {
        const changed = copy(valid); changed.passives[0].after[1].qi = bad;
        assert.throws(() => check(changed, c));
    }
    for (const skill of ['suxin-jian', 'yinsuo-jinling']) {
        const force = select(skill, 50), r = row(force); attack(r, force); passive(r, force, { applied: true });
        check(r, force);
        const changed = copy(r); changed.passives[0].after[1].eff_qi--;
        changed.passives[0].target_eff_qi_after--; assert.throws(() => check(changed, force), /心经/);
        const noop = row(force); attack(noop, force); passive(noop, force);
        noop.passives[0].after[1].qi--; assert.throws(() => check(noop, force), /原回调/);
    }
});

test('玄铁原四分之一返回、五毒原数值1与公共FORCE数值范围不被字符串/零混淆', () => {
    const heavy = select('xuantie-jian'), quarter = row(heavy); attack(quarter, heavy);
    const h = passive(quarter, heavy, { route: 'martial', incoming: 119 }); h.result = 29;
    check(quarter, heavy);
    for (const bad of [0, null, 30, '伪触发']) {
        const changed = copy(quarter); changed.passives[0].result = bad;
        assert.throws(() => check(changed, heavy));
    }
    const poison = select('wudu-shenzhang'), numeric = row(poison); attack(numeric, poison);
    passive(numeric, poison, { route: 'martial' }); check(numeric, poison);
    numeric.passives[0].result = 0; assert.throws(() => check(numeric, poison), /数值附伤/);
    const force = select('xuantie-jian', 50), publicForce = row(force); attack(publicForce, force);
    passive(publicForce, force); check(publicForce, force);
    for (const bad of [-1, 101, null, '伪触发']) {
        const changed = copy(publicForce); changed.passives[0].result = bad;
        assert.throws(() => check(changed, force));
    }
});

test('固定JSON条件和41份引用源码摘要不漂移；动态四门保留首次加载摘要', () => {
    assert.equal(hash(cases), '1bfd89855d8e16d74a674f24ea2f649faa8f1f1614417ec8a5cee7eb8fe96801');
    assert.equal(hash(smoke), 'db5ebdd53f3419c5a4717473d5ad3524da2bfe56d2feefcfa0aa09217279a402');
    const paths = [...new Set(cases.flatMap(c => c.parameters.qualification_sources))].sort();
    const sources = paths.map(path => ({ path, sha256: hash(readFileSync(join(root, path), 'utf8')) }));
    assert.equal(sources.length, 41);
    assert.equal(hash(sources), '5c98169dcaaa305b434e8ea08205193ebf69c6ae2ed81587d3c8bf8dd1d06725');
    assert.deepEqual([...new Set(cases.flatMap(c => c.parameters.capture_skill_loads.map(d => d.skill)))].sort(),
        ['sad-strike', 'suxin-jian', 'wudu-shenzhang', 'yinsuo-jinling']);
});

test('统计只读冻结condition；缺计数为未知错误而非伪零，不混400/800或不同条件', () => {
    const c = select('xuantie-jian', 0, 800), r = row(c);
    const result = gumuBoutEffects([{ outcome: 'observed', raw: r }], c);
    assert.equal(result.level, 800); assert.equal(result.samples, 1);
    assert.equal(result.passives[0].calls, 0); assert.equal(result.passives[0].immediate_wounds.mean, null);
    assert.throws(() => gumuBoutEffects([{ outcome: 'observed', raw: r }], select('xuantie-jian')));
    assert.throws(() => gumuBoutEffects([], undefined));
    r.metrics[0] = null; assert.throws(() => gumuBoutEffects([{ outcome: 'observed', raw: r }], c));
});

test('实际createSeries/openSeries严格建档16条件；非法ID/入口/参数类型仍拒，无driver', () => {
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-bout-unit-'));
    try {
        const input = { inventory: { source_fingerprint: fingerprint, versions: { synthetic: true } },
            catalog, conditions: cases, execution: { synthetic: true, driver_started: false } };
        const manifest = createSeries(directory, input);
        assert.deepEqual(openSeries(directory).identity.conditions, cases);
        assert.equal(openSeries(directory).fingerprint, manifest.fingerprint);
        createSeries(join(directory, 'smoke'), { ...input, conditions: smoke });
        assert.deepEqual(openSeries(join(directory, 'smoke')).identity.conditions, smoke);
        const invalid = copy(input); invalid.conditions[0].id += '中文';
        assert.throws(() => createSeries(join(directory, 'invalid-id'), invalid), /条件 ID/);
        invalid.conditions[0].id = cases[0].id; invalid.conditions[0].entry_id += '-missing';
        assert.throws(() => createSeries(join(directory, 'invalid-entry'), invalid), /入口不在源码/);
        invalid.conditions[0].entry_id = cases[0].entry_id; invalid.conditions[0].parameters = null;
        assert.throws(() => createSeries(join(directory, 'invalid-parameters'), invalid));
        assert.throws(() => gumuBoutConditions(catalog, { smoke: 'true' }));
        assert.throws(() => gumuBoutConditions({ skills: [] }));
    } finally {
        assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + 'mud-gumu-bout-unit-'));
        rmSync(directory, { recursive: true, force: true });
    }
});

test('共享注册只尾追加16条；旧15709完整交锋与12024教学条件有序指纹保持', () => {
    const inventory = buildInventory(root), fullCatalog = collectCatalog(root, inventory);
    const all = schoolCombatConditions(fullCatalog), allSmoke = schoolCombatConditions(fullCatalog, { smoke: true });
    assert.ok(all.length >= 15725); assert.equal(all.slice(0, 15725).reduce((n, c) => n + c.samples, 0), 409614);
    assert.equal(allSmoke.slice(0, 15725).reduce((n, c) => n + c.samples, 0), 25945);
    assert.equal(hash(all.slice(0, 15709)), 'c32830a9f6c946fe7c982294e41e8865cf0237a5deddaef381be6c932f0fcffc');
    assert.equal(hash(allSmoke.slice(0, 15709)), '57915b8fb932157702e317665cf1605661f55564317b12a213329071198b01eb');
    assert.deepEqual(all.slice(15709, 15725), cases); assert.deepEqual(allSmoke.slice(15709, 15725), smoke);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    const teaching = teachingConditions(schoolRelations(inventory, fullCatalog), fullCatalog)
        .filter(c => c.parameters.teaching_profile !== 'taohua-learning');
    assert.equal(teaching.length, 12024); assert.equal(teaching.reduce((n, c) => n + c.samples, 0), 54522);
    assert.equal(hash(teaching), '718d60c2d081636ff92635b60bd24d3d93e736ae3f082b695df98fc2c214abf1');
    validateSchoolCombatPlan(cases, fullCatalog);
    const changed = copy(cases); changed[0].parameters.actor.skills.force++;
    assert.throws(() => validateSchoolCombatPlan(changed, fullCatalog), /原审阅版本/);
    const missing = copy(cases); missing[0].parameters.qualification_sources.pop();
    assert.throws(() => validateSchoolCombatPlan(missing, fullCatalog), /原审阅版本/);
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-bout-shared-unit-'));
    try {
        for (const [name, conditions] of [['formal', all.slice(15709, 15725)], ['smoke', allSmoke.slice(15709, 15725)]]) {
            const location = join(directory, name);
            createSeries(location, { inventory, catalog: fullCatalog, conditions,
                execution: { collection: 'school-combat', smoke: name === 'smoke', driver_started: false } });
            assert.deepEqual(openSeries(location).identity.conditions, conditions);
            for (const condition of conditions) validateSchoolCombatRecord(row(condition), condition);
        }
        const invalid = copy(cases); invalid[0].id += '中文';
        assert.throws(() => createSeries(join(directory, 'bad-id'), { inventory, catalog: fullCatalog,
            conditions: invalid, execution: { driver_started: false } }), /条件 ID/);
        const absent = copy(fullCatalog); absent.skills = absent.skills.filter(s => s.path !== cases[0].entry_id);
        assert.throws(() => createSeries(join(directory, 'missing-source'), { inventory, catalog: absent,
            conditions: cases, execution: { driver_started: false } }), /入口不在源码/);
    } finally {
        assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + 'mud-gumu-bout-shared-unit-'));
        rmSync(directory, { recursive: true, force: true });
    }
});

test('共享报告具名嵌套gumu不覆盖sides，正式窗口和回调分母分别保留', () => {
    const c = select('suxin-jian', 50), raw = row(c); attack(raw, c); passive(raw, c, { applied: true });
    validateSchoolCombatRecord(raw, c); assert.equal(Object.hasOwn(raw, 'parameters'), false);
    const wrappers = [{ condition_id: c.id, outcome: 'observed', raw }], before = copy(raw);
    const effects = gumuSchoolBoutEffects(wrappers, c);
    assert.deepEqual(effects.sides, schoolBoutEffects(wrappers).sides);
    assert.deepEqual(effects.gumu, gumuBoutEffects(wrappers, c));
    assert.notDeepEqual(effects.sides, effects.gumu.sides);
    assert.equal(effects.gumu.passives[0].calls, 1); assert.equal(effects.gumu.passives[0].neili_spent, 50);
    assert.deepEqual(raw, before);
    assert.throws(() => gumuSchoolBoutEffects(wrappers, undefined), /冻结条件/);
    assert.throws(() => gumuSchoolBoutEffects(wrappers, select('xuantie-jian')));
    const metric = { qi_cost: { mean: 80 }, qi_recovery: { mean: 0 }, neili_cost: { mean: 50 }, neili_recovery: { mean: 0 } };
    const report = { fingerprint: 'synthetic', evidence_sha256: 'synthetic',
        totals: { conditions: 1, samples: 1, observed: 1, refused: 0 },
        conditions: [{ ...c, counts: { observed: 1, refused: 0 }, sides: [{ metrics: metric }, { metrics: metric }],
            effects: schoolCombatEffects(wrappers), bout_effects: effects }] };
    const markdown = schoolCombatMarkdown(report);
    assert.match(markdown, /古墓组合：原被动回调与磨损/);
    assert.match(markdown, /force \| 1\/1 \| 50/);
    assert.match(markdown, /400级与800级玄铁分别统计/);
    assert.equal(markdown.split(c.id).length - 1, 3, '仅原交锋表和两条回调表，不重复进入即时表');
});

test('共享LPC只复用原加载/心跳/回调观察，显式冻结报告及两个统计依赖', () => {
    const source = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    const body = name => {
        const start = source.search(new RegExp('(?:mapping|object|void)\\s+' + name + '\\([^;]*?\\)\\s*\\{'));
        assert.ok(start >= 0, name); return source.slice(start).split('\n}\n')[0];
    };
    for (const name of ['snapshot', 'prepare_actor', 'observe_attack', 'observe_attack_round',
        'observe_selected_action', 'begin_passive', 'observe_passive', 'advance'])
        assert.match(body(name), /"gumu-bout"/, name);
    assert.match(body('snapshot'), /result\["per"\] = ob->query\("per"\)/);
    assert.match(body('snapshot'), /result\["preparation_order"\]/);
    assert.match(body('snapshot'), /can_learn\/yunv-xinjing\/wall/);
    assert.match(body('prepare_actor'), /capture_skill_loads[\s\S]*original_skill_loads[\s\S]*enable parry/);
    for (const condition of cases) for (const descriptor of condition.parameters.capture_skill_loads) {
        assert.equal(condition.parameters.actor.skills.parry, 400);
        assert.ok(condition.parameters.actor.skills[descriptor.skill] > 0);
    }
    const execution = readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8');
    for (const path of ['school_gumu_bout_cases.mjs', 'school_gumu_bout.test.mjs',
        'tools/tests/weapon_balance/statistics.mjs']) assert.ok(execution.includes(path), path);
    assert.match(execution, /'school_combat_report'/); assert.match(execution, /'statistics'/);
    const report = readFileSync(join(root, 'tools/tests/martial_data/school_combat_report.mjs'), 'utf8');
    assert.match(report, /records\.filter\(r => r\.condition_id\?\.startsWith\('school-gumu-bout-'\)\)/);
    assert.match(report, /validateGumuBoutLoads\(gumuBoutRecords\)/);
    assert.match(report, /condition\.bout_effects = gumuSchoolBoutEffects\([^;]+, condition\)/);
});
