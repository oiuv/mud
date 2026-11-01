import test from 'node:test';
import assert from 'node:assert/strict';
import { crosswalkItems, linkTeaching, linkEffect, finalizeItems, crosswalkSummary, crosswalkMarkdown, legacyPendingSkills, teachingProcessComplete, teachingReuseSelection, verifyTeachingFlowGate, teachingIncludeChain, linkObservedRecruitGates } from './teaching_crosswalk.mjs';
import { sha256 } from './inventory.mjs';
import { digest } from './ledger.mjs';

const evidence = { path:'kungfu/class/a/t.c', sha256:'a'.repeat(64), start:10,end:20,line:2 };
test('actual original recruit gate observations require exact teacher, source, probe and full formal records',()=>{
    const gate={path:evidence.path,sha256:evidence.sha256,function:'permit_recruit'};
    const make=()=>({items:[{kind:'gate',teacher:evidence.path,source:evidence,function:'permit_recruit',teaching:[]}],
        c:{id:'c',samples:2,parameters:{teaching_profile:'teaching-43-recruit',teacher:{path:'/kungfu/class/a/t'},recruit_gate_sources:[gate]}},
        ref:{smoke:false,process_complete:true,complete:true,passed:2,directory:'dir'},
        rows:[0,1].map(i=>({raw:{before:[{object:'/student'}],teaching:[{teacher:'/kungfu/class/a/t#1',teacher_program:'/kungfu/class/a/t'}],
            teaching_gate_entries:[{...gate,teacher:'/kungfu/class/a/t#1',student:'/student'}]}})),
        manifest:{identity:{execution:{source_files:{[gate.path]:gate.sha256},probes:[{path:gate.path,before:gate.sha256,after:'different',sites:[{function:gate.function,position:'offset',
            insert:`"/tests/runner"->observe_teacher_gate(this_object(), ob, ${JSON.stringify(gate.path)}, ${JSON.stringify(gate.sha256)}, ${JSON.stringify(gate.function)})`}] }]}}}});
    const a=make();linkObservedRecruitGates(a.items,a.c,a.ref,a.rows,a.manifest);assert.equal(a.items[0].teaching.length,1);
    for(const change of [a=>{a.ref.smoke=true;},a=>{a.rows.pop();},a=>{a.rows[0].raw.teaching_gate_entries[0].student='/other';},
        a=>{a.manifest.identity.execution.probes=[];},a=>{a.manifest.identity.execution.source_files[gate.path]='wrong';},
        a=>{a.items[0].teacher='kungfu/class/other/t.c';}]){
        const bad=make();change(bad);assert.throws(()=>linkObservedRecruitGates(bad.items,bad.c,bad.ref,bad.rows,bad.manifest));
    }
});
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

test('included gate binds the exact teacher through a frozen recursive include chain, never header-name sharing', () => {
    const literal = '本门不收欺师灭祖之徒';
    const source = `int permit_recruit(object ob) { command("say ${literal}"); return 0; }`;
    const teacherSource = '#include "stage.h"\nvoid create() {}\n';
    const teacher = 'kungfu/class/a/t.c', stage = 'kungfu/class/a/stage.h', header = 'kungfu/class/a/gate.h';
    const inventory = { files: [
        { path: teacher, sha256: sha256(teacherSource), directives: [{ kind: 'include', resolved: stage }] },
        { path: stage, sha256: sha256('stage'), directives: [{ kind: 'include', resolved: header },
            { kind: 'include', resolved: teacher }] },
        { path: header, sha256: sha256(source), directives: [] },
    ] };
    const includeChain = teachingIncludeChain(inventory, teacher, header);
    assert.deepEqual(includeChain.map(e => e.path), [teacher, stage, header]);
    assert.equal(teachingIncludeChain(inventory, teacher, 'missing.h'), null);
    assert.equal(teachingIncludeChain(inventory, 'other.c', header), null);
    const item = { kind: 'gate', teacher, function: 'permit_recruit',
        source: { path: header, sha256: sha256(source), start: 0, end: source.length } };
    const c = { id: 'header-flow', samples: 1, parameters: { teaching_profile: 'recruit',
        teacher: { path: '/' + teacher.slice(0,-2), sha256: sha256(teacherSource) },
        teaching_entry: { path: teacher, sha256: sha256(teacherSource) },
        action: 'apprentice teacher', qualification_evidence: includeChain } };
    const ref = { condition: c.id, condition_sha256: digest(c),
        smoke: false, process_complete: true, complete: true, passed: 1 };
    const rows = [{ condition_id: c.id, index: 0, raw_sha256: 'raw', raw: {
        before: [{ object: '/tests/actor#2' }], after: [{ object: '/tests/actor#2' }],
        teaching: [{ teacher_program: c.parameters.teacher.path, teacher: c.parameters.teacher.path + '#3',
            student: '/tests/actor#2', command: c.parameters.action, messages: [{ text: literal }] }] } }];
    const verify = (condition = c, context = { teacherSource, includeChain }) => verifyTeachingFlowGate(item,
        condition, { ...ref, condition_sha256: digest(condition) }, rows, source, literal, context);
    assert.deepEqual(verify().source_include_chain, includeChain);
    for (const context of [{}, { teacherSource, includeChain: includeChain.slice(1) },
        { teacherSource: teacherSource + ' ', includeChain }]) assert.throws(() => verify(c, context));
    for (const mutate of [
        p => { p.qualification_evidence = p.qualification_evidence.slice(0,1); },
        p => { p.teacher.path = '/kungfu/class/a/other'; },
        p => { p.teacher.sha256 = 'wrong'; },
        p => { p.teaching_entry.path = 'kungfu/class/a/other.c'; },
    ]) {
        const bad = structuredClone(c); mutate(bad.parameters); assert.throws(() => verify(bad));
    }
    const repeated = teacherSource + '// ' + literal;
    const changed = structuredClone(c);
    changed.parameters.teacher.sha256 = sha256(repeated);
    changed.parameters.teaching_entry.sha256 = sha256(repeated);
    const changedChain = structuredClone(includeChain); changedChain[0].sha256 = sha256(repeated);
    changed.parameters.qualification_evidence = changedChain;
    assert.throws(() => verify(changed, { teacherSource: repeated, includeChain: changedChain }), /ambiguous/);
    const localOverride = teacherSource + '\nint permit_recruit(object ob) { return 1; }\n';
    const overridden = structuredClone(c), overriddenChain = structuredClone(includeChain);
    overriddenChain[0].sha256 = sha256(localOverride);
    overridden.parameters.teacher.sha256 = sha256(localOverride);
    overridden.parameters.teaching_entry.sha256 = sha256(localOverride);
    overridden.parameters.qualification_evidence = overriddenChain;
    assert.throws(() => verify(overridden, { teacherSource: localOverride, includeChain: overriddenChain }), /shadowed/);
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
