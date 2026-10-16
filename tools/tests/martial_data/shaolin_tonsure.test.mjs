import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { shaolinTonsureConditions } from './shaolin_tonsure_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_profile === 'shaolin-tonsure');
const get = id => structuredClone(cases.find(c => c.id === 'teaching-shaolin-tonsure-' + id));

// Contract-only fabricated rows: not substitutes for the isolated real driver.
function fixture(c) {
    const p = c.parameters, v = p.actor.properties;
    let before = { ...v, contribution: v.gongxian, skills: p.actor.skills, mappings: {}, learned: {}, grants: {},
        tonsure: { gender: v.gender, PKS: v.PKS, MKS: v.MKS, K_record: v.K_record, shen_record: v.shen_record,
            pending: 0, id: 'left', name_ids: 'left', original_name_ids: 'left',
            recruitment: { family: v.family || {}, name: v.name, class: v.class, title: v.title,
                pending_apprentice: '', pending_betrayer: '', flags: {} } } };
    return p.teaching_expectations.map(e => {
        before = structuredClone(before);
        const after = structuredClone(before);
        after.tonsure.pending = e.pending;
        if (e.command_kind === 'ask') after.jing -= 10;
        if (e.tonsured) {
            Object.assign(after.tonsure.recruitment, { name: '虚' + [...before.tonsure.recruitment.name][0], class: 'bonze' });
            Object.assign(after.tonsure, { K_record: before.tonsure.PKS + before.tonsure.MKS,
                shen_record: before.shen, original_name_ids: '' });
            after.shen = 0;
        }
        const s = { student: '/tests/teaching_actor#1', teacher: p.teacher.path + '#2',
            teacher_program: p.teacher.path, command: e.action, command_accepted: e.command_accepted,
            elapsed: 0.01, before, after, messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' };
        before = after; return s;
    });
}

test('15条剃度条件128样本，旧9284条件完整指纹不变', () => {
    assert.equal(cases.length, 15); assert.equal(cases.reduce((n,c) => n + c.samples, 0), 128);
    const old = all.filter(c => !['shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile));
    assert.equal(old.length, 9284);
    assert.equal(sha256(JSON.stringify(old)), 'b7d176a3ef6f1edbed38ce4f93a84c9402705e7ee80f208674117d02e49b0e6d');
    for (const c of cases) assert.equal(c.parameters.actor.temp, undefined);
});
test('询问许可、自然剃度、重复动作与身份拒绝分别核验', () => {
    for (const c of cases) {
        const summaries = validateTeachingObservation(fixture(c), c);
        assert.equal(summaries.some(s => s.advanced), c.parameters.expected === 'observed', c.id);
        assert.equal(summaries.filter(s => s.tonsured).length, c.parameters.teaching_expectations.filter(e => e.tonsured).length);
    }
    const c = get('repeat');
    assert.equal(validateTeachingObservation(fixture(c), c).filter(s => s.tonsured).length, 1);
});
test('四种原随机法名均合法；许可、更名、记录、师承与账目缺失不能通过', () => {
    for (const prefix of ['虚', '空', '明', '净']) {
        const c = get('complete-tonsure'), rows = fixture(c);
        rows[1].after.tonsure.recruitment.name = prefix + '试';
        validateTeachingObservation(rows, c);
    }
    for (const change of [
        r => r[1].after.tonsure.recruitment.class = '',
        r => r[1].after.tonsure.recruitment.name = '未知',
        r => r[1].after.tonsure.pending = 1,
        r => r[1].after.tonsure.original_name_ids = 'left',
        r => r[1].after.tonsure.name_ids = 'other',
        r => r[1].after.tonsure.K_record = 777,
        r => r[1].after.tonsure.shen_record = 888,
        r => r[1].after.shen = 1234,
        r => r[1].after.tonsure.recruitment.family = { family_name: '少林派' },
        r => r[1].before.neili++,
        r => r[0].after.jing = r[0].before.jing,
        r => r[1].after.tonsure.PKS = null,
    ]) {
        const c = get('complete-tonsure'), rows = fixture(c); change(rows);
        assert.throws(() => validateTeachingObservation(rows, c));
    }
});
test('原NPC或姓名登记依赖改变必须重新核对', () => {
    assert.throws(() => shaolinTonsureConditions(relations,
        p => readFileSync(p, 'utf8') + (p === 'adm/daemons/named.c' ? '\n// changed' : '')), /源码变化/);
});
