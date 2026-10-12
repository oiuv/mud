// Original Shaolin finger commands; qualification, control, damage and self-injury are separate.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const shaolinFingers = [
    { skill: 'nianhua-zhi', teacher: 'cheng-jian', abilities: ['fuxue'] },
    { skill: 'yizhi-chan', teacher: 'cheng-zhi2', abilities: ['jingmo'] },
    { skill: 'jingang-zhi', teacher: 'xuan-ci', abilities: ['fumo', 'san'] },
    { skill: 'duoluoye-zhi', teacher: 'xuan-ci', abilities: ['jimie'] },
    { skill: 'wuxiang-zhi', teacher: 'xuan-ci', abilities: ['wuse'] },
    { skill: 'xiuluo-zhi', teacher: 'xuan-ci', abilities: ['jueming'] },
    { skill: 'tianzhu-fuzhi', teacher: 'xuan-ci', abilities: [] },
    { skill: 'qufannao-zhi', teacher: 'cheng-jian', abilities: ['lingkong'] },
];
const requirements = {
    fuxue: { neili: 200, force: 150, effective_finger: 150, armed: true },
    jingmo: { neili: 200, force: 180, raw: 120, armed: true },
    fumo: { neili: 400, force: 200, raw: 150, grant: true, shaolin_force: true },
    san: { neili: 1000, force: 300, raw: 200, grant: true, shaolin_force: true, prepared: true, max_neili: 5000 },
    jimie: { neili: 800, force: 200, raw: 180, max_neili: 2500 },
    wuse: { neili: 400, force: 200, raw: 150 },
    jueming: { neili: 500, force: 150, raw: 100 },
    lingkong: { neili: 300, raw: 100, raw_hunyuan: 100 },
};

export function shaolinFingerConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? d.skill : `${d.skill}/${ability}`));
        assert.ok(source, `缺少指法源码 ${d.skill}/${ability}`);
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry);
        const actor = {
            skills: { finger: level, [d.skill]: level, force: level, 'hunyuan-yiqi': level,
                parry: level, dodge: level, 'shaolin-shenfa': level, buddhism: level,
                'martial-cognize': level, ...(ability === 'san' ? { 'jingluo-xue': level } : {}), ...extra.skills },
            mappings: { finger: d.skill, parry: d.skill, force: 'hunyuan-yiqi', dodge: 'shaolin-shenfa', ...extra.mappings },
            preparations: extra.unprepared ? {} : { finger: d.skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
                shen: 200000, combat_exp: 100000000, 'family/family_name': '少林派',
                ...(method === 'perform' ? { [`can_perform/${d.skill}/${ability}`]: 1 } : {}), ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.unmapped) delete actor.mappings.finger;
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: { ...extra.targetProperties }, equipment: { type: 'sword', hold: false },
            ...(extra.targetBusy ? { busy: 2 } : {}) };
        result.push({ id: `school-shaolin-fingers-${d.skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-fingers',
                combination: `${d.skill}+hunyuan-yiqi`, skill: d.skill, usage: 'finger', ability, level,
                actor, target, fighting: extra.fighting ?? true,
                observation: 'single_action_immediate', observe_seconds: 0,
                action: method === 'ordinary' ? 'ordinary' : `perform finger.${ability}`,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    `kungfu/class/shaolin/${d.teacher}.c`, 'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/shaolin-shenfa.c',
                    'cmds/skill/perform.c', 'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'adm/daemons/combatd.c',
                    ...(ability === 'san' ? ['kungfu/skill/jingluo-xue.c'] : []),
                    ...Object.values(extra.mappings ?? {}).map(s => `kungfu/skill/${s}.c`)])],
                qualification_note: '真实非巫师USER；原教师声明只证明来源，等级、经络学与领悟为实验赋值，不证明正常可从师取得。保持原公式与随机，经络学伤害取值拼错不修正、不注入不存在的技能。封穴控制、公共直伤、凌空直接伤血、菩提自伤分别记录；忙乱是计数而非秒数。只观察单次入口，不冒充互备或持续交锋。',
            } });
    }
    for (const d of shaolinFingers) for (const level of [200, 400, 800]) {
        add(d, 'ordinary', level);
        for (const ability of d.abilities) add(d, ability, level);
    }
    for (const d of shaolinFingers) for (const ability of d.abilities) {
        const q = requirements[ability];
        const check = (suffix, extra = {}) => add(d, ability, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        for (const offset of [-1, 0]) {
            const edge = offset ? 'low' : 'minimum', expected = offset ? 'refused' : 'observed';
            check(`${edge}-neili`, { properties: { neili: q.neili + offset }, expected });
            if (q.raw) check(`${edge}-skill`, { skills: { [d.skill]: q.raw + offset }, expected });
            if (q.effective_finger) check(`${edge}-finger`, { skills: { finger: 2, [d.skill]: q.effective_finger - 1 + offset }, expected });
            if (q.force) check(`force-${edge}`, { skills: { force: 2, 'hunyuan-yiqi': q.force - 1 + offset }, expected });
            if (q.raw_hunyuan) check(`hunyuan-${edge}`, { skills: { 'hunyuan-yiqi': q.raw_hunyuan + offset }, expected });
            if (q.max_neili) check(`${edge}-max-neili`, { properties: { max_neili: q.max_neili + offset }, expected });
        }
        check('busy', { busy: true, expected: 'refused' });
        check('no-fight', { fighting: false, expected: 'refused' });
        check('unmapped', { unmapped: true, expected: 'refused' });
        check('unprepared', { unprepared: true, expected: q.prepared ? 'refused' : 'observed' });
        check('armed', { weapon: true, expected: q.armed ? 'observed' : 'refused' });
        check('no-grant', { properties: { [`can_perform/${d.skill}/${ability}`]: 0 }, expected: q.grant ? 'refused' : 'observed' });
        if (ability === 'fuxue') check('target-busy', { targetBusy: true, expected: 'refused' });
        if (q.shaolin_force) for (const skill of ['yijinjing', 'luohan-fumogong', 'taiji-shengong'])
            check(`force-${skill}`, { skills: { [skill]: 200 }, mappings: { force: skill },
                expected: skill === 'taiji-shengong' ? 'refused' : 'observed' });
        if (ability === 'san') {
            check('jingluo199', { skills: { 'jingluo-xue': 199 }, expected: 'refused' });
            check('jingluo200');
            add(d, ability, 200, { suffix: '-jingluo800', skills: { 'jingluo-xue': 800 } });
        }
        for (const [suffix, value] of [['low-defense', 2], ['high-defense', 100000]]) {
            const defense = { jingmo: ['dodge'], fumo: ['dodge', 'parry'], san: ['parry'],
                jimie: ['dodge', 'force'], wuse: ['dodge', 'parry'], jueming: ['dodge', 'parry'], lingkong: ['force', 'dodge', 'parry'] }[ability];
            add(d, ability, 200, { suffix: '-' + suffix,
                ...(ability === 'fuxue' ? { targetProperties: { combat_exp: value === 2 ? 3 : 300000000 } }
                    : { targetSkills: Object.fromEntries(defense.map(k => [k, value])) }) });
        }
    }
    return result;
}

const busy = s => s.busy === null ? 0 : s.busy;
export function validateShaolinFingerRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0], target = raw.immediate[1];
    assert.equal(raw.outcome, p.expected);
    for (const [state, cfg] of [[before, p.actor], [raw.before[1], p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.preparations, cfg.preparations ?? {});
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value);
        for (const key of ['qi', 'neili', 'max_neili', 'combat_exp', 'jiali', 'shen'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key]);
    }
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1);
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.equal(actor.neili, before.neili - cost); assert.equal(actor.max_neili, before.max_neili);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(attacks.length, 0); assert.equal(raw.launches.length, 0);
        assert.ok(raw.reason.length > 0); assert.deepEqual(raw.immediate[1], raw.before[1]);
        assert.equal(actor.qi, before.qi); return;
    }
    if (condition.method === 'ordinary') {
        assert.equal(attacks.length, 1); assert.equal(raw.launches.length, 0); assert.equal(cost, 0); return;
    }
    assert.equal(attacks.length, 0); assert.equal(raw.launches.length, 1);
    assert.equal(raw.launches[0].skill, p.skill); assert.equal(raw.launches[0].argument, p.ability);
    const qiCost = raw.metrics[1].qi_cost ?? 0;
    if (p.ability === 'fuxue') {
        assert.equal(direct, 0); assert.equal(qiCost, 0);
        const hit = busy(target) > 0;
        assert.equal(cost, hit ? 100 : 30); assert.equal(busy(actor), hit ? 0 : 3);
        assert.equal(busy(target), hit ? Math.trunc(before.skills[p.skill] / 19) + 2 : 0);
        if (condition.id.endsWith('-high-defense')) assert.equal(hit, false);
    } else if (p.ability === 'lingkong') {
        assert.equal(direct, 0);
        if (qiCost > 0) {
            const level = before.skills[p.skill];
            assert.ok(qiCost >= Math.trunc(level / 2) && qiCost < Math.trunc(level / 2) + level);
            assert.equal(cost, Math.trunc(qiCost / 6)); assert.equal(raw.metrics[1].eff_qi_cost, Math.trunc(qiCost / 6));
            assert.equal(busy(actor), 3); assert.ok(busy(target) >= 0 && busy(target) <= 2);
        } else { assert.equal(cost, 0); assert.equal(busy(actor), 4); assert.equal(busy(target), 0); }
        if (condition.id.endsWith('-high-defense')) assert.equal(qiCost, 0);
    } else {
        assert.ok([0, 1].includes(direct));
        const costs = { jingmo: [60, 100], fumo: [100, 300], san: [800, 800], jimie: [200, 500], wuse: [100, 200], jueming: [150, 350] }[p.ability];
        assert.equal(cost, costs[direct]);
        if (p.ability === 'san') {
            assert.ok(busy(actor) >= 3 && busy(actor) <= 5);
            assert.equal(busy(target), direct ? Math.trunc(before.skills[p.skill] / 30) : 0);
        } else assert.equal(busy(actor), direct ? p.ability === 'jueming' ? 1 : 2 : 3);
        if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
    }
    const selfCost = raw.metrics[0].qi_cost ?? 0;
    if (p.ability === 'jimie') {
        const ap = before.skills.finger + before.skills[p.skill];
        assert.ok(selfCost >= Math.trunc(ap / 4) && selfCost <= Math.trunc((2 * ap - 1) / 4));
        assert.equal(actor.qi, before.qi - selfCost); assert.equal(actor.eff_qi, before.eff_qi);
    } else assert.equal(selfCost, 0);
}

export function shaolinFingerEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw?.immediate?.[0]).map(r => r.raw);
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        self_qi_cost: distribution(raw.map(r => r.metrics[0].qi_cost ?? 0)),
        target_busy: distribution(raw.map(r => busy(r.immediate[1]))),
        qi_loss_samples: probability(raw.filter(r => (r.metrics[1].qi_cost ?? 0) > 0).length, raw.length),
    };
}
