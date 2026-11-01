import assert from 'node:assert/strict';
import {scanSource,sha256} from './inventory.mjs';
import {assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source} from './teaching_43_contract.mjs';
export const access43Group='teaching-43-access';let canonical;
export function access43Conditions(relations,readSource){
    return ['feng-denied','feng-allowed','qingle-letter'].map(lesson=>{
        const feng=lesson.startsWith('feng'),path=feng?'kungfu/class/taohua/feng.c':'kungfu/class/shaolin/qing-le.c',fn=scanSource(readSource(path)).functions.find(f=>f.name===(feng?'ask_learn':'ask_me_1'));assert.ok(fn);
        const entry={id:path+':'+fn.line+':'+fn.name,path,sha256:sha256(readSource(path)),function:fn.name,line:fn.line,role:'teaching'};
        const sources=[path,'cmds/std/ask.c','cmds/std/go.c',...(feng?['d/taohua/tao_in.c','d/taohua/damen.c']:['d/shaolin/cjlou.c','d/shaolin/cjlou1.c','d/shaolin/obj/allow-letter.c','kungfu/class/shaolin/dao-yi.c']), 'inherit/room/room.c'];
        const props={name:'试武甲',class:feng?'fighter':'bonze',gender:'男性',character:'光明磊落',str:30,int:feng?30:20,con:30,dex:30,shen:0,combat_exp:1000000,gongxian:100,
            qi:10000,eff_qi:10000,max_qi:10000,jing:10000,eff_jing:10000,max_jing:10000,neili:2000,max_neili:2000,max_jingli:1000,potential:10000,learned_points:0};
        if(lesson==='feng-allowed')props['can_learn/huang/count']=1;
        if(!feng)Object.assign(props,{'family/family_name':'少林派','family/master_id':'daoyi chanshi',guilty:0});
        const actions=feng?['ask feng mofeng about 学艺']:['go up','ask qingle biqiu about 手谕','go up'];
        return {id:'teaching-43-access-'+lesson,stage:'school',method:'teaching',entry_id:entry.id,samples:100,status:'configured_not_executed',parameters:{
            collection_group:access43Group,teaching_profile:access43Group,teaching_kind:'teaching-access',lesson,
            teacher:{path:'/'+path.slice(0,-2),id:feng?'feng mofeng':'qingle biqiu',sha256:entry.sha256},teaching_entry:entry,
            teaching_evidence:{path,sha256:entry.sha256,line:fn.line,start:fn.start,end:fn.end},qualification_sources:sources,qualification_evidence:sources.map(path=>({path,sha256:sha256(readSource(path))})),
            actor:{properties:props,skills:feng?{}:{literate:100,buddhism:150,dodge:100,'shaolin-shenfa':100,force:100,parry:100},mappings:{},preparations:{}},
            target:{skills:{},mappings:{},properties:{}},named_participants:true,monitored_grants:['can_learn/huang/count'],action:actions[0],topic:feng?'学艺':'手谕',
            teaching_expectations:actions.map(action=>({action,command_kind:action.startsWith('ask ')?'ask':'go'})),expected:lesson==='feng-denied'?'refused':'observed',
            fighting:false,observe_seconds:0,not_applicable:'',note:'原房间初始化教师/守门人；原询问与移动。冯的黄药师许可是明确输入，不冒称本窗口自然取得；清乐手谕必须由原询问新建，不注入通行道具。'}};
    });
}
export function validateAccess43Record(raw,c){
    canonical??=new Map(access43Conditions({},readTeaching43Source).map(c=>[c.id,c]));assertTeaching43Contract(c,canonical.get(c.id));const p=c.parameters,feng=p.lesson.startsWith('feng');
    assert.equal(raw.outcome,p.expected);assert.equal(raw.teaching.length,p.teaching_expectations.length);const initial=raw.teaching[0].before;
    assert.deepEqual(initial.skills,p.actor.skills);assert.deepEqual(initial.learned,{});assert.deepEqual(initial.mappings,{});assert.deepEqual(initial.grants,{'can_learn/huang/count':p.lesson==='feng-allowed'?1:0});
    for(const k of ['jing','neili','max_neili','max_jingli','str','int','con','dex','combat_exp','potential','learned_points','shen'])assert.equal(initial[k],p.actor.properties[k]);
    for(const [key,prop]of [['family','family/family_name'],['master_id','family/master_id']])assert.equal(initial[key]??0,p.actor.properties[prop]??0);
    assert.equal(initial.character,p.actor.properties.character);assert.equal(initial.contribution,100);if(!feng)assert.equal(initial.effective_int,30);
    const room=feng?'/d/taohua/tao_in':'/d/shaolin/cjlou';const first=raw.teaching[0].access_before;
    assert.deepEqual(raw.access_preparation,first);
    assert.equal(first.student_location,room);assert.equal(first.teacher_location,room);assert.equal(first.letters.length,0);
    if(feng)assert.equal(first.teacher_startroom,0);else{assert.match(first.guard,/^\/kungfu\/class\/shaolin\/dao-yi#\d+$/);assert.equal(first.guard_living,1);}
    let previous,total=0;
    for(const [i,s]of raw.teaching.entries()){
        assert.equal(s.command,p.teaching_expectations[i].action);assert.equal(s.teacher_program,p.teacher.path);assert.match(s.teacher,new RegExp('^'+p.teacher.path+'#\\d+$'));assert.equal(s.teacher,raw.teaching[0].teacher);assert.equal(s.student,raw.before[0].object);
        assert.ok(Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=raw.elapsed);assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');
        if(previous){assert.deepEqual(s.before,previous.after);assert.deepEqual(s.access_before,previous.access_after);}
        const spent=s.before.jing-s.after.jing;assert.ok(Number.isSafeInteger(spent));if(p.teaching_expectations[i].command_kind==='ask')assert.ok(spent>=10&&spent<=19);else assert.equal(spent,0);total+=spent;
        const state=structuredClone(s.before);state.jing-=spent;assert.deepEqual(s.after,state);
        const ctx=structuredClone(s.access_before);
        if(feng){assert.equal(s.command_accepted,1);if(p.lesson==='feng-allowed'){
            ctx.student_location='/d/taohua/damen';ctx.teacher_location='/d/taohua/damen';
            assert.match(s.notify_fail,/move: invalid destination 0/,'original missing startroom return failure retained, not silently fixed');
        }}
        else if(i===0){assert.equal(s.command_accepted,0);assert.match(s.notify_fail,/未经许可/);}
        else if(i===1){assert.equal(s.command_accepted,1);assert.equal(s.access_after.letters.length,1);const letter=s.access_after.letters[0];
            assert.match(letter.object,/^\/d\/shaolin\/obj\/allow-letter#\d+$/);assert.deepEqual({...letter,object:undefined},{object:undefined,program:'/d/shaolin/obj/allow-letter',holder:s.student,id:'shou yu',weight:100});ctx.letters=[letter];}
        else{assert.equal(s.command_accepted,1);ctx.student_location='/d/shaolin/cjlou1';}
        assert.deepEqual(s.access_after,ctx);previous=s;
    }
    assert.equal(raw.access_cleanup.teacher_exists,0);assertTeaching43Counters(raw.metrics[0],{jing_cost:total});assertTeaching43Snapshots(raw,initial,previous.after,c);
    for(const which of ['before','after']){assert.equal(raw[which][0].cultivation.class,p.actor.properties.class);assert.equal(raw[which][0].cultivation['family/family_name']??0,p.actor.properties['family/family_name']??0);}
    return raw.teaching.map((s,i)=>({advanced:feng?p.expected==='observed':i>0,acquired:!feng&&i===1,command_kind:p.teaching_expectations[i].command_kind,jing_spent:s.before.jing-s.after.jing}));
}
