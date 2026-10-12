// Original prepare commands and COMBAT_D fight rounds; no forced random branch.
import assert from 'node:assert/strict';

export const wudangCombinations = { 'taiji-quan': 'unarmed', 'wudang-zhang': 'strike', 'paiyun-shou': 'hand' };
const names = Object.keys(wudangCombinations);
const prepare = skills => Object.fromEntries(skills.map(s => [wudangCombinations[s], s]));
const command = (action, skills, accepted = 1) => ({ action, accepted, preparations: prepare(skills) });

export function wudangCombinationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(id, method, level, steps, extra = {}) {
        const skill = extra.skill ?? 'taiji-quan', source = catalog.skills.find(s => s.id === skill);
        assert.ok(source);
        const actor = { skills: { unarmed: level, strike: level, hand: level, claw: level,
            sword: level, 'taiji-jian': level, 'huzhua-shou': level,
            ...Object.fromEntries(names.map(s => [s, level])), force: 600, dodge: 600, parry: level,
            ...extra.skills },
            mappings: { ...Object.fromEntries(names.map(s => [wudangCombinations[s], s])),
                parry: 'taiji-quan', claw: 'huzhua-shou', sword: 'taiji-jian' },
            preparations: {}, properties: { jiali: extra.jiali ?? 0, str: 36, dex: extra.dex ?? 36,
                neili: 6000, max_neili: 6000, 'family/family_name': '武当派' },
            ...(extra.armed ? { equipment: { type: 'sword', hold: false } } : {}) };
        for (const usage of extra.unmapped ?? []) delete actor.mappings[usage];
        result.push({ id: `school-wudang-combination-${id}-l${level}`, stage: 'school', entry_id: source.path,
            method, samples: smoke ? 2 : method === 'round' ? samples : 2,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-combination',
                skill, level, combination: id, ability: method, observation: 'single_action_immediate', actor,
                target: { skills: { unarmed: 600, dodge: 600, parry: 600, force: 600 },
                    mappings: {}, properties: { str: 36, dex: 36, jiali: 0, neili: 6000, max_neili: 6000 },
                    ...(extra.targetBusy ? { busy: 2 } : {}) },
                action: method === 'interface' ? 'test_interface' : method === 'round' ? 'fight_round' : 'prepare_sequence',
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + skill,
                    function: 'valid_combine', combo: extra.combo }, combine_result: Number(names.includes(extra.combo) && extra.combo !== skill) }
                    : { prepare_commands: steps }),
                fighting: method === 'round', observe_seconds: 0, not_applicable: '',
                expected: method === 'prepare' && !steps.some(s => s.accepted) ? 'refused' : 'observed',
                qualification_sources: ['cmds/skill/prepare.c', 'feature/skill.c', 'feature/attack.c',
                    'feature/attribute.c', 'adm/daemons/combatd.c', 'include/combat.h', 'inherit/skill/skill.c',
                    ...[...names, 'huzhua-shou', 'taiji-jian', 'unarmed', 'sword'].map(s => 'kungfu/skill/' + s + '.c'),
                    'kungfu/class/wudang/zhang.c', 'kungfu/class/wudang/song.c'],
                qualification_note: '真实非巫师USER；技能等级为实验赋值，空手与持剑对照分列。不预写准备或action_flag；所有准备、取消经原命令。攻击轮调用原COMBAT_D->fight一次，保持随机、反击和伤害，无心跳自动攻击；不等同一击或完整交锋。固定基本内功600不激发特殊内功，避免混入内功被动。',
            } });
    }
    for (const a of names) for (const b of [...names, 'huzhua-shou', 'not-a-skill'])
        add(`${a}-allows-${b}`, 'interface', 200, [], { skill: a, combo: b });
    for (const level of [200, 400, 800]) for (const a of names) for (const b of names.filter(s => s !== a)) {
        for (const route of ['names', 'basics', 'sequential']) {
            const steps = route === 'sequential' ? [command(`prepare ${a}`, [a]), command(`prepare ${b}`, [a, b])]
                : [command(`prepare ${route === 'names' ? a + ' ' + b : wudangCombinations[a] + ' ' + wudangCombinations[b]}`, [a, b])];
            add(`${a}-${b}-${route}`, 'prepare', level, steps);
        }
    }
    const [a, b, c] = names;
    add('cancel-and-replace', 'prepare', 200, [command(`prepare ${a} ${b}`, [a, b]),
        command('prepare none', []), command(`prepare ${c}`, [c])]);
    add('third-refused', 'prepare', 200, [command(`prepare ${a} ${b}`, [a, b]), command(`prepare ${c}`, [a, b], 0)]);
    add('pair-while-one', 'prepare', 200, [command(`prepare ${a}`, [a]), command(`prepare ${b} ${c}`, [a], 0)]);
    add('same-skill', 'prepare', 200, [command(`prepare ${a} ${a}`, [], 0)]);
    add('repeat-one', 'prepare', 200, [command(`prepare ${a}`, [a]), command(`prepare ${a}`, [a], 0)]);
    add('incompatible', 'prepare', 200, [command(`prepare huzhua-shou ${a}`, [], 0)]);
    add('wrong-type', 'prepare', 200, [command('prepare sword', [], 0)]);
    add('unlearned', 'prepare', 200, [command(`prepare ${a} ${b}`, [], 0)], { skills: { [b]: 0 } });
    add('unmapped', 'prepare', 200, [command(`prepare ${a} ${b}`, [], 0)], { unmapped: ['unarmed', 'strike'] });
    add('cancel-empty', 'prepare', 200, [command('prepare none', [], 0)]);
    add('no-minimum', 'prepare', 1, [command(`prepare ${a} ${b}`, [a, b])]);
    add('armed-prepare', 'prepare', 200, [command(`prepare ${a} ${b}`, [a, b])], { armed: true });
    const profiles = [[], ...names.map(s => [s]), [a, b], [a, c], [b, c]];
    for (const level of [200, 400, 800]) for (const selected of profiles) for (const jiali of [0, 50])
        add(`${selected.join('-') || 'unprepared'}-jiali${jiali}`, 'round', level,
            selected.length ? [command('prepare ' + selected.join(' '), selected)] : [], { jiali });
    add('cancel-round', 'round', 400, [command(`prepare ${a} ${b}`, [a, b]), command('prepare none', [])]);
    add('armed-round', 'round', 400, [command(`prepare ${a} ${b}`, [a, b])], { armed: true });
    add('busy-target-round', 'round', 400, [command(`prepare ${a} ${b}`, [a, b])], { targetBusy: true });
    // Effective dex 8 without negative attributes or overriding query_dex.
    add('dex8-round', 'round', 400, [command(`prepare ${a} ${b}`, [a, b])], { dex: 8, skills: { dodge: 0 } });
    return result;
}

export function validateWudangCombinationRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(raw.outcome, p.expected);
    assert.equal(raw.launches.length, 0);
    assert.deepEqual(raw.before[0].preparations, {});
    assert.equal(raw.before[0].temp.action_flag ?? 0, 0);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1);
        assert.deepEqual(raw.interfaces[0], { ...p.interface, result: p.combine_result });
        assert.equal(raw.attacks.length, 0); return;
    }
    assert.equal(raw.interfaces.length, 0);
    assert.equal(raw.prepare_steps.length, p.prepare_commands.length);
    let previous = raw.before[0];
    for (let n = 0; n < raw.prepare_steps.length; n++) {
        const s = raw.prepare_steps[n], e = p.prepare_commands[n];
        assert.equal(s.action, e.action); assert.equal(s.accepted, e.accepted);
        assert.deepEqual(s.before, previous, '准备链不能重置状态');
        assert.deepEqual(s.after.preparations, e.preparations);
        const a = structuredClone(s.before), b = structuredClone(s.after);
        for (const state of [a, b]) { delete state.preparations; delete state.preparation_order; delete state.temp.notify_fail; }
        assert.deepEqual(b, a, '准备不得改写技能、映射、装备或资源');
        if (!s.accepted) assert.ok(s.reason);
        previous = s.after;
    }
    assert.deepEqual(raw.immediate[0].preparations, previous.preparations);
    if (condition.method === 'prepare') {
        assert.equal(raw.attacks.length, 0);
        assert.deepEqual(raw.immediate[0], previous); return;
    }
    const hits = raw.attacks.filter(a => a.actor === 0 && a.target === 1);
    assert.ok(hits.length <= 2, '一次原fight可守势零击，或出一至两击');
    assert.equal(raw.immediate[0].temp.guarding, hits.length ? 0 : 1, '零出招须有原守势状态');
    if (p.target.busy) assert.ok(hits.length > 0, '忙乱目标分支直接出招');
    const order = previous.preparation_order, armed = !!p.actor.equipment;
    const eligible = order.length === 2 && !armed;
    if (!eligible || p.combination === 'dex8-round') assert.ok(hits.length <= 1);
    for (const [index, hit] of hits.entries()) {
        const usage = armed ? 'sword' : order.length ? order[index] : 'unarmed';
        assert.equal(hit.action_flag ?? 0, index);
        assert.equal(hit.attack_usage, usage);
        assert.equal(hit.attack_skill || null, p.actor.mappings[usage] ?? null);
        assert.equal(hit.type, p.target.busy ? 2 : 0);
        assert.ok([0, -1, -2].includes(hit.result));
    }
    assert.equal(raw.immediate[0].temp.action_flag ?? 0, 0, '原攻击轮归还选招标志');
    assert.equal(raw.before[0].temp.combat_time ?? 0, 0, '本批不混入长期太极蓄力');
    // Original do_attack delegates enforcement to the mapped force's hit_ob;
    // this neutral preparation experiment deliberately has no force mapping.
    assert.equal(raw.metrics[0].neili_cost ?? 0, 0, '未激发特殊内功，本批加力不扣内力');
    assert.equal(raw.immediate[0].neili, raw.before[0].neili);
}
