import assert from 'node:assert/strict';
import test from 'node:test';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const all = teachingConditions(schoolRelations(inventory, catalog), catalog)
    .filter(c => !['feng', 'quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile))
    .filter(c => c.parameters.teaching_kind !== 'letter_teaching');
const cases = all.filter(c => ['ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('六教师26直接传招新增199条件，未将书信转授冒充直接询问', () => {
    assert.equal(all.length, 3159); assert.equal(cases.length, 199);
    assert.equal(teachingEntries(all).length, 318); assert.equal(teachingEntries(cases).length, 26);
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path)).size, 6);
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path + '/' + c.parameters.topic)).size, 26);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        assert.equal(c.samples, 2);
        assert.match(c.parameters.action, /^ask /);
        assert.ok(!Object.keys(c.parameters.actor.properties).some(k => k.startsWith('can_')));
        assert.ok(c.parameters.qualification_evidence.every(e => e.sha256.length === 64));
        assert.notEqual(c.parameters.teaching_entry.function, 'accept_object');
        assert.notEqual(c.parameters.teaching_entry.function, 'give_letter');
    }
});

test('欧阳锋贡献正向增加如实保留，不修复MA-055或推定所有传招都检查邪气', () => {
    const grant = get('ouyang-wanshi-grant'), repeat = get('ouyang-wanshi-repeat');
    assert.equal(grant.known_issue, 'MA-055');
    assert.equal(grant.actor.properties.gongxian, 1000);
    assert.deepEqual(repeat.teaching_expectations.map(e => e.contribution_spent), [-1000, 0]);
    assert.equal(get('ouyang-wanshi-contribution-low').actor.properties.gongxian, 999);
    assert.equal(get('ouyang-wanshi-contribution-low').expected, 'refused');
    assert.equal(get('ouyang-wanshi-shen-high').actor.properties.shen, -119999);
    assert.equal(get('ouyang-qianshe-shen-high').actor.properties.shen, -39999);
    for (const variant of ['grant', 'shen-accepted-1', 'shen-accepted-2']) {
        assert.equal(get('ouyang-wuji-' + variant).expected, 'observed');
        assert.equal(get('ouyang-wuji-' + variant).actor.skills.force, 0);
    }
});

test('商家堡11主题逐项固定实际门槛，与相同招式八卦门条件分开', () => {
    for (const [id, skill, level, force, cost, shen] of [
        ['shangming-zhen', 'wai-bagua', 60, 100, 100, -5000],
        ['shangming-kai', 'baisheng-quan', 100, 140, 300, -20000],
        ['shangming-huan', 'jinbiao-jue', 100, 140, 300, -15000],
        ['shangming-yin', 'bazhen-zhang', 130, 180, 500, -20000],
        ['shangming-juan', 'shangjia-dao', 50, 80, 80, -1000],
        ['shangming-mang', 'bagua-dao', 140, 200, 1000, -50000],
        ['shangming-sha', 'bagua-dao', 180, 250, 1800, -80000],
        ['shangtai-gua', 'bagua-quan', 70, 100, 100, -10000],
        ['shangtai-ding', 'bagua-zhang', 80, 120, 150, -20000],
        ['shangtai-wang', 'tan-tui', 120, 150, 350, -25000],
        ['shangtai-can', 'quemen-jian', 80, 120, 60, -5000],
    ]) {
        const p = get(id + '-grant');
        assert.equal(p.actor.skills[skill], level); assert.equal(p.actor.skills.force, 2 * force);
        assert.equal(p.actor.properties.gongxian, cost); assert.equal(p.actor.properties.shen, shen);
        assert.equal(get(id + '-shen-high').actor.properties.shen, shen + 1);
        assert.equal(get(id + '-skill-low').actor.skills[skill], level - 1);
        assert.deepEqual(get(id + '-repeat').teaching_expectations.map(e => e.contribution_spent), [cost, 0]);
    }
    for (const id of ['wangjie-gua', 'wangjie-ding', 'wangweiyang-sha']) {
        assert.equal(get(id + '-shen-accepted-2').actor.properties.shen, 100000);
        assert.equal(get(id + '-shen-accepted-2').expected, 'observed');
    }
});

test('镖掌次技能、内外八卦与天刀最大内力分别验证，不混入拜师条件', () => {
    assert.equal(get('wangying-jia-bagua-biao-low').actor.skills['bagua-biao'], 119);
    assert.equal(get('wangying-xian-bagua-zhang-low').actor.skills['bagua-zhang'], 119);
    assert.equal(get('shangming-mang-wai-bagua-low').actor.skills['wai-bagua'], 139);
    assert.equal(get('wangweiyang-mang-wai-bagua-low').actor.skills['wai-bagua'], 139);
    const tian = get('wangweiyang-tian-grant');
    assert.equal(tian.actor.skills.force, 0); assert.equal(tian.actor.properties.max_neili, 3200);
    assert.equal(tian.actor.properties.gongxian, 2400);
    assert.equal(get('wangweiyang-tian-wai-bagua-low').actor.skills['wai-bagua'], 199);
    assert.equal(get('wangweiyang-tian-nei-bagua-low').actor.skills['nei-bagua'], 199);
    assert.equal(get('wangweiyang-tian-max-neili-low').actor.properties.max_neili, 3199);
    assert.equal(get('wangweiyang-tian-shang-without-letter').expected, 'refused');
    for (const c of cases) {
        assert.ok(!Object.hasOwn(c.parameters.actor.properties, 'born_family'));
        assert.ok(!Object.hasOwn(c.parameters.actor.properties, 'family/master_id'));
    }
});
