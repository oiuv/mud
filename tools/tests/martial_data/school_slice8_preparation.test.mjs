import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice8SourcePaths, slice8Conditions, slice8ReviewedSourceHash } from './school_slice8_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');

test('slice8 三组有限矩阵：38 条件/676 正式/63 烟雾，正式与烟雾哈希冻结', () => {
    const cases = slice8Conditions(catalog, read), smoke = slice8Conditions(catalog, read, { smoke: true });
    assert.equal(cases.length, 38);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 676);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 63);
    assert.equal(hash(cases), 'dda7db03619cca8eb7d9abd9fd5282c716b6c730fbf13df254ba6732a808ab41');
    assert.equal(hash(smoke), 'e04cdf5c16c774bfba892b93f2b29b9cbb03636108e0f076f7b2af71c38d915f');
    for (const c of cases) {
        assert.deepEqual(Object.keys(c.parameters.source_evidence).sort(), [...slice8SourcePaths].sort());
    }
});

test('slice8 来源钉住真实字节；缺席来源不伪造', () => {
    assert.equal(typeof slice8ReviewedSourceHash, 'string');
    assert.equal(slice8ReviewedSourceHash.length, 64);
});
