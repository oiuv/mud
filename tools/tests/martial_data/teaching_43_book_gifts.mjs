import assert from 'node:assert/strict';
import {scanSource,sha256} from './inventory.mjs';
import {assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source} from './teaching_43_contract.mjs';
export const bookGift43Group='teaching-43-book-gifts';
let canonical;
const sources={
    'kungfu/class/ultra/dugu.c':'1d094a52d560508669ee5791a0f1fd65efaa3676e0d3c84dfc02a610bd8699f3',
    'kungfu/class/ultra/huang.c':'e2329b2abe80b477df9c4096a8157a7fc67c379b7a2bc25c6523872ee1ce2a14',
    'clone/lonely/book/dugubook.c':'25da837cd475e6401446f99c3c37820a6d7070e112ce535de65f899f10b829cf',
    'clone/lonely/book/zhenjing1.c':'d6f1c1d5b447b92b8f97e49b9c83d7be6ff02f6249f6d6eb0d9fc3eab00a1c7b',
    'clone/lonely/book/zhenjing2.c':'ff66cdbe4eb657d9358b54d6eb0a8a66dd3c10fdbad80303b54fc0815d40dc2b',
    'cmds/std/give.c':'3cc58f358220756b1225056b0ba8dd3538dc3b607683f83c8167f7b0b93e1cf1',
    'feature/skill.c':'99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
};
const keys={dugu:['can_learn/dugu-jiujian/nothing','can_perform/dugu/qi','can_perform/dugu/po'],
    huang:['can_learn/jiuyin-shengong/xin','give_zhenjing1','give_zhenjing2']};
export function bookGift43Conditions(relations,readSource){
    for(const [path,hash]of Object.entries(sources))assert.equal(sha256(readSource(path)),hash,'book gift source drift');
    return ['dugu-repeat','huang-upper-lower','huang-lower-upper'].map(lesson=>{
        const dugu=lesson.startsWith('dugu'),who=dugu?'dugu':'huang',path='kungfu/class/ultra/'+who+'.c',id=dugu?'dugu qiubai':'huang shang';
        const fn=scanSource(readSource(path)).functions.find(f=>f.name==='accept_object');assert.ok(fn);
        const entry={id:path+':'+fn.line+':accept_object',path,sha256:sources[path],function:'accept_object',line:fn.line,role:'teaching'};
        const evidencePaths=[...Object.keys(sources),'feature/noclone.c','kungfu/skill/sword.c','kungfu/skill/dugu-jiujian.c','kungfu/skill/martial-cognize.c'];
        const offers=dugu?[['dugubook','dugu canben'],['dugubook','dugu canben']]:lesson.endsWith('upper-lower')?[['zhenjing1','shangce'],['zhenjing2','xiace']]:[['zhenjing2','xiace'],['zhenjing1','shangce']];
        const steps=offers.map(([file,alias])=>({action:'give '+alias+' to '+id,command_kind:'give',offer:{path:'/clone/lonely/book/'+file,id:alias}}));
        return {id:'teaching-43-book-gifts-'+lesson,stage:'school',method:'teaching',entry_id:entry.id,samples:2,status:'configured_not_executed',parameters:{
            collection_group:bookGift43Group,teaching_profile:bookGift43Group,teaching_kind:'book-permission',lesson,
            teacher:{path:'/'+path.slice(0,-2),id,sha256:sources[path]},teacher_startroom:dugu?'/d/huashan/shandong':'/d/dali/lushui',
            teaching_entry:entry,teaching_evidence:{path,sha256:sources[path],line:fn.line,start:fn.start,end:fn.end},
            qualification_sources:evidencePaths,qualification_evidence:evidencePaths.map(path=>({path,sha256:sha256(readSource(path))})),
            actor:{properties:{name:'试武甲',class:'fighter',gender:'男性',character:'心狠手辣',str:30,int:dugu?39:30,con:36,dex:35,
                combat_exp:100000000,shen:0,gongxian:100,qi:10000,eff_qi:10000,max_qi:10000,jing:10000,eff_jing:10000,max_jing:10000,
                neili:6000,max_neili:6000,max_jingli:1000,potential:10000,learned_points:0},
                skills:{force:40,dodge:40,parry:40,literate:100,...(dugu?{sword:340,'dugu-jiujian':340,'martial-cognize':0}:{})},mappings:{},preparations:{}},
            target:{skills:{},mappings:{},properties:{}},named_participants:true,action:steps[0].action,topic:lesson,
            teaching_expectations:steps,monitored_grants:keys[who],expected:'observed',fighting:false,observe_seconds:0,not_applicable:'',
            note:'教师与孤本均原load_object单例；书的取得作为明示道具准备，原give/accept_object授予许可。教师保留原startroom再移入隔离房，不直接设许可或调用回调。'}};
    });
}
export function validateBookGift43Record(raw,c){
    canonical??=new Map(bookGift43Conditions({},readTeaching43Source).map(c=>[c.id,c]));assertTeaching43Contract(c,canonical.get(c.id));
    const p=c.parameters,dugu=p.lesson.startsWith('dugu'),initial=raw.teaching[0].before;
    assert.equal(raw.outcome,'observed');assert.equal(raw.teaching.length,2);
    assert.deepEqual(raw.book_gift_teacher_preparation,{teacher:p.teacher.path,program:p.teacher.path,clonep:0,no_clone:1,startroom:p.teacher_startroom,environment:p.teacher_startroom});
    assert.deepEqual(initial.skills,p.actor.skills);assert.deepEqual(initial.learned,{});assert.deepEqual(initial.mappings,{});
    assert.deepEqual(initial.grants,Object.fromEntries(p.monitored_grants.map(k=>[k,0])));
    for(const k of ['jing','neili','max_neili','max_jingli','str','con','dex','int','combat_exp','potential','learned_points','shen'])assert.equal(initial[k],p.actor.properties[k]);
    assert.equal(initial.character,p.actor.properties.character);assert.equal(initial.contribution,100);
    for(const k of ['family','master_id','master_name'])assert.equal(initial[k]??0,0);
    let previous=initial;
    for(const [i,s]of raw.teaching.entries()){
        assert.deepEqual(s.before,previous);assert.equal(s.teacher,p.teacher.path);assert.equal(s.teacher_program,p.teacher.path);assert.equal(s.student,raw.before[0].object);
        assert.equal(s.command,p.teaching_expectations[i].action);assert.equal(s.command_accepted,1);
        assert.ok(Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=raw.elapsed);assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');assert.ok(Array.isArray(s.messages));
        const offer=p.teaching_expectations[i].offer;
        assert.deepEqual(s.offered_item,{object:offer.path,program:offer.path,holder_before:raw.before[0].object,clone:0,exists_after:0,holder_after:''});
        const expected=structuredClone(s.before);
        if(dugu&&i===0){expected.grants[p.monitored_grants[0]]=1;
            for(const skill of ['sword','dugu-jiujian','martial-cognize']){expected.skills[skill]+=3;expected.learned[skill]=0;}
        }else if(!dugu){
            if(i===0)expected.grants[offer.path.endsWith('1')?'give_zhenjing1':'give_zhenjing2']=1;
            else{expected.grants['can_learn/jiuyin-shengong/xin']=1;expected.grants.give_zhenjing1=0;expected.grants.give_zhenjing2=0;}
        }
        assert.deepEqual(s.after,expected,'only original permission markers and fixed skill rewards may change');
        previous=s.after;
    }
    assertTeaching43Counters(raw.metrics[0]);assertTeaching43Snapshots(raw,initial,previous,c);
    for(const [which,point]of [['before',initial],['after',previous]]){
        const state=raw[which][0];assert.equal(state.cultivation.class,'fighter');assert.equal(state.cultivation['family/family_name']??0,0);
        if(dugu){assert.equal(state.nothing??0,point.grants['can_learn/dugu-jiujian/nothing']);
            assert.deepEqual(state.dugu_grants,{qi:null,po:null},'granting nothing must not trigger the other two random insight flags');}
    }
    return raw.teaching.map((s,i)=>({advanced:dugu?i===0:true,acquired:dugu?i===0:i===1,command_kind:'give',jing_spent:0}));
}
