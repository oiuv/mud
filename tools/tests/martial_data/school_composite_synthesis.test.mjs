import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { compositeSynthesisConditions, compositeSynthesisProfiles } from './school_composite_synthesis_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = compositeSynthesisConditions(catalog);

test('G3 合成链：2 主技能 × 2 条件 = 4 条件（成功+不足门槛）', () => {
    assert.equal(cases.length, 4);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        assert.equal(c.method, 'yanlian');
        assert.equal(c.parameters.collection_group, 'composite-synthesis');
        assert.ok(c.parameters.action.startsWith('yanlian '), c.id);
        for (const p of c.parameters.qualification_sources)
            assert.ok(existsSync(join(root, p)), p);
    }
    // 2 success + 2 below-threshold
    assert.equal(cases.filter(c => Array.isArray(c.parameters.expected)
        && c.parameters.expected.includes('observed') && c.parameters.expected.includes('refused')).length, 2);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 2);
});

test('子技能名与源码一致', () => {
    for (const profile of compositeSynthesisProfiles) {
        const source = catalog.skills.find(s => s.id === profile.skill);
        assert.ok(source, '主技能源码缺失：' + profile.skill);
        // Verify sub-skills are in catalog
        for (const sub of profile.subSkills) {
            assert.ok(catalog.skills.some(s => s.id === sub),
                '子技能源码缺失：' + sub + ' (for ' + profile.skill + ')');
        }
    }
});

test('烟雾条件2样本', () => {
    for (const c of compositeSynthesisConditions(catalog, { smoke: true })) {
        assert.equal(c.samples, 2);
    }
});
