// Original qualification/practice, including real corpse/head materials. No game fixes.
import assert from 'node:assert/strict';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';
import { distribution } from './statistics.mjs';

export const jiuyinLearningGroup = 'emei-jiuyin-learning';
export const clawSkill = 'jiuyin-baiguzhao';
const profiles = [
    { skill: clawSkill, usage: 'claw', force: 90, max: 800, floor: 60, neili: 500 },
    { skill: 'cuixin-zhang', usage: 'strike', force: 100, max: 1200, floor: 100, neili: 350 },
    { skill: 'yinlong-bian', usage: 'whip', force: 100, max: 1200, floor: 100, neili: 350 },
];

export function emeiJiuyinLearningConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(d, ability, level = 200, suffix = '', extra = {}) {
        const { skill } = d, usage = extra.usage ?? d.usage, practice = ability === 'practice';
        const source = catalog.skills.find(s => s.id === skill); assert.ok(source, skill);
        const expected = extra.expected ?? 'observed';
        const actor = { skills: { force: 600, [d.usage]: level + 1, [usage]: level + 1, [skill]: level,
            ...(skill === 'cuixin-zhang' ? { unarmed: level + 1 } : {}), ...extra.skills },
            mappings: extra.unmapped ? {} : { [usage]: skill },
            properties: { qi: 10000, jing: 10000, neili: 10000, max_neili: 10000, int: 36,
                str: 36, dex: 36, jiali: 0, combat_exp: 100000000, ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}) };
        const weapon = extra.weapon ?? (d.usage === 'whip' ? 'whip' : 'none');
        if (weapon !== 'none') actor.equipment = { type: weapon, hold: false };
        const random = skill === clawSkill && ability !== 'valid_learn' && expected === 'observed';
        result.push({ id: `school-emei-jiuyin-learning-${skill}-${ability}-l${level}${suffix ? '-' + suffix : ''}`,
            stage: 'school', entry_id: source.path, method: practice ? 'practice' : 'interface',
            samples: smoke ? (random ? 2 : 1) : random ? samples : 2,
            parameters: { school: 'emei', collection_group: jiuyinLearningGroup,
                combination: practice ? 'practice' : 'qualification', skill, usage, ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: practice ? `practice ${usage} ${extra.times ?? 1}` : 'test_interface',
                ...(practice ? { repetitions: extra.times ?? 1 } : { interface: { object: '/kungfu/skill/' + skill, function: ability } }),
                completed: ability === 'valid_learn' ? 0 : extra.completed ?? (expected === 'refused' ? 0 : extra.times ?? 1),
                materials: extra.materials ?? (skill === clawSkill ? [{ kind: 'head' }] : []),
                room: extra.room ?? {}, observation: 'single_action_immediate',
                fighting: !!extra.fighting, observe_seconds: 0, expected, not_applicable: '',
                qualification_sources: [source.path, 'kungfu/class/emei/zhou.c', 'feature/skill.c',
                    'feature/attribute.c', 'feature/damage.c', 'cmds/skill/practice.c', 'cmds/skill/learn.c',
                    'clone/misc/head.c', 'clone/misc/corpse.c', 'feature/cutable.c'],
                qualification_note: '原学习资格、原practice命令与独立practice_skill接口分开；真实非巫师USER，能力为实验输入，不代表周芷若可教。材料用原head/corpse对象，记录预置已用/切头/携带状态及调用后标记和正文；不代替杀敌、切割或保存生命周期。不改随机或费用，负内力照实保存。',
            } });
    }
    for (const d of profiles) {
        const { skill, usage } = d;
        for (const level of [200, 400, 800]) for (const ability of ['valid_learn', 'practice', 'practice_skill']) add(d, ability, level);
        for (const value of [d.max - 1, d.max]) add(d, 'valid_learn', 200, 'max' + value, {
            properties: { max_neili: value }, expected: value < d.max ? 'refused' : 'observed' });
        for (const value of [d.force - 1, d.force]) add(d, 'valid_learn', 200, 'force' + value, {
            skills: { force: usage === 'whip' ? value : value * 2 }, expected: value < d.force ? 'refused' : 'observed' });
        for (const base of skill === 'cuixin-zhang' ? ['strike', 'unarmed'] : [usage]) {
            for (const value of [d.floor - 1, d.floor]) add(d, 'valid_learn', 1, base + '-floor' + value, {
                skills: { [base]: value, ...(skill === 'cuixin-zhang' ? { [base === 'strike' ? 'unarmed' : 'strike']: 100 } : {}) },
                expected: value < d.floor ? 'refused' : 'observed' });
            for (const value of [199, 200]) add(d, 'valid_learn', 200, base + value, {
                skills: { [base]: value }, expected: value < 200 ? 'refused' : 'observed' });
        }
        for (const ability of ['valid_learn', 'practice', 'practice_skill']) {
            const weapons = usage === 'whip' ? ['none', 'sword'] : ['sword'];
            for (const weapon of weapons) add(d, ability, 200, 'weapon-' + weapon, {
                weapon, expected: ability === 'practice_skill' && usage !== 'whip' ? 'observed' : 'refused' });
        }
        for (const ability of ['practice', 'practice_skill']) for (const [key, floor] of [['qi', 100], ['neili', d.neili]])
            for (const value of [floor - 1, floor]) add(d, ability, 200, key + value, {
                properties: { [key]: value }, expected: value < floor ? 'refused' : 'observed' });
        for (const [suffix, extra] of [['busy', { busy: true }], ['fighting', { fighting: true }],
            ['unmapped', { unmapped: true }], ['equal-basic', { skills: { [usage]: 200 } }],
            ['low-exp', { properties: { combat_exp: 799999 } }], ['times0', { times: 0 }], ['times51', { times: 51 }]])
            add(d, 'practice', 200, suffix, { ...extra, expected: 'refused' });
        for (const level of [200, 400, 800]) add(d, 'practice', level, 'parry', { usage: 'parry' });
        const materials = skill === clawSkill ? Array.from({ length: 3 }, () => ({ kind: 'head' })) : [];
        add(d, 'practice', 200, 'partial-qi', { times: 3, completed: 2, properties: { qi: 180 }, materials });
        add(d, 'practice', 200, 'partial-neili', { times: 3, completed: 2,
            properties: { neili: d.neili + (skill === clawSkill ? 200 : 120) }, materials });
        if (skill !== clawSkill) add(d, 'practice', 200, 'times50', { times: 50 });
    }
    const d = profiles[0];
    for (const str of [9, 10]) add(d, 'valid_learn', 200, 'root-str' + str, {
        properties: { str }, expected: str === 9 ? 'refused' : 'observed' });
    for (const ability of ['practice', 'practice_skill']) {
        for (const [suffix, materials, expected] of [
            ['no-material', [], 'refused'], ['corpse', [{ kind: 'corpse' }], 'observed'],
            ['cut-corpse', [{ kind: 'corpse', cut: true }], 'refused'],
            ['used-head', [{ kind: 'head', used: true }], 'refused'],
            ['used-corpse', [{ kind: 'corpse', used: true }], 'refused'],
            ['carried-head', [{ kind: 'head', carried: true }], 'refused'],
            ['bone', [{ kind: 'head', bone: true }], 'observed'],
            ['mixed', [{ kind: 'corpse', cut: true }, { kind: 'head', used: true }, { kind: 'head' }], 'observed'],
        ]) add(d, ability, 200, suffix, { materials, expected });
        for (const key of ['no_fight', 'sleep_room']) add(d, ability, 200, key, { room: { [key]: 1 }, expected: 'refused' });
        for (const level of [499, 500, 501, 800]) add(d, ability, level, 'neili500', { properties: { neili: 500 } });
    }
    add(d, 'practice', 200, 'one-head-times3', { times: 3, completed: 1 });
    add(d, 'practice', 200, 'three-heads', { times: 3, materials: Array.from({ length: 3 }, () => ({ kind: 'head' })) });
    for (const level of [299, 300, 499, 500]) add(d, 'practice', level, 'gain-boundary');
    return result;
}

export function whiteClawGains(level) {
    return Array.from({ length: level }, (_, n) => 1 + Math.trunc((600 + n * 12) * 100 / (level + 100)));
}

export function validateEmeiJiuyinLearningRecord(raw, condition) {
    const p = condition.parameters, b = raw.before[0], a = raw.immediate[0], n = p.completed;
    assert.equal(raw.outcome, p.expected); assert.equal(raw.launches.length, 0); assert.equal(raw.attacks.length, 0);
    for (const [state, config] of [[b, p.actor], [raw.before[1], p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, config.mappings);
        for (const [k, v] of Object.entries(config.skills)) assert.equal(state.skills[k] ?? 0, v);
        for (const [k, v] of Object.entries(config.properties)) assert.equal(state[k], v);
        assert.equal(state.weapon, config.equipment?.type ?? 'none');
    }
    assert.deepEqual(raw.before[1], raw.immediate[1]);
    assert.deepEqual(a.skills, b.skills, '本批进度不足以升级'); assert.deepEqual(a.mappings, b.mappings);
    assert.equal(a.qi, b.qi - n * 80);
    assert.equal(a.neili, b.neili - n * (p.skill === clawSkill ? p.level : 120));
    for (const k of ['eff_qi', 'jing', 'eff_jing', 'max_neili', 'jingli', 'weapon']) assert.equal(a[k], b[k]);
    const gain = (a.learned[p.skill] ?? 0) - (b.learned[p.skill] ?? 0);
    const common = condition.method === 'practice' ? n * practiceGain(p.level, b.skills[p.usage], b.int) : 0;
    if (p.skill === clawSkill && n) {
        const possible = whiteClawGains(p.level), extra = gain - common;
        assert.ok(extra >= n * possible[0] && extra <= n * possible.at(-1));
        if (n === 1) assert.ok(possible.includes(extra), '不得用超出原随机离散值的进度冒充实测');
    } else assert.equal(gain, common);
    assert.deepEqual(Object.fromEntries(Object.entries(a.learned).filter(([k]) => k !== p.skill)),
        Object.fromEntries(Object.entries(b.learned).filter(([k]) => k !== p.skill)));
    if (condition.method === 'practice') {
        assert.equal(raw.interfaces.length, 0);
        assert.equal(raw.command_accepted, Number(n > 0 && n === p.repetitions));
    } else {
        assert.equal(raw.interfaces.length, 1); const i = raw.interfaces[0];
        assert.equal(i.object, p.interface.object); assert.equal(i.function, p.ability);
        assert.equal(i.result ?? 0, Number(p.expected === 'observed'));
    }
    if (p.expected === 'refused') assert.ok(raw.reason);
    assert.deepEqual(raw.practice_room, { no_fight: p.room.no_fight ?? 0, sleep_room: p.room.sleep_room ?? 0 });
    assert.equal(raw.practice_materials_before.length, p.materials.length);
    assert.equal(raw.practice_materials_after.length, p.materials.length);
    let newlyUsed = 0;
    for (let i = 0; i < p.materials.length; i++) {
        const config = p.materials[i], before = raw.practice_materials_before[i], after = raw.practice_materials_after[i];
        assert.equal(before.program, '/clone/misc/' + config.kind);
        assert.equal(before.location, config.carried ? 'actor' : 'room');
        assert.equal(before.used, Number(!!config.used)); assert.equal(before.cut, Number(!!config.cut));
        assert.equal(after.object, before.object); assert.equal(after.program, before.program);
        assert.equal(after.location, before.location); assert.equal(after.cut, before.cut);
        assert.ok([0, 1].includes(after.used));
        if (after.used > before.used) {
            newlyUsed++; assert.equal(before.location, 'room'); assert.ok(config.kind === 'head' || !before.cut);
            assert.equal(after.long, config.kind === 'head' ? before.long + '上面赫然有五个小洞，伸手一探，刚好可以插入。\n' : before.long);
        } else { assert.equal(after.used, before.used); assert.equal(after.long, before.long); }
    }
    assert.equal(newlyUsed, p.skill === clawSkill ? n : 0, '材料只标记一次，不清除标记制造重复练习');
}

export function jiuyinLearningEffects(rows) {
    return { learned_gain: distribution(rows.map(({ raw: r }) => {
        const keys = new Set([...Object.keys(r.before[0].learned), ...Object.keys(r.immediate[0].learned)]);
        return [...keys].reduce((n, k) => n + (r.immediate[0].learned[k] ?? 0) - (r.before[0].learned[k] ?? 0), 0);
    })), material_newly_used: distribution(rows.map(({ raw: r }) => r.practice_materials_after.reduce(
        (n, m, i) => n + m.used - r.practice_materials_before[i].used, 0))),
    negative_neili: rows.filter(r => r.raw.immediate[0].neili < 0).length };
}
