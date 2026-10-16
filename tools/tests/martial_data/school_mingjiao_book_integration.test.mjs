// Pure registration/fixture checks are not real gameplay or natural acquisition evidence.
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
import { mingjiaoBookConditions, mingjiaoBookSourcePaths } from './school_mingjiao_book_cases.mjs';
import { mingjiaoGiftConditions } from './school_mingjiao_gift_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = p => readFileSync(join(root, p), 'utf8');
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = mingjiaoBookConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);

test('26/52/56有限原命令；旧赠剑独立且冷载路线未伪成已采', () => {
    assert.equal(cases.length, 26);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 52);
    assert.equal(cases.reduce((n, c) => n + c.samples * c.parameters.teaching_expectations.length, 0), 56);
    assert.deepEqual(mingjiaoBookConditions(catalog, read, { smoke: true }), cases);
    const all = schoolCombatConditions(catalog);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'mingjiao-book'), cases);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'mingjiao-gift'), mingjiaoGiftConditions(catalog, read));
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.equal(cases.filter(c => c.parameters.book_setup.room === '/d/mingjiao/mishi').length, 6);
    assert.ok(cases.every(c => c.parameters.teaching_expectations.every(s => !Object.hasOwn(s, 'teacher_key'))));
});

test('密室、取书、原研读三入口均登记来源，不用假教师', () => {
    const entries = teachingEntries(cases);
    assert.equal(entries.length, 3);
    assert.deepEqual(entries.map(e => e.path).sort(), ['cmds/skill/study.c', 'cmds/std/get.c', 'd/mingjiao/mishi.c']);
    const directory = mkdtempSync(join(tmpdir(), 'mud-mingjiao-book-unit-'));
    const args = { inventory, catalog, conditions: cases,
        execution: { synthetic_test_only: true, source_files: snapshot().files } };
    assert.throws(() => createSeries(directory, args), /条件引用的入口不在源码清单中/);
    assert.doesNotThrow(() => createSeries(directory, { ...args, teachingEntries: entries }));
    const missing = mkdtempSync(join(tmpdir(), 'mud-mingjiao-book-missing-source-'));
    assert.throws(() => createSeries(missing, { ...args, teachingEntries: entries,
        execution: { synthetic_test_only: true } }), /教学入口不属于源码快照/);
    const foreign = structuredClone(cases[0]);
    foreign.parameters.collection_group = 'not-the-book-group';
    assert.throws(() => teachingEntries([foreign]));
});

test('50原依赖、四新增工具与既有15/48观察点闭合', () => {
    const s = snapshot(); validateQualificationSources(cases, s.files);
    assert.equal(mingjiaoBookSourcePaths.length, 50);
    for (const p of mingjiaoBookSourcePaths) assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    for (const name of ['school_mingjiao_book_cases.mjs', 'school_mingjiao_book_cases.test.mjs',
        'school_mingjiao_book_integration.test.mjs', 'school_mingjiao_book_report.test.mjs']) {
        const p = 'tools/tests/martial_data/' + name;
        assert.equal(s.files[p], sha256(readFileSync(join(root, p))));
    }
    const fusion = s.probes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = s.probes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    assert.equal(probes.length, 15);
    assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
});

test('有限书籍路径、原费用与资格不可变，入口放行不扩大为任意场景', () => {
    const s = snapshot();
    for (const mutate of [c => c.parameters.action = 'eval 1',
        c => c.parameters.teaching_expectations[0].action = 'eval 1',
        c => c.parameters.teaching_expectations[0].teacher_key = 'none',
        c => c.parameters.actor.learned = { 'qiankun-danuoyi': 1 },
        c => c.parameters.book_setup.room = '/d/city/kedian',
        c => c.parameters.book_setup.free_capacity++,
        c => c.parameters.book_setup.weight = 0,
        c => c.parameters.actor.properties.jing++,
        c => c.parameters.teaching_entry.line++]) {
        const c = structuredClone(cases[0]); mutate(c);
        assert.throws(() => validateQualificationSources([c], s.files));
    }
    assert.throws(() => validateQualificationSources(cases, { ...s.files, [mingjiaoBookSourcePaths[0]]: '0'.repeat(64) }));
});

test('加载与移位只准备原物，观察只find；升级不靠人为improve或额外探针', () => {
    const runner = read('tools/tests/martial_data/runner.lpc'), observer = read('tools/tests/martial_data/teaching_observer.lpc');
    const prep = runner.slice(runner.indexOf('void prepare_mingjiao_book_items()'), runner.indexOf('void prepare_mingjiao_book(mapping'));
    const point = observer.slice(observer.indexOf('mapping mingjiao_book_point('), observer.indexOf('// The original weapon singleton'));
    assert.match(prep, /this_player\(\) == players\[0\]/);
    assert.match(prep, /book = load_object\("\/clone\/book\/qiankun_book"\)/);
    assert.match(prep, /holder != "cold"/);
    assert.match(prep, /book->move\(owner\)/);
    assert.doesNotMatch(prep, /improve_skill|set_skill|call_other.*do_ketou|new\("\/clone\/book/);
    assert.match(point, /taohua_book_point\(context\)/);
    assert.match(point, /all_inventory\(carrier\)/);
    assert.match(point, /base_name\(item\) != "\/d\/mingjiao\/obj\/yixin"/);
    assert.doesNotMatch(point, /load_object|new\(|set\(|move\(/);
    const cleanup = runner.slice(runner.indexOf('void clear_mingjiao_book()'), runner.indexOf('// Finite original teacher pool'));
    assert.ok(cleanup.indexOf('if (!objectp(mingjiao_book_room))') < cleanup.indexOf('deep_inventory(mingjiao_book_room)'));
    assert.match(cleanup, /"preparation_incomplete": 1/);
});
