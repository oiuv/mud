// Original needle abilities: immediate effects and deferred ammunition cleanup.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const gumuNeedles = [
    { skill: 'yufeng-zhen', ability: 'ying', teacher: 'longnv', level: 100, force: 100, neili: 100,
        cost: 80, program: '/d/gumu/obj/yufeng-zhen', hand_id: 'yufeng zhen', damage: 50,
        daub_by: { who_name: '小龙女', who_id: 'xiao longnv' },
        poison: { type: 'yufengdu', level: 80, remain: 1000, id: 'xiao longnv', name: '玉蜂毒' } },
    { skill: 'bingpo-shenzhen', ability: 'bing', teacher: 'li', level: 120, force: 150, neili: 150,
        cost: 120, program: '/d/gumu/obj/bingpo-zhen', hand_id: 'bingpo zhen', damage: 80,
        daub_by: { who_name: '李莫愁', who_id: 'li mochou' },
        // Preserve both identities. Poison maker and applier can legitimately differ;
        // this particular provenance is pending investigation, not a confirmed defect.
        poison: { type: 'hanbingdu', level: 100, remain: 1200, id: 'xiao longnv', name: '寒冰毒' } },
];
export const gumuThrowingFixtureRequirements = [
    'Clone only the configured original needle or existing controlled test weapon; hand it through the original hand command, never wield a throwing stack.',
    'Record the live held object, amount and full daub before/immediately after perform, including amount zero before its original deferred destruction.',
    'Observe the original weapon hit_ob calls and their damage_bonus; preserve poison identity, immunity and target skill snapshots.',
    'Record the original zero-delay ammunition cleanup separately from immediate damage, poison and bingpo state; never call destruct_me manually.',
    'Use immediate observations for this group. Natural poison ticks and bingpo back() recovery require separate lifecycle samples, not inferred success.',
];
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const resources = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 6000, max_neili: 6000, jiali: 0, str: 36, int: 36, con: 36, dex: 36,
    combat_exp: 10000000, character: '光明磊落', gender: '女性' };

export function gumuThrowingConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const cases = [];
    function add(d, suffix, extra = {}) {
        const source = catalog.skills.find(s => s.id === `${d.skill}/${d.ability}`);
        const entry = source?.entries.find(e => e.role === 'perform')?.id; assert.ok(entry);
        const level = extra.level ?? 200, ammo = extra.ammo ?? d;
        const actor = { skills: { throwing: level, [d.skill]: level, force: level,
            'yunv-xinjing': level, dodge: level, 'yunv-shenfa': level, parry: level, ...extra.skills },
        mappings: { throwing: d.skill, force: 'yunv-xinjing', dodge: 'yunv-shenfa' }, preparations: {},
        properties: { ...resources, 'family/family_name': '古墓派',
            [`can_perform/${d.skill}/${d.ability}`]: 1, ...extra.properties },
        ...(extra.noHeld ? {} : { equipment: { type: extra.wrongHeld ? 'sword' : 'throwing', hold: true,
            program: extra.wrongHeld ? '/tests/sword' : ammo.program,
            hand_id: extra.wrongHeld ? 'practice weapon' : ammo.hand_id,
            ...(extra.wrongHeld ? {} : { amount: extra.amount ?? 50 }) } }),
        ...(extra.busy ? { busy: extra.busy } : {}) };
        if (extra.noMap) delete actor.mappings.throwing;
        const target = { skills: { force: 600, dodge: 600, parry: 600, poison: 1, ...extra.targetSkills },
            mappings: {}, preparations: {}, properties: { ...resources, 'special_skill/piyi': 0,
                'immune/poison': 0, ...extra.targetProperties }, temp: { ...extra.targetTemp } };
        const expected = extra.expected ?? 'observed';
        cases.push({ id: `school-gumu-throwing-${d.skill}-${suffix}`, entry_id: entry, stage: 'school',
            method: 'perform', samples: smoke || expected === 'refused' ? 2 : samples,
            parameters: { school: 'gumu', collection_group: 'gumu-throwing', skill: d.skill, ability: d.ability,
                usage: 'throwing', level, actor, target, fighting: extra.fighting ?? true,
                action: `perform throwing.${d.ability}`, observation: 'single_action_immediate', observe_seconds: 0,
                expected, not_applicable: '',
                qualification_sources: [source.path, `kungfu/skill/${d.skill}.c`, `kungfu/class/gumu/${d.teacher}.c`,
                    'kungfu/class/gumu/gumu.h', ...gumuNeedles.map(d => d.program.slice(1) + '.c'),
                    'kungfu/skill/yunv-xinjing.c', 'kungfu/skill/yunv-shenfa.c', 'cmds/skill/perform.c',
                    'cmds/std/hand.c', 'feature/equip.c', 'feature/skill.c', 'feature/condition.c',
                    'feature/damage.c', 'feature/action.c', 'inherit/weapon/throwing.c', 'inherit/item/combined.c',
                    'inherit/condition/poison.c', 'kungfu/condition/yufengdu.c', 'kungfu/condition/hanbingdu.c',
                    'adm/daemons/combatd.c', 'adm/daemons/itemd.c'],
                qualification_note: '真实非巫师USER，经原perform命令；手持原针具而非装备为剑。资格与弹药是实验赋值，不能冒充正常领取（MA-023另记）。命中、耗针、创伤、原针具传毒和寒冰减益分开；交叉针具及无毒对照不改技能。保留原制毒者ID，毒发与自然解除另采，不将当前中毒状态当作毒伤。',
            } });
    }
    for (const d of gumuNeedles) {
        for (const level of [200, 400, 800]) for (const jiali of [0, 50])
            add(d, `l${level}-j${jiali}`, { level, properties: { jiali } });
        for (const [suffix, extra] of [
            ['no-grant', { properties: { [`can_perform/${d.skill}/${d.ability}`]: 0 } }],
            ['no-map', { noMap: true }], ['no-held', { noHeld: true }], ['wrong-held', { wrongHeld: true }],
            ['busy', { busy: 2 }], ['no-fight', { fighting: false }],
        ]) add(d, suffix, { ...extra, expected: 'refused' });
        for (const offset of [-1, 0]) {
            const expected = offset ? 'refused' : 'observed', tag = offset ? 'low' : 'minimum';
            add(d, tag + '-skill', { skills: { [d.skill]: d.level + offset }, expected });
            add(d, tag + '-force', { skills: { force: 2, 'yunv-xinjing': d.force - 1 + offset }, expected });
            add(d, tag + '-neili', { properties: { neili: d.neili + offset }, expected });
            if (d.ability === 'bing') add(d, tag + '-max-neili', { properties: { max_neili: 1500 + offset }, expected });
        }
        for (const amount of [1, 2]) add(d, 'amount' + amount, { amount });
        add(d, 'low-dodge', { targetSkills: { dodge: 2, parry: 2 } });
        add(d, 'high-dodge', { targetSkills: { dodge: 100000 } });
        add(d, 'high-parry', { targetSkills: { dodge: 2, parry: 100000 } });
        const level = d.poison.level, low = { dodge: 2, parry: 2, force: 2 };
        for (const force of [level, level + 1, 2 * level + 1, 2 * level + 2])
            add(d, 'poison-force' + force, { targetSkills: { ...low, force: force * 2 } });
        for (const poison of [level, level + 1]) add(d, 'poison-skill' + poison, { targetSkills: { ...low, poison } });
        add(d, 'piyi', { targetSkills: low, targetProperties: { 'special_skill/piyi': 1 } });
        add(d, 'immune', { targetSkills: low, targetProperties: { 'immune/poison': -1 } });
        add(d, 'nopoison', { targetSkills: low, targetTemp: { nopoison: 1 } });
        for (const id of ['xiao longnv', 'li mochou'])
            add(d, 'maker-' + id.replaceAll(' ', '-'), { targetSkills: low, targetProperties: { id } });
        add(d, 'other-needle', { targetSkills: low, ammo: gumuNeedles.find(a => a !== d) });
        add(d, 'neutral-needle', { targetSkills: low, ammo: { program: '/tests/throwing', hand_id: 'jinshe zhui' } });
        add(d, 'existing-apply', { targetSkills: low, targetTemp: { 'apply/attack': 17, 'apply/dodge': 23, 'apply/parry': 11 } });
        if (d.ability === 'bing') add(d, 'already-bingpo', { targetTemp: { bingpo: 1 }, expected: 'refused' });
    }
    return cases;
}

const counter = (metrics, key) => {
    assert.ok(metrics && typeof metrics === 'object' && !Array.isArray(metrics), '缺少资源计数');
    const n = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(n) && n >= 0, key); return n;
};
const between = (n, min, max) => assert.ok(Number.isSafeInteger(n) && n >= min && n <= max, `${n} not in ${min}..${max}`);
const emptyConditions = value => {
    assert.ok(value === null || (value && typeof value === 'object' && !Array.isArray(value)), '缺少异常状态');
    if (value !== null) assert.deepEqual(value, {});
};
const idle = value => value === null ? 0 : value;
export function validateGumuThrowingRecord(raw, c) {
    const p = c.parameters, d = gumuNeedles.find(d => d.skill === p.skill); assert.ok(d);
    assert.equal(p.collection_group, 'gumu-throwing'); assert.equal(raw.method, 'perform'); assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2, k);
    for (const k of ['attacks', 'launches', 'needle_hits']) assert.ok(Array.isArray(raw[k]), k);
    assert.equal(raw.attacks.length, 0);
    const [b, bt] = raw.before, [a, t] = raw.immediate;
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.equal(state.living, 1); assert.equal(state.weapon, 'none');
        assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.preparations, cfg.preparations);
        for (const [key, value] of Object.entries(cfg.properties))
            assert.equal(key.includes('/') || key === 'character' ? state.cultivation[key] : state[key], value, key);
        for (const [key, value] of Object.entries(cfg.skills)) {
            assert.equal(state.skills[key], value);
            assert.equal(state.effective_skills[key], Math.trunc(value / 2)
                + (cfg.skills[cfg.mappings[key]] ?? 0) + (cfg.temp?.['apply/' + key] ?? 0));
        }
        for (const [key, value] of Object.entries(cfg.temp ?? {}))
            assert.equal(key.startsWith('apply/') ? state.temp.apply[key.slice(6)] : state.temp[key], value, key);
        emptyConditions(state.conditions);
    }
    for (const side of [0, 1]) {
        assert.equal(counter(raw.metrics[side], 'direct'), 0);
        assert.equal(counter(raw.metrics[side], 'heartbeats'), 0, '即时样本不得混入自然毒发');
        for (const k of health) {
            assert.equal(counter(raw.metrics[side], k + '_recovery'), 0);
            assert.equal(raw.before[side][k] - raw.immediate[side][k], counter(raw.metrics[side], k + '_cost'));
            assert.equal(raw.after[side][k], raw.immediate[side][k]);
        }
    }
    for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(a[k], b[k]);
    for (const k of ['jing', 'eff_jing', 'neili']) assert.equal(t[k], bt[k]);
    assert.deepEqual(a.temp.apply, b.temp.apply);
    const held = b.handing_details, post = a.handing_details;
    if (p.actor.equipment) {
        assert.equal(held.program, p.actor.equipment.program); assert.ok(held.object?.length);
        assert.equal(held.skill_type, p.actor.equipment.type);
        if (p.actor.equipment.type === 'throwing') assert.equal(held.amount, p.actor.equipment.amount);
    } else assert.deepEqual(held, {});
    if (p.expected === 'refused') {
        assert.ok(raw.reason?.length); assert.equal(raw.launches.length, 0); assert.equal(raw.needle_hits.length, 0);
        assert.equal(a.neili, b.neili); assert.equal(a.busy, b.busy); assert.deepEqual(t, bt);
        assert.deepEqual(post, held); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, d.skill);
    assert.equal(raw.launches[0].argument, d.ability); assert.equal(b.neili - a.neili, d.cost);
    assert.equal(post.object, held.object); assert.equal(post.program, held.program);
    assert.equal(post.amount, held.amount - 1, '命中或闪避均只耗一枚');
    assert.ok([true, 1].includes(raw.ammo_cleanup?.checked));
    assert.ok([true, false, 1, 0].includes(raw.ammo_cleanup.object_exists));
    assert.equal(Boolean(raw.ammo_cleanup.object_exists), post.amount > 0);
    if (post.amount > 0) assert.equal(raw.ammo_cleanup.handing_object, held.object);
    else assert.ok([null, 0].includes(raw.ammo_cleanup.handing_object));
    const wound = bt.eff_qi - t.eff_qi, hit = wound > 0;
    const ap = b.effective_skills.throwing, dp = bt.effective_skills.dodge;
    const min = d.ability === 'ying' ? Math.trunc(ap / 2) : ap;
    const max = min + (d.ability === 'ying' ? ap : Math.max(1, Math.trunc(ap / 2))) - 1;
    if (min > dp) assert.ok(hit); if (max <= dp) assert.ok(!hit);
    const vital = hit && d.ability === 'bing' && bt.effective_skills.parry < ap;
    if (!hit) { assert.equal(wound, 0); assert.equal(t.qi, bt.qi); }
    else if (d.ability === 'ying') {
        between(wound, b.skills[d.skill], b.skills[d.skill] + Math.trunc(b.skills[d.skill] / 3) - 1);
        assert.equal(t.qi, Math.min(bt.qi, t.eff_qi));
    } else if (vital) {
        between(wound, b.skills[d.skill], b.skills[d.skill] + Math.trunc(b.skills[d.skill] / 2) - 1);
        between(bt.qi - t.qi, b.skills[d.skill], 2 * b.skills[d.skill] - 1);
    } else { assert.equal(wound, 40); assert.equal(bt.qi - t.qi, 100); }
    assert.equal(t.temp.bingpo ?? 0, vital ? 1 : bt.temp.bingpo ?? 0);
    for (const [k, loss] of [['attack', 70], ['dodge', 70], ['parry', 20]])
        assert.equal(t.temp.apply[k] ?? 0, (bt.temp.apply[k] ?? 0) - (vital ? loss : 0));
    if (d.ability === 'ying') between(a.busy, 2, 3);
    else if (!hit) assert.equal(a.busy, 3);
    else if (vital) assert.equal(idle(a.busy), idle(b.busy));
    else between(a.busy, 1, 2);
    assert.equal(raw.needle_hits.length, hit ? 1 : 0);
    if (hit) {
        const e = raw.needle_hits[0]; assert.equal(e.actor, 0); assert.equal(e.target, 1);
        assert.equal(e.program, held.program);
        assert.equal(e.damage_bonus, d.ability === 'ying' ? b.jiali + 100 : vital ? b.jiali + 180 : Math.trunc(b.jiali / 2));
    }
    const needle = gumuNeedles.find(n => n.program === held.program), poison = needle?.poison;
    if (poison) {
        assert.deepEqual(held.daub.poison, { id: poison.id, name: poison.name, level: poison.level, remain: poison.remain });
        assert.equal(held.daub.poison_type, poison.type);
        for (const [k, v] of Object.entries(needle.daub_by)) assert.equal(held.daub[k], v);
        assert.deepEqual(post.daub, { ...held.daub, poison: { ...held.daub.poison,
            remain: poison.remain - (hit ? poison.level : 0) } });
    } else { assert.deepEqual(held.daub, {}); assert.deepEqual(post.daub, {}); }
    const delivered = hit && poison && poison.id !== bt.id && poison.level >= bt.skills.poison
        && poison.level >= Math.trunc(bt.effective_skills.force / 2);
    const poisoned = delivered && !bt.cultivation['special_skill/piyi'];
    if (poisoned) assert.deepEqual(t.conditions, { [poison.type]: { id: poison.id, name: poison.name,
        level: Math.trunc(poison.level * 8 / 10) + 1, remain: Math.trunc(poison.level * 8 / 10) + 1 } });
    else emptyConditions(t.conditions);
    // The original call continues to busy even when affect_by is blocked by piyi.
    if (delivered && poison.level >= bt.effective_skills.force) between(t.busy, 1, 2);
    else assert.equal(idle(t.busy), idle(bt.busy));
}

export function gumuThrowingEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw).map(r => r.raw);
    const known = raw.filter(r => Number.isFinite(r.before?.[1]?.eff_qi) && Number.isFinite(r.immediate?.[1]?.eff_qi));
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length,
        hit: probability(known.filter(r => r.immediate[1].eff_qi < r.before[1].eff_qi).length, known.length),
        unknown_hit_samples: raw.length - known.length,
        needle_calls: distribution(raw.map(r => Array.isArray(r.needle_hits) ? r.needle_hits.length : null)),
        neili_cost: distribution(raw.map(r => r.before?.[0] && r.immediate?.[0] ? r.before[0].neili - r.immediate[0].neili : null)),
        ammunition_cost: distribution(raw.map(r => Number.isFinite(r.before?.[0]?.handing_details?.amount)
            && Number.isFinite(r.immediate?.[0]?.handing_details?.amount)
            ? r.before[0].handing_details.amount - r.immediate[0].handing_details.amount : null)),
        target_loss: Object.fromEntries(health.map(k => [k, distribution(raw.map(r =>
            r.before?.[1] && r.immediate?.[1] ? r.before[1][k] - r.immediate[1][k] : null))])),
        limitations: ['即时伤害与毒发、减益自然解除分开；不把命中、施毒、耗针互相替代。'] };
}
