// Read existing evidence only; never run a driver or mutate a saved series.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput } from '../../collect_martial_data.mjs';
import { openSeries, readSamples, digest } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { validateRecord } from './execution.mjs';
import { schoolSceneConditions, validateSchoolSceneRecord, fumoGifts } from './school_scene_cases.mjs';
import { distribution } from './statistics.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const sampleKey = row => row.condition_id + '.' + row.index;

// Verify the frozen copy, then remove observation-only inserts in memory.
// Never rewrite the evidence tree or substitute today's source for an old run.
export function frozenSceneSource(execution, path, contents) {
    const probe = execution.probes.find(p => p.path === path);
    assert.equal(sha256(contents), probe?.after ?? execution.source_files[path], '冻结源码副本改变：' + path);
    if (probe) {
        for (const site of [...probe.sites].reverse()) {
            const anchor = Array.isArray(site) ? site[0] : site.anchor;
            const insert = Array.isArray(site) ? site[1] : site.insert;
            const observed = site.replacement ?? (Array.isArray(site) || site.position === 'before'
                ? insert + anchor : anchor + insert);
            assert.equal(contents.split(observed).length, 2, '冻结探针锚点不唯一');
            contents = contents.replace(observed, anchor);
        }
        assert.equal(sha256(contents), probe.before, '观察探针不能还原');
    }
    assert.equal(sha256(contents), execution.source_files[path], '冻结原始源码不符：' + path);
    return contents;
}

export function summarizeScenes(manifest, rows) {
    const conditions = manifest.identity.conditions.map(c => {
        const selected = rows.filter(r => r.condition_id === c.id);
        assert.equal(selected.length, c.samples, '场景条件尚未采满');
        assert.equal(new Set(selected.map(r=>r.index)).size, c.samples, '重复场景样本');
        const p=c.parameters, snapshots=[];
        for(const row of selected){
            const r=row.raw;
            assert.equal(row.outcome,'observed');validateRecord(r,c);validateSchoolSceneRecord(r,c);
            if (p.lifecycle) {
                const entry = r.scene_steps[0];
                assert.equal(r.scene_attacks.filter(a=>a.phase==='enter').length,9);
                assert.equal(r.scene_attacks.filter(a=>a.phase==='selected').length,9);
                assert.equal(r.attacks.length,9);
                for(const a of r.scene_attacks) assert.equal(a.same_room,1);
                const foreign=p.actor.properties.family.family_name==='武当派';
                const event=foreign?'death':'unconscious';
                const completed=r.scene_lifecycle.filter(e=>e.event===event&&e.phase==='after');
                assert.equal(completed.length,1,'原失败分支未完成');
                assert.deepEqual(r.terminals,[{side:0,state:event}],'原终态观察与生命周期不一致');
                for(const n of ['du-nan','du-e','du-jie']) assert.equal(r.scene_attacks.filter(a=>
                    a.phase==='enter'&&a.actor_program.endsWith('/'+n)).length,3);
                assert.equal(entry.after.room,foreign?'/d/death/gate':'/d/shaolin/fumoquan');
                assert.equal(entry.after.player.ghost,foreign?1:0);
                assert.equal(entry.after.player.living,foreign?1:0);
                assert.equal(entry.after.permit??0,foreign?0:2);
                if(foreign) assert.equal(completed[0].deaths,1);
                if(p.observe_seconds){
                    assert.equal(r.scene_followup.after.room,foreign?'/d/death/gate':'/d/shaolin/qyping');
                    assert.equal(r.scene_followup.accepted,foreign?0:1);
                    assert.equal(r.scene_followup.after.permit??0,0);
                    if(!foreign) assert.equal(r.scene_lifecycle.filter(e=>e.event==='revive'&&e.phase==='after').length,1);
                }
                snapshots.push({id:row.condition_id+'.'+row.index,sha256:row.raw_sha256,
                    route:r.scene_steps.map(s=>({command:s.command,room:s.after.room,permit:s.after.permit??0,
                        qi:s.after.player.qi,eff_qi:s.after.player.eff_qi})),
                    lifecycle:r.scene_lifecycle,followup:r.scene_followup??null});
                continue;
            }
            assert.equal(r.terminals.length,0,'本组高血量存活条件出现终态，须单列调查');
            if (p.gifts) {
                const entry = r.scene_steps[0], tries = p.exempt || p.special_entry ? 0 : 9;
                assert.equal(entry.after.room, '/d/shaolin/fumoquan');
                assert.equal(entry.after.permit, p.entry_permit??1);
                assert.equal(r.scene_attacks.filter(a=>a.phase==='enter').length, tries);
                assert.equal(r.scene_attacks.filter(a=>a.phase==='selected').length, tries);
                assert.equal(r.attacks.length, tries);
                for (const a of r.scene_attacks) assert.equal(a.same_room, 1);
                const gifts = summarizeGiftTransfers(r, c);
                snapshots.push({id:row.condition_id+'.'+row.index,sha256:row.raw_sha256,
                    gifts, entry:entry.after,
                    ...(p.special_entry?{setup:r.scene_setup??null,companion:r.scene_companion_entry??null}:{})});
                continue;
            }
            for(const [i,step] of r.scene_steps.entries()){
                const incoming=r.scene_attacks.filter(a=>a.step===i && a.phase==='enter');
                const settled=r.scene_attacks.filter(a=>a.step===i && a.phase==='selected');
                const tries=p.exempt?0:p.expelled?(i===0||i===3?9:0):(i===0||i===2?9:0);
                assert.equal(incoming.length,tries,'原入口调用数量不符');
                assert.equal(settled.length,p.expelled?0:tries,'实际选技数量不符');
                for(const a of incoming) assert.equal(a.same_room,p.expelled?0:1);
                const expectedRoom=p.expelled?(i===1?'fumoquan':'qyping'):(i%2===0?'fumoquan':'qyping');
                assert.equal(step.after.room,'/d/shaolin/'+expectedRoom,'原行走结果与核对流程不同');
                assert.equal(step.after.permit??0,p.expelled?(i===2?0:1):(i%2===0?1:0));
                if(tries) for(const n of ['du-nan','du-e','du-jie'])
                    assert.equal(incoming.filter(a=>a.actor_program.endsWith('/'+n)).length,3);
            }
            assert.equal(r.attacks.length,p.expelled||p.exempt?0:18,'结算攻击记录不完整');
            snapshots.push({id:row.condition_id+'.'+row.index,sha256:row.raw_sha256,
                route:r.scene_steps.map(s=>({command:s.command,room:s.after.room,permit:s.after.permit??0,
                    qi:s.after.player.qi,eff_qi:s.after.player.eff_qi})),
                npc_neili:r.scene_steps.at(-1).after.monks.map(m=>({program:m.program,neili:m.state.neili}))});
        }
        const raws=selected.map(r=>r.raw), phases=raws.flatMap(r=>r.scene_attacks);
        const skills=Object.fromEntries(['finger','strike','whip'].map(k=>[k,phases.filter(a=>a.phase==='selected'&&a.attack_skill===k).length]));
        const strikes=raws.flatMap(r=>r.attacks);
        const wakes=raws.flatMap(r=>r.scene_lifecycle??[]).filter(e=>e.event==='revive'&&e.phase==='after');
        return {id:c.id,samples:selected.length,commands:raws.reduce((n,r)=>n+r.scene_steps.length+(r.scene_followup?1:0)+(r.scene_companion_entry?1:0)+(r.scene_interactions?.length??0),0),
            ...(p.gifts ? { gifts: true, jing_cost:distribution(raws.map(r=>r.metrics[0].jing_cost??0)),
                gift_totals: Object.fromEntries(['grants','returns','retrievals','reclaims','repeats','rejections',
                    ...(p.companion?['transfers','other_holder_rejections']:[])].map(k=>
                    [k,snapshots.reduce((n,s)=>n+s.gifts[k],0)])) } : {}),
            lifecycle:!!p.lifecycle,
            lifecycle_counts:Object.fromEntries(['unconscious','death','revive'].map(k=>[k,
                raws.flatMap(r=>r.scene_lifecycle??[]).filter(e=>e.event===k&&e.phase==='after').length])),
            attack_calls:phases.filter(a=>a.phase==='enter').length,
            selected_skills:skills,settled_attacks:strikes.length,
            result_counts:Object.fromEntries([...new Set(strikes.map(a=>a.result))].sort().map(k=>[k,strikes.filter(a=>a.result===k).length])),
            qi_cost:distribution(raws.map(r=>r.metrics[0].qi_cost??0)),
            eff_qi_cost:distribution(raws.map(r=>r.metrics[0].eff_qi_cost??0)),
            qi_recovery:distribution(raws.map(r=>r.metrics[0].qi_recovery??0)),
            neili_cost:distribution(raws.map(r=>r.metrics[0].neili_cost??0)),
            experience_gain:distribution(raws.map(r=>r.after[0].combat_exp-r.before[0].combat_exp)),
            wake_elapsed:wakes.length?distribution(wakes.map(e=>e.elapsed)):null,
            elapsed:distribution(raws.map(r=>r.elapsed)),evidence:snapshots};
    });
    assert.equal(rows.length,conditions.reduce((n,c)=>n+c.samples,0),'存在范围外记录');
    return {fingerprint:manifest.fingerprint,smoke:manifest.identity.execution.smoke,
        versions:manifest.versions,conditions,
        evidence_digest:digest(rows.map(r=>({id:r.condition_id+'.'+r.index,sha256:r.raw_sha256}))),
        totals:{conditions:conditions.length,samples:rows.length,
            commands:conditions.reduce((n,c)=>n+c.commands,0),
            attack_calls:conditions.reduce((n,c)=>n+c.attack_calls,0),
            settled_attacks:conditions.reduce((n,c)=>n+c.settled_attacks,0)}};
}

// Validate source-reviewed ownership transitions, not just command return values.
export function summarizeGiftTransfers(raw, condition) {
    const p = condition.parameters;
    const totals = { grants:0, returns:0, retrievals:0, reclaims:0, repeats:0, rejections:0 };
    if(p.companion)Object.assign(totals,{transfers:0,other_holder_rejections:0});
    const initial = raw.scene_interactions[0].before;
    for (const [i,g] of initial.gifts.entries()) {
        assert.equal(g.exists,1,'原NPC没有准备宝物');
        assert.equal(g.owner, initial.monks[i].missing ? raw.scene_setup.object : initial.monks[i].object);
    }
    for (const [i,step] of raw.scene_interactions.entries()) {
        const plan=p.gift_commands[i], idx=fumoGifts.findIndex(g=>plan.item==='/clone/lonely/'+g.key);
        const before=step.before.gifts[idx], after=step.after.gifts[idx];
        assert.equal(step.accepted,1,'交互命令未受理');
        const expected=plan.owner==='player'?step.after.player.object:plan.owner==='other'?step.after.other.player.object:
            plan.owner==='room'?step.after.room:
            plan.owner==='absent'?null:step.after.monks[idx].object;
        assert.equal(after.exists,expected?1:0,'原物品存亡不符');
        if(expected){assert.equal(after.owner,expected,'对话与实际交付不一致');assert.equal(after.environment,expected);}
        for(let j=0;j<3;j++)if(j!==idx)assert.deepEqual(step.after.gifts[j],step.before.gifts[j],'改变了其他宝物');
        if(step.command.startsWith('ask ')){
            if(after.owner===step.after.player.object) {
                if(before.owner===after.owner)totals.repeats++;else totals.grants++;
            } else if(before.owner===step.before.room&&after.owner===step.after.monks[idx].object)totals.reclaims++;
            else {totals.rejections++;if(p.companion&&after.owner===step.after.other.player.object)totals.other_holder_rejections++;}
        } else if(step.command.startsWith('give ')) {
            if(plan.owner==='absent')totals.returns++;
            else {assert(p.companion);totals.transfers++;}
        }
        else if(step.command.startsWith('get '))totals.retrievals++;
    }
    const asks=p.gift_commands.filter(s=>s.command.startsWith('ask ')).length;
    const jing=raw.metrics[0].jing_cost??0;
    assert.ok(jing>=asks*10&&jing<=asks*19,'原询问精神支出缺失');
    return totals;
}

export function readScenes(directory){
    directory=realpathSync(directory);
    const manifest=openSeries(directory);
    const execution=manifest.identity.execution;
    assert.equal(execution.collection,'school-scene');
    const attempts=readdirSync(join(directory,'runs')).sort();
    assert(attempts.length,'缺少驱动运行证据');
    const evidence=new Map(), runs=[];
    for(const name of attempts){
        const run=join(directory,'runs',name), result=json(join(run,'result.json'));
        assert.equal(result.process.code,0,'驱动未正常结束');
        assert.equal(result.interrupted,false,'驱动被中断');
        assert.equal(result.validation_errors.length,0);
        assert.equal(result.incomplete_bytes,0);
        const output=readFileSync(join(run,'driver-output.txt'),'utf8');
        assert.equal(sha256(output),result.driver_output_sha256,'驱动输出改变');
        assert.match(output,/DATA COMPLETE/);
        const current=schoolSceneConditions(null,{smoke:execution.smoke}, path=>
            frozenSceneSource(execution,path,readFileSync(join(run,'mudlib',path),'utf8')));
        for(const c of manifest.identity.conditions)
            assert.equal(digest(c),digest(current.find(x=>x.id===c.id)),'冻结场景条件改变');
        const request=json(join(run,'request.json'));
        assert.equal(request.fingerprint,manifest.fingerprint);
        const allowed=new Set(request.jobs.map(sampleKey));
        assert.equal(allowed.size,request.jobs.length,'重复请求样本');
        const log=readFileSync(join(run,'mudlib/log/events.jsonl'),'utf8');
        assert.ok(log.endsWith('\n'),'原始记录尾行不完整');
        const rawRows=log.split('\n').filter(s=>s.trim()).map(s=>JSON.parse(s));
        assert.equal(rawRows.length,allowed.size,'原始记录与请求数量不符');
        assert.equal(result.imported,rawRows.length,'导入数量不符');
        for(const raw of rawRows){
            const id=sampleKey(raw);
            assert.ok(allowed.has(id),'原始记录不属于请求');
            assert.ok(!evidence.has(id),'重复原始记录');
            evidence.set(id,digest(raw));
        }
        runs.push({name,...result});
    }
    const rows=readSamples(directory,manifest);
    assert.equal(evidence.size,rows.length,'原始记录与台账数量不符');
    for(const row of rows){
        assert.equal(row.index,row.raw.index);
        assert.equal(row.outcome,row.raw.outcome);
        assert.equal(evidence.get(sampleKey(row)),row.raw_sha256,'原始日志与台账不符');
    }
    const report=summarizeScenes(manifest,rows);
    report.directory=directory; report.runs=runs;
    report.reader_sha256=sha256(readFileSync(fileURLToPath(import.meta.url)));
    return report;
}

export function sceneMarkdown(r){
    return ['# 少林伏魔圈场景采集','',r.smoke?'仅烟雾，不作为正式随机分布。':'既定条件正式记录，不代表普通玩家过阵胜率。','',
        '| 条件 | 样本 | 原命令步骤 | 攻击调用／结算 | 气血支出均值／中位数／P95 |',
        '| --- | ---: | ---: | ---: | --- |',
        ...r.conditions.map(c=>`| ${c.id} | ${c.samples} | ${c.commands} | ${c.attack_calls}/${c.settled_attacks} | ${c.qi_cost.mean}/${c.qi_cost.median}/${c.qi_cost.p95} |`),
        '',`证据摘要：${r.evidence_digest}`,
        '高气血入口组每条连续四步、随机组两次九击；failure组一次九击，followup另等原时钟再尝试退出。资源不重置，不进行强弱排名。',
        '低经验送出后的九次调用在不同房间直接返回，不计成九次实际结算；辈分豁免与挑战通过分开。',
        '经验变化按原闪避／招架收益或死亡惩罚单列，不当成过阵奖励；不重置样本内经验。',
        ...(r.conditions.some(c=>c.lifecycle)?[
            '低气血组的qi字段有负值下限，支出不等于九击理论伤害；昏迷清零、死亡重置与自然恢复保留原资源账。',
            '等待组只观察原醒转和退出、或鬼门关交接，不代表完整阴间返阳流程。']:[]),
        ...(r.conditions.some(c=>c.gifts)?[
            'gifts组一次原go后按配置原ask/give/drop/get；按实际物品归属与存亡验证交付，重复询问不算新增物品。',
            ...r.conditions.filter(c=>c.gifts).map(c=>`${c.id}：${JSON.stringify(c.gift_totals)}；询问精神支出均值${c.jing_cost.mean}。`)]:[]),
        'observed表示原流程已记录，不表示逻辑正确、已传授武功或已领取宝物。',''].join('\n');
}

if(process.argv[1]&&realpathSync(process.argv[1])===realpathSync(fileURLToPath(import.meta.url))){
    try{
        assert(process.argv.length===3||process.argv.length===4,
            '用法：node tools/tests/martial_data/school_scene_report.mjs 系列目录 [新仓库外报告目录]');
        const report=readScenes(process.argv[2]);
        if(process.argv[3]){const out=newOutput(process.argv[3]);
            writeFileSync(join(out,'scene.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
            writeFileSync(join(out,'scene.md'),sceneMarkdown(report),{flag:'wx'});
            console.log('场景报告：'+out);console.log(JSON.stringify(report.totals));
        }else console.log(sceneMarkdown(report));
    }catch(error){console.error('场景报告失败：'+error.message);process.exitCode=1;}
}
