// Original player perform window; experimental grant is not natural acquisition.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { panlongMemberSources } from './school_panlong_member_cases.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';

export const panlongTanSources = {
    ...panlongMemberSources,
    'kungfu/skill/panlong-zhao/tan.c': '66b48b19826f7f9ce4068f84ae74999a748d23a38a9ae6253e5a44a110d8f801',
    'cmds/skill/perform.c': '7bb9b93d1ce1bccf5587c942f2d7c30c8f3e1b5cb96c25719e0aef1032d20054',
    'd/zhongzhou/miaojia_shufang.c': 'ea6b85b54508e425fde86877586f49098d875515637db1628753cb64eb73e94f',
};
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 30, int: 36, con: 30, dex: 30, gender: '男性', character: '光明磊落' };
export function panlongTanConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, expected] of Object.entries(panlongTanSources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), expected,
            '盘龙绝招来源改变，须重新审阅：' + path);
    const source = catalog.skills.find(s => s.id === 'panlong-zhao/tan');
    assert.equal(source?.sha256, panlongTanSources['kungfu/skill/panlong-zhao/tan.c']);
    const entry = source.entries.find(e => e.role === 'perform')?.id; assert.ok(entry);
    const result = [];
    function add(suffix, extra = {}) {
        const level = extra.level ?? 200;
        result.push({ id: `school-s1-miao-tan-${suffix}`, stage: 'school', entry_id: entry,
            method: 'perform', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'miao', family: '中原苗家', collection_group: 's1-panlong-tan',
                skill: 'panlong-zhao', ability: 'tan', usage: 'claw', level,
                actor: { skills: { force: 400, 'miaojia-neigong': level, dodge: level, parry: level,
                    sword: 200, claw: level, 'panlong-zhao': level, ...extra.skills },
                    mappings: { force: 'miaojia-neigong', claw: 'panlong-zhao' },
                    preparations: extra.unprepared ? {} : { claw: 'panlong-zhao' },
                    properties: { ...defaults, 'family/family_name': '中原苗家',
                        'can_perform/panlong-zhao/tan': 1, ...extra.properties },
                    ...(extra.equipment ? { equipment: extra.equipment } : {}), ...(extra.busy ? { busy: 2 } : {}) },
                target: { skills: { force: 600, dodge: 600, parry: 600, ...extra.targetSkills },
                    mappings: {}, preparations: {}, properties: { ...defaults } },
                action: 'perform claw.tan right', named_participants: true,
                fighting: extra.fighting ?? true, target_state: extra.unconscious ? 'unconscious' : 'living',
                observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '', not_applicable: '',
                source_evidence: { ...panlongTanSources },
                qualification_sources: [...Object.keys(panlongTanSources), 'inherit/skill/skill.c',
                    'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'feature/equip.c',
                    'feature/action.c', 'feature/attribute.c', 'include/combat.h', 'inherit/char/char.c'],
                qualification_note: '苗人凤原配置映射/互备盘龙爪及冲天掌，原战斗闭包含claw.tan；本批单备盘龙爪，真实非巫师USER走原perform命令。领悟和修为为实验初态，不证明拜师、授课或书房canwu取得；苗人凤询问只提示书房并非授招。200/400/800和加力0/50分列，目标中性高资源。副手是真实测试剑诊断初态，主手经原wield；原绝招只检查主手，副手单持可通过。原unconcious保留准备前后状态。直伤与失手费用、原加力、创伤和忙乱分别核验，不冒充整次交锋。',
            } });
    }
    for (const level of [200, 400, 800]) for (const jiali of [0, 50])
        add(`l${level}-jiali${jiali}`, { level, properties: { jiali } });
    for (const level of [129, 130]) add('gate-level' + level, { skills: { 'panlong-zhao': level }, checks: 2,
        ...(level < 130 ? { refusal: '你的越空盘龙爪等级不够，难以施展「云中探爪」。\n' } : {}) });
    for (const neili of [199, 200]) add('gate-neili' + neili, { properties: { neili }, checks: 2,
        ...(neili < 200 ? { refusal: '你的真气不够，难以施展「云中探爪」。\n' } : {}) });
    add('no-grant', { properties: { 'can_perform/panlong-zhao/tan': 0 }, checks: 2,
        refusal: '你所使用的外功中没有这种功能。\n' });
    add('not-fighting', { fighting: false, checks: 2, refusal: '「云中探爪」只能在战斗中对对手使用。\n' });
    add('main-weapon', { equipment: { type: 'sword', hold: false }, checks: 2,
        refusal: '你必须空手才能使用「云中探爪」。\n' });
    add('secondary-only', { equipment: { type: 'sword', hold: false, slot: 'secondary_weapon' }, checks: 2 });
    add('unprepared', { unprepared: true, checks: 2, refusal: '你没有准备越空盘龙爪，难以施展「云中探爪」。\n' });
    add('actor-busy', { busy: true, checks: 2, refusal: '( 你上一个动作还没有完成，不能施用外功。)\n' });
    add('unconscious', { unconscious: true, checks: 2, refusal: '对方都已经这样了，用不着这么费力吧？\n' });
    add('high-dp', { targetSkills: { parry: 100000 }, checks: 2 });
    add('low-dp', { targetSkills: { parry: 0 }, checks: 4 });
    return result;
}

const n = v => v ?? 0;
const clean = v => v.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
const plain = state => {
    const v = structuredClone(state);
    if (v.temp) {
        delete v.temp.notify_fail; delete v.temp.fight;
        for (const key of Object.keys(v.temp.apply ?? {})) if (!v.temp.apply[key]) delete v.temp.apply[key];
    }
    return v;
};
export function panlongTanSupport(input, actor, target) {
    assert.equal(n(actor.temp?.apply?.unarmed_damage), 0);
    assert.equal(n(actor.skills.count), 0); assert.equal(n(actor.temp?.str), 0);
    const jiali = actor.jiali > 0 && actor.neili - 150 >= actor.jiali ? actor.jiali : 0;
    return slice2SupportSet(input + Math.trunc(input * jiali / 300), 45, actor, target, 'UNARMED');
}
export function validatePanlongTanRecord(raw, condition) {
    const p = condition.parameters, [b, t] = raw.before, [a, v] = raw.immediate;
    assert.equal(p.collection_group, 's1-panlong-tan'); assert.equal(p.skill, 'panlong-zhao');
    assert.equal(raw.method, 'perform'); assert.equal(raw.outcome, p.expected);
    assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.passives, []);
    assert.deepEqual(raw.interfaces, []);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side];
        for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1);
        assert.equal(state.wizardp, 0); assert.equal(state.ghost, 0);
        assert.deepEqual(state.skills, cfg.skills); assert.deepEqual(state.mappings, cfg.mappings);
        assert.deepEqual(state.preparations, cfg.preparations);
        const initial = side === 1 && p.target_state === 'unconscious' ? raw.preparation?.before : state;
        assert.ok(initial, '原昏迷前配置不可丢弃');
        for (const [key, value] of Object.entries(cfg.properties)) {
            if (key === 'can_perform/panlong-zhao/tan') assert.equal(n(initial.tan_grant), value);
            else assert.equal(key.includes('/') ? initial.cultivation[key] : initial[key], value, '实际配置：' + key);
        }
        assert.equal(n(raw.metrics[side].heartbeats), 0);
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) assert.equal(n(raw.metrics[side][key + '_recovery']), 0);
    }
    assert.equal(b.living, 1);
    assert.equal(b.weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'none' : p.actor.equipment?.type ?? 'none');
    assert.equal(b.secondary_weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none');
    if (b.secondary_weapon !== 'none') assert.equal(b.secondary_weapon_details.program, '/tests/sword');
    if (p.target_state === 'unconscious') {
        assert.equal(t.living, 0); assert.equal(t.qi, 0); assert.equal(t.jing, 0);
        assert.equal(raw.preparation.before.living, 1); assert.deepEqual(raw.preparation.after, t);
        assert.deepEqual(raw.preparation.terminals, [{ side: 1, state: 'unconscious' }]);
    } else assert.equal(t.living, 1);
    if (p.expected === 'refused') {
        assert.equal(raw.command_accepted, 0); assert.equal(clean(raw.reason), p.refusal);
        assert.equal(raw.refusals.length, 1); assert.equal(raw.refusals[0].actor, b.object);
        assert.equal(clean(raw.refusals[0].reason), p.refusal);
        assert.deepEqual(raw.launches, []); assert.deepEqual(raw.directs, []);
        assert.deepEqual(plain(a), plain(b)); assert.deepEqual(v, t); return;
    }
    assert.equal(raw.command_accepted, 1); assert.deepEqual(raw.refusals, []); assert.equal(raw.reason, '');
    assert.equal(n(b.tan_grant), 1); assert.equal(n(b.busy), 0); assert.equal(b.weapon, 'none');
    assert.ok(p.fighting && t.living && b.skills['panlong-zhao'] >= 130 && b.neili >= 200);
    assert.equal(b.mappings.claw, 'panlong-zhao'); assert.equal(b.preparations.claw, 'panlong-zhao');
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].actor, b.object);
    assert.equal(raw.launches[0].skill, 'panlong-zhao'); assert.equal(raw.launches[0].argument, 'tan right');
    assert.ok(raw.directs.length <= 1); const hit = raw.directs.length === 1;
    const ap = b.effective_skills.claw, dp = t.effective_skills.parry;
    assert.equal(Number.isSafeInteger(ap) && ap > 0, true); assert.equal(Number.isSafeInteger(dp) && dp >= 0, true);
    assert.ok(hit ? Math.trunc(ap / 2) + ap - 1 > dp : Math.trunc(ap / 2) <= dp, '原判定支持所观察分支');
    const expected = plain(b), target = plain(t); let fee = hit ? 150 : 50;
    if (hit) {
        const call = raw.directs[0], part = Math.trunc(ap / 3);
        assert.equal(call.actor, 0); assert.equal(call.target, 1); assert.equal(call.type, 0); assert.equal(call.percent, 45);
        assert.ok(Number.isInteger(call.damage) && call.damage >= 60 + part && call.damage < 60 + part * 2);
        assert.ok(panlongTanSupport(call.damage, b, t).some(s => s.qi === v.qi && s.eff_qi === v.eff_qi),
            '原直伤的加力/属性/护甲/性格/创伤支持集');
        if (b.jiali > 0 && b.neili - 150 >= b.jiali) fee += b.jiali;
        target.qi = v.qi; target.eff_qi = v.eff_qi;
    }
    assert.equal(a.busy, hit ? 1 : 3); assert.equal(n(raw.metrics[0].direct), Number(hit));
    assert.equal(n(raw.metrics[0].neili_cost), fee); expected.neili -= fee; expected.busy = a.busy;
    assert.equal(n(raw.metrics[1].qi_cost), t.qi - v.qi); assert.equal(n(raw.metrics[1].eff_qi_cost), t.eff_qi - v.eff_qi);
    for (const [key, value] of Object.entries(a.learned ?? {})) {
        assert.equal(key, 'panlong-zhao'); assert.ok([0, 1].includes(n(value)));
    }
    expected.learned = structuredClone(a.learned ?? {});
    assert.deepEqual(plain(a), expected); assert.deepEqual(plain(v), target);
}
