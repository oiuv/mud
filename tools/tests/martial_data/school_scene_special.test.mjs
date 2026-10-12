import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {root} from '../../collect_martial_data.mjs';
import {schoolSceneConditions,validateSceneSpecial,validateSceneGifts,fumoGifts} from './school_scene_cases.mjs';
import {summarizeGiftTransfers} from './school_scene_report.mjs';

const cases=schoolSceneConditions(null).filter(c=>c.parameters.special_entry);

test('特殊分支10条件20条，三渡各缺席／昏迷、原判断优先级和双玩家分别列出',()=>{
    assert.equal(cases.length,10);assert(cases.every(c=>c.samples===2));
    assert.equal(cases.filter(c=>c.parameters.guardian_state?.mode==='unconscious').length,3);
    assert.equal(cases.filter(c=>c.parameters.guardian_state?.mode==='missing').length,5);
    assert.equal(cases.filter(c=>c.parameters.companion).length,1);
    for(const c of cases){const p=c.parameters;
        assert(!p.actor.temp);assert(!p.target.temp);assert.equal(p.observe_seconds,0);
        assert.equal(p.actor.properties.combat_exp,1000000);
        if(p.guardian_state){const g=fumoGifts.find(g=>g.npc===p.guardian_state.id);
            assert(p.gift_commands.every(s=>s.item!=='/clone/lonely/'+g.key));}
    }
    assert.equal(cases.find(c=>c.id.endsWith('ultra')).parameters.entry_permit,1);
    assert.equal(cases.find(c=>c.id.endsWith('ultra-missing')).parameters.entry_permit,2);
    assert.equal(cases.find(c=>c.id.endsWith('senior-missing')).parameters.entry_permit,1);
});

function sample(c){
    const p=c.parameters,player={object:'/player#0',interactive:1,wizardp:0,living:1,ghost:0,jing:10000};
    const other={...player,object:'/player#1'};
    const state={player:structuredClone(player),room:'/d/shaolin/fumoquan',permit:p.entry_permit,
        monks:fumoGifts.map((g,i)=>({object:'/monk#'+i}))};
    const raw={before:[player,other],scene_steps:[{after:structuredClone(state)}],scene_attacks:[],attacks:[],
        scene_interactions:[],metrics:[{jing_cost:0},{}]};
    if(p.guardian_state){
        const idx=fumoGifts.findIndex(g=>g.npc===p.guardian_state.id),object='/monk#'+idx;
        raw.scene_setup={...p.guardian_state,object,before:{object,living:1},before_room:state.room,
            after:{object,living:p.guardian_state.mode==='missing'?1:0,ghost:0},
            after_room:p.guardian_state.mode==='missing'?'/tests/runner':state.room};
        if(p.guardian_state.mode==='missing')state.monks[idx]={id:p.guardian_state.id,missing:1};
    }
    raw.scene_steps[0].after=structuredClone(state);
    if(p.companion){
        state.other={player:structuredClone(other),permit:1,room:state.room};
        raw.scene_companion_entry={command:'go in',accepted:1,
            before:{player:structuredClone(other),family:p.target.properties.family,room:'/d/shaolin/qyping',permit:null},
            after:{player:structuredClone(other),family:p.target.properties.family,room:state.room,permit:1}};
    }
    state.gifts=fumoGifts.map((g,i)=>({path:'/clone/lonely/'+g.key,object:'/clone/lonely/'+g.key,
        exists:1,clone:0,name:g.topic,environment:'/monk#'+i,owner:'/monk#'+i,equipped:null}));
    for(const plan of p.gift_commands){
        const before=structuredClone(state),idx=fumoGifts.findIndex(g=>plan.item==='/clone/lonely/'+g.key);
        const owner=plan.owner==='player'?player.object:plan.owner==='other'?other.object:
            plan.owner==='room'?state.room:plan.owner==='absent'?null:'/monk#'+idx;
        state.gifts[idx]=owner?{path:plan.item,object:plan.item,exists:1,clone:0,name:fumoGifts[idx].topic,
            owner,environment:owner,equipped:null}:{path:plan.item,exists:0};
        if(plan.command.startsWith('ask ')){state.player.jing-=10;raw.metrics[0].jing_cost+=10;}
        raw.scene_interactions.push({command:plan.command,accepted:1,...(p.companion?{side:plan.side}:{}),
            before,after:structuredClone(state)});
    }
    raw.after=[structuredClone(state.player),structuredClone(other)];return raw;
}

test('守阵者初态必须记录原对象的真实去向或昏迷，缺席和死亡不能混用',()=>{
    for(const c of cases){const r=sample(c);validateSceneSpecial(r,c);validateSceneGifts(r,c);summarizeGiftTransfers(r,c);}
    const c=cases[0],r=sample(c);
    for(const change of [r=>delete r.scene_setup,r=>r.scene_setup.after.object='other',
        r=>r.scene_setup.after_room='/d/shaolin/fumoquan',r=>r.scene_setup.after.ghost=1,
        r=>r.scene_attacks.push({}),r=>r.scene_steps[0].after.permit=1]){
        const bad=structuredClone(r);change(bad);assert.throws(()=>validateSceneSpecial(bad,c));
    }
});

test('另一玩家先原go入场，身份与入口许可不可伪造，交互记录必须注明实际执行方',()=>{
    const c=cases.at(-1),r=sample(c);validateSceneSpecial(r,c);validateSceneGifts(r,c);
    for(const change of [r=>r.scene_companion_entry.before.permit=1,r=>r.scene_companion_entry.accepted=0,
        r=>r.scene_companion_entry.after.player.wizardp=1,r=>r.scene_companion_entry.after.player.object='other']){
        const bad=structuredClone(r);change(bad);assert.throws(()=>validateSceneSpecial(bad,c));
    }
    for(const change of [r=>r.scene_interactions[3].side=0,r=>delete r.scene_interactions[0].before.other,
        r=>r.after[1].jing--]){
        const bad=structuredClone(r);change(bad);assert.throws(()=>validateSceneGifts(bad,c));
    }
});

test('双玩家转交不是NPC回收；第三人持有时的拒绝单列，归还后才重领',()=>{
    const c=cases.at(-1),r=sample(c);
    assert.deepEqual(summarizeGiftTransfers(r,c),{grants:6,returns:6,retrievals:0,reclaims:0,
        repeats:3,rejections:3,transfers:6,other_holder_rejections:3});
    r.scene_interactions[2].after.gifts[0].owner='/player#0';
    assert.throws(()=>summarizeGiftTransfers(r,c),/交付/);
});

test('夹具只布置原NPC状态并记录，不直接写玩家许可或修改奖励函数',()=>{
    const src=readFileSync(join(root,'tools/tests/martial_data/scene_observer.lpc'),'utf8')
        .split('mapping prepare_guardian(')[1].split('mapping observe(')[0];
    assert(src.includes('monk->unconcious()'));assert(src.includes('monk->move(previous_object())'));
    assert(!src.includes('set_temp('));assert(!src.includes('set('));assert(!src.includes('destruct('));
});
