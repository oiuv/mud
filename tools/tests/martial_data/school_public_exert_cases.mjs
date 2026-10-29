// Public exert abilities: powerup/shield/heal for common force skills.
// Covers 5.2 gap: force/exert interface verification.
import assert from 'node:assert/strict';
import { busy, cost, counter, range, temp, tempDelta, validateEffectPair } from './observed_effects.mjs';
import { observedEffectSources } from './observed_effect_sources.mjs';

const defaults = {
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    combat_exp: 100000000, str: 36, int: 36, con: 36, dex: 36,
    gender: '男性', character: '光明磊落',
};

const exertEntries = [
    { skill: 'force', move: 'heal', usage: 'force', kind: 'heal' },
    { skill: 'force', move: 'inspire', usage: 'force', kind: 'buff' },
    { skill: 'beiming-shengong', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'beiming-shengong', move: 'shield', usage: 'force', kind: 'buff' },
    { skill: 'bingxin-jue', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'biyun-xinfa', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'hamagong/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'huagong-dafa', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'bahuang-gong/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'bahuang-gong/shield', move: 'shield', usage: 'force', kind: 'buff' },
    { skill: 'bluesea-force/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'bluesea-force/exert/shield', move: 'shield', usage: 'force', kind: 'buff' },
    { skill: 'changsheng-jue/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'changsheng-jue/exert/shield', move: 'shield', usage: 'force', kind: 'buff' },
    { skill: 'dahai-wuliang', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'duanshi-xinfa', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'fenxin-jue', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'freezing-force', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'fushang-neigong', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'hanbing-zhenqi', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'huntian-baojian/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'huntian-qigong/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'huntian-qigong/exert/shield', move: 'shield', usage: 'force', kind: 'buff' },
    { skill: 'jiuyin-shengong/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'jiuyin-shengong/exert/shield', move: 'shield', usage: 'force', kind: 'buff' },
    { skill: 'kuihua-mogong/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'kuihua-mogong/exert/shield', move: 'shield', usage: 'force', kind: 'buff' },
    { skill: 'kurong-changong/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'lengyue-shengong/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'liangyi-shengong/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'lingyuan-xinfa/exert/break', move: 'break', usage: 'force', kind: 'special' },
    { skill: 'xixing-dafa/exert/suck', move: 'suck', usage: 'force', kind: 'special' },
    { skill: 'huagong-dafa/exert/hua', move: 'hua', usage: 'force', kind: 'special' },
    { skill: 'hamagong/exert/hui', move: 'hui', usage: 'force', kind: 'special' },
    { skill: 'hamagong/exert/reserve', move: 'reserve', usage: 'force', kind: 'special' },
    { skill: 'hamagong/exert/tan', move: 'tan', usage: 'force', kind: 'special' },
    { skill: 'hamagong/exert/tui', move: 'tui', usage: 'force', kind: 'special' },
    { skill: 'jiuyang-shengong/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'jiuyang-shengong/exert/roar', move: 'roar', usage: 'force', kind: 'special' },
    { skill: 'jiuyang-shengong/exert/shield', move: 'shield', usage: 'force', kind: 'buff' },
    { skill: 'jiuyin-shengong/exert/roar', move: 'roar', usage: 'force', kind: 'special' },
    { skill: 'kuihua-mogong/exert/roar', move: 'roar', usage: 'force', kind: 'special' },
    { skill: 'longxiang-gong/exert/powerup', move: 'powerup', usage: 'force', kind: 'buff' },
    { skill: 'longxiang-gong/exert/shield', move: 'shield', usage: 'force', kind: 'buff' },
    { skill: 'huntian-baojian/exert/sword', move: 'sword', usage: 'force', kind: 'special' },
];

export function publicExertConditions(catalog, { smoke = false } = {}) {
    const result = [];
    for (const g of exertEntries) {
        // Extract proper skill ID: 'hamagong/powerup' → 'hamagong', 'bluesea-force/exert/powerup' → 'bluesea-force'
        const skillId = g.skill.split('/')[0];
        const reviewed = observedEffectSources[`exert:${skillId}/${g.move}`];
        const source = catalog.skills.find(s => s.path === reviewed?.path);
        assert.ok(source, 'missing actual exert source: ' + skillId + '/' + g.move);
        assert.equal(source.sha256, reviewed.sha256, 'exert source changed; review its effect contract');
        const entry = source.entries?.find(e => e.role === 'exert');
        assert.ok(entry, 'missing exert entry: ' + source.path);
        const entryPath = source.path;
        // No exert file checks can_exert, so only create grant conditions
        for (const expected of ['observed']) {
            // For generic 'force' exerts (heal/inspire), map to 'beiming-shengong'
            // (has valid_enable("force")); for specific force skills, map to that skill
            const forceSkill = skillId === 'force' ? 'beiming-shengong' : skillId;
            const actor = {
                skills: {
                    force: 600, dodge: 400, parry: 400, [skillId]: 400,
                    ...(skillId === 'force' ? { 'beiming-shengong': 400 } : {}),
                    // hamagong/tan needs poison skill
                    ...(g.move === 'tan' && skillId === 'hamagong' ? { poison: 200 } : {}),
                    // hamagong/tui needs high hamagong level
                    ...(g.move === 'tui' && skillId === 'hamagong' ? { hamagong: 300 } : {}),
                },
                mappings: { force: forceSkill },
                preparations: {},
                properties: {
                    ...defaults,
                    // heal needs eff_qi < max_qi to actually trigger
                    ...(g.kind === 'heal' ? { eff_qi: 5000, max_qi: 10000 } : {}),
                    // inspire requires breakup achievement
                    ...(g.move === 'inspire' ? { breakup: 1, eff_jing: 5000, max_jing: 10000 } : {}),
                    // hamagong/tui needs max_neili >= 4000
                    ...(g.move === 'tui' && skillId === 'hamagong' ? { max_neili: 5000, neili: 5000 } : {}),
                    [`can_exert/${skillId}/${g.move}`]: expected === 'observed' ? 1 : 0,
                },
                // hamagong/tan needs poison item in hand
                ...(g.move === 'tan' && skillId === 'hamagong'
                    ? { equipment: { program: '/tests/poison_item', type: 'throwing', hold: true, hand_id: 'poison' } } : {}),
            };
            // hamagong/hui needs hmg_dzjm temp + reserve attribute gains (positive)
            const actorTemp = (g.move === 'hui' && skillId === 'hamagong')
                ? { hmg_dzjm: 200,
                    'apply/dodge': Math.trunc(200 / 3),
                    'apply/parry': Math.trunc(200 / 3),
                    'apply/armor': Math.trunc(200 / 2),
                    'apply/dispel_poison': Math.trunc(200 / 2) }
                : undefined;
            const target = {
                skills: { force: 200, dodge: 200, parry: 200 }, mappings: {}, preparations: {},
                properties: { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000, neili: 3000, max_neili: 3000, jingli: 1000, max_jingli: 1000, jiali: 0, combat_exp: 100000000, str: 36, int: 36, con: 36, dex: 36, gender: '男性', character: '光明磊落' },
                // lingyuan-xinfa/break requires target to be armed
                ...(g.move === 'break' && skillId === 'lingyuan-xinfa'
                    ? { equipment: { type: 'sword', hold: false } } : {}),
            };
            result.push({
                id: `school-public-exert-${skillId}-${g.move}-${expected === 'observed' ? 'grant' : 'refuse'}`,
                stage: 'school', entry_id: entry.id,
                method: 'exert', samples: smoke || g.kind !== 'special' || ['hui', 'reserve', 'sword'].includes(g.move) ? 2 : 100,
                parameters: {
                    school: 'public', family: '公共', collection_group: 'public-exert',
                    skill: skillId, ability: g.move, usage: g.usage, level: 400,
                    kind: g.kind,
                    combination: skillId + '+' + g.move,
                    actor: actorTemp ? { ...actor, temp: actorTemp } : actor,
                    target,
                    named_participants: true,
                    // Special exert moves (break/suck/hua/hui/tan/tui/roar/sword)
                    // require combat context; buff/heal/inspire do not.
                    fighting: g.kind === 'special',
                    // Targeted specials need explicit target (right = opponent)
                    action: ['break', 'suck', 'hua', 'tan', 'tui'].includes(g.move)
                        ? `exert ${g.move} right`
                        : `exert ${g.move}`,
                    expected, not_applicable: '',
                    observation: 'single_action_immediate', observe_seconds: 0,
                    ability_source: { path: entryPath, sha256: source.sha256, entry_id: entry.id },
                    qualification_sources: [entryPath],
                    qualification_note: `公共运功 ${g.skill}/${g.move}。`
                        + (expected === 'observed'
                            ? (g.kind === 'special'
                                ? '战斗中授予后观察原运功发动、效果及费用。'
                                : '授予后观察原运功发动、费用、忙乱与状态变化。')
                            : '未授予时验证原入口拒绝。'),
                },
            });
        }
    }
    return result;
}

const rawLevel = skill => b => b.skills[skill];
const forceLevel = b => b.effective_skills.force;
const thirds = level => b => ({ 'apply/attack': Math.trunc(level(b) / 3), 'apply/defense': Math.trunc(level(b) / 3) });
const armor = level => b => ({ 'apply/armor': Math.trunc(level(b) / 2) });

// A missing condition alone cannot distinguish a legitimate miss from failed loading.
// Legacy hit records remain usable; legacy no-effect records need branch evidence.
function validateTanResult(raw) {
    const [before, target] = raw.before, [after, end] = raw.after;
    assert.equal(target.conditions?.poison ?? null, null, 'tan target must start without poison');
    const poisoned = end.conditions?.poison;
    const trace = raw.tan_result;
    if (trace !== undefined) {
        assert.equal(trace.owner, '/kungfu/skill/hamagong/exert/tan', 'tan branch source');
        assert.equal(trace.actor, before.object, 'tan branch actor');
        assert.equal(trace.target, target.object, 'tan branch target');
        assert.equal(trace.item, before.handing_details.object, 'tan original poison item');
        assert.equal(trace.poison_type, 'poison', 'tan poison condition type');
        assert.equal(trace.poison?.id, 'hamagong-tan', 'tan poison source id');
        assert.equal(trace.poison?.level, 100, 'tan poison level');
        assert.equal(trace.poison?.duration, 10, 'tan poison duration');
        assert.ok(['blocked', 'dodged', 'hit'].includes(trace.branch), 'unknown tan branch');
        const forceMin = Math.trunc(after.neili / 2), forceMax = forceMin + after.neili - 1;
        const ap = Math.trunc(before.skills.poison / 2) + before.effective_skills.force;
        const dodgeMin = Math.trunc(ap / 2), dodgeMax = dodgeMin + ap - 1;
        const dp = Math.trunc(target.effective_skills.dodge * 3 / 2);
        if (trace.branch === 'blocked') assert.ok(forceMin < target.neili, 'impossible tan block');
        else {
            assert.ok(forceMax >= target.neili, 'tan cannot pass force gate');
            if (trace.branch === 'dodged') assert.ok(dodgeMin < dp, 'impossible tan dodge');
            else assert.ok(dodgeMax >= dp, 'tan cannot pass dodge gate');
        }
        if (trace.branch !== 'hit') {
            assert.equal(poisoned ?? null, null, 'miss must not apply poison');
            return;
        }
    }
    assert.ok(poisoned, trace ? 'tan hit did not apply poison' : 'tan no-effect record lacks original branch evidence');
    assert.equal(poisoned.id, 'hamagong-tan', 'applied poison source id');
    assert.equal(poisoned.level, 100, 'applied poison level');
    assert.equal(poisoned.remain, 1000, 'applied poison amount');
}

const buffContracts = {
    'beiming-shengong/powerup': [100, thirds(rawLevel('beiming-shengong'))],
    'beiming-shengong/shield': [100, armor(rawLevel('beiming-shengong'))],
    'bingxin-jue/powerup': [100, thirds(forceLevel)],
    'biyun-xinfa/powerup': [100, thirds(rawLevel('force'))],
    'hamagong/powerup': [90, thirds(rawLevel('hamagong'))],
    'huagong-dafa/powerup': [100, b => ({ 'apply/attack': Math.trunc(b.skills['huagong-dafa'] / 3),
        'apply/dodge': Math.trunc(b.skills['huagong-dafa'] / 3) })],
    'bahuang-gong/powerup': [100, b => ({ 'apply/attack': Math.trunc(b.skills['bahuang-gong'] / 2),
        'apply/dodge': Math.trunc(b.skills['bahuang-gong'] / 3), 'apply/parry': Math.trunc(b.skills['bahuang-gong'] / 3) })],
    'bahuang-gong/shield': [100, armor(rawLevel('bahuang-gong'))],
    'bluesea-force/powerup': [100, b => ({ 'apply/attack': Math.trunc(forceLevel(b) * 2 / 5),
        'apply/defense': Math.trunc(forceLevel(b) * 2 / 5) })],
    'bluesea-force/shield': [100, armor(forceLevel)],
    'changsheng-jue/powerup': [100, b => Object.fromEntries(['attack', 'parry', 'dodge']
        .map(key => ['apply/' + key, Math.trunc(forceLevel(b) * 2 / 5)]))],
    'changsheng-jue/shield': [100, b => ({ 'apply/armor': forceLevel(b) * 3 })],
    'dahai-wuliang/powerup': [100, thirds(forceLevel)],
    'duanshi-xinfa/powerup': [50, b => ({ 'apply/attack': Math.trunc(forceLevel(b) / 5),
        'apply/defense': Math.trunc(forceLevel(b) / 5) })],
    'fenxin-jue/powerup': [100, thirds(rawLevel('fenxin-jue'))],
    'freezing-force/powerup': [100, thirds(rawLevel('freezing-force'))],
    'fushang-neigong/powerup': [90, thirds(forceLevel)],
    'hanbing-zhenqi/powerup': [100, thirds(rawLevel('hanbing-zhenqi'))],
    'huntian-baojian/powerup': [100, b => ({ 'apply/attack': Math.trunc(forceLevel(b) / 2),
        'apply/defense': Math.trunc(forceLevel(b) / 2) })],
    'huntian-qigong/powerup': [100, thirds(forceLevel)],
    'huntian-qigong/shield': [100, b => ({ str: Math.trunc((b.skills['huntian-qigong']
        + (b.skills.checking ?? 0) + (b.skills.begging ?? 0)) / 40),
    dex: Math.trunc((b.skills['huntian-qigong'] + (b.skills.checking ?? 0) + (b.skills.begging ?? 0)) / 40) })],
    'jiuyin-shengong/shield': [100, armor(forceLevel)],
    'kuihua-mogong/shield': [100, armor(forceLevel)],
    'jiuyang-shengong/shield': [100, armor(forceLevel)],
    'kurong-changong/powerup': [100, thirds(rawLevel('kurong-changong'))],
    'lengyue-shengong/powerup': [100, thirds(rawLevel('lengyue-shengong'))],
    'liangyi-shengong/powerup': [100, thirds(rawLevel('liangyi-shengong'))],
    'longxiang-gong/shield': [100, armor(rawLevel('longxiang-gong'))],
    'longxiang-gong/powerup': [100, b => ({ 'apply/attack': Math.trunc(b.skills['longxiang-gong'] / 3)
        + Math.min(13, Math.trunc(b.skills['longxiang-gong'] / 30)) * 15,
    'apply/parry': Math.trunc(b.skills['longxiang-gong'] / 3),
    'apply/dodge': Math.trunc(b.skills['longxiang-gong'] / 3),
    str: Math.min(13, Math.trunc(b.skills['longxiang-gong'] / 30)) * 6 })],
};

export function validatePublicExertRecord(raw, condition, sourceContext) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'public-exert');
    validateEffectPair(raw, condition, 'exert', sourceContext);
    assert.equal(raw.outcome, p.expected);
    assert.equal(raw.launches.length, p.expected === 'observed' ? 1 : 0);
    if (p.expected === 'refused') {
        assert.ok(raw.reason?.length > 0, 'refusal reason');
    }
    if (p.expected === 'observed') {
        // Launch must record the correct skill AND ability
        assert.equal(raw.launches[0].skill, p.skill, 'launch skill must match condition');
        const argAbility = String(raw.launches[0].argument ?? '').split(/\s+/)[0];
        assert.equal(argAbility, p.ability, 'launch ability must match condition');
        const b = raw.before[0], t = raw.before[1], a = raw.after[0], end = raw.after[1];
        const key = `${p.skill}/${p.ability}`, buff = buffContracts[key];
        assert.equal(raw.attacks.length, 0, 'point exert must not contain autonomous ordinary attacks');
        if (buff) {
            const [fee, effects] = buff;
            cost(raw, 0, 'neili', fee);
            for (const [path, delta] of Object.entries(effects(b))) tempDelta(raw, 0, path, delta);
            assert.equal(temp(a, p.ability), 1, 'buff marker');
            for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing']) cost(raw, 0, resource, 0);
        } else if (['jiuyin-shengong/powerup', 'kuihua-mogong/powerup', 'jiuyang-shengong/powerup'].includes(key)) {
            const f = forceLevel(b), ascended = !!p.actor.properties.breakup;
            cost(raw, 0, 'neili', 100);
            tempDelta(raw, 0, 'apply/attack', Math.trunc(f * (ascended ? 2 : 1) / 3));
            const divisor = p.skill === 'jiuyin-shengong' ? (ascended ? 3 : 4)
                : p.skill === 'kuihua-mogong' ? (ascended ? 4 : 5) : (ascended ? 5 : 3);
            const amount = Math.trunc(f * (p.skill === 'jiuyang-shengong' && ascended ? 2 : 1) / divisor);
            for (const path of ['apply/parry', 'apply/dodge']) tempDelta(raw, 0, path, amount);
            assert.equal(temp(a, 'powerup'), 1);
        } else if (p.skill === 'force' && ['heal', 'inspire'].includes(p.ability)) {
            // This is command acceptance only; actual recovery needs the original heartbeat series.
            for (const resource of ['neili', 'qi', 'eff_qi', 'jing', 'eff_jing']) cost(raw, 0, resource, 0);
            assert.equal(temp(a, 'pending/' + (p.ability === 'heal' ? 'healing' : 'inspiring')), 1);
            assert.equal(typeof a.busy, 'string', 'pending recovery busy callback');
        } else if (key === 'lingyuan-xinfa/break') {
            cost(raw, 0, 'neili', 0); assert.equal(busy(a), 2);
            assert.notEqual(t.weapon, 'none', 'armed disarm target');
            if (end.weapon === 'none') {
                assert.equal(busy(end), Math.trunc(b.effective_skills['lingyuan-xinfa'] / 20));
                assert.ok(raw.dropped?.some(o => o.object === t.weapon_details.object), 'same weapon dropped');
            } else {
                assert.equal(end.weapon_details.object, t.weapon_details.object);
                assert.equal(busy(end), busy(t));
            }
        } else if (key === 'hamagong/reserve' || key === 'hamagong/hui') {
            const level = p.ability === 'reserve' ? b.skills.hamagong : temp(b, 'hmg_dzjm');
            assert.ok(level > 0);
            const sign = p.ability === 'reserve' ? 1 : -1;
            for (const [path, divisor] of [['apply/dodge', 3], ['apply/parry', 3],
                ['apply/armor', 2], ['apply/dispel_poison', 2]])
                tempDelta(raw, 0, path, sign * Math.trunc(level / divisor));
            assert.equal(temp(a, 'hmg_dzjm'), p.ability === 'reserve' ? level : 0);
            cost(raw, 0, 'neili', p.ability === 'reserve' ? 100 : b.neili);
        } else if (key === 'xixing-dafa/suck') {
            assert.equal(temp(a, 'sucked'), 1);
            const delta = a.max_neili - b.max_neili, amount = 1 + Math.trunc((b.skills['xixing-dafa'] - 120) / 10);
            assert.ok([0, amount].includes(delta), 'suck max_neili transfer');
            assert.equal(t.max_neili - end.max_neili, delta);
            cost(raw, 0, 'neili', delta ? 10 : 0);
            range(busy(a), delta ? 4 : 7, 7, 'suck busy');
        } else if (key === 'huagong-dafa/hua') {
            const immune = !!t.skills['taixuan-gong'];
            cost(raw, 0, 'neili', immune ? 0 : 100);
            const delta = t.max_neili - end.max_neili;
            if (delta) range(delta, Math.trunc((b.skills['huagong-dafa'] - 90) / 8),
                Math.trunc((b.skills['huagong-dafa'] - 90) / 8) + 3, 'hua max_neili loss');
            if (immune) assert.equal(delta, 0); else range(busy(a), 2, 4, 'hua busy');
        } else if (key === 'hamagong/tan') {
            cost(raw, 0, 'neili', 200); range(busy(a), 2, 3, 'poison busy');
            assert.ok(b.handing_details.object, 'original poison item');
            assert.equal(a.handing, 'none', 'poison consumed');
            validateTanResult(raw);
        } else if (key === 'hamagong/tui') {
            const direct = counter(raw, 0, 'direct'); range(direct, 0, 1, 'tui direct');
            cost(raw, 0, 'neili', direct ? 300 : 200);
            assert.equal(busy(a), direct || t.skills['yiyang-zhi'] ? 2 : 3);
            if (!direct && !t.skills['yiyang-zhi']) {
                cost(raw, 1, 'neili', Math.min(200, t.neili)); assert.equal(busy(end), 1);
            }
        } else if (p.ability === 'roar' && ['jiuyang-shengong', 'jiuyin-shengong', 'kuihua-mogong'].includes(p.skill)) {
            cost(raw, 0, 'neili', 100); cost(raw, 0, 'qi', 10); assert.equal(busy(a), 5);
            // This profile has one enemy. Its low constitution makes the roar gate certain.
            assert.ok(Math.trunc(forceLevel(b) / 2) >= t.con * 2, 'unsupported roar gate profile');
            const damage = Math.max(0, forceLevel(b) - Math.trunc(t.max_neili / 10));
            cost(raw, 1, p.skill === 'jiuyin-shengong' ? 'jing' : 'qi', damage * (p.skill === 'jiuyin-shengong' ? 2 : 3));
            const wound = t.neili < forceLevel(b) * 2 ? damage * (p.skill === 'jiuyang-shengong' ? 2 : p.skill === 'jiuyin-shengong' ? 1 : 2) : 0;
            cost(raw, 1, p.skill === 'kuihua-mogong' ? 'eff_qi' : 'eff_jing', wound);
        } else if (key === 'huntian-baojian/sword') {
            cost(raw, 0, 'neili', 30); assert.equal(a.weapon, 'sword');
            assert.equal(a.weapon_details.program, '/clone/weapon/jianqi');
            assert.equal(b.weapon, 'none');
        } else assert.fail('unreviewed public exert effect: ' + key);
    }
}
