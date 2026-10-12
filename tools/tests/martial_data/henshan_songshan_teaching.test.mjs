import assert from 'node:assert/strict';
import test from 'node:test';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog);
const all = teachingConditions(relations, catalog)
    .filter(c => !['feng', 'quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers'].includes(c.parameters.teaching_profile))
    .filter(c => !['lingxiao', 'meizhuang', 'lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => ['henshan', 'songshan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('衡山嵩山十个教师程序的二十五主题保留独立来源，不预授领悟', () => {
    assert.equal(all.length, 2366); assert.equal(cases.length, 181);
    assert.equal(all.length - cases.length, 2185);
    assert.equal(teachingEntries(all).length, 229);
    assert.equal(teachingEntries(cases).length, 10);
    assert.equal(cases.filter(c => c.id.endsWith('-grant')).length, 25);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 50);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.samples, 2); assert.equal(c.status, 'configured_not_executed');
        assert.equal(p.action, `ask ${p.teacher.id} about ${p.topic}`);
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_')));
        const group = p.teacher.path.includes('/henshan/') ? 'henshan' : 'songshan';
        assert.ok(p.qualification_sources.includes(`kungfu/class/${group}/${group}.h`));
    }
});

test('按原教师保留正负侠义与贡献扣费，不用门派统一门槛', () => {
    for (const c of cases.filter(c => c.id.endsWith('-grant'))) {
        const id = c.id.slice(9, -6), p = c.parameters;
        const negative = id.startsWith('zuolengchan-');
        assert.equal(Math.sign(p.actor.properties.shen), negative ? -1 : 1);
        assert.equal(get(id + (negative ? '-shen-high' : '-shen-low')).actor.properties.shen,
            p.actor.properties.shen + (negative ? 1 : -1));
        assert.equal(get(id + '-contribution-low').actor.properties.gongxian,
            p.actor.properties.gongxian - 1);
        assert.equal(get(id + '-contribution-low').expected, 'refused');
        assert.equal(get(id + '-repeat').teaching_expectations[1].contribution_spent, 0);
        assert.equal(get(id + '-family-other').expected, 'refused');
    }
});

test('保留轻功及最大内力边界；无有效内功要求的主题不虚构该门槛', () => {
    assert.equal(cases.filter(c => c.parameters.teacher.path.includes('/henshan/')).length, 76);
    assert.equal(get('liuzhengfeng-luo-grant').actor.properties.max_neili, 2800);
    assert.equal(get('liuzhengfeng-luo-max-neili-low').actor.properties.max_neili, 2799);
    assert.equal(get('liuzhengfeng-luan-max-neili-low').actor.properties.max_neili, 1599);
    for (const [id, dodge] of [['moda-die', 150], ['zuolengchan-xian', 140],
        ['yaohou-qian', 80], ['yaohou-wan', 80], ['yuehou-qian', 80], ['yuehou-wan', 80]]) {
        assert.equal(get(id + '-grant').actor.skills.force, 0);
        assert.equal(get(id + '-dodge-low').actor.skills.dodge, dodge * 2 - 1);
        assert.ok(!cases.some(c => c.id === `teaching-${id}-force-low`));
    }
    assert.equal(get('dixiu-meng-grant').actor.skills.force, 0);
    assert.equal(get('feibin-ying-force-low').actor.skills.force, 159);
    assert.deepEqual(get('zuolengchan-freezing-grant').monitored_grants, ['can_perform/hanbing-zhenqi/freezing']);
});

test('两份乐厚源码按不同对象与ID采集；授课字段漂移必须中止预检', () => {
    const a = get('yaohou-wan-grant'), b = get('yuehou-wan-grant');
    assert.notEqual(a.teacher.path, b.teacher.path); assert.notEqual(a.teacher.id, b.teacher.id);
    assert.deepEqual(a.actor, b.actor);
    assert.equal(a.actor.properties.shen, 36000);
    const changed = structuredClone(relations);
    changed.objects.find(o => o.path === 'kungfu/class/songshan/yao.c').grants[0].fields.gongxian.value++;
    assert.throws(() => teachingConditions(changed, catalog));
});
