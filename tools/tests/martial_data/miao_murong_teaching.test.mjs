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
    .filter(c => !['ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => ['miao', 'murong'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('四位教师十九主题追加143条件，历史2817条件仍保留', () => {
    assert.equal(all.length, 2960); assert.equal(cases.length, 143);
    assert.equal(teachingEntries(all).length, 292); assert.equal(teachingEntries(cases).length, 13);
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path)).size, 4);
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path + '/' + c.parameters.topic)).size, 19);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        assert.equal(c.samples, 2);
        assert.ok(!Object.keys(c.parameters.actor.properties).some(k => k.startsWith('can_')));
        assert.ok(c.parameters.qualification_evidence.every(e => e.sha256.length === 64));
    }
});

test('苗家十项分别固定技能、有效内功、最大内力、贡献与正神门槛', () => {
    for (const [id, skill, level, force, neili, cost, shen] of [
        ['dan', 'miaojia-zhang', 40, 50, 200, 50, 2000],
        ['kai', 'pobei-tui', 100, 150, 1000, 200, 8000],
        ['zhan', 'chongtian-zhang', 120, 150, 1500, 350, 12000],
        ['can', 'suqin-beijian', 60, 80, 1000, 50, 3000],
        ['dian', 'baxian-jian', 100, 150, 1000, 300, 10000],
        ['zhui', 'tianlong-jian', 120, 150, 1500, 800, 15000],
        ['zhai', 'miaojia-jian', 100, 120, 800, 400, 13000],
        ['zhu', 'miaojia-jian', 120, 150, 1200, 600, 15000],
        ['qian', 'miaojia-jian', 160, 220, 1800, 1000, 18000],
        ['gan', 'miaojia-jian', 200, 280, 3000, 2200, 35000],
    ]) {
        const p = get('miao-' + id + '-grant');
        assert.equal(p.actor.skills[skill], level); assert.equal(p.actor.skills.force, force * 2);
        assert.equal(p.actor.properties.max_neili, neili); assert.equal(p.actor.properties.shen, shen);
        assert.equal(p.actor.properties.gongxian, cost);
        assert.equal(get('miao-' + id + '-max-neili-low').actor.properties.max_neili, neili - 1);
        assert.equal(get('miao-' + id + '-shen-low').actor.properties.shen, shen - 1);
        assert.deepEqual(get('miao-' + id + '-repeat').teaching_expectations.map(e => e.contribution_spent), [cost, 0]);
        assert.ok(!Object.hasOwn(p.actor.properties, 'family/master_id'));
    }
});

test('两个风雨交加保留独立领悟，不臆造龙城的贡献和神值限制', () => {
    const old = get('longcheng-fengyu-grant'), newer = get('murongfu-feng-grant');
    assert.deepEqual(old.monitored_grants, ['can_perform/longcheng-shendao/fengyu']);
    assert.deepEqual(newer.monitored_grants, ['can_perform/longcheng-shendao/feng']);
    assert.equal(old.actor.skills.force, 0); assert.equal(old.actor.properties.gongxian, 0);
    assert.equal(get('longcheng-fengyu-contribution-negative').actor.properties.gongxian, -1);
    assert.equal(get('longcheng-fengyu-contribution-negative').expected, 'observed');
    assert.equal(get('longcheng-fengyu-shen-accepted-1').expected, 'observed');
    assert.equal(get('longcheng-fengyu-shen-accepted-2').expected, 'observed');
    assert.equal(old.actor.skills['longcheng-shendao'], 120);
    assert.equal(newer.actor.skills['longcheng-shendao'], 80);
    assert.equal(newer.actor.skills.force, 180); assert.equal(newer.actor.properties.gongxian, 320);
    assert.equal(newer.actor.properties.shen, -9000);
});

test('公共传招的次技能和轻功分别设界，不混入拜师与普通学习条件', () => {
    assert.equal(get('murongbo-yi-grant').actor.skills['zihui-xinfa'], 180);
    assert.equal(get('murongbo-yi-required-zihui-xinfa-low').actor.skills['zihui-xinfa'], 179);
    assert.equal(get('murongbo-zhi-grant').actor.skills.dodge, 280);
    assert.equal(get('murongbo-zhi-dodge-low').actor.skills.dodge, 279);
    assert.equal(get('murongbo-zhi-grant').actor.skills['canhe-zhi'], 140);
    assert.equal(get('murongbo-zhi-shen-high').actor.properties.shen, -74999);
    for (const c of cases) {
        assert.ok(!Object.hasOwn(c.parameters.actor.properties, 'born_family'));
        assert.ok(!Object.hasOwn(c.parameters.actor.properties, 'family/master_id'));
    }
});
