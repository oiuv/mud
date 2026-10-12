import assert from 'node:assert/strict';
import test from 'node:test';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const all = teachingConditions(schoolRelations(inventory, catalog), catalog)
    .filter(c => !['feng', 'quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers'].includes(c.parameters.teaching_profile))
    .filter(c => !['tiezhang', 'shenlong', 'henshan', 'songshan', 'lingxiao', 'meizhuang', 'lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => ['xingxiu', 'xuanming'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('星宿玄冥 21 项传招由五名原 NPC 经公共教学执行，旧条件保持独立', () => {
    assert.equal(cases.length, 154); assert.equal(all.length, 2065);
    assert.equal(all.length - cases.length, 1911);
    assert.equal(teachingEntries(cases).length, 5);
    assert.equal(teachingEntries(all).length, 213);
    assert.equal(cases.filter(c => c.id.endsWith('-grant')).length, 21);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 42);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.samples, 2); assert.equal(c.status, 'configured_not_executed');
        assert.equal(p.action, `ask ${p.teacher.id} about ${p.topic}`);
        assert.equal(p.teaching_entry.function, 'accept_ask');
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_')));
        const group = p.teacher.path.includes('/xingxiu/') ? 'xingxiu' : 'xuanming';
        assert.ok(p.qualification_sources.includes(`kungfu/class/${group}/${group}.h`));
    }
});

test('夺魂势分别验证基本内功 130 与有效内功 80，不相互遮蔽', () => {
    const grant = get('dingchunqiu-duo-grant');
    assert.equal(grant.actor.skills.force, 130);
    assert.equal(grant.actor.skills['huagong-dafa'], 15);
    assert.equal(grant.actor.mappings.force, 'huagong-dafa');
    const raw = get('dingchunqiu-duo-basic-force-low');
    assert.equal(raw.actor.skills.force, 129);
    assert.equal(raw.actor.skills['huagong-dafa'], 15);
    assert.equal(raw.teaching_expectations[0].response_contains, '了解还不够');
    const effective = get('dingchunqiu-duo-force-low');
    assert.equal(effective.actor.skills.force, 130);
    assert.equal(effective.actor.skills['huagong-dafa'], 14);
    assert.equal(effective.teaching_expectations[0].response_contains, '内功火候不足');
});

test('多项基本技能分别验证，未规定的有效内功条件不补入', () => {
    for (const [id, skills] of [
        ['dingchunqiu-dan', { force: 140, poison: 140, throwing: 140 }],
        ['zhaixing-shi', { force: 120, poison: 150, throwing: 120 }],
        ['dingchunqiu-tao', { poison: 250, 'huagong-dafa': 220 }],
        ['baisun-xing', { 'xuanming-shengong': 220 }],
    ]) {
        for (const [skill, level] of Object.entries(skills)) {
            assert.equal(get(id + '-grant').actor.skills[skill], level);
            assert.equal(get(`${id}-required-${skill}-low`).actor.skills[skill], level - 1);
        }
        assert.equal(cases.some(c => c.id === `teaching-${id}-force-low`), false);
    }
    assert.equal(get('dingchunqiu-tao-grant').actor.skills.force, 0);
    assert.deepEqual(get('baisun-xing-grant').actor.mappings, {});
    assert.equal(get('hebi-ying-dodge-low').actor.skills.dodge, 359);
    assert.equal(get('baisun-bao-dodge-low').actor.skills.dodge, 299);
});

test('负神值边界、重复扣费与原询问文字不随预期改写', () => {
    assert.equal(get('zhaixing-fugu-grant').actor.properties.shen, -2200);
    assert.equal(get('zhaixing-xue-grant').actor.properties.shen, -22000);
    assert.equal(get('hebi-juan-grant').topic, '卷字决');
    for (const c of cases.filter(c => c.id.endsWith('-grant'))) {
        const id = c.id.slice(9, -6), p = c.parameters;
        assert.equal(get(id + '-shen-high').actor.properties.shen, p.actor.properties.shen + 1);
        assert.equal(get(id + '-family-other').expected, 'refused');
        const repeat = get(id + '-repeat').teaching_expectations;
        assert.equal(repeat.length, 2);
        assert.equal(repeat[0].contribution_spent, p.actor.properties.gongxian);
        assert.equal(repeat[1].contribution_spent, 0);
    }
});
