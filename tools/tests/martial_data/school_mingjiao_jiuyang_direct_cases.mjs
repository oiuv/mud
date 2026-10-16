// Finite original hun/po/pi USER commands. Not natural cultivation or all Jiuyang abilities.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';
import { mingjiaoJiuyangSourcePaths } from './school_mingjiao_jiuyang_cases.mjs';

const copy = v => structuredClone(v), sha = v => createHash('sha256').update(v).digest('hex');
const skill = 'jiuyang-shengong', group = 'mingjiao-jiuyang-direct', prefix = 'school-mingjiao-direct-jiuyang-';
const abilities = ['hun', 'po', 'pi'], usages = { hun: 'unarmed', po: 'sword', pi: 'blade' };
const names = { hun: '「混沌一阳」', po: '「金阳破岭」', pi: '「骄阳劈天」' };
export const mingjiaoJiuyangDirectSourcePaths = [...new Set([...mingjiaoJiuyangSourcePaths,
    ...abilities.map(a => `kungfu/skill/${skill}/perform/${a}.c`), 'feature/sserver.c', 'cmds/skill/perform.c',
    'clone/weapon/gangdao.c', 'inherit/weapon/blade.c'])];
export const mingjiaoJiuyangDirectReviewedSourceHash = '37ebf7815967281065dfe4a47123a47e1c84d24515ef176d96cfe2a283e3fdcd';
export const mingjiaoJiuyangDirectAbsentPaths = abilities.flatMap(a => ['c', 'lpc'].map(ext => `kungfu/skill/${usages[a]}/${a}.${ext}`));
const proof = e => sha(JSON.stringify(mingjiaoJiuyangDirectSourcePaths.map(path => [path, e[path]])));
const flag = 'can_learn/jiuyang-shengong/enable_weapon';
const pool = { name: '试侠', gender: '男性', race: '人类', class: '', character: '光明磊落',
    str: 36, int: 40, con: 36, dex: 36, shen: 90000, combat_exp: 100000000,
    qi: 1000000, eff_qi: 1000000, max_qi: 1000000, jing: 1000000, eff_jing: 1000000, max_jing: 1000000,
    neili: 6000, max_neili: 6000, jingli: 1000, max_jingli: 1000, potential: 10000, learned_points: 0, jiali: 0,
    reborn: 1, [flag]: 1, 'family/family_name': '明教', 'env/auto_regenerate': 0, 'env/no_learn': 0, doing: 0,
    'tattoo/tattoo_str': 0, 'tattoo/tattoo_int': 0, 'tattoo/tattoo_con': 0, 'tattoo/tattoo_dex': 0,
    'special_skill/wuxing': 0, ...Object.fromEntries(abilities.map(a => ['can_perform/' + skill + '/' + a, 0])) };
const gear = type => ({ type, program: '/clone/weapon/' + ({ sword: 'gangjian', blade: 'gangdao', dagger: 'dagger' })[type] });
function actor(level, ability, minimum = false) {
    const usage = usages[ability], basic = minimum ? ability === 'hun' ? 1 : 240 : level;
    const a = { skills: { force: basic, unarmed: ability === 'hun' ? basic : 200, sword: usage === 'sword' ? basic : 200,
        blade: usage === 'blade' ? basic : 200, parry: 200, dodge: 600, 'martial-cognize': 100, [skill]: level },
        mappings: { force: skill, [usage]: skill }, preparations: ability === 'hun' ? { unarmed: skill } : {},
        properties: { ...copy(pool), ['can_perform/' + skill + '/' + ability]: 1 } };
    if (ability !== 'hun') a.equipment = gear(usage);
    if (minimum) { a.properties.max_neili = ability === 'hun' ? 300 : 5500; a.properties.neili = ability === 'hun' ? 300 : 400; }
    return a;
}
function target(a, ability) {
    const l = a.skills[skill], usage = usages[ability];
    return { skills: { force: ability === 'hun' ? 4 * l : a.skills.force + l, parry: ability === 'hun' ? 200 : a.skills[usage],
        unarmed: 200, dodge: 600, 'martial-cognize': 100 }, mappings: {}, preparations: {},
        properties: { ...copy(pool), name: '试客', neili: 10000, max_neili: 10000 } };
}
function plans() {
    const out = [];
    const add = (ability, variant, cfg, t = target(cfg, ability), extra = {}) => out.push({
        id: prefix + ability + '-' + variant, stage: 'school', method: 'perform', parameters: {
            school: 'mingjiao', family: '明教', collection_group: group, variant, skill, ability, usage: usages[ability], level: cfg.skills[skill],
            actor: cfg, target: t, named_participants: true, fighting: true, room: {}, expected: 'observed', not_applicable: '',
            action: `perform ${usages[ability]}.${ability} right`, observe_seconds: 0, observation: 'single_action_immediate', random_effects: true,
            formal_samples: 100, qualification_sources: [...mingjiaoJiuyangDirectSourcePaths],
            qualification_note: '原普通USER的有限hun/po/pi，技能/领悟/转世与原map_skill、prepare_skill是明示实验赋值，不冒自然学习或enable命令准备。目标DP=AP为可达分支校准，不是同级公平比较；最低po/pi存储max5500高于本配置原容量4307，是施展实验池而非自然可得。minimum基础等级保留原本体门槛，弱熟练按实际有效等级随机。同步final按原直伤输入扣目标内力；不调用九阳武学hit_ob，不含jiu/ri/三exert/修养。', ...extra } });
    for (const ability of abilities) {
        for (const l of [400, 800]) add(ability, String(l), actor(l, ability));
        add(ability, 'minimum', actor(ability === 'hun' ? 180 : 220, ability, true));
        if (ability !== 'hun') { const a = actor(400, ability); delete a.mappings.force; add(ability, 'force-unmapped', a); }
        const baseline = actor(400, ability), t = target(baseline, ability), usage = usages[ability], name = names[ability];
        const reject = (variant, edit, refusal, scope = 'ability', extra = {}) => { const a = copy(baseline); edit(a);
            add(ability, variant, a, copy(t), { expected: 'refused', random_effects: false, formal_samples: 2, refusal, refusal_scope: scope, ...extra }); };
        const unmapped = `你现在的(${usage})中并没有这种外功。\n`;
        reject('grant0', a => { a.properties['can_perform/' + skill + '/' + ability] = 0; }, '你所使用的外功中没有这种功能。\n');
        reject('reborn0', a => { a.properties.reborn = 0; }, unmapped, 'dispatch');
        reject('not-fighting', () => {}, name + '只能对战斗中的对手使用。\n', 'ability', { fighting: false });
        if (ability === 'hun') {
            reject('primary-sword', a => { a.equipment = gear('sword'); }, name + '只能空手施展。\n');
            reject('dual', a => { a.equipment = gear('sword'); a.secondary_equipment = gear('dagger'); }, name + '只能空手施展。\n');
            reject('level179', a => { a.skills[skill] = 179; }, '你的九阳神功还不够娴熟，难以施展' + name + '。\n');
            reject('unarmed-unmapped', a => { delete a.mappings.unarmed; }, unmapped, 'dispatch');
            reject('force-unmapped', a => { delete a.mappings.force; }, '你现在没有激发九阳神功为内功，难以施展' + name + '。\n');
            reject('unprepared', a => { a.preparations = {}; }, '你现在没有准备使用九阳神功，难以施展' + name + '。\n');
            reject('neili299', a => { a.properties.neili = 299; }, '你的内力不够，难以施展' + name + '。\n');
        } else {
            reject('weapon-flag0', a => { a.properties[flag] = 0; }, unmapped, 'dispatch');
            reject('no-weapon', a => { delete a.equipment; }, '你使用的武器不对，难以施展' + name + '。\n');
            reject('wrong-weapon', a => { a.equipment = gear(ability === 'po' ? 'blade' : 'sword'); }, '你使用的武器不对，难以施展' + name + '。\n');
            reject('level219', a => { a.skills[skill] = 219; }, '你的九阳神功不够娴熟，难以施展' + name + '。\n');
            reject('force239', a => { a.skills.force = 239; }, '你的内功根基不够，难以施展' + name + '。\n');
            reject('basic239', a => { a.skills[usage] = 239; }, '你的基本' + (ability === 'po' ? '剑' : '刀') + '法火候不够，难以施展' + name + '。\n');
            reject('max5499', a => { a.properties.max_neili = 5499; a.properties.neili = 400; }, '你的内力修为不足，难以施展' + name + '。\n');
            reject('neili399', a => { a.properties.neili = 399; }, '你现在真气不够，难以施展' + name + '。\n');
            reject('usage-unmapped', a => { delete a.mappings[usage]; }, unmapped, 'dispatch');
        }
        reject('unconscious', () => {}, '对方都已经这样了，用不着这么费力吧？\n', 'ability', { target_state: 'unconscious' });
        reject('busy1', a => { a.busy = 1; }, '( 你上一个动作还没有完成，不能施用外功。)\n', 'command');
        reject('no-perform', a => { a.temp = { no_perform: 1 }; }, '你只觉全身力道竟似涣散了一般，全然无法控制。\n', 'command');
    }
    assert.equal(out.length, 54); assert.equal(out.filter(c => c.parameters.random_effects).length, 11); return out;
}
const entry = (p, evidence) => { const path = `kungfu/skill/${skill}/perform/${p.ability}.c`, line = p.ability === 'hun' ? 8 : 10;
    return { id: `${path}:${line}:perform`, path, line, function: 'perform', role: 'perform', sha256: evidence[path] }; };
export function mingjiaoJiuyangDirectConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.equal(typeof readSource, 'function'); assert.equal(mingjiaoJiuyangDirectSourcePaths.length, 129);
    const evidence = Object.fromEntries(mingjiaoJiuyangDirectSourcePaths.map(path => { const b = readSource(path); assert.ok(b.length); return [path, sha(b)]; }));
    assert.equal(proof(evidence), mingjiaoJiuyangDirectReviewedSourceHash, 'source changed: review required');
    for (const path of mingjiaoJiuyangDirectAbsentPaths) { let absent = false;
        try { readSource(path); } catch (e) { if (e.code === 'ENOENT') absent = true; else throw e; } assert.ok(absent, 'fallback appeared ' + path); }
    for (const ability of abilities) { const e = entry({ ability }, evidence), source = catalog.skills.find(s => s.path === e.path);
        assert.equal(source?.sha256, e.sha256); assert.ok(source.entries.some(x => x.id === e.id), 'original perform entry'); }
    return plans().map(c => ({ ...c, entry_id: entry(c.parameters, evidence).id, samples: smoke ? 2 : c.parameters.formal_samples,
        status: 'prepared_not_sampled', parameters: { ...c.parameters, source_entry: entry(c.parameters, evidence), source_evidence: copy(evidence),
            reviewed_source_hash: mingjiaoJiuyangDirectReviewedSourceHash, absent_sources: [...mingjiaoJiuyangDirectAbsentPaths],
            qualification_evidence: mingjiaoJiuyangDirectSourcePaths.map(path => ({ path, sha256: evidence[path] })) } }));
}
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v)); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing ' + k); return v[k]; };
const int = v => { assert.ok(Number.isSafeInteger(v)); return v; }, num = v => v === null ? 0 : int(v);
const sparse = (m, k) => Object.hasOwn(map(m), k) ? num(m[k]) : 0;
const metric = (m, k) => { const n = Object.hasOwn(map(m), k) ? int(m[k]) : 0; assert.ok(n >= 0); return n; };
const empty = v => { if (v && typeof v === 'object') assert.deepEqual(v, {}); else assert.equal(num(v), 0); };
const plain = v => { assert.equal(typeof v, 'string'); return v.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[256D\x1b\[K/g, ''); };
let fixed;
export function validateMingjiaoJiuyangDirectCondition(c) {
    fixed ??= new Map(plans().map(c => [c.id, c])); const plan = fixed.get(own(c, 'id')); assert.ok(plan);
    assert.equal(c.stage, plan.stage); assert.equal(c.method, plan.method);
    assert.ok(Number.isSafeInteger(c.samples) && [2, plan.parameters.formal_samples].includes(c.samples));
    const { source_entry, source_evidence, reviewed_source_hash, absent_sources, qualification_evidence, ...p } = map(own(c, 'parameters'));
    assert.deepEqual(p, plan.parameters); assert.deepEqual(Object.keys(map(source_evidence)), mingjiaoJiuyangDirectSourcePaths);
    for (const h of Object.values(source_evidence)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(proof(source_evidence), mingjiaoJiuyangDirectReviewedSourceHash); assert.equal(reviewed_source_hash, mingjiaoJiuyangDirectReviewedSourceHash);
    assert.deepEqual(source_entry, entry(p, source_evidence)); assert.equal(c.entry_id, source_entry.id);
    assert.deepEqual(absent_sources, mingjiaoJiuyangDirectAbsentPaths);
    assert.deepEqual(qualification_evidence, mingjiaoJiuyangDirectSourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    return c.parameters;
}
const active = (cfg, usage) => cfg.mappings[usage] === skill && (usage === 'force' || !!cfg.properties.reborn
    && (['unarmed', 'parry'].includes(usage) || !!cfg.properties[flag] && ['sword', 'blade'].includes(usage)));
function item(d, cfg) {
    assert.match(own(d, 'object'), new RegExp('^' + cfg.program + '#\\d+$'));
    const dagger = cfg.type === 'dagger';
    for (const [k, v] of Object.entries({ program: cfg.program, skill_type: cfg.type, flag: dagger ? 6 : 4,
        weight: cfg.type === 'blade' ? 7000 : 6000, material: 'steel', damage: dagger ? 13 : 25, stable: 37, consistence: 100 })) assert.equal(own(d, k), v);
    for (const k of ['rigidity', 'no_wield', 'is_item_make']) assert.equal(num(own(d, k)), 0);
}
function initial(s, cfg, side, p, awake = false) {
    assert.match(own(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(own(s, 'id'), side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive']) assert.equal(own(s, k), 1);
    for (const k of ['wizardp', 'ghost']) assert.equal(num(own(s, k)), 0);
    const asleep = side === 1 && p.target_state === 'unconscious' && !awake;
    assert.equal(own(s, 'living'), asleep ? 0 : 1); assert.equal(num(own(s, 'busy')), cfg.busy ?? 0);
    for (const k of ['fighting_opponent', 'killing_opponent']) assert.equal(own(s, k), Number(p.fighting));
    assert.equal(own(s, 'craze'), 0); assert.equal(own(s, 'max_craze'), 5000); empty(own(s, 'conditions'));
    for (const k of ['skills', 'mappings', 'preparations']) assert.deepEqual(own(s, k), cfg[k]); assert.deepEqual(own(s, 'learned'), {});
    for (const [k, v] of Object.entries(cfg.properties)) {
        if (['name', 'race'].includes(k)) continue;
        const value = k.includes('/') || ['character', 'class', 'reborn', 'doing'].includes(k) ? own(s.cultivation, k) : own(s, k);
        const expected = asleep && ['qi', 'jing'].includes(k) ? 0 : v;
        if (expected === 0) assert.equal(num(value), 0, k); else assert.equal(value, expected, k);
    }
    for (const k of ['improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai']) assert.equal(num(own(s.cultivation, k)), 0);
    const apply = cfg.equipment ? { armor: 100, damage: 25, dodge: -2 } : { armor: 100 };
    assert.deepEqual(own(s.temp, 'apply'), apply);
    for (const k of ['str', 'dex', 'guarding', 'fight', 'powerup', 'shield', 'debuff', 'daub']) if (Object.hasOwn(s.temp, k)) empty(s.temp[k]);
    assert.equal(sparse(s.temp, 'no_perform'), cfg.temp?.no_perform ?? 0);
    assert.equal(own(s, 'effective_int'), s.int); assert.equal(own(s, 'effective_str'), s.str + Math.trunc(cfg.skills.unarmed / 10));
    assert.equal(own(s, 'effective_con'), s.con + Math.trunc(cfg.skills.force / 10)); assert.equal(own(s, 'effective_dex'), s.dex + Math.trunc(cfg.skills.dodge / 10));
    assert.deepEqual(own(s, 'effective_skills'), Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k,
        Math.trunc(v / 2) + (active(cfg, k) ? cfg.skills[skill] : 0) + (apply[k] ?? 0)])));
    assert.equal(own(s, 'weapon'), cfg.equipment?.type ?? 'none'); assert.equal(own(s, 'weapon_damage'), cfg.equipment ? 25 : 0);
    assert.equal(own(s, 'weapon_flag'), cfg.equipment ? 4 : 0);
    if (cfg.equipment) { item(own(s, 'weapon_details'), cfg.equipment); assert.equal(own(s.temp, 'weapon'), s.weapon_details.object); }
    else { assert.deepEqual(own(s, 'weapon_details'), {}); assert.equal(sparse(s.temp, 'weapon'), 0); }
    if (cfg.secondary_equipment) { item(own(s, 'secondary_weapon_details'), cfg.secondary_equipment);
        assert.equal(own(s, 'secondary_weapon'), 'dagger'); assert.equal(own(s.temp, 'secondary_weapon'), s.secondary_weapon_details.object); }
    else { assert.equal(own(s, 'secondary_weapon'), 'none'); assert.deepEqual(own(s, 'secondary_weapon_details'), {}); assert.equal(sparse(s.temp, 'secondary_weapon'), 0); }
    assert.equal(own(s, 'handing'), 'none'); assert.deepEqual(own(s, 'handing_details'), {});
}
const compress = d => d > 1500 ? Math.trunc((d - 1500) / 4) + 1000 : d > 500 ? Math.trunc((d - 500) / 2) + 500 : d;
function publicSupport(input, percent, before, targetBefore, type) {
    const n = input + (type === 1 ? before.temp.apply.damage : sparse(before.temp.apply, 'unarmed_damage'));
    const strength = before.str * 2 + before.effective_str;
    const scale = strength < 40 ? strength : strength < 70 ? Math.trunc((strength - 30) / 2) + 20 : Math.trunc((strength - 60) / 4) + 30;
    const base = n + Math.trunc(n * scale / 50), out = [];
    for (const pre of new Set([base, base + Math.trunc(base * 4 / before.int)])) {
        const damage = compress(pre);
        for (let armorRoll = 0; armorRoll < targetBefore.temp.apply.armor; armorRoll++) {
            let wound = Math.trunc((damage - armorRoll) * percent / 100);
            wound -= Math.trunc(wound * 20 / 100); wound -= Math.trunc(wound * (targetBefore.con - 10) / 100); wound = Math.max(0, wound);
            const eff_qi = Math.max(-1, targetBefore.eff_qi - wound), qi0 = Math.max(-1, targetBefore.qi - damage);
            out.push({ damage, wound, qi: wound ? Math.min(qi0, eff_qi) : qi0, eff_qi,
                craze: Math.min(targetBefore.max_craze, targetBefore.craze + (damage > 150 ? Math.trunc(damage / 5) : 0) + (wound > 150 ? Math.trunc(wound / 3) : 0)) });
        }
    }
    return out;
}
function stable(before, after, { fee = 0, busy = num(before.busy), gain = 0, publicDamage, wear = false } = {}) {
    const expected = copy(before), actual = copy(after); expected.neili -= fee; expected.busy = after.busy;
    assert.equal(num(after.busy), busy); expected.learned = gain ? { [skill]: gain } : before.learned;
    if (publicDamage) { expected.qi = publicDamage.qi; expected.eff_qi = publicDamage.eff_qi; expected.craze = publicDamage.craze; }
    if (wear) { assert.ok([99, 100].includes(int(after.weapon_details.consistence))); expected.weapon_details.consistence = after.weapon_details.consistence; }
    delete expected.temp.notify_fail; delete actual.temp.notify_fail;
    assert.deepEqual(actual, expected, 'unexplained state/resource/equipment mutation');
}
export function validateMingjiaoJiuyangDirectRecord(raw, c) {
    const p = validateMingjiaoJiuyangDirectCondition(c), accepted = p.expected === 'observed', hun = p.ability === 'hun';
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), c.id); assert.equal(own(raw, 'method'), 'perform');
    assert.ok(Number.isSafeInteger(own(raw, 'index')) && raw.index >= 0 && raw.index < c.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(own(raw, 'outcome'))) { assert.ok(typeof own(raw, 'reason') === 'string' && raw.reason.trim()); return null; }
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) { assert.ok(Array.isArray(own(raw, k))); assert.equal(raw[k].length, 2); }
    for (const k of ['actions', 'attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'callbacks', 'dropped']) assert.deepEqual(own(raw, k), []);
    for (const k of ['directs', 'launches', 'refusals', 'busy_calls', 'skill_messages', 'terminals']) assert.ok(Array.isArray(own(raw, k)));
    assert.deepEqual(raw.after, raw.immediate);
    const [b, t] = raw.before, [a, end] = raw.immediate;
    assert.notEqual(b.object, t.object); initial(b, p.actor, 0, p); initial(t, p.target, 1, p);
    if (p.target_state) {
        const prep = map(own(raw, 'preparation')); initial(own(prep, 'before'), p.target, 1, p, true);
        const expected = copy(prep.before); expected.living = 0; expected.qi = expected.jing = 0; expected.temp.block_msg = { all: 1 };
        assert.deepEqual(own(prep, 'after'), expected); assert.deepEqual(t, expected);
        assert.deepEqual(own(prep, 'terminals'), [{ side: 1, state: 'unconscious' }]);
    } else assert.ok(!Object.hasOwn(raw, 'preparation'));
    assert.deepEqual(raw.terminals, []); // Native preparation is separately accounted, not a command-produced terminal.
    assert.equal(own(raw, 'command_accepted'), Number(accepted));
    assert.deepEqual(raw.launches, accepted ? [{ actor: b.object, skill, argument: p.ability + ' right' }] : []);
    if (accepted) { assert.deepEqual(raw.refusals, []); assert.equal(own(raw, 'reason'), '');
        assert.equal(plain(own(a.temp, 'notify_fail')), '你所使用的外功中没有这种功能。\n'); }
    else { assert.equal(raw.refusals.length, 1); assert.equal(own(raw.refusals[0], 'actor'), b.object);
        assert.equal(own(raw.refusals[0], 'reason'), own(raw, 'reason')); assert.equal(plain(raw.reason), p.refusal);
        assert.equal(plain(own(a.temp, 'notify_fail')), p.refusal); }
    const fee = metric(raw.metrics[0], 'neili_cost'), hitFee = hun ? 250 : 350, missFee = hun ? 50 : 150;
    assert.ok(accepted ? [hitFee, missFee].includes(fee) : fee === 0); const hit = accepted && fee === hitFee;
    const actorBusy = num(own(a, 'busy'));
    assert.ok(accepted ? hun ? actorBusy === (hit ? 1 : 3) : [2, 3].includes(actorBusy) : actorBusy === (p.actor.busy ?? 0));
    assert.equal(num(own(end, 'busy')), 0);
    assert.equal(raw.busy_calls.length, Number(accepted));
    if (accepted) { const busy = raw.busy_calls[0]; assert.equal(own(busy, 'side'), 0); assert.equal(own(busy, 'caller_side'), 0);
        assert.equal(own(busy, 'requested'), actorBusy); assert.equal(num(own(busy, 'before')), 0); assert.equal(num(own(busy, 'after')), actorBusy); }
    const gain = sparse(own(a, 'learned'), skill), effective = own(b.effective_skills, skill);
    assert.ok(accepted ? effective >= 120 ? gain === 1 : [0, 1].includes(gain) : gain === 0);
    assert.deepEqual(a.learned, gain ? { [skill]: gain } : {}); assert.deepEqual(own(end, 'learned'), {});
    let input = null, damage = 0, wound = 0, targetFee = 0, joint;
    if (hit) {
        assert.equal(raw.directs.length, 1); const d = raw.directs[0];
        assert.equal(own(d, 'actor'), 0); assert.equal(own(d, 'target'), 1); assert.equal(own(d, 'type'), hun ? 0 : 1);
        const percent = int(own(d, 'percent')); assert.ok(hun ? percent === 50 : percent >= 85 && percent <= 89);
        assert.equal(own(d, 'weapon'), b.weapon); assert.equal(own(d, 'weapon_object'), hun ? '' : b.weapon_details.object);
        input = int(own(d, 'damage'));
        const ap = hun ? b.skills[skill] * 2 + b.con * 10 + b.skills['martial-cognize'] : b.effective_skills[p.usage] + b.skills.force;
        const dp = hun ? t.effective_skills.force + t.con * 10 + t.skills['martial-cognize'] : t.effective_skills.parry + t.skills.force;
        assert.equal(ap, dp, 'explicit branch-reachable target calibration');
        assert.ok(hun ? input >= Math.trunc(ap / 2) && input < Math.trunc(ap / 2) * 2
            : input >= ap && input < ap + Math.trunc(ap / 3), 'original direct input range');
        const support = publicSupport(input, percent, b, t, d.type);
        joint = support.find(o => o.qi === end.qi && o.eff_qi === end.eff_qi && o.craze === end.craze
            && metric(raw.metrics[1], 'qi_cost') === t.qi - o.qi && metric(raw.metrics[1], 'eff_qi_cost') === t.eff_qi - o.eff_qi);
        assert.ok(joint, 'public D/W/qi clamp/craze require one joint source support'); damage = joint.damage; wound = joint.wound;
        if (!hun) targetFee = Math.trunc(input / 4) + Math.trunc(input / 8);
    } else assert.deepEqual(raw.directs, []);
    const texts = raw.skill_messages.map(e => { assert.ok([0, 1].includes(own(e, 'side'))); assert.equal(typeof own(e, 'type'), 'string'); return plain(own(e, 'text')); });
    if (accepted) { assert.ok(texts.length); const msg = texts.join('').replace(/\s/g, '');
        assert.ok(msg.includes(hun ? hit ? '气团射得更快' : '发出的气团拨开' : hit ? '内息散乱' : '看透'), 'original branch message required'); }
    else assert.deepEqual(texts, []); // notify_fail is preserved via original temp/efun, not a fabricated transcript.
    stable(b, a, { fee, busy: actorBusy, gain, wear: hit && !hun });
    stable(t, end, { fee: targetFee, publicDamage: joint });
    for (const side of [0, 1]) {
        const m = map(raw.metrics[side]); for (const [k, v] of Object.entries(m)) { assert.ok(int(v) >= 0);
            if (!['neili_cost', 'qi_cost', 'eff_qi_cost', 'ability_launched', 'direct'].includes(k)) assert.equal(v, 0, 'unexpected event ' + k); }
        for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) { assert.equal(metric(m, k + '_recovery'), 0);
            assert.equal(raw.before[side][k] - raw.immediate[side][k], metric(m, k + '_cost')); }
        assert.equal(metric(m, 'ability_launched'), side ? 0 : Number(accepted)); assert.equal(metric(m, 'direct'), side ? 0 : Number(hit));
    }
    assert.equal(metric(raw.metrics[1], 'neili_cost'), targetFee);
    return { accepted, gate_hit: accepted ? hit : null, input_damage: input, public_damage: damage, public_wound: wound,
        actor_neili_cost: fee, target_neili_cost: targetFee, qi_cost: metric(raw.metrics[1], 'qi_cost'), eff_qi_cost: metric(raw.metrics[1], 'eff_qi_cost'),
        jing_cost: 0, eff_jing_cost: 0, weak_gain: gain, actor_busy: actorBusy,
        weapon_wear: Number(hit && !hun && a.weapon_details.consistence < b.weapon_details.consistence) };
}
export function mingjiaoJiuyangDirectEffects(rows, c) {
    validateMingjiaoJiuyangDirectCondition(c); assert.ok(Array.isArray(rows));
    const values = rows.map(r => validateMingjiaoJiuyangDirectRecord(own(r, 'raw'), c)), known = values.filter(Boolean), unknown = rows.length - known.length;
    const counts = Object.fromEntries(['accepted_commands', 'refused_commands', 'direct_calls', 'gate_hits', 'gate_misses', 'actor_neili_cost',
        'target_neili_cost', 'qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost', 'weak_gain', 'weapon_wear'].map(k => [k, unknown ? null :
        known.reduce((n, v) => n + (k === 'accepted_commands' ? Number(v.accepted) : k === 'refused_commands' ? Number(!v.accepted)
            : ['direct_calls', 'gate_hits'].includes(k) ? Number(v.gate_hit === true) : k === 'gate_misses' ? Number(v.gate_hit === false) : v[k]), 0)]));
    const busy = {}; for (const v of known) busy[String(v.actor_busy)] = (busy[String(v.actor_busy)] ?? 0) + 1;
    return { validated: known.length, unknown, ...counts,
        gate_probability: probability(known.filter(v => v.gate_hit === true).length, known.filter(v => v.accepted).length),
        input_damage: distribution(known.filter(v => v.gate_hit).map(v => v.input_damage)),
        public_damage: distribution(known.filter(v => v.gate_hit).map(v => v.public_damage)),
        public_wound: distribution(known.filter(v => v.gate_hit).map(v => v.public_wound)),
        actor_busy: busy, qualification_note: c.parameters.qualification_note };
}
