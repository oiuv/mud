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
    .filter(c => !['feng', 'quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile))
    .filter(c => !['henshan', 'songshan', 'lingxiao', 'meizhuang', 'lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => ['tiezhang', 'shenlong'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('铁掌神龙四名原 NPC 的十六主题不改写旧条件或预授领悟', () => {
    assert.equal(cases.length, 120); assert.equal(all.length, 2185);
    assert.equal(all.length - cases.length, 2065);
    assert.equal(teachingEntries(cases).length, 6);
    assert.equal(teachingEntries(all).length, 219);
    assert.equal(cases.filter(c => c.id.endsWith('-grant')).length, 16);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 35);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.samples, 2); assert.equal(c.status, 'configured_not_executed');
        assert.equal(p.action, `ask ${p.teacher.id} about ${p.topic}`);
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_')));
        const group = p.teacher.path.includes('/tiezhang/') ? 'tiezhang' : 'shenlong';
        assert.ok(p.qualification_sources.includes(`kungfu/class/${group}/${group}.h`));
    }
});

test('穿心锥只计一个主题，保留两处等价分支并拒绝来源漂移', () => {
    const p = get('situfen-zhui-grant');
    assert.deepEqual(p.equivalent_teaching_evidence.map(e => e.line), [183, 208]);
    assert.equal(p.actor.skills.force, 300);
    assert.equal(p.actor.skills.dodge, 440);
    assert.equal(get('situfen-zhui-dodge-low').actor.skills.dodge, 439);
    assert.equal(get('situfen-zhui-max-neili-low').actor.properties.max_neili, 199);
    const changed = structuredClone(relations);
    changed.objects.find(o => o.path === 'kungfu/class/tiezhang/fen.c').grants
        .find(g => g.evidence.line === 208).fields.gongxian.value++;
    assert.throws(() => teachingConditions(changed, catalog));
});

test('铁掌帮十三项保留不同贡献、有效内功及最大内力门槛', () => {
    const iron = cases.filter(c => c.parameters.teacher.path.includes('/tiezhang/'));
    assert.equal(iron.length, 102);
    for (const c of iron.filter(c => c.id.endsWith('-grant'))) {
        const id = c.id.slice(9, -6), p = c.parameters;
        assert.equal(get(id + '-force-low').actor.skills.force, p.actor.skills.force - 1);
        assert.equal(get(id + '-shen-high').actor.properties.shen, p.actor.properties.shen + 1);
        assert.equal(get(id + '-contribution-low').expected, 'refused');
        assert.equal(get(id + '-repeat').teaching_expectations[1].contribution_spent, 0);
    }
    assert.equal(get('qiuqianren-yin-grant').actor.properties.max_neili, 3500);
    assert.equal(get('qiuqianren-long-grant').actor.properties.gongxian, 300);
    assert.equal(get('qiuqianzhang-fei-grant').actor.skills.force, 480);
});

test('洪安通原私有询问无贡献扣费，不虚构免费公共教学或内力门槛', () => {
    for (const suffix of ['fei', 'xian', 'cui']) {
        const id = 'hongantong-' + suffix, p = get(id + '-grant');
        assert.equal(p.teaching_entry.function, 'ask_' + suffix);
        assert.equal(p.actor.properties.gongxian, 0);
        assert.equal(p.actor.skills.force, 0);
        assert.equal(p.actor.properties.max_neili, undefined);
        const negative = get(id + '-contribution-negative');
        assert.equal(negative.actor.properties.gongxian, -1);
        assert.equal(negative.expected, 'observed');
        assert.equal(negative.teaching_expectations[0].contribution_spent, 0);
        assert.equal(get(id + '-family-other').expected, 'refused');
        assert.equal(get(id + '-skill-low').actor.skills['shedao-qigong'], suffix === 'fei' ? 99 : 119);
        assert.equal(get(id + '-shen-high').actor.properties.shen, suffix === 'fei' ? -39999 : -49999);
        assert.ok(!cases.some(c => c.id === `teaching-${id}-force-low`));
    }
});
