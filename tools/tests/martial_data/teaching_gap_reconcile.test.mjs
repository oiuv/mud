import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { reconcileTeachingGaps, reconcileMarkdown } from './teaching_gap_reconcile.mjs';

const entry = (path, sha, fn, start = 10, end = 20) => ({ path, sha256: sha, function: fn, start, end, line: 2 });

function fixture() {
    const root = mkdtempSync(join(tmpdir(), 'teaching-gap-'));
    const series = join(root, 'series-a');
    mkdirSync(join(series, 'samples'), { recursive: true });
    writeFileSync(join(series, 'series.json'), JSON.stringify({
        identity: { execution: { smoke: true }, conditions: [
            { id: 'c-exact', method: 'teaching', samples: 2, parameters: {
                teacher: { path: '/kungfu/class/a/t' }, teaching_entry: entry('kungfu/class/a/t.c', 'a'.repeat(64), 'ask_skill1'),
                monitored_grants: ['can_perform/x/y'] } },
            { id: 'c-history', method: 'teaching', samples: 2, parameters: {
                teacher: { path: '/kungfu/class/a/t' }, teaching_entry: entry('kungfu/class/a/t.c', 'b'.repeat(64), 'ask_skill2'),
                monitored_grants: [] } },
            { id: 'c-grant', method: 'teaching', samples: 2, parameters: {
                teacher: { path: '/kungfu/class/a/t' }, teaching_entry: entry('kungfu/class/a/t.c', 'a'.repeat(64), 'accept_ask'),
                monitored_grants: ['can_perform/x/y'], teaching_evidence: { path: 'kungfu/class/a/t.c', sha256: 'a'.repeat(64), start: 99, end: 109 } } },
        ] } }));
    const items = [
        { id: 'gate:exact', kind: 'gate', teacher: 'kungfu/class/a/t.c', group: 'a', function: 'ask_skill1',
            source: { path: 'kungfu/class/a/t.c', sha256: 'a'.repeat(64), start: 10, end: 20 }, teaching: [], status: 'no_verified_formal_teaching_link' },
        { id: 'gate:history', kind: 'gate', teacher: 'kungfu/class/a/t.c', group: 'a', function: 'ask_skill2',
            source: { path: 'kungfu/class/a/t.c', sha256: 'c'.repeat(64), start: 10, end: 20 }, teaching: [], status: 'no_verified_formal_teaching_link' },
        { id: 'grant:key', kind: 'grant', teacher: 'kungfu/class/a/t.c', group: 'a', function: 'ask_skill3',
            grant: 'can_perform/x/y', source: { path: 'kungfu/class/a/t.c', sha256: 'a'.repeat(64), start: 5, end: 9 }, teaching: [], status: 'no_verified_formal_teaching_link' },
        { id: 'gate:none', kind: 'gate', teacher: 'kungfu/class/a/t.c', group: 'a', function: 'permit_recruit',
            source: { path: 'kungfu/class/a/t.c', sha256: 'a'.repeat(64), start: 50, end: 60 }, teaching: [], status: 'no_verified_formal_teaching_link' },
        { id: 'gate:linked', kind: 'gate', teacher: 'kungfu/class/a/t.c', group: 'a', function: 'ask_skill9',
            source: { path: 'kungfu/class/a/t.c', sha256: 'a'.repeat(64), start: 70, end: 80 }, teaching: [{}], status: 'formal_teaching_linked_branch_coverage_not_claimed' },
        { id: 'grant:npc', kind: 'grant', teacher: 'kungfu/class/a/t.c', group: 'a', function: 'create',
            grant: 'can_perform/npc/z', source: { path: 'kungfu/class/a/t.c', sha256: 'a'.repeat(64), start: 1, end: 5 }, teaching: [], status: 'npc_initialization_not_player_teaching' },
    ];
    const crosswalk = join(root, 'crosswalk.json');
    writeFileSync(crosswalk, JSON.stringify({ items }));
    return { root, crosswalk };
}

test('逐项对账按锚点分类：精确候选/历史版本/仅授权键/无引用/已关联/既有处置', () => {
    const { root, crosswalk } = fixture();
    try {
        const report = reconcileTeachingGaps(root, crosswalk);
        const byId = Object.fromEntries(report.items.map(i => [i.id, i]));
        assert.equal(byId['gate:exact'].category, 'has_candidate');
        assert.equal(byId['gate:exact'].exact_entry_refs.length, 1, '精确入口候选');
        assert.equal(byId['gate:history'].category, 'historical_version');
        assert.equal(byId['gate:history'].historical_version_refs[0].entry_sha256, 'b'.repeat(64));
        assert.equal(byId['grant:key'].category, 'grant_key_only');
        assert.equal(byId['gate:none'].category, 'no_reference');
        assert.equal(byId['gate:linked'].category, 'already_linked');
        assert.equal(byId['grant:npc'].category, 'prior_disposition');
        assert.deepEqual(report.totals.categories, { has_candidate: 1, historical_version: 1,
            grant_key_only: 1, no_reference: 1, already_linked: 1, prior_disposition: 1 });
        assert.match(reconcileMarkdown(report), /has_candidate \| 1/);
        assert.match(reconcileMarkdown(report), /不证明其他位置/);
    } finally { rmSync(root, { recursive: true, force: true }); }
});
