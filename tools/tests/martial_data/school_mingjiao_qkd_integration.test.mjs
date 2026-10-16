// Wiring assertions only. Native samples are kept in independent external series.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { mingjiaoQkdConditions, mingjiaoQkdSourcePaths } from './school_mingjiao_qkd_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = mingjiaoQkdConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('乾坤防御独立追加39条件，正式3430、烟雾78；五项低概率条件各300', () => {
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'mingjiao-qkd'), cases);
    assert.equal(cases.length, 39);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3430);
    assert.equal(mingjiaoQkdConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 78);
    assert.equal(cases.filter(c => c.samples === 300).length, 5);
    assert.ok(cases.every(c => c.parameters.observe_seconds === 0 && c.parameters.callback_if_queued));
});

test('乾坤124来源和五份新工具准确冻结；调用与来源变化不能静默接受', () => {
    const s = snapshot(); validateQualificationSources(cases, s.files);
    assert.equal(mingjiaoQkdSourcePaths.length, 124);
    assert.ok(mingjiaoQkdSourcePaths.includes('adm/daemons/combatd.c'));
    for (const c of cases) {
        assert.match(c.parameters.source_entry.sha256, /^[a-f0-9]{64}$/);
        if (c.parameters.direct_source_entry)
            assert.equal(c.parameters.direct_source_entry.sha256, s.files['adm/daemons/combatd.c']);
    }
    for (const path of mingjiaoQkdSourcePaths) assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    for (const name of ['cases.mjs', 'cases.test.mjs', 'integration.test.mjs', 'report.mjs', 'report.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_qkd_' + name;
        assert.equal(s.files[path], sha256(readFileSync(join(root, path))));
    }
    assert.throws(() => validateQualificationSources(cases, { ...s.files,
        [mingjiaoQkdSourcePaths[0]]: '0'.repeat(64) }));
    const wrong = structuredClone(cases[0]); wrong.parameters.interface.object = '/kungfu/skill/force';
    assert.throws(() => validateQualificationSources([wrong], s.files));
});

test('乾坤观察真实USER回调和三元队列，只在本动作实际排队时等尾部', () => {
    const src = read('tools/tests/martial_data/runner.lpc');
    assert.match(src, /entry\[0\] != players\[1\] \|\| entry\[1\] != "eval_function"/);
    assert.match(src, /sizeof\(entry\) == 3 && intp\(entry\[2\]\)/);
    assert.match(src, /side == 1 && owner == me && base_name\(me\) == "\/tests\/actor"/);
    assert.match(src, /frames\[1\] == "eval_function"/);
    assert.match(src, /if \(sizeof\(current\["qkd_queue"\]\["immediate"\]\["pending"\]\)\) call_out\("finish_sample", 2\)/);
    assert.match(src, /"mingjiao-qkd" \? spec\["percent"\] : 50/);
    assert.match(src, /current\["qkd_queue"\]\["final"\] = qkd_queue_point\(\);\s*active = 0;/);
    assert.doesNotMatch(src, /call_other\([^\n]*"nuoyi"/);
    assert.doesNotMatch(src, /random\([^\n]*mingjiao-qkd/);
});

test('旧石门排队观察不得挤到桃花立即快照和原物品观察之间', () => {
    const src = read('tools/tests/martial_data/runner.lpc');
    const qkd = src.indexOf('"only this action may schedule one original QKD callback"');
    assert.ok(qkd > src.indexOf('observe_taohua_po_weapon("immediate");'));
    assert.ok(qkd > src.indexOf('observe_ling_weapon("immediate");'));
});
