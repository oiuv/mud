import test from 'node:test';
import assert from 'node:assert/strict';
import { migrated_reference, evidence_exists } from './evidence_reference.mjs';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
test('migration requires a real destination',()=>{
    assert.equal(migrated_reference('temp/a61_costs.json',()=>false).status,'MISSING');
    assert.equal(migrated_reference('temp/a61_costs.json',()=>true).status,'MIGRATED');
});
test('unknown and historical references are not falsely migrated',()=>{
    assert.equal(migrated_reference('temp/a61_definitely_missing.json',()=>true),null);
    assert.equal(evidence_exists('temp/a61_definitely_missing.json'),false);
    assert.equal(migrated_reference('temp/a61_stats2.mjs').status,'HISTORICAL_ONLY');
    assert.equal(migrated_reference('temp/a61_school_map.mjs').status,'HISTORICAL_ONLY');
});
test('glob must match actual entries, not just an existing parent',()=>{
    assert.equal(evidence_exists('tools/martial_summary/not_present_*.json'),false);
    assert.equal(evidence_exists('tools/martial_summary/a61_{costs,stats}.json'),true);
    assert.equal(evidence_exists('tools/martial_summary/a61_*.mjs'),true);
});
test('actual CLI rejects an unknown nonexistent migration reference',()=>{
    let source=readFileSync('tools/martial_summary/a62_links_check.mjs','utf8');
    source=source.replace("'./evidence_reference.mjs'",JSON.stringify(pathToFileURL(resolve('tools/martial_summary/evidence_reference.mjs')).href));
    source=source.replace('const refs = new Set();',"const refs = new Set(['temp/a61_definitely_missing.json']);");
    const result=spawnSync(process.execPath,['--input-type=module','-e',source],{encoding:'utf8',windowsHide:true});
    assert.equal(result.status,1,result.stderr);
    assert.match(result.stdout,/MISS-EVIDENCE temp\/a61_definitely_missing.json/);
    assert.match(result.stdout,/LINKS\/EVIDENCE FAIL/);
});
