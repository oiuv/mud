import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {root, parseArgs} from '../../collect_martial_data.mjs';
import {schoolSceneConditions, validateSceneLifecycle} from './school_scene_cases.mjs';

const cases=schoolSceneConditions(null).filter(c=>c.parameters.lifecycle);

test('低气血另列四条件204条，100次即时与两次原时钟等待不混算',()=>{
    assert.equal(cases.length,4);
    assert.equal(cases.reduce((n,c)=>n+c.samples,0),204);
    for(const c of cases){
        const p=c.parameters;
        assert.equal(p.actor.properties.qi,1);
        assert.equal(p.actor.properties.eff_qi,10000);
        assert.equal(p.actor.properties.combat_exp,100000);
        assert.deepEqual(p.scene_steps,['in']);
        assert(!Object.hasOwn(p.actor,'temp'));
        assert.equal(c.samples,c.id.endsWith('entry')?100:2);
        assert.equal(p.observe_seconds,c.id.endsWith('entry')?0:c.id.includes('junior')?105:5);
        assert(p.qualification_sources.includes('feature/damage.c'));
    }
    assert.equal(schoolSceneConditions(null,{smoke:true}).filter(c=>c.parameters.lifecycle)
        .reduce((n,c)=>n+c.samples,0),4);
});

test('场景前缀复用现有选择器，不允许混用精确ID或擅自调整重复数',()=>{
    assert.equal(parseArgs(['school-scene','--case-prefix','school-scene-fumo-failure']).casePrefix,
        'school-scene-fumo-failure');
    assert.throws(()=>parseArgs(['school-scene','--case','a','--case-prefix','b']),/不能同用/);
    assert.throws(()=>parseArgs(['school-scene','--samples','1']),/无效参数/);
});

function sample(c){
    const before={object:'/tests/teaching_actor#1',interactive:1,wizardp:0,living:1,ghost:0,qi:1};
    const after={...before,living:0,qi:0};
    const event={event:'unconscious',phase:'before',elapsed:0.1,room:'/d/shaolin/fumoquan',
        state:before,deaths:null,reason:null};
    const raw={before:[before],after:[after],elapsed:0.3,metrics:[{}],
        scene_steps:[{after:{player:after}}],scene_lifecycle:[event,
            {...event,phase:'after',state:after,elapsed:0.2}]};
    if(c.parameters.observe_seconds){
        raw.elapsed=105.1;raw.metrics[0].heartbeats=100;
        raw.scene_followup={command:'go out',accepted:1,before:{player:after},after:{player:after}};
    }
    return raw;
}

test('生命周期证据可嵌套，但必须同一角色、顺序配对且保留死亡原因字段',()=>{
    const c=cases.find(c=>c.id.endsWith('junior-entry')), raw=sample(c);
    validateSceneLifecycle(raw,c);
    for(const change of [r=>r.scene_lifecycle.pop(),r=>r.scene_lifecycle[1].event='death',
        r=>r.scene_lifecycle[1].elapsed=-1,r=>delete r.scene_lifecycle[0].reason,
        r=>r.scene_lifecycle[0].state={...r.scene_lifecycle[0].state,wizardp:1},
        r=>r.scene_lifecycle[1].state={...r.scene_lifecycle[1].state,object:'replacement'}]){
        const bad=structuredClone(raw);change(bad);assert.throws(()=>validateSceneLifecycle(bad,c));
    }
    raw.scene_lifecycle.splice(1,0,{...raw.scene_lifecycle[0],event:'revive'},
        {...raw.scene_lifecycle[0],event:'revive',phase:'after'});
    validateSceneLifecycle(raw,c);
});

test('等待记录必须含原心跳、完整原时长及后续原命令，不将未退出写为成功',()=>{
    const c=cases.find(c=>c.id.endsWith('junior-followup')),raw=sample(c);
    validateSceneLifecycle(raw,c);
    for(const change of [r=>r.elapsed=5,r=>r.metrics[0].heartbeats=0,
        r=>delete r.scene_followup,r=>r.scene_followup.command='teleport',
        r=>r.scene_followup.after.player={...r.after[0],qi:10000}]){
        const bad=structuredClone(raw);change(bad);assert.throws(()=>validateSceneLifecycle(bad,c));
    }
    raw.scene_followup.accepted=0;validateSceneLifecycle(raw,c);
});

test('生命周期夹具只包围原函数，不手动复活、返阳或设置昏迷结果',()=>{
    const source=readFileSync(join(root,'tools/tests/martial_data/teaching_actor.lpc'),'utf8');
    for(const [fn,call] of [['unconcious','::unconcious();'],['die','::die(killer);'],['revive','::revive(quiet);']]){
        assert(source.includes(call),fn);
        assert.equal(source.split(call).length,2);
    }
    assert(!source.includes('reincarnate('));assert(!source.includes('set("qi"'));
});
