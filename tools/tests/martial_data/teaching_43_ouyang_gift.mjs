import assert from 'node:assert/strict';
import {scanSource,sha256} from './inventory.mjs';
import {assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source} from './teaching_43_contract.mjs';
export const ouyangGift43Group='teaching-43-ouyang-gift';let canonical;
const keys=['can_learn/lingshe-quan/count','can_learn/lingshe-quan/ke'];
export function ouyangGift43Conditions(relations,readSource){
    const path='kungfu/class/ouyang/ouyangke.c',source=readSource(path),fn=scanSource(source).functions.find(f=>f.name==='accept_object');assert.ok(fn);
    const files=[path,'d/city/npc/mudren-mm.c','cmds/std/get.c','cmds/std/give.c','clone/money/silver.c','inherit/char/char.c','feature/damage.c','feature/move.c'];
    const entry={id:path+':'+fn.line+':accept_object',path,sha256:sha256(source),function:'accept_object',line:fn.line,role:'teaching'};
    return [{id:'teaching-43-ouyang-gift-threshold',stage:'school',method:'teaching',entry_id:entry.id,samples:100,status:'configured_not_executed',parameters:{
        collection_group:ouyangGift43Group,teaching_profile:ouyangGift43Group,teaching_kind:'gift-permission',
        teacher:{path:'/kungfu/class/ouyang/ouyangke',id:'ouyang ke',sha256:sha256(source)},teaching_entry:entry,
        teaching_evidence:{path,sha256:sha256(source),line:fn.line,start:fn.start,end:fn.end},qualification_sources:files,
        qualification_evidence:files.map(path=>({path,sha256:sha256(readSource(path))})),
        actor:{properties:{name:'试武甲',class:'fighter',gender:'男性',character:'心狠手辣',str:30,int:30,con:30,dex:30,shen:0,combat_exp:1000000,gongxian:100,
            qi:10000,eff_qi:10000,max_qi:10000,jing:10000,eff_jing:10000,max_jing:10000,neili:2000,max_neili:2000,max_jingli:1000,potential:10000,learned_points:0,
            'can_learn/lingshe-quan/count':10},skills:{},mappings:{},preparations:{}},target:{skills:{},mappings:{},properties:{}},named_participants:true,
        monitored_grants:keys,action:'get yinbing xiaojie',topic:'原成年NPC阈值礼物',
        teaching_expectations:[{action:'get yinbing xiaojie',command_kind:'get'},{action:'give yinbing xiaojie to ouyang ke',command_kind:'give'}],
        expected:'observed',fighting:false,observe_seconds:0,not_applicable:'',
        note:'原成年NPC经原unconcious显式准备，原get/give。计数10为阈值输入，非自然前十次礼物；只观测原回程排期，不冒称已回程。'}}];
}
export function validateOuyangGift43Record(raw,c){
    canonical??=new Map(ouyangGift43Conditions({},readTeaching43Source).map(c=>[c.id,c]));assertTeaching43Contract(c,canonical.get(c.id));
    const p=c.parameters;assert.equal(raw.outcome,'observed');assert.equal(raw.teaching.length,2);const initial=raw.teaching[0].before;
    assert.deepEqual(initial.skills,{});assert.deepEqual(initial.learned,{});assert.deepEqual(initial.mappings,{});assert.deepEqual(initial.grants,{[keys[0]]:10,[keys[1]]:0});
    for(const k of ['jing','neili','max_neili','max_jingli','str','int','con','dex','combat_exp','potential','learned_points','shen'])assert.equal(initial[k],p.actor.properties[k]);
    assert.equal(initial.character,p.actor.properties.character);assert.equal(initial.contribution,100);
    let previous;const first=raw.teaching[0].gift_before;
    const npc=first.npc.object,teacher=raw.teaching[0].teacher,home='/tests/runner';
    assert.match(npc,/^\/d\/city\/npc\/mudren-mm#\d+$/);assert.match(teacher,/^\/kungfu\/class\/ouyang\/ouyangke#\d+$/);
    assert.equal(first.npc.program,'/d/city/npc/mudren-mm');assert.equal(first.npc.id,'yinbing xiaojie');assert.equal(first.npc.gender,'女性');assert.equal(first.npc.age,21);
    assert.equal(first.npc.userp,0);assert.equal(first.npc.living,0);assert.equal(first.npc.holder,home);assert.equal(first.teacher_location,home);assert.equal(first.student_location,home);
    assert.equal(first.npc.sex_times,0);assert.equal(first.npc.sex_ouyang,0);assert.equal(first.npc.sex_first,0);assert.equal(first.silver_total,0);assert.deepEqual(first.return_callbacks,[]);
    for(const [i,s]of raw.teaching.entries()){
        assert.equal(s.command,p.teaching_expectations[i].action);assert.equal(s.command_accepted,1);assert.equal(s.teacher,teacher);assert.equal(s.teacher_program,p.teacher.path);assert.equal(s.student,raw.before[0].object);
        assert.ok(Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=raw.elapsed);assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');assert.ok(Array.isArray(s.messages));
        if(previous){assert.deepEqual(s.before,previous.after);assert.deepEqual(s.gift_before,previous.gift_after);}
        const expected=structuredClone(s.before),ctx=structuredClone(s.gift_before);
        if(i===0)ctx.npc.holder=s.student;
        else{
            assert.ok(Number.isSafeInteger(s.after.grants[keys[0]])&&s.after.grants[keys[0]]>=11&&s.after.grants[keys[0]]<=15);
            expected.grants[keys[0]]=s.after.grants[keys[0]];expected.grants[keys[1]]=1;
            ctx.npc.holder='/d/city/lichunyuan';ctx.npc.living=1;ctx.npc.sex_times=1;ctx.npc.sex_ouyang=1;ctx.npc.sex_first='欧阳克';
            ctx.teacher_location='/d/city/lichunyuan';ctx.silver_total=20;
            assert.equal(s.gift_after.return_callbacks.length,1);const cb=s.gift_after.return_callbacks[0];
            assert.deepEqual(cb,{owner:teacher,function:'do_back',remaining:cb.remaining});assert.ok(Number.isSafeInteger(cb.remaining)&&cb.remaining>=9&&cb.remaining<=19);ctx.return_callbacks=[cb];
        }
        assert.deepEqual(s.after,expected);assert.deepEqual(s.gift_after,ctx,'original actual object, locations, gift state and silver only');previous=s;
    }
    assert.deepEqual(raw.gift_cleanup,{teacher_exists:0,npc_exists:0});assertTeaching43Counters(raw.metrics[0]);assertTeaching43Snapshots(raw,initial,previous.after,c);
    for(const side of ['before','after']){assert.equal(raw[side][0].cultivation.class,'fighter');assert.equal(raw[side][0].cultivation['family/family_name']??0,0);}
    return raw.teaching.map((s,i)=>({advanced:true,acquired:i===1,command_kind:p.teaching_expectations[i].command_kind,jing_spent:0}));
}
