import assert from 'node:assert/strict';
import {scanSource,sha256} from './inventory.mjs';
import {assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source} from './teaching_43_contract.mjs';
export const hongFood43Group='teaching-43-hong-food';let canonical;
const teacherPath='kungfu/class/gaibang/hong.c',teacherHash='f3c62eb3632712051345b153633f6787820ace9935523698723818be1fe9a080';
const grants=['can_learn/hong/xiaoyaoyou','can_learn/hong/xianglong-zhang'];
const sources=[teacherPath,'cmds/std/cook.c','cmds/skill/enable.c','kungfu/skill/chuancai-jiyi.c','clone/misc/cailiao.c','clone/food/dish.c',
    'cmds/std/give.c','feature/skill.c','feature/command.c','feature/name.c','adm/single/simul_efun/user.c'];
function person(name,gender){return {properties:{name,gender,class:'fighter',character:'心狠手辣',str:30,int:30,con:30,dex:30,
    shen:0,combat_exp:1000000,gongxian:100,qi:10000,eff_qi:10000,max_qi:10000,jing:10000,eff_jing:10000,max_jing:10000,
    neili:2000,max_neili:2000,max_jingli:1000,potential:10000,learned_points:0},skills:{'martial-cognize':0},mappings:{},preparations:{}};}
export function hongFood43Conditions(relations,readSource){
    const source=readSource(teacherPath);assert.equal(sha256(source),teacherHash);const fn=scanSource(source).functions.find(f=>f.name==='accept_object');assert.ok(fn);
    const entry={id:teacherPath+':'+fn.line+':accept_object',path:teacherPath,sha256:teacherHash,function:'accept_object',line:fn.line,role:'teaching'};
    return [120,200].map(level=>{const actor=person('试武甲','女性'),target=person('试武乙','男性');
        Object.assign(actor.skills,{cooking:50,'chuancai-jiyi':level});if(level===200)actor.properties['couple/id']='right';
        return {id:'teaching-43-hong-food-level'+level,stage:'school',method:'teaching',entry_id:entry.id,samples:2,status:'configured_not_executed',parameters:{
            collection_group:hongFood43Group,teaching_profile:hongFood43Group,teaching_kind:'cooking-permission',level,
            teacher:{path:'/'+teacherPath.slice(0,-2),id:'hong qigong',sha256:teacherHash},teaching_entry:entry,
            teaching_evidence:{path:teacherPath,sha256:teacherHash,line:fn.line,start:fn.start,end:fn.end},
            qualification_sources:sources,qualification_evidence:sources.map(path=>({path,sha256:sha256(readSource(path))})),
            actor,target,named_participants:true,material_amount:2,monitored_grants:grants,action:'enable cooking chuancai-jiyi',topic:'自制麻婆豆腐',
            teaching_expectations:[{action:'enable cooking chuancai-jiyi',command_kind:'enable'},{action:'cook 麻婆豆腐',command_kind:'cook'},
                {action:'give mapo doufu to hong qigong',command_kind:'give'}],expected:'observed',fighting:false,observe_seconds:0,not_applicable:'',
            note:'原菜料显式准备2份，原enable→cook生成实际菜→give。200级夫婿为另一个真实连接USER并原enable_player注册，不伪造find_player；不声称自然婚姻或材料取得。'}};});
}
export function validateHongFood43Record(raw,c){
    canonical??=new Map(hongFood43Conditions({},readTeaching43Source).map(c=>[c.id,c]));assertTeaching43Contract(c,canonical.get(c.id));
    const p=c.parameters;assert.equal(raw.outcome,'observed');assert.equal(raw.teaching.length,3);
    let previous;const first=raw.teaching[0].hong_before;
    const checkIdentity=(ctx)=>{
        assert.equal(ctx.teacher,raw.teaching[0].teacher);assert.equal(ctx.online_target,raw.before[1].object);
        for(const [side,role,cfg]of [[0,'actor',p.actor],[1,'target',p.target]]){
            const id=ctx.identities[role];assert.equal(id.object,raw.before[side].object);assert.equal(id.id,side?'right':'left');
            assert.equal(id.name,cfg.properties.name);assert.equal(id.gender,cfg.properties.gender);assert.equal(id.class,'fighter');assert.equal(id.family??0,0);
            assert.equal(id.couple??0,cfg.properties['couple/id']??0);assert.equal(id.by_alias_matches,1);
            for(const k of ['userp','playerp','interactive','living'])assert.equal(id[k],1);assert.equal(id.wizardp,0);
        }
    };
    for(const [role,cfg]of [['actor',p.actor],['target',p.target]]){
        const point=first[role];assert.deepEqual(point.skills,cfg.skills);assert.deepEqual(point.learned,{});assert.deepEqual(point.mappings,{});
        for(const key of ['family','master_id','master_name'])assert.equal(point[key]??0,0,'unaligned teaching affiliation');
        assert.deepEqual(point.grants,Object.fromEntries(grants.map(k=>[k,0])));assert.equal(point.character,cfg.properties.character);assert.equal(point.contribution,100);
        for(const k of ['jing','neili','max_neili','max_jingli','str','int','con','dex','combat_exp','potential','learned_points','shen'])assert.equal(point[k],cfg.properties[k]);
    }
    const material=first.material;assert.equal(material.amount,2);assert.equal(material.weight,160);assert.equal(material.program,'/clone/misc/cailiao');
    assert.ok(material.object.startsWith(material.program));assert.match(material.object.slice(material.program.length),/^#\d+$/);assert.equal(material.holder,raw.before[0].object);
    assert.deepEqual(first.dishes,[]);
    for(const [i,s]of raw.teaching.entries()){
        const b=s.hong_before,a=s.hong_after;checkIdentity(b);checkIdentity(a);if(previous)assert.deepEqual(b,previous);
        assert.equal(s.command,p.teaching_expectations[i].action);assert.equal(s.command_accepted,1);assert.equal(s.teacher_program,p.teacher.path);assert.equal(s.teacher,raw.teaching[0].teacher);
        assert.match(s.teacher,new RegExp('^'+p.teacher.path+'#\\d+$'));assert.equal(s.student,raw.before[0].object);
        assert.deepEqual(s.before,b.actor);assert.deepEqual(s.after,a.actor);
        assert.ok(Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=raw.elapsed);assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');
        const expected=structuredClone(b);
        if(i===0)expected.actor.mappings.cooking='chuancai-jiyi';
        if(i===1){expected.material.amount=1;expected.material.weight=80;assert.equal(a.dishes.length,1);const dish=a.dishes[0];
            assert.equal(dish.program,'/clone/food/dish');assert.ok(dish.object.startsWith(dish.program));assert.match(dish.object.slice(dish.program.length),/^#\d+$/);
            assert.deepEqual({...dish,object:undefined},{object:undefined,program:'/clone/food/dish',id:'mapo doufu',level:p.level,skill:'chuancai-jiyi',by:'left',by_alias_matches:1,
                food_supply:15,weight:40,holder:raw.before[0].object});expected.dishes=a.dishes;
        }
        if(i===2){
            expected.actor.grants[grants[0]]=1;expected.actor.skills['martial-cognize']=1;expected.actor.learned['martial-cognize']=0;
            if(p.level===200){expected.target.grants[grants[1]]=1;expected.target.skills['martial-cognize']=1;expected.target.learned['martial-cognize']=0;}
            expected.dishes=[];
        }
        assert.deepEqual(a,expected,'only original enable/cook/gift changes on both actual users');previous=a;
    }
    for(const [side,role,cfg]of [[0,'actor',p.actor],[1,'target',p.target]]){
        assertTeaching43Counters(raw.metrics[side]);
        const one={...raw,before:[raw.before[side]],after:[raw.after[side]],metrics:[raw.metrics[side]],teaching:[{student:raw.before[side].object}]};
        assertTeaching43Snapshots(one,first[role],previous[role],{parameters:{actor:cfg}});
        for(const state of [raw.before[side],raw.after[side]]){
            assert.equal(state.cultivation.class,'fighter');assert.equal(state.cultivation['family/family_name']??0,0);
        }
    }
    return raw.teaching.map((s,i)=>({advanced:true,acquired:i===2,command_kind:p.teaching_expectations[i].command_kind,jing_spent:0}));
}
