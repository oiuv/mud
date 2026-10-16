import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { emeiTonsureConditions } from './emei_tonsure_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_profile === 'emei-tonsure');
const get = id => structuredClone(cases.find(c => c.id === 'teaching-emei-tonsure-' + id));

// Fabricated rows exercise validation only; they are never collection evidence.
function fixture(c) {
    const p = c.parameters, v = p.actor.properties;
    let before = { ...v, contribution: v.gongxian, skills: p.actor.skills, mappings: {}, learned: {}, grants: {},
        tonsure: { gender: v.gender, PKS: v.PKS, MKS: v.MKS, K_record: v.K_record, shen_record: v.shen_record,
            pending: 0, quit_pending: 0, secularize_pending: 0, purename: v.purename || '',
            old_name: v['marks/old_name'], id: 'left', name_ids: 'left', original_name_ids: 'left',
            recruitment: { family: v.family || {}, name: v.name, class: v.class, title: v.title,
                pending_apprentice: '', pending_betrayer: '', flags: {} } } };
    return p.teaching_expectations.map(e => {
        before = structuredClone(before);
        const after = structuredClone(before);
        after.tonsure.pending = e.pending; after.tonsure.quit_pending = e.quit_pending ?? 0;
        if (e.command_kind === 'ask') after.jing -= 10;
        if (e.tonsured) {
            const old = v.purename || before.tonsure.recruitment.name;
            Object.assign(after.tonsure.recruitment, { name: '灵' + [...old][0], class: 'bonze' });
            Object.assign(after.tonsure, { K_record: before.tonsure.PKS + before.tonsure.MKS,
                shen_record: before.shen, original_name_ids: '', old_name: old });
            after.shen = 0;
        }
        const s = { student: '/tests/teaching_actor#1', teacher: p.teacher.path + '#2',
            teacher_program: p.teacher.path, command: e.action, command_accepted: e.command_accepted,
            elapsed: 0.01, before, after, messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' };
        before = after; return s;
    });
}

test('13个NPC的178条件1238样本；旧11303条件完整指纹不变', () => {
    assert.equal(cases.length, 178); assert.equal(cases.reduce((n,c) => n+c.samples, 0), 1238);
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path)).size, 13);
    assert.equal(cases.filter(c => c.samples === 100).length, 9);
    const old = all.filter(c => !['emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile));
    assert.equal(old.length, 11303); assert.equal(old.reduce((n,c) => n+c.samples, 0), 48278);
    assert.equal(sha256(JSON.stringify(old)), '5a76a55340ace73c6190e4a791b0da0ba2cd9d7e7a5dc08e2c40cd9e85346c38');
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        assert.equal(c.parameters.actor.temp, undefined);
        const s = validateTeachingObservation(fixture(c), c);
        assert.equal(s.some(r => r.advanced), c.parameters.expected === 'observed', c.id);
    }
});
test('九位原询问入口与三位未配置入口分别记录；不能按include推断可用', () => {
    for (const id of ['dao', 'feng', 'he']) for (const topic of ['tonsure', 'join']) {
        const c = get(id + '-unconfigured-' + topic);
        assert.equal(c.parameters.expected, 'refused');
        assert.equal(c.parameters.teaching_expectations[1].tonsured, false);
    }
    const c = get('xuan-repeat'), rows = fixture(c);
    assert.equal(validateTeachingObservation(rows, c).filter(s => s.tonsured).length, 1);
});
test('实际还俗标记不算还俗；两次公共命令仍不能改变峨嵋身份', () => {
    const c = get('miejue-quit-bonze-blocked'), rows = fixture(c);
    const s = validateTeachingObservation(rows, c);
    assert.equal(rows[0].after.tonsure.quit_pending, 1);
    assert.equal(s.some(r => r.advanced), false);
    rows[3].after.tonsure.recruitment.class = '';
    assert.throws(() => validateTeachingObservation(rows, c));
});
test('原始姓名优先与四种法名前缀可核验；师承、记录、法名、许可缺失必须拒绝', () => {
    for (const prefix of ['灵', '文', '心', '妙']) {
        const c = get('xuan-purename'), rows = fixture(c);
        rows[1].after.tonsure.recruitment.name = prefix + '本';
        validateTeachingObservation(rows, c);
    }
    for (const mutate of [
        r => r[1].after.tonsure.old_name = '改名',
        r => r[1].after.tonsure.recruitment.name = '灵改',
        r => r[1].after.tonsure.recruitment.family.master_id = 'jingxuan shitai',
        r => r[1].after.tonsure.pending = 1,
        r => r[1].after.tonsure.secularize_pending = 1,
        r => delete r[1].after.tonsure.quit_pending,
        r => r[1].after.tonsure.K_record = 777,
        r => r[1].after.tonsure.shen_record = 888,
        r => r[1].after.shen = 1234,
        r => r[1].after.tonsure.original_name_ids = 'left',
        r => r[1].after.tonsure.name_ids = '',
        r => r[1].after.neili++,
        r => r[0].after.jing = r[0].before.jing,
    ]) {
        const c = get('xuan-purename'), rows = fixture(c); mutate(rows);
        assert.throws(() => validateTeachingObservation(rows, c));
    }
});
test('受戒代码、NPC入口或公共还俗变化须重新核对来源', () => {
    for (const path of ['kungfu/class/emei/tobebonze.h', 'kungfu/class/emei/dao.c', 'cmds/std/secularize.c'])
        assert.throws(() => emeiTonsureConditions(relations,
            p => readFileSync(p, 'utf8') + (p === path ? '\n// changed' : '')), /源码变化/);
});
