// Gumu multi-hit, control and heavy-sword collection; original gameplay remains unchanged.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const gumuAdvancedMoves = [
    { skill: 'suxin-jian', ability: 'lian', minimum: 120, neili: 200, grant: true },
    { skill: 'xuantie-jian', ability: 'juan', minimum: 100, neili: 100, grant: true, force: 400 },
    { skill: 'xuantie-jian', ability: 'dong', minimum: 200, neili: 1000, grant: true, force: 400 },
    { skill: 'xuantie-jian', ability: 'xunlei', minimum: 160, neili: 900, grant: false },
];

// Explicit fixture capabilities verified by collector tests and isolated driver runs.
export const gumuAdvancedFixtureRequirements = [
    'explicit equipment weight via original set_weight before moving/wielding',
    'item_make equipment inherits original feature/itemmake, no fake identity override',
    'equipment snapshots include original is_item_make, weight, name and value',
    'dropped equipment snapshot includes original identity, no_wield and value',
    'effective_dex and character snapshots for this group',
    'explicit existing apply/attack and apply/str initial values; verify restoration',
];

export function gumuAdvancedConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(d, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === `${d.skill}/${d.ability}`);
        const entry = source?.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry, '缺少古墓连击／重剑原入口：' + d.ability);
        const force = d.skill === 'suxin-jian' ? 'yunv-xinjing' : 'surge-force';
        const forceLevel = d.force ? Math.max(400, level) : level;
        const actor = {
            skills: { sword: level, [d.skill]: level, force: forceLevel, [force]: forceLevel,
                unarmed: level, parry: level, dodge: level, 'yunv-shenfa': level, ...extra.skills },
            mappings: { sword: d.skill, parry: d.skill, force, dodge: 'yunv-shenfa' },
            properties: { neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 10000000,
                str: 36, int: 36, con: 36, dex: 36, gender: force === 'surge-force' ? '男性' : '女性',
                character: '光明磊落', 'family/family_name': '古墓派',
                [`can_perform/${d.skill}/${d.ability}`]: 1, ...extra.properties },
            ...(extra.noWeapon ? {} : { equipment: { type: extra.weapon ?? 'sword', hold: false,
                weight: extra.weight ?? (d.ability === 'dong' ? 30000 : 3000), value: 100, item_make: !!extra.itemMake } }),
            ...(extra.busy ? { busy: extra.busy } : {}), ...(extra.temp ? { temp: extra.temp } : {}),
        };
        if (extra.noMap) delete actor.mappings.sword;
        if (extra.noParryMap) delete actor.mappings.parry;
        if (extra.noForceMap) delete actor.mappings.force;
        const target = {
            skills: { force: 600, dodge: 600, parry: 600, sword: 200, hammer: 200, ...extra.targetSkills },
            mappings: {}, properties: { combat_exp: 10000000, jiali: 0, str: 36, dex: 36,
                gender: '男性', ...extra.targetProperties },
            ...(extra.targetUnarmed ? {} : { equipment: { type: extra.targetWeapon ?? 'sword',
                hold: false, weight: 3000, value: 100, item_make: !!extra.targetItemMake } }),
            ...(extra.targetBusy ? { busy: extra.targetBusy } : {}),
        };
        result.push({ id: `school-gumu-advanced-${d.skill}-${d.ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method: 'perform', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-advanced',
                combination: `${d.skill}+${force}+yunv-shenfa`, skill: d.skill, ability: d.ability,
                usage: 'sword', level, actor, target, fighting: extra.fighting ?? true,
                observation: 'single_action_immediate', observe_seconds: 0, action: `perform sword.${d.ability}`,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.skill}.c`,
                    `kungfu/skill/${force}.c`, 'kungfu/skill/yunv-shenfa.c',
                    `kungfu/class/gumu/${d.skill === 'suxin-jian' ? 'longnv' : 'yang'}.c`,
                    'kungfu/class/gumu/gumu.h', 'feature/skill.c', 'feature/attribute.c',
                    'feature/equip.c', 'feature/itemmake.c', 'feature/damage.c', 'feature/action.c',
                    'inherit/weapon/sword.c', 'inherit/weapon/hammer.c', 'inherit/weapon/whip.c',
                    'adm/daemons/updated.c',
                    'inherit/skill/force.c', 'inherit/skill/skill.c', 'cmds/skill/perform.c',
                    'include/combat.h', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER，参考古墓原已学组合；资格、装备重量和基础技能为实验初态，不证明自然养成。卷／东200档仍需400原始基本与特殊内功，不冒充全技能200。迅雷不补注释中的领悟或招架映射门槛。重剑恰好25000可发动但不毁兵；打造身份须原实现，碎兵与直伤独立。普通攻击和直伤、计划剑数与实际结算、原始与有效属性分别观察；加力0，不预置心经口诀。',
            } });
    }
    for (const d of gumuAdvancedMoves) {
        for (const level of [200, 400, 800]) add(d, level);
        const check = (suffix, extra = {}) => add(d, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        check('no-grant', { properties: { [`can_perform/${d.skill}/${d.ability}`]: 0 },
            expected: d.grant ? 'refused' : 'observed' });
        for (const offset of [-1, 0]) {
            const label = offset ? 'low' : 'minimum', expected = offset ? 'refused' : 'observed';
            check(label + '-skill', { skills: { [d.skill]: d.minimum + offset }, expected });
            check(label + '-neili', { properties: { neili: d.neili + offset }, expected });
            if (d.force) check(label + '-force', {
                skills: { force: 2, 'surge-force': d.force - 1 + offset }, expected });
        }
        check('no-weapon', { noWeapon: true, expected: 'refused' });
        check('wrong-weapon', { weapon: 'whip', expected: 'refused' });
        check('busy', { busy: 2, expected: 'refused' });
        check('no-fight', { fighting: false, expected: 'refused' });
        check('no-map', { noMap: true, expected: 'refused' });
        check('target-busy', { targetBusy: 50, expected: d.ability === 'juan' ? 'refused' : 'observed' });
        for (const high of [false, true]) add(d, 200, { suffix: high ? '-high-defense' : '-low-defense',
            targetSkills: Object.fromEntries(['force', 'dodge', 'parry'].map(k => [k, high ? 100000 : 2])) });
        if (d.ability === 'lian') {
            for (const offset of [-1, 0]) check(offset ? 'low-basic-dodge' : 'minimum-basic-dodge', {
                skills: { dodge: 100 + offset }, expected: offset ? 'refused' : 'observed' });
            check('no-force-threshold', { skills: { force: 2, 'yunv-xinjing': 1 } });
            add(d, 200, { suffix: '-existing-apply', temp: { 'apply/attack': 11, 'apply/str': 7 } });
        }
        if (d.ability === 'dong') {
            for (const weight of [24999, 25000, 25001]) add(d, 200, { suffix: '-weight' + weight, weight,
                ...(weight < 25000 ? { checks: 2, expected: 'refused' } : {}) });
            for (const weight of [3000, 30000]) add(d, 200, { suffix: '-crafted-weight' + weight, weight, itemMake: true });
            for (const type of ['sword', 'hammer']) for (const made of [false, true])
                add(d, 200, { suffix: `-target-${made ? 'crafted' : 'ordinary'}-${type}`,
                    targetWeapon: type, targetItemMake: made });
            add(d, 200, { suffix: '-target-unarmed', targetUnarmed: true });
            for (const [character, suffix] of [['狡黠多变', 'cunning'], ['国士无双', 'guoshi']])
                for (const level of [200, 400, 800]) add(d, level, { suffix: '-character-' + suffix, properties: { character } });
        }
        if (d.ability === 'xunlei') {
            for (const offset of [-1, 0]) {
                const label = offset ? 'low' : 'minimum', expected = offset ? 'refused' : 'observed';
                check(label + '-surge', { skills: { 'surge-force': 160 + offset }, expected });
                check(label + '-basic-force', { skills: { force: 200 + offset }, expected });
                check(label + '-effective-str', { skills: { unarmed: 90 }, properties: { str: 36 + offset }, expected });
                check(label + '-effective-dex', { properties: { dex: 10 + offset }, expected });
                check(label + '-max-neili', { properties: { max_neili: 2000 + offset, neili: 1000 }, expected });
            }
            check('no-parry-map', { noParryMap: true });
            check('no-force-map', { noForceMap: true });
            add(d, 200, { suffix: '-existing-apply', temp: { 'apply/attack': 11, 'apply/str': 7 } });
        }
    }
    return result;
}

function metric(raw, side, key) {
    const m = raw.metrics?.[side];
    if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
    return Object.hasOwn(m, key) ? m[key] : 0;
}

function sameApply(before, after) {
    assert.ok(before && after && typeof before === 'object' && typeof after === 'object');
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
        const value = o => Object.hasOwn(o, key) ? o[key] : 0;
        assert.ok(Number.isFinite(value(before)) && Number.isFinite(value(after)), '未知临时加成');
        assert.equal(value(after), value(before), '临时加成未恢复：' + key);
    }
}

// LPC undefined busy is serialized as null; a missing field is not an observed zero.
function busy(state) {
    assert.ok(state && Object.hasOwn(state, 'busy'), '缺少忙乱观察');
    const value = state.busy ?? 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效忙乱观察');
    return value;
}

export function validateGumuAdvancedRecord(raw, condition) {
    const p = condition.parameters, d = gumuAdvancedMoves.find(x => x.skill === p.skill && x.ability === p.ability);
    assert.ok(d); assert.equal(p.collection_group, 'gumu-advanced'); assert.equal(condition.method, 'perform');
    assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['attacks', 'launches', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    const [b, bt] = raw.before, [a, t] = raw.immediate;
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, cfg.mappings); assert.equal(busy(state), cfg.busy ?? 0);
        assert.equal(state.weapon, cfg.equipment?.type ?? 'none');
        if (cfg.equipment) {
            assert.equal(state.weapon_details.weight, cfg.equipment.weight);
            assert.equal(state.weapon_details.item_make, cfg.equipment.item_make ? 1 : 0);
            assert.ok(typeof state.weapon_details.object === 'string' && state.weapon_details.object);
            assert.equal(state.weapon_details.value, cfg.equipment.value);
            assert.ok(typeof state.weapon_details.name === 'string' && state.weapon_details.name);
            if (cfg.equipment.item_make)
                assert.equal(state.weapon_details.item_make_source?.replace(/\.(c|lpc)$/, ''), '/feature/itemmake');
            else assert.ok(!state.weapon_details.item_make_source);
        }
        for (const [key, value] of Object.entries(cfg.skills)) {
            assert.equal(state.skills[key] ?? 0, value);
            assert.equal(state.effective_skills[key], Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0)
                + (state.temp?.apply?.[key] ?? 0));
        }
        for (const key of ['neili', 'max_neili', 'jiali', 'combat_exp', 'str', 'dex', 'int', 'con', 'gender'])
            if (Object.hasOwn(cfg.properties, key)) assert.equal(state[key], cfg.properties[key], key);
        if (cfg.properties.character) assert.equal(state.cultivation.character, cfg.properties.character);
        const unarmed = Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => cfg.skills[k] ?? 0));
        assert.equal(state.effective_str, cfg.properties.str + Math.trunc(unarmed / 10) + (cfg.temp?.['apply/str'] ?? 0));
        assert.equal(state.effective_dex, cfg.properties.dex + Math.trunc(cfg.skills.dodge / 10));
        for (const [key, value] of Object.entries(cfg.temp ?? {})) assert.equal(state.temp.apply[key.slice(6)], value);
    }
    const count = (side, key) => {
        const value = metric(raw, side, key);
        assert.ok(Number.isSafeInteger(value) && value >= 0, '未知／无效计数：' + key); return value;
    };
    const cost = count(0, 'neili_cost'), direct = count(0, 'direct');
    assert.equal(a.neili, b.neili - cost); assert.equal(a.weapon, b.weapon);
    sameApply(b.temp.apply, a.temp.apply);
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'max_neili']) assert.equal(a[key], b[key]);
    for (const side of [0, 1]) {
        for (const key of ['neili_recovery', 'jing_cost', 'eff_jing_cost']) assert.equal(count(side, key), 0);
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) {
            assert.ok(Number.isFinite(raw.before[side][key]) && Number.isFinite(raw.immediate[side][key]));
            assert.equal(raw.before[side][key] - raw.immediate[side][key], count(side, key + '_cost'));
        }
    }
    assert.equal(count(1, 'neili_cost'), 0); assert.equal(t.neili, bt.neili);
    assert.equal(count(1, 'direct'), 0);
    if (p.expected === 'refused') {
        assert.equal(cost, 0); assert.equal(direct, 0); assert.equal(raw.launches.length, 0);
        assert.equal(raw.attacks.length, 0); assert.equal(raw.dropped.length, 0);
        assert.equal(a.busy, b.busy); assert.deepEqual(t, bt);
        assert.ok(typeof raw.reason === 'string' && raw.reason); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, d.skill);
    assert.equal(raw.launches[0].argument, d.ability);
    const actorBusy = busy(a), targetBusy = busy(t);
    const attacks = raw.attacks.length;
    for (const attack of raw.attacks) {
        assert.equal(attack.actor, 0); assert.equal(attack.target, 1);
        assert.ok(Object.hasOwn(attack, 'type'), '缺少攻击类型观察');
        // Xunlei omits the optional fourth argument; LPC undefined is serialized as null.
        assert.equal(attack.type ?? 0, d.ability === 'lian' ? 20 : 0);
        assert.ok([0, -1, -2].includes(attack.result)); assert.ok(Number.isFinite(attack.damage));
    }
    for (const [name, value] of [['hit', 0], ['dodge', -1], ['parry', -2]])
        assert.equal(count(0, name), raw.attacks.filter(x => x.result === value).length);
    if (d.ability === 'dong') {
        assert.equal(attacks, 0); assert.ok(direct <= 1);
        const broken = bt.weapon !== 'none' && t.weapon === 'none';
        assert.equal(t.weapon, broken ? 'none' : bt.weapon); assert.equal(raw.dropped.length, broken ? 1 : 0);
        if (broken) {
            assert.ok(b.weapon_details.weight > 25000);
            assert.ok(!bt.weapon_details.item_make || bt.weapon !== 'hammer');
            assert.equal(raw.dropped[0].object, bt.weapon_details.object);
            assert.equal(raw.dropped[0].type, bt.weapon);
            assert.ok(typeof raw.dropped[0].no_wield === 'string' && raw.dropped[0].no_wield);
            assert.equal(raw.dropped[0].value, 0);
            assert.ok(raw.dropped[0].name.includes(bt.weapon_details.name), '碎兵名称失去原名');
        }
        assert.equal(cost, (direct ? 400 : 200) + (broken ? 120 : 0));
        assert.ok((b.cultivation.character === '狡黠多变' ? [1, 2, 3] : [2, 3]).includes(actorBusy));
        assert.equal(targetBusy, direct ? 1 : busy(bt));
        if (!direct) for (const key of ['qi_cost', 'eff_qi_cost']) assert.equal(count(1, key), 0);
        if (condition.id.endsWith('-high-defense')) assert.equal(direct, 0);
        if (condition.id.endsWith('-low-defense')) assert.equal(direct, 1);
    } else {
        assert.equal(direct, 0); assert.equal(t.weapon, bt.weapon); assert.equal(raw.dropped.length, 0);
        if (d.ability === 'juan') {
            assert.equal(attacks, 0); const applied = targetBusy !== busy(bt);
            assert.equal(cost, applied ? 50 : 25); assert.equal(actorBusy, applied ? 0 : 2);
            assert.equal(targetBusy, applied ? Math.trunc(b.effective_skills.sword / 20) + 2 : busy(bt));
            assert.equal(count(1, 'qi_cost'), 0); assert.equal(count(1, 'eff_qi_cost'), 0);
            if (condition.id.endsWith('-high-defense')) assert.ok(!applied);
        } else if (d.ability === 'lian') {
            const planned = cost / 20;
            assert.ok(Number.isInteger(planned) && planned >= 4 && planned <= 8);
            assert.ok(attacks >= 1 && attacks <= planned, '实际攻击不得冒充预扣的计划剑数');
            assert.ok(actorBusy >= 1 && actorBusy <= planned);
            if (condition.id.endsWith('-high-defense')) assert.equal(planned, 4);
        } else {
            assert.ok(attacks >= 1 && attacks <= 3); assert.equal(actorBusy, 3);
            assert.ok(targetBusy > 0); // Existing busy may be interrupted by normal damage before the final busy(1).
            const extra = (cost - 350) / 120;
            assert.ok(Number.isInteger(extra) && extra >= 0 && extra <= count(0, 'hit'));
        }
    }
}

export function gumuAdvancedEffects(records) {
    const rows = records.filter(r => r.outcome === 'observed').map(r => r.raw);
    const weaponRows = rows.filter(r => typeof r.before?.[1]?.weapon === 'string' && r.before[1].weapon !== 'none'
        && typeof r.immediate?.[1]?.weapon === 'string');
    const delta = (r, key) => Number.isFinite(r.before?.[1]?.[key]) && Number.isFinite(r.immediate?.[1]?.[key])
        ? r.before[1][key] - r.immediate[1][key] : null;
    return { samples: rows.length, unknown_or_unobserved: records.length - rows.length,
        attacks: distribution(rows.map(r => Array.isArray(r.attacks) ? r.attacks.length : null)),
        direct_calls: distribution(rows.map(r => metric(r, 0, 'direct'))),
        neili_cost: distribution(rows.map(r => metric(r, 0, 'neili_cost'))),
        actor_busy: distribution(rows.map(r => r.immediate?.[0] && Object.hasOwn(r.immediate[0], 'busy') ? busy(r.immediate[0]) : null)),
        target_busy: distribution(rows.map(r => r.immediate?.[1] && Object.hasOwn(r.immediate[1], 'busy') ? busy(r.immediate[1]) : null)),
        weapon_lost_when_held: probability(weaponRows.filter(r => r.immediate[1].weapon === 'none').length, weaponRows.length),
        target_loss: Object.fromEntries(['qi', 'eff_qi'].map(key => [key, distribution(rows.map(r => delta(r, key)))])),
    };
}
