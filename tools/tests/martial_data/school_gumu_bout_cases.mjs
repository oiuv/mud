// Prepared USER-only combinations. Registration and real-driver acceptance are separate.
import assert from 'node:assert/strict';
import { validateBoutRecord } from './bout_cases.mjs';
import { validateAttackRoundCounts } from './school_wudang_passive_cases.mjs';
import { gumuWeapons, validateGumuAttackLoads } from './school_gumu_weapons_cases.mjs';
import { gumuUnarmedAttacks } from './school_gumu_unarmed_attack_cases.mjs';
import { distribution } from './statistics.mjs';

export const gumuBoutProfiles = [
    { skill: 'suxin-jian', usage: 'sword', teacher: 'longnv', gender: '女性', wall: 1 },
    { skill: 'yinsuo-jinling', usage: 'whip', teacher: 'longnv', gender: '女性', wall: 1 },
    { skill: 'xuantie-jian', usage: 'sword', teacher: 'yang', gender: '男性', force: 'surge-force' },
    { skill: 'tianluo-diwang', usage: 'strike', teacher: 'longnv', gender: '女性', paired: true },
    { skill: 'fireice-strike', usage: 'strike', teacher: 'yang', gender: '男性', force: 'surge-force', paired: true },
    { skill: 'wudu-shenzhang', usage: 'strike', teacher: 'li', gender: '女性', dodge: 'qixing-bu' },
    { skill: 'sad-strike', usage: 'unarmed', teacher: 'yang', gender: '男性', force: 'surge-force' },
];
const descriptors = [...gumuWeapons, ...gumuUnarmedAttacks];
const wall = 'can_learn/yunv-xinjing/wall';
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const properties = { str: 36, int: 36, con: 36, dex: 36, per: 36,
    combat_exp: 10000000, qi: 10000, eff_qi: 10000, max_qi: 10000,
    jing: 10000, eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000,
    jiali: 0, shen: 0, gender: '男性', character: '国士无双', [wall]: 0 };

export function gumuBoutConditions(catalog, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean');
    const source = id => {
        const entry = catalog.skills.find(s => s.id === id);
        assert.ok(entry && /^[a-f0-9]{64}$/.test(entry.sha256), '缺少组合源码与摘要：' + id);
        return entry;
    };
    const contexts = [...gumuBoutProfiles.map(profile => ({ profile, level: 400 })),
        { profile: gumuBoutProfiles[2], level: 800 }];
    return contexts.flatMap(({ profile, level }) => [0, 50].map(jiali => {
        const { skill, usage, teacher, gender, paired = false } = profile;
        const force = profile.force ?? 'yunv-xinjing', dodge = profile.dodge ?? 'yunv-shenfa';
        const armed = ['sword', 'whip'].includes(usage);
        const skills = { literate: 400, 'martial-cognize': 400, unarmed: 400,
            ...Object.fromEntries(['force', force, 'dodge', dodge, 'parry', usage, skill,
                ...(paired ? ['meinv-quan'] : [])].map(id => [id, level])),
            ...(teacher === 'yang' ? { 'yunv-xinjing': 120 } : {}) };
        const paths = Object.keys(skills).map(id => source(id).path);
        const combination = skill + (paired ? '-meinv-quan' : '');
        const dynamic = descriptors.filter(d => d.dynamic && Object.hasOwn(skills, d.skill));
        return { id: `school-gumu-bout-${combination}-l${level}-jiali${jiali}`,
            stage: 'school', entry_id: source(skill).path, method: 'bout', samples: smoke ? 2 : 20,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-bout',
                combination, skill, usage, paired, level, ability: 'bout',
                observation: 'original_heartbeat_bout', strategy: 'ordinary', first: 'alternating_index',
                actor: { skills, mappings: { force, dodge, parry: skill, [usage]: skill,
                    ...(paired ? { unarmed: 'meinv-quan' } : {}) },
                preparations: armed ? {} : { [usage]: skill, ...(paired ? { unarmed: 'meinv-quan' } : {}) },
                properties: { ...properties, gender, jiali, [wall]: profile.wall ?? 0,
                    shen: skill === 'wudu-shenzhang' ? -100000 : 0,
                    combat_exp: level === 800 ? 64000000 : 10000000, 'family/family_name': '古墓派' },
                ...(armed ? { equipment: { type: usage, hold: false } } : {}) },
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                    mappings: {}, preparations: {}, properties: { ...properties },
                    equipment: { type: 'sword', hold: false } },
                capture_skill_loads: dynamic.map(d => {
                    const s = source(d.skill); return { skill: d.skill, path: s.path, sha256: s.sha256 };
                }),
                action: 'ordinary', fighting: true, observe_seconds: smoke ? 3 : 30,
                expected: 'observed', not_applicable: '',
                qualification_sources: [...new Set([...paths, 'kungfu/skill/sword.c',
                    `kungfu/class/gumu/${teacher}.c`, ...(paired ? ['kungfu/class/gumu/lin.c'] : []),
                    'kungfu/class/gumu/gumu.h', 'feature/attribute.c', 'feature/skill.c',
                    'feature/attack.c', 'feature/equip.c', 'feature/damage.c', 'feature/condition.c',
                    'inherit/char/char.c', 'clone/user/user.c', 'inherit/skill/force.c',
                    'inherit/skill/skill.c', 'adm/daemons/combatd.c', 'adm/daemons/itemd.c',
                    'cmds/skill/enable.c', 'include/combat.h', 'include/weapon.h'])],
                qualification_note: '已取得武学与权限的真实非巫师USER实验组合，不是教师克隆或自然养成证明。七套400级各加力0/50；玄铁800两条仅高阶机制扩展，经验64000000，不与400级作同成本排名。杨过来源另学玉女心经120但不激发；双备仅strike再unarmed，五毒不非法互备。原心跳、随机与恢复，20场各30秒交替先手，烟雾2场各3秒；无主动perform/exert、互搏或额外特技。标准兵器伤害50/重量3000及磨损不改。首次动态动作表保留原加载身份与数值。玉女心经/五毒/玄铁回调费用与总支出、恢复、净差分账，未触发仍是有效观察；400玄铁特伤对招架600不可达。',
            } };
    }));
}

const map = (value, label) => assert.ok(value && typeof value === 'object' && !Array.isArray(value), label);
const integer = (value, label) => assert.ok(Number.isSafeInteger(value), label);
const falseValue = value => value === null || value === 0;
const triggered = event => typeof event.result === 'string' && event.result.length > 0;
function count(metrics, key) {
    map(metrics, '缺少实际计数映射');
    const value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    integer(value, key); assert.ok(value >= 0, key); return value;
}
function identity(state, object) {
    map(state, '缺少角色快照');
    assert.ok(typeof state.object === 'string' && state.object.length);
    if (object) assert.equal(state.object, object);
    assert.equal(state.userp, 1); assert.equal(state.playerp, 1);
    assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
    for (const key of resources) integer(state[key], key);
    map(state.temp, '缺少临时状态'); map(state.skills, '缺少实际技能');
    map(state.mappings, '缺少实际激发'); map(state.preparations, '缺少实际准备');
    assert.ok(state.busy === null || Number.isSafeInteger(state.busy) && state.busy >= 0);
}
// Original USER idle learning can run between attacks after the connection has
// been idle for 300 seconds. It is knowledge, not a combat skill or a reward.
function idleLevelLimit(raw, side) {
    let level = 0, learned = 0;
    // next_beat uses integer time(); elapsed uses a finer wall clock. The first
    // slow beat only sets start_idle, so allow its one-second clock phase.
    const calls = Math.max(0, Math.min(Math.floor((raw.elapsed + 1) / 5),
        count(raw.metrics[side], 'heartbeats') - 1));
    for (let i = 0; i < calls && level < 500; i++) {
        learned += 1 + Math.trunc(1000 / (level + 100));
        if (learned > (level + 1) ** 2) { level++; learned = 0; }
    }
    return level;
}
function idleLevel(state) {
    map(state.skills, '缺少实际技能');
    if (!Object.hasOwn(state.skills, 'idle-force')) return 0;
    const level = state.skills['idle-force'];
    integer(level, '发呆技能等级'); assert.ok(level >= 0, '发呆技能等级');
    return level;
}
function idleState(state, raw, side, death = false) {
    const idle = 'idle-force', level = idleLevel(state), hasIdle = Object.hasOwn(state.skills, idle);
    map(state.effective_skills, '缺少有效技能'); map(state.temp, '缺少临时状态');
    assert.ok(!Object.hasOwn(state.temp, 'learned_idle_force') || falseValue(state.temp.learned_idle_force),
        '本组未授权特殊发呆学习路径');
    assert.ok(!Object.hasOwn(state.temp, 'start_idle') || falseValue(state.temp.start_idle) || state.temp.start_idle === 1,
        '原挂机标记');
    assert.equal(Object.hasOwn(state.effective_skills, idle), hasIdle, '发呆技能原值与有效值须成对记录');
    if (hasIdle) {
        assert.ok(level >= (death ? 0 : 1) && level <= idleLevelLimit(raw, side),
            '发呆学习不得超过原慢拍与原熟练度增长上界');
        assert.equal(state.effective_skills[idle], Math.trunc(level / 2));
        assert.equal(state.temp.start_idle, 1, '新增发呆技能须有原挂机标记');
    }
    return level;
}
function learnedContext(state, original, raw, side) {
    idleState(state, raw, side);
    for (const key of ['skills', 'effective_skills']) {
        const withoutIdle = Object.fromEntries(Object.entries(state[key]).filter(([id]) => id !== 'idle-force'));
        assert.deepEqual(withoutIdle, original[key], '原回调配置不得替换：' + key);
    }
    for (const key of ['mappings', 'preparations', 'cultivation'])
        assert.deepEqual(state[key], original[key], '原回调配置不得替换：' + key);
    for (const key of ['effective_str', 'effective_con', 'gender', 'max_neili', 'combat_exp'])
        assert.equal(state[key], original[key], key);
}
// The original receive_damage/receive_wound clamp negative health to -1;
// receive_wound also lowers qi when it exceeds the remaining effective health.
function healthAfter(target, damage, wound) {
    const eff_qi = wound ? Math.max(-1, target.eff_qi - wound) : target.eff_qi;
    const qi = damage ? Math.max(-1, target.qi - damage) : target.qi;
    return { qi: wound ? Math.min(qi, eff_qi) : qi, eff_qi };
}
function healthEquals(target, actual, damage = 0, wound = 0) {
    const expected = healthAfter(target, damage, wound);
    assert.equal(actual.qi, expected.qi, '原回调气血效果');
    assert.equal(actual.eff_qi, expected.eff_qi, '原回调创伤效果');
}
function initial(state, config) {
    identity(state); map(state.cultivation, '缺少实际资格'); map(state.temp.apply, '缺少装备增益');
    for (const key of ['start_idle', 'learned_idle_force'])
        assert.ok(!Object.hasOwn(state.temp, key) || falseValue(state.temp[key]), '初态不得预置挂机标记');
    for (const [key, value] of Object.entries(config.properties))
        assert.equal(key.includes('/') || key === 'character' ? state.cultivation[key] : state[key], value, key);
    assert.deepEqual(state.skills, config.skills);
    assert.deepEqual(state.mappings, config.mappings); assert.deepEqual(state.preparations, config.preparations);
    assert.ok(Array.isArray(state.preparation_order));
    assert.deepEqual([...state.preparation_order].sort(), Object.keys(config.preparations).sort(),
        '记录实际keys顺序，不把输入顺序当作驱动保证');
    assert.equal(state.effective_con, state.con + Math.trunc(state.skills.force / 10));
    assert.equal(state.effective_str, state.str + Math.trunc(Math.max(...
        ['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => state.skills[k] ?? 0)) / 10));
    map(state.effective_skills, '缺少有效技能');
    for (const [key, value] of Object.entries(config.skills)) {
        const applied = Object.hasOwn(state.temp.apply, key) ? state.temp.apply[key] : 0;
        integer(applied, '实际技能增益');
        assert.equal(state.effective_skills[key], Math.trunc(value / 2)
            + (config.skills[config.mappings[key]] ?? 0) + applied, key);
    }
    assert.equal(state.temp.combat_time ?? 0, 0); assert.ok(falseValue(state.busy));
    assert.equal(state.living, 1); assert.ok(falseValue(state.ghost));
    assert.equal(state.temp.apply.armor, 100);
    assert.equal(state.weapon, config.equipment?.type ?? 'none');
    assert.equal(state.handing, 'none'); assert.deepEqual(state.handing_details, {});
    map(state.weapon_details, '缺少持器快照');
    if (!config.equipment) {
        assert.deepEqual(state.weapon_details, {}); assert.equal(state.weapon_damage, 0);
        assert.equal(state.weapon_flag, 0); assert.equal(state.temp.apply.dodge ?? 0, 0);
        return;
    }
    const w = state.weapon_details;
    assert.equal(w.program, '/tests/' + state.weapon); assert.equal(w.skill_type, state.weapon);
    assert.ok(typeof w.object === 'string' && w.object.startsWith(w.program + '#'));
    assert.equal(w.weight, 3000); assert.equal(w.damage, 50); assert.equal(state.weapon_damage, 50);
    assert.equal(w.flag, state.weapon_flag);
    assert.ok(state.weapon === 'sword' ? w.flag === 4 : falseValue(w.flag));
    assert.equal(w.consistence, 100); assert.equal(state.temp.apply.dodge, -1);
    assert.equal(state.temp.apply.damage, 50);
}

function passiveCost(event, raw, p) {
    assert.equal(event.actor, 0); assert.equal(event.target, 1);
    assert.equal(event.before?.length, 2); assert.equal(event.after?.length, 2);
    const [before, target] = event.before, [after, endTarget] = event.after;
    for (const [state, side] of [[before, 0], [after, 0], [target, 1], [endTarget, 1]]) {
        identity(state, raw.before[side].object);
        learnedContext(state, raw.before[side], raw, side);
    }
    for (const side of [0, 1]) for (const key of ['skills', 'effective_skills'])
        assert.deepEqual(event.before[side][key], event.after[side][key],
            '同步被动回调内不能插入挂机学习');
    integer(event.incoming, '回调原伤害'); integer(event.factor, '回调原加力');
    const cost = before.neili - after.neili, applied = triggered(event);
    assert.ok(cost >= 0); assert.equal(event.neili_after, after.neili);
    assert.equal(event.target_eff_qi_after, endTarget.eff_qi);
    for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(after[resource], before[resource]);
    for (const resource of ['neili', 'jing', 'eff_jing']) assert.equal(endTarget[resource], target[resource]);
    assert.ok(endTarget.qi <= target.qi && endTarget.eff_qi <= target.eff_qi);
    if (event.route === 'force') {
        assert.equal(event.skill, p.actor.mappings.force); assert.equal(event.factor, p.actor.properties.jiali);
        assert.ok(event.factor > 0 && before.neili > event.factor);
        if (event.skill === 'surge-force') {
            integer(event.result, '原公共内功返回值'); assert.equal(cost, event.factor);
            const limit = Math.trunc(Math.min(before.neili, before.max_neili) / 20) + event.factor
                - Math.trunc(Math.min(target.neili, target.max_neili) / 24);
            // Frozen force levels exclude the unarmed backfire branch. The
            // unmapped opponent has no valid_damage and no armor_vs_force.
            assert.ok(before.effective_skills.force >= target.effective_skills.force);
            if (limit < 0) assert.equal(event.result, limit);
            else assert.ok(event.result >= 0 && event.result <= Math.min(limit, before.effective_skills.force - 1));
            healthEquals(target, endTarget);
        } else {
            assert.equal(event.skill, 'yunv-xinjing');
            assert.ok(applied || event.result === 0);
            if (applied) {
                assert.ok(['sword', 'whip'].includes(before.weapon));
                assert.equal(before.mappings[before.weapon], before.weapon === 'sword' ? 'suxin-jian' : 'yinsuo-jinling');
                assert.equal(before.cultivation[wall], 1); assert.ok(before.neili >= 300);
                assert.ok(before.skills[event.skill] >= 150);
                assert.ok(Math.trunc(before.effective_skills.force / 6) - 1 >= target.effective_con);
                const base = Math.trunc(before.skills[event.skill] / (before.weapon === 'sword' ? 5 : 4));
                assert.ok(Array.from({ length: base }, (_, n) => healthAfter(target, base + n,
                    Math.trunc((base + n) * 2 / 3))).some(h => h.qi === endTarget.qi && h.eff_qi === endTarget.eff_qi),
                '心经伤害必须来自原随机范围及原气血截断');
            } else {
                healthEquals(target, endTarget);
            }
            assert.equal(cost, applied ? 50 : 0);
        }
    } else {
        assert.equal(event.route, 'martial'); assert.equal(event.factor, 0);
        assert.ok([p.skill, ...(p.paired ? ['meinv-quan'] : [])].includes(event.skill));
        if (event.skill === 'xuantie-jian') {
            const level = before.skills[event.skill], parry = target.skills.parry;
            const gate = event.incoming >= 120 && level >= 160 && before.neili >= 500
                && before.mappings.sword === event.skill;
            if (applied) {
                assert.ok(gate && Math.trunc(level / 2) + level - 1 > parry, '玄铁附伤原门槛');
            } else {
                assert.ok(Number.isSafeInteger(event.result) || event.result === null);
                const quarter = Math.trunc(event.incoming / 4);
                if (!gate || Math.trunc(level / 2) > parry) assert.equal(event.result, quarter);
                else assert.ok(falseValue(event.result) || event.result === quarter);
            }
            assert.equal(cost, applied ? 120 : 0);
            healthEquals(target, endTarget, 0, applied ? Math.trunc(event.incoming * 4 / 5) : 0);
        } else if (event.skill === 'wudu-shenzhang') {
            assert.ok(applied || [0, 1].includes(event.result));
            const gate = target.living === 1 && before.neili >= 200 && before.skills[event.skill] >= 120;
            if (applied) assert.ok(gate && target.gender !== '女性');
            else assert.equal(event.result, gate ? 1 : 0, '五毒原返回1为数值附伤');
            assert.equal(cost, applied ? 30 : 0);
            healthEquals(target, endTarget, 0, applied ? event.incoming : 0);
        } else {
            if (event.skill === 'sad-strike') {
                const eligible = event.incoming >= 150 && Math.trunc(event.incoming / 5) > target.effective_str;
                assert.equal(applied, eligible, '黯然必须符合原伤害和有效膂力门槛');
                if (!applied) assert.ok(falseValue(event.result));
                healthEquals(target, endTarget, 0, applied ? Math.trunc((event.incoming - 100) / 2) : 0);
            } else {
                assert.ok(falseValue(event.result)); healthEquals(target, endTarget);
            }
            assert.equal(cost, 0);
        }
    }
    return cost;
}

function firstLoads(raw, p) {
    assert.equal(raw.skill_loads.length, p.capture_skill_loads.length);
    for (const descriptor of p.capture_skill_loads) {
        const loads = raw.skill_loads.filter(s => s.skill === descriptor.skill); assert.equal(loads.length, 1);
        const load = loads[0], state = load.state;
        assert.equal(load.path, descriptor.path); assert.equal(load.sha256, descriptor.sha256);
        assert.ok(typeof load.run_id === 'string' && load.run_id.length);
        assert.equal(load.load_id, load.run_id + ':' + descriptor.skill);
        identity(state); assert.match(state.object, /^\/tests\/actor#\d+$/);
        assert.equal(load.command, 'enable parry ' + descriptor.skill);
        assert.deepEqual(state.skills, p.actor.skills);
        assert.deepEqual(state.mappings, {}); assert.deepEqual(state.preparations, {});
        assert.deepEqual(state.preparation_order, []);
        assert.equal(state.weapon, 'none'); assert.deepEqual(state.weapon_details, {});
        assert.equal(state.handing, 'none'); assert.deepEqual(state.handing_details, {});
        assert.equal(state.weapon_damage, 0); assert.equal(state.weapon_flag, 0);
        // The original cold snapshot precedes apply/armor and wield. Only a
        // genuinely absent or empty apply mapping is legal at this stage.
        if (Object.hasOwn(state.temp, 'apply')) assert.deepEqual(state.temp.apply, {});
        for (const [key, value] of Object.entries(p.actor.properties)) {
            if (key === 'jiali') assert.ok([0, 50].includes(state[key]));
            else assert.equal(key.includes('/') || key === 'character' ? state.cultivation?.[key] : state[key], value, key);
        }
        assert.equal(state.effective_str, raw.before[0].effective_str);
        assert.equal(state.effective_con, raw.before[0].effective_con);
        assert.equal(state.temp.combat_time ?? 0, 0);
        assert.deepEqual(state.effective_skills,
            Object.fromEntries(Object.entries(state.skills).map(([key, value]) => [key, Math.trunc(value / 2)])));
        assert.ok(falseValue(state.busy) && falseValue(state.ghost)); assert.equal(state.living, 1);
    }
    for (const event of raw.actions.filter(e => e.actor === 0)) {
        const d = descriptors.find(x => x.skill === event.skill); assert.ok(d);
        if (event.action.lvl !== d.dynamic) continue;
        const load = raw.skill_loads.find(x => x.skill === d.skill); assert.ok(load);
        const suxin = d.skill === 'suxin-jian', s = load.state[suxin ? 'effective_skills' : 'skills'];
        const base = { force: Math.trunc(s.force / 2), attack: Math.trunc(s[d.usage] / 4),
            dodge: Math.trunc(s.dodge / (suxin ? 4 : 6)), parry: Math.trunc(s.parry / (suxin ? 4 : 6)),
            damage: Math.trunc(s.force / (suxin ? 3 : 4)) };
        const span = { force: s.force, attack: Math.trunc(s[d.usage] / 2), dodge: Math.trunc(s.force / 3),
            parry: Math.trunc(s.parry / 3), damage: Math.trunc(s[d.usage] / (suxin ? 3 : 2)) };
        if (d.skill === 'sad-strike') {
            base.force = Math.trunc(s.force / 3); span.force = load.state.effective_skills.force;
            delete base.parry; delete span.parry;
            assert.ok(!Object.hasOwn(event.action, 'parry'));
        }
        for (const key of Object.keys(base)) assert.ok(Number.isSafeInteger(event.action[key])
            && event.action[key] >= base[key] && event.action[key] <= base[key] + Math.max(0, span[key] - 1),
        '首次加载动态动作越界：' + key);
    }
}

function attackEvidence(raw, p) {
    for (const event of raw.attack_rounds) {
        assert.ok([0, 1].includes(event.actor));
        for (const key of ['before', 'after', 'result']) assert.ok(Object.hasOwn(event, key), '缺少原攻击轮字段');
        assert.ok(falseValue(event.before) || Number.isSafeInteger(event.before) && event.before >= 0);
        assert.ok(falseValue(event.after) || Number.isSafeInteger(event.after) && event.after >= 0, '原攻击轮末值');
        assert.ok(falseValue(event.result) || event.result === 1);
    }
    for (const side of [0, 1]) {
        const attacks = raw.attacks.filter(e => e.actor === side), rounds = raw.attack_rounds.filter(e => e.actor === side);
        for (const [key, predicate] of [['hit', e => e.result === 0], ['dodge', e => e.result === -1],
            ['parry', e => e.result === -2], ['quick', e => e.type === 2], ['riposte', e => e.type === 1]])
            assert.equal(count(raw.metrics[side], key), attacks.filter(predicate).length, '原攻击事件与计数不符：' + key);
        assert.equal(raw.actions.filter(e => e.actor === side).length, attacks.length, '双方原选招分别对账');
        assert.ok(rounds.length <= count(raw.metrics[side], 'heartbeats'));
        const ownRounds = rounds.filter(e => e.result === 1).length;
        const possibleCounters = raw.attacks.filter(e => e.actor !== side && e.type === 0).length;
        assert.ok(attacks.length <= ownRounds * (side === 0 && p.paired ? 2 : 1) + possibleCounters,
            '出手不得脱离原攻击轮或对方普通攻击的反击机会');
        if (side === 0 && raw.terminal === 'time_limit') {
            assert.ok(ownRounds > 0 && attacks.length > 0, '时限样本不能缺失左方原攻击轮和出手');
            // 76 > random(36*3/4): every successful left fight takes the
            // attacking branch. RIPOSTE counters alone cannot stand in for it.
            assert.ok(attacks.filter(e => e.type !== 1).length >= ownRounds, '缺少已完成左方攻击轮的原出手');
        }
    }
    const hits = raw.attacks.filter(e => e.actor === 0 && e.result === 0).length;
    const forceCalls = raw.passives.filter(e => e.route === 'force').length;
    const martialCalls = raw.passives.filter(e => e.route === 'martial').length;
    assert.ok(forceCalls <= hits && martialCalls <= hits);
    const jiali = p.actor.properties.jiali;
    // Total recorded expenditure gives a conservative lower bound throughout
    // the bout; recovery can only raise it. Do not infer an unobserved ordering.
    const minimumNeili = raw.before[0].neili - count(raw.metrics[0], 'neili_cost');
    if (!jiali) assert.equal(forceCalls, 0);
    else if (minimumNeili > jiali) assert.equal(forceCalls, hits, '合格原命中缺少force回调');
    const nonnegativeForce = !jiali || p.actor.mappings.force === 'yunv-xinjing'
        || Math.trunc(minimumNeili / 20) + jiali - Math.trunc(p.target.properties.max_neili / 24) >= 0;
    if (nonnegativeForce) assert.equal(martialCalls, hits, '正伤害原命中缺少martial回调');
}

function weaponWear(raw, side) {
    const before = raw.before[side], after = raw.after[side];
    if (before.weapon === 'none') { assert.equal(after.weapon, 'none'); return; }
    // Original death can drop equipment. Do not invent its unobserved durability.
    if (raw.terminal === 'death' && raw.winner !== side && after.weapon === 'none') return;
    assert.equal(after.weapon, before.weapon); map(after.weapon_details, '缺少最终装备');
    const { consistence: start, ...original } = before.weapon_details;
    const { consistence: end, ...current } = after.weapon_details;
    assert.deepEqual(current, original, '除原耐久外不得更换或改写兵器');
    integer(end, '缺少耐久'); assert.ok(end >= 0 && end <= start);
    // Left skill callbacks prove reaching the weapon hook. The unmapped right
    // sword lacks that callback; a hit is only an upper bound, not a trigger count.
    const opportunities = side === 0 ? raw.passives.filter(e => e.route === 'martial' && e.incoming > 0
        && e.before[0].weapon_details.object === original.object).length
        : raw.attacks.filter(a => a.actor === side && a.result === 0).length;
    assert.ok(start - end <= opportunities, '耐久下降超过已观察的原攻击机会');
}

export function validateGumuBoutRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-bout'); assert.equal(p.school, 'gumu');
    assert.equal(condition.method, 'bout'); assert.equal(raw.method, 'bout');
    assert.equal(raw.condition_id, condition.id); assert.equal(raw.outcome, 'observed');
    assert.equal(p.observation, 'original_heartbeat_bout'); assert.equal(p.strategy, 'ordinary');
    for (const key of ['before', 'after', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['attacks', 'attack_rounds', 'actions', 'passives', 'defenses', 'terminals', 'skill_loads'])
        assert.ok(Array.isArray(raw[key]), '缺少观察列表：' + key);
    assert.deepEqual(raw.launches, []); assert.deepEqual(raw.interfaces, []);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        initial(raw.before[side], config);
        identity(raw.after[side], raw.before[side].object);
        identity(raw.immediate[side], raw.before[side].object);
        for (const phase of ['after', 'immediate'])
            idleState(raw[phase][side], raw, side, raw.terminal === 'death' && raw.winner !== side);
        for (const resource of resources) assert.equal(raw.after[side][resource], raw.before[side][resource]
            - count(raw.metrics[side], resource + '_cost') + count(raw.metrics[side], resource + '_recovery'), resource);
        assert.equal(count(raw.metrics[side], 'direct'), 0);
        for (const event of raw.attacks.filter(a => a.actor === side)) {
            assert.equal(event.target, 1 - side); assert.ok([0, 1, 2].includes(event.type));
            assert.ok([0, -1, -2].includes(event.result)); integer(event.damage, '原攻击伤害');
            const usages = config.equipment ? [config.equipment.type] : Object.keys(config.preparations);
            // An original dead actor cannot take another heartbeat; no synthetic fallback loadout.
            assert.ok(usages.includes(event.attack_usage), '实际攻击入口不属于冻结组合');
            if (!config.equipment && usages.length === 2) {
                assert.ok(falseValue(event.action_flag) || event.action_flag === 1);
                assert.equal(event.attack_usage, raw.before[side].preparation_order[event.action_flag === 1 ? 1 : 0]);
            }
            const mapped = config.mappings[event.attack_usage];
            assert.ok(mapped ? event.attack_skill === mapped : falseValue(event.attack_skill));
        }
    }
    assert.ok(raw.attacks.every(a => [0, 1].includes(a.actor)));
    for (const event of raw.actions) {
        assert.ok([0, 1].includes(event.actor)); assert.equal(event.target, 1 - event.actor);
        const config = event.actor === 0 ? p.actor : p.target;
        assert.ok(event.actor === 0 ? [p.skill, ...(p.paired ? ['meinv-quan'] : [])].includes(event.skill)
            : falseValue(event.skill));
        assert.ok(typeof event.action?.action === 'string' && event.action.action.length);
        if (event.actor === 0) assert.ok(Number.isSafeInteger(event.action.lvl)
            && event.action.lvl < config.skills[event.skill]);
    }
    assert.equal(raw.actions.length, raw.attacks.length, '每次原选招对应一次原攻击');
    firstLoads(raw, p);
    const observedCost = raw.passives.reduce((sum, event) => sum + passiveCost(event, raw, p), 0);
    if (raw.terminal !== 'death') {
        assert.equal(count(raw.metrics[0], 'neili_cost'), observedCost, '本组原回调支出与总费用一致');
        assert.equal(count(raw.metrics[1], 'neili_cost'), 0);
    } else assert.ok(count(raw.metrics[0], 'neili_cost') >= observedCost, '死亡结算不覆盖已发生费用');
    attackEvidence(raw, p);
    for (const event of raw.defenses) {
        assert.equal(event.actor, 1); assert.equal(event.target, 0);
        assert.equal(event.route, 'ordinary'); assert.equal(event.skill, p.actor.mappings.parry);
        integer(event.incoming, '原防御伤害'); assert.ok(event.incoming > 0);
        assert.ok(Object.hasOwn(event, 'result') && event.result !== undefined, '缺少原防御返回');
    }
    validateBoutRecord(raw, condition); validateAttackRoundCounts(raw);
    for (const side of [0, 1]) weaponWear(raw, side);
    validateGumuAttackLoads([raw], descriptors);
}

export function validateGumuBoutLoads(rows) {
    const result = validateGumuAttackLoads(rows, descriptors), records = rows.map(row => row.raw ?? row);
    for (const raw of records) for (const load of raw.skill_loads) {
        assert.ok(records.some(origin => origin.before[0].object === load.state.object
            && origin.skill_loads.some(candidate => candidate.load_id === load.load_id)),
        '完整运行中必须保留真实首次加载者对应的样本，不能用后来角色替代');
    }
    return result;
}

// Supplemental accounting; shared reports may merge the existing schoolBoutEffects.
export function gumuBoutEffects(rows, condition) {
    assert.equal(condition?.parameters?.collection_group, 'gumu-bout', '必须传冻结条件');
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    assert.ok(raw.every(r => r.condition_id === condition.id), '不同条件不得混算');
    return { combination: condition.parameters.combination, level: condition.parameters.level,
        samples: raw.length,
        sides: [0, 1].map(side => ({
            neili_spent: distribution(raw.map(r => count(r.metrics[side], 'neili_cost'))),
            neili_recovered: distribution(raw.map(r => count(r.metrics[side], 'neili_recovery'))),
            net_neili_loss: distribution(raw.map(r => r.before[side].neili - r.after[side].neili)),
            idle_practice: {
                started_samples: raw.filter(r => r.after[side].temp.start_idle === 1).length,
                raw_levels_before: distribution(raw.map(r => idleLevel(r.before[side]))),
                raw_levels_after: distribution(raw.map(r => idleState(r.after[side], r, side,
                    r.terminal === 'death' && r.winner !== side))),
                net_levels: distribution(raw.map(r => idleLevel(r.after[side]) - idleLevel(r.before[side]))),
            },
            weapon_wear: distribution(raw.map(r => r.before[side].weapon === 'none' ? null
                : r.after[side].weapon_details?.object === r.before[side].weapon_details.object
                    ? r.before[side].weapon_details.consistence - r.after[side].weapon_details.consistence : null)),
        })),
        passives: ['force', 'martial'].map(route => {
            const events = raw.flatMap(r => r.passives.filter(e => e.route === route));
            return { route, calls: events.length, message_returns: events.filter(triggered).length,
                neili_spent: events.reduce((sum, e) => sum + e.before[0].neili - e.after[0].neili, 0),
                immediate_qi_loss: distribution(events.map(e => e.before[1].qi - e.after[1].qi)),
                immediate_wounds: distribution(events.map(e => e.before[1].eff_qi - e.after[1].eff_qi)) };
        }),
    };
}
