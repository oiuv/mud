// Reuse exact existing teaching evidence, without a driver or new samples.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {sha256,scanSource} from './inventory.mjs';
import {openSeries,readSamples,digest} from './ledger.mjs';
import {validateRecord} from './execution.mjs';
import {validatorFor} from './collection_review.mjs';
import {teachingProcessComplete} from './teaching_crosswalk.mjs';
export async function auditLegacyPermissions43(input){
    assert.equal(input.permissions.length,33,'explicit setter inventory required');assert.equal(input.composites.length,2);
    const refs=[...input.replays,...input.explicit_non_acquisition_replays];assert.equal(refs.length,48);
    const toolDir=new URL('./',import.meta.url);
    const hashes=()=>Object.fromEntries(readdirSync(toolDir).filter(n=>n.endsWith('.mjs')).sort().map(n=>[n,sha256(readFileSync(new URL(n,toolDir)))]));
    const beforeHashes=hashes(),cache=new Map(),results=[];
    for(const dir of new Set(refs.map(r=>r.directory))){
        const manifest=openSeries(dir),selected=refs.filter(r=>r.directory===dir);assert.equal(manifest.identity.execution.smoke,false);
        const runDir=join(dir,'runs'),runs=readdirSync(runDir).flatMap(n=>{
            try{return [JSON.parse(readFileSync(join(runDir,n,'result.json'),'utf8'))];}catch(e){if(e.code==='ENOENT')return [];throw e;}});
        assert.ok(teachingProcessComplete(runs),'actual complete successful native process: '+dir);
        const rows=readSamples(dir,manifest,{conditionIds:selected.map(r=>r.condition)});cache.set(dir,{manifest,rows});
        for(const ref of selected){
            const c=manifest.identity.conditions.find(c=>c.id===ref.condition);assert.ok(c);assert.equal(digest(c),ref.condition_sha256);assert.equal(c.samples,ref.planned);
            const rr=rows.filter(r=>r.condition_id===c.id),validate=await validatorFor(c);assert.equal(rr.length,c.samples);
            assert.equal(new Set(rr.map(r=>r.index)).size,c.samples);
            for(const row of rr){assert.equal(row.outcome,row.raw.outcome);assert.ok(['observed','refused'].includes(row.outcome));validateRecord(row.raw,c);validate(row.raw,c);}
            results.push({directory:dir,condition:c.id,condition_sha256:digest(c),series_fingerprint:manifest.fingerprint,
                planned:c.samples,records:rr.length,passed:rr.length,validator:validate.name,process_complete:true});
        }
    }
    const sourceCheck=item=>{
        const s=readFileSync(item.source.path,'utf8');assert.equal(sha256(s),item.source.sha256);assert.equal(s.slice(item.source.start,item.source.end),item.source.text);
        assert.ok(scanSource(s).functions.some(f=>f.name===item.fn&&f.start<=item.source.start&&f.end>=item.source.end));return item.source;
    };
    const selectedRows=ref=>cache.get(ref.directory).rows.filter(r=>r.condition_id===ref.condition);
    const resultFor=ref=>{const r=results.find(r=>r.directory===ref.directory&&r.condition===ref.condition);assert.ok(r);return r;};
    const sources=input.permissions.map(p=>({id:p.id,source:sourceCheck(p)}));
    const permissions=input.permissions.filter(p=>p.verified_acquisition.length).map(p=>({id:p.id,teacher:p.teacher,key:p.key,fn:p.fn,source:p.source,
        refs:p.verified_acquisition.map(ref=>{
            const rr=selectedRows(ref),transitions=rr.flatMap(row=>row.raw.teaching.flatMap((s,step)=>s.teacher_program==='/'+p.teacher.replace(/\.(c|lpc)$/,'')&&s.before.grants?.[p.key]===0&&s.after.grants?.[p.key]===1?
                [{index:row.index,raw_sha256:row.raw_sha256,step,command:s.command,teacher:s.teacher_program,before:0,after:1}]:[]));
            assert.equal(new Set(transitions.map(t=>t.index)).size,rr.length,'each formal sample needs this exact teacher/key acquisition');
            return {...resultFor(ref),transitions};
        })}));
    const composites=input.composites.map(p=>({id:p.id,teacher:p.teacher,fn:p.fn,source:sourceCheck(p),child_count:p.children.length,
        children:p.children.map(child=>{assert.equal(sha256(readFileSync(child.path)),child.sha256);return {id:child.id,path:child.path,sha256:child.sha256};}),
        refs:p.verified_conditions.map(ref=>({...resultFor(ref),observations:selectedRows(ref).flatMap(row=>row.raw.teaching.map((s,step)=>{
            assert.equal(s.teacher_program,'/'+p.teacher.replace(/\.(c|lpc)$/,''));
            const levels=p.children.map(child=>{const before=s.before.skills[child.id]??0,after=s.after.skills[child.id]??0;
                assert.equal(after,Math.max(before,10),'original composite child initialization, not parent-level propagation');return {skill:child.id,before,after};});
            return {index:row.index,raw_sha256:row.raw_sha256,step,command:s.command,teacher:s.teacher_program,levels};
        }))}))}));
    assert.deepEqual(hashes(),beforeHashes,'consumer changed during reuse; rerun stable version');
    const totals={conditions:results.length,planned:results.reduce((n,r)=>n+r.planned,0),records:results.reduce((n,r)=>n+r.records,0),passed:results.reduce((n,r)=>n+r.passed,0),
        permission_setters_checked:sources.length,permission_setters_with_actual_transition:permissions.length,
        composite_paths:composites.length,composite_children:composites.reduce((n,c)=>n+c.child_count,0)};
    assert.equal(totals.records,1174);assert.equal(totals.passed,1174);assert.equal(permissions.length,19);assert.equal(totals.composite_children,31);
    return {kind:'independent_current_permission_replay',created:new Date().toISOString(),consumer_hashes:beforeHashes,consumer_hashes_stable:true,totals,sources,results,permissions,composites};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
    try{
        const [inputPath,outputPath]=process.argv.slice(2);assert.ok(inputPath&&outputPath&&process.argv.length===4,'Usage: node teaching_43_legacy_permissions.mjs SOURCE_AUDIT.json NEW_REPORT.json');
        const text=readFileSync(inputPath,'utf8'),report=await auditLegacyPermissions43(JSON.parse(text));report.input={path:resolve(inputPath),sha256:sha256(text)};
        writeFileSync(outputPath,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report.totals));
    }catch(e){console.error(e.stack);process.exitCode=1;}
}
