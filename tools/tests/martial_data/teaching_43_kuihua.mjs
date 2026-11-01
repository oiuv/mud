import assert from'node:assert/strict';
import{sha256,scanSource}from'./inventory.mjs';
import{assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source}from'./teaching_43_contract.mjs';
export const kuihua43Group='teaching-43-kuihua';const path='kungfu/class/riyue/dongfang/dongfang.c',hash='d9ba06f99b73807fd37f6597f9f9ec47a4f3d334bd3ec07e04b977d8498af6b2';let canonical;
export function kuihua43Probe(source,file){
    if(file!==path)return{sites:[]};assert.equal(sha256(source),hash);const fn=scanSource(source).functions.find(f=>f.name==='teach_kuihua');assert.ok(fn);
    const offset=source.indexOf('    if (environment(me)',fn.start);assert.ok(offset>fn.start&&offset<fn.end);
    return{sites:[{position:'offset',offset,function:fn.name,insert:'    "/tests/runner"->observe_kuihua43(this_object(), me, j, lv);\n'}]};
}
export function kuihua43Conditions(relations,readSource){
    const s=readSource(path);assert.equal(sha256(s),hash);const fn=scanSource(s).functions.find(f=>f.name==='ask_kuihua'),entry={id:path+':'+fn.line+':ask_kuihua',path,sha256:hash,function:'ask_kuihua',line:fn.line,role:'teaching'};
    const sources=[path,'cmds/std/ask.c','feature/damage.c','feature/skill.c','feature/condition.c','inherit/char/char.c','clone/user/user.c'];
    return[{id:'teaching-43-kuihua-natural-conversion',stage:'school',method:'teaching',entry_id:entry.id,samples:100,status:'configured_not_executed',parameters:{
        collection_group:kuihua43Group,teaching_profile:kuihua43Group,teaching_kind:'natural-delayed-conversion',teacher:{path:'/'+path.slice(0,-2),id:'dongfang bubai',sha256:hash},
        teaching_entry:entry,teaching_evidence:{path,sha256:hash,line:fn.line,start:fn.start,end:fn.end},qualification_sources:sources,qualification_evidence:sources.map(path=>({path,sha256:sha256(readSource(path))})),
        actor:{properties:{name:'试武甲',class:'fighter',gender:'无性',character:'心狠手辣',str:30,int:30,con:30,dex:30,combat_exp:100000000,shen:0,gongxian:100,
            qi:60000,eff_qi:60000,max_qi:60000,jing:10000,eff_jing:10000,max_jing:10000,neili:60000,max_neili:60000,max_jingli:1000,potential:10000,learned_points:0,food:0,water:0},
            skills:{'pixie-jian':300,force:300,dodge:300,parry:300,literate:100},mappings:{},preparations:{}},target:{skills:{},mappings:{},properties:{}},named_participants:true,
        action:'ask dongfang bubai about 葵花魔功',topic:'葵花魔功',monitored_grants:[],teaching_expectations:[{action:'ask dongfang bubai about 葵花魔功',command_kind:'ask'}],
        expected:['observed','refused'],fighting:false,observe_seconds:30,not_applicable:'',note:'原ask与原2/3秒call_out，自然终态或30秒故障看门狗。food/water0为明确实验资源输入，保留真实心跳，无强制随机/手动回调/teach_kh/葵花注入。'}}];
}
export function validateKuihua43Record(raw,c){
    canonical??=new Map(kuihua43Conditions({},readTeaching43Source).map(c=>[c.id,c]));assertTeaching43Contract(c,canonical.get(c.id));const p=c.parameters;
    assert.equal(raw.teaching.length,1);const s=raw.teaching[0],b=s.before;assert.equal(s.command,p.action);assert.equal(s.command_accepted,1);assert.equal(s.teacher_program,p.teacher.path);
    assert.match(s.teacher,new RegExp('^'+p.teacher.path+'#\\d+$'));assert.equal(s.student,raw.before[0].object);assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');
    assert.ok(Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<2);assert.deepEqual(b.skills,p.actor.skills);assert.deepEqual(b.learned,{});assert.deepEqual(b.mappings,{});assert.deepEqual(b.grants,{});
    for(const k of ['jing','neili','max_neili','max_jingli','str','int','con','dex','combat_exp','potential','learned_points','shen'])assert.equal(b[k],p.actor.properties[k]);
    for(const k of ['family','master_id','master_name'])assert.equal(b[k]??0,0);assert.equal(b.character,p.actor.properties.character);assert.equal(b.contribution,100);
    const spent=b.jing-s.after.jing;assert.ok(Number.isSafeInteger(spent)&&spent>=10&&spent<=19);const instant=structuredClone(b);instant.jing-=spent;instant.neili=58300;assert.deepEqual(s.after,instant);
    const start=raw.kuihua_initial,immediate=raw.kuihua_immediate,final=raw.kuihua_final,entries=raw.kuihua_entries,n=entries.length;
    assert.ok(n===6||n===7);assert.ok(Number.isFinite(raw.elapsed)&&raw.elapsed>=15&&raw.elapsed<=31);
    function identity(point){assert.equal(point.teacher,s.teacher);assert.equal(point.student,s.student);assert.equal(point.teacher_location,'/tests/runner');assert.equal(point.student_location,'/tests/runner');assert.equal(point.living,1);assert.equal(point.food,0);assert.equal(point.water,0);}
    for(const point of [start,immediate,final,...entries.map(e=>e.point)])identity(point);
    assert.deepEqual(start.state,b);assert.equal(start.qi,60000);assert.equal(start.eff_qi,60000);assert.equal(start.teach_kh,0);assert.deepEqual(start.pending,[]);
    assert.deepEqual(immediate.state,s.after);assert.equal(immediate.qi,45000);assert.equal(immediate.eff_qi,45000);assert.equal(immediate.teach_kh,1);
    assert.ok(Array.isArray(raw.immediate));assert.equal(raw.immediate.length,raw.before.length);
    const immediateSnapshot=structuredClone(raw.before[0]);
    for(const key of ['qi','eff_qi'])immediateSnapshot[key]=immediate[key];
    for(const key of ['jing','neili'])immediateSnapshot[key]=s.after[key];
    assert.ok([2,3].includes(raw.immediate[0].busy));immediateSnapshot.busy=raw.immediate[0].busy;
    immediateSnapshot.temp.teach_kh=1;assert.deepEqual(raw.immediate[0],immediateSnapshot);
    assert.deepEqual(raw.immediate.slice(1),raw.before.slice(1));
    for(const point of [raw.before[0],raw.immediate[0],raw.after[0]])assert.equal(point.cultivation['special_skill/guimai']??0,0);
    assert.equal(immediate.pending.length,1);assert.deepEqual(immediate.pending[0],{owner:s.teacher,function:'teach_kuihua',remaining:immediate.pending[0].remaining});assert.ok(Number.isSafeInteger(immediate.pending[0].remaining)&&immediate.pending[0].remaining>=1&&immediate.pending[0].remaining<=2);
    for(const [i,e]of entries.entries()){
        assert.equal(e.j,i);assert.equal(e.level,300);assert.equal(e.path,path);assert.equal(e.sha256,hash);assert.ok(Number.isFinite(e.elapsed)&&e.elapsed>=.5&&e.elapsed<=raw.elapsed);
        if(i)assert.ok(e.elapsed-entries[i-1].elapsed>=2&&e.elapsed-entries[i-1].elapsed<=6);else assert.ok(e.elapsed>=.9&&e.elapsed<5);
        const expected=structuredClone(instant);expected.neili-=1300*i;assert.deepEqual(e.point.state,expected);assert.equal(e.point.qi,45000-1100*i);assert.equal(e.point.eff_qi,e.point.qi);assert.equal(e.point.teach_kh,1);assert.deepEqual(e.point.pending,[]);
    }
    assert.ok(raw.elapsed-entries.at(-1).elapsed>=0&&raw.elapsed-entries.at(-1).elapsed<=2,'terminal must follow the actual final callback within the one-second poll window plus timer tolerance');
    assert.deepEqual(final.pending,[]);assert.equal(final.qi,45000-1100*n);assert.equal(final.eff_qi,final.qi);const expected=structuredClone(instant);expected.neili-=1300*n;
    if(raw.kuihua_terminal==='converted'){
        assert.equal(raw.outcome,'observed');delete expected.skills['pixie-jian'];expected.skills['kuihua-mogong']=250;
        for(const k of ['force','dodge','parry']){expected.skills[k]=301;expected.learned[k]=0;}expected.skills['martial-cognize']=1;expected.learned['martial-cognize']=0;assert.equal(final.teach_kh,0);
    }else{assert.equal(raw.kuihua_terminal,'random_non_acquisition');assert.equal(raw.outcome,'refused');assert.equal(final.teach_kh,1);}
    assert.deepEqual(final.state,expected);assert.equal(raw.kuihua_cleanup.teacher_exists,0);
    assertTeaching43Counters(raw.metrics[0],{jing_cost:spent,qi_cost:15000+1100*n,eff_qi_cost:15000+1100*n,neili_cost:1700+1300*n});
    const cfg=structuredClone(c);delete cfg.parameters.actor.properties.qi;delete cfg.parameters.actor.properties.eff_qi;assertTeaching43Snapshots(raw,b,expected,cfg);
    for(const which of ['before','after']){assert.equal(raw[which][0].cultivation.class,'fighter');assert.equal(raw[which][0].cultivation['family/family_name']??0,0);}
    assert.equal(raw.before[0].qi,60000);assert.equal(raw.before[0].eff_qi,60000);assert.equal(raw.after[0].qi,final.qi);assert.equal(raw.after[0].eff_qi,final.eff_qi);
    assert.equal(raw.before[0].temp.teach_kh??0,0);assert.equal(raw.after[0].temp.teach_kh??0,final.teach_kh);
    return[{advanced:true,acquired:raw.outcome==='observed',command_kind:'ask',jing_spent:spent}];
}
