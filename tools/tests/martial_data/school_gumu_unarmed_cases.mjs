// Original unarmed entry points; never substitute raw and effective dodge levels.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const gumuUnarmedMoves = [
    { skill: 'meinv-quan', ability: 'you', usage: 'unarmed', minimum: 80, neili: 180,
        force: 120, teacher: 'longnv', dodge: 'yunv-shenfa', direct: true },
    { skill: 'tianluo-diwang', ability: 'wang', usage: 'strike', minimum: 60, neili: 70,
        dodgeMinimum: 40, teacher: 'longnv', dodge: 'yunv-shenfa', direct: false },
    { skill: 'wudu-shenzhang', ability: 'huan', usage: 'strike', minimum: 100, neili: 200,
        dodgeMinimum: 150, teacher: 'li', dodge: 'qixing-bu', direct: false },
];

export const gumuUnarmedFixtureRequirements = [
    '五毒全局动作表首次加载须有真实实验玩家上下文，记录其技能及首次加载身份；不得更改原初始化表达式。',
    '保留初始prepared、领悟、性格和有效等级快照；使用原perform命令，不直接调用绝招绕过分发。',
    '副手单独持器、失去存活资格及控制自然解除另采；本模块不声称已覆盖这些状态。',
];

export function gumuUnarmedConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(d, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === `${d.skill}/${d.ability}`);
        const entry = source?.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry, '缺少古墓徒手入口：' + d.skill);
        const actor = {
            skills: { [d.usage]: level, [d.skill]: level, force: level, 'yunv-xinjing': level,
                parry: level, dodge: level, [d.dodge]: level, ...extra.skills },
            mappings: { [d.usage]: d.skill, parry: d.skill, force: 'yunv-xinjing', dodge: d.dodge },
            preparations: extra.noPrepare ? {} : { [d.usage]: d.skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, combat_exp: 10000000,
                str: 36, int: 36, con: 36, dex: 36, gender: '女性', character: '国士无双',
                'family/family_name': '古墓派', [`can_perform/${d.skill}/${d.ability}`]: 1,
                ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: extra.busy } : {}),
        };
        if (extra.noMap) delete actor.mappings[d.usage];
        const target = {
            skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: { ...extra.targetMappings },
            properties: { combat_exp: 10000000, gender: '女性', shen: 0, character: '光明磊落',
                ...extra.targetProperties },
            equipment: { type: 'sword', hold: false }, ...(extra.targetBusy ? { busy: extra.targetBusy } : {}),
        };
        result.push({ id: `school-gumu-unarmed-${d.skill}-${d.ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method: 'perform', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-unarmed',
                combination: `${d.skill}+yunv-xinjing+${d.dodge}`, skill: d.skill, usage: d.usage,
                ability: d.ability, level, actor, target, fighting: extra.fighting ?? true,
                observation: 'single_action_immediate', observe_seconds: 0,
                action: `perform ${d.usage}.${d.ability}`, expected: extra.expected ?? 'observed',
                not_applicable: '', qualification_sources: [source.path, `kungfu/skill/${d.skill}.c`,
                    `kungfu/class/gumu/${d.teacher}.c`, 'kungfu/class/gumu/gumu.h',
                    'kungfu/skill/yunv-xinjing.c', `kungfu/skill/${d.dodge}.c`, 'feature/skill.c',
                    'feature/action.c', 'feature/equip.c', 'inherit/weapon/sword.c', 'cmds/skill/enable.c',
                    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'adm/daemons/combatd.c'],
                qualification_note: '真实非巫师女性USER，国士无双、加力0；按小龙女／李莫愁技能来源设实验资格，不等于自然养成。准备字段是单技实验初态，互备须另经原prepare命令采集。未检查的内功／轻功不添加门槛；低资格对照不代表能够学习。天罗地网判定读目标基本轻功，千幻神诀用攻击方原始掌法及基本轻功、目标有效轻功；原始与有效等级分别记录。',
            } });
    }
    for (const d of gumuUnarmedMoves) {
        for (const level of [200, 400, 800]) add(d, level);
        const check = (suffix, extra) => add(d, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        check('no-grant', { properties: { [`can_perform/${d.skill}/${d.ability}`]: 0 }, expected: 'refused' });
        check('low-skill', { skills: { [d.skill]: d.minimum - 1 }, expected: 'refused' });
        check('minimum-skill', { skills: { [d.skill]: d.minimum } });
        check('low-neili', { properties: { neili: d.neili - 1 }, expected: 'refused' });
        check('minimum-neili', { properties: { neili: d.neili } });
        check('weapon', { weapon: true, expected: 'refused' });
        check('busy', { busy: 2, expected: 'refused' });
        check('no-fight', { fighting: false, expected: 'refused' });
        check('no-map', { noMap: true, expected: 'refused' });
        check('no-prepare', { noPrepare: true, expected: 'refused' });
        check('target-busy', { targetBusy: 50, expected: d.direct ? 'observed' : 'refused' });
        if (d.force) for (const low of [false, true]) check(low ? 'low-force' : 'minimum-force', {
            skills: { force: 2, 'yunv-xinjing': d.force - 1 - Number(low) },
            expected: low ? 'refused' : 'observed',
        });
        else check('no-force-threshold', { skills: { force: 2, 'yunv-xinjing': 1 } });
        if (d.dodgeMinimum) for (const low of [false, true]) check(low ? 'low-dodge' : 'minimum-dodge', {
            skills: { dodge: 2, [d.dodge]: d.dodgeMinimum - 1 - Number(low) },
            expected: low ? 'refused' : 'observed',
        });
        else check('no-dodge-threshold', { skills: { dodge: 2, [d.dodge]: 1 } });
        for (const high of [false, true]) add(d, 200, {
            suffix: high ? '-high-defense' : '-low-defense',
            targetSkills: { [d.direct ? 'force' : 'dodge']: high ? 100000 : 2 },
        });
        if (d.ability === 'wang') for (const special of [1, 10000]) add(d, 200, {
            suffix: `-target-dodge-mapped-${special}`, targetSkills: { dodge: 200, 'yunv-shenfa': special },
            targetMappings: { dodge: 'yunv-shenfa' },
        });
        if (d.ability === 'huan') {
            for (const level of [200, 400, 800]) for (const [gender, shen] of [['女性', 1], ['男性', 0], ['男性', 1]])
                add(d, level, { suffix: `-${gender === '男性' ? 'male' : 'female'}-shen${shen}`,
                    targetProperties: { gender, shen } });
            for (const basic of [2, 400]) add(d, 200, { suffix: `-raw-dodge-${basic}`,
                skills: { dodge: basic, [d.dodge]: 300 - Math.trunc(basic / 2) } });
        }
    }
    return result;
}

function counter(raw, side, key) {
    const metrics = raw.metrics?.[side];
    assert.ok(metrics && typeof metrics === 'object' && !Array.isArray(metrics), '缺少真实计数');
    const value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效计数：' + key);
    return value;
}

// LPC undefined serializes as null; only an explicitly observed field means zero.
function busy(state) {
    assert.ok(state && Object.hasOwn(state, 'busy'), '缺少忙乱观测');
    const value = state.busy ?? 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效忙乱观测');
    return value;
}

export function validateGumuUnarmedRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-unarmed'); assert.equal(condition.method, 'perform');
    const d = gumuUnarmedMoves.find(x => x.skill === p.skill && x.ability === p.ability);
    assert.ok(d); assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'attacks', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    const [b, bt] = raw.before, [a, t] = raw.immediate;
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings); assert.equal(state.weapon, cfg.equipment?.type ?? 'none');
        assert.equal(busy(state), cfg.busy ?? 0);
        assert.equal(state.cultivation.character, cfg.properties.character);
        if (cfg.preparations) assert.deepEqual(state.preparations, cfg.preparations);
        for (const [key, value] of Object.entries(cfg.skills)) {
            assert.equal(state.skills[key] ?? 0, value, key);
            assert.equal(state.effective_skills[key], Math.trunc(value / 2)
                + (cfg.skills[cfg.mappings[key]] ?? 0) + (state.temp.apply[key] ?? 0), key);
        }
        for (const key of ['neili', 'max_neili', 'jiali', 'gender', 'shen', 'str', 'int', 'con', 'dex', 'combat_exp'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key], key);
    }
    assert.ok(Object.hasOwn(b, 'perform_grant'), '缺少领悟观测');
    assert.equal(b.perform_grant, p.actor.properties[`can_perform/${p.skill}/${p.ability}`]);
    if (p.skill === 'wudu-shenzhang') {
        const load = raw.skill_load_context;
        assert.equal(load?.actor, b.object); assert.deepEqual(load.skills, b.skills);
        assert.equal(load.command, 'enable parry wudu-shenzhang');
        assert.ok([0, 1].includes(load.already_loaded));
    }
    busy(a); busy(t);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.dropped.length, 0);
    for (const side of [0, 1]) {
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            assert.ok(Number.isFinite(raw.before[side][key])); assert.ok(Number.isFinite(raw.immediate[side][key]));
            assert.equal(raw.before[side][key] - raw.immediate[side][key], counter(raw, side, key + '_cost'), key);
            if (side === 0 || key !== 'qi' && key !== 'eff_qi')
                if (key !== 'neili') assert.equal(counter(raw, side, key + '_cost'), 0);
        }
        assert.equal(counter(raw, side, 'neili_recovery'), 0);
        assert.equal(raw.immediate[side].max_neili, raw.before[side].max_neili);
        assert.deepEqual(raw.immediate[side].temp.apply, raw.before[side].temp.apply);
    }
    assert.equal(counter(raw, 1, 'direct'), 0); assert.equal(counter(raw, 1, 'neili_cost'), 0);
    const direct = counter(raw, 0, 'direct'), cost = counter(raw, 0, 'neili_cost');
    if (p.expected === 'refused') {
        assert.equal(direct, 0); assert.equal(cost, 0); assert.equal(raw.launches.length, 0);
        assert.equal(a.busy, b.busy); assert.deepEqual(t, bt); assert.ok(raw.reason?.length > 0);
        return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, d.skill);
    assert.equal(raw.launches[0].argument, d.ability);
    if (d.direct) {
        assert.ok([0, 1].includes(direct)); assert.equal(cost, direct ? 100 : 0);
        assert.equal(a.busy, direct ? 2 : 3); assert.equal(t.busy, bt.busy);
        if (direct) assert.ok(b.effective_skills.force - 1 > Math.trunc(bt.effective_skills.force / 2));
        if (!direct) for (const key of ['qi', 'eff_qi']) assert.equal(t[key], bt[key]);
        if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
    } else {
        assert.equal(direct, 0);
        for (const key of ['qi', 'eff_qi']) assert.equal(t[key], bt[key]);
        assert.equal(busy(bt), 0);
        const applied = busy(t) > 0;
        if (condition.id.endsWith('-high-defense')) assert.equal(applied, false);
        if (d.ability === 'wang') {
            assert.equal(cost, 60);
            assert.ok(applied ? [2, 3].includes(a.busy) : a.busy === 1);
            if (applied) {
                assert.ok(b.skills[d.skill] - 1 > Math.trunc(bt.skills.dodge / 2));
                assert.equal(t.busy, Math.trunc(b.skills[d.skill] / 16) + 2);
            }
        } else {
            let ap = b.skills[d.skill] + Math.trunc(b.skills.dodge / 2);
            if (bt.shen > 0) ap += Math.trunc(ap * 10 / 100);
            if (bt.gender !== '女性') ap += Math.trunc(ap * 15 / 100);
            assert.equal(cost, applied ? 80 : 30); assert.equal(a.busy, applied ? 1 : 2);
            if (applied) {
                assert.ok(ap - 1 > Math.trunc(bt.effective_skills.dodge / 2));
                assert.equal(t.busy, Math.trunc(ap / 45) + 1);
            }
        }
    }
}

export function gumuUnarmedEffects(records) {
    const rows = records.filter(r => r.outcome === 'observed').map(r => r.raw);
    const metric = (r, key) => r.metrics?.[0]
        ? (Object.hasOwn(r.metrics[0], key) ? r.metrics[0][key] : 0) : null;
    const direct = rows.map(r => metric(r, 'direct')).filter(Number.isFinite);
    const observedBusy = state => state && Object.hasOwn(state, 'busy') ? state.busy ?? 0 : undefined;
    const control = rows.filter(r => Number.isFinite(observedBusy(r.before?.[1]))
        && Number.isFinite(observedBusy(r.immediate?.[1])));
    return { samples: rows.length, direct_resolution: probability(direct.filter(n => n > 0).length, direct.length),
        control_applied: probability(control.filter(r => observedBusy(r.immediate[1]) !== observedBusy(r.before[1])).length, control.length),
        actor_busy: distribution(rows.map(r => observedBusy(r.immediate?.[0]))),
        target_busy: distribution(rows.map(r => observedBusy(r.immediate?.[1]))),
        neili_cost: distribution(rows.map(r => metric(r, 'neili_cost'))),
        // Busy values are ticks; this immediate module makes no duration claim.
        unknown_or_unobserved: records.length - rows.length };
}

// For an isolated unarmed run, record the real first loader, not just later users.
export function validateGumuUnarmedLoads(records) {
    const loads = records.filter(r => r.condition_id?.startsWith('school-gumu-unarmed-wudu-shenzhang-'));
    for (const [index, row] of loads.entries()) {
        assert.equal(row.skill_load_context?.already_loaded, Number(index > 0), '五毒首次加载证据缺失');
        assert.equal(row.skill_load_context.actor, row.before[0].object);
        assert.deepEqual(row.skill_load_context.skills, row.before[0].skills);
    }
}
