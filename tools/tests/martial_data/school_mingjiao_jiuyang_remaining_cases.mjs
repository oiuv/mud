// Original synchronous nine-hit JIU and per-enemy RI. Not all Jiuyang or natural cultivation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';
import { mingjiaoJiuyangDirectSourcePaths } from './school_mingjiao_jiuyang_direct_cases.mjs';
const copy = v => structuredClone(v), sha = b => createHash('sha256').update(b).digest('hex');
const skill = 'jiuyang-shengong', group = 'mingjiao-jiuyang-remaining', prefix = 'school-mingjiao-remaining-jiuyang-';
const abilities = ['jiu', 'ri'], name = { jiu: '「九曦混阳」', ri: '「魔光日无极」' };
export const mingjiaoJiuyangRemainingSourcePaths = [...new Set([...mingjiaoJiuyangDirectSourcePaths,
    ...abilities.map(a => `kungfu/skill/${skill}/perform/${a}.c`), 'kungfu/skill/eff_msg.h'])];
export const mingjiaoJiuyangRemainingReviewedSourceHash = 'a5a433c4036c9b4fdf10b9d6f9e9e36a304bc06eb8381669d479db402a0c1ee2';
export const mingjiaoJiuyangRemainingAbsentPaths = abilities.flatMap(a => ['c', 'lpc'].map(ext => `kungfu/skill/unarmed/${a}.${ext}`));
const evidenceHash = e => sha(JSON.stringify(mingjiaoJiuyangRemainingSourcePaths.map(p => [p, e[p]])));
const flag = 'can_learn/jiuyang-shengong/enable_weapon';
const pool = { name: '试侠', gender: '男性', race: '人类', class: '', character: '光明磊落',
    str: 36, int: 40, con: 36, dex: 36, shen: 90000, combat_exp: 100000000,
    qi: 1000000, eff_qi: 1000000, max_qi: 1000000, jing: 1000000, eff_jing: 1000000, max_jing: 1000000,
    neili: 9000, max_neili: 9000, jingli: 1000, max_jingli: 1000, jiali: 0, potential: 10000, learned_points: 0,
    reborn: 1, [flag]: 1, 'family/family_name': '明教', 'env/auto_regenerate': 0, 'env/no_learn': 0, doing: 0,
    'tattoo/tattoo_str': 0, 'tattoo/tattoo_int': 0, 'tattoo/tattoo_con': 0, 'tattoo/tattoo_dex': 0, 'special_skill/wuxing': 0,
    ...Object.fromEntries(['hun', 'po', 'pi', ...abilities].map(a => ['can_perform/' + skill + '/' + a, 0])) };
const gear = type => ({ type, program: '/clone/weapon/' + (type === 'sword' ? 'gangjian' : 'dagger') });
function actor(l, ability, minimum = false) {
    const basic = minimum ? 1 : l;
    return { skills: { force: basic, unarmed: basic, parry: 200, dodge: 600, 'martial-cognize': 100, [skill]: l },
        mappings: { force: skill, unarmed: skill }, preparations: { unarmed: skill }, temp: { 'apply/attack': 0 },
        properties: { ...copy(pool), ['can_perform/' + skill + '/' + ability]: 1,
            ...(minimum ? { max_neili: ability === 'jiu' ? 4000 : 8000, neili: ability === 'jiu' ? 500 : 2000 } : {}) } };
}
function target(a, ability) {
    const l = a.skills[skill];
    return { skills: { force: ability === 'jiu' ? 0 : a.skills.force + a.skills.unarmed + l,
        unarmed: 200, parry: ability === 'jiu' ? 2 * Math.trunc(a.skills.unarmed / 2) + 2 * l : 200,
        dodge: 600, 'martial-cognize': 100 }, mappings: {}, preparations: {},
        properties: { ...copy(pool), name: '试客', neili: 10000, max_neili: 10000 } };
}
function plans() {
    const out = [];
    const add = (ability, variant, a, t = target(a, ability), extra = {}) => out.push({
        id: prefix + ability + '-' + variant, stage: 'school', method: 'perform', parameters: {
            school: 'mingjiao', family: '明教', collection_group: group, ability, variant, skill, usage: 'unarmed', level: a.skills[skill],
            actor: a, target: t, named_participants: true, fighting: true, room: {}, expected: 'observed', not_applicable: '',
            action: ability === 'jiu' ? 'perform unarmed.jiu right' : 'perform unarmed.ri',
            observe_seconds: 0, observation: 'single_action_immediate', random_effects: true, formal_samples: 100,
            qualification_sources: [...mingjiaoJiuyangRemainingSourcePaths],
            qualification_note: '原普通USER的有限九击/敌人列表同步施展；等级/领悟/转世/储存内力及原map_skill/prepare_skill是明示实验，不冒自然养成。DP=AP为分支可达校准不是公平同级对比；minimum基本功1与储存池仅施展门槛，未补学习资格。JIU固定300与逐击武学附伤50分账，暂时攻击加成恢复；RI原四类直接receive与neili-500后SET0保留毛支出/恢复，不是公共COMBAT伤害，敌人和旁观者明确分开。其它修养/三exert未在本窗。', ...extra } });
    for (const ability of abilities) {
        const minimum = ability === 'jiu' ? 200 : 250;
        add(ability, 'minimum', actor(minimum, ability, true));
        for (const l of [minimum, 400, 800]) add(ability, String(l), actor(l, ability));
        if (ability === 'jiu') {
            for (const n of [599, 600, 650]) { const a = actor(400, ability); a.properties.neili = n; add(ability, 'neili' + n, a); }
            const busy = target(actor(400, ability), ability); busy.busy = 2; add(ability, 'target-busy2', actor(400, ability), busy);
            const resistant = target(actor(400, ability), ability); resistant.skills.force = 5000; add(ability, 'no-passive-con', actor(400, ability), resistant);
            const easy = target(actor(400, ability), ability); easy.skills.parry = 0; easy.properties.con = 30; add(ability, 'outer-always', actor(400, ability), easy);
            const hard = target(actor(400, ability), ability); hard.skills.parry = 10000; add(ability, 'outer-impossible', actor(400, ability), hard);
        } else {
            const easy = target(actor(400, ability), ability); easy.skills.force = 0; add(ability, 'outer-always', actor(400, ability), easy);
            const hard = target(actor(400, ability), ability); hard.skills.force = 5000;
            add(ability, 'outer-impossible', actor(400, ability), hard, { random_effects: false, formal_samples: 2 });
            for (const n of [-1, 0, 499, 500]) { const t = target(actor(400, ability), ability); t.properties.neili = n; add(ability, 'target-neili' + n, actor(400, ability), t); }
            const busy = target(actor(400, ability), ability); busy.busy = 2; add(ability, 'target-busy2', actor(400, ability), busy);
            add(ability, 'unconscious-enemy', actor(400, ability), undefined, { target_state: 'unconscious' });
            const a = actor(400, ability), t = target(a, ability);
            add(ability, 'two-enemies', a, t, { extra_target: { ...copy(t), properties: { ...copy(t.properties), name: '试伴' } }, extra_target_fighting: true });
            add(ability, 'mixed-enemies', actor(400, ability), easy,
                { extra_target: { ...copy(hard), properties: { ...copy(hard.properties), name: '试伴' } }, extra_target_fighting: true });
            add(ability, 'nonenemy-bystander', actor(400, ability), copy(t),
                { extra_target: { ...copy(t), properties: { ...copy(t.properties), name: '试伴' } }, extra_target_fighting: false });
        }
        const base = actor(400, ability), t = target(base, ability), title = name[ability];
        const reject = (variant, edit, refusal, scope = 'ability', extra = {}) => { const a = copy(base); edit(a);
            add(ability, variant, a, copy(t), { expected: 'refused', random_effects: false, formal_samples: 2, refusal, refusal_scope: scope, ...extra }); };
        const outer = '你现在的(unarmed)中并没有这种外功。\n';
        reject('grant0', a => { a.properties['can_perform/' + skill + '/' + ability] = 0; }, '你所使用的外功中没有这种功能。\n');
        reject('reborn0', a => { a.properties.reborn = 0; }, outer, 'dispatch');
        reject('not-fighting', () => {}, title + '只能对战斗中的对手使用。\n', 'ability', { fighting: false });
        reject('primary-sword', a => { a.equipment = gear('sword'); }, title + '只能空手施展。\n');
        reject('dual', a => { a.equipment = gear('sword'); a.secondary_equipment = gear('dagger'); }, title + '只能空手施展。\n');
        const max = ability === 'jiu' ? 4000 : 8000;
        reject('max' + (max - 1), a => { a.properties.max_neili = max - 1; a.properties.neili = 2000; }, '你的内力的修为不够，现在无法使用' + title + '。\n');
        reject('level' + (minimum - 1), a => { a.skills[skill] = minimum - 1; }, '你的九阳神功还不够娴熟，难以施展' + title + '。\n');
        reject('unarmed-unmapped', a => { delete a.mappings.unarmed; }, outer, 'dispatch');
        reject('force-unmapped', a => { delete a.mappings.force; }, '你现在没有激发九阳神功为内功，难以施展' + title + '。\n');
        reject('unprepared', a => { a.preparations = {}; }, '你现在没有准备使用九阳神功，难以施展' + title + '。\n');
        const current = ability === 'jiu' ? 500 : 2000;
        reject('neili' + (current - 1), a => { a.properties.neili = current - 1; }, '你的真气不够，无法运用' + title + '。\n');
        if (ability === 'jiu') reject('unconscious', () => {}, '对方都已经这样了，用不着这么费力吧？\n', 'ability', { target_state: 'unconscious' });
        reject('busy1', a => { a.busy = 1; }, '( 你上一个动作还没有完成，不能施用外功。)\n', 'command');
        reject('no-perform', a => { a.temp.no_perform = 1; }, '你只觉全身力道竟似涣散了一般，全然无法控制。\n', 'command');
    }
    assert.equal(out.length, 53); assert.equal(out.filter(c => c.parameters.random_effects).length, 25); return out;
}
const entry = (p, evidence) => { const path = `kungfu/skill/${skill}/perform/${p.ability}.c`, line = p.ability === 'jiu' ? 8 : 10;
    return { id: `${path}:${line}:perform`, path, line, function: 'perform', role: 'perform', sha256: evidence[path] }; };
export function mingjiaoJiuyangRemainingConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof readSource, 'function'); assert.equal(typeof smoke, 'boolean'); assert.equal(mingjiaoJiuyangRemainingSourcePaths.length, 132);
    const evidence = Object.fromEntries(mingjiaoJiuyangRemainingSourcePaths.map(p => { const b = readSource(p); assert.ok(b.length); return [p, sha(b)]; }));
    assert.equal(evidenceHash(evidence), mingjiaoJiuyangRemainingReviewedSourceHash, 'source changed: review required');
    for (const p of mingjiaoJiuyangRemainingAbsentPaths) { let absent = false;
        try { readSource(p); } catch (e) { if (e.code === 'ENOENT') absent = true; else throw e; } assert.ok(absent, 'basic fallback appeared ' + p); }
    for (const ability of abilities) { const e = entry({ ability }, evidence), s = catalog.skills.find(s => s.path === e.path);
        assert.equal(s?.sha256, e.sha256); assert.ok(s.entries.some(x => x.id === e.id)); }
    return plans().map(c => ({ ...c, samples: smoke ? 2 : c.parameters.formal_samples, entry_id: entry(c.parameters, evidence).id, status: 'prepared_not_sampled',
        parameters: { ...c.parameters, source_entry: entry(c.parameters, evidence), source_evidence: copy(evidence), absent_sources: [...mingjiaoJiuyangRemainingAbsentPaths],
            reviewed_source_hash: mingjiaoJiuyangRemainingReviewedSourceHash,
            qualification_evidence: mingjiaoJiuyangRemainingSourcePaths.map(path => ({ path, sha256: evidence[path] })) } }));
}
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v)); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing ' + k); return v[k]; };
const int = v => { assert.ok(Number.isSafeInteger(v)); return v; }, num = v => v === null ? 0 : int(v);
const sparse = (v, k) => Object.hasOwn(map(v), k) ? num(v[k]) : 0;
const metric = (v, k) => { const n = Object.hasOwn(map(v), k) ? int(v[k]) : 0; assert.ok(n >= 0); return n; };
const empty = v => { if (v && typeof v === 'object') assert.deepEqual(v, {}); else assert.equal(num(v), 0); };
const plain = v => { assert.equal(typeof v, 'string'); return v.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[256D\x1b\[K/g, ''); };
let fixed;
export function validateMingjiaoJiuyangRemainingCondition(c) {
    fixed ??= new Map(plans().map(c => [c.id, c])); const plan = fixed.get(own(c, 'id')); assert.ok(plan);
    assert.equal(c.stage, plan.stage); assert.equal(c.method, plan.method); assert.ok(Number.isSafeInteger(c.samples) && [2, plan.parameters.formal_samples].includes(c.samples));
    const { source_entry, source_evidence, absent_sources, reviewed_source_hash, qualification_evidence, ...p } = map(own(c, 'parameters'));
    assert.deepEqual(p, plan.parameters); assert.deepEqual(Object.keys(map(source_evidence)), mingjiaoJiuyangRemainingSourcePaths);
    for (const h of Object.values(source_evidence)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(evidenceHash(source_evidence), mingjiaoJiuyangRemainingReviewedSourceHash); assert.equal(reviewed_source_hash, mingjiaoJiuyangRemainingReviewedSourceHash);
    assert.deepEqual(source_entry, entry(p, source_evidence)); assert.equal(c.entry_id, source_entry.id); assert.deepEqual(absent_sources, mingjiaoJiuyangRemainingAbsentPaths);
    assert.deepEqual(qualification_evidence, mingjiaoJiuyangRemainingSourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    return c.parameters;
}
const active = (cfg, k) => cfg.mappings[k] === skill && (k === 'force' || !!cfg.properties.reborn
    && (['unarmed', 'parry'].includes(k) || !!cfg.properties[flag] && ['sword', 'blade'].includes(k)));
function initial(s, cfg, side, p, awake = false) {
    assert.match(own(s, 'object'), /^\/tests\/actor#\d+$/); assert.equal(own(s, 'id'), ['left', 'right', 'third'][side]);
    for (const k of ['userp', 'playerp', 'interactive']) assert.equal(own(s, k), 1);
    for (const k of ['wizardp', 'ghost']) assert.equal(num(own(s, k)), 0);
    const asleep = side === 1 && p.target_state === 'unconscious' && !awake;
    assert.equal(own(s, 'living'), asleep ? 0 : 1); assert.equal(num(own(s, 'busy')), cfg.busy ?? 0);
    for (const k of ['fighting_opponent', 'killing_opponent']) assert.equal(own(s, k), Number(side === 2 ? p.extra_target_fighting : p.fighting));
    empty(own(s, 'conditions')); for (const k of ['skills', 'mappings', 'preparations']) assert.deepEqual(own(s, k), cfg[k]);
    assert.deepEqual(own(s, 'learned'), {}); assert.equal(own(s, 'craze'), 0); assert.equal(own(s, 'max_craze'), 5000);
    for (const [k, v] of Object.entries(cfg.properties)) {
        if (['name', 'race'].includes(k)) continue;
        const actual = k.includes('/') || ['character', 'class', 'reborn', 'doing'].includes(k) ? own(s.cultivation, k) : own(s, k);
        const expected = asleep && ['qi', 'jing'].includes(k) ? 0 : v;
        if (expected === 0) assert.equal(num(actual), 0); else assert.equal(actual, expected, k);
    }
    for (const k of ['improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai']) assert.equal(num(own(s.cultivation, k)), 0);
    const apply = { armor: 100, ...(cfg.equipment ? { damage: 25, dodge: -2 } : {}), ...(!side ? { attack: 0 } : {}) };
    assert.deepEqual(own(s.temp, 'apply'), apply); assert.equal(sparse(s.temp, 'no_perform'), cfg.temp?.no_perform ?? 0);
    for (const k of ['str', 'dex', 'fight', 'guarding', 'powerup', 'shield', 'daub', 'debuff']) if (Object.hasOwn(s.temp, k)) empty(s.temp[k]);
    assert.equal(own(s, 'effective_str'), s.str + Math.trunc(cfg.skills.unarmed / 10)); assert.equal(own(s, 'effective_int'), s.int);
    assert.equal(own(s, 'effective_con'), s.con + Math.trunc(cfg.skills.force / 10)); assert.equal(own(s, 'effective_dex'), s.dex + Math.trunc(cfg.skills.dodge / 10));
    assert.deepEqual(own(s, 'effective_skills'), Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k,
        Math.trunc(v / 2) + (active(cfg, k) ? cfg.skills[skill] : 0) + (apply[k] ?? 0)])));
    assert.equal(own(s, 'handing'), 'none'); assert.deepEqual(own(s, 'handing_details'), {});
    assert.equal(own(s, 'weapon'), cfg.equipment ? 'sword' : 'none'); assert.equal(own(s, 'weapon_flag'), cfg.equipment ? 4 : 0);
    assert.equal(own(s, 'weapon_damage'), cfg.equipment ? 25 : 0);
    for (const [slot, equipment] of [['weapon', cfg.equipment], ['secondary_weapon', cfg.secondary_equipment]]) {
        const d = own(s, slot + '_details');
        if (!equipment) { assert.deepEqual(d, {}); assert.equal(sparse(s.temp, slot), 0); if (slot === 'secondary_weapon') assert.equal(own(s, slot), 'none'); }
        else { assert.match(own(d, 'object'), new RegExp('^' + equipment.program + '#\\d+$'));
            const dagger = equipment.type === 'dagger';
            for (const [k, v] of Object.entries({ program: equipment.program, skill_type: equipment.type, flag: dagger ? 6 : 4,
                weight: 6000, material: 'steel', damage: dagger ? 13 : 25, stable: 37, consistence: 100 })) assert.equal(own(d, k), v);
            for (const k of ['rigidity', 'no_wield', 'is_item_make']) assert.equal(num(own(d, k)), 0);
            assert.equal(own(s.temp, slot), d.object); if (slot === 'secondary_weapon') assert.equal(own(s, slot), 'dagger'); }
    }
}
const rage = (before, amounts) => Math.min(before.max_craze, before.craze + amounts.reduce((n, [kind, d]) => n + (d > 150 ? Math.trunc(d / (kind === 'damage' ? 5 : 3)) : 0), 0));
function receive(before, { damage = 0, wound = 0, jing = 0, effJing = 0 } = {}) {
    const eff_qi = Math.max(-1, before.eff_qi - wound), eff_jing = Math.max(-1, before.eff_jing - effJing);
    return { qi: wound ? Math.min(Math.max(-1, before.qi - damage), eff_qi) : Math.max(-1, before.qi - damage), eff_qi,
        jing: effJing ? Math.min(Math.max(-1, before.jing - jing), eff_jing) : Math.max(-1, before.jing - jing), eff_jing,
        craze: rage(before, [['damage', damage], ['wound', wound], ['damage', jing], ['wound', effJing]]) };
}
function stable(before, after, changes = {}) {
    const expected = copy(before), actual = copy(after);
    for (const [k, v] of Object.entries(changes)) expected[k] = copy(v);
    delete expected.temp.notify_fail; delete actual.temp.notify_fail;
    assert.deepEqual(actual, expected, 'unexplained state/resource mutation');
}
const actions = [
    ['$N飞身一跃而起，身法陡然加快，朝着$n$l快速攻出数十拳', 510, 190, 100, 90, 180, '刺伤'],
    ['$N沉身运气，一拳击向$n，刹那间，$N全身竟浮现出一道金光', 510, 185, 90, 120, 175, '刺伤'],
    ['$N将九阳神功运劲于臂，一掌凌空劈斩而出，划出一道炽热的黄芒', 530, 175, 90, 110, 200, '割伤'],
    ['$N跨步上前，身形微微一展，双掌对准$n$l一并攻出', 525, 185, 85, 115, 185, '刺伤'],
    ['$N急催九阳神功内劲，猛的一拳在呼啸声中陡然挥击而出', 530, 165, 90, 115, 200, '刺伤']];
function action(a) { assert.deepEqual(Object.keys(map(a)).sort(), ['action', 'attack', 'damage', 'damage_type', 'dodge', 'force', 'parry', 'weapon']);
    assert.equal(plain(a.weapon), '九阳无极劲'); assert.ok(actions.some(v => ['action', 'force', 'attack', 'dodge', 'parry', 'damage', 'damage_type'].every((k, i) => a[k] === v[i]))); }
function power(s, usage, attack = false, selected) {
    const level = s.effective_skills[usage] + (attack ? sparse(s.temp.apply, 'attack') : sparse(s.temp.apply, 'defense'));
    const exp = s.combat_exp < 2000000 ? s.combat_exp : s.combat_exp < 3000000 ? 2000000 + Math.trunc((s.combat_exp - 2000000) / 10)
        : 2100000 + Math.trunc((s.combat_exp - 3000000) / 20);
    let n = level < 1 ? Math.trunc(exp / 2) : (level > 500 ? Math.trunc(level / 10) * level * level : Math.trunc(level ** 3 / 10)) + exp;
    n = Math.trunc(n / 30) * (attack ? s.str : s.dex);
    if (level >= 1 && attack) n += Math.trunc(n / 100) * selected.attack;
    return Math.max(1, n);
}
const compress = d => d > 400 ? Math.trunc((d - 400) / 4) + 300 : d > 200 ? Math.trunc((d - 200) / 2) + 200 : Math.max(0, d);
function publicSupport(input, b, t, actualDamage, after) {
    const base = input + Math.trunc(input * (b.str * 2 + b.effective_str) / 300), candidates = [{ damage: 0, wound: 0 }];
    for (const pre of new Set([base, base + Math.trunc(base * 4 / b.int)])) {
        const damage = compress(pre); candidates.push({ damage, wound: 0 });
        for (let r = 0; r < 100; r++) { let wound = compress(pre - r); wound -= Math.trunc(wound * 20 / 100); wound -= Math.trunc(wound * (t.con - 10) / 100);
            candidates.push({ damage, wound: Math.max(0, wound) }); }
    }
    const found = candidates.find(d => d.damage === actualDamage && Object.entries(receive(t, d)).every(([k, v]) => after[k] === v));
    assert.ok(found, 'public ordinary D/W/craze need joint source support'); return found;
}
function passive(e, before, after) {
    const [a, t] = before;
    const yes = e.incoming >= 150 && a.skills[skill] >= 150 && a.neili >= 300 && active({ skills: a.skills, mappings: a.mappings,
        properties: { reborn: a.cultivation.reborn, [flag]: a.cultivation[flag] } }, 'unarmed') && a.mappings.force === skill
        && a.preparations.unarmed === skill && Math.trunc(e.incoming / 5) > t.effective_con;
    const wound = yes ? Math.trunc((e.incoming - 80) / 2) : 0;
    if (yes) assert.ok(['只见$N九阳内劲自体内迸发，真气随招式而荡漾，摧毁了$n的真元！\n',
        '$N九阳神功的潜力发挥了出来，突然间$n只感喉咙一甜，喷出一口鲜血！\n'].includes(plain(own(e, 'result'))));
    else assert.equal(num(own(e, 'result')), 0);
    stable(a, after[0], { neili: a.neili - (yes ? 50 : 0) }); stable(t, after[1], receive(t, { wound }));
    return { triggered: Number(yes), wound, fee: yes ? 50 : 0 };
}
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const pair = v => { assert.ok(Array.isArray(v)); assert.equal(v.length, 2); v.forEach(map); return v; };
function busyCall(e, side, before, after) {
    assert.equal(own(e, 'side'), side); assert.equal(own(e, 'caller_side'), 0);
    assert.equal(int(own(e, 'requested')), after); assert.equal(num(own(e, 'before')), before); assert.equal(num(own(e, 'after')), after);
}
function resourceLedger(m, b, a, expected, events = {}) {
    map(m);
    for (const k of resources) {
        const cost = expected[k + '_cost'] ?? 0, recovery = expected[k + '_recovery'] ?? 0;
        assert.equal(metric(m, k + '_cost'), cost, k + ' gross cost'); assert.equal(metric(m, k + '_recovery'), recovery);
        assert.equal(b[k] - a[k], cost - recovery, k + ' ledger');
    }
    for (const [k, v] of Object.entries(events)) assert.equal(metric(m, k), v);
    const allowed = new Set([...resources.flatMap(k => [k + '_cost', k + '_recovery']), ...Object.keys(events)]);
    for (const [k, v] of Object.entries(m)) { assert.ok(int(v) >= 0); if (!allowed.has(k)) assert.equal(v, 0, 'unexpected event ' + k); }
}
function riSupport(ap, b, a, m, hit) {
    const cost = hit ? 500 : 0, recovery = Math.max(0, cost - b.neili);
    assert.equal(metric(m, 'neili_cost'), cost); assert.equal(metric(m, 'neili_recovery'), recovery);
    if (!hit) {
        stable(b, a, { neili: Math.max(0, b.neili) });
        for (const k of resources.filter(k => k !== 'neili')) assert.equal(metric(m, k + '_cost'), 0);
        return [];
    }
    const support = [];
    for (let d = Math.trunc(ap / 4); d < Math.trunc(ap / 4) + Math.trunc(ap / 3); d++) {
        const expected = receive(b, { damage: d, wound: Math.trunc(d / 2), jing: Math.trunc(d / 6), effJing: Math.trunc(d / 10) });
        if (Object.entries(expected).every(([k, v]) => a[k] === v)
            && resources.filter(k => k !== 'neili').every(k => metric(m, k + '_cost') === b[k] - expected[k])) support.push(d);
    }
    assert.ok(support.length, 'RI four resources/craze require one joint nominal input support');
    const d = support[0]; // Used only to validate the identical observable state; never reported as a unique hidden draw.
    stable(b, a, { ...receive(b, { damage: d, wound: Math.trunc(d / 2), jing: Math.trunc(d / 6), effJing: Math.trunc(d / 10) }),
        neili: Math.max(0, b.neili - 500), busy: a.busy }); assert.equal(num(a.busy), 1);
    return support;
}
export function validateMingjiaoJiuyangRemainingRecord(raw, c) {
    const p = validateMingjiaoJiuyangRemainingCondition(c), accepted = p.expected === 'observed', jiu = p.ability === 'jiu';
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), c.id); assert.equal(own(raw, 'method'), 'perform');
    assert.ok(Number.isSafeInteger(own(raw, 'index')) && raw.index >= 0 && raw.index < c.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    if (['error', 'not_applicable'].includes(own(raw, 'outcome'))) { assert.ok(typeof own(raw, 'reason') === 'string' && raw.reason.trim()); return null; }
    assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'after', 'metrics']) pair(own(raw, k));
    for (const k of ['directs', 'defenses', 'interfaces', 'callbacks', 'dropped', 'terminals']) assert.deepEqual(own(raw, k), []);
    for (const k of ['actions', 'attacks', 'passives', 'dodge_checks', 'busy_calls', 'skill_messages', 'launches', 'refusals']) assert.ok(Array.isArray(own(raw, k)));
    assert.deepEqual(raw.after, raw.immediate);
    const before = [...raw.before], after = [...raw.immediate], metrics = [...raw.metrics];
    if (p.extra_target) {
        for (const k of ['before', 'immediate', 'after', 'metrics']) map(own(raw, 'extra_target_' + k));
        assert.deepEqual(raw.extra_target_after, raw.extra_target_immediate);
        before.push(raw.extra_target_before); after.push(raw.extra_target_immediate); metrics.push(raw.extra_target_metrics);
    } else for (const k of ['before', 'immediate', 'after', 'metrics']) assert.ok(!Object.hasOwn(raw, 'extra_target_' + k));
    before.forEach((s, side) => initial(s, side ? side === 1 ? p.target : p.extra_target : p.actor, side, p));
    assert.equal(new Set(before.map(s => s.object)).size, before.length);
    if (p.target_state) {
        const prep = map(own(raw, 'preparation')); initial(own(prep, 'before'), p.target, 1, p, true);
        const e = copy(prep.before); e.living = 0; e.qi = e.jing = 0; e.temp.block_msg = { all: 1 };
        assert.deepEqual(own(prep, 'after'), e); assert.deepEqual(before[1], e);
        assert.deepEqual(own(prep, 'terminals'), [{ side: 1, state: 'unconscious' }]);
    } else assert.ok(!Object.hasOwn(raw, 'preparation'));
    const enemy = map(own(raw, 'enemy_context')), order = own(enemy, 'before');
    assert.ok(Array.isArray(order)); assert.deepEqual([...order].sort(), p.fighting ? p.extra_target_fighting ? [1, 2] : [1] : []);
    assert.deepEqual(own(enemy, 'after'), order); assert.equal(new Set(order).size, order.length);
    const commandCost = int(own(raw, 'command_accepted'));
    assert.ok(commandCost >= 0); assert.equal(commandCost > 0, accepted);
    assert.deepEqual(raw.launches, accepted ? [{ actor: before[0].object, skill, argument: jiu ? 'jiu right' : 'ri' }] : []);
    if (accepted) { assert.equal(own(raw, 'reason'), ''); assert.deepEqual(raw.refusals, []);
        assert.equal(plain(own(after[0].temp, 'notify_fail')), '你所使用的外功中没有这种功能。\n'); }
    else { assert.equal(raw.refusals.length, 1); assert.deepEqual(raw.refusals[0], { actor: before[0].object, reason: own(raw, 'reason') });
        assert.equal(plain(raw.reason), p.refusal); assert.equal(plain(own(after[0].temp, 'notify_fail')), p.refusal); }
    const texts = raw.skill_messages.map(e => { assert.ok(before[own(e, 'side')]); assert.equal(typeof own(e, 'type'), 'string'); return plain(own(e, 'text')); });
    const gain = sparse(own(after[0], 'learned'), skill);
    assert.ok(accepted ? before[0].effective_skills[skill] >= 120 ? gain === 1 : [0, 1].includes(gain) : gain === 0);
    const out = { accepted, attacks: 0, hit: 0, dodge: 0, parry: 0, jiu_bonus_on: 0, jiu_bonus_off: 0,
        passive_calls: 0, passive_triggered: 0, passive_wound: 0, passive_neili_cost: 0,
        actor_neili_cost: accepted ? jiu ? 300 : 1000 : 0, ri_enemy_trials: 0, ri_hits: 0, ri_misses: 0,
        target_neili_cost: 0, target_neili_recovery: 0, target_neili_net: 0,
        qi_cost: 0, eff_qi_cost: 0, jing_cost: 0, eff_jing_cost: 0, weak_gain: gain,
        actor_busy: num(own(after[0], 'busy')), public_damage: [], public_wound: [], ri_damage: [], ri_damage_ambiguous: 0, ri_targets: {} };
    let finalActor, finalTarget;
    if (!accepted) {
        for (const k of ['actions', 'attacks', 'passives', 'dodge_checks', 'busy_calls', 'skill_messages']) assert.deepEqual(raw[k], []);
        before.forEach((s, i) => { stable(s, after[i]); resourceLedger(metrics[i], s, after[i], {}, { ability_launched: 0, hit: 0, dodge: 0, parry: 0 }); });
        return out;
    }
    assert.ok(texts.length, 'original successful command messages required');
    if (jiu) {
        assert.equal(raw.actions.length, 9); assert.equal(raw.attacks.length, 9); assert.equal(raw.dodge_checks.length, 18);
        const ap = before[0].effective_skills.unarmed + before[0].con * 20, dp = before[1].effective_skills.parry + before[1].con * 20;
        const count = int(own(raw.actions[0].before[0].temp.apply, 'attack'));
        assert.ok([0, Math.trunc(ap / 9)].includes(count));
        if (Math.trunc(ap / 2) > dp) assert.equal(count, Math.trunc(ap / 9));
        if (Math.trunc(ap / 2) + ap - 1 <= dp) assert.equal(count, 0);
        out.jiu_bonus_on = Number(count > 0); out.jiu_bonus_off = Number(count === 0);
        assert.ok(texts.join('').includes(count ? '顿感头晕目眩，不知该如何抵挡' : '忙强振精神，勉强抵挡'), 'JIU outer branch message');
        let prior = copy(before.slice(0, 2)), busyIndex = 0, passiveIndex = 0;
        prior[0].neili -= 300; prior[0].temp.apply.attack = count;
        for (let i = 0; i < 9; i++) {
            const id = i + 1, a = map(raw.actions[i]), e = map(raw.attacks[i]), b = pair(own(a, 'before')), end = pair(own(e, 'after'));
            for (const ev of [a, e]) { assert.equal(own(ev, 'actor'), 0); assert.equal(own(ev, 'target'), 1); assert.equal(own(ev, 'attack_id'), id); }
            assert.equal(own(a, 'skill'), skill); action(own(a, 'action')); assert.equal(own(e, 'type'), 0);
            stable(prior[0], b[0]);
            if (num(b[1].busy) !== num(prior[1].busy)) { assert.equal(num(prior[1].busy), 0); assert.equal(num(b[1].busy), 1);
                busyCall(raw.busy_calls[busyIndex++], 1, 0, 1); }
            stable(prior[1], b[1], { busy: b[1].busy });
            const fight = Object.fromEntries(['attack', 'dodge', 'parry'].map(k => [k, a.action[k]])), inFight = copy(b);
            inFight[0].temp.fight = fight;
            for (let phase = 0; phase < 2; phase++) {
                const d = map(raw.dodge_checks[2 * i + phase]);
                assert.equal(own(d, 'actor'), 0); assert.equal(own(d, 'target'), 1); assert.equal(own(d, 'type'), 0); assert.equal(own(d, 'attack_id'), id);
                assert.equal(own(d, 'phase'), phase ? 'settled' : 'base'); assert.equal(num(own(d, 'busy')), num(b[1].busy));
                assert.equal(own(d, 'skill'), 0); assert.equal(int(own(d, 'ap')), power(inFight[0], 'unarmed', true, a.action));
                assert.equal(int(own(d, 'dp')), phase && num(b[1].busy) ? Math.trunc(power(b[1], 'dodge') / 3) : power(b[1], 'dodge'));
            }
            const result = int(own(e, 'result')), damage = int(own(e, 'damage')); assert.ok([0, -1, -2].includes(result)); assert.ok(damage >= 0);
            out.attacks++; out[result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry']++;
            let publicWound = 0;
            if (result === 0) {
                const v = map(raw.passives[passiveIndex++]);
                for (const [k, value] of Object.entries({ actor: 0, target: 1, attack_id: id, skill, route: 'martial', factor: 0 })) assert.equal(own(v, k), value);
                assert.deepEqual(pair(own(v, 'before')), inFight); pair(own(v, 'after'));
                const bonus = inFight[0].effective_str + Math.trunc(a.action.force * inFight[0].effective_str / 100), input = int(own(v, 'incoming'));
                assert.ok(input >= Math.trunc(bonus / 3) && input <= Math.trunc((2 * bonus - 1) / 3));
                const pp = passive(v, v.before, v.after); out.passive_calls++; out.passive_triggered += pp.triggered;
                out.passive_wound += pp.wound; out.passive_neili_cost += pp.fee; out.actor_neili_cost += pp.fee;
                assert.equal(own(v, 'neili_after'), v.after[0].neili); assert.equal(own(v, 'target_eff_qi_after'), v.after[1].eff_qi);
                assert.equal(num(own(v, 'target_busy_after')), num(v.after[1].busy));
                stable(v.after[0], end[0]); const supported = publicSupport(input, v.after[0], v.after[1], damage, end[1]); publicWound = supported.wound;
                stable(v.after[1], end[1], receive(v.after[1], supported));
            } else { assert.equal(damage, 0); stable(inFight[0], end[0]); stable(inFight[1], end[1]); }
            out.public_damage.push(damage); out.public_wound.push(publicWound);
            prior = copy(end); if (damage > 0 && num(prior[1].busy)) prior[1].busy = 0;
        }
        assert.equal(raw.passives.length, passiveIndex); assert.equal(raw.busy_calls.length, busyIndex + 1);
        assert.ok(out.actor_busy >= 1 && out.actor_busy <= 8); busyCall(raw.busy_calls[busyIndex], 0, 0, out.actor_busy);
        finalActor = copy(prior[0]); finalActor.busy = after[0].busy; finalActor.temp.apply.attack = 0;
        finalActor.learned = gain ? { [skill]: gain } : {}; finalTarget = prior[1];
        stable(finalActor, after[0]); stable(finalTarget, after[1]);
        resourceLedger(metrics[0], before[0], after[0], { neili_cost: out.actor_neili_cost },
            { ability_launched: 1, hit: out.hit, dodge: out.dodge, parry: out.parry });
        const tc = { qi_cost: before[1].qi - after[1].qi, eff_qi_cost: before[1].eff_qi - after[1].eff_qi };
        resourceLedger(metrics[1], before[1], after[1], tc);
    } else {
        for (const k of ['actions', 'attacks', 'passives', 'dodge_checks']) assert.deepEqual(raw[k], []);
        assert.equal(out.actor_busy, 5);
        stable(before[0], after[0], { neili: before[0].neili - 1000, busy: after[0].busy, learned: { [skill]: gain } });
        resourceLedger(metrics[0], before[0], after[0], { neili_cost: 1000 }, { ability_launched: 1 });
        const ap = before[0].skills.force + before[0].skills.unarmed + before[0].skills['martial-cognize'] + before[0].skills[skill] + before[0].con * 10;
        let bi = 0; busyCall(raw.busy_calls[bi++], 0, 0, 5);
        for (const side of order) {
            const b = before[side], a = after[side], m = metrics[side], hit = metric(m, 'eff_qi_cost') > 0;
            const dp = b.effective_skills.force * 2 + b.skills['martial-cognize'] + b.con * 10;
            if (Math.trunc(ap / 2) > dp) assert.ok(hit);
            if (Math.trunc(ap / 2) + ap - 1 <= dp) assert.ok(!hit);
            const support = riSupport(ap, b, a, m, hit);
            if (hit) busyCall(raw.busy_calls[bi++], side, num(b.busy), 1);
            const cost = hit ? 500 : 0, recovery = Math.max(0, cost - b.neili);
            const expected = { neili_cost: cost, neili_recovery: recovery };
            for (const k of resources.filter(k => k !== 'neili')) expected[k + '_cost'] = b[k] - a[k];
            resourceLedger(m, b, a, expected);
            out.ri_enemy_trials++; out[hit ? 'ri_hits' : 'ri_misses']++;
            out.target_neili_cost += cost; out.target_neili_recovery += recovery; out.target_neili_net += cost - recovery;
            if (support.length === 1) out.ri_damage.push(support[0]); else if (support.length > 1) out.ri_damage_ambiguous++;
            out.ri_targets[String(side)] = { enemy: true, hit, nominal_support: support,
                ...Object.fromEntries(resources.filter(k => k !== 'neili').map(k => [k + '_cost', metric(m, k + '_cost')])),
                craze_gain: a.craze - b.craze, neili_cost: cost, neili_recovery: recovery, neili_net: cost - recovery };
        }
        assert.equal(raw.busy_calls.length, bi);
        for (let side = 1; side < before.length; side++) if (!order.includes(side)) {
            stable(before[side], after[side]); resourceLedger(metrics[side], before[side], after[side], {});
            out.ri_targets[String(side)] = { enemy: false, hit: null, nominal_support: [], qi_cost: 0, eff_qi_cost: 0, jing_cost: 0,
                eff_jing_cost: 0, craze_gain: 0, neili_cost: 0, neili_recovery: 0, neili_net: 0 };
        }
    }
    for (let side = 1; side < before.length; side++) for (const k of resources.filter(k => k !== 'neili')) out[k + '_cost'] += metric(metrics[side], k + '_cost');
    return out;
}
const frequency = values => { const out = {}; for (const v of values) out[String(v)] = (out[String(v)] ?? 0) + 1; return out; };
export function mingjiaoJiuyangRemainingEffects(rows, c) {
    validateMingjiaoJiuyangRemainingCondition(c); assert.ok(Array.isArray(rows));
    const values = rows.map(r => validateMingjiaoJiuyangRemainingRecord(own(r, 'raw'), c)), known = values.filter(Boolean), unknown = rows.length - known.length;
    const keys = ['attacks', 'hit', 'dodge', 'parry', 'jiu_bonus_on', 'jiu_bonus_off', 'passive_calls', 'passive_triggered', 'passive_wound',
        'passive_neili_cost', 'actor_neili_cost', 'ri_enemy_trials', 'ri_hits', 'ri_misses', 'target_neili_cost', 'target_neili_recovery',
        'target_neili_net', 'qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost', 'weak_gain', 'ri_damage_ambiguous'];
    const sum = k => unknown ? null : known.reduce((n, v) => n + v[k], 0), ri_targets = {};
    for (const side of new Set(known.flatMap(v => Object.keys(v.ri_targets)))) {
        const vv = known.flatMap(v => Object.hasOwn(v.ri_targets, side) ? [v.ri_targets[side]] : []);
        const sums = Object.fromEntries(['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost', 'craze_gain', 'neili_cost', 'neili_recovery', 'neili_net']
            .map(k => [k, unknown ? null : vv.reduce((n, v) => n + v[k], 0)]));
        const hit = vv.filter(v => v.hit === true), trials = vv.filter(v => v.enemy).length;
        ri_targets[side] = { enemy: vv[0].enemy, recorded: vv.length, trials: unknown ? null : trials, hits: unknown ? null : hit.length,
            misses: unknown ? null : vv.filter(v => v.hit === false).length, nominal_damage: distribution(hit.filter(v => v.nominal_support.length === 1).map(v => v.nominal_support[0])),
            ambiguous_hits: unknown ? null : hit.filter(v => v.nominal_support.length > 1).length,
            nominal_supports: frequency(hit.map(v => JSON.stringify(v.nominal_support))), ...sums };
    }
    return { validated: known.length, unknown, accepted_commands: unknown ? null : known.filter(v => v.accepted).length,
        refused_commands: unknown ? null : known.filter(v => !v.accepted).length, ...Object.fromEntries(keys.map(k => [k, sum(k)])),
        actor_busy: frequency(known.map(v => v.actor_busy)), public_damage: distribution(known.flatMap(v => v.public_damage)),
        public_wound: distribution(known.flatMap(v => v.public_wound)), ri_damage: distribution(known.flatMap(v => v.ri_damage)), ri_targets,
        jiu_bonus_probability: probability(known.reduce((n, v) => n + v.jiu_bonus_on, 0), known.reduce((n, v) => n + v.jiu_bonus_on + v.jiu_bonus_off, 0)),
        qualification_note: c.parameters.qualification_note };
}
