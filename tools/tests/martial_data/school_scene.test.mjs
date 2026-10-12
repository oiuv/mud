import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { root, parseArgs } from '../../collect_martial_data.mjs';
import { schoolSceneConditions, sceneEntries, validateSchoolSceneRecord } from './school_scene_cases.mjs';
import { combatDodgeProbes, combatSceneProbes } from './execution.mjs';
import { createSeries, recordSample, digest } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { frozenSceneSource, summarizeScenes, readScenes, sceneMarkdown } from './school_scene_report.mjs';

const cases = schoolSceneConditions(null).filter(c=>!c.parameters.lifecycle&&!c.parameters.gifts);

test('场景条件与教学分开，四条件204正式样本，烟雾4条不混算', () => {
    assert.equal(cases.length, 4);
    assert.equal(cases.reduce((n,c)=>n+c.samples,0), 204);
    assert.equal(sceneEntries(cases).length, 1);
    assert.ok(cases.every(c=>c.method==='scene' && c.stage==='school'));
    assert.ok(schoolSceneConditions(null,{smoke:true}).every(c=>c.samples===1));
    assert.equal(parseArgs(['school-scene','--smoke']).smoke,true);
    assert.throws(()=>parseArgs(['school-scene','--samples','2']),/无效参数/);
    assert.throws(()=>schoolSceneConditions(null,{},()=>''),/入口变化/);
    for(const c of cases){
        assert.equal(c.parameters.actor.properties.qi,1000000);
        assert.equal(c.parameters.fighting,false);
        assert.equal(c.parameters.observe_seconds,0);
        assert(!Object.hasOwn(c.parameters.actor,'temp'));
    }
});

test('场景来源必须属于公开快照，路径和角色不冒充教学', () => {
    const entry=sceneEntries(cases)[0], hash='a'.repeat(64);
    const options={inventory:{source_fingerprint:hash,versions:{}},
        catalog:{source_fingerprint:hash,dictionary_sha256:hash,skills:[]},conditions:cases,
        execution:{source_files:{[entry.path]:entry.sha256}},sceneEntries:[entry]};
    const dir=mkdtempSync(join(tmpdir(),'mud-scene-ledger-'));
    assert.deepEqual(createSeries(dir,options).entries,[entry]);
    for(const changed of [{...entry,role:'teaching'},{...entry,sha256:hash},
        {...entry,path:'data/account.c'},{...entry,line:24}]) {
        assert.throws(()=>createSeries(dir,{...options,sceneEntries:[changed]}),/场景/);
    }
    assert.throws(()=>createSeries(dir,{...options,sceneEntries:[entry,entry]}),/重复/);
});

test('新探针只记录原参数与选定技能，可逐字还原旧探针副本', () => {
    const source=readFileSync(join(root,'adm/daemons/combatd.c'),'utf8');
    const old=combatDodgeProbes(source), next=combatSceneProbes(source);
    assert.equal(next.sites.length,old.sites.length+2);
    let restored=next.changed;
    for(const site of next.sites.slice(old.sites.length).reverse()){
        assert.equal(site.position,'before');
        restored=restored.replace(site.insert+site.anchor,site.anchor);
    }
    assert.equal(restored,old.changed);
    assert.throws(()=>combatSceneProbes(source.replace('    if (environment(me)->query("no_fight")) {','bad')),/锚点/);
});

function fakeRecord(c) {
    const p=c.parameters, player={object:'/tests/teaching_actor#1',interactive:1,living:1,
        ghost:0,wizardp:0,combat_exp:p.actor.properties.combat_exp,
        skills:p.actor.skills,mappings:p.actor.mappings};
    let s={room:'/d/shaolin/qyping',permit:null,ultra:null,family:p.actor.properties.family,player,
        monks:['du-nan','du-e','du-jie'].map(n=>({program:'/kungfu/class/shaolin/'+n,
            room:'/d/shaolin/fumoquan',state:{living:1,weapon:'whip'}}))};
    const r={method:'scene',outcome:'observed',before:[player],after:[player],scene_steps:[],scene_attacks:[]};
    for(const direction of p.scene_steps){const before=structuredClone(s);s={...s,permit:direction==='out'?null:1};
        r.scene_steps.push({command:'go '+direction,accepted:1,before,after:structuredClone(s)});}
    return r;
}

test('读取器接受实际未设字段null，但不接受缺失证据、身份或命令篡改',()=>{
    const c=cases[0], r=fakeRecord(c);validateSchoolSceneRecord(r,c);
    for(const change of [
        x=>x.scene_steps.pop(), x=>delete x.scene_steps[0].before.ultra,
        x=>x.scene_steps[0].before.permit=1, x=>x.scene_steps[0].accepted=0,
        x=>x.scene_steps[0].after.player.wizardp=1,
        x=>x.scene_steps[0].after.family.generation=36,
        x=>x.scene_steps[1].before.player.object='other',
        x=>x.scene_steps[0].before.monks.pop(),
    ]){const bad=structuredClone(r);change(bad);assert.throws(()=>validateSchoolSceneRecord(bad,c));}
});

test('读取器保留空武器参数与实际持鞭差异，不从最终结果倒推攻法',()=>{
    const c=cases[0], r=fakeRecord(c), event={phase:'selected',step:0,caller:'/d/shaolin/fumoquan',
        target:0,actor_program:'/kungfu/class/shaolin/du-nan',actual_weapon:{skill_type:'whip'},
        argument_weapon:{},attack_skill:'finger'};
    r.scene_attacks=[event];validateSchoolSceneRecord(r,c);
    for(const change of [x=>x.caller='/tests/runner',x=>x.actual_weapon={},
        x=>x.argument_weapon={skill_type:'whip'},x=>x.attack_skill='whip',x=>x.step=4]){
        const bad=structuredClone(r);change(bad.scene_attacks[0]);
        assert.throws(()=>validateSchoolSceneRecord(bad,c));
    }
});

test('正常闪避／招架经验收益保留，但不凭空增加或丢失经验',()=>{
    const c=cases[1], r=fakeRecord(c);
    r.after=[structuredClone(r.before[0])];r.after[0].combat_exp++;
    r.attacks=[{result:-1}];validateSchoolSceneRecord(r,c);
    r.attacks[0].result=-2;validateSchoolSceneRecord(r,c);
    r.attacks[0].result=0;assert.throws(()=>validateSchoolSceneRecord(r,c),/经验/);
    r.after[0].combat_exp-=2;assert.throws(()=>validateSchoolSceneRecord(r,c),/经验/);
});

test('冻结源码只在内存去探针，原副本／锚点／hash改变均拒绝',()=>{
    const path='adm/daemons/combatd.c', source=readFileSync(join(root,path),'utf8');
    const probe=combatSceneProbes(source), originalHash=sha256(source);
    const execution={source_files:{[path]:originalHash},probes:[{path,before:originalHash,
        after:sha256(probe.changed),sites:probe.sites}]};
    assert.equal(frozenSceneSource(execution,path,probe.changed),source);
    assert.throws(()=>frozenSceneSource(execution,path,probe.changed+' '),/副本改变/);
    const bad=structuredClone(execution);bad.probes[0].sites[0][1]='missing';
    assert.throws(()=>frozenSceneSource(bad,path,probe.changed),/锚点/);
    const wrong=structuredClone(execution);wrong.source_files[path]='a'.repeat(64);
    assert.throws(()=>frozenSceneSource(wrong,path,probe.changed),/原始源码/);
});

function reportFixture(c=schoolSceneConditions(null,{smoke:true})[2]) {
    const raw=fakeRecord(c), player=raw.before[0];
    Object.assign(player,{userp:1,playerp:1,qi:1000000,eff_qi:1000000,jing:1000,eff_jing:1000,neili:6000});
    const other={...structuredClone(player),object:'/tests/actor#2'};
    raw.before=[structuredClone(player),other];raw.after=structuredClone(raw.before);
    Object.assign(raw,{kind:'sample',condition_id:c.id,index:0,metrics:[{},{}],terminals:[],attacks:[],elapsed:0.01});
    const p=c.parameters;
    for(const [i,step] of raw.scene_steps.entries()){
        Object.assign(step.before.player,player);Object.assign(step.after.player,player);
        const room=p.expelled?(i===1?'fumoquan':'qyping'):(i%2===0?'fumoquan':'qyping');
        step.after.room='/d/shaolin/'+room;step.after.permit=p.expelled?(i===2?null:1):(i%2===0?1:null);
        if(i)step.before=structuredClone(raw.scene_steps[i-1].after);
        const tries=p.exempt?0:p.expelled?(i===0||i===3?9:0):(i===0||i===2?9:0);
        for(let n=0;n<tries;n++){
            const event={phase:'enter',step:i,caller:'/d/shaolin/fumoquan',target:0,same_room:p.expelled?0:1,
                actor_program:'/kungfu/class/shaolin/'+['du-nan','du-e','du-jie'][n%3],
                actual_weapon:{skill_type:'whip'},argument_weapon:{}};
            raw.scene_attacks.push(event);
            if(!p.expelled){raw.scene_attacks.push({...event,phase:'selected',attack_skill:'strike'});
                raw.attacks.push({actor:-1,target:0,result:0,damage:0});}
        }
    }
    return {manifest:{fingerprint:'a'.repeat(64),versions:{},identity:{conditions:[c],execution:{smoke:true}}},
        rows:[{condition_id:c.id,index:0,outcome:'observed',raw,raw_sha256:digest(raw)}]};
}

test('报告分开送出调用、豁免和实际结算，不能把观察当过阵成功',()=>{
    for(const c of schoolSceneConditions(null,{smoke:true}).filter(c=>!c.parameters.lifecycle&&!c.parameters.gifts)){
        const {manifest,rows}=reportFixture(c), r=summarizeScenes(manifest,rows);
        assert.equal(r.totals.samples,1);assert.equal(r.totals.commands,4);
        assert.equal(r.totals.attack_calls,c.parameters.exempt?0:18);
        assert.equal(r.totals.settled_attacks,c.parameters.exempt||c.parameters.expelled?0:18);
        assert.equal(r.conditions[0].experience_gain.mean,0);
        assert.match(sceneMarkdown(r),/不表示逻辑正确/);
    }
});

test('报告拒绝缺样本、错误路线、许可、攻击次数、跨房间及终态',()=>{
    const {manifest,rows}=reportFixture(schoolSceneConditions(null,{smoke:true})[1]);
    assert.throws(()=>summarizeScenes(manifest,[]),/未采满/);
    for(const change of [r=>r.scene_attacks.pop(),r=>r.attacks.pop(),r=>r.scene_attacks[0].same_room=0,
        r=>r.scene_steps.at(-1).after.room='/d/shaolin/fumoquan',
        r=>r.scene_steps.at(-1).after.permit=1,r=>r.terminals.push({kind:'die'}),
        r=>r.metrics[0].qi_cost=1]){
        const bad=structuredClone(rows);change(bad[0].raw);assert.throws(()=>summarizeScenes(manifest,bad));
    }
});

test('完整读档核对驱动、请求、原始日志、台账及冻结源码，不执行驱动',()=>{
    const {manifest:planned,rows}=reportFixture(), c=planned.identity.conditions[0];
    const source_files=Object.fromEntries(schoolSceneConditions(null).flatMap(c=>
        c.parameters.qualification_evidence.map(e=>[e.path,e.sha256])));
    const dir=mkdtempSync(join(tmpdir(),'mud-scene-report-')), run=join(dir,'runs','attempt-test');
    const put=(path,text)=>{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,text);};
    const save=(path,value)=>put(path,JSON.stringify(value));
    const manifest=createSeries(dir,{inventory:{source_fingerprint:'a'.repeat(64),versions:{}},
        catalog:{source_fingerprint:'a'.repeat(64),dictionary_sha256:'b'.repeat(64),skills:[]},conditions:[c],
        execution:{collection:'school-scene',source_files,smoke:true,probes:[]},sceneEntries:sceneEntries([c])});
    for(const path of Object.keys(source_files))put(join(run,'mudlib',path),readFileSync(join(root,path),'utf8'));
    recordSample(dir,manifest,rows[0]);
    const request={fingerprint:manifest.fingerprint,jobs:[{condition_id:c.id,index:0}]};
    const log=JSON.stringify(rows[0].raw)+'\n', output='DATA COMPLETE\n';
    const result={process:{code:0},interrupted:false,validation_errors:[],incomplete_bytes:0,imported:1,
        driver_output_sha256:sha256(output)};
    save(join(run,'request.json'),request);put(join(run,'mudlib/log/events.jsonl'),log);
    save(join(run,'result.json'),result);put(join(run,'driver-output.txt'),output);
    assert.equal(readScenes(dir).totals.samples,1);
    save(join(run,'result.json'),{...result,process:{code:1}});
    assert.throws(()=>readScenes(dir),/未正常结束/);save(join(run,'result.json'),result);
    put(join(run,'driver-output.txt'),output+'changed');assert.throws(()=>readScenes(dir),/输出改变/);
    put(join(run,'driver-output.txt'),output);
    save(join(run,'request.json'),{...request,jobs:[{condition_id:c.id,index:1}]});
    assert.throws(()=>readScenes(dir),/不属于请求/);save(join(run,'request.json'),request);
    const altered={...rows[0].raw,elapsed:5};put(join(run,'mudlib/log/events.jsonl'),JSON.stringify(altered)+'\n');
    assert.throws(()=>readScenes(dir),/原始日志与台账不符/);put(join(run,'mudlib/log/events.jsonl'),log.slice(0,-1));
    assert.throws(()=>readScenes(dir),/尾行不完整/);
});
