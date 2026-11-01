import assert from 'node:assert/strict';
import {scanSource,sha256} from './inventory.mjs';
import {assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source} from './teaching_43_contract.mjs';
export const ordination43Group='teaching-43-ordination';
let canonical;
const teachers=[
    ['xuedao/shanyong','shan yong','a8a71a9003783d859eb5767a491fcd564673ee0d592ea4d12fdd9b199429a748'],
    ['xueshan/gelunbu','ge lunbu','d6ef4602a8cefb9cc00e46c2f1af011018a9a759e60b1ab7440f86e22a98d9ef'],
    ['xueshan/jiamu','jiamu huofo','3c37a15d3018eb28f9240626bdfea78ad193ba316fb3a22261f3bcf6832d4784'],
    ['xueshan/lazhang','lazhang huofo','e7b6697b8a14affeb2c12ca695fec3ace44cf9818a87736cb263ef282069ba69'],
    ['xueshan/samu','samu huofo','c5e005ac4beff5b1ea6be02c0e5fe998d2f4fb29433d506b569cd23e80a04c85'],
];
export function ordination43Conditions(relations,readSource){
    return teachers.flatMap(([key,id,hash])=>{
        const path='kungfu/class/'+key+'.c',entryPath=key.startsWith('xueshan/')?'kungfu/class/xueshan/tobebonze.h':path;
        assert.equal(sha256(readSource(path)),hash);const source=readSource(entryPath),fn=scanSource(source).functions.find(f=>f.name==='ask_for_join');assert.ok(fn);
        if(entryPath.endsWith('.h'))assert.equal(sha256(source),'8b7a7e333df1f6b4410558a820d6f00a9e8d4c1295a00e0cb7e5230bc62666c1');
        const entry={id:entryPath+':'+fn.line+':ask_for_join',path:entryPath,sha256:sha256(source),function:'ask_for_join',line:fn.line,role:'teaching'};
        const paths=[...new Set([path,entryPath,'cmds/std/ask.c','cmds/skill/apprentice.c','cmds/skill/recruit.c','feature/apprentice.c'])];
        return ['male','female'].map(variant=>({id:'teaching-43-ordination-'+key.replaceAll('/','-')+'-'+variant,
            stage:'school',method:'teaching',entry_id:entry.id,samples:2,status:'configured_not_executed',parameters:{
                collection_group:ordination43Group,teaching_profile:ordination43Group,ordination_observation_version:2,teaching_kind:'ordination-chain',variant,
                teacher:{path:'/'+path.slice(0,-2),id,sha256:hash},teaching_entry:entry,
                teaching_evidence:{path:entryPath,sha256:sha256(source),line:fn.line,start:fn.start,end:fn.end},
                qualification_sources:paths,qualification_evidence:paths.map(path=>({path,sha256:sha256(readSource(path))})),
                topic:'剃度',action:'ask '+id+' about 剃度',actor:{properties:{name:'试武甲',surname:'试',purename:'武甲',title:'原有称号',
                    class:'scholar',gender:variant==='male'?'男性':'女性',str:30,int:30,con:30,dex:30,shen:0,combat_exp:100000,
                    qi:10000,eff_qi:10000,max_qi:10000,jing:10000,eff_jing:10000,max_jing:10000,
                    neili:2000,max_neili:2000,max_jingli:1000,potential:10000,learned_points:0,gongxian:100},skills:{force:40,literate:100},mappings:{},preparations:{}},
                target:{skills:{},mappings:{},properties:{}},named_participants:true,monitored_grants:[],
                teaching_expectations:[{action:'ask '+id+' about 剃度',command_kind:'ask'},{action:'kneel',command_kind:'kneel'},
                    {action:'ask '+id+' about 剃度',command_kind:'ask'}],expected:variant==='male'?'observed':'refused',
                fighting:false,observe_seconds:0,not_applicable:'',note:'原询问、原kneel动作、重复询问；不预写剃度许可，不调用do_kneel，不把身份变化当师承完成。'}}));
    });
}
export function validateOrdination43Record(raw,c){
    canonical??=new Map(ordination43Conditions({},readTeaching43Source).map(c=>[c.id,c]));assertTeaching43Contract(c,canonical.get(c.id));
    const p=c.parameters,yes=p.variant==='male',blood=p.teacher.path.includes('/xuedao/');
    assert.equal(raw.outcome,p.expected);assert.equal(raw.teaching.length,3);
    const initial=raw.teaching[0].before;assert.deepEqual(initial.skills,p.actor.skills);assert.deepEqual(initial.learned,{});
    assert.deepEqual(initial.mappings,{});
    for(const k of ['jing','str','con','dex','int','combat_exp','neili','max_neili','max_jingli','potential','learned_points','shen'])assert.equal(initial[k],p.actor.properties[k]);
    assert.equal(initial.master_id??0,0);assert.equal(initial.master_name??0,0);assert.equal(initial.contribution,100);assert.deepEqual(initial.grants,{});
    assert.deepEqual(initial.ordination,{id:raw.before[0].id,name:'试武甲',surname:'试',purename:'武甲',title:'原有称号',class:'scholar',pending:0,family:{},pending_apprentice:''});
    let previous=initial,total=0;
    for(const [i,s]of raw.teaching.entries()){
        assert.deepEqual(s.before,previous);assert.equal(s.command,p.teaching_expectations[i].action);
        assert.equal(s.teacher_program,p.teacher.path);assert.match(s.teacher,new RegExp('^'+p.teacher.path+'#\\d+$'));
        assert.equal(s.teacher,raw.teaching[0].teacher,'same original teacher through all commands');
        assert.equal(s.student,raw.before[0].object);assert.equal(s.command_accepted,i===1&&!yes?0:1);
        assert.ok(Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=raw.elapsed);
        assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');assert.ok(Array.isArray(s.messages));
        const expected=structuredClone(s.before),spent=s.before.jing-s.after.jing;
        if(i===1)assert.equal(spent,0);else assert.ok(Number.isSafeInteger(spent)&&spent>=10&&spent<=19);
        expected.jing-=spent;total+=spent;
        if(yes&&i===0)expected.ordination.pending=1;
        if(yes&&i===1){expected.ordination.class='bonze';if(!blood)expected.ordination.title='大轮寺喇嘛';}
        assert.deepEqual(s.after,expected,'only actual ordination identity and ask cost may change');
        assert.ok(s.before.family===null||s.before.family===0);assert.ok(s.after.family===null||s.after.family===0,'ordination is not committed apprenticeship');
        const pending=yes&&blood&&i>=1?raw.before[0].object:'';
        assert.equal(s.teacher_pending_recruit,pending);
        assert.equal(s.teacher_pending_recruit_before,yes&&blood&&i===2?pending:'');
        previous=s.after;
    }
    assertTeaching43Counters(raw.metrics[0],{jing_cost:total});assertTeaching43Snapshots(raw,initial,previous,c);
    for(const [which,point]of [['before',initial],['after',previous]]){
        const outer=raw[which][0];assert.equal(outer.id,initial.ordination.id);
        assert.equal(outer.cultivation.class,point.ordination.class);assert.equal(outer.cultivation['family/family_name']??0,0);
        assert.equal(outer.temp.pending?.join_bonze??0,point.ordination.pending);
        assert.equal(outer.temp.pending?.apprentice??0,0);
    }
    return raw.teaching.map((s,i)=>({advanced:yes&&i<2,acquired:yes&&i===1,command_kind:p.teaching_expectations[i].command_kind,jing_spent:s.before.jing-s.after.jing}));
}
