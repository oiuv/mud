import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {recruit43Conditions,validateRecruit43Record,recruitGateProbes,recruit43Title} from './teaching_43_recruit_cases.mjs';
import {recruit43Data} from './teaching_43_recruit_data.mjs';
import {validateTeachingRecord} from './teaching_observation.mjs';
import {validatorFor} from './collection_review.mjs';
const read=p=>readFileSync(new URL('../../../'+p,import.meta.url),'utf8');
const conditions=()=>recruit43Conditions({objects:[]},read);
function sample(c){
    const p=c.parameters,t=p.teacher_definition,v=p.actor.properties,d=recruit43Data.find(d=>d.teacher.path===t.path);
    const a={...v,userp:1,playerp:1,interactive:1,living:1,wizardp:0,ghost:0,object:'/tests/teaching_actor#1',skills:structuredClone(p.actor.skills),learned:{},mappings:{},
        jing:v.jing,neili:v.neili,max_neili:v.max_neili,max_jingli:1000,potential:v.potential,learned_points:v.learned_points,
        shen:v.shen,str:v.str,con:v.con,dex:v.dex,int:v.int,combat_exp:v.combat_exp,contribution:v.gongxian,
        effective_force:Math.trunc(p.actor.skills.force/2),effective_dodge:Math.trunc(p.actor.skills.dodge/2),
        effective_int:v.int+Math.trunc((p.actor.skills.literate??0)/10),
        temp:{quest:p.actor.temp.quest},recruitment:{flags:{have_letter:0,apprentice_ok:0,valid_in_fumoquan:0},family:structuredClone(v.family??{}),name:v.name,class:v.class,title:v.title,pending_apprentice:'',pending_betrayer:'',effects:{version:2,
            persistent:{surname:v.surname,purename:v.purename,quest:v.quest,'special/shenshe':0,betrayer:0,detach:0,reborn:0,startroom:0,move_party:0,'betryer/times':0},
            temporary:{quest:p.actor.temp.quest,'pending/join_bonze':0,pass_zhenlong:0}}},
        recruit_qualification:Object.fromEntries(['gender','age','class','born','born_family','shen','str','con','dex','int','per','combat_exp','gongxian','weiwang','max_neili'].map(k=>[k,v[k]]))};
    const steps=[];
    for(let i=0;i<2;i++){
        const before=structuredClone(i?steps.at(-1).after:a),after=structuredClone(before);
        after.recruitment.family={family_name:t.family.name,generation:t.family.generation+1,master_id:t.id,master_name:t.name,
            enter_time:1000,title:'传人',privs:0};after.recruitment.title=recruit43Title(d,p.actor);
        after.family=t.family.name;after.master_id=t.id;after.master_name=t.name;if(!v.family)after.contribution=0;
        after.recruitment.class=d.after_class;
        after.recruit_qualification.class=d.after_class;after.recruit_qualification.gongxian=after.contribution;
        if(v['family/beggarlvl'])after.recruitment.family.beggarlvl=v['family/beggarlvl'];
        if(!v.family){after.recruitment.effects.persistent.quest=0;after.recruitment.effects.temporary.quest=0;delete after.temp.quest;}
        if(t.path==='kungfu/class/ouyang/ouyangke.c')after.recruitment.effects.persistent['special/shenshe']=1;
        steps.push({before,after,student:a.object,teacher:p.teacher.path+'#2',teacher_program:p.teacher.path,
            command:p.action,command_accepted:1,elapsed:.01,wall_time:1000,teacher_pending_recruit:'',teacher_pending_recruit_before:'',
            teacher_family:{family_name:t.family.name,generation:t.family.generation},
            teacher_identity:{id:t.id,name:t.name,class:d.teacher_class,attempt_source:'/'+p.teaching_entry.path.replace(/\.(c|lpc|h)$/,'')},
            messages:[],message_scope:'receive_message_apply_input_not_full_transcript'});
    }
    steps[1].before=structuredClone(steps[0].after);
    if(t.path.includes('/gaibang/')&&v['family/beggarlvl'])steps[1].after.recruitment.title=steps[1].before.recruitment.title;
    const gates=p.recruit_gate_sources.map(g=>({...g,teacher:p.teacher.path+'#2',student:a.object}));
    return {kind:'sample',condition_id:c.id,method:'teaching',outcome:'observed',teaching:steps,teaching_gate_entries:gates,before:[a],after:[steps.at(-1).after],metrics:[{}],
        attacks:[],launches:[],interfaces:[],callbacks:[],passives:[],defenses:[],dodge_checks:[],terminals:[]};
}
test('139 explicitly reviewed source-pinned teachers; dedicated consumer applies to real master transitions',async()=>{
    const cs=conditions();assert.equal(cs.length,139);assert.equal(new Set(cs.map(c=>c.id)).size,139);
    for(const c of cs){validateRecruit43Record(sample(c),c);validateTeachingRecord(sample(c),c);(await validatorFor(c))(sample(c),c);}
});
test('effective force thresholds, gender/lineage configurations, and corrected Yu shen are explicit',()=>{
    const cs=conditions();assert.equal(cs.find(c=>c.id==='teaching-43-recruit-wudang-yu').parameters.actor.properties.shen,20000);
    for(const [i,c]of cs.entries())for(const [skill,min]of Object.entries(recruit43Data[i].configuration.effectiveMinimum))
        assert.ok(['str','int','con','dex','per'].includes(skill)?c.parameters.actor.properties[skill]>=min:c.parameters.actor.skills[skill]/2>=min);
});
test('preassigned master, no new master, shared header/name borrowing, missing raw qualifications and resets fail',()=>{
    const c=conditions()[0];for(const mutate of [r=>{r.teaching[0].before.recruitment.family.master_id=c.parameters.teacher.id;},
        r=>{r.teaching[0].after.recruitment.family.master_id='wrong';},r=>{r.teaching[0].teacher_program='/wrong';},
        r=>{r.teaching[0].before.recruit_qualification.born_family='wrong';},r=>{r.teaching[1].before.skills.force++;},
        r=>{r.metrics[0].jing_cost=1;},r=>{r.outcome='refused';}]){const bad=sample(c);mutate(bad);assert.throws(()=>validateTeachingRecord(bad,c));}
    assert.throws(()=>recruit43Conditions({objects:[]},p=>read(p)+'\n'),/drift/);
});
test('gate probes follow local declarations, preserve every original byte and do not replace conditions/returns',()=>{
    for(const d of recruit43Data){const source=read(d.teacher.path),p=recruitGateProbes(source,d.teacher.path);
        assert.ok(p.sites.some(s=>s.function==='attempt_apprentice'));
        let restored=p.changed;for(const s of [...p.sites].reverse())restored=restored.slice(0,s.offset)+restored.slice(s.offset+s.insert.length);
        assert.equal(restored,source);assert.ok(!p.changed.includes('__md_gate_observed'));
    }
    const s='void attempt_apprentice(object ob) { string text = "semi;colon"; mapping a = (["x": 1]); if (a) return; }';
    const p=recruitGateProbes(s,'test.c');assert.ok(p.changed.indexOf('observe_teacher_gate')>p.changed.indexOf('mapping a'));
    assert.equal(p.sites.length,1);
});
