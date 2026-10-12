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
    .filter(c => !['duan', 'tianlongsi', 'xueshan', 'xuedao', 'xingxiu', 'xuanming', 'tiezhang', 'shenlong', 'henshan', 'songshan', 'lingxiao', 'meizhuang', 'lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => c.parameters.teacher.path.includes('/mingjiao/'));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('明教 23 项传招增加 179 条条件；旧 1407 条仍独立，未冒充普通学习或战斗完成', () => {
    assert.equal(all.length, 1586); assert.equal(all.length - cases.length, 1407);
    assert.equal(cases.length, 179); assert.equal(teachingEntries(cases).length, 7);
    assert.equal(teachingEntries(all).length, 168);
    assert.equal(cases.filter(c => c.id.endsWith('-grant')).length, 23);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 66);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.samples, 2); assert.equal(c.status, 'configured_not_executed');
        assert.equal(p.action, `ask ${p.teacher.id} about ${p.topic}`);
        assert.equal(p.teaching_entry.function, 'accept_ask');
        assert.ok(p.qualification_sources.includes('kungfu/class/mingjiao/mingjiao.h'));
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_')));
        assert.equal(p.fighting, false);
    }
});

test('九阳五招的 free 仅放开同门限制；零费用、无神值门槛与负贡献拒绝按原行为分开', () => {
    for (const suffix of ['hun', 'jiu', 'po', 'pi', 'ri']) {
        const id = 'zhangwuji-' + suffix;
        for (const variant of ['grant', 'repeat', 'family-other', 'family-accepted-1', 'shen-negative', 'shen-positive']) {
            const p = get(id + '-' + variant);
            assert.equal(p.expected, 'observed');
            assert.ok(p.teaching_expectations.every(e => e.value === 1 && e.contribution_spent === 0));
            assert.equal(p.actor.properties.gongxian, 0);
        }
        assert.equal(get(id + '-family-accepted-1').actor.properties['family/family_name'], '');
        const low = get(id + '-contribution-low');
        assert.equal(low.actor.properties.gongxian, -1); assert.equal(low.expected, 'refused');
    }
    for (const c of cases.filter(c => c.id.endsWith('-family-other')
        && !c.parameters.monitored_grants[0].includes('/jiuyang-shengong/'))) {
        assert.equal(c.parameters.expected, 'refused');
    }
});

test('sk2/sk3 原始基本等级与 force/dodge 有效等级不能混用；每项独立低一边界', () => {
    for (const [suffix, basic] of [['po', 'sword'], ['pi', 'blade']]) {
        const p = get('zhangwuji-' + suffix + '-grant');
        assert.equal(p.actor.skills.force, 240); assert.equal(p.actor.skills[basic], 240);
        assert.deepEqual(p.actor.mappings, {});
        for (const skill of ['force', basic]) {
            const low = get(`zhangwuji-${suffix}-required-${skill}-low`);
            assert.equal(low.actor.skills[skill], 239); assert.equal(low.expected, 'refused');
        }
    }
    assert.equal(get('zhangwuji-hun-grant').actor.skills.force, 540);
    assert.equal(get('zhangwuji-hun-force-low').actor.skills.force, 539);
    assert.equal(get('yangxiao-kuai-grant').actor.skills.dodge, 520);
    assert.equal(get('yangxiao-kuai-dodge-low').actor.skills.dodge, 519);
});

test('保留原错误显示名称及正确领悟字段，来源改动须拒绝而非静默修正', () => {
    const p = get('daijisi-hua-grant');
    assert.equal(p.topic, '天外飞花'); assert.equal(p.known_issue, 'MA-030');
    assert.deepEqual(p.monitored_grants, ['can_perform/duoming-jinhua/hua']);
    const changed = structuredClone(relations);
    const grant = changed.objects.find(o => o.path === 'kungfu/class/mingjiao/daijisi.c').grants
        .find(g => g.grant === p.monitored_grants[0]);
    assert.equal(grant.fields.name.value, '绝杀');
    grant.fields.name.value = '天外飞花';
    assert.throws(() => teachingConditions(changed, catalog), /教学字段改变/);
});
