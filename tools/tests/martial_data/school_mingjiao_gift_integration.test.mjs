// Offline assertions do not establish real-driver gift or learning outcomes.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { teachingEntries } from './teaching_cases.mjs';
import { createSeries } from './ledger.mjs';
import { mingjiaoGiftConditions, mingjiaoGiftSourcePaths } from './school_mingjiao_gift_cases.mjs';
import { mingjiaoRecruitConditions } from './school_mingjiao_recruit_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = mingjiaoGiftConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('16条件32有限记录34原ask，旧拜师85条件保持独立', () => {
    assert.equal(cases.length, 16); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 32);
    assert.equal(cases.reduce((n, c) => n + c.samples * c.parameters.teaching_expectations.length, 0), 34);
    assert.equal(mingjiaoGiftConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 32);
    const all = schoolCombatConditions(catalog);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'mingjiao-gift'), cases);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'mingjiao-recruit'), mingjiaoRecruitConditions(catalog, read));
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.ok(cases.every(c => c.method === 'teaching' && c.parameters.teaching_expectations.every(
        step => step.action === 'ask yang xiao about 幻灵剑')));
});

test('原accept_ask入口登记，不能把赠剑当perform或自然拜师', () => {
    const entries = teachingEntries(cases); assert.equal(entries.length, 1);
    assert.equal(entries[0].path, 'kungfu/class/mingjiao/yangxiao.c');
    assert.equal(entries[0].function, 'accept_ask'); assert.equal(entries[0].line, 118);
    const directory = mkdtempSync(join(tmpdir(), 'mud-mingjiao-gift-unit-'));
    const args = { inventory, catalog, conditions: cases, execution: { synthetic_test_only: true } };
    assert.throws(() => createSeries(directory, args), /条件引用的入口不在源码清单中/);
    assert.doesNotThrow(() => createSeries(directory, { ...args, teachingEntries: entries }));
});

test('122来源及新增四工具冻结，原15文件48接点不扩张', () => {
    const s = snapshot(); validateQualificationSources(cases, s.files);
    assert.equal(mingjiaoGiftSourcePaths.length, 122);
    for (const p of mingjiaoGiftSourcePaths) assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    for (const name of ['school_mingjiao_gift_cases.mjs', 'school_mingjiao_gift_cases.test.mjs',
        'school_mingjiao_gift_integration.test.mjs', 'school_mingjiao_gift_report.test.mjs']) {
        const p = 'tools/tests/martial_data/' + name;
        assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    }
    const fusion = s.probes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = s.probes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    assert.equal(probes.length, 15); assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
});

test('有限准备不能开放任意命令、篡改剑重或虚构资格', () => {
    const s = snapshot();
    for (const mutate of [c => c.parameters.action = 'eval 1',
        c => c.parameters.teaching_expectations[0].action = 'eval 1',
        c => c.parameters.actor.learned = { 'xiaoyao-jian': 1 },
        c => c.parameters.item_setup.item = '/clone/weapon/gangjian',
        c => c.parameters.item_setup.weight = 0,
        c => c.parameters.item_setup.free_capacity++,
        c => c.parameters.item_setup.container_program = '/inherit/item/item',
        c => c.parameters.teacher_properties = { 'family/master_id': 'forged' },
        c => c.parameters.actor.properties.shen++,
        c => c.parameters.teaching_entry.line++]) {
        const c = structuredClone(cases[0]); mutate(c);
        assert.throws(() => validateQualificationSources([c], s.files));
    }
    assert.throws(() => validateQualificationSources(cases, { ...s.files, [mingjiaoGiftSourcePaths[0]]: '0'.repeat(64) }));
});

test('真实单例load及原move，读完整归属链而不预装或复制剑', () => {
    const runner = read('tools/tests/martial_data/runner.lpc'), observer = read('tools/tests/martial_data/teaching_observer.lpc');
    for (const text of ['prepare_mingjiao_gift', 'prepare_mingjiao_gift_items', 'item = load_object(setup["item"])',
        'item->move(owner)', 'container->query_weight() == 0', 'new(ROOM)',
        '"singleton_loaded_before"', '"players_after"', 'clear_mingjiao_gift']) assert.ok(runner.includes(text), text);
    for (const text of ['mingjiao_gift_point', 'find_object(context["item"])', '"owner_chain"', '"weapon_prop"',
        '"armor_prop"', '"stable"', '"item_before"', '"item_after"']) assert.ok(observer.includes(text), text);
    assert.doesNotMatch(runner, /new\("\/clone\/lonely\/huanlingjian"\)/);
});
