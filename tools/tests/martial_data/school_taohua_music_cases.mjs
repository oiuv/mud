// Independent preparation only: not registered, no real-driver observations.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 3000, max_neili: 3000, jingli: 1000, str: 36, int: 36, con: 36,
    dex: 34, age: 30, gender: '男性', jiali: 0, combat_exp: 100000000, shen: 0,
    character: '光明磊落', 'family/family_name': '桃花岛' };
const songs = { bihai: 'bihai-chaosheng', yuan: 'taohua-yuan' };
const names = { bihai: '碧海潮生曲', yuan: '桃花怨' };
const terminalPrefix = '\x1b[256D\x1b[K';
const hash = text => createHash('sha256').update(text).digest('hex');

export const taohuaMusicSourcePaths = [
    'kungfu/skill/bihai-chaosheng.c', 'kungfu/skill/taohua-yuan.c', 'kungfu/skill/chuixiao-jifa.c',
    'kungfu/skill/force.c', 'inherit/skill/skill.c', 'inherit/misc/_xiao.c', 'inherit/weapon/xsword.c',
    'd/items/xiao.lpc', 'd/items/xiao_data.h', 'd/taohua/obj/yuxiao.c',
    'cmds/std/hand.c', 'cmds/std/wield.c', 'cmds/std/drop.c', 'cmds/std/halt.c',
    'feature/skill.c', 'feature/action.c', 'feature/attack.c', 'feature/condition.c',
    'feature/damage.c', 'feature/equip.c', 'feature/move.c', 'feature/name.c', 'feature/attribute.c',
    'inherit/char/char.c', 'inherit/misc/equip.c', 'adm/daemons/itemd.c',
    'adm/single/simul_efun/message.c', 'mudcore/inherit/action.c', 'mudcore/inherit/dbase.c',
    'include/globals.h', 'include/weapon.h', 'mudcore/include/ansi.h',
];

export const taohuaMusicFixtureRequirements = [
    'Later register only taohua-music/method music. Reuse three connected nonwizard USERs and original force_me(play ... with xiao); never call do_effect as the measured entry. No new game probe or executor.',
    'Reuse exact left/right/third identities and empty initial hostility. Snapshot actual is_character, environment, cultivation.character, conditions, hostility and all three resource counters; missing mappings are not zero.',
    'Prepare the original zhuxiao or d/taohua/obj/yuxiao object through original move, then original hand/wield/drop command as configured. Keep exact object reference, valid_as_xiao, play_xiao owner, room inventory and holding/weapon slots; no substituting a test sword.',
    'Record music_preparation before/after instrument and actor, original preparation command and its positive force_me cost. Carry-only has no command and explicit null return. Reset all counters after original preparation.',
    'Reuse original unconscious preparation and retain its before/after/terminal evidence separately. It sets qi/jing to zero and schedules revive; do not refill, force revive, shorten the clock, or count preparation as music damage.',
    'Record music_context_before/after (room flags, actual room inventory, instrument). Only this group gets music_steps with original action/actor/command cost/reason and three-user before/after. One play, or play then halt in the same immediate window; no fake launch or ongoing music timer.',
    'Keep existing immediate non-bout heartbeat suppression and original random; no attack, callback or terminal in the command window. Preserve exact original refusal string and notify_fail; do not turn force_me positive cost into boolean 1.',
    'Report taohuaMusicEffects(rows, frozenCondition), including third-user counters. Damage/wound, capped recovery, command refusal and accepted-without-effect are separate; one healing argument is shared across listeners. Do not infer its hidden exact value when all listeners cap.',
    'Freeze this module/test, report/statistics dependencies and source_evidence only in a new series. Cleanup exact created instrument/USER references and their original timers after recording, never historical evidence or real player data.',
];

export function taohuaMusicConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(taohuaMusicSourcePaths.map(path => {
        const source = readSource(path);
        assert.ok((typeof source === 'string' || Buffer.isBuffer(source)) && source.length > 0, path);
        return [path, hash(source)];
    }));
    const rows = [];
    function add(song, tag, level = 200, extra = {}) {
        const skill = songs[song], source = catalog.skills.find(s => s.id === skill);
        assert.equal(source?.path, `kungfu/skill/${skill}.c`);
        assert.equal(source.sha256, evidence[source.path]);
        const entry = source.entries.find(e => e.id.endsWith(':do_effect'))?.id;
        assert.ok(entry?.startsWith(source.path + ':'));
        assert.match(entry.slice(source.path.length), /^:\d+:do_effect$/);
        const config = (changes = {}, performer = false) => ({ skills: { force: 600,
            ...(performer ? { 'chuixiao-jifa': level, [skill]: level } : { 'bihai-chaosheng': 0 }),
            ...changes.skills }, mappings: {}, preparations: {},
        properties: { ...defaults, ...(performer ? { neili: 6000, max_neili: 6000 }
            : song === 'yuan' ? { jing: 1000 } : {}), ...changes.properties },
        ...(changes.conditions ? { conditions: changes.conditions } : {}),
        ...(changes.busy ? { busy: changes.busy } : {}) });
        const mode = extra.mode ?? 'hand', instrument = {
            program: mode === 'weapon' ? '/d/taohua/obj/yuxiao' : '/d/items/xiao/zhuxiao',
            id: 'xiao', mode,
            preparation_action: ({ hand: 'hand xiao', weapon: 'wield xiao', ground: 'drop xiao', carry: '' })[mode],
        };
        assert.ok(Object.hasOwn(instrument, 'preparation_action'));
        const action = extra.empty ? 'play' : `play ${extra.wrongSkill ? 'force' : skill} with xiao`;
        rows.push({ id: `school-taohua-music-${song}-l${level}-${tag}`, stage: 'school', entry_id: entry,
            method: 'music', samples: smoke ? 1 : tag === 'baseline' ? samples : 2,
            parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-music',
                song, skill, name: names[song], level, variant: tag, actor: config(extra.actor, true),
                target: config(extra.target), extra_target: config(extra.third), instrument,
                named_participants: true, fighting: false, target_state: extra.unconscious ? 'unconscious' : 'living',
                room: extra.room ?? {}, action, ...(extra.halt ? { repeat_actions: [action, 'halt'] } : {}),
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                observation: 'single_action_immediate', observe_seconds: 0, not_applicable: '',
                ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                source_evidence: { ...evidence },
                qualification_note: '三位真实非巫师USER，已掌握曲谱为实验初态，不代表借书、拜师或研读成本。'
                    + '测原乐器play而非玉箫剑perform；原效果即时完成，普通busy整数不当秒数。'
                    + '不改随机、不在窗口移动人物、不重填资源；地上箫仅经原drop准备。',
            } });
    }
    for (const level of [200, 400, 800]) add('bihai', 'baseline', level);
    const weak = { skills: { force: 2 } };
    const guaranteed = { target: weak, third: weak };
    add('bihai', 'music149', 200, { actor: { skills: { 'chuixiao-jifa': 100, 'bihai-chaosheng': 99 } } });
    add('bihai', 'music150', 200, { ...guaranteed, actor: { skills: { 'chuixiao-jifa': 100, 'bihai-chaosheng': 100 } } });
    add('bihai', 'force-block', 200, { target: { skills: { force: 720 } }, third: { skills: { force: 720 } } });
    for (const gap of [499, 500]) add('bihai', 'neili-gap' + gap, 200, {
        target: { ...weak, properties: { max_neili: 6000 - gap } }, third: { ...weak, properties: { max_neili: 6000 - gap } },
    });
    add('bihai', 'no-fight', 200, { room: { no_fight: 1 } });
    add('bihai', 'skybook', 200, { room: { skybook: 1 } });
    add('bihai', 'die-guard', 200, { target: { ...weak, conditions: { die_guard: 100 } }, third: weak });
    add('bihai', 'song-guard-boundary', 200, { target: { skills: { force: 2, 'bihai-chaosheng': 134 } },
        third: { skills: { force: 2, 'bihai-chaosheng': 132 } } });
    add('bihai', 'unconscious', 200, { ...guaranteed, unconscious: true });
    add('bihai', 'resource-clamp', 200, { target: { ...weak, properties: { jing: 5, max_neili: 5500 } },
        third: { ...weak, properties: { jing: 12, eff_jing: 12, max_neili: 5500 } } });
    add('bihai', 'carried', 200, { ...guaranteed, mode: 'carry' });
    add('bihai', 'wielded', 200, { ...guaranteed, mode: 'weapon' });
    add('bihai', 'unknown-song', 200, { actor: { skills: { 'bihai-chaosheng': 0 } }, refusal: '你不会吹这首曲子。\n' });
    add('bihai', 'busy50', 200, { actor: { busy: 50 }, refusal: '你现在正忙，等会儿再吹箫吧。\n' });
    add('bihai', 'not-music', 200, { wrongSkill: true, refusal: '这也能当箫曲吹么？\n' });
    add('bihai', 'no-argument', 200, { empty: true, refusal: '你要吹什么曲子？\n' });
    for (const level of [200, 400, 800]) add('yuan', 'baseline', level);
    const cap = { properties: { jing: 9990 } }, capped = { target: cap, third: cap };
    add('yuan', 'music99', 200, { actor: { skills: { 'chuixiao-jifa': 66, 'taohua-yuan': 66 } } });
    add('yuan', 'music100', 200, { ...capped, actor: { skills: { 'chuixiao-jifa': 68, 'taohua-yuan': 66 } } });
    add('yuan', 'capped-heal', 200, { target: { properties: { jing: 9998 } }, third: cap });
    add('yuan', 'protected-room', 200, { ...capped, room: { no_fight: 1, skybook: 1 } });
    add('yuan', 'unconscious-guard', 200, { unconscious: true,
        target: { properties: { jing: 10, eff_jing: 10 } }, third: { ...cap, conditions: { die_guard: 100 } } });
    add('yuan', 'ground-flute', 200, { ...capped, mode: 'ground' });
    add('yuan', 'halt-after-play', 200, { ...capped, halt: true });
    return rows;
}

function map(value, label) { assert.ok(value && typeof value === 'object' && !Array.isArray(value), label); return value; }
function field(value, key) { assert.ok(Object.hasOwn(value, key), '缺少 ' + key); return value[key]; }
function integer(value, label) { assert.ok(Number.isSafeInteger(value), label); return value; }
function absent(value, label) { assert.ok(value === null || value === 0, label); }
function idle(s) { const b = field(s, 'busy'); return b === null ? 0 : integer(b, '忙乱须为原整数'); }
function counter(m, key) { map(m, '缺少原计数映射'); const n = integer(Object.hasOwn(m, key) ? m[key] : 0, key); assert.ok(n >= 0); return n; }
function conditionMap(s) { const c = field(s, 'conditions'); return c === null || c === 0 ? {} : map(c, '原条件'); }
function refusal(step, actor, text) {
    assert.equal(step.accepted, 0);
    assert.equal(field(actor.temp, 'notify_fail'), text, '保留原提示正文/色码/换行');
    assert.ok(step.reason === text || step.reason === terminalPrefix + text, '提示与原notify_fail不同源');
}
function sameSet(actual, expected, label) {
    assert.ok(Array.isArray(actual), label); assert.equal(new Set(actual).size, actual.length, label);
    assert.deepEqual([...actual].sort(), [...expected].sort(), label);
}
function initial(s, config, side, p, prepared = false) {
    assert.match(s?.object ?? '', /^\/tests\/actor#\d+$/);
    assert.equal(s.id, ['left', 'right', 'third'][side]);
    for (const key of ['userp', 'playerp', 'interactive', 'is_character']) assert.equal(s[key], 1, key);
    for (const key of ['ghost', 'wizardp']) assert.equal(s[key], 0, key);
    const asleep = side === 1 && p.target_state === 'unconscious' && !prepared;
    assert.equal(s.living, asleep ? 0 : 1); assert.equal(s.environment, '/tests/runner');
    assert.equal(idle(s), config.busy ?? 0);
    for (const key of ['skills', 'mappings', 'preparations']) assert.deepEqual(s[key], config[key], key);
    assert.deepEqual(s.learned, {}); assert.deepEqual(conditionMap(s), config.conditions ?? {});
    const apply = map(map(s.temp, '实际temp').apply, '实际apply');
    assert.deepEqual(apply, { armor: 100, ...(side === 0 && p.instrument.mode === 'weapon' ? { damage: 40 } : {}) });
    for (const key of ['no_perform', 'no_exert', 'powerup', 'guarded', 'remote_attack', 'weapon_performing'])
        assert.equal(Object.hasOwn(s.temp, key), false, '非本组初态 ' + key);
    if (Object.hasOwn(s.temp, 'user_setup')) assert.equal(s.temp.user_setup, 1);
    if (asleep) assert.equal(s.temp.block_msg?.all, 1, '原昏迷提示抑制');
    const effective = map(s.effective_skills, '实际有效技能');
    assert.deepEqual(Object.keys(effective).sort(), Object.keys(config.skills).sort());
    for (const [key, value] of Object.entries(config.skills)) assert.equal(effective[key], Math.trunc(value / 2), key);
    assert.equal(s.effective_str, config.properties.str);
    assert.equal(s.effective_con, config.properties.con + Math.trunc(config.skills.force / 10));
    for (const [key, value] of Object.entries(config.properties)) {
        const actual = key.includes('/') || key === 'character' ? field(map(s.cultivation, '资格'), key) : field(s, key);
        assert.equal(actual, asleep && ['qi', 'jing'].includes(key) ? 0 : value, key);
    }
    for (const key of ['enemies', 'killers', 'wants']) sameSet(field(map(s.hostility, '敌对'), key), [], key);
    assert.equal(s.secondary_weapon, 'none'); assert.deepEqual(s.secondary_weapon_details, {});
}
function instrument(i, p, owner, mode) {
    map(i, '原乐器'); assert.equal(i.program, p.instrument.program);
    assert.ok(typeof i.object === 'string' && (i.object === i.program || i.object.startsWith(i.program + '#')));
    assert.equal(i.environment, mode === 'ground' ? '/tests/runner' : owner.object);
    assert.equal(i.valid_as_xiao, 1); assert.equal(i.input_id, 'xiao'); assert.equal(i.id_matches, 1);
    assert.equal(i.play_owner, '/inherit/misc/_xiao');
    assert.equal(i.weight, p.instrument.mode === 'weapon' ? 500 : 600);
    assert.equal(i.material, p.instrument.mode === 'weapon' ? 'stone' : 'bamboo');
    if (p.instrument.mode === 'weapon') {
        assert.equal(i.skill_type, 'sword'); assert.equal(i.damage, 40); assert.equal(i.flag, 4); assert.equal(i.consistence, 100);
    } else for (const key of ['skill_type', 'damage', 'flag', 'consistence']) absent(field(i, key), key);
    if (mode === 'weapon') assert.equal(i.equipped, 'wielded'); else absent(field(i, 'equipped'), '非兵器未装备');
    assert.equal(i.present_in_actor, mode === 'ground' ? 0 : 1);
    assert.equal(i.present_in_room, mode === 'ground' ? 1 : 0);
}
function slots(s, item, mode) {
    assert.equal(s.weapon, mode === 'weapon' ? 'sword' : 'none');
    assert.equal(s.weapon_damage, mode === 'weapon' ? 40 : 0); assert.equal(s.weapon_flag, mode === 'weapon' ? 4 : 0);
    if (mode === 'hand') absent(field(s, 'handing'), '普通箫无skill_type'); else assert.equal(s.handing, 'none');
    for (const [key, active] of [['weapon', mode === 'weapon'], ['handing', mode === 'hand']]) {
        const details = map(field(s, key + '_details'), key + ' details');
        if (!active) { assert.deepEqual(details, {}); assert.equal(Object.hasOwn(s.temp, key), false); }
        else {
            assert.equal(s.temp[key], item.object);
            for (const k of ['object', 'program', 'skill_type', 'damage', 'flag', 'weight', 'material', 'consistence'])
                assert.deepEqual(field(details, k), field(item, k), key + '.' + k);
        }
    }
}
function context(c, p, states) {
    map(c, '范围现场'); const room = map(c.room, '原房间'); assert.equal(room.object, '/tests/runner');
    for (const key of ['no_fight', 'skybook']) {
        const actual = field(room, key);
        if (p.room[key]) assert.equal(actual, p.room[key]); else absent(actual, key);
    }
    instrument(c.instrument, p, states[0], p.instrument.mode);
    const expected = states.map(s => s.object);
    if (p.instrument.mode === 'ground') expected.push(c.instrument.object);
    sameSet(c.inventory, expected, '精确同房范围，不能漏第三人/混入旁人');
    for (let side = 0; side < 3; side++) slots(states[side], c.instrument, side === 0 ? p.instrument.mode : 'carry');
}
function stable(s, performer) {
    const copy = structuredClone(s);
    for (const key of ['busy', 'jing', 'eff_jing', 'hostility']) delete copy[key];
    if (performer) delete copy.temp.notify_fail;
    return copy;
}
function ledger(before, after, m) {
    map(m, '必须保留第三人及双方真实计量');
    for (const [key, value] of Object.entries(m)) {
        assert.ok(Number.isSafeInteger(value) && value >= 0, '非法/未知计数 ' + key);
        if (!health.some(r => key === r + '_cost' || key === r + '_recovery')) assert.equal(value, 0, '即时音乐无 ' + key);
    }
    for (const key of health) {
        assert.equal(counter(m, key + '_cost'), Math.max(0, before[key] - after[key]), key + '原实际支出');
        assert.equal(counter(m, key + '_recovery'), Math.max(0, after[key] - before[key]), key + '原实际恢复');
    }
}

export function validateTaohuaMusicRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'taohua-music'); assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.kind, 'sample'); assert.equal(raw.method, 'music'); assert.equal(condition.method, 'music');
    assert.equal(raw.outcome, p.expected); const accepted = raw.outcome === 'observed';
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'refusals', 'attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'terminals', 'callbacks'])
        assert.deepEqual(field(raw, key), [], '音乐不伪装原perform或战斗回调 ' + key);
    const before = [...raw.before, field(raw, 'extra_target_before')];
    const after = [...raw.immediate, field(raw, 'extra_target_immediate')];
    const configs = [p.actor, p.target, p.extra_target];
    assert.equal(new Set(before.map(s => s.object)).size, 3, '三位不同真实USER');
    for (let i = 0; i < 3; i++) initial(before[i], configs[i], i, p);
    context(field(raw, 'music_context_before'), p, before);
    context(field(raw, 'music_context_after'), p, after);
    assert.deepEqual(raw.music_context_after, raw.music_context_before, '正式窗口不搬人物或乐器');
    if (p.target_state === 'unconscious') {
        const prep = map(raw.preparation, '保留原昏迷准备');
        initial(prep.before, p.target, 1, p, true);
        assert.deepEqual(prep.after, before[1]); assert.equal(prep.before.object, before[1].object);
        assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }]);
    } else assert.equal(Object.hasOwn(raw, 'preparation'), false);
    const prep = map(raw.music_preparation, '原乐器准备证据');
    assert.equal(prep.action, p.instrument.preparation_action); assert.equal(prep.actor, before[0].object);
    if (prep.action) assert.ok(Number.isSafeInteger(prep.accepted) && prep.accepted > 0, '原准备命令成本');
    else assert.equal(prep.accepted, null);
    assert.deepEqual(prep.after.actor, before[0]);
    assert.deepEqual(prep.after.instrument, raw.music_context_before.instrument);
    instrument(prep.before.instrument, p, prep.before.actor, 'carry');
    assert.equal(prep.before.instrument.object, prep.after.instrument.object, '同一原乐器');
    const oldItem = structuredClone(prep.before.instrument), newItem = structuredClone(prep.after.instrument);
    for (const item of [oldItem, newItem])
        for (const key of ['environment', 'equipped', 'present_in_actor', 'present_in_room']) delete item[key];
    assert.deepEqual(newItem, oldItem, '原准备不改其他乐器属性');
    slots(prep.before.actor, prep.before.instrument, 'carry');
    const prepActor = structuredClone(prep.after.actor), priorActor = structuredClone(prep.before.actor);
    for (const s of [prepActor, priorActor]) {
        for (const key of ['weapon', 'weapon_damage', 'weapon_flag', 'weapon_details', 'handing', 'handing_details']) delete s[key];
        delete s.temp.handing; delete s.temp.weapon;
    }
    if (p.instrument.mode === 'weapon') {
        assert.equal(prepActor.temp.apply.damage, 40); delete prepActor.temp.apply.damage;
    }
    assert.deepEqual(priorActor.temp.apply, { armor: 100 });
    assert.deepEqual(prepActor, priorActor, '原准备不能改技能/资源/其他初态');
    const steps = field(raw, 'music_steps'); assert.equal(steps.length, p.repeat_actions ? 2 : 1);
    const play = steps[0]; assert.equal(play.action, p.action); assert.equal(play.actor, before[0].object);
    assert.deepEqual(play.before, before);
    assert.ok(Number.isSafeInteger(play.accepted) && play.accepted >= 0, '保留原force_me成本');
    assert.equal(raw.command_accepted, play.accepted);
    assert.equal(play.accepted > 0, accepted);
    if (!accepted) refusal(play, play.after[0], p.refusal);
    else assert.equal(play.reason, '');
    assert.equal(raw.reason, accepted ? '' : play.reason);
    assert.equal(play.after.length, 3);
    const musicLevel = Math.trunc(before[0].skills['chuixiao-jifa'] / 2) + before[0].skills[p.skill];
    const power = Math.trunc((Math.trunc(musicLevel / 5) + before[0].effective_skills.force) / 2);
    const listeners = [], affected = [];
    let healLow = 10, healHigh = musicLevel + 9;
    for (let side = 0; side < 3; side++) {
        const b = before[side], a = play.after[side];
        assert.deepEqual(stable(a, side === 0), stable(b, side === 0), '非音乐状态被改动/身份被替换');
        if (side === 0) {
            assert.equal(a.jing, b.jing); assert.equal(a.eff_jing, b.eff_jing);
            if (accepted) assert.ok(idle(a) >= 3 && idle(a) <= 5, '原3+random(3)忙乱');
            else assert.equal(idle(a), idle(b));
            continue;
        }
        assert.equal(idle(a), idle(b));
        const info = { id: b.id, damage: 0, wound: 0, recovery: 0, affected: false,
            force_check_reachable: false, damage_eligible: false };
        if (accepted && p.song === 'bihai') {
            const gate = musicLevel >= 150 && !p.room.no_fight && !p.room.skybook && b.living === 1
                && !conditionMap(b).die_guard
                && Math.trunc(before[0].effective_skills[p.skill] * 2 / 3) >= b.effective_skills[p.skill];
            const gap = before[0].max_neili - b.max_neili, eligible = gate && gap >= 500;
            const hit = a.jing !== b.jing || a.eff_jing !== b.eff_jing;
            if (!eligible || power * 2 - 1 < b.effective_skills.force) assert.equal(hit, false, '源码必不受伤');
            if (eligible && power >= b.effective_skills.force) assert.equal(hit, true, '源码必受伤');
            if (hit) {
                const damage = Math.trunc(gap / 10), wound = Math.trunc(damage / 3);
                const eff = b.eff_jing - wound < 0 ? -1 : b.eff_jing - wound;
                const jing = b.jing - damage < 0 ? -1 : b.jing - damage;
                assert.equal(a.eff_jing, eff); assert.equal(a.jing, Math.min(jing, eff));
                affected.push(b.id);
            } else { assert.equal(a.jing, b.jing); assert.equal(a.eff_jing, b.eff_jing); }
            info.damage = b.jing - a.jing; info.wound = b.eff_jing - a.eff_jing;
            info.affected = hit; info.force_check_reachable = gate; info.damage_eligible = eligible;
        } else if (accepted && p.song === 'yuan' && musicLevel >= 100) {
            const gain = a.jing - b.jing, missing = b.eff_jing - b.jing;
            assert.ok(Number.isSafeInteger(gain) && gain >= 0 && gain <= missing);
            assert.equal(a.eff_jing, b.eff_jing, '不是治愈创伤');
            if (gain < missing) { healLow = Math.max(healLow, gain); healHigh = Math.min(healHigh, gain); }
            else healLow = Math.max(healLow, gain);
            info.recovery = gain; info.affected = gain > 0;
        } else { assert.equal(a.jing, b.jing); assert.equal(a.eff_jing, b.eff_jing); }
        listeners.push(info);
    }
    const heals = accepted && p.song === 'yuan' && musicLevel >= 100;
    if (heals) assert.ok(healLow <= healHigh, '同次array call仅一份原恢复参数，不可逐人重抽/超原区间');
    for (let i = 0; i < 3; i++) {
        const s = play.after[i], hit = affected.includes(s.id);
        sameSet(s.hostility.enemies, i === 0 ? affected : hit ? ['left'] : [], '原fight_ob归属');
        sameSet(s.hostility.killers, i > 0 && hit ? ['left'] : [], '原kill_ob归属');
        sameSet(s.hostility.wants, i === 0 ? affected : [], '原want_kill归属');
    }
    if (steps.length === 2) {
        const halt = steps[1]; assert.equal(halt.action, 'halt'); assert.equal(halt.actor, before[0].object);
        assert.deepEqual(halt.before, play.after); assert.equal(halt.after.length, 3);
        refusal(halt, halt.after[0], '你现在停不下来。\n');
        for (let i = 0; i < 3; i++) {
            const b = structuredClone(halt.before[i]), a = structuredClone(halt.after[i]);
            if (i === 0) { delete b.temp.notify_fail; delete a.temp.notify_fail; }
            assert.deepEqual(a, b, 'halt失败不能清busy或回滚已完成效果');
        }
    }
    assert.deepEqual(steps.at(-1).after, after);
    assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.extra_target_after, raw.extra_target_immediate);
    for (let side = 0; side < 3; side++) ledger(before[side], after[side], side < 2 ? raw.metrics[side] : raw.extra_target_metrics);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    return { accepted, music_level: musicLevel, actor_busy: idle(after[0]), listeners,
        any_effect: listeners.some(s => s.affected),
        shared_heal_argument: heals && healLow === healHigh ? healLow : null,
        shared_heal_possible: heals ? { min: healLow, max: healHigh } : null,
        halt_attempted: steps.length === 2,
        actor_costs: Object.fromEntries(health.map(key => [key, counter(raw.metrics[0], key + '_cost')])) };
}

export function taohuaMusicEffects(rows, condition) {
    assert.equal(condition?.parameters?.collection_group, 'taohua-music');
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 }, known = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); const raw = row.raw ?? row;
        assert.equal(raw.condition_id, condition.id);
        if (row.raw) assert.equal(row.outcome, raw.outcome);
        assert.ok(Object.hasOwn(counts, raw.outcome)); counts[raw.outcome]++;
        if (['observed', 'refused'].includes(raw.outcome)) known.push(validateTaohuaMusicRecord(raw, condition));
    }
    const accepted = known.filter(x => x.accepted);
    return { counts, unknown_effect_samples: counts.error + counts.not_applicable,
        acceptance: probability(accepted.length, known.length), refusal: probability(counts.refused, known.length),
        any_effect_given_accepted: probability(accepted.filter(s => s.any_effect).length, accepted.length),
        accepted_without_effect: accepted.filter(s => !s.any_effect).length,
        actor_busy: distribution(known.map(s => s.actor_busy)),
        actor_costs: Object.fromEntries(health.map(key => [key, distribution(known.map(s => s.actor_costs[key]))])),
        shared_heal_argument: distribution(accepted.filter(s => s.shared_heal_possible).map(s => s.shared_heal_argument)),
        halt_rejected_after_completed_play: known.filter(s => s.halt_attempted).length,
        listeners: ['right', 'third'].map((id, index) => {
            const data = accepted.map(s => s.listeners[index]), eligible = data.filter(s => s.damage_eligible);
            return { id, accepted_scope_samples: data.length,
                source_reachable_force_checks: data.filter(s => s.force_check_reachable).length,
                damage_given_eligible: probability(eligible.filter(s => s.affected).length, eligible.length),
                any_effect_given_accepted: probability(data.filter(s => s.affected).length, data.length),
                jing_damage: distribution(data.map(s => s.damage)), jing_wound: distribution(data.map(s => s.wound)),
                jing_recovery: distribution(data.map(s => s.recovery)) };
        }),
    };
}
