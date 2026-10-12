// Prepared only: no shared registration, source patching or driver execution.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 10000, max_neili: 10000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 34, shen: 0, gender: '男性', character: '光明磊落' };
const definitions = {
    kuang: { skill: 'xuanfeng-tui', usage: 'unarmed', minimum: 100, name: '狂风绝技', fee: 100 },
    fei: { skill: 'lanhua-shou', usage: 'hand', minimum: 140, name: '影落飞花', fee: 150 },
};
const noFunction = '你所使用的外功中没有这种功能。\n';
const terminalPrefix = '\x1b[256D\x1b[K';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

// Original static query_action tables, including strict level > lvl selection.
// The exceptional lanhua action has no lvl/skill_name and costs 300 before combat.
export const taohuaComboActions = {
    'xuanfeng-tui': [
        [0, 80, 10, 45, 45, 10, '风起云涌', '$N双手虚晃，左脚猛地飞起，一式「风起云涌」，脚尖踢向$n的$l'],
        [40, 100, 20, 50, 50, 15, '空谷足音', '$N别转身来抽身欲走，刹那间回身，右脚一式「空谷足音」猛踹$n'],
        [80, 160, 30, 55, 55, 18, '碧渊腾蛟', '$N右脚同时踹出，既猛且准，一式「碧渊腾蛟」，踢中的$n的胸口'],
        [120, 190, 35, 60, 60, 20, '秋风落叶', '$N突然跃起，双足连环圈转，一式「秋风落叶」，足带风尘，攻向$n'],
        [140, 220, 35, 70, 70, 25, '风扫残云', '$N两手护胸，双脚交叉踢起，一式「风扫残云」，脚脚不离$n周围'],
        [160, 260, 40, 90, 90, 30, '流星坠地', '$N突然侧身，右脚自上而下一式「流星坠地」，照$n的面门直劈下来'],
        [180, 290, 40, 100, 100, 30, '朔风吹雪', '$N使一式「朔风吹雪」，全身突然飞速旋转，双足迅猛无及的踹向$n'],
        [200, 340, 45, 115, 115, 35, '雷动九天', '$N抽身跃起，开声吐气，陡然一式「雷动九天」，双脚如旋风般踢向$n'],
    ].map(([lvl, force, attack, dodge, parry, damage, skill_name, action]) =>
        ({ action, force, attack, dodge, parry, damage, lvl, damage_type: '瘀伤', skill_name })),
    'lanhua-shou': [
        [0, 100, 15, 15, '瘀伤', '花疏云淡', '$N右手五指分开，微微一拂，一式「花疏云淡」拂向$n的膻中要穴'],
        [30, 130, 20, 30, '瘀伤', '轻云蔽月', '$N侧身掠向$n，一式「轻云蔽月」，左手五指拨向$n的胸前大穴'],
        [60, 170, 25, 40, '内伤', '云破月来', '$N使一式「云破月来」，左掌虚攻，并指斜前翻出，拍向$n的肩井穴'],
        [80, 190, 25, 45, '瘀伤', '幽兰弄影', '$N微微侧身，右掌勾上，一式「幽兰弄影」，缓缓拂向$n的天突穴'],
        [100, 220, 30, 50, '瘀伤', '芳兰竟体', '$N使一式「芳兰竟体」，身影不定地掠至$n身后，猛地拍向$n的大椎穴'],
        [120, 250, 35, 55, '瘀伤', '兰桂齐芳', '$N施出「兰桂齐芳」，双手向外一拨，逼向$n的华盖、璇玑、紫宫几处大穴'],
        [140, 280, 40, 65, '内伤', '月影花香', '$N一式「月影花香」，居高临下，拂出一道劲力罩向$n的百会大穴'],
        [160, 320, 45, 70, '内伤', '花好月圆', '$N施展出「花好月圆」，双手疾拂，一环环的劲气逼向$n的上中下各大要穴'],
    ].map(([lvl, force, dodge, damage, damage_type, skill_name, action]) =>
        ({ action, force, dodge, damage, lvl, damage_type, skill_name })),
};
export const taohuaComboExtraAction = {
    action: '\x1b[1;37m$N\x1b[1;37m两臂交叉置于胸前，指形作兰花状陡然翻上，疾点$n\x1b[1;37m胸前诸多要穴',
    attack: 100, dodge: 300, parry: 300, damage: 100, force: 200, weapon: '兰花指', damage_type: '点穴',
};
export const taohuaComboSourcePaths = [
    'kungfu/skill/xuanfeng-tui/kuang.c', 'kungfu/skill/xuanfeng-tui.c',
    'kungfu/skill/lanhua-shou/fei.c', 'kungfu/skill/lanhua-shou.c',
    'kungfu/skill/unarmed.c', 'kungfu/skill/hand.c', 'kungfu/skill/parry.c', 'kungfu/skill/dodge.c',
    'kungfu/skill/force.c', 'kungfu/skill/bibo-shengong.c', 'kungfu/skill/jingluo-xue.c',
    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'inherit/skill/force.c', 'feature/sserver.c',
    'feature/skill.c', 'feature/attack.c', 'feature/action.c', 'mudcore/inherit/action.c',
    'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c',
    'feature/equip.c', 'feature/name.c', 'inherit/char/char.c', 'inherit/weapon/sword.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];
export const taohuaComboFixtureRequirements = [
    'Not registered or sampled. Later append this group and freeze these two modules plus existing statistics/report dependencies in new series only.',
    'Reuse original named two-USER perform unarmed.kuang right / hand.fei right; verify original present(right) identity, single prepare and keys order. Never set action_flag or clear busy for setup.',
    'Read original character, grant, family, fighting_opponent, killing_opponent, preparation_order and secondary equipment in snapshot for this group; no new arbitrary initializer.',
    'Only the two low-qi conditions declare nonlethal=true and use original mutual fight_ob instead of default kill_ob. Verify both actual killing_opponent values before interpreting one-third-qi disengagement.',
    'Reuse selected-action and attack probes. Enable existing attack_usage/attack_skill/action_flag/apply_attack fields, and read only apply_unarmed_damage and neili at that same attack observation point. No extra RNG/query_action/do_attack call.',
    'Reuse existing two original dodge_checks per attack for actual target busy before damage; source interrupt occurs after observe_attack. Do not mistake random busy attempts or surviving busy for final control probability.',
    'Reuse force/martial before-after snapshots; with frozen jiali=0 only missing martial hit_ob returns null/0 without effect. Both styles have static action tables, no artificial first-load player or per-sample reload.',
    'Preserve non-bout immediate window and original early nonlethal disengagement; never force six attacks, restore enemy relationships or refill neili. No callbacks/natural busy release are sampled.',
    'Report taohuaComboEffects(rows, frozenCondition). Separate accepted commands, gate attack bonus, actual attacks and hits, actual target damage, base cost and lanhua action surcharge. fei action_flag=0 is original output, not a repair.',
];

export function taohuaComboConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    assert.equal(typeof readSource, 'function');
    const source_evidence = Object.fromEntries(taohuaComboSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, hash(bytes)];
    }));
    const result = [];
    for (const [ability, d] of Object.entries(definitions)) {
        const { skill, usage, minimum, name } = d, grant = `can_perform/${skill}/${ability}`;
        const source = catalog.skills.find(s => s.id === `${skill}/${ability}`);
        const base = catalog.skills.find(s => s.id === skill);
        for (const [item, path] of [[source, `kungfu/skill/${skill}/${ability}.c`], [base, `kungfu/skill/${skill}.c`]]) {
            assert.equal(item?.path, path); assert.equal(item.sha256, source_evidence[path]);
        }
        const entry = source.entries.find(e => e.role === 'perform')?.id;
        assert.ok(typeof entry === 'string' && entry.startsWith(source.path + ':'));
        assert.match(entry.slice(source.path.length), /^:\d+:perform$/);
        function add(variant, level = 200, extra = {}) {
            const actor = { skills: { [usage]: level, [skill]: level, parry: level, dodge: level,
                force: level, 'bibo-shengong': level, ...(ability === 'fei' ? { 'jingluo-xue': 100 } : {}), ...extra.skills },
            mappings: { [usage]: skill, parry: skill, force: 'bibo-shengong' },
            preparations: extra.noPrepare ? {} : { [usage]: skill }, properties: { ...defaults,
                neili: 800, max_neili: 3000, 'family/family_name': '桃花岛', [grant]: 1, ...extra.properties },
            ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}) };
            const target = { skills: { force: 600, dodge: 600, parry: 600, ...extra.targetSkills },
                mappings: {}, preparations: {}, properties: { ...defaults, ...extra.targetProperties },
                ...(extra.targetBusy ? { busy: extra.targetBusy } : {}) };
            result.push({ id: `school-taohua-combo-${ability}-l${level}-${variant}`, stage: 'school',
                entry_id: entry, method: 'perform', samples: smoke ? 2 : extra.refusal ? 2 : samples,
                parameters: { school: 'taohua', collection_group: 'taohua-combo', skill, ability, usage, level, variant,
                    actor, target, named_participants: true, fighting: true, target_state: 'living',
                    ...(extra.nonlethal ? { nonlethal: true } : {}),
                    action: `perform ${usage}.${ability} right`, observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                    refusal_scope: extra.refusal ? 'ability' : '', not_applicable: '',
                    source_evidence: { ...source_evidence }, qualification_sources: [...taohuaComboSourcePaths],
                    ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                    base_source: { path: base.path, sha256: base.sha256 },
                    qualification_note: '真实非巫师USER、单备与原显式目标命令；修为/领悟为实验初态，不代表教学或养成成本。'
                        + '只采即时原六次循环，切磋收招如实保留，不强制六击。加力固定0，无互备和跨回合标记操作；'
                        + '兰花额外选招费用与绝招费用分账。保留原随机、忙乱与原action_flag输出，不改游戏。',
                } });
        }
        for (const level of [200, 400, 800]) add('baseline', level);
        add('minimum', minimum, { properties: { neili: 300 } });
        if (ability === 'kuang') {
            add('other-family', 200, { properties: { 'family/family_name': '没有' } });
            add('target-busy50', 200, { targetBusy: 50 });
        } else {
            add('gate-miss', 200, { targetSkills: { parry: 1198 } });
            add('jingluo-surcharge', 200, { skills: { 'jingluo-xue': 200 }, properties: { neili: 3000 } });
        }
        add('low-qi', 200, { targetProperties: { qi: 3500 }, nonlethal: true });
        const refuse = (tag, refusal, extra = {}) => add(tag, 200, { ...extra, refusal });
        refuse('no-grant', noFunction, { properties: { [grant]: 0 } });
        refuse('weapon', `「${name}」只能空手施展。\n`, { weapon: true });
        refuse(`skill${minimum - 1}`, ability === 'kuang' ? '你旋风扫叶腿不够娴熟，难以施展「狂风绝技」。\n'
            : '你兰花拂穴手不够娴熟，难以施展「影落飞花」。\n', { skills: { [skill]: minimum - 1 } });
        refuse('no-prepare', ability === 'kuang' ? '你没有准备旋风扫叶腿，难以施展「狂风绝技」。\n'
            : '你没有准备兰花拂穴手，难以施展「影落飞花」。\n', { noPrepare: true });
        refuse('neili299', ability === 'kuang' ? '你的真气不够，难以施展「狂风绝技」。\n'
            : '你现在真气不足，难以施展「影落飞花」。\n', { properties: { neili: 299 } });
    }
    return result;
}

function map(v, name) { assert.ok(v && typeof v === 'object' && !Array.isArray(v), name); return v; }
function field(v, key) { assert.ok(Object.hasOwn(v, key), '缺少 ' + key); return v[key]; }
function int(v, name) { assert.ok(Number.isSafeInteger(v), name); return v; }
function sparse(v, key) { map(v, '缺少映射'); return int(Object.hasOwn(v, key) ? v[key] : 0, key); }
function count(v, key) { const n = sparse(v, key); assert.ok(n >= 0, key); return n; }
function falseValue(v, key) { const n = field(v, key); assert.ok(n === null || n === 0, key); return 0; }
function observedApply(v, key) { const n = field(v, key); return n === null ? 0 : int(n, key); }
function busy(v) { const n = field(v, 'busy'); assert.ok(n === null || (Number.isSafeInteger(n) && n >= 0)); return n ?? 0; }
function initial(s, cfg, side, p) {
    assert.match(s?.object ?? '', /^\/tests\/actor#\d+$/); assert.equal(s.id, side ? 'right' : 'left');
    for (const key of ['userp', 'interactive', 'playerp', 'living', 'fighting_opponent']) assert.equal(s[key], 1, key);
    assert.equal(field(s, 'killing_opponent'), p.nonlethal ? 0 : 1, '原追杀/切磋关系');
    for (const key of ['wizardp', 'ghost']) assert.equal(s[key], 0, key);
    assert.equal(busy(s), cfg.busy ?? 0); assert.deepEqual(s.learned, {});
    assert.deepEqual(s.skills, cfg.skills); assert.deepEqual(s.mappings, cfg.mappings);
    assert.deepEqual(s.preparations, cfg.preparations); assert.deepEqual(s.preparation_order, Object.keys(cfg.preparations));
    const apply = map(map(s.temp, '临时数据').apply, '原属性');
    const expected = { armor: 100, ...(cfg.equipment ? { damage: 50, dodge: -1 } : {}) };
    for (const key of new Set([...Object.keys(apply), ...Object.keys(expected)]))
        assert.equal(sparse(apply, key), expected[key] ?? 0, '初态属性 ' + key);
    for (const key of ['action_flag', 'guarding', 'no_perform', 'str', 'debuff'])
        if (Object.hasOwn(s.temp, key)) falseValue(s.temp, key);
    for (const [key, value] of Object.entries(cfg.skills))
        assert.equal(field(map(s.effective_skills), key), Math.trunc(value / 2)
            + (cfg.skills[cfg.mappings[key]] ?? 0) + sparse(apply, key), '原有效 ' + key);
    const unarmed = Math.max(0, ...['unarmed', 'hand', 'finger', 'strike', 'claw', 'cuff'].map(k => cfg.skills[k] ?? 0));
    assert.equal(s.effective_str, cfg.properties.str + Math.trunc(unarmed / 10));
    assert.equal(s.effective_con, cfg.properties.con + Math.trunc(cfg.skills.force / 10));
    for (const [key, value] of Object.entries(cfg.properties)) {
        const source = key.includes('/') || key === 'character' ? map(s.cultivation) : s;
        if (value === 0 && key === `can_perform/${p.skill}/${p.ability}`) falseValue(source, key);
        else assert.equal(field(source, key), value, key);
    }
    assert.equal(s.weapon, cfg.equipment ? 'sword' : 'none');
    assert.equal(s.weapon_damage, cfg.equipment ? 50 : 0); assert.equal(s.weapon_flag, cfg.equipment ? 4 : 0);
    assert.equal(s.secondary_weapon, 'none'); assert.deepEqual(s.secondary_weapon_details, {});
    assert.equal(s.handing, 'none'); assert.deepEqual(s.handing_details, {});
    if (!cfg.equipment) assert.deepEqual(s.weapon_details, {});
    else {
        assert.match(s.weapon_details?.object ?? '', /^\/tests\/sword#\d+$/);
        for (const [key, value] of Object.entries({ program: '/tests/sword', skill_type: 'sword', weight: 3000,
            damage: 50, flag: 4, consistence: 100 })) assert.equal(s.weapon_details[key], value);
    }
    const conditions = field(s, 'conditions'); assert.deepEqual(conditions === null ? {} : conditions, {});
}
function sameStable(s, b) {
    for (const key of ['object', 'id', 'userp', 'interactive', 'playerp', 'wizardp', 'living', 'ghost',
        'skills', 'effective_skills', 'mappings', 'preparations', 'preparation_order', 'cultivation',
        'effective_str', 'effective_con', 'killing_opponent', 'weapon', 'weapon_damage', 'weapon_flag', 'weapon_details',
        'secondary_weapon', 'secondary_weapon_details', 'handing', 'handing_details', 'conditions',
        ...Object.keys(defaults).filter(k => !health.includes(k) && k !== 'character')])
        assert.deepEqual(field(s, key), field(b, key), '非效果字段 ' + key);
    const sa = map(s.temp?.apply), ba = map(b.temp?.apply);
    for (const key of new Set([...Object.keys(sa), ...Object.keys(ba)]))
        assert.equal(sparse(sa, key), sparse(ba, key), '临时加成未恢复 ' + key);
}
// Conservative source-derived upper bound, not a replacement for actual damage.
function damageBound(action, state, unarmed) {
    const lowest = Math.trunc(unarmed / 2);
    let damage = unarmed ? Math.trunc((unarmed * 2 - 1) / 2) : 0;
    damage += Math.trunc(action.damage * damage / 100);
    const force = state.effective_str + Math.trunc(action.force * state.effective_str / 100);
    damage += Math.trunc((force * 2 - 1) / 3);
    const incoming = damage;
    damage += Math.trunc(damage * (state.str * 2 + state.effective_str) / 300);
    damage += Math.trunc(damage * 7 / state.int); // Frozen raw int=36, maximum original branch.
    damage = damage > 400 ? Math.trunc((damage - 400) / 4) + 300
        : damage > 200 ? Math.trunc((damage - 200) / 2) + 200 : damage;
    return { damage, incoming, minimum_incoming: lowest + Math.trunc(action.damage * lowest / 100) + Math.trunc(force / 3) };
}
function finalDamageOptions(incoming, actor) {
    const strength = incoming + Math.trunc(incoming * (actor.str * 2 + actor.effective_str) / 300);
    const compress = damage => damage > 400 ? Math.trunc((damage - 400) / 4) + 300
        : damage > 200 ? Math.trunc((damage - 200) / 2) + 200 : damage;
    return [0, compress(strength), compress(strength + Math.trunc(strength * 7 / actor.int))];
}

export function validateTaohuaComboRecord(raw, condition) {
    const p = condition.parameters, d = definitions[p.ability];
    assert.equal(p.collection_group, 'taohua-combo'); assert.ok(d);
    assert.equal(raw.kind, 'sample'); assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, 'perform'); assert.equal(raw.outcome, p.expected);
    assert.equal(p.skill, d.skill); assert.equal(p.usage, d.usage);
    assert.equal(p.action, `perform ${d.usage}.${p.ability} right`);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['attacks', 'actions', 'passives', 'dodge_checks', 'launches', 'refusals',
        'defenses', 'interfaces', 'dropped', 'terminals', 'callbacks']) assert.ok(Array.isArray(raw[key]), key);
    for (const key of ['defenses', 'interfaces', 'dropped', 'terminals', 'callbacks']) assert.deepEqual(raw[key], []);
    if (Object.hasOwn(raw, 'directs')) assert.deepEqual(raw.directs, []);
    assert.deepEqual(raw.after, raw.immediate, '只即时观察，不运行自然心跳');
    const [b, t] = raw.before, [a, end] = raw.immediate, accepted = p.expected === 'observed';
    assert.ok(Object.hasOwn(raw, 'command_accepted'), '缺少原命令执行成本');
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted >= 0,
        '原命令执行成本必须是非负安全整数');
    assert.equal(raw.command_accepted > 0, accepted, '命令受理按正成本判定，拒绝必须为零');
    for (const side of [0, 1]) {
        initial(raw.before[side], side ? p.target : p.actor, side, p);
        sameStable(raw.immediate[side], raw.before[side]);
        for (const key of ['direct', 'quick', 'riposte', 'heartbeats']) assert.equal(count(raw.metrics[side], key), 0);
        for (const key of health) {
            assert.equal(count(raw.metrics[side], key + '_recovery'), 0, '不补款/回血');
            assert.equal(int(raw.immediate[side][key], key), raw.before[side][key] - count(raw.metrics[side], key + '_cost'));
        }
        assert.equal(count(raw.metrics[side], 'ability_launched'), side ? 0 : Number(accepted));
    }
    for (const key of ['hit', 'dodge', 'parry']) assert.equal(count(raw.metrics[1], key), 0);
    if (accepted) {
        assert.deepEqual(raw.launches, [{ actor: b.object, skill: p.skill, argument: `${p.ability} right` }]);
        assert.deepEqual(raw.refusals, []); assert.ok(raw.reason === '' || raw.reason === null);
        assert.equal(a.temp.notify_fail, noFunction);
    } else {
        assert.deepEqual(raw.launches, []);
        assert.equal(typeof raw.reason, 'string'); assert.equal(raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''), p.refusal);
        assert.deepEqual(raw.refusals, [{ actor: b.object, reason: raw.reason }]);
        assert.equal(a.temp.notify_fail, raw.reason.startsWith(terminalPrefix) ? raw.reason.slice(terminalPrefix.length) : raw.reason);
    }
    assert.deepEqual(end.temp.notify_fail, t.temp.notify_fail);
    assert.deepEqual(end.learned, t.learned);
    const learned = map(a.learned), progress = sparse(learned, p.skill);
    assert.ok(Object.keys(learned).every(k => k === p.skill));
    if (!accepted) assert.deepEqual(learned, b.learned);
    else if (b.effective_skills[p.skill] >= 120) assert.equal(progress, 1);
    else assert.ok([0, 1].includes(progress));
    const attacks = raw.attacks.length;
    assert.equal(raw.actions.length, attacks); assert.equal(raw.dodge_checks.length, attacks * 2);
    assert.ok(accepted ? attacks >= 1 && attacks <= 6 : attacks === 0, '必须实际出招，不强制六次');
    let neili = b.neili - (accepted ? d.fee : 0), qi = t.qi, targetBusy = busy(t), passiveIndex = 0;
    let boost = null, procs = 0, procEligible = 0, busyOpportunities = 0, busyStarts = 0;
    let damageTotal = 0, previousBusy;
    for (let i = 0; i < attacks; i++) {
        const attack = raw.attacks[i], selected = raw.actions[i];
        for (const e of [attack, selected]) { assert.equal(e.actor, 0); assert.equal(e.target, 1); }
        falseValue(attack, 'type'); assert.ok([0, -1, -2].includes(attack.result));
        assert.equal(attack.attack_usage, p.usage); assert.equal(attack.attack_skill, p.skill);
        assert.equal(selected.skill, p.skill);
        if (p.ability === 'fei') assert.equal(attack.action_flag, b.preparation_order.indexOf('hand'));
        else falseValue(attack, 'action_flag');
        const delta = observedApply(attack, 'apply_attack') - sparse(b.temp.apply, 'attack');
        const expected = p.ability === 'kuang' ? (b.cultivation['family/family_name'] === '桃花岛' ? Math.trunc(b.skills[p.skill] / 4) : 0)
            : Math.trunc(b.skills[p.skill] / 5);
        if (p.ability === 'kuang') assert.equal(delta, expected);
        else assert.ok(delta === 0 || delta === expected);
        if (boost === null) boost = delta; else assert.equal(delta, boost, '一轮判定不能逐击改变');
        const extraDamage = p.ability === 'kuang' ? Math.trunc(expected / 2) : 0;
        const unarmed = observedApply(attack, 'apply_unarmed_damage');
        assert.equal(unarmed, sparse(b.temp.apply, 'unarmed_damage') + extraDamage);
        const action = map(selected.action), special = p.ability === 'fei' && !Object.hasOwn(action, 'lvl');
        const eligible = p.ability === 'fei' && b.skills[p.skill] > 100 && b.skills['jingluo-xue'] > 100 && neili > 1000;
        if (eligible) procEligible++;
        if (special) {
            assert.ok(eligible, '额外选招原经络/内力门槛'); assert.deepEqual(action, taohuaComboExtraAction);
            procs++; neili -= 300;
        } else {
            const available = taohuaComboActions[p.skill].filter(x => b.skills[p.skill] > x.lvl);
            const source = available.slice(-6).find(x => x.lvl === action.lvl);
            assert.ok(source, '原严格等级前缀及NewRandom末至多六项'); assert.deepEqual(action, source);
        }
        assert.equal(field(attack, 'neili'), neili, '选招费在该击前扣除');
        const [base, settled] = raw.dodge_checks.slice(i * 2, i * 2 + 2);
        for (const [e, phase] of [[base, 'base'], [settled, 'settled']]) {
            assert.equal(e.actor, 0); assert.equal(e.target, 1); falseValue(e, 'type'); assert.equal(e.phase, phase);
            falseValue(e, 'skill'); assert.ok(int(e.ap, 'AP') >= 1); assert.ok(int(e.dp, 'DP') >= 0);
        }
        assert.equal(base.ap, settled.ap); assert.equal(busy(base), busy(settled));
        previousBusy = busy(base);
        if (p.ability === 'kuang' && targetBusy === 0) {
            assert.ok([0, 1].includes(previousBusy)); busyOpportunities++;
            if (previousBusy === 1) busyStarts++;
        } else assert.equal(previousBusy, targetBusy, '不能覆盖已有忙乱或伪造控制');
        assert.equal(settled.dp, previousBusy ? Math.trunc(Math.max(1, base.dp) / 3) : Math.max(1, base.dp));
        const bound = damageBound(action, b, unarmed), dealt = int(attack.damage, '实际单击伤害');
        assert.ok(dealt >= 0 && dealt <= bound.damage);
        if (attack.result !== 0) assert.equal(dealt, 0);
        else {
            // With these neutral targets, no defensive callback/armor object can skip hit_ob.
            const event = raw.passives[passiveIndex++]; assert.ok(event, '命中路径缺少原 martial 回调');
            assert.equal(event.actor, 0); assert.equal(event.target, 1); assert.equal(event.route, 'martial');
            assert.equal(event.skill, p.skill); falseValue(event, 'result'); falseValue(event, 'factor');
            assert.ok(int(event.incoming, '入参伤害') >= bound.minimum_incoming && event.incoming <= bound.incoming);
            assert.ok(finalDamageOptions(event.incoming, b).includes(dealt), '原膂力/悟性/先天闪避及压缩后实际伤害');
            assert.equal(event.before?.length, 2); assert.equal(event.after?.length, 2);
            assert.deepEqual(event.after, event.before, '两本体无hit_ob，不得伪造附效');
            for (const side of [0, 1]) {
                const s = event.before[side], first = raw.before[side];
                for (const key of ['object', 'id', 'userp', 'playerp', 'interactive', 'wizardp', 'living',
                    'skills', 'mappings', 'preparations', 'weapon', 'weapon_details']) assert.deepEqual(s[key], first[key], key);
            }
            assert.equal(event.before[0].neili, neili); assert.equal(event.before[1].qi, qi);
            assert.equal(sparse(event.before[0].temp.apply, 'attack'), boost + sparse(b.temp.apply, 'attack'));
            assert.equal(sparse(event.before[0].temp.apply, 'unarmed_damage'), unarmed);
            assert.equal(busy(event.before[1]), previousBusy);
            assert.equal(event.neili_after, neili); assert.equal(event.target_eff_qi_after, event.after[1].eff_qi);
            assert.equal(busy({ busy: field(event, 'target_busy_after') }), previousBusy);
        }
        damageTotal += dealt; qi = Math.max(-1, qi - dealt);
        targetBusy = dealt > 0 ? 0 : previousBusy; // Original interrupt_me after observe_attack.
        if (p.nonlethal && dealt > 0 && qi * 3 <= t.max_qi) assert.equal(i, attacks - 1, '原切磋收招后不得继续六连');
    }
    assert.equal(passiveIndex, raw.passives.length, '附伤不能漏记/混入额外调用');
    for (const [key, result] of [['hit', 0], ['dodge', -1], ['parry', -2]])
        assert.equal(count(raw.metrics[0], key), raw.attacks.filter(x => x.result === result).length);
    if (accepted && p.ability === 'fei') {
        const range = b.effective_skills.parry + b.effective_skills.hand;
        if (range - 1 <= t.effective_skills.parry) assert.equal(boost, 0, '原random上界决定必无加成');
        assert.ok(t.effective_skills.parry >= 0); // No artificial guaranteed success through negative DP.
        assert.equal(a.temp.action_flag, b.preparation_order.indexOf('hand'), '保留原标记，不能修复或复位');
    }
    const stopped = accepted && p.nonlethal === true && raw.attacks.at(-1).damage > 0 && qi * 3 <= t.max_qi;
    if (accepted && attacks < 6) assert.ok(stopped, '不足六击须有原非致死切磋结束依据');
    for (const state of [a, end]) assert.equal(field(state, 'fighting_opponent'), stopped ? 0 : 1);
    assert.equal(busy(end), targetBusy); assert.equal(a.neili, neili);
    assert.equal(end.qi, qi); assert.equal(count(raw.metrics[1], 'qi_cost'), damageTotal);
    assert.ok(count(raw.metrics[1], 'eff_qi_cost') <= damageTotal);
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(count(raw.metrics[0], key + '_cost'), 0);
    for (const key of ['jing', 'eff_jing', 'neili']) assert.equal(count(raw.metrics[1], key + '_cost'), 0);
    assert.equal(count(raw.metrics[0], 'neili_cost'), accepted ? d.fee + procs * 300 : 0);
    if (!accepted) assert.equal(busy(a), busy(b));
    else assert.ok(p.ability === 'kuang' ? busy(a) >= 1 && busy(a) <= 6 : busy(a) >= 0 && busy(a) <= 2);
    // Only original notify/fight/apply/action_flag are changed here; never ignore the whole temp mapping.
    for (const side of [0, 1]) {
        const before = structuredClone(raw.before[side].temp), after = structuredClone(raw.immediate[side].temp);
        delete before.apply; delete after.apply;
        if (side === 0) { delete before.notify_fail; delete after.notify_fail; }
        if (accepted && side === 0) {
            const action = raw.actions.at(-1).action, fight = map(after.fight, '实际最后战斗动作');
            for (const key of ['attack', 'dodge', 'parry']) {
                if (Object.hasOwn(action, key)) assert.equal(field(fight, key), action[key]);
                else falseValue(fight, key);
            }
            assert.deepEqual(Object.keys(fight).sort(), ['attack', 'dodge', 'parry']);
            delete before.fight; delete after.fight;
            if (p.ability === 'fei') { delete before.action_flag; delete after.action_flag; }
        }
        if (stopped) { delete before.combat_time; delete after.combat_time; }
        assert.deepEqual(after, before, '其他临时字段变化');
    }
    return { accepted, attack_bonus: boost, gate_bonus: accepted && p.ability === 'fei' ? boost > 0 : null,
        attacks, hits: count(raw.metrics[0], 'hit'), damage: damageTotal, wound: count(raw.metrics[1], 'eff_qi_cost'),
        early_stop: stopped, base_cost: accepted ? d.fee : 0, action_surcharges: procs,
        action_surcharge_cost: procs * 300, action_surcharge_opportunities: procEligible,
        busy_opportunities: busyOpportunities, busy_starts: busyStarts, actor_busy: busy(a),
        target_busy_initial: busy(t), target_busy_final: busy(end), neili_cost: b.neili - a.neili,
        learned_delta: progress };
}

export function taohuaComboEffects(rows, condition) {
    assert.equal(condition?.parameters?.collection_group, 'taohua-combo');
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        const raw = row.raw ?? row;
        assert.equal(raw.condition_id, condition.id);
        if (row.raw) assert.equal(row.outcome, raw.outcome);
        assert.ok(Object.hasOwn(counts, raw.outcome)); counts[raw.outcome]++;
        if (['observed', 'refused'].includes(raw.outcome)) known.push(validateTaohuaComboRecord(raw, condition));
    }
    const accepted = known.filter(x => x.accepted), sum = key => accepted.reduce((n, x) => n + x[key], 0);
    const bonus = accepted.filter(x => x.gate_bonus !== null);
    return { counts, unknown_effect_samples: counts.error + counts.not_applicable,
        acceptance: probability(accepted.length, known.length), refusal: probability(counts.refused, known.length),
        bonus_given_accepted: probability(bonus.filter(x => x.gate_bonus).length, bonus.length),
        hit_given_attack: probability(sum('hits'), sum('attacks')),
        early_stop_given_accepted: probability(accepted.filter(x => x.early_stop).length, accepted.length),
        kuang_busy_given_available_attack: probability(sum('busy_starts'), sum('busy_opportunities')),
        lanhua_surcharge_given_eligible_action: probability(sum('action_surcharges'), sum('action_surcharge_opportunities')),
        attacks_per_accepted: distribution(accepted.map(x => x.attacks)),
        damage_per_accepted: distribution(accepted.map(x => x.damage)),
        wound_per_accepted: distribution(accepted.map(x => x.wound)),
        attack_bonus: distribution(accepted.map(x => x.attack_bonus)),
        base_cost: distribution(known.map(x => x.base_cost)),
        action_surcharge_cost: distribution(known.map(x => x.action_surcharge_cost)),
        actor_neili_cost: distribution(known.map(x => x.neili_cost)),
        actor_busy: distribution(known.map(x => x.actor_busy)),
        target_busy_initial: distribution(known.map(x => x.target_busy_initial)),
        target_busy_final: distribution(known.map(x => x.target_busy_final)),
        learned_delta: distribution(known.map(x => x.learned_delta)),
    };
}
