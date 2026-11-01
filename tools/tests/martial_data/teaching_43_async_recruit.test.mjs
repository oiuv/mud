import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sha256} from './inventory.mjs';
import {asyncRecruit43Conditions,asyncRecruit43Teachers} from './teaching_43_async_recruit.mjs';
import {validateTeachingRecord} from './teaching_observation.mjs';
import {validatorFor} from './collection_review.mjs';
const read=p=>readFileSync(new URL('../../../'+p,import.meta.url),'utf8');
const conditions=()=>asyncRecruit43Conditions({},read);
function sample(c){
    const p=c.parameters,t=asyncRecruit43Teachers.find(d=>d.key===p.teacher_key),v=p.actor.properties,success=p.variant==='grant',delay=t.mode==='delayed',teacher=p.teacher.path+'#2';
    const b={...v,userp:1,playerp:1,interactive:1,living:1,wizardp:0,ghost:0,object:'/tests/teaching_actor#1',contribution:v.gongxian,family:null,master_id:null,master_name:null,max_jingli:0,
        skills:structuredClone(p.actor.skills),learned:{},mappings:{},recruit_qualification:{gender:v.gender,class:'fighter',gongxian:100},
        recruitment:{family:{},name:v.name,title:'',class:'fighter',pending_apprentice:'',pending_betrayer:'',pending_flatter:0}};
    const intent=structuredClone(b);intent.recruitment.pending_apprentice=teacher;
    if(!delay&&['grant','wrong-text'].includes(p.variant))intent.recruitment.pending_flatter=1;
    const family={family_name:t.family,master_id:t.id,master_name:t.name,generation:t.generation,enter_time:1000,title:'传人',privs:0};
    const final=structuredClone(intent);final.recruitment.pending_flatter=0;
    if(success){final.recruitment.family=family;final.family=t.family;final.master_id=t.id;final.master_name=t.name;final.contribution=0;final.recruitment.class=t.class;final.recruitment.pending_apprentice='';
        final.recruitment.title=t.family+(delay?'第十四代传人':'第二代传人');final.recruit_qualification.class=t.class;final.recruit_qualification.gongxian=0;}
    const step=(before,after,command,accepted)=>({before,after,command,command_accepted:accepted,teacher,teacher_program:p.teacher.path,student:b.object,
        wall_time:1000,elapsed:.01,teacher_pending_recruit:'',teacher_family:{family_name:t.family,generation:t.generation-1},
        teacher_identity:{id:t.id,name:t.name,class:delay?'swordsman':'taoist',attempt_source:'/'+t.path.slice(0,-2)},
        messages:[],message_scope:'receive_message_apply_input_not_full_transcript'});
    const steps=[step(b,intent,p.action,1)];let wait;
    if(delay){wait={before:structuredClone(intent),after:structuredClone(final),elapsed:3.2,waiting:0,messages:[],
        teacher_before:{teacher,available:3,availavble:0,callbacks:[{owner:teacher,function:'do_recruit',remaining:2}]},
        teacher_after:{teacher,available:3,availavble:success?-1:0,callbacks:[]}};
        steps.push(step(structuredClone(final),structuredClone(final),p.action,success?1:0));
    }else if(p.teaching_expectations.length===3){steps.push(step(structuredClone(intent),structuredClone(final),p.teaching_expectations[1].action,1));
        steps.push(step(structuredClone(final),structuredClone(final),p.action,success?1:0));}
    const functions=delay?['attempt_apprentice','do_recruit','permit_recruit']:['attempt_apprentice',...(['grant','wrong-text'].includes(p.variant)?['do_flatter']:[])];
    const events=functions.map((fn,i)=>{const path=fn==='permit_recruit'?'kungfu/class/huashan/qizong.h':t.path;
        return {path,sha256:sha256(read(path)),function:fn,teacher,student:b.object,elapsed:i?1.8:0};});
    return {kind:'sample',method:'teaching',condition_id:c.id,outcome:p.expected,teaching:steps,teaching_gate_entries:events,
        recruit_teacher_initial:{teacher,available:delay?3:0,availavble:0,callbacks:[]},...(wait?{recruit_wait:wait}:{}),
        before:[b],after:[steps.at(-1).after],metrics:[{}],elapsed:4,
        attacks:[],launches:[],interfaces:[],callbacks:[],passives:[],defenses:[],dodge_checks:[],terminals:[]};
}
test('16 explicit delayed/two-command conditions bind 32 formal samples and the dedicated consumer',async()=>{
    const cs=conditions();assert.equal(cs.length,16);assert.equal(cs.reduce((n,c)=>n+c.samples,0),32);
    for(const c of cs){validateTeachingRecord(sample(c),c);(await validatorFor(c))(sample(c),c);}
});
test('delayed schedule/actual callback/continuous wait/final commit are not interchangeable',()=>{
    const c=conditions()[0];for(const mutate of [r=>{r.recruit_wait.before.recruitment.pending_apprentice='';},
        r=>{r.teaching_gate_entries.splice(1,1);},r=>{r.recruit_wait.teacher_after.callbacks=[{}];},
        r=>{r.recruit_wait.elapsed=0;},r=>{r.teaching[1].before.skills.force++;},r=>{r.recruit_wait.teacher_after.availavble=0;},
        r=>{r.metrics[0].jing_cost=1;},r=>{r.teaching[0].after.recruitment.family={master_id:c.parameters.teacher.id};}]){
        const bad=sample(c);mutate(bad);assert.throws(()=>validateTeachingRecord(bad,c));
    }
});
test('wrong praise can be accepted but cannot become a successful recruitment; pending is original',()=>{
    const c=conditions().find(c=>c.parameters.teacher_key==='ding'&&c.parameters.variant==='wrong-text');
    const r=sample(c);assert.equal(r.teaching[1].command_accepted,1);assert.equal(r.outcome,'refused');
    const bad=sample(c);bad.teaching[0].before.recruitment.pending_flatter=1;assert.throws(()=>validateTeachingRecord(bad,c));
    bad.teaching[0].before.recruitment.pending_flatter=0;bad.outcome='observed';assert.throws(()=>validateTeachingRecord(bad,c));
    assert.throws(()=>asyncRecruit43Conditions({},p=>read(p)+'\n'),/drift/);
});
