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
    .filter(c => !['miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => ['lingjiu', 'xiaoyao'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('八个教师二十五入口追加224条件，不改历史2593条件', () => {
    assert.equal(all.length, 2817); assert.equal(cases.length, 224);
    assert.equal(teachingEntries(all).length, 279); assert.equal(teachingEntries(cases).length, 25);
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path)).size, 8);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        assert.equal(c.samples, 2);
        assert.ok(!Object.keys(c.parameters.actor.properties).some(k => k.startsWith('can_')));
        assert.ok(c.parameters.qualification_evidence.every(e => e.sha256.length === 64));
    }
});

test('五位教师的原本门免费分支保留其他门槛及同一角色重复询问', () => {
    for (const [id, family, cost] of [
        ['duanmu-gui', '赤焰洞', 1500], ['lifuren-huan', '椰花岛', 500],
        ['sangtugong-huan', '碧磷洞', 600], ['zhuobufan-mang', '一字慧剑门', 1000],
        ['zuozimu-qian', '无量剑派', 300],
    ]) {
        assert.equal(get(id + '-grant').actor.properties['family/family_name'], '灵鹫宫');
        assert.equal(get(id + '-grant').teaching_expectations[0].contribution_spent, cost);
        const local = get(id + '-local-family-grant');
        assert.equal(local.actor.properties['family/family_name'], family);
        assert.equal(local.actor.properties.gongxian, 0);
        assert.equal(local.teaching_expectations[0].contribution_spent, 0);
        assert.equal(get(id + '-local-family-negative').actor.properties.gongxian, -1);
        assert.equal(get(id + '-local-family-negative').expected, 'observed');
        assert.deepEqual(get(id + '-local-family-repeat').teaching_expectations.map(e => e.contribution_spent), [0, 0]);
        assert.equal(get(id + '-local-family-skill-low').expected, 'refused');
        assert.equal(get(id + '-family-other').expected, 'refused');
    }
});

test('黎夫人的截手传授只认椰花岛且付费，不套入云霞的两门派规则', () => {
    const p = get('lifuren-jie-grant');
    assert.equal(p.actor.properties['family/family_name'], '椰花岛');
    assert.equal(p.actor.properties.gongxian, 300);
    assert.equal(p.actor.properties.max_neili, 850); assert.equal(p.actor.skills.force, 240);
    assert.equal(get('lifuren-jie-family-other').actor.properties['family/family_name'], '灵鹫宫');
    assert.equal(get('lifuren-jie-family-other').expected, 'refused');
    assert.ok(!cases.some(c => c.id.startsWith('teaching-lifuren-jie-local-family')));
});

test('共享绝招保留独立教师成本，未把拜师和注释条件植入原询问', () => {
    assert.equal(get('xuzhu-zhe-grant').actor.properties.gongxian, 300);
    assert.equal(get('wuyazi-zhe-grant').actor.properties.gongxian, 400);
    assert.equal(get('xuzhu-huanzhang-grant').actor.properties.gongxian, 1000);
    assert.equal(get('wuyazi-huan-grant').actor.properties.gongxian, 900);
    assert.equal(get('xuzhu-po-bahuang-gong-low').actor.skills['bahuang-gong'], 219);
    assert.equal(get('wuyazi-hua-grant').actor.skills.force, 0);
    assert.ok(!Object.hasOwn(get('wuyazi-hua-grant').actor.skills, 'beiming-shengong'));
    assert.equal(get('lifuren-huan-grant').actor.skills.dodge, 360);
    for (const c of cases.filter(c => c.id.endsWith('-grant') && !c.id.includes('-local-family-'))) {
        const id = c.id.slice(9, -6);
        assert.equal(c.parameters.actor.properties.shen, 0);
        assert.equal(get(id + '-shen-accepted-1').actor.properties.shen, -100000);
        assert.equal(get(id + '-shen-accepted-2').actor.properties.shen, 100000);
    }
});
