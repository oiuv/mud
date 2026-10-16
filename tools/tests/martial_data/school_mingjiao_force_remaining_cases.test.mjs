// Pure preparation checks only. No synthetic native records, runner registration or driver.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { mingjiaoForceRemainingConditions, validateMingjiaoForceRemainingCondition,
    mingjiaoForceRemainingSourcePaths, mingjiaoForceRemainingReviewedSourceHash,
    mingjiaoForceRemainingAbsentPaths } from './school_mingjiao_force_remaining_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const copy = value => structuredClone(value), sha = value => createHash('sha256').update(value).digest('hex');
const catalog = collectCatalog(root, buildInventory(root));
const formal = mingjiaoForceRemainingConditions(catalog, read);
const smoke = mingjiaoForceRemainingConditions(catalog, read, { smoke: true });
const total = values => values.reduce((n, c) => n + c.samples, 0);
const select = panel => formal.filter(c => c.parameters.panel === panel);
const bad = (c, edit) => { const v = copy(c); edit(v); assert.throws(() => validateMingjiaoForceRemainingCondition(v)); };

test('112有限新ID/2772正式/215烟雾；只有9项长解除smoke1，原条件顺序和计划固定', () => {
    assert.equal(formal.length, 112); assert.equal(total(formal), 2772); assert.equal(total(smoke), 215);
    assert.equal(sha(JSON.stringify(formal)), '113961f73add1e06ddfb813c4bc907817e577b5c563c79cd1afa1f5cd0cbfbaf');
    assert.equal(sha(JSON.stringify(smoke)), '154cdb0cee6af8cb862cc82aba977b5872e6a96df4b35efa6fe81869abde8db3');
    assert.equal(new Set(formal.map(c => c.id)).size, 112);
    assert.deepEqual(Object.fromEntries(['research', 'exercise', 'inherited-hit', 'capacity', 'expiry',
        'healing', 'dispel', 'repeat', 'recovery'].map(p => [p, select(p).length])),
    { research: 11, exercise: 26, 'inherited-hit': 6, capacity: 7, expiry: 9, healing: 24, dispel: 16, repeat: 4, recovery: 9 });
    assert.equal(formal.filter(c => c.samples === 100).length, 26);
    assert.equal(smoke.filter(c => c.samples === 1).length, 9);
    for (const [i, c] of formal.entries()) {
        assert.match(c.id, /^school-mingjiao-force-remaining-/);
        assert.equal(c.parameters.collection_group, 'mingjiao-force-remaining');
        assert.equal(c.status, 'prepared_not_sampled'); assert.equal(c.parameters.producer_status, 'unregistered_preparation');
        validateMingjiaoForceRemainingCondition(c); validateMingjiaoForceRemainingCondition(smoke[i]);
        const f = copy(c), s = copy(smoke[i]); delete f.samples; delete s.samples;
        delete f.parameters.run_mode; delete s.parameters.run_mode; assert.deepEqual(s, f);
        assert.equal(smoke[i].samples, c.parameters.panel === 'expiry' ? 1 : 2);
    }
});

test('74实际来源闭包含公共force/POISON/USER/原命令与真实condition，不只最初14源', () => {
    const evidence = formal[0].parameters.source_evidence;
    assert.equal(mingjiaoForceRemainingSourcePaths.length, 74);
    assert.equal(new Set(mingjiaoForceRemainingSourcePaths).size, 74);
    for (const p of ['inherit/skill/force.c', 'inherit/condition/poison.c', 'clone/user/user.c', 'inherit/char/char.c',
        'cmds/skill/exercise.c', 'cmds/skill/research.c', 'cmds/skill/exert.c', 'cmds/skill/learn.c', 'cmds/std/halt.c',
        'kungfu/condition/freezing.c', 'kungfu/condition/bandaged.c', 'feature/condition.c',
        'kungfu/skill/force/heal.c', 'kungfu/skill/force/inspire.c', 'adm/daemons/combatd.c'])
        assert.ok(mingjiaoForceRemainingSourcePaths.includes(p), p);
    for (const p of mingjiaoForceRemainingSourcePaths) assert.equal(evidence[p], sha(read(p)));
    assert.equal(sha(JSON.stringify(mingjiaoForceRemainingSourcePaths.map(p => [p, evidence[p]]))), mingjiaoForceRemainingReviewedSourceHash);
    assert.equal(mingjiaoForceRemainingAbsentPaths.length, 28);
    assert.ok(formal.every(c => c.parameters.qualification_note.includes('原2746记录与54份')));
});

test('精确source pins拒缺源/单字节漂移/自重签，原缺席回退不能偷偷出现或吞权限错误', () => {
    for (const p of mingjiaoForceRemainingSourcePaths) {
        assert.throws(() => mingjiaoForceRemainingConditions(catalog, q => q === p ? null : read(q)), undefined, 'missing source: ' + p);
        assert.throws(() => mingjiaoForceRemainingConditions(catalog, q => q === p ? Buffer.concat([read(q), Buffer.from('\n')]) : read(q)), undefined, 'drifted source: ' + p);
    }
    for (const path of mingjiaoForceRemainingAbsentPaths)
        assert.throws(() => mingjiaoForceRemainingConditions(catalog, p => p === path ? '' : read(p)), /native fallback appeared/);
    assert.throws(() => mingjiaoForceRemainingConditions(catalog, p => {
        if (p === mingjiaoForceRemainingAbsentPaths[0]) throw Object.assign(new Error('denied'), { code: 'EACCES' });
        return read(p);
    }), /denied/);
    bad(formal[0], c => {
        const p = mingjiaoForceRemainingSourcePaths[0]; c.parameters.source_evidence[p] = 'a'.repeat(64);
        c.parameters.reviewed_source_hash = sha(JSON.stringify(mingjiaoForceRemainingSourcePaths.map(p => [p, c.parameters.source_evidence[p]])));
        c.parameters.qualification_evidence = mingjiaoForceRemainingSourcePaths.map(p => ({ path: p, sha256: c.parameters.source_evidence[p] }));
    });
});

test('真实catalog角色/owner/line/hash严格绑定；命令与继承parent不是伪造catalog入口', () => {
    for (const [id, edit] of [
        ['force/heal', s => { s.entries.find(e => e.function === 'exert').role = 'other_function'; }],
        ['shenghuo-xinfa/powerup', s => { s.entries.find(e => e.function === 'remove_effect').role = 'callback'; }],
        ['force/dispel', s => { s.entries[0].function = 'other'; }],
        ['shenghuo-shengong/shield', s => { s.entries[0].evidence.line++; }],
        ['force/inspire', s => { s.entries[0].evidence.path = 'wrong.c'; }],
        ['force/recover', s => { s.entries[0].evidence.sha256 = '0'.repeat(64); }],
        ['shenghuo-shengong', s => { s.sha256 = '0'.repeat(64); }],
        ['shenghuo-xinfa', s => { s.id = 'other'; }],
    ]) { const changed = copy(catalog); edit(changed.skills.find(s => s.id === id)); assert.throws(() => mingjiaoForceRemainingConditions(changed, read)); }
    for (const id of ['force/heal', 'shenghuo-xinfa']) {
        const missing = copy(catalog); missing.skills = missing.skills.filter(s => s.id !== id);
        assert.throws(() => mingjiaoForceRemainingConditions(missing, read));
        const duplicate = copy(catalog); duplicate.skills.push(copy(duplicate.skills.find(s => s.id === id)));
        assert.throws(() => mingjiaoForceRemainingConditions(duplicate, read));
    }
    const research = select('research')[0].parameters.source_entries[0];
    assert.deepEqual([research.path, research.line, research.function, research.role, research.catalog],
        ['cmds/skill/research.c', 13, 'main', 'command', false]);
    const parent = select('inherited-hit')[0].parameters.source_entries[0];
    assert.deepEqual([parent.path, parent.line, parent.function, parent.catalog], ['inherit/skill/force.c', 15, 'hit_ob', false]);
    bad(formal[0], c => { c.parameters.source_entries[0].catalog = true; });
    bad(formal[0], c => { c.parameters.source_entries[0].line++; });
});

test('显式模式/样本绑定拒100改2或长窗2改1；合法smoke不冒formal，未来须绑定原manifest', () => {
    const random = formal.find(c => c.samples === 100), long = select('expiry')[0];
    for (const c of [random, long]) {
        bad(c, v => { delete v.parameters.run_mode; });
        bad(c, v => { v.samples = v.parameters.smoke_samples; });
        bad(c, v => { v.parameters.run_mode = 'smoke'; });
    }
    for (const edit of [v => { v.parameters.run_mode = 'invalid'; }, v => { v.samples = 0; },
        v => { v.parameters.formal_samples = v.samples = 2; }, v => { v.parameters.smoke_samples = 1; },
        v => { v.id += '-extra'; }, v => { v.entry_id += ':fake'; }, v => { v.method = 'interface'; },
        v => { v.status = 'complete'; }, v => { v.parameters.actor.properties.int++; },
        v => { v.parameters.expected = 'success'; }, v => { v.parameters.extra = true; }, v => { v.extra = true; }]) bad(random, edit);
    const validSmoke = copy(random); validSmoke.samples = 2; validSmoke.parameters.run_mode = 'smoke';
    validateMingjiaoForceRemainingCondition(validSmoke); // Caller must still compare the original manifest mode.
    for (const options of [{ smoke: null }, { smoke: 1 }, { smoke: 'true' }, { samples: 2 }, { extra: true }])
        assert.throws(() => mingjiaoForceRemainingConditions(catalog, read, options));
});

test('研究11窗口保持27精神原费用、partial54/3次和真实时钟/原learned待观察', () => {
    const rows = select('research'); assert.equal(total(rows), 610);
    assert.deepEqual(rows.slice(0, 4).map(c => c.parameters.actor.skills['shenghuo-xinfa']), [180, 200, 400, 800]);
    const partial = rows.find(c => c.parameters.variant === 'jing54-times3').parameters;
    assert.equal(partial.actor.properties.jing, 54); assert.equal(partial.repetitions, 3); assert.equal(partial.completed, 2);
    assert.ok(rows.every(c => c.parameters.research_scope.source_jing_fee_per_completed === 27));
    assert.ok(rows.every(c => c.parameters.research_scope.actual_begin_end_time === 'observe_original_clock'));
    assert.equal(rows.filter(c => c.parameters.expected === 'refused').length, 5);
    assert.ok(rows.every(c => !c.parameters.actor.temp && c.parameters.actor.properties['env/auto_regenerate'] === 0));
});

test('打坐心法21/神功5，不复制全排列；原低门槛/容量/超额halt/room输入明确', () => {
    const rows = select('exercise'); assert.equal(total(rows), 52);
    assert.equal(rows.filter(c => c.parameters.skill === 'shenghuo-xinfa').length, 21);
    assert.equal(rows.filter(c => c.parameters.skill === 'shenghuo-shengong').length, 5);
    const get = v => rows.find(c => c.parameters.skill === 'shenghuo-xinfa' && c.parameters.variant === v).parameters;
    assert.equal(get('cost9').exercise_cost, 9); assert.equal(get('minimum10').exercise_cost, 10);
    assert.equal(get('jing6999').actor.properties.jing, 6999); assert.equal(get('jing7000').actor.properties.jing, 7000);
    assert.equal(get('below-cap').actor.properties.max_neili, 2999); assert.equal(get('at-cap').actor.properties.max_neili, 3000);
    assert.equal(get('halt-overcharge').actor.properties.neili, 12001); assert.equal(get('halt-overcharge').halt_after, 1);
    assert.ok(rows.every(c => c.parameters.watchdog_seconds > c.parameters.observe_seconds));
});

test('父force仅六次原普通入口分布，不强制命中/反震；持剑和零加力明确控制', () => {
    const rows = select('inherited-hit'); assert.equal(total(rows), 600);
    assert.ok(rows.every(c => c.method === 'ordinary' && c.parameters.attack_attempts === 1));
    assert.ok(rows.every(c => c.parameters.source_derived_local_factor === null));
    assert.ok(rows.every(c => c.parameters.actual_reflection === 'unobserved_until_native'));
    const sword = rows.find(c => c.parameters.variant === 'held-sword').parameters;
    assert.deepEqual(sword.actor.equipment, { type: 'sword', hold: false });
    assert.equal(rows.find(c => c.parameters.variant === 'jiali0').parameters.actor.properties.jiali, 0);
    assert.equal(rows.filter(c => c.parameters.actor.equipment).length, 1);
    assert.ok(rows.every(c => c.parameters.actor.mappings.force === 'shenghuo-xinfa'));
});

test('两向华山冲突/神功总容量/混修总当前7项，预测不当原观察', () => {
    const rows = select('capacity'); assert.equal(total(rows), 14);
    assert.equal(rows.filter(c => c.parameters.ability === 'can_learn').length, 2);
    assert.ok(rows.filter(c => c.parameters.ability === 'can_learn').every(c => c.parameters.expected === 'refused'));
    assert.deepEqual(rows.filter(c => c.parameters.variant.startsWith('total')).map(c => c.parameters.source_derived_capacity), [3480, 7920, 19680]);
    assert.deepEqual(rows.filter(c => c.parameters.variant.startsWith('mixed-')).map(c => c.parameters.source_derived_capacity), [10000, 7920]);
    assert.ok(rows.filter(c => c.parameters.source_derived_capacity).every(c => c.parameters.prediction_scope === 'source_derived_not_observed'));
});

test('9高等级解除原delay及非零apply，formal9836秒窗口/烟雾4918，不缩时钟或用低级替代', () => {
    const rows = select('expiry'); assert.equal(total(rows), 18);
    assert.deepEqual(rows.map(c => c.parameters.original_delay_seconds), [300, 600, 1200, 200, 400, 800, 200, 400, 800]);
    assert.equal(rows.reduce((n, c) => n + c.parameters.observe_seconds * c.samples, 0), 9836);
    assert.equal(smoke.filter(c => c.parameters.panel === 'expiry').reduce((n, c) => n + c.parameters.observe_seconds * c.samples, 0), 4918);
    for (const c of rows) {
        const p = c.parameters; assert.equal(p.watchdog_seconds, p.original_delay_seconds + 60);
        assert.equal(p.observe_seconds, p.original_delay_seconds + 2); assert.ok(p.actor.temp);
        assert.ok(p.timing_scope.includes('watchdog_is_error_only'));
        assert.equal(p.source_entries.at(-1).function, 'remove_effect');
        bad(c, v => { v.parameters.watchdog_seconds = 600; });
        bad(c, v => { v.parameters.original_delay_seconds = v.parameters.observe_seconds = 1; });
    }
});

test('24 heal/inspire原HB与halt资格独立，原MA-080残留不修补', () => {
    const rows = select('healing'); assert.equal(total(rows), 48);
    assert.equal(rows.filter(c => c.parameters.halt_after).length, 4);
    assert.equal(rows.filter(c => c.parameters.expected_end === 'depleted').length, 4);
    assert.equal(rows.filter(c => c.parameters.expected === 'refused').length, 4);
    for (const c of rows.filter(c => c.parameters.ability === 'inspire')) {
        assert.match(c.parameters.known_source_issue, /MA-080/);
        if (c.parameters.expected === 'observed') assert.equal(c.parameters.actor.properties.breakup, 1);
        assert.equal(c.parameters.actor.properties.reborn, 0);
    }
    assert.ok(rows.every(c => c.parameters.observe_seconds === 90 && c.parameters.actor.properties['special_skill/divine'] === 0));
});

test('16真异常驱除与4原重复强化保持独立资格、初态和显式补给，不伪造生命周期', () => {
    const rows = select('dispel'); assert.equal(total(rows), 1208);
    for (const c of rows) {
        const p = c.parameters, victim = p.other ? p.target : p.actor;
        assert.ok(victim.conditions[p.condition_name]); assert.equal(p.observe_seconds, 0);
        assert.match(p.condition_origin, /not_natural_poison/);
        assert.ok(p.source_entries.some(e => e.function === 'dispel' && e.path === `kungfu/condition/${p.condition_name}.c`));
        if (p.condition_name === 'freezing') assert.ok(p.source_entries.some(e => e.path === 'inherit/condition/poison.c'));
    }
    for (const c of select('repeat')) {
        const p = c.parameters; assert.equal(p.buff_steps.length, 4); assert.equal(p.observe_seconds, 0);
        assert.deepEqual(p.buff_steps.filter(s => s.command).map(s => s.command), Array(3).fill('exert ' + p.ability));
        assert.equal(p.actor.skills['martial-cognize'], p.ability === 'power' ? 120 : 300);
        assert.equal(p.buff_steps[2].refill_neili, p.ability === 'power' ? 6000 : 8000);
        if (p.ability === 'tianmo') assert.equal(p.actor.properties.shen, -10000000);
        assert.equal(Object.hasOwn(p, 'persistence_probe'), false);
    }
    assert.equal(total(select('repeat')), 204);
});

test('9即时恢复只补未采差量；factory对象隔离且通过统一采集入口注册', () => {
    const rows = select('recovery'); assert.equal(total(rows), 18);
    assert.equal(rows.filter(c => c.parameters.level === 200).length, 1);
    assert.equal(rows.find(c => c.parameters.level === 200).parameters.ability, 'regenerate');
    assert.equal(rows.find(c => c.parameters.level === 200).parameters.skill, 'shenghuo-xinfa');
    const changed = copy(formal); changed[0].parameters.actor.properties.jing = -1;
    assert.notEqual(formal[0].parameters.actor.properties.jing, -1);
    assert.notStrictEqual(formal[0].parameters.source_evidence, formal[1].parameters.source_evidence);
    for (const [path, module] of [
        ['tools/tests/martial_data/school_combat_cases.mjs', 'school_mingjiao_force_remaining_cases'],
        ['tools/tests/martial_data/execution.mjs', 'school_mingjiao_force_remaining_cases'],
        ['tools/tests/martial_data/school_combat_report.mjs', 'school_mingjiao_force_remaining_report'],
    ]) assert.ok(read(path).toString('utf8').includes(module), path);
});
