import assert from 'node:assert/strict';
import {scanSource,sha256} from './inventory.mjs';
import {assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source} from './teaching_43_contract.mjs';
export const duplicate43Group='teaching-43-duplicate-case';
const path='kungfu/class/tiezhang/fen.c',hash='63fef5595e8b3ad2e9004cd12f4497453044d99a92732c12557b351ae371df9d';
const grant='can_perform/chuanxin-zhang/zhui';let canonical;
export function duplicate43Probe(source,file){
    if(file!==path)return {sites:[]};assert.equal(sha256(source),hash);
    const calls=scanSource(source).calls.filter(c=>c.name==='teach_pfm'&&c.args[2]?.raw.includes('"'+grant+'"'));
    assert.equal(calls.length,2);assert.equal(calls[0].args[2].raw,calls[1].args[2].raw,'duplicate teaching payload must be identical');
    return {sites:calls.map(c=>{const offset=source.lastIndexOf('\n',c.start)+1;
        assert.match(source.slice(offset,c.start),/^\s*return MASTER_D->$/);
        return {position:'offset',offset,function:'accept_ask',original_call:c.start,
            insert:'            "/tests/runner"->observe_duplicate43(this_object(), me, '+JSON.stringify(path)+', '+JSON.stringify(hash)+', '+c.start+');\n'};})};
}
export function duplicate43Conditions(relations,readSource){
    const source=readSource(path);assert.equal(sha256(source),hash);const fn=scanSource(source).functions.find(f=>f.name==='accept_ask');assert.ok(fn);
    const sites=duplicate43Probe(source,path).sites,paths=[path,'adm/daemons/masterd.c','feature/master.c','feature/skill.c','cmds/std/ask.c','kungfu/skill/chuanxin-zhang.c'];
    const entry={id:path+':'+fn.line+':accept_ask',path,sha256:hash,function:'accept_ask',line:fn.line,role:'teaching'};
    return [{id:'teaching-43-duplicate-case-situ-fen-repeat',stage:'school',method:'teaching',entry_id:entry.id,samples:2,status:'configured_not_executed',parameters:{
        collection_group:duplicate43Group,teaching_profile:duplicate43Group,teaching_kind:'duplicate-teaching',
        teacher:{path:'/'+path.slice(0,-2),id:'situ fen',sha256:hash},teaching_entry:entry,teaching_evidence:{path,sha256:hash,line:fn.line,start:fn.start,end:fn.end},
        duplicate_calls:sites.map(s=>s.original_call),qualification_sources:paths,qualification_evidence:paths.map(path=>({path,sha256:sha256(readSource(path))})),
        actor:{properties:{name:'试武甲',class:'fighter',gender:'男性','family/family_name':'铁掌帮',str:30,int:30,con:30,dex:30,
            combat_exp:10000000,shen:-18000,gongxian:200,qi:10000,eff_qi:10000,max_qi:10000,jing:10000,eff_jing:10000,max_jing:10000,
            neili:2000,max_neili:2000,max_jingli:1000,potential:10000,learned_points:0},
            skills:{force:300,dodge:440,parry:100,strike:100,'chuanxin-zhang':100,'martial-cognize':20},mappings:{},preparations:{}},
        target:{skills:{},mappings:{},properties:{}},named_participants:true,monitored_grants:[grant],topic:'穿心锥',action:'ask situ fen about 穿心锥',
        teaching_expectations:[{action:'ask situ fen about 穿心锥',command_kind:'ask'},{action:'ask situ fen about 穿心锥',command_kind:'ask'}],
        fighting:false,observe_seconds:0,expected:'observed',not_applicable:'',note:'原重复case逐调用位置只读探针；不修改switch、条件、payload或随机，观察实际编译分派，不借另一声明冒充覆盖。'}}];
}
export function validateDuplicate43Record(raw,c){
    canonical??=new Map(duplicate43Conditions({},readTeaching43Source).map(c=>[c.id,c]));assertTeaching43Contract(c,canonical.get(c.id));
    const p=c.parameters;assert.equal(raw.outcome,'observed');assert.equal(raw.teaching.length,2);assert.equal(raw.duplicate_grant_entries.length,2);
    const initial=raw.teaching[0].before;assert.deepEqual(initial.skills,p.actor.skills);assert.deepEqual(initial.learned,{});assert.deepEqual(initial.mappings,{});
    assert.deepEqual(initial.grants,{[grant]:0});assert.equal(initial.family,'铁掌帮');assert.equal(initial.contribution,200);assert.equal(initial.effective_force,150);assert.equal(initial.effective_dodge,220);
    for(const k of ['jing','neili','max_neili','max_jingli','str','con','dex','int','combat_exp','potential','learned_points','shen'])assert.equal(initial[k],p.actor.properties[k]);
    let previous=initial,total=0;
    for(const [i,s]of raw.teaching.entries()){
        assert.deepEqual(s.before,previous);assert.equal(s.command,p.action);assert.equal(s.command_accepted,1);assert.equal(s.teacher_program,p.teacher.path);
        assert.equal(s.teacher,raw.teaching[0].teacher);assert.match(s.teacher,new RegExp('^'+p.teacher.path+'#\\d+$'));assert.equal(s.student,raw.before[0].object);
        assert.ok(Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=raw.elapsed);assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');assert.ok(Array.isArray(s.messages));
        const event=raw.duplicate_grant_entries[i];assert.equal(event.teacher,s.teacher);assert.equal(event.student,s.student);assert.equal(event.path,path);assert.equal(event.sha256,hash);
        assert.ok(p.duplicate_calls.includes(event.original_call));assert.equal(event.original_call,raw.duplicate_grant_entries[0].original_call);
        assert.ok(Number.isFinite(event.elapsed)&&event.elapsed>=0&&event.elapsed<=raw.elapsed);
        const spent=s.before.jing-s.after.jing;assert.ok(Number.isSafeInteger(spent)&&spent>=10&&spent<=19);total+=spent;
        const expected=structuredClone(s.before);expected.jing-=spent;
        if(i===0){expected.grants[grant]=1;expected.contribution=0;for(const k of ['strike','parry','chuanxin-zhang','martial-cognize']){expected.skills[k]++;expected.learned[k]=0;}}
        assert.deepEqual(s.after,expected);previous=s.after;
    }
    assertTeaching43Counters(raw.metrics[0],{jing_cost:total});assertTeaching43Snapshots(raw,initial,previous,c);
    for(const which of ['before','after']){assert.equal(raw[which][0].cultivation.class,'fighter');assert.equal(raw[which][0].cultivation['family/family_name'],'铁掌帮');}
    return raw.teaching.map((s,i)=>({advanced:i===0,acquired:i===0,command_kind:'ask',contribution_spent:i===0?200:0,jing_spent:s.before.jing-s.after.jing}));
}
