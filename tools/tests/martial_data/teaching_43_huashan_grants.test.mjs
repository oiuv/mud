import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scanSource, sha256 } from './inventory.mjs';
import { mappingFields } from './school_relations.mjs';
import { huashanGrantConditions, huashanGrantLessons } from './teaching_43_huashan_grants.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { validatorFor } from './collection_review.mjs';

const read = path => readFileSync(new URL('../../../'+path,import.meta.url),'utf8');
function relations() {
    return { objects: [...new Set(huashanGrantLessons.map(d=>d.file))].map(file=>{
        const path=`kungfu/class/huashan/${file}.c`,source=read(path),hash=sha256(source);
        return { path,grants:scanSource(source).calls.filter(c=>c.name==='teach_pfm').map(c=>{
            const fields=mappingFields(c.args[2].raw);
            return {function:c.function,grant:fields.perform.value,fields,operation:'teach_pfm',
                role:'player_grant_candidate',evidence:{path,sha256:hash,line:c.line,start:c.start,end:c.end}};
        }) };
    }) };
}
const conditions=()=>huashanGrantConditions(relations(),read);
function sample(c) {
    const p=c.parameters,props=p.actor.properties,key=p.monitored_grants[0];
    const before={...props,object:'/tests/teaching_actor#1',contribution:props.gongxian,
        family:props['family/family_name'],master_id:null,master_name:null,max_jingli:1000,
        effective_force:Math.trunc(p.actor.skills.force/2),effective_dodge:Math.trunc(p.actor.skills.dodge/2),
        effective_dex:props.dex+Math.trunc(p.actor.skills.dodge/10),
        skills:structuredClone(p.actor.skills),learned:{},mappings:{},grants:{[key]:0}};
    const d=huashanGrantLessons.find(d=>d.key===p.lesson),steps=[];
    for(const [i,e]of p.teaching_expectations.entries()) {
        const a=structuredClone(i?steps.at(-1).after:before),b=structuredClone(a);
        b.jing-=12;b.contribution-=e.contribution_spent;b.grants[key]=e.value;
        if(i===0&&p.expected==='observed') {
            const basic=p.lesson==='lao-piao'?'strike':p.lesson==='lao-song'?'cuff':'sword';
            for(const skill of [d.skill,...(d.secondary??[]).map(([s])=>s),basic,'parry','martial-cognize']) {
                b.skills[skill]=(b.skills[skill]??0)+1;b.learned[skill]=0;
            }
        }
        steps.push({student:before.object,teacher:p.teacher.path+'#2',teacher_program:p.teacher.path,
            command:p.action,command_accepted:1,elapsed:0.01,before:a,after:b,
            message_scope:'receive_message_apply_input_not_full_transcript',
            messages:e.response_contains?[{category:'say',text:e.response_contains}]:[]});
    }
    return {kind:'sample',method:'teaching',condition_id:c.id,outcome:p.expected,
        before:[before],after:[structuredClone(steps.at(-1).after)],teaching:steps,metrics:[{jing_cost:steps.length*12}]};
}

test('nine exact source declarations create 82 deterministic conditions, not injected grants',async()=>{
    const cs=conditions();assert.equal(cs.length,82);assert.equal(new Set(cs.map(c=>c.id)).size,82);
    assert.equal(cs.reduce((n,c)=>n+c.samples,0),164);
    for(const c of cs) {
        validateTeachingRecord(sample(c),c);(await validatorFor(c))(sample(c),c);
        assert.ok(!Object.keys(c.parameters.actor.properties).some(k=>k.startsWith('can_perform/')));
    }
});

test('sword school ceilings are inclusive and use effective force, with odd raw level rounding',()=>{
    const cs=conditions();
    for(const lesson of ['cheng-long','cheng-sao','feng-yong','feng-xian']) {
        for(const [variant,force,expected]of [['force-ceiling-at',410,'observed'],
            ['force-ceiling-round',411,'observed'],['force-ceiling-high',412,'refused']]) {
            const c=cs.find(c=>c.parameters.lesson===lesson&&c.parameters.variant===variant);
            assert.equal(c.parameters.actor.skills.force,force);assert.equal(c.parameters.expected,expected);
            assert.equal(c.parameters.actor.properties.max_neili,2000);validateTeachingRecord(sample(c),c);
        }
        const high=cs.find(c=>c.parameters.lesson===lesson&&c.parameters.variant==='max-neili-high');
        assert.equal(high.parameters.actor.properties.max_neili,2001);assert.equal(high.parameters.expected,'refused');
    }
});

test('raw secondary skills differ from effective force; omitted contribution still rejects negative input',()=>{
    const cs=conditions();
    const wife=cs.find(c=>c.parameters.lesson==='ning-ning'&&c.parameters.variant==='grant');
    assert.equal(wife.parameters.actor.skills.force,100);assert.equal(wife.parameters.actor.skills.dodge,100);
    const low=cs.find(c=>c.parameters.lesson==='ning-ning'&&c.parameters.variant==='force-raw-low');
    assert.equal(low.parameters.actor.skills.force,99);assert.equal(low.parameters.expected,'refused');
    const zero=cs.find(c=>c.parameters.lesson==='feng-yong'&&c.parameters.variant==='contribution-low');
    assert.equal(zero.parameters.actor.properties.gongxian,-1);assert.equal(zero.parameters.expected,'refused');
    const grant=cs.find(c=>c.parameters.lesson==='feng-yong'&&c.parameters.variant==='grant');
    assert.equal(grant.parameters.teaching_expectations[0].contribution_spent,0);
});

test('declaration mismatch, source drift, wrong command/teacher and altered qualification are rejected',()=>{
    assert.throws(()=>huashanGrantConditions({objects:[]},read),/declaration/);
    assert.throws(()=>huashanGrantConditions(relations(),p=>read(p)+'\n'),/changed Huashan/);
    const rel=relations();rel.objects[0].grants[0].fields.lv1.value++;assert.throws(()=>huashanGrantConditions(rel,read),/fields changed/);
    const c=conditions()[0];
    for(const mutate of [
        p=>{p.actor.skills.force=412;},p=>{p.teacher.sha256='changed';},
        p=>{p.action='ask other about wrong';},p=>{p.qualification_evidence=[];},
        p=>{p.teaching_expectations[0].contribution_spent=123;},
    ]) {const bad=structuredClone(c);mutate(bad.parameters);assert.throws(()=>validateTeachingRecord(sample(bad),bad));}
});

test('all supported basic skills and secondary rewards are checked; repeats and refusals cannot acquire again',()=>{
    const c=conditions().find(c=>c.parameters.lesson==='ning-ning'&&c.parameters.variant==='repeat');
    const r=sample(c);validateTeachingRecord(r,c);
    assert.deepEqual(r.after[0].learned,{'shunv-jian':0,force:0,dodge:0,sword:0,parry:0,'martial-cognize':0});
    for(const mutate of [
        r=>{r.teaching[0].after.skills.parry=40;},r=>{r.teaching[0].after.learned.force=50;},
        r=>{r.teaching[1].after.skills.sword++;},r=>{r.teaching[1].after.contribution--;},
        r=>{r.teaching[1].before.grants[c.parameters.monitored_grants[0]]=0;},
        r=>{r.teaching[0].student='/wrong';},r=>{r.metrics[0].jing_cost=0;},
    ]) {const bad=structuredClone(r);mutate(bad);assert.throws(()=>validateTeachingRecord(bad,c));}
    const refused=conditions().find(c=>c.parameters.variant==='force-ceiling-high');
    const bad=sample(refused);bad.teaching[0].messages=[];
    assert.throws(()=>validateTeachingRecord(bad,refused),/拒绝原因/);
});
