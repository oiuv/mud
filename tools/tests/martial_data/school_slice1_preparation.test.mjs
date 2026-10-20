import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice1SourcePaths, slice1Conditions, slice1ReviewedSourceHash } from './school_slice1_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');

// Frozen representative-slice matrix. Source drift requires renewed review.
test('slice1 四派有限矩阵：46 条件/892 正式/77 烟雾，正式与烟雾哈希冻结', () => {
    const cases = slice1Conditions(catalog, read), smoke = slice1Conditions(catalog, read, { smoke: true });
    assert.equal(cases.length, 46);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 892);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 77);
    // 2026-10-16 契约修订后冻结（无正式数据前的本批冻结，依据源码复核）：
    // chan.c 内功门槛是 query_skill("force") 有效值（raw/2+mapped）；打狗棒
    // valid_learn 另有 staff>=自身等级的相对门槛；interface 拒绝的 refusals
    // 为空（证据为 interfaces[0].result=0 与 raw.reason），无探针级拒绝。
    // smoke1–7 保留为修订前历史，不与新系列混算。
    assert.equal(hash(cases), '871fce5c501440adec04aeab97ee1e979249aae18e64cd82bc9a56c38ed8976b');
    assert.equal(hash(smoke), '7555dc1ca4f9fc15546f8e4a6cc22060a6b8cd9c2dbcbc91b5355a3fdea9f465');
    for (const c of cases) {
        assert.deepEqual(Object.keys(c.parameters.source_evidence).sort(), [...slice1SourcePaths].sort());
        assert.equal(hash(Object.entries(c.parameters.source_evidence)), slice1ReviewedSourceHash);
    }
});

test('slice1 来源钉住真实字节；缺席来源不伪造', () => {
    const cases = slice1Conditions(catalog, read);
    for (const path of slice1SourcePaths) {
        assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    }
    assert.ok(slice1SourcePaths.every(p => !p.includes('..')));
});
