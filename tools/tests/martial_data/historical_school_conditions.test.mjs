import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { isOctober29Window, preOctober29SchoolConditions } from './historical_school_conditions.mjs';

const catalog = collectCatalog(root, buildInventory(root));

test('历史视图仅排除本轮具名窗口，不修改旧条件或放宽旧快照hash', () => {
    for (const [smoke, added, samples, hash] of [
        [false, 543, 396578, '923372129137cf270f21ab854b3b1d0a9d16dc77fa18881d6ff6dfe0913bec90'],
        [true, 539, 25539, '33d125d253cacf0759843fa1a86e723e79125c707816acaca4196b635247c8a6'],
    ]) {
        const all = schoolCombatConditions(catalog, { smoke });
        const old = preOctober29SchoolConditions(catalog, { smoke });
        assert.equal(all.length - old.length, added);
        assert.deepEqual(old, all.filter(c => !isOctober29Window(c)));
        assert.deepEqual(all.slice(0, old.length), old, '新增窗口只放末尾，不插入旧矩阵');
        const prefix = old.slice(0, 15378);
        assert.equal(prefix.reduce((n, c) => n + c.samples, 0), samples);
        assert.equal(sha256(JSON.stringify(prefix)), hash);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
    }
});

test('新窗口与旧条件由具名范围区分，不能按等级或数值相似过滤', () => {
    const base = { id: 'old', parameters: { collection_group: 'quanzhen-defense' } };
    assert.equal(isOctober29Window(base), false);
    for (const c of [
        { ...base, id: 'school-quanzhen-boundary-check' },
        { ...base, parameters: { ...base.parameters, target_busy_lifecycle: true } },
        ...['s1-duan-members', 'huashan-duration', 'emei-npc-bout'].map(collection_group =>
            ({ ...base, parameters: { collection_group } })),
    ]) assert.equal(isOctober29Window(c), true);
});
