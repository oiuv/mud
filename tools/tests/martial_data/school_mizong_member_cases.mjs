// Finite native single-member windows, not teacher grants or full combination coverage.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
export const mizongMemberSources = {
    'kungfu/skill/dashou-yin.c': 'da79d89c6fd13c1962bc31a49c47169dee705a8fc79e3c06fc0e2daebf37f559',
    'kungfu/skill/yujiamu-quan.c': '536974ae7f77c853972af33f8369f9d13a88f75a613e6455d36c1426d811101a',
    'kungfu/skill/huoyan-dao.c': '8a7de6842fbb95ac2ee4200b0232028fee7fc8aafa8e1a6a29c1ddcbdbfaf862',
    'kungfu/class/tianlongsi/jiumozhi.c': '8d1529b3d54c0784a9fe1c846a7e988ca4853458ce6c640d4396edffe052c1d6',
    'cmds/skill/enable.c': 'aed3bbbe4aac9172c2b50beba83542605a459ad6e6fa5270bbc0e87800108396',
    'adm/daemons/combatd.c': '9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6',
    'feature/attribute.c': '1374357d87d48d6373d6f88cb84f0a3c5e4ebcf3b78a9c57d63148d6944f3924',
};
// Original action fields; absent fields stay absent, even where their zero would look equivalent.
export const mizongMembers = {
    'dashou-yin': { usage: 'hand', name: '密宗大手印', force: 50, max: 350, qi: 60, qiCost: 50,
        actions: [[0, '莲花合掌印', 120, 25, 10], [25, '合掌观音印', 170, 30, 15],
            [50, '准提佛母印', 220, 35, 5], [80, '红阎婆罗印', 250, 40, 25],
            [100, '药师佛根本印', 280, 45, 15], [120, '威德金刚印', 320, 50, 15],
            [140, '上乐金刚印', 340, 55, 20], [160, '六臂智慧印', 360, 65, 25]] },
    'yujiamu-quan': { usage: 'cuff', name: '金刚瑜迦母拳', force: 100, max: 600, qi: 60, qiCost: 50,
        actions: [[0, '灌顶', 160, null, 5], [30, '解苦', 200, null, -5], [60, '颦眉', 220, null, 10],
            [80, '嗔恚', 250, null, 5], [100, '静寂', 270, null, -5], [120, '妙音', 300, null, 10],
            [140, '明心', 310, null, 20], [160, '制胜', 330, null, 5]] },
    'huoyan-dao': { usage: 'strike', name: '火焰刀', force: 150, max: 1200, qi: 70, qiCost: 55,
        actions: [[0, '钻木取火', 90, 25, 15, 25, 40], [30, '祝融怀焰', 130, 47, 25, 31, 55],
            [60, '风火无边', 180, 61, 25, 40, 65], [90, '六道轮回', 240, 75, 20, 47, 70],
            [120, '双龙吐焰', 300, 80, 30, 56, 80], [140, '刀山火海', 350, 91, 35, 62, 85],
            [160, '白佛光度', 370, 102, 37, 78, 90], [180, '火内莲花', 400, 110, 45, 84, 109],
            [250, '极意']] },
};
const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    combat_exp: 100000000, str: 30, int: 36, con: 30, dex: 30, gender: '男性', shen: 0 };
const n = v => v ?? 0;
const cost = (skill, level) => skill === 'huoyan-dao' ? Math.trunc(level / 5) + 60 : 61;
export function mizongMemberConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, hash] of Object.entries(mizongMemberSources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), hash,
            '密宗来源改变，须重新审阅：' + path);
    const result = [];
    for (const [skill, d] of Object.entries(mizongMembers)) {
        const source = catalog.skills.find(s => s.id === skill); assert.ok(source);
        function add(ability, suffix, extra = {}) {
            const level = extra.level ?? 200, ordinary = ability === 'ordinary', hit = ability === 'hit_ob';
            const entry = ordinary ? source.path : source.entries.find(e => e.function === ability)?.id;
            assert.ok(entry, '缺少原接口：' + skill + '/' + ability);
            result.push({ id: `school-s1-mizong-${skill}-${ability}-${suffix}`, stage: 'school', entry_id: entry,
                method: ordinary ? 'ordinary' : 'interface', samples: smoke ? 2 : extra.checks ?? ((ordinary || hit) ? samples : 2),
                parameters: { school: 'tianlongsi', family: '密宗', collection_group: 's1-mizong', skill, usage: d.usage, ability, level,
                    actor: { skills: { force: 400, [d.usage]: level, [skill]: level, dodge: level, parry: level,
                        sword: 200, ...(skill === 'dashou-yin' ? { lamaism: 200 } : {}), ...extra.skills },
                        mappings: ordinary ? { [d.usage]: skill } : {}, preparations: ordinary ? { [d.usage]: skill } : {},
                        properties: { ...properties, 'family/family_name': '密宗',
                            ...(skill === 'huoyan-dao' ? { con: 32, shen: -level * 1000 } : {}), ...extra.properties },
                        ...(extra.equipment ? { equipment: extra.equipment } : {}) },
                    target: { skills: { force: hit ? 0 : 600, dodge: 600, parry: 600, ...extra.targetSkills },
                        mappings: {}, preparations: {}, properties: { ...properties, ...extra.targetProperties } },
                    action: ordinary ? 'ordinary' : 'test_interface', fighting: ordinary,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                    expected_result: extra.value ?? 1, not_applicable: '',
                    ...(!ordinary ? { interface: { object: '/kungfu/skill/' + skill, function: ability,
                        ...(Object.hasOwn(extra, 'argument') ? { argument: extra.argument } : {}),
                        ...(extra.combo ? { combo: extra.combo } : {}), ...(hit ? { damage: extra.damage ?? 300, factor: 0 } : {}) } } : {}),
                    capture_skill_loads: skill === 'huoyan-dao' ? [{ skill, path: source.path, sha256: source.sha256 }] : [],
                    source_evidence: { ...mizongMemberSources },
                    qualification_sources: [...Object.keys(mizongMemberSources), 'inherit/skill/skill.c', 'feature/skill.c',
                        'feature/attack.c', 'feature/damage.c', 'feature/equip.c', 'feature/action.c', 'include/combat.h', 'inherit/char/char.c'],
                    qualification_note: '鸠摩智目录为tianlongsi而家族密宗，原准备火焰刀/瑜迦母拳且激发小无相，大手印只设置。本批实验USER无特殊内功、单备各成员，非原NPC配装或教学。火焰刀经原enable首次加载，记录混合原始/有效随机常量、同驱动不重载；原命名>=和选招>分开。hit_ob为独立接口输入而非原普攻触发率；原创伤造成气血截断另计。practice只验原门槛/费用，包括允许扣至负内力，不修游戏或冒公开养成。',
                } });
        }
        for (const level of [200, 400, 800]) for (const jiali of [0, 50])
            add('ordinary', `l${level}-jiali${jiali}`, { level, properties: { jiali } });
        for (const argument of [d.usage, 'parry', 'sword'])
            add('valid_enable', argument, { argument, value: Number(argument !== 'sword') });
        for (const combo of [...Object.keys(mizongMembers).filter(s => s !== skill), 'jinyu-quan'])
            add('valid_combine', combo, { combo, value: Number(combo !== 'jinyu-quan') });
        add('valid_learn', 'baseline');
        for (const effective of [d.force - 1, d.force]) add('valid_learn', 'force' + effective,
            { skills: { force: effective * 2 }, ...(effective < d.force ? { value: 0,
                refusal: skill === 'yujiamu-quan' ? '你的内功火候不够。\n' : '你的内功火候太浅。\n' } : {}) });
        for (const max_neili of [d.max - 1, d.max]) add('valid_learn', 'max-neili' + max_neili,
            { properties: { max_neili }, ...(max_neili < d.max ? { value: 0, refusal: '你的内力不够。\n' } : {}) });
        for (const basic of [199, 200]) add('valid_learn', 'basic' + basic, { skills: { [d.usage]: basic },
            ...(basic < 200 ? { value: 0, refusal: ({ 'dashou-yin': '你的基本手法水平有限，无法领会更高深的密宗大手印。\n',
                'yujiamu-quan': '你的基本拳法水平有限，无法领会更高深的金刚瑜迦母拳。\n',
                'huoyan-dao': '你的基本掌法火候有限，无法领会更高深的火焰刀法。\n' })[skill] } : {}) });
        for (const slot of ['weapon', 'secondary_weapon']) add('valid_learn', slot,
            { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
                value: 0, refusal: '练' + d.name + '必须空手。\n' });
        add('practice_skill', 'baseline');
        for (const qi of [d.qi - 1, d.qi]) add('practice_skill', 'qi' + qi, { properties: { qi },
            ...(qi < d.qi ? { value: 0, refusal: '你的体力不够，练不了' + d.name + '。\n' } : {}) });
        for (const neili of [69, 70]) add('practice_skill', 'neili' + neili, { properties: { neili },
            ...(neili < 70 ? { value: 0, refusal: '你的内力不够，练不了' + d.name + '。\n' } : {}) });
        for (const slot of ['weapon', 'secondary_weapon']) add('practice_skill', slot,
            { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
                value: 0, refusal: skill === 'dashou-yin' ? '练「密宗大手印」必须空手。\n' : '练' + d.name + '必须空手。\n' });
        for (const argument of [...d.actions.map(a => a[0]), 800]) add('query_skill_name', 'l' + argument,
            { argument, value: d.actions.filter(a => a[0] <= argument).at(-1)[1] });
        if (skill === 'dashou-yin') {
            for (const lamaism of [19, 20]) add('valid_learn', 'lamaism-min' + lamaism,
                { level: 20, skills: { lamaism }, ...(lamaism < 20 ? { value: 0,
                    refusal: '你对密宗心法的知识了解太少，无法理解密宗大手印。\n' } : {}) });
            for (const [level, values] of [[100, [99, 100]], [400, [199, 200]]]) for (const lamaism of values)
                add('valid_learn', `lamaism${lamaism}-l${level}`, { level, skills: { lamaism },
                    ...(lamaism < level && lamaism < 200 ? { value: 0,
                        refusal: '你受密宗心法知识的知识所限，难以进一步领悟大手印。\n' } : {}) });
        }
        if (skill === 'huoyan-dao') {
            for (const con of [31, 32]) add('valid_learn', 'con' + con, { properties: { con },
                ...(con < 32 ? { value: 0, refusal: '你的先天根骨孱弱，难以修炼火焰刀。\n' } : {}) });
            for (const shen of [-199999, -200000]) add('valid_learn', 'shen' + shen, { properties: { shen },
                ...(shen > -200000 ? { value: 0, refusal: '你的杀气不够，难以领悟更高深的火焰刀。\n' } : {}) });
            for (const level of [400, 800]) add('practice_skill', 'cost-l' + level, { level });
            for (const level of [250, 251]) add('ordinary', 'action-boundary-l' + level, { level });
            for (const level of [149, 150, 200, 400, 800]) add('hit_ob', 'level' + level,
                { level, ...(level < 150 ? { checks: 2 } : {}) });
            for (const damage of [0, 149, 150]) add('hit_ob', 'incoming' + damage,
                { damage, ...(damage < 150 ? { checks: 2 } : {}) });
            for (const force of [384, 388, 392]) add('hit_ob', 'force-gate' + force,
                { level: 150, damage: 150, targetSkills: { force }, ...(force !== 384 ? { checks: 2 } : {}) });
            for (const shen of [-7999999, -8000000, -8000001]) add('hit_ob', 'shen' + shen,
                { properties: { shen }, ...(shen >= -8000000 ? { checks: 2 } : {}) });
            add('hit_ob', 'high-target-force', { targetSkills: { force: 2000 }, checks: 2 });
        }
    }
    return result;
}

const plain = state => {
    const v = structuredClone(state);
    if (v.temp) { delete v.temp.notify_fail; delete v.temp.fight;
        for (const k of Object.keys(v.temp.apply ?? {})) if (!v.temp.apply[k]) delete v.temp.apply[k]; }
    return v;
};
export function validateMizongFirePassive(e) {
    assert.equal(e.skill, 'huoyan-dao'); assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.factor, 0);
    const [b, t] = e.before, [a, v] = e.after, level = b.skills['huoyan-dao'];
    const eligible = e.incoming >= 150 && level >= 150
        && level + Math.trunc(e.incoming / 10) > Math.trunc(t.effective_skills.force / 2) + t.effective_con;
    const wound = t.eff_qi - v.eff_qi;
    if (eligible) {
        assert.ok(typeof e.result === 'string' && /咔嚓/.test(e.result));
        const extra = b.shen < -(level ** 3);
        const low = Math.trunc((e.incoming - 80) / 3), high = Math.trunc((e.incoming + (extra ? level - 1 : 0) - 80) / 3);
        assert.ok(Number.isInteger(wound) && wound >= low && wound <= high);
    } else { assert.equal(n(e.result), 0); assert.equal(wound, 0); }
    assert.deepEqual(plain(a), plain(b));
    const expected = plain(t); expected.eff_qi -= wound; expected.qi = Math.min(expected.qi, expected.eff_qi);
    assert.deepEqual(plain(v), expected, '原创伤及气血截断，不能冒作独立直伤');
    return wound;
}
export function validateMizongMemberRecord(raw, c) {
    const p = c.parameters, d = mizongMembers[p.skill]; assert.ok(d);
    assert.equal(p.collection_group, 's1-mizong'); assert.equal(p.family, '密宗');
    assert.equal(raw.method, c.method); assert.equal(raw.outcome, p.expected);
    assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.launches, []); assert.deepEqual(raw.directs, []);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side];
        for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(b[k], 1);
        assert.equal(b.wizardp, 0); assert.equal(b.ghost, 0);
        assert.deepEqual(b.skills, cfg.skills); assert.deepEqual(b.mappings, cfg.mappings); assert.deepEqual(b.preparations, cfg.preparations);
        for (const [k, v] of Object.entries(cfg.properties)) assert.equal(k.includes('/') ? b.cultivation[k] : b[k], v, k);
        assert.equal(n(raw.metrics[side].heartbeats), 0);
        for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            assert.equal(n(raw.metrics[side][k + '_recovery']), 0);
            assert.equal(b[k] - raw.immediate[side][k], n(raw.metrics[side][k + '_cost']), '资源分账：' + k);
        }
    }
    const [b, t] = raw.before, [a, v] = raw.immediate, expected = plain(b), target = plain(t);
    assert.equal(b.weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'none' : p.actor.equipment?.type ?? 'none');
    assert.equal(b.secondary_weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none');
    if (b.secondary_weapon !== 'none') assert.equal(b.secondary_weapon_details.program, '/tests/sword');
    assert.equal(raw.skill_loads.length, p.capture_skill_loads.length);
    const load = raw.skill_loads[0];
    if (load) {
        for (const k of ['skill', 'path', 'sha256']) assert.equal(load[k], p.capture_skill_loads[0][k]);
        for (const k of ['load_id', 'run_id']) assert.ok(typeof load[k] === 'string' && load[k].length);
        assert.equal(load.command, 'enable parry huoyan-dao');
        assert.equal(load.state.userp, 1); assert.equal(load.state.wizardp, 0);
        assert.deepEqual(load.state.mappings, {}); assert.deepEqual(load.state.preparations, {});
    }
    if (p.ability === 'ordinary') {
        assert.deepEqual(raw.interfaces, []); assert.equal(raw.attacks.length, 1); assert.equal(raw.actions.length, 1);
        const hit = raw.attacks[0]; assert.equal(hit.actor, 0); assert.equal(hit.target, 1); assert.equal(hit.type, 0);
        assert.equal(hit.attack_skill, p.skill); assert.equal(hit.attack_usage, d.usage); assert.ok([0, -1, -2].includes(hit.result));
        assert.equal(raw.passives.length, Number(hit.result === 0));
        let passiveClamp = 0;
        for (const e of raw.passives) {
            assert.equal(e.route, 'martial'); assert.equal(e.skill, p.skill); assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.factor, 0);
            if (p.skill === 'huoyan-dao') { validateMizongFirePassive(e); passiveClamp += e.before[1].qi - e.after[1].qi; }
            else { assert.equal(n(e.result), 0); assert.deepEqual(plain(e.before[0]), plain(e.after[0])); assert.deepEqual(plain(e.before[1]), plain(e.after[1])); }
        }
        assert.equal(v.qi, Math.min(t.qi - passiveClamp - hit.damage, v.eff_qi));
        target.qi = v.qi; target.eff_qi = v.eff_qi;
        const e = raw.actions[0]; assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.skill, p.skill);
        assert.ok(typeof e.action.action === 'string' && e.action.action.length);
        const item = d.actions.find(x => x[0] === e.action.lvl); assert.ok(item && item[0] < p.level);
        assert.equal(e.action.skill_name, item[1]);
        if (p.skill === 'huoyan-dao' && item[0] === 250) {
            assert.equal(e.action.damage_type, '内伤');
            const s = load.state.skills, effective = load.state.effective_skills;
            const ranges = { force: [Math.trunc(s.force / 3), effective.force], attack: [Math.trunc(s.strike / 4), Math.trunc(s.strike / 2)],
                dodge: [Math.trunc(s.dodge / 6), Math.trunc(s.force / 3)], parry: [Math.trunc(s.parry / 6), Math.trunc(s.parry / 3)],
                damage: [Math.trunc(s.force / 4), Math.trunc(s.strike / 2)] };
            for (const [k, [base, span]] of Object.entries(ranges)) assert.ok(Number.isInteger(e.action[k]) && e.action[k] >= base && e.action[k] <= base + Math.max(0, span - 1), '原始/有效混合加载：' + k);
        } else {
            assert.equal(e.action.damage_type, '瘀伤');
            for (const [i, k] of ['force', 'attack', 'dodge', 'parry', 'damage'].entries()) {
                if (item[i + 2] == null) assert.ok(!Object.hasOwn(e.action, k));
                else assert.equal(e.action[k], item[i + 2]);
            }
        }
    } else if (p.ability === 'hit_ob') {
        assert.equal(p.skill, 'huoyan-dao'); assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.actions, []);
        assert.equal(raw.interfaces.length, 1); assert.equal(raw.passives.length, 1);
        const call = raw.interfaces[0], e = raw.passives[0];
        assert.equal(call.object, p.interface.object); assert.equal(call.function, 'hit_ob');
        assert.equal(e.route, 'interface'); assert.equal(e.incoming, p.interface.damage); assert.deepEqual(call.result, e.result);
        assert.deepEqual(e.before, raw.before); assert.deepEqual(e.after, raw.immediate); validateMizongFirePassive(e);
        target.qi = v.qi; target.eff_qi = v.eff_qi;
    } else {
        assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.actions, []); assert.deepEqual(raw.passives, []); assert.equal(raw.interfaces.length, 1);
        const call = raw.interfaces[0]; assert.equal(call.object, p.interface.object); assert.equal(call.function, p.ability);
        let result;
        if (p.ability === 'query_skill_name') { assert.equal(call.argument, p.interface.argument); result = d.actions.filter(a => a[0] <= call.argument).at(-1)[1]; }
        else if (p.ability === 'valid_enable') { assert.equal(call.argument, p.interface.argument); result = Number([d.usage, 'parry'].includes(call.argument)); }
        else if (p.ability === 'valid_combine') { assert.equal(call.combo, p.interface.combo); result = Number(Object.hasOwn(mizongMembers, call.combo) && call.combo !== p.skill); }
        else if (p.ability === 'valid_learn') result = Number(b.weapon === 'none' && b.secondary_weapon === 'none'
            && b.max_neili >= d.max && b.effective_skills.force >= d.force && b.skills[d.usage] >= b.skills[p.skill]
            && (p.skill !== 'dashou-yin' || b.skills.lamaism >= 20 && (b.skills.lamaism >= b.skills[p.skill] || b.skills.lamaism >= 200))
            && (p.skill !== 'huoyan-dao' || b.con >= 32 && b.shen <= -b.skills[p.skill] * 1000));
        else { assert.equal(p.ability, 'practice_skill'); result = Number(b.weapon === 'none' && b.secondary_weapon === 'none' && b.qi >= d.qi && b.neili >= 70); }
        assert.equal(p.expected_result, result); assert.equal(call.result, result);
        if (p.expected === 'refused') {
            const prefix = '\x1b[256D\x1b[K'; assert.equal(raw.reason.startsWith(prefix) ? raw.reason.slice(prefix.length) : raw.reason, p.refusal);
        }
        if (p.ability === 'practice_skill' && result) { expected.qi -= d.qiCost; expected.neili -= cost(p.skill, b.skills[p.skill]); }
    }
    assert.deepEqual(plain(a), expected); assert.deepEqual(plain(v), target);
}
export function validateMizongLoads(rows) {
    const loads = new Map(), actions = new Map();
    for (const row of rows) {
        const r = row.raw ?? row;
        for (const load of r.skill_loads) {
            const key = load.run_id + ':' + load.load_id;
            if (loads.has(key)) assert.deepEqual(load, loads.get(key), '首次加载来源不得漂移'); else loads.set(key, load);
            for (const e of r.actions) if (e.skill === 'huoyan-dao' && e.action.lvl === 250) {
                if (actions.has(key)) assert.deepEqual(e.action, actions.get(key), '共享极意不得逐样本重新随机'); else actions.set(key, e.action);
            }
        }
    }
    return { loads: loads.size, dynamic_actions: actions.size };
}
