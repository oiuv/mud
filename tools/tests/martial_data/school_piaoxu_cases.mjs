// Source-declared Lingxiao combination member. No teaching/acquisition is inferred.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const piaoxuReviewedSources = {
    'kungfu/skill/piaoxu-zhang.c': 'efc32a4a49b5be6262425d46fecf199dc96fbd844c300944eefe975040d27c34',
    'kungfu/skill/piaoxu-zhang/piao.c': 'f96db4dbca8d026d0c575dc5dd234278f640dcfad26d841c54650a96e4a920e6',
    'kungfu/skill/xueshan-neigong.c': '7b966247829b58933bb622b5c2116b263a39b9b1f2cc4f47ce862d7c8828285b',
    'kungfu/class/lingxiao/huawanzi.c': '72e0b158dacdd7f5523c291d7b727be9c300f61bf81120294844ad1e489d8b37',
    'kungfu/class/lingxiao/baiwanjian.c': '833d7ba38c591345bb5e1f081aeb6882a70a23253c62891fd2f48e6879b67e85',
    'inherit/skill/force.c': '36735e9c04ed4f67007ad53e0f155d84323aa6e7acab77eb80e00586cd600d69',
    'adm/daemons/combatd.c': '9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6',
    'cmds/skill/perform.c': '7bb9b93d1ce1bccf5587c942f2d7c30c8f3e1b5cb96c25719e0aef1032d20054',
};
const skill = 'piaoxu-zhang', grant = 'can_perform/piaoxu-zhang/piao';
const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    combat_exp: 100000000, str: 30, int: 36, con: 30, dex: 30, gender: '男性', character: '光明磊落' };
const title = '「飞絮飘零」';

export function piaoxuConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, expected] of Object.entries(piaoxuReviewedSources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), expected,
            '飘絮来源改变，须重新审阅：' + path);
    const source = catalog.skills.find(s => s.id === skill);
    const perform = catalog.skills.find(s => s.id === skill + '/piao')?.entries.find(e => e.role === 'perform');
    assert.ok(source && perform);
    const result = [];
    function add(ability, suffix, extra = {}) {
        const level = extra.level ?? 200, combat = ['ordinary', 'piao'].includes(ability);
        const entry = ability === 'ordinary' ? source.path : ability === 'piao' ? perform.id
            : source.entries.find(e => e.function === ability)?.id;
        assert.ok(entry, '缺少真实飘絮入口：' + ability);
        result.push({ id: `school-s1-piaoxu-${ability}-${suffix}`, stage: 'school', entry_id: entry,
            method: ability === 'ordinary' ? 'ordinary' : ability === 'piao' ? 'perform' : 'interface',
            samples: smoke ? 2 : extra.checks ?? (combat ? samples : 2),
            parameters: { school: 'lingxiao', family: '凌霄城', collection_group: 's1-piaoxu',
                skill, usage: 'strike', ability, level,
                actor: { skills: { force: 400, dodge: level, parry: level, sword: 200,
                    strike: level, [skill]: level, ...(combat ? { 'xueshan-neigong': level } : {}), ...extra.skills },
                    mappings: combat ? { strike: skill, force: 'xueshan-neigong' } : {},
                    preparations: combat && !extra.unprepared ? { strike: skill } : {},
                    properties: { ...properties, 'family/family_name': '凌霄城', [grant]: 1, ...extra.properties },
                    ...(extra.equipment ? { equipment: extra.equipment } : {}),
                    ...(extra.busy ? { busy: 2 } : {}) },
                target: { skills: { force: 600, dodge: 600, parry: 600, ...extra.targetSkills },
                    mappings: {}, preparations: {}, properties: { ...properties } },
                action: ability === 'ordinary' ? 'ordinary' : ability === 'piao' ? 'perform strike.piao right' : 'test_interface',
                named_participants: true, fighting: extra.fighting ?? combat,
                target_state: extra.unconscious ? 'unconscious' : 'living',
                observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                expected_result: extra.value ?? 1, not_applicable: '',
                ...(!combat ? { interface: { object: '/kungfu/skill/' + skill, function: ability,
                    ...(extra.argument ? { argument: extra.argument } : {}),
                    ...(extra.combo ? { combo: extra.combo } : {}) } } : {}),
                source_evidence: { ...piaoxuReviewedSources },
                qualification_sources: [...Object.keys(piaoxuReviewedSources), 'inherit/skill/skill.c',
                    'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'feature/equip.c',
                    'feature/action.c', 'feature/attribute.c', 'include/combat.h', 'inherit/char/char.c'],
                qualification_note: '花万紫原配置互备飘絮掌/凌霄拳并激发雪山内功；此处拆成飘絮独立窗口，不冒充原NPC完整配装。真实非巫师USER、基本内功400、同档雪山内功、三档修为与加力0/50分列；学习接口不激发基本功。玩家门派/领悟/修为是实验初态，不证明白万剑传授或实际养成。主手经原wield，副手为实际剑的诊断初态；非存活经原unconcious。原piao三击仅攻击加成，不套五罗效果；即时忙乱不是自然解除或完整交锋。',
            } });
    }
    for (const level of [200, 400, 800]) for (const jiali of [0, 50])
        add('ordinary', `l${level}-jiali${jiali}`, { level, properties: { jiali } });
    for (const argument of ['strike', 'parry', 'sword'])
        add('valid_enable', argument, { argument, value: Number(argument !== 'sword') });
    for (const combo of ['lingxiao-quan', 'jinyu-quan'])
        add('valid_combine', combo, { combo, value: Number(combo === 'lingxiao-quan') });
    add('valid_learn', 'baseline');
    for (const force of [29, 30]) add('valid_learn', 'force' + force,
        { skills: { force: force * 2 }, ...(force < 30 ? { value: 0,
            refusal: '你的内功火候不够，无法学飘絮掌法。\n' } : {}) });
    for (const max_neili of [99, 100]) add('valid_learn', 'max-neili' + max_neili,
        { properties: { max_neili }, ...(max_neili < 100 ? { value: 0,
            refusal: '你的内力太弱，无法练飘絮掌法。\n' } : {}) });
    for (const strike of [19, 20]) add('valid_learn', 'minimum-basic' + strike,
        { skills: { strike, [skill]: 20 }, ...(strike < 20 ? { value: 0,
            refusal: '你的基本掌法火候太浅。\n' } : {}) });
    for (const strike of [199, 200]) add('valid_learn', 'basic' + strike,
        { skills: { strike }, ...(strike < 200 ? { value: 0,
            refusal: '你的基本掌法水平有限，无法领会更高深的飘絮掌法。\n' } : {}) });
    for (const slot of ['weapon', 'secondary_weapon']) add('valid_learn', slot,
        { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
            value: 0, refusal: '练飘絮掌法必须空手。\n' });
    add('practice_skill', 'baseline');
    for (const qi of [59, 60]) add('practice_skill', 'qi' + qi, { properties: { qi },
        ...(qi < 60 ? { value: 0, refusal: '你的体力太低了。\n' } : {}) });
    for (const neili of [49, 50]) add('practice_skill', 'neili' + neili, { properties: { neili },
        ...(neili < 50 ? { value: 0, refusal: '你的内力不够练飘絮掌法。\n' } : {}) });
    for (const level of [200, 400, 800]) for (const jiali of [0, 50])
        add('piao', `l${level}-jiali${jiali}`, { level, properties: { jiali } });
    for (const level of [79, 80]) add('piao', 'gate-level' + level, { skills: { [skill]: level }, checks: 2,
        ...(level < 80 ? { refusal: '你飘絮掌法不够娴熟，难以施展' + title + '。\n' } : {}) });
    for (const neili of [99, 100]) add('piao', 'gate-neili' + neili, { properties: { neili }, checks: 2,
        ...(neili < 100 ? { refusal: '你现在真气不足，难以施展' + title + '。\n' } : {}) });
    add('piao', 'no-grant', { properties: { [grant]: 0 }, checks: 2, refusal: '你所使用的外功中没有这种功能。\n' });
    add('piao', 'not-fighting', { fighting: false, checks: 2, refusal: title + '只能对战斗中的对手使用。\n' });
    add('piao', 'main-weapon', { equipment: { type: 'sword', hold: false }, checks: 2,
        refusal: title + '只能空手施展。\n' });
    add('piao', 'secondary-only', { equipment: { type: 'sword', hold: false, slot: 'secondary_weapon' }, checks: 2 });
    add('piao', 'unprepared', { unprepared: true, checks: 2, refusal: '你没有准备飘絮掌法，难以施展' + title + '。\n' });
    add('piao', 'actor-busy', { busy: true, checks: 2, refusal: '( 你上一个动作还没有完成，不能施用外功。)\n' });
    add('piao', 'unconscious', { unconscious: true, checks: 2, refusal: '对方都已经这样了，用不着这么费力吧？\n' });
    add('piao', 'high-dp', { targetSkills: { force: 100000 }, checks: 2 });
    add('piao', 'low-dp', { targetSkills: { force: 0 }, checks: 4 });
    return result;
}

const n = v => v ?? 0;
const plain = state => {
    const v = structuredClone(state);
    if (v.temp) {
        delete v.temp.notify_fail; delete v.temp.fight;
        for (const key of Object.keys(v.temp.apply ?? {})) if (!v.temp.apply[key]) delete v.temp.apply[key];
    }
    return v;
};
const clean = v => v.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
export function validatePiaoxuRecord(raw, condition) {
    const p = condition.parameters, [b, t] = raw.before, [a, v] = raw.immediate;
    assert.equal(p.collection_group, 's1-piaoxu'); assert.equal(p.skill, skill);
    assert.equal(raw.method, condition.method); assert.equal(raw.outcome, p.expected);
    assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.directs, []);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side];
        for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1);
        assert.equal(state.wizardp, 0); assert.deepEqual(state.skills, cfg.skills);
        assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.preparations, cfg.preparations);
        const initial = side === 1 && p.target_state === 'unconscious' ? raw.preparation?.before : state;
        assert.ok(initial, '原生昏迷须保留前快照');
        for (const key of ['qi', 'jing', 'eff_qi', 'neili', 'max_neili', 'jiali', 'str', 'int', 'con', 'dex', 'combat_exp'])
            assert.equal(initial[key], cfg.properties[key]);
        assert.equal(state.character, '光明磊落');
        assert.equal(n(raw.metrics[side].heartbeats), 0);
        for (const r of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) assert.equal(n(raw.metrics[side][r + '_recovery']), 0);
    }
    assert.equal(b.cultivation['family/family_name'], '凌霄城');
    assert.ok(Object.hasOwn(b, 'piao_grant')); assert.equal(n(b.piao_grant), p.actor.properties[grant]);
    assert.equal(b.weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'none' : p.actor.equipment?.type ?? 'none');
    if (p.actor.equipment?.slot === 'secondary_weapon') {
        assert.equal(b.secondary_weapon, 'sword'); assert.equal(b.secondary_weapon_details.program, '/tests/sword');
    } else assert.equal(b.secondary_weapon, 'none');
    if (p.target_state === 'unconscious') {
        assert.equal(raw.preparation.before.living, 1); assert.equal(t.living, 0); assert.equal(t.ghost, 0);
        assert.equal(t.qi, 0); assert.equal(t.jing, 0); assert.deepEqual(raw.preparation.after, t);
        assert.deepEqual(raw.preparation.terminals, [{ side: 1, state: 'unconscious' }]);
    }
    const expected = plain(b), target = plain(t);
    if (condition.method === 'interface') {
        assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.launches, []); assert.deepEqual(raw.passives, []);
        assert.equal(raw.interfaces.length, 1); const call = raw.interfaces[0];
        assert.equal(call.object, p.interface.object); assert.equal(call.function, p.ability);
        let permitted;
        if (p.ability === 'valid_enable') {
            assert.equal(call.argument, p.interface.argument); permitted = ['strike', 'parry'].includes(call.argument);
        } else if (p.ability === 'valid_combine') {
            assert.equal(call.combo, p.interface.combo); permitted = call.combo === 'lingxiao-quan';
        } else if (p.ability === 'valid_learn') permitted = b.weapon === 'none' && b.secondary_weapon === 'none'
            && b.effective_skills.force >= 30 && b.max_neili >= 100
            && b.skills.strike >= 20 && b.skills.strike >= b.skills[skill];
        else { assert.equal(p.ability, 'practice_skill'); permitted = b.qi >= 60 && b.neili >= 50; }
        assert.equal(p.expected_result, Number(permitted)); assert.equal(call.result, Number(permitted));
        if (p.expected === 'refused') assert.equal(clean(raw.reason), p.refusal);
        if (p.ability === 'practice_skill' && permitted) {
            expected.qi -= 45; expected.neili -= 25;
            assert.equal(raw.metrics[0].qi_cost, 45); assert.equal(raw.metrics[0].neili_cost, 25);
        }
    } else if (p.expected === 'refused') {
        assert.equal(raw.command_accepted, 0); assert.equal(clean(raw.reason), p.refusal);
        assert.equal(raw.refusals.length, 1); assert.equal(raw.refusals[0].actor, b.object);
        assert.equal(clean(raw.refusals[0].reason), p.refusal);
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.passives, []);
    } else {
        const isPiao = p.ability === 'piao'; assert.equal(raw.interfaces.length, 0);
        if (isPiao) {
            assert.equal(raw.command_accepted, 1); assert.equal(raw.reason, '');
            assert.ok(n(b.piao_grant) && !n(b.busy) && t.living && p.fighting);
            assert.ok(b.skills[skill] >= 80 && b.neili >= 100); assert.equal(b.weapon, 'none');
            assert.equal(b.mappings.strike, skill); assert.equal(b.preparations.strike, skill);
            assert.equal(raw.launches.length, 1); const launch = raw.launches[0];
            assert.equal(launch.actor, b.object); assert.equal(launch.skill, skill); assert.equal(launch.argument, 'piao right');
            assert.ok(n(a.busy) >= 0 && n(a.busy) <= 2); expected.busy = a.busy;
            for (const [key, value] of Object.entries(a.learned ?? {})) { assert.equal(key, skill); assert.ok([0, 1].includes(n(value))); }
            expected.learned = structuredClone(a.learned);
        } else { assert.equal(p.ability, 'ordinary'); assert.deepEqual(raw.launches, []); }
        assert.equal(raw.attacks.length, isPiao ? 3 : 1);
        const bonus = n(raw.attacks[0].apply_attack) - n(b.temp?.apply?.attack);
        assert.ok(bonus === 0 || (isPiao && bonus === Math.trunc(b.skills[skill] / 5)));
        if (isPiao && p.target.skills.force >= 100000) assert.equal(bonus, 0);
        for (const attack of raw.attacks) {
            assert.equal(attack.actor, 0); assert.equal(attack.target, 1); assert.equal(attack.type, 0);
            assert.ok([0, -1, -2].includes(attack.result));
            assert.equal(attack.attack_skill, skill); assert.equal(attack.attack_usage, 'strike');
            assert.equal(n(attack.apply_attack), n(b.temp?.apply?.attack) + bonus);
            assert.equal(n(attack.apply_unarmed_damage), n(b.temp?.apply?.unarmed_damage));
        }
        const hits = raw.attacks.filter(e => e.result === 0).length, base = isPiao ? 50 : 0;
        const count = b.jiali ? Math.min(hits, Math.max(0, Math.trunc((b.neili - base - 1) / b.jiali))) : 0;
        const force = raw.passives.filter(e => e.route === 'force');
        const martial = raw.passives.filter(e => e.route === 'martial');
        assert.equal(force.length, count); assert.equal(martial.length, hits);
        assert.equal(raw.passives.length, force.length + martial.length, '不忽略其它回调');
        for (const call of force) {
            assert.equal(call.skill, 'xueshan-neigong');
            assert.equal(call.actor, 0); assert.equal(call.target, 1); assert.equal(call.factor, b.jiali);
            assert.ok(Number.isInteger(call.result) && call.result >= 0 && call.result <= 100);
        }
        for (const call of martial) {
            assert.equal(call.skill, skill); assert.equal(call.actor, 0); assert.equal(call.target, 1);
            assert.equal(call.factor, 0); assert.equal(n(call.result), 0);
            assert.ok(Number.isInteger(call.incoming) && call.incoming >= 0);
        }
        const fee = base + count * b.jiali;
        assert.equal(n(raw.metrics[0].neili_cost), fee); expected.neili -= fee;
        assert.equal(n(raw.metrics[1].qi_cost), raw.attacks.reduce((sum, e) => sum + e.damage, 0));
        assert.ok(n(raw.metrics[1].eff_qi_cost) >= 0 && n(raw.metrics[1].eff_qi_cost) <= n(raw.metrics[1].qi_cost));
        target.qi = v.qi; target.eff_qi = v.eff_qi;
    }
    assert.deepEqual(plain(a), expected, '原状态和资源须闭合，临时攻击加成必须撤回');
    assert.deepEqual(plain(v), target);
}
