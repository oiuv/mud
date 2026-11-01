import assert from 'node:assert/strict';
import {scanSource,sha256} from './inventory.mjs';
import {assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source} from './teaching_43_contract.mjs';
let canonical;
export const asyncRecruit43Group='teaching-43-recruit-async';
export const asyncRecruit43Teachers=[
    {key:'yue-buqun',path:'kungfu/class/huashan/yue-buqun.c',hash:'71361bdbd9125109b078c290c375942ce2f074dad9af38f9a64a5bd77d93fe16',id:'yue buqun',name:'岳不群',family:'华山派',generation:14,mode:'delayed',gender:'男性',class:'swordsman'},
    {key:'yue-wife',path:'kungfu/class/huashan/yue-wife.c',hash:'91a86e3059db3a1191c377d9f7f00246ac1f70ef20550ffbda73644d169e0a23',id:'yue wife',name:'岳夫人',family:'华山派',generation:14,mode:'delayed',gender:'女性',class:'huashan'},
    {key:'ding',path:'kungfu/class/xingxiu/ding.c',hash:'8ee965c0aa83bd260873d504e53ce1c6007355c10b8c4ed92cbcf6d76705024b',id:'ding chunqiu',name:'丁春秋',family:'星宿派',generation:2,mode:'flatter',gender:'男性',class:'taoist'},
];
const sourcePaths=['cmds/skill/apprentice.c','cmds/skill/recruit.c','feature/apprentice.c',
    'kungfu/class/huashan/qizong.h','kungfu/class/xingxiu/xingxiu.h'];
const variants=d=>d.mode==='delayed'?['grant','gender','shen','xinfa','sword']:['grant','wrong-text','shen','exp','poison','palm'];
function config(d,v){
    assert.ok(variants(d).includes(v));const delayed=d.mode==='delayed';
    const properties={name:'试武甲',gender:d.gender,class:'fighter',str:30,con:30,int:30,dex:30,
        combat_exp:delayed?1000000:300000,shen:delayed?20000:-12000,gongxian:100,potential:10000,learned_points:0,
        jing:10000,eff_jing:10000,max_jing:10000,qi:10000,eff_qi:10000,max_qi:10000,neili:2000,max_neili:2000};
    const skills=delayed?{force:40,dodge:40,parry:40,'huashan-xinfa':140,'huashan-jian':140}
        :{force:40,dodge:40,parry:40,'chousui-zhang':120,poison:120};
    if(v==='gender')properties.gender=d.gender==='男性'?'女性':'男性';
    if(v==='shen')properties.shen+=delayed?-1:1;
    if(v==='xinfa')skills['huashan-xinfa']--;
    if(v==='sword')skills['huashan-jian']--;
    if(v==='exp')properties.combat_exp--;
    if(v==='poison')skills.poison--;
    if(v==='palm')skills['chousui-zhang']--;
    const action=`apprentice ${d.id}`,commands=[action];
    if(!delayed&&['grant','wrong-text'].includes(v))commands.push(v==='grant'?'flatter 星宿老仙，德配天地':'flatter 老仙你好',action);
    return {actor:{properties,skills,mappings:{},preparations:{}},commands,success:v==='grant'};
}
export function asyncRecruit43Conditions(relations,readSource){
    return asyncRecruit43Teachers.flatMap(d=>{
        const s=readSource(d.path);assert.equal(sha256(s),d.hash,'async teacher drift');
        const f=scanSource(s).functions.find(f=>f.name==='attempt_apprentice');assert.ok(f);
        const entry={id:`${d.path}:${f.line}:attempt_apprentice`,path:d.path,sha256:d.hash,function:'attempt_apprentice',line:f.line,role:'teaching'};
        const paths=[d.path,...sourcePaths],evidence=paths.map(path=>({path,sha256:sha256(readSource(path))}));
        return variants(d).map(variant=>{const c=config(d,variant);return {id:`teaching-43-async-${d.key}-${variant}`,stage:'school',method:'teaching',entry_id:entry.id,samples:2,
            status:'configured_not_executed',parameters:{collection_group:asyncRecruit43Group,teaching_profile:asyncRecruit43Group,
                teaching_kind:'apprenticeship',recruit_mode:d.mode,teacher_key:d.key,variant,
                teacher:{path:'/'+d.path.slice(0,-2),id:d.id,sha256:d.hash},teaching_entry:entry,
                teaching_evidence:{path:d.path,sha256:d.hash,line:f.line,start:f.start,end:f.end},
                qualification_sources:paths,qualification_evidence:evidence,action:c.commands[0],topic:'拜师',actor:c.actor,
                target:{skills:{},mappings:{},properties:{}},monitored_grants:[],named_participants:true,
                teaching_expectations:c.commands.map(action=>({action,command_kind:action.startsWith('flatter ')?'flatter':'apprentice'})),
                expected:c.success?'observed':'refused',fighting:false,observe_seconds:0,not_applicable:'',
                note:'原拜师意向与原回调/奉承动作；即时状态与自然回调完成分列，不预写pending、不直接调用原回调。'}};});
    });
}
export function validateAsyncRecruit43Record(raw,c){
    canonical??=new Map(asyncRecruit43Conditions({},readTeaching43Source).map(c=>[c.id,c]));
    assertTeaching43Contract(c,canonical.get(c.id));
    const p=c.parameters,d=asyncRecruit43Teachers.find(d=>d.key===p.teacher_key);assert.ok(d);
    const cfg=config(d,p.variant),success=cfg.success,delayed=d.mode==='delayed';
    assert.equal(c.id,`teaching-43-async-${d.key}-${p.variant}`);assert.equal(c.method,'teaching');
    assert.equal(p.collection_group,asyncRecruit43Group);assert.equal(p.teaching_profile,asyncRecruit43Group);assert.equal(p.recruit_mode,d.mode);
    assert.deepEqual(p.actor,cfg.actor);assert.deepEqual(p.teacher,{path:'/'+d.path.slice(0,-2),id:d.id,sha256:d.hash});
    assert.equal(p.teaching_entry.path,d.path);assert.equal(p.teaching_entry.sha256,d.hash);assert.equal(p.teaching_entry.function,'attempt_apprentice');
    assert.equal(p.action,cfg.commands[0]);assert.equal(p.expected,success?'observed':'refused');assert.equal(raw.outcome,p.expected);
    assert.equal(raw.kind,'sample');assert.equal(raw.method,'teaching');assert.equal(raw.condition_id,c.id);
    assert.equal(raw.teaching.length,delayed?2:cfg.commands.length);assert.ok(Array.isArray(raw.teaching_gate_entries));
    const steps=raw.teaching,initial=steps[0].before,teacher=steps[0].teacher;
    assert.deepEqual(initial.recruitment.family,{});assert.equal(initial.recruitment.pending_apprentice,'');
    assert.equal(initial.recruitment.pending_betrayer,'');assert.equal(initial.recruitment.pending_flatter,0);
    assert.deepEqual(initial.skills,cfg.actor.skills);assert.deepEqual(initial.learned,{});assert.deepEqual(initial.mappings,{});
    for(const key of ['str','con','int','dex','combat_exp','shen','neili','max_neili','jing','potential','learned_points'])assert.equal(initial[key],cfg.actor.properties[key]);
    assert.equal(initial.contribution,cfg.actor.properties.gongxian);
    assert.equal(initial.recruit_qualification.gender,cfg.actor.properties.gender);
    assert.deepEqual(raw.recruit_teacher_initial,{teacher,available:delayed?3:0,availavble:0,callbacks:[]});
    assert.deepEqual(steps[0].after.recruitment.family,{});assert.equal(steps[0].after.recruitment.pending_apprentice,teacher);
    assert.equal(steps[0].after.recruitment.pending_flatter,!delayed&&['grant','wrong-text'].includes(p.variant)?1:0);
    const intent=structuredClone(initial);
    intent.recruitment.pending_apprentice=teacher;
    intent.recruitment.pending_flatter=!delayed&&['grant','wrong-text'].includes(p.variant)?1:0;
    assert.deepEqual(steps[0].after,intent,'intent command may only set its two original pending fields');
    const compareStable=(a,b)=>{for(const k of ['skills','learned','mappings','jing','neili','max_neili','max_jingli','potential','learned_points','str','con','int','dex','combat_exp','shen'])assert.deepEqual(a[k],b[k],k);};
    for(const [i,s]of steps.entries()){
        assert.equal(s.teacher,teacher);assert.equal(s.teacher_program,p.teacher.path);assert.equal(s.student,raw.before[0].object);assert.equal(s.student,raw.after[0].object);
        assert.ok(teacher.startsWith(p.teacher.path));assert.match(teacher.slice(p.teacher.path.length),/^#\d+$/);assert.equal(s.command,delayed?p.action:cfg.commands[i]);
        assert.deepEqual(s.teacher_family,{family_name:d.family,generation:d.generation-1});
        assert.deepEqual(s.teacher_identity,{id:d.id,name:d.name,class:delayed?'swordsman':'taoist',attempt_source:'/'+d.path.slice(0,-2)});
        assert.equal(s.command_accepted,delayed&&i===1&&!success?0:!delayed&&i===2&&!success?0:1);
        assert.equal(s.teacher_pending_recruit,'');assert.ok(Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=raw.elapsed);assert.ok(Number.isSafeInteger(s.wall_time));
        assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');assert.ok(Array.isArray(s.messages));
        compareStable(s.before,s.after);if(i>0&&!delayed)assert.deepEqual(s.before,steps[i-1].after);
    }
    let final;
    if(delayed){
        const w=raw.recruit_wait;assert.ok(w&&w.waiting===0&&w.elapsed>=2&&w.elapsed<10&&w.elapsed<=raw.elapsed);
        assert.deepEqual(w.before,steps[0].after);assert.deepEqual(w.after,steps[1].before);
        assert.equal(w.teacher_before.teacher,teacher);assert.equal(w.teacher_before.available,3);assert.equal(w.teacher_before.availavble,0);
        assert.equal(w.teacher_before.callbacks.length,1);assert.equal(w.teacher_before.callbacks[0].owner,teacher);assert.equal(w.teacher_before.callbacks[0].function,'do_recruit');
        assert.ok(Number.isFinite(w.teacher_before.callbacks[0].remaining)&&w.teacher_before.callbacks[0].remaining>=0&&w.teacher_before.callbacks[0].remaining<=2);
        assert.deepEqual(w.teacher_after,{teacher,available:3,availavble:success?-1:0,callbacks:[]});
        assert.ok(Array.isArray(w.messages));compareStable(w.before,w.after);final=w.after;
        assert.deepEqual(steps[1].after,steps[1].before,'repeat greeting/pending refusal must not change state');
        assert.deepEqual(raw.teaching_gate_entries.map(e=>e.function),['attempt_apprentice','do_recruit','permit_recruit']);
        assert.ok(raw.teaching_gate_entries[1].elapsed-raw.teaching_gate_entries[0].elapsed>=0.9,'original two-second callback with integer tick tolerance');
    }else{
        final=steps.at(-1).after;
        if(steps.length===3)assert.deepEqual(steps[2].after,steps[2].before,'greeting/pending rejection cannot rewrite class or membership');
        assert.deepEqual(raw.teaching_gate_entries.map(e=>e.function),['attempt_apprentice',...(['grant','wrong-text'].includes(p.variant)?['do_flatter']:[])]);
    }
    let previousEvent=-1;
    for(const event of raw.teaching_gate_entries){
        assert.equal(event.teacher,teacher);assert.equal(event.student,raw.before[0].object);
        const path=event.function==='permit_recruit'?'kungfu/class/huashan/qizong.h':d.path;
        assert.equal(event.path,path);assert.ok(p.qualification_evidence.some(e=>e.path===event.path&&e.sha256===event.sha256));
        assert.ok(Number.isFinite(event.elapsed)&&event.elapsed>=0&&event.elapsed<=raw.elapsed);
        assert.ok(event.elapsed>=previousEvent,'original gate entries must retain chronological order');previousEvent=event.elapsed;
    }
    const f=final.recruitment.family;
    if(success){assert.equal(f.family_name,d.family);assert.equal(f.master_id,d.id);assert.equal(f.master_name,d.name);assert.equal(f.generation,d.generation);
        assert.equal(f.title,'传人');assert.equal(f.privs,0);assert.ok(f.enter_time>=steps[0].wall_time&&f.enter_time<=steps.at(-1).wall_time+1);
        assert.equal(final.recruitment.pending_apprentice,'');assert.equal(final.recruitment.class,d.class);assert.equal(final.contribution,0);
    }else{assert.deepEqual(f,{});assert.equal(final.recruitment.pending_apprentice,teacher);assert.equal(final.recruitment.class,'fighter');assert.equal(final.contribution,100);}
    const expected=structuredClone(intent);expected.recruitment.pending_flatter=0;
    if(success){
        assert.deepEqual(Object.keys(f).sort(),['family_name','master_id','master_name','generation','enter_time','title','privs'].sort());
        Object.assign(expected,{family:d.family,master_id:d.id,master_name:d.name,contribution:0});
        Object.assign(expected.recruit_qualification,{gongxian:0,class:d.class});
        Object.assign(expected.recruitment,{family:f,class:d.class,pending_apprentice:'',
            title:d.family+(d.generation===14?'第十四代传人':'第二代传人')});
    }
    assert.deepEqual(final,expected,'completion may only apply reviewed recruit side effects');
    assert.equal(final.recruitment.name,cfg.actor.properties.name);assert.equal(final.recruitment.pending_flatter,0);
    for(const [state,point]of [['before',initial],['after',steps.at(-1).after]])for(const key of ['skills','learned','mappings','jing','neili','max_neili','str'])assert.deepEqual(raw[state][0][key],point[key]);
    assertTeaching43Counters(raw.metrics?.[0]);
    assertTeaching43Snapshots(raw,initial,steps.at(-1).after,c);
    return [{advanced:success,acquired:success,jing_spent:0,contribution_spent:success?100:0}];
}
