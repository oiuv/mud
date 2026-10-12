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
    .filter(c => !['xingxiu', 'xuanming', 'tiezhang', 'shenlong', 'henshan', 'songshan', 'lingxiao', 'meizhuang', 'lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => ['xueshan', 'xuedao'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('大轮寺与血刀门共 24 个传招入口，历史 1722 条件保持独立', () => {
    assert.equal(all.length, 1911); assert.equal(cases.length, 189);
    assert.equal(all.length - cases.length, 1722);
    assert.equal(teachingEntries(all).length, 208); assert.equal(teachingEntries(cases).length, 24);
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path)).size, 6);
    assert.equal(cases.filter(c => c.id.endsWith('-grant')).length, 24);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 48);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.samples, 2); assert.equal(c.status, 'configured_not_executed');
        assert.equal(p.action, `ask ${p.teacher.id} about ${p.topic}`);
        assert.equal(p.fighting, false);
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_')));
        const group = p.teacher.path.includes('/xueshan/') ? 'xueshan' : 'xuedao';
        assert.ok(p.qualification_sources.includes(`kungfu/class/${group}/${group}.h`));
        const source = inventory.files.find(f => f.path === p.teacher.path.slice(1) + '.c');
        assert.ok(source.functions.some(f => f.name === p.teaching_entry.function && f.line === p.teaching_entry.line));
    }
});

test('邪气不足取上限加一，重复询问只通过原教师取得领悟', () => {
    for (const c of cases.filter(c => c.id.endsWith('-grant'))) {
        const id = c.id.slice(9, -6), p = c.parameters;
        assert.ok(p.actor.properties.shen < 0);
        assert.equal(get(id + '-shen-high').actor.properties.shen, p.actor.properties.shen + 1);
        assert.equal(get(id + '-shen-high').expected, 'refused');
        assert.equal(get(id + '-family-other').expected, 'refused');
        const repeat = get(id + '-repeat').teaching_expectations;
        assert.equal(repeat.length, 2);
        assert.equal(repeat[0].contribution_spent, p.actor.properties.gongxian);
        assert.equal(repeat[1].contribution_spent, 0);
    }
});

test('龙象额外门槛只属于日月轮两招；没有凭描述添加前招领悟', () => {
    for (const suffix of ['po', 'yuan']) {
        assert.equal(get(`fawang-${suffix}-grant`).actor.skills['longxiang-gong'], 30);
        assert.equal(get(`fawang-${suffix}-longxiang-gong-low`).actor.skills['longxiang-gong'], 29);
        assert.equal(get(`fawang-${suffix}-longxiang-gong-low`).expected, 'refused');
    }
    assert.equal(Object.hasOwn(get('fawang-lian-grant').actor.skills, 'longxiang-gong'), false);
    const shi = get('xuedaolaozu-shi-grant');
    assert.deepEqual(shi.monitored_grants, ['can_perform/xuedao-dafa/shi']);
    assert.equal(shi.teaching_expectations.length, 1);
    assert.equal(shi.actor.skills['xuedao-dafa'], 180);
});

test('不查有效内功的四招与霍都不查最大内力按源码保留', () => {
    for (const id of ['fawang-tun', 'fawang-die', 'fawang-ji', 'xuedaolaozu-resurrect']) {
        assert.equal(get(id + '-grant').actor.skills.force, 0);
        assert.equal(cases.some(c => c.id === `teaching-${id}-force-low`), false);
        assert.ok(get(id + '-grant').actor.properties.max_neili > 0);
    }
    assert.equal(Object.hasOwn(get('huodu-tong-grant').actor.properties, 'max_neili'), false);
    assert.equal(cases.some(c => c.id === 'teaching-huodu-tong-max-neili-low'), false);
});
