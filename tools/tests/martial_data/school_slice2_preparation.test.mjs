import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice2SourcePaths, slice2Conditions, slice2ReviewedSourceHash } from './school_slice2_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');

// Frozen representative-slice matrix. Source drift requires renewed review.
test('slice2 四派有限矩阵：51 条件/904 正式/85 烟雾，正式与烟雾哈希冻结', () => {
    const cases = slice2Conditions(catalog, read), smoke = slice2Conditions(catalog, read, { smoke: true });
    assert.equal(cases.length, 51);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 904);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 85);
    // 2026-10-17 依据预研文档与源码复核冻结：wudu count=30 固定靶、
    // tiezhang UNARMED 不加 apply、shenlong 三段费用、xuanming 双 do_damage。
    // tiezhang/xuanming 绝招门槛高于 200，baseLevel 250。
    // slice2ReviewedSourceHash 初始 PENDING，首次正式采集后钉住。
    assert.equal(hash(cases), '0a3bce7cb8e83bbe4546ac4899b5b232d53359e5ea7796b7b40f441f52b96694');
    assert.equal(hash(smoke), '0b0f3775db96ea81029375c22aa8c05aa5e5e479c2178064ab231d146888b5e1');
    for (const c of cases) {
        assert.deepEqual(Object.keys(c.parameters.source_evidence).sort(), [...slice2SourcePaths].sort());
        if (slice2ReviewedSourceHash !== 'PENDING')
            assert.equal(hash(Object.entries(c.parameters.source_evidence)), slice2ReviewedSourceHash);
    }
});

test('slice2 来源钉住真实字节；缺席来源不伪造', () => {
    const cases = slice2Conditions(catalog, read);
    for (const path of slice2SourcePaths) {
        assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    }
    assert.ok(slice2SourcePaths.every(p => !p.includes('..')));
});
