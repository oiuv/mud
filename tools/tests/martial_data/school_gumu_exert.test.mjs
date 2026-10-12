import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectCatalog } from './catalog.mjs';
import { buildInventory } from './inventory.mjs';
import { validateExpectedOutcomes } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatEffects, schoolCombatMarkdown } from './school_combat_report.mjs';
import { gumuExertConditions, gumuExertFixtureRequirements, gumuBuffDelta, gumuBuffPower,
    validateGumuExertRecord, gumuExertEffects } from './school_gumu_exert_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuExertConditions(catalog);
const pick = (skill, ability, level = 200, tag = '') => {
    const c = cases.find(c => c.id === `school-gumu-exert-${skill}-${ability}-l${level}${tag ? '-' + tag : ''}`);
    assert.ok(c, [skill, ability, level, tag].join('/')); return c;
};
const roar = tag => pick('surge-force', 'roar', 200, tag);

// Synthetic transitions only. No game is run and no sample ledger is written.
function row(c, randomPass = true) {
    const p = c.parameters, ok = p.expected === 'observed';
    const make = (cfg, id) => {
        const temp = {};
        for (const [k, v] of Object.entries(cfg.temp ?? {})) {
            if (k.startsWith('apply/')) (temp.apply ??= {})[k.slice(6)] = v;
            else temp[k] = v;
        }
        const properties = Object.fromEntries(Object.entries(cfg.properties).filter(([key]) => key !== 'character' && !key.includes('/')));
        const s = { ...properties, temp, object: '/tests/' + id, id, busy: cfg.busy ?? null,
            userp: 1, playerp: 1, interactive: 1, wizardp: 0, is_character: 1, living: 1, ghost: 0,
            skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), learned: {},
            conditions: structuredClone(cfg.conditions ?? null),
            cultivation: { character: cfg.properties.character ?? null, 'family/family_name': cfg.properties['family/family_name'] ?? null },
            hostility: { enemies: [], killers: [], wants: [] } };
        s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0)]));
        return s;
    };
    const b = make(p.actor, 'left'), t = make(p.target, 'right');
    const preparation = p.target_state === 'unconscious'
        ? { before: structuredClone(t), terminals: [{ side: 1, state: 'unconscious' }] } : null;
    if (p.target_state === 'unconscious') Object.assign(t, { qi: 0, jing: 0, living: 0 });
    if (preparation) preparation.after = structuredClone(t);
    b.powers = Object.fromEntries(['attack', 'dodge', 'parry'].map(k => [k, gumuBuffPower(b, k)]));
    const r = { before: [b, t], immediate: structuredClone([b, t]), metrics: [{}, {}],
        outcome: p.expected, reason: '原命令拒绝', command_accepted: Number(ok),
        launches: [], interfaces: [], attacks: [], callbacks: [], terminals: [], elapsed: 0,
        ...(preparation ? { preparation } : {}) };
    const a = r.immediate[0];
    if (ok) {
        const cost = p.ability === 'roar' || p.skill === 'yunv-xinjing' ? 100 : 200;
        a.neili -= cost; r.metrics[0].neili_cost = cost; r.launches.push({ skill: p.skill, argument: p.action.slice('exert '.length) });
        if (b.effective_skills.force >= 120 || randomPass) a.learned[p.skill] = 1;
        if (p.ability === 'powerup') {
            a.temp.powerup = 1; a.temp.apply ??= {};
            for (const [k, v] of Object.entries(gumuBuffDelta(p.skill, b.skills[p.skill]))) a.temp.apply[k] = (a.temp.apply[k] ?? 0) + v;
            a.busy = p.fighting ? randomPass ? 3 : 1 : b.busy;
        } else { a.qi -= 10; r.metrics[0].qi_cost = 10; a.busy = 5; }
    }
    a.powers = Object.fromEntries(['attack', 'dodge', 'parry'].map(k => [k, gumuBuffPower(a, k)]));
    if (p.repeat_actions) r.repeat_steps = p.repeat_actions.map((action, i) => ({ action,
        before: structuredClone(i ? a : b), after: structuredClone(a), accepted: Number(i === 0),
        launches_before: i, launches_after: 1, reason: i ? '已经在运功中' : '' }));
    if (p.ability === 'roar') {
        r.extra_target_before = make(p.extra_target, 'third'); r.extra_target_immediate = structuredClone(r.extra_target_before); r.extra_target_metrics = {};
        const force = b.effective_skills.force, min = Math.trunc(force / 2);
        for (const [before, after, m] of [[t, r.immediate[1], r.metrics[1]], [r.extra_target_before, r.extra_target_immediate, r.extra_target_metrics]]) {
            if (!ok || before.conditions?.die_guard || min * 2 - 1 < before.con * 2 || (min < before.con * 2 && !randomPass)) continue;
            a.hostility.enemies.push(before.id); a.hostility.wants.push(before.id);
            if (before.living) { after.hostility.enemies.push('left'); after.hostility.killers.push('left'); }
            const damage = Math.max(0, force - Math.trunc(before.max_neili / 10)), wound = before.neili < force * 2 ? damage : 0;
            after.eff_jing = Math.max(-1, before.eff_jing - wound);
            after.jing = Math.min(Math.max(-1, before.jing - damage * 2), after.eff_jing);
            for (const k of ['jing', 'eff_jing']) if (after[k] !== before[k]) m[k + '_cost'] = before[k] - after[k];
        }
        r.extra_target_after = structuredClone(r.extra_target_immediate);
    }
    r.after = structuredClone(r.immediate);
    if (p.observe_seconds) {
        const end = r.after[0]; r.elapsed = p.observe_seconds;
        for (const [k, v] of Object.entries(gumuBuffDelta(p.skill, b.skills[p.skill]))) end.temp.apply[k] -= v;
        delete end.temp.powerup; end.powers = structuredClone(b.powers);
        r.callbacks = [{ side: 0, phase: 'before', elapsed: b.skills[p.skill], state: structuredClone(a) },
            { side: 0, phase: 'after', elapsed: b.skills[p.skill], state: structuredClone(end) }];
    }
    return r;
}

test('三个原入口追加81条件3298计划，旧13815条件379732计划完整内容不变', () => {
    const all = schoolCombatConditions(catalog).slice(0, 13896);
    const registered = new Set(all.map(c => c.id)), smoke = gumuExertConditions(catalog, { smoke: true });
    assert.equal(cases.length, 81); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3298);
    assert.equal(smoke.length, 81); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 113);
    const hash = conditions => createHash('sha256').update(JSON.stringify(conditions)).digest('hex');
    assert.equal(hash(cases), 'fceb79222ac46900cac7090ab802ef41a8633c44dbee23483bde426c5c5fc8db');
    assert.equal(hash(smoke), '580a7e16dab178b5322864c424a7177cd1fc2693c17eb1be8285491f6d90863e');
    const old = all.filter(c => c.parameters.collection_group !== 'gumu-exert');
    assert.equal(old.length, 13815); assert.equal(old.reduce((n, c) => n + c.samples, 0), 379732);
    assert.equal(hash(old), '15f211c604963fa739a1561f69881a1425ca98b8ae94b0331e704a0e97f8555a');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-exert'), cases);
    assert.equal(all.length, 13896); assert.equal(registered.size, all.length);
    assert.equal(all.reduce((n, c) => n + c.samples, 0), 383030);
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length); assert.equal(gumuExertFixtureRequirements.length, 4);
    for (const [i, c] of cases.entries()) {
        assert.ok(registered.has(c.id)); assert.deepEqual(c.parameters, smoke[i].parameters);
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        for (const skill of Object.keys(c.parameters.actor.skills)) assert.ok(catalog.skills.some(s => s.id === skill));
        for (const passed of [true, false]) {
            const raw = row(c, passed); assert.ok(!Object.hasOwn(raw, 'parameters'));
            validateSchoolCombatRecord(raw, c);
        }
    }
    assert.throws(() => gumuExertConditions(catalog, { samples: 0 }));
});

test('强化检查150/500而实际扣100/200；原始等级决定偏移，不是有效内功', () => {
    assert.deepEqual([200, 400, 800].map(l => gumuBuffDelta('yunv-xinjing', l).attack), [66, 133, 266]);
    assert.deepEqual([200, 400, 800].map(l => gumuBuffDelta('surge-force', l)), [
        { attack: 80, defense: 80, unarmed_damage: 40 }, { attack: 160, defense: 160, unarmed_damage: 80 },
        { attack: 320, defense: 320, unarmed_damage: 160 }]);
    for (const [skill, left] of [['yunv-xinjing', 50], ['surge-force', 300]]) {
        assert.equal(row(pick(skill, 'powerup', 200, 'minimum-neili')).immediate[0].neili, left);
        assert.equal(pick(skill, 'powerup', 200, 'low-neili').parameters.expected, 'refused');
        assert.equal(row(pick(skill, 'powerup', 200, 'basic-force0')).immediate[0].temp.apply.attack, gumuBuffDelta(skill, 200).attack);
        assert.equal(pick(skill, 'powerup', 1).parameters.expected, 'observed');
    }
});

test('apply/defense真实进入闪避与招架判定；不是直接命中率或伤害倍率', () => {
    const x = row(pick('yunv-xinjing', 'powerup')), y = row(pick('surge-force', 'powerup'));
    assert.equal(x.before[0].powers.attack, 10575000); assert.equal(x.immediate[0].powers.attack, 11111130);
    assert.equal(x.immediate[0].powers.dodge, 8888904); assert.equal(x.immediate[0].powers.parry, 8888904);
    assert.equal(y.immediate[0].powers.attack, 11299770); assert.equal(y.immediate[0].powers.dodge, 9039816);
    assert.deepEqual(x.immediate[0].effective_skills, x.before[0].effective_skills);
    x.immediate[0].powers.dodge = x.before[0].powers.dodge;
    assert.throws(() => validateGumuExertRecord(x, pick('yunv-xinjing', 'powerup')));
});

test('共享powerup标记阻止重复，原回调自然撤除自身偏移并保留已有属性', () => {
    for (const skill of ['yunv-xinjing', 'surge-force']) {
        const repeat = row(pick(skill, 'powerup', 200, 'repeat'));
        assert.deepEqual(repeat.repeat_steps.map(s => s.accepted), [1, 0]); assert.equal(repeat.launches.length, 1);
        for (const level of [50, 200]) {
            const c = pick(skill, 'powerup', level, 'expiry'), r = row(c);
            assert.deepEqual(r.after[0].temp.apply, { attack: 7, defense: 11, unarmed_damage: 13 });
            assert.equal(r.callbacks[0].elapsed, level); validateGumuExertRecord(r, c);
            r.callbacks[0].elapsed = level - 2; assert.throws(() => validateGumuExertRecord(r, c));
        }
    }
});

test('原始空闲和空条件为显式null，字段缺项不伪装零值；性格和门派归属cultivation', () => {
    const c = pick('yunv-xinjing', 'powerup'), r = row(c);
    assert.equal(r.before[0].busy, null); assert.equal(r.immediate[0].busy, null);
    assert.equal(r.before[0].conditions, null); assert.equal(r.before[0].character, undefined);
    assert.equal(r.before[0]['family/family_name'], undefined);
    assert.equal(r.before[0].cultivation.character, '光明磊落');
    validateGumuExertRecord(r, c);
    for (const phase of ['before', 'immediate', 'after']) for (const key of ['busy', 'conditions', 'qi', 'max_neili', 'effective_skills', 'cultivation']) {
        const bad = row(c); delete bad[phase][0][key];
        assert.throws(() => validateGumuExertRecord(bad, c), phase + '/' + key);
    }
    const busy = pick('surge-force', 'powerup', 200, 'busy');
    assert.equal(row(busy).before[0].busy, 2); validateGumuExertRecord(row(busy), busy);
});

test('自然解除必须有真实成对回调时钟与状态，不能以最后消失推定原延时', () => {
    const c = pick('surge-force', 'powerup', 50, 'expiry');
    for (const change of [r => r.callbacks = [], r => r.callbacks[0].elapsed = null,
        r => r.callbacks[0].elapsed = 48, r => r.callbacks[1].elapsed = r.elapsed + 1,
        r => r.elapsed = 50, r => r.callbacks[0].state.neili++,
        r => delete r.callbacks[1].state.busy, r => r.callbacks[1].state.temp.apply.defense = 0,
        r => r.callbacks[1].state.powers.attack++, r => r.after[0].learned.force = 1]) {
        const r = row(c); change(r); assert.throws(() => validateGumuExertRecord(r, c));
    }
});

test('自然解除回调必须来自原施术者，不能接收同形的其他对象快照', () => {
    const c = pick('surge-force', 'powerup', 50, 'expiry');
    for (const indices of [[0], [1], [0, 1]]) {
        const r = row(c);
        for (const index of indices) r.callbacks[index].state.object = '/tests/unrelated#123';
        assert.throws(() => validateGumuExertRecord(r, c));
    }
});

test('黯然吟有自己门槛与费用，不套狮子吼白名单/800内力/天书房间禁令', () => {
    const c = pick('surge-force', 'roar', 100, 'minimum'), r = row(c);
    assert.equal(r.before[0].effective_skills.force, 100); assert.equal(r.immediate[0].neili, 0);
    assert.equal(r.immediate[0].qi, 9990); assert.equal(r.immediate[0].busy, 5);
    assert.equal(roar('skybook').parameters.expected, 'observed'); assert.equal(roar('no-fight').parameters.expected, 'refused');
    assert.equal(row(roar('low-actor-qi')).immediate[0].qi, 0);
    assert.equal(row(roar('low-actor-qi')).immediate[0].living, 1); // Immediate only, before a natural heartbeat.
});

test('随机根骨判定、死亡保护及零伤害敌对分开，不拿当前内力作抵伤上限', () => {
    for (const [tag, expected] of [['con75', true], ['con150', false], ['die-guard', false]])
        for (const passed of [true, false]) assert.equal(row(roar(tag), passed).immediate[0].hostility.wants.includes('right'), expected);
    assert.notDeepEqual(row(roar('con100'), true).immediate[0].hostility, row(roar('con100'), false).immediate[0].hostility);
    const zero = row(roar('base')); assert.equal(zero.immediate[1].jing, 10000); assert.deepEqual(zero.immediate[1].hostility.killers, ['left']);
    const below = row(roar('wound-below')), equal = row(roar('wound-equal'));
    assert.equal(below.immediate[1].eff_jing, 9700); assert.equal(equal.immediate[1].eff_jing, 10000);
    assert.equal(below.immediate[1].jing, 9400); assert.equal(equal.immediate[1].jing, 9400);
});

test('同房第三人也受声浪；昏迷角色不跳过，低精神无额外立即昏迷或十点回补', () => {
    const both = row(roar('both-hit')); assert.equal(both.extra_target_after.jing, 9400);
    assert.deepEqual(both.immediate[0].hostility.wants, ['right', 'third']);
    const unconscious = row(roar('unconscious')); assert.equal(unconscious.immediate[1].jing, -1);
    assert.equal(unconscious.immediate[1].living, 0); assert.deepEqual(unconscious.immediate[1].hostility.killers, []);
    assert.deepEqual(unconscious.immediate[0].hostility.wants, ['right']);
    assert.deepEqual(unconscious.preparation.terminals, [{ side: 1, state: 'unconscious' }]);
    assert.deepEqual(unconscious.preparation.after, unconscious.before[1]);
    validateGumuExertRecord(unconscious, roar('unconscious'));
    for (const change of [r => delete r.preparation, r => delete r.preparation.terminals,
        r => r.preparation.terminals = [], r => r.preparation.terminals[0].side = 0,
        r => r.preparation.terminals[0].state = 'death',
        r => r.preparation.before.object = '/tests/unrelated#123',
        r => r.preparation.after.object = '/tests/unrelated#123',
        r => r.preparation.before.living = 0, r => r.preparation.before.qi = 0,
        r => r.preparation.before.jing = 0, r => r.preparation.after.neili++,
        r => r.terminals = structuredClone(r.preparation.terminals)]) {
        const bad = row(roar('unconscious')); change(bad);
        assert.throws(() => validateGumuExertRecord(bad, roar('unconscious')));
    }
    for (const tag of ['low-jing', 'low-eff-jing']) {
        const r = row(roar(tag)); assert.equal(r.immediate[1].jing, -1); assert.equal(r.immediate[1].living, 1);
        assert.equal(r.terminals.length, 0);
    }
});

test('拒绝身份/费用/观测污染，不能让继承和错入口伪装为效果成功', () => {
    const c = pick('surge-force', 'powerup');
    for (const change of [r => r.before[0].wizardp = 1, r => r.before[0].effective_skills.force++,
        r => r.launches[0].skill = 'force', r => r.immediate[0].neili++, r => r.metrics[0].neili_cost = null,
        r => r.metrics[0].heartbeats = 1, r => r.immediate[0].learned.force = 1,
        r => r.immediate[0].learned.force = null, r => r.immediate[0].learned.force = -1,
        r => r.immediate[0].learned.force = 0.5, r => r.immediate[0].learned = [],
        r => r.immediate[0].temp.apply.unarmed_damage = 0, r => r.after[1].qi--]) {
        const r = row(c); change(r); assert.throws(() => validateGumuExertRecord(r, c));
    }
    const r = row(roar('both-hit')); r.extra_target_after.jing = 10000;
    assert.throws(() => validateGumuExertRecord(r, roar('both-hit')));
    const unconscious = row(roar('unconscious')); unconscious.before[1].living = 1;
    assert.throws(() => validateGumuExertRecord(unconscious, roar('unconscious')));
    const exhausted = row(roar('low-actor-qi')); exhausted.immediate[0].living = 0;
    assert.throws(() => validateGumuExertRecord(exhausted, roar('low-actor-qi')));
});

test('资源计数记录实际截断后的变化，拒绝未知值和额外扣除后恢复的净值伪装', () => {
    for (const c of [pick('surge-force', 'powerup'), roar('low-jing'), roar('both-hit')]) {
        validateGumuExertRecord(row(c), c);
        for (const change of [r => r.metrics[0].qi_recovery = 1,
            r => r.metrics[1].neili_cost = 1, r => r.metrics[1].neili_recovery = 1,
            r => r.metrics[0].jing_cost = null, r => r.metrics[0].qi_cost = -1,
            r => r.metrics[0].qi_cost = 0.5,
            r => { r.metrics[1].jing_cost = (r.metrics[1].jing_cost ?? 0) + 10; r.metrics[1].jing_recovery = 10; }]) {
            const r = row(c); change(r); assert.throws(() => validateGumuExertRecord(r, c));
        }
    }
    const low = row(roar('low-jing'));
    assert.equal(low.metrics[1].jing_cost, 2); // 1 -> -1, not the nominal 600 damage.
    const c = roar('both-hit'), r = row(c); r.extra_target_metrics.neili_cost = 1;
    assert.throws(() => validateGumuExertRecord(r, c));
});

test('统计保留各自分母与未知，不把命令受理当命中或把强化判定值当伤害', () => {
    const buff = pick('yunv-xinjing', 'powerup'), roarCase = roar('both-hit'), b = row(buff), r = row(roarCase);
    const stats = gumuExertEffects([{ outcome: 'observed', raw: b }, { outcome: 'error' }, { outcome: 'refused', raw: b }], buff);
    assert.equal(stats.observed, 1); assert.equal(stats.other_or_unknown, 2); assert.equal(stats.buff.samples, 1);
    assert.equal(stats.unknown_ability, 0); assert.equal(stats.roar[0].samples, 0);
    assert.equal(stats.buff.powers.attack.mean, 536130); assert.equal(stats.buff.expiry_seconds.mean, null);
    const roarStats = gumuExertEffects([{ outcome: 'observed', raw: r }], roarCase);
    assert.equal(roarStats.buff.samples, 0); assert.equal(roarStats.roar[0].affected.trials, 1);
    assert.equal(roarStats.roar[1].jing_net.mean, -600);
    delete b.immediate[0].powers; delete r.immediate[0].hostility;
    assert.equal(gumuExertEffects([{ outcome: 'observed', raw: b }], buff).buff.powers.attack.mean, null);
    const missing = gumuExertEffects([{ outcome: 'observed', raw: r }], roarCase);
    assert.equal(missing.roar[0].affected.rate, null); assert.equal(missing.roar[0].unknown_hostility, 1);
    b.parameters = { ability: 'powerup' }; // Obsolete ad-hoc fields never authorize classification.
    const unclassified = gumuExertEffects([{ outcome: 'observed', raw: b }]);
    assert.equal(unclassified.unknown_ability, 1); assert.equal(unclassified.buff.samples, 0);
});

test('共享接线观察真实判定与敌对，只放行本组既定初态和原入口', () => {
    const text = path => readFileSync(join(root, path), 'utf8'), runner = text('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /collection_group"\] == "gumu-exert"\) \{\s+result\["is_character"\] = ob->is_character\(\);\s+result\["cultivation"\]\["character"\] = ob->query\("character"\)/);
    for (const [key, skill, usage] of [['attack', 'unarmed', 'ATTACK'], ['dodge', 'dodge', 'DEFENSE'], ['parry', 'parry', 'DEFENSE']])
        assert.ok(runner.includes(`"${key}": COMBAT_D->skill_power(ob, "${skill}", SKILL_USAGE_${usage}, 0)`));
    assert.match(runner, /"shaolin-public-force", "gumu-exert" \}\)\) != -1\)\s+result\["hostility"\]/);
    for (const method of ['query_enemy', 'query_killer', 'query_want']) assert.ok(runner.includes('ob->' + method + '()'));
    assert.match(runner, /collection_group"\] == "gumu-exert" && side == 0 &&/);
    assert.match(runner, /collection_group"\] == "gumu-exert" &&\s+side == 0 && key == "exert_drug" && value == 10/);
    assert.match(runner, /"shaolin-public-force", "gumu-exert" \}\)\) != -1 &&\s+current\["parameters"\]\["ability"\] == "roar" && side > 0 && key == "die_guard" && value == 100/);
    assert.ok(runner.includes('ob->apply_condition(key, serializable(value))'));
    assert.ok(/"wudang-special", "shaolin-public-force", "gumu-exert" \}\)\s*\) != -1 &&\s*sizeof\(players\) == 3/.test(runner.replace(/\s+/g, ' ')), 'third USER remains restricted to configured groups');
    assert.match(runner, /"gumu-defense",\s+"gumu-exert"/);
    assert.match(runner, /players\[1\]->unconcious\(\);\s+players\[1\]->stop_observation\(\);/);
    assert.match(runner, /if \(member_array\(parameters\["collection_group"\],\s+\(\{ "gumu-exert", "gumu-zhi", "gumu-quanzhen" \}\)\) != -1\) \{\s+current\["preparation"\]\["terminals"\] = copy\(current\["terminals"\]\);\s+current\["terminals"\] = \(\{\}\);/);
    assert.match(runner, /collection_group"\] == "gumu-exert" \?\s+\(\{ "exert powerup" \}\)/);
    assert.ok(text('tools/tests/martial_data/execution.mjs').includes("'tools/tests/martial_data/school_gumu_exert_cases.mjs'"));
    assert.match(text('tools/tests/martial_data/school_combat_report.mjs'),
        /condition\.gumu_exert = gumuExertEffects\(rows\.filter\(r => r\.condition_id === condition\.id\), condition\)/);
});

test('专用报告读取无parameters记录与冻结条件，不混普通伤害表或填零解除秒数', () => {
    const conditions = [pick('yunv-xinjing', 'powerup'), roar('both-hit')].map(c => {
        const raw = row(c), rows = [{ condition_id: c.id, outcome: 'observed', raw }];
        assert.ok(!Object.hasOwn(raw, 'parameters'));
        return { ...c, counts: { observed: 1, refused: 0 }, effects: schoolCombatEffects(rows),
            gumu_exert: gumuExertEffects(rows, c) };
    });
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-only', evidence_sha256: 'synthetic-only',
        totals: { conditions: 2, samples: 2, observed: 2, refused: 0 }, conditions });
    assert.match(markdown, /古墓运功：强化判定与群体精神影响/);
    assert.ok(markdown.includes('| 536130.00/428904.00/428904.00 | 未知 | 0/0 |'));
    assert.ok(markdown.includes('| 未知/未知/未知 | 未知 | 1/1 | -600.00/-300.00 | 1/1 | -600.00/-300.00 |'));
    for (const c of conditions) assert.equal(markdown.split(c.id).length - 1, 1);
});

test('源码依据保留真实群体与防御读取，不在工具中重写施术/回调行为', () => {
    const text = path => readFileSync(join(root, path), 'utf8');
    const gumu = text('kungfu/skill/surge-force/roar.c');
    assert.match(gumu, /!ob\[i\]->is_character\(\)/); assert.doesNotMatch(gumu, /\bunconcious\(|\bliving\(|"skybook"/);
    assert.match(text('kungfu/skill/force/roar.c'), /ob\[i\]->unconcious\(me\)/);
    assert.match(text('adm/daemons/combatd.c'), /level \+= apply\["defense"\]/);
    assert.ok(!existsSync(join(root, 'kungfu/skill/force/powerup.c')));
    assert.match(text('tools/tests/martial_data/actor.lpc'), /::eval_function\(fun\)/);
});
