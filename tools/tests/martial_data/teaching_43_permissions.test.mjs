import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sha256} from './inventory.mjs';
import {permission43Conditions,permission43Lessons,permission43SourceBindings} from './teaching_43_permissions.mjs';
import {validateTeachingRecord} from './teaching_observation.mjs';
import {validatorFor} from './collection_review.mjs';
const read=p=>readFileSync(new URL('../../../'+p,import.meta.url),'utf8');
function relations(){return permission43SourceBindings(read);}
const conditions=()=>permission43Conditions(relations(),read);
function sample(c){
    const p=c.parameters,v=p.actor.properties,k=p.monitored_grants[0],success=p.variant==='acquire';
    const b={...v,userp:1,playerp:1,interactive:1,living:1,wizardp:0,ghost:0,object:'/tests/teaching_actor#1',family:v['family/family_name'],master_id:v['family/master_id'],master_name:v['family/master_name'],
        contribution:v.gongxian,max_jingli:0,skills:structuredClone(p.actor.skills),learned:{},mappings:{},grants:{[k]:0},
        effective_int:v.int,effective_force:Math.trunc(p.actor.skills.force/2)};
    const a=structuredClone(b);if(success){a.jing-=5;a.learned_points++;a.learned[p.skill]=10;a.grants[k]=1;}
    const step={before:b,after:a,student:b.object,teacher:p.teacher.path+'#2',teacher_program:p.teacher.path,
        teacher_skills:{[p.skill]:p.teacher_level},teacher_no_teach:{kind:'expression'},command:p.action,command_accepted:1,
        elapsed:.01,skill_after_command:50,messages:[],message_scope:'receive_message_apply_input_not_full_transcript'};
    return {kind:'sample',method:'teaching',condition_id:c.id,outcome:p.expected,teaching:[step],before:[b],after:[a],metrics:[success?{jing_cost:5}:{}],
        attacks:[],launches:[],interfaces:[],callbacks:[],passives:[],defenses:[],dodge_checks:[],terminals:[]};
}
test('7 exact no_teach callbacks use original learn, 14 conditions and 714 formal samples',async()=>{
    const cs=conditions();assert.equal(cs.length,14);assert.equal(cs.reduce((n,c)=>n+c.samples,0),714);
    for(const c of cs){validateTeachingRecord(sample(c),c);(await validatorFor(c))(sample(c),c);}
});
test('exclusive experience/raw-force thresholds remain exact and family is explicit input',()=>{
    for(const d of permission43Lessons){const cs=conditions().filter(c=>c.parameters.skill===d.skill),yes=cs[0].parameters.actor,no=cs[1].parameters.actor;
        if(d.exp!==null){assert.equal(yes.properties.combat_exp,d.exp+1);assert.equal(no.properties.combat_exp,d.exp);}
        else{assert.equal(yes.skills.force,181);assert.equal(no.skills.force,180);}
        assert.equal(yes.properties['family/master_id'],d.npc);assert.ok(!Object.hasOwn(yes.properties,d.permission));
    }
});
test('grant must really change, learning/reward/resources/teacher provenance cannot be faked',()=>{
    const c=conditions()[0];for(const mutate of [r=>{r.teaching[0].before.grants[c.parameters.monitored_grants[0]]=1;},
        r=>{r.teaching[0].after.grants[c.parameters.monitored_grants[0]]=0;},r=>{r.teaching[0].after.learned[c.parameters.skill]=0;},
        r=>{r.teaching[0].after.skills.force++;},r=>{r.teaching[0].teacher_no_teach.kind='none';},
        r=>{r.metrics[0].jing_cost=0;},r=>{r.teaching[0].command='ask '+c.parameters.teacher.id+' about '+c.parameters.skill;}]){
        const bad=sample(c);mutate(bad);assert.throws(()=>validateTeachingRecord(bad,c));
    }
    assert.throws(()=>permission43Conditions(relations(),p=>read(p)+'\n'),/drift/);
});
