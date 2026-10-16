// Finite QKD defense window. Experimental skill grants are not natural recruitment or acquisition.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mingjiaoTeachersSourcePaths } from './school_mingjiao_teachers_cases.mjs';

const copy = v => structuredClone(v), sha = v => createHash('sha256').update(v).digest('hex');
const skill = 'qiankun-danuoyi', group = 'mingjiao-qkd', prefix = 'school-mingjiao-qkd-';
const original = '/kungfu/skill/' + skill;
export const mingjiaoQkdSourcePaths = [...new Set([...mingjiaoTeachersSourcePaths,
    'kungfu/skill/count.c', 'kungfu/skill/mathematics.c', 'cmds/skill/prepare.c',
    'feature/command.c', 'feature/message.c', 'adm/daemons/weapond.c', 'include/combat.h', 'adm/daemons/combatd.c'])];
export const mingjiaoQkdReviewedSourceHash = '5470f5b1cea5ee346e014f5d62201352f328648e29926ce26c925a353ca5a1bd';
const proofHash = e => sha(JSON.stringify(mingjiaoQkdSourcePaths.map(path => [path, e[path]])));
const properties = { name: '试侠', gender: '男性', class: '', character: '光明磊落', race: '人类',
    str: 36, int: 40, con: 36, dex: 36, shen: 80000, combat_exp: 100000000,
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 9000, max_neili: 9000, jingli: 1000, max_jingli: 1000, jiali: 0,
    potential: 10000, learned_points: 0, 'family/family_name': '明教',
    'env/auto_regenerate': 0, 'env/no_learn': 0, doing: 0,
    'tattoo/tattoo_str': 0, 'reborn/str': 0, 'tattoo/tattoo_int': 0, 'reborn/int': 0,
    'tattoo/tattoo_dex': 0, 'reborn/dex': 0, 'special_skill/wuxing': 0 };
const actor = (rawForce = 400) => ({ skills: { force: rawForce, unarmed: 600, parry: 600, dodge: 600 },
    mappings: {}, preparations: {}, properties: copy(properties) });
const defender = (level = 200, parry = level) => ({ skills: { force: 2400, unarmed: 600, parry, dodge: 600, [skill]: level },
    mappings: { parry: skill }, preparations: {}, properties: { ...copy(properties), name: '试客' } });
const sword = { type: 'sword', program: '/clone/weapon/gangjian' };
function rareActor() {
    const a = actor(); a.skills.strike = 200; a.skills['hanbing-mianzhang'] = 200; a.skills['shenghuo-xinfa'] = 200;
    a.mappings = { force: 'shenghuo-xinfa', strike: 'hanbing-mianzhang' };
    a.preparations = { strike: 'hanbing-mianzhang' }; a.properties.neili = a.properties.max_neili = 5000; return a;
}
function plans() {
    const out = [];
    const add = (variant, ability, a = actor(), t = defender(), rate = 'det', extra = {}) => {
        const method = ability === 'ordinary' ? 'ordinary' : 'interface';
        const p = { school: 'mingjiao', family: '明教', collection_group: group, variant, skill, usage: 'parry', ability,
            level: t.skills[skill], actor: a, target: t, named_participants: true, fighting: false, room: {},
            expected: 'observed', not_applicable: '', observation: 'original-callback-if-queued', observe_seconds: 0,
            callback_if_queued: true, action: method === 'ordinary' ? 'ordinary' : 'test_interface',
            random_observation: rate !== 'det', formal_samples: rate === 'rare' ? 300 : rate === 'random' ? 100 : 2,
            qualification_sources: mingjiaoQkdSourcePaths,
            qualification_note: '原明教乾坤防御的有限USER实验，不把教学、研读或NPC自用当已测战斗。'
                + 'QKD只按原parry使用，保留张无忌原无效dodge配置，不替NPC修正。目标基本force2400无映射保证800级的学习/进步资格。'
                + '原两次AP随机独立；只有实际新排入eval_function才等待2秒。300次降低七层缺样本概率但不保证触发；'
                + '回击使用原有效parry+对方有效force及REMOTE结算，不能称取消伤害返还。所有初态、师承和资格是明示实验。', ...extra };
        if (method === 'interface' && !p.interface) p.interface = { object: original, function: ability };
        out.push({ id: prefix + variant, stage: 'school', method, parameters: p });
    };
    for (const usage of ['parry', 'dodge']) add('enable-' + usage, 'valid_enable', actor(), defender(), 'det',
        { interface: { object: original, function: 'valid_enable', argument: usage } });
    for (const level of [79, 80, 199, 200, 279, 280, 349, 350]) {
        const t = defender(level, 1000); t.properties.max_neili = 10000; // 349*15+4000=9235: no concealed skill_improved exception.
        add('effect-' + level, 'query_effect_parry', actor(), t);
    }
    const outsider = defender(350, 1000); outsider.properties.max_neili = 10000; outsider.properties['family/family_name'] = '武当派';
    add('effect-outsider350', 'query_effect_parry', actor(), outsider);
    add('parry-message', 'query_parry_msg', actor(), defender(), 'random',
        { interface: { object: original, function: 'query_parry_msg', argument: '胸口' } });
    const damage = (variant, a, t, rate, extra = {}) => add(variant, 'valid_damage', a, t, rate,
        { interface: { object: original, function: 'valid_damage', damage: 1000 }, ...extra });
    damage('damage-skill99', actor(100), defender(99, 100), 'det');
    damage('damage-unconscious100', actor(100), defender(100), 'det', { target_state: 'unconscious' });
    for (const level of [100, 200, 400, 800]) damage('damage-' + level, actor(level), defender(level), 'random');
    for (const [variant, extraSkill, raw, rate] of [['count99-fail', 'count', 99, 'det'],
        ['count100-fail', 'count', 100, 'random'], ['math100-fail', 'mathematics', 100, 'det']]) {
        const a = actor(800); a.skills[extraSkill] = raw; damage('damage-' + variant, a, defender(200, 400), rate);
    }
    const normalSword = actor(200); normalSword.equipment = copy(sword);
    damage('damage-weapon200', normalSword, defender(200), 'random');
    const rare = (variant, mutate, rate = 'random') => {
        const a = rareActor(), t = defender(351, 1000), extra = { fighting: true };
        mutate?.(a, t, extra); damage('seven-' + variant, a, t, rate, extra);
    };
    rare('eligible351', null, 'rare');
    rare('level350', (a, t) => { t.skills[skill] = 350; });
    rare('max-equal', a => { a.properties.neili = a.properties.max_neili = 6000; });
    rare('count99', a => { a.skills.count = 99; }, 'rare');
    rare('count100', a => { a.skills.count = 100; });
    rare('busy2', (a, t) => { t.busy = 2; });
    rare('defender-nuoyi', (a, t) => { t.temp = { nuoyi: { left: 1 } }; });
    rare('attacker-nuoyi', a => { a.temp = { nuoyi: { right: 1 } }; });
    rare('empty-map', a => { a.mappings = {}; a.preparations = {}; });
    rare('empty-skills', a => { a.skills = {}; a.mappings = {}; a.preparations = {}; });
    rare('weapon', a => { a.skills.sword = 200; a.skills['xiaoyao-jian'] = 200;
        a.mappings.sword = 'xiaoyao-jian'; a.equipment = copy(sword); }, 'rare');
    rare('no-fight', (a, t, e) => { e.fighting = false; }, 'rare');
    rare('mixed-callback', (a, t) => { a.skills.force = 800; a.skills['shenghuo-shengong'] = 600;
        a.mappings.force = 'shenghuo-shengong'; t.skills[skill] = 400; }, 'rare');
    for (const level of [200, 400, 800]) add('ordinary-' + level, 'ordinary', actor(), defender(level), 'random');
    add('direct-parry400', 'do_damage', actor(), defender(400), 'random',
        { interface: { object: '/adm/daemons/combatd', function: 'do_damage', damage: 1000, percent: 80, attack_type: 0 } });
    assert.equal(out.length, 39); assert.equal(out.reduce((n, c) => n + c.parameters.formal_samples, 0), 3430);
    return out;
}
const entries = { valid_enable: ['kungfu/skill/qiankun-danuoyi.c', 26, 'query_or_gate'],
    query_parry_msg: ['kungfu/skill/qiankun-danuoyi.c', 30, 'query_or_gate'],
    valid_damage: ['kungfu/skill/qiankun-danuoyi.c', 83, 'query_or_gate'],
    query_effect_parry: ['kungfu/skill/qiankun-danuoyi.c', 264, 'query_or_gate'],
    do_damage: ['adm/daemons/combatd.c', 980, 'other_function'] };
function sourceEntry(p, evidence) {
    if (['ordinary', 'do_damage'].includes(p.ability)) return { id: 'kungfu/skill/qiankun-danuoyi.c', path: 'kungfu/skill/qiankun-danuoyi.c',
        line: 1, function: '', role: 'file', sha256: evidence['kungfu/skill/qiankun-danuoyi.c'] };
    const [path, line, role] = entries[p.ability]; return { id: path + ':' + line + ':' + p.ability,
        path, line, function: p.ability, role, sha256: evidence[path] };
}
export function mingjiaoQkdConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof readSource, 'function'); assert.equal(typeof smoke, 'boolean'); assert.equal(mingjiaoQkdSourcePaths.length, 124);
    const evidence = Object.fromEntries(mingjiaoQkdSourcePaths.map(path => [path, sha(readSource(path))]));
    assert.equal(proofHash(evidence), mingjiaoQkdReviewedSourceHash, 'QKD source changed; review required');
    const base = catalog.skills.find(s => s.id === skill); assert.equal(base?.sha256, evidence['kungfu/skill/qiankun-danuoyi.c']);
    for (const ability of ['valid_enable', 'query_parry_msg', 'valid_damage', 'query_effect_parry'])
        assert.ok(base.entries.some(e => e.id === sourceEntry({ ability }, evidence).id));
    return plans().map(c => {
        const entry = sourceEntry(c.parameters, evidence);
        return { ...c, entry_id: entry.id, samples: smoke ? 2 : c.parameters.formal_samples, status: 'prepared_not_sampled',
            parameters: { ...c.parameters, source_entry: entry, source_evidence: copy(evidence),
                qualification_evidence: mingjiaoQkdSourcePaths.map(path => ({ path, sha256: evidence[path] })),
                reviewed_source_hash: mingjiaoQkdReviewedSourceHash, absent_sources: [],
                ...(c.parameters.ability === 'do_damage' ? { direct_source_entry: {
                    id: 'adm/daemons/combatd.c:980:do_damage', path: 'adm/daemons/combatd.c', line: 980,
                    function: 'do_damage', role: 'other_function', sha256: evidence['adm/daemons/combatd.c'] } } : {}) } };
    });
}
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v), 'mapping required'); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing ' + k); return v[k]; };
let fixed;
export function validateMingjiaoQkdCondition(c) {
    fixed ??= new Map(plans().map(c => [c.id, c])); const planned = fixed.get(own(c, 'id')); assert.ok(planned, 'unknown QKD condition');
    assert.equal(c.stage, 'school'); assert.equal(c.method, planned.method);
    assert.ok(Number.isSafeInteger(c.samples) && [2, planned.parameters.formal_samples].includes(c.samples));
    const { source_entry, source_evidence, qualification_evidence, reviewed_source_hash, absent_sources, direct_source_entry, ...p } = map(own(c, 'parameters'));
    assert.deepEqual(p, planned.parameters); assert.deepEqual(Object.keys(map(source_evidence)), mingjiaoQkdSourcePaths);
    for (const h of Object.values(source_evidence)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(proofHash(source_evidence), mingjiaoQkdReviewedSourceHash); assert.equal(reviewed_source_hash, mingjiaoQkdReviewedSourceHash);
    assert.deepEqual(qualification_evidence, mingjiaoQkdSourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    assert.deepEqual(absent_sources, []); assert.deepEqual(source_entry, sourceEntry(p, source_evidence)); assert.equal(c.entry_id, source_entry.id);
    if (p.ability === 'do_damage') assert.deepEqual(direct_source_entry, {
        id: 'adm/daemons/combatd.c:980:do_damage', path: 'adm/daemons/combatd.c', line: 980,
        function: 'do_damage', role: 'other_function', sha256: source_evidence['adm/daemons/combatd.c'] });
    else assert.ok(!Object.hasOwn(c.parameters, 'direct_source_entry'));
    return c.parameters;
}

const integer = v => { assert.ok(Number.isSafeInteger(v), 'integer required'); return v; };
const zero = v => { assert.ok(v === null || v === 0, 'original LPC zero required'); return 0; };
const number = v => v === null ? 0 : integer(v);
const plain = s => { assert.equal(typeof s, 'string'); return s.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''); };
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const parryMessages = [
    '$N一招击在$n身上，却被$n暗运乾坤大挪移，将内力尽数移入地下。\n',
    '$n轻轻一带，$N发现自己招数回击过来，吓得往后倒退几步。\n',
    '$n手臂回转，在$N手肘下轻轻一推，$N招数落空。\n',
    '$n右手伸出，在$N手腕上轻轻一拉，$N收势不住，直往前扑去。\n',
    '$n身形不动，$N一招击下，有如石沉大海，不觉呆住了。\n',
    '$n左牵右引，$N如身处漩流，连续转了好几个圈子。\n',
    '$n双手回圈，$N只觉得前面好象有一堵墙，再也攻不进去。\n',
    '$n轻轻一转，$N一招击在地上，只打得尘土飞扬。\n'];
const failMessages = [
    '$n暗运乾坤大挪移，试图将内力尽数移入地下，然而$N早已勘破其中奥妙，内力变化莫测。\n',
    '$n轻轻一带，$N发现自己招数回击过来，急忙变招，身转如意，反让$n防不胜防。\n',
    '$n手臂回转，在$N手肘下轻轻一推，然而$N招数忽的一变，并未落空。\n',
    '$n右手伸出，在$N手腕上轻轻一拉，$N收势不住，顺势变招扑前直击。\n',
    '$n左牵右引，$N如身处漩流，顺势变招，圆转如意，随心所欲。\n',
    '$n双手回圈，$N只觉得前面好象有一堵墙，猛然警醒，聚力于一点，力攻对方。\n'];
const metric = (m, k) => Object.hasOwn(map(m), k) ? integer(m[k]) : 0;
const extraParry = (l, family) => family !== '明教' || l < 80 ? 0 : l < 200 ? 40 : l < 280 ? 60 : l < 350 ? 80 : 100;
function initial(s, cfg, side, p) {
    assert.match(own(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(own(s, 'id'), side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive']) assert.equal(own(s, k), 1);
    for (const k of ['wizardp', 'ghost']) zero(own(s, k));
    assert.equal(own(s, 'living'), side && p.target_state ? 0 : 1);
    assert.equal(number(own(s, 'busy')), cfg.busy ?? 0); assert.equal(own(s, 'fighting_opponent'), Number(p.fighting));
    assert.deepEqual(own(s, 'skills'), cfg.skills); assert.deepEqual(own(s, 'mappings'), cfg.mappings);
    assert.deepEqual(own(s, 'preparations'), cfg.preparations); assert.deepEqual(own(s, 'learned'), {});
    const cond = own(s, 'conditions'); if (cond && typeof cond === 'object') assert.deepEqual(cond, {}); else zero(cond);
    for (const [k, v] of Object.entries(cfg.properties)) {
        if (['name', 'race'].includes(k)) continue; // Not exposed by ROOTsnapshot.
        const observed = k.includes('/') || ['character', 'class', 'doing'].includes(k) ? own(s.cultivation, k) : own(s, k);
        const expected = side && p.target_state && ['qi', 'jing'].includes(k) ? 0 : v;
        if (expected === 0) zero(observed); else assert.equal(observed, expected, k);
    }
    for (const k of ['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
        'special_skill/guimai', 'wudang-jiuyang', 'immune/poison']) zero(own(s.cultivation, k));
    assert.deepEqual(own(s, 'effective_skills'), Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
        [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (cfg.equipment && k === 'dodge' ? -2 : 0)])));
    assert.equal(own(s, 'effective_int'), s.int); assert.equal(own(s, 'effective_dex'), s.dex + Math.trunc((cfg.skills.dodge ?? 0) / 10));
    assert.equal(own(s, 'effective_con'), s.con + Math.trunc((cfg.skills.force ?? 0) / 10));
    assert.equal(own(s, 'effective_str'), s.str + Math.trunc(Math.max(0, ...['unarmed', 'strike', 'finger', 'hand', 'claw', 'cuff'].map(k => cfg.skills[k] ?? 0)) / 10));
    assert.equal(own(s, 'craze'), 0); assert.equal(own(s, 'max_craze'), 5000);
    const apply = cfg.equipment ? { armor: 100, damage: 25, dodge: -2 } : { armor: 100 };
    assert.deepEqual(own(s.temp, 'apply'), apply);
    for (const k of ['guarding', 'str', 'dex', 'fight', 'powerup']) assert.ok(!Object.hasOwn(s.temp, k) || number(s.temp[k]) === 0);
    if (cfg.temp) assert.deepEqual(own(s.temp, 'nuoyi'), cfg.temp.nuoyi); else assert.ok(!Object.hasOwn(s.temp, 'nuoyi') || number(s.temp.nuoyi) === 0);
    assert.equal(own(s, 'weapon'), cfg.equipment ? 'sword' : 'none');
    assert.equal(own(s, 'weapon_damage'), cfg.equipment ? 25 : 0); assert.equal(own(s, 'weapon_flag'), cfg.equipment ? 4 : 0);
    if (cfg.equipment) { assert.match(own(s.weapon_details, 'object'), /^\/clone\/weapon\/gangjian#\d+$/);
        assert.equal(own(s.weapon_details, 'program'), cfg.equipment.program); assert.equal(own(s.weapon_details, 'weight'), 6000); }
    else assert.deepEqual(own(s, 'weapon_details'), {});
    assert.equal(own(s, 'handing'), 'none'); assert.deepEqual(own(s, 'handing_details'), {});
}
function transition(before, after, { nuoyi, busy = number(before.busy), ordinary = false, damage = 0, wound = 0 } = {}) {
    const expected = copy(before); expected.busy = busy;
    if (!busy && !number(before.busy)) expected.busy = after.busy; // Original explicit null/0 representation only.
    assert.equal(number(own(after, 'busy')), busy);
    if (ordinary) expected.temp.fight = { attack: 0, dodge: 0, parry: 0 };
    if (nuoyi !== undefined) { if (nuoyi === false) delete expected.temp.nuoyi; else expected.temp.nuoyi = nuoyi; }
    expected.qi = Math.max(-1, before.qi - damage); expected.eff_qi = Math.max(-1, before.eff_qi - wound);
    if (wound > 0) expected.qi = Math.min(expected.qi, expected.eff_qi);
    expected.craze = Math.min(before.max_craze, before.craze + (damage > 150 ? Math.trunc(damage / 5) : 0) + (wound > 150 ? Math.trunc(wound / 3) : 0));
    // The original command dispatch owns notify_fail; it is not a combat mutation.
    delete expected.temp.notify_fail; const actual = copy(after); delete actual.temp.notify_fail;
    if (ordinary) for (const k of ['attack', 'dodge', 'parry']) zero(own(actual.temp.fight, k));
    if (ordinary) expected.temp.fight = copy(actual.temp.fight);
    assert.deepEqual(actual, expected, 'only source-supported resource/busy/nuoyi/default-action changes');
}
const compress = d => d > 400 ? Math.trunc((d - 400) / 4) + 300 : d > 200 ? Math.trunc((d - 200) / 2) + 200 : Math.max(0, d);
function damageSupport(input, sender, receiver, direct, percent = 80) {
    const str = sender.str * 2 + sender.effective_str;
    const k = str < 40 ? str : str < 70 ? Math.trunc((str - 30) / 2) + 20 : Math.trunc((str - 60) / 4) + 30;
    const base = input + Math.trunc(input * (direct ? k / 50 : str / 300)), out = direct ? [] : [{ damage: 0, wound: 0 }];
    for (const pre of new Set([base, base + Math.trunc(base * 4 / sender.int)])) {
        const d = direct ? pre > 1500 ? Math.trunc((pre - 1500) / 4) + 1000 : pre > 500 ? Math.trunc((pre - 500) / 2) + 500 : pre : compress(pre);
        if (!direct) out.push({ damage: d, wound: 0 });
        for (let armor = 0; armor < 100; armor++) {
            let w = direct ? Math.trunc((d - armor) * percent / 100) : compress(pre - armor);
            w -= Math.trunc(w * 20 / 100); w -= Math.trunc(w * (receiver.con - 10) / 100);
            out.push({ damage: d, wound: Math.max(0, w) });
        }
    }
    return out;
}
function settle(before, after, sender, receiver, input, direct, percent, opts = {}, actualDamage) {
    const candidates = damageSupport(input, before[sender], before[receiver], direct, percent);
    const selected = candidates.find(o => {
        if (actualDamage !== undefined && o.damage !== actualDamage) return false;
        try { transition(before[receiver], after[receiver], { ...opts, ...o }); return true; } catch { return false; }
    });
    assert.ok(selected, 'joint original qi/wound/raw-con/craze support'); return selected;
}
function queuePoint(point, owner, fighting, pending) {
    assert.deepEqual(Object.keys(map(point)).sort(), ['fighting', 'pending', 'wall_time']);
    assert.ok(Number.isFinite(own(point, 'wall_time')) && point.wall_time > 0);
    assert.deepEqual(own(point, 'fighting'), [Number(fighting), Number(fighting)]);
    assert.equal(own(point, 'pending').length, pending);
    for (const e of point.pending) { assert.deepEqual(Object.keys(map(e)).sort(), ['function', 'owner', 'remaining', 'tuple_size']);
        assert.equal(e.owner, owner); assert.equal(e.function, 'eval_function'); assert.equal(e.tuple_size, 3);
        assert.ok(integer(e.remaining) >= 0 && e.remaining <= 1); }
}
function defenseResult(result, input, b, t, queued) {
    const eligible = t.skills[skill] >= 100 && !!t.living, mp = b.skills.count ?? 0;
    const ap = (b.skills.force ?? 0) + mp, dp = t.skills.parry;
    const possible = eligible && Math.trunc(ap / 2) < dp;
    if (result && typeof result === 'object') {
        assert.ok(possible); assert.deepEqual(Object.keys(map(result)).sort(), ['damage', 'msg']);
        assert.equal(result.damage, -input); const text = plain(result.msg);
        if (queued) { assert.ok(!number(t.busy) && !t.temp.nuoyi && !b.temp.nuoyi && t.skills[skill] > 350
            && Math.trunc(t.max_neili * 2 / 3) > b.max_neili && Object.keys(b.skills).length && Object.keys(b.mappings).length && mp < 100);
            const name = b.weapon === 'sword' ? '逍遥剑法' : '寒冰绵掌';
            assert.equal(text, '\n$N一招攻出，却见$n迎身而上，冷笑道：「区区' + name + '，能奈我何？」\n$n当即运起乾坤大挪移第七层心法，企图挪移$N的攻势。\n\n');
        } else assert.ok(parryMessages.includes(text));
        return true;
    }
    zero(result); assert.equal(queued, false);
    assert.ok(!eligible || Math.trunc(ap / 2) + Math.max(0, ap - 1) >= dp, 'cannot fail an always-cancel defense');
    return false;
}
export function validateMingjiaoQkdRecord(raw, c) {
    const p = validateMingjiaoQkdCondition(c);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), c.id); assert.equal(own(raw, 'method'), c.method);
    assert.ok(Number.isSafeInteger(own(raw, 'index')) && raw.index >= 0 && raw.index < c.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(own(raw, 'outcome'))) { assert.ok(typeof own(raw, 'reason') === 'string' && raw.reason.trim()); return null; }
    assert.equal(raw.outcome, 'observed'); assert.equal(own(raw, 'reason'), '');
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(own(raw, k).length, 2);
    for (const k of ['actions', 'directs', 'attacks', 'passives', 'defenses', 'defense_messages', 'dodge_checks',
        'interfaces', 'launches', 'refusals', 'callbacks', 'dropped', 'terminals', 'busy_calls']) assert.ok(Array.isArray(own(raw, k)), k);
    for (const k of ['passives', 'launches', 'refusals', 'dropped']) assert.deepEqual(raw[k], []);
    const [b, t] = raw.before, [a, end] = raw.immediate;
    if (p.target_state) { const prep = map(own(raw, 'preparation')); initial(prep.before, p.target, 1, { ...p, target_state: undefined });
        const expected = copy(prep.before); expected.living = 0; expected.qi = expected.jing = 0; expected.temp.block_msg = { all: 1 };
        assert.deepEqual(prep.after, expected); assert.deepEqual(t, prep.after); }
    else assert.ok(!Object.hasOwn(raw, 'preparation'));
    initial(b, p.actor, 0, p); initial(t, p.target, 1, p);
    assert.deepEqual(raw.terminals, p.target_state ? [{ side: 1, state: 'unconscious' }] : []);
    for (const e of raw.defense_messages) { assert.ok([0, 1].includes(e.side)); assert.equal(typeof own(e, 'type'), 'string'); assert.equal(typeof own(e, 'text'), 'string'); }
    assert.deepEqual(Object.keys(map(own(raw, 'bhinfo'))).sort(), ['after', 'before', 'cleared']); zero(raw.bhinfo.before); zero(raw.bhinfo.cleared);
    const q = map(own(raw, 'qkd_queue')); assert.deepEqual(Object.keys(q).sort(), ['before', 'final', 'immediate']);
    const queued = own(q.immediate, 'pending').length === 1;
    queuePoint(q.before, t.object, p.fighting, 0); queuePoint(q.immediate, t.object, p.fighting, Number(queued)); queuePoint(q.final, t.object, p.fighting, 0);
    assert.ok(q.before.wall_time <= q.immediate.wall_time && q.immediate.wall_time <= q.final.wall_time);
    let canceled = false, publicDamage = 0, publicWound = 0, callbackOutcome = 'not_queued', callbackDamage = 0, callbackWound = 0;
    const ordinary = c.method === 'ordinary', direct = p.ability === 'do_damage';
    let value;
    if (!ordinary) {
        assert.ok(integer(own(raw, 'command_accepted')) > 0); assert.equal(raw.interfaces.length, 1);
        const e = raw.interfaces[0]; assert.equal(own(e, 'object'), p.interface.object); assert.equal(own(e, 'function'), p.ability);
        assert.equal(own(e, 'implemented_by'), direct ? '/adm/daemons/combatd' : original); value = own(e, 'result');
        if (direct) assert.equal(typeof value, 'string', 'original do_damage returns text');
        if (Object.hasOwn(p.interface, 'argument')) assert.equal(own(e, 'argument'), p.interface.argument);
        assert.deepEqual(raw.actions, []); assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.dodge_checks, []);
        if (p.ability === 'valid_enable') assert.equal(number(value), Number(p.interface.argument === 'parry'));
        if (p.ability === 'query_effect_parry') assert.equal(number(value), extraParry(t.skills[skill], t.cultivation['family/family_name']));
        if (p.ability === 'query_parry_msg') assert.ok(parryMessages.includes(value));
    } else {
        assert.ok(!Object.hasOwn(raw, 'command_accepted')); assert.deepEqual(raw.interfaces, []); assert.equal(raw.actions.length, 1);
        const action = raw.actions[0]; assert.equal(action.actor, 0); assert.equal(action.target, 1); zero(own(action, 'skill'));
        assert.deepEqual(Object.keys(map(action.action)).sort(), ['action', 'damage_type']); assert.equal(typeof action.action.action, 'string');
        assert.ok(['瘀伤', '抓伤'].includes(action.action.damage_type)); assert.equal(raw.attacks.length, 1);
        const attack = raw.attacks[0]; assert.equal(attack.actor, 0); assert.equal(attack.target, 1); assert.equal(attack.type, 0);
        assert.ok([0, -1, -2].includes(attack.result)); assert.ok(integer(attack.damage) >= 0); assert.equal(raw.dodge_checks.length, 2);
        for (const [i, e] of raw.dodge_checks.entries()) { assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.type, 0);
            assert.equal(e.phase, i ? 'settled' : 'base'); zero(own(e, 'skill')); zero(own(e, 'busy'));
            assert.ok(integer(e.ap) > 0 && integer(e.dp) > 0); assert.equal(e.ap, e.dp); }
        assert.deepEqual(raw.dodge_checks[0].ap, raw.dodge_checks[1].ap); assert.equal(raw.dodge_checks[0].dp, raw.dodge_checks[1].dp);
        assert.equal(raw.defenses.length, Number(attack.result === 0));
    }
    if (p.ability === 'valid_damage' || direct || ordinary && raw.attacks[0].result === 0) {
        assert.equal(raw.defenses.length, 1); const e = raw.defenses[0];
        assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.skill, skill);
        assert.equal(e.route, ordinary ? 'ordinary' : direct ? 'direct' : 'interface');
        assert.ok(integer(e.incoming) >= (ordinary ? 32 : 1000) && e.incoming <= (ordinary ? 63 : 1000));
        if (p.ability === 'valid_damage') assert.deepEqual(e.result, value);
        canceled = defenseResult(own(e, 'result'), e.incoming, b, t, queued);
        if (!ordinary && !direct && !canceled && t.living && t.skills[skill] >= 100 && (b.skills.count ?? 0) >= 100)
            assert.ok(failMessages.includes(plain(own(raw.bhinfo, 'after'))));
        else zero(own(raw.bhinfo, 'after'));
    } else { assert.deepEqual(raw.defenses, []); assert.equal(queued, false); zero(raw.bhinfo.after); }
    transition(b, a, { ordinary });
    if (ordinary && !canceled && raw.attacks[0].result === 0 || direct && !canceled) {
        const result = settle(raw.before, raw.immediate, 0, 1, raw.defenses[0].incoming, direct, 80, {}, ordinary ? raw.attacks[0].damage : undefined);
        publicDamage = result.damage; publicWound = result.wound;
    } else { transition(t, end, queued ? { nuoyi: { left: 1 }, busy: 2 } : {});
        if (ordinary) assert.equal(raw.attacks[0].damage, 0); }
    let callbackInput = 0;
    if (queued) {
        assert.equal(raw.callbacks.length, 2); assert.ok(q.final.wall_time - q.immediate.wall_time >= 1);
        for (const [i, e] of raw.callbacks.entries()) {
            assert.equal(e.side, 1); assert.equal(e.phase, i ? 'after' : 'before'); assert.ok(Number.isFinite(e.elapsed) && e.elapsed >= 0 && e.elapsed <= raw.elapsed);
            const { owner, function: fn, states, ...point } = map(own(e, 'qkd')); assert.equal(owner, t.object); assert.equal(fn, 'eval_function');
            assert.equal(states.length, 2); queuePoint(point, t.object, p.fighting, 0); assert.deepEqual(e.state, states[1]);
            assert.ok(point.wall_time >= q.immediate.wall_time && point.wall_time <= q.final.wall_time);
        }
        assert.deepEqual(raw.callbacks[0].qkd.states, raw.immediate); assert.deepEqual(raw.callbacks[1].qkd.states, raw.after);
        const callbackBefore = raw.callbacks[0].qkd.states;
        if (!p.fighting) { callbackOutcome = 'early_return'; assert.deepEqual(raw.after, raw.immediate); }
        else {
            const ap = end.effective_skills.parry, dp = a.effective_skills.force;
            transition(end, raw.after[1], { busy: 2, nuoyi: false });
            if (raw.directs.length) { assert.ok(Math.trunc(dp / 2) < ap); callbackOutcome = 'hit'; callbackInput = ap + dp;
                const result = settle(callbackBefore, raw.after, 1, 0, callbackInput, true, 300);
                callbackDamage = result.damage; callbackWound = result.wound;
            } else { assert.ok(Math.trunc(dp / 2) + Math.max(0, dp - 1) >= ap); callbackOutcome = 'miss'; transition(a, raw.after[0]); }
        }
    } else { assert.deepEqual(raw.callbacks, []); assert.deepEqual(raw.after, raw.immediate); }
    assert.equal(raw.busy_calls.length, queued ? p.fighting ? 2 : 1 : 0);
    for (const [i, e] of raw.busy_calls.entries()) { assert.equal(e.side, 1); assert.equal(e.requested, 2);
        assert.ok([-1, 0, 1].includes(integer(own(e, 'caller_side')))); if (!i) assert.equal(e.caller_side, 0);
        assert.equal(number(e.before), i ? 2 : 0); assert.equal(number(e.after), 2); }
    const expectedDirect = direct ? [{ actor: 0, target: 1, type: 0, damage: 1000, percent: 80, weapon: 'none', weapon_object: '' }]
        : callbackOutcome === 'hit' ? [{ actor: 1, target: 0, type: 2, damage: callbackInput, percent: 300, weapon: 'none', weapon_object: '' }] : [];
    assert.deepEqual(raw.directs, expectedDirect);
    for (const side of [0, 1]) {
        const m = map(raw.metrics[side]); for (const n of Object.values(m)) assert.ok(integer(n) >= 0);
        for (const k of resources) { assert.equal(metric(m, k + '_recovery'), 0);
            assert.equal(metric(m, k + '_cost'), raw.before[side][k] - raw.after[side][k]); }
        const expected = { direct: side ? Number(callbackOutcome === 'hit') : Number(direct),
            hit: !side && ordinary ? Number(raw.attacks[0].result === 0) : 0,
            dodge: !side && ordinary ? Number(raw.attacks[0].result === -1) : 0,
            parry: !side && ordinary ? Number(raw.attacks[0].result === -2) : 0 };
        for (const [k, v] of Object.entries(expected)) assert.equal(metric(m, k), v);
        const allowed = new Set([...resources.flatMap(k => [k + '_cost', k + '_recovery']), ...Object.keys(expected)]);
        for (const [k, v] of Object.entries(m)) if (!allowed.has(k)) assert.equal(v, 0, 'unplanned event ' + k);
    }
    return { defense_calls: raw.defenses.length, canceled: Number(canceled), queued: Number(queued), callback_outcome: callbackOutcome,
        callback_input: callbackInput, callback_damage: callbackDamage, callback_wound: callbackWound,
        public_damage: publicDamage, public_wound: publicWound, ordinary_result: ordinary ? raw.attacks[0].result : null,
        interface_value: ordinary ? null : value, bhinfo: raw.bhinfo.after };
}
export function mingjiaoQkdEffects(rows, c) {
    validateMingjiaoQkdCondition(c); assert.ok(Array.isArray(rows));
    const results = rows.map(row => validateMingjiaoQkdRecord(own(row, 'raw'), c)), known = results.filter(Boolean);
    const sum = k => known.reduce((n, r) => n + r[k], 0);
    const frequencies = k => {
        const counts = new Map();
        for (const r of known) {
            const value = r[k], key = value && typeof value === 'object'
                ? JSON.stringify(value, Object.keys(value).sort()) : String(value);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return Object.fromEntries(counts);
    };
    const unknown = results.length - known.length;
    return { validated: known.length, unknown, results: frequencies('callback_outcome'),
        defense_calls: unknown ? null : sum('defense_calls'), canceled: unknown ? null : sum('canceled'), queued: unknown ? null : sum('queued'),
        callback_hit: unknown ? null : known.filter(r => r.callback_outcome === 'hit').length,
        callback_miss: unknown ? null : known.filter(r => r.callback_outcome === 'miss').length,
        callback_early_return: unknown ? null : known.filter(r => r.callback_outcome === 'early_return').length,
        callback_input: unknown ? null : sum('callback_input'), callback_damage: unknown ? null : sum('callback_damage'),
        callback_wound: unknown ? null : sum('callback_wound'), public_damage: unknown ? null : sum('public_damage'), public_wound: unknown ? null : sum('public_wound'),
        qi_cost: unknown ? null : rows.reduce((n, r) => n + r.raw.metrics.reduce((s, m) => s + metric(m, 'qi_cost'), 0), 0),
        eff_qi_cost: unknown ? null : rows.reduce((n, r) => n + r.raw.metrics.reduce((s, m) => s + metric(m, 'eff_qi_cost'), 0), 0),
        ordinary_results: frequencies('ordinary_result'), interface_values: frequencies('interface_value'),
        qualification_note: c.parameters.qualification_note };
}
