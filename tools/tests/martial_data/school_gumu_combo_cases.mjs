// Original immediate effects; typo-key diagnostics never count as normal teaching success.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';

export const gumuComboMoves = [
    { skill: 'chilian-shenzhang', ability: 'lian', usage: 'strike', minimum: 100, force: 100, neili: 200, teacher: 'li' },
    { skill: 'sad-strike', ability: 'xiao', usage: 'unarmed', minimum: 150, force: 320, neili: 500, teacher: 'yang' },
    { skill: 'sad-strike', ability: 'tuo', usage: 'unarmed', minimum: 180, force: 360, neili: 500, teacher: 'yang' },
];

export const gumuComboFixtureRequirements = [
    'Capture both actual grant keys for lian; wrong-key cases are diagnostic only, never normal teaching success.',
    'Capture character, static/marry, couple/id, couple/name and the relevant grant in cultivation snapshots.',
    'Allow explicit initial apply/attack; preserve and observe its value, including negative residuals.',
    'Capture original time() before and immediately after the action; prepare recent/expired cooldown relative to the original clock.',
    'Keep normal attacks, passive damage and direct damage separate; do not clamp a negative neili result.',
];

export function gumuComboConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(d, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === `${d.skill}/${d.ability}`);
        const entry = source?.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry, '缺少古墓连击／婚姻绝招入口');
        const force = d.skill === 'sad-strike' ? 'surge-force' : 'yunv-xinjing';
        const forceLevel = d.skill === 'sad-strike' ? Math.max(level, 300) : level;
        const diagnostic = d.ability === 'lian' && !!extra.diagnostic;
        const actor = {
            skills: { [d.usage]: level, [d.skill]: level, parry: level, force: forceLevel, [force]: forceLevel,
                dodge: level, 'yunv-shenfa': level, ...extra.skills },
            mappings: { [d.usage]: d.skill, parry: d.skill, force, dodge: 'yunv-shenfa' },
            preparations: extra.noPrepare ? {} : { [d.usage]: d.skill },
            properties: { neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 10000000,
                str: 36, int: 36, con: 36, dex: 36, gender: d.skill === 'sad-strike' ? '男性' : '女性',
                character: '光明磊落', 'family/family_name': '古墓派',
                [`can_perform/${d.skill}/${d.ability}`]: 1,
                ...(d.ability === 'lian' ? { 'can_perform/chiilian-shenzhang/lian': Number(diagnostic) } : {}),
                ...(d.ability === 'tuo' ? { 'static/marry': 1, 'couple/id': 'test_partner', 'couple/name': '测试伴侣' } : {}),
                ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: extra.busy } : {}),
            ...(extra.temp ? { temp: extra.temp } : {}),
        };
        if (extra.noMap) delete actor.mappings[d.usage];
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, preparations: {}, properties: { combat_exp: 10000000, jiali: 0, gender: '男性',
                character: '光明磊落' }, equipment: { type: 'sword', hold: false },
            ...(extra.targetBusy ? { busy: extra.targetBusy } : {}) };
        const expected = extra.expected ?? (d.ability === 'lian' && !diagnostic ? 'refused' : 'observed');
        result.push({ id: `school-gumu-combo-${d.skill}-${d.ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method: 'perform',
            samples: smoke ? 2 : extra.checks ?? (expected === 'refused' ? 2 : samples),
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-combo',
                skill: d.skill, ability: d.ability, usage: d.usage, level,
                combination: `${d.skill}+${force}+yunv-shenfa`, actor, target,
                fighting: extra.fighting ?? true, action: `perform ${d.usage}.${d.ability}`,
                observation: 'single_action_immediate', observe_seconds: 0, expected, not_applicable: '',
                diagnostic_only: diagnostic, blocking_finding: d.ability === 'lian' ? 'MA-116' : '',
                ...(extra.cooldownAge !== undefined ? { cooldown_age_seconds: extra.cooldownAge } : {}),
                qualification_sources: [source.path, `kungfu/skill/${d.skill}.c`, `kungfu/skill/${force}.c`,
                    'kungfu/skill/yunv-shenfa.c', `kungfu/class/gumu/${d.teacher}.c`, 'kungfu/class/gumu/gumu.h',
                    'feature/skill.c', 'feature/attribute.c', 'feature/action.c', 'feature/dbase.c',
                    'feature/damage.c', 'feature/equip.c', 'inherit/weapon/sword.c', 'mudcore/inherit/action.c',
                    'inherit/skill/skill.c', 'cmds/skill/perform.c', 'adm/daemons/combatd.c'],
                qualification_note: '真实非巫师USER，光明磊落、加力0，师承和婚姻资料仅为隔离实验资格。黯然200档另配300级基本／特殊内功，不冒充全技能200。赤练正常教学键保留原拒绝，错键只在diagnostic_only组显式赋值，不能算自然玩家可发动。原连击先预扣，实际攻击可因脱战提前结束；不钳制负内力，不修复失败后的命中残留。拖泥只观察本次冷却写入，recent／expired为明示相对时钟初态，不冒充自然等候60秒。',
            } });
    }
    for (const d of gumuComboMoves) {
        for (const level of [200, 400, 800]) {
            add(d, level);
            if (d.ability === 'lian') add(d, level, { suffix: '-diagnostic', diagnostic: true });
        }
        const check = (suffix, extra = {}) => add(d, 200, {
            suffix: '-' + (d.ability === 'lian' ? 'diagnostic-' : '') + suffix,
            diagnostic: d.ability === 'lian', checks: 2, ...extra,
        });
        check('no-grant', { properties: {
            [`can_perform/${d.ability === 'lian' ? 'chiilian-shenzhang' : d.skill}/${d.ability}`]: 0 }, expected: 'refused' });
        for (const low of [false, true]) {
            const label = low ? 'low' : 'minimum', expected = low ? 'refused' : 'observed';
            check(label + '-skill', { skills: { [d.skill]: d.minimum - Number(low) }, expected });
            check(label + '-neili', { properties: { neili: d.neili - Number(low) }, expected });
            check(label + '-force', { skills: { force: 2,
                [d.skill === 'sad-strike' ? 'surge-force' : 'yunv-xinjing']: d.force - 1 - Number(low) }, expected });
        }
        check('no-map', { noMap: true, expected: 'refused' });
        check('no-prepare', { noPrepare: true, expected: 'refused' });
        check('busy', { busy: 2, expected: 'refused' });
        check('no-fight', { fighting: false, expected: 'refused' });
        check('weapon', { weapon: true, expected: d.ability === 'tuo' ? 'observed' : 'refused' });
        check('target-busy', { targetBusy: 50 });
        for (const high of [false, true]) add(d, 200, {
            suffix: (d.ability === 'lian' ? '-diagnostic' : '') + (high ? '-high-defense' : '-low-defense'),
            diagnostic: d.ability === 'lian',
            targetSkills: { force: high ? 100000 : 2, parry: high ? 100000 : 2, dodge: high ? 100000 : 2 },
        });
        if (d.ability === 'lian') {
            add(d, 200, { suffix: '-diagnostic-existing-attack', diagnostic: true, temp: { 'apply/attack': 17 } });
            add(d, 200, { suffix: '-diagnostic-existing-attack-high-defense', diagnostic: true,
                temp: { 'apply/attack': 17 }, targetSkills: { parry: 100000 } });
            check('wrong-key-only', { properties: { 'can_perform/chilian-shenzhang/lian': 0 } });
        } else if (d.ability === 'xiao') {
            for (const level of [600, 601]) add(d, level);
            for (const [level, neili] of [[600, 500], [601, 500], [800, 499], [800, 500], [800, 559], [800, 560]])
                add(d, level, { suffix: '-neili' + neili, properties: { neili },
                    expected: neili < 500 ? 'refused' : 'observed' });
            add(d, 200, { suffix: '-existing-attack', temp: { 'apply/attack': 17 } });
        } else {
            check('no-partner', { properties: { 'couple/id': 0 }, expected: 'refused' });
            check('remarried', { properties: { 'static/marry': 2 }, expected: 'refused' });
            check('recent-cooldown', { cooldownAge: 0, expected: 'refused' });
            check('expired-cooldown', { cooldownAge: 61 });
            for (const max_neili of [5000, 5001]) add(d, 200, { suffix: '-max-neili' + max_neili,
                properties: { neili: 5000, max_neili } });
        }
    }
    return result;
}

function counter(raw, side, key) {
    const metrics = raw.metrics?.[side];
    assert.ok(metrics && typeof metrics === 'object' && !Array.isArray(metrics));
    const n = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(n) && n >= 0, '未知或无效计数：' + key);
    return n;
}
const tempAttack = s => s.temp?.apply?.attack ?? 0;
const cooldown = s => s.temp?.last_perform?.['sad-strike']?.tuo ?? 0;
const otherApply = s => Object.fromEntries(Object.entries(s.temp.apply).filter(([k]) => k !== 'attack'));
function busy(state) {
    assert.ok(Object.hasOwn(state, 'busy'), '缺少忙乱观测');
    const value = state.busy === null ? 0 : state.busy;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效忙乱观测');
    return value;
}
const withoutFailure = temp => Object.fromEntries(Object.entries(temp).filter(([k]) => k !== 'notify_fail'));

export function validateGumuComboRecord(raw, c) {
    const p = c.parameters;
    const d = gumuComboMoves.find(x => x.skill === p.skill && x.ability === p.ability);
    assert.ok(d); assert.equal(p.collection_group, 'gumu-combo'); assert.equal(c.method, 'perform');
    assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2);
    for (const key of ['launches', 'attacks', 'dropped']) assert.ok(Array.isArray(raw[key]));
    const [b, bt] = raw.before, [a, t] = raw.immediate;
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.wizardp, 0); assert.equal(state.interactive, 1);
        assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.preparations, cfg.preparations);
        assert.equal(state.weapon, cfg.equipment?.type ?? 'none'); assert.equal(busy(state), cfg.busy ?? 0);
        assert.equal(state.cultivation.character, cfg.properties.character);
        for (const [key, value] of Object.entries(cfg.skills)) {
            assert.equal(state.skills[key], value);
            assert.equal(state.effective_skills[key], Math.trunc(value / 2)
                + (cfg.skills[cfg.mappings[key]] ?? 0) + (state.temp.apply[key] ?? 0), key);
        }
        for (const [key, value] of Object.entries(cfg.properties))
            assert.equal(key.includes('/') || key === 'character' ? state.cultivation[key] : state[key], value, key);
    }
    busy(a); busy(t);
    assert.equal(tempAttack(b), p.actor.temp?.['apply/attack'] ?? 0);
    for (const side of [0, 1]) {
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            assert.ok(Number.isFinite(raw.before[side][key]) && Number.isFinite(raw.immediate[side][key]));
            assert.equal(raw.before[side][key] - raw.immediate[side][key], counter(raw, side, key + '_cost'), key);
            if (side === 0 && key !== 'neili' || ['jing', 'eff_jing'].includes(key))
                assert.equal(counter(raw, side, key + '_cost'), 0);
        }
        assert.equal(counter(raw, side, 'neili_recovery'), 0);
        assert.equal(raw.immediate[side].max_neili, raw.before[side].max_neili);
        assert.equal(raw.immediate[side].weapon, raw.before[side].weapon);
    }
    assert.equal(counter(raw, 1, 'direct'), 0); assert.equal(counter(raw, 1, 'neili_cost'), 0);
    assert.equal(raw.dropped.length, 0);
    const cost = counter(raw, 0, 'neili_cost'), direct = counter(raw, 0, 'direct');
    if (d.ability === 'tuo') {
        assert.ok(Number.isSafeInteger(b.clock_seconds)); assert.ok(Number.isSafeInteger(a.clock_seconds));
        assert.ok(a.clock_seconds >= b.clock_seconds);
        if (p.cooldown_age_seconds !== undefined)
            assert.ok(Math.abs(b.clock_seconds - cooldown(b) - p.cooldown_age_seconds) <= 1);
    }
    if (p.expected === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(raw.attacks.length, 0);
        assert.equal(raw.launches.length, 0); assert.equal(a.busy, b.busy);
        assert.deepEqual(withoutFailure(a.temp), withoutFailure(b.temp));
        assert.deepEqual({ ...t, clock_seconds: bt.clock_seconds }, bt);
        assert.ok(raw.reason?.length > 0);
        return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, d.skill);
    assert.equal(raw.launches[0].argument, d.ability);
    assert.deepEqual(t.temp.apply, bt.temp.apply);
    if (d.ability === 'tuo') {
        assert.equal(raw.attacks.length, 0); assert.ok([0, 1].includes(direct));
        assert.equal(cost, direct ? 400 : 200); assert.ok([2, 3].includes(a.busy));
        assert.equal(t.busy, bt.busy); assert.deepEqual(a.temp.apply, b.temp.apply);
        if (direct) assert.ok(cooldown(a) >= b.clock_seconds && cooldown(a) <= a.clock_seconds);
        else { assert.equal(cooldown(a), cooldown(b)); assert.equal(t.qi, bt.qi); assert.equal(t.eff_qi, bt.eff_qi); }
        if (c.id.endsWith('-high-defense')) assert.equal(direct, 0);
        if (c.id.endsWith('-low-defense')) assert.equal(direct, 1);
        return;
    }
    assert.equal(direct, 0);
    let plans;
    if (d.ability === 'xiao') {
        const level = b.skills[d.skill]; plans = 6 + (level > 600 ? Math.trunc((level - 400) / 200) : 0);
        assert.equal(cost, 70 * plans); assert.ok(a.busy >= 2 && a.busy <= 5);
        assert.equal(tempAttack(a), tempAttack(b)); assert.deepEqual(otherApply(a), otherApply(b));
        // Original normal damage interrupts integer busy; xiao may set busy again on a later hit.
        assert.ok(busy(bt) && !raw.attacks.some(hit => hit.damage > 0)
            ? busy(t) === busy(bt) : [0, 1].includes(busy(t)));
    } else {
        assert.equal(p.diagnostic_only, true, '错键可达不等于正常教学成功');
        plans = cost / 20;
        assert.ok(Number.isSafeInteger(plans) && plans >= 4 && plans <= Math.min(8, 3 + Math.trunc(b.effective_skills.strike / 40)));
        assert.ok(a.busy >= 1 && a.busy <= plans);
        assert.equal(busy(t), raw.attacks.some(hit => hit.damage > 0) ? 0 : busy(bt));
        assert.ok([0, -70].includes(tempAttack(a) - tempAttack(b)));
        if (c.id.endsWith('-high-defense')) assert.equal(tempAttack(a) - tempAttack(b), -70);
        assert.deepEqual(otherApply(a), otherApply(b));
    }
    assert.ok(raw.attacks.length > 0 && raw.attacks.length <= plans);
    for (const hit of raw.attacks) {
        assert.equal(hit.actor, 0); assert.equal(hit.target, 1);
        assert.ok(Object.hasOwn(hit, 'type'), '缺少攻击类型');
        assert.equal(hit.type === null ? 0 : hit.type, 0);
    }
}

export function gumuComboEffects(records, condition) {
    const summarize = rows => ({ samples: rows.length,
        neili_cost: distribution(rows.map(r => r.raw.metrics?.[0]
            ? (Object.hasOwn(r.raw.metrics[0], 'neili_cost') ? r.raw.metrics[0].neili_cost : 0) : null)),
        actual_attacks: distribution(rows.map(r => Array.isArray(r.raw.attacks) ? r.raw.attacks.length : null)),
        remaining_neili: distribution(rows.map(r => r.raw.immediate?.[0]?.neili)),
        attack_residual: distribution(rows.map(r => r.raw.before?.[0]?.temp?.apply && r.raw.immediate?.[0]?.temp?.apply
            ? tempAttack(r.raw.immediate[0]) - tempAttack(r.raw.before[0]) : null)) });
    const rows = records.filter(r => r.outcome === 'observed');
    const scope = condition?.parameters?.diagnostic_only;
    return { normal: summarize(scope === false ? rows : []),
        diagnostic: summarize(scope === true ? rows : []),
        unknown_scope: typeof scope === 'boolean' ? 0 : rows.length,
        unobserved: records.length - rows.length };
}
