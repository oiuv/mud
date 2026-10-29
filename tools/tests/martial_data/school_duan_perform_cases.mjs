// Two actual Duan perform entries, independent of prior member/combination series.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { duanMemberReviewedSources } from './school_duan_member_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

export const duanPerformSources = {
    ...duanMemberReviewedSources,
    'kungfu/skill/jinyu-quan/man.c': '8e729f08e17e18035cde4d0182e6a9eb8d6488a37eae792c4126c486cae8ef64',
    'kungfu/skill/wuluo-zhang/bian.c': 'b89397f3f07a1e15d115ca8ea1958458d09049645a330b7ce915ed0c830fb156',
    'kungfu/skill/duanshi-xinfa.c': '1b2fdc69e12934d5db97f25c519b32f2b1fdb75fdc342b70173616db3b4fdfb3',
    'inherit/skill/force.c': '36735e9c04ed4f67007ad53e0f155d84323aa6e7acab77eb80e00586cd600d69',
    'adm/daemons/combatd.c': '9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6',
    'cmds/skill/perform.c': '7bb9b93d1ce1bccf5587c942f2d7c30c8f3e1b5cb96c25719e0aef1032d20054',
};
const moves = {
    'jinyu-quan': { ability: 'man', usage: 'cuff', level: 80, neili: 200, title: '「金玉满堂」',
        lowLevel: '你的金玉拳法不够娴熟，难以施展「金玉满堂」。\n',
        lowNeili: '你现在的真气不够，难以施展「金玉满堂」。\n',
        unprepared: '你没有准备金玉拳法，难以施展「金玉满堂」。\n' },
    'wuluo-zhang': { ability: 'bian', usage: 'strike', level: 100, neili: 100, title: '「风云变幻」',
        lowLevel: '你五罗轻烟掌不够娴熟，难以施展「风云变幻」。\n',
        lowNeili: '你现在真气不足，难以施展「风云变幻」。\n',
        unprepared: '你没有准备五罗轻烟掌，难以施展「风云变幻」。\n' },
};
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    combat_exp: 100000000, str: 30, int: 36, con: 30, dex: 30, gender: '男性', character: '光明磊落' };

export function duanPerformConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, expected] of Object.entries(duanPerformSources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), expected,
            '段氏绝招来源改变，须重新审阅：' + path);
    const result = [];
    for (const [skill, cfg] of Object.entries(moves)) {
        const ability = catalog.skills.find(s => s.id === `${skill}/${cfg.ability}`);
        assert.equal(ability?.sha256, duanPerformSources[`kungfu/skill/${skill}/${cfg.ability}.c`]);
        const entry = ability?.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry, '缺少真实绝招入口');
        const grant = `can_perform/${skill}/${cfg.ability}`;
        function add(suffix, extra = {}) {
            const level = extra.level ?? 200;
            result.push({ id: `school-s1-duan-perform-${skill}-${cfg.ability}-${suffix}`,
                stage: 'school', entry_id: entry, method: 'perform',
                samples: smoke ? 2 : extra.checks ?? samples,
                parameters: { school: 'duan', family: '段氏皇族', collection_group: 's1-duan-perform',
                    skill, ability: cfg.ability, usage: cfg.usage, level,
                    actor: { skills: { force: 400, 'duanshi-xinfa': level, dodge: level, parry: level,
                        sword: 200, [cfg.usage]: level, [skill]: level, ...extra.skills },
                        mappings: { force: 'duanshi-xinfa', [cfg.usage]: skill },
                        preparations: extra.unprepared ? {} : { [cfg.usage]: skill },
                        properties: { ...defaults, 'family/family_name': '段氏皇族', [grant]: 1, ...extra.properties },
                        ...(extra.equipment ? { equipment: extra.equipment } : {}),
                        ...(extra.busy ? { busy: 2 } : {}) },
                    target: { skills: { force: 600, dodge: 600, parry: 600, ...extra.targetSkills },
                        mappings: {}, preparations: {}, properties: { ...defaults } },
                    action: `perform ${cfg.usage}.${cfg.ability} right`, named_participants: true,
                    fighting: extra.fighting ?? true, target_state: extra.unconscious ? 'unconscious' : 'living',
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                    not_applicable: '', source_evidence: { ...duanPerformSources },
                    qualification_sources: [...Object.keys(duanPerformSources), 'inherit/skill/skill.c',
                        'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'feature/equip.c',
                        'feature/action.c', 'feature/attribute.c', 'include/combat.h', 'inherit/char/char.c'],
                    qualification_note: '巴天石原闭包引用man/bian；本批使用真实非巫师USER经原perform命令，不以NPC豁免代替玩家资格。修为、门派及领悟是显式实验赋值，不证明实际传授。单备两成员分别测试，基本内功400并激发同档段氏心法，零/50加力分列；目标固定中性高资源，不做胜率/同成本排名。主手经原wield，副手单持为真实测试剑的诊断初态；非存活经原unconcious。即时窗口记录原忙乱和撤回增益，不声称完整交锋或自然解除。',
                } });
        }
        for (const level of [200, 400, 800]) for (const jiali of [0, 50])
            add(`l${level}-jiali${jiali}`, { level, properties: { jiali } });
        for (const level of [cfg.level - 1, cfg.level]) add('gate-level' + level,
            { skills: { [skill]: level }, checks: 2, ...(level < cfg.level ? { refusal: cfg.lowLevel } : {}) });
        for (const neili of [cfg.neili - 1, cfg.neili]) add('gate-neili' + neili,
            { properties: { neili }, checks: 2, ...(neili < cfg.neili ? { refusal: cfg.lowNeili } : {}) });
        add('no-grant', { properties: { [grant]: 0 }, checks: 2, refusal: '你所使用的外功中没有这种功能。\n' });
        add('not-fighting', { fighting: false, checks: 2, refusal: cfg.title + '只能对战斗中的对手使用。\n' });
        add('main-weapon', { equipment: { type: 'sword', hold: false }, checks: 2,
            refusal: cfg.title + '只能空手施展。\n' });
        add('secondary-only', { equipment: { type: 'sword', hold: false, slot: 'secondary_weapon' }, checks: 2,
            ...(skill === 'jinyu-quan' ? { refusal: cfg.title + '只能空手施展。\n' } : {}) });
        add('unprepared', { unprepared: true, checks: 2, refusal: cfg.unprepared });
        add('actor-busy', { busy: true, checks: 2, refusal: '( 你上一个动作还没有完成，不能施用外功。)\n' });
        add('unconscious', { unconscious: true, checks: 2, refusal: '对方都已经这样了，用不着这么费力吧？\n' });
        const dp = skill === 'jinyu-quan' ? 'dodge' : 'force';
        add('high-dp', { targetSkills: { [dp]: 100000 }, checks: 2 });
        add('low-dp', { targetSkills: { [dp]: 0 }, checks: 4 });
    }
    return result;
}

const n = v => v ?? 0;
const plain = v => {
    const state = structuredClone(v);
    if (state.temp) {
        delete state.temp.notify_fail;
        delete state.temp.fight;
        for (const key of Object.keys(state.temp.apply ?? {})) if (!state.temp.apply[key]) delete state.temp.apply[key];
    }
    return state;
};
const clean = text => text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
export function duanManSupport(input, actor, target) {
    assert.equal(n(actor.temp?.apply?.unarmed_damage), 0);
    assert.equal(n(actor.skills.count), 0); assert.equal(n(actor.temp?.str), 0);
    const jiali = actor.jiali > 0 && actor.neili - 150 >= actor.jiali ? actor.jiali : 0;
    // do_damage adds jiali before strength/int/caps; this fixed UNARMED profile has no other adjustment.
    return slice2SupportSet(input + Math.trunc(input * jiali / 300), 45, actor, target, 'UNARMED');
}

export function validateDuanPerformRecord(raw, condition) {
    const p = condition.parameters, cfg = moves[p.skill], [b, t] = raw.before, [a, v] = raw.immediate;
    assert.ok(cfg); assert.equal(p.collection_group, 's1-duan-perform');
    assert.equal(raw.method, 'perform'); assert.equal(raw.outcome, p.expected);
    assert.deepEqual(raw.after, raw.immediate);
    for (const [side, configured] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side];
        for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1);
        assert.equal(state.wizardp, 0);
        assert.deepEqual(state.skills, configured.skills);
        assert.deepEqual(state.mappings, configured.mappings);
        assert.deepEqual(state.preparations, configured.preparations);
        const configuredState = side === 1 && p.target_state === 'unconscious'
            ? raw.preparation?.before : state;
        assert.ok(configuredState, '必须保留原昏迷前的实际配置快照');
        for (const key of ['qi', 'jing', 'eff_qi', 'neili', 'max_neili', 'jiali', 'str', 'int', 'con', 'dex', 'combat_exp'])
            assert.equal(configuredState[key], configured.properties[key]);
        assert.equal(state.character, '光明磊落');
        assert.equal(n(raw.metrics[side].heartbeats), 0);
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) assert.equal(n(raw.metrics[side][key + '_recovery']), 0);
    }
    assert.ok(Object.hasOwn(b.duan_grants ?? {}, cfg.ability));
    assert.equal(b.cultivation['family/family_name'], '段氏皇族');
    assert.equal(n(b.duan_grants[cfg.ability]), p.actor.properties[`can_perform/${p.skill}/${cfg.ability}`]);
    assert.equal(b.weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'none' : p.actor.equipment?.type ?? 'none');
    if (p.actor.equipment?.slot === 'secondary_weapon') {
        assert.equal(b.secondary_weapon, 'sword'); assert.equal(b.secondary_weapon_details.program, '/tests/sword');
    }
    if (p.target_state === 'unconscious') {
        assert.equal(raw.preparation?.after.living, 0); assert.equal(t.living, 0); assert.equal(t.ghost, 0);
        assert.equal(raw.preparation.before.living, 1);
        assert.equal(t.qi, 0); assert.equal(t.jing, 0);
        assert.deepEqual(raw.preparation.terminals, [{ side: 1, state: 'unconscious' }]);
        assert.deepEqual(raw.preparation.after, t);
    }
    if (p.expected === 'refused') {
        assert.equal(raw.command_accepted, 0);
        assert.equal(clean(raw.reason), p.refusal);
        assert.equal(raw.refusals.length, 1);
        assert.equal(raw.refusals[0].actor, b.object);
        assert.equal(clean(raw.refusals[0].reason), p.refusal);
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.directs, []);
        assert.deepEqual(raw.passives, []);
        assert.deepEqual(plain(a), plain(b)); assert.deepEqual(v, t);
        return;
    }
    assert.equal(raw.command_accepted, 1);
    assert.equal(n(b.duan_grants[cfg.ability]), 1); assert.equal(n(b.busy), 0);
    assert.equal(b.weapon, 'none');
    if (cfg.ability === 'man') assert.equal(b.secondary_weapon, 'none');
    assert.ok(p.fighting && t.living && b.skills[p.skill] >= cfg.level && b.neili >= cfg.neili);
    assert.equal(b.mappings[cfg.usage], p.skill); assert.equal(b.preparations[cfg.usage], p.skill);
    assert.equal(raw.launches.length, 1);
    assert.equal(raw.launches[0].actor, b.object);
    assert.equal(raw.launches[0].skill, p.skill); assert.equal(raw.launches[0].argument, cfg.ability + ' right');
    assert.equal(raw.reason, '');
    const expected = plain(b), target = plain(t);
    const learned = a.learned ?? {};
    for (const [key, value] of Object.entries(learned)) {
        assert.equal(key, p.skill); assert.ok([0, 1].includes(n(value)));
    }
    expected.learned = structuredClone(learned);
    expected.busy = a.busy; target.qi = v.qi; target.eff_qi = v.eff_qi;
    if (cfg.ability === 'man') {
        assert.deepEqual(raw.passives, []);
        assert.equal(raw.attacks.length, 0); assert.ok(raw.directs.length <= 1);
        const hit = raw.directs.length === 1;
        let fee = hit ? 150 : 50;
        if (hit) {
            const call = raw.directs[0], eff = b.effective_skills.cuff;
            assert.ok(eff - 1 > Math.trunc(t.effective_skills.dodge / 2), '原随机上界必须能超过目标轻功');
            assert.equal(call.actor, 0); assert.equal(call.target, 1); assert.equal(call.type, 0); assert.equal(call.percent, 45);
            assert.ok(Number.isInteger(call.damage) && call.damage >= Math.trunc(eff / 2)
                && call.damage < Math.trunc(eff / 2) * 2);
            assert.ok(duanManSupport(call.damage, b, t).some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
                '原直伤、加力、属性及创伤支持集');
            if (b.jiali > 0 && b.neili - 150 >= b.jiali) fee += b.jiali;
        } else assert.deepEqual(plain(v), plain(t));
        assert.equal(a.busy, hit ? 2 : 3);
        assert.equal(n(raw.metrics[0].direct), Number(hit));
        assert.equal(n(raw.metrics[0].neili_cost), fee); expected.neili -= fee;
    } else {
        assert.deepEqual(raw.directs, []); assert.equal(n(raw.metrics[0].direct), 0);
        assert.equal(raw.attacks.length, 5);
        const bonus = n(raw.attacks[0].apply_attack) - n(b.temp?.apply?.attack);
        assert.ok(bonus === 0 || bonus === Math.trunc(b.skills[p.skill] / 10));
        if (p.target.skills.force >= 100000) assert.equal(bonus, 0);
        for (const attack of raw.attacks) {
            assert.equal(attack.actor, 0); assert.equal(attack.target, 1); assert.equal(attack.type, 0);
            assert.equal(attack.attack_skill, p.skill); assert.equal(attack.attack_usage, cfg.usage);
            assert.equal(n(attack.apply_attack), n(b.temp?.apply?.attack) + bonus);
            assert.equal(n(attack.apply_unarmed_damage), n(b.temp?.apply?.unarmed_damage) + Math.trunc(bonus / 2));
        }
        const calls = raw.passives.filter(e => e.route === 'force');
        const martial = raw.passives.filter(e => e.route === 'martial');
        const hits = raw.attacks.filter(e => e.result === 0).length;
        const count = b.jiali ? Math.min(hits, Math.max(0, Math.trunc((b.neili - 51) / b.jiali))) : 0;
        assert.equal(calls.length, count);
        assert.equal(martial.length, hits);
        assert.equal(raw.passives.length, calls.length + martial.length);
        for (const call of calls) {
            assert.equal(call.skill, 'duanshi-xinfa'); assert.equal(call.factor, b.jiali);
            assert.equal(call.actor, 0); assert.equal(call.target, 1);
        }
        for (const call of martial) {
            assert.equal(call.skill, 'wuluo-zhang'); assert.equal(call.actor, 0); assert.equal(call.target, 1);
            assert.equal(call.factor, 0); assert.equal(n(call.result), 0);
            assert.ok(Number.isInteger(call.incoming) && call.incoming >= 0);
        }
        const fee = 50 + count * b.jiali;
        assert.equal(n(raw.metrics[0].neili_cost), fee); expected.neili -= fee;
        assert.ok(a.busy >= 1 && a.busy <= 5);
        assert.equal(n(raw.metrics[1].qi_cost), raw.attacks.reduce((sum, e) => sum + e.damage, 0));
        assert.ok(n(raw.metrics[1].eff_qi_cost) >= 0 && n(raw.metrics[1].eff_qi_cost) <= n(raw.metrics[1].qi_cost));
    }
    assert.deepEqual(plain(a), plain(expected), '原施展结束须撤回临时增益且无其它状态改写');
    assert.deepEqual(plain(v), plain(target));
}
