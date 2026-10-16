import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mingjiaoJiuyangLearningConditions as conditions, mingjiaoJiuyangLearningSourcePaths as sources,
    mingjiaoJiuyangLearningReviewedSourceHash as reviewed, validateMingjiaoJiuyangLearningCondition as condition,
    validateMingjiaoJiuyangLearningRecord as record, mingjiaoJiuyangLearningEffects as effects } from './school_mingjiao_jiuyang_learning_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url)), read = p => readFileSync(root + p);
const hash = x => createHash('sha256').update(x).digest('hex'), copy = x => structuredClone(x);
const object = '/kungfu/skill/jiuyang-shengong', skill = 'jiuyang-shengong', flag = 'can_learn/jiuyang-shengong/enable_weapon';
const catalog = { skills: [{ id: skill, sha256: hash(read('kungfu/skill/jiuyang-shengong.c')),
    entries: [['valid_learn', 207], ['difficult_level', 341], ['practice_skill', 337]]
        .map(([fn, line]) => ({ id: `kungfu/skill/jiuyang-shengong.c:${line}:${fn}` })) }] };
const cases = conditions(catalog, read), pick = v => { const c = cases.find(c => c.parameters.variant === v); assert.ok(c); return c; };
const refusal = {
    'sex-eunuch': '你无根无性，阴阳不调，难以领会高深的九阳神功。\n',
    'character-cunning': '九阳神功正大恢弘，气度俨然，你怎么也学不得神似。\n',
    'character-sinister': '九阳神功正大恢弘，气度俨然，你怎么也学不得神似。\n',
    int33: '你觉得九阳神功过于艰深，难以理解。\n',
    con37: '你的先天根骨孱弱，无法运转九阳神功。\n',
    max_neili3499: '你的内力修为太浅，无法运转九阳神功。\n',
    cognize99: '你觉得九阳神功过于深奥，以自己的武学修养全然无法明白。\n',
    force199: '你的基本内功修为不足，难以运转九阳神功。\n',
    'relative-force399': '你对基本内功的理解还不够，无法继续领会更高深的九阳神功。\n',
    'relative-unarmed399': '你对基本拳脚的理解还不够，无法继续领会更高深的九阳神功。\n',
    'flag1-neither': '你对刀剑功夫的理解还不够，无法继续领会更高深的九阳神功。\n',
    'raw-int-effective-high': '你觉得九阳神功过于艰深，难以理解。\n',
    'raw-con-effective-high': '你的先天根骨孱弱，无法运转九阳神功。\n',
};
function state(cfg, side) {
    const s = { object: `/tests/actor#${100 + side}`, id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1,
        living: 1, wizardp: 0, ghost: 0, busy: null, fighting_opponent: 0, conditions: null,
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations), learned: {},
        cultivation: Object.fromEntries(['improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai'].map(k => [k, null])),
        temp: { user_setup: 1, apply: { armor: 100, ...(cfg.temp?.['apply/con'] ? { con: cfg.temp['apply/con'] } : {}) } },
        craze: 0, max_craze: cfg.properties.character === '光明磊落' ? 5000 : cfg.properties.character === '心狠手辣' ? 4000 : 0,
        weapon: 'none', weapon_details: {}, weapon_damage: 0, weapon_flag: 0,
        handing: 'none', handing_details: {} };
    for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
        if (k.includes('/') || ['reborn', 'character', 'class', 'doing'].includes(k)) s.cultivation[k] = v;
        else s[k] = v;
    }
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2) + (cfg.mappings[k] === skill ? cfg.skills[skill] : 0)]));
    s.effective_int = s.int + Math.trunc((cfg.skills.literate ?? 0) / 10);
    s.effective_con = s.con + Math.trunc(cfg.skills.force / 10) + (s.temp.apply.con ?? 0);
    s.effective_str = s.str + Math.trunc(cfg.skills.unarmed / 10); s.effective_dex = s.dex + Math.trunc(cfg.skills.dodge / 10);
    return s;
}
// Clearly synthetic unit records, not native evidence. Expected branches are independently pinned.
export function syntheticJiuyangLearningTrace(c, index = 0) {
    const p = c.parameters, before = [state(p.actor, 0), state(p.target, 1)];
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index, elapsed: .02, outcome: p.expected, reason: '',
        before, immediate: copy(before), after: [], metrics: [{}, {}], interfaces: [], actions: [], attacks: [], directs: [],
        passives: [], defenses: [], dodge_checks: [], launches: [], refusals: [], callbacks: [], dropped: [], terminals: [], skill_messages: [] };
    if (c.method === 'practice') {
        raw.command_accepted = 0; const msg = '九阳神功只能用学(learn)的来增加熟练度。\n';
        raw.reason = '\x1b[256D\x1b[K' + msg;
        raw.immediate[0].temp.notify_fail = msg; raw.immediate[0].temp.time = { practice: 1790000000 };
    } else {
        raw.command_accepted = p.interface_repetitions; raw.interface_steps = []; let previous = before[0];
        for (let i = 0; i < p.interface_repetitions; i++) {
            let reason = refusal[p.variant] ?? '';
            if (i === 1 && ['repeat-ineligible', 'repeat-reborn'].includes(p.variant)) reason = refusal['flag1-neither'];
            const result = p.ability === 'difficult_level' ? (p.variant === 'difficulty-six201-reborn0' ? 1400 : 1000) : Number(!reason);
            const after = copy(previous), newFlag = p.ability === 'valid_learn' && result && !previous.cultivation[flag];
            if (newFlag) after.cultivation[flag] = 1;
            if (reason) after.temp.notify_fail = reason;
            raw.interfaces.push({ object, function: p.ability, result, implemented_by: object });
            raw.interface_steps.push({ command: 'test_interface', entry_actor: before[0].object, return_actor: before[0].object,
                before: copy(previous), after, result, implemented_by: object, reason,
                messages: newFlag ? [{ side: 0, type: 'write', text: '\x1b[1;32m你学会了利用九阳神功驾御兵器！\n' }] : [] });
            previous = after;
        }
        raw.skill_messages = raw.interface_steps.flatMap(s => copy(s.messages));
        raw.immediate[0] = copy(previous); raw.reason = p.expected === 'refused' ? raw.interface_steps.at(-1).reason : '';
    }
    raw.after = copy(raw.immediate); return raw;
}
const reject = (c, r, edit) => { const bad = copy(r); edit(bad); assert.throws(() => record(bad, c)); };

test('37 fixed conditions preserve32 gates4 original difficulty1 forbidden practice,74 records and82 commands', () => {
    assert.equal(cases.length, 37); assert.equal(new Set(cases.map(c => c.id)).size, 37);
    assert.deepEqual(Object.fromEntries(['valid_learn', 'difficult_level', 'practice_skill'].map(k => [k, cases.filter(c => c.parameters.ability === k).length])),
        { valid_learn: 32, difficult_level: 4, practice_skill: 1 });
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 74);
    assert.equal(cases.reduce((n, c) => n + c.samples * (c.parameters.interface_repetitions ?? 1), 0), 82);
    assert.deepEqual(conditions(catalog, read, { smoke: true }), cases); for (const c of cases) condition(c);
});
test('125 genuine source hashes and fixed original entries fail closed on drift or missing dependencies', () => {
    assert.equal(sources.length, 125); assert.ok(sources.includes('cmds/skill/practice.c')); assert.ok(sources.includes('kungfu/skill/liumai-shenjian.c'));
    assert.equal(hash(JSON.stringify(sources.map(p => [p, hash(read(p))]))), reviewed);
    assert.throws(() => conditions(catalog, p => p === 'kungfu/skill/liumai-shenjian.c' ? Buffer.from('drift') : read(p)));
    const wrong = copy(catalog); wrong.skills[0].entries[0].id = 'kungfu/skill/jiuyang-shengong.c:208:valid_learn';
    assert.throws(() => conditions(wrong, read));
    const c = copy(pick('repeat-ineligible')); c.parameters.source_entry.line = 208; assert.throws(() => condition(c));
    c.parameters.source_entry.line = 207; delete c.parameters.source_evidence['adm/daemons/combatd.c']; assert.throws(() => condition(c));
});
test('all complete synthetic normal records bind original USER, single/double gates and stable skills/resources', () => {
    for (const c of cases) assert.ok(record(syntheticJiuyangLearningTrace(c), c));
    const c = pick('repeat-ineligible'), r = syntheticJiuyangLearningTrace(c);
    assert.deepEqual(r.interfaces.map(e => e.result), [1, 0]); assert.equal(r.outcome, 'observed');
    assert.equal(r.before[0].cultivation[flag], 0); assert.equal(r.interface_steps[0].after.cultivation[flag], 1);
    assert.equal(r.interface_steps[1].after.cultivation[flag], 1);
    assert.deepEqual(record(r, c).interface_values, [1, 0]);
    assert.deepEqual(record(syntheticJiuyangLearningTrace(pick('repeat-sword')), pick('repeat-sword')).interface_values, [1, 1]);
    assert.deepEqual(record(syntheticJiuyangLearningTrace(pick('repeat-reborn')), pick('repeat-reborn')).interface_values, [1, 0]);
});
test('original USER character-specific craze limits cannot be replaced with the default lighthearted limit', () => {
    for (const [variant, max] of [['sex-male', 5000], ['character-ruthless', 4000], ['character-cunning', 0], ['character-sinister', 0]]) {
        const c = pick(variant), r = syntheticJiuyangLearningTrace(c);
        assert.equal(r.before[0].max_craze, max); assert.ok(record(r, c));
        for (const wrong of [null, -1, 6000, ...(max !== 5000 ? [5000] : [4000, 0])])
            reject(c, r, x => { x.before[0].max_craze = wrong; });
        reject(c, r, x => { delete x.before[0].max_craze; });
    }
});
test('missing observation fields, wrong step identity/result/reason/owner and forged first-call permission are rejected', () => {
    const c = pick('repeat-ineligible'), r = syntheticJiuyangLearningTrace(c);
    for (const k of ['before', 'immediate', 'after', 'metrics', 'interfaces', 'interface_steps', 'command_accepted', 'skill_messages']) reject(c, r, x => { delete x[k]; });
    for (const k of ['command', 'entry_actor', 'return_actor', 'before', 'after', 'result', 'reason', 'implemented_by', 'messages'])
        reject(c, r, x => { delete x.interface_steps[0][k]; });
    for (const edit of [x => { x.interface_steps.pop(); }, x => { x.interfaces.pop(); }, x => { x.command_accepted = true; },
        x => { x.interface_steps[1].before = copy(x.before[0]); }, x => { x.interface_steps[1].return_actor = x.before[1].object; },
        x => { x.interface_steps[0].after.cultivation[flag] = 0; }, x => { x.interface_steps[1].result = 1; },
        x => { x.interface_steps[1].reason = ''; }, x => { x.interface_steps[0].implemented_by = '/inherit/skill/skill'; },
        x => { x.interface_steps[0].messages = []; }, x => { x.interface_steps[0].messages.push(copy(x.interface_steps[0].messages[0])); }]) reject(c, r, edit);
});
test('false resource/skill growth, incidental target changes and hidden buffs fail even with matching final ledger', () => {
    const c = pick('sex-male'), r = syntheticJiuyangLearningTrace(c);
    for (const edit of [x => { x.metrics[0].jing_cost = 1; }, x => { x.interface_steps[0].after.skills[skill]++; },
        x => { x.interface_steps[0].after.learned[skill] = 1; }, x => { x.immediate[1].qi--; x.after[1].qi--; },
        x => { x.interface_steps[0].after.potential++; }, x => { x.before[0].temp.powerup = 1; },
        x => { x.before[0].userp = 0; }, x => { x.before[0].object = '/tests/teaching_actor#100'; },
        x => { delete x.before[0].cultivation.reborn; }, x => { x.before[0].cultivation.reborn = { int: 0 }; }]) reject(c, r, edit);
});
test('raw int/con gates are not substituted by effective attributes; sword OR blade and reborn branches are explicit', () => {
    for (const v of ['raw-int-effective-high', 'raw-con-effective-high']) {
        const c = pick(v), r = syntheticJiuyangLearningTrace(c); assert.equal(record(r, c).allowed, 0);
        assert.ok(r.before[0][v.includes('int') ? 'effective_int' : 'effective_con'] >= (v.includes('int') ? 34 : 38));
        reject(c, r, x => { x.interfaces[0].result = x.interface_steps[0].result = 1; });
    }
    for (const v of ['flag1-sword', 'flag1-blade', 'flag1-both']) assert.equal(record(syntheticJiuyangLearningTrace(pick(v)), pick(v)).allowed, 1);
    assert.equal(record(syntheticJiuyangLearningTrace(pick('raw0')), pick('raw0')).flag_set, 1);
    assert.equal(pick('raw0').parameters.actor.skills.force, 700);
});
test('difficulty calls are in ordinary USER context; forbidden original practice retains timestamp but no growth', () => {
    for (const v of ['difficulty-six200-reborn0', 'difficulty-six200-reborn1', 'difficulty-six201-reborn0', 'difficulty-six201-reborn1']) {
        const c = pick(v), r = syntheticJiuyangLearningTrace(c); const n = record(r, c).interface_values[0];
        assert.equal(n, v === 'difficulty-six201-reborn0' ? 1400 : 1000);
        reject(c, r, x => { x.interface_steps[0].result = n + 1; });
    }
    const c = pick('practice-forbidden'), r = syntheticJiuyangLearningTrace(c); assert.equal(record(r, c).practice_completed, 0);
    for (const edit of [x => { delete x.immediate[0].temp.time; }, x => { x.immediate[0].temp.time.practice = null; },
        x => { x.command_accepted = 1; }, x => { x.metrics[0].jing_cost = 5; },
        x => { x.reason = '你只能练习用 enable 指定的特殊技能。\n'; }, x => { x.immediate[0].learned_points = 1; }]) reject(c, r, edit);
});
test('strict index/elapsed/diagnostic reasons remain unknown, never synthetic normal success', () => {
    const c = pick('sex-male'), r = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: 0, outcome: 'error', reason: 'native failed' };
    assert.equal(record(r, c), null);
    for (const index of [null, -1, 2, .5, '0']) reject(c, r, x => { x.index = index; });
    for (const elapsed of [null, -1, NaN, Infinity, '0']) reject(c, r, x => { x.elapsed = elapsed; });
    for (const reason of [null, '', '   ']) reject(c, r, x => { x.reason = reason; });
    for (const k of ['kind', 'condition_id', 'method', 'index', 'elapsed', 'reason']) reject(c, r, x => { delete x[k]; });
    const summary = effects([{ raw: r }], c); assert.equal(summary.unknown, 1); assert.equal(summary.allowed, null);
    assert.equal(summary.commands, null); assert.deepEqual(summary.interface_values, {});
});
test('original notify_fail CSI pair is display-only; unrelated controls and forged messages remain rejected', () => {
    const c = pick('sex-eunuch'), r = syntheticJiuyangLearningTrace(c);
    r.interface_steps[0].reason = '\x1b[256D\x1b[K' + r.interface_steps[0].reason;
    r.reason = r.interface_steps[0].reason; assert.equal(record(r, c).refused, 1);
    reject(c, r, x => { x.interface_steps[0].reason = '\x1b[3C' + refusal['sex-eunuch']; });
    reject(c, r, x => { x.interface_steps[0].reason = '\x1b[256K' + refusal['sex-eunuch']; });
    const p = pick('practice-forbidden'), pr = syntheticJiuyangLearningTrace(p); assert.ok(record(pr, p));
    reject(p, pr, x => { x.skill_messages = [{ side: 0, type: 'write', text: '练习成功。\n' }]; });
});
test('repeated original calls and first permission mutation have separate exact denominators', () => {
    const c = pick('repeat-ineligible'), rows = [0, 1].map(i => ({ raw: syntheticJiuyangLearningTrace(c, i) })), e = effects(rows, c);
    assert.equal(e.commands, 4); assert.equal(e.commands_accepted, 4); assert.equal(e.interface_calls, 4);
    assert.equal(e.allowed, 2); assert.equal(e.refused, 2); assert.equal(e.flag_set, 2);
    assert.deepEqual(e.interface_values, { 0: 2, 1: 2 }); assert.equal(e.net_learned, 0); assert.equal(e.neili_cost, 0);
    const unknown = { kind: 'sample', condition_id: c.id, method: c.method, index: 1, elapsed: .01, outcome: 'not_applicable', reason: 'fixture unavailable' };
    const mixed = effects([rows[0], { raw: unknown }], c); assert.equal(mixed.validated, 1); assert.equal(mixed.unknown, 1);
    assert.equal(mixed.allowed, null); assert.deepEqual(mixed.interface_values, { 0: 1, 1: 1 });
});
