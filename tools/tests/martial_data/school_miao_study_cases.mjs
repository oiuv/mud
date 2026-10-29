// Original room commands, not direct do_canwu/do_think calls or fabricated grants.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const room = '/d/zhongzhou/miaojia_shufang';
export const miaoStudySources = {
    'd/zhongzhou/miaojia_shufang.c': 'ea6b85b54508e425fde86877586f49098d875515637db1628753cb64eb73e94f',
    'feature/skill.c': '99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
    'inherit/skill/skill.c': '891da821f84c26820c1e540822dba751f218441cc03f2b95a1fcfcc3923294cd',
    'kungfu/skill/panlong-zhao.c': 'de3ea5187a50df3bce5c57a7cb6552df06fb419e7e7d4b8eb0dad74c6c59e45c',
    'kungfu/skill/chongtian-zhang.c': '4a269121c54bbd8fbfd5e8159717b612e53c2036f66cd2714a7cb882f27bedb8',
    'kungfu/skill/martial-cognize.c': '9238927aa151caabc277e812e5b5635af081893be7969cf803f16cb691ddc857',
};
export const miaoStudySourcePaths = [...Object.keys(miaoStudySources), 'kungfu/skill/claw.c',
    'kungfu/skill/strike.c', 'feature/move.c', 'feature/action.c', 'feature/damage.c',
    'feature/attribute.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c', 'mudcore/inherit/action.c',
    'adm/single/simul_efun/message.c', 'inherit/char/char.c', 'inherit/room/room.c'];
const defaults = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 30, int: 36, con: 30, dex: 30, gender: '男性', potential: 10000, learned_points: 100,
    'family/family_name': '中原苗家', 'can_perform/panlong-zhao/tan': 0 };

export function miaoStudyConditions(_catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, hash] of Object.entries(miaoStudySources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), hash,
            '苗家书房来源改变，须重新审阅：' + path);
    const result = [];
    function add(ability, suffix, extra = {}) {
        const level = extra.level ?? (ability === 'canwu' ? 200 : 100);
        const source_entry = { id: `d/zhongzhou/miaojia_shufang.c:${ability === 'canwu' ? 73 : 29}:do_${ability === 'canwu' ? 'canwu' : 'think'}`,
            path: 'd/zhongzhou/miaojia_shufang.c', line: ability === 'canwu' ? 73 : 29,
            function: ability === 'canwu' ? 'do_canwu' : 'do_think', role: 'scene', sha256: miaoStudySources['d/zhongzhou/miaojia_shufang.c'] };
        assert.ok(readSource(source_entry.path).split('\n')[source_entry.line - 1].includes(source_entry.function + '('));
        result.push({ id: `school-scene-miao-study-${ability}-${suffix}`, stage: 'school', method: 'scene',
            entry_id: source_entry.id, samples: smoke ? 2 : extra.refusal ? 2 : samples,
            parameters: { collection_group: 'miao-study', school: 'miao', family: '中原苗家',
                ability, level, room, source_entry, source_evidence: { ...miaoStudySources },
                qualification_sources: [...miaoStudySourcePaths],
                actor: { skills: { force: 400, claw: level, 'panlong-zhao': ability === 'canwu' ? level : 200,
                    strike: ability === 'think' ? level : 100, 'chongtian-zhang': ability === 'think' ? level : 100,
                    'martial-cognize': 0, ...extra.skills }, mappings: {}, preparations: {},
                    properties: { ...defaults, ...extra.properties }, ...(extra.busy ? { busy: 2 } : {}) },
                target: { skills: { force: 100 }, mappings: {}, preparations: {}, properties: { ...defaults } },
                action: extra.action ?? (ability === 'canwu' ? 'canwu shu' : 'think tu'),
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                fighting: false, observe_seconds: 0, observation: 'single_original_room_command',
                not_applicable: '', random_observation: !extra.refusal,
                note: '真实非巫师USER移入原苗家书房，经原add_action/force_me执行一次命令，角色每样本重建。保持原随机，不强制领悟，不循环到成功，不补资源/忙乱；未领悟也记录原10潜能/25精神支出。think只在原等级/经验许可时增长，原先天悟性36与修养加成分别核对。只证明房内命令，不证明自然走到此处、NPC授课或长期养成。' } });
    }
    for (const level of [130, 200, 400, 800]) add('canwu', 'l' + level, { level });
    add('canwu', 'wall', { action: 'canwu wall' });
    add('canwu', 'growth-blocked', { properties: { combat_exp: 0 } });
    add('canwu', 'jing30', { properties: { jing: 30 } });
    add('canwu', 'potential10', { properties: { potential: 110 } });
    add('canwu', 'cognize500', { skills: { 'martial-cognize': 500 } });
    add('canwu', 'wrong-argument', { action: 'canwu tu', refusal: '你要参悟什么？\n' });
    add('canwu', 'already-known', { properties: { 'can_perform/panlong-zhao/tan': 1 },
        refusal: '你随手翻阅案台上的书籍，发现上面已经没什么东西值得研究了。\n' });
    add('canwu', 'no-skill', { skills: { 'panlong-zhao': 0 },
        refusal: '你随手翻阅案台上的书籍，发现书中所记载的东西和你所习的武学没什么瓜葛，参悟不出什么。\n' });
    add('canwu', 'skill129', { skills: { 'panlong-zhao': 129 },
        refusal: '你随手翻阅案台上的书籍，发现书中所记载的爪法甚是精妙，可却是太过深奥，自己一时无法领悟。\n' });
    add('canwu', 'busy', { busy: true, refusal: '你现在正在参悟中。\n' });
    add('canwu', 'potential9', { properties: { potential: 109 }, refusal: '你的潜能不够了，参悟不出什么。\n' });
    add('canwu', 'jing29', { properties: { jing: 29 }, refusal: '你太疲倦了，休息一下吧。\n' });
    for (const level of [30, 100, 149]) add('think', 'l' + level, { level });
    add('think', 'only-basic', { skills: { strike: 149, 'chongtian-zhang': 150 } });
    add('think', 'only-special', { skills: { strike: 150, 'chongtian-zhang': 149 } });
    add('think', 'jing50', { properties: { jing: 50 } });
    add('think', 'growth-blocked', { properties: { combat_exp: 0 } });
    add('think', 'cognize500', { skills: { 'martial-cognize': 500 } });
    add('think', 'wrong-argument', { action: 'think shu', refusal: '你要干什么？\n' });
    add('think', 'busy', { busy: true, refusal: '你现在正忙着呢。\n' });
    for (const skill of ['strike', 'chongtian-zhang']) add('think', skill + '-29', { skills: { [skill]: 29 },
        refusal: '你发现图中所记载的掌法过于高深，自己无法领会到任何东西。\n' });
    add('think', 'both150', { level: 150, refusal: '你发现图中所记载的掌法过于肤浅，自己无法领会到任何东西。\n' });
    add('think', 'jing49', { properties: { jing: 49 }, refusal: '你现在精神不济，过于疲倦，还是休息一会吧。\n' });
    return result;
}

const n = v => v ?? 0;
const clean = v => v.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
const plain = state => { const v = structuredClone(state); if (v.temp) delete v.temp.notify_fail; return v; };
// The original function awards at most one level per call, resets surplus, and
// rechecks can_improve before each of the three explicit room calls.
export function miaoStudyImprove(state, skill, amount, check = true) {
    const lvl = n(state.skills[skill]);
    if (check && Math.trunc(lvl * lvl * lvl / 10) > state.combat_exp) return;
    if (skill !== 'martial-cognize') amount += Math.trunc(amount * n(state.skills['martial-cognize']) / 500);
    amount = 1 + Math.trunc(amount * 100 / (lvl + 100));
    state.skills[skill] = lvl;
    state.learned[skill] = n(state.learned[skill]) + amount;
    if (state.learned[skill] > (lvl + 1) * (lvl + 1)) {
        state.skills[skill]++; state.learned[skill] = 0;
    }
}
export function miaoStudyAfter(before, p, granted = false, busy = 0) {
    const expected = plain(before);
    if (p.expected === 'refused') return expected;
    if (p.ability === 'canwu') {
        expected.jing -= 25; expected.learned_points += 10; expected.busy = 2;
        if (granted) {
            for (const skill of ['claw', 'panlong-zhao']) for (let i = 0; i < 3; i++)
                miaoStudyImprove(expected, skill, 1500000);
            miaoStudyImprove(expected, 'martial-cognize', 1500000, false); expected.tan_grant = 1;
        }
    } else {
        expected.jing -= 30; expected.busy = busy;
        for (const skill of ['strike', 'chongtian-zhang']) if (n(before.skills[skill]) < 150)
            miaoStudyImprove(expected, skill, Math.trunc(before.int * 3 / 2));
    }
    // Derived fields from the changed skills are checked as values, not ignored.
    for (const key of Object.keys(expected.effective_skills)) expected.effective_skills[key] = Math.trunc(n(expected.skills[key]) / 2);
    expected.effective_str = expected.str + Math.trunc(Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw']
        .map(k => n(expected.skills[k]))) / 10);
    return expected;
}
export function validateMiaoStudyRecord(raw, c) {
    const p = c.parameters, [b, t] = raw.before, [a, v] = raw.immediate;
    assert.equal(p.collection_group, 'miao-study'); assert.equal(raw.method, 'scene'); assert.equal(raw.outcome, p.expected);
    assert.deepEqual(raw.after, raw.immediate);
    for (const key of ['launches', 'attacks', 'passives', 'interfaces', 'directs']) assert.deepEqual(raw[key], []);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side];
        for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(state[key], 1);
        assert.equal(state.wizardp, 0); assert.equal(state.ghost, 0);
        assert.deepEqual(state.skills, cfg.skills); assert.deepEqual(state.mappings, cfg.mappings);
        assert.deepEqual(state.preparations, cfg.preparations);
        for (const [key, value] of Object.entries(cfg.properties)) {
            if (key === 'can_perform/panlong-zhao/tan') assert.equal(n(state.tan_grant), value);
            else assert.equal(key.includes('/') ? state.cultivation[key] : state[key], value);
        }
        assert.equal(n(raw.metrics[side].heartbeats), 0);
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) assert.equal(n(raw.metrics[side][key + '_recovery']), 0);
    }
    const step = raw.study_step;
    assert.equal(step.command, p.action); assert.equal(step.room, room);
    assert.ok([room, room + '.c'].includes(step.function_owner), '原房间定义命令，不接受其它对象');
    assert.deepEqual(raw.study_setup.before, b); assert.equal(raw.study_setup.room_before, '/tests/runner');
    assert.equal(raw.study_setup.room_after, room); assert.equal(raw.study_setup.move_result, 1);
    assert.deepEqual(plain(raw.study_setup.after), plain(b)); assert.deepEqual(step.before, raw.study_setup.after);
    assert.deepEqual(step.after, a); assert.deepEqual(v, t);
    assert.ok(Array.isArray(step.messages)); assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    assert.equal(step.accepted, raw.command_accepted);
    if (p.expected === 'refused') {
        assert.equal(clean(raw.reason), p.refusal); assert.equal(clean(step.reason), p.refusal);
        assert.deepEqual(plain(a), plain(b)); return;
    }
    assert.equal(raw.reason, ''); assert.equal(step.reason, '');
    const s = b.skills;
    if (p.ability === 'canwu') {
        assert.ok(['canwu shu', 'canwu wall'].includes(p.action));
        assert.ok(!n(b.tan_grant) && n(s['panlong-zhao']) >= 130 && !n(b.busy)
            && b.potential - b.learned_points >= 10 && b.jing >= 30);
        assert.ok(n(a.tan_grant) === 0 || n(a.tan_grant) === 1);
        assert.equal(n(raw.metrics[0].jing_cost), 25);
        assert.deepEqual(plain(a), miaoStudyAfter(b, p, n(a.tan_grant) === 1));
    } else {
        assert.equal(p.ability, 'think'); assert.equal(p.action, 'think tu');
        assert.ok(!n(b.busy) && s.strike >= 30 && s['chongtian-zhang'] >= 30
            && !(s.strike >= 150 && s['chongtian-zhang'] >= 150) && b.jing >= 50);
        assert.ok(a.busy === 0 || a.busy === null || a.busy === 1);
        assert.equal(n(raw.metrics[0].jing_cost), 30);
        const expected = miaoStudyAfter(b, p, false, n(a.busy));
        if (a.busy === null) expected.busy = null;
        assert.deepEqual(plain(a), expected);
    }
}
