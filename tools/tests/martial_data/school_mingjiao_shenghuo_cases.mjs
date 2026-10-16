// Finite original USER slice. No driver, model, source mutation or RNG substitution here.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const ling = 'shenghuo-ling', god = 'shenghuo-shengong';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
// Actual notify_fail wrapper uses CSI256D+CSIK; remove only these and numeric SGR.
// Other escape sequences remain part of the compared text, not silently erased.
const plain = text => text.replace(/\x1b\[(?:[0-9;]*m|256D|K)/g, '');
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 1000, max_neili: 1000, combat_exp: 100000000,
    str: 36, int: 40, con: 36, dex: 36, shen: 0, gender: '男性', character: '光明磊落',
    jiali: 50, 'family/family_name': '明教', 'env/auto_regenerate': 0,
    'can_perform/shenghuo-ling/can': 1 };
export const mingjiaoShenghuoSourcePaths = [
    'kungfu/skill/shenghuo-ling.c', 'kungfu/skill/shenghuo-ling/can.c',
    'kungfu/skill/shenghuo-shengong.c', 'kungfu/skill/shenghuo-xinfa.c',
    'kungfu/skill/sword.c', 'kungfu/skill/blade.c', 'kungfu/skill/force.c',
    'kungfu/skill/dodge.c', 'kungfu/skill/parry.c', 'kungfu/skill/unarmed.c',
    'kungfu/class/mingjiao/zhangwuji.c', 'kungfu/class/mingjiao/mingjiao.h',
    'cmds/skill/perform.c', 'cmds/skill/enable.c', 'inherit/skill/skill.c', 'inherit/skill/force.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attribute.c', 'feature/action.c',
    'feature/attack.c', 'feature/damage.c', 'feature/equip.c', 'feature/itemmake.c',
    'feature/dbase.c', 'feature/name.c', 'feature/condition.c', 'clone/user/user.c',
    'inherit/char/char.c', 'inherit/item/item.c', 'inherit/misc/equip.c',
    'inherit/weapon/sword.c', 'inherit/weapon/blade.c', 'clone/weapon/gangjian.c', 'clone/weapon/gangdao.c',
    'mudcore/inherit/action.c', 'mudcore/inherit/dbase.c', 'adm/daemons/combatd.c',
    'adm/daemons/itemd.c', 'adm/daemons/weapond.c', 'adm/daemons/masterd.c',
    'adm/single/simul_efun/message.c', 'adm/single/simul_efun/chinese.c',
    'adm/daemons/chinesed.c', 'data/e2c_dict.o', 'include/globals.h', 'include/combat.h',
    'mudcore/include/ansi.h',
];
export const mingjiaoShenghuoReviewedSourceHash = '4098a6b01e6086489306e6d0e59ca8da99522e6d2bb49def70fdf8f8c5836b2d';
// Basic sword has no perform_action_file: no invented /sword/can lookup/absence evidence.
export const mingjiaoShenghuoAbsentPaths = [];

function actor(level = 400, extra = {}) {
    return { skills: { sword: level, [ling]: level, force: level, [god]: level,
        unarmed: 200, dodge: 200, parry: 200, ...extra.skills },
        mappings: { sword: ling, parry: ling, force: god, ...extra.mappings }, preparations: {},
        properties: { ...pool, ...extra.properties },
        ...(extra.temp ? { temp: extra.temp } : {}), ...(extra.busy ? { busy: extra.busy } : {}),
        ...(extra.weapon === false ? {} : { equipment: { type: extra.weapon ?? 'sword',
            program: extra.weapon === 'blade' ? '/clone/weapon/gangdao' : '/clone/weapon/gangjian' } }) };
}
function plans() {
    const out = [];
    const add = (method, level, variant, cfg = actor(level), extra = {}, suite = 'main') => {
        const target = { skills: { force: cfg.skills[god], parry: level * 3, dodge: level * 3, unarmed: 200 },
            mappings: {}, preparations: {}, properties: { ...pool, jiali: 0, qi: 1000000,
                eff_qi: 1000000, max_qi: 1000000 } };
        const ability = method === 'perform' ? 'can' : method === 'interface' ? 'hit_ob' : 'ordinary';
        out.push({ id: `school-mingjiao-shenghuo-${suite}-${method}-l${level}-${variant}`,
            stage: 'school', method, parameters: { school: 'mingjiao', collection_group: 'mingjiao-shenghuo',
                skill: method === 'interface' ? god : ling, usage: 'sword', ability, variant, suite, level,
                ling_level: cfg.skills[ling], cache_loader_level: suite === 'main' ? 200 : level,
                actor: cfg, target, named_participants: true, fighting: true, target_state: 'living',
                expected: 'observed', refusal: '', refusal_scope: '', not_applicable: '',
                label: method === 'ordinary' ? '圣火令普通攻击' : method === 'perform' ? '残血令' : '神功联动接口',
                action: method === 'ordinary' ? 'ordinary' : method === 'perform' ? 'perform sword.can right' : 'test_interface',
                observation: 'single_action_immediate', observe_seconds: 0,
                random_effects: method !== 'interface',
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + god,
                    function: 'hit_ob', damage: 100, factor: 50 } } : {}),
                qualification_note: '真实普通USER的有限实验配功/领悟，不证明自然教学或完整门派。主系列首载200缓存；cold400/800各自独立驱动，不销毁技能重载、不混缓存。神功递归、令法附伤、公有伤害、创伤夹制、费用及忙乱分账；目标大血池不是同成本公平对照，不控制随机。',
                ...extra } });
    };
    for (const level of [200, 400, 800]) for (const jiali of [0, 50])
        add('ordinary', level, 'jiali' + jiali, actor(level, { properties: { jiali } }));
    for (const level of [279, 280, 319, 320]) add('ordinary', level, 'count-boundary');
    const low = (force = 260) => actor(220, { skills: { force, 'shenghuo-xinfa': 400 },
        properties: { max_neili: 5000 } });
    add('perform', 220, 'positive', low());
    for (const level of [400, 800]) add('perform', level, 'positive', actor(level,
        { properties: { neili: 6000, max_neili: 6000 } }));
    add('perform', 400, 'jiali0', actor(400, { properties: { jiali: 0, neili: 6000, max_neili: 6000 } }));
    add('perform', 400, 'max5000', actor(400, { properties: { max_neili: 5000 } }));
    add('perform', 400, 'current400', actor(400, { properties: { neili: 400, max_neili: 6000 } }));
    const refusals = [
        ['grant0', actor(400, { properties: { max_neili: 6000, 'can_perform/shenghuo-ling/can': 0 } }), '你所使用的外功中没有这种功能。\n'],
        ['not-fighting', actor(400, { properties: { max_neili: 6000 } }), '「残血令」只能对战斗中的对手使用。\n', { fighting: false }],
        ['no-weapon', actor(400, { weapon: false, properties: { max_neili: 6000 } }), '你使用的兵器不对，不能使用圣火令法之「残血令」。\n'],
        ['blade', actor(400, { weapon: 'blade', properties: { max_neili: 6000 } }), '你使用的兵器不对，不能使用圣火令法之「残血令」。\n'],
        ['ling219', actor(400, { skills: { [ling]: 219 }, properties: { max_neili: 6000 } }), '你的圣火令法等级不够, 不能使用圣火令法之「残血令」。\n'],
        ['force349', low(258), '你的内功火候不够，不能使用圣火令法之「残血令」。\n'],
        ['max4999', actor(400, { properties: { max_neili: 4999 } }), '你的内力修为不足，不能使用圣火令法之「残血令」。\n'],
        ['current399', actor(400, { properties: { max_neili: 6000, neili: 399 } }), '你的内力不够，不能使用圣火令法之「残血令」。\n'],
        ['sword-unmapped', actor(400, { mappings: { sword: 0 }, properties: { max_neili: 6000 } }), '你现在的(sword)中并没有这种外功。\n', { refusal_scope: 'command', outer_refusal: 'unmapped' }],
        ['unconscious', actor(400, { properties: { max_neili: 6000 } }), '对方都已经这样了，用不着这么费力吧？\n', { target_state: 'unconscious' }],
        ['busy1', actor(400, { busy: 1, properties: { max_neili: 6000 } }), '( 你上一个动作还没有完成，不能施用外功。)\n', { refusal_scope: 'command', outer_refusal: 'busy' }],
    ];
    for (const [variant, cfg, refusal, extra] of refusals) {
        if (cfg.mappings.sword === 0) delete cfg.mappings.sword;
        add('perform', variant === 'force349' ? 220 : 400, variant, cfg,
            { expected: 'refused', random_effects: false, refusal, refusal_scope: 'ability', ...extra });
    }
    const guards = [
        ['god139', { skills: { [god]: 139 } }], ['neili199', { properties: { neili: 199 } }],
        ['damage0', {}, { interface: { object: '/kungfu/skill/' + god, function: 'hit_ob', damage: 0, factor: 50 } }],
        ['force-unmapped', { mappings: { force: 0 } }], ['sword-unmapped', { mappings: { sword: 0 } }],
        ['no-weapon', { weapon: false }], ['blade', { weapon: 'blade' }],
        ['ling279', { skills: { [ling]: 279 } }], ['hit1', { temp: { 'shenghuo-ling/hit': 1 } }],
        ['max-hit1', { temp: { 'shenghuo-ling/max_hit': 1 } }],
    ];
    for (const [variant, cfg, extra] of guards) {
        const a = actor(400, cfg);
        for (const k of ['force', 'sword']) if (a.mappings[k] === 0) delete a.mappings[k];
        add('interface', 400, variant, a, { random_effects: false, interface_guard: true, ...extra });
    }
    add('interface', 400, 'god140', actor(400, { skills: { [god]: 140 } }), { random_effects: true });
    add('interface', 400, 'neili200', actor(400, { properties: { neili: 200 } }), { random_effects: true });
    add('interface', 400, 'ling280', actor(400, { skills: { [ling]: 280 } }), { random_effects: true });
    for (const level of [400, 800]) add('ordinary', level, 'jiali50', actor(level), {}, 'cold' + level);
    assert.equal(out.length, 42);
    return out;
}

export function mingjiaoShenghuoConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const evidence = Object.fromEntries(mingjiaoShenghuoSourcePaths.map(path => {
        const bytes = readSource(path); assert.ok(bytes?.length, path); return [path, hash(bytes)];
    }));
    assert.equal(hash(JSON.stringify(Object.entries(evidence))), mingjiaoShenghuoReviewedSourceHash,
        'Re-review changed original Shenghuo sources before sampling');
    const sources = Object.fromEntries([ling, god, ling + '/can'].map(id => {
        const source = catalog.skills.find(s => s.id === id);
        assert.equal(source?.path, `kungfu/skill/${id}.c`); assert.equal(source.sha256, evidence[source.path]);
        return [id, source];
    }));
    return plans().map(c => {
        const p = c.parameters, source = sources[c.method === 'perform' ? ling + '/can' : p.skill];
        const entry = c.method === 'ordinary' ? source.path
            : source.entries.find(e => c.method === 'perform' ? e.role === 'perform' : e.function === 'hit_ob')?.id;
        assert.ok(entry && entry.startsWith(source.path), 'original catalog entry');
        return { ...c, entry_id: entry, samples: smoke ? 2 : p.random_effects ? samples : 2,
            parameters: { ...p, source_evidence: { ...evidence }, qualification_sources: [...mingjiaoShenghuoSourcePaths],
                absence_evidence: {}, ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                base_source: { path: sources[ling].path, sha256: sources[ling].sha256 },
                capture_skill_loads: [{ skill: ling, path: sources[ling].path, sha256: sources[ling].sha256 }] } };
    });
}

const object = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v)); return v; };
const field = (v, key) => { assert.ok(Object.hasOwn(object(v), key), 'missing ' + key); return v[key]; };
const int = v => { assert.ok(Number.isSafeInteger(v)); return v; };
const zero = v => { assert.ok(v === 0 || v === null); return 0; };
const num = v => v === null ? 0 : int(v);
const count = (m, key) => { const n = Object.hasOwn(object(m), key) ? int(m[key]) : 0; assert.ok(n >= 0); return n; };
const flag = (s, key) => num(s.temp[ling]?.[key] ?? 0);
const busy = s => num(field(s, 'busy'));
const resourcesEqual = (a, b) => {
    for (const k of [...health, 'craze']) assert.equal(field(a, k), field(b, k), 'checkpoint ' + k);
};
function flagsEqual(a, b) {
    for (const k of ['hit', 'max_hit']) assert.equal(flag(a, k), flag(b, k), 'transient ' + k);
    assert.equal(num(a.temp.apply.attack ?? 0), num(b.temp.apply.attack ?? 0));
}
function lateTarget(attack) {
    const s = structuredClone(attack.after[1]); if (attack.damage > 0) s.busy = 0; return s;
}
function stable(a, b) {
    const clean = s => {
        const r = structuredClone(s);
        for (const k of [...health, 'craze', 'busy', 'learned']) delete r[k];
        delete r.temp.notify_fail; delete r.temp.fight; delete r.temp[ling];
        delete r.temp.apply.attack;
        if (r.weapon_details) delete r.weapon_details.consistence;
        return r;
    };
    assert.deepEqual(clean(a), clean(b), 'unrelated state changed');
    if (b.weapon !== 'none') {
        const n = int(field(a.weapon_details, 'consistence'));
        assert.ok(n <= b.weapon_details.consistence && n >= b.weapon_details.consistence - 9,
            'finite ordinary steel wear, not magical weapon mutation');
    }
}
function initial(s, cfg, side, p) {
    assert.match(field(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(s.id, side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive']) assert.equal(field(s, k), 1);
    for (const k of ['wizardp', 'ghost']) zero(field(s, k));
    assert.equal(s.living, side && p.target_state === 'unconscious' ? 0 : 1);
    assert.equal(field(s, 'fighting_opponent'), Number(p.fighting));
    assert.equal(field(s, 'killing_opponent'), Number(p.fighting));
    assert.equal(busy(s), cfg.busy ?? 0); assert.deepEqual(s.learned, {});
    assert.equal(s.craze, 0); assert.equal(s.max_craze, 5000);
    for (const k of ['skills', 'mappings', 'preparations']) assert.deepEqual(field(s, k), cfg[k]);
    for (const [k, v] of Object.entries(cfg.properties)) {
        if (side && p.target_state === 'unconscious' && ['qi', 'jing'].includes(k)) assert.equal(s[k], 0);
        else { const actual = field(k.includes('/') || k === 'character' ? s.cultivation : s, k);
            if (v === 0) zero(actual); else assert.equal(actual, v, k); }
    }
    assert.equal(s.effective_str, 56); assert.equal(s.effective_int, 40); assert.equal(s.effective_dex, 36 + Math.trunc(cfg.skills.dodge / 10));
    const expectedApply = cfg.equipment ? { armor: 100, damage: 25, dodge: -2 } : { armor: 100 };
    assert.deepEqual(s.temp.apply, expectedApply);
    for (const k of ['secondary_weapon', 'handing']) assert.equal(s[k], 'none');
    for (const k of ['secondary_weapon_details', 'handing_details']) assert.deepEqual(s[k], {});
    assert.deepEqual(s.conditions ?? {}, {});
    for (const [k, v] of Object.entries(cfg.skills)) assert.equal(field(s.effective_skills, k),
        Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (expectedApply[k] ?? 0));
    if (!cfg.equipment) { assert.equal(s.weapon, 'none'); assert.deepEqual(s.weapon_details, {}); zero(s.weapon_damage); zero(s.weapon_flag); }
    else {
        const w = s.weapon_details; assert.match(w.object, new RegExp('^' + cfg.equipment.program + '#\\d+$'));
        assert.equal(w.program, cfg.equipment.program); assert.equal(w.skill_type, cfg.equipment.type);
        assert.equal(w.weight, cfg.equipment.type === 'blade' ? 7000 : 6000); assert.equal(w.material, 'steel');
        assert.equal(w.damage, 25); assert.equal(w.flag, 4); assert.equal(w.consistence, 100);
        zero(w.rigidity); zero(w.no_wield); assert.equal(s.weapon, cfg.equipment.type);
        assert.equal(s.weapon_damage, 25); assert.equal(s.weapon_flag, 4);
    }
    for (const key of ['hit', 'max_hit']) assert.equal(flag(s, key), cfg.temp?.[ling + '/' + key] ?? 0);
}

const fixedActions = [
    [0, 180, 70, 30, 30, 70, '$N踏上一步，忽地在地上一坐，已抱住了$n小腿。十指扣向$n小腿上的中都和\n筑宾两穴'],
    [40, 240, 80, 39, 38, 81, '突然之间，$N身形晃动，同时欺近，手中$w往$n身上划去。脚下不知如何移动，\n身形却已早变。右手同时抓向$n的后领'],
    [80, 260, 90, 49, 82, 95, '$N欺身直进，左手持$w向$n天灵盖上拍落。便在这一瞬之间，$n滚身向左，已\n然一拳打向$n腿部。$n一个踉跄，$N横过$w戳向$n后心'],
    [120, 280, 95, 55, 93, 102, '$N忽地放手，手中那柄$w尾端向上弹起，直奔$n手腕。'],
    [160, 320, 97, 67, 112, 139, '$N忽然低头，一个头锤向$n撞来，$n不动声色，向旁又是一让，突觉胸口一阵\n凉风，只见$N手肘袭来'],
    [180, 360, 100, 75, 130, 150, '$N忽然低头，一个头锤向$n撞来，$n不动声色，向旁又是一让，突觉胸口一麻，\n$N手中$w急挥横扫，突然连翻三个空心筋斗，$w已到$n右肩'],
].map(([lvl, force, attack, dodge, damage, parry, action]) => ({ lvl, force, attack, dodge, damage, parry, action, damage_type: '割伤' }));
function selectedAction(a, level, load) {
    assert.ok([...fixedActions.map(a => a.lvl), 250].filter(n => n < level).slice(-6).includes(int(a.lvl)),
        'strict level and final-six original NewRandom support');
    if (a.lvl !== 250) { assert.deepEqual(a, fixedActions.find(v => v.lvl === a.lvl)); return; }
    assert.deepEqual(Object.keys(a).sort(), ['action', 'attack', 'damage', 'damage_type', 'dodge', 'force', 'lvl', 'parry', 'skill_name']);
    assert.equal(a.action, '$N凝神静气，使出极招\x1b[31m 圣火令法之极意 \x1b[0m');
    assert.equal(a.skill_name, '极意'); assert.equal(a.damage_type, '割伤');
    const s = load.state, f = s.skills.force, sw = s.skills.sword;
    for (const [k, low, width] of [['force', Math.trunc(f / 2), f], ['attack', Math.trunc(sw / 4), Math.trunc(sw / 2)],
        ['dodge', Math.trunc(s.skills.dodge / 6), Math.trunc(f / 3)],
        ['parry', Math.trunc(s.skills.parry / 6), Math.trunc(s.skills.parry / 3)], ['damage', Math.trunc(f / 4), Math.trunc(sw / 2)]])
        assert.ok(int(a[k]) >= low && a[k] < low + width, 'original first-loader ' + k);
}
function loadRecord(raw, p) {
    assert.equal(raw.skill_loads.length, 1); const l = raw.skill_loads[0];
    assert.equal(l.skill, ling); assert.equal(l.path, p.base_source.path); assert.equal(l.sha256, p.base_source.sha256);
    assert.equal(l.command, 'enable parry ' + ling); assert.ok(typeof l.run_id === 'string' && l.run_id);
    assert.equal(l.load_id, l.run_id + ':' + ling);
    const s = l.state; assert.equal(s.id, 'left'); assert.equal(s.userp, 1); assert.equal(s.interactive, 1); zero(s.wizardp);
    assert.deepEqual(s.mappings, {}); assert.deepEqual(s.preparations, {}); assert.equal(s.weapon, 'none');
    for (const k of ['force', 'sword', ling]) { assert.equal(s.skills[k], p.cache_loader_level);
        assert.equal(s.effective_skills[k], Math.trunc(p.cache_loader_level / 2)); }
    for (const k of ['dodge', 'parry', 'unarmed']) assert.equal(s.skills[k], 200);
    return l;
}
const cp = x => x > 400 ? Math.trunc((x - 400) / 4) + 300 : x > 200 ? Math.trunc((x - 200) / 2) + 200 : Math.max(0, x);
function power(level, bonus = 0) {
    const skillPower = level > 500 ? Math.trunc(level / 10) * level * level : Math.trunc(level * level * level / 10);
    const base = Math.trunc((skillPower + 6950000) / 30) * 36;
    return base + Math.trunc(base / 100) * bonus;
}
// Joint finite integer support, not a claim to observe hidden int/armor/dex draws.
export function mingjiaoShenghuoPublicSupports(incoming, start) {
    const base = incoming + Math.trunc(incoming * 128 / 300), out = [];
    const emit = (D, W) => {
        let qi = Math.max(-1, start.qi - D), eff_qi = Math.max(-1, start.eff_qi - W);
        if (W > 0) qi = Math.min(qi, eff_qi);
        out.push({ D, W, qi, eff_qi, craze: Math.min(start.max_craze, start.craze
            + (D > 150 ? Math.trunc(D / 5) : 0) + (W > 150 ? Math.trunc(W / 3) : 0)) });
    };
    emit(0, 0);
    for (const pre of [base, base + Math.trunc(base * 4 / 40)]) {
        const D = cp(pre); emit(D, 0);
        for (let r = 0; r < 100; r++) { let W = cp(pre - r);
            W -= Math.trunc(W * 20 / 100); W -= Math.trunc(W * 26 / 100); emit(D, Math.max(0, W)); }
    }
    return out;
}
function incomingSupport(n, action, forceResult) {
    const bonus = 56 + Number(forceResult === 1), b = bonus + Math.trunc(action.force * bonus / 100);
    return Array.from({ length: 13 }, (_, i) => 12 + i).some(w => {
        const base = w + Math.trunc(w * action.damage / 100);
        return n >= base + Math.trunc(b / 3) && n <= base + Math.trunc((2 * b - 1) / 3);
    });
}
function godEligible(e) {
    const a = e.before[0]; return a.skills[god] >= 140 && e.incoming !== 0 && a.mappings.force === god
        && a.mappings.sword === ling && a.weapon === 'sword' && a.effective_skills[ling] >= 140
        && !flag(a, 'hit') && a.neili >= 200;
}
function pair(e) { assert.equal(e.actor, 0); assert.equal(e.target, 1); }
function checkpoint(s, baseline) {
    assert.equal(s.length, 2); for (const side of [0, 1]) { stable(s[side], baseline[side]);
        for (const k of ['jing', 'eff_jing']) assert.equal(s[side][k], baseline[side][k]);
        assert.deepEqual(s[side].learned, baseline[side].learned); }
}

export function validateMingjiaoShenghuoRecord(raw, c) {
    const p = c.parameters; assert.equal(p.collection_group, 'mingjiao-shenghuo');
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, c.id); assert.equal(raw.method, c.method);
    if (raw.outcome === 'error') { assert.ok(typeof raw.reason === 'string' && raw.reason.trim()); return null; }
    assert.equal(raw.outcome, p.expected); assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(field(raw, k).length, 2);
    for (const k of ['actions', 'attacks', 'passives', 'passive_events', 'dodge_checks', 'busy_calls', 'skill_messages',
        'launches', 'refusals', 'interfaces', 'directs', 'defenses', 'dropped', 'terminals', 'callbacks', 'skill_loads'])
        assert.ok(Array.isArray(field(raw, k)), k);
    for (const k of ['directs', 'defenses', 'dropped', 'callbacks']) assert.deepEqual(raw[k], []);
    assert.deepEqual(raw.terminals, []);
    if (p.target_state === 'unconscious') {
        const prep = field(raw, 'preparation'); assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }]);
        assert.deepEqual(prep.after, raw.before[1]); assert.equal(prep.before.object, prep.after.object);
        assert.equal(prep.before.living, 1); assert.equal(prep.after.living, 0);
        for (const k of health) assert.equal(prep.before[k], p.target.properties[k]);
    }
    assert.deepEqual(raw.stack_terminal, { attacks: 0, passives: 0 });
    assert.deepEqual(raw.after, raw.immediate); const load = loadRecord(raw, p);
    for (const side of [0, 1]) { initial(raw.before[side], side ? p.target : p.actor, side, p); stable(raw.immediate[side], raw.before[side]); }
    const [a, t] = raw.before, [end, target] = raw.immediate;
    for (const side of [0, 1]) for (const k of health) {
        assert.equal(raw.immediate[side][k], raw.before[side][k] - count(raw.metrics[side], k + '_cost') + count(raw.metrics[side], k + '_recovery'));
        assert.equal(count(raw.metrics[side], k + '_recovery'), 0);
        if (side === 0 || !['qi', 'eff_qi'].includes(k)) if (k !== 'neili' || side === 1)
            assert.equal(count(raw.metrics[side], k + '_cost'), 0);
    }
    for (const side of [0, 1]) for (const k of ['heartbeats', 'quick', 'riposte', 'direct']) assert.equal(count(raw.metrics[side], k), 0);
    assert.equal(end.craze, 0); assert.deepEqual(target.learned, {});
    const perf = c.method === 'perform', accepted = p.expected === 'observed';
    if (c.method === 'ordinary') assert.equal(Object.hasOwn(raw, 'command_accepted'), false,
        'direct original ordinary attack has no command return value');
    else assert.equal(num(field(raw, 'command_accepted')) > 0, accepted);
    if (!accepted) {
        for (const k of ['actions', 'attacks', 'passives', 'passive_events', 'dodge_checks', 'busy_calls', 'interfaces', 'launches']) assert.deepEqual(raw[k], []);
        assert.equal(a.neili, end.neili); resourcesEqual(target, t); assert.deepEqual(end.learned, a.learned);
        assert.equal(busy(end), busy(a)); assert.equal(busy(target), busy(t));
        for (const k of ['hit', 'max_hit']) assert.equal(flag(end, k), flag(a, k));
        if (p.refusal_scope === 'command') {
            assert.deepEqual(raw.refusals, [{ actor: a.object, reason: raw.reason }], 'actual outer USER notification, not ability entry');
            assert.equal(plain(raw.reason), plain(field(end.temp, 'notify_fail')));
            assert.equal(plain(raw.reason), p.refusal, 'source/current UTF8-driver literal, not arbitrary middle text');
        } else {
            assert.equal(plain(raw.reason), p.refusal); assert.deepEqual(raw.refusals, [{ actor: a.object, reason: raw.reason }]);
            assert.equal(plain(field(end.temp, 'notify_fail')), p.refusal);
        }
        assert.equal(count(raw.metrics[0], 'ability_launched'), 0);
        return { accepted: false, load_id: load.load_id, can_gate: null, force_calls: 0, force_eligible: 0,
            force_triggered: 0, primary: 0, additional: 0, planned: 0, martial_calls: 0, ling_qi: 0, ling_wound: 0,
            public_damage: 0, public_wound: 0, max_depth: 0 };
    }
    assert.deepEqual(raw.refusals, []);
    assert.deepEqual(raw.launches, perf ? [{ actor: a.object, skill: ling, argument: 'can right' }] : []);
    assert.equal(count(raw.metrics[0], 'ability_launched'), Number(perf));
    let canGate = null;
    if (perf) {
        const messages = raw.skill_messages.map(e => { assert.ok([0, 1].includes(e.side)); assert.ok(typeof e.type === 'string'); return plain(e.text); }).join('');
        const hit = messages.includes('完全无法看透'), miss = messages.includes('打起精神小心接招');
        assert.notEqual(hit, miss, 'one actually observed CAN gate message'); canGate = hit;
        const maxDraw = a.effective_skills.sword - 1, threshold = Math.trunc(t.effective_skills.parry / 3);
        if (maxDraw <= threshold) assert.equal(canGate, false);
        assert.equal(a.neili - end.neili, 300); assert.ok(busy(end) >= 1 && busy(end) <= 4);
        assert.ok(Object.keys(end.learned).every(k => k === ling));
        const progress = count(end.learned, ling);
        if (a.effective_skills[ling] >= 120) assert.equal(progress, 1); else assert.ok([0, 1].includes(progress));
    } else { assert.deepEqual(end.learned, a.learned); assert.deepEqual(raw.launches, []); }
    if (c.method === 'interface') {
        assert.equal(raw.interfaces.length, 1); const e = raw.interfaces[0];
        assert.equal(e.object, p.interface.object); assert.equal(e.function, 'hit_ob'); assert.equal(e.damage, p.interface.damage);
        assert.equal(e.factor, 50); assert.equal(e.implemented_by, '/kungfu/skill/' + god);
    } else assert.deepEqual(raw.interfaces, []);
    const actions = new Map(), attacks = new Map(), passives = new Map(), children = new Map();
    for (const [index, e] of raw.actions.entries()) {
        pair(e); assert.equal(e.skill, ling); assert.equal(e.attack_id, index + 1);
        assert.ok(e.attack_depth >= 1 && e.attack_depth <= 2); selectedAction(e.action, a.skills[ling], load);
        checkpoint(e.before, raw.before); actions.set(e.attack_id, e);
        assert.equal(e.parent_attack_id > 0, e.attack_depth === 2);
        if (e.parent_attack_id) { const parent = actions.get(e.parent_attack_id); assert.ok(parent && parent.attack_depth === 1); }
    }
    for (const e of raw.attacks) {
        pair(e); const action = actions.get(e.attack_id); assert.ok(action && !attacks.has(e.attack_id));
        for (const k of ['parent_attack_id', 'attack_depth']) assert.equal(e[k], action[k]);
        assert.equal(e.type, 0); assert.ok([0, -1, -2].includes(e.result)); assert.ok(int(e.damage) >= 0);
        assert.equal(e.attack_usage, 'sword'); assert.equal(e.attack_skill, ling); zero(e.action_flag);
        checkpoint(e.after, raw.before); assert.equal(e.neili, e.after[0].neili);
        assert.equal(e.apply_attack, num(e.after[0].temp.apply.attack ?? 0)); attacks.set(e.attack_id, e);
    }
    assert.equal(attacks.size, actions.size); const completion = [];
    const walk = id => { for (const e of raw.actions.filter(e => e.parent_attack_id === id)) { walk(e.attack_id); completion.push(e.attack_id); } };
    walk(0); assert.deepEqual(raw.attacks.map(e => e.attack_id), completion, 'original attack LIFO completion');
    for (const e of raw.passives) {
        pair(e); assert.ok(int(e.id) > 0 && !passives.has(e.id)); assert.ok(['force', 'martial', 'interface'].includes(e.route));
        assert.equal(e.skill, e.route === 'martial' ? ling : god); checkpoint(e.before, raw.before); checkpoint(e.after, raw.before);
        assert.equal(e.neili_after, e.after[0].neili); assert.equal(e.target_eff_qi_after, e.after[1].eff_qi);
        assert.equal(num(e.target_busy_after), busy(e.after[1]));
        assert.ok(e.attack_id === 0 && e.route === 'interface' || actions.has(e.attack_id));
        passives.set(e.id, e); const list = children.get(e.parent_id) ?? []; list.push(e); children.set(e.parent_id, list);
    }
    const stack = [], entered = new Set(), returned = [];
    for (const e of raw.passive_events) {
        const p = passives.get(e.id); assert.ok(p);
        for (const key of ['parent_id', 'depth', 'attack_id', 'route']) assert.equal(e[key], p[key]);
        if (e.phase === 'before') { assert.ok(!entered.has(e.id)); entered.add(e.id);
            assert.equal(e.parent_id, stack.at(-1) ?? 0); assert.equal(e.depth, stack.length + 1); assert.ok(e.depth <= 2); stack.push(e.id); }
        else { assert.equal(e.phase, 'after'); assert.equal(stack.pop(), e.id); returned.push(e.id); }
    }
    assert.equal(stack.length, 0); assert.equal(entered.size, passives.size);
    assert.deepEqual(returned, raw.passives.map(e => e.id));
    const result = { accepted: true, load_id: load.load_id, can_gate: canGate, force_calls: 0, force_eligible: 0,
        force_triggered: 0, primary: 0, additional: 0, planned: 0, martial_calls: 0, ling_qi: 0, ling_wound: 0,
        public_damage: 0, public_wound: 0, max_depth: Math.max(0, ...raw.actions.map(e => e.attack_depth)) };
    const expectedHitFlag = perf ? 1 : null;
    const expectedMaxFlag = perf ? Number(canGate) : flag(a, 'max_hit');
    for (const action of raw.actions) {
        assert.equal(flag(action.before[0], 'max_hit'), expectedMaxFlag);
        if (perf) assert.equal(flag(action.before[0], 'hit'), expectedHitFlag);
        assert.equal(num(action.before[0].temp.apply.attack ?? 0), perf && canGate ? Math.trunc(a.skills[ling] / 6) : 0);
    }
    let forceFee = 0;
    for (const e of raw.passives) {
        if (e.route === 'martial') {
            result.martial_calls++; zero(e.factor); assert.equal(plain(e.result), '只听“噗嗤”一声，一股鲜血至$n胸前射出！\n');
            const loss = e.before[1].qi - e.after[1].qi, wound = e.before[1].eff_qi - e.after[1].eff_qi;
            const expectedWound = flag(e.before[0], 'max_hit') ? e.incoming : 0;
            assert.equal(wound, expectedWound);
            assert.ok(loss >= e.incoming && loss < e.incoming + Math.trunc(e.before[0].skills[god] / 2));
            assert.equal(e.after[1].craze, e.before[1].craze, 'no who on Ling damage/wound');
            assert.deepEqual(e.after[0], e.before[0], 'Ling callback cannot alter actor flags/resources');
            assert.deepEqual(e.after[1], { ...e.before[1], qi: e.after[1].qi, eff_qi: e.after[1].eff_qi },
                'Ling directly changes target qi/eff only; no fabricated extra state');
            result.ling_qi += loss; result.ling_wound += wound;
        } else {
            result.force_calls++; const eligible = godEligible(e); result.force_eligible += Number(eligible);
            const triggered = e.result === 1; if (!triggered) zero(e.result);
            if (!eligible || flag(e.before[0], 'max_hit')) assert.equal(triggered, false);
            if (eligible && !flag(e.before[0], 'max_hit')) {
                const min = Math.trunc(e.before[0].skills[god] / 2), max = min + e.before[0].skills[god] - 1;
                if (min > e.before[1].skills.force) assert.equal(triggered, true);
                if (max <= e.before[1].skills.force) assert.equal(triggered, false);
            }
            const n = Math.min(Math.trunc(e.before[0].skills[ling] / 40), 8), fee = triggered ? n * 20 : 0;
            assert.equal(e.before[0].neili - e.after[0].neili, fee); forceFee += fee;
            const nested = children.get(e.id) ?? [];
            if (!triggered) { assert.deepEqual(nested, []); assert.deepEqual(e.after, e.before, 'zero God return has no state effect'); }
            else {
                result.force_triggered++; result.planned += n;
                const subs = raw.actions.filter(action => action.parent_attack_id === e.attack_id && (e.attack_id || action.attack_depth === 1));
                assert.equal(subs.length, n, 'living large-pool original planned attacks');
                assert.ok(busy(e.after[0]) >= 1 && busy(e.after[0]) <= n);
                let previous = e.before[1];
                for (const sub of subs) { resourcesEqual(sub.before[1], previous);
                    assert.equal(sub.before[0].neili, e.before[0].neili - fee); assert.equal(flag(sub.before[0], 'hit'), 1);
                    previous = lateTarget(attacks.get(sub.attack_id)); }
                resourcesEqual(e.after[1], previous); assert.equal(busy(e.after[1]), busy(previous)); assert.equal(flag(e.after[0], 'hit'), 0);
                const last = attacks.get(subs.at(-1).attack_id), expectedActor = structuredClone(last.after[0]);
                if (expectedActor.temp[ling]) delete expectedActor.temp[ling].hit;
                assert.deepEqual(e.after[0], expectedActor, 'God return preserves the actual last child state and deletes only hit guard');
            }
            assert.equal(e.factor, 50);
        }
    }
    for (const action of raw.actions) {
        const attack = attacks.get(action.attack_id), own = raw.passives.filter(e => e.attack_id === action.attack_id);
        const force = own.find(e => e.route === 'force'), martial = own.find(e => e.route === 'martial');
        assert.equal(own.length, Number(!!force) + Number(!!martial));
        const expectedForce = attack.result === 0 && action.before[0].jiali !== 0 && action.before[0].neili > action.before[0].jiali;
        assert.equal(!!force, expectedForce);
        assert.equal(!!martial, attack.result === 0);
        if (force) { assert.equal(force.incoming, 56); resourcesEqual(force.before[0], action.before[0]); resourcesEqual(force.before[1], action.before[1]);
            flagsEqual(force.before[0], action.before[0]); }
        const pre = force?.after ?? action.before;
        if (martial) {
            for (const side of [0, 1]) resourcesEqual(martial.before[side], pre[side]);
            flagsEqual(martial.before[0], pre[0]);
            assert.ok(incomingSupport(int(martial.incoming), action.action, force?.result), 'original incoming damage support');
            const s = martial.after[1], final = attack.after[1];
            assert.ok(mingjiaoShenghuoPublicSupports(martial.incoming, s).some(v => v.D === attack.damage
                && v.qi === final.qi && v.eff_qi === final.eff_qi && v.craze === final.craze), 'joint public damage/wound/craze support');
            result.public_damage += attack.damage; result.public_wound += s.eff_qi - final.eff_qi;
            resourcesEqual(attack.after[0], martial.after[0]); flagsEqual(attack.after[0], martial.after[0]);
        } else { assert.equal(attack.damage, 0); for (const side of [0, 1]) resourcesEqual(attack.after[side], action.before[side]); }
        if (action.parent_attack_id || c.method === 'interface') result.additional++; else result.primary++;
        const checks = raw.dodge_checks.filter(e => e.attack_id === action.attack_id); assert.equal(checks.length, 2);
        for (const [i, e] of checks.entries()) { pair(e); assert.equal(e.type, 0); assert.equal(e.skill, 0);
            assert.equal(e.phase, i ? 'settled' : 'base'); assert.ok(int(e.ap) >= 1); assert.ok(int(e.dp) >= 0); }
        assert.equal(checks[0].ap, power(action.before[0].effective_skills.sword
            + num(action.before[0].temp.apply.attack ?? 0), action.action.attack));
        assert.equal(checks[0].dp, power(action.before[1].effective_skills.dodge));
        assert.equal(checks[0].ap, checks[1].ap);
        assert.equal(checks[1].dp, Math.max(1, busy(action.before[1]) ? Math.trunc(checks[0].dp / 3) : checks[0].dp));
        assert.equal(num(checks[0].busy), busy(action.before[1]));
    }
    assert.equal(raw.dodge_checks.length, raw.actions.length * 2);
    const roots = raw.actions.filter(e => e.parent_attack_id === 0);
    let previous = raw.before[1];
    for (const e of roots) { resourcesEqual(e.before[1], previous); previous = lateTarget(attacks.get(e.attack_id)); }
    resourcesEqual(target, previous); assert.equal(busy(target), busy(previous));
    assert.equal(result.additional, result.planned);
    assert.equal(a.neili - end.neili, (perf ? 300 : 0) + forceFee, 'no invented jiali fee per ordinary hit');
    assert.equal(t.qi - target.qi, result.ling_qi + result.public_damage, 'Ling and public qi damage separate; no double-counted nested aggregate');
    assert.equal(t.eff_qi - target.eff_qi, result.ling_wound + result.public_wound);
    for (const [k, value] of [['hit', 0], ['dodge', -1], ['parry', -2]]) assert.equal(count(raw.metrics[0], k), raw.attacks.filter(a => a.result === value).length);
    for (const k of ['hit', 'dodge', 'parry', 'ability_launched']) assert.equal(count(raw.metrics[1], k), 0);
    if (perf) { assert.equal(result.primary, 7); assert.equal(result.additional, 0); assert.equal(result.force_triggered, 0); }
    else if (c.method === 'ordinary') assert.equal(result.primary, 1);
    else { assert.equal(result.primary, 0); const outer = raw.passives.filter(e => e.route === 'interface'); assert.equal(outer.length, 1);
        assert.equal(outer[0].incoming, p.interface.damage); assert.equal(raw.interfaces[0].result, outer[0].result);
        for (const side of [0, 1]) { resourcesEqual(outer[0].before[side], raw.before[side]); resourcesEqual(outer[0].after[side], raw.immediate[side]); } }
    for (const e of raw.busy_calls) {
        assert.ok([0, 1].includes(e.side));
        // Direct ordinary calls have explicit actor/target parameters, not a USER command context.
        // Keep the observer's original member_array(this_player(), players) result unmodified.
        if (c.method === 'ordinary') assert.ok([-1, 0, 1].includes(field(e, 'caller_side')));
        else assert.equal(field(e, 'caller_side'), 0);
        assert.ok(int(e.requested) >= 1);
        assert.equal(num(e.after), e.requested); assert.ok(int(e.attack_id) >= 0); assert.ok(int(e.parent_passive_id) >= 0);
        if (e.side === 1) { assert.ok(perf); assert.equal(e.requested, 1); assert.equal(num(e.before), 0); }
        else if (e.parent_passive_id) { const event = passives.get(e.parent_passive_id); assert.ok(event && event.result === 1);
            assert.ok(e.requested <= Math.min(Math.trunc(event.before[0].skills[ling] / 40), 8)); }
        else { assert.ok(perf); assert.ok(e.requested <= 4); }
    }
    assert.equal(raw.busy_calls.filter(e => e.side === 0).length, result.force_triggered + Number(perf));
    if (!perf && !result.force_triggered) assert.equal(busy(end), busy(a));
    assert.equal(flag(end, 'max_hit'), perf ? 0 : flag(a, 'max_hit'));
    assert.equal(flag(end, 'hit'), perf || result.force_triggered ? 0 : flag(a, 'hit'));
    assert.equal(num(end.temp.apply.attack ?? 0), 0);
    if (raw.actions.length) {
        const last = raw.actions.at(-1).action;
        assert.deepEqual(end.temp.fight, { attack: last.attack, dodge: last.dodge, parry: last.parry });
    }
    return result;
}

export function validateMingjiaoShenghuoLoads(records) {
    const runs = new Map();
    for (const row of records) {
        const raw = row.raw ?? row;
        if (!raw.condition_id?.startsWith('school-mingjiao-shenghuo-') || raw.outcome === 'error') continue;
        const suite = raw.condition_id.match(/^school-mingjiao-shenghuo-(main|cold400|cold800)-/)?.[1]; assert.ok(suite);
        assert.equal(raw.skill_loads?.length, 1); const load = raw.skill_loads[0], level = suite === 'main' ? 200 : Number(suite.slice(4));
        assert.equal(load.load_id, load.run_id + ':' + ling); assert.equal(load.command, 'enable parry ' + ling);
        const s = load.state; assert.equal(s.id, 'left'); assert.equal(s.userp, 1); assert.equal(s.interactive, 1); zero(s.wizardp);
        assert.deepEqual(s.mappings, {}); assert.deepEqual(s.preparations, {}); assert.equal(s.weapon, 'none');
        for (const k of ['force', 'sword', ling]) { assert.equal(s.skills[k], level); assert.equal(s.effective_skills[k], Math.trunc(level / 2)); }
        for (const k of ['dodge', 'parry', 'unarmed']) assert.equal(s.skills[k], 200);
        const prior = runs.get(load.run_id);
        if (prior) { assert.equal(prior.suite, suite, 'cold suites require independent real drivers'); assert.deepEqual(load, prior.load); }
        else runs.set(load.run_id, { suite, load: structuredClone(load), cached: null });
        const run = runs.get(load.run_id);
        for (const action of raw.actions) if (action.action.lvl === 250) {
            selectedAction(action.action, 251, load);
            if (run.cached) assert.deepEqual(action.action, run.cached, 'same initialized global action within actual driver');
            else run.cached = structuredClone(action.action);
        }
    }
    return { runs: runs.size, observed_caches: [...runs.values()].filter(r => r.cached).length,
        scope: 'run-local preserved original loader; never pool main/cold coefficients' };
}

export function mingjiaoShenghuoEffects(rows, c) {
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) { const raw = row.raw ?? row; assert.equal(raw.condition_id, c.id);
        if (row.raw) { assert.equal(row.condition_id, c.id); assert.equal(row.outcome, raw.outcome); }
        assert.ok(Object.hasOwn(counts, raw.outcome)); counts[raw.outcome]++;
        const observation = validateMingjiaoShenghuoRecord(raw, c); if (observation) known.push({ raw, observation }); }
    validateMingjiaoShenghuoLoads(rows);
    const accepted = known.filter(r => r.observation.accepted), values = key => accepted.map(r => r.observation[key]);
    const sum = key => values(key).reduce((a, b) => a + b, 0), gates = accepted.filter(r => r.observation.can_gate !== null);
    const resources = side => Object.fromEntries(health.map(k => [k, distribution(known.map(r => count(r.raw.metrics[side], k + '_cost')))]));
    return { samples: rows.length, counts, validated: known.length, unknown: rows.length - known.length,
        acceptance: probability(accepted.length, known.length), primary_attacks: sum('primary'), additional_attacks: sum('additional'),
        planned_additional: sum('planned'), force_calls: sum('force_calls'), eligible_force_calls: sum('force_eligible'),
        force_trigger: { ...probability(sum('force_triggered'), sum('force_eligible')), low95: null, high95: null,
            scope: 'correlated eligible passive calls, including max_hit blocking; no independent-trial interval' },
        can_gate: probability(gates.filter(r => r.observation.can_gate).length, gates.length),
        martial_calls: sum('martial_calls'), ling_damage: distribution(values('ling_qi')), ling_wound: distribution(values('ling_wound')),
        public_damage: distribution(values('public_damage')), public_wound: distribution(values('public_wound')),
        primary_per_sample: distribution(values('primary')), additional_per_sample: distribution(values('additional')),
        max_depth: distribution(values('max_depth')), actor_cost: resources(0), target_cost: resources(1),
        neili_cost: distribution(known.map(r => count(r.raw.metrics[0], 'neili_cost'))),
        busy: distribution(known.map(r => busy(r.raw.immediate[0]))),
        weak_progress: distribution(known.map(r => count(r.raw.immediate[0].learned, ling))),
        cache_scope: c.parameters.suite === 'main' ? 'shared original first-loader200' : 'independent ' + c.parameters.suite,
        unknown_scopes: ['hidden RNG draws', 'attacks.after precedes late ordinary busy interruption',
            'correlated recursive force-call denominator is not independent draws',
            'teaching/practice/cultivation and natural bouts not collected', 'no same-cost balance or cross-cache damage ranking'] };
}
