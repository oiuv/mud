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
    .filter(c => !['xueshan', 'xuedao', 'xingxiu', 'xuanming', 'tiezhang', 'shenlong', 'henshan', 'songshan', 'lingxiao', 'meizhuang', 'lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => ['duan', 'tianlongsi'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('段氏十四项与鸠摩智两项分别进入真实询问；历史 1586 条不混算', () => {
    assert.equal(all.length, 1722); assert.equal(cases.length, 136);
    assert.equal(all.length - cases.length, 1586);
    assert.equal(teachingEntries(all).length, 184); assert.equal(teachingEntries(cases).length, 16);
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path)).size, 8);
    assert.equal(cases.filter(c => c.id.endsWith('-grant')).length, 16);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 46);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.samples, 2); assert.equal(c.status, 'configured_not_executed');
        assert.equal(p.action, `ask ${p.teacher.id} about ${p.topic}`);
        assert.equal(p.fighting, false);
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_')));
        const source = inventory.files.find(f => f.path === p.teacher.path.slice(1) + '.c');
        assert.ok(source.functions.some(f => f.name === p.teaching_entry.function && f.line === p.teaching_entry.line));
        if (p.teacher.path.includes('/duan/')) assert.ok(p.qualification_sources.includes('kungfu/class/duan/duan.h'));
    }
});

test('神值零门槛与不检查神值分开，不能用门派印象补入限制', () => {
    for (const id of ['daobaifeng-xi', 'duanzhengchun-jing', 'duanzhengming-lian']) {
        assert.equal(get(id + '-grant').actor.properties.shen, 0);
        assert.equal(get(id + '-shen-low').actor.properties.shen, -1);
        assert.equal(get(id + '-shen-low').expected, 'refused');
    }
    for (const id of ['guducheng-cuo', 'huahegen-shi', 'zhudanchen-ding', 'duanzhengchun-zhi',
        'duanzhengchun-bian', 'duanzhengchun-man', 'duanzhengming-heal']) {
        assert.equal(get(id + '-shen-accepted-1').actor.properties.shen, -1);
        assert.equal(get(id + '-shen-accepted-1').expected, 'observed');
    }
    assert.equal(get('daobaifeng-xi-grant').actor.properties.gender, '男性');
});

test('一灯剑气接受两派，经络与一阳指各有独立等级门槛', () => {
    const p = get('yideng-jian-grant');
    assert.equal(p.topic, '先天功乾阳剑气');
    assert.equal(p.actor.skills.force, 1000);
    assert.equal(get('yideng-jian-force-low').actor.skills.force, 999);
    assert.equal(get('yideng-jian-family-accepted-1').actor.properties['family/family_name'], '全真教');
    assert.equal(get('yideng-jian-family-accepted-1').expected, 'observed');
    assert.equal(get('yideng-jian-family-other').expected, 'refused');
    for (const [skill, level] of [['yiyang-zhi', 280], ['jingluo-xue', 200]]) {
        assert.equal(p.actor.skills[skill], level);
        assert.equal(get(`yideng-jian-${skill}-low`).actor.skills[skill], level - 1);
        assert.equal(get(`yideng-jian-${skill}-low`).expected, 'refused');
    }
    assert.equal(Object.hasOwn(get('duanzhengming-lian-grant').actor.properties, 'max_neili'), false);
});

test('鸠摩智实际师承密宗，但两项询问不检查门派；邪气门槛方向相反', () => {
    for (const [suffix, shen] of [['fen', -65000], ['yan', -120000]]) {
        const id = 'jiumozhi-' + suffix;
        assert.equal(get(id + '-grant').actor.properties['family/family_name'], '密宗');
        assert.equal(get(id + '-grant').actor.properties.shen, shen);
        assert.equal(get(id + '-shen-high').actor.properties.shen, shen + 1);
        assert.equal(get(id + '-shen-high').expected, 'refused');
        for (const variant of ['family-other', 'family-accepted-1', 'family-accepted-2']) {
            assert.equal(get(id + '-' + variant).expected, 'observed');
        }
        assert.equal(get(id + '-family-accepted-2').actor.properties['family/family_name'], '');
    }
    assert.equal(get('jiumozhi-fen-grant').actor.skills.force, 0);
    assert.equal(Object.hasOwn(get('jiumozhi-fen-grant').actor.properties, 'max_neili'), false);
});
