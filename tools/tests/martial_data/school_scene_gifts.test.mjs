import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { schoolSceneConditions, fumoGifts, validateSceneGifts } from './school_scene_cases.mjs';
import { summarizeGiftTransfers } from './school_scene_report.mjs';

const cases = schoolSceneConditions(null).filter(c=>c.parameters.gifts&&!c.parameters.special_entry);

test('宝物三条件104条独立，辈分豁免不冒充随机过阵，许可不预写',()=>{
    assert.equal(cases.length,3);
    assert.equal(cases.reduce((n,c)=>n+c.samples,0),104);
    assert.deepEqual(cases.map(c=>c.samples),[2,2,100]);
    assert.deepEqual(cases.map(c=>c.parameters.actor.properties.combat_exp),[999999,1000000,1000000]);
    for(const c of cases){
        const p=c.parameters;
        assert.deepEqual(p.scene_steps,['in']);assert.equal(p.observe_seconds,0);
        assert(!p.actor.temp);assert(!p.lifecycle);
        assert.equal(p.named_participants,true);
        for(const g of fumoGifts)assert(p.qualification_sources.includes('clone/lonely/'+g.key+'.c'));
        assert(p.gift_commands.every(s=>/^(ask|give|drop|get) /.test(s.command)));
    }
    assert.deepEqual(cases.map(c=>c.parameters.gift_commands.length),[3,30,30]);
    assert(schoolSceneConditions(null,{smoke:true}).filter(c=>c.parameters.gifts).every(c=>c.samples===1));
});

function sample(c){
    const player={object:'/tests/teaching_actor#1',interactive:1,wizardp:0,living:1,ghost:0,jing:10000};
    let state={player,room:'/d/shaolin/fumoquan',permit:1,monks:fumoGifts.map((g,i)=>({object:'/monk#'+i}))};
    const raw={before:[structuredClone(player)],scene_steps:[{after:structuredClone(state)}],
        scene_interactions:[],metrics:[{jing_cost:0}]};
    state.gifts=fumoGifts.map((g,i)=>({path:'/clone/lonely/'+g.key,object:'/clone/lonely/'+g.key,
        exists:1,clone:0,name:g.topic,environment:state.monks[i].object,owner:state.monks[i].object,equipped:null}));
    for(const plan of c.parameters.gift_commands){
        const before=structuredClone(state),idx=fumoGifts.findIndex(g=>plan.item==='/clone/lonely/'+g.key);
        const owner=plan.owner==='player'?player.object:plan.owner==='room'?state.room:
            plan.owner==='absent'?null:state.monks[idx].object;
        const after=owner?{...state.gifts[idx],object:plan.item,exists:1,clone:0,name:fumoGifts[idx].topic,
            owner,environment:owner,equipped:null}:{path:plan.item,exists:0};
        state.gifts[idx]=after;
        if(plan.command.startsWith('ask ')){state.player.jing-=10;raw.metrics[0].jing_cost+=10;}
        raw.scene_interactions.push({command:plan.command,accepted:1,before,after:structuredClone(state)});
    }
    raw.after=[structuredClone(state.player)];return raw;
}

test('单份记录能区分交付、重复、回收、销毁和重领；询问正常扣精神',()=>{
    for(const c of cases){const r=sample(c);validateSceneGifts(r,c);
        const counts=summarizeGiftTransfers(r,c);
        assert.deepEqual(counts,c.parameters.gift_commands.length===3?
            {grants:0,returns:0,retrievals:0,reclaims:0,repeats:0,rejections:3}:
            {grants:9,returns:6,retrievals:3,reclaims:3,repeats:3,rejections:0});
    }
});

test('拒绝仅有命令成功而无物品证据、克隆替代、预设许可和不连续观察',()=>{
    const c=cases[1],r=sample(c);
    for(const change of [
        x=>x.scene_interactions.pop(),x=>x.scene_interactions[0].command='eval give()',
        x=>x.scene_interactions[0].before.permit=2,
        x=>x.scene_interactions[0].after.gifts[0].clone=1,
        x=>delete x.scene_interactions[0].after.gifts[0].owner,
        x=>x.scene_interactions[1].before.player.jing++,x=>x.after[0].jing++,
    ]){const bad=structuredClone(r);change(bad);assert.throws(()=>validateSceneGifts(bad,c));}
});

test('报告不接受询问返回1但归属错误、交还未销毁、旁物变化或漏扣精神',()=>{
    const c=cases[1],r=sample(c);
    for(const change of [x=>x.scene_interactions[0].after.gifts[0].owner='/wrong',
        x=>x.scene_interactions[5].after.gifts[0].exists=1,
        x=>x.scene_interactions[0].after.gifts[1].equipped='worn',
        x=>x.metrics[0].jing_cost=0,x=>x.scene_interactions[0].accepted=0]){
        const bad=structuredClone(r);change(bad);assert.throws(()=>summarizeGiftTransfers(bad,c));
    }
});

test('宝物观察不隐式加载或克隆；执行沿原命令，不调用NPC业务或补发奖励',()=>{
    const source=readFileSync(join(root,'tools/tests/martial_data/scene_observer.lpc'),'utf8')
        .split('mapping observe_gifts(')[1];
    assert(source.includes('find_object(path)'));
    assert(!source.includes('load_object('));assert(!source.includes('new('));
    assert(!source.includes('->move('));assert(!source.includes('destruct('));
    const runner=readFileSync(join(root,'tools/tests/martial_data/runner.lpc'),'utf8')
        .split('if (parameters["gifts"]) {')[1].split('if (parameters["lifecycle"]')[0];
    assert(runner.includes('force_me(action)'));
    assert(!runner.includes('ask_me('));assert(!runner.includes('set_temp('));
});
