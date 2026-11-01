import test from 'node:test';
import assert from 'node:assert/strict';
import { crosswalkItems, linkTeaching, linkEffect, finalizeItems, crosswalkSummary, crosswalkMarkdown, legacyPendingSkills, teachingProcessComplete, teachingReuseSelection, verifyTeachingFlowGate } from './teaching_crosswalk.mjs';
import { sha256 } from './inventory.mjs';
import { digest } from './ledger.mjs';

const evidence = { path:'kungfu/class/a/t.c', sha256:'a'.repeat(64), start:10,end:20,line:2 };
function setup() {
    const items=crosswalkItems({ objects:[{path:evidence.path,group:'a',
        gates:[{function:'ask_skill1',evidence}], grants:[{function:'ask_skill1',evidence,
            role:'player_grant_candidate',grant:'can_perform/test/hit',entries:['kungfu/skill/test/hit.c'],
            authorization_reads:[{path:'kungfu/skill/test/hit.c',sha256:'b'.repeat(64)}],resolution:'authorization_read'}]}] });
    const c={parameters:{teacher:{path:'/kungfu/class/a/t'},teaching_entry:{...evidence,function:'ask_skill1'},
        teaching_evidence:evidence,monitored_grants:['can_perform/test/hit']}};
    const ref={smoke:false,complete:true,process_complete:true,passed:2}; return {items,c,ref};
}
test('exact teacher/function/version/statement joins all declarations without skill-name shortcuts',()=>{
    const {items,c,ref}=setup();linkTeaching(items,c,ref);
    assert.equal(crosswalkSummary(finalizeItems(items)).all_have_formal_teaching_reference,true);
    assert.equal(crosswalkSummary(finalizeItems(items)).task_acceptance,'not_inferred_from_reference_counts');
    assert.equal(new Set(items.map(i=>i.id)).size,2);
});
test('smoke, missing mode, incomplete or failed observation cannot close teaching',()=>{
    for(const patch of [{smoke:true},{smoke:null},{complete:false},{passed:0},
        {process_complete:false},{process_complete:undefined}]){
        const {items,c,ref}=setup();linkTeaching(items,c,{...ref,...patch});
        assert.equal(crosswalkSummary(finalizeItems(items)).teaching_linked,0);
    }
});

test('formal teaching requires an actual successful process with no partial output or validator errors',()=>{
    const run={process:{code:0,signal:null},validation_errors:[],incomplete_bytes:0};
    assert.equal(teachingProcessComplete([run]),true);
    assert.equal(teachingProcessComplete([{...run,validation_errors:0}]),true);
    for(const patch of [{process:{code:1,signal:null}},{process:{code:0,signal:'SIGTERM'}},
        {validation_errors:['failure']},{incomplete_bytes:1},{validation_errors:undefined}])
        assert.equal(teachingProcessComplete([{...run,...patch}]),false);
});

test('reuse chooses existing complete formal conditions, not new sampling or smoke/failed candidates',()=>{
    const reference={smoke:false,complete:true,passed:2,planned:2,observed:2};
    const selection=teachingReuseSelection({items:[{teaching:[
        {...reference,directory:'failed',condition:'earlier'},
        {...reference,directory:'valid',condition:'smoke',smoke:true},
        {...reference,directory:'valid',condition:'long',planned:100},
        {...reference,directory:'valid',condition:'short'},
    ]},{teaching:[]}]},directory=>directory==='valid');
    assert.deepEqual(selection,{valid:['short']});
});

test('flow re-anchor requires verified complete records, exact actors and a unique gate source message', () => {
    const literal = '尚未达到本门收徒要求';
    const source = `void attempt_apprentice() { command("say ${literal}"); }`;
    const item = { kind: 'gate', teacher: 'kungfu/class/a/t.c', function: 'attempt_apprentice',
        source: { path: 'kungfu/class/a/t.c', sha256: sha256(source), start: 0, end: source.length } };
    const c = { id: 'flow', samples: 2, parameters: { teacher: { path: '/kungfu/class/a/t' },
        teaching_entry: { path: item.source.path, sha256: item.source.sha256 },
        teaching_profile: 'recruit', action: 'apprentice teacher' } };
    const ref = { condition: c.id, condition_sha256: digest(c),
        smoke: false, process_complete: true, complete: true, passed: 2 };
    const rows = [0,1].map(index => ({ condition_id: c.id, index, raw_sha256: String(index), raw: {
        before: [{ object: '/tests/actor#2' }], after: [{ object: '/tests/actor#2' }],
        teaching: [{ teacher_program: c.parameters.teacher.path, teacher: c.parameters.teacher.path + '#3',
            student: '/tests/actor#2', command: c.parameters.action, messages: [{ text: literal }] }] } }));
    const link = verifyTeachingFlowGate(item, c, ref, rows, source, literal);
    assert.equal(link.matching_records.length, 2);
    assert.equal(link.link_type, 'unique_gate_message_in_verified_flow');
    for (const patch of [{ smoke: true }, { process_complete: false }, { complete: false }, { passed: 0 },
        { condition: 'foreign' }, { condition_sha256: 'bad' }])
        assert.throws(() => verifyTeachingFlowGate(item, c, { ...ref, ...patch }, rows, source, literal));
    assert.throws(() => verifyTeachingFlowGate({ ...item, kind: 'grant' }, c, ref, rows, source, literal));
    assert.throws(() => verifyTeachingFlowGate(item, c, ref, rows.slice(1), source, literal));
    for (const mutate of [
        r => { r[0].raw.teaching[0].teacher_program = '/other'; },
        r => { r[0].raw.teaching[0].teacher = c.parameters.teacher.path + '#invented'; },
        r => { r[0].raw.teaching[0].student = '/other#1'; },
        r => { r[0].raw.teaching[0].command = 'ask teacher about all'; },
        r => { for (const row of r) row.raw.teaching[0].messages = []; },
    ]) {
        const bad = structuredClone(rows); mutate(bad);
        assert.throws(() => verifyTeachingFlowGate(item, c, ref, bad, source, literal));
    }
    const duplicate = source + `\nstring other() { return "${literal}"; }`;
    const changed = { ...item, source: { ...item.source, sha256: sha256(duplicate) } };
    const changedCondition = structuredClone(c);
    changedCondition.parameters.teaching_entry.sha256 = changed.source.sha256;
    assert.throws(() => verifyTeachingFlowGate(changed, changedCondition,
        { ...ref, condition_sha256: digest(changedCondition) }, rows, duplicate, literal), /ambiguous/);
    assert.throws(() => verifyTeachingFlowGate(item, c, ref, rows, source + ' ', literal), /source changed/);
    assert.throws(() => verifyTeachingFlowGate(item, c, ref, rows, source, '别处教师说过的一句话'));
});

test('generic probe never acquires a formal teaching link even when every slot says passed',()=>{
    const {items,c,ref}=setup();
    c.parameters.teaching_profile='probe';
    linkTeaching(items,c,{...ref,observed:2});
    assert.equal(crosswalkSummary(finalizeItems(items)).teaching_linked,0);
});
test('source drift, different teacher/function and unobserved grant statement stay open',()=>{
    for(const mutate of [c=>c.parameters.teacher.path='/kungfu/class/b/t',
        c=>c.parameters.teaching_entry.sha256='c'.repeat(64),
        c=>c.parameters.teaching_entry.function='other']){
        const {items,c,ref}=setup();mutate(c);linkTeaching(items,c,ref);
        assert.equal(items.filter(i=>i.teaching.length).length,0);
    }
    const {items,c,ref}=setup();c.parameters.teaching_evidence={...evidence,start:11};linkTeaching(items,c,ref);
    assert.equal(items[0].teaching.length,1);assert.equal(items[1].teaching.length,0);
});
test('injected grant effect can never become teacher acquisition',()=>{
    const {items}=setup();const c={parameters:{skill:'test',ability:'hit',ability_source:{path:'kungfu/skill/test/hit.c',sha256:'b'.repeat(64)}}};
    const cat={skills:[{path:'kungfu/skill/test/hit.c',sha256:'b'.repeat(64)}]};
    linkEffect(items,c,{smoke:false,complete:true,passed_observed:100},cat);
    const done=finalizeItems(items);assert.equal(done[1].effect.length,1);
    assert.equal(done[1].status,'effect_only_teacher_acquisition_open');
    assert.equal(crosswalkSummary(done).all_have_formal_teaching_reference,false);
});
test('legacy table labelled 23 actually names 18 distinct skills; no invented five rows',()=>{
    assert.equal(legacyPendingSkills.length,18);assert.equal(new Set(legacyPendingSkills).size,18);
});
test('NPC self initialization is separate from player acquisition',()=>{
    const {items}=setup();items[1].role='npc_initial_grant';
    assert.equal(finalizeItems(items)[1].status,'npc_initialization_not_player_teaching');
});
test('a known refusal/function link does not assert all branches or acquired grant',()=>{
    const {items,c,ref}=setup();linkTeaching(items,c,{...ref,observed:0,refused:2});
    const report={source_fingerprint:'test',items:finalizeItems(items),legacy_pending:[],limitations:[]};
    report.totals=crosswalkSummary(report.items);
    assert.equal(report.totals.task_acceptance,'not_inferred_from_reference_counts');
    assert.match(crosswalkMarkdown(report),/formal_teaching_linked_branch_coverage_not_claimed/);
});
