import assert from 'node:assert/strict';
import { scanSource,sha256 } from './inventory.mjs';
import { recruit43Data } from './teaching_43_recruit_data.mjs';
import { tokenize } from '../../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import {assertTeaching43Contract,assertTeaching43Counters,assertTeaching43Snapshots,readTeaching43Source} from './teaching_43_contract.mjs';
let canonical;

export const recruit43Group='teaching-43-recruit';
const common=['cmds/skill/apprentice.c','cmds/skill/recruit.c','feature/apprentice.c'];
const commonHashes=['dfa01a40a013cf81863399b87466e3193a545e9157291f1fd1e6e305056d8b78',
    '47f8c7ddb09fe1ea2c340ac8a41ae7b172d25771420003a7805e0380ab215887',
    'd45dbb167fa87c5bcea3c43e1c9f1350f21570bbb3d77ab0e67fb7cd5b0f6c75'];
const gateSources=d=>[{path:d.entry.path,sha256:d.entry.sha256,function:'attempt_apprentice'},
    ...(d.permit?[{path:d.permit.path,sha256:d.permit.sha256,function:'permit_recruit'}]:[])];
const plain=s=>s.replace(/\x1b\[[0-9;]*m/g,'');
const key=d=>d.teacher.path.replace(/^kungfu\/class\//,'').replace(/\.c$/,'').replaceAll('/','-');
export function recruit43Title(d,actor){
    if(d.teacher.path.includes('/gaibang/')&&actor.properties['family/beggarlvl'])return actor.properties.title;
    const wudu={daoshi:'教众',jiaotou:'教众',hehongyao:'护法',qiyunao:'护法',hetieshou:'长老'};
    const file=d.teacher.path.split('/').at(-1).replace(/\.c$/,'');
    if(d.teacher.path.includes('/wudu/')&&wudu[file])return '五毒教'+wudu[file];
    const n=d.teacher.family.generation+1,nums=['零','一','二','三','四','五','六','七','八','九'];
    assert.ok(n>=2&&n<100,'review unusual recruit generation');
    const cn=n<10?nums[n]:(n<20?'十':nums[Math.trunc(n/10)]+'十')+(n%10?nums[n%10]:'');
    return d.teacher.family.name+'第'+cn+'代传人';
}
// Observation in the isolated copy, after leading local declarations. Never
// re-evaluate a gate, change its predicate/return, draw RNG or add a command.
export function recruitGateProbes(source,path) {
    const tokens=tokenize(source).filter(t=>!['whitespace','comment','directive'].includes(t.kind));
    const sites=[];let changed=source;
    for(const f of scanSource(source).functions.filter(f=>['attempt_apprentice','permit_recruit'].includes(f.name)
        || /kungfu\/class\/huashan\/yue-(?:buqun|wife)\.c$/.test(path)&&f.name==='do_recruit'
        || path==='kungfu/class/xingxiu/ding.c'&&f.name==='do_flatter').reverse()){
        const argument=f.name==='do_flatter'?'this_player()':/\(\s*object\s+(\w+)\s*\)/.exec(f.signature)?.[1];
        assert.ok(argument,'unreviewed recruit signature: '+path+':'+f.name);
        assert.equal(source[f.body_start],'{');
        let offset=f.body_start+1,index=tokens.findIndex(t=>t.start>f.body_start);
        while(tokens[index]?.kind==='type'){
            let depth=0,closed=false;
            for(;index<tokens.length&&tokens[index].start<f.body_end;index++){
                const t=tokens[index];
                if(['(','[','{','(:'].includes(t.text))depth++;
                if([')',']','}',':)'].includes(t.text))depth--;
                if(t.text===';'&&depth===0){offset=t.end;index++;closed=true;break;}
            }
            assert.ok(closed,'unclosed leading teacher declaration');
        }
        const insert=`\n    "/tests/runner"->observe_teacher_gate(this_object(), ${argument}, ${JSON.stringify(path)}, ${JSON.stringify(sha256(source))}, ${JSON.stringify(f.name)});`;
        changed=changed.slice(0,offset)+insert+changed.slice(offset);
        sites.push({position:'offset',offset,insert,function:f.name});
    }
    let restored=changed;for(const site of [...sites].reverse())restored=restored.slice(0,site.offset)+restored.slice(site.offset+site.insert.length);
    assert.equal(restored,source,'gate probe must be reversible byte-for-byte');
    return {changed,sites};
}
function configuration(d) {
    const c=d.configuration;
    const properties={name:'审武甲',surname:'审',purename:'武甲',title:'实验旧衔',quest:{name:'实验旧任务',count:3},gender:'男性',age:20,class:'fighter',born:1,born_family:'没有',
        shen:0,str:30,con:30,dex:30,int:30,per:20,combat_exp:100000,gongxian:100,weiwang:100,
        neili:6000,max_neili:6000,jing:10000,eff_jing:10000,max_jing:10000,
        qi:10000,eff_qi:10000,max_qi:10000,potential:10000,learned_points:0,...c.properties};
    if(d.teacher.path.includes('/gaibang/')&&properties['family/beggarlvl'])properties.family={family_name:'丐帮',
        master_id:'li sheng',master_name:'黎生',generation:20,beggarlvl:properties['family/beggarlvl']};
    const skills={force:40,dodge:40,parry:40,...c.rawSkills};
    for(const [s,v]of Object.entries(c.effectiveMinimum)){
        if(['str','int','con','dex','per'].includes(s))properties[s]=Math.max(properties[s],v);
        else skills[s]=Math.max(skills[s]??0,v*2);
    }
    return {properties,skills,mappings:{},preparations:{},temp:{quest:{name:'实验临时任务',count:3}}};
}
export function recruit43Conditions(relations,readSource) {
    assert.equal(recruit43Data.length,139,'reviewed direct-recruit scope changed');
    for(const [i,p]of common.entries())assert.equal(sha256(readSource(p)),commonHashes[i],'common recruit source drift');
    return recruit43Data.map(d=>{
        const t=d.teacher,path=t.path,source=readSource(path);assert.equal(sha256(source),t.sha256,'recruit teacher drift: '+path);
        const entrySource=readSource(d.entry.path);assert.equal(sha256(entrySource),d.entry.sha256,'recruit entry drift');
        const f=scanSource(entrySource).functions.find(f=>f.name==='attempt_apprentice');
        assert.ok(f&&f.start===d.entry.start&&f.end===d.entry.end,'exact original attempt required');
        const teacher={path:'/'+path.slice(0,-2),id:t.id,sha256:t.sha256},action=`apprentice ${t.id}`;
        const gates=gateSources(d),paths=[path,...gates.map(g=>g.path),...common];
        for(const g of gates)assert.equal(sha256(readSource(g.path)),g.sha256,'recruit gate source drift');
        const unique=[...new Set(paths.filter(Boolean))],actor=configuration(d);
        const entry={id:`${d.entry.path}:${f.line}:attempt_apprentice`,path:d.entry.path,sha256:d.entry.sha256,
            function:'attempt_apprentice',line:f.line,role:'teaching'};
        return {id:`teaching-43-recruit-${key(d)}`,stage:'school',method:'teaching',entry_id:entry.id,
            samples:2,status:'configured_not_executed',parameters:{collection_group:recruit43Group,
                teaching_profile:recruit43Group,recruit_observation_version:2,teaching_kind:'apprenticeship',teacher,teacher_definition:t,
                teaching_entry:entry,teaching_evidence:d.entry,qualification_sources:unique,
                qualification_evidence:unique.map(path=>({path,sha256:sha256(readSource(path))})),
                action,topic:'拜师',actor,target:{skills:{},mappings:{},properties:{}},named_participants:true,recruit_gate_sources:gates,
                monitored_grants:[],teaching_expectations:[{command_kind:'apprentice'},
                    {command_kind:'apprentice'}],expected:'observed',fighting:false,observe_seconds:0,not_applicable:'',
                note:'逐位原教师原命令拜师后连续请安；前置资质与既有师承为明确实验输入，不预写目标师承或收徒意向。'}};
    });
}
export function validateRecruit43Record(raw,condition) {
    canonical??=new Map(recruit43Conditions({},readTeaching43Source).map(c=>[c.id,c]));
    assertTeaching43Contract(condition,canonical.get(condition.id));
    const p=condition.parameters,d=recruit43Data.find(d=>'teaching-43-recruit-'+key(d)===condition.id);assert.ok(d,'unreviewed recruit');
    const actor=configuration(d),t=d.teacher;
    assert.equal(condition.method,'teaching');assert.equal(p.collection_group,recruit43Group);assert.equal(p.teaching_profile,recruit43Group);
    assert.equal(p.teaching_kind,'apprenticeship');assert.deepEqual(p.actor,actor);
    assert.deepEqual(p.teacher,{path:'/'+t.path.slice(0,-2),id:t.id,sha256:t.sha256});assert.deepEqual(p.teacher_definition,t);
    const entry={id:`${d.entry.path}:${d.entry.line}:attempt_apprentice`,path:d.entry.path,sha256:d.entry.sha256,
        function:'attempt_apprentice',line:d.entry.line,role:'teaching'};
    assert.deepEqual(p.teaching_entry,entry);assert.equal(condition.entry_id,entry.id);assert.deepEqual(p.teaching_evidence,d.entry);
    assert.equal(p.action,`apprentice ${t.id}`);
    assert.deepEqual(p.teaching_expectations,[{command_kind:'apprentice'},{command_kind:'apprentice'}]);
    const sources=[...new Set([t.path,...gateSources(d).map(g=>g.path),...common])];
    const sourceHashes=new Map([[t.path,t.sha256],...gateSources(d).map(g=>[g.path,g.sha256]),...common.map((p,i)=>[p,commonHashes[i]])]);
    assert.deepEqual(p.qualification_sources,sources);
    assert.deepEqual(p.qualification_evidence,sources.map(path=>({path,sha256:sourceHashes.get(path)})));
    assert.deepEqual(p.monitored_grants,[]);assert.equal(p.expected,'observed');assert.equal(raw.outcome,'observed');
    for(const [path,hash]of [[t.path,t.sha256],[d.entry.path,d.entry.sha256]])
        assert.ok(p.qualification_evidence.some(e=>e.path===path&&e.sha256===hash));
    for(const [i,path]of common.entries())assert.ok(p.qualification_evidence.some(e=>e.path===path&&e.sha256===commonHashes[i]));
    assert.deepEqual(p.recruit_gate_sources,gateSources(d),'frozen reviewed gate list must not be shortened or borrowed');
    assert.equal(raw.teaching.length,2);let previous;
    assert.ok(Array.isArray(raw.teaching_gate_entries));
    assert.deepEqual(raw.teaching_gate_entries.map(g=>({path:g.path,sha256:g.sha256,function:g.function})),p.recruit_gate_sources,
        'must observe the original attempt and permit entries, not infer them from a shared function name');
    for(const g of raw.teaching_gate_entries){assert.equal(g.student,raw.before[0].object);assert.equal(g.teacher,raw.teaching[0].teacher);}
    for(const [i,s]of raw.teaching.entries()){
        const b=s.before,a=s.after,fb=b.recruitment.family,fa=a.recruitment.family;
        assert.equal(s.student,raw.before[0].object);assert.equal(s.student,raw.after[0].object);
        assert.equal(s.teacher_program,p.teacher.path);assert.match(s.teacher,new RegExp('^'+p.teacher.path+'#\\d+$'));
        assert.equal(s.command,p.action);assert.equal(s.command_accepted,1);assert.ok(s.elapsed>=0&&Number.isFinite(s.elapsed));
        assert.ok(Number.isSafeInteger(s.wall_time)&&s.wall_time>0);assert.equal(s.teacher_pending_recruit,'');
        assert.deepEqual(s.teacher_family,{family_name:t.family.name,generation:t.family.generation});
        assert.equal(s.teacher_identity.id,t.id);assert.equal(plain(s.teacher_identity.name),t.name);
        assert.equal(s.teacher_identity.class,d.teacher_class,'source-pinned original teacher class');
        assert.equal(s.teacher_pending_recruit_before,'');
        assert.equal(s.teacher_identity.attempt_source,'/'+d.entry.path.replace(/\.(c|lpc|h)$/,''));
        if(previous){assert.deepEqual(b,previous.after);assert.equal(s.teacher,previous.teacher);}
        else{
            for(const key of ['name','class','title'])assert.equal(b.recruitment[key],actor.properties[key],'actual initial recruit identity: '+key);
            assert.deepEqual(fb,actor.properties.family??(actor.properties['family/beggarlvl']?{beggarlvl:actor.properties['family/beggarlvl']}:{}));
            assert.notEqual(fb.master_id,t.id,'target teacher must not be preassigned');
            assert.equal(b.recruitment.pending_apprentice,'');assert.equal(b.recruitment.pending_betrayer,'');
            assert.deepEqual(b.skills,actor.skills);assert.deepEqual(b.learned,{});assert.deepEqual(b.mappings,{});
            for(const k of ['gender','age','class','born','born_family','shen','str','con','dex','int','per','combat_exp','gongxian','weiwang','max_neili'])
                assert.deepEqual(b.recruit_qualification[k],actor.properties[k],k+' exact initial qualification');
            assert.equal(b.effective_force,Math.trunc(actor.skills.force/2));
            assert.equal(b.effective_dodge,Math.trunc(actor.skills.dodge/2));
            assert.equal(b.effective_int,actor.properties.int+Math.trunc((actor.skills.literate??0)/10));
        }
        assert.equal(fa.family_name,t.family.name);assert.equal(fa.master_id,t.id);assert.equal(plain(fa.master_name),t.name);
        assert.equal(fa.generation,t.family.generation+1);assert.ok(Number.isSafeInteger(fa.enter_time)&&fa.enter_time>=raw.teaching[0].wall_time&&fa.enter_time<=s.wall_time+1);
        assert.equal(fa.title,'传人');assert.equal(fa.privs,0);
        assert.deepEqual(Object.keys(fa).sort(),['family_name','master_id','master_name','generation','enter_time','title','privs',
            ...(actor.properties['family/beggarlvl']?['beggarlvl']:[])].sort());
        assert.equal(a.recruitment.pending_apprentice,'');assert.equal(a.recruitment.pending_betrayer,'');
        assert.equal(a.recruitment.name,actor.properties.name,'unreviewed student rename');
        assert.equal(a.recruitment.class,d.after_class,'original source-reviewed class propagation');
        if(t.path.includes('/gaibang/')&&actor.properties['family/beggarlvl']){
            assert.equal(a.recruitment.title,b.recruitment.title,'original positive bag count preserves old display title');
            assert.equal(fa.beggarlvl,actor.properties['family/beggarlvl']);
        }
        assert.equal(plain(a.recruitment.title),recruit43Title(d,actor));
        assert.equal(b.recruitment.effects.version,2);assert.equal(a.recruitment.effects.version,2);
        if(i===0){
            const persistent={surname:'审',purename:'武甲',quest:actor.properties.quest,'special/shenshe':0,
                betrayer:0,detach:0,reborn:0,startroom:0,move_party:0,'betryer/times':0};
            assert.deepEqual(b.recruitment.effects,{version:2,persistent,temporary:{quest:actor.temp.quest,'pending/join_bonze':0,pass_zhenlong:0}});
            const effects=structuredClone(b.recruitment.effects);
            if(!actor.properties.family){effects.persistent.quest=0;effects.temporary.quest=0;}
            if(t.path==='kungfu/class/ouyang/ouyangke.c')effects.persistent['special/shenshe']=1;
            assert.deepEqual(a.recruitment.effects,effects,'all source-reviewed recruit side effects');
        }else assert.deepEqual(a,b,'repeat greeting must preserve the entire observed state');
        const qualifications={...b.recruit_qualification,class:d.after_class,gongxian:a.contribution};
        assert.deepEqual(a.recruit_qualification,qualifications);
        assert.equal(a.weiwang,b.weiwang);assert.equal(a.reborn_family,b.reborn_family);
        assert.deepEqual(b.recruitment.flags,{have_letter:0,apprentice_ok:0,valid_in_fumoquan:0});
        assert.deepEqual(a.recruitment.flags,b.recruitment.flags);
        for(const [field,k]of [['family','family_name'],['master_id','master_id'],['master_name','master_name']])assert.equal(a[field],fa[k]);
        assert.equal(b.contribution-a.contribution,i===0&&!actor.properties.family?actor.properties.gongxian:0);
        for(const k of ['skills','learned','mappings','jing','neili','max_neili','max_jingli','potential','learned_points','shen','str','con','dex','int','combat_exp'])
            assert.deepEqual(a[k],b[k],'unreviewed recruit mutation: '+k);
        assert.equal(s.message_scope,'receive_message_apply_input_not_full_transcript');assert.ok(Array.isArray(s.messages));
        previous=s;
    }
    for(const [state,s]of [['before',raw.teaching[0].before],['after',raw.teaching.at(-1).after]])
        for(const k of ['skills','mappings','jing','neili','max_neili','str'])assert.deepEqual(raw[state][0][k],s[k]);
    assertTeaching43Counters(raw.metrics?.[0]);
    assertTeaching43Snapshots(raw,raw.teaching[0].before,raw.teaching.at(-1).after,condition);
    for(const [which,point]of [['before',raw.teaching[0].before],['after',raw.teaching.at(-1).after]])
        assert.deepEqual(raw[which][0].temp.quest??0,point.recruitment.effects.temporary.quest,'outer temporary quest must match explicit recruit observation');
    return [{advanced:true,acquired:true,jing_spent:0,contribution_spent:raw.teaching[0].before.contribution-raw.teaching[0].after.contribution}];
}
