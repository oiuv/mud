// Finite original Jiuyang passive/defense window; preparation is not natural cultivation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mingjiaoQkdSourcePaths } from './school_mingjiao_qkd_cases.mjs';

const copy = v => structuredClone(v), sha = v => createHash('sha256').update(v).digest('hex');
const skill = 'jiuyang-shengong', group = 'mingjiao-jiuyang', prefix = 'school-mingjiao-jiuyang-', object = '/kungfu/skill/' + skill;
// Re-read all 124 original public dependencies; COMBAT is included, not an undefined supplemental hash.
export const mingjiaoJiuyangSourcePaths = [...mingjiaoQkdSourcePaths];
export const mingjiaoJiuyangReviewedSourceHash = '5470f5b1cea5ee346e014f5d62201352f328648e29926ce26c925a353ca5a1bd';
const evidenceHash = e => sha(JSON.stringify(mingjiaoJiuyangSourcePaths.map(path => [path, e[path]])));
const properties = { name: '试侠', gender: '男性', race: '人类', class: '', character: '光明磊落',
    str: 36, int: 40, con: 40, dex: 36, shen: 90000, combat_exp: 100000000,
    qi: 100000, eff_qi: 100000, max_qi: 100000, jing: 100000, eff_jing: 100000, max_jing: 100000,
    neili: 9000, max_neili: 9000, jingli: 1000, max_jingli: 1000, potential: 10000, learned_points: 0,
    jiali: 0, reborn: 0, 'can_learn/jiuyang-shengong/enable_weapon': 0,
    'family/family_name': '明教', 'env/auto_regenerate': 0, 'env/no_learn': 0, doing: 0,
    'tattoo/tattoo_str': 0, 'tattoo/tattoo_int': 0, 'tattoo/tattoo_dex': 0, 'special_skill/wuxing': 0 };
const neutral = (force = 0) => ({ skills: { force, unarmed: 600, parry: 600, dodge: 600 }, mappings: {}, preparations: {}, properties: copy(properties) });
function jiuyang(level = 200) {
    return { skills: { force: 1200, unarmed: 1200, parry: 1200, dodge: 600, 'martial-cognize': 100, [skill]: level },
        mappings: { force: skill, unarmed: skill, parry: skill }, preparations: { unarmed: skill },
        properties: { ...copy(properties), reborn: 1 } };
}
const entries = { valid_enable: [185, 'query_or_gate'], query_effect_parry: [318, 'query_or_gate'],
    valid_damage: [255, 'query_or_gate'], hit_ob: [300, 'combat_interface'] };
function plans() {
    const out = [];
    const add = (variant, ability, actor, target, randomized = false, extra = {}) => {
        const method = ability === 'ordinary' ? 'ordinary' : 'interface';
        const p = { school: 'mingjiao', family: '明教', collection_group: group, variant, skill, ability,
            usage: ability === 'hit_ob' || method === 'ordinary' ? 'unarmed' : 'parry',
            level: (ability === 'valid_damage' || ability === 'query_effect_parry' ? target : actor).skills[skill] ?? 200,
            actor, target, named_participants: true, fighting: false, room: {}, expected: 'observed', not_applicable: '',
            observation: 'single_action_immediate', observe_seconds: 0, action: method === 'ordinary' ? 'ordinary' : 'test_interface',
            random_observation: randomized, formal_samples: randomized ? 100 : 2, qualification_sources: mingjiaoJiuyangSourcePaths,
            qualification_note: '九阳原接口及普通攻击的有限真实USER实验；转世、已有技能和师承是明示赋值，不冒自然取得。'
                + '非转世的原stored unarmed/parry映射保留其失效语义，不改张无忌NPC。valid_learn/修养、五perform、三exert、公共恢复和交锋另待采。'
                + '取消、防御内力费、九阳原wound和公共伤害分账；只统计实际调用，不把原随机未触发当资格拒绝。', ...extra };
        if (method === 'interface' && !p.interface) p.interface = { object, function: ability };
        out.push({ id: prefix + variant, stage: 'school', method, parameters: p });
    };
    for (const [state, reborn, weaponEnable] of [['normal', 0, 0], ['reborn', 1, 0], ['weapon', 1, 1]]) {
        for (const usage of ['force', 'unarmed', 'parry', 'sword', 'blade', 'dodge']) {
            const a = jiuyang(); a.properties.reborn = reborn; a.properties['can_learn/jiuyang-shengong/enable_weapon'] = weaponEnable;
            add('enable-' + state + '-' + usage, 'valid_enable', a, neutral(), false,
                { interface: { object, function: 'valid_enable', argument: usage } });
        }
    }
    for (const level of [149, 150, 199, 200, 249, 250, 299, 300, 349, 350, 399, 400])
        add('effect-' + level, 'query_effect_parry', neutral(), jiuyang(level));
    const defense = (variant, mutate, randomized = false, damage = 1000, extra = {}) => {
        const a = neutral(200), t = jiuyang(); a.properties.neili = a.properties.max_neili = 3500;
        mutate?.(a, t); add('damage-' + variant, 'valid_damage', a, t, randomized,
            { interface: { object, function: 'valid_damage', damage }, ...extra });
    };
    defense('raw149', (a, t) => { t.skills[skill] = 149; });
    defense('raw150', (a, t) => { t.skills[skill] = 150; }, true);
    defense('neili499', (a, t) => { t.properties.neili = 499; });
    defense('neili500', (a, t) => { t.properties.neili = 500; }, true);
    defense('nonreborn', (a, t) => { t.properties.reborn = 0; });
    for (const usage of ['force', 'unarmed', 'parry']) defense('unmapped-' + usage, (a, t) => { delete t.mappings[usage]; });
    defense('weapon', a => { a.equipment = { type: 'sword', program: '/clone/weapon/gangjian' }; });
    defense('unconscious', null, false, 1000, { target_state: 'unconscious' });
    for (const incoming of [1, 199, 200, 201, 1000]) defense('input' + incoming, null, true, incoming);
    for (const level of [400, 800]) defense('growth' + level, (a, t) => { t.skills[skill] = level; }, true);
    // The original coin still runs, but the inner inequality has no successful support.
    defense('inner-impossible', a => { a.skills.force = 8000; a.properties.neili = a.properties.max_neili = 9000; });
    const passive = (variant, mutate, randomized = false, damage = 1000, factor = 0) => {
        const a = jiuyang(), t = neutral(); mutate?.(a, t);
        add('hit-' + variant, 'hit_ob', a, t, randomized, { interface: { object, function: 'hit_ob', damage, factor } });
    };
    passive('raw149', a => { a.skills[skill] = 149; });
    passive('raw150', a => { a.skills[skill] = 150; }, true);
    passive('neili299', a => { a.properties.neili = 299; });
    passive('neili300', a => { a.properties.neili = 300; }, true);
    // query_con=29 in these two controls separates the initial input150 guard from the later strict comparison.
    passive('input149', (a, t) => { t.properties.con = 29; }, false, 149);
    passive('input150', (a, t) => { t.properties.con = 29; }, true, 150);
    for (const usage of ['force', 'unarmed']) passive('unmapped-' + usage, a => { delete a.mappings[usage]; });
    passive('unprepared', a => { a.preparations = {}; });
    passive('nonreborn', a => { a.properties.reborn = 0; });
    passive('con-equal', null, false, 200); // floor(200/5)==query_con40: no effect.
    passive('con-plus1', null, true, 205); // floor(205/5)==41: fixed50 and wound62.
    for (const level of [400, 800]) passive('growth' + level, a => { a.skills[skill] = level; }, true);
    passive('input1000', null, true, 1000);
    passive('factor100', null, true, 1000, 100); // factor is ignored by this override, unlike inherited FORCE.
    for (const level of [200, 400, 800]) add('ordinary-' + level, 'ordinary', jiuyang(level), neutral(), true, { fighting: true });
    assert.equal(out.length, 67); return out;
}
function entry(p, evidence) {
    const path = 'kungfu/skill/jiuyang-shengong.c';
    if (p.ability === 'ordinary') return { id: path, path, line: 1, function: '', role: 'file', sha256: evidence[path] };
    const [line, role] = entries[p.ability]; return { id: `${path}:${line}:${p.ability}`, path, line, function: p.ability, role, sha256: evidence[path] };
}
export function mingjiaoJiuyangConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof readSource, 'function'); assert.equal(typeof smoke, 'boolean'); assert.equal(mingjiaoJiuyangSourcePaths.length, 124);
    const evidence = Object.fromEntries(mingjiaoJiuyangSourcePaths.map(path => [path, sha(readSource(path))]));
    assert.equal(evidenceHash(evidence), mingjiaoJiuyangReviewedSourceHash, 'original source changed: review required');
    const base = catalog.skills.find(s => s.id === skill); assert.equal(base?.sha256, evidence['kungfu/skill/jiuyang-shengong.c']);
    for (const ability of Object.keys(entries)) assert.ok(base.entries.some(e => e.id === entry({ ability }, evidence).id));
    return plans().map(c => { const sourceEntry = entry(c.parameters, evidence);
        return { ...c, entry_id: sourceEntry.id, samples: smoke ? 2 : c.parameters.formal_samples, status: 'prepared_not_sampled',
            parameters: { ...c.parameters, source_entry: sourceEntry, source_evidence: copy(evidence),
                reviewed_source_hash: mingjiaoJiuyangReviewedSourceHash, absent_sources: [],
                qualification_evidence: mingjiaoJiuyangSourcePaths.map(path => ({ path, sha256: evidence[path] })) } };
    });
}
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v)); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing ' + k); return v[k]; };
let fixed;
export function validateMingjiaoJiuyangCondition(c) {
    fixed ??= new Map(plans().map(c => [c.id, c])); const planned = fixed.get(own(c, 'id')); assert.ok(planned, 'unknown Jiuyang condition');
    assert.equal(c.stage, 'school'); assert.equal(c.method, planned.method);
    assert.ok(Number.isSafeInteger(c.samples) && [2, planned.parameters.formal_samples].includes(c.samples));
    const { source_entry, source_evidence, reviewed_source_hash, absent_sources, qualification_evidence, ...p } = map(own(c, 'parameters'));
    assert.deepEqual(p, planned.parameters); assert.deepEqual(Object.keys(map(source_evidence)), mingjiaoJiuyangSourcePaths);
    for (const h of Object.values(source_evidence)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(evidenceHash(source_evidence), mingjiaoJiuyangReviewedSourceHash); assert.equal(reviewed_source_hash, mingjiaoJiuyangReviewedSourceHash);
    assert.deepEqual(source_entry, entry(p, source_evidence)); assert.equal(c.entry_id, source_entry.id); assert.deepEqual(absent_sources, []);
    assert.deepEqual(qualification_evidence, mingjiaoJiuyangSourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    return c.parameters;
}

const integer = v => { assert.ok(Number.isSafeInteger(v)); return v; };
const num = v => v === null ? 0 : integer(v);
const metric = (m, k) => Object.hasOwn(map(m), k) ? integer(m[k]) : 0;
const empty = v => { if (v && typeof v === 'object') assert.deepEqual(v, {}); else assert.equal(num(v), 0); };
const plain = v => { assert.equal(typeof v, 'string'); return v.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''); };
const keys = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const defenseMessages = ['$n默念九阳神功总诀，收敛内劲，承下$N这一招，$N只觉犹如石沉大海，丝毫不起作用。\n',
    '$N一招击中$n上身，可却犹如击在棉花上一般，力道顿时消失得无影无踪。\n'];
const passiveMessages = ['只见$N九阳内劲自体内迸发，真气随招式而荡漾，摧毁了$n的真元！\n',
    '$N九阳神功的潜力发挥了出来，突然间$n只感喉咙一甜，喷出一口鲜血！\n'];
const parryEffect = l => l < 150 ? 0 : l < 200 ? 50 : l < 250 ? 60 : l < 300 ? 70 : l < 350 ? 80 : l < 400 ? 90 : 100;
const applies = (cfg, usage) => cfg.mappings[usage] === skill && (usage === 'force' || !!cfg.properties.reborn
    && (['unarmed', 'parry'].includes(usage) || cfg.properties['can_learn/jiuyang-shengong/enable_weapon'] && ['sword', 'blade'].includes(usage)));
function initial(s, cfg, side, p) {
    assert.match(own(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(own(s, 'id'), side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive']) assert.equal(own(s, k), 1);
    for (const k of ['wizardp', 'ghost']) assert.equal(num(own(s, k)), 0);
    assert.equal(own(s, 'living'), side && p.target_state ? 0 : 1); assert.equal(num(own(s, 'busy')), 0);
    assert.equal(own(s, 'fighting_opponent'), Number(p.fighting)); empty(own(s, 'conditions'));
    assert.deepEqual(own(s, 'skills'), cfg.skills); assert.deepEqual(own(s, 'mappings'), cfg.mappings);
    assert.deepEqual(own(s, 'preparations'), cfg.preparations); assert.deepEqual(own(s, 'learned'), {});
    for (const [k, v] of Object.entries(cfg.properties)) {
        if (['name', 'race'].includes(k)) continue;
        const value = k.includes('/') || ['reborn', 'character', 'class', 'doing'].includes(k) ? own(s.cultivation, k) : own(s, k);
        const expected = side && p.target_state && ['qi', 'jing'].includes(k) ? 0 : v;
        if (expected === 0) assert.equal(num(value), 0, k); else assert.equal(value, expected, k);
    }
    for (const k of ['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
        'special_skill/guimai', 'wudang-jiuyang', 'immune/poison']) assert.equal(num(own(s.cultivation, k)), 0);
    assert.equal(own(s, 'effective_int'), s.int); assert.equal(own(s, 'effective_con'), s.con + Math.trunc((cfg.skills.force ?? 0) / 10));
    assert.equal(own(s, 'effective_str'), s.str + Math.trunc(cfg.skills.unarmed / 10));
    assert.equal(own(s, 'effective_dex'), s.dex + Math.trunc(cfg.skills.dodge / 10));
    assert.equal(own(s, 'craze'), 0); assert.equal(own(s, 'max_craze'), 5000);
    const gear = !!cfg.equipment;
    // This sole weapon control retains the same raw dodge600/dex36/6000-weight original steel sword as QKD V2.
    assert.deepEqual(own(s.temp, 'apply'), gear ? { armor: 100, damage: 25, dodge: -2 } : { armor: 100 });
    for (const k of ['guarding', 'str', 'dex', 'fight', 'powerup', 'shield']) assert.ok(!Object.hasOwn(s.temp, k) || num(s.temp[k]) === 0);
    assert.equal(own(s, 'weapon'), gear ? 'sword' : 'none'); assert.equal(own(s, 'weapon_damage'), gear ? 25 : 0);
    assert.equal(own(s, 'weapon_flag'), gear ? 4 : 0);
    if (gear) { assert.match(own(s.weapon_details, 'object'), /^\/clone\/weapon\/gangjian#\d+$/);
        assert.equal(own(s.weapon_details, 'program'), cfg.equipment.program); assert.equal(own(s.weapon_details, 'weight'), 6000); }
    else assert.deepEqual(own(s, 'weapon_details'), {});
    assert.equal(own(s, 'handing'), 'none'); assert.deepEqual(own(s, 'handing_details'), {});
    assert.deepEqual(own(s, 'effective_skills'), Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k,
        Math.trunc(v / 2) + (applies(cfg, k) ? cfg.skills[skill] : 0) + (gear && k === 'dodge' ? -2 : 0)])));
}
function transition(b, a, { neili = 0, damage = 0, wound = 0, action } = {}) {
    const expected = copy(b); expected.neili -= neili;
    expected.qi = Math.max(-1, b.qi - damage); expected.eff_qi = Math.max(-1, b.eff_qi - wound);
    if (wound) expected.qi = Math.min(expected.qi, expected.eff_qi);
    expected.craze = Math.min(b.max_craze, b.craze + (damage > 150 ? Math.trunc(damage / 5) : 0) + (wound > 150 ? Math.trunc(wound / 3) : 0));
    if (action) expected.temp.fight = { attack: action.attack, dodge: action.dodge, parry: action.parry };
    const actual = copy(a); delete actual.temp.notify_fail; delete expected.temp.notify_fail;
    assert.deepEqual(actual, expected, 'unexplained state/resource mutation');
}
function defense(result, incoming, b, t) {
    const ready = t.skills[skill] >= 150 && t.living && t.neili >= 500 && b.weapon === 'none'
        && t.cultivation.reborn && ['force', 'unarmed', 'parry'].every(k => t.mappings[k] === skill);
    const ap = (b.effective_skills.force ?? 0) * 12 + b.max_neili, dp = t.effective_skills.force * 12 + t.neili;
    if (result && typeof result === 'object') { assert.ok(ready && Math.trunc(ap / 2) < dp);
        assert.deepEqual(Object.keys(map(result)).sort(), ['damage', 'msg']); assert.equal(result.damage, -incoming);
        assert.ok(defenseMessages.includes(plain(result.msg))); return Math.min(Math.trunc(incoming / 2), 100); }
    assert.equal(num(result), 0); return null; // The original coin always permits a non-cancel result.
}
function passive(result, incoming, b, t) {
    const ready = incoming >= 150 && b.skills[skill] >= 150 && b.neili >= 300 && b.cultivation.reborn
        && b.mappings.force === skill && b.mappings.unarmed === skill && b.preparations.unarmed === skill;
    const trigger = !!ready && Math.trunc(incoming / 5) > t.effective_con;
    if (trigger) { assert.ok(passiveMessages.includes(plain(result))); return Math.trunc((incoming - 80) / 2); }
    assert.equal(num(result), 0); return null;
}
const sourceActions = [
    ['$N飞身一跃而起，身法陡然加快，朝着$n$l快速攻出数十拳', 510, 190, 100, 90, 180, '刺伤'],
    ['$N沉身运气，一拳击向$n，刹那间，$N全身竟浮现出一道金光', 510, 185, 90, 120, 175, '刺伤'],
    ['$N将九阳神功运劲于臂，一掌凌空劈斩而出，划出一道炽热的黄芒', 530, 175, 90, 110, 200, '割伤'],
    ['$N跨步上前，身形微微一展，双掌对准$n$l一并攻出', 525, 185, 85, 115, 185, '刺伤'],
    ['$N急催九阳神功内劲，猛的一拳在呼啸声中陡然挥击而出', 530, 165, 90, 115, 200, '刺伤']];
function actionValid(a) {
    assert.deepEqual(Object.keys(map(a)).sort(), ['action', 'attack', 'damage', 'damage_type', 'dodge', 'force', 'parry', 'weapon']);
    assert.equal(plain(a.weapon), '九阳无极劲'); assert.ok(sourceActions.some(v =>
        ['action', 'force', 'attack', 'dodge', 'parry', 'damage', 'damage_type'].every((k, i) => a[k] === v[i])));
}
const compress = n => n > 400 ? Math.trunc((n - 400) / 4) + 300 : n > 200 ? Math.trunc((n - 200) / 2) + 200 : Math.max(0, n);
function publicSupport(input, b, t, actualDamage, after) {
    const base = input + Math.trunc(input * (b.str * 2 + b.effective_str) / 300), candidates = [{ damage: 0, wound: 0 }];
    for (const pre of new Set([base, base + Math.trunc(base * 4 / b.int)])) {
        const damage = compress(pre); candidates.push({ damage, wound: 0 });
        for (let r = 0; r < 100; r++) { let w = compress(pre - r); w -= Math.trunc(w * 20 / 100); w -= Math.trunc(w * (t.con - 10) / 100);
            candidates.push({ damage, wound: Math.max(0, w) }); }
    }
    const chosen = candidates.find(x => { if (x.damage !== actualDamage) return false; try { transition(t, after, x); return true; } catch { return false; } });
    assert.ok(chosen, 'public D/W/craze must have joint source support'); return chosen;
}
export function validateMingjiaoJiuyangRecord(raw, c) {
    const p = validateMingjiaoJiuyangCondition(c);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), c.id); assert.equal(own(raw, 'method'), c.method);
    assert.ok(Number.isSafeInteger(own(raw, 'index')) && raw.index >= 0 && raw.index < c.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(own(raw, 'outcome'))) { assert.ok(typeof own(raw, 'reason') === 'string' && raw.reason.trim()); return null; }
    assert.equal(raw.outcome, 'observed'); assert.equal(own(raw, 'reason'), '');
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(own(raw, k).length, 2);
    for (const k of ['interfaces', 'actions', 'attacks', 'directs', 'passives', 'defenses', 'defense_messages', 'dodge_checks',
        'launches', 'refusals', 'callbacks', 'dropped', 'terminals']) assert.ok(Array.isArray(own(raw, k)));
    for (const k of ['directs', 'launches', 'refusals', 'callbacks', 'dropped']) assert.deepEqual(raw[k], []);
    const [b, t] = raw.before; initial(b, p.actor, 0, p); initial(t, p.target, 1, p);
    if (p.target_state) { const prep = map(own(raw, 'preparation')); initial(prep.before, p.target, 1, { ...p, target_state: undefined });
        const expected = copy(prep.before); expected.living = 0; expected.qi = expected.jing = 0; expected.temp.block_msg = { all: 1 };
        assert.deepEqual(prep.after, expected); assert.deepEqual(t, prep.after); }
    else assert.ok(!Object.hasOwn(raw, 'preparation'));
    assert.deepEqual(raw.terminals, p.target_state ? [{ side: 1, state: 'unconscious' }] : []);
    assert.deepEqual(raw.after, raw.immediate); assert.ok(!Object.hasOwn(raw, 'qkd_queue'));
    assert.deepEqual(Object.keys(map(own(raw, 'bhinfo'))).sort(), ['after', 'before', 'cleared']);
    for (const v of Object.values(raw.bhinfo)) assert.equal(num(v), 0);
    for (const e of raw.defense_messages) { assert.ok([0, 1].includes(e.side)); assert.equal(typeof own(e, 'type'), 'string'); assert.equal(typeof own(e, 'text'), 'string'); }
    let canceled = 0, triggered = 0, passiveWound = 0, defenseFee = 0, passiveFee = 0, publicDamage = 0, publicWound = 0, value = null;
    const ordinary = c.method === 'ordinary';
    if (!ordinary) {
        assert.ok(integer(own(raw, 'command_accepted')) > 0); assert.equal(raw.interfaces.length, 1);
        const e = raw.interfaces[0]; assert.equal(own(e, 'object'), object); assert.equal(own(e, 'function'), p.ability);
        assert.equal(own(e, 'implemented_by'), object); value = own(e, 'result');
        if (p.interface.argument) assert.equal(own(e, 'argument'), p.interface.argument);
        assert.deepEqual(raw.actions, []); assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.dodge_checks, []);
        if (p.ability === 'valid_enable') assert.equal(num(value), Number(p.interface.argument === 'force' || !!p.actor.properties.reborn
            && (['unarmed', 'parry'].includes(p.interface.argument) || !!p.actor.properties['can_learn/jiuyang-shengong/enable_weapon'] && ['sword', 'blade'].includes(p.interface.argument))));
        if (p.ability === 'query_effect_parry') assert.equal(num(value), parryEffect(t.skills[skill]));
        if (p.ability === 'valid_damage') {
            assert.deepEqual(raw.defenses, [{ actor: 0, target: 1, skill, incoming: p.interface.damage, result: value, route: 'interface' }]);
            const fee = defense(value, p.interface.damage, b, t); canceled = Number(fee !== null); defenseFee = fee ?? 0;
        } else assert.deepEqual(raw.defenses, []);
        if (p.ability === 'hit_ob') { assert.equal(raw.passives.length, 1); const e = raw.passives[0];
            assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.skill, skill); assert.equal(e.route, 'interface');
            assert.equal(e.incoming, p.interface.damage); assert.equal(e.factor, p.interface.factor); assert.deepEqual(e.result, value);
            assert.deepEqual(own(e, 'before'), raw.before); assert.deepEqual(own(e, 'after'), raw.immediate);
            const w = passive(value, e.incoming, b, t); triggered = Number(w !== null); passiveWound = w ?? 0; passiveFee = triggered * 50;
        } else assert.deepEqual(raw.passives, []);
        transition(b, raw.immediate[0], { neili: passiveFee }); transition(t, raw.immediate[1], { neili: defenseFee, wound: passiveWound });
    } else {
        assert.ok(!Object.hasOwn(raw, 'command_accepted')); assert.deepEqual(raw.interfaces, []); assert.deepEqual(raw.defenses, []);
        assert.equal(raw.actions.length, 1); const selected = raw.actions[0]; assert.equal(selected.actor, 0); assert.equal(selected.target, 1);
        assert.equal(selected.skill, skill); const a = selected.action; actionValid(a);
        assert.equal(raw.attacks.length, 1); const attack = raw.attacks[0]; assert.equal(attack.actor, 0); assert.equal(attack.target, 1);
        assert.equal(attack.type, 0); assert.ok([0, -1, -2].includes(attack.result)); assert.ok(integer(attack.damage) >= 0);
        assert.equal(raw.dodge_checks.length, 2); for (const [i, e] of raw.dodge_checks.entries()) {
            assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.type, 0); assert.equal(e.phase, i ? 'settled' : 'base');
            assert.ok(integer(e.ap) > 0 && integer(e.dp) > 0); assert.equal(num(own(e, 'skill')), 0); assert.equal(num(own(e, 'busy')), 0); }
        assert.equal(raw.dodge_checks[0].ap, raw.dodge_checks[1].ap); assert.equal(raw.dodge_checks[0].dp, raw.dodge_checks[1].dp);
        assert.equal(raw.passives.length, Number(attack.result === 0));
        if (attack.result === 0) {
            const e = raw.passives[0]; assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.skill, skill); assert.equal(e.route, 'martial'); assert.equal(e.factor, 0);
            const bonus = b.effective_str + Math.trunc(a.force * b.effective_str / 100);
            assert.ok(integer(e.incoming) >= Math.trunc(bonus / 3) && e.incoming <= Math.trunc((bonus * 2 - 1) / 3));
            const pre = own(e, 'before'), post = own(e, 'after'); assert.equal(pre.length, 2); assert.equal(post.length, 2);
            transition(b, pre[0], { action: a }); transition(t, pre[1]);
            const w = passive(e.result, e.incoming, pre[0], pre[1]); triggered = Number(w !== null); passiveWound = w ?? 0; passiveFee = triggered * 50;
            transition(pre[0], post[0], { neili: passiveFee }); transition(pre[1], post[1], { wound: passiveWound });
            transition(post[0], raw.immediate[0]); const damage = publicSupport(e.incoming, post[0], post[1], attack.damage, raw.immediate[1]);
            publicDamage = damage.damage; publicWound = damage.wound;
        } else { assert.equal(attack.damage, 0); transition(b, raw.immediate[0], { action: a }); transition(t, raw.immediate[1]); }
    }
    for (const side of [0, 1]) {
        const m = map(raw.metrics[side]); for (const v of Object.values(m)) assert.ok(integer(v) >= 0);
        for (const k of keys) { assert.equal(metric(m, k + '_recovery'), 0); assert.equal(metric(m, k + '_cost'), raw.before[side][k] - raw.after[side][k]); }
        const result = ordinary ? raw.attacks[0].result : null;
        const allowed = new Set(keys.flatMap(k => [k + '_cost', k + '_recovery']));
        for (const [k, code] of [['hit', 0], ['dodge', -1], ['parry', -2]]) { allowed.add(k); assert.equal(metric(m, k), Number(!side && ordinary && result === code)); }
        for (const [k, v] of Object.entries(m)) if (!allowed.has(k)) assert.equal(v, 0, 'unplanned event ' + k);
    }
    return { defense_calls: raw.defenses.length, canceled, passive_calls: raw.passives.length, triggered,
        passive_wound: passiveWound, defense_neili_cost: defenseFee, passive_neili_cost: passiveFee,
        public_damage: publicDamage, public_wound: publicWound,
        qi_cost: raw.metrics.reduce((n, m) => n + metric(m, 'qi_cost'), 0), eff_qi_cost: raw.metrics.reduce((n, m) => n + metric(m, 'eff_qi_cost'), 0),
        ordinary_result: ordinary ? raw.attacks[0].result : null, interface_value: value };
}
export function mingjiaoJiuyangEffects(rows, c) {
    validateMingjiaoJiuyangCondition(c); assert.ok(Array.isArray(rows)); const values = rows.map(r => validateMingjiaoJiuyangRecord(own(r, 'raw'), c));
    const known = values.filter(Boolean), unknown = values.length - known.length;
    const frequencies = key => { const counts = {}; for (const r of known) { const v = r[key], k = v && typeof v === 'object' ? JSON.stringify(v, Object.keys(v).sort()) : String(v);
        counts[k] = (counts[k] ?? 0) + 1; } return counts; };
    const sums = Object.fromEntries(['defense_calls', 'canceled', 'passive_calls', 'triggered', 'passive_wound', 'defense_neili_cost', 'passive_neili_cost',
        'public_damage', 'public_wound', 'qi_cost', 'eff_qi_cost'].map(k => [k, unknown ? null : known.reduce((n, v) => n + v[k], 0)]));
    return { validated: known.length, unknown, ...sums, ordinary_results: frequencies('ordinary_result'), interface_values: frequencies('interface_value'),
        qualification_note: c.parameters.qualification_note };
}
