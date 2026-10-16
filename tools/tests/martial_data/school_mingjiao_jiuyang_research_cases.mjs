// Fixed finite research conditions; actual command observations are collected by the runner.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mingjiaoJiuyangExertSourcePaths } from './school_mingjiao_jiuyang_exert_cases.mjs';
const skill = 'jiuyang-shengong', group = 'mingjiao-jiuyang-research';
const copy = v => structuredClone(v), hash = b => createHash('sha256').update(b).digest('hex');
export const mingjiaoJiuyangResearchSourcePaths = Object.freeze([...new Set([...mingjiaoJiuyangExertSourcePaths,
    'cmds/skill/research.c', 'kungfu/skill/liumai-shenjian.c'])]);
export const mingjiaoJiuyangResearchReviewedSourceHash = 'a5b3c385cafed6781b4f83faef0205d6c1c7187f111db8502d61eb74afb464fe';
const evidenceHash = evidence => hash(JSON.stringify(mingjiaoJiuyangResearchSourcePaths.map(p => [p, evidence[p]])));
const pool = { name: '试侠', gender: '男性', race: '人类', class: '', character: '光明磊落',
    str: 36, int: 40, con: 40, dex: 36, shen: 90000, combat_exp: 100000000,
    qi: 1000000, eff_qi: 1000000, max_qi: 1000000, jing: 1000000, eff_jing: 1000000, max_jing: 1000000,
    neili: 3500, max_neili: 3500, jingli: 1000, max_jingli: 1000, jiali: 0, potential: 10000, learned_points: 0,
    reborn: 0, breakup: 0, doing: 0, 'family/family_name': '明教', 'improve/neili': 0,
    'special_skill/mystery': 0, 'special_skill/guimai': 0, 'special_skill/wuxing': 0,
    'env/no_learn': 0, 'env/auto_regenerate': 0, 'can_learn/jiuyang-shengong/enable_weapon': 1,
    'tattoo/tattoo_str': 0, 'tattoo/tattoo_int': 0, 'tattoo/tattoo_con': 0, 'tattoo/tattoo_dex': 0 };
const actor = level => ({ skills: { force: Math.max(200, level), [skill]: level, unarmed: level, sword: level,
    parry: 200, dodge: 200, 'martial-cognize': 100 }, mappings: { force: skill }, preparations: {}, properties: copy(pool) });
const unique = v => [...new Set(v)].sort((a, b) => a - b);
// Finite source support for these non-reborn fixed skills only, not a generic prediction engine.
function support(config, room, completed) {
    const l = config.skills[skill], props = config.properties;
    const relation = [config.skills.force];
    if (config.skills['shenghuo-xinfa']) relation.push(config.skills['shenghuo-xinfa']);
    relation.sort((a, b) => b - a);
    const scale = [150, 120], difficulty = config.skills['liumai-shenjian'] > 200 && !props.reborn ? 1400 : 1000;
    let improve = relation.reduce((n, r, i) => n + Math.trunc(r * scale[i] / (l >= 500 ? 2 : 1)), 0);
    improve = Math.trunc(Math.trunc(improve / 15) / (100 + difficulty));
    improve += Math.trunc(l / 50) + Math.trunc((props.int / (l >= 500 ? 6 : 12)) ** 2);
    if (props['special_skill/guimai']) improve += Math.trunc(improve * 30 / 100);
    if (props['special_skill/wuxing']) improve += Math.trunc(improve * 20 / 100);
    improve += Math.trunc(improve * (room.research_improve ?? 0) / 100);
    const gains = unique(Array.from({ length: improve }, (_, r) => 1 + Math.trunc((r + Math.trunc(r * config.skills['martial-cognize'] / 500)) * 100 / (l + 100))));
    let totals = [0]; for (let i = 0; i < completed; i++) totals = unique(totals.flatMap(n => gains.map(g => n + g)));
    return { difficulty, related_levels: relation, related_scales: scale.slice(0, relation.length), rng_bound: improve,
        possible_single_gain: gains, possible_total_gain: totals, expected_rng_draws: completed,
        hidden_random_input: completed ? 'unobserved' : 'not_called', derivation: 'original_source_support_not_observed_draw' };
}
function plans() {
    const out = [];
    const add = (variant, config = actor(200), options = {}) => {
        const times = options.times ?? 1, completed = options.completed ?? 1, room = options.room ?? {}, writeoff = options.writeoff ?? 0;
        const random = options.random ?? completed > 0;
        const action = `research ${skill} ${times}`, fee = Math.trunc(1000 / config.properties.int);
        const steps = [{ action, requested_times: times, expected_command_accepted: options.command_accepted ?? true,
            expected_completed: completed, expected_normal_jing_fee: completed * fee, expected_jing_writeoff: writeoff,
            expected_timestamp: options.timestamp ?? 'written', notice_kind: options.notice_kind ?? 'write', notice: options.notice ?? '',
            source_location: options.source_location ?? 'cmds/skill/research.c:189' }];
        if (options.same_second) steps.push({ action, requested_times: times, expected_command_accepted: false,
            expected_completed: 0, expected_normal_jing_fee: 0, expected_jing_writeoff: 0, expected_timestamp: 'preserved',
            notice_kind: 'notify_fail', notice: '你刚刚才研究过（如果你要连续研究，可以指明研究的次数）。\n', source_location: 'cmds/skill/research.c:32' });
        out.push({ id: `school-mingjiao-research-jiuyang-${variant}`, stage: 'school', method: 'research', parameters: {
            school: 'mingjiao', family: '明教', collection_group: group, variant, ability: 'research', skill, usage: 'force', level: config.skills[skill],
            actor: copy(config), target: actor(200), named_participants: true, fighting: options.fighting ?? false, room,
            action, actions: steps.map(s => s.action), research_steps: steps,
            observation: 'original_research_immediate', observe_seconds: 0, random_effects: random, formal_samples: random ? 100 : 2,
            expected: completed > 0 ? 'observed' : 'refused', not_applicable: '',
            research_prediction: { requested_times: times * steps.length, completed, normal_jing_fee: completed * fee, jing_writeoff: writeoff,
                learned_points_used: completed, potential_field_cost: 0, expected_accepted_commands: steps.filter(s => s.expected_command_accepted).length,
                exp_required: Math.trunc(config.skills[skill] ** 3 / 10), ...support(config, room, completed) },
            qualification_sources: [...mingjiaoJiuyangResearchSourcePaths],
            qualification_note: '独立纯准备，未注册或实采；只规划真实USER原research命令，不直调增长、不预写time/research、不强选随机。初始许可1且基础剑法/拳脚不低于九阳，180边界basicforce200，非转世只九阳force许可用于固定研究关系。储存技能/特技及资源是明示实验，不冒自然养成；六脉201只触难度而非force关系，圣火心法400是原兼修来源。源derived RNG界/进度支持不是直接随机观测；正常25精神费与SET0余量分开，potential字段不扣而learned_points增加。零完成即便原命令受理也不算正常研究进展；同秒首jing24原受理清零自然写timestamp，后原请求才拒，不造第一个成功。times100、初研究首次写兵器许可、doing scheme正例、自动恢复不在这25，广域目标仍待后续。',
        } });
    };
    for (const l of [180, 200, 400, 800]) add('level' + l, actor(l));
    const liumai = actor(400); liumai.skills['liumai-shenjian'] = 201; add('liumai201-nonreborn', liumai);
    for (const [variant, key] of [['guimai', 'special_skill/guimai'], ['wuxing', 'special_skill/wuxing']]) {
        const a = actor(200); a.properties[key] = 1; add(variant, a);
    }
    add('room50', actor(200), { room: { research_improve: 50 } });
    const partial = actor(200); partial.properties.jing = 51; add('jing51-times3', partial, { times: 3, completed: 2, writeoff: 1 });
    const equal = actor(200); equal.properties.combat_exp = 800000; add('exp-equal', equal);
    const related = actor(200); related.skills['shenghuo-xinfa'] = 400; add('related-xinfa400', related);
    const noProgress = (variant, edit, notice, source, options = {}) => { const a = actor(200); edit(a); add(variant, a,
        { completed: 0, random: false, command_accepted: false, timestamp: 'unchanged', notice_kind: 'notify_fail', notice, source_location: source, ...options }); };
    const lowJing = '你今天太累了，结果什么也没有研究成。\n';
    noProgress('jing24', a => { a.properties.jing = 24; }, lowJing, 'cmds/skill/research.c:185',
        { command_accepted: true, timestamp: 'written', notice_kind: 'write', writeoff: 24 });
    noProgress('eff-jing24', a => { a.properties.eff_jing = a.properties.jing = 24; }, '你觉得你精力不济，实在没有办法进行研究。\n', 'cmds/skill/research.c:166');
    noProgress('potential0', a => { a.properties.potential = 0; }, '你的潜能不够研究这么多次了。\n', 'cmds/skill/research.c:72');
    for (const times of [0, 101]) noProgress('times' + times, () => {}, '研究次数最少一次，最多也不能超过一百次。\n', 'cmds/skill/research.c:47', { times });
    for (const l of [179, 0]) { const a = actor(l); add('level' + l, a, { completed: 0, random: false, command_accepted: false, timestamp: 'unchanged', notice_kind: 'notify_fail',
        notice: l ? '你对九阳神功的掌握程度还未到研究的程度。\n' : '这项技能你还不会，研究什么？\n', source_location: 'cmds/skill/research.c:' + (l ? 59 : 53) }); }
    noProgress('busy1', a => { a.busy = 1; }, '你现在正忙着呢。\n', 'cmds/skill/research.c:29');
    noProgress('fighting', () => {}, '临阵磨枪？来不及啦。\n', 'cmds/skill/research.c:50', { fighting: true });
    noProgress('no-fight', () => {}, '这里太纷杂，你没法作研究。\n', 'cmds/skill/research.c:36', { room: { no_fight: 1 } });
    noProgress('pigging', () => {}, '你还是专心拱猪吧！\n', 'cmds/skill/research.c:26', { room: { pigging: 1 } });
    noProgress('no-learn-string', a => { a.properties['env/no_learn'] = skill; }, '你已设置禁止学习『九阳神功』。\n', 'cmds/skill/learn.c:201');
    noProgress('exp-minus1', a => { a.properties.combat_exp = 799999; }, '也许是缺乏实战经验，你感到难以继续研究九阳神功的问题了。\n', 'cmds/skill/research.c:169',
        { command_accepted: true, notice_kind: 'write' });
    noProgress('same-second-jing24', a => { a.properties.jing = 24; }, lowJing, 'cmds/skill/research.c:185',
        { command_accepted: true, timestamp: 'written', notice_kind: 'write', writeoff: 24, same_second: true });
    assert.equal(out.length, 25); assert.equal(new Set(out.map(c => c.id)).size, 25); assert.equal(out.filter(c => c.parameters.random_effects).length, 11); return out;
}
export function mingjiaoJiuyangResearchConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.equal(typeof readSource, 'function');
    const e = Object.fromEntries(mingjiaoJiuyangResearchSourcePaths.map(p => { const b = readSource(p); assert.ok((typeof b === 'string' || Buffer.isBuffer(b)) && b.length); return [p, hash(b)]; }));
    assert.equal(evidenceHash(e), mingjiaoJiuyangResearchReviewedSourceHash, 'research source changed: review required');
    for (const path of ['cmds/skill/research.c', 'cmds/skill/learn.c', 'feature/skill.c', 'kungfu/skill/jiuyang-shengong.c', 'kungfu/skill/liumai-shenjian.c', 'kungfu/skill/shenghuo-xinfa.c']) assert.ok(Object.hasOwn(e, path));
    const source = catalog.skills.find(s => s.path === `kungfu/skill/${skill}.c`); assert.equal(source?.sha256, e[`kungfu/skill/${skill}.c`]);
    return plans().map(c => ({ ...c, entry_id: source.path, status: 'prepared_not_sampled', samples: smoke ? 2 : c.parameters.formal_samples,
        parameters: { ...c.parameters, run_mode: smoke ? 'smoke' : 'formal', source_evidence: copy(e), reviewed_source_hash: mingjiaoJiuyangResearchReviewedSourceHash,
            research_source_entry: { path: 'cmds/skill/research.c', line: 13, function: 'main', sha256: e['cmds/skill/research.c'] },
            qualification_evidence: mingjiaoJiuyangResearchSourcePaths.map(path => ({ path, sha256: e[path] })) } }));
}
export function validateMingjiaoJiuyangResearchCondition(c) {
    assert.ok(c && typeof c === 'object' && !Array.isArray(c));
    assert.deepEqual(Object.keys(c).sort(), ['entry_id', 'id', 'method', 'parameters', 'samples', 'stage', 'status']);
    const plan = plans().find(v => v.id === c.id); assert.ok(plan, 'unreviewed research condition');
    assert.equal(c.stage, 'school'); assert.equal(c.method, 'research'); assert.equal(c.status, 'prepared_not_sampled');
    assert.equal(c.entry_id, `kungfu/skill/${skill}.c`);
    const { run_mode, source_evidence, reviewed_source_hash, research_source_entry, qualification_evidence, ...p } = c.parameters;
    assert.ok(['formal', 'smoke'].includes(run_mode), 'research run mode required');
    assert.equal(c.samples, run_mode === 'smoke' ? 2 : plan.parameters.formal_samples, 'research samples must match run mode');
    assert.deepEqual(p, plan.parameters, 'research fixed parameters drifted'); assert.deepEqual(Object.keys(source_evidence), [...mingjiaoJiuyangResearchSourcePaths]);
    for (const h of Object.values(source_evidence)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(evidenceHash(source_evidence), mingjiaoJiuyangResearchReviewedSourceHash); assert.equal(reviewed_source_hash, mingjiaoJiuyangResearchReviewedSourceHash);
    assert.deepEqual(research_source_entry, { path: 'cmds/skill/research.c', line: 13, function: 'main', sha256: source_evidence['cmds/skill/research.c'] });
    assert.deepEqual(qualification_evidence, mingjiaoJiuyangResearchSourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    return c.parameters;
}
