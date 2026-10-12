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
    .filter(c => !['lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')))
    .filter(c => c.parameters.teaching_kind !== 'introductory_teaching');
const cases = all.filter(c => ['lingxiao', 'meizhuang'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('凌霄梅庄九个教师程序的二十一绝招入口保持独立来源', () => {
    assert.equal(all.length, 2537); assert.equal(cases.length, 171);
    assert.equal(all.length - cases.length, 2366);
    assert.equal(teachingEntries(all).length, 250);
    assert.equal(teachingEntries(cases).length, 21);
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path)).size, 9);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.samples, 2); assert.equal(c.status, 'configured_not_executed');
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_')));
        assert.ok(p.teaching_entry.function.startsWith('ask_skill'));
        const group = p.teacher.path.includes('/lingxiao/') ? 'lingxiao' : 'meizhuang';
        assert.ok(p.qualification_sources.includes(`kungfu/class/${group}/${group}.h`));
    }
});

test('不把招收弟子的侠义要求移植到没有该检查的绝招传授', () => {
    for (const c of cases.filter(c => c.id.endsWith('-grant') && !c.id.includes('shiqing'))) {
        const id = c.id.slice(9, -6);
        assert.equal(c.parameters.actor.properties.shen, 0);
        assert.equal(get(id + '-shen-accepted-1').actor.properties.shen, -100000);
        assert.equal(get(id + '-shen-accepted-2').actor.properties.shen, 100000);
        assert.equal(get(id + '-shen-accepted-1').expected, 'observed');
        assert.equal(get(id + '-repeat').teaching_expectations[1].contribution_spent, 0);
    }
    assert.equal(get('shiqing-zhuo-shen-low').actor.properties.shen, 14999);
});

test('书法琴技与玄天无极功是各自原始等级要求，不伪造统一内功门槛', () => {
    assert.equal(get('tubi-feng-calligraphy-low').actor.skills.calligraphy, 99);
    assert.equal(get('tubi-shiyi-calligraphy-low').actor.skills.calligraphy, 99);
    assert.equal(get('huangzhong-yin-tanqin-jifa-low').actor.skills['tanqin-jifa'], 119);
    assert.equal(get('huangzhong-zhu-tanqin-jifa-low').actor.skills['tanqin-jifa'], 149);
    assert.equal(get('heibai-bing-xuantian-wujigong-low').actor.skills['xuantian-wujigong'], 179);
    for (const id of ['heibai-she', 'heibai-bing']) {
        assert.equal(get(id + '-grant').actor.skills.force, 0);
        assert.ok(!cases.some(c => c.id === `teaching-${id}-force-low`));
    }
});

test('清流剑前置由浊流剑真实传授取得，保留等级增长与两段贡献消耗', () => {
    const p = get('shiqing-qing-complete'), steps = p.teaching_expectations;
    assert.equal(p.actor.skills['shangqing-jian'], 159);
    assert.deepEqual(steps.map(s => s.contribution_spent), [800, 1600]);
    assert.deepEqual(steps.map(s => s.skills_after['shangqing-jian']), [160, 161]);
    assert.equal(get('shiqing-qing-repeat').teaching_expectations[2].contribution_spent, 0);
    assert.equal(get('shiqing-qing-missing-zhuo').actor.skills['shangqing-jian'], 160);
    assert.equal(get('shiqing-qing-missing-zhuo').teaching_expectations.length, 1);
    assert.equal(get('shiqing-qing-missing-zhuo').expected, 'refused');
    assert.equal(get('shiqing-qing-contribution-low').actor.properties.gongxian, 2399);
    assert.equal(get('shiqing-qing-skill-low').teaching_expectations[1].value, 0);
});

test('同一领悟不同入口按已审查函数区分，不把日月特殊传授算作普通询问', () => {
    const teacher = relations.objects.find(o => o.path === 'kungfu/class/meizhuang/huang.c');
    assert.equal(teacher.grants.filter(g => g.grant === 'can_perform/qixian-wuxingjian/yin').length, 2);
    assert.equal(get('huangzhong-yin-grant').teaching_entry.function, 'ask_skill1');
    const changed = structuredClone(relations);
    changed.objects.find(o => o.path === teacher.path).grants
        .find(g => g.function === 'ask_skill1').function = 'wrong_function';
    assert.throws(() => teachingConditions(changed, catalog));
});
