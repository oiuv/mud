import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scanSource,sha256 } from './inventory.mjs';
import { mappingFields } from './school_relations.mjs';
import { jueqingGrantConditions,jueqingGrantLessons } from './teaching_43_jueqing_grants.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { validatorFor } from './collection_review.mjs';
const read=p=>readFileSync(new URL('../../../'+p,import.meta.url),'utf8');
function relations(){return {objects:['fan','zhi'].map(file=>{
    const path=`kungfu/class/jueqing/${file}.c`,source=read(path),hash=sha256(source);
    return {path,grants:scanSource(source).calls.filter(c=>c.name==='teach_pfm').map(c=>{
        const fields=mappingFields(c.args[2].raw);return {function:c.function,grant:fields.perform.value,fields,
            operation:'teach_pfm',role:'player_grant_candidate',evidence:{path,sha256:hash,line:c.line,start:c.start,end:c.end}};
    })};
})};}
const conditions=()=>jueqingGrantConditions(relations(),read);
const basics={'jueqing-jian':['sword','parry'],'tianjue-dao':['blade','parry'],'pokong-quan':['cuff','parry'],
    'jueqing-zhang':['strike','parry'],'guxing-jian':['sword','parry'],'luoyun-dao':['blade','parry'],
    'guhong-zhang':['strike','parry'],'poshui-zhang':['staff','parry'],'zilei-jian':['sword','parry'],
    'poguang-dao':['blade','parry'],'yinyang-ren':['sword','blade','parry']};
function sample(c){
    const p=c.parameters,props=p.actor.properties,d=jueqingGrantLessons.find(d=>d.key===p.lesson),g=p.monitored_grants[0];
    const a={...props,object:'/tests/teaching_actor#1',family:props['family/family_name'],master_id:null,master_name:null,
        contribution:props.gongxian,max_jingli:1000,effective_force:Math.trunc(p.actor.skills.force/2),
        effective_dodge:Math.trunc(p.actor.skills.dodge/2),effective_dex:props.dex+Math.trunc(p.actor.skills.dodge/10),
        skills:structuredClone(p.actor.skills),learned:{},mappings:{},grants:{[g]:0}},steps=[];
    for(const [i,e]of p.teaching_expectations.entries()){
        const before=structuredClone(i?steps.at(-1).after:a),after=structuredClone(before);
        after.jing-=12;after.contribution-=e.contribution_spent;after.grants[g]=e.value;
        if(i===0&&p.expected==='observed')for(const s of [d.skill,...basics[d.skill],'martial-cognize']){
            after.skills[s]=(after.skills[s]??0)+1;after.learned[s]=0;
        }
        steps.push({before,after,command:p.action,command_accepted:1,teacher_program:p.teacher.path,
            teacher:p.teacher.path+'#2',student:a.object,elapsed:0.01,message_scope:'receive_message_apply_input_not_full_transcript',
            messages:e.response_contains?[{category:'say',text:e.response_contains}]:[]});
    }
    return {kind:'sample',method:'teaching',condition_id:c.id,outcome:p.expected,before:[a],after:[structuredClone(steps.at(-1).after)],
        teaching:steps,metrics:[{jing_cost:steps.length*12}]};
}
test('16 exact Jueqing declarations produce 127 conditions and bind the existing consumer',async()=>{
    const cs=conditions();assert.equal(cs.length,127);assert.equal(cs.reduce((n,c)=>n+c.samples,0),254);
    assert.equal(new Set(cs.map(c=>c.id)).size,127);
    for(const c of cs){validateTeachingRecord(sample(c),c);(await validatorFor(c))(sample(c),c);}
});
test('negative shen is a maximum; force/dodge are effective with raw odd-level refusal',()=>{
    const cs=conditions();
    for(const d of jueqingGrantLessons){
        const c=cs.find(c=>c.parameters.lesson===d.key&&c.parameters.variant==='shen-high');
        assert.equal(c.parameters.actor.properties.shen,d.shen+1);assert.equal(c.parameters.expected,'refused');
        if(d.force){const low=cs.find(c=>c.parameters.lesson===d.key&&c.parameters.variant==='force-low');
            assert.equal(Math.trunc(low.parameters.actor.skills.force/2),d.force-1);}
        if(d.dodge){const low=cs.find(c=>c.parameters.lesson===d.key&&c.parameters.variant==='dodge-low');
            assert.equal(Math.trunc(low.parameters.actor.skills.dodge/2),d.dodge-1);}
    }
});
test('dual sword/blade basic rewards, parity, extra writes, repeat costs and identity are strict',()=>{
    const c=conditions().find(c=>c.parameters.lesson==='zhi-hua'&&c.parameters.variant==='repeat'),r=sample(c);
    assert.equal(r.after[0].skills.sword,41);assert.equal(r.after[0].skills.blade,41);assert.equal(r.after[0].skills.parry,41);
    for(const mutate of [r=>{r.teaching[0].after.skills.blade=40;},r=>{r.teaching[0].after.learned.parry=1;},
        r=>{r.teaching[1].after.contribution--;},r=>{r.teaching[1].before.skills.sword=40;},
        r=>{r.teaching[0].student='/wrong';},r=>{r.metrics[0].jing_cost=0;},r=>{r.outcome='refused';}]){
        const bad=structuredClone(r);mutate(bad);assert.throws(()=>validateTeachingRecord(bad,c));}
});
test('source/fields drift, unknown teacher, missing qualification and injected permission cannot pass',()=>{
    assert.throws(()=>jueqingGrantConditions({objects:[]},read),/declaration/);
    assert.throws(()=>jueqingGrantConditions(relations(),p=>read(p)+'\n'),/changed Jueqing/);
    const c=conditions()[0];for(const mutate of [p=>{p.actor.properties.shen=0;},p=>{p.qualification_evidence=[];},
        p=>{p.teacher.id='other';},p=>{p.teaching_entry.function='other';},p=>{p.action='ask other about other';},
        p=>{p.actor.properties[p.monitored_grants[0]]=1;}]){const bad=structuredClone(c);mutate(bad.parameters);
        assert.throws(()=>validateTeachingRecord(sample(bad),bad));}
});
