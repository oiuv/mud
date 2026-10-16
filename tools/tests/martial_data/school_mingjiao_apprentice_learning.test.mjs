// Pure synthetic protocol checks. These are not driver samples or gameplay evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mingjiaoApprenticeLearningConditions as conditions,
    mingjiaoApprenticeLearningSourcePaths as sources,
    validateMingjiaoApprenticeLearningRecord as validate,
    mingjiaoApprenticeLearningEffects as effects,
    mingjiaoApprenticeLearningProgress as progress } from './school_mingjiao_apprentice_learning_cases.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = p => fs.readFileSync(path.join(root, p));
const sha = v => createHash('sha256').update(v).digest('hex');
const catalog = { skills: [{ id: 'shenghuo-ling', sha256: sha(read('kungfu/skill/shenghuo-ling.c')) }] };
const all = conditions(catalog, read), get = suffix => all.find(c => c.id.endsWith('-' + suffix));
const copy = v => structuredClone(v), teacherId = '/kungfu/class/mingjiao/zhangwuji#3';
const skill = 'shenghuo-ling', student = '/tests/teaching_actor#1';
function point(s) {
    const q = s.q;
    return { contribution: q.gongxian, jing: q.jing, neili: q.neili, max_neili: q.max_neili,
        max_jingli: q.max_jingli, potential: q.potential, learned_points: q.learned_points,
        combat_exp: q.combat_exp, shen: q.shen, weiwang: q.weiwang,
        str: q.str, int: q.int, dex: q.dex, con: q.con, character: q.character,
        effective_str: q.str + Math.trunc(s.skills.unarmed / 10), effective_int: q.int,
        effective_dex: q.dex + Math.trunc(s.skills.dodge / 10),
        effective_force: Math.trunc(s.skills.force / 2), effective_dodge: Math.trunc(s.skills.dodge / 2),
        skills: copy(s.skills), learned: copy(s.learned), mappings: {}, grants: copy(s.grants), reborn_family: 0,
        family: q.family?.family_name ?? 0, master_id: q.family?.master_id ?? 0, master_name: q.family?.master_name ?? 0,
        qualification: Object.fromEntries(['env/no_learn', 'env/auto_regenerate', 'special_skill/wuxing',
            'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex'].map(k => [k, 0])),
        recruitment: { family: copy(q.family ?? {}), family_present: Number(!!q.family), name: q.name,
            class: q.class, title: q.title,
            history: Object.fromEntries(['detach/明教', 'betrayer/明教', 'betrayer/times'].map(k => [k, q[k]])),
            quest: copy(q.quest ?? 0), temp_quest: copy(s.quest), pending_apprentice: s.pending,
            pending_betrayer: s.betrayer } };
}
function snapshot(s, p) {
    const v = point(s), q = s.q;
    return { object: student, id: 'left', userp: 1, playerp: 1, interactive: 1, living: 1,
        wizardp: 0, ghost: 0, busy: p.actor.busy ?? 0,
        ...Object.fromEntries(['jing', 'neili', 'max_neili', 'potential', 'learned_points',
            'str', 'int', 'dex', 'con', 'combat_exp', 'effective_str', 'effective_int', 'effective_dex'].map(k => [k, v[k]])),
        ...Object.fromEntries(['qi', 'eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'jingli', 'max_jingli'].map(k => [k, q[k]])),
        skills: copy(s.skills), effective_skills: Object.fromEntries(Object.entries(s.skills).map(([id, level]) => [id, Math.trunc(level / 2)])),
        learned: copy(s.learned), mappings: {}, preparations: {},
        weapon: 'none', handing: 'none', secondary_weapon: 'none', weapon_details: {}, handing_details: {},
        secondary_weapon_details: {}, weapon_damage: 0, weapon_flag: 0,
        temp: { apply: { armor: 100 } }, cultivation: { class: q.class, 'family/family_name': q.family?.family_name ?? 0 } };
}
const refusal = {
    'apprentice-detach': '我们明教教规你还记得吗，你还有脸回来！',
    'apprentice-betrayer': '我们明教教规你还记得吗，你还有脸回来！',
    'apprentice-betrayer-times': '哼，阁下不忠不信，我们明教可不会收留。',
    'apprentice-foreign-confirm': '阁下既有了师承，还来我们明教做什么？',
    'apprentice-shen89999': '你行侠仗义的事做得还不够，还是请回吧。',
    'apprentice-cancel': '你行侠仗义的事做得还不够，还是请回吧。',
    'apprentice-xinfa179': '你圣火心法不够娴熟，还是下去多练习一下吧！',
    'apprentice-force179': '你基本内功火候不够，怎么学我明教的圣火神功！',
    'apprentice-exp799999': '你江湖经验还不够，下去多磨练一下吧！',
};
function fixture(c) {
    const p = c.parameters;
    const s = { q: copy(p.actor.properties), skills: copy(p.actor.skills), learned: {},
        grants: Object.fromEntries(p.monitored_grants.map(k => [k, 0])), quest: copy(p.actor.temp.quest), pending: '', betrayer: '' };
    const before = snapshot(s, p), steps = []; let jingCost = 0;
    for (const [index, command] of p.teaching_expectations.entries()) {
        const b = point(s); let accepted = 7, text = '';
        if (command.command_kind === 'apprentice') {
            if (p.actor.busy) accepted = 0;
            else if (command.action === 'apprentice cancel') { s.pending = ''; text = '你改变主意不想拜张无忌为师了。'; }
            else if (s.q.family?.master_id === 'zhang wuji') text = '师父！';
            else if (s.q.family?.family_name === '武当派' && !index) {
                s.betrayer = teacherId; text = '如果你下了决心，就再输入一次这条命令。';
            } else if (refusal[p.variant]) { s.pending = teacherId; text = refusal[p.variant]; }
            else {
                if (!s.q.family) { s.q.gongxian = 0; delete s.q.quest; s.quest = 0; }
                s.q.family = { master_id: 'zhang wuji', master_name: '张无忌', family_name: '明教',
                    generation: 37, enter_time: 1791910000, title: '传人', privs: 0 };
                s.q.class = 'fighter'; s.q.title = '明教第三十七代传人'; s.pending = '';
                text = '恭喜您成为明教的第三十七代弟子。';
            }
        } else if (p.variant === 'learn-other-master') accepted = 0;
        else if (p.variant === 'learn-cap200') text = '我就不再教你，你自己多研究吧。';
        else if (p.variant === 'learn-no-potential') accepted = 0;
        else {
            const level = s.skills[skill] ?? 0, fee = Math.trunc((100 + 2 * level) / 40) * (level ? 1 : 2);
            const count = Math.min(command.times, Math.trunc(s.q.jing / fee));
            jingCost += fee * count; s.q.jing -= fee * count; s.q.learned_points += count;
            let nextLevel = level, learned = 0;
            for (let n = 0; n < count; n++) {
                const gain = 1 + Math.trunc(400 / (nextLevel + 100)); learned += gain;
                if (learned > (nextLevel + 1) ** 2) { nextLevel++; learned = 0; }
            }
            s.skills[skill] = nextLevel; s.learned[skill] = learned;
            if (count < command.times) text = '但是你今天太累了，学习了二次以后只好先停下来。\n';
        }
        const hasTeacher = !!command.teacher_key;
        steps.push({ student, teacher: hasTeacher ? teacherId : 'none', resolved_teacher: hasTeacher ? teacherId : 'none',
            teacher_program: hasTeacher ? '/kungfu/class/mingjiao/zhangwuji' : 'none',
            teacher_skills: hasTeacher ? copy(p.teacher_levels) : {},
            ...(command.command_kind === 'apprentice' ? { teacher_family: hasTeacher ? { family_name: '明教', generation: 36 } : {} } : {}),
            teacher_pending_recruit_before: '', teacher_pending_recruit: '', command: command.action,
            command_accepted: accepted, elapsed: 0.001, wall_time: 1791910000,
            before: b, after: point(s), message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: text ? [{ category: 'vision', text }] : [] });
    }
    const autonomy = heartbeat => ({ heartbeat, blueprint: '/kungfu/class/mingjiao/zhangwuji', blueprint_heartbeat: 0, callbacks: [] });
    return { kind: 'sample', condition_id: c.id, index: 0, method: 'teaching', outcome: p.expected,
        before: [before, { object: '/tests/teaching_actor#2' }], after: [snapshot(s, p), { object: '/tests/teaching_actor#2' }],
        teaching: steps, skill_load_context: { actor: student, already_loaded: 0, skills: copy(p.actor.skills),
            command: 'test_interface', function: 'valid_enable', argument: 'sword', result: 1 },
        teacher_preparations: [{ key: 'zhangwuji', command: 'test_interface', entry_actor: student,
            return_actor: student, initializer_actor: 'not_observed', teacher_program: '/kungfu/class/mingjiao/zhangwuji',
            teacher: teacherId, teacher_state: { object: teacherId, id: 'zhang wuji', living: 1, playerp: 0, skills: copy(p.teacher_levels) },
            before: copy(before), after: copy(before), autonomy_before: autonomy(1), autonomy_after: autonomy(0) }],
        teacher_cleanups: [{ object: teacherId, pending: 0, object_exists: 0 }], metrics: [jingCost ? { jing_cost: jingCost } : {}, {}],
        launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [] };
}
const bad = (c, edit) => { const raw = fixture(c); edit(raw); assert.throws(() => validate(raw, c)); };
test('19 finite original conditions, 430 formal and 38 smoke; source and experimental scope frozen', () => {
    assert.equal(all.length, 19); assert.equal(all.reduce((n, c) => n + c.samples, 0), 430);
    assert.equal(all.filter(c => c.parameters.random_observation).length, 4);
    assert.equal(conditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 38);
    assert.equal(sources.length, 65); assert.equal(new Set(all.map(c => c.id)).size, 19);
    assert.ok(all.every(c => c.parameters.actor.properties.family?.master_id !== 'zhang wuji'));
    assert.ok(all.every(c => c.parameters.monitored_grants.every(k => c.parameters.actor.properties[k] === 0)));
    assert.throws(() => conditions(catalog, p => p === 'cmds/skill/recruit.c' ? Buffer.concat([read(p), Buffer.from('\n')]) : read(p)));
});
test('all 19 synthetic traces validate; not gameplay execution', () => {
    for (const c of all) validate(fixture(c), c);
});
test('true first join clears old contribution and both quests; same-family recruitment preserves them', () => {
    const first = get('apprentice-new-repeat'), peer = get('apprentice-peer-repeat');
    assert.equal(validate(fixture(first), first).filter(s => s.recruited).length, 1);
    bad(first, r => { r.teaching[0].after.contribution = 4321; });
    bad(first, r => { r.teaching[0].after.recruitment.quest = { name: '实验旧任务', count: 7 }; });
    bad(first, r => { r.teaching[0].after.recruitment.temp_quest = { name: '实验临时任务', count: 3 }; });
    bad(peer, r => { r.teaching[0].after.contribution = 0; });
    bad(peer, r => { r.teaching[0].after.recruitment.class = 'bonze'; });
});
test('foreign confirmation is not apprenticeship; repeated greeting/cancel are not new recruitments', () => {
    const foreign = get('apprentice-foreign-confirm');
    assert.deepEqual(validate(fixture(foreign), foreign).map(s => s.result), ['betrayer-confirmation', 'refused']);
    bad(foreign, r => { r.teaching[0].after.recruitment.pending_apprentice = teacherId; });
    bad(foreign, r => { r.teaching[1].after.recruitment.history['betrayer/times'] = 1; });
    bad(get('apprentice-cancel'), r => { r.teaching[1].after.recruitment.pending_apprentice = teacherId; });
    bad(get('apprentice-peer-repeat'), r => { r.teaching[1].after.contribution--; });
});
test('original raw thresholds and pending effects never manufacture player skills or grants', () => {
    for (const suffix of ['shen89999', 'xinfa179', 'force179', 'exp799999', 'detach', 'betrayer', 'betrayer-times']) {
        const c = get('apprentice-' + suffix);
        bad(c, r => { r.teaching[0].after.recruitment.pending_apprentice = ''; });
        bad(c, r => { r.teaching[0].after.grants['can_perform/shenghuo-ling/can'] = 1; });
    }
    bad(get('apprentice-busy'), r => { r.teaching[0].command_accepted = 1; });
});
test('ordinary zero skill upgrades once and resets; existing levels progress with exact integer support', () => {
    assert.ok(progress(0, 0, 1).every(s => s.level === 1 && s.learned === 0 && s.upgrades === 1));
    assert.deepEqual([...new Set(progress(199, 0, 1).map(s => s.learned))].sort((a, b) => a - b), Array.from({ length: 14 }, (_, i) => i + 2));
    bad(get('learn-0'), r => { r.teaching[1].after.skills[skill] = 2; });
    bad(get('learn-0'), r => { delete r.after[0].effective_skills[skill]; });
    bad(get('learn-0'), r => { r.after[0].effective_skills[skill] = 1; });
    bad(get('learn-179'), r => { r.after[0].effective_skills.force = 999; });
    bad(get('learn-179'), r => { r.teaching[1].after.learned[skill] = 99; });
    bad(get('learn-199'), r => { r.teaching[1].after.learned_points = 2; });
});
test('partial three-iteration original command returns accepted but completes two at 24 jing', () => {
    const c = get('learn-partial3'), s = validate(fixture(c), c).at(-1);
    assert.equal(s.completed, 2); assert.equal(s.jing_cost, 24); assert.equal(s.jing_writeoff, 0);
    bad(c, r => { r.teaching[1].command_accepted = 0; });
    bad(c, r => { r.metrics[0].jing_cost = 36; });
    bad(c, r => { r.teaching[1].after.jing = 1; });
    bad(c, r => { r.teaching[1].after.learned[skill] = 99; });
    bad(c, r => { r.teaching[1].messages.at(-1).text = '学习了两次以后只好先停下来。'; });
    bad(c, r => { r.teaching[1].messages.at(-1).text = '但是你今天太累了，学习了三次以后只好先停下来。\n'; });
    bad(c, r => { r.teaching[1].messages.pop(); });
});
test('learning cap/potential refuse tested ability despite setup apprenticeship; foreign master is not recognized', () => {
    for (const suffix of ['learn-cap200', 'learn-no-potential', 'learn-other-master']) {
        const c = get(suffix); assert.equal(c.parameters.expected, 'refused'); validate(fixture(c), c);
        bad(c, r => { r.outcome = 'observed'; });
        bad(c, r => { r.metrics[0].jing_cost = 1; });
    }
    assert.equal(validate(fixture(get('learn-cap200')), get('learn-cap200')).at(-1).accepted, 1);
    assert.equal(validate(fixture(get('learn-no-potential')), get('learn-no-potential')).at(-1).accepted, 0);
});
test('no unobserved cold-load owner, altered teacher, ghost, missing key or between-step refill', () => {
    const c = get('learn-199');
    bad(c, r => { r.skill_load_context.actor = '/tests/actor#2'; });
    bad(c, r => { r.skill_load_context.command = 'enable sword shenghuo-ling'; });
    bad(c, r => { r.teacher_preparations[0].teacher_state.skills[skill] = 800; });
    bad(c, r => { r.before[0].wizardp = 1; });
    bad(c, r => { r.before[0].object = '/tests/actor#1'; });
    bad(c, r => { delete r.teaching[1].teacher_pending_recruit_before; });
    bad(c, r => { delete r.teaching[1].before.qualification['env/auto_regenerate']; });
    bad(c, r => { r.teaching[1].before.jing++; });
    bad(c, r => { r.after[1].qi = 1; });
    bad(c, r => { r.after[0].cultivation.class = 'bonze'; });
    bad(c, r => { r.after[0].cultivation['special_skill/wuxing'] = 1; });
    bad(c, r => { r.terminals.push({ side: 0, state: 'unconscious' }); });
});
test('sample indices require a real integer within the unchanged condition range', () => {
    const c = get('learn-199');
    for (const index of [null, -1, c.samples]) bad(c, r => { r.index = index; });
});
test('unknown/errors remain separate from tested commands and cannot contribute invented zero costs', () => {
    const c = get('learn-199'), raw = fixture(c);
    const good = { condition_id: c.id, outcome: raw.outcome, raw };
    const error = { ...good, outcome: 'error', raw: { kind: 'sample', condition_id: c.id,
        method: c.method, index: 0, outcome: 'error' } };
    assert.deepEqual(validate(error.raw, c), []);
    assert.deepEqual(validate({ ...error.raw, outcome: 'not_applicable' }, c), []);
    assert.throws(() => validate({ ...error.raw, condition_id: 'wrong condition' }, c));
    const e = effects([good, error], c); assert.equal(e.samples, 2); assert.equal(e.validated, 1); assert.equal(e.unknown, 1);
    assert.equal(e.setup_apprenticeships, 1); assert.equal(e.tested_commands, 1); assert.equal(e.learned_iterations, 1);
    assert.equal(effects([], c).learned_net.mean, null); assert.equal(effects([error], c).gross_learned.mean, null);
    assert.equal(effects([error], c).jing_cost, null);
    assert.throws(() => effects([{ ...good, raw: { ...raw, method: 'interface' } }], c));
    bad(c, r => { delete r.metrics; });
    const changed = copy(c); changed.parameters.actor.properties.shen = 1; assert.throws(() => validate(raw, changed));
});
