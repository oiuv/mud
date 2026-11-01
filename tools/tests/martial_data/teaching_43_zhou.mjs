import assert from'node:assert/strict';import{scanSource,sha256}from'./inventory.mjs';import{assertTeaching43Contract,assertTeaching43Counters,readTeaching43Source}from'./teaching_43_contract.mjs';
export const zhou43Group='teaching-43-zhou';const path='kungfu/class/quanzhen/zhou.c',hash='1fe3c17c6af7fdb2def7f97391e8958656fcb1dd89f9c1dc46941188296b7ee2',key='can_learn/zuoyou-hubo/zhou';let canonical;
export function zhou43Probe(source,file){if(file!==path)return{sites:[]};assert.equal(sha256(source),hash);const f=scanSource(source).functions.find(f=>f.name==='lost');assert.ok(f);
    const start=source.indexOf('    exp = 20000',f.start),end=source.indexOf('    ::lost();',f.start)+'    ::lost();'.length;assert.ok(start>f.start&&end<f.end);
    return{sites:[{position:'offset',offset:start,function:'lost',insert:'    "/tests/runner"->observe_zhou43(this_object(), query_competitor(), "before");\n'},
        {position:'offset',offset:end,function:'lost',insert:'\n    "/tests/runner"->observe_zhou43(this_object(), ob, "after");'}]};}
export function zhou43Conditions(relations,readSource){const s=readSource(path);assert.equal(sha256(s),hash);const f=scanSource(s).functions.find(f=>f.name==='lost'),entry={id:path+':'+f.line+':lost',path,sha256:hash,function:'lost',line:f.line,role:'teaching'};
    const sources=[path,'cmds/std/fight.c','feature/attack.c','adm/daemons/combatd.c','feature/damage.c','feature/skill.c','feature/attribute.c','clone/user/user.c'];
    return[{id:'teaching-43-zhou-natural-competition',stage:'school',method:'teaching',entry_id:entry.id,samples:100,status:'configured_not_executed',parameters:{
        collection_group:zhou43Group,teaching_profile:zhou43Group,teaching_kind:'competition-permission',teacher:{path:'/'+path.slice(0,-2),id:'zhou botong',sha256:hash},teaching_entry:entry,
        teaching_evidence:{path,sha256:hash,line:f.line,start:f.start,end:f.end},qualification_sources:sources,qualification_evidence:sources.map(path=>({path,sha256:sha256(readSource(path))})),
        actor:{properties:{name:'试武甲',class:'fighter',gender:'男性',character:'光明磊落',str:30,int:15,con:30,dex:30,combat_exp:1000000000,shen:0,gongxian:100,
            qi:1000000,eff_qi:1000000,max_qi:1000000,jing:10000,eff_jing:10000,max_jing:10000,neili:1000000,max_neili:1000000,max_jingli:1000,potential:10000,learned_points:0,jiali:0,jianu:0},
            skills:{unarmed:2000,force:2000,dodge:2400,parry:2000},mappings:{},preparations:{},temp:{'apply/unarmed_damage':5000}},target:{skills:{},mappings:{},properties:{}},named_participants:true,
        action:'fight zhou botong',topic:'比武自然lost',monitored_grants:[key],teaching_expectations:[{action:'fight zhou botong',command_kind:'fight'}],
        expected:'observed',fighting:false,observe_seconds:0,not_applicable:'',attack_limit:500,note:'原fight建立双向competition；有限调用原do_attack，原胜负阈值自然触发lost。教师数值、技能、护甲、随机和回调不改。学生强度为显式机制实验输入，非同成本平衡比较。'}}];}
export function validateZhou43Record(raw,c){
    canonical??=new Map(zhou43Conditions({},readTeaching43Source).map(c=>[c.id,c]));assertTeaching43Contract(c,canonical.get(c.id));const p=c.parameters;
    assert.equal(raw.outcome,'observed');assert.equal(raw.teaching.length,1);const s=raw.teaching[0],b=s.before;assert.equal(s.command,p.action);assert.equal(s.command_accepted,1);assert.equal(s.teacher_program,p.teacher.path);assert.match(s.teacher,new RegExp('^'+p.teacher.path+'#\\d+$'));assert.equal(s.student,raw.before[0].object);
    assert.deepEqual(b.skills,p.actor.skills);assert.deepEqual(b.learned,{});assert.deepEqual(b.mappings,{});assert.deepEqual(b.grants,{[key]:0});assert.deepEqual(s.after,b);
    for(const k of ['jing','neili','max_neili','max_jingli','str','int','con','dex','combat_exp','potential','learned_points','shen'])assert.equal(b[k],p.actor.properties[k]);
    assert.equal(b.character,p.actor.properties.character);assert.equal(b.contribution,100);for(const k of ['family','master_id','master_name'])assert.equal(b[k]??0,0);
    assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');assert.ok(Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=raw.elapsed);
    const initial=raw.zhou_initial,competition=raw.zhou_competition,final=raw.zhou_final,attacks=raw.zhou_attacks,events=raw.zhou_lost;
    function identity(pt){assert.equal(pt.teacher,s.teacher);assert.equal(pt.student,s.student);assert.equal(pt.teacher_location,'/tests/runner');assert.equal(pt.student_location,'/tests/runner');assert.equal(pt.student_living,1);assert.equal(pt.teacher_living,1);assert.equal(pt.student_killing,0);assert.equal(pt.teacher_killing,0);assert.equal(pt.teacher_max_qi,47000);assert.equal(pt.teacher_neili,20000);assert.ok(Number.isSafeInteger(pt.teacher_qi)&&Number.isSafeInteger(pt.teacher_eff_qi)&&pt.teacher_qi>0&&pt.teacher_eff_qi>0);}
    for(const pt of [initial,competition,final,...attacks.flatMap(a=>[a.before,a.after]),...events.map(e=>e.point)])identity(pt);
    assert.deepEqual(initial.state,b);assert.equal(initial.teacher_qi,47000);assert.equal(initial.teacher_eff_qi,47000);assert.equal(initial.teacher_neili,20000);
    assert.equal(initial.student_competitor,'');assert.equal(initial.teacher_competitor,'');assert.equal(initial.student_effective_str,230);assert.equal(initial.potential_limit,21500);
    assert.deepEqual(competition.state,b);assert.equal(competition.student_competitor,s.teacher);assert.equal(competition.teacher_competitor,s.student);assert.equal(competition.student_fighting,1);assert.equal(competition.teacher_fighting,1);
    assert.ok(attacks.length>=1&&attacks.length<=500);let previous=competition;
    for(const [i,a]of attacks.entries()){assert.equal(a.index,i);assert.deepEqual(a.before,previous);assert.equal(a.before.state.grants[key],0);assert.equal(a.before.student_competitor,s.teacher);assert.equal(a.before.teacher_competitor,s.student);assert.ok(a.after.teacher_qi<=a.before.teacher_qi);if(i<attacks.length-1)assert.deepEqual(a.after.state,a.before.state,'this source-qualified strong-input attack has no student learning/reward before lost');previous=a.after;}
    assert.deepEqual(final,previous);assert.equal(final.state.grants[key],1);assert.equal(final.teacher_competitor,'');assert.equal(final.student_competitor,'');assert.equal(final.teacher_fighting,0);assert.equal(final.student_fighting,0);
    const last=attacks.at(-1);assert.ok(last.before.teacher_qi*3>47000);assert.ok(last.after.teacher_qi*3<=47000);assert.equal(events.length,2);
    assert.deepEqual(events.map(e=>e.phase),['before','after']);for(const e of events){assert.equal(e.caller,'/adm/daemons/combatd');assert.equal(e.path,path);assert.equal(e.sha256,hash);assert.ok(Number.isFinite(e.elapsed)&&e.elapsed>=0&&e.elapsed<=raw.elapsed);}
    const rb=events[0].point,ra=events[1].point;assert.equal(rb.teacher_competitor,s.student);assert.equal(rb.student_competitor,'');assert.equal(rb.teacher_fighting,0);assert.equal(rb.student_fighting,0);assert.equal(rb.state.grants[key],0);assert.equal(ra.state.grants[key],1);
    assert.ok(events[0].elapsed<=events[1].elapsed);assert.deepEqual(rb.state,last.before.state);assert.deepEqual(ra,final);
    const expected=structuredClone(rb.state);expected.grants[key]=1;
    for(const [field,lo,hi]of [['combat_exp',20000,29999],['potential',2000,2999],['score',800,1099],['weiwang',800,1099]]){const delta=ra.state[field]-rb.state[field];assert.ok(Number.isSafeInteger(delta)&&delta>=lo&&delta<=hi,field+' reward window');expected[field]+=delta;}
    assert.equal(rb.state.skills['martial-cognize']??0,0);expected.skills['martial-cognize']=1;expected.learned['martial-cognize']=0;assert.deepEqual(ra.state,expected);assert.deepEqual(final.state,ra.state);
    assert.deepEqual(ra,{...rb,state:expected,teacher_competitor:''},'the actual lost window may only grant original rewards and clear the teacher competitor');
    for(const [which,pt]of [['before',initial],['after',final]]){const state=raw[which][0];for(const k of ['skills','learned','mappings','jing','neili','max_neili','max_jingli','str','int','con','dex','combat_exp','potential','learned_points','shen'])assert.deepEqual(state[k],pt.state[k]);for(const k of ['userp','playerp','interactive','living'])assert.equal(state[k],1);assert.equal(state.wizardp,0);assert.equal(state.ghost,0);assert.equal(state.cultivation.class,'fighter');assert.equal(state.cultivation['family/family_name']??0,0);}
    for(const state of [raw.before[0],raw.after[0]]){
        for(const k of ['qi','eff_qi','max_qi','eff_jing','max_jing','gender','jiali'])assert.equal(state[k],p.actor.properties[k]);
        assert.deepEqual(state.preparations,{});assert.equal(state.weapon,'none');assert.equal(state.handing,'none');assert.equal(state.temp.apply.unarmed_damage,5000);assert.ok(!state.temp.daub);
    }
    assert.equal(raw.zhou_cleanup.teacher_exists,0);assert.deepEqual(raw.after[1],raw.before[1]);assertTeaching43Counters(raw.metrics[1]);
    assert.equal(raw.attacks.length,attacks.length);const counters={};
    for(const [i,a]of raw.attacks.entries()){
        assert.deepEqual(a,{actor:0,target:-1,type:0,result:a.result,damage:a.damage,actor_object:s.student,target_object:s.teacher});assert.ok([0,-1,-2].includes(a.result));
        assert.ok(Number.isSafeInteger(a.damage)&&a.damage>=0&&a.damage<=4421);assert.equal(a.damage,attacks[i].before.teacher_qi-attacks[i].after.teacher_qi);if(a.result!==0)assert.equal(a.damage,0);
        const name=a.result===0?'hit':a.result===-1?'dodge':'parry';counters[name]=(counters[name]??0)+1;
    }
    assertTeaching43Counters(raw.metrics[0],counters);
    assert.equal(raw.dodge_checks.length,2*attacks.length);
    for(let i=0;i<attacks.length;i++){
        const base=raw.dodge_checks[2*i],settled=raw.dodge_checks[2*i+1];
        assert.deepEqual(base,{actor:0,target:-1,type:0,busy:null,skill:'shexing-lifan',phase:'base',ap:base.ap,dp:base.dp});
        assert.ok(Number.isSafeInteger(base.ap)&&Number.isSafeInteger(base.dp)&&base.ap>base.dp&&base.dp>0);assert.deepEqual(settled,{...base,phase:'settled'});
    }
    // Incoming is before final damage scaling: floor((5000+4999)/2)+floor((230+229)/3)=5152.
    assert.ok(raw.defenses.length<=attacks.length);for(const d of raw.defenses){assert.deepEqual(d,{route:'ordinary',actor:0,target:-1,skill:'jinguan-yusuo',result:0,incoming:d.incoming});assert.ok(Number.isSafeInteger(d.incoming)&&d.incoming>0&&d.incoming<=5152);}
    for(const name of ['launches','terminals','callbacks','passives','interfaces'])assert.deepEqual(raw[name],[]);
    return[{advanced:true,acquired:true,command_kind:'fight',jing_spent:0}];
}
