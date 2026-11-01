import test from 'node:test';
import assert from 'node:assert/strict';
import { crosswalkItems, linkTeaching, linkEffect, finalizeItems, crosswalkSummary, crosswalkMarkdown, legacyPendingSkills } from './teaching_crosswalk.mjs';

const evidence = { path:'kungfu/class/a/t.c', sha256:'a'.repeat(64), start:10,end:20,line:2 };
function setup() {
    const items=crosswalkItems({ objects:[{path:evidence.path,group:'a',
        gates:[{function:'ask_skill1',evidence}], grants:[{function:'ask_skill1',evidence,
            role:'player_grant_candidate',grant:'can_perform/test/hit',entries:['kungfu/skill/test/hit.c'],
            authorization_reads:[{path:'kungfu/skill/test/hit.c',sha256:'b'.repeat(64)}],resolution:'authorization_read'}]}] });
    const c={parameters:{teacher:{path:'/kungfu/class/a/t'},teaching_entry:{...evidence,function:'ask_skill1'},
        teaching_evidence:evidence,monitored_grants:['can_perform/test/hit']}};
    const ref={smoke:false,complete:true,passed:2}; return {items,c,ref};
}
test('exact teacher/function/version/statement joins all declarations without skill-name shortcuts',()=>{
    const {items,c,ref}=setup();linkTeaching(items,c,ref);
    assert.equal(crosswalkSummary(finalizeItems(items)).all_have_formal_teaching_reference,true);
    assert.equal(crosswalkSummary(finalizeItems(items)).task_acceptance,'not_inferred_from_reference_counts');
    assert.equal(new Set(items.map(i=>i.id)).size,2);
});
test('smoke, missing mode, incomplete or failed observation cannot close teaching',()=>{
    for(const patch of [{smoke:true},{smoke:null},{complete:false},{passed:0}]){
        const {items,c,ref}=setup();linkTeaching(items,c,{...ref,...patch});
        assert.equal(crosswalkSummary(finalizeItems(items)).teaching_linked,0);
    }
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
