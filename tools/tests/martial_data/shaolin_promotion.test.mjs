import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { shaolinPromotionConditions } from './shaolin_promotion_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory=buildInventory(root), catalog=collectCatalog(root,inventory);
const relations=schoolRelations(inventory,catalog), all=teachingConditions(relations,catalog);
const cases=all.filter(c=>c.parameters.teaching_profile==='shaolin-promotion');
const get=id=>structuredClone(cases.find(c=>c.id==='teaching-shaolin-promotion-'+id));

// Synthetic contract tests, not game evidence or substitutes for original NPCs.
function fixture(c) {
    const p=c.parameters, a=p.actor, student='/tests/teaching_actor#1';
    let before={...a.properties, contribution:a.properties.gongxian, skills:a.skills, mappings:a.mappings,
        master_id:a.properties.family?.master_id || 0, master_name:a.properties.family?.master_name || 0,
        promotion:{items:[], fight_ok:0, checking_pending:0, student_qi:10000, student_max_qi:10000,
            student_fighting:0, teacher_fighting:0, teacher_qi:1000, teacher_max_qi:1000,
            recruitment:{family:a.properties.family || {}, name:'虚试',
                flags:{have_letter:0,apprentice_ok:0,valid_in_fumoquan:0}}}};
    return p.teaching_expectations.map((e,index)=>{
        before=structuredClone(before);
        Object.assign(before.promotion,{teacher_name:e.teacher.name,
            teacher_family:{family_name:'少林派',generation:e.teacher.generation}});
        const after=structuredClone(before), items=[];
        if(e.command_kind==='ask')after.jing-=10;
        for(let n=0;n<e.tokens;n++)items.push({program:'/d/shaolin/obj/damo-ling',
            object:'/d/shaolin/obj/damo-ling#'+(n+10),id:'damo ling',clone:1,holder:student});
        if(e.letter)items.push({program:`/d/shaolin/obj/tuijianxin-${e.letter}`,
            object:`/d/shaolin/obj/tuijianxin-${e.letter}#20`,id:`tuijian xin${e.letter}`,clone:1,holder:student});
        Object.assign(after.promotion,{items,fight_ok:e.fight_ok});
        after.promotion.recruitment.flags={have_letter:e.have_letter,apprentice_ok:e.apprentice_ok,valid_in_fumoquan:0};
        if(e.recruited){
            after.master_id=e.teacher.id;after.master_name=e.teacher.name;
            after.promotion.recruitment.family={family_name:'少林派',generation:e.generation,master_id:e.teacher.id,enter_time:1000};
            after.promotion.recruitment.name=e.name;
        }
        const row={student,teacher:e.teacher.path+'#2',teacher_program:e.teacher.path,
            command:e.action,command_accepted:e.command_accepted,elapsed:0.01,before,after,
            message_scope:'receive_message_apply_input_not_full_transcript',messages:[]};
        if(e.wait_fight){
            row.immediate_after=structuredClone(before);
            Object.assign(row.immediate_after.promotion,{checking_pending:1,fight_ok:0});
            after.promotion.teacher_qi=400;row.wait_elapsed=3;row.wait_messages=[];
        }
        before=after;return row;
    });
}

test('55条推荐信条件不改历史9229条件，所有信物由原流程产生',()=>{
    assert.equal(cases.length,55);assert.equal(cases.reduce((n,c)=>n+c.samples,0),110);
    const old=all.filter(c=>!['shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile));
    assert.equal(old.length,9229);assert.equal(sha256(JSON.stringify(old)),
        '5e9d70e8b835dd2b9811090ea90c29a343ebc870ad780f6c85ac59962bece2a6');
    for(const c of cases){assert.equal(c.parameters.actor.temp,undefined);
        for(const e of c.parameters.teaching_expectations)assert.equal(e.offer,undefined);}
});
test('六个辈分五项门槛、重复令牌、四阶段完整晋升契约',()=>{
    for(const c of cases){const s=validateTeachingObservation(fixture(c),c);
        assert.equal(s.some(s=>s.advanced),c.parameters.expected==='observed',c.id);}
    assert.equal(cases.filter(c=>c.id.endsWith('-complete')).length,4);
    assert.equal(cases.filter(c=>c.id.endsWith('-low')).length,30);
});
test('不能用受理、预造信物、未结算切磋或只改消息冒充晋升',()=>{
    for(const change of [r=>r[2].after.promotion.items=[],r=>r[2].after.promotion.teacher_qi=999,
        r=>r[2].after.promotion.checking_pending=1,r=>r[2].wait_elapsed=0,
        r=>r[2].immediate_after.promotion.items=r[2].after.promotion.items,
        r=>r[4].after.master_id=r[4].before.master_id,
        r=>r[4].after.promotion.recruitment.family.generation=99,
        r=>r[3].before.promotion.items[0].object+='_replacement',
        r=>r[1].before.neili++,r=>r[0].after.promotion.items[0].clone=0]){
        const c=get('stage1-complete'),r=fixture(c);change(r);
        assert.throws(()=>validateTeachingObservation(r,c));
    }
});
test('原切磋NPC、发信回调或令牌门槛改变必须重新核对',()=>{
    assert.throws(()=>shaolinPromotionConditions(relations,p=>readFileSync(p,'utf8')+
        (p==='kungfu/class/shaolin/qing.h'?'\n// changed':'')),/源码变化/);
});
