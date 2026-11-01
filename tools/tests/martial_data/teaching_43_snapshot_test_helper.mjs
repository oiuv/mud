// Test-only boundary for the exact post-baseline collection inputs.
// Do not change native snapshots or historical sample manifests.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {sha256} from "./inventory.mjs";
export const teaching43SnapshotInputs = [
    "tools/tests/martial_data/fixtures/teaching43_books_goldens.json",
    "tools/tests/martial_data/fixtures/teaching43_goldens.json",
    "tools/tests/martial_data/fixtures/teaching43_kuihua_golden.json",
    "tools/tests/martial_data/fixtures/teaching43_special_0.json",
    "tools/tests/martial_data/fixtures/teaching43_special_1.json",
    "tools/tests/martial_data/fixtures/teaching43_special_2.json",
    "tools/tests/martial_data/fixtures/teaching43_special_3.json",
    "tools/tests/martial_data/fixtures/teaching43_special_4.json",
    "tools/tests/martial_data/fixtures/teaching43_special_5.json",
    "tools/tests/martial_data/fixtures/teaching43_special_6.json",
    "tools/tests/martial_data/fixtures/teaching43_special_7.json",
    "tools/tests/martial_data/fixtures/teaching43_special_8.json",
    "tools/tests/martial_data/fixtures/teaching43_special_9.json",
    "tools/tests/martial_data/fixtures/teaching43_zhou_golden.json",
    "tools/tests/martial_data/perform_probe_cases.mjs",
    "tools/tests/martial_data/probe_observation.mjs",
    "tools/tests/martial_data/teaching_43_access.mjs",
    "tools/tests/martial_data/teaching_43_access.test.mjs",
    "tools/tests/martial_data/teaching_43_async_recruit.mjs",
    "tools/tests/martial_data/teaching_43_async_recruit.test.mjs",
    "tools/tests/martial_data/teaching_43_book_gifts.mjs",
    "tools/tests/martial_data/teaching_43_book_gifts.test.mjs",
    "tools/tests/martial_data/teaching_43_books.mjs",
    "tools/tests/martial_data/teaching_43_books.test.mjs",
    "tools/tests/martial_data/teaching_43_books_data.mjs",
    "tools/tests/martial_data/teaching_43_contract.mjs",
    "tools/tests/martial_data/teaching_43_diagnostics.mjs",
    "tools/tests/martial_data/teaching_43_diagnostics.test.mjs",
    "tools/tests/martial_data/teaching_43_duplicate_case.mjs",
    "tools/tests/martial_data/teaching_43_duplicate_case.test.mjs",
    "tools/tests/martial_data/teaching_43_goldens.test.mjs",
    "tools/tests/martial_data/teaching_43_hong_food.mjs",
    "tools/tests/martial_data/teaching_43_hong_food.test.mjs",
    "tools/tests/martial_data/teaching_43_huashan_grants.mjs",
    "tools/tests/martial_data/teaching_43_huashan_grants.test.mjs",
    "tools/tests/martial_data/teaching_43_jueqing_grants.mjs",
    "tools/tests/martial_data/teaching_43_jueqing_grants.test.mjs",
    "tools/tests/martial_data/teaching_43_kuihua.mjs",
    "tools/tests/martial_data/teaching_43_kuihua.test.mjs",
    "tools/tests/martial_data/teaching_43_learning_cases.mjs",
    "tools/tests/martial_data/teaching_43_learning_cases.test.mjs",
    "tools/tests/martial_data/teaching_43_ordination.mjs",
    "tools/tests/martial_data/teaching_43_ordination.test.mjs",
    "tools/tests/martial_data/teaching_43_ouyang_gift.mjs",
    "tools/tests/martial_data/teaching_43_ouyang_gift.test.mjs",
    "tools/tests/martial_data/teaching_43_permissions.mjs",
    "tools/tests/martial_data/teaching_43_permissions.test.mjs",
    "tools/tests/martial_data/teaching_43_recruit_cases.mjs",
    "tools/tests/martial_data/teaching_43_recruit_cases.test.mjs",
    "tools/tests/martial_data/teaching_43_recruit_data.mjs",
    "tools/tests/martial_data/teaching_43_special_goldens.test.mjs",
    "tools/tests/martial_data/teaching_43_special_grants.mjs",
    "tools/tests/martial_data/teaching_43_special_grants.test.mjs",
    "tools/tests/martial_data/teaching_43_temporal_goldens.test.mjs",
    "tools/tests/martial_data/teaching_43_wudang_grants.mjs",
    "tools/tests/martial_data/teaching_43_wudang_grants.test.mjs",
    "tools/tests/martial_data/teaching_43_zhou.mjs",
    "tools/tests/martial_data/teaching_43_zhou.test.mjs",
    "tools/tests/martial_data/teaching_probe_cases.mjs"
];
export function historicalSnapshotFiles(files) {
    for (const path of teaching43SnapshotInputs) {
        assert.ok(Object.hasOwn(files,path), "missing explicit later input: "+path);
        assert.equal(files[path],sha256(readFileSync(new URL("../../../"+path,import.meta.url))),path);
    }
    return Object.fromEntries(Object.entries(files).filter(([path])=>!teaching43SnapshotInputs.includes(path)));
}
