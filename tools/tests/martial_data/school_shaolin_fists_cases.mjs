// Original Shaolin fist commands and preparation; no replacement combat formulas.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const shaolinFists = [
    { skill: 'luohan-quan', usage: 'cuff', teacher: 'cheng-yi', ability: 'xiangmo' },
    { skill: 'jingang-quan', usage: 'cuff', teacher: 'cheng-zhi', ability: 'jingang' },
    { skill: 'fuhu-quan', usage: 'cuff', teacher: 'cheng-yi' },
    { skill: 'zuiquan-sanda', usage: 'cuff', teacher: 'cheng-yi' },
    { skill: 'qinna-shibada', usage: 'unarmed', teacher: 'cheng-zhi' },
];

export function shaolinFistConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? d.skill : `${d.skill}/${ability}`));
        assert.ok(source, `缺少少林拳脚源码 ${d.skill}/${ability}`);
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === method)?.id;
        assert.ok(entry);
        const usage = extra.usage ?? d.usage;
        const actor = {
            skills: { [usage]: level, [d.skill]: level, force: level, 'hunyuan-yiqi': level,
                parry: level, dodge: level, 'shaolin-shenfa': level, buddhism: level,
                'martial-cognize': level, ...extra.skills },
            mappings: { [usage]: d.skill, parry: d.skill, force: 'hunyuan-yiqi', dodge: 'shaolin-shenfa', ...extra.mappings },
            preparations: extra.unprepared ? {} : { [usage]: d.skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
                shen: 200000, combat_exp: 100000000, 'family/family_name': '少林派',
                ...(method === 'perform' ? { [`can_perform/${d.skill}/${ability}`]: 1 } : {}), ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: 2 } : {}), ...(extra.temp ? { temp: extra.temp } : {}),
        };
        if (extra.dual) {
            Object.assign(actor.skills, { cuff: level, 'luohan-quan': level });
            actor.mappings.cuff = 'luohan-quan'; actor.preparations.cuff = 'luohan-quan';
        }
        if (extra.unmapped) delete actor.mappings[usage];
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, properties: {}, equipment: { type: 'sword', hold: false } };
        result.push({ id: `school-shaolin-fists-${d.skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? (extra.expiry ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-fists',
                combination: `${d.skill}+hunyuan-yiqi${extra.dual ? '+luohan-quan' : ''}`, skill: d.skill, usage, ability, level,
                actor, target, fighting: extra.fighting ?? true,
                observation: extra.expiry ? 'timed_effect' : 'single_action_immediate',
                observe_seconds: extra.expiry ? (extra.properties?.qi <= 4000 ? 4 : Math.trunc(actor.skills[d.skill] / 3) + 2) : 0,
                action: method === 'ordinary' ? 'ordinary' : `perform ${usage}.${ability}`,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    `kungfu/class/shaolin/${d.teacher}.c`, 'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/shaolin-shenfa.c',
                    ...(extra.dual ? ['kungfu/skill/luohan-quan.c'] : []),
                    'cmds/skill/perform.c', 'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER；教师配置只证明来源，技能、领悟及资源为实验赋值，不证明本等级可从师获得。按valid_enable单项映射和prepare；dual为源码互相valid_combine的罗汉拳/擒拿十八打，仅观察一次原普通结算，不冒充完整双手交锋或原prepare命令验收。低气血神通运行原昏迷及扣除上限逻辑，不拦截、不改时钟；临时根层str/dex与属性接口分开记录。',
            } });
    }
    for (const d of shaolinFists) for (const level of [200, 400, 800]) {
        add(d, 'ordinary', level);
        if (d.ability) add(d, d.ability, level);
        if (d.skill === 'zuiquan-sanda') add(d, 'ordinary', level, { suffix: '-unarmed', usage: 'unarmed' });
        if (d.skill === 'qinna-shibada') add(d, 'ordinary', level, { suffix: '-dual', dual: true });
    }
    for (const d of shaolinFists.filter(s => s.ability)) {
        const check = (suffix, extra = {}) => add(d, d.ability, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        const neili = d.ability === 'jingang' ? 500 : 50;
        check('low-neili', { properties: { neili: neili - 1 }, expected: 'refused' });
        check('minimum-neili', { properties: { neili } });
        check('busy', { busy: true, expected: 'refused' });
        check('no-fight', { fighting: false, expected: 'refused' });
        check('unmapped', { unmapped: true, expected: 'refused' });
        check('unprepared', { unprepared: true });
        check('armed', { weapon: true });
        check('no-grant', { properties: { [`can_perform/${d.skill}/${d.ability}`]: 0 },
            expected: d.ability === 'jingang' ? 'refused' : 'observed' });
        if (d.ability === 'xiangmo') {
            check('low-skill', { skills: { [d.skill]: 19 }, expected: 'refused' });
            check('minimum-skill', { skills: { [d.skill]: 20 } });
            for (const [suffix, parry] of [['low-defense', 2], ['high-defense', 100000]])
                add(d, d.ability, 200, { suffix: '-' + suffix, targetSkills: { parry } });
        } else {
            check('already-active', { temp: { jingang: 1 }, expected: 'refused' });
            check('wrong-force', { skills: { 'taiji-shengong': 200 }, mappings: { force: 'taiji-shengong' }, expected: 'refused' });
            for (const [key, mapped] of [['force', 'hunyuan-yiqi'], ['cuff', 'jingang-quan']])
                for (const offset of [-1, 0]) check(`${key}-${offset ? 'low' : 'minimum'}`,
                    { skills: { [key]: 2, [mapped]: 149 + offset }, expected: offset ? 'refused' : 'observed' });
            check('qi4001', { properties: { qi: 4001 } });
            add(d, d.ability, 200, { suffix: '-qi4000', properties: { qi: 4000 } });
            check('expiry', { expiry: true });
            check('qi4000-expiry', { properties: { qi: 4000 }, expiry: true });
        }
    }
    return result;
}

const temp = (s, key) => key.split('/').reduce((v, k) => v?.[k], s.temp) ?? 0;
export function validateShaolinFistRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0];
    assert.equal(raw.outcome, p.expected);
    for (const [state, cfg] of [[before, p.actor], [raw.before[1], p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.preparations, cfg.preparations ?? {});
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.skills[key] ?? 0, value);
        for (const key of ['qi', 'neili', 'max_neili', 'shen', 'jiali', 'combat_exp'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key]);
    }
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1);
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.equal(actor.neili, before.neili - cost);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(attacks.length, 0); assert.equal(raw.launches.length, 0);
        assert.ok(raw.reason.length > 0); assert.deepEqual(raw.immediate[1], raw.before[1]);
        for (const key of ['str', 'dex', 'jingang']) assert.equal(temp(actor, key), temp(before, key));
        assert.equal(actor.max_neili, before.max_neili); return;
    }
    if (condition.method === 'ordinary') {
        assert.equal(attacks.length, 1); assert.equal(raw.launches.length, 0); assert.equal(cost, 0); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, p.skill); assert.equal(raw.launches[0].argument, p.ability);
    if (p.ability === 'xiangmo') {
        assert.ok([0, 1].includes(direct)); assert.equal(attacks.length, 0);
        assert.equal(cost, direct ? 30 : 10); assert.equal(actor.busy, direct ? 2 : 3);
        if (condition.id.endsWith('-low-defense')) assert.equal(direct, 1);
        if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
        assert.equal(actor.max_neili, before.max_neili); return;
    }
    const sacrifice = before.qi <= before.max_qi * 0.4;
    const count = Math.trunc(Math.trunc(before.skills['jingang-quan'] / 3) / 2);
    assert.equal(direct, 0); assert.equal(attacks.length, sacrifice ? 1 : 0);
    assert.equal(temp(actor, 'jingang'), 1);
    assert.equal(temp(actor, 'str') - temp(before, 'str'), count * (sacrifice ? 10 : 2));
    assert.equal(temp(actor, 'dex') - temp(before, 'dex'), sacrifice ? 0 : -Math.trunc(before.effective_dex / 10));
    assert.equal(cost, sacrifice ? before.neili : 150);
    assert.equal(actor.max_neili, before.max_neili - (sacrifice ? 10 : 0));
    assert.equal(actor.living, sacrifice ? 0 : 1);
    assert.equal(raw.terminals.filter(t => t.side === 0 && t.state === 'unconscious').length, sacrifice ? 1 : 0);
    if (p.observation === 'timed_effect') {
        assert.ok(raw.elapsed >= p.observe_seconds - 1);
        for (const key of ['str', 'dex', 'jingang']) assert.equal(temp(raw.after[0], key), temp(before, key));
        assert.deepEqual(raw.callbacks.filter(c => c.side === 0).map(c => c.phase), ['before', 'after']);
        assert.equal(raw.after[0].neili, actor.neili); assert.equal(raw.after[0].max_neili, actor.max_neili);
    }
}

export function shaolinFistEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw?.immediate?.[0]).map(r => r.raw);
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        unconscious: probability(raw.filter(r => !r.immediate[0].living).length, raw.length),
        max_neili_loss: distribution(raw.map(r => r.before[0].max_neili - r.immediate[0].max_neili)),
        root_str: distribution(raw.map(r => temp(r.immediate[0], 'str') - temp(r.before[0], 'str'))),
        root_dex: distribution(raw.map(r => temp(r.immediate[0], 'dex') - temp(r.before[0], 'dex'))),
    };
}
