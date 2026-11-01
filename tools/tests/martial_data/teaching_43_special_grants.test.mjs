import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scanSource,sha256 } from './inventory.mjs';
import { specialGrantConditions,specialGrantLessons } from './teaching_43_special_grants.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { validatorFor } from './collection_review.mjs';
const read=p=>readFileSync(new URL('../../../'+p,import.meta.url),'utf8');
function relations(){return {objects:[...new Set(specialGrantLessons.map(d=>d.path))].map(path=>{
    const source=read(path),sha=sha256(source);
    return {path,grants:specialGrantLessons.filter(d=>d.path===path).map(d=>{
        const call=scanSource(source).calls.find(c=>c.function===d.fn&&c.name==='set'&&c.args[0]?.value===d.grant);
        assert.ok(call,'original grant must exist');
        return {function:d.fn,grant:d.grant,role:'player_grant_candidate',evidence:{path,sha256:sha,line:call.line,start:call.start,end:call.end}};
    })};
})};}
const conditions=()=>specialGrantConditions(relations(),read);
function sample(c){
    const p=c.parameters,props=p.actor.properties,d=specialGrantLessons.find(d=>d.key===p.lesson);
    const a={...props,object:'/tests/teaching_actor#1',family:props['family/family_name'],master_id:null,master_name:null,
        contribution:props.gongxian,max_jingli:1000,effective_force:Math.trunc(p.actor.skills.force/2),
        effective_dodge:Math.trunc(p.actor.skills.dodge/2),effective_dex:props.dex+Math.trunc(p.actor.skills.dodge/10),
        skills:structuredClone(p.actor.skills),learned:{},mappings:{},grants:Object.fromEntries(p.monitored_grants.map(k=>[k,props[k]??0]))},steps=[];
    for(const [i,e]of p.teaching_expectations.entries()){
        const before=structuredClone(i?steps.at(-1).after:a),after=structuredClone(before);
        after.jing-=12;after.grants[d.grant]=e.value;
        if(i===0&&p.expected==='observed')for(const s of d.rewards){after.skills[s]++;after.learned[s]=0;}
        steps.push({before,after,command:p.action,command_accepted:1,teacher_program:p.teacher.path,
            teacher:p.teacher.path+(d.key==='huang-xin'?'':'#2'),student:a.object,elapsed:0.01,
            message_scope:'receive_message_apply_input_not_full_transcript',messages:e.response_contains?[{category:'say',text:e.response_contains}]:[]});
    }
    return {kind:'sample',method:'teaching',condition_id:c.id,outcome:p.expected,before:[a],after:[structuredClone(steps.at(-1).after)],
        teaching:steps,metrics:[{jing_cost:steps.length*12}]};
}
test('7 source-pinned special grants bind 34 conditions and current semantic consumer',async()=>{
    const cs=conditions();assert.equal(cs.length,34);assert.equal(cs.reduce((n,c)=>n+c.samples,0),68);
    for(const c of cs){validateTeachingRecord(sample(c),c);(await validatorFor(c))(sample(c),c);}
});
test('prepared prerequisites remain inputs, target permission starts empty, and singleton identity is strict',()=>{
    const c=conditions().find(c=>c.parameters.lesson==='huang-xin'&&c.parameters.variant==='repeat');
    for(const mutate of [r=>{r.teaching[0].teacher+='#9';},r=>{r.teaching[0].before.grants[c.parameters.monitored_grants[0]]=1;},
        r=>{r.teaching[0].after.grants['can_perform/jiuyin-shengong/shou']=0;},
        r=>{r.teaching[0].after.skills.force--;},r=>{r.teaching[1].after.skills.force++;},r=>{r.metrics[0].jing_cost=0;},
        r=>{r.before[0].gender='男性';},r=>{r.outcome='refused';}]){
        const bad=sample(c);mutate(bad);assert.throws(()=>validateTeachingRecord(bad,c));
    }
});
test('source/config/teacher/threshold drift and injected target grants are rejected',()=>{
    assert.throws(()=>specialGrantConditions(relations(),p=>read(p)+'\n'),/drift/);
    assert.throws(()=>specialGrantConditions({objects:[]},read),/declaration/);
    for(const mutate of [p=>{p.actor.skills['kuihua-mogong']=999;},p=>{p.teacher.id='other';},
        p=>{p.qualification_evidence=[];},p=>{p.teaching_entry.function='other';},
        p=>{p.actor.properties[p.monitored_grants[0]]=1;}]){
        const bad=structuredClone(conditions()[0]);mutate(bad.parameters);
        assert.throws(()=>validateTeachingRecord(sample(bad),bad));
    }
});
test('all five Dongfang lessons sample guimai exception; all four Huang prerequisites have individual refusal',()=>{
    const cs=conditions();assert.equal(cs.filter(c=>c.parameters.variant==='guimai').length,5);
    assert.equal(cs.filter(c=>/^(shou|zhi|zhua|zhang)-missing$/.test(c.parameters.variant)).length,4);
    const po=cs.find(c=>c.parameters.lesson==='dongfang-po');assert.equal(po.parameters.actor.skills['kuihua-mogong'],260);
    assert.equal(po.parameters.actor.skills['pixie-jian'],undefined);
});
